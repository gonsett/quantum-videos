import React from "react";
import { AbsoluteFill } from "remotion";
import { MONO } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";
import { SANS, SERIF } from "./como-funciona";
import { AMBAR, CREMA, ambar, az, Marca } from "../setters-rc/senal";
import { Objeto, LogoRadar, Carnet } from "../setters-rc/video";

/**
 * Destacada "Ring Setters" (04/10/2026): 8 historias 1080x1920 que anuncian el apartado de setters.
 * Lenguaje NUEVO: CONSOLA DE MANDO. Cada lámina es un instrumento de un tablero de operaciones (panel de metal
 * cepillado con tornillos + pantalla de fósforo ámbar con líneas de barrido); el héroe es un objeto real de la app.
 * Texto chico abajo. Datos inventados (decirlo al entregar): 38 % / 72 %, @lucia.agenda, 32:14, 0042.
 */

const SW = 940; // pantalla
const SX = 70;
const SY = 300;
const SC = SW / 2;

const Tornillo: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
  <div style={{ position: "absolute", left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #6b665e, #2a2724 60%, #121110)", boxShadow: "0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.8)" }}>
    <div style={{ position: "absolute", left: 3, right: 3, top: 10, height: 2, background: "#0b0a09", transform: `rotate(${r}deg)`, boxShadow: "0 1px 0 rgba(255,255,255,0.08)" }} />
  </div>
);

const Led: React.FC<{ on?: boolean }> = ({ on }) => (
  <div style={{ width: 10, height: 10, borderRadius: "50%", background: on ? "#ffc35a" : "#2a2116", boxShadow: on ? `0 0 10px ${ambar(0.9)}, 0 0 22px ${ambar(0.5)}` : "inset 0 1px 2px rgba(0,0,0,0.8)" }} />
);

/** La consola: panel, placa de rótulo, pantalla con fósforo y vidrio, texto abajo. */
const Consola: React.FC<{ n: number; rotulo: string; titulo: React.ReactNode; bajada?: React.ReactNode; children: React.ReactNode }> = ({ n, rotulo, titulo, bajada, children }) => (
  <AbsoluteFill style={{ background: "#0a0907" }}>
    {/* metal cepillado */}
    <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 3px), radial-gradient(ellipse at 50% 0%, #2a2620 0%, #14120f 45%, #070605 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.035) 45%, transparent 60%)" }} />
    {/* placa superior */}
    <div style={{ position: "absolute", left: SX, right: SX, top: 180, height: 76, borderRadius: 10, background: "linear-gradient(180deg, #1d1a16, #121009)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 6px rgba(0,0,0,0.6), 0 2px 0 rgba(0,0,0,0.6)", display: "flex", alignItems: "center", padding: "0 34px", boxSizing: "border-box", gap: 18 }}>
      <LogoRadar s={34} color="#ffc35a" ancho={1.4} />
      <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 6, color: "rgba(255,230,190,0.7)" }}>RING SETTERS</div>
      <div style={{ flex: 1 }} />
      <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 6, color: ambar(0.85) }}>{rotulo}</div>
      <div style={{ display: "flex", gap: 8, marginLeft: 10 }}>
        {Array.from({ length: 8 }, (_, i) => <Led key={i} on={i === n} />)}
      </div>
    </div>
    {/* bisel */}
    <div style={{ position: "absolute", left: SX - 26, top: SY - 26, width: SW + 52, height: SW + 52, borderRadius: 54, background: "linear-gradient(160deg, #2b2722 0%, #15130f 50%, #0c0b09 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 60px rgba(0,0,0,0.7)" }} />
    {[[SX - 4, SY - 4], [SX + SW + 4, SY - 4], [SX - 4, SY + SW + 4], [SX + SW + 4, SY + SW + 4]].map(([x, y], i) => <Tornillo key={i} x={x} y={y} r={i * 37 + 20} />)}
    {/* pantalla */}
    <div style={{ position: "absolute", left: SX, top: SY, width: SW, height: SW, borderRadius: 40, overflow: "hidden", background: "radial-gradient(ellipse at 50% 46%, #22150500 0%, #1a1004 0%, #0b0702 58%, #030201 100%)", boxShadow: "inset 0 0 0 2px #050403, inset 0 0 60px rgba(0,0,0,0.9)" }}>
      {children}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 4px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 28%, transparent 29%)" }} />
    </div>
    {/* texto */}
    <div style={{ position: "absolute", left: 90, right: 90, top: SY + SW + 70, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 60, lineHeight: 1.12, color: CREMA, letterSpacing: -0.5 }}>{titulo}</div>
      {bajada && <div style={{ marginTop: 22, fontFamily: SANS, fontWeight: 500, fontSize: 32, lineHeight: 1.35, color: "rgba(244,239,231,0.62)" }}>{bajada}</div>}
    </div>
    {/* pie: tira de indicadores */}
    <div style={{ position: "absolute", left: SX, right: SX, top: 1690, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, rgba(255,230,190,0.18))" }} />
      <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 6, color: "rgba(255,230,190,0.35)" }}>EL RADAR NUNCA DUERME</div>
      <div style={{ height: 1, flex: 1, background: "linear-gradient(270deg, transparent, rgba(255,230,190,0.18))" }} />
    </div>
    <Acabado />
  </AbsoluteFill>
);

