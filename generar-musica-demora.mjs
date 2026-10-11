/**
 * Banda sonora de "no te eligen por el precio".
 *
 * Mismo motor que la cama del video de reparto —bombo en negras, sidechain,
 * arpegio en semicorcheas, risers sobre cada corte— pero en RE MAYOR y con
 * otro patrón de arpegio, para que las dos piezas no suenen a la misma
 * pista con otra voz encima.
 *
 * Las rampas de nivel se calculan por POSICION en el montaje, no por id de
 * escena: asi el archivo sigue funcionando si se agrega o saca una escena.
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

const timeline = JSON.parse(fs.readFileSync("timeline-demora.json", "utf8"));
const FPS = timeline.fps;

/** Segundo en que arranca cada escena, y los cortes del montaje. */
const INICIOS = [];
const CORTES = [];
let acc = 0;
for (const e of timeline.escenas) {
  INICIOS.push(acc / FPS);
  acc += e.durationInFrames;
  CORTES.push(acc / FPS);
}
const FIN = acc / FPS;
const DUR = FIN + 1.0;

/** Inicio de la escena n (1-based), tolerante a montajes mas cortos. */
const esc = (n) => INICIOS[Math.min(n - 1, INICIOS.length - 1)];

const pista = new Pista(DUR);
const idx = (t) => Math.floor(t * SR);

// ── Groove ───────────────────────────────────────────────────────────────
const BPM = 120;
const NEGRA = 60 / BPM;
const CORCHEA = NEGRA / 2;
const SEMI = NEGRA / 4;
const POR_ACORDE = NEGRA * 4;

/** vi – IV – I – V en RE MAYOR: arranca en el relativo menor, resuelve luminoso. */
const PROGRESION = [
  { bajo: nota("B1"), notas: ["D4", "F#4", "B4"].map(nota) },
  { bajo: nota("G1"), notas: ["D4", "G4", "B4"].map(nota) },
  { bajo: nota("D2"), notas: ["D4", "F#4", "A4"].map(nota) },
  { bajo: nota("A1"), notas: ["C#4", "E4", "A4"].map(nota) },
];

const acordeEn = (t) =>
  PROGRESION[Math.floor(t / POR_ACORDE) % PROGRESION.length];

const rampa = (t, puntos) => {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [t0, v0] = puntos[i];
    const [t1, v1] = puntos[i + 1];
    if (t >= t0 && t <= t1) return v0 + (v1 - v0) * suave((t - t0) / (t1 - t0));
  }
  return t < puntos[0][0] ? puntos[0][1] : puntos[puntos.length - 1][1];
};

// ── Arreglo ──────────────────────────────────────────────────────────────
// El video tiene una forma clara: el problema (1-3), el giro (4) y la
// prueba con el cierre (5-7). El arreglo la sigue: se abre en el giro.

const nivelBombo = (t) =>
  rampa(t, [[0, 0], [1.2, 0.8], [esc(4), 0.95], [esc(7), 0.9],
            [FIN - 1.2, 0.7], [FIN - 0.3, 0], [DUR, 0]]);

const nivelPad = (t) =>
  rampa(t, [[0, 0], [0.9, 0.62], [esc(4), 0.7], [esc(7), 0.82],
            [FIN - 0.8, 0.7], [DUR, 0]]);

const nivelSub = (t) =>
  rampa(t, [[0, 0], [1.0, 0.68], [esc(3), 0.8], [esc(7), 0.75],
            [FIN - 0.7, 0.6], [DUR, 0]]);

const nivelArp = (t) =>
  rampa(t, [[0, 0], [1.4, 0.52], [esc(4), 0.78], [esc(5), 0.82],
            [esc(7), 0.7], [FIN - 1.0, 0.5], [DUR, 0]]);

const nivelHats = (t) =>
  rampa(t, [[0, 0], [1.6, 0.55], [esc(4), 0.74], [esc(7), 0.65],
            [FIN - 1.0, 0.45], [DUR, 0]]);

const nivelClap = (t) =>
  rampa(t, [[0, 0], [esc(2), 0.5], [esc(4), 0.72], [esc(7), 0.65],
            [FIN - 1.2, 0.4], [FIN - 0.3, 0], [DUR, 0]]);

// ── Sidechain ────────────────────────────────────────────────────────────
const DUCK_MS = 0.3;
const duck = (t) => {
  const n = nivelBombo(t);
  if (n <= 0.05) return 1;
  const d = t % NEGRA;
  if (d > DUCK_MS) return 1;
  return 1 - 0.68 * n * (1 - suave(d / DUCK_MS));
};

// ── Pad ──────────────────────────────────────────────────────────────────
{
  const fL = new PasaBajos(3100), fR = new PasaBajos(2900);
  for (let i = 0; i < pista.n; i++) {
    const t = i / SR;
    const nivel = nivelPad(t);
    if (nivel <= 0.001) continue;
    const ac = acordeEn(t);
    let v = 0;
    for (const f of ac.notas) {
      v += sino(f * t) * 0.4;
      v += sino(f * 1.0031 * t) * 0.32;
      v += sierra(f * t, f, 4) * 0.12;
    }
    v *= 0.048 * nivel * duck(t);
    pista.add(i, fL.paso(v), -0.36);
    pista.add(i, fR.paso(v * 0.94), 0.36);
  }
}

