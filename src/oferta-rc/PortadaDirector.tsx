/**
 * Portada 2 del reel "Secreto de contratación #1" (27/09/2026): hablarle al director comercial de frente.
 * Rótulo "DIRECTOR COMERCIAL" que se lee en la grilla, la promesa enorme y, como héroe, su propia oferta
 * de trabajo sellada con la medalla five_stars (lo que el reel le enseña a publicar).
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { RC } from "../ring-closers/tema";
import { Destello, Acabado } from "../secreto-rc/efectos";
import { TarjetaOferta } from "./Video";

const SERIF = cargarSerif("italic").fontFamily;
const SANS = cargarManrope("normal", { weights: ["500", "700", "800"] }).fontFamily;

export const PortadaDirector: React.FC = () => (
  <AbsoluteFill style={{ background: "#070808" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 50% at 50% 62%, #1c1f1e 0%, #0d0f0e 55%, transparent 100%)" }} />
    <div style={{ position: "absolute", left: 90, top: 760, width: 900, height: 820, borderRadius: "50%",
      background: `radial-gradient(circle, ${RC.esmeralda600}38 0%, ${RC.esmeralda600}10 45%, transparent 70%)`, filter: "blur(30px)" }} />
    <Destello x={120} y={900} size={260} rot={12} blur={10} opacidad={0.55} />
    <Destello x={960} y={1480} size={200} rot={-8} blur={8} opacidad={0.5} />
    <Destello x={930} y={330} size={70} rot={0} blur={1} opacidad={0.8} />

    {/* rótulo: a quién le habla */}
    <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 30px", borderRadius: 999,
        border: `2px solid ${RC.esmeralda500}aa`, background: `${RC.esmeralda500}14`,
        fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 7, color: RC.esmeralda400 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: RC.esmeralda400, boxShadow: `0 0 16px ${RC.esmeralda400}` }} />
        DIRECTOR COMERCIAL
      </div>
    </div>

    <div style={{ position: "absolute", top: 410, width: "100%", textAlign: "center", textShadow: "0 6px 40px rgba(0,0,0,0.9)" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 92, lineHeight: 1, color: RC.platino300 }}>dejá de contratar</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 118, lineHeight: 1.02, letterSpacing: -4.5, color: "#f4f4f5", marginTop: 6 }}>
        closers que<br /><span style={{ color: RC.esmeralda400, textShadow: `0 0 50px ${RC.esmeralda500}66` }}>no cierran.</span>
      </div>
    </div>

    {/* héroe: la oferta del director, sellada */}
    <div style={{ position: "absolute", left: 180, top: 870, transform: "perspective(1600px) rotateX(10deg) rotateY(-9deg) rotate(-3deg) scale(0.92)", transformOrigin: "50% 0" }}>
      <TarjetaOferta encendida={0.7} barrido={0.55} />
    </div>
    <div style={{ position: "absolute", left: 250, top: 1500, width: 640, height: 60, borderRadius: "50%", background: "rgba(0,0,0,0.7)", filter: "blur(26px)" }} />
    <Img src={staticFile("ring-closers/trophies/five_stars.webp")} style={{ position: "absolute", left: 700, top: 760, width: 330, height: 330,
      objectFit: "contain", transform: "rotate(12deg)", filter: `drop-shadow(0 24px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 30px ${RC.esmeralda500}55)` }} />

    <div style={{ position: "absolute", top: 1612, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: "#8a8a92" }}>
      SECRETO DE CONTRATACIÓN N.º 1 · <span style={{ color: RC.esmeralda400 }}>@RING.CLOSERS</span>
    </div>
    <Acabado />
  </AbsoluteFill>
);
