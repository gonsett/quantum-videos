/**
 * Banda sonora del comercial de Ring Closers.
 *
 * El brief pide un tema de entrenamiento de boxeo, oscuro y con peso, con una
 * forma precisa. Esa forma es la del video, así que todos los eventos salen
 * de timeline-ringclosers.json, el mismo archivo que usa la imagen:
 *
 *   Round 1-2  Tenso y contenido. Sub grave y un latido: dos golpes suaves
 *              cada compás, como el corazón antes de subir al ring.
 *   "Sin avisar"  Silencio total, en el cuadro exacto del apagón a negro.
 *   Round 3    Entra el producto con un impacto y arranca el groove. La
 *              firma es la PERA DE BOXEO: tresillos rápidos, el sonido más
 *              reconocible de un gimnasio. Cada check de la fight card es
 *              un golpe, y la subida de rango es el impacto más grande.
 *   Round 4    Casi solo pad. Espacio para la voz.
 *   Round 5    Vuelve el groove y cierra la campana del ring sobre "ring".
 *
 * Mi menor, 96 BPM. Todo sintetizado: no hay samples de terceros.
 */
import fs from "fs";
import { SR, Pista, PasaBajos, escribirWav, nota, sierra, sino, suave } from "./sintetizador.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-ringclosers.json", "utf8"));
const FPS = tl.fps;
const seg = (cuadros) => cuadros / FPS;

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
/** Segundo global en que la voz dice `palabra` dentro de la escena `id`. */
const palabra = (id, p, vez = 1) => {
  const e = escena(id);
  let n = 0;
  for (const c of e.clips) for (const w of c.palabras) {
    if (norm(w.palabra) === norm(p) && ++n === vez) return seg(e.from + w.cuadro);
  }
  throw new Error(`${p} no está en ${id}`);
};

// ── Eventos ──────────────────────────────────────────────────────────────
// Espejan exactamente los cuadros que usan las escenas en src/ring-closers.

const FIN = seg(tl.total);
const DUR = FIN + 1.2;

const T = {
  corteGancho: palabra("r1-gancho", "la", 2) - seg(14),
  r2: seg(escena("r2-comodidad").from),
  silencio: seg(escena("r2-tercera").from) + seg(
    escena("r2-tercera").clips[0].palabras.find((w) => norm(w.palabra) === "avisar").cuadro + 14,
  ),
  r3: seg(escena("r3-solucion").from),
  checks: palabra("r3-solucion", "cumplis", 1),
  // PanelRango: cuentaEn = rango - 10, 34 cuadros de 295 a 340, umbral 300
  subida: palabra("r3-solucion", "rango") - seg(10) + seg(34) * (5 / 45),
  r4: seg(escena("r4-honestidad").from),
  r5: seg(escena("r5-cierre").from),
  // La campana suena cuando TERMINA "ring", como puntuación final: encima de la
  // palabra la tapaba (sus parciales caen en la banda de la voz, 11.5 dB).
  campana: palabra("r5-cierre", "ring", 2) + 0.42,
};

const pista = new Pista(DUR);
const idx = (t) => Math.max(0, Math.floor(t * SR));
const ruido = () => Math.random() * 2 - 1;

const BPM = 96;
const NEGRA = 60 / BPM;

const rampa = (t, puntos) => {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [t0, v0] = puntos[i];
    const [t1, v1] = puntos[i + 1];
    if (t >= t0 && t <= t1) return v0 + (v1 - v0) * suave((t1 - t0) === 0 ? 1 : (t - t0) / (t1 - t0));
  }
  return t < puntos[0][0] ? puntos[0][1] : puntos[puntos.length - 1][1];
};

/** Todo calla entre el apagón y la entrada del producto. */
const hueco = (t) => {
  if (t < T.silencio - 0.04) return 1;
  if (t < T.silencio) return (T.silencio - t) / 0.04;
  if (t < T.r3) return 0;
  return 1;
};

