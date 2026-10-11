// Destacada "Pipeline" (10/10/2026): acompaña al video Actualizaciones RC #2.
// Misma estética del video (negro, vidrio, un solo esmeralda, Inter Tight + Instrument Serif itálica)
// pero otra puesta: "el hilo" — una línea de luz que recorre las 8 láminas de arriba abajo y la tarjeta
// del closer como pieza física, en vez de las columnas 3D del video. Todo dato es inventado.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { DISPLAY, MONO } from "../ring-closers/tema";

const V = "#10b981", V4 = "#34d399", V3 = "#6ee7b7";
const HILO_X = 92;
const ETAPAS = ["Descubierto", "Contactado", "En charla", "Oferta", "Contratado"];

// ---------- fondo común ----------
const Grano: React.FC = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "screen" }}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" /></filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

// el hilo: atraviesa toda la lámina; `nodo` = altura de la estación de esta lámina; `roto` = tramo cortado (lámina del rastro)
const Hilo: React.FC<{ nodo?: number; roto?: boolean }> = ({ nodo, roto }) => (
  <>
    <div style={{ position: "absolute", left: HILO_X, top: 0, bottom: 0, width: 2,
      background: roto
        ? `repeating-linear-gradient(180deg, rgba(52,211,153,0.35) 0 22px, transparent 22px 48px)`
        : `linear-gradient(180deg, rgba(52,211,153,0.15), rgba(52,211,153,0.55) ${nodo ? (nodo / 1920) * 100 : 50}%, rgba(52,211,153,0.15))` }} />
    {nodo !== undefined && (
      <div style={{ position: "absolute", left: HILO_X - 13, top: nodo - 13, width: 28, height: 28, borderRadius: 14, border: `2px solid ${V4}`, background: "#06120e", boxShadow: "0 0 30px rgba(16,185,129,0.8)" }}>
        <div style={{ position: "absolute", inset: 7, borderRadius: 7, background: V4 }} />
      </div>
    )}
  </>
);

const Fondo: React.FC<{ children: React.ReactNode; n: number; nodo?: number; roto?: boolean; numeral?: string }> = ({ children, n, nodo, roto, numeral }) => (
  <AbsoluteFill style={{ background: "#060607", overflow: "hidden", fontFamily: TIGHT }}>
    {/* foco blanco cenital, neutro (el color queda solo en los detalles) */}
    <div style={{ position: "absolute", left: -200, right: -200, top: -500, height: 1500, background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.085), transparent 62%)" }} />
    {numeral && (
      <div style={{ position: "absolute", right: -60, top: 300, fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 1100, lineHeight: 1, color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.06)" }}>{numeral}</div>
    )}
    <Hilo nodo={nodo} roto={roto} />
    {children}
    {/* rótulo */}
    <div style={{ position: "absolute", left: 140, right: 90, top: 210, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: "rgba(212,212,216,0.75)" }}>
      <span><span style={{ color: V4 }}>●</span>&nbsp; PIPELINE DEL DIRECTOR</span>
      <span>{String(n).padStart(2, "0")} / 07</span>
    </div>
    <Grano />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55))" }} />
  </AbsoluteFill>
);

