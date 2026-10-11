/**
 * Sonido de "Lo que dejaste sobre la mesa" (Comision-RC). Vara: élite + pedido de Javier "efectos de película".
 * Identidad NUEVA: nocturno, Do menor, cuerdas graves tipo tráiler (BRAAM: sierras desafinadas con un filtro que se
 * abre y se cierra) y foley de ORO: cada moneda es un disco de metal (parciales inarmónicos 1 / 2,76 / 5,40 / 8,93),
 * las que caen tienen retumbe grave, la que gira en la escena negra se apaga con los rebotes cada vez más juntos.
 * Música: pluck escaso en el chat, pulso tenso desde la mesa, silencio cuando "se fue", latido en la llamada y en el
 * negro, pulso con impulso en el roleplay, se resuelve en Mi bemol mayor con el número nuevo y el logo.
 * Los sonidos agudos (monedas, brillos) van en las pausas de la voz; los golpes en las palabras son casi todo grave.
 * Uso: node generar-sonido-comision.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";
import { SR, PasaBajos, sierra, sino } from "./sintetizador.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-comision-rc.json", "utf8"));
if (tl._borrador) throw new Error("timeline borrador");
const FPS = tl.fps;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const S = (id) => escena(id).from / FPS;
const G = (id, p, vez = 1) => {
  let n = 0;
  for (const c of escena(id).clips) for (const w of c.palabras) if (norm(w.palabra) === norm(p) && ++n === vez) return (escena(id).from + w.cuadro) / FPS;
  throw new Error(`"${p}" no está en ${id}`);
};
const FIN = tl.total / FPS;
const s = crearEstudio(FIN + 1.5);
const { SECO, MEDIO, SALA, MUSICA, emitir, idx, ruido } = s;
const N = s.largo();
const f2s = (fr) => fr / FPS;
const [S1, S2, S3, S4, S5, S6, S7, S8, S9] = ["e1-grupo", "e2-record", "e3-mesa", "e4-objeciones", "e5-venta", "e6-antes", "e7-ring", "e8-otro", "e9-cierre"].map(S);
const W = {
  comisionaste: G("e1-grupo", "comisionaste"), felicitan: G("e2-record", "felicitan"), record: G("e2-record", "record"),
  nadie: G("e3-mesa", "nadie"), cuanto: G("e3-mesa", "cuanto"), mesa: G("e3-mesa", "mesa"),
  pensar: G("e4-objeciones", "pensar"), caro: G("e4-objeciones", "caro"), pareja: G("e4-objeciones", "pareja"),
  venta: G("e5-venta", "venta"), fue: G("e5-venta", "fue"),
  llamada: G("e6-antes", "llamada"), plata: G("e6-antes", "plata"), entrenan: G("e6-antes", "entrenan"), antes: G("e6-antes", "antes"),
  ring7: G("e7-ring", "ring"), tira: G("e7-ring", "tira"), roleplay: G("e7-ring", "roleplay"), respondes: G("e7-ring", "respondes"),
  equivocas: G("e7-ring", "equivocas"), puntua: G("e7-ring", "puntua"),
  numero: G("e8-otro", "numero"), otro: G("e8-otro", "otro"), ring: G("e9-cierre", "ring"),
};
const NEGRO = W.entrenan - f2s(3);

// ── sonidos propios ──
/** BRAAM de tráiler: cuatro sierras desafinadas + sub, el filtro se abre de golpe y se cierra lento. */
const braam = (t0, niv, f = 55, largo = 2.4, pico = 1300) => {
  const lp = new PasaBajos(200), fs_ = [f, f * 1.006, f * 0.994, f * 2.003], ph = fs_.map(() => 0);
  let sub = 0;
  for (let i = idx(t0); i < Math.min(N, idx(t0 + largo + 0.3)); i++) {
    const d = i / SR - t0;
    const env = Math.min(1, d / 0.05) * Math.exp(-Math.max(0, d - 0.25) * (2.6 / largo));
    if (i % 64 === 0) lp.setCorte(160 + pico * Math.min(1, d / 0.12) * Math.exp(-d * 2.2));
    let v = 0;
    fs_.forEach((fr, k) => { ph[k] += fr / SR; v += sierra(ph[k], fr, 12) * (k === 3 ? 0.35 : 1); });
    sub += f / SR;
    const x = Math.tanh(lp.paso(v * 0.5) * 1.6) * 0.6 + sino(sub) * 0.55;
    emitir(SALA, i, x * env * niv, 0);
  }
};
/** Moneda de oro que suena: disco de metal, parciales inarmónicos con decaimientos distintos. */
const PARC = [[1, 1, 0.55], [2.76, 0.6, 0.35], [5.4, 0.35, 0.18], [8.93, 0.2, 0.1]];
const clink = (t0, niv, pan = 0, base = 1650) => {
  const b = base * (0.97 + 0.06 * Math.abs(ruido()));
  for (let i = idx(t0); i < Math.min(N, idx(t0 + 0.7)); i++) {
    const d = i / SR - t0;
    let v = 0;
    for (const [r, g, dec] of PARC) v += Math.sin(2 * Math.PI * b * r * d) * g * Math.exp(-d / dec);
    v += d < 0.004 ? ruido() * 0.6 : 0; // el contacto
    emitir(MEDIO, i, v * niv * Math.min(1, d / 0.0015), pan);
  }
};
/** Moneda que gira y se apaga sobre el vidrio: rebotes cada vez más juntos y más suaves. */
const girar = (t0, largo, niv, pan = 0) => {
  for (let x = t0, k = 0, paso = 0.16; x < t0 + largo && paso > 0.012; k++) {
    clink(x, niv * (0.5 + 0.5 * Math.exp(-k / 14)), pan + Math.sin(k * 0.7) * 0.15, 2100);
    x += paso; paso *= 0.93;
  }
};
/** Retumbe: ruido por un pasabajos muy cerrado (la mesa que vibra). */
const retumbe = (t0, niv, largo = 1.2, corte = 90) => {
  const lp = new PasaBajos(corte), lp2 = new PasaBajos(corte);
  for (let i = idx(t0); i < Math.min(N, idx(t0 + largo)); i++) {
    const d = i / SR - t0;
    emitir(SALA, i, lp2.paso(lp.paso(ruido())) * 6 * niv * Math.min(1, d / 0.02) * Math.exp(-d * (3 / largo)), 0);
  }
};
/** Una moneda grabada que cae de la mesa: aire, golpe grave al pegar, retumbe y un par de rebotes metálicos. */
const caeMoneda = (tCae, niv, pan) => {
  s.susurro(MEDIO, tCae, 0.22, pan);
  const golpe = tCae + f2s(6);
  s.impacto(SALA, golpe - 0.02, niv, 320);
  retumbe(golpe, 0.55 * niv, 1.3);
  clink(golpe + 0.02, 0.07, pan, 1400);
};

