/**
 * Banda sonora del segundo comercial (agenda de service).
 * Original, generada por código, sin muestras ni modelos de terceros.
 *
 * Los tiempos salen de timeline-service.json.
 *
 * ── Por qué suena distinta a la del primer comercial ──
 * El primero es una comparación con un golpe en el medio: pedía batería,
 * sidechain y 112 BPM. Este transcurre dentro de una conversación un
 * sábado a la noche, con el taller cerrado. Si le pongo el mismo groove,
 * pisa el relato.
 *
 * Acá: 88 BPM, FA MAYOR (más cálido que Do), acordes tipo rhodes en
 * negras en vez de pad continuo, sub apenas presente, y percusión que
 * recién entra cuando la agenda empieza a llenarse. La energía se
 * construye hacia el final, no está desde el arranque.
 *
 * El acento sonoro clave cae en `cargado`: la confirmación del turno.
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
  sino,
  suave,
} from "./sintetizador.mjs";

// ── Tiempos del montaje ──────────────────────────────────────────────────
const timeline = JSON.parse(fs.readFileSync("timeline-service.json", "utf8"));
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
const BPM = 88;
const NEGRA = 60 / BPM;
const CORCHEA = NEGRA / 2;
const POR_ACORDE = NEGRA * 4;

/** I – vi – IV – V en Fa mayor: cálido, sin la brillantez de Do. */
const PROGRESION = [
  { n: "F", bajo: nota("F1"), notas: ["A3", "C4", "F4"].map(nota) },
  { n: "Dm", bajo: nota("D2"), notas: ["A3", "D4", "F4"].map(nota) },
  { n: "Bb", bajo: nota("A#1"), notas: ["A#3", "D4", "F4"].map(nota) },
  { n: "C", bajo: nota("C2"), notas: ["G3", "C4", "E4"].map(nota) },
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

// ── Arreglo: la energía se construye, no arranca puesta ──────────────────

const nivelPad = (t) =>
  rampa(t, [
    [0, 0], [1.8, 0.42], [T.asistente, 0.5], [T.cargado, 0.68],
    [T.limite, 0.45], [T.porque, 0.5], [T.cierre, 0.78],
    [FIN - 0.9, 0.68], [DUR, 0],
  ]);

/** Acordes tipo rhodes: el pulso armónico, en negras. */
const nivelTeclado = (t) =>
  rampa(t, [
    [0, 0], [T.consulta, 0.4], [T.horarios, 0.55], [T.cargado, 0.7],
    [T.limite, 0.34], [T.porque, 0.4], [T.cierre, 0.66],
    [FIN - 1.0, 0.45], [DUR, 0],
  ]);

const nivelSub = (t) =>
  rampa(t, [
    [0, 0], [T.asistente, 0], [T.asistente + 0.8, 0.45],
    [T.cargado, 0.6], [T.limite, 0.35], [T.cierre, 0.62],
    [FIN - 0.7, 0.45], [DUR, 0],
  ]);

/** Percusión: recién cuando la agenda empieza a llenarse. */
const nivelPerc = (t) =>
  rampa(t, [
    [0, 0], [T.cargado, 0], [T.cargado + 1.0, 0.5],
    [T.limite, 0.22], [T.porque, 0.3], [T.cierre, 0.6],
    [FIN - 1.3, 0.45], [FIN - 0.5, 0], [DUR, 0],
  ]);

// ── Pad cálido ───────────────────────────────────────────────────────────
{
  const filtroL = new PasaBajos(2200);
  const filtroR = new PasaBajos(2050);
  for (let i = 0; i < pista.n; i++) {
    const t = i / SR;
    const nivel = nivelPad(t);
    if (nivel <= 0.001) continue;

    const ac = acordeEn(t);
    const vib = 1 + 0.0018 * Math.sin(2 * Math.PI * 4.1 * t);
    let v = 0;
    for (let k = 0; k < ac.notas.length; k++) {
      const f = ac.notas[k] * vib;
      v += sino(f * t) * 0.5;
      v += sino(f * 1.0024 * t) * 0.38;
    }
    v *= 0.046 * nivel;

    pista.add(i, filtroL.paso(v), -0.28);
    pista.add(i, filtroR.paso(v * 0.95), 0.28);
  }
}

// ── Teclado tipo rhodes: acorde completo en cada negra ───────────────────
{
  let k = 0;
  for (let t = 0; t < FIN; t += NEGRA, k++) {
    const nivel = nivelTeclado(t);
    if (nivel <= 0.02) continue;
    const ac = acordeEn(t);
    // Alterna acorde completo y solo dos voces: da respiración
    const voces = k % 2 === 0 ? ac.notas : ac.notas.slice(0, 2);
    const peso = k % 4 === 0 ? 1 : 0.66;

    for (const f of voces) {
      for (let i = idx(t); i < Math.min(pista.n, idx(t + 1.1)); i++) {
        const d = i / SR - t;
        const e = pluck(d, 4.6);
        if (e < 0.0014) continue;
        // Timbre de rhodes: fundamental fuerte + un armónico campanoso
        const v = sino(f * (i / SR)) * 0.72 + sino(f * 2.0 * (i / SR)) * 0.16;
        pista.add(i, v * e * 0.032 * nivel * peso, ((k % 3) - 1) * 0.16);
      }
    }
  }
}

// ── Sub bass: una nota por acorde, largo ─────────────────────────────────
{
  const filtro = new PasaBajos(200);
  for (let t = 0; t < FIN; t += POR_ACORDE / 2) {
    const nivel = nivelSub(t);
    if (nivel <= 0.02) continue;
    const ac = acordeEn(t);
    const dur = POR_ACORDE / 2 * 0.8;

    for (let i = idx(t); i < Math.min(pista.n, idx(t + dur + 0.3)); i++) {
      const d = i / SR - t;
      const e = adsr(d, { a: 0.03, dec: 0.2, sus: 0.62, rel: 0.3, dur });
      if (e <= 0) continue;
      pista.add(i, filtro.paso(sino(ac.bajo * (i / SR)) * e * 0.13 * nivel), 0);
    }
  }
}

// ── Percusión suave: bombo redondo y escobilla ───────────────────────────
{
  for (let t = 0; t < FIN; t += NEGRA * 2) {
    const nivel = nivelPerc(t);
    if (nivel <= 0.03) continue;
    for (let i = idx(t); i < Math.min(pista.n, idx(t + 0.4)); i++) {
      const d = i / SR - t;
      const e = Math.exp(-d * 15);
      const f = 54 + 46 * Math.exp(-d * 32);
      pista.add(i, sino(f * d) * e * 0.11 * nivel, 0);
    }
  }
  // Escobilla en corcheas: textura, no golpe
  for (let t = CORCHEA; t < FIN; t += CORCHEA) {
    const nivel = nivelPerc(t);
    if (nivel <= 0.03) continue;
    for (let i = idx(t); i < Math.min(pista.n, idx(t + 0.07)); i++) {
      const d = i / SR - t;
      const e = Math.exp(-d * 90);
      pista.add(i, (Math.random() * 2 - 1) * e * 0.012 * nivel, 0.3);
    }
  }
}

// ── Acentos sincronizados al montaje ─────────────────────────────────────

const campana = (t0, freq, amp, caida = 3.2, pan = 0) => {
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 2.2)); i++) {
    const d = i / SR - t0;
    const e = pluck(d, caida);
    if (e < 0.0012) continue;
    const v =
      sino(freq * (i / SR)) * 0.62 +
      sino(freq * 2.01 * (i / SR)) * 0.24 +
      sino(freq * 3.01 * (i / SR)) * 0.1;
    pista.add(i, v * e * amp, pan);
  }
};

