/**
 * Banda sonora y diseño sonoro del comercial de fuga de cartera.
 *
 * Este video pide otra cosa que los tres anteriores. El tono es tajante y
 * el ritmo es de afirmaciones cortas, así que la música se corre del centro
 * y lo que manda son los EFECTOS PUNTUALES: cada objeto que se va suena,
 * cada pieza que se ancla hace clic. La cama es apenas un latido y un pad.
 *
 * Es lo que hace el video de referencia: música mínima, efectos marcados.
 *
 * Tonalidad RE MENOR, 76 BPM. Grave y lento a propósito: sostiene el tono
 * sin competir con la voz, que acá va pausada.
 *
 * Los tiempos salen de timeline-velocidad.json.
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

const timeline = JSON.parse(fs.readFileSync("timeline-velocidad.json", "utf8"));
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

const BPM = 82;
const NEGRA = 60 / BPM;
const POR_ACORDE = NEGRA * 4;

/** i - VI - III - VII en Mi menor: un tono mas alto que el anterior. */
const PROGRESION = [
  { bajo: nota("E2"), notas: ["E4", "G4", "B4"].map(nota) },
  { bajo: nota("C2"), notas: ["C4", "E4", "G4"].map(nota) },
  { bajo: nota("G2"), notas: ["D4", "G4", "B4"].map(nota) },
  { bajo: nota("D2"), notas: ["D4", "F#4", "A4"].map(nota) },
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

// ── Arreglo: apenas presente, para dejar lugar a los efectos ─────────────

const nivelPad = (t) =>
  rampa(t, [
    [0, 0], [2.0, 0.4], [T["05-pregunta"], 0.5], [T["06-dato"], 0.62],
    [T["07-tarde"], 0.5], [T["08-primero"], 0.7], [FIN - 1.0, 0.6], [DUR, 0],
  ]);

/** Latido: el pulso bajo. Es casi todo el ritmo que hay. */
const nivelLatido = (t) =>
  rampa(t, [
    [0, 0], [T["02-contesta"], 0.5], [T["04-noperdiste"], 0.6],
    [T["05-pregunta"], 0.68], [T["06-dato"], 0.85], [T["07-tarde"], 0.55],
    [T["08-primero"], 0.7], [FIN - 1.2, 0.45], [FIN - 0.4, 0], [DUR, 0],
  ]);

// ── Pad oscuro ───────────────────────────────────────────────────────────
{
  const fL = new PasaBajos(1700);
  const fR = new PasaBajos(1580);
  for (let i = 0; i < pista.n; i++) {
    const t = i / SR;
    const nivel = nivelPad(t);
    if (nivel <= 0.001) continue;
    const ac = acordeEn(t);
    const vib = 1 + 0.0016 * Math.sin(2 * Math.PI * 3.4 * t);
    let v = 0;
    for (const f0 of ac.notas) {
      const f = f0 * vib;
      v += sino(f * t) * 0.46;
      v += sino(f * 1.0026 * t) * 0.34;
    }
    v *= 0.04 * nivel;
    pista.add(i, fL.paso(v), -0.3);
    pista.add(i, fR.paso(v * 0.95), 0.3);
  }
}

// ── Latido grave: dos golpes por compás, como un pulso ───────────────────
{
  const filtro = new PasaBajos(150);
  for (let t = 0; t < FIN; t += NEGRA * 2) {
    for (const [off, peso] of [[0, 1], [0.26, 0.55]]) {
      const tt = t + off;
      const nivel = nivelLatido(tt);
      if (nivel <= 0.03) continue;
      const ac = acordeEn(tt);
      for (let i = idx(tt); i < Math.min(pista.n, idx(tt + 0.55)); i++) {
        const d = i / SR - tt;
        const e = adsr(d, { a: 0.012, dec: 0.1, sus: 0.5, rel: 0.28, dur: 0.16 });
        if (e <= 0) continue;
        pista.add(i, filtro.paso(sino(ac.bajo * (i / SR)) * e * 0.19 * nivel * peso), 0);
      }
    }
  }
}

// ── Biblioteca de efectos ────────────────────────────────────────────────

/** Barrido de aire: algo que cruza el cuadro y se va. */
const whoosh = (t0, dur, amp = 0.09, desdePan = -0.7, hastaPan = 0.7) => {
  const filtro = new PasaBajos(900);
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + dur)); i++) {
    const d = i / SR - t0;
    const p = d / dur;
    // Sube y baja: el cuerpo del whoosh
    const env = Math.sin(Math.PI * p);
    // El filtro se abre y se cierra
    filtro.setCorte(500 + 3800 * Math.sin(Math.PI * p));
    const ruido = (Math.random() * 2 - 1) * env * amp;
    pista.add(i, filtro.paso(ruido), desdePan + (hastaPan - desdePan) * p);
  }
};

