/**
 * "Un año en treinta segundos" (Logros, 27/09/2026). Lenguaje NUEVO: sala de museo a oscuras, un cono de
 * luz cenital, los 14 trofeos reales de la app que caen uno por uno bajo la luz, el contador de días como
 * reloj del video y una vitrina de 14 huecos que se llena. Un solo plano continuo (la sala nunca corta).
 * Ritmo: abre liviano (1-4), se frena en la racha (5), acelera (6-10), ráfaga (11-14), vitrina llena y placa.
 * Todos los tiempos salen de la voz (`timeline.ts`).
 */
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { RC, DISPLAY } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";
import { Logo } from "../reel-rc/logo";
import { SANS, SERIF } from "../historias-rc/como-funciona";
import { TROFEOS } from "./Muestra";
import { G, INI, TOTAL } from "./timeline";

export const DURACION = TOTAL;
const TINTE = ["#b45309", "#eab308", "#eab308", "#a1a1aa", "#eab308", "#b45309", "#b45309", "#b45309", "#a1a1aa", "#a1a1aa", "#eab308", "#f97316", "#eab308", "#3b82f6"];
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sale = Easing.out(Easing.cubic);
const imp = (f: number, t: number, k = 0.3) => (f < t ? 0 : Math.exp(-(f - t) * k));
const r = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const src = (id: string) => staticFile(`logros-rc/${id}.webp`);

const NOMBRES: Record<string, string> = {
  first_roleplay: "PRIMER COMBATE", five_stars: "NOQUEASTE", first_week_complete: "SEMANA PERFECTA", ten_roleplays: "DIEZ PELEAS",
  streak_3: "RACHA DE 3", tenure_1m: "UN MES EN EL RING", first_purchase: "PRIMERA COMPRA", cash_10k: "PRIMEROS $10.000",
  tenure_3m: "TRES MESES EN EL RING", cash_50k: "PRIMEROS $50.000", tenure_6m: "SEIS MESES EN EL RING", streak_10: "RACHA DE 10",
  cash_100k: "PRIMEROS $100.000", tenure_1y: "UN AÑO EN EL RING",
};

/** Cuándo cae cada trofeo (anclado a la palabra fuerte) y en qué día va el contador. */
const hitos = () => [
  { t: G("e2-dia-uno", "primer") - 10, dia: 1 },
  { t: G("e2-dia-uno", "Noqueaste") - 10, dia: 5 },
  { t: G("e3-semana", "semana") - 10, dia: 7 },
  { t: G("e3-semana", "diez") - 10, dia: 12 },
  { t: G("e4-racha", "Tres") - 10, dia: 21 },
  { t: G("e5-acelera", "mes") - 10, dia: 30 },
  { t: G("e5-acelera", "compra") - 10, dia: 38 },
  { t: G("e5-acelera", "Diez") - 10, dia: 52 },
  { t: G("e5-acelera", "meses") - 10, dia: 90 },
  { t: G("e5-acelera", "Cincuenta") - 10, dia: 124 },
  { t: G("e6-rafaga", "Seis") - 10, dia: 180 },
  { t: G("e6-rafaga", "semanas") - 10, dia: 251 },
  { t: G("e6-rafaga", "Cien") - 10, dia: 310 },
  { t: G("e6-rafaga", "año") - 10, dia: 365 },
];

/* ───────── piezas ───────── */

const Cono: React.FC<{ o: number }> = ({ o }) => (
  <>
    <div style={{ position: "absolute", left: 50, top: 470, width: 980, height: 900, filter: "blur(28px)", opacity: o,
      clipPath: "polygon(41% 0%, 59% 0%, 100% 100%, 0% 100%)",
      background: "linear-gradient(180deg, rgba(250,250,250,0) 0%, rgba(250,250,250,0.15) 22%, rgba(250,250,250,0.06) 60%, rgba(250,250,250,0) 100%)" }} />
    <div style={{ position: "absolute", left: 50, top: 1280, width: 980, height: 180, borderRadius: "50%", opacity: o,
      background: "radial-gradient(ellipse, rgba(250,250,250,0.10) 0%, transparent 70%)", filter: "blur(10px)" }} />
  </>
);

