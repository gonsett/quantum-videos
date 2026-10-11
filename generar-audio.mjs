/**
 * Sintetiza la cama sonora del comercial: un WAV estereo generado desde cero.
 * Sin librerias de terceros y sin muestras con licencia: todo lo que suena
 * aca es original y es del cliente.
 *
 * Los tiempos NO estan escritos a mano: salen de timeline.json, el mismo
 * archivo que ordena el montaje. Si una escena cambia de duracion, los
 * golpes sonoros se recolocan solos.
 *
 * El relato son dos relojes, asi que el diseno acompana esa curva: tension
 * que sube durante la espera, golpe seco cuando cae la cifra, y una
 * resolucion limpia cuando aparece la respuesta en 3 segundos.
 */
import fs from "fs";

const SR = 48000;

// ── Tiempos derivados del montaje ────────────────────────────────────────
const timeline = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
const FPS = timeline.fps;

const inicio = {};
let acc = 0;
for (const e of timeline.escenas) {
  inicio[e.id] = acc / FPS;
  acc += e.durationInFrames;
}
const FIN_VIDEO = acc / FPS;
const DUR = FIN_VIDEO + 0.9;
const N = Math.floor(SR * DUR);

console.log("Escenas (s):", Object.entries(inicio)
  .map(([k, v]) => `${k}=${v.toFixed(2)}`).join("  "));

const L = new Float64Array(N);
const R = new Float64Array(N);

const idx = (t) => Math.floor(t * SR);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const suave = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));

const env = (t, t0, ataque, sostenido, caida) => {
  const d = t - t0;
  if (d < 0) return 0;
  if (d < ataque) return suave(d / ataque);
  if (d < ataque + sostenido) return 1;
  const c = d - ataque - sostenido;
  if (c < caida) return suave(1 - c / caida);
  return 0;
};

/** Tono con leve desafinado estereo, para que respire. */
const tono = (t0, dur, freq, amp, ataque = 0.01, caida = 0.2, detune = 0.4) => {
  const fin = idx(t0 + dur + caida);
  for (let i = Math.max(0, idx(t0)); i < Math.min(N, fin); i++) {
    const t = i / SR;
    const e = env(t, t0, ataque, dur, caida);
    if (e <= 0) continue;
    const f = 2 * Math.PI * (t - t0);
    L[i] += Math.sin(f * (freq - detune)) * amp * e;
    R[i] += Math.sin(f * (freq + detune)) * amp * e;
  }
};

// ── 1. Drone de fondo ────────────────────────────────────────────────────
// La menor: A1 + E2. Presente todo el video, muy por debajo de la voz.
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const global = suave(t / 2.5) * suave((DUR - t) / 3.5);
  const lfo = 0.82 + 0.18 * Math.sin(2 * Math.PI * 0.07 * t);
  const a = 0.055 * global * lfo;

  const base = Math.sin(2 * Math.PI * 55 * t) * a;
  const quinta = Math.sin(2 * Math.PI * 82.41 * t) * a * 0.55;
  const arm = Math.sin(2 * Math.PI * 110 * t) * a * 0.22;

  L[i] += base + quinta * 0.9 + arm;
  R[i] += base + quinta + arm * 0.85;
}

// ── 2. Llega el mensaje ──────────────────────────────────────────────────
// Cae junto con la burbuja, no con la voz: primero se ve, despues se cuenta.
{
  const t0 = inicio.gancho + 15 / FPS;
  tono(t0, 0.06, 1318.51, 0.13, 0.005, 0.14);
  tono(t0 + 0.17, 0.09, 1760.0, 0.11, 0.005, 0.22);
}