// ---------- texto ----------
const Ac: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.18em", letterSpacing: "-0.02em", color: V, textShadow: "0 0 50px rgba(16,185,129,0.45)" }}>{children}</span>
);
const Titular: React.FC<{ children: React.ReactNode; top: number; tam?: number; sub?: string }> = ({ children, top, tam = 118, sub }) => (
  <div style={{ position: "absolute", left: 140, right: 70, top }}>
    <div style={{ color: "#f4f4f5", fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.02 }}>{children}</div>
    {sub && <div style={{ marginTop: 34, fontFamily: MONO, fontSize: 23, letterSpacing: "0.26em", color: "rgba(161,161,170,0.95)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{sub}</div>}
  </div>
);

// ---------- piezas ----------
const BOX = (n: string) => staticFile(`ring-closers/boxers/${n}.webp`);
const Guante: React.FC<{ tam: number; anillo: string; img?: string }> = ({ tam, anillo, img = "southpaw" }) => (
  <div style={{ width: tam, height: tam, borderRadius: "50%", padding: 4, background: `conic-gradient(from 210deg, ${anillo}, rgba(255,255,255,0.08), ${anillo})`, flexShrink: 0 }}>
    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle at 40% 30%, #26262b, #0d0d0f)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={BOX(img)} style={{ width: "86%", height: "86%", objectFit: "contain", transform: "rotate(-12deg)" }} />
    </div>
  </div>
);

type TProps = { etapa: number; luz?: number; nombre?: string; rango?: string; pts?: string; img?: string; ancho?: number };
const Tarjeta: React.FC<TProps> = ({ etapa, luz = 0.6, nombre = "Zurdo Ríos", rango = "CONTENDIENTE", pts = "1.840", img, ancho = 620 }) => {
  const ok = etapa === 4;
  return (
    <div style={{ width: ancho, borderRadius: 28, padding: "32px 34px", boxSizing: "border-box", position: "relative",
      background: "linear-gradient(160deg, rgba(38,38,42,0.98), rgba(15,15,18,0.98))",
      border: `1.5px solid rgba(${ok || luz > 0.3 ? "52,211,153" : "255,255,255"},${0.12 + 0.4 * luz})`,
      boxShadow: `0 60px 110px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 ${70 + 70 * luz}px rgba(16,185,129,${0.08 + 0.3 * luz})` }}>
      <div style={{ position: "absolute", left: 50, right: 50, top: 0, height: 2, background: `linear-gradient(90deg, transparent, rgba(110,231,183,${0.2 + 0.6 * luz}), transparent)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Guante tam={96} anillo={ok ? V4 : "rgba(212,212,216,0.55)"} img={img} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 42, letterSpacing: "0.02em", color: "#f4f4f5", lineHeight: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{nombre}</div>
          <div style={{ marginTop: 10, fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: "0.24em", color: "#a1a1aa" }}>{rango}</div>
        </div>
        <div style={{ padding: "8px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", fontFamily: MONO, fontSize: 20, fontWeight: 600, color: "#d4d4d8" }}>{pts}</div>
      </div>
      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))", margin: "28px 0 24px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: ok ? V4 : V, boxShadow: "0 0 14px rgba(16,185,129,0.9)" }} />
          <span style={{ fontWeight: 600, fontSize: 30, color: "#ededee", letterSpacing: "-0.01em" }}>{ETAPAS[etapa]}</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: "0.28em", color: `rgba(167,243,208,${0.5 + 0.45 * luz})` }}>AUTO</div>
      </div>
    </div>
  );
};

const Fantasma: React.FC<{ ancho?: number; op?: number }> = ({ ancho = 620, op = 1 }) => (
  <div style={{ width: ancho, height: 250, borderRadius: 26, opacity: op, background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)", padding: "36px 34px", boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ width: 84, height: 84, borderRadius: 42, background: "rgba(255,255,255,0.07)" }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "62%", height: 24, borderRadius: 6, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ width: "38%", height: 13, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginTop: 14 }} />
      </div>
    </div>
    <div style={{ width: "44%", height: 18, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginTop: 48 }} />
  </div>
);

const Sello: React.FC<{ tam?: number }> = ({ tam = 240 }) => (
  <div style={{ position: "relative", width: tam, height: tam, transform: "rotate(-10deg)" }}>
    <div style={{ position: "absolute", inset: -26, borderRadius: "50%", border: "1.5px solid rgba(52,211,153,0.25)" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,40,30,0.97) 55%, rgba(6,30,24,0.92))", border: `2px solid ${V4}`, boxShadow: "0 0 60px rgba(16,185,129,0.55), 0 24px 60px rgba(0,0,0,0.65)" }} />
    <div style={{ position: "absolute", inset: tam * 0.064, borderRadius: "50%", border: "1px solid rgba(52,211,153,0.6)" }} />
    <svg width={tam} height={tam} viewBox="0 0 220 220" style={{ position: "absolute", inset: 0, transform: "rotate(-40deg)" }}>
      <defs><path id="cs" d="M110,110 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
      <text fill={V3} style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.32em", fontWeight: 600 }}><textPath href="#cs">CONTRATADO · RING CLOSERS · CONTRATADO · RING CLOSERS ·</textPath></text>
    </svg>
    <svg width={tam} height={tam} viewBox="0 0 220 220" style={{ position: "absolute", inset: 0 }}>
      <path d="M84 112 l18 18 l36 -40" fill="none" stroke={V4} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const Chip: React.FC<{ txt: string; verde?: boolean; gris?: boolean; style?: React.CSSProperties }> = ({ txt, verde, gris, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, height: 70, padding: "0 30px", borderRadius: 35, whiteSpace: "nowrap",
    background: verde ? "rgba(6,40,30,0.92)" : "rgba(18,18,21,0.92)", border: `1.5px solid ${verde ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.12)"}`,
    boxShadow: "0 24px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)", ...style }}>
    {!gris && <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={V4} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
    <span style={{ fontWeight: 600, fontSize: 32, color: gris ? "rgba(212,212,216,0.7)" : "#ededee", letterSpacing: "-0.01em", fontStyle: gris ? "italic" : undefined }}>{txt}</span>
  </div>
);

// escuadras finas de 1 px (encuadre tipo plano técnico)
const Escuadras: React.FC<{ x: number; y: number; w: number; h: number; c?: string }> = ({ x, y, w, h, c = "rgba(52,211,153,0.7)" }) => {
  const L = 44;
  const e = (s: React.CSSProperties) => <div style={{ position: "absolute", width: L, height: L, ...s }} />;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      {e({ left: 0, top: 0, borderLeft: `1.5px solid ${c}`, borderTop: `1.5px solid ${c}` })}
      {e({ right: 0, top: 0, borderRight: `1.5px solid ${c}`, borderTop: `1.5px solid ${c}` })}
      {e({ left: 0, bottom: 0, borderLeft: `1.5px solid ${c}`, borderBottom: `1.5px solid ${c}` })}
      {e({ right: 0, bottom: 0, borderRight: `1.5px solid ${c}`, borderBottom: `1.5px solid ${c}` })}
    </div>
  );
};

const Abs: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, ...style }}>{children}</div>
);
const tilt = (rx: number, ry: number, rz = 0, s = 1) => `perspective(1800px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
const charco = (x: number, y: number, w: number, a = 0.3): React.ReactNode => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 140, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(16,185,129,${a}), transparent 70%)`, filter: "blur(6px)" }} />
);

