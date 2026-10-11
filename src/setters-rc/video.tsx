import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { MONO } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";
import { SANS, SERIF } from "../historias-rc/como-funciona";
import { AMBAR, CREMA, ambar, cine, c, az, Apertura, Chispas, Marca, golpe } from "./senal";
import { tl, G, INI, DUR, TOTAL } from "./timeline";

/**
 * "Señal detectada" completo — lanzamiento de Ring Setters (03/10/2026). ~60 s, voz Callirrhoe.
 * Mundo: CENTRO DE MANDO. Cada objeto de la app (insignias, joyas de señal, trofeos de setter: PNG reales
 * de la app) aparece como algo que el radar "fija": mira con corchetes que cierran, rótulo mono chico.
 * Un acento (ámbar del carnet de setter). Texto chico abajo, el objeto manda.
 * Datos inventados a propósito (decirlo al entregar): 38 % / 72 %, alias, puntos, ofertas, nº de socio.
 */

export const DURACION_SETTERS = TOTAL;

type W = (p: string, vez?: number) => number;
const wDe = (id: string): W => (p, vez = 1) => G(id, p, vez) - INI(id);
const CX = 540;
const CY = 820;

/* ───────────── piezas comunes ───────────── */

const Escena: React.FC<{ id: string; f: number; golpes?: string[]; sinSalida?: boolean; children: (lf: number, w: W, d: number) => React.ReactNode }> = ({ id, f, golpes = [], sinSalida, children }) => {
  const from = INI(id);
  const d = DUR(id);
  const lf = f - from;
  if (lf < 0 || lf >= d) return null;
  const w = wDe(id);
  const ent = interpolate(lf, [0, 12], [0, 1], { ...c, easing: cine });
  const sal = sinSalida ? 0 : interpolate(lf, [d - 7, d], [0, 1], { ...c, easing: Easing.in(Easing.cubic) });
  const esc = 1.06 - 0.06 * ent + sal * 0.1 + golpes.reduce((s, p) => s + golpe(lf, w(p) - 2, 0.022), 0) + lf * 0.00035;
  return (
    <AbsoluteFill style={{ transform: `scale(${esc})`, filter: ent < 1 || sal > 0 ? `blur(${(1 - ent) * 14 + sal * 12}px)` : undefined, opacity: ent * (1 - sal) }}>
      {children(lf, w, d)}
    </AbsoluteFill>
  );
};

const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 49, color: "#ffc860", fontWeight: 400, letterSpacing: 0 }}>{children}</span>
);

/** Renglones enteros que suben y se enfocan, cada uno cuando la voz llega a él. */
const Leyenda: React.FC<{ lf: number; lineas: { t: React.ReactNode; en: number }[]; top?: number; sale?: number }> = ({ lf, lineas, top = 1420, sale }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: sale !== undefined ? interpolate(lf, [sale - 6, sale + 3], [1, 0], c) : 1 }}>
    {lineas.map((l, i) => {
      const p = interpolate(lf, [l.en - 3, l.en + 11], [0, 1], { ...c, easing: cine });
      return (
        <div key={i} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, lineHeight: 1.28, color: "rgba(244,239,231,0.86)", textAlign: "center", letterSpacing: -0.3, opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined, whiteSpace: "nowrap" }}>
          {l.t}
        </div>
      );
    })}
  </div>
);

/** Objeto real de la app: entra con resorte y desenfoque, flota, se inclina y tiene un barrido de luz recortado con su propio alfa. */
export const Objeto: React.FC<{ src: string; lf: number; en?: number; x?: number; y?: number; size: number; halo?: number; brillo?: number; luz?: number; color?: string }> = ({ src, lf, en = 0, x = CX, y = CY, size, halo = 0.5, brillo = 1, luz, color }) => {
  if (lf < en - 1) return null;
  const s = spring({ frame: lf - en, fps: 30, config: { damping: 15, stiffness: 95 } });
  const fl = Math.sin((lf + en * 7) / 22) * 9;
  const ry = Math.sin((lf + en * 5) / 40) * 7 + (1 - s) * 28;
  const url = staticFile(src);
  const barr = luz !== undefined ? interpolate(lf, [luz, luz + 24], [-40, 150], c) : ((lf * 1.6 + en * 13) % 300) - 70;
  const col = color ?? AMBAR;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2 + fl + (1 - s) * 70, width: size, height: size, opacity: Math.min(1, s * 1.4), transform: `perspective(1400px) rotateY(${ry}deg) rotateX(3deg) scale(${0.7 + 0.3 * s})`, filter: `${s < 0.98 ? `blur(${(1 - s) * 16}px) ` : ""}brightness(${brillo})` }}>
      <div style={{ position: "absolute", inset: "-28%", background: `radial-gradient(circle, ${col}${Math.round(halo * 110).toString(16).padStart(2, "0")} 0%, ${col}${Math.round(halo * 30).toString(16).padStart(2, "0")} 34%, transparent 64%)` }} />
      <Img src={url} style={{ position: "absolute", inset: 0, width: size, height: size, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.65))" }} />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url("${url}")`, WebkitMaskSize: "100% 100%", maskImage: `url("${url}")`, maskSize: "100% 100%", background: `linear-gradient(105deg, transparent ${barr - 13}%, rgba(255,250,235,0.6) ${barr}%, transparent ${barr + 13}%)`, mixBlendMode: "screen" }} />
    </div>
  );
};

/** La mira del radar alrededor del objeto: anillo que se dibuja, anillo de puntos que gira, corchetes que cierran. */
export const Mira: React.FC<{ lf: number; x?: number; y?: number; r: number; en?: number; rotulo?: string }> = ({ lf, x = CX, y = CY, r, en = 0, rotulo }) => {
  const s = spring({ frame: lf - en - 4, fps: 30, config: { damping: 16, stiffness: 120 } });
  const lado = r * (1.9 - 0.9 * s);
  const dib = interpolate(lf, [en, en + 26], [0, 1], { ...c, easing: cine });
  const L = 2 * Math.PI * r;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={x} cy={y} r={r} fill="none" stroke={ambar(0.32)} strokeWidth={1.2} strokeDasharray={`${L * dib} ${L}`} transform={`rotate(${-90 + lf * 0.3} ${x} ${y})`} />
        <circle cx={x} cy={y} r={r + 24} fill="none" stroke={ambar(0.2)} strokeWidth={7} strokeDasharray="1.5 15" opacity={dib} transform={`rotate(${-lf * 0.35} ${x} ${y})`} />
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => {
          const bx = x + sx * lado * 0.76;
          const by = y + sy * lado * 0.76;
          const l = 28;
          return <path key={i} d={`M ${bx - sx * l} ${by} L ${bx} ${by} L ${bx} ${by - sy * l}`} fill="none" stroke={AMBAR} strokeWidth={2.5} opacity={s} />;
        })}
      </svg>
      {rotulo && (
        <div style={{ position: "absolute", left: x + r * 0.76 - 600, width: 600, top: y + r * 0.76 + 20, textAlign: "right", fontFamily: MONO, fontSize: 19, letterSpacing: 4, color: ambar(0.85), opacity: interpolate(lf, [en + 14, en + 26], [0, 1], c) }}>
          {rotulo}
        </div>
      )}
    </>
  );
};

