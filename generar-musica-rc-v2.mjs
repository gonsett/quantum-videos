/**
 * Pulso del Reel de Ring Closers v2. Reemplaza generar-musica-reel-rc.mjs
 * (guion descartado) — mismo motor, nueva estructura de escenas.
 *
 * Percusión seca de gimnasio, SIN melodía que compita con la voz: bombo,
 * caja, la pera de boxeo en tresillos y golpes sincronizados con los cortes.
 *
 *   Gancho        Un golpe seco en el primer cuadro y el pulso arrancando.
 *   Problema      Pulso liviano: bombo y pera baja — el estancamiento no
 *                 tiene urgencia todavía.
 *   Solución      Sube fuerte: entra la caja, una piña en cada franja, pico
 *                 en el cruce de rango.
 *   Oportunidad   Baja a casi solo bombo, lejos — la voz tiene que
 *                 entenderse, es el beat de intriga, no de acción.
 *   CTA           Vuelve el groove suave y una campana chica al final.
 *
 * 104 BPM, todo sintetizado, sin samples.
 */
import fs from "fs";
import { SR, Pista, PasaBajos, escribirWav, sino, suave } from "./sintetizador.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-rc-v2.json", "utf8"));
const FPS = tl.fps;
const seg = (c) => c / FPS;
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const palabra = (id, p, vez = 1) => {
  const e = escena(id);
  let n = 0;
  for (const c of e.clips) for (const w of c.palabras) {
    if (norm(w.palabra) === norm(p) && ++n === vez) return seg(e.from + w.cuadro);
  }
  throw new Error(`${p} no está en ${id}`);
};

const FIN = seg(tl.total);
const DUR = FIN + 1.0;

const e = (id) => seg(escena(id).from);
const ultimoClipFin = (id) => {
  const es = escena(id);
  const c = es.clips[es.clips.length - 1];
  return seg(es.from + c.enEscena + c.cuadros);
};

// Los mismos cortes que usan las escenas en src/reel-rc/escenas.tsx
const S3 = escena("s3-solucion");
const T = {
  s2: e("s2-problema"),
  s3: e("s3-solucion"),
  franjas: [1, 2, 3].map((v) => palabra("s3-solucion", "uno", v)),
  comodo: seg(S3.from + S3.clips[1].enEscena - 2),
  panelDesde: seg(S3.from + S3.clips[2].enEscena - 2),
  cruceRango: palabra("s3-solucion", "sumas"),
  s4: e("s4-oportunidad"),
  s5: e("s5-cta"),
  finVoz: ultimoClipFin("s5-cta"),
};

const pista = new Pista(DUR);
const idx = (t) => Math.max(0, Math.floor(t * SR));
const ruido = () => Math.random() * 2 - 1;
const NEGRA = 60 / 104;

const rampa = (t, puntos) => {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [t0, v0] = puntos[i];
    const [t1, v1] = puntos[i + 1];
    if (t >= t0 && t <= t1) return v0 + (v1 - v0) * suave(t1 === t0 ? 1 : (t - t0) / (t1 - t0));
  }
  return t < puntos[0][0] ? puntos[0][1] : puntos[puntos.length - 1][1];
};

// ── Sonidos ──────────────────────────────────────────────────────────────

const bombo = (t0, nivel) => {
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.34)); i++) {
    const d = i / SR - t0;
    fase += (46 + 100 * Math.exp(-d * 38)) / SR;
    const click = ruido() * 0.18 * Math.exp(-d * 560);
    pista.add(i, (sino(fase) * 0.36 + click) * Math.exp(-d * 11) * nivel, 0);
  }
};

const caja = (t0, nivel) => {
  const lp = new PasaBajos(5600);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.22)); i++) {
    const d = i / SR - t0;
    fase += (200 + 70 * Math.exp(-d * 60)) / SR;
    const tono = sino(fase) * Math.exp(-d * 36) * 0.26;
    const rr = lp.paso(ruido()) * Math.exp(-d * 26) * 0.34;
    pista.add(i, (tono + rr) * nivel, 0.06);
  }
};

/** Pera de boxeo: toque seco de cuero, en tresillos. */
const pera = (t0, nivel, pan) => {
  const lp = new PasaBajos(2600);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.08)); i++) {
    const d = i / SR - t0;
    fase += (160 + 90 * Math.exp(-d * 90)) / SR;
    const cuerpo = sino(fase) * Math.exp(-d * 64) * 0.5;
    const chasquido = lp.paso(ruido()) * Math.exp(-d * 120) * 0.6;
    pista.add(i, (cuerpo + chasquido) * nivel, pan);
  }
};

