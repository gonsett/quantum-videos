/**
 * Banda sonora del comercial: pista comercial moderna, generada por código.
 * Sin muestras ni modelos de terceros: el resultado es del cliente sin
 * licencia de nadie.
 *
 * Los tiempos salen de timeline.json, la misma fuente que ordena el video.
 *
 * ── Qué la hace "moderna" y no "cinematográfica" ──
 * 1. Tempo alto (112 BPM) y bombo en negras: pulso constante, no rubato.
 * 2. SIDECHAIN: el pad y el bajo se agachan en cada bombo y se recuperan.
 *    Ese bombeo es LA firma sonora de la música publicitaria actual; sin
 *    eso suena a librería de stock de 2010.
 * 3. Sub bass con envolvente corta, no un bajo de cuerdas sostenido.
 * 4. Plucks saturados en semicorcheas + hats en 16avos: movimiento arriba.
 * 5. Acordes con novena agregada (add9/sus2), que es el color pop actual,
 *    en vez de tríadas secas.
 * 6. Nada de drones graves ni barridos de ruido: eso era lo que volvía
 *    tétrica la primera versión.
 */
import fs from "fs";
import {
  SR,
  Pista,
  PasaBajos,
  adsr,
  escribirWav,
  nota,
  pluck,
  sierra,
  sino,
  suave,
} from "./sintetizador.mjs";

// ── Tiempos del montaje ──────────────────────────────────────────────────
const timeline = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
const FPS = timeline.fps;

const T = {};
let acc = 0;
for (const e of timeline.escenas) {
  T[e.id] = acc / FPS;
  acc += e.durationInFrames;
}
const FIN = acc / FPS;
const DUR = FIN + 1.2;

const pista = new Pista(DUR);
const idx = (t) => Math.floor(t * SR);

// ── Groove ───────────────────────────────────────────────────────────────
const BPM = 112;
const NEGRA = 60 / BPM; // 0.5357 s
const CORCHEA = NEGRA / 2;
const SEMI = NEGRA / 4;
const POR_ACORDE = NEGRA * 4; // un compás por acorde: rota más rápido

/** vi–IV–I–V con novenas: el color pop actual. */
const PROGRESION = [
  { n: "Am9", bajo: nota("A1"), notas: ["E4", "A4", "B4"].map(nota) },
  { n: "Fadd9", bajo: nota("F1"), notas: ["F4", "A4", "C5"].map(nota) },
  { n: "Cadd9", bajo: nota("C2"), notas: ["E4", "G4", "D5"].map(nota) },
  { n: "Gsus2", bajo: nota("G1"), notas: ["D4", "G4", "A4"].map(nota) },
];

const acordeEn = (t) =>
  PROGRESION[Math.floor(t / POR_ACORDE) % PROGRESION.length];

const rampa = (t, puntos) => {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [t0, v0] = puntos[i];
    const [t1, v1] = puntos[i + 1];
    if (t >= t0 && t <= t1) {
      return v0 + (v1 - v0) * suave((t - t0) / (t1 - t0));
    }
  }
  return t < puntos[0][0] ? puntos[0][1] : puntos[puntos.length - 1][1];
};

// ── Arreglo ──────────────────────────────────────────────────────────────

/** El bombo define el groove. Entra pronto y sale en el golpe. */
const nivelBombo = (t) =>
  rampa(t, [
    [0, 0], [T.pregunta, 0], [T.pregunta + 0.4, 0.75],
    [T.golpe - 0.3, 0.9], [T.golpe, 0], [T.automlead - 0.2, 0],
    [T.automlead + 0.4, 0.85], [T.cierre, 0.9],
    [FIN - 1.4, 0.7], [FIN - 0.4, 0], [DUR, 0],
  ]);

const nivelPad = (t) =>
  rampa(t, [
    [0, 0], [1.4, 0.6], [T.espera, 0.62], [T.golpe, 0.5],
    [T.automlead, 0.8], [T.regla, 0.66], [T.cierre, 0.9],
    [FIN - 0.7, 0.8], [DUR, 0],
  ]);

const nivelSub = (t) =>
  rampa(t, [
    [0, 0], [T.pregunta, 0], [T.pregunta + 0.5, 0.6],
    [T.golpe, 0.7], [T.golpe + 0.2, 0.25], [T.automlead, 0.75],
    [T.regla, 0.85], [T.cierre, 0.8], [FIN - 0.6, 0.6], [DUR, 0],
  ]);