/** Logo del radar de setters (el del carnet de la app): cuña de barrido, 3 anillos, línea arriba y punto. */
export const LogoRadar: React.FC<{ s: number; color?: string; ancho?: number }> = ({ s, color = "#ffd88a", ancho = 1.6 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <path d="M50 50 L50 6 A44 44 0 0 1 88 28 Z" fill={color} opacity={0.28} />
    {[44, 30, 16].map((r) => <circle key={r} cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={ancho * (100 / s) * 1.6} />)}
    <line x1={50} y1={50} x2={50} y2={6} stroke={color} strokeWidth={ancho * (100 / s) * 1.8} />
    <circle cx={50} cy={50} r={4.5} fill={color} />
  </svg>
);

/** Fondo de mando: anillos tenues, barrido lento, polvo en el aire. */
const Fondo: React.FC<{ f: number; k?: number }> = ({ f, k = 1 }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #150e05 0%, #080603 48%, #000 100%)" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {[180, 360, 540, 720, 900, 1080].map((r) => <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke={ambar(0.06 * k)} strokeWidth={1} />)}
      <line x1={CX} y1={0} x2={CX} y2={1920} stroke={ambar(0.035 * k)} />
      <line x1={0} y1={CY} x2={1080} y2={CY} stroke={ambar(0.035 * k)} />
    </svg>
    <div style={{ position: "absolute", left: CX - 1000, top: CY - 1000, width: 2000, height: 2000, borderRadius: "50%", background: `conic-gradient(from ${f * 1.6}deg, transparent 0deg, ${ambar(0.025 * k)} 40deg, ${ambar(0.09 * k)} 59deg, transparent 60deg)`, mixBlendMode: "screen" }} />
    {Array.from({ length: 38 }, (_, i) => {
      const x = (az(i) * 1080 + Math.sin(f / 70 + i) * 30) % 1080;
      const y = (((az(i + 9) * 1920 - f * (0.3 + az(i + 4) * 0.6)) % 1920) + 1920) % 1920;
      const r = 1 + az(i + 2) * 2.4;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: "#ffdca0", opacity: (0.08 + az(i + 7) * 0.25) * k, filter: r > 2.6 ? "blur(1.5px)" : undefined }} />;
    })}
  </AbsoluteFill>
);