/** Piña: golpe de cuero con cuerpo grave. */
const pina = (t0, nivel) => {
  const lp = new PasaBajos(1700);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.3)); i++) {
    const d = i / SR - t0;
    fase += (60 + 110 * Math.exp(-d * 30)) / SR;
    const cuerpo = sino(fase) * Math.exp(-d * 14) * 0.5;
    const cuero = lp.paso(ruido()) * Math.exp(-d * 75) * 0.55;
    pista.add(i, (cuerpo + cuero) * nivel, 0);
  }
};

/**
 * Colchón grave continuo: un sub sostenido, muy filtrado, que no calla nunca.
 * No es melodía (una sola nota, sin movimiento tonal) — es lo que hace que
 * la pieza se sienta como una sola cosa en vez de golpes sueltos con
 * silencio en el medio.
 */
const colchon = (nivel) => {
  const lp = new PasaBajos(180);
  let fase = 0;
  const freq = 41.2; // E1
  for (let i = 0; i < pista.n; i++) {
    const t = i / SR;
    fase += freq / SR;
    const onda = sino(fase) + sino(fase * 2.01) * 0.18;
    const filtrado = lp.paso(onda);
    pista.add(i, filtrado * 0.16 * nivel(t), 0);
  }
};

/** Campana chica de ring: parciales inarmónicos, cola corta. */
const campana = (t0, nivel) => {
  const parciales = [[1, 1, 1.8], [2.76, 0.5, 3.2], [5.4, 0.28, 5.2], [8.93, 0.14, 8]];
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 1.6)); i++) {
    const d = i / SR - t0;
    let v = 0;
    for (const [r, a, caida] of parciales) v += sino(940 * r * d) * a * Math.exp(-d * caida);
    v += ruido() * 0.22 * Math.exp(-d * 200);
    pista.add(i, v * 0.12 * nivel * Math.min(1, d / 0.002), 0.1);
  }
};

// ── Intensidad ───────────────────────────────────────────────────────────
// Sube en la solución, pico en el cruce de rango, baja fuerte para la
// oportunidad (beat de intriga, no de acción) y vuelve suave para el cierre.

const intensidad = (t) =>
  rampa(t, [
    [0, 0.7], [T.s2, 0.74], [T.s3 - 0.1, 0.78], [T.comodo, 0.9], [T.cruceRango, 0.97],
    [T.s4 - 0.2, 0.9], [T.s4 + 0.3, 0.34], [T.s5 - 0.15, 0.32], [T.s5, 0.4],
    [T.finVoz, 0.32], [FIN, 0],
  ]);

// Colchón grave de fondo: siempre presente, sostiene la pieza entre golpes
colchon(intensidad);

// Golpe seco en el primer cuadro del gancho
pina(0.1, 1.0);

let k = 0;
for (let t = 0.1; t < FIN - 0.05; t += NEGRA, k++) {
  const n = intensidad(t);
  const beat = k % 4;
  const enSolucion = t >= T.s3 && t < T.s4;
  const enCierre = t >= T.s5;

  // Bombo: negras en todo; en el cierre solo el 1 y el 3
  if (!enCierre || beat === 0 || beat === 2) bombo(t, 0.8 * n);

  // Caja en 2 y 4 solo durante la solución
  if (enSolucion && (beat === 1 || beat === 3)) caja(t, 0.55 * n);

  // Pera en tresillos, apagada en la oportunidad y en el cierre
  const enOportunidad = t >= T.s4 && t < T.s5;
  if (!enCierre && !enOportunidad) {
    for (let s = 0; s < 3; s++) {
      const ts = t + (NEGRA / 3) * s;
      const acento = s === 2 ? 1 : 0.55;
      pera(ts, (enSolucion ? 0.34 : 0.3) * acento * n, s === 1 ? 0.25 : -0.15);
    }
  }
}

// Una piña en cada franja de la solución, en el "cada semana" y en el cruce de rango
T.franjas.forEach((t) => pina(t, 0.55));
pina(T.comodo, 0.42);
pina(T.cruceRango, 0.7);

// Campana chica cuando termina la voz
campana(T.finVoz + 0.12, 1.0);

const pico = escribirWav(pista, "public/audio/cama-rc-v2.wav", 1);
console.log(`cama-rc-v2.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · 104 BPM · sin melodía`);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS`);
console.log(`  solucion ${T.s3.toFixed(2)}s · oportunidad ${T.s4.toFixed(2)}s · cierre ${T.s5.toFixed(2)}s · fin voz ${T.finVoz.toFixed(2)}s`);