const Contador: React.FC<{ dia: number; o: number; y: number }> = ({ dia, o, y }) => (
  <div style={{ position: "absolute", top: 270 + y, left: 96, right: 96, display: "flex", alignItems: "flex-end", justifyContent: "space-between", opacity: o }}>
    <div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: RC.platino500 }}>DÍA</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 230, lineHeight: 0.85, marginTop: 10, letterSpacing: -6, fontVariantNumeric: "tabular-nums", background: "linear-gradient(180deg,#ffffff 0%,#d4d4d8 45%,#71717a 100%)", WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 30px rgba(16,185,129,0.35))" }}>{dia}</div>
    </div>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "#52525b", paddingBottom: 18 }}>de 365</div>
  </div>
);

/** Chispas que salen del trofeo al caer. */
const Chispas: React.FC<{ f: number; t: number; n: number; seed: number }> = ({ f, t, n, seed }) => {
  const p = f - t;
  if (p < 0 || p > 26) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = r(i, seed) * Math.PI * 2, v = 9 + r(i, seed + 1) * 16;
        const x = 540 + Math.cos(a) * v * p, y = 1000 + Math.sin(a) * v * p * 0.8 + p * p * 0.35;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 7, height: 7, borderRadius: 4,
          background: r(i, seed + 2) > 0.6 ? RC.esmeralda400 : "#fde68a", opacity: 1 - p / 26, boxShadow: "0 0 10px rgba(253,230,138,0.8)" }} />;
      })}
    </>
  );
};

/* ───────── video ───────── */

