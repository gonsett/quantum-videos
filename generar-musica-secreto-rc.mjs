/**
 * Música de "Secreto de closer #1". Mismo motor y misma familia sonora que el
 * resto de Ring Closers (bombo seco, piña de cuero, campana chica, colchón
 * grave), sin melodía. Cada golpe cae sobre un momento del texto:
 *
 *   "cada semana"       piña + entra el pulso cuando aparece el cinturón
 *   "sumás"             piña
 *   "perdés puntos"     piña sorda
 *   "se va el rango"    caída grave, el pulso se apaga en dos latidos
 *   "Defendelo"         subida, piña fuerte, campana y el pulso vuelve
 *
 * 84 BPM, todo sintetizado, sin samples. Los tiempos son los cuadros de
 * src/secreto-rc/escenas.tsx a 30 fps.
 */
import { SR, Pista, PasaBajos, escribirWav, sino, suave } from "./sintetizador.mjs";

const FPS = 30;
const f = (cuadro) => cuadro / FPS;
const FIN = f(486);
const DUR = FIN + 1.5;

const T = {
  cada: f(40),
  cinturon: f(50),
  brillo1: f(76),
  sumas: f(172),
  pierdes: f(244),
  rango: f(316),
  riser: f(372),
  enciende: f(388),
  defendelo: f(392),
  brillo2: f(396),
};

const pista = new Pista(DUR);
const idx = (t) => Math.max(0, Math.floor(t * SR));
const ruido = () => Math.random() * 2 - 1;
const NEGRA = 60 / 84;

const rampa = (t, puntos) => {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [t0, v0] = puntos[i];
    const [t1, v1] = puntos[i + 1];
    if (t >= t0 && t <= t1) return v0 + (v1 - v0) * suave(t1 === t0 ? 1 : (t - t0) / (t1 - t0));
  }
  return t < puntos[0][0] ? puntos[0][1] : puntos[puntos.length - 1][1];
};

// ── Sonidos (mismos que generar-musica-rc-v2.mjs) ──────────────────────

const bombo = (t0, nivel) => {
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.34)); i++) {
    const d = i / SR - t0;
    fase += (46 + 100 * Math.exp(-d * 38)) / SR;
    const click = ruido() * 0.18 * Math.exp(-d * 560);
    pista.add(i, (sino(fase) * 0.36 + click) * Math.exp(-d * 11) * nivel, 0);
  }
};

const pina = (t0, nivel) => {
  const lp = new PasaBajos(1700);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.3)); i++) {
    const d = i / SR - t0;
    fase += (60 + 110 * Math.exp(-d * 30)) / SR;
    const cuerpo = sino(fase) * Math.exp(-d * 14) * 0.5;
    const cuero = lp.paso(ruido()) * Math.exp(-d * 75) * 0.55;
    pista.add(i, (cuerpo + cuero) * nivel, 0);
  }
};

const campana = (t0, nivel) => {
  const parciales = [[1, 1, 1.8], [2.76, 0.5, 3.2], [5.4, 0.28, 5.2], [8.93, 0.14, 8]];
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 1.6)); i++) {
    const d = i / SR - t0;
    let v = 0;
    for (const [r, a, caida] of parciales) v += sino(940 * r * d) * a * Math.exp(-d * caida);
    v += ruido() * 0.22 * Math.exp(-d * 200);
    pista.add(i, v * 0.12 * nivel * Math.min(1, d / 0.002), 0.1);
  }
};

const colchon = (nivel) => {
  const lp = new PasaBajos(180);
  let fase = 0;
  const freq = 41.2; // E1
  for (let i = 0; i < pista.n; i++) {
    const t = i / SR;
    fase += freq / SR;
    const onda = sino(fase) + sino(fase * 2.01) * 0.18;
    pista.add(i, lp.paso(onda) * 0.16 * nivel(t), 0);
  }
};

// ── Sonidos propios de esta pieza ────────────────────────────────────────

/** Caída grave: un tono que se hunde, es el "se va el rango". */
const caida = (t0, nivel) => {
  let fase = 0;
  const largo = 0.95;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + largo)); i++) {
    const d = i / SR - t0;
    fase += (38 + 150 * Math.exp(-d * 3.4)) / SR;
    pista.add(i, sino(fase) * Math.exp(-d * 2.6) * 0.42 * nivel * Math.min(1, d / 0.01), 0);
  }
};

/** Ruido agudo que sube y baja en campana: el barrido de luz sobre el metal. */
const brillo = (t0, largo, nivel) => {
  const lp = new PasaBajos(900);
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + largo)); i++) {
    const x = (i / SR - t0) / largo;
    const env = Math.sin(Math.PI * x) ** 2;
    const r = ruido();
    pista.add(i, (r - lp.paso(r)) * env * 0.16 * nivel, -0.2 + 0.4 * x);
  }
};

/** Subida antes del final: ruido que crece hasta el instante en que vuelve la luz. */
const subida = (t0, t1, nivel) => {
  const lp = new PasaBajos(1400);
  for (let i = idx(t0); i < Math.min(pista.n, idx(t1)); i++) {
    const x = (i / SR - t0) / (t1 - t0);
    const r = ruido();
    pista.add(i, (r - lp.paso(r)) * x * x * 0.2 * nivel, 0);
  }
};

// ── Intensidad: sube con el cinturón, se hunde con el rango, vuelve al final ─

const intensidad = (t) =>
  rampa(t, [
    [0, 0.3], [T.cinturon, 0.62], [T.sumas, 0.78], [T.pierdes, 0.72],
    [T.rango, 0.62], [T.rango + 0.9, 0.16], [T.enciende - 0.2, 0.16],
    [T.enciende + 0.4, 1.0], [FIN, 0.7], [DUR, 0],
  ]);

colchon(intensidad);

// Pulso: entra con el cinturón, se apaga con el rango, vuelve al final
let k = 0;
for (let t = T.cinturon; t < FIN - 0.1; t += NEGRA, k++) {
  const enDip = t > T.rango + 0.1 && t < T.enciende - 0.05;
  if (enDip) continue;
  const n = intensidad(t);
  bombo(t, (t >= T.enciende ? 0.8 : 0.55) * n);
}

// Golpes sobre el texto
pina(T.cada, 0.8);
pina(T.sumas, 0.6);
pina(T.pierdes, 0.34);

// "Se va el rango": caída y dos latidos que se apagan
caida(T.rango + 0.05, 1.0);
bombo(T.rango + 0.4, 0.32);
bombo(T.rango + 1.1, 0.2);

// Luz que pasa por el metal
brillo(T.brillo1 - 0.05, 1.5, 0.9);
brillo(T.brillo2 - 0.05, 1.55, 1.15);

// Vuelve la luz: subida, golpe fuerte y campana
subida(T.riser, T.enciende, 1.0);
pina(T.enciende, 1.0);
bombo(T.enciende, 0.9);
campana(T.defendelo, 1.0);

const pico = escribirWav(pista, "public/audio/cama-secreto-rc.wav", 1);
console.log(`cama-secreto-rc.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · 84 BPM · sin melodía`);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS`);
