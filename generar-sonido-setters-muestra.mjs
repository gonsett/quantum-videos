/**
 * Sonido de la MUESTRA de 5 s de "Señal detectada" (Ring Setters, 03/10/2026).
 * Identidad NUEVA para setters: centro de mando. La Menor, pulso electrónico grave a 120 bpm,
 * PING de sonar (seno con caída de tono y cola larga de sala) como firma, ticks de instrumento,
 * golpe con peso cuando se detecta la señal y el más grande en la marca. Sin samples: todo sintetizado.
 * Uso: node generar-sonido-setters-muestra.mjs
 */
import { crearEstudio } from "./sonidos-rc.mjs";
import { SR, PasaBajos, sierra, sino } from "./sintetizador.mjs";

const FPS = 30;
const f2s = (f) => f / FPS;
const DUR = 5.6;
const s = crearEstudio(DUR);
const { SECO, MEDIO, SALA, MUSICA, emitir, idx, ruido } = s;
const N = s.largo();

/** Ping de sonar: seno puro con un leve descenso de tono, ataque metálico y cola larga en la sala. */
const ping = (t0, niv, f = 1320, largo = 1.6, pan = 0) => {
  let fase = 0;
  for (let i = idx(t0); i < Math.min(N, idx(t0 + largo)); i++) {
    const d = i / SR - t0;
    const fr = f * (1 + 0.04 * Math.exp(-d * 30));
    fase += fr / SR;
    const v = (sino(fase) + 0.18 * sino(fase * 2.01) * Math.exp(-d * 6)) * Math.min(1, d / 0.002) * Math.exp(-d * (3.2 / largo));
    emitir(SALA, i, v * niv, pan);
  }
};
/** Dron de mando: dos sierras graves desafinadas, el filtro se abre a medida que el radar se enciende. */
const dron = (t0, t1, f, niv, abre = 900) => {
  const lp = new PasaBajos(120);
  let a = 0, b = 0, sub = 0;
  for (let i = idx(t0); i < Math.min(N, idx(t1)); i++) {
    const d = i / SR - t0;
    const q = (i / SR - t0) / (t1 - t0);
    if (i % 64 === 0) lp.setCorte(120 + abre * q * q);
    a += f / SR; b += (f * 1.007) / SR; sub += (f / 2) / SR;
    const env = Math.min(1, d / 0.4) * Math.min(1, (t1 - i / SR) / 0.08);
    emitir(MUSICA, i, (lp.paso((sierra(a, f, 10) + sierra(b, f * 1.007, 10)) * 0.5) * 0.8 + sino(sub) * 0.5) * env * niv, 0);
  }
};

// Acto: ping en el negro
ping(f2s(3), 0.55, 1320, 2.2);
s.impacto(SALA, f2s(3) - 0.01, 0.35, 300);
// el radar se enciende
dron(f2s(14), f2s(92), 55, 0.5, 1100);
s.subida(MEDIO, f2s(16), f2s(44), 0.12);
[20, 25, 30, 35].forEach((fr, k) => s.tick(SECO, f2s(fr), 0.12, -0.3 + k * 0.2)); // cada anillo que se dibuja
s.susurro(MEDIO, f2s(24), 0.08, -0.3); // arranca el barrido
// pulso a 120 bpm, anclado a la detección (cuadro 66)
const T = f2s(66);
for (let k = -3; k <= 1; k++) {
  const t = T + k * 0.5;
  if (t < f2s(36)) continue;
  s.bombo(t, k === 0 ? 0 : 0.55);
  s.hat(t + 0.25, 0.12);
  s.bajo(t, 0.22, k % 2 ? 55 : 82.41, 0.5);
}
[1, 2, 3].forEach((k) => s.hat(T + 0.5 * k - 0.25 - 0.125, 0.06));
// ecos que va tocando el barrido
[[40, 1760, 0.4], [52, 1568, -0.5], [58, 1975, 0.2]].forEach(([fr, f, pan]) => ping(f2s(fr), 0.06, f, 0.6, pan));
// SEÑAL DETECTADA
s.subida(MEDIO, T - 0.55, T - 0.05, 0.18);
s.impacto(SALA, T - 0.04, 0.78, 700);
ping(T, 0.32, 1760, 1.8, 0.35);
ping(T + 0.09, 0.12, 2637, 1.0, 0.35);
s.chisporroteo(SECO, T + 0.02, 0.14, 0.22, 14);
for (let k = 0; k < 15; k++) s.tick(SECO, f2s(72) + k * (f2s(14) / 15), 0.05, 0.4); // tipeo
// caída al silencio y entrada a la señal
s.caida(MEDIO, f2s(92), 0.14);
s.subida(MEDIO, f2s(90), f2s(103), 0.32);
// LA MARCA: el golpe más grande
const M = f2s(104);
s.impacto(SALA, M - 0.05, 1.0, 900);
s.impacto(SALA, M + 0.02, 0.45, 300);
s.bajo(M, 1.4, 55, 0.85);
dron(M, DUR - 0.1, 110, 0.32, 1600);
[220, 261.6, 329.6, 440].forEach((f, k) => s.pluck(M + 0.03 + k * 0.05, f, 0.22, 1.6, (k - 1.5) * 0.3));
ping(M + 0.02, 0.28, 880, 2.4, 0);
s.brillo(MEDIO, M + 0.15, 1.2, 0.14);
s.chisporroteo(SECO, M + 0.1, 0.2, 0.6, 26);
s.chisporroteo(SECO, M + 0.75, 0.1, 0.5, 14);
s.brillo(MEDIO, f2s(120), 0.8, 0.08); // barrido de luz en las letras

s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-setters-muestra.wav", salidaCama: "public/audio/cama-setters-muestra.wav" });
console.log("muestra setters ok");
