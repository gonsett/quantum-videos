import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { RC, DISPLAY } from "../ring-closers/tema";
import { SANS, SERIF } from "./como-funciona";
import { Estudio2, INK, B } from "./ofertas";

/**
 * Destacada de Ring Setters, láminas 02-06 (04/10/2026). Misma arquitectura que "Ofertas" (aprobada): negro de
 * estudio, titular serif itálica arriba a la izquierda, UI REAL de la app (components/game/setter-fight-card.tsx)
 * plana a 2,4x, un protagonista por lámina. Suma la parte humana: la setter de las fotos de Gemini (4 y 2)
 * fundida en el negro detrás de la UI. Acento ámbar (#F59E0B, el de las láminas 01 y 07). Las vitrinas con un
 * logo parado fueron RECHAZADAS. Se exportan con `remotion still --frame=0`.
 */

export const AMBAR = "#F59E0B";
export const AMBAR_CLARO = "#FBBF24";

export const Contraluz: React.FC<{ x: number; y: number; w: number; h: number; o?: number }> = ({ x, y, w, h, o = 0x55 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: "50%", filter: "blur(60px)",
    background: `radial-gradient(ellipse, ${AMBAR}${o.toString(16)} 0%, ${AMBAR}14 45%, transparent 70%)` }} />
);

/** Cabecera editorial como la de Ofertas, con el filete ámbar y "RING SETTERS". */
export const Cabecera: React.FC<{ titulo: React.ReactNode; bajada?: React.ReactNode }> = ({ titulo, bajada }) => (
  <div style={{ position: "absolute", top: 270, left: 96, right: 96 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: RC.platino500 }}>
      <div style={{ width: 60, height: 1.5, background: AMBAR }} />
      <span>RING SETTERS</span>
    </div>
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 96, lineHeight: 0.98, color: RC.crema, marginTop: 30, letterSpacing: -1,
      textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>{titulo}</div>
    {bajada ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, lineHeight: 1.4, color: RC.platino500, marginTop: 26, maxWidth: 860,
      textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}>{bajada}</div> : null}
  </div>
);