// cinco columnas de vidrio en contorno, al fondo (eco del video, sin repetirlo)
const ColumnasEco: React.FC<{ top: number; op?: number }> = ({ top, op = 1 }) => (
  <div style={{ position: "absolute", left: 140, right: 60, top, height: 760, display: "flex", gap: 26, opacity: op, transform: "perspective(1400px) rotateX(58deg)", transformOrigin: "50% 0%", filter: "blur(1.5px)" }}>
    {ETAPAS.map((e, i) => (
      <div key={e} style={{ flex: 1, borderRadius: 22, border: `1.5px solid rgba(${i === 4 ? "52,211,153,0.5" : "255,255,255,0.09"})`, background: `linear-gradient(180deg, rgba(255,255,255,0.04), transparent)` }} />
    ))}
  </div>
);

// ================= LÁMINAS =================

export const PIPPortada: React.FC = () => (
  <Fondo n={0} nodo={1070}>
    <Abs x={0} y={400} style={{ width: 1080, display: "flex", justifyContent: "center" }}><div style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.5))" }}><Logo size={150} /></div></Abs>
    <ColumnasEco top={1180} op={0.7} />
    {/* pila: dos fantasmas atrás, la tarjeta adelante, el sello encima */}
    <Abs x={250} y={720} style={{ transform: tilt(16, -14, 4, 1.02), filter: "blur(5px)", opacity: 0.55 }}><Fantasma /></Abs>
    <Abs x={190} y={820} style={{ transform: tilt(14, -12, 2, 1.06), filter: "blur(2.5px)", opacity: 0.8 }}><Fantasma /></Abs>
    {charco(200, 1180, 680, 0.35)}
    <Abs x={150} y={930} style={{ transform: tilt(12, -10, -1, 1.16) }}><Tarjeta etapa={4} luz={0.9} /></Abs>
    <Abs x={760} y={760} style={{ transform: "scale(0.8)" }}><Sello /></Abs>
    <Titular top={1360} tam={150} sub={"TUS CLOSERS, DE LA PRIMERA\nMIRADA A LA FIRMA."}>
      Pipeline<br /><Ac>del director</Ac>
    </Titular>
  </Fondo>
);

