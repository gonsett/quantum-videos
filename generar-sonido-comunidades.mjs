/**
 * Sonido de "Ya empezó sin vos" (Comunidades-RC). Vara: élite (golpes 0,5-1,0, silencios de contraste,
 * cierre con el golpe más grande). Tema NUEVO: himno de arena en Mi menor, más rápido que Oferta (136 bpm).
 * Argumento: cada estandarte cae con un golpe de sala y la tribuna crece; la frase "ya están adentro" abre el
 * groove; el ring (e2) tiene piña en "pelean" y "ding" por estrella; el progreso (e3) sube con la curva y
 * estalla al subir de rango; la pared de ofertas (e4) es un repiqueteo que frena en el marco de oro;
 * el ranking (e5) se queda sin música, solo latido y ticks de filas, y un vacío en "todavía";
 * el puño (e6) sube con un riser y la placa cae con el golpe más grande y la campana.
 * Uso: node generar-sonido-comunidades.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-comunidades-rc.json", "utf8"));
if (tl._borrador) throw new Error("timeline borrador: correr montaje con la voz");
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

const [e1, e2, e3, e4, e5, e6] = ["e1-gancho", "e2-entrenan", "e3-mejoran", "e4-ofertas", "e5-ranking", "e6-cierre"];
const FIN = tl.total / FPS;
const s = crearEstudio(FIN + 1.5);
const { SECO, MEDIO, SALA } = s;
const [S2, S3, S4, S5, S6] = [e2, e3, e4, e5, e6].map(S);
const BEAT = 60 / 136;

// tiempos que salen de la imagen (Video.tsx / Gancho.tsx)
const BANDERAS = [F(e1, L(e1, "Elite") + 5), F(e1, L(e1, "Five") + 4), F(e1, L(e1, "Ese") + 4)];
const tAdentro = T(e1, "ellos");
const tPelean = F(e2, L(e2, "pelean") - 2);
const tNota = F(e2, L(e2, "nota."));
const tSolo = T(e3, "solo.");
const tRango = F(e3, L(e3, "números.") + 8);
const tDirectores = T(e4, "directores");
const tMarco = T(e4, "rango.");
const tTodavia = T(e5, "todavía");
const tChoque = F(e6, L(e6, "ring.") + 2);
const tPlaca = F(e6, L(e6, "ring.") + 8);

// ── Música: himno de arena en Mi menor ──────────────────────────────────
const ch = (raiz, arp) => ({ raiz, arp });
const Em = ch(41.2, [329.6, 392.0, 493.9, 659.3]);
const C = ch(65.41, [261.6, 329.6, 392.0, 523.3]);
const G = ch(49.0, [293.7, 392.0, 493.9, 587.3]);
const D = ch(73.42, [293.7, 370.0, 440.0, 587.3]);
const PATRON = [0, 1, 2, 3, 2, 1, 3, 1];
const acorde = (x) => [Em, C, G, D][Math.floor(x / (BEAT * 4)) % 4];
const silencios = [
  ...BANDERAS.map((t) => [t - 0.16, t + 0.02]),
  [tPelean - 0.2, tPelean],
  [tRango - 0.25, tRango],
  [tMarco - 0.25, tMarco],
  [tChoque - 0.3, tChoque],
];
const enSilencio = (x) => silencios.some(([a, b]) => x >= a && x < b);
const ok = (y) => !enSilencio(y);

for (let b = 0; b * BEAT < FIN; b++) {
  const x = b * BEAT;
  if (x >= tChoque - 0.05) continue;
  const compas = b % 4;
  const ac = acorde(x);
  const pan = b % 2 ? 0.25 : -0.25;
  if (x < tAdentro - 0.3) {
    // estandartes: tribuna que respira, latido y bajo largo
    if (b % 2 === 0 && ok(x)) s.latido(x, 0.75);
    if (compas === 0 && ok(x)) s.bajo(x, BEAT * 4, ac.raiz, 0.55);
  } else if (x >= S5 && x < S6) {
    // ranking: sin música; latido que se acelera hacia "todavía" y se corta
    if (x < tTodavia - 0.1 && ok(x)) s.latido(x, 0.9);
    if (x > tTodavia - 1.4 && x < tTodavia - 0.1 && ok(x + BEAT / 2)) s.latido(x + BEAT / 2, 0.7);
  } else if (x >= S6) {
    // el puño: bombo en semicorcheas hacia el choque
    if (ok(x)) s.bombo(x, 1.05);
    if (ok(x + BEAT / 2)) s.bombo(x + BEAT / 2, 0.8);
  } else {
    // groove pleno; en e4 más denso (hat en semicorcheas)
    const denso = x >= S4;
    if (ok(x)) s.bombo(x, 1.0);
    if ((compas === 1 || compas === 3) && ok(x)) s.palma(x, 0.55);
    if (ok(x + BEAT / 2)) s.hat(x + BEAT / 2, 0.4);
    if (denso && ok(x + BEAT / 4)) s.hat(x + BEAT / 4, 0.07);
    if (denso && ok(x + (3 * BEAT) / 4)) s.hat(x + (3 * BEAT) / 4, 0.07);
    if (ok(x + BEAT / 2)) s.bajo(x + BEAT / 2, 0.2, ac.raiz, 0.75);
    for (let k = 0; k < 2; k++) {
      const y = x + (k * BEAT) / 2;
      if (ok(y)) s.pluck(y, ac.arp[PATRON[(b * 2 + k) % 8]], denso ? 0.36 : 0.5, 0.2, pan);
    }
  }
}

// ── Efectos ──────────────────────────────────────────────────────────────
// 1 · tres estandartes: golpe de sala cada uno (el tercero el más grande) + el que abre el groove
BANDERAS.forEach((t, i) => {
  s.subida(MEDIO, t - 0.45, t - 0.12, 0.1);
  s.impacto(SALA, t - 0.03, [0.8, 0.75, 0.92][i], 800);
  s.pina(MEDIO, t - 0.03, 0.35);
  s.brillo(MEDIO, t + 0.08, 0.6, 0.1);
});
s.subida(MEDIO, tAdentro - 1.2, tAdentro - 0.25, 0.2);
s.impacto(SALA, tAdentro - 0.25, 0.6, 800);

// 2 · el ring: campana, piña en "pelean", estrellas que suman
s.campanaRing(SALA, S2 - 0.02, 0.14);
s.impacto(SALA, tPelean - 0.02, 0.85, 800);
s.pina(MEDIO, tPelean - 0.06, 0.3);
for (let k = 0; k < 5; k++) s.recompensa(SALA, tNota + 0.4 + k * 0.13, 0.06 + k * 0.012);
s.impacto(SALA, tNota + 0.55, 0.5, 700);

// 3 · progreso: medallas y el salto de rango
s.impacto(SALA, S3 - 0.04, 0.55, 800);
s.impacto(SALA, tSolo - 0.03, 0.6, 800);
s.recompensa(SALA, tSolo + 0.35, 0.12);
s.subida(MEDIO, tRango - 1.1, tRango - 0.25, 0.22);
s.impacto(SALA, tRango - 0.03, 0.9, 800);
s.brillo(MEDIO, tRango + 0.1, 1.0, 0.18);

// 4 · pared de ofertas: repiqueteo; frena en el marco de oro
s.impacto(SALA, S4 - 0.04, 0.55, 800);
for (let i = 0; i < 14; i++) s.tick(SECO, tDirectores + i * ((tMarco - tDirectores - 0.4) / 14), 0.11, i % 2 ? 0.35 : -0.35);
s.impacto(SALA, tMarco - 0.06, 0.9, 600);
s.pina(MEDIO, tMarco - 0.08, 0.3);
s.brillo(MEDIO, tMarco + 0.45, 1.2, 0.2);
s.recompensa(SALA, tMarco + 0.5, 0.14);

// 5 · ranking en negro: golpe de entrada, ticks de filas, vacío en "todavía"
s.impacto(SALA, S5 - 0.04, 0.7, 700);
for (let i = 0; i < 11; i++) {
  const t = S5 + 0.2 + Math.pow(i / 11, 1.8) * (tTodavia - S5 - 0.3);
  s.tick(SECO, t, 0.1, i % 2 ? 0.3 : -0.3);
}
s.perdida(SALA, tTodavia + 0.05, 0.5);

// 6 · el puño y la placa: riser, choque, el golpe más grande y la campana
s.subida(MEDIO, S6, tChoque - 0.05, 0.3);
s.impacto(SALA, tChoque - 0.04, 0.85, 900);
s.impacto(SALA, tPlaca - 0.06, 1.0, 900);
s.pina(MEDIO, tPlaca - 0.06, 0.5);
[82.41, 123.5, 164.8, 196.0, 246.9, 329.6].forEach((f, k) => s.pluck(tPlaca + 0.02 + k * 0.012, f, 0.55, 2.6, (k - 2.5) * 0.18));
s.bajo(tPlaca, 3.4, 41.2, 0.75);
s.campanaRing(SALA, tPlaca + 0.45, 0.2);
s.brillo(MEDIO, tPlaca + 0.5, 1.5, 0.24);
s.recompensa(SALA, tPlaca + 0.9, 0.15);

s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-comunidades-rc.wav", salidaCama: "public/audio/cama-comunidades-rc.wav" });
console.log(`comunidades: ${(FIN + 1.5).toFixed(2)}s · banderas ${BANDERAS.map((t) => t.toFixed(2))} · marco ${tMarco.toFixed(2)} · placa ${tPlaca.toFixed(2)}`);
