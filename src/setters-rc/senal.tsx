import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MONO } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";
import { SANS, SERIF } from "../historias-rc/como-funciona";

/**
 * "Señal detectada" — video de lanzamiento de Ring Setters (03/10/2026).
 * Lenguaje NUEVO (no vitrina, no papel, no mesa, no sala de grabación, no odómetro):
 * CENTRO DE MANDO. Radar sobre negro profundo, UN acento ámbar (el del carnet de setter de la app: #ffb020),
 * sin esmeralda. La identidad de setters en la app ES un radar (logo del carnet, lema "El radar nunca duerme").
 * Acá vive el motor del radar, la apertura y la marca; las escenas de producto están en `escenas.tsx`.
 */

export const AMBAR = "#f59e0b";
export const CREMA = "#f4efe7";
export const ambar = (a: number) => `rgba(245,158,11,${a})`;
export const cine = Easing.bezier(0.16, 1, 0.3, 1);
export const c = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const az = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const CX = 540;
const CY = 860;
const R = 440;

/** Tiempos de la apertura (cuadros). `closers` y `cierre` son opcionales (la muestra no los tiene). */
export type TiemposApertura = { on: number; det: number; marca: number; closers?: number; cierre?: number };

const BLIP = { ang: 40, r: 0.6 };
const pos = (ang: number, r: number) => {
  const a = ((ang - 90) * Math.PI) / 180;
  return { x: CX + Math.cos(a) * r * R, y: CY + Math.sin(a) * r * R };
};

const ECOS = Array.from({ length: 13 }, (_, i) => ({ ang: (i * 360) / 13 + az(i) * 18, r: 0.22 + az(i + 40) * 0.72, t: 0.55 + az(i + 80) * 0.45 }));

