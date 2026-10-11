import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Capa, Ctx, Cam, cl, ease, rebote, TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO } from "../ring-closers/tema";
import ENV from "./env.json";
import RELOJ from "./reloj.json";

/**
 * "Los 7 segundos" (11/10/2026), 60 fps, un solo plano continuo sobre el mundo de la muestra aprobada.
 * Decís el precio y corre el silencio: uno, dos, y ya estás hablando. Mientras hablás el tiempo se estira
 * (todo lo que dijiste entró en dos segundos), caen −300 y −200 y la aguja se clava en 4,2.
 * Rebobinado: el silencio no era un no, del otro lado estaban haciendo cuentas. Después la tesis
 * (la marca del 7 como objetivo), tres rounds (3,1 → 5,4 → 7,0) y el que habla primero es el cliente.
 * Voz Callirrhoe en una toma corrida (voz.mp3, huecos ≤ 0,25 s); tiempos de faster-whisper.
 * La lectura del cronómetro vive en reloj.json, compartida con el script de sonido (un tic por salto).
 */
const V0 = 30;
const w = (s: number) => V0 + Math.round(s * 60);
const seg = (t: number) => (t - V0) / 60;
export const DUR_SILENCIO = w(44.42) + 150;

const VERDE = "#10b981", VERDE_C = "#34d399";
const MARFIL = "#efece6";

// ---------- momentos ----------
const PRECIO = w(0.55);
const CAE = [{ en: w(7.36), menos: 300 }, { en: w(8.94), menos: 200 }];
const HABLA = w(4.62), CALLA = w(11.6);
const FRENA = w(11.6), REBOB = w(14.9), REBOB_FIN = w(16.0);
const PIENSA = w(16.3), PIENSA_FIN = w(20.5);
const SIN_PRECIO = w(19.0);
const TESIS = w(23.28);
const ROUNDS = (RELOJ.rounds as number[]).map(w);
const FIN = w(40.32);
const VUELVE = w(40.9);
const LOGO = w(41.1);

// ---------- la lectura del cronómetro ----------
const TR = RELOJ.tramos as number[][];
const lectura = (t: number) => {
  const s = seg(t);
  let r = 0;
  for (const [s0, r0, s1, r1, p] of TR) {
    if (s < s0) break;
    if (s >= s1) { r = r1; continue; }
    const u = (s - s0) / (s1 - s0);
    if (!p) return { r: r0 + (r1 - r0) * Easing.inOut(Easing.cubic)(u), mostrada: r0 + (r1 - r0) * Easing.inOut(Easing.cubic)(u) };
    // escape mecánico: salta de a 1/5 con un ease-out cortito al principio de cada salto
    const lin = r0 + (r1 - r0) * u;
    const q = lin * 5, k = Math.floor(q + 1e-6);
    const e = 1 - Math.pow(1 - Math.min(1, (q - k) / 0.2), 3);
    return { r: lin, mostrada: Math.min(r1, (k + e) / 5) };
  }
  return { r, mostrada: r };
};
// cuándo la aguja cruza cada segundo entero (para encender el número)
const CRUCES: { t: number; n: number }[] = [];
TR.forEach(([s0, r0, s1, r1, p]) => {
  if (!p) return;
  for (let n = Math.floor(r0) + 1; n <= r1 + 1e-6; n++) CRUCES.push({ t: w(s0 + ((n - r0) / (r1 - r0)) * (s1 - s0)), n: n % 10 });
});
const nRound = (t: number) => ROUNDS.filter((r) => t >= r).length;

// ---------- cámara ----------
type Llave = [number, number, number, number];
const LLAVES: Llave[] = [
  [0, 0, -200, -2600],
  [PRECIO + 10, 0, -150, -2450],
  [w(1.85), 0, -60, -2200],
  [w(3.9), 0, 60, -1650],                       // uno, dos: la aguja
  [w(5.4), 0, 160, -1900],                      // y ya estás hablando: tu pista
  [w(7.1), 0, -170, -1950],                     // caen los descuentos
  [w(9.4), 0, -130, -1850],
  [FRENA, 0, -60, -1560],
  [w(14.2), 0, -40, -1420],                     // y nadie te lo pidió
  [w(15.2), 0, -110, -1900],                    // rebobinado
  [w(16.2), 0, -60, -1750],
  [w(17.2), 0, 470, -1780],                     // del otro lado: el cliente piensa
  [w(20.2), 0, 490, -1680],
  [w(21.6), 0, 260, -1720],
  [w(23.4), -90, -40, -1350],
  [w(25.2), -230, -110, -1020],                   // por el bisel, hasta el 7
  [w(27.2), -140, -120, -1120],
  [w(29.2), 0, -150, -1380],
  [w(31.9), 0, -150, -1280],
  [w(32.7), 0, -40, -1720],                     // los rounds
  [w(35.6), 0, -40, -1620],
  [w(38.6), 0, -60, -1420],
  [FIN, 0, 160, -1760],                         // 7,0: habla el cliente
  [w(40.9), 0, -560, -2200],
  [w(41.7), 0, -1520, -3050],                   // el logo
  [DUR_SILENCIO, 0, -1540, -2850],
];
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
const golpe = (t: number, en: number, amp: number) => {
  const d = (t - en) / 60;
  if (d < 0) return 0;
  return amp * Math.exp(-d / 0.2) * Math.sin(d * 26);
};
const camara = (t: number): Cam => {
  const k = llave(t);
  let sy = golpe(t, PRECIO, 5) + golpe(t, CAE[0].en, 9) + golpe(t, CAE[1].en, 9) + golpe(t, FRENA, 14) + golpe(t, FIN, 10) + golpe(t, LOGO, 3);
  ROUNDS.forEach((r) => { sy += golpe(t, r, 5); });
  const sx = golpe(t, FRENA, -5) + golpe(t, FIN, 4);
  return {
    x: k.x + Math.sin(t / 95) * 10 + sx,
    y: k.y + Math.sin(t / 75) * 6 + sy,
    z: k.z,
    roll: (interpolate(t, [0, 90], [-2.5, 0], { ...cl, easing: ease }) + Math.sin(t / 120) * 0.4 + golpe(t, FRENA, 0.5) + golpe(t, FIN, 0.4)) * Math.PI / 180,
    yaw: Math.sin(t / 130) * 1.1 * Math.PI / 180,
    pitch: Math.sin(t / 140) * 0.8 * Math.PI / 180,
  };
};
// foco: el cronómetro; el precio cuando caen los descuentos; la nota del cliente; el logo
const foco = (t: number) => interpolate(t,
  [CAE[0].en - 24, CAE[0].en - 8, CAE[1].en + 14, CAE[1].en + 34, w(16.4), w(16.9), w(20.3), w(20.8), LOGO - 20, LOGO + 30],
  [0, -300, -300, 0, 0, -420, -420, 0, 0, -250], { ...cl, easing: ease });

