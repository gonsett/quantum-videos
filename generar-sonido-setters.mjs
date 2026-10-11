/**
 * Sonido de "Señal detectada" COMPLETO (Ring Setters, 03/10/2026). Misma identidad que la muestra aprobada:
 * centro de mando en La menor, PING de sonar como firma, dron que se abre, pulso a 120 bpm.
 * Acto 1 = la muestra, anclada a la voz. Actos 2-4: groove Am–F–C–G anclado al corte de e04, golpe grave en
 * cada corte de escena (caen en el silencio entre tomas), foley propio de cada objeto (pings, ticks, monedas,
 * barridos), corte de música medio segundo antes de "Ahora" y el golpe más grande en "abierto".
 * Lee timeline-setters-rc.json. Uso: node generar-sonido-setters.mjs [--prueba]
 */
import fs from "fs";
import { crearEstudio } from "./sonidos-rc.mjs";
import { SR, PasaBajos, sierra, sino } from "./sintetizador.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-setters-rc.json", "utf8"));
if (tl._borrador && !process.argv.includes("--prueba")) throw new Error("timeline borrador: correr montaje --whisper o pasar --prueba");
const FPS = 30;
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ]/g, "");
const E = (id) => tl.escenas.find((x) => x.id === id);
const INI = (id) => E(id).from / FPS;
const FIN = (id) => (E(id).from + E(id).durationInFrames) / FPS;
const G = (id, p, vez = 1) => {
  let n = 0;
  for (const cl of E(id).clips) for (const w of cl.palabras) if (norm(w.palabra) === norm(p) && ++n === vez) return (E(id).from + w.cuadro) / FPS;
  throw new Error(`${p} no está en ${id}`);
};
const S = (fr) => fr / FPS;

const DUR = tl.total / FPS + 0.3;
const s = crearEstudio(DUR);
const { SECO, MEDIO, SALA, MUSICA, emitir, idx } = s;
const N = s.largo();
/** Foley agudo (pings, ticks, monedas, brillos, chispas): va a su propia capa, que `duck-foley-setters.py` agacha con la voz.
 * Es la banda 1-4 kHz, la que decide si se entiende; los golpes graves quedan en `s` sin tocar. */
const h = crearEstudio(DUR);

const ping = (t0, niv, f = 1320, largo = 1.6, pan = 0) => {
  let fase = 0;
  for (let i = h.idx(t0); i < Math.min(N, h.idx(t0 + largo)); i++) {
    const d = i / SR - t0;
    const fr = f * (1 + 0.04 * Math.exp(-d * 30));
    fase += fr / SR;
    const v = (sino(fase) + 0.18 * sino(fase * 2.01) * Math.exp(-d * 6)) * Math.min(1, d / 0.002) * Math.exp(-d * (3.2 / largo));
    h.emitir(h.SALA, i, v * niv, pan);
  }
};
const dron = (t0, t1, f, niv, abre = 900, cierra = 0.08) => {
  const lp = new PasaBajos(120);
  let a = 0, b = 0, sub = 0;
  for (let i = idx(t0); i < Math.min(N, idx(t1)); i++) {
    const d = i / SR - t0;
    const q = d / (t1 - t0);
    if (i % 64 === 0) lp.setCorte(120 + abre * Math.min(1, q * q * 1.4));
    a += f / SR; b += (f * 1.007) / SR; sub += f / 2 / SR;
    const env = Math.min(1, d / 0.4) * Math.min(1, (t1 - i / SR) / cierra);
    emitir(MUSICA, i, (lp.paso((sierra(a, f, 10) + sierra(b, f * 1.007, 10)) * 0.5) * 0.8 + sino(sub) * 0.5) * env * niv, 0);
  }
};
/** Moneda que cae y suena: tintineo metálico de dos parciales inarmónicos. */
const moneda = (t0, niv, f = 2400, pan = 0) => {
  let a = 0, b = 0;
  for (let i = h.idx(t0); i < Math.min(N, h.idx(t0 + 0.5)); i++) {
    const d = i / SR - t0;
    a += f / SR; b += (f * 2.76) / SR;
    h.emitir(h.MEDIO, i, (sino(a) * 0.7 + sino(b) * 0.3 * Math.exp(-d * 18)) * Math.exp(-d * 9) * Math.min(1, d / 0.001) * niv, pan);
  }
};

