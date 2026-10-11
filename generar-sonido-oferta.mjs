/**
 * Sonido de "Secreto de contratación #1" (Oferta-RC). Vara: élite (golpes 0,5-0,95, silencios de contraste,
 * cierre con el golpe más grande). Argumento: la lluvia de guantes cae con un golpe sordo por guante (más
 * fuerte cuanto más cerca de la cámara) y acelera hasta el guante gigante del 100; apagón; el grupo es un
 * repiqueteo de notificaciones; Ring Closers entra con el golpe grande tras un corte seco y la música pasa
 * de Re menor a Fa mayor; la escena negra queda en latido y bajo, con dos choques eléctricos contra el
 * láser; el portal sube con un riser y la placa cae con el golpe más grande y la campana.
 * Golpes con `corte` bajo y lo agudo corrido a las pausas. Uso: node generar-sonido-oferta.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-oferta-rc.json", "utf8"));
const FPS = tl.fps;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const S = (id) => escena(id).from / FPS;
const F = (id, cuadro) => (escena(id).from + cuadro) / FPS;
const L = (id, p, vez = 1) => {
  let n = 0;
  for (const c of escena(id).clips) for (const w of c.palabras) if (norm(w.palabra) === norm(p) && ++n === vez) return w.cuadro;
  throw new Error(`"${p}" (vez ${vez}) no está en ${id}`);
};
const T = (id, p, vez = 1) => F(id, L(id, p, vez));

const [e1, e2, e3, e4, e5] = ["e1-gancho", "e2-grupo", "e3-criterio", "e4-rango", "e5-cierre"];
const FIN = tl.total / FPS;
const s = crearEstudio(FIN + 1.5);
const { SECO, MEDIO, SALA } = s;
const [S2, S3, S4, S5] = [e2, e3, e4, e5].map(S);
const BEAT = 0.5;

// tiempos que salen de la imagen (Video.tsx / Gancho.tsx)
const GOLPE = L(e1, "Cien") - 3;
const tGolpe = F(e1, GOLPE);
const tApagon = F(e1, L(e1, "cerrar.") + 12);
const tRing = T(e3, "Ring");
const CRIT = ["Visible.", "Filtrada.", "Probada."].map((p) => T(e3, p));
const tSello = T(e3, "ring.", 2);
const tG1 = T(e4, "pediste,");
const tG2 = T(e4, "siquiera");
const tCae = T(e4, "postular.");
const tAbri = T(e5, "Abrí");
const tPlaca = F(e5, L(e5, "puerta.") + 22);

// ── Música ───────────────────────────────────────────────────────────────
const ch = (raiz, arp) => ({ raiz, arp });
const Dm = ch(73.42, [293.7, 349.2, 440.0, 587.3]);
const Bb = ch(58.27, [233.1, 293.7, 349.2, 466.2]);
const Gm = ch(49.0, [196.0, 233.1, 293.7, 392.0]);
const La = ch(55.0, [277.2, 329.6, 440.0, 554.4]);
const Fa = ch(43.65, [261.6, 349.2, 440.0, 523.3]);
const Do = ch(65.41, [261.6, 329.6, 392.0, 523.3]);
const PATRON = [0, 2, 1, 3, 2, 1, 3, 2];
const acorde = (x) => {
  const c = Math.floor(x / 2);
  if (x < S3 || (x >= S4 && x < S5)) return [Dm, Bb, Gm, La][c % 4];
  return [Fa, Do, Dm, Bb][Math.floor((x - S3) / 2) % 4];
};
const seccion = (x) => (x < S2 ? 1 : x < S3 ? 2 : x < S4 ? 3 : x < S5 ? 4 : 5);
const silencios = [
  [tGolpe - 0.2, tGolpe + 0.02], // vacío antes del guante gigante
  [tApagon, tApagon + 0.5], // apagón: se corta la música
  [S3 - 0.18, S3 + 0.02],
  [tPlaca - 0.3, tPlaca],
];
const enSilencio = (x) => silencios.some(([a, b]) => x >= a && x < b);

for (let b = 0; b * BEAT < FIN; b++) {
  const x = b * BEAT;
  if (x >= tPlaca - 0.05) continue;
  const sec = seccion(x);
  const compas = b % 4;
  const ac = acorde(x);
  const pan = b % 2 ? 0.25 : -0.25;
  const ok = (y) => !enSilencio(y);
  if (sec === 1) {
    // la lluvia: latido que acelera (doble en la segunda mitad) y bajo largo
    if (ok(x)) s.latido(x, x > tGolpe - 1.5 ? 0.85 : 0.7);
    if (x > tGolpe - 1.5 && ok(x + 0.25)) s.latido(x + 0.25, 0.6);
    if (compas === 0 && ok(x)) s.bajo(x, 1.9, ac.raiz, 0.55);
  } else if (sec === 2 || sec === 4) {
    // tensión: latido, bajo, reloj; en la escena negra sin notas agudas
    if (b % 2 === 0 && ok(x)) s.latido(x, sec === 4 ? 0.95 : 0.8);
    if (compas === 0 && ok(x)) s.bajo(x, 1.9, ac.raiz, sec === 4 ? 0.7 : 0.6);
    if (sec === 2 && ok(x + 0.25)) s.tick(SECO, x + 0.25, 0.1, pan);
    if (sec === 2 && ok(x)) s.pluck(x, ac.arp[PATRON[(b * 2) % 8]], 0.45, 0.22, pan);
  } else {
    // resolución (3) y subida al portal (5): groove pleno en Fa mayor
    const pico = sec === 5 && x >= tAbri - 1;
    if (ok(x)) s.bombo(x, pico ? 1.05 : 1.0);
    if ((compas === 1 || compas === 3) && ok(x)) s.palma(x, 0.55);
    if (ok(x + 0.25)) s.hat(x + 0.25, 0.4);
    if (ok(x + 0.25)) s.bajo(x + 0.25, 0.22, ac.raiz, 0.75);
    for (let k = 0; k < 2; k++) {
      const y = x + k * 0.25;
      if (!ok(y)) continue;
      s.pluck(y, ac.arp[PATRON[(b * 2 + k) % 8]], 0.52, 0.2, pan);
    }
    if (pico) {
      if (ok(x + 0.125)) s.hat(x + 0.125, 0.18);
      if (ok(x + 0.375)) s.hat(x + 0.375, 0.18);
    }
  }
}

// ── Efectos ──────────────────────────────────────────────────────────────
// 1 · cada guante que aterriza: golpe sordo (más fuerte si está cerca de la cámara)
const r = (i, k) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
for (let i = 0; i < 38; i++) {
  const z = r(i, 1) * (i % 6 === 0 ? 1 : 0.8);
  const t = (4 + Math.sqrt((i + r(i, 3) * 0.8) / 38) * (GOLPE - 8)) / FPS;
  s.pina(MEDIO, t, 0.08 + z * 0.22);
  if (z > 0.6) s.impacto(SECO, t, 0.2 + z * 0.2, 700);
}
s.subida(MEDIO, tGolpe - 1.6, tGolpe - 0.2, 0.22);
s.impacto(SALA, tGolpe - 0.02, 0.95, 800); // el guante gigante del 100
s.pina(MEDIO, tGolpe - 0.02, 0.45);
s.brillo(MEDIO, tGolpe + 0.1, 1.0, 0.16);
s.perdida(SALA, tApagon, 0.5); // apagón

// 2 · el grupo: notificaciones que entierran la oferta; golpe sordo cuando queda enterrada
const grupo = L(e2, "grupo:");
const enterrada = L(e2, "enterrada,");
for (let i = 0; i < 16; i++) {
  const g = grupo + 2 + Math.pow(i / 16, 0.8) * (enterrada - grupo + 4);
  s.tick(SECO, F(e2, g), 0.13, i % 2 ? 0.35 : -0.35);
}
s.impacto(SALA, F(e2, enterrada + 4), 0.6, 800);
s.caida(MEDIO, F(e2, enterrada + 4), 0.25);
s.impacto(SALA, S2 - 0.04, 0.5, 900);

// 3 · corte seco y golpe grande de Ring Closers; un golpe con cada criterio y la medalla que sella
s.impacto(SALA, tRing - 0.06, 0.9, 900);
s.pina(MEDIO, tRing - 0.05, 0.4);
s.campanaRing(SALA, S3 - 0.02, 0.14);
CRIT.forEach((t, i) => {
  s.impacto(SALA, t - 0.05, 0.5 + i * 0.08, 700);
  s.recompensa(SALA, t + 0.5, 0.11);
});
s.impacto(SALA, T(e3, "Cada") - 0.3, 0.55, 800); // entra la medalla
s.impacto(SALA, tSello - 0.05, 0.8, 800); // la medalla sella "ring"
s.brillo(MEDIO, tSello + 0.35, 1.1, 0.2);

// 4 · escena negra: dos choques contra el láser y la caída
s.impacto(SALA, S4 - 0.04, 0.6, 700);
[tG1, tG2].forEach((t, i) => {
  s.impacto(SALA, t - 0.03, [0.75, 0.9][i], 800);
  s.pina(MEDIO, t - 0.03, [0.35, 0.42][i]);
  s.brillo(MEDIO, t + 0.05, 0.4, 0.14);
});
s.perdida(SALA, tCae + 0.3, 0.55);
s.caida(MEDIO, tCae + 0.3, 0.3);

// 5 · el portal: subida hasta la placa, golpe más grande del video y campana
s.impacto(SALA, S5 - 0.04, 0.55, 900);
s.subida(MEDIO, tAbri - 0.3, tPlaca - 0.3, 0.3);
s.impacto(SALA, tPlaca - 0.08, 1.0, 900);
s.pina(MEDIO, tPlaca - 0.08, 0.5);
[87.31, 130.8, 174.6, 220.0, 261.6, 349.2].forEach((f, k) => s.pluck(tPlaca + 0.02 + k * 0.012, f, 0.55, 2.6, (k - 2.5) * 0.18));
s.bajo(tPlaca, 3.4, 43.65, 0.75);
s.campanaRing(SALA, tPlaca + 0.45, 0.2);
s.brillo(MEDIO, tPlaca + 0.5, 1.5, 0.24);
s.recompensa(SALA, tPlaca + 0.9, 0.15);

s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-oferta-rc.wav", salidaCama: "public/audio/cama-oferta-rc.wav" });
console.log(`oferta: ${(FIN + 1.5).toFixed(2)}s · golpe ${tGolpe.toFixed(2)} · Ring ${tRing.toFixed(2)} · placa ${tPlaca.toFixed(2)}`);
