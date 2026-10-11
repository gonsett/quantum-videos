/**
 * "Rayos X de ventas" (26/09/2026): réplica del formato Kayn "Brand X-Ray" pedida por Javier
 * ("el tipo exacto de video de Kayn... toda la arquitectura"). Por eso este video, y solo este,
 * usa resaltador amarillo y la paleta de Kayn (papel, tinta negra, amarillo, verde de contorno).
 * Piezas: Plano (foto de IA con empujón lento), Semitono + Grano encima de todo, Resaltador,
 * tipografía mixta (serif itálica chica + condensada en mayúsculas), Sticker que cae sobre la hoja.
 */
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as cargarAnton } from "@remotion/google-fonts/Anton";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";

export const ANTON = cargarAnton().fontFamily;
export const SERIF = cargarSerif("italic").fontFamily;
export const TINTA = "#141210";
export const AMARILLO = "#FFD84A";
export const VERDE = "#3BD16F";

/** Foto a pantalla completa con empujón lento de cámara hacia (ox, oy) en %. */
export const Plano: React.FC<{ src: string; dur: number; desde?: number; hasta?: number; ox?: number; oy?: number; children?: React.ReactNode }> = ({
  src, dur, desde = 1.0, hasta = 1.12, ox = 50, oy = 50, children,
}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [desde, hasta], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${ox}% ${oy}%` }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {children}
    </AbsoluteFill>
  );
};

/** Trama de semitono (puntos) + grano animado + viñeta suave, encima de todo el video. */
export const Acabado: React.FC = () => {
  const f = useCurrentFrame();
  const semilla = Math.floor(f / 2) % 50;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(0,0,0,0.9) 0 1.3px, transparent 1.9px)",
          backgroundSize: "7px 7px",
          mixBlendMode: "soft-light",
          opacity: 0.55,
        }}
      />
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.32 }}>
        <svg width="100%" height="100%">
          <filter id="grano">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={semilla} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grano)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#ffb35c", mixBlendMode: "soft-light", opacity: 0.35 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.38) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Barra de resaltador que se pinta de izquierda a derecha detrás del texto. */
export const Resaltador: React.FC<{ desde: number; dur?: number; children: React.ReactNode; color?: string }> = ({
  desde, dur = 8, children, color = AMARILLO,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [desde, desde + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.12em" }}>
      <span
        style={{
          position: "absolute", left: 0, top: "16%", height: "72%", width: `${p * 100}%`,
          background: color, transform: "rotate(-1.2deg)",
          borderRadius: "0.08em 0.25em 0.12em 0.3em", opacity: 0.92,
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

/** Aparición de un renglón: sube un poco y se enfoca. */
export const Entra: React.FC<{ desde: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ desde, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [desde, desde + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: `blur(${(1 - p) * 6}px)`, ...style }}>{children}</div>;
};

/** Sticker troquelado que cae desde la cámara y rebota sobre la hoja. */
export const Sticker: React.FC<{ desde: number; x: number; y: number; rot: number; children: React.ReactNode; ancho?: number }> = ({
  desde, x, y, rot, children, ancho = 250,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - desde, fps, config: { damping: 11, stiffness: 170, mass: 0.7 } });
  if (f < desde) return null;
  const escala = interpolate(p, [0, 1], [1.9, 1]);
  const sombra = interpolate(p, [0, 1], [40, 6]);
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: ancho, transform: `translate(-50%,-50%) rotate(${rot + (1 - p) * 14}deg) scale(${escala})`,
        opacity: Math.min(1, p * 3),
        filter: `drop-shadow(0 ${sombra * 0.5}px ${sombra}px rgba(0,0,0,${0.18 + (1 - p) * 0.2})) drop-shadow(0 2px 2px rgba(0,0,0,0.35))`,
      }}
    >
      <div style={{ background: "#FBF8F1", borderRadius: 26, padding: "22px 18px 16px", border: "5px solid white", textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
};