const Radar: React.FC<{ f: number; T: TiemposApertura }> = ({ f, T }) => {
  const ang = BLIP.ang + (f - T.det) * 7.5;
  const angIni = BLIP.ang + (T.on + 4 - T.det) * 7.5;
  const fosforo = (a0: number) => {
    if (f < T.on + 4) return 0;
    const atras = (((ang - a0) % 360) + 360) % 360;
    if (ang - atras < angIni) return 0;
    return Math.exp(-atras / 80);
  };
  const enciende = interpolate(f, [T.on, T.on + 22], [0, 1], { ...c, easing: cine });
  const anillos = [0.25, 0.5, 0.75, 1];
  const closersOn = T.closers ?? -1e9;
  const apaga = T.cierre !== undefined ? interpolate(f, [T.cierre + 6, T.cierre + 26], [1, 0.22], c) : 1;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.5 * enciende }}>
        <defs>
          <pattern id="pt" width={36} height={36} patternUnits="userSpaceOnUse" x={CX % 36} y={CY % 36}>
            <circle cx={1} cy={1} r={1.2} fill={ambar(0.35)} />
          </pattern>
          <radialGradient id="mk">
            <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <mask id="mm">
            <circle cx={CX} cy={CY} r={R * 1.35} fill="url(#mk)" />
          </mask>
        </defs>
        <rect width={1080} height={1920} fill="url(#pt)" mask="url(#mm)" />
      </svg>
      <div
        style={{
          position: "absolute", left: CX - R, top: CY - R, width: 2 * R, height: 2 * R, borderRadius: "50%",
          opacity: interpolate(f, [T.on + 4, T.on + 16], [0, 1], c),
          background: `conic-gradient(from ${ang - 75}deg, transparent 0deg, ${ambar(0.02)} 20deg, ${ambar(0.1)} 55deg, ${ambar(0.32)} 74deg, ${ambar(0.0)} 75deg)`,
          mixBlendMode: "screen",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="gl" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={6} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {anillos.map((k, i) => {
          const p = interpolate(f, [T.on + 2 + i * 5, T.on + 26 + i * 5], [0, 1], { ...c, easing: cine });
          const L = 2 * Math.PI * k * R;
          return (
            <circle key={k} cx={CX} cy={CY} r={k * R} fill="none" stroke={ambar(k === 1 ? 0.55 : 0.22)} strokeWidth={k === 1 ? 2 : 1.2}
              strokeDasharray={L} strokeDashoffset={L * (1 - p)} transform={`rotate(-90 ${CX} ${CY})`} />
          );
        })}
        {[0, 90].map((a) => {
          const p = interpolate(f, [T.on + 8, T.on + 30], [0, 1], { ...c, easing: cine });
          const v = a === 0;
          return <line key={a} x1={v ? CX : CX - R * p} y1={v ? CY - R * p : CY} x2={v ? CX : CX + R * p} y2={v ? CY + R * p : CY} stroke={ambar(0.18)} strokeWidth={1} />;
        })}
        {Array.from({ length: 72 }, (_, i) => {
          const p = interpolate(f, [T.on + 12 + i * 0.25, T.on + 22 + i * 0.25], [0, 1], c);
          const larga = i % 6 === 0;
          const a = ((i * 5 - 90) * Math.PI) / 180;
          const r1 = R + 10;
          const r2 = R + (larga ? 30 : 18);
          return <line key={i} x1={CX + Math.cos(a) * r1} y1={CY + Math.sin(a) * r1} x2={CX + Math.cos(a) * r2} y2={CY + Math.sin(a) * r2} stroke={ambar(larga ? 0.6 : 0.28)} strokeWidth={larga ? 2 : 1} opacity={p} />;
        })}
        {f >= T.on + 4 && (() => {
          const e = pos(ang, 1);
          return <line x1={CX} y1={CY} x2={e.x} y2={e.y} stroke={ambar(0.9)} strokeWidth={2} filter="url(#gl)" opacity={interpolate(f, [T.on + 4, T.on + 12], [0, 1], c)} />;
        })()}
        {/* los closers: puntos platino que aparecen cuando la voz dice "closers" */}
        {ECOS.map((e, i) => {
          const p = pos(e.ang, e.r);
          const t0 = closersOn + i * 1.6;
          const pop = T.closers !== undefined && f >= t0 ? spring({ frame: f - t0, fps: 30, config: { damping: 9, stiffness: 160 } }) : 0;
          const anillo = interpolate(f, [t0, t0 + 18], [0, 1], c);
          const b = T.closers !== undefined ? pop * (0.55 + 0.45 * fosforo(e.ang)) * apaga : fosforo(e.ang) * e.t * 0.7;
          return (
            <g key={i}>
              {T.closers !== undefined && f >= t0 && anillo < 1 && <circle cx={p.x} cy={p.y} r={6 + anillo * 34} fill="none" stroke="rgba(235,232,225,0.8)" strokeWidth={1.5} opacity={(1 - anillo) * apaga} />}
              <circle cx={p.x} cy={p.y} r={T.closers !== undefined ? 5.5 * pop : 4} fill={T.closers !== undefined ? "#ece8df" : AMBAR} opacity={b} filter="url(#gl)" />
            </g>
          );
        })}
        <circle cx={CX} cy={CY} r={5} fill={AMBAR} filter="url(#gl)" opacity={interpolate(f, [2, 6], [0, 1], c)} />
      </svg>
      {T.cierre !== undefined && (() => {
        const e = ECOS[3];
        const p = pos(e.ang, e.r);
        const o = interpolate(f, [T.cierre - 4, T.cierre + 6, T.det - 8, T.det], [0, 1, 1, 0], c);
        return (
          <div style={{ position: "absolute", left: p.x + 22, top: p.y - 14, fontFamily: MONO, fontSize: 21, letterSpacing: 5, color: "rgba(236,232,223,0.75)", opacity: o, whiteSpace: "nowrap" }}>
            CIERRE
          </div>
        );
      })()}
    </>
  );
};

