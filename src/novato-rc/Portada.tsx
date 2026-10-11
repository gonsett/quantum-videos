import React from "react";
import { AbsoluteFill } from "remotion";
import { Acabado } from "../secreto-rc/efectos";
import { Aro, DISPLAY, Linea, RC, Sube, W, mezclar } from "./base";

const VERDE = RC.esmeralda400;

/**
 * Portada del reel para novatos (imagen fija 1080x1920). Mismo lenguaje que el video (resaltador
 * ámbar, cuero crudo, brasas) y distinto de la portada de élite (esa era plata y esmeralda).
 * Instagram recorta la grilla a 3:4 (y 240-1680): todo lo importante entre y=280 y y=1500.
 * Se exporta con `remotion still ... --frame=60 --public-dir=public-novato`.
 */
const frac = (x: number) => x - Math.floor(x);

export const PortadaNovato: React.FC = () => {
  const f = 60; // todo ya asentado
  const cue = (n: number) => -10 + n; // las palabras ya entraron
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080a" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 950px 950px at 50% 1120px, ${mezclar(1, 0.2)}, rgba(0,0,0,0) 70%), radial-gradient(ellipse 700px 500px at 50% 220px, ${mezclar(1, 0.08)}, rgba(0,0,0,0) 70%), linear-gradient(180deg, #07080a, #0b0c0f 55%, #07080a)`,
        }}
      />
      {Array.from({ length: 34 }, (_, i) => {
        const r1 = frac(Math.sin(i * 12.9898) * 43758.5453);
        const r2 = frac(Math.sin(i * 78.233) * 12345.6789);
        const r3 = frac(Math.sin(i * 39.346) * 9876.543);
        const t = 2 + 4 * r3;
        return <span key={i} style={{ position: "absolute", left: r2 * W, top: r1 * 1900, width: t, height: t, borderRadius: "50%", backgroundColor: mezclar(1), opacity: 0.12 + 0.4 * r3, filter: t > 4.5 ? "blur(1px)" : undefined }} />;
      })}
      <Linea f={f} top={290} tam={120} color={RC.crema} toks={[{ t: "¿Sos", en: cue(0) }, { t: "closer", en: cue(1) }]} />
      <Linea f={f} top={440} tam={222} acento={VERDE} toks={[{ t: "novato?", en: cue(2), hl: true }]} />
      <Linea f={f} top={740} tam={60} acento={VERDE} toks={[{ t: "y", en: cue(3) }, { t: "no", en: cue(3) }, { t: "sabés", en: cue(3) }, { t: "cómo", en: cue(3), hl: true }]} />
      <Linea f={f} top={824} tam={60} acento={VERDE} toks={[{ t: "o", en: cue(3) }, { t: "con quién", en: cue(3), hl: true }, { t: "practicar.", en: cue(3) }]} />
      <Aro f={f} x={540} y={1165} r={228} en={-30} color="rgba(52,211,153,0.6)" />
      <Sube f={f} src="ring-closers/shop/cuero-crudo.webp" bbox={[218, 85, 795, 937]} x={540} y={1165} alto={410} en={-40} dist={0} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 40px 14px 30px", borderRadius: 999, border: `2px solid ${VERDE}`, background: "rgba(52,211,153,0.1)", fontFamily: DISPLAY, fontWeight: 600, fontSize: 38, lineHeight: 1.2, letterSpacing: "0.16em", textTransform: "uppercase", color: RC.crema }}>
          <svg width="30" height="30" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={VERDE} /></svg>
          Escuchá esto
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1545, textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 28, letterSpacing: "0.22em", color: RC.platino500 }}>@RING.CLOSERS</div>
      <Acabado />
    </AbsoluteFill>
  );
};
