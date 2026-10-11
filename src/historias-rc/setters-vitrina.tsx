import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Acabado } from "../secreto-rc/efectos";
import { SANS, SERIF } from "./como-funciona";

/**
 * Destacada de Ring Setters, láminas del medio (04/10/2026): VITRINA DE MUSEO.
 * Abre y cierra con humanos (fotos de Gemini, setters-gpt.tsx); en el medio, un objeto ámbar por lámina
 * bajo foco cenital blanco, sobre pedestal de piedra oscura, con reflejo en el piso.
 * Color de marca SOLO en detalles finos (escuadras de 1 px y la palabra en itálica). Sin rótulo ni numeración.
 */
const AMBAR = "#F59E0B";
const PIE = 1220; // tapa del pedestal

const Escuadras: React.FC = () => {
  const L = 46, M = 64, s = { position: "absolute" as const, width: L, height: L, borderColor: "rgba(245,158,11,0.7)", borderStyle: "solid" as const, borderWidth: 0 };
  return (
    <>
      <div style={{ ...s, left: M, top: 210, borderLeftWidth: 1, borderTopWidth: 1 }} />
      <div style={{ ...s, right: M, top: 210, borderRightWidth: 1, borderTopWidth: 1 }} />
      <div style={{ ...s, left: M, bottom: 250, borderLeftWidth: 1, borderBottomWidth: 1 }} />
      <div style={{ ...s, right: M, bottom: 250, borderRightWidth: 1, borderBottomWidth: 1 }} />
    </>
  );
};

const Pieza: React.FC<{ src: string; tam: number; base: number }> = ({ src, tam, base }) => {
  const img = staticFile(`setters-rc/${src}-hd.webp`);
  const top = PIE + 8 - tam * base; // base = dónde termina el objeto en su PNG (0-1)
  return (
    <>
      {/* cono de luz cenital */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: PIE + 60, background: "linear-gradient(rgba(255,250,240,0.16), rgba(255,250,240,0.05) 70%, rgba(255,250,240,0))", clipPath: "polygon(43% 0, 57% 0, 78% 100%, 22% 100%)", filter: "blur(28px)" }} />
      <div style={{ position: "absolute", left: 540 - 260, top: -120, width: 520, height: 300, borderRadius: "50%", background: "radial-gradient(rgba(255,252,245,0.45), rgba(255,252,245,0) 70%)" }} />
      {/* reflejo en el piso */}
      <Img src={img} style={{ position: "absolute", left: 540 - tam / 2, top: PIE + 190, width: tam, height: tam, transform: "scaleY(-1)", opacity: 0.1, filter: "blur(3px)", maskImage: "linear-gradient(rgba(0,0,0,0) 55%, black)", WebkitMaskImage: "linear-gradient(rgba(0,0,0,0) 55%, black)" }} />
      {/* pedestal: cuerpo + tapa */}
      <div style={{ position: "absolute", left: 540 - 270, top: PIE, width: 540, height: 190, background: "linear-gradient(90deg, #0b0b0c, #26252a 30%, #333137 48%, #1d1c20 72%, #09090a)", borderBottomLeftRadius: "50% 36px", borderBottomRightRadius: "50% 36px" }} />
      <div style={{ position: "absolute", left: 540 - 270, top: PIE - 36, width: 540, height: 72, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 40%, #4a4850, #2a292e 60%, #18171b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }} />
      <div style={{ position: "absolute", left: 540 - tam * 0.32, top: PIE - 18, width: tam * 0.64, height: 36, borderRadius: "50%", background: "radial-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0) 70%)" }} />
      {/* el objeto */}
      <Img src={img} style={{ position: "absolute", left: 540 - tam / 2, top, width: tam, height: tam, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.6))" }} />
    </>
  );
};

const Texto: React.FC<{ linea: string; clave: string; bajada: string }> = ({ linea, clave, bajada }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 1450, textAlign: "center", textShadow: "0 2px 18px rgba(0,0,0,0.9)" }}>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 50, lineHeight: 1.15, color: "#ECEAE6", letterSpacing: "-0.01em" }}>{linea}</div>
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 96, lineHeight: 1.05, color: AMBAR, marginTop: 4 }}>{clave}</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: 1.35, color: "rgba(214,211,205,0.72)", marginTop: 22 }}>{bajada}</div>
  </div>
);

const VITRINAS = [
  { src: "ins/antena", base: 0.947, tam: 700, linea: "Practicá tus llamadas de agenda", clave: "con otro setter.", bajada: "Como si fuera real. Todas las semanas." },
  { src: "ins/sonar", base: 0.948, tam: 720, linea: "Te emparejamos", clave: "aunque no coincidan.", bajada: "Y te recordamos la práctica 24 h antes." },
  { src: "tro/setter_five_stars", base: 0.802, tam: 720, linea: "Tu compañero te dice", clave: "la verdad.", bajada: "¿Esa cita, de verdad, iba a ir?" },
  { src: "ins/satelite", base: 0.844, tam: 740, linea: "Subís tu llamada de Fathom", clave: "y te escuchás.", bajada: "Cada grabación te suma puntos." },
  { src: "tro/setter_rank_leyenda_radar", base: 0.948, tam: 800, linea: "Subí en la tabla.", clave: "Ganá trofeos.", bajada: "Rango, racha y trofeos de setter." },
];

export const SETVitrina: React.FC<{ n: number }> = ({ n }) => {
  const v = VITRINAS[n];
  return (
    <AbsoluteFill style={{ background: "#070708", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: PIE + 170, height: 800, background: "linear-gradient(#0d0d0f, #050506)" }} />
      <Pieza src={v.src} tam={v.tam} base={v.base} />
      <Escuadras />
      <Texto linea={v.linea} clave={v.clave} bajada={v.bajada} />
      <Acabado />
    </AbsoluteFill>
  );
};
