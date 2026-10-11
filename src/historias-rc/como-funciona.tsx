import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { RC } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";

/**
 * Destacada "Cómo funciona" (27/09/2026). Lenguaje DISTINTO a "Qué es" (que usaba Oswald en mayúsculas,
 * bokeh de estrellas y objetos sueltos): acá es un manual de producto de estudio. Negro cálido con un
 * solo haz de luz oblicuo, riel de 6 pasos arriba, numeral serif en platino, titular en Instrument Serif
 * itálica y la pantalla REAL de la app reconstruida como pieza de vidrio con un objeto que la corona.
 * Los textos de UI salen de ring-closers (fight-card.tsx, onboarding, lib/scoring/weekly.ts).
 * Se exportan con `remotion still --frame=0`.
 */

export const SERIF = cargarSerif("italic").fontFamily;
export const SANS = cargarManrope("normal", { weights: ["400", "500", "600", "700", "800"] }).fontFamily;

export const PASOS = ["Tu nivel", "Tus horarios", "Tu cartelera", "El roleplay", "La tarjeta", "La semana"];

const hilo = "rgba(212,212,216,0.14)";

/** Fondo: negro cálido, un haz de luz oblicuo desde arriba a la izquierda y un piso que se apaga. */
export const Estudio: React.FC<{ children: React.ReactNode; haz?: number }> = ({ children, haz = -24 }) => (
  <AbsoluteFill style={{ background: "#08090a", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -300, top: -500, width: 900, height: 2800, transform: `rotate(${haz}deg)`, transformOrigin: "50% 0",
      background: "linear-gradient(90deg, transparent, rgba(244,244,245,0.055) 40%, rgba(244,244,245,0.085) 50%, rgba(244,244,245,0.055) 60%, transparent)", filter: "blur(40px)" }} />
    <div style={{ position: "absolute", left: 90, top: 1180, width: 900, height: 520, borderRadius: "50%",
      background: `radial-gradient(ellipse, ${RC.esmeralda600}22 0%, transparent 65%)`, filter: "blur(40px)" }} />
    {children}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
    <Acabado />
  </AbsoluteFill>
);

/** Riel de pasos: seis tramos finos; los hechos en platino, el actual en esmeralda. */
export const Riel: React.FC<{ paso: number }> = ({ paso }) => (
  <div style={{ position: "absolute", top: 262, left: 96, right: 96 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: RC.platino500 }}>
      <span>CÓMO FUNCIONA</span>
      <span><span style={{ color: RC.crema }}>{String(paso).padStart(2, "0")}</span> / 06</span>
    </div>
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
      {PASOS.map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
          background: i + 1 === paso ? RC.esmeralda400 : i + 1 < paso ? "rgba(212,212,216,0.55)" : hilo,
          boxShadow: i + 1 === paso ? `0 0 14px ${RC.esmeralda500}` : undefined }} />
      ))}
    </div>
  </div>
);

/** Numeral grande en serif con degradé de metal + titular y bajada. */
export const Encabezado: React.FC<{ paso: number; titulo: React.ReactNode; bajada: React.ReactNode; top?: number }> = ({ paso, titulo, bajada, top = 1290 }) => (
  <div style={{ position: "absolute", top, left: 96, right: 96 }}>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 150, lineHeight: 0.8,
        background: "linear-gradient(180deg, #ffffff 0%, #d4d4d8 40%, #6b6b73 100%)", WebkitBackgroundClip: "text", color: "transparent" }}>
        {paso}
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 84, lineHeight: 0.95, color: RC.crema, paddingBottom: 4 }}>{titulo}</div>
    </div>
    <div style={{ height: 1, background: `linear-gradient(90deg, ${RC.esmeralda400}, ${hilo} 30%, transparent)`, margin: "30px 0 26px" }} />
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, lineHeight: 1.36, color: RC.platino500 }}>{bajada}</div>
  </div>
);

export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: RC.crema, fontWeight: 700 }}>{children}</span>;

/** Pieza de vidrio: la pantalla de la app como objeto físico, con canto de luz y sombra de contacto. */
export const Vidrio: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; rot?: number; opacidad?: number; desenfoque?: number }> =
  ({ x, y, w, h, children, rot = 0, opacidad = 1, desenfoque = 0 }) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, opacity: opacidad, filter: desenfoque ? `blur(${desenfoque}px)` : undefined }}>
      <div style={{ position: "absolute", left: 40, right: 40, bottom: -46, height: 60, borderRadius: "50%", background: "rgba(0,0,0,0.9)", filter: "blur(26px)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 34, overflow: "hidden",
        background: "linear-gradient(160deg, rgba(38,40,42,0.96) 0%, rgba(20,21,23,0.97) 55%, rgba(14,15,16,0.98) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, transparent 28%)" }} />
        {children}
      </div>
    </div>
  );