/** Plucks: el brillo rítmico. Se abren en la resolución. */
const nivelPluck = (t) =>
  rampa(t, [
    [0, 0], [1.6, 0.3], [T.espera, 0.34], [T.golpe, 0.12],
    [T.automlead + 0.3, 0.8], [T.regla, 0.7], [T.capacidades, 0.72],
    [T.cierre, 0.62], [FIN - 1.0, 0.4], [DUR, 0],
  ]);

const nivelHats = (t) =>
  rampa(t, [
    [0, 0], [T.pregunta, 0], [T.pregunta + 0.6, 0.5],
    [T.golpe - 0.3, 0.7], [T.golpe, 0], [T.automlead + 0.4, 0.65],
    [T.cierre, 0.6], [FIN - 1.2, 0.4], [DUR, 0],
  ]);

const nivelClap = (t) =>
  rampa(t, [
    [0, 0], [T.automlead + 0.4, 0], [T.regla, 0.6],
    [T.capacidades, 0.65], [T.cierre - 0.3, 0.65], [T.cierre, 0.4],
    [FIN - 1.4, 0.35], [FIN - 0.4, 0], [DUR, 0],
  ]);

// ── Sidechain: el bombeo que define el sonido moderno ────────────────────
// El pad y el sub se agachan justo cuando pega el bombo y se recuperan.
const SIDECHAIN_MS = 0.29;
const duck = (t) => {
  const nivel = nivelBombo(t);
  if (nivel <= 0.05) return 1;
  const d = t % NEGRA; // el bombo va en negras
  if (d > SIDECHAIN_MS) return 1;
  const prof = 0.62 * nivel; // cuánto se agacha
  return 1 - prof * (1 - suave(d / SIDECHAIN_MS));
};

// ── Pad ancho, con sidechain ─────────────────────────────────────────────
{
  const filtroL = new PasaBajos(3000);
  const filtroR = new PasaBajos(2800);
  for (let i = 0; i < pista.n; i++) {
    const t = i / SR;
    const nivel = nivelPad(t);
    if (nivel <= 0.001) continue;

    const ac = acordeEn(t);
    let v = 0;
    for (let k = 0; k < ac.notas.length; k++) {
      const f = ac.notas[k];
      v += sino(f * t) * 0.42;
      v += sino(f * 1.0028 * t) * 0.34;
      v += sierra(f * t, f, 4) * 0.13;
    }
    v *= 0.05 * nivel * duck(t);

    pista.add(i, filtroL.paso(v), -0.34);
    pista.add(i, filtroR.paso(v * 0.94), 0.34);
  }
}

// ── Sub bass: corto y redondo, en corcheas ───────────────────────────────
{
  const filtro = new PasaBajos(180);
  for (let t = 0; t < FIN; t += CORCHEA) {
    const nivel = nivelSub(t);
    if (nivel <= 0.02) continue;
    const ac = acordeEn(t);
    const k = Math.round(t / CORCHEA) % 4;
    // Patrón sincopado: no todas las corcheas suenan igual
    const peso = [1, 0.5, 0.78, 0.55][k];
    const dur = CORCHEA * 0.72;

    for (let i = idx(t); i < Math.min(pista.n, idx(t + dur + 0.1)); i++) {
      const d = i / SR - t;
      const e = adsr(d, { a: 0.006, dec: 0.05, sus: 0.72, rel: 0.09, dur });
      if (e <= 0) continue;
      const v = sino(ac.bajo * (i / SR)) * 0.86 + sino(ac.bajo * 2 * (i / SR)) * 0.14;
      pista.add(i, filtro.paso(v * e * 0.16 * nivel * peso * duck(i / SR)), 0);
    }
  }
}

// ── Plucks saturados en semicorcheas ─────────────────────────────────────
{
  let k = 0;
  for (let t = 0; t < FIN; t += SEMI, k++) {
    const nivel = nivelPluck(t);
    if (nivel <= 0.02) continue;
    // Patrón de 16 pasos: deja huecos, no toca todas
    const patron = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1];
    if (!patron[k % 16]) continue;

    const ac = acordeEn(t);
    const grados = [0, 2, 1, 2, 0, 1, 2, 1];
    const f = ac.notas[grados[k % grados.length]] * (k % 32 >= 16 ? 2 : 1);
    const pan = ((k % 4) - 1.5) * 0.3;

    for (let i = idx(t); i < Math.min(pista.n, idx(t + 0.42)); i++) {
      const d = i / SR - t;
      const e = pluck(d, 13);
      if (e < 0.0015) continue;
      // Saturación suave: le da filo sin distorsionar
      const cru = sierra((i / SR) * f, f, 7) * 0.55 + sino(f * (i / SR)) * 0.45;
      pista.add(i, Math.tanh(cru * 1.5) * e * 0.036 * nivel, pan);
    }
  }
}

