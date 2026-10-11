/**
 * Portada del reel "Secreto de contratación #1" (27/09/2026). Imagen fija 1080x1920.
 * En la grilla de Instagram se ve recortada a 3:4 (y ≈ 240-1680) y chica: el gancho tiene que leerse de lejos
 * y decir de qué trata (contratar closers). Fondo: la lluvia de guantes congelada después del golpe del 100.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { RC } from "../ring-closers/tema";
import { GanchoOferta } from "./Gancho";

const SERIF = cargarSerif("italic").fontFamily;
const SANS = cargarManrope("normal", { weights: ["500", "700", "800"] }).fontFamily;

export const PortadaOferta: React.FC = () => (
  <AbsoluteFill style={{ background: "#070808" }}>
    <GanchoOferta golpe={30} remate={9999} apagon={9999} bajada={false} />
    {/* velo para que el texto lea sobre la lluvia */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 30%, rgba(7,8,8,0.55) 52%, transparent 70%)" }} />
    <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", textShadow: "0 6px 40px rgba(0,0,0,0.95)" }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 112, lineHeight: 1, letterSpacing: -4, color: "#f4f4f5" }}>Ninguno sabe</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 150, lineHeight: 1.02, letterSpacing: -5, color: RC.esmeralda400,
        textShadow: `0 0 50px ${RC.esmeralda500}66, 0 6px 40px rgba(0,0,0,0.95)` }}>cerrar.</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: "#e4e4e7", marginTop: 14 }}>
        cómo contratar closers que sí cierran
      </div>
    </div>
    <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: "#9a9aa2" }}>
      SECRETO DE CONTRATACIÓN N.º 1 · <span style={{ color: RC.esmeralda400 }}>@RING.CLOSERS</span>
    </div>
  </AbsoluteFill>
);