/** Fondo de la pantalla: retícula de radar tenue. */
const Reticula: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <svg width={SW} height={SW} style={{ position: "absolute", inset: 0 }}>
    {[110, 220, 330, 440, 550].map((r) => <circle key={r} cx={SC} cy={SC} r={r} fill="none" stroke={ambar(0.09 * k)} strokeWidth={1} />)}
    <line x1={SC} y1={0} x2={SC} y2={SW} stroke={ambar(0.06 * k)} />
    <line x1={0} y1={SC} x2={SW} y2={SC} stroke={ambar(0.06 * k)} />
  </svg>
);

const Rotulo: React.FC<{ x: number; y: number; children: React.ReactNode; align?: "left" | "center" | "right"; size?: number; color?: string }> = ({ x, y, children, align = "center", size = 19, color = ambar(0.85) }) => (
  <div style={{ position: "absolute", left: align === "center" ? x - 400 : align === "right" ? x - 800 : x, width: 800, top: y, textAlign: align, fontFamily: MONO, fontSize: size, letterSpacing: 5, color }}>{children}</div>
);

const glow = (a = 1) => `drop-shadow(0 0 6px ${ambar(0.8 * a)}) drop-shadow(0 0 18px ${ambar(0.45 * a)})`;

/* ───────────── 1. Portada ───────────── */
export const SETPortada: React.FC = () => {
  const blip = { x: SC + 240 * Math.sin((30 * Math.PI) / 180), y: SC - 240 * Math.cos((30 * Math.PI) / 180) };
  return (
    <Consola n={0} rotulo="NUEVO" titulo={<>Llegaron los <span style={{ color: "#ffc860" }}>setters</span>.</>} bajada="Ring Setters ya está abierto dentro de Ring Closers.">
      <svg width={SW} height={SW} style={{ position: "absolute", inset: 0, filter: glow(0.6) }}>
        {[90, 180, 270, 360, 440].map((r) => <circle key={r} cx={SC} cy={SC} r={r} fill="none" stroke={ambar(r === 440 ? 0.55 : 0.28)} strokeWidth={r === 440 ? 2 : 1.2} />)}
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i * 5 * Math.PI) / 180;
          const l = i % 6 === 0 ? 22 : 10;
          return <line key={i} x1={SC + Math.sin(a) * 440} y1={SC - Math.cos(a) * 440} x2={SC + Math.sin(a) * (440 - l)} y2={SC - Math.cos(a) * (440 - l)} stroke={ambar(0.6)} strokeWidth={1.4} />;
        })}
        <line x1={SC - 440} y1={SC} x2={SC + 440} y2={SC} stroke={ambar(0.16)} />
        <line x1={SC} y1={SC - 440} x2={SC} y2={SC + 440} stroke={ambar(0.16)} />
      </svg>
      <div style={{ position: "absolute", left: SC - 440, top: SC - 440, width: 880, height: 880, borderRadius: "50%", background: `conic-gradient(from 0deg, transparent 0deg, ${ambar(0.04)} 330deg, ${ambar(0.32)} 398deg, transparent 400deg)`, mixBlendMode: "screen" }} />
      <svg width={SW} height={SW} style={{ position: "absolute", inset: 0 }}>
        <line x1={SC} y1={SC} x2={blip.x + (blip.x - SC) * 0.76} y2={blip.y + (blip.y - SC) * 0.76} stroke="#ffd88a" strokeWidth={2.5} style={{ filter: glow() }} />
        {Array.from({ length: 13 }, (_, i) => {
          const a = az(i + 3) * Math.PI * 2;
          const r = 120 + az(i + 11) * 300;
          return <circle key={i} cx={SC + Math.sin(a) * r} cy={SC - Math.cos(a) * r} r={4} fill="#e9e6df" opacity={0.28} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: blip.x - 70, top: blip.y - 70, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${ambar(0.9)} 0%, ${ambar(0.35)} 22%, transparent 62%)` }} />
      <div style={{ position: "absolute", left: blip.x - 9, top: blip.y - 9, width: 18, height: 18, borderRadius: "50%", background: "#fff3d6", boxShadow: `0 0 16px #ffc35a, 0 0 40px ${AMBAR}` }} />
      {[1, 2].map((k) => <div key={k} style={{ position: "absolute", left: blip.x - 30 * k - 10, top: blip.y - 30 * k - 10, width: 60 * k + 20, height: 60 * k + 20, borderRadius: "50%", border: `1.5px solid ${ambar(0.6 / k)}` }} />)}
      <Rotulo x={blip.x + 46} y={blip.y - 52} align="left" size={20} color="#ffd88a">SEÑAL DETECTADA</Rotulo>
      <Rotulo x={blip.x + 46} y={blip.y - 22} align="left" size={16} color={ambar(0.7)}>SETTER · AZ 030°</Rotulo>
    </Consola>
  );
};

