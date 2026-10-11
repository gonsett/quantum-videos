import { Img, staticFile } from "remotion";
import { Noche } from "../ring-closers/piezas";
import { Acabado, Destello as Bokeh } from "../secreto-rc/efectos";
import { DISPLAY, Firma, RC, SANS } from "./dopamina";

/**
 * Portada del reel "Ring Closers para closers de élite" (imagen fija 1080x1920).
 *
 * Instagram muestra la portada en la grilla del perfil recortada a 3:4 (y 240-1680), así que todo
 * lo importante vive entre y=280 y y=1500. Jerarquía: el gancho (lo único que se lee desde lejos),
 * el guante de plata con estrella (el objeto del video), la promesa y los tres verbos del video.
 * Se exporta con `remotion still ... --frame=60` (las estrellas de las esquinas y la firma entran con fundido).
 */

// El guante es una imagen de 1024 px con el guante visible entre (180,26) y (854,1000); la estrella está en (371,419).
const ANCHO = 620;
const TOPE = 728; // borde visible superior del guante: deja >= 40 px bajo el gancho
const esc = ANCHO / 1024;
const imgLeft = 540 - ANCHO / 2;
const imgTop = TOPE - 26 * esc;
const estrella = { x: imgLeft + 371 * esc, y: imgTop + 419 * esc };
const pie = imgTop + 1000 * esc;

/** Destello de cuatro puntas sobre la estrella: el único acento brillante de la pieza. */
const Destello: React.FC<{ x: number; y: number; tam: number }> = ({ x, y, tam }) => (
  <div style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2, width: tam, height: tam }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(225,236,255,0.5) 0%, rgba(225,236,255,0) 42%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: tam / 2 - 1, height: 2, background: "linear-gradient(90deg, transparent, rgba(240,246,255,0.95), transparent)" }} />
    <div style={{ position: "absolute", top: 0, bottom: 0, left: tam / 2 - 1, width: 2, background: "linear-gradient(180deg, transparent, rgba(240,246,255,0.95), transparent)" }} />
  </div>
);

const linea = (top: number, tam: number, color: string, texto: string, brillo = false) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      textAlign: "center",
      whiteSpace: "nowrap",
      fontFamily: DISPLAY,
      fontWeight: 700,
      fontSize: tam,
      lineHeight: 1.16,
      textTransform: "uppercase",
      color,
      textShadow: brillo ? "0 0 46px rgba(52,211,153,0.42), 0 0 14px rgba(52,211,153,0.28)" : "0 4px 24px rgba(0,0,0,0.5)",
    }}
  >
    {texto}
  </div>
);

export const PortadaElite: React.FC = () => (
  <Noche foco={0.9}>
    <Bokeh x={930} y={110} size={720} rot={18} blur={24} fase={0.4} opacidad={0.8} />
    <Bokeh x={90} y={1790} size={600} rot={-14} blur={28} fase={2.1} opacidad={0.66} />
    <Bokeh x={175} y={1010} size={110} rot={8} blur={2.5} fase={1.2} opacidad={0.5} />

    {/* gancho */}
    {linea(290, 140, RC.crema, "¿Sos closer")}
    {linea(453, 196, RC.esmeralda400, "de élite?", true)}

    {/* el ring bajo el guante: una elipse fina, sin relleno pesado */}
    <div
      style={{
        position: "absolute",
        left: 540 - 300,
        top: pie - 38,
        width: 600,
        height: 76,
        borderRadius: "50%",
        border: "1.5px solid rgba(52,211,153,0.42)",
        background: "radial-gradient(ellipse at center, rgba(16,185,129,0.22), rgba(16,185,129,0) 70%)",
        boxShadow: "0 0 44px rgba(16,185,129,0.16)",
      }}
    />
    <Img
      src={staticFile("historias/counter-2x.png")}
      style={{
        position: "absolute",
        left: imgLeft,
        top: imgTop,
        width: ANCHO,
        height: ANCHO,
        maxWidth: "none",
        filter: "drop-shadow(0 34px 46px rgba(0,0,0,0.65))",
      }}
    />
    <Destello x={estrella.x} y={estrella.y} tam={150} />

    {/* promesa */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1376,
        textAlign: "center",
        whiteSpace: "nowrap",
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 46,
        lineHeight: 1.3,
        color: RC.platino300,
      }}
    >
      Con más razón, usá <span style={{ color: RC.esmeralda400 }}>Ring Closers</span>
    </div>

    {/* los tres verbos del video */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1462,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 34,
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 30,
        lineHeight: 1.2,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: RC.platino500,
      }}
    >
      <span>Afilás</span>
      <span style={{ width: 1, height: 26, backgroundColor: RC.tinta700 }} />
      <span>Te conocen</span>
      <span style={{ width: 1, height: 26, backgroundColor: RC.tinta700 }} />
      <span>Te buscan</span>
    </div>
    <Firma />
    <Acabado />
  </Noche>
);
