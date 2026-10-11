/**
 * Sonido de "La nota que no podés comprar" (Nota-RC). Vara: élite (golpes 0,5-1,0; cierre con el golpe más grande).
 * Identidad NUEVA: oficina a plena luz, en Re menor que termina en Fa mayor. Foley de papel: el SELLO de goma es el
 * golpe (madera + golpe sordo), la lapicera raspa (ráfagas finas de clics), cada hoja que entra es un soplo de papel.
 * Música: piano punteado y escaso al principio (lo que vos decís de vos), pulso suave desde que el rival puntúa (e3),
 * se apaga en la escena negra y vuelve en mayor con el logo.
 * Uso: node generar-sonido-nota.mjs
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-nota-rc.json", "utf8"));
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
const f2s = (fr) => fr / FPS;
const [S2, S3, S4, S5, S6, S7, S8] = ["e2-otro", "e3-puntua", "e4-nadie", "e5-suma", "e6-director", "e7-entrena", "e8-cierre"].map(S);
const W = {
  tu: G("e1-cv", "tu"), diga: G("e1-cv", "diga"), excelente: G("e1-cv", "excelente"), objeciones: G("e1-cv", "objeciones"),
  no: G("e2-otro", "no"), aca2: G("e2-otro", "aca", 2), otro: G("e2-otro", "otro"),
  enfrente: G("e3-puntua", "enfrente"), puntua: G("e3-puntua", "puntua"), cinco: G("e3-puntua", "cinco"),
  nadie: G("e4-nadie", "nadie"), mismo: G("e4-nadie", "mismo"), forma: G("e4-nadie", "forma"),
  cada: G("e5-suma", "cada"), promedio: G("e5-suma", "promedio"), cv: G("e5-suma", "cv"), cierres: G("e5-suma", "cierres"), trofeos: G("e5-suma", "trofeos"),
  director: G("e6-director", "director"), abre: G("e6-director", "abre"), dijiste: G("e6-director", "dijiste"), dijeron: G("e6-director", "dijeron"),
  nota: G("e7-entrena", "nota"), compra: G("e7-entrena", "compra"), entrena: G("e7-entrena", "entrena"),
  ring: G("e8-cierre", "ring"),
};

// ── foley ──
/** Sello de goma: clic de madera + golpe sordo grave (casi nada en la banda de la voz). */
const sello = (t, niv) => {
  s.impacto(SALA, t - 0.02, niv, 420);
  s.tick(SECO, t - 0.03, 0.09 * niv / 0.6, 0.1);
  s.tick(SECO, t + 0.012, 0.05 * niv / 0.6, -0.1);
};
/** Lapicera: raspado fino (clics muy juntos, paneo que viaja). */
const raspa = (t, largo, niv = 0.035) => {
  for (let x = t, j = 0; x < t + largo; x += 0.018 + (j % 3) * 0.004, j++) s.tick(SECO, x, niv * (0.7 + 0.3 * Math.sin(j * 1.7)), -0.4 + (0.8 * (x - t)) / largo);
};
/** Hoja que entra o sale: soplo de papel + roce. */
const hoja = (t, niv = 0.3, pan = 0) => {
  s.susurro(MEDIO, t, niv, pan);
  s.tick(SECO, t + 0.12, 0.04, pan);
};

// ── Música: Re menor → Fa mayor ──
const BPM = 84, B = 60 / BPM;
const PIANO_MEN = [293.7, 349.2, 440.0, 349.2, 587.3, 440.0, 523.3, 440.0];
const PIANO_MAY = [349.2, 440.0, 523.3, 440.0, 698.5, 523.3, 659.3, 784.0];
const RAIZ_MEN = [73.42, 58.27, 87.31, 65.41]; // Re, Sib, Fa, Do
const RAIZ_MAY = [87.31, 58.27, 73.42, 65.41];
// e1-e2: piano escaso, sin pulso
for (let x = 0.4, k = 0; x < S3 - 0.2; x += B, k++) s.pluck(x, PIANO_MEN[k % 8], 0.2, 0.9, k % 2 ? 0.25 : -0.25);
s.bajo(0.05, S3 - 0.1, 73.42, 0.5);
// e3-e6: pulso suave
const finPulso = S7 - 0.1;
for (let x = S3, k = 0; x < finPulso; x += B / 2, k++) {
  if (k % 4 === 0) s.bombo(x, k % 16 === 0 ? 0.95 : 0.75);
  if (k % 2 === 1) s.hat(x, 0.18);
  if (k % 2 === 0) s.pluck(x, PIANO_MEN[(k / 2) % 8], 0.24, 0.45, (((k / 2) % 4) - 1.5) * 0.2);
  if (k % 8 === 0) s.bajo(x, B * 4, RAIZ_MEN[(k / 8) % 4], 0.6);
}
// e7: casi silencio, solo latido
s.latido(S7 + 0.3, 0.7);
s.latido(S7 + 0.3 + B * 2, 0.6);
// e8: mayor
for (let x = S8 + 0.3, k = 0; x < FIN + 0.8; x += B / 2, k++) s.pluck(x, PIANO_MAY[k % 8], 0.2 * Math.max(0.2, 1 - k / 16), 0.6, ((k % 4) - 1.5) * 0.2);