/* ───────────── 2. Qué es ───────────── */
export const SET1QueEs: React.FC = () => (
  <Consola n={1} rotulo="01 · QUÉ ES" titulo="Practicá tus llamadas de agenda." bajada="Con otros setters, cada semana. Vos de un lado, un compañero del otro.">
    <Reticula />
    <svg width={SW} height={SW} style={{ position: "absolute", inset: 0, filter: glow(0.5) }}>
      {[1, 2, 3, 4, 5].map((k) => (
        <path key={k} d={`M ${SC - 90 - k * 62} ${SC - 40 - k * 40} A ${130 + k * 74} ${130 + k * 74} 0 0 1 ${SC + 90 + k * 62} ${SC - 40 - k * 40}`} fill="none" stroke={ambar(0.75 - k * 0.12)} strokeWidth={2.4} strokeLinecap="round" />
      ))}
    </svg>
    <Objeto src="setters-rc/ins/antena-hd.webp" lf={240} en={0} x={SC} y={SC + 40} size={600} halo={0.55} luz={0} />
    <Rotulo x={70} y={70} align="left" size={17}>CANAL ABIERTO · 2 OPERADORES</Rotulo>
    <Rotulo x={SW - 70} y={70} align="right" size={17} color={ambar(0.6)}>TX ● RX ●</Rotulo>
    <Rotulo x={SC} y={SW - 80} size={17} color={ambar(0.6)}>SETTER ⇄ SETTER</Rotulo>
  </Consola>
);