/** Corte: una línea de barrido que cruza la pantalla y un destello corto. */
const Corte: React.FC<{ f: number; en: number }> = ({ f, en }) => {
  const lf = f - en;
  if (lf < -1 || lf > 12) return null;
  const y = interpolate(lf, [0, 10], [-80, 2000], { ...c, easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `rgba(255,214,150,${interpolate(lf, [0, 2, 11], [0, 0.12, 0], c)})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 90, height: 180, background: `linear-gradient(180deg, transparent, ${ambar(0.22)} 48%, rgba(255,236,200,0.95) 50%, ${ambar(0.22)} 52%, transparent)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const Destello: React.FC<{ lf: number; en: number; x?: number; y?: number; k?: number }> = ({ lf, en, x = CX, y = CY, k = 1 }) => {
  const o = interpolate(lf, [en - 2, en, en + 16], [0, 1, 0], c) * k;
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,226,170,${o * 0.75}) 0%, ${ambar(o * 0.3)} 30%, transparent 62%)`, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

const Ondas: React.FC<{ lf: number; desde: number; cada: number; n: number; x?: number; y?: number; r0: number; r1: number; vida?: number }> = ({ lf, desde, cada, n, x = CX, y = CY, r0, r1, vida = 50 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }, (_, k) => {
      const t0 = desde + k * cada;
      const q = interpolate(lf, [t0, t0 + vida], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
      if (lf < t0 || q >= 1) return null;
      return <circle key={k} cx={x} cy={y} r={r0 + q * (r1 - r0)} fill="none" stroke={AMBAR} strokeWidth={2.2 - q * 1.6} opacity={(1 - q) * 0.6} />;
    })}
  </svg>
);

const arco = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return [cx + Math.cos(t) * r, cy + Math.sin(t) * r];
  };
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

const Rotulo: React.FC<{ lf: number; en: number; x: number; y: number; ancho?: number; alinear?: "left" | "right" | "center"; children: React.ReactNode; tam?: number; color?: string }> = ({ lf, en, x, y, ancho = 600, alinear = "center", children, tam = 20, color }) => {
  const p = interpolate(lf, [en, en + 12], [0, 1], { ...c, easing: cine });
  const left = alinear === "center" ? x - ancho / 2 : alinear === "right" ? x - ancho : x;
  return (
    <div style={{ position: "absolute", left, width: ancho, top: y, textAlign: alinear, fontFamily: MONO, fontSize: tam, letterSpacing: 5, color: color ?? ambar(0.85), opacity: p, transform: `translateY(${(1 - p) * 10}px)`, whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

/* ───────────── escenas ───────────── */

const E04: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e04" f={f} golpes={["Practicás", "semanas"]}>
    {(lf, w) => {
      const desde = w("llamadas") - 4;
      return (
        <>
          <Ondas lf={lf} desde={desde} cada={18} n={8} r0={250} r1={680} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <circle cx={CX} cy={CY} r={440} fill="none" stroke={ambar(0.1)} strokeWidth={1} />
            {Array.from({ length: 6 }, (_, i) => {
              const a = ((i * 60 + lf * 0.5 - 90) * Math.PI) / 180;
              const x = CX + Math.cos(a) * 440;
              const y = CY + Math.sin(a) * 440;
              let b = 0.25;
              for (let k = 0; k < 8; k++) {
                const q = (lf - desde - k * 18) / 50;
                if (q > 0 && q < 1) b = Math.max(b, 1 - Math.abs(250 + Easing.out(Easing.quad)(q) * 430 - 440) / 40);
              }
              const pop = interpolate(lf, [6 + i * 3, 16 + i * 3], [0, 1], c);
              return <circle key={i} cx={x} cy={y} r={6 + b * 3} fill={b > 0.5 ? "#ffe2a8" : "#ece8df"} opacity={pop * (0.35 + 0.65 * b)} />;
            })}
          </svg>
          <Mira lf={lf} r={330} rotulo="PRÁCTICA · 1 A 1" />
          <Objeto src="setters-rc/tro/setter_first_roleplay-hd.webp" lf={lf} size={600} />
          <Leyenda lf={lf} lineas={[{ t: <>Practicás tus llamadas con otros setters,</>, en: 3 }, { t: <><Em>todas las semanas</Em>.</>, en: w("todas") - 2 }]} />
        </>
      );
    }}
  </Escena>
);

const E05: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e05" f={f} golpes={["acomoda", "aparecés"]}>
    {(lf, w) => {
      const R = 300;
      const y = 800;
      const ok = w("aparecés") - 3;
      const s = spring({ frame: lf - (w("acomoda") - 8), fps: 30, config: { damping: 13, stiffness: 70 } });
      const off = -150 + 150 * s + Math.sin(lf / 9) * 4 * (1 - s);
      const dibA = interpolate(lf, [4, 24], [0, 1], { ...c, easing: cine });
      const dibB = interpolate(lf, [10, 30], [0, 1], { ...c, easing: cine });
      const lock = spring({ frame: lf - ok, fps: 30, config: { damping: 12, stiffness: 160 } });
      const a0 = 17.5 * 15;
      const a1 = 21 * 15;
      const b0 = 19 * 15 + off;
      const b1 = 23 * 15 + off;
      const p19 = (r: number) => {
        const t = ((285 - 90) * Math.PI) / 180;
        return { x: CX + Math.cos(t) * r, y: y + Math.sin(t) * r };
      };
      const pin = p19(R + 60);
      return (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <filter id="g5" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={10} result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx={CX} cy={y} r={R + 40} fill="rgba(20,14,6,0.55)" stroke={ambar(0.25)} strokeWidth={1.5} opacity={interpolate(lf, [0, 14], [0, 1], c)} />
            {Array.from({ length: 96 }, (_, i) => {
              const larga = i % 12 === 0;
              const media = i % 4 === 0;
              const a = ((i * 3.75 - 90) * Math.PI) / 180;
              const r1 = R + 22;
              const r2 = R + (larga ? 38 : media ? 31 : 27);
              const p = interpolate(lf, [i * 0.2, i * 0.2 + 10], [0, 1], c);
              return <line key={i} x1={CX + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={CX + Math.cos(a) * r2} y2={y + Math.sin(a) * r2} stroke={ambar(larga ? 0.7 : media ? 0.4 : 0.2)} strokeWidth={larga ? 2 : 1} opacity={p} />;
            })}
            <path d={arco(CX, y, R - 28, a0, a0 + (a1 - a0) * dibA)} fill="none" stroke={AMBAR} strokeWidth={12} strokeLinecap="round" opacity={0.85} />
            <path d={arco(CX, y, R - 58, b0, b0 + (b1 - b0) * dibB)} fill="none" stroke="rgba(236,232,223,0.7)" strokeWidth={10} strokeLinecap="round" />
            {lock > 0.01 && (
              <>
                <path d={arco(CX, y, R - 43, 285, 285 + 30 * Math.min(1, lock))} fill="none" stroke="#ffd18a" strokeWidth={46} opacity={0.9} filter="url(#g5)" />
                <line x1={CX} y1={y} x2={pin.x} y2={pin.y} stroke={ambar(0.8 * lock)} strokeWidth={1.5} />
                <circle cx={pin.x} cy={pin.y} r={7 * lock} fill="#fff1d6" filter="url(#g5)" />
              </>
            )}
            <circle cx={CX} cy={y} r={4} fill={AMBAR} />
          </svg>
          {[["00", 0], ["06", 90], ["12", 180], ["18", 270]].map(([t, a]) => {
            const r = R + 72;
            const ang = (((a as number) - 90) * Math.PI) / 180;
            return (
              <div key={t as string} style={{ position: "absolute", left: CX + Math.cos(ang) * r - 40, top: y + Math.sin(ang) * r - 14, width: 80, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: ambar(0.6), opacity: interpolate(lf, [8, 20], [0, 1], c) }}>
                {t}
              </div>
            );
          })}
          <Rotulo lf={lf} en={10} x={300} y={1230} alinear="center" ancho={300} tam={18} color="rgba(255,200,96,0.9)">— VOS</Rotulo>
          <Rotulo lf={lf} en={16} x={780} y={1230} alinear="center" ancho={360} tam={18} color="rgba(236,232,223,0.7)">— TU COMPAÑERO</Rotulo>
          <div style={{ position: "absolute", left: 0, right: 0, top: y - 60, textAlign: "center", fontFamily: MONO }}>
            <div style={{ fontSize: 20, letterSpacing: 6, color: ambar(0.7), opacity: lock > 0.05 ? 0 : 0.5 + 0.5 * Math.abs(Math.sin(lf / 6)) }}>EMPAREJANDO…</div>
            <div style={{ marginTop: -24, opacity: lock, transform: `scale(${0.8 + 0.2 * lock})`, filter: `blur(${(1 - Math.min(1, lock)) * 10}px)` }}>
              <div style={{ fontSize: 92, color: CREMA, letterSpacing: 2, textShadow: `0 0 30px ${ambar(0.5)}` }}>19:00</div>
              <div style={{ fontSize: 18, letterSpacing: 6, color: AMBAR, marginTop: 6 }}>PRÁCTICA CONFIRMADA</div>
            </div>
          </div>
          <Destello lf={lf} en={ok} y={y} k={0.7} />
          <Leyenda lf={lf} lineas={[{ t: <>El emparejamiento se acomoda a <Em>tu agenda</Em>.</>, en: 3 }, { t: <>Vos solo aparecés.</>, en: w("Vos") - 2 }]} />
        </>
      );
    }}
  </Escena>
);

const Tarjeta: React.FC<{ lf: number; en: number; y: number; titulo: string; sub: string }> = ({ lf, en, y, titulo, sub }) => {
  if (lf < en - 1) return null;
  const s = spring({ frame: lf - en, fps: 30, config: { damping: 16, stiffness: 130 } });
  const ping = interpolate(lf, [en + 4, en + 30], [0, 1], c);
  return (
    <div style={{ position: "absolute", left: 150, width: 780, top: y + (1 - s) * 60, height: 122, borderRadius: 30, background: "linear-gradient(180deg, rgba(255,248,235,0.1), rgba(255,248,235,0.035))", border: "1px solid rgba(255,240,215,0.16)", boxShadow: "0 26px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)", backdropFilter: "blur(22px)", opacity: Math.min(1, s * 1.3), filter: s < 0.98 ? `blur(${(1 - s) * 10}px)` : undefined, display: "flex", alignItems: "center", gap: 26, padding: "0 34px", boxSizing: "border-box" }}>
      <div style={{ position: "relative", width: 62, height: 62, borderRadius: 18, background: ambar(0.14), border: `1px solid ${ambar(0.45)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <LogoRadar s={38} color="#ffc860" />
        <div style={{ position: "absolute", inset: -2, borderRadius: 20, border: `2px solid ${AMBAR}`, transform: `scale(${1 + ping * 0.5})`, opacity: 1 - ping }} />
      </div>
      <div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 33, color: CREMA, letterSpacing: -0.3 }}>{titulo}</div>
        <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: 4, color: "rgba(255,240,215,0.5)", marginTop: 6 }}>{sub}</div>
      </div>
    </div>
  );
};