/* ───── ACTO 1: la muestra, anclada a la voz ───── */
const on = S(12);
const tCl = G("e01", "closers") - 0.1;
const tCi = G("e02", "cierre") - 0.1;
const T = G("e03", "alguien") - 0.1;
const M = G("e03", "Ring") - 0.1;
ping(S(3), 0.55, 1320, 2.2);
s.impacto(SALA, S(3) - 0.01, 0.35, 300);
dron(on, M - 0.35, 55, 0.45, 1100);
s.subida(MEDIO, on + 0.1, on + 1, 0.1);
[0, 5, 10, 15].forEach((fr, k) => h.tick(SECO, on + S(2 + fr), 0.12, -0.3 + k * 0.2));
s.susurro(MEDIO, on + 0.4, 0.08, -0.3);
// los closers: un ping platino por punto
for (let k = 0; k < 13; k++) ping(tCl + k * S(1.6), 0.05, 1975 + (k % 3) * 220, 0.5, -0.6 + (k % 5) * 0.3);
s.impacto(SALA, tCl - 0.06, 0.5, 400);
// "cierre": golpe sordo y el dron se apaga un poco (los closers se atenúan)
s.nota(MEDIO, tCi + 0.25, 110, 0.18);
s.impacto(SALA, tCi - 0.06, 0.45, 300);
// pulso a 120 bpm desde el corte de e02 hasta la marca, anclado a la detección
for (let t = T - 0.5 * Math.floor((T - INI("e02")) / 0.5); t < M - 0.3; t += 0.5) {
  const k = Math.round((t - T) / 0.5);
  if (Math.abs(t - T) < 0.01) continue;
  s.bombo(t, 0.5);
  s.hat(t + 0.25, 0.1);
  s.bajo(t, 0.22, k % 2 ? 55 : 82.41, 0.42);
}
[0.6, 1.1].forEach((d, k) => ping(T - d, 0.05, [1760, 1568][k], 0.6, k ? -0.5 : 0.4));
s.subida(MEDIO, T - 0.55, T - 0.05, 0.18);
s.impacto(SALA, T - 0.04, 0.78, 700);
ping(T, 0.32, 1760, 1.8, 0.35);
ping(T + 0.09, 0.12, 2637, 1.0, 0.35);
h.chisporroteo(SECO, T + 0.02, 0.14, 0.22, 14);
for (let k = 0; k < 15; k++) h.tick(SECO, T + S(8) + k * (S(14) / 15), 0.045, 0.4);
s.caida(MEDIO, M - 0.4, 0.12);
s.subida(MEDIO, M - 0.45, M - 0.03, 0.3);
s.impacto(SALA, M - 0.05, 1.0, 900);
s.impacto(SALA, M + 0.02, 0.45, 300);
s.bajo(M, 1.4, 55, 0.85);
dron(M, INI("e04"), 110, 0.3, 1600, 0.25);
[220, 261.6, 329.6, 440].forEach((f, k) => s.pluck(M + 0.03 + k * 0.05, f, 0.22, 1.6, (k - 1.5) * 0.3));
ping(M + 0.02, 0.28, 880, 2.4, 0);
h.brillo(MEDIO, M + 0.15, 1.2, 0.14);
h.chisporroteo(SECO, M + 0.1, 0.2, 0.6, 26);

/* ───── ACTOS 2-4: groove ───── */
const g0 = INI("e04");
const tAhora = G("e15", "Ahora");
const corteMusica = tAhora - 0.55;
const tSuyo = G("e15", "suyo") - 0.08;
const ACORDES = [
  { bajo: 55, notas: [220, 261.6, 329.6] }, // Am
  { bajo: 43.65, notas: [174.6, 220, 261.6] }, // F
  { bajo: 65.41, notas: [196, 261.6, 329.6] }, // C
  { bajo: 49, notas: [196, 246.9, 293.7] }, // G
];
const groove = (desde, hasta, intens = 1) => {
  for (let k = 0; ; k++) {
    const t = desde + k * 0.5;
    if (t >= hasta - 0.05) break;
    const compas = Math.floor(k / 4);
    const ac = ACORDES[compas % 4];
    const tiempo = k % 4;
    s.bombo(t, tiempo === 0 ? 0.55 * intens : 0.4 * intens);
    s.hat(t + 0.25, 0.09 * intens, tiempo === 3);
    if (k % 2 === 0) s.hat(t + 0.125, 0.04 * intens);
    s.bajo(t, 0.4, tiempo === 3 ? ac.bajo * 1.5 : ac.bajo, 0.4 * intens);
    if (tiempo === 2) s.palma(t, 0.16 * intens);
    // arpegio de pulsos cortos, cada dos compases
    if (compas % 2 === 1) ac.notas.forEach((f, j) => s.pluck(t + j * 0.125, f * 2, 0.045 * intens, 0.35, (j - 1) * 0.4));
  }
  // colchón: dron por acorde
  for (let t = desde, c = 0; t < hasta - 0.1; t += 2, c++) dron(t, Math.min(hasta, t + 2.05), ACORDES[c % 4].bajo * 2, 0.16 * intens, 700, 0.05);
};
groove(g0, corteMusica, 1);

