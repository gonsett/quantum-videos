/**
 * Sonido de "Un año en treinta segundos" (Logros-RC). Vara: élite (golpes 0,5-1,0, cierre con el golpe más grande).
 * Tema NUEVO: reloj. El tic-tac de un reloj es el pulso del año y se acelera escena a escena (el tiempo vuela);
 * en Re menor, pluck de caja de música. Cada trofeo cae con golpe de sala + "ding" que sube de tono (14 escalones);
 * la racha se queda casi sin música (latido + campanita); la ráfaga es bombo en semicorcheas; la vitrina llena
 * es una cascada de 14 dings y la placa el golpe más grande.
 * Uso: node generar-sonido-logros.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-logros-rc.json", "utf8"));
if (tl._borrador) throw new Error("timeline borrador");
const FPS = tl.fps;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const S = (id) => escena(id).from / FPS;
const L = (id, p, vez = 1) => {
  let n = 0;
  for (const c of escena(id).clips) for (const w of c.palabras) if (norm(w.palabra) === norm(p) && ++n === vez) return w.cuadro;
  throw new Error(`"${p}" no está en ${id}`);
};
const G = (id, p) => (escena(id).from + L(id, p)) / FPS;

const FIN = tl.total / FPS;
const s = crearEstudio(FIN + 1.5);
const { SECO, MEDIO, SALA } = s;
// mismos anclajes que Video.tsx: el trofeo aterriza (destello) en G - 10 + 8 cuadros
const PAL = [["e2-dia-uno", "primer"], ["e2-dia-uno", "Noqueaste"], ["e3-semana", "semana"], ["e3-semana", "diez"], ["e4-racha", "Tres"],
  ["e5-acelera", "mes"], ["e5-acelera", "compra"], ["e5-acelera", "Diez"], ["e5-acelera", "meses"], ["e5-acelera", "Cincuenta"],
  ["e6-rafaga", "Seis"], ["e6-rafaga", "semanas"], ["e6-rafaga", "Cien"], ["e6-rafaga", "año"]];
const CAE = PAL.map(([e, p]) => G(e, p) - 2 / FPS);
// fin de la palabra = arranque de la siguiente (o +0,45 s): ahí caen los dings, en la pausa y no sobre la voz
const SIG = PAL.map(([e, p]) => {
  const ws = escena(e).clips.flatMap((c) => c.palabras);
  const i = ws.findIndex((w) => norm(w.palabra) === norm(p));
  return ws[i + 1] ? (escena(e).from + ws[i + 1].cuadro) / FPS - 0.02 : G(e, p) + 0.45;
});
const [S1, S4, S5, S6, S7] = ["e1-gancho", "e4-racha", "e5-acelera", "e6-rafaga", "e7-cierre"].map(S);
const tCatorce = G("e7-cierre", "Catorce") - 4 / FPS;
const tPlaca = G("e7-cierre", "primero") + 50 / FPS;

// ── Reloj que se acelera ──
const periodo = (x) => (x < S4 ? 0.5 : x < S5 ? 0.62 : x < S6 ? 0.34 : x < S7 ? 0.17 : 0.5);
const silencios = CAE.map((t) => [t - 0.18, t + 0.45]).concat([[tCatorce - 0.25, tCatorce], [tPlaca - 0.3, tPlaca]]);
const ok = (y) => !silencios.some(([a, b]) => y >= a && y < b);
let n = 0;
for (let x = S1 + 0.6; x < tCatorce - 0.1; x += periodo(x), n++) {
  if (ok(x)) s.tick(SECO, x, n % 2 ? 0.1 : 0.14, n % 2 ? 0.3 : -0.3);
  if (x >= S6 && ok(x)) s.bombo(x, n % 2 ? 0.75 : 1.0);
  if (x >= S5 && x < S6 && n % 2 === 0 && ok(x)) s.bombo(x, 0.9);
  if (x >= S4 && x < S5 && n % 2 === 0 && ok(x)) s.latido(x, 0.85);
}
// caja de música en Re menor (fuera de la racha), bajo largo por compás
const ARP = [293.7, 349.2, 440.0, 587.3, 523.3, 440.0, 349.2, 392.0];
const RAIZ = [36.71, 29.14, 43.65, 32.7];
for (let x = S1 + 0.6, k = 0; x < tCatorce; x += 0.25, k++) {
  if (x >= S4 && x < S5) continue;
  if (k % 2 === 0 && ok(x)) s.pluck(x, ARP[(k / 2) % 8] * (x > S6 ? 2 : 1), x < S5 ? 0.3 : 0.38, 0.35, (k % 4 - 1.5) * 0.15);
  if (k % 16 === 0) s.bajo(x, 4, RAIZ[(k / 16) % 4], 0.6);
}

// ── Efectos ──
s.subida(MEDIO, S1 + 0.1, S1 + 0.9, 0.12);
s.impacto(SALA, S1 + 0.28, 0.95, 900); // arranca con el trofeo del año
s.pina(MEDIO, S1 + 0.26, 0.45);
s.brillo(MEDIO, S1 + 0.35, 1.0, 0.2);
for (let x = S1 + 0.65, j = 0; x < CAE[0] - 0.25; x += 0.045, j++) s.tick(SECO, x, 0.05, j % 2 ? 0.4 : -0.4); // rebobina 365 → 1
const DING = [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22];
CAE.forEach((t, i) => {
  const grande = i === 4 ? 0.9 : i === 13 ? 0.95 : 0.55 + i * 0.02;
  if (i === 4 || i === 13) s.subida(MEDIO, t - 0.9, t - 0.15, 0.22);
  s.impacto(SALA, t - 0.03, grande, i >= 10 ? 900 : 750);
  s.pina(MEDIO, t - 0.08, 0.2);
  const d = Math.max(SIG[i] - 0.25, t + 0.3);
  s.recompensa(SALA, d, 0.06 + i * 0.003);
  s.nota(SALA, d, 587.3 * Math.pow(2, DING[i] / 12), 0.07);
  if (i === 4 || i === 13) s.brillo(MEDIO, t + 0.1, 1.0, 0.18);
});
s.campanaRing(SALA, CAE[4] + 1.2, 0.1);
// vitrina llena: cascada, después vacío y la placa
s.impacto(SALA, tCatorce - 0.03, 0.8, 800);
for (let i = 0; i < 14; i++) s.recompensa(SALA, tCatorce + 0.1 + i * 0.067, 0.05 + i * 0.004);
s.subida(MEDIO, tPlaca - 1.0, tPlaca - 0.1, 0.28);
s.impacto(SALA, tPlaca - 0.05, 1.0, 900);
s.pina(MEDIO, tPlaca - 0.05, 0.5);
[73.42, 110.0, 146.8, 174.6, 220.0, 293.7].forEach((f, k) => s.pluck(tPlaca + 0.02 + k * 0.012, f, 0.55, 2.6, (k - 2.5) * 0.18));
s.bajo(tPlaca, 3.4, 36.71, 0.75);
s.campanaRing(SALA, tPlaca + 0.45, 0.2);
s.brillo(MEDIO, tPlaca + 0.5, 1.5, 0.24);

// teclas elegantes: el contador de días corre entre trofeos y cada texto entra tecleado (seco, suave, con paneo)
CAE.forEach((t, i) => {
  const hasta = i + 1 < CAE.length ? CAE[i + 1] - 0.2 : tCatorce - 0.3;
  for (let x = t + 0.35, j = 0; x < hasta; x += 0.11, j++) s.tick(SECO, x, 0.045, j % 2 ? 0.45 : -0.45);
  for (let j = 0; j < 6; j++) s.tick(SECO, t + 0.14 + j * 0.034 + (j % 2) * 0.008, 0.075 - j * 0.006, (j - 2.5) * 0.2);
});
[G("e4-racha", "suerte") - 0.1, tCatorce + 0.05, G("e7-cierre", "primero") - 0.15, S1 + 0.3].forEach((t) => {
  for (let j = 0; j < 8; j++) s.tick(SECO, t + j * 0.03, 0.07, (j - 3.5) * 0.15);
  s.brillo(MEDIO, t + 0.05, 0.5, 0.06);
});

s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-logros-rc.wav", salidaCama: "public/audio/cama-logros-rc.wav" });
console.log(`logros: ${(FIN + 1.5).toFixed(2)}s · caídas ${CAE.map((t) => t.toFixed(2)).join(" ")} · placa ${tPlaca.toFixed(2)}`);
