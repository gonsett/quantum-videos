/**
 * Diseño sonoro de "Qué es Ring Closers" (3 rounds, voz Charon).
 *
 * Los sonidos salen de sonidos-rc.mjs; acá solo se decide CUÁNDO cae cada uno.
 * Todos los tiempos salen de timeline-que-es-rc.json: si se regenera una toma y
 * se vuelve a correr montaje.mjs, el sonido se reacomoda solo.
 *
 * La emoción sigue el argumento del video:
 *
 *   Round 1  campana de ring · "Ring Closers?" pega · el cinturón entra con un
 *            golpe de cuero y el brillo recorre el metal.
 *   Round 2  campana · el problema suena vacío: golpes sordos en "te frena" y
 *            "nadie lo sostiene", el latido se apaga y el pad se cierra. La
 *            solución llega con un impacto en "tres roleplays" y el latido vuelve;
 *            un clic de cursor en cada "uno".
 *   Round 3  campana · el cinturón cambia de rango con un brillo y una nota;
 *            "perdés puntos" cae sordo · las estrellas suben de a una · "es real"
 *            pega · llega la propuesta (nota) y la postulación (clic + nota).
 *   Cierre   el latido se acelera, subida, golpe grande en "Subite" y tres
 *            campanadas de ring en el silencio que deja la voz.
 *
 * Uso:
 *   node generar-sonido-que-es.mjs            (con el timeline REAL)
 *   node generar-sonido-que-es.mjs --prueba   (con el borrador: solo para ver que corre)
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const PRUEBA = process.argv.includes("--prueba");
const tl = JSON.parse(fs.readFileSync("timeline-que-es-rc.json", "utf8"));
if (tl._borrador && !PRUEBA) {
  throw new Error("timeline-que-es-rc.json es un BORRADOR (sin voz). Correr: node montaje.mjs montaje-que-es-rc.json");
}
const FPS = tl.fps;
const seg = (c) => c / FPS;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const A = (id, p, vez = 1) => {
  const e = escena(id);
  let n = 0;
  for (const c of e.clips) for (const w of c.palabras) if (norm(w.palabra) === norm(p) && ++n === vez) return seg(e.from + w.cuadro);
  throw new Error(`"${p}" (vez ${vez}) no está en ${id}`);
};
const S = (id) => seg(escena(id).from);
const finClip = (id) => {
  const e = escena(id);
  const c = e.clips[e.clips.length - 1];
  return seg(e.from + c.enEscena + c.cuadros);
};

const [e1, e2, e3, e4, e5, e6, e7] = ["e1-que-es", "e2-problema", "e3-solucion", "e4-juego", "e5-evaluan", "e6-ven", "e7-cierre"];
const FIN = seg(tl.total);
const DUR = FIN + 1.0;
const ADEL = 0.13; // el golpe llega antes que la voz

const T = {
  // Round 1
  campana1: 0.03,
  que: A(e1, "Qué") - ADEL,
  ring: A(e1, "Ring") - ADEL,
  un: A(e1, "ring", 2) - 0.3,
  ring2: A(e1, "ring", 2) - 0.06,
  se1: A(e1, "se") - ADEL,
  entrenan: A(e1, "entrenan"),
  entre: A(e1, "entre") - ADEL,
  // Round 2: el problema
  campana2: S(e2) + 0.1,
  tit2a: S(e2) + 4 / FPS,
  tit2b: S(e2) + 10 / FPS,
  practicar: A(e2, "Practicar") - ADEL,
  frena: A(e2, "frena") - 0.03,
  y2: A(e2, "organizarlo") - 0.33,
  nadie: A(e2, "nadie"),
  sostiene: A(e2, "sostiene"),
  // Round 2: la solución
  ring3: A(e3, "Ring") - ADEL,
  tres: A(e3, "tres") - 0.06,
  por3: A(e3, "por", 1) - ADEL,
  uno: [1, 2, 3].map((v) => A(e3, "uno", v) - 0.05),
  // Round 3
  campana3: S(e4) + 0.1,
  tit3a: S(e4) + 4 / FPS,
  tit3b: S(e4) + 10 / FPS,
  porque4: A(e4, "Porque") - ADEL,
  cumplis: A(e4, "cumplís") - ADEL,
  subis: A(e4, "subís") - 0.03,
  // la imagen cruza el umbral de Contendiente 18 cuadros después de "subís" (escenas.tsx: suma.en + 20)
  cruce: A(e4, "subís") + 18 / FPS,
  rango: A(e4, "rango"),
  te4: A(e4, "falta") - 0.33,
  perdes: A(e4, "perdés") - 0.03,
  porque5: A(e5, "Porque") - ADEL,
  tu5: A(e5, "nivel") - 0.33,
  es5: A(e5, "real") - ADEL,
  estrellas: A(e5, "evalúan"),
  real: A(e5, "real"),
  porque6: A(e6, "Porque") - ADEL,
  arriba: A(e6, "arriba"),
  directores: A(e6, "directores") - ADEL,
  buscan: A(e6, "buscan") - ADEL,
  y6: A(e6, "podés") - 0.33,
  postularte: A(e6, "postularte") - ADEL,
  ofertas: A(e6, "ofertas"),
  // Cierre
  lo: A(e7, "armó") - 0.27,
  subite: A(e7, "Subite") - 0.15,
  al: A(e7, "ring") - 0.3,
  finVoz: finClip(e7),
  finE6: finClip(e6),
};

const s = crearEstudio(DUR);
const { SECO, MEDIO, SALA, rampa } = s;
const ordenar = (p) => p.sort((a, b) => a[0] - b[0]);

// ── Cama ─────────────────────────────────────────────────────────────────

// Latido de fondo: quieto al principio, se apaga con el problema, vuelve con la solución y se acelera al cierre
s.latidos(T.que + 0.4, T.nadie, () => 58, () => 0.1);
s.latido(T.sostiene + 0.55, 0.2);
s.latido(T.sostiene + 1.4, 0.12);
const desdeCarrera = Math.max(T.lo + 0.4, T.subite - 1.35);
s.latidos(
  T.tres + 0.9,
  desdeCarrera - 0.5,
  (t) => rampa(t, [[T.tres, 64], [T.perdes, 72], [T.buscan, 74], [desdeCarrera, 74]]),
  (t) => rampa(t, [[T.tres, 0.16], [T.perdes, 0.26], [T.buscan, 0.3], [desdeCarrera, 0.3]]),
);
{
  // Antes del golpe: el latido se acelera hasta que no se distinguen los golpes
  let t = desdeCarrera;
  let paso = 0.55;
  while (t < T.subite - 0.2) {
    const x = (t - desdeCarrera) / (T.subite - 0.2 - desdeCarrera);
    s.latido(t, 0.16 + 0.32 * x);
    paso = Math.max(0.2, paso * 0.86);
    t += paso;
  }
}
// Después del golpe: firme y estable, ya no hay miedo
[0.95, 1.92, 2.89].forEach((dt, k) => s.latido(T.subite + dt, 0.3 - k * 0.04));

// Pad: se abre con el cinturón, se cierra con el problema, se abre con la solución y explota al cierre
s.padGrave({
  nivel: (t) =>
    rampa(
      t,
      ordenar([
        [0, 0],
        [T.que, 0.3],
        [T.ring2, 0.6],
        [S(e2) - 0.3, 0.5],
        [S(e2) + 1.0, 0.22],
        [T.sostiene + 0.5, 0.18],
        [T.tres - 0.3, 0.18],
        [T.tres, 0.62],
        [T.campana3, 0.6],
        [T.perdes, 0.68],
        [S(e5), 0.6],
        [S(e6), 0.66],
        [T.y6, 0.72],
        [T.finE6, 0.35],
        [T.subite - 1.0, 0.3],
        [T.subite, 1.0],
        [T.subite + 0.5, 0.85],
        [FIN, 0.4],
        [DUR, 0],
      ]),
    ),
  corte: (t) =>
    rampa(
      t,
      ordenar([
        [0, 380],
        [T.ring2, 900],
        [S(e2) + 0.4, 420],
        [T.sostiene + 0.3, 300],
        [T.sostiene + 1.0, 110],
        [T.tres - 0.05, 110],
        [T.tres, 1100],
        [T.campana3, 1000],
        [T.perdes, 700],
        [S(e5), 900],
        [S(e6), 1300],
        [T.finE6, 200],
        [T.subite - 1.0, 110],
        [T.subite, 3200],
        [FIN, 1200],
      ]),
    ),
  // mi2, si2, mi3 siempre; sol3 entra con "perdés" para el color menor
  voces: [
    [82.41, 1.0, 0],
    [123.47, 0.7, 0],
    [164.81, 0.5, 0],
    [196.0, 0.4, T.perdes - 1.0],
  ],
});

s.aire((t) =>
  rampa(
    t,
    ordenar([
      [0, 0],
      [T.ring2, 0.014],
      [S(e2), 0.014],
      [T.sostiene + 1.2, 0.006],
      [T.subite, 0.014],
      [T.subite + 0.4, 0.06],
      [FIN, 0.03],
      [DUR, 0],
    ]),
  ),
);

// ── Efectos: cada golpe sobre su palabra ─────────────────────────────────

// Round 1 · ¿Qué es Ring Closers?
s.campanaRing(SALA, T.campana1, 0.5);
s.susurro(SECO, T.que, 0.8, -0.2);
s.impacto(SALA, T.ring, 0.42);
s.pina(MEDIO, T.ring, 0.25);
s.susurro(SECO, T.un, 0.8, 0.2);
if (T.ring2 - T.un > 0.2) s.subida(MEDIO, T.un, T.ring2 - 0.02, 0.22);
s.impacto(SALA, T.ring2, 0.6);
s.pina(MEDIO, T.ring2, 0.4);
s.susurro(SECO, T.se1, 0.9, -0.2);
s.brillo(MEDIO, T.entrenan - 4 / FPS, 1.4, 0.4);
s.susurro(SECO, T.entre, 0.9, 0.2);

// Round 2 · ¿Qué problema resuelve?
s.campanaRing(SALA, T.campana2, 0.85);
s.susurro(SECO, T.tit2a, 0.8, -0.2);
s.susurro(SECO, T.tit2b, 0.9, 0.2);
s.susurro(SECO, T.practicar, 0.8, -0.2);
s.perdida(MEDIO, T.frena, 0.4);
s.susurro(SECO, T.y2, 0.8, 0.2);
s.perdida(MEDIO, T.nadie, 0.5);
s.perdida(MEDIO, T.sostiene, 0.7);
s.caida(SALA, T.sostiene - 0.05, 0.55);

// La solución: el esmeralda vuelve
s.susurro(SECO, T.ring3, 0.8, -0.2);
s.subida(MEDIO, T.tres - 0.55, T.tres, 0.3);
s.impacto(SALA, T.tres, 0.5);
s.pina(MEDIO, T.tres, 0.3);
s.susurro(SECO, T.por3, 0.8, 0.2);
T.uno.forEach((t, k) => s.tick(SECO, t, 0.5, [-0.25, 0, 0.25][k]));

// Round 3 · ¿Por qué usarlo?
s.campanaRing(SALA, T.campana3, 0.85);
s.susurro(SECO, T.tit3a, 0.8, -0.2);
s.susurro(SECO, T.tit3b, 0.9, 0.2);
s.susurro(SECO, T.porque4, 0.8, -0.2);
s.susurro(SECO, T.cumplis, 0.8, 0.2);
s.pina(MEDIO, T.subis, 0.25);
// La nota de rango sube sobre el cruce del cinturón, pero no encima de "rango": va en la pausa que sigue
const notaRango = Math.max(T.cruce + 0.05, T.rango + 0.32);
s.recompensa(SALA, notaRango, 0.18);
s.brillo(MEDIO, T.cruce, 0.9, 0.3);
s.susurro(SECO, T.te4, 0.8, -0.2);
s.perdida(MEDIO, T.perdes, 0.8);

s.susurro(SECO, T.porque5, 0.8, -0.2);
s.susurro(SECO, T.tu5, 0.8, 0.2);
[659.26, 783.99, 987.77, 1318.51].forEach((f, k) => s.nota(SALA, T.estrellas + (k * 6) / FPS, f, 0.07));
// Medido: en "real" el impacto y la nota dejaban la voz a +4,7 dB en 1-4 kHz. Más bajo, y la nota después de la palabra
s.impacto(SALA, T.es5, 0.2);
s.pina(MEDIO, T.es5, 0.12);
s.recompensa(SALA, T.real + 0.45, 0.2);

s.susurro(SECO, T.porque6, 0.8, -0.2);
s.brillo(MEDIO, T.arriba - 0.05, 1.2, 0.25);
s.susurro(SECO, T.directores, 0.8, 0.2);
// Medido: "buscan" quedaba tapada (-1,4 dB): impacto y nota más bajos
s.impacto(SALA, T.buscan, 0.14, 1500);
s.pina(MEDIO, T.buscan, 0.1);
s.recompensa(SALA, T.buscan + 0.4, 0.06);
s.susurro(SECO, T.y6, 0.8, -0.2);
s.susurro(SECO, T.postularte, 0.9, 0.2);
s.pina(MEDIO, T.postularte, 0.3);
// Medido: "ofertas" quedaba tapada (-6,2 dB). El clic más bajo y la nota de "postulación enviada" cae cuando termina la palabra
s.recompensa(SALA, T.ofertas + 0.75, 0.16);

// Cierre · "Lo armó un closer. Subite al ring."
s.susurro(SECO, T.lo, 0.8, -0.2);
s.subida(MEDIO, T.subite - 1.0, T.subite, 0.95);
// Medido: "Subite" quedaba tapada (-1,7 dB). El brillo entra cuando termina la palabra y el impacto un poco más bajo
s.impacto(SALA, T.subite, 0.85, 700);
s.pina(MEDIO, T.subite, 0.5);
s.brillo(MEDIO, A(e7, "Subite") + 0.5, 1.4, 0.4);
s.susurro(SECO, T.al, 0.9, 0.2);
// Tres campanadas de ring en el silencio que deja la voz
[0, 0.36, 0.72].forEach((dt, k) => s.campanaRing(SALA, T.finVoz + 0.12 + dt, [1, 0.9, 1][k]));

// ── Salida ───────────────────────────────────────────────────────────────
const sufijo = PRUEBA ? "-prueba" : "";
s.cerrar({
  gSfx: 0.35,
  gCama: 1.47,
  salidaSfx: `public/audio/sfx-que-es-rc${sufijo}.wav`,
  salidaCama: `public/audio/cama-que-es-rc${sufijo}.wav`,
});

const f2 = (x) => x.toFixed(2);
console.log(`sfx y cama de "Qué es Ring Closers"${sufijo}: ${f2(DUR)}s (video ${f2(FIN)}s)`);
console.log(
  "eventos (s): " +
    Object.entries(T)
      .map(([k, v]) => `${k} ${Array.isArray(v) ? v.map(f2).join("/") : f2(v)}`)
      .join(" · "),
);