// ── Bombo en negras ──────────────────────────────────────────────────────
{
  for (let t = 0; t < FIN; t += NEGRA) {
    const nivel = nivelBombo(t);
    if (nivel <= 0.03) continue;
    for (let i = idx(t); i < Math.min(pista.n, idx(t + 0.34)); i++) {
      const d = i / SR - t;
      const e = Math.exp(-d * 19);
      // Barrido de tono corto: el "click" que hace que pegue
      const f = 48 + 78 * Math.exp(-d * 46);
      const cuerpo = sino(f * d) * e;
      const click = (Math.random() * 2 - 1) * 0.1 * Math.exp(-d * 420);
      pista.add(i, (cuerpo * 0.2 + click) * nivel, 0);
    }
  }
}

// ── Clap en 2 y 4 ────────────────────────────────────────────────────────
{
  for (let t = NEGRA; t < FIN; t += NEGRA * 2) {
    const nivel = nivelClap(t);
    if (nivel <= 0.03) continue;
    // Tres golpecitos muy juntos: así suena un clap real, no un ruido solo
    for (const off of [0, 0.011, 0.021]) {
      for (let i = idx(t + off); i < Math.min(pista.n, idx(t + off + 0.16)); i++) {
        const d = i / SR - t - off;
        const e = Math.exp(-d * 42);
        pista.add(i, (Math.random() * 2 - 1) * e * 0.05 * nivel, 0.12);
      }
    }
  }
}

// ── Hats en 16avos ───────────────────────────────────────────────────────
{
  let k = 0;
  for (let t = 0; t < FIN; t += SEMI, k++) {
    const nivel = nivelHats(t);
    if (nivel <= 0.03) continue;
    const acento = k % 4 === 0 ? 1 : k % 2 === 0 ? 0.6 : 0.38;
    const abierto = k % 8 === 6; // uno abierto cada dos tiempos
    const caida = abierto ? 34 : 230;
    for (let i = idx(t); i < Math.min(pista.n, idx(t + (abierto ? 0.2 : 0.04))); i++) {
      const d = i / SR - t;
      const e = Math.exp(-d * caida);
      pista.add(i, (Math.random() * 2 - 1) * e * 0.019 * nivel * acento, 0.4);
    }
  }
}

// ── Acentos sincronizados al montaje ─────────────────────────────────────

/** Redoble de caja que crece: la transición estándar del género. */
{
  const t0 = T.espera + 1.2;
  const t1 = T.golpe;
  let t = t0;
  let paso = SEMI * 2;
  while (t < t1 - 0.02) {
    const p = (t - t0) / (t1 - t0);
    for (let i = idx(t); i < Math.min(pista.n, idx(t + 0.1)); i++) {
      const d = i / SR - t;
      const e = Math.exp(-d * 55);
      pista.add(i, (Math.random() * 2 - 1) * e * 0.045 * (0.3 + 0.7 * p), 0);
    }
    // Se acelera de corcheas a fusas
    paso = Math.max(SEMI / 2, paso * 0.87);
    t += paso;
  }
}

/** El golpe: sub drop + impacto. Corto y seco, sin retumbe largo. */
{
  const t0 = T.golpe;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 1.0)); i++) {
    const d = i / SR - t0;
    const e = Math.exp(-d * 6.5);
    const f = 42 + 66 * Math.exp(-d * 22);
    const ruido = (Math.random() * 2 - 1) * 0.06 * Math.exp(-d * 30);
    pista.add(i, sino(f * d) * 0.26 * e + ruido, 0);
  }
}

/** La respuesta en 3 s: acorde brillante que se abre. */
{
  const t0 = T.automlead + 0.04;
  for (const [off, n, amp] of [
    [0, "C5", 0.07],
    [0.075, "E5", 0.065],
    [0.15, "G5", 0.07],
    [0.225, "C6", 0.055],
  ]) {
    const f = nota(n);
    for (let i = idx(t0 + off); i < Math.min(pista.n, idx(t0 + off + 1.6)); i++) {
      const d = i / SR - t0 - off;
      const e = pluck(d, 3.4);
      if (e < 0.0012) continue;
      const v = sino(f * (i / SR)) * 0.66 + sino(f * 2.01 * (i / SR)) * 0.24;
      pista.add(i, v * e * amp, 0);
    }
  }
}

// ── Salida ───────────────────────────────────────────────────────────────
const pico = escribirWav(pista, "public/audio/cama.wav", 1);
console.log(
  `cama.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · ${BPM} BPM · vi-IV-I-V con novenas`,
);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS · sidechain activo, sub + plucks + hats`);