// ── Sub bass ─────────────────────────────────────────────────────────────
{
  const filtro = new PasaBajos(170);
  for (let t = 0; t < FIN; t += CORCHEA) {
    const nivel = nivelSub(t);
    if (nivel <= 0.02) continue;
    const ac = acordeEn(t);
    const peso = [1, 0.42, 0.78, 0.55][Math.round(t / CORCHEA) % 4];
    const dur = CORCHEA * 0.7;
    for (let i = idx(t); i < Math.min(pista.n, idx(t + dur + 0.1)); i++) {
      const d = i / SR - t;
      const e = adsr(d, { a: 0.005, dec: 0.045, sus: 0.74, rel: 0.08, dur });
      if (e <= 0) continue;
      const v = sino(ac.bajo * (i / SR)) * 0.88 + sino(ac.bajo * 2 * (i / SR)) * 0.12;
      pista.add(i, filtro.paso(v * e * 0.17 * nivel * peso * duck(i / SR)), 0);
    }
  }
}

// ── Arpegio ──────────────────────────────────────────────────────────────
{
  let k = 0;
  // Patron distinto al de reparto: mas sincopado, deja huecos en el 3 y el 11
  const patron = [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0];
  for (let t = 0; t < FIN; t += SEMI, k++) {
    const nivel = nivelArp(t);
    if (nivel <= 0.02 || !patron[k % 16]) continue;
    const ac = acordeEn(t);
    const grados = [0, 2, 1, 2, 0, 1, 2, 1];
    const f = ac.notas[grados[k % grados.length]] * (k % 32 >= 16 ? 2 : 1);
    for (let i = idx(t); i < Math.min(pista.n, idx(t + 0.4)); i++) {
      const d = i / SR - t;
      const e = pluck(d, 14);
      if (e < 0.0015) continue;
      const cru = sierra((i / SR) * f, f, 7) * 0.5 + sino(f * (i / SR)) * 0.5;
      pista.add(i, Math.tanh(cru * 1.6) * e * 0.042 * nivel, ((k % 4) - 1.5) * 0.32);
    }
  }
}

// ── Bombo en negras ──────────────────────────────────────────────────────
for (let t = 0; t < FIN; t += NEGRA) {
  const nivel = nivelBombo(t);
  if (nivel <= 0.03) continue;
  for (let i = idx(t); i < Math.min(pista.n, idx(t + 0.32)); i++) {
    const d = i / SR - t;
    const e = Math.exp(-d * 20);
    const f = 50 + 82 * Math.exp(-d * 48);
    const click = (Math.random() * 2 - 1) * 0.11 * Math.exp(-d * 430);
    pista.add(i, (sino(f * d) * 0.22 + click) * e * nivel, 0);
  }
}

// ── Clap en 2 y 4 ────────────────────────────────────────────────────────
for (let t = NEGRA; t < FIN; t += NEGRA * 2) {
  const nivel = nivelClap(t);
  if (nivel <= 0.03) continue;
  for (const off of [0, 0.009, 0.018]) {
    for (let i = idx(t + off); i < Math.min(pista.n, idx(t + off + 0.18)); i++) {
      const d = i / SR - t - off;
      pista.add(i, (Math.random() * 2 - 1) * Math.exp(-d * 38) * 0.055 * nivel, 0.14);
    }
  }
}

// ── Hats en 16avos ───────────────────────────────────────────────────────
{
  let k = 0;
  for (let t = 0; t < FIN; t += SEMI, k++) {
    const nivel = nivelHats(t);
    if (nivel <= 0.03) continue;
    const acento = k % 4 === 0 ? 1 : k % 2 === 0 ? 0.62 : 0.4;
    const abierto = k % 8 === 6;
    for (let i = idx(t); i < Math.min(pista.n, idx(t + (abierto ? 0.22 : 0.04))); i++) {
      const d = i / SR - t;
      pista.add(i, (Math.random() * 2 - 1) * Math.exp(-d * (abierto ? 30 : 240)) * 0.021 * nivel * acento, 0.42);
    }
  }
}

// ── Risers sobre cada corte ──────────────────────────────────────────────
for (const corte of CORTES.slice(0, -1)) {
  const largo = 0.85;
  const t0 = corte - largo;
  if (t0 < 0.5) continue;
  for (let i = idx(t0); i < Math.min(pista.n, idx(corte)); i++) {
    const d = i / SR - t0;
    const p = d / largo;
    const f = 220 * Math.pow(6, p * p);
    pista.add(i, sino(f * d) * 0.035 * p * p * suave(p / 0.1), 0);
    pista.add(i, (Math.random() * 2 - 1) * 0.016 * p * p * p, 0);
  }
  for (let i = idx(corte); i < Math.min(pista.n, idx(corte + 0.5)); i++) {
    const d = i / SR - corte;
    const e = Math.exp(-d * 11);
    pista.add(i, sino((44 + 48 * Math.exp(-d * 24)) * d) * 0.14 * e, 0);
  }
}

const pico = escribirWav(pista, "public/audio/cama-demora.wav", 1);
console.log(`cama-demora.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · ${BPM} BPM · RE MAYOR`);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS · ${CORTES.length - 1} risers sobre los cortes`);