// ---------- el cronómetro ----------
const R = 430;
const D = R * 2;
const pol = (deg: number, r: number) => [D / 2 + r * Math.sin((deg * Math.PI) / 180), D / 2 - r * Math.cos((deg * Math.PI) / 180)];

const Cronometro: React.FC<{ t: number; brillo: number }> = ({ t, brillo }) => {
  const { r, mostrada } = lectura(t);
  const ang = mostrada * 36;
  const subAng = (r % 1) * 360;
  const fren = t >= FIN ? rebote(t, FIN, 9, 260) : rebote(t, FRENA, 9, 260);
  const parado = (t >= FRENA && t < REBOB) || t >= FIN;
  const cierre = interpolate(t, [FIN, FIN + 18], [0, 1], { ...cl, easing: ease });
  const lect = r.toFixed(1).replace(".", ",");
  const encendido = (n: number) => {
    let e = 0;
    CRUCES.forEach((c) => { if (c.n === n && t >= c.t && n !== 0) e = Math.max(e, Math.exp(-(t - c.t) / 26)); });
    return e;
  };
  // la marca del 7: tenue, se vuelve objetivo en la tesis y explota al llegar
  const objetivo = interpolate(t, [w(23.6), w(24.2)], [0, 1], { ...cl, easing: ease });
  const siete = Math.min(1, (0.55 + 0.12 * Math.sin(t / 14)) + 0.3 * objetivo + 0.4 * cierre);
  const brilloBisel = 120 + Math.sin(t / 70) * 25 + brillo * 20;
  const ronda = nRound(t);
  const aprieta = (() => {
    let a = 0;
    [w(1.85), FRENA, ...ROUNDS, FIN, w(23.4)].forEach((en) => { if (t >= en - 1) a = Math.max(a, Math.exp(-(t - en) / 6)); });
    return a;
  })();
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: D - 40, height: 120, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85), transparent 70%)", filter: "blur(18px)" }} />
      {/* pulsador y corona */}
      <div style={{ position: "absolute", left: D / 2 - 34, top: -62 + 16 * aprieta, width: 68, height: 52, borderRadius: "10px 10px 4px 4px",
        background: "linear-gradient(90deg, #3f3f46, #e4e4e7 35%, #a1a1aa 55%, #27272a)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4)" }} />
      <div style={{ position: "absolute", left: D / 2 - 52, top: -14, width: 104, height: 34, borderRadius: 6,
        background: "repeating-linear-gradient(90deg, #52525b 0 3px, #d4d4d8 3px 5px, #3f3f46 5px 8px)", boxShadow: "0 6px 14px rgba(0,0,0,0.6)" }} />
      {[-40, 40].map((a) => {
        const [x, y] = pol(a, R + 6);
        return <div key={a} style={{ position: "absolute", left: x - 22, top: y - 30, width: 44, height: 40, borderRadius: 8, transform: `rotate(${a}deg)`,
          background: "linear-gradient(90deg, #27272a, #a1a1aa 40%, #52525b)" }} />;
      })}
      {/* bisel metálico */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        background: `conic-gradient(from ${brilloBisel}deg, #18181b, #71717a 8%, #f4f4f5 14%, #52525b 22%, #27272a 34%, #a1a1aa 46%, #fafafa 52%, #3f3f46 60%, #18181b 72%, #8b8b93 86%, #18181b)`,
        boxShadow: `0 80px 160px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12), 0 0 ${120 * cierre}px rgba(16,185,129,${0.35 * cierre})` }} />
      <div style={{ position: "absolute", inset: 14, borderRadius: "50%",
        background: "repeating-conic-gradient(from 0deg, rgba(0,0,0,0.55) 0deg 1.2deg, rgba(255,255,255,0.1) 1.2deg 2.4deg)" }} />
      <div style={{ position: "absolute", inset: 30, borderRadius: "50%",
        background: `conic-gradient(from ${-brilloBisel * 0.7}deg, #27272a, #d4d4d8 12%, #3f3f46 30%, #a1a1aa 55%, #18181b 70%, #e4e4e7 85%, #27272a)` }} />
      {/* esfera */}
      <div style={{ position: "absolute", inset: 46, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 42%, #1c1c20 0%, #111114 55%, #08080a 100%)",
        boxShadow: "inset 0 18px 40px rgba(0,0,0,0.9), inset 0 -6px 20px rgba(255,255,255,0.04)" }} />
      <svg width={D} height={D} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="brillo7v"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        {/* arco del 7: el objetivo */}
        {(() => {
          const rr = 376, a0 = 6.6 * 36, a1 = 7.4 * 36;
          const [x0, y0] = pol(a0, rr), [x1, y1] = pol(a1, rr);
          return (
            <>
              <path d={`M${x0},${y0} A${rr},${rr} 0 0 1 ${x1},${y1}`} stroke={VERDE} strokeWidth={9 + 6 * objetivo} strokeLinecap="round" fill="none" opacity={siete} filter="url(#brillo7v)" />
              <path d={`M${x0},${y0} A${rr},${rr} 0 0 1 ${x1},${y1}`} stroke={VERDE_C} strokeWidth={3 + objetivo} strokeLinecap="round" fill="none" opacity={0.9} />
            </>
          );
        })()}
        {/* recorrido: fino y marfil; al llegar al 7 se cierra en esmeralda */}
        {mostrada > 0.001 && (() => {
          const rr = 330, a1 = Math.min(359.9, ang);
          const [x0, y0] = pol(0, rr), [x1, y1] = pol(a1, rr);
          const dd = `M${x0},${y0} A${rr},${rr} 0 ${a1 > 180 ? 1 : 0} 1 ${x1},${y1}`;
          return (
            <>
              {cierre > 0 && <path d={dd} stroke={VERDE} strokeWidth={10} fill="none" opacity={0.8 * cierre} filter="url(#brillo7v)" />}
              <path d={dd} stroke={cierre > 0 ? VERDE_C : "rgba(244,244,245,0.22)"} strokeOpacity={cierre > 0 ? 0.3 + 0.7 * cierre : 1} strokeWidth={2 + 2 * cierre} fill="none" />
            </>
          );
        })()}
        {Array.from({ length: 100 }, (_, i) => {
          const a = i * 3.6, mayor = i % 10 === 0, medio = i % 5 === 0;
          const en7 = i >= 68 && i <= 72;
          const [x0, y0] = pol(a, 366), [x1, y1] = pol(a, mayor ? 326 : medio ? 340 : 352);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={en7 ? VERDE_C : MARFIL} strokeOpacity={mayor ? 0.95 : medio ? 0.6 : 0.32} strokeWidth={mayor ? 3.2 : medio ? 2 : 1.1} />;
        })}
      </svg>
      {/* números */}
      {Array.from({ length: 10 }, (_, n) => {
        const [x, y] = pol(n * 36, 282);
        const e = encendido(n);
        const es7 = n === 7;
        const e7 = es7 ? Math.max(e, 0.35 * objetivo, cierre) : e;
        return (
          <div key={n} style={{ position: "absolute", left: x - 50, top: y - 40, width: 100, height: 80, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 64 + 26 * e7, lineHeight: 1,
            color: es7 ? VERDE_C : `rgba(239,236,230,${0.62 + 0.38 * e})`,
            textShadow: es7 ? `0 0 ${26 + 30 * cierre}px rgba(16,185,129,${siete})` : `0 0 ${30 * e}px rgba(255,255,255,${0.7 * e})` }}>{n === 0 ? "10" : n}</div>
        );
      })}
      {/* ventana digital */}
      <div style={{ position: "absolute", left: D / 2 - 128, top: D / 2 - 200, width: 256, height: 76, borderRadius: 12,
        background: "linear-gradient(180deg, #050506, #0d0d10)", border: `1px solid ${cierre > 0 ? `rgba(52,211,153,${0.12 + 0.5 * cierre})` : "rgba(255,255,255,0.12)"}`, boxShadow: "inset 0 4px 12px rgba(0,0,0,0.9)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 46, letterSpacing: "0.04em",
          color: cierre > 0 ? VERDE_C : parado ? "#ffffff" : MARFIL, transform: `scale(${1 + 0.1 * (parado ? 1 - fren : 0) + (parado ? 0.04 : 0)})`,
          textShadow: cierre > 0 ? `0 0 22px rgba(16,185,129,${0.8 * cierre})` : parado ? "0 0 22px rgba(255,255,255,0.55)" : "none" }}>{lect.padStart(4, "0")}</span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: "rgba(161,161,170,0.8)", marginTop: 14 }}>s</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: D / 2 + 70, textAlign: "center", fontFamily: MONO, fontSize: 15, letterSpacing: "0.42em",
        color: ronda ? "rgba(167,243,208,0.85)" : "rgba(161,161,170,0.7)" }}>{ronda ? `ROUND ${ronda} · 1/10 s` : "SILENCIO · 1/10 s"}</div>
      {/* subesfera de décimas */}
      <div style={{ position: "absolute", left: D / 2 - 78, top: D / 2 + 112, width: 156, height: 156, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 40%, #16161a, #0a0a0c)", border: "1.5px solid rgba(212,212,216,0.35)", boxShadow: "inset 0 6px 16px rgba(0,0,0,0.9)" }}>
        <svg width={156} height={156} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i * 36 * Math.PI) / 180;
            return <line key={i} x1={78 + 66 * Math.sin(a)} y1={78 - 66 * Math.cos(a)} x2={78 + 56 * Math.sin(a)} y2={78 - 56 * Math.cos(a)} stroke={MARFIL} strokeOpacity={0.5} strokeWidth={1.5} />;
          })}
          <g transform={`rotate(${subAng} 78 78)`}>
            <line x1={78} y1={88} x2={78} y2={20} stroke={MARFIL} strokeWidth={2} />
          </g>
          <circle cx={78} cy={78} r={5} fill="#d4d4d8" />
        </svg>
      </div>
      {/* aguja */}
      <div style={{ position: "absolute", left: D / 2, top: D / 2, width: 0, height: 0, transform: `rotate(${ang}deg)` }}>
        <div style={{ position: "absolute", left: -2 + 8, top: -340 + 10, width: 4, height: 420, background: "rgba(0,0,0,0.6)", filter: "blur(5px)" }} />
        <div style={{ position: "absolute", left: -1.6, top: -352, width: 3.2, height: 352, borderRadius: 2, background: `linear-gradient(180deg, ${parado ? "#ffffff" : MARFIL}, #d4d4d8)`,
          boxShadow: parado ? "0 0 14px rgba(255,255,255,0.6)" : "0 0 6px rgba(255,255,255,0.25)" }} />
        <div style={{ position: "absolute", left: -6, top: 0, width: 12, height: 86, borderRadius: 6, background: "linear-gradient(90deg, #52525b, #e4e4e7, #52525b)" }} />
        <div style={{ position: "absolute", left: -11, top: 58, width: 22, height: 22, borderRadius: 11, background: "linear-gradient(135deg, #e4e4e7, #52525b)" }} />
      </div>
      <div style={{ position: "absolute", left: D / 2 - 22, top: D / 2 - 22, width: 44, height: 44, borderRadius: 22,
        background: "radial-gradient(circle at 35% 30%, #fafafa, #a1a1aa 40%, #27272a)", boxShadow: "0 4px 10px rgba(0,0,0,0.7)" }} />
      <div style={{ position: "absolute", left: D / 2 - 7, top: D / 2 - 7, width: 14, height: 14, borderRadius: 7, background: "#18181b" }} />
      {/* cristal */}
      <div style={{ position: "absolute", inset: 46, borderRadius: "50%", overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${118 + Math.sin(t / 90) * 8}deg, transparent 30%, rgba(255,255,255,0.07) 38%, rgba(255,255,255,0.13) 41%, transparent 47%, transparent 62%, rgba(255,255,255,0.04) 66%, transparent 70%)` }} />
        <div style={{ position: "absolute", left: "8%", top: "4%", width: "70%", height: "40%", borderRadius: "50%", background: "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.09), transparent 65%)" }} />
      </div>
    </div>
  );
};

// ---------- las pistas de la llamada ----------
const Vidrio: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "linear-gradient(160deg, rgba(36,36,40,0.88), rgba(14,14,16,0.94))",
    border: "1px solid rgba(255,255,255,0.11)", boxShadow: "0 40px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)", ...style }}>{children}</div>
);
const voz = (t: number) => {
  const i = Math.round(t - V0);
  let s = 0, n = 0;
  for (let k = -2; k <= 2; k++) { const v = (ENV as number[])[i + k]; if (v !== undefined) { s += v; n++; } }
  return n ? s / n : 0;
};
// tu pista: se mueve con lo que vas diciendo mientras rompés el silencio
const nivelVos = (t: number) => {
  if (t < HABLA - 6 || t > CALLA + 2) return 0;
  const ent = interpolate(t, [HABLA - 6, HABLA + 6], [0, 1], cl) * interpolate(t, [CALLA - 8, CALLA], [1, 0], cl);
  const sil = 0.55 + 0.45 * Math.sin(t / 4.3) * Math.sin(t / 9.1 + 1);
  return ent * Math.min(1.1, Math.max(0.18, 0.35 * sil + 0.9 * voz(t)));
};
// la del cliente: plana; un pulso mínimo mientras piensa; esmeralda cuando habla primero
const pensando = (t: number) => interpolate(t, [PIENSA, PIENSA + 30, w(22.6), TESIS], [0, 1, 1, 0], cl);
const hablaCliente = (t: number) => interpolate(t, [FIN - 4, FIN + 10], [0, 1], cl);
const Pista: React.FC<{ t: number; quien: "cliente" | "vos" }> = ({ t, quien }) => {
  const W = 760, N = 120;
  const nivel = quien === "vos" ? nivelVos(t) : 0;
  const pien = quien === "cliente" ? pensando(t) : 0;
  const habla = quien === "cliente" ? hablaCliente(t) : 0;
  const pts: string[] = [];
  for (let k = 0; k <= N; k++) {
    const u = k / N, vent = Math.sin(Math.PI * u) ** 1.4;
    const ruido = (random(`r${quien}${k}${Math.floor(t / 2)}`) - 0.5);
    const y = quien === "vos"
      ? vent * 46 * nivel * (Math.sin(k * 0.55 - t * 0.5) * 0.6 + ruido * 0.9)
      : vent * (0.8 * ruido
        + pien * 7 * Math.sin(k * 0.21 - t * 0.09) * (0.6 + 0.4 * Math.sin(t / 23))
        + habla * 44 * (0.55 + 0.45 * Math.sin(t / 5.1) * Math.sin(t / 11 + 2)) * (Math.sin(k * 0.5 - t * 0.45) * 0.6 + ruido * 0.9));
    pts.push(`${(u * W).toFixed(1)},${(42 + y).toFixed(1)}`);
  }
  const activo = quien === "vos" ? nivel > 0.05 : habla > 0.05;
  const color = quien === "cliente" && habla > 0.05 ? VERDE_C : MARFIL;
  const estado = quien === "cliente"
    ? (habla > 0.05 ? "HABLANDO" : pien > 0.3 ? "PENSANDO" : "EN SILENCIO")
    : (activo ? "HABLANDO" : "EN SILENCIO");
  return (
    <Vidrio style={habla > 0 ? { border: `1px solid rgba(52,211,153,${0.11 + 0.4 * habla})`, boxShadow: `0 40px 90px rgba(0,0,0,0.65), 0 0 ${50 * habla}px rgba(16,185,129,${0.3 * habla})` } : undefined}>
      <div style={{ position: "absolute", left: 30, right: 30, top: 22, display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: MONO, fontSize: 15, letterSpacing: "0.3em", color: "rgba(161,161,170,0.8)" }}>
        <span>{quien === "cliente" ? "CLIENTE" : "VOS"}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: activo ? color : pien > 0.3 ? "rgba(212,212,216,0.9)" : "rgba(161,161,170,0.8)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: activo ? color : "rgba(161,161,170,0.5)", boxShadow: activo ? `0 0 10px ${color}` : "none",
            opacity: pien > 0.3 && !activo ? 0.5 + 0.5 * Math.sin(t / 9) : 1 }} />
          {estado}
        </span>
      </div>
      <svg width={W} height={84} style={{ position: "absolute", left: 30, top: 56, overflow: "visible" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={quien === "vos" ? MARFIL : habla > 0.05 ? VERDE_C : `rgba(212,212,216,${0.55 + 0.3 * pien})`} strokeWidth={quien === "vos" || habla > 0.05 ? 2.4 : 1.6}
          strokeLinejoin="round" style={activo ? { filter: `drop-shadow(0 0 6px ${quien === "vos" ? "rgba(255,255,255,0.5)" : "rgba(16,185,129,0.8)"})` } : undefined} />
      </svg>
    </Vidrio>
  );
};

// ---------- el precio ----------
const fmt = (n: number) => n.toLocaleString("es-UY").replace(",", ".");
const Precio: React.FC<{ t: number }> = ({ t }) => {
  const cae = rebote(t, PRECIO - 6, 12, 200);
  const vuelve = rebote(t, VUELVE, 12, 190);
  const borra = interpolate(t, [REBOB + 6, REBOB_FIN - 6], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  let actual = 2400, ultimo = -999;
  CAE.forEach((c) => { if (t >= c.en) { actual -= c.menos; ultimo = c.en; } });
  const tachado = interpolate(t, [CAE[0].en, CAE[0].en + 12], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) }) * (1 - borra);
  const golpeN = t >= ultimo ? rebote(t, ultimo, 10, 260) : 1;
  const gris = interpolate(t, [CAE[0].en, CAE[0].en + 16], [0, 1], cl) * (1 - borra);
  const ahora = interpolate(t, [REBOB, REBOB + 24], [1, 0], cl);
  const op = t < VUELVE - 10 ? interpolate(t, [PRECIO - 10, PRECIO, SIN_PRECIO, SIN_PRECIO + 30], [0, 1, 1, 0], cl) : interpolate(t, [VUELVE - 6, VUELVE + 6, LOGO + 50, LOGO + 90], [0, 1, 1, 0], cl);
  const entero = interpolate(t, [VUELVE + 6, VUELVE + 34], [0, 1], { ...cl, easing: ease });
  const esc = t < VUELVE - 10 ? 1.06 - 0.06 * cae : 1.08 - 0.08 * vuelve;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center",
      opacity: op, transform: `translateY(${(1 - (t < VUELVE - 10 ? cae : vuelve)) * -60}px) scale(${esc})` }}>
      <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.42em", color: entero > 0 ? "rgba(167,243,208,0.85)" : "rgba(161,161,170,0.85)" }}>EL PRECIO · USD</div>
      <div style={{ position: "relative", marginTop: 6, fontFamily: TIGHT, fontWeight: 600, fontSize: 210, letterSpacing: "-0.05em", lineHeight: 1,
        color: entero > 0 ? "#fafaf9" : `rgb(${239 - 120 * gris},${236 - 118 * gris},${230 - 110 * gris})`,
        textShadow: entero > 0 ? `0 0 ${50 * entero}px rgba(255,255,255,${0.18 * entero})` : undefined }}>
        2.400
        <div style={{ position: "absolute", left: -14, top: "54%", height: 7, borderRadius: 4, width: `calc(${tachado} * (100% + 28px))`, opacity: tachado > 0.001 ? 1 : 0, background: "rgba(161,161,170,0.9)", transform: "rotate(-4deg)", transformOrigin: "0 50%" }} />
        {/* entero: una línea esmeralda que lo subraya */}
        {entero > 0 && <div style={{ position: "absolute", left: "50%", bottom: -18, height: 4, borderRadius: 2, width: `${entero * 100}%`, transform: "translateX(-50%)",
          background: VERDE_C, boxShadow: `0 0 18px rgba(16,185,129,0.9)` }} />}
      </div>
      {t >= CAE[0].en && ahora > 0 && (
        <div style={{ marginTop: 10, fontFamily: TIGHT, fontWeight: 600, fontSize: 104, letterSpacing: "-0.045em", color: "#8f8f97", lineHeight: 1, opacity: ahora,
          filter: ahora < 1 ? `blur(${(1 - ahora) * 12}px)` : undefined,
          transform: `scale(${1.25 - 0.25 * golpeN}) translateY(${(1 - golpeN) * 20}px)`, display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: 70, color: "#71717a" }}>ahora</span>{fmt(actual)}
        </div>
      )}
    </div>
  );
};
// una cifra que cae y se descuenta; en el rebobinado vuelve a subir
const Descuento: React.FC<{ t: number; en: number; menos: number; i: number }> = ({ t, en, menos, i }) => {
  const tt = t < REBOB ? t : en + 40 - (t - REBOB) * 2.2;
  const a = en - 18;
  if (tt < a || tt > en + 40) return null;
  const u = interpolate(tt, [a, en], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const sale = interpolate(tt, [en, en + 26], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      transform: `translateY(${-520 * (1 - u) + 60 * sale}px) rotate(${(i ? 5 : -6) * (1 - u)}deg) scale(${1 + 0.2 * sale})`, opacity: 1 - sale }}>
      <div style={{ padding: "16px 34px", borderRadius: 999, background: "linear-gradient(160deg, rgba(52,52,58,0.92), rgba(20,20,23,0.95))",
        border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 24px 60px rgba(0,0,0,0.7)", fontFamily: MONO, fontWeight: 500, fontSize: 52, color: MARFIL, letterSpacing: "0.02em" }}>
        − {menos}
      </div>
    </div>
  );
};

// ---------- lo que pasaba del otro lado ----------
const tipeo = (t: number, txt: string, desde: number, dur: number) => txt.slice(0, Math.round(interpolate(t, [desde, desde + dur], [0, txt.length], cl)));
const OtroLado: React.FC<{ t: number }> = ({ t }) => {
  const l1 = "2.400 ÷ 12 = 200 por mes", l2 = "¿Cómo se lo planteo a mi socio?";
  const t1 = tipeo(t, l1, w(16.7), 50), t2 = tipeo(t, l2, w(18.2), 80);
  const cursor = Math.floor(t / 16) % 2 === 0;
  return (
    <Vidrio style={{ borderRadius: 28 }}>
      <div style={{ position: "absolute", left: 36, right: 36, top: 28, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 15, letterSpacing: "0.32em", color: "rgba(161,161,170,0.85)" }}>
        <span>DEL OTRO LADO</span><span>NO ERA UN NO</span>
      </div>
      <div style={{ position: "absolute", left: 36, top: 72, fontFamily: MONO, fontWeight: 500, fontSize: 40, color: MARFIL, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
        {t1}{t1.length < l1.length && t1.length > 0 && cursor ? "▍" : ""}
      </div>
      <div style={{ position: "absolute", left: 36, top: 136, fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 50, color: "#f4f4f5", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {t2}{t2.length > 0 && t2.length < l2.length && cursor ? "▍" : ""}
      </div>
    </Vidrio>
  );
};

// ---------- texto ----------
const Palabra: React.FC<{ t: number; en: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, en, children, style }) => {
  const r = rebote(t, en, 13, 160);
  const vis = interpolate(t, [en - 1, en + 7], [0, 1], cl);
  return <span style={{ display: "inline-block", opacity: vis, transform: `translateY(${(1 - r) * 40}px) scale(${0.95 + 0.05 * r})`, filter: `blur(${(1 - vis) * 14}px)`, ...style }}>{children}</span>;
};
const italica: React.CSSProperties = { fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.19em", letterSpacing: "-0.02em" };
const acento = (t: number, en: number): React.CSSProperties => ({ ...italica, color: VERDE_C,
  textShadow: `0 0 40px rgba(16,185,129,${0.45 * interpolate(t, [en, en + 30], [1, 0.4], cl)})` });
type Pal = { p: string; s: number; ac?: boolean; it?: boolean };
const Frase: React.FC<{ t: number; renglones: Pal[][]; hasta: number; tam?: number }> = ({ t, renglones, hasta, tam = 100 }) => {
  const primera = w(renglones[0][0].s);
  const op = interpolate(t, [w(hasta) - 2, w(hasta) + 8], [1, 0], cl);
  if (t < primera - 30 || op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 230 + Math.sin(t / 80) * 5, opacity: op, filter: op < 1 ? `blur(${(1 - op) * 18}px)` : undefined, transform: `translateX(${Math.sin(t / 110) * 7}px)` }}>
      <div style={{ textAlign: "center", color: "#f4f4f5", fontFamily: TIGHT, fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.05 }}>
        {renglones.map((r, i) => (
          <div key={i}>{r.map((pl, j) => (
            <React.Fragment key={j}>{j > 0 && " "}<Palabra t={t} en={w(pl.s) - 2} style={pl.ac ? acento(t, w(pl.s)) : pl.it ? italica : undefined}>{pl.p}</Palabra></React.Fragment>
          ))}</div>
        ))}
      </div>
    </div>
  );
};
const pal = (txt: string, ...s: number[]): Pal[] => txt.split(" ").map((p, i) => ({ p: p.replace(/[*_]/g, ""), s: s[i], ac: p.startsWith("*"), it: p.startsWith("_") }));

const FRASES: { r: Pal[][]; hasta: number; tam?: number }[] = [
  { r: [pal("Y vos le contestaste", 20.46, 20.64, 20.8, 20.92), pal("una pregunta", 21.46, 21.62), pal("que nunca _hizo.", 21.98, 22.24, 22.56)], hasta: 23.2, tam: 96 },
  { r: [pal("Aguantar", 23.28), pal("*siete segundos", 23.62, 23.92), pal("callado,", 24.32)], hasta: 24.98, tam: 112 },
  { r: [pal("parece fácil,", 25.04, 25.36), pal("hasta que te _toca.", 25.98, 26.34, 26.5, 26.64)], hasta: 27.12, tam: 108 },
  { r: [pal("Y no se aprende", 27.18, 27.28, 27.36, 27.48), pal("_leyendo:", 27.84)], hasta: 28.44, tam: 112 },
  { r: [pal("se aprende", 28.5, 28.66), pal("*aguantándolos,", 28.98)], hasta: 29.74, tam: 112 },
  { r: [pal("contra alguien", 29.8, 30.3), pal("que te mira", 30.5, 30.7, 30.86), pal("y no dice _nada.", 31.14, 31.48, 31.64, 31.9)], hasta: 32.5, tam: 100 },
  { r: [pal("En Ring Closers", 32.6, 32.68, 32.88), pal("hacés *roleplay", 33.56, 33.92), pal("con otros closers.", 34.4, 34.62, 34.82)], hasta: 35.5, tam: 100 },
  { r: [pal("Round", 35.58), pal("tras _round.", 35.92, 36.14)], hasta: 36.7, tam: 124 },
  { r: [pal("Hasta que el silencio", 36.76, 36.92, 37.06, 37.14), pal("deja de _pesarte,", 37.58, 37.96, 38.12)], hasta: 38.56, tam: 100 },
  { r: [pal("y el que habla primero", 38.62, 38.96, 39.06, 39.16, 39.3), pal("es el *cliente.", 39.76, 40.18, 40.32)], hasta: 40.9, tam: 96 },
];

// ---------- la escena ----------
const Escena: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camara(t), fz: foco(t) };
  const fren = Math.max(t >= FRENA && t < REBOB ? Math.exp(-(t - FRENA) / 30) : 0, t >= FIN ? Math.exp(-(t - FIN) / 40) : 0);
  const otro = interpolate(t, [PIENSA, PIENSA + 30, PIENSA_FIN, PIENSA_FIN + 24], [0, 1, 1, 0], { ...cl, easing: ease });
  const textos = interpolate(t, [w(20.2), w(20.46), w(40.9), w(41.1)], [0, 1, 1, 0], cl);
  const ronda = nRound(t);
  const verde = interpolate(t, [FIN, FIN + 40, LOGO + 60, LOGO + 140], [0, 1, 1, 0.6], cl);
  return (
    <AbsoluteFill style={{ background: "#050506", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 42% at 50% ${48 + Math.sin(t / 90) * 2}%, rgba(235,232,226,${0.085 + 0.05 * fren}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 22% at 62% 40%, rgba(16,185,129,${0.05 + 0.015 * Math.sin(t / 20)}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 45% at 50% 52%, rgba(16,185,129,${0.13 * verde}), transparent 70%)` }} />
      {[0, 1, 2].map((i) => (
        <Capa key={i} k={k} x={0} y={0} z={900 + i * 700} w={2000 + i * 500} h={2000 + i * 500} op={0.5 - 0.12 * i} dof={1} rot={t * (0.05 + 0.03 * i) * (i % 2 ? -1 : 1)}>
          <svg width={2000 + i * 500} height={2000 + i * 500} style={{ overflow: "visible" }}>
            <circle cx={(2000 + i * 500) / 2} cy={(2000 + i * 500) / 2} r={(2000 + i * 500) / 2 - 4} fill="none" stroke="rgba(239,236,230,0.22)" strokeWidth={2}
              strokeDasharray={i === 1 ? "2 22" : i === 2 ? "1 9" : undefined} />
          </svg>
        </Capa>
      ))}
      {Array.from({ length: 46 }, (_, i) => {
        const z = -700 + random(`z${i}`) * 1800;
        const x = (random(`x${i}`) - 0.5) * 2200 + Math.sin(t / 80 + i) * 20;
        const y = ((random(`y${i}`) - 0.5) * 4400 - t * (0.3 + random(`v${i}`) * 0.5) + 99999) % 4400 - 2200 - 500;
        const tam = 3 + random(`s${i}`) * 5;
        return (
          <Capa key={i} k={k} x={x} y={y} z={z} w={tam} h={tam} op={0.25 + 0.35 * random(`o${i}`)} dof={1.2}>
            <div style={{ width: tam, height: tam, borderRadius: tam, background: "#f4f4f5" }} />
          </Capa>
        );
      })}

      <Capa k={k} x={0} y={-690} z={-230} w={1000} h={380} dof={0.9}><Precio t={t} /></Capa>
      {CAE.map((c, i) => (
        <Capa key={i} k={k} x={i ? 190 : -170} y={-640} z={-300} w={400} h={140} dof={0.9}><Descuento t={t} en={c.en} menos={c.menos} i={i} /></Capa>
      ))}

      <Capa k={k} x={0} y={20} z={0} w={D} h={D} dof={0.9} rot={-1.5 + golpe(t, FRENA, 1.2) + golpe(t, FIN, 1)}><Cronometro t={t} brillo={fren} /></Capa>

      {/* el round en curso */}
      {ronda > 0 && (() => {
        const en = ROUNDS[ronda - 1];
        const r = rebote(t, en, 11, 200);
        const op = interpolate(t, [ROUNDS[0], ROUNDS[0] + 8, w(40.9), LOGO], [0, 1, 1, 0], cl);
        return (
          <Capa k={k} x={330} y={-360} z={-140} w={210} h={150} op={op} dof={0.9} rot={2}>
            <Vidrio style={{ borderColor: "rgba(52,211,153,0.35)" }}>
              <div style={{ position: "absolute", left: 26, top: 24, fontFamily: MONO, fontSize: 15, letterSpacing: "0.32em", color: "rgba(167,243,208,0.85)" }}>ROUND</div>
              <div style={{ position: "absolute", left: 22, top: 44, fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 92, lineHeight: 1, color: "#f4f4f5",
                transform: `translateY(${(1 - r) * 30}px) scale(${0.9 + 0.1 * r})`, transformOrigin: "0 50%", opacity: interpolate(t, [en, en + 5], [0, 1], cl) }}>{ronda}</div>
              <div style={{ position: "absolute", right: 24, top: 76, fontFamily: MONO, fontSize: 18, color: "rgba(161,161,170,0.8)" }}>/ 3</div>
            </Vidrio>
          </Capa>
        );
      })()}

      <Capa k={k} x={0} y={630} z={-160} w={820} h={150} dof={0.9} rot={0.8}><Pista t={t} quien="cliente" /></Capa>
      <Capa k={k} x={0} y={800} z={-200} w={820} h={150} dof={0.9} rot={0.8}><Pista t={t} quien="vos" /></Capa>

      {otro > 0 && (
        <Capa k={k} x={0} y={400} z={-420 - 300 * (1 - otro)} w={800} h={230} op={otro} dof={0.8} rot={-1}><OtroLado t={t} /></Capa>
      )}

      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 52%, rgba(255,255,255,${0.12 * fren}), transparent 55%)` }} />

      {/* oscurece arriba para que se lea la frase */}
      {textos > 0 && <AbsoluteFill style={{ opacity: textos, background: "linear-gradient(180deg, rgba(5,5,6,0.96) 0%, rgba(5,5,6,0.9) 24%, rgba(5,5,6,0.45) 33%, transparent 42%)" }} />}
      {FRASES.map((fr, i) => <Frase key={i} t={t} renglones={fr.r} hasta={fr.hasta} tam={fr.tam} />)}

      {/* logo */}
      {(() => {
        const op = interpolate(t, [LOGO - 6, LOGO + 8], [0, 1], cl);
        if (op <= 0) return null;
        const c1 = w(42.0), c2 = w(43.42);
        return (
          <Capa k={k} x={0} y={-1560} z={-250} w={1060} h={820} esc={1.75} op={op} dof={0.3}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.55))", transform: `scale(${0.85 + 0.15 * rebote(t, LOGO, 12, 170)})` }}>
                <Logo size={260} dibujoEn={LOGO} />
              </div>
              <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: "0.4em", color: "rgba(167,243,208,0.85)", whiteSpace: "nowrap",
                opacity: interpolate(t, [LOGO + 6, LOGO + 22], [0, 1], cl), transform: `translateY(${interpolate(t, [LOGO + 6, LOGO + 26], [16, 0], { ...cl, easing: ease })}px)` }}>
                RING CLOSERS
              </div>
              <div style={{ marginTop: 44, fontFamily: TIGHT, fontWeight: 600, fontSize: 92, color: "#f4f4f5", letterSpacing: "-0.045em", lineHeight: 1.08, textAlign: "center", whiteSpace: "nowrap" }}>
                <div><Palabra t={t} en={c1}>Practicá</Palabra>{" "}<Palabra t={t} en={w(42.4)}>con</Palabra>{" "}<Palabra t={t} en={w(42.64)}>closers.</Palabra></div>
                <div><Palabra t={t} en={c2} style={acento(t, c2)}>Cerrá</Palabra>{" "}<Palabra t={t} en={w(43.76)} style={acento(t, w(43.76))}>con</Palabra>{" "}<Palabra t={t} en={w(43.92)} style={acento(t, w(43.92))}>clientes.</Palabra></div>
              </div>
            </div>
          </Capa>
        );
      })()}
    </AbsoluteFill>
  );
};

export const VideoSilencio: React.FC = () => {
  const f = useCurrentFrame();
  const n = 6;
  return (
    <AbsoluteFill style={{ background: "#050506" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={f - 0.3 + (0.6 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="granoSilencioV"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#granoSilencioV)" /></svg>
      <AbsoluteFill style={{ background: "#050506", opacity: interpolate(f, [0, 8, DUR_SILENCIO - 24, DUR_SILENCIO - 1], [1, 0, 0, 1], cl) }} />
      <Sequence from={V0}><Audio src={staticFile("voz-silencio-rc/voz.mp3")} /></Sequence>
      <Audio src={staticFile("silencio-rc/sonido.wav")} />
    </AbsoluteFill>
  );
};
