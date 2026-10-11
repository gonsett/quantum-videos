import React from "react";
import { AbsoluteFill } from "remotion";
import { RC, SANS } from "../elite-rc/dopamina";
import { Acabado, Destello as Bokeh } from "../secreto-rc/efectos";
import { ROJO } from "./escenas";
import { Caja } from "./VeteranosVideo";

/**
 * Portada del reel para veteranos (imagen fija 1080x1920). Mismo criterio que el video: el HÉROE es
 * el odómetro de "leads quemados" (en 4, rojo) y el texto es una capa discreta con el gancho.
 * Instagram recorta la grilla a 3:4 (y 240-1680): todo lo importante entre y=280 y y=1500.
 * Se exporta con `remotion still ... --frame=60 --public-dir=public-veteranos`.
 */
const Linea: React.FC<{ top: number; tam: number; peso?: number; color?: string; children: React.ReactNode }> = ({ top, tam, peso = 500, color = RC.platino300, children }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", whiteSpace: "nowrap", fontFamily: SANS, fontWeight: peso, fontSize: tam, lineHeight: 1.35, color }}>{children}</div>
);

export const PortadaVeteranos: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07080a" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 800px 900px at 50% 0px, rgba(255,255,255,0.05), rgba(0,0,0,0) 70%), radial-gradient(ellipse 950px 900px at 50% 1000px, rgba(229,83,75,0.18), rgba(0,0,0,0) 70%), radial-gradient(ellipse 700px 500px at 50% 380px, rgba(229,83,75,0.08), rgba(0,0,0,0) 70%), linear-gradient(180deg, #07080a, #0b0c0f 55%, #07080a)",
      }}
    />
    <div style={{ position: "absolute", inset: 0, filter: "hue-rotate(205deg)" }}>
      <Bokeh x={930} y={110} size={720} rot={18} blur={24} fase={0.4} opacidad={0.8} />
      <Bokeh x={90} y={1790} size={600} rot={-14} blur={28} fase={2.1} opacidad={0.66} />
      <Bokeh x={175} y={1010} size={110} rot={8} blur={2.5} fase={1.2} opacidad={0.5} />
    </div>
    <Linea top={380} tam={52}>Cada objeción nueva que probás</Linea>
    <Linea top={452} tam={52}>en una llamada real,</Linea>
    <Caja v={4} col={ROJO} rgb="229,83,75" pulso={0.35} cy={900} escala={1} frame={0} />
    <Linea top={1290} tam={66} peso={700} color={RC.crema}>
      <span style={{ position: "relative", display: "inline-block" }}>
        la pagás con un lead.
        <i style={{ position: "absolute", left: 0, right: 0, bottom: 3, height: 2, backgroundColor: ROJO }} />
      </span>
    </Linea>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1545, textAlign: "center", fontFamily: "inherit", fontWeight: 600, fontSize: 28, letterSpacing: "0.22em", color: RC.platino500 }}>@RING.CLOSERS</div>
    <Acabado />
  </AbsoluteFill>
);