const E06: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e06" f={f} golpes={["proponen", "recuerda"]}>
    {(lf, w) => (
      <>
        <Ondas lf={lf} desde={w("proponen") - 4} cada={12} n={3} y={640} r0={190} r1={460} vida={40} />
        <Ondas lf={lf} desde={w("recuerda") - 4} cada={12} n={3} y={640} r0={190} r1={460} vida={40} />
        <Objeto src="setters-rc/ins/antena-hd.webp" lf={lf} y={640} size={430} />
        <Tarjeta lf={lf} en={w("proponen") - 4} y={960} titulo="Te propusieron una práctica" sub="RING SETTERS · AHORA" />
        <Tarjeta lf={lf} en={w("recuerda") - 4} y={1108} titulo="Mañana 19:00 · práctica" sub="RECORDATORIO · 1 DÍA ANTES" />
        <Leyenda lf={lf} top={1440} lineas={[{ t: <>Te avisa cuando te proponen una práctica,</>, en: 3 }, { t: <>y te la <Em>recuerda</Em> un día antes.</>, en: w("recuerda") - 3 }]} />
      </>
    )}
  </Escena>
);

const E07: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e07" f={f} golpes={["terminar", "verdad"]}>
    {(lf, w) => {
      const v = w("verdad") - 2;
      const brillo = interpolate(lf, [0, v - 1, v + 1, v + 16], [0.4, 0.5, 1.45, 1], c);
      return (
        <>
          <Mira lf={lf} r={350} rotulo="VALORACIÓN DEL COMPAÑERO" />
          <Ondas lf={lf} desde={v} cada={8} n={3} r0={300} r1={720} vida={34} />
          <Objeto src="setters-rc/tro/setter_five_stars-hd.webp" lf={lf} size={640} brillo={brillo} luz={v} halo={lf > v ? 0.7 : 0.25} />
          <Chispas f={lf} desde={v} n={40} y0={760} alto={240} />
          <Destello lf={lf} en={v} />
          <Rotulo lf={lf} en={w("ir") - 6} x={CX} y={1245} tam={22}>¿IBA A IR?  ·  SÍ</Rotulo>
          <Leyenda lf={lf} lineas={[{ t: <>Al terminar, tu compañero te dice <Em>la verdad</Em>:</>, en: 3 }, { t: <>si esa cita, de verdad, iba a ir.</>, en: w("si") - 2 }]} />
        </>
      );
    }}
  </Escena>
);

const Contador: React.FC<{ lf: number; en: number; hasta: number; x: number; y: number; rotulo: string; color: string }> = ({ lf, en, hasta, x, y, rotulo, color }) => {
  const q = interpolate(lf, [en, en + 34], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const p = interpolate(lf, [en - 2, en + 10], [0, 1], { ...c, easing: cine });
  return (
    <div style={{ position: "absolute", left: x - 220, width: 440, top: y, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <div style={{ fontFamily: MONO, fontSize: 84, color, letterSpacing: 1, textShadow: `0 0 26px ${ambar(0.35)}` }}>
        {Math.round(hasta * q)}
        <span style={{ fontSize: 46 }}>%</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 6, color: "rgba(255,240,215,0.55)", marginTop: 2 }}>{rotulo}</div>
    </div>
  );
};

const E08: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e08" f={f} golpes={["tasa", "show"]}>
    {(lf, w) => {
      const y = 780;
      const fa = interpolate(lf, [w("tasa") - 2, w("tasa") + 34], [0, 0.38], { ...c, easing: Easing.out(Easing.cubic) });
      const fb = interpolate(lf, [w("show") - 2, w("show") + 34], [0, 0.72], { ...c, easing: Easing.out(Easing.cubic) });
      const La = 2 * Math.PI * 262;
      const Lb = 2 * Math.PI * 312;
      const base = interpolate(lf, [2, 22], [0, 1], c);
      return (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <filter id="g8" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={7} result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx={CX} cy={y} r={262} fill="none" stroke={ambar(0.12)} strokeWidth={14} opacity={base} />
            <circle cx={CX} cy={y} r={312} fill="none" stroke="rgba(236,232,223,0.08)" strokeWidth={14} opacity={base} />
            <circle cx={CX} cy={y} r={262} fill="none" stroke={AMBAR} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${La * fa} ${La}`} transform={`rotate(-90 ${CX} ${y})`} filter="url(#g8)" opacity={fa > 0 ? 1 : 0} />
            <circle cx={CX} cy={y} r={312} fill="none" stroke="#efe8da" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${Lb * fb} ${Lb}`} transform={`rotate(-90 ${CX} ${y})`} filter="url(#g8)" opacity={fb > 0 ? 0.92 : 0} />
          </svg>
          <Objeto src="setters-rc/ins/mira-hd.webp" lf={lf} y={y} size={380} />
          <Contador lf={lf} en={w("tasa") - 2} hasta={38} x={300} y={1130} rotulo="TASA DE AGENDA" color="#ffc860" />
          <Contador lf={lf} en={w("show") - 2} hasta={72} x={780} y={1130} rotulo="SHOW RATE" color={CREMA} />
          <Leyenda lf={lf} lineas={[{ t: <>Medís tu <Em>tasa de agenda</Em>.</>, en: 3 }, { t: <>Y tu show rate.</>, en: w("show") - 4 }]} />
        </>
      );
    }}
  </Escena>
);