// ── Armonía: i – VI – iv – V en mi menor, dos compases cada uno ───────────

const ACORDES = [
  { raiz: nota("E1"), voces: ["E3", "G3", "B3"].map(nota) },
  { raiz: nota("C2"), voces: ["E3", "G3", "C4"].map(nota) },
  { raiz: nota("A1"), voces: ["E3", "A3", "C4"].map(nota) },
  { raiz: nota("B1"), voces: ["D#3", "F#3", "B3"].map(nota) },
];
const COMPAS = NEGRA * 4;
const acorde = (t) => ACORDES[Math.floor(Math.max(0, t) / (COMPAS * 2)) % ACORDES.length];

// ── Niveles por sección ──────────────────────────────────────────────────

const nivelPad = (t) =>
  rampa(t, [[0, 0], [2.2, 0.12], [T.r2, 0.14], [T.silencio, 0.2],
            [T.r3, 0.26], [T.subida, 0.34], [T.r4 - 0.2, 0.34], [T.r4 + 0.6, 0.62],
            [T.r5 - 0.3, 0.55], [T.r5 + 0.4, 0.4], [FIN, 0.34], [DUR, 0]]) * hueco(t);

const cortePad = (t) => (t >= T.r4 && t < T.r5 ? 1500 : t >= T.r3 ? 1100 : 700);

const nivelSub = (t) =>
  rampa(t, [[0, 0], [2.4, 0.36], [T.r2, 0.4], [T.silencio, 0.48],
            [T.r3, 0.7], [T.r4, 0.62], [T.r4 + 0.8, 0.26], [T.r5, 0.3], [T.r5 + 0.5, 0.64],
            [FIN, 0.5], [DUR, 0]]) * hueco(t);

/** Groove activo: el round del producto y el cierre. */
const enGroove = (t) => (t >= T.r3 && t < T.r4 - 0.05) || (t >= T.r5 && t < T.campana);

// ── Pad oscuro ───────────────────────────────────────────────────────────
{
  const fL = new PasaBajos(700), fR = new PasaBajos(680);
  let corteActual = 700;
  for (let i = 0; i < pista.n; i++) {
    const t = i / SR;
    const nivel = nivelPad(t);
    if (nivel <= 0.0005) { fL.paso(0); fR.paso(0); continue; }
    const c = cortePad(t);
    if (c !== corteActual) { corteActual = c; fL.setCorte?.(c); fR.setCorte?.(c * 0.97); }
    const ac = acorde(t);
    let v = 0;
    for (const f of ac.voces) {
      v += sierra(f * t, f, 6) * 0.3;
      v += sierra(f * 1.0042 * t, f, 6) * 0.26;
      v += sino(f * 0.5 * t) * 0.22;
    }
    v *= 0.05 * nivel;
    pista.add(i, fL.paso(v), -0.4);
    pista.add(i, fR.paso(v * 0.96), 0.4);
  }
}

// ── Sub grave ────────────────────────────────────────────────────────────
{
  const filtro = new PasaBajos(110);
  let fase = 0;
  for (let i = 0; i < pista.n; i++) {
    const t = i / SR;
    const nivel = nivelSub(t);
    const f = acorde(t).raiz;
    fase += f / SR;
    if (nivel <= 0.0005) { filtro.paso(0); continue; }
    // En el groove, el sub se agacha en cada negra: bombeo contra el bombo
    let bombeo = 1;
    if (enGroove(t)) {
      const base = t >= T.r5 ? T.r5 : T.r3;
      const d = (t - base) % NEGRA;
      bombeo = d < 0.22 ? 0.35 + 0.65 * suave(d / 0.22) : 1;
    }
    const v = (sino(fase) * 0.9 + sino(fase * 2) * 0.1) * 0.2 * nivel * bombeo;
    pista.add(i, filtro.paso(v), 0);
  }
}