const Senal: React.FC<{ f: number; det: number }> = ({ f, det }) => {
  const p = pos(BLIP.ang, BLIP.r);
  if (f < det - 2) return null;
  const s = spring({ frame: f - det, fps: 30, config: { damping: 14, stiffness: 140 } });
  const tam = interpolate(s, [0, 1], [190, 74]);
  const flash = interpolate(f, [det, det + 2, det + 18], [0, 1, 0.35], c);
  const texto = interpolate(f, [det + 6, det + 18], [0, 1], { ...c, easing: cine });
  const letras = "SEÑAL DETECTADA";
  const tipeo = Math.floor(interpolate(f, [det + 6, det + 20], [0, letras.length], c));
  return (
    <>
      <div style={{ position: "absolute", left: p.x - 160, top: p.y - 160, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${ambar(0.85 * flash)} 0%, ${ambar(0.25 * flash)} 30%, transparent 65%)`, mixBlendMode: "screen" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="gl2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={8} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {[0, 9, 18, 40, 49].map((d) => {
          const q = interpolate(f, [det + d, det + d + 30], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
          return <circle key={d} cx={p.x} cy={p.y} r={10 + q * 170} fill="none" stroke={AMBAR} strokeWidth={2} opacity={(1 - q) * 0.8 * (f >= det + d ? 1 : 0)} />;
        })}
        <circle cx={p.x} cy={p.y} r={7} fill="#fff7e6" filter="url(#gl2)" />
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => {
          const x = p.x + (sx * tam) / 2;
          const y = p.y + (sy * tam) / 2;
          const l = 18;
          return <path key={i} d={`M ${x - sx * l} ${y} L ${x} ${y} L ${x} ${y - sy * l}`} fill="none" stroke={AMBAR} strokeWidth={2.5} opacity={interpolate(f, [det - 2, det + 2], [0, 1], c)} />;
        })}
        <line x1={p.x - 44} y1={p.y - 44} x2={p.x - 44 - 110 * texto} y2={p.y - 44 - 110 * texto} stroke={ambar(0.7)} strokeWidth={1.2} />
      </svg>
      <div style={{ position: "absolute", right: 1080 - (p.x - 150), top: p.y - 214, opacity: texto, fontFamily: MONO, whiteSpace: "nowrap", textAlign: "right" }}>
        <div style={{ color: AMBAR, fontSize: 25, letterSpacing: 6, fontWeight: 700 }}>
          {letras.slice(0, tipeo)}
          <span style={{ opacity: Math.floor(f / 6) % 2 ? 1 : 0 }}>▌</span>
        </div>
        <div style={{ color: "rgba(255,240,215,0.5)", fontSize: 19, letterSpacing: 3, marginTop: 8 }}>SETTER · AZ 040°</div>
      </div>
    </>
  );
};

/** Chispas ámbar que suben. */
export const Chispas: React.FC<{ f: number; desde: number; n?: number; y0?: number; alto?: number }> = ({ f, desde, n = 46, y0 = 1020, alto = 200 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const t = f - desde - az(i + 7) * 12;
      if (t < 0) return null;
      const vida = 40 + az(i + 3) * 40;
      const q = t / vida;
      if (q > 1) return null;
      const x = 120 + az(i) * 840 + Math.sin(t / 9 + i) * 14;
      const y = y0 + az(i + 21) * alto - t * (3 + az(i + 9) * 5);
      const r = 1.5 + az(i + 33) * 3.5;
      return (
        <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: "#ffd18a",
          boxShadow: `0 0 ${8 + r * 3}px ${ambar(0.9)}`, opacity: Math.sin(q * Math.PI) * (0.4 + az(i + 50) * 0.6), filter: r > 4 ? "blur(1.5px)" : undefined }} />
      );
    })}
  </>
);

/** La marca "Ring Setters": letras con luz, "Setters" en serif itálica dorada. */
export const Marca: React.FC<{ f: number; A: number; top?: number; escala?: number; ceja?: string; pie?: React.ReactNode }> = ({ f, A, top = 790, escala = 1, ceja = "NUEVO EN RING CLOSERS", pie }) => {
  if (f < A - 2) return null;
  const s = spring({ frame: f - A, fps: 30, config: { damping: 200, stiffness: 60 } });
  const blur = interpolate(s, [0, 1], [26, 0]);
  const esc = interpolate(s, [0, 1], [1.14, 1]) * escala;
  const s2 = spring({ frame: f - A - 5, fps: 30, config: { damping: 200, stiffness: 55 } });
  const luz = interpolate(f, [A + 14, A + 40], [-40, 140], c);
  const linea = interpolate(f, [A + 8, A + 34], [0, 1], { ...c, easing: cine });
  const cj = interpolate(f, [A + 16, A + 30], [0, 1], { ...c, easing: cine });
  const pp = interpolate(f, [A + 30, A + 46], [0, 1], { ...c, easing: cine });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 9, color: "rgba(255,240,215,0.62)", opacity: cj, transform: `translateY(${(1 - cj) * 12}px)`, marginBottom: 26 }}>{ceja}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, transform: `scale(${esc})`, filter: `blur(${blur}px)`, opacity: s }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 128, letterSpacing: -3, color: CREMA }}>Ring</span>
        <span
          style={{
            fontFamily: SERIF, fontStyle: "italic", fontSize: 184, lineHeight: 1.1, paddingRight: 18, paddingLeft: 22,
            backgroundImage: `linear-gradient(100deg, transparent ${luz - 18}%, rgba(255,255,255,0.95) ${luz}%, transparent ${luz + 18}%), linear-gradient(180deg, #ffe9b8 0%, #ffc860 30%, #f59e0b 58%, #a85f04 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            filter: `drop-shadow(0 0 ${18 * s2}px ${ambar(0.45)})`,
          }}
        >
          Setters
        </span>
      </div>
      <div style={{ marginTop: 30, width: 520 * linea, height: 1.5, background: `linear-gradient(90deg, transparent, ${AMBAR}, transparent)` }} />
      {pie && <div style={{ marginTop: 34, opacity: pp, transform: `translateY(${(1 - pp) * 14}px)`, filter: `blur(${(1 - pp) * 8}px)` }}>{pie}</div>}
    </div>
  );
};

