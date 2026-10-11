/**
 * Pulso del video de estilos de Ring Closers.
 *
 * Más calmo que el del Reel: acá la voz va a velocidad natural y cada guante
 * tiene tiempo de verse, así que la música acompaña en vez de empujar.
 * Sin melodía, percusión seca, 92 BPM.
 *
 *   Presentación de cada estilo  una piña cuando aparece el guante
 *   Contragolpe                  el clic del candado y un impacto en el cuadro
 *                                exacto en que la voz dice "Contendiente"
 *   Noqueador                    un golpe sordo y grave: queda cerrado
 *   "La que te da miedo"         un único golpe profundo
 *   Cierre                       baja, y una campana chica al terminar la voz
 */
import fs from "fs";
import { SR, Pista, PasaBajos, escribirWav, sino, suave } from "./sintetizador.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-estilos-rc.json", "utf8"));
const FPS = tl.fps;
const seg = (c) => c / FPS;
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const palabra = (id, p, vez = 1) => {
  const e = escena(id);
  let n = 0;
  for (const c of e.clips) for (const w of c.palabras) {
    if (norm(w.palabra) === norm(p) && ++n === vez) return seg(e.from + w.cuadro);
  }
  throw new Error(`${p} no está en ${id}`);
};
const inicio = (id) => seg(escena(id).from);

const FIN = seg(tl.total);
const DUR = FIN + 1.2;
const ultimo = escena("e8-cta");
const finVoz = seg(ultimo.from + ultimo.clips[0].enEscena + ultimo.clips[0].cuadros);

// Los mismos cuadros que usan las escenas en src/estilos-rc/escenas.tsx
const T = {
  revelaciones: [
    inicio("e2-guardias"),
    palabra("e2-guardias", "guardia", 2) - seg(3),
    inicio("e3-zurdo"),
    inicio("e4-contragolpe"),
  ],
  desbloqueo: palabra("e4-contragolpe", "contendiente"),
  noqueador: inicio("e5-noqueador"),
  e6: inicio("e6-prueba"),
  e7: inicio("e7-camino"),
  miedo: palabra("e7-camino", "miedo"),
  e8: inicio("e8-cta"),
  finVoz,
};

const pista = new Pista(DUR);
const idx = (t) => Math.max(0, Math.floor(t * SR));
const ruido = () => Math.random() * 2 - 1;
const NEGRA = 60 / 92;

const rampa = (t, puntos) => {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [t0, v0] = puntos[i];
    const [t1, v1] = puntos[i + 1];
    if (t >= t0 && t <= t1) return v0 + (v1 - v0) * suave(t1 === t0 ? 1 : (t - t0) / (t1 - t0));
  }
  return t < puntos[0][0] ? puntos[0][1] : puntos[puntos.length - 1][1];
};

const bombo = (t0, nivel) => {
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.36)); i++) {
    const d = i / SR - t0;
    fase += (44 + 96 * Math.exp(-d * 36)) / SR;
    const click = ruido() * 0.14 * Math.exp(-d * 560);
    pista.add(i, (sino(fase) * 0.36 + click) * Math.exp(-d * 10) * nivel, 0);
  }
};

const pera = (t0, nivel, pan) => {
  const lp = new PasaBajos(2600);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.08)); i++) {
    const d = i / SR - t0;
    fase += (160 + 90 * Math.exp(-d * 90)) / SR;
    const v = sino(fase) * Math.exp(-d * 64) * 0.5 + lp.paso(ruido()) * Math.exp(-d * 120) * 0.6;
    pista.add(i, v * nivel, pan);
  }
};

const pina = (t0, nivel, grave = 1) => {
  const lp = new PasaBajos(1700 / grave);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.34 * grave)); i++) {
    const d = i / SR - t0;
    fase += ((58 + 110 * Math.exp(-d * 30)) / grave) / SR;
    const cuerpo = sino(fase) * Math.exp(-d * (14 / grave)) * 0.5;
    const cuero = lp.paso(ruido()) * Math.exp(-d * 75) * 0.5;
    pista.add(i, (cuerpo + cuero) * nivel, 0);
  }
};

/** Clic metálico del candado: dos transitorios agudos y cortos. */
const clic = (t0, nivel) => {
  [0, 0.045].forEach((off, k) => {
    for (let i = idx(t0 + off); i < Math.min(pista.n, idx(t0 + off + 0.03)); i++) {
      const d = i / SR - t0 - off;
      const v = (sino(3100 * d) * 0.5 + ruido() * 0.5) * Math.exp(-d * 260);
      pista.add(i, v * 0.22 * nivel * (k === 0 ? 1 : 0.7), 0.15);
    }
  });
};

const campana = (t0, nivel) => {
  const parciales = [[1, 1, 1.8], [2.76, 0.5, 3.2], [5.4, 0.28, 5.2], [8.93, 0.14, 8]];
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 1.8)); i++) {
    const d = i / SR - t0;
    let v = 0;
    for (const [r, a, caida] of parciales) v += sino(900 * r * d) * a * Math.exp(-d * caida);
    v += ruido() * 0.2 * Math.exp(-d * 200);
    pista.add(i, v * 0.12 * nivel * Math.min(1, d / 0.002), 0.1);
  }
};

// Sube suave hasta el desbloqueo, se sostiene y baja en el cierre
const intensidad = (t) =>
  rampa(t, [
    [0, 0.5], [T.revelaciones[0], 0.58], [T.desbloqueo, 0.72], [T.e6, 0.7],
    [T.e7, 0.78], [T.e8 - 0.2, 0.74], [T.e8 + 0.4, 0.36], [FIN, 0],
  ]);

let k = 0;
for (let t = 0.05; t < FIN - 0.05; t += NEGRA, k++) {
  const n = intensidad(t);
  const enCierre = t >= T.e8;
  if (!enCierre || k % 2 === 0) bombo(t, 0.75 * n);
  if (!enCierre) {
    for (let s = 0; s < 3; s++) {
      pera(t + (NEGRA / 3) * s, (s === 2 ? 0.26 : 0.14) * n, s === 1 ? 0.25 : -0.15);
    }
  }
}

T.revelaciones.forEach((t) => pina(t, 0.5));
clic(T.desbloqueo - 0.06, 1);
pina(T.desbloqueo + 0.02, 0.62);
pina(T.noqueador, 0.55, 1.6); // sordo y grave: el que queda cerrado
pina(T.miedo, 0.5, 1.4);
campana(T.finVoz + 0.15, 1);

const pico = escribirWav(pista, "public/audio/cama-estilos-rc.wav", 1);
console.log(`cama-estilos-rc.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · 92 BPM · sin melodía`);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS · desbloqueo ${T.desbloqueo.toFixed(2)}s`);