// ── Música: Do menor → Mi bemol mayor, 76 bpm ──
const BPM = 76, B = 60 / BPM;
const MOTIVO = [261.6, 311.1, 392.0, 311.1, 466.2, 392.0, 311.1, 293.7];
const MAYOR = [311.1, 392.0, 466.2, 392.0, 622.3, 466.2, 523.3, 587.3];
const RAIZ = [65.41, 51.91, 77.78, 58.27]; // Do, Lab, Mib, Sib
s.padGrave({
  nivel: (t) => (t > NEGRO - 0.3 && t < S7 - 0.2 ? 0.15 : t > W.fue && t < S6 ? 0.4 : 1) * Math.min(1, t / 1.2),
  corte: (t) => (t < S3 ? 380 : t < S5 ? 650 : t < S7 ? 320 : t < S8 ? 900 : 1300),
  voces: [[65.41, 0.8, 0], [98.0, 0.45, 0], [155.6, 0.3, S3], [233.1, 0.18, S7]],
});
// e1-e2: el chat, pluck escaso
for (let x = 0.5, k = 0; x < S3 - 0.3; x += B, k++) s.pluck(x, MOTIVO[k % 8], 0.17, 0.9, k % 2 ? 0.3 : -0.3);
// e3-e5: pulso tenso hasta que "se fue"
for (let x = S3, k = 0; x < W.fue - 0.05; x += B / 2, k++) {
  if (k % 4 === 0) s.bombo(x, k % 16 === 0 ? 0.95 : 0.7);
  if (k % 2 === 1) s.hat(x, 0.14);
  if (k % 2 === 0) s.pluck(x, MOTIVO[(k / 2) % 8], 0.2, 0.4, (((k / 2) % 4) - 1.5) * 0.2);
  if (k % 8 === 0) s.bajo(x, B * 4, RAIZ[(k / 8) % 4], 0.6);
}
// e6: la llamada (latido) y la escena negra (casi nada)
s.latidos(S6 + 0.2, NEGRO + 1.6, (t) => (t < NEGRO ? 72 : 60), (t) => (t < NEGRO ? 0.5 : 0.7));
// e7: el roleplay, pulso con impulso
for (let x = S7 + 0.05, k = 0; x < S8 - 0.1; x += B / 4, k++) {
  if (k % 8 === 0) s.bombo(x, k % 32 === 0 ? 1 : 0.8);
  if (k % 8 === 4) s.palma(x, 0.22);
  if (k % 2 === 1) s.hat(x, 0.1);
  if (k % 4 === 0) s.pluck(x, MOTIVO[(k / 4) % 8] * 2, 0.13, 0.25, (((k / 4) % 4) - 1.5) * 0.25);
  if (k % 16 === 0) s.bajo(x, B * 4, RAIZ[(k / 16) % 4], 0.65);
}
// e8: el número nuevo, mayor
for (let x = S8 + 0.1, k = 0; x < S9 - 0.1; x += B / 2, k++) {
  s.pluck(x, MAYOR[k % 8], 0.18, 0.5, ((k % 4) - 1.5) * 0.2);
  if (k % 4 === 0) s.bombo(x, 0.7);
  if (k % 8 === 0) s.bajo(x, B * 4, [77.78, 58.27][(k / 8) % 2], 0.55);
}

