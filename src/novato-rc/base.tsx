/**
 * ⚠️ VARA DE CALIDAD (Javier, 19/09/2026): este video de novatos usó resaltadores de color, revelado
 * palabra por palabra con máscara y Oswald en todo, y Javier lo calificó "muy de CapCut, muy bajo
 * coste". NO usar estos recursos como protagonistas en videos nuevos. Piso = el video de élite
 * (`src/elite-rc/dopamina.tsx`) y por encima: tipografía cinematográfica, luz y profundidad reales,
 * pocas cosas con intención. Leer la sección "VARA DE CALIDAD" del skill video-cinematico-ring-closers.
 */
import React from "react";
import { Easing, Img, interpolate, spring, staticFile } from "remotion";
import { DISPLAY, MONO, RC, SANS } from "../ring-closers/tema";

export { DISPLAY, MONO, RC, SANS };

/**
 * Lenguaje visual del video para novatos: "El ascenso".
 *
 * A propósito distinto del de élite (que era de cortes con golpe, palabras que rebotan, objetos que
 * caen y cámara que sacude): acá la cámara SUBE de una escena a la siguiente atravesando las sogas
 * del ring; el texto sale de una máscara (sin rebote) y la palabra clave se marca con un resaltador
 * que barre; los objetos se elevan en vez de caer; el color pasa del ámbar del cuero crudo (el que
 * recién empieza) al esmeralda de la marca (cuando entra Ring Closers).
 */

export const W = 1080;
export const H = 1920;
export const AMBAR = "#f5a524";
export const TINTA = "#0a0a0c";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const salida = Easing.bezier(0.16, 1, 0.3, 1);
export const suave = Easing.bezier(0.65, 0, 0.35, 1);

export const tramo = (f: number, a: number, b: number, e: (t: number) => number = salida) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

/** Resorte corto con un poco de rebote; vale 0 antes de `en`. */
export const resorte = (f: number, en: number, rigidez = 170, amort = 16) =>
  spring({ frame: f - en, fps: 30, config: { stiffness: rigidez, damping: amort, mass: 0.9 } });

const AM = [245, 165, 36];
const ES = [52, 211, 153];
/** Color de acento entre ámbar (t=0) y esmeralda (t=1). */
export const mezclar = (t: number, alfa = 1) => {
  const c = AM.map((v, i) => Math.round(v + (ES[i] - v) * t));
  return `rgba(${c[0]},${c[1]},${c[2]},${alfa})`;
};

// ── Texto: sale de una máscara; la palabra clave lleva resaltador ─────────────

export type Tok = { t: string; en: number; hl?: boolean; color?: string };

const Palabra: React.FC<{ p: Tok; f: number; tam: number; lh: number; color: string; acento: string }> = ({ p, f, tam, lh, color, acento }) => {
  const k = tramo(f, p.en - 3, p.en + 6);
  const b = tramo(f, p.en - 2, p.en + 6, suave);
  const pt = 0.34 * tam; // aire arriba para que los tildes (É, Á, ¿) no se corten
  const pb = 0.2 * tam;
  const ph = p.hl ? 0.2 * tam : 0;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        padding: `${pt}px ${ph}px ${pb}px`,
        margin: `${-pt}px 0 ${-pb}px`,
        verticalAlign: "top",
      }}
    >
      {p.hl && (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: pt + 0.02 * tam,
            height: lh * tam - 0.06 * tam,
            backgroundColor: acento,
            borderRadius: 0.07 * tam,
            transformOrigin: "left center",
            transform: `scaleX(${b})`,
          }}
        />
      )}
      <span
        style={{
          position: "relative",
          display: "inline-block",
          transform: `translateY(${(1 - k) * 125}%)`,
          color: p.hl ? TINTA : p.color ?? color,
        }}
      >
        {p.t}
      </span>
    </span>
  );
};

export const Linea: React.FC<{
  f: number;
  top: number;
  tam: number;
  toks: Tok[];
  fuente?: string;
  peso?: number;
  mayus?: boolean;
  color?: string;
  acento?: string;
  esp?: string;
  lh?: number;
}> = ({ f, top, tam, toks, fuente = DISPLAY, peso = 700, mayus = true, color = RC.crema, acento = AMBAR, esp = "0", lh = 1.2 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      height: tam * lh,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      columnGap: tam * 0.26,
      fontFamily: fuente,
      fontWeight: peso,
      fontSize: tam,
      lineHeight: lh,
      letterSpacing: esp,
      textTransform: mayus ? "uppercase" : "none",
      whiteSpace: "nowrap",
    }}
  >
    {toks.map((p, i) => (
      <Palabra key={i} p={p} f={f} tam={tam} lh={lh} color={color} acento={acento} />
    ))}
  </div>
);