/** La setter, fundida en el negro: arriba y abajo se pierde, a los costados una viñeta. */
export const Persona: React.FC<{ n: number; top: number; left?: number; ancho?: number; desde?: number; hasta?: number; brillo?: number }> = ({
  n, top, left = 0, ancho = 1080, desde = 12, hasta = 70, brillo = 0.82 }) => (
  <div style={{ position: "absolute", left, top, width: ancho, height: (ancho * 16) / 9,
    WebkitMaskImage: `linear-gradient(180deg, transparent 0%, #000 ${desde}%, #000 ${hasta - 18}%, transparent ${hasta}%)`,
    maskImage: `linear-gradient(180deg, transparent 0%, #000 ${desde}%, #000 ${hasta - 18}%, transparent ${hasta}%)` }}>
    <Img src={staticFile(`historias-setters-gem/${n}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover",
      filter: `brightness(${brillo}) contrast(1.06) saturate(0.85)` }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 55% 45%, transparent 40%, rgba(7,7,8,0.85) 100%)" }} />
  </div>
);

// ── UI calcada de setter-fight-card.tsx (Card + Badge + Button de la app), 2,4x ──

export const Badge: React.FC<{ children: React.ReactNode; tono?: "neutro" | "warning" | "success" }> = ({ children, tono = "neutro" }) => {
  const c = tono === "warning" ? { bg: "rgba(245,158,11,0.15)", fg: AMBAR_CLARO } : tono === "success" ? { bg: "rgba(16,185,129,0.15)", fg: RC.esmeralda400 }
    : { bg: INK[700], fg: RC.platino300 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 50, padding: "0 22px", borderRadius: 999, whiteSpace: "nowrap",
      background: c.bg, color: c.fg, fontFamily: SANS, fontWeight: 700, fontSize: 24 }}>{children}</span>
  );
};

export const Boton: React.FC<{ children: React.ReactNode; primario?: boolean }> = ({ children, primario }) => (
  <span style={{ display: "inline-flex", alignItems: "center", height: 84, padding: "0 36px", borderRadius: 18, whiteSpace: "nowrap",
    border: primario ? "none" : `1.5px solid ${INK[700]}`, background: primario ? AMBAR : "transparent",
    boxShadow: primario ? `0 10px 40px ${AMBAR}55, inset 0 1.5px 0 rgba(255,255,255,0.3)` : undefined,
    color: primario ? "#1c1103" : RC.crema, fontFamily: SANS, fontWeight: 700, fontSize: 29 }}>{children}</span>
);

export const SOMBRA_CARD = "inset 0 1.5px 0 rgba(255,255,255,0.06), 0 50px 110px rgba(0,0,0,0.8), 0 12px 30px rgba(0,0,0,0.5)";

/** Tarjeta de roleplay de setter: cinta ROLEPLAY con estado y cruce, Vos VS rival, fecha, acciones. */
export const RoleplayCard: React.FC<{
  top: number; left?: number; w?: number; rot?: number; opacidad?: number; solo_cinta?: boolean;
  estado?: string; cruce: string; tonoCruce?: "warning" | "success"; rival: string; fecha?: string; children?: React.ReactNode; destacada?: boolean;
}> = ({ top, left = 72, w = 936, rot = 0, opacidad = 1, solo_cinta, estado = "Confirmada", cruce, tonoCruce = "success", rival, fecha, children, destacada }) => (
  <div style={{ position: "absolute", left, top, width: w, transform: `rotate(${rot}deg)`, transformOrigin: "50% 100%", opacity: opacidad,
    borderRadius: 30, overflow: "hidden", background: `linear-gradient(180deg, #19191c 0%, ${INK[900]} 100%)`, border: `1.5px solid ${destacada ? AMBAR : INK[700]}`,
    boxShadow: destacada ? `${SOMBRA_CARD}, 0 0 70px ${AMBAR}33` : SOMBRA_CARD }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: INK[800], padding: "22px 38px" }}>
      <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: 7, textTransform: "uppercase", color: RC.platino500 }}>Roleplay</span>
      <div style={{ display: "flex", gap: 14 }}><Badge>{estado}</Badge><Badge tono={tonoCruce}>{cruce}</Badge></div>
    </div>
    {solo_cinta ? <div style={{ height: 420 }} /> : (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "50px 48px" }}>
          <Badge>Vos</Badge>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1, color: AMBAR, textShadow: `0 0 34px ${AMBAR}66` }}>VS</span>
          <Badge>{rival}</Badge>
        </div>
        {fecha ? <div style={{ borderTop: `1.5px solid ${INK[700]}`, padding: "28px 48px", fontFamily: SANS, fontWeight: 500, fontSize: 30, color: RC.platino500 }}>{fecha}</div> : null}
        {children ? <div style={{ borderTop: `1.5px solid ${INK[700]}`, padding: "34px 40px" }}>{children}</div> : null}
      </>
    )}
  </div>
);

// ── 02 · Qué es: tu ring de práctica ─────────────────────────────────────────

export const SETOF2Practica: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Tu ring<br />de práctica.</>}
      bajada={<>Cada semana, roleplays con otros setters: <B>uno para enseñar, uno parejo y uno para aprender.</B></>} />
    <Contraluz x={60} y={960} w={960} h={460} />
    {/* las tres peleas de la semana, en columna y alineadas: la del medio (Rivalidad) es la protagonista */}
    <RoleplayCard top={700} opacidad={0.6} estado="Propuesta" cruce="Enseñás" rival="Martín P." />
    <RoleplayCard top={1000} cruce="Rivalidad" tonoCruce="warning" rival="Tomás R." fecha="jueves 8 oct., 19:00" destacada />
    <RoleplayCard top={1395} opacidad={0.6} estado="Propuesta" cruce="Masterclass" rival="Valentina G." />
  </Estudio2>
);