// ── Efectos ──
// e1: el CV propio
hoja(0.0, 0.35, -0.2);
s.impacto(SALA, 0.03, 0.7, 600);
raspa(W.diga - 0.05, 0.75, 0.03); // dibuja sus propias estrellas
s.impacto(SALA, W.excelente - 0.08, 0.55, 600);
for (let j = 0; j < 22; j++) s.tick(SECO, W.excelente + j * 0.075, 0.03, ((j % 5) - 2) * 0.12); // se escribe el perfil
// e2: tachado y la tarjeta
[0, 1, 2].forEach((k) => raspa(W.no - f2s(6) + f2s(5 * k), 0.24, 0.07));
s.impacto(SALA, W.no - 0.08, 0.75, 700);
hoja(W.aca2 - 0.1, 0.4, -0.4);
s.impacto(SALA, W.aca2 + f2s(10), 0.6, 600);
s.impacto(SALA, W.otro - 0.06, 0.65, 600);
// e3: el rival sella
s.subida(MEDIO, S3 - 0.6, S3 - 0.03, 0.18);
s.impacto(SALA, S3 + 0.02, 0.6, 600);
raspa(W.enfrente - 0.1, 0.3, 0.05); // subrayado
[0, 11, 22, 33].forEach((d, i) => sello(W.puntua + f2s(d), 0.55 + i * 0.08));
s.recompensa(SALA, W.cinco + 0.65, 0.06);
raspa(W.cinco + 0.45, 0.6, 0.025); // comentario
raspa(W.cinco + f2s(30), 0.5, 0.045); // firma
// e4: no podés sellarte
s.impacto(SALA, S4 + 0.02, 0.65, 600);
s.subida(MEDIO, W.nadie, W.mismo - 0.3, 0.16);
s.impacto(SALA, W.mismo - f2s(3), 0.75, 300); // el sello choca
s.tick(SECO, W.mismo - f2s(2), 0.05, 0);
s.perdida(SALA, W.mismo + 0.55, 0.3);
sello(W.forma - f2s(2), 0.7); // la regla estampada
hoja(W.forma + f2s(18), 0.45, -0.6); // la tarjeta vuela
// e5: la pila
s.impacto(SALA, S5 + 0.02, 0.6, 600);
for (let i = 0; i < 12; i++) {
  const t = S5 + f2s(-2 + i * 11 + 9);
  s.impacto(SALA, t - 0.01, 0.32 + (i === 11 ? 0.25 : 0), 380);
  s.tick(SECO, t, 0.05, ((i % 3) - 1) * 0.3);
}
s.brillo(MEDIO, W.promedio + 0.25, 0.8, 0.12);
s.subida(MEDIO, W.cv - 0.7, W.cv - 0.06, 0.2);
s.impacto(SALA, W.cv - 0.06, 0.8, 700);
hoja(W.cv - 0.5, 0.18, 0.3);
s.impacto(SALA, W.cierres - 0.08, 0.5, 600);
s.impacto(SALA, W.trofeos - 0.08, 0.55, 600);
s.recompensa(SALA, W.trofeos + 0.75, 0.06);
// e6: la carpeta
s.impacto(SALA, S6 + 0.02, 0.7, 600);
s.impacto(SALA, W.abre - 0.1, 0.65, 500);
hoja(W.abre - 0.15, 0.5, -0.5);
s.caida(MEDIO, W.dijiste + 0.2, 0.2);
s.subida(MEDIO, W.dijeron - 0.7, W.dijeron - 0.06, 0.2);
s.impacto(SALA, W.dijeron - 0.06, 0.75, 700);
raspa(W.dijeron, 0.7, 0.045); // el círculo de tinta
// e7: la escena negra
s.subida(MEDIO, S7 - 0.9, S7 - 0.05, 0.25);
s.impacto(SALA, W.nota - f2s(3), 0.95, 450);
s.tick(SECO, W.nota - f2s(3), 0.14, 0);
s.impacto(SALA, W.entrena - f2s(2), 0.85, 500);
s.brillo(MEDIO, W.entrena + 0.3, 1.0, 0.14);
// e8: el logo, el golpe más grande
s.caida(MEDIO, S8 - 0.05, 0.25);
s.impacto(SALA, S8 + f2s(6), 0.65, 700);
s.subida(MEDIO, W.ring - 0.8, W.ring - 0.08, 0.24);
s.impacto(SALA, W.ring - 0.06, 1.0, 800);
s.tick(SECO, W.ring - 0.06, 0.15, 0);
[43.65, 87.31, 130.8, 174.6, 220.0, 261.6].forEach((f, k) => s.pluck(W.ring + 0.02 + k * 0.012, f, 0.5, 2.6, (k - 2.5) * 0.18));
s.bajo(W.ring, 3.4, 43.65, 0.75);
s.brillo(MEDIO, W.ring + 0.5, 1.5, 0.2);

s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-nota-rc.wav", salidaCama: "public/audio/cama-nota-rc.wav" });
console.log(`nota: ${(FIN + 1.5).toFixed(2)}s`);