/** Etiqueta chica con borde fino (CÓMO, CON QUIÉN). */
export const Chip: React.FC<{ f: number; en: number; top: number; texto: string; color: string }> = ({ f, en, top, texto, color }) => {
  const k = tramo(f, en - 2, en + 8);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 18}px)` }}>
      <div
        style={{
          padding: "8px 30px 8px 34px",
          border: `1.5px solid ${color}`,
          borderRadius: 999,
          fontFamily: DISPLAY,
          fontWeight: 600,
          fontSize: 32,
          lineHeight: 1.2,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color,
        }}
      >
        {texto}
      </div>
    </div>
  );
};

// ── Objetos: se elevan (no caen) con un barrido de luz recortado por su propio alfa ──

export const Sube: React.FC<{
  f: number;
  src: string;
  bbox: number[]; // caja visible dentro de la imagen de 1024 px: [x0, y0, x1, y1]
  x: number; // centro de la caja visible
  y: number;
  alto: number; // alto de la caja visible
  en: number;
  dist?: number;
  sombra?: boolean;
  fase?: number;
}> = ({ f, src, bbox, x, y, alto, en, dist = 240, sombra = true, fase = 0 }) => {
  const esc = alto / (bbox[3] - bbox[1]);
  const lado = 1024 * esc;
  const cx = ((bbox[0] + bbox[2]) / 2) * esc;
  const cy = ((bbox[1] + bbox[3]) / 2) * esc;
  const k = resorte(f, en);
  const op = tramo(f, en, en + 6, suave);
  const flota = f > en + 14 ? Math.sin((f - en) / 26 + fase) * 6 : 0;
  const barrido = tramo(f, en + 6, en + 34, suave) * 150 - 25;
  const url = `url("${staticFile(src)}")`;
  if (f < en - 1) return null;
  return (
    <>
      {sombra && (
        <div
          style={{
            position: "absolute",
            left: x - alto * 0.34,
            top: y + alto / 2 + 14,
            width: alto * 0.68,
            height: 26,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)",
            opacity: op * (1 - 0.15 * (flota / 6)),
          }}
        />
      )}
      <div style={{ position: "absolute", left: x - cx, top: y - cy + (1 - k) * dist + flota, width: lado, height: lado, opacity: op }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", maxWidth: "none", filter: "drop-shadow(0 26px 34px rgba(0,0,0,0.55))" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: url,
            WebkitMaskSize: "100% 100%",
            maskImage: url,
            maskSize: "100% 100%",
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${barrido - 14}%, rgba(255,255,255,0.5) ${barrido}%, rgba(255,255,255,0) ${barrido + 14}%)`,
          }}
        />
      </div>
    </>
  );
};

/** Aro de puntos que gira despacio: el "ring" alrededor del objeto. */
export const Aro: React.FC<{ f: number; x: number; y: number; r: number; en: number; color: string }> = ({ f, x, y, r, en, color }) => {
  const k = tramo(f, en, en + 22);
  return (
    <svg width={2 * r + 20} height={2 * r + 20} style={{ position: "absolute", left: x - r - 10, top: y - r - 10, opacity: k, transform: `scale(${0.9 + 0.1 * k}) rotate(${f * 0.35}deg)` }}>
      <circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke={color} strokeWidth={3} strokeDasharray="1 15" strokeLinecap="round" />
      <circle cx={r + 10} cy={r + 10} r={r - 16} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
    </svg>
  );
};

/** Onda que se abre desde un punto: marca el momento de la palabra clave. */
export const Onda: React.FC<{ f: number; en: number; x: number; y: number; color: string; r?: number }> = ({ f, en, x, y, color, r = 420 }) => {
  const k = tramo(f, en, en + 20);
  if (f < en || k >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: "50%",
        border: `${Math.max(0.5, 4 * (1 - k))}px solid ${color}`,
        opacity: 0.75 * (1 - k),
        transform: `scale(${0.05 + 0.95 * k})`,
      }}
    />
  );
};
