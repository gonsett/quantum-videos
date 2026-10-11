/** Muestra del plano "la máquina de debajo": hoja de cuaderno + stickers que caen (frame ~70). */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Acabado, ANTON, Entra, Plano, Resaltador, SERIF, Sticker, TINTA } from "./kit";

const trazo = { fill: "none", stroke: TINTA, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const IconoPeleas = () => (
  <svg width="150" height="120" viewBox="0 0 150 120">
    <rect x="10" y="18" width="130" height="94" rx="12" {...trazo} />
    <line x1="10" y1="42" x2="140" y2="42" {...trazo} />
    <line x1="45" y1="8" x2="45" y2="26" {...trazo} />
    <line x1="105" y1="8" x2="105" y2="26" {...trazo} />
    {[32, 75, 118].map((x) => (
      <path key={x} d={`M${x - 14} ${76} l10 11 l19 -24`} {...trazo} strokeWidth={8} />
    ))}
  </svg>
);

const estrella = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  }).join(" ");

const IconoCalif = () => (
  <svg width="200" height="60" viewBox="0 0 200 60">
    {[0, 1, 2, 3, 4].map((i) => (
      <polygon key={i} points={estrella(22 + i * 39, 30, 19)} {...trazo} strokeWidth={5} fill={i < 4 ? TINTA : "none"} />
    ))}
  </svg>
);

const IconoRango = () => (
  <svg width="120" height="120" viewBox="0 0 120 120">
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M18 ${46 + i * 26} L60 ${22 + i * 26} L102 ${46 + i * 26}`} {...trazo} strokeWidth={11} />
    ))}
  </svg>
);

const Rotulo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: ANTON, fontSize: 40, color: TINTA, letterSpacing: 1, marginTop: 10, lineHeight: 1 }}>{children}</div>
);

export const MuestraRayos: React.FC = () => (
  <AbsoluteFill style={{ background: "#2a1d14" }}>
    <Plano src="img/hoja-0.jpg" dur={90} desde={1.04} hasta={1.13} ox={48} oy={55}>
      <div style={{ position: "absolute", left: 250, top: 560, width: 620, mixBlendMode: "multiply" }}>
        <Entra desde={2}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 58, color: TINTA, lineHeight: 1 }}>debajo, la máquina es</div>
        </Entra>
        <Entra desde={8}>
          <div style={{ fontFamily: ANTON, fontSize: 104, color: TINTA, lineHeight: 1.05, marginTop: 6 }}>
            <Resaltador desde={12}>REPETICIONES</Resaltador>
          </div>
        </Entra>
      </div>
      <Sticker desde={22} x={420} y={930} rot={-6}>
        <IconoPeleas />
        <Rotulo>3 PELEAS</Rotulo>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: TINTA }}>por semana</div>
      </Sticker>
      <Sticker desde={34} x={690} y={1110} rot={5} ancho={290}>
        <div style={{ padding: "26px 0 8px", display: "flex", justifyContent: "center" }}><IconoCalif /></div>
        <Rotulo>CALIFICACIÓN</Rotulo>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: TINTA }}>de tus rivales</div>
      </Sticker>
      <Sticker desde={46} x={440} y={1330} rot={-3}>
        <IconoRango />
        <Rotulo>RANGO</Rotulo>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: TINTA }}>a la vista</div>
      </Sticker>
    </Plano>
    <Acabado />
  </AbsoluteFill>
);
