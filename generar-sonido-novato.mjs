/**
 * ⚠️ VARA DE CALIDAD (Javier, 19/09/2026): el sonido de ESTE video bajó un nivel respecto a élite
 * ("música comercial de fondo"): los impactos quedaron en 0,12-0,3 y la música sin identidad. NO copiar
 * estos niveles. Piso = `generar-sonido-elite.mjs` (impactos 0,5-0,95, redobles, silencios, cierre con el
 * golpe más grande). El enmascarado se resuelve con timing y espectro, no lijando los golpes.
 */
/**
 * Sonido del video para closers novatos: "El ascenso".
 *
 * A propósito distinto del de élite (groove fijo + golpes secos): acá la música SUBE. Arranca cruda
 * (latido y hi-hat sobre La menor, el cuero crudo), suma capas escena a escena, cae y "entra" cuando
 * aparece Ring Closers, modula un tono hacia arriba cuando aparece el ranking (Si menor) y cierra
 * en Re mayor con la campana del ring. Los efectos son de subida (whoosh al subir la cámara),
 * golpes graves y campanitas que entran DESPUÉS de cada palabra clave.
 *
 * Lo aprendido en élite: lo que tapa la voz vive en 1-4 kHz (redobles, chispas, campanitas sobre la
 * palabra, dobles de octava). Los golpes son casi todo sub y van con `corte` bajo.
 *
 * Capas: la música va a `cama` (se agacha con la voz); los efectos a `sfx` (no se agachan).
 * Todos los tiempos salen de timeline-novato-rc.json. Uso: node generar-sonido-novato.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-novato-rc.json", "utf8"));
if (tl._borrador) throw new Error("timeline-novato-rc.json es un BORRADOR");
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
/** Segundo absoluto en que la voz dice `p`. */
const T = (id, p, vez = 1) => F(id, L(id, p, vez));

const [e1, e2, e3, e4, e5, e6] = ["e1-gancho", "e2-como", "e3-conquien", "e4-mas", "e5-primero", "e6-cierre"];
const FIN = tl.total / FPS;
const DUR = FIN + 1.5;
const s = crearEstudio(DUR);
const { SECO, MEDIO, SALA } = s;
const [S2, S3, S4, S5, S6] = [e2, e3, e4, e5, e6].map(S);
const BEAT = 0.5;
const PAN = 10 / FPS; // la cámara sube 10 cuadros antes del beat de cada escena
const tAca = T(e6, "acá");

// ── Música ───────────────────────────────────────────────────────────────

const ch = (raiz, arp) => ({ raiz, arp });
const Am = ch(55.0, [261.6, 329.6, 440.0, 523.3]);
const Fa = ch(43.65, [261.6, 349.2, 440.0, 523.3]);
const Do = ch(65.41, [261.6, 329.6, 392.0, 523.3]);
const Sol = ch(49.0, [293.7, 392.0, 493.9, 587.3]);
const Bm = ch(61.74, [293.7, 370.0, 493.9, 587.3]);
const Sol2 = ch(49.0, [293.7, 392.0, 493.9, 587.3]);
const Re = ch(73.42, [293.7, 370.0, 440.0, 587.3]);
const La = ch(55.0, [277.2, 329.6, 440.0, 554.4]);
// un acorde por compás de 2 s; a los 24 s sube un tono (Si menor) justo antes de subir al ranking
const ARMONIA = [Am, Fa, Do, Sol, Am, Fa, Do, Sol, Am, Fa, Do, Sol, Bm, Sol2, Re, La, Bm, Sol2];
const PATRON = [0, 2, 1, 3, 2, 1, 3, 2];
const seccion = (x) => (x < S2 ? 1 : x < S3 ? 2 : x < S4 ? 3 : x < S5 ? 4 : x < S6 ? 5 : 6);
// silencios para que el golpe siguiente pegue más: la entrada de Ring Closers y el golpe final
const silencios = [
  [S3 - 0.16, S3 + 0.02],
  [S6 - 0.12, S6],
  [tAca - 0.4, tAca - 0.08],
];
const enSilencio = (x) => silencios.some(([a, b]) => x >= a && x < b);
// sin agudos (palmas, hats, arpegio) justo antes de "Ring": la música recién entró y todavía no se agachó con la voz
const sinAgudos = [[T(e3, "Ring") - 0.45, T(e3, "Ring") + 0.25]];

for (let b = 0; b * BEAT < FIN; b++) {
  const x = b * BEAT;
  if (x >= tAca - 0.08) continue; // el cierre se arma abajo
  const sec = seccion(x);
  const compas = b % 4;
  const ac = ARMONIA[Math.min(ARMONIA.length - 1, Math.floor(x / 2))];
  const pan = b % 2 ? 0.25 : -0.25;
  const ok = (y) => !enSilencio(y);
  const agudo = (y) => ok(y) && !sinAgudos.some(([a, b]) => y >= a && y < b);

  if (sec <= 2) {
    // crudo: latido, hi-hat suave y un bajo largo por compás; en la escena 2 suma palmas
    if (b % 2 === 0 && ok(x)) s.latido(x, sec === 1 ? 0.55 : 0.75);
    if (ok(x + 0.25)) s.hat(x + 0.25, sec === 1 ? 0.18 : 0.26);
    if (compas === 0 && ok(x)) s.bajo(x, 0.9, ac.raiz, 0.5);
    if (sec === 2 && (compas === 1 || compas === 3) && ok(x)) s.palma(x, 0.4);
    if (sec === 2 && ok(x + 0.25)) s.bajo(x + 0.25, 0.22, ac.raiz, 0.5);
    if (x >= 2 && ok(x)) s.pluck(x, ac.arp[PATRON[(b * 2) % 8]], sec === 1 ? 0.5 : 0.6, 0.2, pan);
  } else {
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
      if (ok(x + 0.125)) s.hat(x + 0.125, 0.17);
      if (ok(x + 0.375)) s.hat(x + 0.375, 0.17);
      if (compas === 0 && ok(x)) s.pluck(x, ac.arp[3] * 2, 0.45, 0.6, 0);
    }
  }
}