// ── Percusión ────────────────────────────────────────────────────────────

/** Bombo con fase integrada (el barrido de frecuencia no hace clic). */
const bombo = (t0, nivel, cuerpo = 1) => {
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.42)); i++) {
    const d = i / SR - t0;
    const f = 44 + 96 * Math.exp(-d * 34);
    fase += f / SR;
    const env = Math.exp(-d * (9 / cuerpo));
    const click = ruido() * 0.2 * Math.exp(-d * 520);
    pista.add(i, (sino(fase) * 0.34 + click) * env * nivel, 0);
  }
};

/** Caja: tono corto + ruido con cuerpo. */
const caja = (t0, nivel) => {
  const lp = new PasaBajos(5200);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.28)); i++) {
    const d = i / SR - t0;
    fase += (190 + 60 * Math.exp(-d * 60)) / SR;
    const tono = sino(fase) * Math.exp(-d * 32) * 0.3;
    const rr = lp.paso(ruido()) * Math.exp(-d * 21) * 0.36;
    pista.add(i, (tono + rr) * nivel, 0.08);
  }
};

/** Tom para los redobles. */
const tom = (t0, f0, nivel, pan) => {
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.36)); i++) {
    const d = i / SR - t0;
    fase += (f0 * (0.62 + 0.38 * Math.exp(-d * 14))) / SR;
    pista.add(i, sino(fase) * Math.exp(-d * 11) * 0.3 * nivel, pan);
  }
};

/**
 * Golpe de pera: un toque seco de cuero. Cuerpo grave muy corto más un
 * chasquido filtrado. En tresillo y con el tercero acentuado es el ritmo
 * inconfundible de la pera de boxeo.
 */
const pera = (t0, nivel, pan) => {
  const lp = new PasaBajos(2400);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.09)); i++) {
    const d = i / SR - t0;
    fase += (150 + 90 * Math.exp(-d * 90)) / SR;
    const cuerpo = sino(fase) * Math.exp(-d * 60) * 0.5;
    const chasquido = lp.paso(ruido()) * Math.exp(-d * 110) * 0.6;
    pista.add(i, (cuerpo + chasquido) * nivel, pan);
  }
};

/** Piña: el sonido de cada check de la fight card. */
const pina = (t0, nivel) => {
  const lp = new PasaBajos(1600);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.34)); i++) {
    const d = i / SR - t0;
    fase += (58 + 110 * Math.exp(-d * 28)) / SR;
    const cuerpo = sino(fase) * Math.exp(-d * 13) * 0.5;
    const cuero = lp.paso(ruido()) * Math.exp(-d * 70) * 0.55;
    pista.add(i, (cuerpo + cuero) * nivel, 0);
  }
};

/** Impacto: piña grande con cola de sub. */
const impacto = (t0, nivel, conAire = false) => {
  if (conAire) {
    // Toma de aire antes del golpe: ruido que se abre en 0.4 s
    const lp = new PasaBajos(300);
    for (let i = idx(t0 - 0.4); i < idx(t0); i++) {
      const p = (i / SR - (t0 - 0.4)) / 0.4;
      pista.add(i, lp.paso(ruido()) * p * p * 0.12 * nivel, 0);
    }
  }
  pina(t0, nivel * 1.2);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 1.6)); i++) {
    const d = i / SR - t0;
    fase += (38 + 30 * Math.exp(-d * 8)) / SR;
    pista.add(i, sino(fase) * Math.exp(-d * 2.6) * 0.3 * nivel, 0);
  }
};

/**
 * Campana del ring. Parciales inarmónicos de campana (1 : 2.76 : 5.40 :
 * 8.93), los agudos se apagan antes que el fundamental, ataque metálico.
 */