export const PIP1Encontrar: React.FC = () => {
  // un muro de tarjetas que se pierde en profundidad; una sola en foco
  const filas = 6, cols = 4;
  return (
    <Fondo n={1} nodo={760} numeral="1">
      <div style={{ position: "absolute", left: -260, right: -260, top: 380, height: 900, transform: "perspective(1300px) rotateX(48deg) rotateZ(-8deg)", transformOrigin: "50% 100%" }}>
        {Array.from({ length: filas * cols }).map((_, k) => {
          const f = Math.floor(k / cols), c = k % cols;
          const lejos = 1 - f / filas;
          return (
            <div key={k} style={{ position: "absolute", left: 60 + c * 400 + (f % 2) * 120, top: f * 150, transform: "scale(0.6)", transformOrigin: "0 0", opacity: 0.25 + 0.5 * (1 - lejos), filter: `blur(${1 + 5 * lejos}px)` }}>
              <Fantasma />
            </div>
          );
        })}
      </div>
      {/* la elegida */}
      {charco(230, 960, 640, 0.3)}
      <Abs x={210} y={700} style={{ transform: tilt(8, -6, -2, 1.0) }}><Tarjeta etapa={0} luz={0.55} nombre="Zurdo Ríos" /></Abs>
      <Escuadras x={170} y={650} w={720} h={400} />
      <Abs x={170} y={1070} style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.28em", color: "rgba(110,231,183,0.85)" }}>● EN EL RADAR · DIRECTORIO</Abs>
      <Titular top={1310} sub="EL DIRECTORIO YA TE MUESTRA QUIÉN RINDE.">
        Encontrar closers ya no es <Ac>el problema.</Ac>
      </Titular>
    </Fondo>
  );
};

export const PIP2Rastro: React.FC = () => (
  <Fondo n={2} roto numeral="2">
    {/* las tarjetas se dispersan y el hilo se corta */}
    <Abs x={520} y={430} style={{ transform: tilt(18, 22, 9, 0.62), filter: "blur(5px)", opacity: 0.5 }}><Tarjeta etapa={1} luz={0} nombre="Vera Paz" rango="RETADOR" pts="980" img="speed" /></Abs>
    <Abs x={120} y={600} style={{ transform: tilt(-10, -20, -7, 0.74), filter: "blur(2px)", opacity: 0.75 }}><Tarjeta etapa={2} luz={0} nombre="Leo Bruno" rango="AMATEUR" pts="610" img="guard_high" /></Abs>
    <Abs x={330} y={860} style={{ transform: tilt(10, 12, 4, 0.86) }}><Tarjeta etapa={1} luz={0} /></Abs>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d="M300 760 C 420 820, 470 900, 560 940" stroke="rgba(255,255,255,0.25)" strokeWidth={2} strokeDasharray="6 14" fill="none" />
      <path d="M800 640 C 760 760, 720 820, 700 900" stroke="rgba(255,255,255,0.18)" strokeWidth={2} strokeDasharray="6 14" fill="none" />
    </svg>
    <Chip gris txt="¿Le escribí?" style={{ position: "absolute", left: 600, top: 760, transform: "rotate(3deg)" }} />
    <Chip gris txt="¿Qué me contestó?" style={{ position: "absolute", left: 150, top: 1120, transform: "rotate(-3deg)" }} />
    <Chip gris txt="Visto hace 12 días" style={{ position: "absolute", left: 560, top: 1200, transform: "rotate(2deg)", opacity: 0.8 }} />
    <Titular top={1380} sub="LA PLANILLA, EL CHAT, LA MEMORIA… SE PIERDEN.">
      El problema es seguirles <Ac>el rastro.</Ac>
    </Titular>
  </Fondo>
);

export const PIP3Tarjeta: React.FC = () => {
  const etiqueta = (x: number, y: number, x2: number, y2: number, txt: string, der?: boolean) => (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={x} y1={y} x2={x2} y2={y2} stroke="rgba(52,211,153,0.6)" strokeWidth={1.5} />
        <circle cx={x} cy={y} r={6} fill={V4} />
      </svg>
      <div style={{ position: "absolute", top: y2 - 15, left: der ? x2 + 16 : undefined, right: der ? undefined : 1080 - x2 + 16, fontFamily: MONO, fontSize: 21, letterSpacing: "0.26em", color: "rgba(212,212,216,0.9)", whiteSpace: "nowrap" }}>{txt}</div>
    </>
  );
  return (
    <Fondo n={3} nodo={880} numeral="3">
      {charco(160, 1100, 760, 0.32)}
      <Abs x={110} y={700} style={{ transform: tilt(4, 0, 0, 1.38), transformOrigin: "50% 50%" }}><Tarjeta etapa={2} luz={0.7} ancho={620} /></Abs>
      <Escuadras x={110} y={600} w={870} h={520} c="rgba(255,255,255,0.25)" />
      {etiqueta(330, 690, 330, 520, "RANGO REAL", true)}
      {etiqueta(860, 700, 860, 560, "PUNTOS DEL RING", false)}
      {etiqueta(240, 1010, 240, 1190, "ETAPA EN VIVO", true)}
      {etiqueta(940, 1010, 940, 1190, "SE MUEVE SOLA", false)}
      <Titular top={1330} sub="RANGO, PUNTOS Y ETAPA EN UNA SOLA PIEZA.">
        Cada closer tiene <Ac>su tarjeta.</Ac>
      </Titular>
    </Fondo>
  );
};