// Redoble de caja antes de subir al ranking: arranca cuando "rápido" ya terminó
[-0.5, -0.375, -0.25, -0.1875, -0.125, -0.0625].forEach((dt, k) => s.caja(S5 + dt, 0.2 + k * 0.05));

// Cierre: Re mayor largo después de "acá", bajo grave y un arpegio que se apaga
[146.8, 220.0, 293.7, 370.0, 587.3].forEach((f, k) => s.pluck(tAca + 0.02 + k * 0.012, f, 0.55, 2.4, (k - 2) * 0.2));
s.bajo(tAca, 3.6, 73.42, 0.75);
for (let x = Math.ceil((tAca + 0.5) / BEAT) * BEAT; x < FIN - 0.6; x += BEAT) {
  const fade = Math.max(0.1, 1 - (x - tAca) / (FIN - tAca));
  s.pluck(x, Re.arp[Math.round(x / BEAT) % 4] * 2, 0.34 * fade, 0.3, Math.round(x / BEAT) % 2 ? 0.3 : -0.3);
}

// ── Efectos ──────────────────────────────────────────────────────────────

// Cada subida de cámara: un whoosh que crece y un golpe grave al asentar (el de la escena 6, el más bajo)
[S2, S3, S4, S5, S6].forEach((x, k) => {
  s.subida(MEDIO, x - PAN, x + 0.03, k === 4 ? 0.16 : 0.22);
  s.impacto(SECO, x + 0.05, k === 4 ? 0.12 : k === 1 ? 0.3 : 0.16, 700);
});

// 1 · gancho: cada resaltador que barre lleva un golpe sordo; la campana entra después de "esto"
s.pina(MEDIO, T(e1, "novato") - 0.03, 0.22);
s.pina(MEDIO, T(e1, "cómo") - 0.03, 0.16);
s.pina(MEDIO, T(e1, "con") - 0.03, 0.16);
s.campanaRing(SALA, T(e1, "esto") + 0.42, 0.17);

// 2 · cómo: el resaltador de "roleplay" y el otro closer que entra a la llamada
s.pina(MEDIO, T(e2, "Roleplay") - 0.03, 0.22);
s.pina(MEDIO, T(e2, "otro") - 0.03, 0.2);

// 3 · con quién: la entrada de Ring Closers, el nivel que se elige, los horarios que se encienden y la pelea que aparece
s.impacto(SALA, T(e3, "Ring") - 0.04, 0.3, 800);
s.pina(MEDIO, T(e3, "Ring") - 0.03, 0.28);
s.tick(SECO, F(e3, L(e3, "nivel") + 10), 0.18, 0);
for (let i = 0; i < 10; i++) s.tick(SECO, F(e3, L(e3, "horarios") + 6 + i * 2), 0.13, i % 2 ? 0.3 : -0.3);
s.pina(MEDIO, F(e3, L(e3, "rivales") - 4), 0.22);

// 4 · los guantes que suben, uno por escalón; el último (puño de leyenda) lleva más peso
[L(e4, "nivel"), L(e4, "también"), L(e4, "saben")].forEach((c) => s.pina(MEDIO, F(e4, c + 6), 0.15));
s.pina(MEDIO, F(e4, L(e4, "más") + 6), 0.3);
s.impacto(SALA, F(e4, L(e4, "más") + 6), 0.28, 800);

// 5 · el ranking: "arriba", y una escala de campanitas que se enciende DESPUÉS de "roleplay" (una estrella por fila)
s.pina(MEDIO, T(e5, "arriba") - 0.03, 0.22);
[1046.5, 1174.7, 1318.5, 1568.0, 1760.0].forEach((f, i) => s.nota(SALA, F(e5, L(e5, "roleplay") + 18 + i * 3), f, 0.1, (i - 2) * 0.2));

// 6 · cierre: "tuyo" resaltado, y el golpe final con la campana del ring después de "acá"
s.pina(MEDIO, T(e6, "tuyo") - 0.03, 0.25);
s.impacto(SALA, tAca - 0.1, 0.85, 900);
s.pina(MEDIO, tAca - 0.1, 0.4);
s.campanaRing(SALA, tAca + 0.42, 0.2);
s.brillo(MEDIO, tAca + 0.45, 1.4, 0.25);
s.recompensa(SALA, tAca + 0.75, 0.16);

// ── Salida ───────────────────────────────────────────────────────────────
s.cerrar({
  gSfx: 0.35,
  gCama: 1.47,
  salidaSfx: "public/audio/sfx-novato-rc.wav",
  salidaCama: "public/audio/cama-novato-rc.wav",
});

const f2 = (x) => x.toFixed(2);
console.log(`sfx y cama del video para novatos: ${f2(DUR)}s (video ${f2(FIN)}s) · "acá" ${f2(tAca)}s`);
