/**
 * Sonido del video para directores comerciales: "La firma" (26/09/2026).
 *
 * Vara: élite (golpes 0,5-0,95, silencios de contraste, el golpe más grande al final). Identidad
 * propia, distinta de veteranos: Re menor oscuro y de pulso seco en el gancho (plumín que raspa, sello
 * seco con golpe grave), la tormenta de papel acelera con soplos en cada beat y un riser; todo se
 * CONGELA (silencio) y cae el golpe grande en "Ring"; el escaneo trae groove pleno en Fa mayor y cada
 * dato que aparece (hambre, calidad, rango) tiene su golpe; cierre con la firma que se enciende y el
 * golpe final. Los golpes son casi todo sub (`corte` bajo) y los brillos van DESPUÉS de las palabras.
 * Uso: node generar-sonido-directores.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-directores-rc.json", "utf8"));
if (tl._borrador) throw new Error("timeline-directores-rc.json es un BORRADOR: primero la voz real y montaje --whisper");
const FPS = tl.fps;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const S = (id) => escena(id).from / FPS;
const L = (id, p, vez = 1) => {
  let n = 0;
  for (const c of escena(id).clips) for (const w of c.palabras) if (norm(w.palabra) === norm(p) && ++n === vez) return w.cuadro;
  throw new Error(`"${p}" (vez ${vez}) no está en ${id}`);
};
const T = (id, p, vez = 1) => (escena(id).from + L(id, p, vez)) / FPS;

const [e1, e2, e3, e4, e5, e6] = ["e1-gancho", "e2-grupo", "e3-hambre", "e4-calidad", "e5-rango", "e6-cierre"];
const FIN = tl.total / FPS;
const s = crearEstudio(FIN + 1.5);
const { SECO, MEDIO, SALA } = s;
const [S2, S3, S4, S5, S6] = [e2, e3, e4, e5, e6].map(S);
const BEAT = 0.5;
const tContrataste = T(e1, "contrataste");
const tEntrevista = T(e1, "entrevista");
const tNada = T(e1, "nada");
const tRing = T(e3, "Ring");
const tSemanas = T(e3, "semanas");
const tHambre = T(e3, "hambre");
const tCalif = T(e4, "calificaron");
const tCalidad = T(e4, "calidad");
const tRango = T(e5, "rango");
const tBusca = T(e5, "busca");
const tProbados = T(e6, "probados");
const tLink = T(e6, "Link");

// ── Música ───────────────────────────────────────────────────────────────
const ch = (raiz, arp) => ({ raiz, arp });
const Rem = ch(36.71, [293.7, 349.2, 440.0, 587.3]);
const SibM = ch(58.27, [233.1, 293.7, 349.2, 466.2]);
const LaM = ch(55.0, [277.2, 329.6, 440.0, 554.4]); // dominante: tensión
const FaM = ch(43.65, [261.6, 349.2, 440.0, 523.3]);
const DoM = ch(65.41, [261.6, 329.6, 392.0, 523.3]);
const PATRON = [0, 3, 1, 2, 3, 1, 2, 0];
const acorde = (x) => {
  if (x < tRing) return [Rem, Rem, SibM, LaM][Math.floor(x / 2) % 4];
  return [FaM, DoM, Rem, SibM][Math.floor((x - tRing) / 2) % 4];
};
const silencios = [
  [tRing - 0.5, tRing - 0.02], // el congelado: silencio total antes del golpe grande
  [tProbados - 0.4, tProbados - 0.08], // y antes del golpe final
];
const enSilencio = (x) => silencios.some(([a, b]) => x >= a && x < b);
const sinAgudos = [
  [tNada - 0.1, tNada + 0.5],
  [tHambre - 0.1, tHambre + 0.5],
  [tCalidad - 0.1, tCalidad + 0.5],
];

for (let b = 0; b * BEAT < FIN; b++) {
  const x = b * BEAT;
  if (x >= tProbados - 0.08) continue;
  const ac = acorde(x);
  const compas = b % 4;
  const pan = b % 2 ? 0.25 : -0.25;
  const ok = (y) => !enSilencio(y);
  const agudo = (y) => ok(y) && !sinAgudos.some(([a, c]) => y >= a && y < c);
  if (x < S2) {
    // gancho: pulso seco y bajo largo, un pluck oscuro cada dos beats
    if (b % 2 === 0 && ok(x)) s.latido(x, 0.75);
    if (compas === 0 && ok(x)) s.bajo(x, 1.9, ac.raiz, 0.55);
    if (b % 2 === 1 && agudo(x)) s.pluck(x, ac.arp[PATRON[b % 8]], 0.45, 0.3, pan);
  } else if (x < tRing) {
    // tormenta: bombo en cada beat, soplos de papel y el bajo en corcheas
    if (ok(x)) s.bombo(x, 0.9);
    if (ok(x + 0.25)) s.bajo(x + 0.25, 0.2, ac.raiz, 0.6);
    if (agudo(x + 0.25)) s.hat(x + 0.25, 0.32);
    if (agudo(x)) s.pluck(x, ac.arp[PATRON[b % 8]], 0.5, 0.2, pan);
  } else {
    // escaneo: groove pleno en Fa mayor
    if (ok(x)) s.bombo(x, 1.0);
    if ((compas === 1 || compas === 3) && agudo(x)) s.palma(x, 0.5);
    if (agudo(x + 0.25)) s.hat(x + 0.25, 0.38);
    if (ok(x + 0.25)) s.bajo(x + 0.25, 0.22, ac.raiz, 0.75);
    for (let k = 0; k < 2; k++) {
      const y = x + k * 0.25;
      if (agudo(y)) s.pluck(y, ac.arp[PATRON[(b * 2 + k) % 8]], 0.5, 0.2, pan);
    }
  }
}

// Cierre musical: Fa mayor largo después del golpe final
[87.31, 130.8, 174.6, 261.6, 349.2, 440.0].forEach((f, k) => s.pluck(tProbados + 0.02 + k * 0.012, f, 0.5, 2.6, (k - 2.5) * 0.18));
s.bajo(tProbados, 3.6, 43.65, 0.75);

// ── Efectos ──────────────────────────────────────────────────────────────
// 1 · el plumín raspa mientras firma (ticks muy suaves y graves), sello seco en "nada"
for (let x = tContrataste - 0.2; x < tEntrevista + 0.1; x += 0.11) s.tick(SECO, x, 0.07, Math.sin(x * 7) * 0.3);
s.impacto(SALA, tNada - 0.08, 0.8, 800);
s.pina(MEDIO, tNada - 0.08, 0.4);
s.perdida(SALA, tNada + 0.35, 0.3);

// 2 · la tormenta: golpe de entrada, soplo de papel en cada beat, riser que muere en el congelado
s.impacto(SALA, S2 - 0.05, 0.55, 900);
for (let x = S2; x < tRing - 0.5; x += BEAT) s.susurro(MEDIO, x + 0.1, 0.22, Math.sin(x * 3) * 0.4);
s.subida(MEDIO, S2 + 0.5, tRing - 0.5, 0.24);

// 3 · congelado: golpe grande en "Ring" + brillo; el haz barre con un soplo largo; "hambre" pega
s.impacto(SALA, tRing - 0.06, 0.92, 900);
s.pina(MEDIO, tRing - 0.05, 0.42);
s.brillo(MEDIO, tRing + 0.6, 1.2, 0.2);
s.susurro(MEDIO, tSemanas - 0.5, 0.2, 0);
[1318.5, 1760.0].forEach((f, i) => s.nota(SALA, tHambre + 0.5 + i * 0.08, f, 0.09, (i - 0.5) * 0.3));
s.impacto(SALA, tHambre - 0.08, 0.7, 800);

// 4 · los cinco puntos: un tic por punto (graves, en el beat de cada uno) y el golpe en "calidad"
for (let i = 0; i < 5; i++) s.tick(SECO, tCalif + (i * 6) / FPS, 0.16, (i - 2) * 0.15);
s.impacto(SALA, S4 - 0.05, 0.5, 900);
s.impacto(SALA, tCalidad - 0.08, 0.72, 800);
s.recompensa(SALA, tCalidad + 0.55, 0.13);

// 5 · el rango grabado en metal: golpe + brillo después; el chip de FULL-TIME hace clic
s.impacto(SALA, S5 - 0.05, 0.5, 900);
s.impacto(SALA, tRango - 0.08, 0.66, 800);
s.brillo(MEDIO, tRango + 0.45, 0.8, 0.14);
s.tick(SECO, tBusca - 0.06, 0.22, 0);

// 6 · la firma que se enciende: riser y el golpe más grande del video
s.impacto(SALA, S6 - 0.05, 0.4, 900);
s.subida(MEDIO, tProbados - 1.4, tProbados - 0.4, 0.22);
s.impacto(SALA, tProbados - 0.1, 0.96, 800);
s.pina(MEDIO, tProbados - 0.1, 0.46);
s.brillo(MEDIO, tProbados + 0.55, 1.4, 0.24);
s.recompensa(SALA, tLink + 0.6, 0.14);

s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-directores-rc.wav", salidaCama: "public/audio/cama-directores-rc.wav" });
console.log(`sfx y cama de directores: ${(FIN + 1.5).toFixed(2)}s · Ring ${tRing.toFixed(2)}s · probados ${tProbados.toFixed(2)}s`);