const E09: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e09" f={f} golpes={["Fathom", "repasás"]}>
    {(lf, w, d) => {
      const y = 800;
      const play = interpolate(lf, [w("grabación") - 4, d], [0, 340], c);
      const crece = interpolate(lf, [0, 22], [0, 1], { ...c, easing: cine });
      const marcas = [62, 148, 236];
      return (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <filter id="g9" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={6} result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {Array.from({ length: 132 }, (_, i) => {
              const ang = (i * 360) / 132;
              const amp = (0.22 + 0.78 * Math.abs(Math.sin(i * 0.37) * Math.sin(i * 0.11 + 1))) * (0.55 + 0.45 * az(i));
              const t = ((ang - 90) * Math.PI) / 180;
              const r1 = 236;
              const r2 = 236 + amp * 120 * crece;
              const on = ang <= play;
              return <line key={i} x1={CX + Math.cos(t) * r1} y1={y + Math.sin(t) * r1} x2={CX + Math.cos(t) * r2} y2={y + Math.sin(t) * r2} stroke={on ? "#ffc860" : "rgba(236,232,223,0.2)"} strokeWidth={4.5} strokeLinecap="round" />;
            })}
            {(() => {
              const t = ((play - 90) * Math.PI) / 180;
              return <line x1={CX + Math.cos(t) * 214} y1={y + Math.sin(t) * 214} x2={CX + Math.cos(t) * 384} y2={y + Math.sin(t) * 384} stroke="#fff1d6" strokeWidth={3} filter="url(#g9)" opacity={play > 0 ? 1 : 0} />;
            })()}
            {marcas.map((m, k) => {
              const en = w("repasás") - 4 + k * 5;
              const s = spring({ frame: lf - en, fps: 30, config: { damping: 10, stiffness: 180 } });
              const t = ((m - 90) * Math.PI) / 180;
              const x = CX + Math.cos(t) * 400;
              const yy = y + Math.sin(t) * 400;
              return lf >= en ? <rect key={k} x={x - 9} y={yy - 9} width={18} height={18} fill={AMBAR} transform={`rotate(45 ${x} ${yy}) scale(1)`} opacity={s} filter="url(#g9)" style={{ transformBox: "fill-box" }} /> : null;
            })}
          </svg>
          <Objeto src="setters-rc/ins/sonar-hd.webp" lf={lf} y={y} size={350} />
          <Rotulo lf={lf} en={w("Fathom") - 4} x={CX} y={1236} tam={20}>FATHOM · GRABACIÓN 32:14</Rotulo>
          <Leyenda lf={lf} lineas={[{ t: <>Subís la grabación de Fathom</>, en: 3 }, { t: <>y <Em>repasás</Em> cada llamada.</>, en: w("repasás") - 4 }]} />
        </>
      );
    }}
  </Escena>
);

const Moneda: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: "radial-gradient(circle at 34% 28%, #fff3d0 0%, #ffcf6e 20%, #e0950f 52%, #8a5307 100%)", boxShadow: "inset 0 0 0 7px rgba(110,66,6,0.55), inset 0 0 0 12px rgba(255,222,150,0.55), inset 0 -10px 24px rgba(80,40,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <LogoRadar s={s * 0.5} color="#6b3f05" ancho={2.4} />
  </div>
);

const E10: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e10" f={f} golpes={["confirmada", "créditos"]}>
    {(lf, w) => {
      const N = 7;
      const base = w("cita") - 4;
      const cada = Math.max(4, Math.round((w("créditos") + 6 - base) / N));
      const piso = 1120;
      const llegadas = Array.from({ length: N }, (_, k) => base + 16 + k * cada);
      const n = llegadas.filter((t) => lf >= t).length;
      const ult = llegadas.filter((t) => lf >= t).pop() ?? -100;
      const pop = Math.exp(-(lf - ult) / 6);
      return (
        <>
          <div style={{ position: "absolute", left: CX - 260, top: piso - 40, width: 520, height: 120, borderRadius: "50%", background: `radial-gradient(ellipse, ${ambar(0.28 + n * 0.03)} 0%, transparent 70%)` }} />
          {Array.from({ length: N }, (_, k) => {
            const t0 = llegadas[k] - 16;
            if (lf < t0) return null;
            const q = interpolate(lf, [t0, t0 + 16], [0, 1], { ...c, easing: Easing.in(Easing.quad) });
            const yd = piso - k * 32;
            const rebote = lf > t0 + 16 ? Math.exp(-(lf - t0 - 16) / 4) * Math.sin((lf - t0 - 16) / 2) * 10 : 0;
            const y = interpolate(q, [0, 1], [-220, yd]) - rebote;
            const giro = (1 - q) * 900;
            const tilt = q * 70;
            const x = CX + (az(k) - 0.5) * 60 * (1 - q);
            return (
              <div key={k} style={{ position: "absolute", left: x - 120, top: y - 120, width: 240, height: 240, transform: `perspective(900px) rotateX(${tilt}deg) rotateY(${giro}deg)`, zIndex: k }}>
                <Moneda s={240} />
              </div>
            );
          })}
          {llegadas.map((t, k) => {
            const q = interpolate(lf, [t, t + 22], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
            if (lf < t || q >= 1) return null;
            return <div key={k} style={{ position: "absolute", left: CX - 100 - q * 180, top: piso - k * 32 - 30 - q * 40, width: 200 + q * 360, height: 60 + q * 80, borderRadius: "50%", border: `2px solid ${ambar(1 - q)}` }} />;
          })}
          {llegadas.map((t, k) => <Chispas key={k} f={lf} desde={t} n={10} y0={piso - k * 32 - 20} alto={30} />)}
          <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", opacity: interpolate(lf, [base + 10, base + 20], [0, 1], c) }}>
            <div style={{ fontFamily: MONO, fontSize: 104, color: "#ffc860", transform: `scale(${1 + pop * 0.12})`, textShadow: `0 0 ${20 + pop * 30}px ${ambar(0.5)}` }}>+{n * 10}</div>
            <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 9, color: "rgba(255,240,215,0.6)", marginTop: 4 }}>CRÉDITOS</div>
          </div>
          <Leyenda lf={lf} lineas={[{ t: <>Cada cita confirmada te suma <Em>créditos</Em>.</>, en: 3 }]} />
        </>
      );
    }}
  </Escena>
);

const CARRUSEL: { src: string; col: string }[] = [
  { src: "sig/oro", col: "#F2B705" },
  { src: "ins/antena", col: AMBAR },
  { src: "sig/fosforo", col: "#39FF88" },
  { src: "ins/torre", col: AMBAR },
  { src: "sig/cian", col: "#3FD8FF" },
  { src: "ins/mira", col: AMBAR },
  { src: "sig/ionosfera", col: "#A78BFA" },
  { src: "sig/alerta", col: "#FF4D4D" },
];