/* ───────────── 3. Agenda ───────────── */
const arcoHoras = (h0: number, h1: number, r: number) => {
  const p = (h: number) => {
    const a = (h / 24) * Math.PI * 2;
    return `${SC + Math.sin(a) * r} ${SC - Math.cos(a) * r}`;
  };
  return `M ${p(h0)} A ${r} ${r} 0 ${h1 - h0 > 12 ? 1 : 0} 1 ${p(h1)}`;
};
export const SET2Agenda: React.FC = () => (
  <Consola n={2} rotulo="02 · AGENDA" titulo="Te emparejamos aunque no coincidan." bajada="Avisos al momento y un recordatorio 24 h antes de practicar.">
    <svg width={SW} height={SW} style={{ position: "absolute", inset: 0 }}>
      <circle cx={SC} cy={SC} r={360} fill="none" stroke={ambar(0.22)} strokeWidth={1.2} />
      {Array.from({ length: 96 }, (_, i) => {
        const a = (i / 96) * Math.PI * 2;
        const l = i % 4 === 0 ? 24 : 9;
        return <line key={i} x1={SC + Math.sin(a) * 400} y1={SC - Math.cos(a) * 400} x2={SC + Math.sin(a) * (400 - l)} y2={SC - Math.cos(a) * (400 - l)} stroke={ambar(i % 4 === 0 ? 0.65 : 0.3)} strokeWidth={1.4} />;
      })}
      {[0, 6, 12, 18].map((h) => {
        const a = (h / 24) * Math.PI * 2;
        return <text key={h} x={SC + Math.sin(a) * 440} y={SC - Math.cos(a) * 440 + 7} textAnchor="middle" fontFamily={MONO} fontSize={20} fill={ambar(0.7)}>{String(h).padStart(2, "0")}</text>;
      })}
      <path d={arcoHoras(17.5, 21, 320)} fill="none" stroke="#ffc35a" strokeWidth={22} strokeLinecap="round" opacity={0.85} style={{ filter: glow(0.7) }} />
      <path d={arcoHoras(19, 23, 270)} fill="none" stroke="#e9e6df" strokeWidth={22} strokeLinecap="round" opacity={0.55} />
      <path d={arcoHoras(19, 21, 295)} fill="none" stroke="#fff1cf" strokeWidth={3} strokeDasharray="2 8" />
      {[19].map((h) => {
        const a = (h / 24) * Math.PI * 2;
        return <line key={h} x1={SC} y1={SC} x2={SC + Math.sin(a) * 345} y2={SC - Math.cos(a) * 345} stroke="#ffd88a" strokeWidth={2.5} style={{ filter: glow() }} />;
      })}
      <circle cx={SC} cy={SC} r={8} fill="#ffd88a" />
    </svg>
    <Rotulo x={SC - 360} y={SC + 222} align="left" size={17} color="#ffc35a">● VOS 17:30–21:00</Rotulo>
    <Rotulo x={SC - 360} y={SC + 252} align="left" size={17} color="rgba(233,230,223,0.7)">● COMPAÑERO 19:00–23:00</Rotulo>
    <div style={{ position: "absolute", left: SC - 210, top: SC + 40, width: 420, padding: "22px 0", borderRadius: 16, border: `1.5px solid ${ambar(0.6)}`, background: "rgba(20,12,3,0.85)", textAlign: "center", boxShadow: `0 0 40px ${ambar(0.25)}` }}>
      <div style={{ fontFamily: MONO, fontSize: 52, color: "#ffe2a6", letterSpacing: 2, filter: glow(0.7) }}>19:00</div>
      <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 5, color: ambar(0.85), marginTop: 6 }}>PRÁCTICA CONFIRMADA</div>
    </div>
  </Consola>
);

/* ───────────── 4. Doble reporte ───────────── */
const Galvanometro: React.FC<{ x: number; y: number; pct: number; rotulo: string }> = ({ x, y, pct, rotulo }) => {
  const r = 175;
  const a = (-120 + 240 * pct) * (Math.PI / 180);
  return (
    <div style={{ position: "absolute", left: x - 210, top: y - 210, width: 420, height: 380, borderRadius: 26, background: "linear-gradient(180deg, #f3e6c8 0%, #e2cfa4 100%)", boxShadow: "inset 0 0 0 3px #3a2a12, inset 0 18px 40px rgba(0,0,0,0.25), 0 20px 40px rgba(0,0,0,0.6)", overflow: "hidden" }}>
      <svg width={420} height={380} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 41 }, (_, i) => {
          const t = (-120 + i * 6) * (Math.PI / 180);
          const l = i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10;
          return <line key={i} x1={210 + Math.sin(t) * r} y1={230 - Math.cos(t) * r} x2={210 + Math.sin(t) * (r - l)} y2={230 - Math.cos(t) * (r - l)} stroke={i >= 30 ? "#a8410c" : "#2a1e0c"} strokeWidth={i % 10 === 0 ? 2.4 : 1.4} />;
        })}
        {[0, 25, 50, 75, 100].map((v, i) => {
          const t = (-120 + i * 60) * (Math.PI / 180);
          return <text key={v} x={210 + Math.sin(t) * (r - 50)} y={230 - Math.cos(t) * (r - 50) + 7} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#2a1e0c">{v}</text>;
        })}
        <line x1={210} y1={230} x2={210 + Math.sin(a) * (r - 6)} y2={230 - Math.cos(a) * (r - 6)} stroke="#140d04" strokeWidth={4} strokeLinecap="round" />
        <circle cx={210} cy={230} r={16} fill="#2a1e0c" />
        <circle cx={210} cy={230} r={6} fill="#c79a4a" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 268, textAlign: "center", fontFamily: MONO, fontSize: 46, color: "#1c1307" }}>{Math.round(pct * 100)}%</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 326, textAlign: "center", fontFamily: MONO, fontSize: 15, letterSpacing: 4, color: "#4a3616" }}>{rotulo}</div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.35) 0%, transparent 35%)" }} />
    </div>
  );
};
const Interruptor: React.FC<{ x: number; y: number; texto: string; quien: string }> = ({ x, y, texto, quien }) => (
  <div style={{ position: "absolute", left: x - 190, top: y, width: 380, display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{ width: 82, height: 42, borderRadius: 21, background: ambar(0.25), border: `1.5px solid ${ambar(0.8)}`, position: "relative", boxShadow: `0 0 20px ${ambar(0.3)}` }}>
      <div style={{ position: "absolute", right: 4, top: 4, width: 32, height: 32, borderRadius: "50%", background: "#ffd88a", boxShadow: `0 0 12px ${AMBAR}` }} />
    </div>
    <div>
      <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: "#ffe2a6" }}>{texto}</div>
      <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: 4, color: ambar(0.6), marginTop: 4 }}>{quien}</div>
    </div>
  </div>
);
export const SET3Reporte: React.FC = () => (
  <Consola n={3} rotulo="03 · PIPELINE" titulo="Vos reportás. Tu compañero confirma." bajada="Así salen tu tasa de agenda y tu show rate, con datos de verdad.">
    <Reticula k={0.6} />
    <Interruptor x={SC - 225} y={110} texto="AGENDÉ" quien="LO MARCÁS VOS" />
    <Interruptor x={SC + 225} y={110} texto="HUBIERA IDO" quien="LO CONFIRMA EL OTRO" />
    <svg width={SW} height={SW} style={{ position: "absolute", inset: 0 }}>
      <path d={`M ${SC - 225} 190 L ${SC - 225} 260 L ${SC + 225} 260 L ${SC + 225} 190`} fill="none" stroke={ambar(0.45)} strokeWidth={1.5} strokeDasharray="4 6" />
      <line x1={SC} y1={260} x2={SC} y2={330} stroke={ambar(0.45)} strokeWidth={1.5} strokeDasharray="4 6" />
    </svg>
    <Galvanometro x={SC - 228} y={SC + 150} pct={0.38} rotulo="TASA DE AGENDA" />
    <Galvanometro x={SC + 228} y={SC + 150} pct={0.72} rotulo="SHOW RATE" />
  </Consola>
);

