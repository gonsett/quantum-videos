import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { RC, DISPLAY } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";
import { SANS, SERIF } from "../historias-rc/como-funciona";

/**
 * "Un año en treinta segundos" (Logros, 27/09/2026): fotograma de muestra del momento de la racha.
 * Lenguaje nuevo: sala de museo a oscuras, un cono de luz cenital sobre el trofeo, contador de días
 * como reloj del video y una vitrina de 14 huecos abajo que se va llenando.
 */

export const TROFEOS = [
  "first_roleplay", "five_stars", "first_week_complete", "ten_roleplays", "streak_3",
  "tenure_1m", "first_purchase", "cash_10k", "tenure_3m", "cash_50k",
  "tenure_6m", "streak_10", "cash_100k", "tenure_1y",
] as const;

const trofeo = (id: string) => staticFile(`logros-rc/${id}.webp`);

/** Cono de luz cenital, motivado: el trofeo es lo único iluminado de la sala. */
const Cono: React.FC<{ cx: number; top: number; alto: number; ancho: number }> = ({ cx, top, alto, ancho }) => (
  <>
    <div style={{ position: "absolute", left: cx - ancho / 2, top, width: ancho, height: alto, filter: "blur(28px)",
      clipPath: `polygon(${50 - 9}% 0%, ${50 + 9}% 0%, 100% 100%, 0% 100%)`,
      background: "linear-gradient(180deg, rgba(250,250,250,0) 0%, rgba(250,250,250,0.15) 22%, rgba(250,250,250,0.06) 60%, rgba(250,250,250,0) 100%)" }} />
    {/* charco de luz en el piso */}
    <div style={{ position: "absolute", left: cx - ancho / 2, top: top + alto - 90, width: ancho, height: 180, borderRadius: "50%",
      background: "radial-gradient(ellipse, rgba(250,250,250,0.10) 0%, transparent 70%)", filter: "blur(10px)" }} />
  </>
);

/** Vitrina: riel de 14 huecos; `llenos` trofeos ya ganados y el actual encendido. */
export const Vitrina: React.FC<{ llenos: number; top: number }> = ({ llenos, top }) => {
  const d = 58, paso = 64, ancho = paso * 13 + d, x0 = (1080 - ancho) / 2;
  return (
    <div style={{ position: "absolute", left: x0, top, width: ancho, height: d }}>
      <div style={{ position: "absolute", left: d / 2, right: d / 2, top: d / 2, height: 1.5, background: "rgba(212,212,216,0.14)" }} />
      <div style={{ position: "absolute", left: d / 2, width: paso * (llenos - 1), top: d / 2, height: 1.5, background: RC.esmeralda500 }} />
      {TROFEOS.map((id, i) => {
        const ganado = i < llenos, actual = i === llenos - 1;
        return (
          <div key={id} style={{ position: "absolute", left: i * paso, top: 0, width: d, height: d, borderRadius: "50%",
            background: ganado ? "#0d0d0f" : "#09090a",
            border: `1.5px solid ${actual ? RC.esmeralda400 : ganado ? "rgba(212,212,216,0.25)" : "rgba(212,212,216,0.10)"}`,
            boxShadow: actual ? `0 0 24px ${RC.esmeralda500}88` : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {ganado ? <Img src={trofeo(id)} style={{ width: d - 8, height: d - 8, objectFit: "contain" }} /> : null}
          </div>
        );
      })}
    </div>
  );
};

/** Contador de días: reloj del video. */
export const Contador: React.FC<{ dia: number }> = ({ dia }) => (
  <div style={{ position: "absolute", top: 270, left: 96, right: 96, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: RC.platino500 }}>DÍA</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 200, lineHeight: 0.85, color: RC.crema, marginTop: 10, letterSpacing: -4 }}>{dia}</div>
    </div>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "#52525b", paddingBottom: 18 }}>de 365</div>
  </div>
);

export const MuestraLogros: React.FC = () => (
  <AbsoluteFill style={{ background: "#060607", overflow: "hidden" }}>
    <Contador dia={21} />
    <Cono cx={540} top={470} alto={900} ancho={980} />
    {/* respiración esmeralda detrás del trofeo, apenas */}
    <div style={{ position: "absolute", left: 240, top: 680, width: 600, height: 600, borderRadius: "50%", filter: "blur(70px)",
      background: `radial-gradient(circle, ${RC.esmeralda600}40 0%, transparent 70%)` }} />
    <div style={{ position: "absolute", left: 540 - 250, top: 1278, width: 500, height: 60, borderRadius: "50%", background: "rgba(0,0,0,0.9)", filter: "blur(22px)" }} />
    <Img src={trofeo("streak_3")} style={{ position: "absolute", left: 540 - 340, top: 620, width: 680, height: 680, objectFit: "contain",
      filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.75))" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1350, textAlign: "center" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 30, letterSpacing: 8, color: RC.esmeralda400 }}>RACHA DE 3</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 58, lineHeight: 1.05, color: RC.crema, marginTop: 18 }}>Ya no es suerte: es costumbre.</div>
    </div>
    <Vitrina llenos={5} top={1500} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
    <Acabado />
  </AbsoluteFill>
);