const campana = (t0, nivel, lejana = false) => {
  const f = lejana ? 620 : 880;
  const parciales = [[1, 1, 1.4], [2.76, 0.55, 2.6], [5.4, 0.32, 4.2], [8.93, 0.18, 6.5]];
  const lp = lejana ? new PasaBajos(1800) : null;
  const largo = lejana ? 3.2 : 2.6;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + largo)); i++) {
    const d = i / SR - t0;
    let v = 0;
    for (const [r, a, caida] of parciales) v += sino(f * r * d) * a * Math.exp(-d * caida);
    v += ruido() * 0.25 * Math.exp(-d * 180);
    v *= 0.16 * nivel * Math.min(1, d / 0.002);
    pista.add(i, lp ? lp.paso(v) : v, lejana ? -0.2 : 0.1);
  }
};

// ── Round 1-2: latido ────────────────────────────────────────────────────
for (let t = T.corteGancho; t < T.silencio - 0.1; t += NEGRA * 2) {
  const n = rampa(t, [[T.corteGancho, 0.32], [T.r2, 0.4], [T.silencio, 0.55]]);
  bombo(t, n, 0.8);
  bombo(t + 0.2, n * 0.62, 0.7);
}

// Campana lejana al empezar, bajo el cinturón a oscuras
campana(0.3, 0.55, true);
// Golpe sordo en el corte a la fight card
pina(T.corteGancho, 0.55);

// ── Round 3: groove ──────────────────────────────────────────────────────
impacto(T.r3, 1.0);

const groove = (desde, hasta, { conCaja, conToms, intensidad }) => {
  let k = 0;
  for (let t = desde; t < hasta - 0.02; t += NEGRA, k++) {
    const beat = k % 4;
    const n = intensidad(t);
    if (beat === 0 || beat === 2) bombo(t, 0.9 * n);
    if (beat === 1) bombo(t + NEGRA * 0.75, 0.45 * n);
    if (conCaja(t) && (beat === 1 || beat === 3)) caja(t, 0.62 * n);

    // Pera en tresillos de corchea, acento en el tercero
    for (let s = 0; s < 3; s++) {
      const ts = t + (NEGRA / 3) * s;
      if (ts >= hasta) break;
      pera(ts, (s === 2 ? 0.34 : 0.2) * n, s === 1 ? 0.25 : -0.15);
    }

    // Redoble de toms al final de cada frase de 4 compases
    if (conToms(t) && k % 16 === 15) {
      [0, 1, 2, 3].forEach((q) => tom(t + (NEGRA / 4) * q, [200, 170, 140, 110][q], 0.7 * n, 0.3 - q * 0.2));
    }
  }
};

groove(T.r3, T.r4, {
  conCaja: (t) => t >= T.checks - 0.1,
  conToms: (t) => t >= T.checks,
  intensidad: (t) => rampa(t, [[T.r3, 0.62], [T.checks, 0.8], [T.subida, 1], [T.r4, 0.9]]),
});

// Una piña por cada check de la fight card
// Bajas a proposito: caen sobre "cumplis" y a 0.95 tapaban la palabra (3 dB de separacion)
[0, 7, 14].forEach((dc) => pina(T.checks + seg(dc), 0.42));
// La subida de rango, con toma de aire
// Cae sobre "de rango": a 1.25 quedaba a 8.8 dB de la voz, en el limite
impacto(T.subida, 0.82, true);

// ── Round 5: cierre ──────────────────────────────────────────────────────
impacto(T.r5, 0.8);
groove(T.r5, T.campana, {
  conCaja: () => true,
  conToms: () => false,
  intensidad: (t) => rampa(t, [[T.r5, 0.6], [T.campana, 1]]),
});
campana(T.campana, 1.15);
bombo(T.campana, 1.0, 1.4);

const pico = escribirWav(pista, "public/audio/cama-ringclosers.wav", 1);
console.log(`cama-ringclosers.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · ${BPM} BPM · mi menor`);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS`);
for (const [k, v] of Object.entries(T)) console.log(`  ${k.padEnd(12)} ${v.toFixed(2)}s`);