export const PIP4Avanza: React.FC = () => {
  const Y0 = 720, PASO = 205;
  const acciones = ["", "Lo seguís", "Le escribís", "Le ofrecés", "Firma"];
  const actual = 3;
  return (
    <Fondo n={4}>
      <Titular top={330} tam={130}>Y avanza <Ac>sola.</Ac></Titular>
      {/* estaciones sobre el hilo */}
      <div style={{ position: "absolute", left: HILO_X, top: Y0, width: 2, height: PASO * actual, background: V4, boxShadow: "0 0 18px rgba(16,185,129,0.9)" }} />
      {ETAPAS.map((e, i) => {
        const y = Y0 + i * PASO, hecho = i <= actual;
        return (
          <React.Fragment key={e}>
            <div style={{ position: "absolute", left: HILO_X - 15, top: y - 15, width: 32, height: 32, borderRadius: 16, border: `2px solid ${hecho ? V4 : "rgba(255,255,255,0.25)"}`, background: "#070908", boxShadow: hecho ? "0 0 26px rgba(16,185,129,0.7)" : undefined }}>
              {hecho && <div style={{ position: "absolute", inset: 7, borderRadius: 8, background: V4 }} />}
            </div>
            <div style={{ position: "absolute", left: 150, top: y - 24, fontFamily: MONO, fontSize: 20, letterSpacing: "0.28em", color: hecho ? "rgba(110,231,183,0.95)" : "rgba(161,161,170,0.6)" }}>{String(i + 1).padStart(2, "0")} · {e.toUpperCase()}</div>
            {i > 0 && <div style={{ position: "absolute", left: 150, top: y + 10, fontWeight: 600, fontSize: 44, letterSpacing: "-0.03em", color: hecho ? "#f4f4f5" : "rgba(212,212,216,0.35)" }}>
              {i === 4 ? <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: 52 }}>{acciones[i]}</span> : acciones[i]}
            </div>}
          </React.Fragment>
        );
      })}
      {/* la tarjeta va en la estación actual, a la derecha */}
      {charco(470, Y0 + actual * PASO + 30, 560, 0.35)}
      <Abs x={470} y={Y0 + actual * PASO - 150} style={{ transform: tilt(6, -16, -3, 0.86), transformOrigin: "0 50%" }}><Tarjeta etapa={3} luz={0.95} ancho={600} /></Abs>
      <div style={{ position: "absolute", left: 150, right: 70, top: 1700, fontFamily: MONO, fontSize: 22, letterSpacing: "0.26em", color: "rgba(161,161,170,0.95)" }}>CADA PASO QUE DAS, LA MUEVE.</div>
    </Fondo>
  );
};