/** Golpe de cámara: escala que salta y se asienta con un rebote corto. */
export const golpe = (f: number, en: number, fuerza = 0.04) =>
  f >= en ? Math.exp(-(f - en) / 5) * Math.sin(((f - en) / 30) * Math.PI * 4) * fuerza * 0.6 + spring({ frame: f - en, fps: 30, config: { damping: 18 } }) * fuerza : 0;

/** La apertura entera: ping → radar → (closers) → señal → entrada a la señal → marca. */
export const Apertura: React.FC<{ f: number; T: TiemposApertura }> = ({ f, T }) => {
  const ping = interpolate(f, [3, 26], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const push = T.marca - 12;
  const entra = interpolate(f, [push, push + 16], [0, 1], { ...c, easing: Easing.in(Easing.cubic) });
  const escala = 1 + interpolate(f, [0, push], [0, 0.07], c) + golpe(f, T.det) + (T.closers !== undefined ? golpe(f, T.closers, 0.02) : 0) + entra * 3.2;
  const b = pos(BLIP.ang, BLIP.r);
  const radarOp = interpolate(f, [push + 8, push + 18], [1, 0], c);
  const fondo = interpolate(f, [T.marca + 2, T.marca + 26], [0, 1], { ...c, easing: cine });
  const destello = interpolate(f, [T.marca - 3, T.marca, T.marca + 14], [0, 1, 0], c);
  const giro = f * 0.02;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #120c05 0%, #050402 55%, #000 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: fondo * 0.3, transform: `scale(${1.5 + fondo * 0.1}) rotate(${(f - T.marca) * 0.15}deg)`, transformOrigin: `${CX}px ${CY}px`, filter: "blur(1.5px)" }}>
        <Radar f={f > T.marca + 2 ? f + 300 : 0} T={{ on: T.on, det: T.det, marca: T.marca }} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${escala}) rotate(${giro}deg)`, transformOrigin: `${CX + (b.x - CX) * Math.min(1, entra * 1.4)}px ${CY + (b.y - CY) * Math.min(1, entra * 1.4)}px`, opacity: radarOp, filter: entra > 0 ? `blur(${entra * 10}px)` : undefined }}>
        <Radar f={f} T={T} />
        <Senal f={f} det={T.det} />
      </div>
      {f < 40 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <circle cx={CX} cy={CY} r={8 + ping * R} fill="none" stroke={AMBAR} strokeWidth={3 - ping * 2} opacity={(1 - ping) * 0.9} />
        </svg>
      )}
      <Chispas f={f} desde={T.marca} />
      <Marca f={f} A={T.marca} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,214,150,${destello * 0.9}) 0%, ${ambar(destello * 0.35)} 40%, transparent 80%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

export const SettersMuestra: React.FC = () => {
  const f = useCurrentFrame();
  useVideoConfig();
  return (
    <AbsoluteFill>
      <Apertura f={f} T={{ on: 18, det: 66, marca: 104 }} />
      <Acabado />
    </AbsoluteFill>
  );
};