/* ───────────── 5. Fathom + créditos ───────────── */
const Nixie: React.FC<{ d: string }> = ({ d }) => (
  <div style={{ width: 132, height: 210, borderRadius: "60px 60px 18px 18px", background: "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(40,25,8,0.5) 30%, rgba(40,25,8,0.5) 70%, rgba(255,255,255,0.06))", border: "1.5px solid rgba(255,230,190,0.22)", position: "relative", overflow: "hidden", boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)" }}>
    <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(60deg, rgba(255,200,120,0.05) 0 1px, transparent 1px 9px), repeating-linear-gradient(-60deg, rgba(255,200,120,0.05) 0 1px, transparent 1px 9px)" }} />
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 400, fontSize: 150, color: "#ffcf7a", textShadow: `0 0 10px #ff9d1a, 0 0 30px ${AMBAR}, 0 0 60px rgba(255,120,0,0.6)` }}>{d}</div>
    <div style={{ position: "absolute", left: 16, top: 10, width: 24, height: 120, borderRadius: 12, background: "linear-gradient(90deg, rgba(255,255,255,0.18), transparent)" }} />
  </div>
);
export const SET4Fathom: React.FC = () => {
  const barras = 76;
  return (
    <Consola n={4} rotulo="04 · FATHOM" titulo="Te escuchás y sumás." bajada="Repasás tu grabación en Fathom y cada cita confirmada te da 50 créditos.">
      <Reticula k={0.5} />
      <Rotulo x={80} y={90} align="left" size={17}>FATHOM · GRABACIÓN 32:14</Rotulo>
      <Rotulo x={SW - 80} y={90} align="right" size={17} color={ambar(0.6)}>▶ 18:40</Rotulo>
      <svg width={SW} height={SW} style={{ position: "absolute", inset: 0, filter: glow(0.5) }}>
        {Array.from({ length: barras }, (_, i) => {
          const x = 80 + i * ((SW - 160) / (barras - 1));
          const h = 14 + Math.abs(Math.sin(i * 0.37) * 60 + Math.sin(i * 1.3) * 34) * (0.5 + az(i) * 0.7);
          const pasado = i < barras * 0.58;
          return <line key={i} x1={x} y1={260 - h / 2} x2={x} y2={260 + h / 2} stroke={pasado ? "#ffc35a" : ambar(0.3)} strokeWidth={5} strokeLinecap="round" />;
        })}
        <line x1={80 + (SW - 160) * 0.58} y1={150} x2={80 + (SW - 160) * 0.58} y2={370} stroke="#fff1cf" strokeWidth={2} />
        {[0.22, 0.41, 0.8].map((p, i) => <path key={i} d={`M ${80 + (SW - 160) * p - 9} 386 L ${80 + (SW - 160) * p + 9} 386 L ${80 + (SW - 160) * p} 400 Z`} fill="#ffd88a" />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", gap: 14 }}>
        {["+", "5", "0"].map((d, i) => <Nixie key={i} d={d} />)}
      </div>
      <Rotulo x={SC} y={712} size={19} color="#ffd88a">CRÉDITOS · POR CITA CONFIRMADA</Rotulo>
    </Consola>
  );
};

/* ───────────── 6. Progreso ───────────── */
export const SET5Progreso: React.FC = () => (
  <Consola n={5} rotulo="05 · PROGRESO" titulo="Subí en la tabla. Ganá trofeos." bajada="15 trofeos de setter y un mercado propio con insignias y colores de señal.">
    <Reticula k={0.7} />
    <Objeto src="setters-rc/tro/setter_rank_leyenda_radar-hd.webp" lf={240} en={0} x={SC} y={360} size={560} halo={0.6} luz={0} />
    <Rotulo x={SC} y={630} size={17} color="#ffd88a">TROFEO · LEYENDA DEL RADAR</Rotulo>
    {["oro", "fosforo", "cian", "ionosfera", "alerta"].map((k, i) => (
      <Objeto key={k} src={`setters-rc/sig/${k}-hd.webp`} lf={240 + i * 11} en={0} x={150 + i * 160} y={790} size={170} halo={0.25} luz={0} color={["#ffc35a", "#9dff6a", "#58e1ff", "#b48cff", "#ff5a4a"][i]} />
    ))}
    <Rotulo x={SC} y={880} size={15} color={ambar(0.55)}>COLORES DE SEÑAL · MERCADO</Rotulo>
  </Consola>
);

/* ───────────── 7. Trabajo ───────────── */
export const SET6Trabajo: React.FC = () => (
  <Consola n={6} rotulo="06 · TRABAJO" titulo="Tu carnet, tu CV y ofertas para setters." bajada="Directores que buscan setters, en el mismo lugar donde practicás.">
    <Reticula k={0.6} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${SC - 540}px, ${300 - 820}px) scale(1)`, transformOrigin: "540px 820px" }}>
      <div style={{ position: "absolute", inset: 0, transform: "scale(0.98)", transformOrigin: "540px 820px" }}>
        <Carnet lf={300} luz={-100} />
      </div>
    </div>
    {[["Appointment setter · remoto", 640], ["Setter high ticket", 712], ["Setter bilingüe", 784]].map(([t, y], i) => (
      <div key={i} style={{ position: "absolute", left: 90, right: 90, top: y as number, height: 56, borderRadius: 12, border: `1px solid ${ambar(0.35)}`, background: "rgba(25,15,4,0.7)", display: "flex", alignItems: "center", padding: "0 24px", boxSizing: "border-box", gap: 16 }}>
        <Led on />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "#ffe9c2", flex: 1 }}>{t}</div>
        <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: 4, color: ambar(0.7) }}>OFERTA</div>
      </div>
    ))}
    <Rotulo x={SC} y={866} size={15} color={ambar(0.55)}>VISTO POR 3 DIRECTORES</Rotulo>
  </Consola>
);

/* ───────────── 8. Cierre ───────────── */
export const SET7Cierre: React.FC = () => (
  <Consola n={7} rotulo="07 · ENTRÁ" titulo={<>Elegí <span style={{ color: "#ffc860" }}>«Soy setter»</span> al registrarte.</>} bajada="¿Sos closer? Pasale el link a tu setter.">
    <Reticula k={1.3} />
    <div style={{ position: "absolute", left: SC - 120, top: 150, opacity: 0.95, filter: glow(0.8) }}>
      <LogoRadar s={240} color="#ffd88a" ancho={2} />
    </div>
    <div style={{ position: "absolute", left: SC - 540, top: 0, width: 1080, height: SW, transform: "scale(0.8)", transformOrigin: "540px 560px" }}>
      <Marca f={200} A={0} top={480} ceja="NUEVO EN RING CLOSERS" />
    </div>
  </Consola>
);
