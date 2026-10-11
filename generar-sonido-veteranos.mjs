/**
 * Sonido del video para closers veteranos: "El costo de aprender en vivo".
 *
 * Vara: el sonido de élite (golpes con peso 0,5-0,95, silencios de contraste, cierre con el golpe más
 * grande). Argumento propio: primero tensión (La menor, latido, un reloj mecánico que tictaquea como
 * el odómetro, un golpe grave más fuerte con cada "lead quemado"), después la resolución: se corta el
 * sonido, cae el golpe grande cuando entra Ring Closers, la música pasa a Do mayor con groove pleno y
 * cierra en un acorde de Do mayor largo con la campana del ring.
 *
 * Los golpes son casi todo sub y van con `corte` bajo; las campanitas, los ticks del rebobinado y
 * los avisos entran ANTES o DESPUÉS de las palabras clave (nunca encima). El enmascarado se resuelve
 * con timing y espectro, no bajando los golpes. Uso: node generar-sonido-veteranos.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-veteranos-rc.json", "utf8"));
if (tl._borrador) throw new Error("timeline-veteranos-rc.json es un BORRADOR: primero la voz real y node montaje.mjs montaje-veteranos-rc.json --whisper");
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
const finClip = (id) => {
  const e = escena(id);
  const c = e.clips[e.clips.length - 1];
  return (e.from + c.enEscena + c.cuadros) / FPS;
};

const [e1, e2, e3, e4, e5, e6] = ["e1-gancho", "e2-hueso", "e3-ring", "e4-simple", "e5-trayectoria", "e6-cierre"];
const FIN = tl.total / FPS;
const s = crearEstudio(FIN + 1.5);
const { SECO, MEDIO, SALA } = s;
const [S2, S3, S4, S5, S6] = [e2, e3, e4, e5, e6].map(S);
const BEAT = 0.5;
const INCS = [T(e1, "lead"), T(e2, "cuesta"), T(e2, "mal"), T(e2, "vuelve")];
const tRing = T(e3, "Ring");
const tCon = T(e3, "con");
const tQuien = T(e4, "quién");
const tNum = T(e5, "números");
const tLead = T(e6, "lead");

// ── Música ───────────────────────────────────────────────────────────────

const ch = (raiz, arp) => ({ raiz, arp });
const Am = ch(55.0, [220.0, 261.6, 329.6, 440.0]);
const Fa = ch(43.65, [220.0, 261.6, 349.2, 440.0]);
const Mi = ch(41.2, [246.9, 329.6, 415.3, 493.9]); // Mi mayor: la tensión del dominante
const Do = ch(65.41, [261.6, 329.6, 392.0, 523.3]);
const Sol = ch(49.0, [293.7, 392.0, 493.9, 587.3]);
const PATRON = [0, 2, 1, 3, 2, 1, 3, 2];
const acorde = (x) => {
  const c = Math.floor(x / 2);
  if (x < S3) return [Am, Fa, Am, Mi][c % 4];
  return [Do, Sol, Am, Fa][Math.floor((x - S3) / 2) % 4];
};
const seccion = (x) => (x < S2 ? 1 : x < S3 ? 2 : x < S4 ? 3 : x < S5 ? 4 : x < S6 ? 5 : 6);
const silencios = [
  [S3 - 0.16, S3 + 0.02], // se corta todo justo antes del golpe grande de Ring Closers
  [S6 - 0.12, S6],
  [tLead - 0.4, tLead - 0.08], // y antes del golpe final
];
const enSilencio = (x) => silencios.some(([a, b]) => x >= a && x < b);
// sin agudos justo antes de "Ring": la música recién entra y todavía no se agachó con la voz
// y donde la cama competía con la palabra (medido): la música "respira" un instante bajo "plata", "perfil" y "cuesta"
const tPlata = T(e3, "plata");
const tPerfil = T(e5, "perfil");
const tCuesta = T(e6, "cuesta");
const tVuelve = INCS[3];
const sinAgudos = [
  [tRing - 0.45, tRing + 0.25],
  [tVuelve - 0.05, tVuelve + 0.62], // el pico del dolor: queda el latido y el golpe, sin reloj ni notas
  [tPlata - 0.05, S4],
  [tPerfil - 0.05, tPerfil + 0.5],
  [tCuesta - 0.05, tCuesta + 0.62],
];

for (let b = 0; b * BEAT < FIN; b++) {
  const x = b * BEAT;
  if (x >= tLead - 0.08) continue; // el cierre se arma abajo
  const sec = seccion(x);
  const compas = b % 4;
  const ac = acorde(x);
  const pan = b % 2 ? 0.25 : -0.25;
  const ok = (y) => !enSilencio(y);
  const agudo = (y) => ok(y) && !sinAgudos.some(([a, c]) => y >= a && y < c);

  if (sec <= 2) {
    // tensión: latido, bajo largo y un reloj mecánico que tictaquea; en la escena 2 suma peso
    if (b % 2 === 0 && ok(x)) s.latido(x, sec === 1 ? 0.7 : 0.9);
    if (compas === 0 && ok(x)) s.bajo(x, 1.9, ac.raiz, sec === 1 ? 0.5 : 0.65);
    if (agudo(x + 0.25)) s.tick(SECO, x + 0.25, sec === 1 ? 0.1 : 0.14, b % 2 ? 0.25 : -0.25);
    if (sec === 2 && ok(x + 0.25)) s.bajo(x + 0.25, 0.22, ac.raiz, 0.5);
    if (x >= 1 && agudo(x)) s.pluck(x, ac.arp[PATRON[(b * 2) % 8]], sec === 1 ? 0.5 : 0.62, 0.22, pan);
  } else {
    // resolución: groove pleno en Do mayor
    const pico = sec === 5;
    if (ok(x)) s.bombo(x, pico ? 1.05 : 1.0);
    if ((compas === 1 || compas === 3) && agudo(x)) s.palma(x, sec === 6 ? 0.7 : 0.55);
    if (agudo(x + 0.25)) (compas === 3 ? s.hat(x + 0.25, 0.3, true) : s.hat(x + 0.25, 0.42));
    if (ok(x + 0.25)) s.bajo(x + 0.25, 0.22, ac.raiz, 0.75);
    for (let k = 0; k < 2; k++) {
      const y = x + k * 0.25;
      if (!agudo(y)) continue;
      const nota = ac.arp[PATRON[(b * 2 + k) % 8]];
      s.pluck(y, nota, 0.55, 0.2, pan);
      if (pico) s.pluck(y, nota * 2, 0.26, 0.16, -pan);
    }
    if (pico) {
      if (agudo(x + 0.125)) s.hat(x + 0.125, 0.17);
      if (agudo(x + 0.375)) s.hat(x + 0.375, 0.17);
      if (compas === 0 && agudo(x)) s.pluck(x, ac.arp[3] * 2, 0.45, 0.6, 0);
    }
  }
}

// Redoble de caja hacia el cierre: arranca cuando "perfil" ya terminó
[-0.5, -0.375, -0.25, -0.1875, -0.125, -0.0625].forEach((dt, k) => s.caja(S6 + dt, 0.2 + k * 0.05));

// Cierre: Do mayor largo después del golpe final, bajo grave y un arpegio que se apaga
[130.8, 196.0, 261.6, 329.6, 523.3].forEach((f, k) => s.pluck(tLead + 0.02 + k * 0.012, f, 0.55, 2.4, (k - 2) * 0.2));
s.bajo(tLead, 3.6, 65.41, 0.75);
for (let x = Math.ceil((tLead + 0.5) / BEAT) * BEAT; x < FIN - 0.6; x += BEAT) {
  const fade = Math.max(0.1, 1 - (x - tLead) / (FIN - tLead));
  s.pluck(x, Do.arp[Math.round(x / BEAT) % 4] * 2, 0.34 * fade, 0.3, Math.round(x / BEAT) % 2 ? 0.3 : -0.3);
}

// ── Efectos ──────────────────────────────────────────────────────────────

// Arranque de escena: golpe corto en el beat (el de la escena 6, el más bajo: la voz entra a los 4 cuadros)
[S2, S4, S5].forEach((x) => s.impacto(SALA, x - 0.05, 0.22, 900));
s.impacto(SECO, S6 - 0.05, 0.14, 900);

// Cada lead quemado pega más fuerte que el anterior; el cuarto ("vuelve") es el pico del dolor
INCS.forEach((t, i) => {
  s.impacto(SALA, t - 0.08, [0.6, 0.7, 0.8, 0.95][i], 900);
  s.pina(MEDIO, t - 0.12, [0.3, 0.34, 0.38, 0.45][i]);
});
// Un riser de tensión que arranca DESPUÉS de "vuelve" y muere justo antes del golpe grande
s.subida(MEDIO, Math.max(INCS[3] + 0.55, S3 - 0.75), S3 - 0.16, 0.2);

// 3 · la resolución: el odómetro se rebobina (ticks antes de "Ring"), golpe grande, campana y brillo
for (let i = 0; i < 8; i++) s.tick(SECO, tRing - 0.3 + i * 0.035, 0.2, i % 2 ? 0.3 : -0.3);
s.impacto(SALA, tRing - 0.05, 0.9, 900);
s.pina(MEDIO, tRing - 0.04, 0.42);
s.campanaRing(SALA, S3 - 0.02, 0.15);
s.brillo(MEDIO, tRing + 0.75, 1.2, 0.2);
// el brillo cruza la medalla de plata: su destello sigue a "plata" (después de la palabra, no encima)
s.brillo(MEDIO, tPlata + 0.42, 0.7, 0.12);
// los guantes cruzados caen
s.impacto(SALA, tCon - 0.03, 0.5, 900);
s.pina(MEDIO, tCon - 0.03, 0.3);

// 4 · el panel de la semana: un tic suave en la pausa antes de "y" (se enciende la casilla elegida);
// el toque en "Confirmar" entra un pelo ANTES de "quién" y la campanita, DESPUÉS
s.tick(SECO, F(e4, L(e4, "y") - 5), 0.2, 0);
s.tick(SECO, tQuien - 0.09, 0.16, 0);
s.recompensa(SALA, tQuien + 0.52, 0.13);

// 5 · los números de la trayectoria suben: una escala de tres notas DESPUÉS de "números"
// (una octava más arriba y más juntas: terminan antes de "queda" y casi no pisan la banda de la voz)
[2093.0, 3136.0, 4186.0].forEach((f, i) => s.nota(SALA, tNum + 0.44 + i * 0.09, f, 0.09, (i - 1) * 0.2));

// 6 · el golpe final (el más grande) con la campana del ring después de "lead"
s.impacto(SALA, tLead - 0.1, 0.95, 900);
s.pina(MEDIO, tLead - 0.1, 0.45);
s.campanaRing(SALA, tLead + 0.45, 0.2);
s.brillo(MEDIO, tLead + 0.5, 1.4, 0.25);
s.recompensa(SALA, tLead + 0.8, 0.16);

// ── Salida ───────────────────────────────────────────────────────────────
s.cerrar({
  gSfx: 0.35,
  gCama: 1.47,
  salidaSfx: "public/audio/sfx-veteranos-rc.wav",
  salidaCama: "public/audio/cama-veteranos-rc.wav",
});

const f2 = (x) => x.toFixed(2);
console.log(`sfx y cama del video para veteranos: ${f2(FIN + 1.5)}s (video ${f2(FIN)}s) · lead final ${f2(tLead)}s · Ring ${f2(tRing)}s · fin de la voz ${f2(finClip(e6))}s`);
