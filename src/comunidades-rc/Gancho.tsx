/**
 * "Ya empezó sin vos" — gancho (27/09/2026). Lenguaje NUEVO de la serie: arena de noche con estandartes de
 * campeonato que caen del techo, uno por comunidad (Elite Closers, Five Stars, S&P), con golpe, polvo y luz
 * cenital; la arena se prende por sectores detrás. Sin logos inventados de las comunidades: solo su nombre.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { RC } from "../ring-closers/tema";
import { Logo } from "../reel-rc/logo";
import { Acabado, Palabras } from "../oferta-rc/Muestra";
import { Destello } from "../secreto-rc/efectos";

const SERIF = cargarSerif("italic").fontFamily;
const SANS = cargarManrope("normal", { weights: ["500", "700", "800"] }).fontFamily;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const r = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const CAIDA = 8; // cuadros que tarda en caer

export const ESTANDARTES = [
  { nombre: ["ELITE", "CLOSERS"], x: 540, escala: 1.1, z: 2 },
  { nombre: ["FIVE", "STARS"], x: 200, escala: 0.9, z: 0 },
  { nombre: ["S&P"], x: 880, escala: 0.9, z: 1 },
];

const Estandarte: React.FC<{ e: (typeof ESTANDARTES)[number]; aterriza: number; f: number }> = ({ e, aterriza, f }) => {
  const dt = f - aterriza;
  const cae = interpolate(f, [aterriza - CAIDA, aterriza], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const rebote = dt > 0 ? 38 * Math.exp(-dt * 0.28) * Math.sin(dt * 0.95) : 0;
  const giro = dt > 0 ? 5 * Math.exp(-dt * 0.12) * Math.sin(dt * 0.42) : 0;
  const y = -1250 * (1 - cae) + rebote;
  const luz = interpolate(dt, [0, 3, 30], [0, 1.4, 1], cl);
  const W = 310;
  const H = 960;
  return (
    <div style={{ position: "absolute", left: e.x - W / 2, top: 300, width: W, height: H, zIndex: e.z,
      transform: `translateY(${y}px) scale(${e.escala}) rotate(${giro}deg)`, transformOrigin: "50% 0" }}>
      {[40, W - 40].map((cx) => (
        <div key={cx} style={{ position: "absolute", left: cx - 1, top: -400, width: 2, height: 400, background: "linear-gradient(#0000, #8a8a92)" }} />
      ))}
      <div style={{ position: "absolute", left: -18, right: -18, top: -10, height: 22, borderRadius: 11,
        background: "linear-gradient(#f4f4f5, #8a8a92 55%, #3a3a40)", boxShadow: "0 8px 20px rgba(0,0,0,0.7)" }} />
      <div style={{ position: "absolute", inset: 0, top: 6,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 90%, 0 100%)",
        background: `repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 18px, rgba(0,0,0,0.12) 18px 46px, rgba(255,255,255,0.02) 46px 60px),
          linear-gradient(180deg, #181c1b 0%, #0e1110 70%, #080909 100%)`,
        filter: `brightness(${0.55 + luz * 0.45})` }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "linear-gradient(90deg, rgba(0,0,0,0.55), transparent 22%, rgba(255,255,255,0.07) 48%, transparent 72%, rgba(0,0,0,0.6))" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: `linear-gradient(115deg, transparent ${-40 + interpolate(dt, [0, 40], [0, 180], cl)}%, rgba(255,255,255,0.12) ${-25 + interpolate(dt, [0, 40], [0, 180], cl)}%, transparent ${-10 + interpolate(dt, [0, 40], [0, 180], cl)}%)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: `linear-gradient(${RC.esmeralda600}, ${RC.esmeralda600}aa)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 3, background: "#d4d4d8" }} />
        <div style={{ position: "absolute", left: 16, right: 16, top: 90, bottom: 60, border: "1.5px solid rgba(212,212,216,0.22)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 91%, 0 100%)" }} />
        <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", justifyContent: "center" }}><Logo size={70} /></div>
        <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: 5, color: "#8a8a92" }}>COMUNIDAD</div>
        <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center" }}>
          {e.nombre.map((w) => (
            <div key={w} style={{ fontFamily: SANS, fontWeight: 800, fontSize: w.length > 5 ? 62 : 84, lineHeight: 1.05, letterSpacing: -1,
              background: "linear-gradient(180deg, #ffffff 0%, #d4d4d8 45%, #7c7c84 100%)", WebkitBackgroundClip: "text", color: "transparent" }}>{w}</div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 560, left: 60, right: 60, height: 2, background: `linear-gradient(90deg, transparent, ${RC.esmeralda400}, transparent)` }} />
        <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 34, color: RC.platino500 }}>en el ring</div>
        <div style={{ position: "absolute", top: 650, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: RC.esmeralda400, letterSpacing: 6 }}>★ ★ ★</div>
      </div>
    </div>
  );
};

export const GanchoComunidades: React.FC<{ tiempos?: number[]; frase?: [number, number]; acabado?: boolean }> = ({ tiempos = [10, 24, 38], frase, acabado = true }) => {
  const [fr1, fr2] = frase ?? [tiempos[2] + 16, tiempos[2] + 30];
  const f = useCurrentFrame();
  const sacudida = tiempos.reduce((s, t, i) => s + (f >= t ? 16 * (i === 2 ? 1.3 : 1) * Math.exp(-(f - t) * 0.35) * Math.cos((f - t) * 2.4) : 0), 0);
  const destello = tiempos.reduce((s, t) => s + (f >= t ? Math.exp(-(f - t) * 0.4) : 0), 0);
  const empuje = interpolate(f, [0, 120], [1.06, 1.0], cl);
  return (
    <AbsoluteFill style={{ background: "#050606", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${sacudida}px) scale(${empuje})` }}>
        {/* tribunas: luces de la arena en bokeh, se prenden por sectores */}
        {Array.from({ length: 90 }).map((_, i) => {
          const t = tiempos[Math.floor(r(i, 7) * 3)];
          const on = interpolate(f, [t, t + 10], [0.12, 1], cl);
          const fila = Math.floor(i / 15);
          const d = 26 + r(i, 3) * 30;
          return (
            <div key={i} style={{ position: "absolute", left: r(i, 1) * 1080 - 20, top: 1080 + fila * 70 + r(i, 2) * 40, width: d, height: d,
              borderRadius: "50%", background: r(i, 4) > 0.8 ? RC.esmeralda400 : "#f4f4f5", opacity: on * (0.15 + r(i, 5) * 0.35), filter: `blur(${8 + r(i, 6) * 10}px)` }} />
          );
        })}
        {/* conos de luz cenital sobre cada estandarte */}
        {ESTANDARTES.map((e, i) => (
          <div key={i} style={{ position: "absolute", left: e.x - 330, top: -100, width: 660, height: 1500,
            clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)", opacity: f >= tiempos[i] ? 0.5 + 0.8 * Math.exp(-(f - tiempos[i]) * 0.15) : 0,
            background: "linear-gradient(180deg, rgba(244,244,245,0.22), rgba(244,244,245,0.04) 70%, transparent)", filter: "blur(10px)" }} />
        ))}
        <div style={{ position: "absolute", left: 40, top: 720, width: 1000, height: 700, borderRadius: "50%",
          background: `radial-gradient(circle, ${RC.esmeralda600}33 0%, transparent 65%)`, filter: "blur(30px)" }} />
        {ESTANDARTES.map((e, i) => <Estandarte key={i} e={e} aterriza={tiempos[i]} f={f} />)}
        {/* polvo que suelta cada estandarte al tensarse */}
        {tiempos.flatMap((t, k) => Array.from({ length: 14 }).map((_, j) => {
          const dt = f - t;
          if (dt < 0 || dt > 40) return null;
          const a = r(j + k * 20, 1) * Math.PI * 2;
          return (
            <div key={`${k}-${j}`} style={{ position: "absolute", left: ESTANDARTES[k].x + Math.cos(a) * dt * 5, top: 300 + Math.sin(a) * dt * 2 - dt * 1.5,
              width: 6, height: 6, borderRadius: 3, background: "#d4d4d8", opacity: 0.6 * (1 - dt / 40), filter: "blur(1px)" }} />
          );
        }))}
        <Destello x={130} y={1180} size={230} rot={10} blur={9} opacidad={0.5} />
        <Destello x={960} y={560} size={120} rot={-6} blur={4} opacidad={0.6} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#f4f4f5", opacity: Math.min(0.35, destello * 0.3), mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", top: 1440, width: "100%", textAlign: "center", textShadow: "0 4px 30px #000" }}>
        <Palabras texto="mientras vos scrolleás," desde={fr1} f={f} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 60, color: RC.platino500 }} />
        <Palabras texto="ellos ya están adentro." desde={fr2} f={f} acento={["adentro."]}
          style={{ fontFamily: SANS, fontWeight: 800, fontSize: 62, letterSpacing: -1.2, color: "#f4f4f5" }} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(0,0,0,0.75) 100%)" }} />
      {acabado && <Acabado f={f} />}
    </AbsoluteFill>
  );
};
