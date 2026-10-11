/**
 * Sonido de "Escuchate" (Escuchate-RC, Fathom). Vara: élite (golpes 0,5-1,0; cierre con el golpe más grande).
 * Tema NUEVO: estudio de grabación en La menor. Mientras duele (e1-e3) casi no hay música: dron grave, latido
 * espaciado y clics de cinta; desde que entra la grabadora (e4) arranca el pulso (bombo, hats, arpegio) y en
 * "corregís" la armonía sube a Do mayor. Rebobinado = ráfaga de clics + soplo; cada texto entra tecleado.
 * Uso: node generar-sonido-escuchate.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-escuchate-rc.json", "utf8"));
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
const { SECO, MEDIO, SALA } = s;
const [S2, S3, S4, S5, S6, S7, S8] = ["e2-nadie", "e3-repetis", "e4-mejores", "e5-fathom", "e6-frase", "e7-corregis", "e8-cierre"].map(S);
const W = {
  lo: G("e1-gancho", "lo"), pensar: G("e1-gancho", "pensar"), resp: G("e1-gancho", "respondiste"), exac: G("e1-gancho", "exactamente"),
  acordas: G("e2-nadie", "acordas"), nadie: G("e2-nadie", "nadie"),
  escuchas: G("e3-repetis", "escuchas"), repetis: G("e3-repetis", "repetis"), proxima: G("e3-repetis", "proxima"), llamada: G("e3-repetis", "llamada"),
  mejores: G("e4-mejores", "mejores"), grabadas: G("e4-mejores", "grabadas"),
  fathom: G("e5-fathom", "fathom"), graba: G("e5-fathom", "graba"), guardado: G("e5-fathom", "guardado"), pelea: G("e5-fathom", "pelea"),
  volves: G("e6-frase", "volves"), encontras: G("e6-frase", "encontras"), frase: G("e6-frase", "frase"), fue: G("e6-frase", "fue"),
  corregis: G("e7-corregis", "corregis"), practicando: G("e7-corregis", "practicando"), cliente: G("e7-corregis", "cliente"),
  escuchate: G("e8-cierre", "escuchate"), ring: G("e8-cierre", "ring"),
};
const f2s = (fr) => fr / FPS;
const STRIPS = [W.escuchas, W.repetis, W.proxima].map((t) => t - f2s(2));

// ── teclas elegantes: un texto que entra = ráfaga corta de clics secos, suaves, abiertos en estéreo ──
const teclea = (t, n = 7, niv = 0.065) => {
  for (let j = 0; j < n; j++) s.tick(SECO, t + j * 0.032 + (j % 3) * 0.006, niv * (1 - j * 0.05), (j - (n - 1) / 2) * 0.16);
};

// ── Música ──
const BPM = 100, B = 60 / BPM;
// e1-e3: dron y latido espaciado (casi silencio: la herida)
s.bajo(0.05, S4 - 0.2, 55.0, 0.55);
for (let x = 0.6; x < S4 - 0.3; x += B * 2) s.latido(x, 0.55);
const OSC = [220.0, 261.6, 329.6, 246.9]; // motivo oscuro, muy escaso
for (let x = 1.0, k = 0; x < S4 - 0.3; x += B * 2, k++) s.pluck(x, OSC[k % 4], 0.18, 0.6, k % 2 ? 0.3 : -0.3);
// e4 en adelante: el estudio arranca
const ARP_MEN = [440.0, 523.3, 659.3, 880.0, 659.3, 523.3, 587.3, 493.9];
const ARP_MAY = [523.3, 659.3, 784.0, 1046.5, 784.0, 659.3, 587.3, 784.0];
const RAIZ_MEN = [55.0, 43.65, 65.41, 49.0];
const RAIZ_MAY = [65.41, 49.0, 55.0, 43.65];
const finMusica = W.escuchate - 0.15;
for (let x = S4, k = 0; x < finMusica; x += B / 2, k++) {
  const may = x >= W.corregis - 0.1;
  if (k % 2 === 0) s.bombo(x, k % 8 === 0 ? 1.0 : 0.8);
  else s.hat(x, 0.35);
  if (k % 4 === 2 && x >= S5) s.palma(x, 0.45);
  s.pluck(x, (may ? ARP_MAY : ARP_MEN)[k % 8], may ? 0.32 : 0.26, 0.3, ((k % 4) - 1.5) * 0.2);
  if (k % 8 === 0) s.bajo(x, B * 4, (may ? RAIZ_MAY : RAIZ_MEN)[(k / 8) % 4], 0.62);
}

// ── Efectos ──
// gancho: la onda irrumpe en el cuadro 1
s.impacto(SALA, 0.02, 0.9, 900);
s.pina(MEDIO, 0.02, 0.4);
s.brillo(MEDIO, 0.05, 0.9, 0.16);
teclea(0.08, 6, 0.05); // HUD
teclea(W.lo - 0.12, 8); // la cita del cliente
s.impacto(SALA, W.pensar - 0.06, 0.6, 700);
s.caida(MEDIO, W.resp - 0.05, 0.25); // el cabezal llega al hueco
s.impacto(SALA, W.exac - 0.06, 0.75, 700);
s.perdida(SALA, W.exac + 0.55, 0.35);
teclea(W.exac + 0.1, 9, 0.055); // "TU RESPUESTA · SIN REGISTRO"
// se desarma la memoria
s.impacto(SALA, W.acordas - 0.06, 0.6, 600);
s.susurro(MEDIO, W.acordas, 0.35, -0.2);
for (let j = 0; j < 14; j++) s.tick(SECO, W.acordas + 0.05 + j * 0.05, 0.04, Math.sin(j) * 0.6); // se deshace en granos
s.impacto(SALA, W.nadie - 0.06, 0.55, 600);
for (let k = 0; k < 8; k++) s.tick(SECO, W.nadie + k * 0.05, 0.06, (k % 2 ? 1 : -1) * 0.5); // los fantasmas
// tres llamadas, el mismo error
STRIPS.forEach((t, k) => {
  s.impacto(SALA, t - 0.03, 0.6 + k * 0.1, 700);
  s.pina(MEDIO, t - 0.03, 0.25 + k * 0.05);
});
teclea(W.llamada - 0.05, 9, 0.06);
s.perdida(SALA, W.llamada + 0.45, 0.3);
// la grabadora: el corte a esmeralda
s.subida(MEDIO, S4 - 0.7, S4 - 0.03, 0.25);
s.impacto(SALA, S4 + f2s(1) - 0.03, 0.9, 900);
s.campanaRing(SALA, S4 + 0.2, 0.08);
s.impacto(SALA, W.mejores - 0.06, 0.55, 800);
s.brillo(MEDIO, W.mejores + 0.1, 0.8, 0.14);
teclea(W.grabadas - 0.1, 7);
// Fathom se conecta, se graba, se guarda en la pelea
s.impacto(SALA, W.fathom - 0.12, 0.6, 800);
teclea(W.fathom - 0.05, 7);
s.nota(SALA, W.graba + 0.3, 1046.5, 0.06); // pitido de REC, en la pausa
s.impacto(SALA, W.graba - 0.06, 0.55, 700);
s.subida(MEDIO, W.guardado - 0.6, W.pelea - 0.04, 0.2);
s.impacto(SALA, W.pelea - 0.06, 0.85, 900);
s.recompensa(SALA, W.pelea + 0.35, 0.08);
s.brillo(MEDIO, W.pelea + 0.5, 0.9, 0.16);
// zoom adentro de la pelea y rebobinado
s.susurro(MEDIO, S6 - 0.15, 0.4, 0);
s.impacto(SALA, S6 + f2s(1) - 0.03, 0.7, 800);
for (let x = W.volves, j = 0; x < W.volves + 0.5; x += 0.028, j++) s.tick(SECO, x, 0.05, j % 2 ? 0.35 : -0.35);
s.susurro(MEDIO, W.volves + 0.05, 0.3, 0.3);
for (let x = W.volves + 0.5, j = 0; x < W.encontras; x += 0.07, j++) s.tick(SECO, x, 0.04, j % 2 ? 0.25 : -0.25);
s.impacto(SALA, W.encontras + f2s(4) - 0.03, 0.7, 800);
teclea(W.frase - 0.1, 9); // aparece la frase
s.perdida(SALA, W.fue + 0.35, 0.35);
s.impacto(SALA, W.fue - 0.06, 0.65, 700);
// la corrección
s.subida(MEDIO, W.corregis - 0.6, W.corregis - 0.04, 0.22);
s.impacto(SALA, W.corregis - 0.06, 0.75, 900);
for (let j = 0; j < 6; j++) s.nota(SALA, W.corregis + 0.15 + j * 0.09, [523.3, 659.3, 784.0, 1046.5, 1318.5, 1568.0][j], 0.04);
teclea(W.corregis + 0.15, 9);
s.recompensa(SALA, W.practicando + 0.45, 0.07);
s.impacto(SALA, W.cliente - 0.06, 0.8, 900);
s.brillo(MEDIO, W.cliente + 0.55, 1.0, 0.16);
// cierre: la onda colapsa en una línea, el logo, la palabra, la marca
s.caida(MEDIO, S8 - 0.05, 0.3);
s.impacto(SALA, S8 + f2s(10), 0.7, 800);
s.subida(MEDIO, W.escuchate - 0.8, W.escuchate - 0.08, 0.22);
s.impacto(SALA, W.escuchate - 0.06, 0.8, 900);
teclea(W.ring - 0.12, 10, 0.06);
s.impacto(SALA, W.ring - 0.06, 1.0, 900);
s.pina(MEDIO, W.ring - 0.06, 0.5);
[55.0, 110.0, 164.8, 220.0, 261.6, 329.6].forEach((f, k) => s.pluck(W.ring + 0.02 + k * 0.012, f, 0.5, 2.6, (k - 2.5) * 0.18));
s.bajo(W.ring, 3.4, 55.0, 0.75);
s.campanaRing(SALA, W.ring + 0.5, 0.18);
s.brillo(MEDIO, W.ring + 0.5, 1.5, 0.22);

s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-escuchate-rc.wav", salidaCama: "public/audio/cama-escuchate-rc.wav" });
console.log(`escuchate: ${(FIN + 1.5).toFixed(2)}s`);