export const LogrosVideo: React.FC = () => {
  const f = useCurrentFrame();
  const H = hitos();
  const ini1 = INI("e1-gancho"), ini4 = INI("e4-racha"), ini5 = INI("e5-acelera"), ini7 = INI("e7-cierre");
  const catorce = G("e7-cierre", "Catorce") - 4;
  const primero = G("e7-cierre", "primero") - 6;

  // trofeo actual
  let k = -1;
  H.forEach((h, i) => { if (f >= h.t) k = i; });
  const tK = k >= 0 ? H[k].t : ini1 + 1;
  const tNext = k + 1 < H.length ? H[k + 1].t : Infinity;
  const kv = k < 0 ? 13 : k;

  // contador: rueda del día anterior al nuevo en 8 cuadros
  const diaPrev = k > 0 ? H[k - 1].dia : 1;
  const dia = k < 0 ? Math.round(interpolate(f, [ini1 + 18, H[0].t - 6], [365, 1], { ...cl, easing: Easing.inOut(Easing.cubic) })) : Number.isFinite(tNext) ? Math.round(interpolate(f, [tK, tK + 8, tNext], [diaPrev, H[k].dia, H[k + 1].dia - 1], cl)) : H[k].dia;

  // racha: la sala se frena y empuja hacia adentro
  const enRacha = k === 4 && f < ini5;
  const push = (enRacha ? interpolate(f, [tK, ini5], [1, 1.05], cl) : 1) * (1 + imp(f, tK + 8, 0.25) * 0.07);
  const rafaga = f >= INI("e6-rafaga") && f < ini7;
  const sacude = true ? imp(f, tK + 8, 0.35) * (rafaga ? 22 : 12) : 0;

  // cierre: el héroe se va, la vitrina sube y se agranda
  const cierre = interpolate(f, [catorce, catorce + 18], [0, 1], { ...cl, easing: sale });
  const conoO = Math.min(interpolate(f, [ini1, ini1 + 3], [0, 1], cl), 1 - cierre * 0.6) * (1 + imp(f, tK, 0.25) * 0.5);

  // trofeo héroe: cae con rebote; el anterior se encoge y baja hacia su hueco
  const caida = interpolate(f, [tK, tK + 10], [-520, 0], { ...cl, easing: Easing.out(Easing.back(1.4)) });
  const escalaCae = interpolate(f, [tK, tK + 5, tK + 12], [0.8, 1.06, 1], cl);
  const tam = k === 13 || k < 0 ? 1000 : 880;
  const heroO = k < 0 ? interpolate(f, [H[0].t - 14, H[0].t - 2], [1, 0], cl) : 1 - cierre;
  const salidaPrev = k > 0 ? interpolate(f, [tK, tK + 9], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) }) : 1;

  const nombreO = interpolate(f, [tK + 4, tK + 12], [0, 1], cl) * (1 - cierre);
  const d = 58, paso = 64, ancho = paso * 13 + d, x0 = (1080 - ancho) / 2;
  const vitY = interpolate(cierre, [0, 1], [1515, 1010]);
  const vitS = interpolate(cierre, [0, 1], [1, 1.12]);
  const placa = interpolate(f, [primero + 50, primero + 66], [0, 1], cl);

  return (
    <AbsoluteFill style={{ background: "#060607", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push}) translate(${sacude * (r(f, 1) - 0.5)}px, ${sacude * (r(f, 2) - 0.5)}px)` }}>
        {Array.from({ length: 26 }).map((_, i) => { const tt = 8 + r(i, 8) * 22; return <div key={"b" + i} style={{ position: "absolute", left: r(i, 7) * 1080, top: (1920 - ((f * (0.8 + r(i, 5) * 1.6) + r(i, 6) * 1920) % 1920)), width: tt, height: tt, borderRadius: "50%", background: "#fde68a", opacity: 0.06 + r(i, 9) * 0.16, filter: `blur(${2 + r(i, 8) * 7}px)` }} />; })}
        <Contador dia={dia} o={interpolate(f, [ini1, ini1 + 10], [0, 1], cl) * (1 - cierre)} y={-cierre * 40} />
        <Cono o={conoO} />
        <div style={{ position: "absolute", left: 90, top: 460, width: 900, height: 900, borderRadius: "50%", filter: "blur(80px)",
          background: `radial-gradient(circle, ${TINTE[kv]}${enRacha ? "99" : "70"} 0%, transparent 70%)`, opacity: heroO }} />

        {/* gancho: pedestal vacío */}
        {k < 0 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1350, textAlign: "center", opacity: interpolate(f, [ini1 + 8, ini1 + 20], [0, 1], cl) }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: RC.crema }}>Un año, en treinta segundos.</div>
          </div>
        ) : null}

        {/* trofeo anterior saliendo */}
        {k > 0 && salidaPrev < 1 ? (
          <Img src={src(TROFEOS[k - 1])} style={{ position: "absolute", left: 540 - 340, top: 620, width: 680, height: 680, objectFit: "contain",
            transform: `translateY(${salidaPrev * 700}px) scale(${1 - salidaPrev * 0.85})`, opacity: 1 - salidaPrev }} />
        ) : null}

        {true ? (
          <>
            <div style={{ position: "absolute", left: 540 - 250, top: 1278, width: 500, height: 60, borderRadius: "50%", background: "rgba(0,0,0,0.9)", filter: "blur(22px)", opacity: heroO }} />
            <Img src={src(TROFEOS[kv])} style={{ position: "absolute", left: 540 - tam / 2, top: 960 - tam / 2 - 20, width: tam, height: tam, objectFit: "contain",
              transform: `perspective(1400px) translateY(${caida + Math.sin(f / 9) * 14}px) scale(${escalaCae * (1 - cierre * 0.3) * (1 + Math.min(f - tK, 90) * 0.0012)}) rotateY(${Math.sin(f / 13) * 12}deg) rotate(${Math.sin(f / 18) * 2}deg)`, opacity: heroO,
              filter: `drop-shadow(0 40px 50px rgba(0,0,0,0.75)) brightness(${1 + imp(f, tK + 6, 0.2) * 0.5})` }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: enRacha ? 1318 : 1350, textAlign: "center", opacity: nombreO }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 40, letterSpacing: 10, color: RC.esmeralda400 }}>{NOMBRES[TROFEOS[k]]}</div>
              {enRacha ? (
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 58, color: RC.crema, marginTop: 18,
                  opacity: interpolate(f, [G("e4-racha", "suerte") - 4, G("e4-racha", "suerte") + 6], [0, 1], cl) }}>Ya no es suerte: es costumbre.</div>
              ) : null}
            </div>
            <Chispas f={f} t={tK + 8} n={k === 13 || k < 0 ? 40 : k === 4 ? 26 : 16} seed={k + 3} />
          </>
        ) : null}
        {k >= 0 ? [0, 1].map((j) => { const q = ((f - tK + j * 8) % 16) / 16; return <div key={"o" + j} style={{ position: "absolute", left: 540 - (200 + q * 380), top: 940 - (200 + q * 380), width: 2 * (200 + q * 380), height: 2 * (200 + q * 380), borderRadius: "50%", border: `2px solid ${TINTE[k]}`, opacity: (1 - q) * 0.35 * (1 - cierre) }} />; }) : null}
        {/* destello de impacto */}
        {true ? <div style={{ position: "absolute", left: 140, top: 560, width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,251,235,0.55) 0%, transparent 60%)", opacity: imp(f, tK + 8, 0.35) * (1 - cierre), mixBlendMode: "screen" }} /> : null}
      </AbsoluteFill>

      {/* vitrina de 14 huecos (fuera del sacudón: es el piso) */}
      <div style={{ position: "absolute", left: x0, top: vitY, width: ancho, height: d, transform: `scale(${vitS})`, transformOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: d / 2, right: d / 2, top: d / 2, height: 1.5, background: "rgba(212,212,216,0.14)" }} />
        <div style={{ position: "absolute", left: d / 2, width: Math.max(0, paso * k), top: d / 2, height: 1.5, background: RC.esmeralda500 }} />
        {TROFEOS.map((id, i) => {
          const ganado = k < 0 ? f >= tK + 9 && f < H[0].t - 6 - (13 - i) * 2 : i < k || (i === k && f >= tK + 9);
          const actual = i === k;
          const brillo = cierre > 0 ? imp(f, catorce + i * 2, 0.15) : 0;
          return (
            <div key={id} style={{ position: "absolute", left: i * paso, top: 0, width: d, height: d, borderRadius: "50%", background: ganado ? "#0d0d0f" : "#09090a",
              border: `1.5px solid ${actual || brillo > 0.1 ? RC.esmeralda400 : ganado ? "rgba(212,212,216,0.25)" : "rgba(212,212,216,0.10)"}`,
              boxShadow: actual || brillo > 0.1 ? `0 0 ${24 + brillo * 30}px ${RC.esmeralda500}88` : undefined,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              {ganado ? <Img src={src(id)} style={{ width: d - 8, height: d - 8, objectFit: "contain" }} /> : null}
            </div>
          );
        })}
      </div>

      {/* cierre */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", opacity: cierre * (1 - placa) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 30, letterSpacing: 8, color: RC.esmeralda400 }}>14 TROFEOS</div>
      </div>
      <div style={{ position: "absolute", left: 96, right: 96, top: 1180, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 62, lineHeight: 1.1, color: RC.crema,
        opacity: interpolate(f, [primero, primero + 12], [0, 1], cl) * (1 - placa), transform: `translateY(${interpolate(f, [primero, primero + 14], [24, 0], { ...cl, easing: sale })}px)` }}>
        El primero sale con<br />un solo roleplay.
      </div>
      <AbsoluteFill style={{ background: "#060607", opacity: placa * 0.85 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", opacity: placa }}>
        <Logo size={230} dibujoEn={primero + 50} />
      </div>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)", pointerEvents: "none" }} />
      <Acabado />
    </AbsoluteFill>
  );
};
