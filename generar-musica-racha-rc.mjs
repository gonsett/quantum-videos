/**
 * Pulso del cuarto video de Ring Closers: "te cuesta subir de nivel".
 *
 * A diferencia de estilos-rc (percusión pareja, sin arco), acá la música
 * cuenta la misma historia que la imagen: casi nada hasta que se enciende
 * la racha, silencio total justo antes del rank-up, y el groove vuelve
 * recién en el cierre. Mi menor, 94 BPM, para compartir familia armónica
 * con el comercial original sin repetir su arreglo.
 *
 *   Gancho/problema      pad grave, casi sin percusión: nadie ve nada
 *   "se ve"               golpe de encendido + arranca el groove
 *   Racha                 piñas en cada semana que cuenta
 *   "interrumpe"           campanita corta: el logro pop
 *   Rank-up                silencio de 0.3s antes de "detiene", después
 *                          el golpe más grande del video + campana grande
 *   Cierre                 vuelve el pad, casi sin percusión
 *   CTA                    groove vuelve y cierra con campana chica
 */
import fs from "fs";
import { SR, Pista, PasaBajos, escribirWav, nota, sino, suave } from "./sintetizador.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-racha-rc.json", "utf8"));
const FPS = tl.fps;
const seg = (c) => c / FPS;
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
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
const ultimo = escena("s7-cta");
const finVoz = seg(ultimo.from + ultimo.clips[0].enEscena + ultimo.clips[0].cuadros);

const T = {
  ve: palabra("s2-problema", "ve"),
  racha: inicio("s3-racha"),
  prende: palabra("s3-racha", "prende"),
  logro: inicio("s4-logro"),
  interrumpe: palabra("s4-logro", "interrumpe"),
  rankup: inicio("s5-rankup"),
  detiene: palabra("s5-rankup", "detiene"),
  rango: palabra("s5-rankup", "rango"),
  cierre: inicio("s6-cierre"),
  cta: inicio("s7-cta"),
  finVoz,
};

const pista = new Pista(DUR);
const idx = (t) => Math.max(0, Math.floor(t * SR));
const ruido = () => Math.random() * 2 - 1;
const BPM = 94;
const NEGRA = 60 / BPM;

// ── Voces de percusión (mismo lenguaje que el resto de Ring Closers) ──────

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

/** Chispa aguda y corta: el pop de un logro, no un impacto. */
const chispa = (t0, nivel) => {
  const parciales = [[1, 1, 9], [2.4, 0.55, 12], [3.9, 0.3, 16]];
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 0.5)); i++) {
    const d = i / SR - t0;
    let v = 0;
    for (const [r, a, caida] of parciales) v += sino(1500 * r * d) * a * Math.exp(-d * caida);
    pista.add(i, v * 0.1 * nivel, 0.2);
  }
};

const campana = (t0, nivel, tono = 900) => {
  const parciales = [[1, 1, 1.8], [2.76, 0.5, 3.2], [5.4, 0.28, 5.2], [8.93, 0.14, 8]];
  for (let i = idx(t0); i < Math.min(pista.n, idx(t0 + 2.0)); i++) {
    const d = i / SR - t0;
    let v = 0;
    for (const [r, a, caida] of parciales) v += sino(tono * r * d) * a * Math.exp(-d * caida);
    v += ruido() * 0.2 * Math.exp(-d * 200);
    pista.add(i, v * 0.13 * nivel * Math.min(1, d / 0.002), 0.1);
  }
};

/** Pad sostenido: los tonos de Mi menor (E-G-B), casi sin ataque. */
const pad = (t0, t1, notas, nivel) => {
  const osc = notas.map(() => ({ fase: 0 }));
  const inicioIdx = idx(t0);
  const finIdx = Math.min(pista.n, idx(t1));
  const attack = 1.2;
  const release = 1.4;
  for (let i = inicioIdx; i < finIdx; i++) {
    const t = i / SR;
    const env =
      Math.min(1, (t - t0) / attack) * Math.min(1, (t1 - t) / release);
    let v = 0;
    notas.forEach((n, k) => {
      osc[k].fase += n / SR;
      v += sino(osc[k].fase) * (k === 0 ? 0.5 : 0.28);
    });
    pista.add(i, v * 0.05 * nivel * Math.max(0, env), 0);
  }
};

// ── Arreglo ─────────────────────────────────────────────────────────────

// Pad grave bajo el gancho y el problema: E2 + B2, casi inaudible — nadie ve nada todavía
pad(0.1, T.ve + 0.05, [nota("E2"), nota("B2")], 0.8);

// Encendido: el groove arranca exactamente en "se ve"
bombo(T.ve, 1);
chispa(T.ve + 0.02, 0.9);

let k = 0;
for (let t = T.ve + NEGRA; t < T.detiene - 0.35; t += NEGRA, k++) {
  const enCierre = t >= T.cierre && t < T.cta;
  const construyendo = t >= T.racha && t < T.logro;
  const nivel = enCierre ? 0.34 : construyendo ? 0.82 : 0.62;
  if (!enCierre || k % 2 === 0) bombo(t, 0.78 * nivel);
  if (!enCierre) {
    for (let s = 0; s < 3; s++) {
      pera(t + (NEGRA / 3) * s, (s === 2 ? 0.26 : 0.14) * nivel, s === 1 ? 0.25 : -0.15);
    }
  }
}

// Piñas de la racha: una por cada semana que cuenta, apenas más fuerte cada vez
[0, 0.55, 1.1, 1.65].forEach((off, i) => pina(T.prende + off, 0.42 + i * 0.08));

// El logro interrumpe: chispa corta, sin tocar el groove de abajo
chispa(T.interrumpe, 0.8);

// Silencio de 0.3s antes del rank-up: el "todo se detiene" se escucha, no solo se ve
// (el loop de arriba ya corta en T.detiene - 0.35, dejando el hueco)

// El golpe más grande del video, y la campana grande confirma el rango
bombo(T.detiene, 1.15);
campana(T.detiene, 1.15, 760);
campana(T.rango, 0.7, 1100); // segunda campana, más aguda: el nombre del rango

// Vuelve el pad en el cierre, casi sin percusión (el loop de arriba ya lo agachó)
pad(T.cierre, T.cta + 0.4, [nota("E2"), nota("G2")], 0.6);

// Cierre: campana chica al terminar la voz, como el resto de la serie
campana(finVoz + 0.15, 0.55, 900);

const pico = escribirWav(pista, "public/audio/cama-racha-rc.wav", 1);
console.log(`cama-racha-rc.wav: ${DUR.toFixed(2)}s (video ${FIN.toFixed(2)}s) · ${BPM} BPM · Mi menor`);
console.log(`pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS · encendido ${T.ve.toFixed(2)}s · rank-up ${T.detiene.toFixed(2)}s`);
