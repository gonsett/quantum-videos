import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Capa, Ctx, Cam, cl, ease, rebote, TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { MONO } from "../ring-closers/tema";

/**
 * "Los 7 segundos" — MUESTRA de 5,5 s (11/10/2026), 60 fps, sin voz.
 * El precio cae sobre la mesa, se aprieta el cronómetro y corre el silencio: uno, dos.
 * A los 2,1 s el closer rompe el silencio (su pista se mueve, la del cliente sigue plana) y caen dos
 * descuentos que tachan el precio. La aguja se clava en 4,2. La marca del 7 queda encendida en esmeralda,
 * lejos: es a donde nunca llegó.
 */
const ARRANCA = 30;                    // se aprieta el pulsador
const FRENA = ARRANCA + 252;           // 4,2 s
const HABLA = ARRANCA + 126;           // 2,1 s: rompés el silencio
const CAE = [{ en: 186, menos: 300 }, { en: 244, menos: 200 }];
export const DUR_SIL_MUESTRA = 330;

const VERDE = "#10b981", VERDE_C = "#34d399";
const MARFIL = "#efece6";

// segundos del cronómetro: avanza a saltos de 1/5 como un escape mecánico
const agujaSeg = (t: number) => {
  const s = Math.min(Math.max(0, t - ARRANCA), FRENA - ARRANCA) / 60;
  if (t >= FRENA) return s;
  const paso = Math.floor(s * 5), u = s * 5 - paso;
  const e = 1 - Math.pow(1 - Math.min(1, u / 0.2), 3);
  return (paso + e) / 5;
};

// ---------- cámara: spline de Hermite sobre llaves [t, x, y, z] ----------
type Llave = [number, number, number, number];
const LLAVES: Llave[] = [
  [0, 0, -120, -2450],
  [ARRANCA, 0, -40, -2150],
  [150, 0, 70, -1720],
  [CAE[0].en - 6, 0, -170, -1900],
  [CAE[1].en + 10, 0, -120, -1800],
  [FRENA, 0, -60, -1560],
  [DUR_SIL_MUESTRA, 0, -60, -1500],
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
  const sy = golpe(t, 14, 5) + golpe(t, CAE[0].en, 9) + golpe(t, CAE[1].en, 9) + golpe(t, FRENA, 14);
  const sx = golpe(t, FRENA, -5);
  return {
    x: k.x + Math.sin(t / 95) * 10 + sx,
    y: k.y + Math.sin(t / 75) * 6 + sy,
    z: k.z,
    roll: (interpolate(t, [0, 90], [-2.5, 0], { ...cl, easing: ease }) + Math.sin(t / 120) * 0.4 + golpe(t, FRENA, 0.5)) * Math.PI / 180,
    yaw: Math.sin(t / 130) * 1.1 * Math.PI / 180,
    pitch: Math.sin(t / 140) * 0.8 * Math.PI / 180,
  };
};
// foco: el cronómetro; salta al precio cuando caen los descuentos
const foco = (t: number) => interpolate(t, [CAE[0].en - 24, CAE[0].en - 8, CAE[1].en + 14, CAE[1].en + 34], [0, -300, -300, 0], { ...cl, easing: ease });

// ---------- el cronómetro ----------
const R = 430;                         // radio del bisel
const D = R * 2;
const pol = (deg: number, r: number) => [D / 2 + r * Math.sin((deg * Math.PI) / 180), D / 2 - r * Math.cos((deg * Math.PI) / 180)];

