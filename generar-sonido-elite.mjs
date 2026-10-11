/**
 * Sonido de "Ring Closers para closers de élite": música con pulso (120 BPM) + efectos.
 *
 * Es el primer video con groove en vez de drone: bombo en cada beat, palmas en 2 y 4, hi-hats,
 * bajo y arpegio en mi menor (Em - C - G - D, un acorde por compás de 2 s). Cada escena arranca
 * en un beat, así que los cortes caen en el compás. El arreglo sigue el argumento:
 *
 *   1 gancho     bombo y hat desde el primer cuadro; entran palmas y bajo en el segundo compás
 *   2 puente     "detalle": se cae la percusión, queda bajo y arpegio suave (respiro), se corta
 *                justo antes del golpe de la escena siguiente
 *   3 afilás     vuelve todo, con arpegio y hi-hat abierto
 *   4 te conocen suma hi-hats en semicorcheas y arpegio en octava; redoble de caja al final
 *   5 te buscan  el punto más alto: nota aguda en cada compás; el aviso de las propuestas va
 *                DESPUÉS de la palabra (no compite con la voz)
 *   6 cierre     dos compases a pleno, silencio de un beat, golpe final en "dedo" y acorde largo
 *
 * Capas: la música va a `cama` (se agacha con la voz); los efectos, a `sfx` (no se agachan).
 * Todos los tiempos salen de timeline-elite-rc.json. Uso: node generar-sonido-elite.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-elite-rc.json", "utf8"));
if (tl._borrador) throw new Error("timeline-elite-rc.json es un BORRADOR. Correr: node armar-montaje-elite.mjs && node montaje.mjs montaje-elite-rc.json --whisper");
const FPS = tl.fps;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const S = (id) => escena(id).from / FPS;
/** Segundo absoluto de un cuadro local a una escena. */
const F = (id, cuadro) => (escena(id).from + cuadro) / FPS;
/** Cuadro local de una palabra. */
const L = (id, p, vez = 1) => {
  let n = 0;
  for (const c of escena(id).clips) for (const w of c.palabras) if (norm(w.palabra) === norm(p) && ++n === vez) return w.cuadro;
  throw new Error(`"${p}" (vez ${vez}) no está en ${id}`);
};
const finClip = (id) => {
  const e = escena(id);
  const c = e.clips[e.clips.length - 1];
  return (e.from + c.enEscena + c.cuadros) / FPS;
};

const [e1, e2, e3, e4, e5, e6] = ["e1-gancho", "e2-puente", "e3-afilas", "e4-conocen", "e5-buscan", "e6-cierre"];
const FIN = tl.total / FPS;
const DUR = FIN + 1.5;
const ADEL = 0.13; // el golpe llega antes que la voz

// Cuadros locales que usa la composición (escenas.tsx): tienen que coincidir
const t = {
  e1Toca: F(e1, 6 + 9),
  e1Ring: F(e1, L(e1, "Ring")) - ADEL,
  e2Detalle: F(e2, L(e2, "detalle")) - ADEL,
  e2Escanea: F(e2, L(e2, "diferencia") - 2),
  e3Slam: F(e3, L(e3, "afilás") - 6),
  e3Toca: F(e3, L(e3, "afilás") - 6 + 4 + 9),
  e3Mejor: F(e3, L(e3, "mejor")),
  e4Slam: F(e4, L(e4, "conocen") - 8),
  e4Toca: F(e4, L(e4, "conocen") - 8 + 5 + 9),
  e4Sube: F(e4, L(e4, "ranking") - 2),
  e4Publico: F(e4, L(e4, "público")),
  e5Slam: F(e5, L(e5, "buscan") - 8),
  e5Fichas: F(e5, L(e5, "directores") - 2),
  e5Recorren: F(e5, L(e5, "recorren")),
  e5Interesas: F(e5, L(e5, "interesás")),
  e5Propuesta: F(e5, L(e5, "propuesta")),
  e6Que: F(e6, L(e6, "Que") - 5),
  e6Toca: F(e6, L(e6, "Que") - 5 + 9),
  e6Sin: F(e6, L(e6, "sin") - 5),
  e6Dedo: F(e6, L(e6, "dedo")) - ADEL,
};

const s = crearEstudio(DUR);
const { SECO, MEDIO, SALA } = s;
const S2 = S(e2);
const S3 = S(e3);
const S4 = S(e4);
const S5 = S(e5);
const S6 = S(e6);
const BEAT = 0.5;

// ── Música ───────────────────────────────────────────────────────────────