const E11: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e11" f={f} golpes={["equipás", "colores"]}>
    {(lf, w, d) => {
      const y = 800;
      const giro = interpolate(lf, [0, d], [-120, 360 - 90], { ...c, easing: Easing.inOut(Easing.cubic) });
      const items = CARRUSEL.map((it, i) => {
        const a = ((giro + (i * 360) / CARRUSEL.length) * Math.PI) / 180;
        const prof = Math.cos(a);
        return { ...it, i, x: CX + Math.sin(a) * 300, prof };
      }).sort((p, q) => p.prof - q.prof);
      const frente = items[items.length - 1];
      const pulso = interpolate(lf, [w("colores") - 3, w("colores") + 3, w("colores") + 24], [0, 1, 0.3], c);
      return (
        <>
          <div style={{ position: "absolute", left: CX - 420, top: y - 420, width: 840, height: 840, borderRadius: "50%", background: `radial-gradient(circle, ${frente.col}${Math.round(40 + pulso * 70).toString(16).padStart(2, "0")} 0%, transparent 60%)` }} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <ellipse cx={CX} cy={y + 150} rx={330} ry={90} fill="none" stroke={ambar(0.2)} strokeWidth={1.2} />
          </svg>
          {items.map((it) => {
            const k = (it.prof + 1) / 2;
            const s = spring({ frame: lf - 2 - it.i * 2, fps: 30, config: { damping: 14 } });
            const size = 350 * (0.42 + 0.58 * k) * (0.6 + 0.4 * s);
            const yy = y + it.prof * 120 - 20;
            return (
              <div key={it.i} style={{ position: "absolute", left: it.x - size / 2, top: yy - size / 2 + Math.sin(lf / 20 + it.i) * 6, width: size, height: size, opacity: s * (0.25 + 0.75 * k), filter: `blur(${(1 - k) * 5}px) brightness(${0.45 + 0.55 * k + (it === frente ? pulso * 0.25 : 0)})` }}>
                <Img src={staticFile(`setters-rc/${it.src}-hd.webp`)} style={{ width: size, height: size, filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.6))" }} />
              </div>
            );
          })}
          <Leyenda lf={lf} lineas={[{ t: <>Y con esos créditos equipás tu carnet:</>, en: 3 }, { t: <>insignias, <Em>colores de señal</Em>.</>, en: w("insignias") - 3 }]} />
        </>
      );
    }}
  </Escena>
);

const OTROS: [string, number][] = [["@mati.setter", 1480], ["@caro.agenda", 1395], ["@nico.dials", 1310], ["@vale.citas", 1240]];

const E12: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e12" f={f} golpes={["tabla", "trofeos"]}>
    {(lf, w) => {
      const top = 420;
      const h = 104;
      const posF = interpolate(lf, [w("tabla") - 4, w("comunidad") + 8], [4, 0], { ...c, easing: Easing.inOut(Easing.cubic) });
      const pts = Math.round(interpolate(posF, [0, 4], [1525, 1120]));
      const ent = (i: number) => interpolate(lf, [2 + i * 3, 14 + i * 3], [0, 1], { ...c, easing: cine });
      const fila = (key: string, y: number, rango: number, alias: string, p: number, vos: boolean, e: number) => (
        <div key={key} style={{ position: "absolute", left: 120, width: 840, top: y, height: h - 14, display: "flex", alignItems: "center", gap: 30, padding: "0 30px", boxSizing: "border-box", borderRadius: 18, background: vos ? ambar(0.1) : "transparent", borderBottom: vos ? "none" : "1px solid rgba(255,240,215,0.1)", boxShadow: vos ? `0 0 40px ${ambar(0.18)}, inset 0 0 0 1px ${ambar(0.5)}` : undefined, opacity: e, transform: `translateX(${(1 - e) * 40}px)`, zIndex: vos ? 2 : 1 }}>
          <div style={{ fontFamily: MONO, fontSize: 30, color: vos ? "#ffc860" : "rgba(255,240,215,0.45)", width: 50 }}>{rango}</div>
          <div style={{ flex: 1, fontFamily: vos ? SERIF : SANS, fontStyle: vos ? "italic" : "normal", fontWeight: vos ? 400 : 600, fontSize: vos ? 46 : 34, color: vos ? "#ffd88a" : "rgba(244,239,231,0.8)" }}>{alias}</div>
          <div style={{ fontFamily: MONO, fontSize: 28, color: vos ? "#ffc860" : "rgba(255,240,215,0.5)" }}>{p.toLocaleString("es-UY")}</div>
        </div>
      );
      const trofeos = ["setter_streak_10", "setter_rank_leyenda_radar", "setter_rank_operador"];
      return (
        <>
          <Rotulo lf={lf} en={0} x={CX} y={top - 60} tam={19}>TABLA DE TU COMUNIDAD</Rotulo>
          {OTROS.map(([a, p], i) => {
            const shift = interpolate(posF, [i, i + 1], [1, 0], c);
            const y = top + (i + shift) * h;
            return fila(a, y, i + Math.round(shift) + 1, a, p, false, ent(i));
          })}
          {fila("vos", top + posF * h, Math.round(posF) + 1, "Vos", pts, true, ent(4))}
          {trofeos.map((t, k) => (
            <Objeto key={t} src={`setters-rc/tro/${t}-hd.webp`} lf={lf} en={w("trofeos") - 6 + k * 4} x={300 + k * 240} y={1200 - (k === 1 ? 20 : 0)} size={k === 1 ? 290 : 240} halo={0.55} />
          ))}
          <Destello lf={lf} en={w("trofeos") - 2} y={1200} k={0.6} />
          <Leyenda lf={lf} lineas={[{ t: <>Subís en la tabla de tu comunidad,</>, en: 3 }, { t: <>y ganás <Em>trofeos</Em> de setter.</>, en: w("ganás") - 3 }]} />
        </>
      );
    }}
  </Escena>
);