const Cronometro: React.FC<{ t: number; brillo: number }> = ({ t, brillo }) => {
  const s = agujaSeg(t);
  const ang = s * 36;                                   // 10 s por vuelta
  const decimas = Math.min(Math.max(0, t - ARRANCA), FRENA - ARRANCA) / 60;
  const subAng = (decimas % 1) * 360;
  const fren = rebote(t, FRENA, 9, 260);
  const parado = t >= FRENA;
  const lectura = decimas.toFixed(1).replace(".", ",");
  // el número del segundo que se cumple se enciende
  const encendido = (n: number) => {
    const en = ARRANCA + n * 60;
    if (t < en || n === 0) return 0;
    return Math.exp(-(t - en) / 26);
  };
  const siete = 0.55 + 0.12 * Math.sin(t / 14);
  const brilloBisel = 120 + Math.sin(t / 70) * 25 + brillo * 20;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* sombra al piso */}
      <div style={{ position: "absolute", left: 60, right: 60, top: D - 40, height: 120, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85), transparent 70%)", filter: "blur(18px)" }} />
      {/* pulsador y corona */}
      {(() => {
        const aprieta = Math.max(Math.exp(-Math.max(0, t - ARRANCA) / 6) * (t >= ARRANCA - 1 ? 1 : 0), parado ? Math.exp(-(t - FRENA) / 6) : 0);
        return (
          <>
            <div style={{ position: "absolute", left: D / 2 - 34, top: -62 + 16 * aprieta, width: 68, height: 52, borderRadius: "10px 10px 4px 4px",
              background: "linear-gradient(90deg, #3f3f46, #e4e4e7 35%, #a1a1aa 55%, #27272a)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4)" }} />
            <div style={{ position: "absolute", left: D / 2 - 52, top: -14, width: 104, height: 34, borderRadius: 6,
              background: "repeating-linear-gradient(90deg, #52525b 0 3px, #d4d4d8 3px 5px, #3f3f46 5px 8px)", boxShadow: "0 6px 14px rgba(0,0,0,0.6)" }} />
            {[-40, 40].map((a) => {
              const [x, y] = pol(a, R + 6);
              return <div key={a} style={{ position: "absolute", left: x - 22, top: y - 30, width: 44, height: 40, borderRadius: 8, transform: `rotate(${a}deg)`,
                background: "linear-gradient(90deg, #27272a, #a1a1aa 40%, #52525b)" }} />;
            })}
          </>
        );
      })()}
      {/* bisel metálico */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        background: `conic-gradient(from ${brilloBisel}deg, #18181b, #71717a 8%, #f4f4f5 14%, #52525b 22%, #27272a 34%, #a1a1aa 46%, #fafafa 52%, #3f3f46 60%, #18181b 72%, #8b8b93 86%, #18181b)`,
        boxShadow: "0 80px 160px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12)" }} />
      {/* moleteado */}
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
          <filter id="brillo7"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        {/* arco del 7: el objetivo */}
        {(() => {
          const r = 376, a0 = 6.6 * 36, a1 = 7.4 * 36;
          const [x0, y0] = pol(a0, r), [x1, y1] = pol(a1, r);
          return (
            <>
              <path d={`M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`} stroke={VERDE} strokeWidth={9} strokeLinecap="round" fill="none" opacity={siete} filter="url(#brillo7)" />
              <path d={`M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`} stroke={VERDE_C} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.9} />
            </>
          );
        })()}
        {/* recorrido hecho: un arco fino que crece con la aguja */}
        {s > 0.001 && (() => {
          const r = 330, a1 = Math.min(359.9, ang);
          const [x0, y0] = pol(0, r), [x1, y1] = pol(a1, r);
          return <path d={`M${x0},${y0} A${r},${r} 0 ${a1 > 180 ? 1 : 0} 1 ${x1},${y1}`} stroke="rgba(244,244,245,0.22)" strokeWidth={2} fill="none" />;
        })()}
        {/* graduación: 50 quintos, 10 segundos */}
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
        return (
          <div key={n} style={{ position: "absolute", left: x - 50, top: y - 40, width: 100, height: 80, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 64 + 26 * e, lineHeight: 1,
            color: es7 ? VERDE_C : `rgba(239,236,230,${0.62 + 0.38 * e})`,
            textShadow: es7 ? `0 0 26px rgba(16,185,129,${siete})` : `0 0 ${30 * e}px rgba(255,255,255,${0.7 * e})` }}>{n === 0 ? "10" : n}</div>
        );
      })}
      {/* ventana digital */}
      <div style={{ position: "absolute", left: D / 2 - 128, top: D / 2 - 200, width: 256, height: 76, borderRadius: 12,
        background: "linear-gradient(180deg, #050506, #0d0d10)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 4px 12px rgba(0,0,0,0.9)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 46, letterSpacing: "0.04em",
          color: parado ? "#ffffff" : MARFIL, transform: `scale(${1 + 0.1 * (parado ? 1 - fren : 0) + (parado ? 0.04 : 0)})`,
          textShadow: parado ? "0 0 22px rgba(255,255,255,0.55)" : "none" }}>{lectura.padStart(4, "0")}</span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: "rgba(161,161,170,0.8)", marginTop: 14 }}>s</span>
      </div>
      {/* rótulos */}
      <div style={{ position: "absolute", left: 0, right: 0, top: D / 2 + 70, textAlign: "center", fontFamily: MONO, fontSize: 15, letterSpacing: "0.42em", color: "rgba(161,161,170,0.7)" }}>SILENCIO · 1/10 s</div>
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
        {/* sombra */}
        <div style={{ position: "absolute", left: -2 + 8, top: -340 + 10, width: 4, height: 420, background: "rgba(0,0,0,0.6)", filter: "blur(5px)" }} />
        <div style={{ position: "absolute", left: -1.6, top: -352, width: 3.2, height: 352, borderRadius: 2, background: `linear-gradient(180deg, ${parado ? "#ffffff" : MARFIL}, #d4d4d8)`,
          boxShadow: parado ? "0 0 14px rgba(255,255,255,0.6)" : "0 0 6px rgba(255,255,255,0.25)" }} />
        <div style={{ position: "absolute", left: -6, top: 0, width: 12, height: 86, borderRadius: 6, background: "linear-gradient(90deg, #52525b, #e4e4e7, #52525b)" }} />
        <div style={{ position: "absolute", left: -11, top: 58, width: 22, height: 22, borderRadius: 11, background: "linear-gradient(135deg, #e4e4e7, #52525b)" }} />
      </div>
      <div style={{ position: "absolute", left: D / 2 - 22, top: D / 2 - 22, width: 44, height: 44, borderRadius: 22,
        background: "radial-gradient(circle at 35% 30%, #fafafa, #a1a1aa 40%, #27272a)", boxShadow: "0 4px 10px rgba(0,0,0,0.7)" }} />
      <div style={{ position: "absolute", left: D / 2 - 7, top: D / 2 - 7, width: 14, height: 14, borderRadius: 7, background: "#18181b" }} />
      {/* cristal: reflejo de vidrio que se mueve con la cámara */}
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
// energía de la voz del closer: ráfagas tipo habla, solo mientras rompe el silencio
const habla = (t: number) => {
  if (t < HABLA - 4 || t > FRENA) return 0;
  const ent = interpolate(t, [HABLA - 4, HABLA + 6], [0, 1], cl) * interpolate(t, [FRENA - 8, FRENA], [1, 0], cl);
  const sil = 0.55 + 0.45 * Math.sin(t / 4.3) * Math.sin(t / 9.1 + 1);
  return ent * Math.max(0.12, sil);
};
const Pista: React.FC<{ t: number; quien: "cliente" | "vos" }> = ({ t, quien }) => {
  const W = 760, N = 120;
  const nivel = quien === "vos" ? habla(t) : 0;
  const pts: string[] = [];
  for (let k = 0; k <= N; k++) {
    const u = k / N, vent = Math.sin(Math.PI * u) ** 1.4;
    const ruido = (random(`r${quien}${k}${Math.floor(t / 2)}`) - 0.5);
    const y = quien === "vos"
      ? vent * 46 * nivel * (Math.sin(k * 0.55 - t * 0.5) * 0.6 + ruido * 0.9)
      : vent * 0.8 * ruido;
    pts.push(`${(u * W).toFixed(1)},${(42 + y).toFixed(1)}`);
  }
  const activo = quien === "vos" && nivel > 0.05;
  return (
    <Vidrio>
      <div style={{ position: "absolute", left: 30, right: 30, top: 22, display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: MONO, fontSize: 15, letterSpacing: "0.3em", color: "rgba(161,161,170,0.8)" }}>
        <span>{quien === "cliente" ? "CLIENTE" : "VOS"}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: activo ? MARFIL : "rgba(161,161,170,0.8)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: activo ? MARFIL : "rgba(161,161,170,0.5)", boxShadow: activo ? "0 0 10px #fff" : "none" }} />
          {quien === "cliente" ? "EN SILENCIO" : activo ? "HABLANDO" : "EN SILENCIO"}
        </span>
      </div>
      <svg width={W} height={84} style={{ position: "absolute", left: 30, top: 56, overflow: "visible" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={quien === "vos" ? MARFIL : "rgba(212,212,216,0.55)"} strokeWidth={quien === "vos" ? 2.4 : 1.6}
          strokeLinejoin="round" style={activo ? { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))" } : undefined} />
      </svg>
    </Vidrio>
  );
};

// ---------- el precio ----------
const fmt = (n: number) => n.toLocaleString("es-UY").replace(",", ".");
const Precio: React.FC<{ t: number }> = ({ t }) => {
  const cae = rebote(t, 8, 12, 200);
  let actual = 2400, ultimo = -999;
  CAE.forEach((c) => { if (t >= c.en) { actual -= c.menos; ultimo = c.en; } });
  const tachado = interpolate(t, [CAE[0].en, CAE[0].en + 12], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const golpeN = t >= ultimo ? rebote(t, ultimo, 10, 260) : 1;
  const gris = interpolate(t, [CAE[0].en, CAE[0].en + 16], [0, 1], cl);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center",
      opacity: interpolate(t, [4, 14], [0, 1], cl), transform: `translateY(${(1 - cae) * -60}px) scale(${1.06 - 0.06 * cae})` }}>
      <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.42em", color: "rgba(161,161,170,0.85)" }}>EL PRECIO · USD</div>
      <div style={{ position: "relative", marginTop: 6, fontFamily: TIGHT, fontWeight: 600, fontSize: 210, letterSpacing: "-0.05em", lineHeight: 1,
        color: `rgb(${239 - 120 * gris},${236 - 118 * gris},${230 - 110 * gris})` }}>
        2.400
        <div style={{ position: "absolute", left: -14, top: "54%", height: 7, borderRadius: 4, width: `calc(${tachado} * (100% + 28px))`, opacity: tachado > 0 ? 1 : 0, background: "rgba(161,161,170,0.9)", transform: "rotate(-4deg)", transformOrigin: "0 50%" }} />
      </div>
      {t >= CAE[0].en && (
        <div style={{ marginTop: 10, fontFamily: TIGHT, fontWeight: 600, fontSize: 104, letterSpacing: "-0.045em", color: "#8f8f97", lineHeight: 1,
          transform: `scale(${1.25 - 0.25 * golpeN}) translateY(${(1 - golpeN) * 20}px)`, display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: 70, color: "#71717a" }}>ahora</span>{fmt(actual)}
        </div>
      )}
    </div>
  );
};
// una cifra que cae y se descuenta
const Descuento: React.FC<{ t: number; en: number; menos: number; i: number }> = ({ t, en, menos, i }) => {
  const a = en - 18;
  if (t < a || t > en + 40) return null;
  const u = interpolate(t, [a, en], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const sale = interpolate(t, [en, en + 26], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
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

// ---------- la escena ----------
const Escena: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camara(t), fz: foco(t) };
  const fren = t >= FRENA ? Math.exp(-(t - FRENA) / 30) : 0;
  return (
    <AbsoluteFill style={{ background: "#050506", overflow: "hidden" }}>
      {/* foco cenital sobre el cronómetro */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 42% at 50% ${48 + Math.sin(t / 90) * 2}%, rgba(235,232,226,${0.085 + 0.05 * fren}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 22% at 62% 40%, rgba(16,185,129,${0.05 + 0.015 * Math.sin(t / 20)}), transparent 70%)` }} />
      {/* anillos lejanos: el eco de la esfera, girando despacio */}
      {[0, 1, 2].map((i) => (
        <Capa key={i} k={k} x={0} y={0} z={900 + i * 700} w={2000 + i * 500} h={2000 + i * 500} op={0.5 - 0.12 * i} dof={1} rot={t * (0.05 + 0.03 * i) * (i % 2 ? -1 : 1)}>
          <svg width={2000 + i * 500} height={2000 + i * 500} style={{ overflow: "visible" }}>
            <circle cx={(2000 + i * 500) / 2} cy={(2000 + i * 500) / 2} r={(2000 + i * 500) / 2 - 4} fill="none" stroke="rgba(239,236,230,0.22)" strokeWidth={2}
              strokeDasharray={i === 1 ? "2 22" : i === 2 ? "1 9" : undefined} />
          </svg>
        </Capa>
      ))}
      {/* polvo en la luz */}
      {Array.from({ length: 46 }, (_, i) => {
        const z = -700 + random(`z${i}`) * 1800;
        const x = (random(`x${i}`) - 0.5) * 2200 + Math.sin(t / 80 + i) * 20;
        const y = (random(`y${i}`) - 0.5) * 3000 - t * (0.3 + random(`v${i}`) * 0.5);
        const tam = 3 + random(`s${i}`) * 5;
        return (
          <Capa key={i} k={k} x={x} y={y} z={z} w={tam} h={tam} op={0.25 + 0.35 * random(`o${i}`)} dof={1.2}>
            <div style={{ width: tam, height: tam, borderRadius: tam, background: "#f4f4f5" }} />
          </Capa>
        );
      })}

      {/* el precio, adelante del cronómetro */}
      <Capa k={k} x={0} y={-690} z={-230} w={1000} h={380} dof={0.9}><Precio t={t} /></Capa>
      {CAE.map((c, i) => (
        <Capa key={i} k={k} x={i ? 190 : -170} y={-640} z={-300} w={400} h={140} dof={0.9}><Descuento t={t} en={c.en} menos={c.menos} i={i} /></Capa>
      ))}

      {/* el cronómetro */}
      <Capa k={k} x={0} y={20} z={0} w={D} h={D} dof={0.9} rot={-1.5 + golpe(t, FRENA, 1.2)}><Cronometro t={t} brillo={fren} /></Capa>

      {/* la llamada */}
      <Capa k={k} x={0} y={630} z={-160} w={820} h={150} dof={0.9} rot={0.8}><Pista t={t} quien="cliente" /></Capa>
      <Capa k={k} x={0} y={800} z={-200} w={820} h={150} dof={0.9} rot={0.8}><Pista t={t} quien="vos" /></Capa>

      {/* destello al frenar */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 52%, rgba(255,255,255,${0.12 * fren}), transparent 55%)` }} />
    </AbsoluteFill>
  );
};

export const MuestraSilencio: React.FC = () => {
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
        <filter id="granoSilencio"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#granoSilencio)" /></svg>
      <AbsoluteFill style={{ background: "#050506", opacity: interpolate(f, [0, 8], [1, 0], cl) }} />
      <Audio src={staticFile("silencio-rc/muestra.wav")} />
    </AbsoluteFill>
  );
};