/** Impacto seco: cuerpo grave con click. Para caídas y remates. */
const impacto = (t0, fuerza = 1) => {
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 1.1)); i++) {
    const d = i / SR - t0;
    const e = Math.exp(-d * 8);
    const f = 46 + 62 * Math.exp(-d * 26);
    const click = (Math.random() * 2 - 1) * 0.07 * Math.exp(-d * 300);
    pista.add(i, (sino(f * d) * 0.3 * e + click) * fuerza, 0);
  }
};

/** Chispa: tick brillante y corto. Para cada objeto que se desprende. */
const chispa = (t0, freq, amp = 0.03, pan = 0) => {
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.28)); i++) {
    const d = i / SR - t0;
    const e = pluck(d, 24);
    if (e < 0.002) continue;
    pista.add(i, (sino(freq * (i / SR)) * 0.7 + sino(freq * 2.4 * (i / SR)) * 0.3) * e * amp, pan);
  }
};

/** Enganche: el clic de una pieza que entra en su lugar y queda fija. */
const enganche = (t0, freq, amp = 0.04, pan = 0) => {
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.4)); i++) {
    const d = i / SR - t0;
    const golpe = Math.exp(-d * 90);
    const cola = pluck(d, 9) * 0.5;
    const v = (Math.random() * 2 - 1) * golpe * 0.5 + sino(freq * (i / SR)) * cola;
    pista.add(i, v * amp, pan);
  }
};

/** Tensión ascendente hacia un remate. */
const riser = (t0, dur, amp = 0.05) => {
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + dur)); i++) {
    const d = i / SR - t0;
    const p = d / dur;
    const f = 150 * Math.pow(7, p * p);
    pista.add(i, sino(f * d) * amp * (0.25 + 0.75 * p) * suave(p / 0.12), 0);
  }
};

// ── Colocación de los efectos, escena por escena ─────────────────────────

// 01 · Aparece el teléfono
chispa(T["01-escribe"] + 10 / FPS, nota("A5"), 0.05, 0);
chispa(T["01-escribe"] + 0.55, nota("D6"), 0.038, 0.2);

// 02 · Se lo lleva: el whoosh es el efecto principal del video
whoosh(T["02-contesta"] + 26 / FPS, 1.5, 0.11, 0.5, -0.85);
impacto(T["02-contesta"] + 16 / FPS, 0.55);

// 03 · La cartera se va detrás. Una chispa por grupo que se desprende.
{
  const base = T["03-compro"] + 20 / FPS;
  for (let i = 0; i < 9; i++) {
    chispa(base + i * 0.115, nota(["A5", "D6", "F5", "A4"][i % 4]), 0.026, ((i % 3) - 1) * 0.5);
  }
  whoosh(base + 0.3, 1.9, 0.085, 0.4, -0.9);
}

// 04 · El 86 aterriza
impacto(T["04-noperdiste"] + 10 / FPS, 0.75);
chispa(T["04-noperdiste"] + 40 / FPS, nota("D6"), 0.042, 0);

// 05 · Todo se dispersa
{
  const base = T["05-pregunta"] + 130 / FPS;
  whoosh(base, 2.4, 0.1, -0.2, 0.9);
  for (let i = 0; i < 7; i++) {
    chispa(base + i * 0.17, nota(["F5", "A5", "D6"][i % 3]), 0.022, ((i % 5) - 2) * 0.4);
  }
}

// 06 · El remate tajante: riser y golpe sobre "fuga de activos"
riser(T["06-dato"] + 24 / FPS, 1.55, 0.055);
impacto(T["06-dato"] + 72 / FPS, 1.15);

// 07 · La rejilla se arma: un enganche por pieza
{
  const base = T["07-tarde"] + 20 / FPS;
  const piezas = 35;
  for (let i = 0; i < piezas; i++) {
    const t = base + (i / piezas) * 4.2;
    enganche(t, nota(["D5", "F5", "A5", "D6"][i % 4]), 0.032, ((i % 7) - 3) * 0.22);
  }
  impacto(base + 4.4, 0.6);
}

// 08 · El teléfono se va pero la estructura queda
whoosh(T["08-primero"] + 10 / FPS, 1.6, 0.08, 0.3, -0.85);
chispa(T["08-primero"] + 96 / FPS, nota("D6"), 0.04, 0);
chispa(T["08-primero"] + 112 / FPS, nota("F6"), 0.036, 0.15);
// Confirmación del llamado a la acción
chispa(T["08-primero"] + 168 / FPS, nota("A5"), 0.045, -0.1);
chispa(T["08-primero"] + 176 / FPS, nota("D6"), 0.05, 0.1);

// ── Salida ───────────────────────────────────────────────────────────────
const pico = escribirWav(pista, "public/audio/cama-velocidad.wav", 1);
console.log(
  `cama-velocidad.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · ${BPM} BPM · RE MENOR`,
);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS · musica minima + efectos puntuales`);
console.log(
  "escenas:",
  Object.entries(T).map(([k, v]) => `${k}=${v.toFixed(1)}`).join("  "),
);
