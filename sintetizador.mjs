import fs from "fs";

/**
 * Sintetizador mínimo: osciladores, envolventes y filtro.
 * Todo por muestra, sin dependencias.
 */

export const SR = 48000;

export const clamp01 = (x) => Math.max(0, Math.min(1, x));
/** Rampa coseno: evita los clicks que deja una rampa lineal. */
export const suave = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));

// ── Osciladores ──────────────────────────────────────────────────────────
// Los armónicos se suman a mano y se cortan antes de Nyquist, para que
// no aparezca aliasing en las notas agudas.

export const sino = (fase) => Math.sin(2 * Math.PI * fase);

export const sierra = (fase, freq, armonicos = 12) => {
  let v = 0;
  for (let n = 1; n <= armonicos; n++) {
    if (freq * n > SR * 0.45) break;
    v += Math.sin(2 * Math.PI * fase * n) / n;
  }
  return v * 0.55;
};

export const cuadrada = (fase, freq, armonicos = 9) => {
  let v = 0;
  for (let n = 1; n <= armonicos; n += 2) {
    if (freq * n > SR * 0.45) break;
    v += Math.sin(2 * Math.PI * fase * n) / n;
  }
  return v * 0.7;
};

export const triangulo = (fase, freq, armonicos = 7) => {
  let v = 0;
  let signo = 1;
  for (let n = 1; n <= armonicos; n += 2) {
    if (freq * n > SR * 0.45) break;
    v += (signo * Math.sin(2 * Math.PI * fase * n)) / (n * n);
    signo = -signo;
  }
  return v * 0.81;
};

// ── Envolvente ───────────────────────────────────────────────────────────

/** ADSR en segundos. `d` es el tiempo transcurrido desde el ataque. */
export const adsr = (d, { a = 0.01, dec = 0.1, sus = 0.7, rel = 0.2, dur = 0.5 }) => {
  if (d < 0) return 0;
  if (d < a) return suave(d / a);
  if (d < a + dec) return 1 - (1 - sus) * suave((d - a) / dec);
  if (d < dur) return sus;
  const r = d - dur;
  if (r < rel) return sus * suave(1 - r / rel);
  return 0;
};

/** Percusivo: ataque instantáneo y caída exponencial. */
export const pluck = (d, caida) => (d < 0 ? 0 : Math.exp(-d * caida));

// ── Filtro pasabajos de un polo ──────────────────────────────────────────

export class PasaBajos {
  constructor(corte) {
    this.y = 0;
    this.setCorte(corte);
  }
  setCorte(corte) {
    const rc = 1 / (2 * Math.PI * corte);
    this.a = 1 / (1 + rc * SR);
  }
  paso(x) {
    this.y += this.a * (x - this.y);
    return this.y;
  }
}

// ── Notas ────────────────────────────────────────────────────────────────

const SEMITONOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "A2" -> 110 Hz. Acepta sostenidos: "C#4". */
export const nota = (nombre) => {
  const m = /^([A-G])(#?)(-?\d)$/.exec(nombre);
  if (!m) throw new Error(`nota inválida: ${nombre}`);
  const semi = SEMITONOS[m[1]] + (m[2] === "#" ? 1 : 0);
  const octava = parseInt(m[3], 10);
  // A4 = 440 Hz es la referencia
  return 440 * Math.pow(2, (semi - 9) / 12 + (octava - 4));
};

// ── Buffer estéreo ───────────────────────────────────────────────────────

export class Pista {
  constructor(segundos) {
    this.n = Math.floor(segundos * SR);
    this.L = new Float64Array(this.n);
    this.R = new Float64Array(this.n);
  }

  /** Suma una muestra con panorama (-1 izq, 0 centro, +1 der). */
  add(i, v, pan = 0) {
    if (i < 0 || i >= this.n) return;
    const izq = Math.cos(((pan + 1) * Math.PI) / 4);
    const der = Math.sin(((pan + 1) * Math.PI) / 4);
    this.L[i] += v * izq * 1.414;
    this.R[i] += v * der * 1.414;
  }

  idx(t) {
    return Math.floor(t * SR);
  }
}

// ── Escritura WAV ────────────────────────────────────────────────────────

export const escribirWav = (pista, ruta, ganancia = 1) => {
  const { n, L, R } = pista;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
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
  buf.writeUInt32LE(n * 4, 40);

  // Limitador suave: comprime los picos sin recortar cuadrado
  const limitar = (x) => Math.tanh(x * ganancia * 1.1) * 0.88;

  let pico = 0;
  for (let i = 0; i < n; i++) {
    const l = limitar(L[i]);
    const r = limitar(R[i]);
    pico = Math.max(pico, Math.abs(l), Math.abs(r));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 44 + i * 4 + 2);
  }

  fs.writeFileSync(ruta, buf);
  return pico;
};