/** Llega el mensaje del cliente. */
{
  const t0 = T.consulta + 12 / FPS;
  campana(t0, nota("A5"), 0.07, 4.6, -0.16);
  campana(t0 + 0.16, nota("D6"), 0.058, 4.2, 0.16);
}

/** El asistente responde: una nota sola, discreta. */
campana(T.asistente + 16 / FPS, nota("F5"), 0.055, 4.4, 0.14);

/** El cliente elige el horario: confirmación corta. */
campana(T.horarios + 96 / FPS, nota("C6"), 0.06, 4.0, 0);

/**
 * El turno queda cargado. Es el punto alto del video:
 * acorde de Fa mayor que se abre.
 */
{
  const t0 = T.cargado + 38 / FPS;
  campana(t0, nota("F5"), 0.075, 2.4, -0.2);
  campana(t0 + 0.1, nota("A5"), 0.07, 2.4, 0);
  campana(t0 + 0.2, nota("C6"), 0.075, 2.1, 0.2);
  campana(t0 + 0.3, nota("F6"), 0.055, 1.9, 0.1);
}

/** El límite: una sola nota grave y sostenida. No es un golpe: es un freno. */
{
  const t0 = T.limite + 140 / FPS;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 1.8)); i++) {
    const d = i / SR - t0;
    const e = suave(d / 0.25) * Math.exp(-d * 1.6);
    pista.add(i, sino(nota("F2") * (i / SR)) * e * 0.09, 0);
  }
}

/** Cierre: los tres turnos entrando, y el acorde final. */
{
  const t0 = T.cierre + 48 / FPS;
  campana(t0, nota("F5"), 0.055, 3.4, -0.2);
  campana(t0 + 0.4, nota("A5"), 0.055, 3.4, 0);
  campana(t0 + 0.8, nota("C6"), 0.055, 3.4, 0.2);
  campana(T.cierre + 132 / FPS, nota("F6"), 0.06, 1.6, 0);
}

// ── Salida ───────────────────────────────────────────────────────────────
const pico = escribirWav(pista, "public/audio/cama-service.wav", 1);
console.log(
  `cama-service.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · ${BPM} BPM · FA MAYOR`,
);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS`);
console.log(
  "escenas:",
  Object.entries(T).map(([k, v]) => `${k}=${v.toFixed(1)}`).join("  "),
);
