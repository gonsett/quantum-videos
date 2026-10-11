import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Capa, Ctx, Cam, P, cl, ease, rebote, TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO, RC } from "../ring-closers/tema";
import ENV from "./env.json";

/**
 * "La mala racha" (10/10/2026), 60 fps, un solo plano continuo. Dolor del closer, no novedad.
 * El calendario: catorce días caen uno por uno con un "0" gris, cada uno más pesado que el
 * anterior y la imagen se apaga. Al salir, los mismos días se encienden en esmeralda con
 * rounds de práctica (mapa de calor) y el día 15 se ilumina con "CIERRE".
 * Voz Callirrhoe en una toma corrida (voz.mp3, huecos ≤ 0,25 s); tiempos de faster-whisper.
 */
const VERDE = RC.esmeralda500;
export const DUR_RACHA = 2400;

const V0 = 30;
const w = (s: number) => V0 + Math.round(s * 60);

// ---------- el mundo ----------
const TW = 230, TH = 290, PASO_X = 258, PASO_Y = 350;
const X = (c: number) => (c - 3) * PASO_X;
const Y = (r: number) => r * PASO_Y;
const DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

// Caídas: cada día aterriza sobre una palabra. Pesa más cuanto más tarde.
const CAE = [0.0, 0.22, 0.68, 0.98, 3.1, 4.3, 6.42, 7.36, 8.64, 9.98, 10.9, 13.78, 15.64, 18.08].map(w);
const peso = (i: number) => i < 4 ? 0.04 * i : (i - 3) / 10;
// Se encienden con rounds de práctica, cada vez más rápido.
const LUZ = [20.14, 21.0, 21.68, 22.54, 23.56, 24.7, 25.64, 26.76, 27.34, 27.62, 28.26, 28.72, 29.28, 29.42].map(w);
const ROUNDS = [1, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8];
const CAE15 = w(30.52), CIERRE = w(31.52), LOGO = w(32.3);
const FONDO = w(19.28), SALE = w(19.76);