export const Carnet: React.FC<{ lf: number; luz: number }> = ({ lf, luz }) => {
  const W = 820;
  const H = 518;
  const s = spring({ frame: lf - 2, fps: 30, config: { damping: 16, stiffness: 80 } });
  const barr = interpolate(lf, [luz, luz + 30], [-30, 140], c);
  return (
    <div style={{ position: "absolute", left: CX - W / 2, top: 820 - H / 2 + (1 - s) * 80, width: W, height: H, borderRadius: 34, overflow: "hidden", opacity: s, transform: `perspective(1600px) rotateY(${Math.sin(lf / 45) * 8 + (1 - s) * -30}deg) rotateX(${7 + Math.sin(lf / 60) * 2}deg)`, boxShadow: "0 50px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,216,138,0.4), 0 0 80px rgba(245,158,11,0.18)", background: "linear-gradient(128deg, #1f1405 0%, #2e1e08 40%, #7a5313 80%, #b9821c 104%)" }}>
      <Img src={staticFile("setters-rc/metal-setter.webp")} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", opacity: 0.3, mixBlendMode: "overlay" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 20 }, (_, k) => {
          let d = "";
          for (let x = 0; x <= W; x += 12) d += `${x === 0 ? "M" : "L"} ${x} ${H * 0.58 + Math.sin((x / W) * Math.PI * 2 * 2.5 + k * 0.33) * (40 + k * 7)} `;
          return <path key={k} d={d} fill="none" stroke="rgba(255,216,138,0.1)" strokeWidth={1} />;
        })}
      </svg>
      <div style={{ position: "absolute", right: -60, top: 110, opacity: 0.16 }}>
        <LogoRadar s={360} color="#ffd88a" ancho={1.2} />
      </div>
      <div style={{ position: "absolute", left: 46, top: 38, display: "flex", alignItems: "center", gap: 16 }}>
        <LogoRadar s={50} color="#ffd88a" />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: "#ffd88a", letterSpacing: -0.5 }}>Ring Setters</div>
      </div>
      <div style={{ position: "absolute", right: 46, top: 52, fontFamily: MONO, fontSize: 15, letterSpacing: 5, color: "rgba(255,216,138,0.75)" }}>CARNET DE SETTER</div>
      <div style={{ position: "absolute", left: 46, top: 176 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 54, color: "#fff3dc", letterSpacing: -1 }}>@lucia.agenda</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 6, color: "#ffb020" }}>OPERADOR</div>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i < 3 ? "#ffb020" : "transparent", border: "1.5px solid #ffb020" }} />)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 46, bottom: 40, display: "flex", gap: 48 }}>
        {[["N.º SOCIO", "0042"], ["PROMOCIÓN", "2026"], ["PAÍS", "UY"]].map(([a, b]) => (
          <div key={a}>
            <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: 4, color: "rgba(255,216,138,0.55)" }}>{a}</div>
            <div style={{ fontFamily: MONO, fontSize: 26, color: "#ffe9c2", marginTop: 4 }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 46, bottom: 44, fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: "rgba(255,216,138,0.7)" }}>El radar nunca duerme</div>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, transparent ${barr - 16}%, rgba(255,246,225,0.32) ${barr}%, transparent ${barr + 16}%)`, mixBlendMode: "screen" }} />
    </div>
  );
};

const E13: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e13" f={f} golpes={["carnet", "directores"]}>
    {(lf, w) => {
      const cv = w("CV") - 4;
      const sc = spring({ frame: lf - cv, fps: 30, config: { damping: 15, stiffness: 90 } });
      const vista = w("vista") - 4;
      const haz = interpolate(lf, [vista, vista + 6, vista + 34, vista + 46], [0, 1, 1, 0], c);
      const scan = interpolate(lf, [vista + 2, vista + 32], [560, 1080], { ...c, easing: Easing.inOut(Easing.quad) });
      return (
        <>
          {lf >= cv && (
            <div style={{ position: "absolute", left: CX - 240 + 150 * sc, top: 560 - 40 * sc, width: 480, height: 640, borderRadius: 10, background: "linear-gradient(180deg, #1b1610, #110d08)", border: `1px solid ${ambar(0.28)}`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", transform: `rotate(${8 * sc}deg)`, opacity: sc, padding: 40, boxSizing: "border-box" }}>
              <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 5, color: ambar(0.8) }}>CV · SETTER</div>
              {[0.9, 0.6, 0.75, 0.5, 0.82, 0.4, 0.7, 0.55].map((k, i) => <div key={i} style={{ width: `${k * 100}%`, height: 9, borderRadius: 5, background: "rgba(255,240,215,0.12)", marginTop: i === 0 ? 30 : 22 }} />)}
            </div>
          )}
          <Carnet lf={lf} luz={vista + 4} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: haz, mixBlendMode: "screen" }}>
            <defs>
              <linearGradient id="hz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffc860" stopOpacity={0.5} />
                <stop offset="1" stopColor="#ffc860" stopOpacity={0} />
              </linearGradient>
            </defs>
            <polygon points={`850,380 150,${scan} 930,${scan}`} fill="url(#hz)" opacity={0.35} />
            <line x1={130} y1={scan} x2={950} y2={scan} stroke="#ffe2a8" strokeWidth={2.5} />
          </svg>
          <Objeto src="setters-rc/ins/satelite-hd.webp" lf={lf} en={4} x={850} y={360} size={230} halo={0.45} />
          <Rotulo lf={lf} en={w("directores") - 4} x={CX} y={1150} tam={21}>● ● ●  VISTO POR 3 DIRECTORES</Rotulo>
          <Leyenda lf={lf} lineas={[{ t: <>Tu carnet y tu CV quedan a la vista</>, en: 3 }, { t: <>de los <Em>directores</Em>.</>, en: w("directores") - 6 }]} />
        </>
      );
    }}
  </Escena>
);

const OFERTAS: { x: number; y: number; lado: "left" | "right"; t: string }[] = [
  { x: 70, y: 410, lado: "left", t: "Appointment setter · remoto" },
  { x: 1010, y: 520, lado: "right", t: "Setter high ticket" },
  { x: 70, y: 1160, lado: "left", t: "Setter bilingüe" },
  { x: 1010, y: 1250, lado: "right", t: "SDR · fijo + comisión" },
];

const E14: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e14" f={f} golpes={["ofertas", "setters"]}>
    {(lf, w) => {
      const y = 840;
      const ens = OFERTAS.map((_, k) => w("ofertas") - 8 + k * 8);
      return (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <filter id="g14" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation={6} result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {OFERTAS.map((o, k) => {
              const en = ens[k];
              if (lf < en) return null;
              const ox = o.lado === "left" ? o.x + 14 : o.x - 14;
              const oy = o.y + 70;
              const dib = interpolate(lf, [en, en + 10], [0, 1], { ...c, easing: cine });
              const q = interpolate(lf, [en + 4, en + 20], [0, 1], { ...c, easing: Easing.in(Easing.quad) });
              const px = ox + (CX - ox) * q;
              const py = oy + (y - oy) * q;
              return (
                <g key={k}>
                  <line x1={ox} y1={oy} x2={ox + (CX - ox) * dib} y2={oy + (y - oy) * dib} stroke={ambar(0.3)} strokeWidth={1.2} strokeDasharray="4 8" />
                  {q < 1 && <circle cx={px} cy={py} r={7} fill="#fff1d6" filter="url(#g14)" />}
                </g>
              );
            })}
          </svg>
          {ens.map((en, k) => <Ondas key={k} lf={lf} desde={en + 20} cada={10} n={1} y={y} r0={200} r1={430} vida={30} />)}
          <Objeto src="setters-rc/ins/torre-hd.webp" lf={lf} y={y} size={440} halo={0.4 + 0.1 * ens.filter((e) => lf > e + 20).length} />
          {OFERTAS.map((o, k) => {
            const en = ens[k];
            const p = interpolate(lf, [en - 2, en + 10], [0, 1], { ...c, easing: cine });
            return (
              <div key={k} style={{ position: "absolute", top: o.y, left: o.lado === "left" ? o.x : undefined, right: o.lado === "right" ? 1080 - o.x : undefined, textAlign: o.lado, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>
                <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 5, color: AMBAR }}>● OFERTA</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: CREMA, marginTop: 6, whiteSpace: "nowrap" }}>{o.t}</div>
              </div>
            );
          })}
          <Leyenda lf={lf} lineas={[{ t: <>Y te llegan ofertas de trabajo</>, en: 3 }, { t: <>pensadas <Em>para setters</Em>.</>, en: w("pensadas") - 3 }]} />
        </>
      );
    }}
  </Escena>
);

const ANILLO = ["ins/antena", "tro/setter_five_stars", "ins/mira", "tro/setter_streak_10", "ins/sonar", "tro/setter_rank_operador", "ins/satelite", "tro/setter_first_roleplay", "ins/torre", "tro/setter_rank_leyenda_radar"];

const E15: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e15" f={f} golpes={["ring", "suyo"]}>
    {(lf, w) => {
      const y = 800;
      const tc = w("closers") - 4;
      const ta = w("Ahora") - 4;
      const ts = w("suyo") - 3;
      const achica = interpolate(lf, [ta, ta + 20], [1, 0.5], { ...c, easing: cine });
      const atenua = interpolate(lf, [ta, ta + 20], [1, 0.22], c);
      const gira = lf * 0.25;
      const logo = spring({ frame: lf - ts, fps: 30, config: { damping: 11, stiffness: 140 } });
      return (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: atenua }}>
            <circle cx={CX} cy={y} r={300 * achica} fill="none" stroke="rgba(236,232,223,0.35)" strokeWidth={1.2} opacity={interpolate(lf, [tc, tc + 14], [0, 1], c)} />
            {Array.from({ length: 14 }, (_, i) => {
              const a = (((i * 360) / 14 - 90) * Math.PI) / 180;
              const s = spring({ frame: lf - tc - i * 1.2, fps: 30, config: { damping: 9, stiffness: 160 } });
              return <circle key={i} cx={CX + Math.cos(a) * 300 * achica} cy={y + Math.sin(a) * 300 * achica} r={8 * s} fill="#ece8df" />;
            })}
          </svg>
          <Rotulo lf={lf} en={tc + 6} x={CX} y={y - 380} tam={19} color="rgba(236,232,223,0.6)">{lf < ta ? "CLOSERS" : ""}</Rotulo>
          {ANILLO.map((src, i) => {
            const en = w("setters") - 6 + i * 2;
            if (lf < en - 1) return null;
            const s = spring({ frame: lf - en, fps: 30, config: { damping: 15, stiffness: 70 } });
            const a = (((i * 360) / ANILLO.length + gira - 90) * Math.PI) / 180;
            const r = 340 + (1 - s) * 800;
            const sz = 170;
            return (
              <div key={src} style={{ position: "absolute", left: CX + Math.cos(a) * r - sz / 2, top: y + Math.sin(a) * r - sz / 2, width: sz, height: sz, opacity: Math.min(1, s * 1.5), filter: `blur(${(1 - s) * 10}px)` }}>
                <Img src={staticFile(`setters-rc/${src}-hd.webp`)} style={{ width: sz, height: sz, filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.6))" }} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: CX - 120, top: y - 120, width: 240, height: 240, opacity: Math.min(1, logo), transform: `scale(${0.5 + 0.5 * logo})`, filter: `drop-shadow(0 0 ${30 * logo}px ${ambar(0.8)})` }}>
            <LogoRadar s={240} color="#ffc860" ancho={2.2} />
          </div>
          <Ondas lf={lf} desde={ts} cada={9} n={3} y={y} r0={130} r1={700} vida={36} />
          <Chispas f={lf} desde={ts} n={50} y0={760} alto={300} />
          <Destello lf={lf} en={ts} y={y} />
          <Leyenda lf={lf} lineas={[{ t: <>Los closers ya tenían su ring.</>, en: 3 }, { t: <>Ahora los setters tienen <Em>el suyo</Em>.</>, en: ta }]} />
        </>
      );
    }}
  </Escena>
);

const E16: React.FC<{ f: number }> = ({ f }) => (
  <Escena id="e16" f={f} golpes={["abierto"]} sinSalida>
    {(lf, w, d) => {
      const A = w("Ring") - 3;
      const ab = w("abierto") - 3;
      const negro = interpolate(lf, [d - 26, d], [0, 1], c);
      return (
        <>
          <Fondo f={f} k={2.2} />
          <Chispas f={lf} desde={A} n={40} />
          <Chispas f={lf} desde={ab} n={50} y0={1100} alto={150} />
          <Marca f={lf} A={A} top={720} />
          <Rotulo lf={lf} en={w("Ya") - 3} x={CX} y={1110} tam={30} color="#ffc860">YA ESTÁ ABIERTO</Rotulo>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 38, color: "rgba(244,239,231,0.7)", opacity: interpolate(lf, [ab + 14, ab + 30], [0, 1], c) }}>
            El radar nunca duerme.
          </div>
          <Destello lf={lf} en={ab} y={1130} />
          <Destello lf={lf} en={A} y={900} k={0.8} />
          <AbsoluteFill style={{ background: `rgba(0,0,0,${negro})` }} />
        </>
      );
    }}
  </Escena>
);

/* ───────────── la composición ───────────── */

const ESCENAS = ["e04", "e05", "e06", "e07", "e08", "e09", "e10", "e11", "e12", "e13", "e14", "e15", "e16"];

export const SettersVideo: React.FC = () => {
  const f = useCurrentFrame();
  const fin1 = INI("e04");
  const T = { on: 12, closers: G("e01", "closers") - 3, cierre: G("e02", "cierre") - 3, det: G("e03", "alguien") - 3, marca: G("e03", "Ring") - 3 };
  const sal1 = interpolate(f, [fin1 - 7, fin1], [0, 1], { ...c, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < fin1 && (
        <AbsoluteFill style={{ opacity: 1 - sal1, transform: `scale(${1 + sal1 * 0.1})`, filter: sal1 > 0 ? `blur(${sal1 * 12}px)` : undefined }}>
          <Apertura f={f} T={T} />
          <Leyenda lf={f} lineas={[{ t: <>Durante años, todo fue para los <Em>closers</Em>.</>, en: INI("e01") + 40 }]} sale={INI("e02") + 4} />
          <Leyenda lf={f} lineas={[{ t: <>Pero ninguna venta empieza en el <Em>cierre</Em>.</>, en: INI("e02") + 4 }]} sale={INI("e03") + 4} />
          <Leyenda lf={f} lineas={[{ t: <>Empieza con <Em>alguien</Em> que consigue la cita.</>, en: INI("e03") + 4 }]} sale={G("e03", "Llegó") - 2} />
        </AbsoluteFill>
      )}
      {f >= fin1 - 1 && f < INI("e16") && <Fondo f={f} />}
      <E04 f={f} />
      <E05 f={f} />
      <E06 f={f} />
      <E07 f={f} />
      <E08 f={f} />
      <E09 f={f} />
      <E10 f={f} />
      <E11 f={f} />
      <E12 f={f} />
      <E13 f={f} />
      <E14 f={f} />
      <E15 f={f} />
      <E16 f={f} />
      {ESCENAS.map((id) => <Corte key={id} f={f} en={INI(id)} />)}
      <Acabado />
    </AbsoluteFill>
  );
};

export { tl };