// ── Efectos ──
// e1: el mensaje sale
s.impacto(SALA, 0.02, 0.55, 500);
braam(0.0, 0.18, 32.7, 3.2, 500);
s.subida(MEDIO, W.comisionaste - 0.7, W.comisionaste - 0.06, 0.16);
s.impacto(SALA, W.comisionaste - 0.05, 0.6, 600);
s.tick(SECO, W.comisionaste + 0.02, 0.06, 0.2);
s.brillo(MEDIO, W.comisionaste + 0.45, 0.7, 0.08);
// e2: reacciones y récord
s.impacto(SALA, S2 + 0.02, 0.5, 500);
for (let k = 0; k < 5; k++) s.tick(SECO, W.felicitan - f2s(2) + f2s(4 * k), 0.05, -0.3 + k * 0.15);
s.impacto(SALA, W.record - f2s(6) - 0.05, 0.6, 600);
s.recompensa(SALA, W.record + 0.55, 0.05);
// e3: se abre la mesa — el BRAAM
s.caida(MEDIO, W.nadie - 0.1, 0.18);
s.subida(MEDIO, W.mesa - 0.9, W.mesa - 0.08, 0.22);
s.impacto(SALA, W.mesa - 0.06, 0.85, 500);
braam(W.mesa - 0.06, 0.5, 32.7, 3.0);
s.brillo(MEDIO, W.mesa + 0.45, 1.0, 0.1);
[0, 0.21, 0.33].forEach((d, k) => clink(W.mesa + 0.55 + d, 0.06, -0.4 + k * 0.4));
// e4: tres objeciones que caen
s.impacto(SALA, S4 + 0.02, 0.55, 450);
const caidas = [[W.pensar, -0.35], [W.caro, 0], [W.pareja, 0.35]];
caidas.forEach(([t, pan], k) => {
  clink(t - 0.18, 0.05, pan, 1900); // la moneda brilla al nombrarla
  caeMoneda(t + f2s(8), 0.55 + k * 0.08, pan);
});
// e5: se va todo
s.subida(MEDIO, W.venta - 0.5, W.venta - 0.06, 0.14);
s.impacto(SALA, W.venta - 0.06, 0.55, 450);
s.susurro(SALA, W.fue - 0.1, 0.45, 0);
s.impacto(SALA, W.fue + f2s(4) - 0.03, 0.75, 350);
s.perdida(SALA, W.fue + 0.3, 0.35);
retumbe(W.fue + f2s(4), 0.7, 2.2, 70);
// e6: la llamada que vale plata, y el negro
s.impacto(SALA, S6 + 0.02, 0.55, 500);
// el celular vibra sobre el vidrio: ráfagas de 18 cuadros cada 42 (igual que la imagen), grave y con traqueteo
const vibra = (t0, largo, niv) => {
  const lp = new PasaBajos(420);
  for (let i = idx(t0); i < Math.min(N, idx(t0 + largo)); i++) {
    const d = i / SR - t0, env = Math.min(1, d / 0.02, (largo - d) / 0.03);
    const v = Math.sign(Math.sin(2 * Math.PI * 152 * d)) * (0.75 + 0.25 * Math.sin(2 * Math.PI * 23 * d));
    emitir(SECO, i, lp.paso(v) * env * niv, 0);
  }
};
for (let k = 0; S6 + f2s(42 * k) < W.plata + f2s(10); k++) vibra(S6 + f2s(42 * k), Math.min(f2s(18), W.plata + f2s(10) - (S6 + f2s(42 * k))), 0.09);
s.perdida(SALA, W.plata + f2s(12), 0.25); // se corta: llamada perdida
s.impacto(SALA, W.plata - 0.06, 0.6, 450);
s.subida(MEDIO, NEGRO - 1.0, NEGRO - 0.05, 0.28); // succión hacia el negro
s.impacto(SALA, NEGRO - 0.02, 0.95, 400);
braam(NEGRO - 0.02, 0.55, 27.5, 2.6, 900);
girar(NEGRO + 0.45, 3.2, 0.06, 0);
s.brillo(MEDIO, W.antes + 0.35, 1.2, 0.12);
// e7: el roleplay
s.impacto(SALA, S7 + 0.02, 0.75, 600);
s.subida(MEDIO, W.tira - 0.5, W.tira - 0.06, 0.12);
// el rival desliza tres monedas por el vidrio (llegan a los 20 cuadros y frenan)
[0, 7, 14].forEach((d, k) => { s.susurro(MEDIO, W.tira - f2s(6) + f2s(d), 0.2, 0.3 - k * 0.3); clink(W.tira + f2s(d + 12), 0.05, (k - 1) * 0.5, 1800 + k * 120); });
s.impacto(SALA, W.respondes - 0.05, 0.55, 500);
s.susurro(MEDIO, W.respondes + f2s(4), 0.18, -0.4);
clink(W.respondes + f2s(20), 0.08, -0.5, 1500); s.tick(SECO, W.respondes + f2s(20), 0.06, -0.5); // cae en tu pila
s.impacto(SALA, W.equivocas - 0.06, 0.5, 300);
s.susurro(MEDIO, W.equivocas + f2s(16), 0.2, 0.6); // se va de la mesa
s.caida(MEDIO, W.equivocas + f2s(30), 0.16);
clink(W.puntua - f2s(4), 0.07, -0.5, 1550); s.tick(SECO, W.puntua - f2s(4), 0.05, -0.5);
s.subida(MEDIO, W.puntua - 0.7, W.puntua - 0.06, 0.2);
for (let k = 0; k < 4; k++) { s.impacto(SALA, W.puntua + f2s(5 * k + 6) - 0.03, 0.5 + k * 0.06, 400); clink(W.puntua + f2s(5 * k + 6), 0.05, -0.6 + k * 0.3, 1900 + k * 90); } // cuatro estrellas que estampan
s.recompensa(SALA, W.puntua + f2s(22), 0.06);
// e8: el número es otro
s.impacto(SALA, S8 + 0.02, 0.55, 500);
s.subida(MEDIO, W.numero - 0.6, W.numero - 0.06, 0.2);
s.impacto(SALA, W.numero - 0.05, 0.7, 600);
for (let k = 0; k < 5; k++) s.tick(SECO, W.numero + f2s(8 + 4 * k), 0.05, -0.3 + k * 0.15);
s.brillo(MEDIO, W.otro + 0.4, 0.9, 0.1);
[0, 0.09, 0.2, 0.26, 0.38].forEach((d, k) => clink(W.otro + 0.45 + d, 0.05, -0.5 + k * 0.25, 1600 + k * 90)); // el oro vuelve
// e9: el logo — el golpe más grande
s.caida(MEDIO, S9 - 0.05, 0.22);
s.subida(MEDIO, W.ring - 1.0, W.ring - 0.08, 0.28);
s.impacto(SALA, W.ring - 0.06, 1.0, 800);
braam(W.ring - 0.06, 0.7, 38.89, 3.6, 1600); // Mi bemol
retumbe(W.ring - 0.04, 0.5, 2.5, 80);
[38.89, 77.78, 116.5, 155.6, 196.0, 233.1].forEach((f, k) => s.pluck(W.ring + 0.02 + k * 0.014, f, 0.45, 2.8, (k - 2.5) * 0.18));
s.bajo(W.ring, 3.6, 38.89, 0.75);
s.brillo(MEDIO, W.ring + 0.6, 1.6, 0.16);
clink(W.ring + 1.1, 0.06, 0.3, 2300);

s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-comision-rc.wav", salidaCama: "public/audio/cama-comision-rc.wav" });
console.log(`comision: ${(FIN + 1.5).toFixed(2)}s`);