// ---------- cámara ----------
type Llave = [number, number, number, number];   // [t, x, y del objetivo, z]
const LLAVES: Llave[] = [
  [0, X(0) + 60, 0, -1100],
  [w(1.0), X(1) + 40, 0, -1400],
  [w(2.6), X(3), 10, -1500],
  [w(4.3), X(4) + 60, 10, -1350],
  [w(5.6), X(5), 30, -1450],
  [w(6.42), X(6) - 50, 40, -1300],
  [CAE[7] - 4, X(1) - 40, 300, -1900],
  [w(8.64), X(1) + 40, 340, -1450],
  [w(9.98), X(2), 340, -1380],
  [w(10.9), X(3), 340, -1320],
  [w(13.78), X(4), 340, -1250],
  [w(15.64), X(5) - 20, 340, -1200],
  [w(18.08), X(6) - 70, 340, -1080],
  [w(19.1), X(6) - 90, 330, -1020],
  [w(20.5), 0, 175, -2600],                  // retrocede: los catorce ceros
  [w(25.0), 0, 170, -2380],
  [w(29.7), 0, 180, -2480],
  [w(31.0), X(0) + 10, 680, -1620],          // baja al día 15
  [w(31.95), X(0) + 10, 680, -1460],
  [w(32.95), 0, -300, -3000],                // el logo
  [DUR_RACHA, 0, -320, -2650],
];
// spline cúbica monótona (Fritsch–Carlson): la cámara pasa por cada llave sin frenar,
// con velocidad continua; solo se detiene donde dos llaves repiten posición
const TS = LLAVES.map((k) => k[0]);
const tangentes = (eje: number) => {
  const n = LLAVES.length, v = LLAVES.map((k) => k[eje]);
  const d = TS.slice(0, -1).map((t, i) => (v[i + 1] - v[i]) / (TS[i + 1] - t));
  const m = v.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = Math.hypot(a, b);
    if (h > 3) { m[i] = (3 * a * d[i]) / h; m[i + 1] = (3 * b * d[i]) / h; }
  }
  m[0] = 0; m[n - 1] = 0;
  return m;
};
const TAN = [1, 2, 3].map(tangentes);
const llave = (t: number) => {
  const tt = Math.min(TS[TS.length - 1], Math.max(0, t));
  let i = 0;
  while (i < LLAVES.length - 2 && tt > TS[i + 1]) i++;
  const h = TS[i + 1] - TS[i], u = (tt - TS[i]) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const eje = (e: number) => h00 * LLAVES[i][e] + h10 * h * TAN[e - 1][i] + h01 * LLAVES[i + 1][e] + h11 * h * TAN[e - 1][i + 1];
  return { x: eje(1), y: eje(2), z: eje(3) };
};
// golpe de cámara grave y corto (≈4 Hz), no el temblor de alta frecuencia
const golpe = (t: number, en: number, amp: number) => {
  const d = (t - en) / 60;
  if (d < 0) return 0;
  return amp * Math.exp(-d / 0.2) * Math.sin(d * 26);
};
// el objetivo cae debajo de la frase: OFF px por debajo del centro de la pantalla
const OFF = (t: number) => interpolate(t, [SALE, w(20.5), w(29.9), w(30.9), LOGO, w(32.95)], [230, 150, 150, 380, 380, 0], { ...cl, easing: ease });
const camara = (t: number): Cam => {
  const k = llave(t);
  let sx = 0, sy = 0, sr = 0;
  CAE.forEach((c, i) => { const a = 1.5 + 8 * peso(i); sx += golpe(t, c, a * 0.3); sy += golpe(t, c, a); sr += golpe(t, c, a * 0.02); });
  sy += golpe(t, CAE15, 3) + golpe(t, CIERRE, 4);
  const z = k.z + 40 * rebote(t, CIERRE, 9, 220);
  const y = k.y - OFF(t) * (-z) / P + Math.sin(t / 75) * 8 + sy;
  const x = k.x + Math.sin(t / 95) * 12 + sx;
  // el piso se inclina mientras se hunde y se endereza al salir
  const inclina = interpolate(t, [0, FONDO, SALE + 60], [0, 2.4, 0], { ...cl, easing: ease });
  const roll = (interpolate(t, [0, 90], [-4, 0], { ...cl, easing: ease }) + inclina + Math.sin(t / 120) * 0.4 + sr) * Math.PI / 180;
  const yaw = (Math.sin(t / 130) * 1.0 + interpolate(t, [SALE, w(25), w(29.7), w(31)], [0, 0, 0, 0], { ...cl, easing: ease })) * Math.PI / 180;
  const pitch = (Math.sin(t / 140) * 0.8 + interpolate(t, [SALE, w(21.5), w(29.7), w(31)], [0, 0, 0, 0], { ...cl, easing: ease })) * Math.PI / 180;
  return { x, y, z, roll, yaw, pitch };
};
const foco = (t: number) => interpolate(t, [LOGO, LOGO + 40], [0, -1300], { ...cl, easing: ease });

// cuánto se apagó la imagen: cada día perdido apaga un poco más
const oscuro = (t: number) => {
  let d = 0;
  CAE.forEach((c, i) => { if (i >= 3) d += interpolate(t, [c, c + 24], [0, 0.03 + 0.05 * peso(i)], cl); });
  return d * interpolate(t, [SALE, w(21.4)], [1, 0], { ...cl, easing: ease });
};