// corte de cada escena: barrido corto + golpe grave en el silencio entre tomas
["e04", "e05", "e06", "e07", "e08", "e09", "e10", "e11", "e12", "e13", "e14", "e15", "e16"].forEach((id, k) => {
  const t = INI(id);
  s.subida(MEDIO, t - 0.32, t - 0.02, 0.12);
  s.impacto(SALA, t - 0.03, id === "e15" || id === "e16" ? 0.4 : 0.58, 380);
  s.susurro(MEDIO, t + 0.02, 0.06, k % 2 ? 0.4 : -0.4);
});

// e04: un ping por onda del teléfono
{
  const d = G("e04", "llamadas") - S(4);
  for (let k = 0; k < 8; k++) ping(d + k * S(18), 0.08 - k * 0.006, 1320, 0.9, (k % 2 ? 0.3 : -0.3));
  s.impacto(SALA, G("e04", "semanas") - 0.12, 0.3, 300);
}
// e05: el dial se dibuja (ticks), el compañero gira y TRABA
{
  const i = INI("e05");
  for (let k = 0; k < 12; k++) h.tick(SECO, i + 0.1 + k * 0.04, 0.05, -0.5 + k * 0.08);
  s.susurro(MEDIO, G("e05", "acomoda") - 0.3, 0.1, 0.3);
  const ok = G("e05", "aparecés") - S(3);
  s.impacto(SALA, ok - 0.03, 0.62, 350);
  h.tick(SECO, ok, 0.25, 0);
  ping(ok + 0.02, 0.2, 1760, 1.4, 0);
  ping(ok + 0.1, 0.08, 2637, 0.8, 0.2);
}
// e06: dos notificaciones
["proponen", "recuerda"].forEach((p, k) => {
  const t = G("e06", p) - S(4);
  ping(t, 0.14, 1568, 0.7, 0.2);
  ping(t + 0.11, 0.14, 2093, 0.9, 0.2);
  s.impacto(SALA, t - 0.03, 0.5, 300);
});
// e07: la placa se enciende con "verdad"
{
  const v = G("e07", "verdad") - S(2);
  s.subida(MEDIO, v - 0.6, v - 0.04, 0.16);
  s.impacto(SALA, v - 0.05, 0.8, 500);
  s.bajo(v, 0.9, 55, 0.6);
  h.brillo(MEDIO, v + 0.05, 1.0, 0.12);
  h.chisporroteo(SECO, v + 0.05, 0.14, 0.5, 20);
  ping(v + 0.02, 0.16, 1318.5, 1.6, -0.2);
}
// e08: contadores que ruedan
["tasa", "show"].forEach((p, k) => {
  const t = G("e08", p) - S(2);
  for (let j = 0; j < 16; j++) h.tick(SECO, t + j * S(2) * (1 + j * 0.06), 0.06 - j * 0.002, k ? 0.4 : -0.4);
  s.impacto(SALA, t - 0.03, 0.5, 300);
  ping(t + 1.15, 0.1, k ? 1760 : 1568, 0.8, k ? 0.4 : -0.4);
});
// e09: la grabación corre (susurro largo) y aparecen las marcas
{
  s.susurro(MEDIO, G("e09", "grabación") - 0.1, 0.09, 0);
  s.impacto(SALA, G("e09", "Fathom") - 0.08, 0.52, 300);
  for (let k = 0; k < 3; k++) ping(G("e09", "repasás") - S(4) + k * S(5), 0.1, [1760, 1975, 2349][k], 0.7, -0.4 + k * 0.4);
}
// e10: monedas
{
  const base = G("e10", "cita") - S(4);
  const cada = Math.max(4, Math.round(((G("e10", "créditos") - G("e10", "cita")) * FPS + 10) / 7));
  for (let k = 0; k < 7; k++) {
    const t = base + S(16 + k * cada);
    moneda(t, 0.2, 2400 + k * 140, (k % 3 - 1) * 0.4);
    moneda(t + 0.06, 0.08, 3100 + k * 90, (k % 3 - 1) * 0.4);
    h.tick(SECO, t, 0.14, 0);
    if (k === 6) s.impacto(SALA, t - 0.03, 0.55, 300);
  }
}
// e11: carrusel que gira, brillo en "colores"
{
  s.susurro(MEDIO, INI("e11") + 0.2, 0.1, -0.5);
  s.susurro(MEDIO, INI("e11") + 1.4, 0.08, 0.5);
  s.impacto(SALA, G("e11", "colores") - 0.08, 0.5, 300);
  h.brillo(MEDIO, G("e11", "colores"), 0.9, 0.1);
}
// e12: subís en la tabla (un tick por puesto) y los trofeos
{
  const a = G("e12", "tabla") - S(4);
  const b = G("e12", "comunidad") + S(8);
  for (let k = 1; k <= 4; k++) { h.tick(SECO, a + ((b - a) * k) / 4.4, 0.16, 0.2); ping(a + ((b - a) * k) / 4.4, 0.05, 1320 + k * 220, 0.4, 0.2); }
  const t = G("e12", "trofeos") - S(6);
  s.impacto(SALA, t - 0.04, 0.7, 450);
  h.brillo(MEDIO, t + 0.1, 0.9, 0.12);
  h.chisporroteo(SECO, t + 0.1, 0.12, 0.45, 18);
}
// e13: el CV se desliza, el satélite escanea, los directores lo ven
{
  s.susurro(MEDIO, G("e13", "CV") - S(4), 0.1, 0.4);
  const v = G("e13", "vista") - S(4);
  s.subida(MEDIO, v, v + 1.0, 0.1);
  for (let k = 0; k < 10; k++) h.tick(SECO, v + 0.1 + k * 0.1, 0.035, 0.5);
  const d = G("e13", "directores") - S(4);
  s.impacto(SALA, d - 0.05, 0.55, 300);
  [0, 0.09, 0.18].forEach((x, k) => ping(d + x, 0.09, 1760 + k * 200, 0.6, -0.3 + k * 0.3));
}
// e14: ofertas que llegan a la torre
{
  for (let k = 0; k < 4; k++) {
    const en = G("e14", "ofertas") - S(8) + S(k * 8);
    s.susurro(MEDIO, en, 0.05, k % 2 ? 0.5 : -0.5);
    ping(en + S(20), 0.13, [1318.5, 1568, 1760, 2093][k], 0.9, k % 2 ? 0.3 : -0.3);
  }
  s.impacto(SALA, G("e14", "pensadas") - 0.1, 0.5, 300);
}
// e15: los closers (ping platino), silencio, y "el suyo"
{
  const tc = G("e15", "closers") - S(4);
  for (let k = 0; k < 14; k++) ping(tc + k * S(1.2), 0.04, 1975 + (k % 4) * 180, 0.5, -0.6 + (k % 5) * 0.3);
  s.impacto(SALA, G("e15", "ring") - 0.08, 0.5, 300);
  s.caida(MEDIO, corteMusica, 0.12);
  // los objetos vuelan al anillo
  s.subida(MEDIO, G("e15", "el") - 0.06, tSuyo - 0.04, 0.3);
  s.impacto(SALA, tSuyo - 0.05, 0.9, 700);
  s.impacto(SALA, tSuyo + 0.02, 0.4, 300);
  s.bajo(tSuyo, 1.6, 55, 0.8);
  [220, 261.6, 329.6, 440].forEach((f, k) => s.pluck(tSuyo + 0.03 + k * 0.05, f, 0.2, 1.8, (k - 1.5) * 0.3));
  ping(tSuyo + 0.02, 0.24, 880, 2.4, 0);
  h.chisporroteo(SECO, tSuyo + 0.1, 0.18, 0.6, 26);
  groove(tSuyo, INI("e16") + 0.02, 0.85);
}
// e16: la marca y el golpe más grande en "abierto"
{
  const r = G("e16", "Ring") - S(3);
  const ab = G("e16", "abierto") - S(3);
  s.impacto(SALA, r - 0.05, 0.85, 700);
  s.bajo(r, 1.2, 55, 0.7);
  ping(r + 0.02, 0.22, 1760, 1.6, 0);
  h.brillo(MEDIO, r + 0.2, 1.0, 0.12);
  dron(INI("e16"), DUR - 0.1, 110, 0.3, 1600, 1.6);
  for (let t = r; t < ab - 0.3; t += 0.5) { s.bombo(t, 0.45); s.hat(t + 0.25, 0.08); }
  s.subida(MEDIO, ab - 0.7, ab - 0.04, 0.3);
  s.impacto(SALA, ab - 0.05, 1.0, 900);
  s.impacto(SALA, ab + 0.03, 0.5, 300);
  s.bajo(ab, 2.4, 55, 0.95);
  [110, 220, 261.6, 329.6, 440, 523.3].forEach((f, k) => s.pluck(ab + 0.03 + k * 0.05, f, 0.22, 2.6, (k - 2.5) * 0.25));
  ping(ab + 0.02, 0.32, 880, 3.2, 0);
  ping(ab + 0.12, 0.12, 1318.5, 2.2, 0.3);
  h.brillo(MEDIO, ab + 0.15, 1.6, 0.16);
  h.chisporroteo(SECO, ab + 0.1, 0.22, 0.8, 30);
  h.chisporroteo(SECO, ab + 0.9, 0.1, 0.6, 14);
}

h.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-setters-agudo.wav", salidaCama: "out/setters/cama-agudo-vacia.wav" });
s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx: "public/audio/sfx-setters-grave.wav", salidaCama: "public/audio/cama-setters.wav" });
console.log("sonido setters ok", DUR.toFixed(1), "s");