const etiquetaUI: React.CSSProperties = { fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 4, color: RC.platino500 };

const Guante: React.FC<{ src: string; x: number; y: number; w: number; espejo?: boolean; rot?: number }> = ({ src, x, y, w, espejo, rot = 0 }) => (
  <>
    <div style={{ position: "absolute", left: x + w * 0.12, top: y + w * 0.9, width: w * 0.76, height: w * 0.12, borderRadius: "50%", background: "rgba(0,0,0,0.85)", filter: "blur(16px)" }} />
    <Img src={staticFile(src)} style={{ position: "absolute", left: x, top: y, width: w, height: w, objectFit: "contain",
      transform: `${espejo ? "scaleX(-1) " : ""}rotate(${rot}deg)`, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.7))" }} />
  </>
);

// ── Paso 3 · Tu cartelera ─────────────────────────────────────────────────

/** Una fila de la cartelera, en segundo plano (desenfocada) detrás de la tarjeta principal. */
const FilaAtras: React.FC<{ y: number; tier: string; dia: string; estado: string; desenfoque: number; opacidad: number; escala: number }> = ({ y, tier, dia, estado, desenfoque, opacidad, escala }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, transform: `scale(${escala})`, transformOrigin: "50% 0" }}>
    <Vidrio x={150} y={0} w={780} h={150} opacidad={opacidad} desenfoque={desenfoque}>
      <div style={{ position: "absolute", left: 44, top: 40, ...etiquetaUI }}>{tier}</div>
      <div style={{ position: "absolute", left: 44, top: 76, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: RC.crema }}>{dia}</div>
      <div style={{ position: "absolute", right: 44, top: 56, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: RC.platino300 }}>{estado}</div>
    </Vidrio>
  </div>
);

export const CF3Cartelera: React.FC = () => (
  <Estudio>
    <Riel paso={3} />
    <FilaAtras y={370} tier="ENSEÑÁS" dia="Martes 19:00" estado="Confirmada" desenfoque={5} opacidad={0.4} escala={0.9} />
    <FilaAtras y={470} tier="RIVALIDAD" dia="Jueves 20:30" estado="Confirmada" desenfoque={2.5} opacidad={0.65} escala={0.95} />
    {/* tarjeta principal: la pelea que no coincide */}
    <Vidrio x={96} y={600} w={888} h={610}>
      <div style={{ position: "absolute", left: 48, top: 46, right: 48, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={etiquetaUI}>MASTERCLASS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: RC.esmeralda400 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: RC.esmeralda400, boxShadow: `0 0 12px ${RC.esmeralda400}` }} />
          Por acordar
        </div>
      </div>
      <div style={{ position: "absolute", left: 48, right: 48, top: 104, height: 1, background: hilo }} />
      <div style={{ position: "absolute", left: 48, top: 360, fontFamily: SANS, fontWeight: 500, fontSize: 26, color: RC.platino500 }}>Les sugerimos</div>
      <div style={{ position: "absolute", left: 48, top: 396, fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: RC.crema }}>Sábado, 11:00</div>
      <div style={{ position: "absolute", left: 48, right: 48, top: 494, display: "flex", gap: 18 }}>
        <div style={{ flex: 1.15, height: 76, borderRadius: 38, background: `linear-gradient(180deg, ${RC.esmeralda400}, ${RC.esmeralda600})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 26, color: "#04130d",
          boxShadow: `0 10px 30px ${RC.esmeralda600}66, inset 0 1px 0 rgba(255,255,255,0.4)` }}>Proponer este horario</div>
        <div style={{ flex: 1, height: 76, borderRadius: 38, border: "1.5px solid rgba(212,212,216,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 26, color: RC.platino300 }}>Proponer otro</div>
      </div>
    </Vidrio>
    {/* los dos guantes, frente a frente, coronando la tarjeta */}
    <Guante src="ring-closers/boxers/counter.webp" x={160} y={702} w={240} rot={-8} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 70, color: RC.platino500 }}>vs</div>
    <Guante src="ring-closers/boxers/southpaw.webp" x={680} y={702} w={240} espejo rot={-8} />
    <Encabezado paso={3} titulo={<>Tu cartelera</>}
      bajada={<>Llegan <B>tres peleas por semana</B>: una enseñás, una es pareja y en otra aprendés. Si los horarios no coinciden, <B>proponés otro</B>.</>} />
  </Estudio>
);