// ── 3. La espera se acumula ──────────────────────────────────────────────
// Barrido ascendente + ticks que se aceleran: la tension del cronometro.
{
  const t0 = inicio.espera;
  const t1 = inicio.golpe;
  for (let i = idx(t0); i < idx(t1); i++) {
    const t = i / SR;
    const p = (t - t0) / (t1 - t0);
    const f = 180 * Math.pow(760 / 180, p * p);
    const a = 0.032 * suave(p / 0.18) * (0.35 + 0.65 * p);
    const v = Math.sin(2 * Math.PI * f * (t - t0)) * a;
    L[i] += v;
    R[i] += v * 0.92;
  }
  // Ticks acelerando. El paso tiene piso: si no, la serie geometrica
  // converge y el bucle nunca llega al final del tramo.
  let tick = t0 + 0.35;
  let paso = 0.62;
  const PASO_MIN = 0.045;
  while (tick < t1 - 0.08) {
    tono(tick, 0.008, 2100, 0.055, 0.002, 0.05, 0);
    paso = Math.max(PASO_MIN, paso * 0.86);
    tick += paso;
  }
}

// ── 4. Cae la cifra: 32 h 13 m ───────────────────────────────────────────
// Golpe grave. Es el punto de mayor peso del video.
{
  const t0 = inicio.golpe;
  for (let i = idx(t0); i < Math.min(N, idx(t0 + 1.6)); i++) {
    const t = i / SR;
    const d = t - t0;
    const e = Math.exp(-d * 3.2);
    const f = 45 + 45 * Math.exp(-d * 6);
    const v = Math.sin(2 * Math.PI * f * d) * 0.42 * e;
    const n = (Math.random() * 2 - 1) * 0.05 * Math.exp(-d * 26);
    L[i] += v + n;
    R[i] += v + n * 0.8;
  }
}

// ── 5. La respuesta en 3 segundos ────────────────────────────────────────
// Triada mayor ascendente: el alivio despues del golpe.
{
  const t0 = inicio.automlead + 0.08;
  tono(t0, 0.1, 440.0, 0.1, 0.004, 0.3);
  tono(t0 + 0.12, 0.1, 554.37, 0.1, 0.004, 0.34);
  tono(t0 + 0.24, 0.16, 659.25, 0.115, 0.004, 0.62);
}

// ── 6. Pulso bajo la regla y las capacidades ─────────────────────────────
// Latido lento que sostiene la energia sin competir con la voz.
{
  const t0 = inicio.regla + 0.1;
  const t1 = inicio.cierre - 0.2;
  for (let t = t0; t < t1; t += 1.05) {
    tono(t, 0.02, 110, 0.05, 0.004, 0.3, 0);
    tono(t, 0.015, 220, 0.018, 0.004, 0.16, 0);
  }
}

// ── 7. Resolucion del cierre ─────────────────────────────────────────────
// Acorde que se abre y sostiene bajo el llamado a la accion.
{
  const t0 = inicio.cierre;
  const dur = FIN_VIDEO - t0 - 1.2;
  for (let i = idx(t0); i < Math.min(N, idx(t0 + dur + 1.6)); i++) {
    const t = i / SR;
    const d = t - t0;
    const e = suave(d / 1.4) * suave((dur + 1.6 - d) / 2.2);
    if (e <= 0) continue;
    const a = 0.05 * e;
    const v1 = Math.sin(2 * Math.PI * 110 * d) * a;
    const v2 = Math.sin(2 * Math.PI * 164.81 * d) * a * 0.7;
    const v3 = Math.sin(2 * Math.PI * 220 * d) * a * 0.42;
    L[i] += v1 + v2 * 0.95 + v3;
    R[i] += v1 + v2 + v3 * 0.9;
  }
  // Nota que confirma, junto al wordmark
  tono(t0 + 3.4, 0.12, 880.0, 0.075, 0.006, 0.9);
}

// ── Mezcla final ─────────────────────────────────────────────────────────
// Limitador suave: nada recorta y queda margen para la locucion.
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);

const limitar = (x) => Math.tanh(x * 1.15) * 0.85;

let pico = 0;
for (let i = 0; i < N; i++) {
  const l = limitar(L[i]);
  const r = limitar(R[i]);
  pico = Math.max(pico, Math.abs(l), Math.abs(r));
  buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(r * 32767), 44 + i * 4 + 2);
}

fs.mkdirSync("public/audio", { recursive: true });
fs.writeFileSync("public/audio/cama.wav", buf);
console.log(
  `cama.wav: ${DUR.toFixed(2)}s (video ${FIN_VIDEO.toFixed(2)}s), pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS`,
);