// Un acorde por compás: Em, C, G, D. `raiz` para el bajo, `arp` para el arpegio.
const ACORDES = [
  { raiz: 41.2, arp: [329.6, 392.0, 493.9, 659.3] },
  { raiz: 65.4, arp: [261.6, 329.6, 392.0, 523.3] },
  { raiz: 49.0, arp: [392.0, 493.9, 587.3, 784.0] },
  { raiz: 73.4, arp: [293.7, 370.0, 440.0, 587.3] },
];
const PATRON = [0, 2, 1, 3, 2, 1, 3, 2];
const seccion = (x) => (x < S2 ? 1 : x < S3 ? 2 : x < S4 ? 3 : x < S5 ? 4 : x < S6 ? 5 : 6);
// Ventanas de silencio para que el golpe siguiente pegue más
const silencios = [
  [S3 - 0.14, S3],
  [S6 - 0.12, S6],
  [t.e6Dedo - 0.36, t.e6Dedo],
];
const enSilencio = (x) => silencios.some(([a, b]) => x >= a && x < b);

for (let b = 0; b * BEAT < FIN; b++) {
  const x = b * BEAT;
  const sec = seccion(x);
  const compas = b % 4;
  const ac = ACORDES[Math.floor(x / 2) % 4];
  const pan = b % 2 ? 0.25 : -0.25;
  const final = x >= t.e6Dedo;
  if (final) continue; // el cierre se arma abajo
  const ok = (y) => !enSilencio(y);

  if (sec === 1) {
    if (ok(x)) s.bombo(x, 0.95);
    if (ok(x + 0.25)) s.hat(x + 0.25, 0.32);
    if (x >= 2 && (compas === 1 || compas === 3) && ok(x)) s.palma(x, 0.5);
    if (x >= 2 && ok(x + 0.25)) s.bajo(x + 0.25, 0.22, ac.raiz, 0.7);
  } else if (sec === 2) {
    if (ok(x)) s.bajo(x, 0.4, ac.raiz, 0.5);
    if (ok(x)) s.pluck(x, ac.arp[b % 4], 0.5, 0.35, pan);
  } else {
    const duro = sec >= 5 ? 1.05 : 1.0;
    if (ok(x)) s.bombo(x, duro);
    if ((compas === 1 || compas === 3) && ok(x) && Math.abs(x - S6) > 0.01) s.palma(x, sec === 6 ? 0.7 : 0.55);
    if (ok(x + 0.25)) (compas === 3 ? s.hat(x + 0.25, 0.3, true) : s.hat(x + 0.25, 0.42));
    if (ok(x + 0.25)) s.bajo(x + 0.25, 0.22, ac.raiz, 0.75);
    for (let k = 0; k < 2; k++) {
      const y = x + k * 0.25;
      if (!ok(y)) continue;
      const nota = ac.arp[PATRON[(b * 2 + k) % 8]];
      s.pluck(y, nota, 0.55, 0.2, pan);
      if (sec >= 4 && sec < 6) s.pluck(y, nota * 2, 0.26, 0.16, -pan);
    }
    if (sec >= 4 && sec < 6) {
      if (ok(x + 0.125)) s.hat(x + 0.125, 0.17);
      if (ok(x + 0.375)) s.hat(x + 0.375, 0.17);
    }
    if (sec === 5 && compas === 0 && ok(x)) s.pluck(x, ac.arp[3] * 2, 0.45, 0.6, 0);
  }
}

// Redoble de caja antes de "te buscan": acelera hasta el golpe
[-0.5, -0.375, -0.25, -0.1875, -0.125, -0.0625].forEach((dt, k) => s.caja(S5 + dt, 0.2 + k * 0.05));

// Cierre: acorde largo (Em) y bajo grave después del golpe, arpegio que se apaga
[164.8, 246.9, 329.6, 493.9, 659.3].forEach((f, k) => s.pluck(t.e6Dedo + 0.02 + k * 0.012, f, 0.55, 2.2, (k - 2) * 0.2));
s.bajo(t.e6Dedo, 3.4, 41.2, 0.75);
for (let x = Math.ceil((t.e6Dedo + 0.5) / BEAT) * BEAT; x < FIN - 0.6; x += BEAT) {
  const fade = Math.max(0.1, 1 - (x - t.e6Dedo) / (FIN - t.e6Dedo));
  s.pluck(x, ACORDES[0].arp[Math.round(x / BEAT) % 4] * 2, 0.34 * fade, 0.3, (Math.round(x / BEAT) % 2 ? 0.3 : -0.3));
}

// ── Efectos ──────────────────────────────────────────────────────────────

// Cada escena arranca con un golpe corto en el beat (la imagen sacude y destella en el mismo cuadro)
[0, S2, S3, S4, S5, S6].forEach((x, k) => s.impacto(k === 5 ? SECO : SALA, Math.max(0, x - 0.05), k === 0 ? 0.3 : k === 5 ? 0.14 : 0.22, 900));