// ---------- el día ----------
const Dia: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const lv = i < 14 ? interpolate(t, [LUZ[i] - 2, LUZ[i] + 12], [0, 1], { ...cl, easing: ease }) : 0;
  const flash = i < 14 ? interpolate(t, [LUZ[i] - 2, LUZ[i] + 3, LUZ[i] + 40], [0, 1, 0], cl) : 0;
  const calor = i < 14 ? 0.32 + 0.68 * (ROUNDS[i] / 8) : 0;
  const n = i < 14 ? ROUNDS[i] : 0;
  const e = calor * lv;
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 28, overflow: "hidden",
      background: `linear-gradient(165deg, rgba(${26 - 14 * e},${26 + 30 * e},${30 + 10 * e},0.94), rgba(${11 - 6 * e},${11 + 22 * e},${13 + 8 * e},0.97))`,
      border: `1.5px solid rgba(${lv > 0 ? "52,211,153" : "255,255,255"},${lv > 0 ? 0.18 + 0.6 * e : 0.09})`,
      boxShadow: `0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,${0.07 + 0.08 * e}), 0 0 ${40 + 60 * flash}px rgba(16,185,129,${0.45 * e + 0.5 * flash})` }}>
      {/* rótulo del día */}
      <div style={{ position: "absolute", left: 24, right: 24, top: 22, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, letterSpacing: "0.2em",
        color: lv > 0.5 ? "rgba(167,243,208,0.85)" : "rgba(161,161,170,0.7)" }}>
        <span>{DIAS[i % 7]}</span><span>{String(i + 1).padStart(2, "0")}</span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 62, height: 1, background: `rgba(${lv > 0.5 ? "52,211,153" : "255,255,255"},${0.08 + 0.15 * e})` }} />
      {/* el cero */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 78, textAlign: "center", opacity: 1 - lv, filter: lv > 0.02 ? `blur(${lv * 12}px)` : undefined, transform: `scale(${1 + 0.15 * lv})` }}>
        <div style={{ fontFamily: TIGHT, fontWeight: 500, fontSize: 136, lineHeight: 1, letterSpacing: "-0.05em", color: "rgba(161,161,170,0.62)" }}>0</div>
        <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 16, letterSpacing: "0.3em", color: "rgba(161,161,170,0.5)" }}>CIERRES</div>
      </div>
      {/* los rounds */}
      {lv > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 84, textAlign: "center", opacity: lv, transform: `translateY(${(1 - lv) * 22}px)` }}>
          <div style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 112, lineHeight: 1, letterSpacing: "-0.05em", color: "#f4f4f5", textShadow: `0 0 ${30 * flash}px rgba(110,231,183,0.9)` }}>{n}</div>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 16, letterSpacing: "0.3em", color: "rgba(167,243,208,0.8)" }}>{n === 1 ? "ROUND" : "ROUNDS"}</div>
          <div style={{ margin: "20px auto 0", width: 4 * 22, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {Array.from({ length: n }, (_, j) => {
              const p = interpolate(t, [LUZ[i] + 4 + j * 3, LUZ[i] + 10 + j * 3], [0, 1], cl);
              return <div key={j} style={{ width: 12, height: 12, borderRadius: 6, background: `rgba(52,211,153,${0.15 + 0.85 * p})`, boxShadow: `0 0 ${10 * p}px rgba(52,211,153,0.9)` }} />;
            })}
          </div>
        </div>
      )}
      {/* reflejo que barre al encenderse */}
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${-30 + 160 * lv}%, rgba(255,255,255,0.14) ${-18 + 160 * lv}%, transparent ${-6 + 160 * lv}%)` }} />}
    </div>
  );
};

// El día 15: la llamada vuelve a ser tuya
const Dia15: React.FC<{ t: number }> = ({ t }) => {
  const lv = interpolate(t, [CIERRE - 3, CIERRE + 10], [0, 1], { ...cl, easing: ease });
  const onda = interpolate(t, [CIERRE, CIERRE + 50], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const check = interpolate(t, [CIERRE + 4, CIERRE + 20], [0, 1], { ...cl, easing: ease });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, borderRadius: 28, border: `2px solid rgba(52,211,153,${0.8 * (1 - onda) * lv})`, transform: `scale(${1 + 0.35 * onda})` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 28, overflow: "hidden",
        background: `linear-gradient(165deg, rgba(${26 - 18 * lv},${26 + 34 * lv},${30 + 12 * lv},0.95), rgba(${11 - 7 * lv},${11 + 26 * lv},${13 + 10 * lv},0.97))`,
        border: `1.5px solid rgba(${lv > 0 ? "52,211,153" : "255,255,255"},${0.09 + 0.8 * lv})`,
        boxShadow: `0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 ${50 + 50 * (1 - onda)}px rgba(16,185,129,${0.75 * lv})` }}>
        <div style={{ position: "absolute", left: 24, right: 24, top: 22, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, letterSpacing: "0.2em", color: lv > 0.5 ? "rgba(167,243,208,0.9)" : "rgba(161,161,170,0.7)" }}>
          <span>LUN</span><span>15</span>
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, top: 62, height: 1, background: `rgba(52,211,153,${0.1 + 0.3 * lv})` }} />
        <svg width={92} height={92} viewBox="0 0 92 92" style={{ position: "absolute", left: (TW - 92) / 2, top: 92, opacity: lv }}>
          <circle cx={46} cy={46} r={40} fill="none" stroke="rgba(52,211,153,0.7)" strokeWidth={2} />
          <path d="M28 47 l12 12 l24 -26" fill="none" stroke="#6ee7b7" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - check)} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 206, textAlign: "center", fontFamily: TIGHT, fontWeight: 600, fontSize: 44, letterSpacing: "0.04em", color: "#f4f4f5", opacity: lv,
          textShadow: `0 0 ${24 * (1 - onda)}px rgba(110,231,183,0.9)`, transform: `translateY(${(1 - lv) * 16}px)` }}>CIERRE</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: 1 - lv, fontFamily: MONO, fontSize: 16, letterSpacing: "0.3em", color: "rgba(161,161,170,0.55)" }}>HOY</div>
      </div>
    </>
  );
};

// cómo cae un día: gravedad, golpe y aplaste
const caida = (t: number, en: number, h: number) => {
  const F = 15 + Math.round(9 * h);
  const p = Math.min(1, Math.max(0, (t - (en - F)) / F));
  const alto = 340 + 560 * h;
  const y = -alto * (1 - Easing.in(Easing.quad)(p));
  const op = interpolate(t, [en - F, en - F * 0.5], [0, 1], cl);
  const r = t >= en ? rebote(t, en, 8, 300) : 0;
  const aplaste = t >= en ? (1 - r) * (0.05 + 0.1 * h) : 0;
  return { y, op, aplaste, z: -80 * (1 - p) };
};

// ---------- la voz del closer ----------
const nivel = (f: number) => {
  const i = Math.round(f - V0);
  let s = 0, n = 0;
  for (let k = -2; k <= 2; k++) { const v = (ENV as number[])[i + k]; if (v !== undefined) { s += v; n++; } }
  return n ? s / n : 0;
};
const Onda: React.FC<{ f: number }> = ({ f }) => {
  const temblor = interpolate(f, [w(1.5), w(5.04), w(7.0), w(12.38), w(19.28), SALE], [0.25, 0.55, 1, 1, 0.6, 0], cl);
  const verde = interpolate(f, [SALE, w(21.4)], [0, 1], { ...cl, easing: ease });
  const op = interpolate(f, [10, 40, LOGO - 10, LOGO + 20], [0, 1, 1, 0], cl);
  if (op <= 0) return null;
  const A = 8 + 64 * nivel(f);
  const N = 140, W = 760;
  const pts: string[] = [];
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const ventana = Math.sin(Math.PI * u) ** 1.6;
    const suave = Math.sin(k * 0.34 - f * 0.22) * (0.6 + 0.4 * Math.sin(k * 0.09 + f * 0.05));
    const ruido = Math.sin(k * 2.3 + f * 0.61) * 0.55 + Math.sin(k * 3.7 - f * 0.83 + 1.1) * 0.45;
    const tiembla = Math.sin(k * 1.7 + f * 0.9) * 0.5 + ruido;
    const y = A * ventana * (suave * (1 - 0.55 * temblor) + tiembla * 0.9 * temblor);
    pts.push(`${(u * W).toFixed(1)},${(60 + y).toFixed(1)}`);
  }
  const col = `rgb(${212 - 160 * verde},${212 + 1 * verde},${216 - 63 * verde})`;
  return (
    <div style={{ position: "absolute", left: (1080 - W) / 2, top: 1580, width: W, height: 120, opacity: op }}>
      <svg width={W} height={120} style={{ overflow: "visible", filter: `drop-shadow(0 0 ${10 * verde}px rgba(16,185,129,0.8))` }}>
        <line x1={0} y1={60} x2={W} y2={60} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        <polyline points={pts.join(" ")} fill="none" stroke={col} strokeOpacity={0.55 + 0.4 * verde} strokeWidth={2.2} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 128, right: 0, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 15, letterSpacing: "0.3em", color: "rgba(161,161,170,0.6)" }}>
        <span>TU VOZ EN LA LLAMADA</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: verde > 0.5 ? "#34d399" : "rgba(212,212,216,0.6)", boxShadow: verde > 0.5 ? "0 0 10px #34d399" : undefined }} />
          {verde > 0.5 ? "FIRME" : "EN VIVO"}
        </span>
      </div>
    </div>
  );
};

// ---------- texto ----------
const Palabra: React.FC<{ t: number; en: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, en, children, style }) => {
  const r = rebote(t, en, 13, 160);
  const vis = interpolate(t, [en - 1, en + 7], [0, 1], cl);
  return <span style={{ display: "inline-block", opacity: vis, transform: `translateY(${(1 - r) * 40}px) scale(${0.95 + 0.05 * r})`, filter: `blur(${(1 - vis) * 14}px)`, ...style }}>{children}</span>;
};
const italica: React.CSSProperties = { fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.19em", letterSpacing: "-0.02em" };
const acento = (t: number, en: number): React.CSSProperties => ({ ...italica, color: VERDE,
  textShadow: `0 0 40px rgba(16,185,129,${0.45 * interpolate(t, [en, en + 30], [1, 0.4], cl)})` });
type Pal = { p: string; s: number; ac?: boolean; it?: boolean };
const Frase: React.FC<{ t: number; renglones: Pal[][]; hasta: number; tam?: number }> = ({ t, renglones, hasta, tam = 100 }) => {
  const primera = w(renglones[0][0].s);
  const op = interpolate(t, [w(hasta) - 2, w(hasta) + 8], [1, 0], cl);
  if (t < primera - 30 || op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 240 + Math.sin(t / 80) * 5, opacity: op, filter: op < 1 ? `blur(${(1 - op) * 18}px)` : undefined, transform: `translateX(${Math.sin(t / 110) * 7}px)` }}>
      <div style={{ textAlign: "center", color: "#f4f4f5", fontFamily: TIGHT, fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.05 }}>
        {renglones.map((r, i) => (
          <div key={i}>{r.map((pal, j) => (
            <React.Fragment key={j}>{j > 0 && " "}<Palabra t={t} en={w(pal.s) - 2} style={pal.ac ? acento(t, w(pal.s)) : pal.it ? italica : undefined}>{pal.p}</Palabra></React.Fragment>
          ))}</div>
        ))}
      </div>
    </div>
  );
};
const pal = (txt: string, ...s: number[]): Pal[] => txt.split(" ").map((p, i) => ({ p: p.replace(/[*_]/g, ""), s: s[i], ac: p.startsWith("*"), it: p.startsWith("_") }));

const FRASES: { r: Pal[][]; hasta: number; tam?: number }[] = [
  { r: [pal("Dos semanas", 0, 0.22), pal("sin _cerrar.", 0.68, 0.98)], hasta: 1.46, tam: 124 },
  { r: [pal("Y empezás a entrar", 1.52, 1.94, 2.26, 2.36), pal("a cada llamada", 2.62, 2.78, 3.1), pal("pensando en la _anterior.", 3.6, 4.06, 4.22, 4.3)], hasta: 4.98, tam: 92 },
  { r: [pal("El prospecto no sabe", 5.04, 5.24, 5.7, 5.82), pal("de tu racha…", 6.12, 6.3, 6.42), pal("pero la _escucha.", 7.08, 7.24, 7.36)], hasta: 8.06, tam: 92 },
  { r: [pal("Apurás el _precio.", 8.12, 8.4, 8.64)], hasta: 9.5, tam: 112 },
  { r: [pal("Bajás el _tono.", 9.56, 9.8, 9.98)], hasta: 10.84, tam: 112 },
  { r: [pal("Cedés antes de", 10.9, 11.12, 11.5), pal("que te lo _pidan.", 11.68, 11.76, 11.88, 12.02)], hasta: 12.34, tam: 104 },
  { r: [pal("Y la racha", 12.38, 12.76, 12.88), pal("se alimenta _sola.", 13.12, 13.32, 13.78)], hasta: 14.42, tam: 112 },
  { r: [pal("Con leads reales", 14.48, 14.68, 14.92), pal("no salís de _ahí.", 15.64, 16.0, 16.34, 16.44)], hasta: 16.72, tam: 104 },
  { r: [pal("Cada llamada que perdés", 16.78, 16.98, 17.46, 17.62), pal("pesa más", 18.08, 18.5), pal("que la _anterior.", 18.76, 18.86, 18.98)], hasta: 19.7, tam: 92 },
  { r: [pal("Se sale", 19.76, 19.86), pal("*practicando,", 20.14)], hasta: 21.4, tam: 120 },
  { r: [pal("donde perder", 21.46, 21.68), pal("no cuesta _nada.", 22.0, 22.24, 22.54)], hasta: 23.28, tam: 112 },
  { r: [pal("En Ring Closers", 23.34, 23.4, 23.56), pal("hacés *roleplay", 24.12, 24.7), pal("con otros closers,", 25.16, 25.36, 25.64)], hasta: 26.46, tam: 96 },
  { r: [pal("con la objeción", 26.52, 26.66, 26.76), pal("que te está _matando,", 27.12, 27.26, 27.34, 27.62)], hasta: 28.2, tam: 100 },
  { r: [pal("las veces", 28.26, 28.72), pal("que haga _falta.", 29.18, 29.28, 29.42)], hasta: 30.0, tam: 112 },
  { r: [pal("Hasta que la llamada", 30.06, 30.3, 30.42, 30.52), pal("vuelve a ser *tuya.", 30.88, 31.26, 31.36, 31.52)], hasta: 32.2, tam: 100 },
];

// ---------- la escena ----------
const Escena: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camara(t), fz: foco(t) };
  const os = oscuro(t);
  const esmeralda = interpolate(t, [w(20.1), w(26)], [0, 1], { ...cl, easing: ease });
  const finGrilla = interpolate(t, [w(29.9), w(30.8), LOGO + 10, LOGO + 60], [1, 0.22, 0.22, 0.16], cl);
  return (
    <AbsoluteFill style={{ background: "#040405", overflow: "hidden" }}>
      {/* luz fría desde arriba en el pozo, resplandor esmeralda al salir */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 50% at 50% 38%, rgba(220,225,235,${0.06 * (1 - esmeralda)}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 45% at ${50 + Math.sin(t / 130) * 8}% ${62 + Math.sin(t / 90) * 4}%, rgba(16,185,129,${(0.13 + 0.04 * Math.sin(t / 50)) * esmeralda}), transparent 70%)` }} />

      {/* rótulos de la grilla */}
      {[0, 1].map((r) => (
        <Capa key={r} k={k} x={X(0) + 180} y={Y(r) - TH / 2 - 34} z={0} w={TW * 2} h={30} op={interpolate(t, [CAE[r * 7] - 20, CAE[r * 7]], [0, 1], cl) * finGrilla}>
          <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: "0.32em", color: esmeralda > 0.5 ? "rgba(167,243,208,0.7)" : "rgba(161,161,170,0.55)", whiteSpace: "nowrap" }}>SEMANA {r + 1}</div>
        </Capa>
      ))}

      {/* los catorce días */}
      {CAE.map((en, i) => {
        const c = i % 7, r = Math.floor(i / 7);
        const h = peso(i);
        const cd = caida(t, en, h);
        if (cd.op <= 0) return null;
        return (
          <React.Fragment key={i}>
            {/* onda en el piso al golpear */}
            {t >= en && t < en + 50 && (
              <Capa k={k} x={X(c)} y={Y(r) + TH / 2 + 4} z={0} w={TW * 2} h={20} op={interpolate(t, [en, en + 45], [0.25 + 0.6 * h, 0], cl)}>
                <div style={{ position: "absolute", left: "50%", top: 9, height: 2, width: TW * 2, marginLeft: -TW, transform: `scaleX(${0.3 + 0.9 * interpolate(t, [en, en + 40], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) })})`,
                  background: "linear-gradient(90deg, transparent, rgba(228,228,231,0.8), transparent)" }} />
              </Capa>
            )}
            <Capa k={k} x={X(c)} y={Y(r) + cd.y} z={cd.z} w={TW} h={TH} op={cd.op * finGrilla} dof={0.9}>
              <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%", transform: `scale(${1 + cd.aplaste * 0.6}, ${1 - cd.aplaste})` }}>
                <Dia t={t} i={i} />
              </div>
            </Capa>
          </React.Fragment>
        );
      })}

      {/* el día 15 */}
      {(() => {
        const cd = caida(t, CAE15, 0.15);
        if (cd.op <= 0) return null;
        return (
          <>
            <Capa k={k} x={X(0) + 180} y={Y(2) - TH / 2 - 34} z={0} w={TW * 2} h={30} op={cd.op * finGrilla}>
              <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: "0.32em", color: "rgba(167,243,208,0.7)", whiteSpace: "nowrap" }}>SEMANA 3</div>
            </Capa>
            <Capa k={k} x={X(0)} y={Y(2) + cd.y} z={cd.z} w={TW} h={TH} op={cd.op * interpolate(t, [LOGO, LOGO + 50], [1, 0.7], cl)} dof={0.9}>
              <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%", transform: `scale(${1 + cd.aplaste * 0.6}, ${1 - cd.aplaste})` }}>
                <Dia15 t={t} />
              </div>
            </Capa>
          </>
        );
      })()}

      {/* la imagen se apaga con cada día perdido */}
      <AbsoluteFill style={{ background: "#020203", opacity: os }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 55%, transparent 40%, rgba(0,0,0,${0.7 * os / 0.6}))` }} />

      {/* ===== frases ===== */}
      {FRASES.map((fr, i) => <Frase key={i} t={t} renglones={fr.r} hasta={fr.hasta} tam={fr.tam} />)}

      {/* ===== logo ===== */}
      {(() => {
        const op = interpolate(t, [LOGO - 6, LOGO + 8], [0, 1], cl);
        if (op <= 0) return null;
        const c1 = w(33.32), c2 = w(35.18);
        return (
          <Capa k={k} x={0} y={-330} z={-250} w={1060} h={820} esc={1.75} op={op} dof={0.3}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.55))", transform: `scale(${0.85 + 0.15 * rebote(t, LOGO, 12, 170)})` }}>
                <Logo size={260} dibujoEn={LOGO} />
              </div>
              <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: "0.4em", color: "rgba(167,243,208,0.85)", whiteSpace: "nowrap",
                opacity: interpolate(t, [LOGO + 6, LOGO + 22], [0, 1], cl), transform: `translateY(${interpolate(t, [LOGO + 6, LOGO + 26], [16, 0], { ...cl, easing: ease })}px)` }}>
                RING CLOSERS
              </div>
              <div style={{ marginTop: 44, fontFamily: TIGHT, fontWeight: 600, fontSize: 92, color: "#f4f4f5", letterSpacing: "-0.045em", lineHeight: 1.08, textAlign: "center", whiteSpace: "nowrap" }}>
                <div><Palabra t={t} en={c1}>Practicá</Palabra>{" "}<Palabra t={t} en={w(33.94)}>con</Palabra>{" "}<Palabra t={t} en={w(34.16)}>closers.</Palabra></div>
                <div><Palabra t={t} en={c2} style={acento(t, c2)}>Cerrá</Palabra>{" "}<Palabra t={t} en={w(35.62)} style={acento(t, w(35.62))}>con</Palabra>{" "}<Palabra t={t} en={w(35.82)} style={acento(t, w(35.82))}>clientes.</Palabra></div>
              </div>
            </div>
          </Capa>
        );
      })()}
    </AbsoluteFill>
  );
};


export const VideoRacha: React.FC = () => {
  const f = useCurrentFrame();
  // obturador constante: siempre las mismas 6 submuestras, así el desenfoque nunca salta
  const n = 6;
  return (
    <AbsoluteFill style={{ background: "#040405" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={f - 0.3 + (0.6 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <Onda f={f} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="granoRacha"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#granoRacha)" /></svg>
      <AbsoluteFill style={{ background: "#040405", opacity: interpolate(f, [0, 8], [1, 0], cl) }} />
      <Sequence from={V0}><Audio src={staticFile("voz-racha-rc/voz.mp3")} /></Sequence>
      <Audio src={staticFile("racha-rc/sonido.wav")} />
    </AbsoluteFill>
  );
};