export const PIP5Nada: React.FC = () => (
  <Fondo n={5} nodo={1000} numeral="5">
    {/* la planilla que ya no hace falta: se desarma en profundidad */}
    <div style={{ position: "absolute", left: 120, top: 420, width: 1000, height: 760, transform: "perspective(1400px) rotateY(-24deg) rotateX(10deg)", transformOrigin: "0 50%", opacity: 0.55,
      WebkitMaskImage: "linear-gradient(90deg, black 10%, transparent 85%)",
      backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)", backgroundSize: "180px 64px", filter: "blur(1.2px)" }}>
      {["Nombre", "Etapa", "Último contacto", "Próximo paso"].map((h, i) => (
        <div key={h} style={{ position: "absolute", left: 14 + i * 180, top: 16, fontFamily: MONO, fontSize: 17, color: "rgba(212,212,216,0.7)", letterSpacing: "0.1em", whiteSpace: "nowrap", width: 170, overflow: "hidden" }}>{h}</div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 2, background: "rgba(255,255,255,0.0)" }} />
    </div>
    {/* adelante: la tarjeta y lo que se registró solo */}
    {charco(210, 1050, 660, 0.32)}
    <Abs x={200} y={800} style={{ transform: tilt(8, 8, 2, 1.04) }}><Tarjeta etapa={3} luz={0.8} /></Abs>
    <Chip verde txt="Seguido" style={{ position: "absolute", left: 150, top: 560, transform: "rotate(-3deg) scale(0.9)" }} />
    <Chip verde txt="Mensaje enviado" style={{ position: "absolute", left: 470, top: 640, transform: "rotate(2deg) scale(0.9)" }} />
    <Chip verde txt="Oferta enviada" style={{ position: "absolute", left: 560, top: 1110, transform: "rotate(-2deg) scale(0.9)" }} />
    <Titular top={1330} tam={128} sub="SIN PLANILLAS. SIN ARRASTRAR TARJETAS.">
      Vos no cargás <Ac>nada.</Ac>
    </Titular>
  </Fondo>
);

export const PIP6Equipo: React.FC = () => {
  const equipo = [
    { img: "guard_classic", n: "Ana" }, { img: "counter", n: "Tomás" }, { img: "speed", n: "Vera" }, { img: "knockout", n: "Iván" }, { img: "southpaw", n: "Zurdo", nuevo: true },
  ];
  return (
    <Fondo n={6} nodo={1210} numeral="6">
      {charco(200, 880, 680, 0.4)}
      <Abs x={170} y={600} style={{ transform: tilt(10, -8, -2, 1.12) }}><Tarjeta etapa={4} luz={1} /></Abs>
      <Abs x={640} y={430}><Sello tam={290} /></Abs>
      {/* Mi equipo */}
      <div style={{ position: "absolute", left: 140, right: 70, top: 1020, borderRadius: 30, padding: "30px 34px", background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))", border: "1.5px solid rgba(255,255,255,0.09)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 20, letterSpacing: "0.28em", color: "rgba(212,212,216,0.8)" }}>
          <span>MI EQUIPO</span><span style={{ color: V3 }}>05 · +1</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          {equipo.map((m) => (
            <div key={m.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: m.nuevo ? 1 : 0.6 }}>
              <div style={{ borderRadius: "50%", boxShadow: m.nuevo ? "0 0 40px rgba(16,185,129,0.7)" : undefined }}><Guante tam={118} anillo={m.nuevo ? V4 : "rgba(212,212,216,0.35)"} img={m.img} /></div>
              <span style={{ fontWeight: 600, fontSize: 24, color: m.nuevo ? V3 : "#a1a1aa" }}>{m.n}</span>
            </div>
          ))}
        </div>
      </div>
      <Titular top={1390} tam={112}>
        Cuando firma, ya es parte de <Ac>tu equipo.</Ac>
      </Titular>
    </Fondo>
  );
};

export const PIP7Cierre: React.FC = () => (
  <Fondo n={7} nodo={760}>
    <ColumnasEco top={1150} op={0.85} />
    <Abs x={0} y={560} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ filter: "drop-shadow(0 0 40px rgba(16,185,129,0.55))" }}><Logo size={260} /></div>
    </Abs>
    <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", color: "#f4f4f5", fontWeight: 600, fontSize: 124, letterSpacing: "-0.045em", lineHeight: 1.02 }}>
      Pipeline<br /><Ac>del director</Ac>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: "0.32em", color: V3 }}>RING CLOSERS · YA DISPONIBLE</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center" }}>
      <div style={{ height: 96, padding: "0 54px", borderRadius: 48, display: "flex", alignItems: "center", gap: 18, border: `1.5px solid rgba(52,211,153,0.7)`, background: "rgba(6,40,30,0.75)", boxShadow: "0 0 50px rgba(16,185,129,0.3)", fontWeight: 600, fontSize: 38, color: "#f4f4f5" }}>
        Link en el perfil <span style={{ color: V4 }}>→</span>
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontSize: 30, color: "rgba(161,161,170,0.95)" }}>Para directores con cuenta en Ring Closers.</div>
  </Fondo>
);

export const LAMINAS_PIP = [
  { id: "0-portada", c: PIPPortada },
  { id: "1-encontrar", c: PIP1Encontrar },
  { id: "2-rastro", c: PIP2Rastro },
  { id: "3-tarjeta", c: PIP3Tarjeta },
  { id: "4-avanza", c: PIP4Avanza },
  { id: "5-nada", c: PIP5Nada },
  { id: "6-equipo", c: PIP6Equipo },
  { id: "7-cierre", c: PIP7Cierre },
];