// 1 · gancho: el guante toca el piso; después "Ring Closers"
s.impacto(SALA, t.e1Toca - 0.03, 0.5, 900);
s.pina(MEDIO, t.e1Toca, 0.35);
s.chisporroteo(SECO, t.e1Toca, 0.3, 0.3);
s.impacto(SALA, t.e1Ring, 0.45, 900);
s.chisporroteo(SECO, t.e1Ring, 0.28, 0.25);
s.nota(SALA, t.e1Ring + 0.06, 2637, 0.05);
s.subida(MEDIO, Math.max(S2 - 0.9, finClip(e1) - 0.05), S2, 0.3);

// 2 · puente: escaneo y destello sobre la estrella
s.brillo(MEDIO, t.e2Escanea, 1.2, 0.28);
s.impacto(SALA, t.e2Detalle, 0.4, 900);
s.chisporroteo(SECO, t.e2Detalle, 0.25, 0.25);
s.nota(SALA, t.e2Detalle + 0.06, 2093, 0.06);
s.subida(MEDIO, Math.max(S3 - 0.9, finClip(e2) - 0.05), S3, 0.3);

// 3 · afilás: el golpe de la palabra, la medalla y las chispas de afilar
s.impacto(SALA, t.e3Slam - 0.03, 0.5, 900);
s.pina(MEDIO, t.e3Slam, 0.34);
s.impacto(SALA, t.e3Toca - 0.03, 0.45, 900);
s.pina(MEDIO, t.e3Toca, 0.3);
for (let i = 0; i < 8; i++) s.chisporroteo(SECO, t.e3Toca + (4 + i * 5) / FPS, 0.2, 0.2, 12);
s.recompensa(SALA, t.e3Mejor + 0.62, 0.14);

// 4 · te conocen: golpe, marco en llamas, la fila que sube
s.impacto(SALA, t.e4Slam - 0.03, 0.5, 900);
s.pina(MEDIO, t.e4Slam, 0.34);
s.subida(MEDIO, t.e4Toca - 0.35, t.e4Toca, 0.2);
s.impacto(SALA, t.e4Toca - 0.03, 0.45, 900);
s.chisporroteo(SECO, t.e4Toca, 0.26, 0.3);
s.subida(MEDIO, t.e4Sube - 0.05, t.e4Sube + 0.3, 0.15);
[0, 0.1, 0.2, 0.3].forEach((dt, k) => s.tick(SECO, t.e4Sube + dt, 0.3, [-0.3, 0.3, -0.2, 0.2][k]));
s.recompensa(SALA, t.e4Publico + 0.78, 0.13);

// 5 · te buscan: golpe, fichas, haz de luz, "interesás" y el aviso de propuesta (después de la palabra)
s.impacto(SALA, t.e5Slam - 0.03, 0.5, 900);
s.pina(MEDIO, t.e5Slam, 0.34);
[0, 3, 6].forEach((f, k) => s.tick(SECO, t.e5Fichas + f / FPS, 0.3, [-0.3, 0, 0.3][k]));
s.brillo(MEDIO, t.e5Recorren, 1.9, 0.15);
s.tick(SECO, t.e5Interesas - 0.05, 0.5, 0);
s.nota(SALA, t.e5Interesas + 0.06, 784, 0.08);
s.impacto(SALA, t.e5Propuesta - 0.07, 0.28, 900);
s.impacto(SALA, t.e5Propuesta + 0.26, 0.2, 900);
s.nota(SALA, t.e5Propuesta + 0.5, 1760, 0.06);
s.nota(SALA, t.e5Propuesta + 0.62, 2349, 0.05);
s.subida(SECO, Math.max(S6 - 0.4, finClip(e5) - 0.05), S6 - 0.06, 0.14);

// 6 · cierre: golpes en cada línea y el golpe final en "dedo"
s.impacto(SALA, t.e6Toca - 0.03, 0.45, 800);
s.pina(MEDIO, t.e6Toca, 0.3);
s.chisporroteo(SECO, t.e6Toca, 0.2, 0.3);
s.impacto(SALA, t.e6Sin - 0.03, 0.3, 800);
s.impacto(SALA, t.e6Dedo, 0.9, 900);
s.pina(MEDIO, t.e6Dedo, 0.45);
s.chisporroteo(SECO, t.e6Dedo, 0.22, 0.4, 30);
s.brillo(MEDIO, t.e6Dedo + 0.45, 1.4, 0.3);
s.recompensa(SALA, t.e6Dedo + 0.6, 0.2);

// ── Salida ───────────────────────────────────────────────────────────────
s.cerrar({
  gSfx: 0.35,
  gCama: 1.47,
  salidaSfx: "public/audio/sfx-elite-rc.wav",
  salidaCama: "public/audio/cama-elite-rc.wav",
});

const f2 = (x) => x.toFixed(2);
console.log(`sfx y cama del video de élite: ${f2(DUR)}s (video ${f2(FIN)}s)`);
console.log("eventos (s): " + Object.entries(t).map(([k, v]) => `${k} ${f2(v)}`).join(" · "));
