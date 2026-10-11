import React from "react";
import { Img, staticFile } from "remotion";
import { RC } from "../ring-closers/tema";
import { B, Encabezado, Estudio, PASOS, Riel, SANS, SERIF, Vidrio } from "./como-funciona";

/**
 * Pasos 1, 2, 4, 5, 6 y la portada de la destacada "Cómo funciona" (el 3 vive en como-funciona.tsx).
 * Textos de UI tomados de ring-closers: onboarding-form.tsx (niveles), availability ("franjas"),
 * fight-card.tsx (tipos de roleplay, Fathom, "Confirmar completado") y lib/scoring/weekly.ts (puntos).
 */

const hilo = "rgba(212,212,216,0.14)";
const etiquetaUI: React.CSSProperties = { fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 4, color: RC.platino500 };
const t1: React.CSSProperties = { fontFamily: SANS, fontWeight: 700, fontSize: 30, color: RC.crema };
const t2: React.CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: 24, color: RC.platino500, marginTop: 4 };
const verde = `linear-gradient(180deg, ${RC.esmeralda400}, ${RC.esmeralda600})`;
const verdeSombra = `0 8px 24px ${RC.esmeralda600}55, inset 0 1px 0 rgba(255,255,255,0.42)`;

/** Objeto del catálogo que corona una pieza, con sombra de contacto. */
const Objeto: React.FC<{ src: string; x: number; y: number; w: number }> = ({ src, x, y, w }) => (
  <>
    <div style={{ position: "absolute", left: x - w * 0.36, top: y + w * 0.4, width: w * 0.72, height: w * 0.1, borderRadius: "50%", background: "rgba(0,0,0,0.9)", filter: "blur(18px)" }} />
    <Img src={staticFile(src)} style={{ position: "absolute", left: x - w / 2, top: y - w / 2, width: w, height: w, objectFit: "contain",
      filter: "drop-shadow(0 34px 44px rgba(0,0,0,0.75))" }} />
  </>
);

const Fila: React.FC<{ top: number; children: React.ReactNode; activa?: boolean; alto?: number }> = ({ top, children, activa, alto = 120 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top, height: alto, borderRadius: 22,
    border: activa ? `1.5px solid ${RC.esmeralda400}` : "1px solid rgba(212,212,216,0.12)",
    background: activa ? `linear-gradient(90deg, ${RC.esmeralda600}33, ${RC.esmeralda600}0d)` : "rgba(255,255,255,0.02)",
    boxShadow: activa ? `0 0 30px ${RC.esmeralda600}40` : undefined, display: "flex", alignItems: "center", padding: "0 34px" }}>
    {children}
  </div>
);

const Marca: React.FC<{ on?: boolean; x?: boolean }> = ({ on, x }) => (
  <div style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    border: on ? "none" : "1.5px solid rgba(212,212,216,0.3)", background: on ? RC.esmeralda400 : "transparent",
    fontFamily: SANS, fontWeight: 800, fontSize: 22, color: on ? "#04130d" : RC.platino500 }}>
    {on ? "✓" : x ? "✕" : ""}
  </div>
);

// ── Paso 1 · Tu nivel ─────────────────────────────────────────────────────

const NIVELES: [string, string, boolean][] = [
  ["Principiante", "Recién arrancando a cerrar", false],
  ["Intermedio", "Ya cerrás con regularidad", true],
  ["Avanzado", "Referente, cerrás consistente", false],
];

export const CF1Nivel: React.FC = () => (
  <Estudio>
    <Riel paso={1} />
    <Vidrio x={96} y={560} w={888} h={650}>
      <div style={{ position: "absolute", left: 40, top: 150, ...etiquetaUI }}>TU TRAYECTORIA</div>
      {NIVELES.map(([a, b, on], i) => (
        <Fila key={a} top={190 + i * 118} activa={on} alto={104}>
          <Marca on={on} />
          <div style={{ marginLeft: 26 }}><div style={{ ...t1, fontSize: 28 }}>{a}</div><div style={{ ...t2, fontSize: 22 }}>{b}</div></div>
        </Fila>
      ))}
      <div style={{ position: "absolute", left: 40, top: 560, ...etiquetaUI }}>TU COMUNIDAD</div>
      <div style={{ position: "absolute", right: 40, top: 548, fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: RC.crema, lineHeight: 1 }}>
        Elite Closers<span style={{ display: "inline-block", width: 3, height: 38, marginLeft: 6, background: RC.esmeralda400, verticalAlign: -6 }} />
      </div>
    </Vidrio>
    <Objeto src="ring-closers/shop/guardia-contendiente.webp" x={540} y={540} w={300} />
    <Encabezado paso={1} titulo="Tu nivel"
      bajada={<>Creás tu cuenta, te <B>autoevaluás</B> y elegís tu comunidad. Con eso el sistema sabe con quién cruzarte.</>} />
  </Estudio>
);

// ── Paso 2 · Tus horarios ─────────────────────────────────────────────────

const DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const HORAS = ["09", "11", "13", "15", "17", "19", "21"];
const ON = new Set(["1-5", "1-6", "3-5", "3-6", "5-1", "5-2", "0-0", "2-3", "4-6"]);

export const CF2Horarios: React.FC = () => (
  <Estudio haz={-18}>
    <Riel paso={2} />
    <Vidrio x={96} y={390} w={888} h={830}>
      <div style={{ position: "absolute", left: 40, top: 44, ...etiquetaUI }}>TU DISPONIBILIDAD</div>
      <div style={{ position: "absolute", right: 40, top: 40, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: RC.esmeralda400 }}>9 franjas</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 100, height: 1, background: hilo }} />
      {DIAS.map((d, c) => (
        <div key={d} style={{ position: "absolute", left: 128 + c * 102, width: 90, top: 128, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: RC.platino500 }}>{d}</div>
      ))}
      {HORAS.map((h, r) => (
        <React.Fragment key={h}>
          <div style={{ position: "absolute", left: 40, top: 186 + r * 88, width: 80, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: RC.platino500, lineHeight: "74px" }}>{h}:00</div>
          {DIAS.map((_, c) => {
            const on = ON.has(`${c}-${r}`);
            return (
              <div key={c} style={{ position: "absolute", left: 128 + c * 102, top: 186 + r * 88, width: 90, height: 74, borderRadius: 16,
                background: on ? verde : "rgba(255,255,255,0.025)", border: on ? "none" : "1px solid rgba(212,212,216,0.08)", boxShadow: on ? verdeSombra : undefined }} />
            );
          })}
        </React.Fragment>
      ))}
    </Vidrio>
    <Encabezado paso={2} titulo="Tus horarios"
      bajada={<>Marcás las <B>franjas en las que podés</B> hacer un roleplay. Cuantas más cargues, más fácil es cruzarte con alguien.</>} />
  </Estudio>
);

// ── Paso 4 · El roleplay ──────────────────────────────────────────────────

export const CF4Roleplay: React.FC = () => (
  <Estudio haz={-30}>
    <Riel paso={4} />
    <Vidrio x={96} y={600} w={888} h={610}>
      <div style={{ position: "absolute", left: 40, top: 150, ...etiquetaUI }}>TIPO DE ROLEPLAY</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 190, height: 96, borderRadius: 48, background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(212,212,216,0.1)", display: "flex", padding: 8, gap: 8, boxSizing: "border-box" }}>
        {["Discovery", "Pitch", "Objeciones"].map((t, i) => (
          <div key={t} style={{ flex: 1, borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 28,
            color: i === 2 ? "#04130d" : RC.platino300, background: i === 2 ? verde : "transparent", boxShadow: i === 2 ? verdeSombra : undefined }}>{t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 40, top: 330, fontFamily: SANS, fontWeight: 500, fontSize: 24, color: RC.platino500 }}>Link de Fathom (opcional, prueba del RP)</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 372, height: 80, borderRadius: 18, border: "1px solid rgba(212,212,216,0.16)",
        display: "flex", alignItems: "center", padding: "0 28px", fontFamily: SANS, fontWeight: 500, fontSize: 26, color: "rgba(161,161,170,0.6)" }}>https://fathom.video/...</div>
      <div style={{ position: "absolute", left: 40, top: 490, height: 76, padding: "0 44px", borderRadius: 38, background: RC.crema,
        display: "flex", alignItems: "center", fontFamily: SANS, fontWeight: 800, fontSize: 26, color: "#0b0b0d" }}>Confirmar completado</div>
    </Vidrio>
    <Objeto src="ring-closers/trophies/first_roleplay.webp" x={540} y={560} w={290} />
    <Encabezado paso={4} titulo="El roleplay"
      bajada={<>Se juntan por <B>videollamada</B> y practican Discovery, Pitch u Objeciones. Si usás Fathom, la grabación queda como prueba.</>} />
  </Estudio>
);

// ── Paso 5 · La tarjeta ───────────────────────────────────────────────────

const Estrella: React.FC<{ size: number; on: boolean }> = ({ size, on }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: on ? `drop-shadow(0 0 10px ${RC.esmeralda500}99)` : undefined }}>
    <defs>
      <linearGradient id={`est${on ? 1 : 0}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={on ? "#6ee7b7" : "#3a3a40"} />
        <stop offset="1" stopColor={on ? "#059669" : "#1e1e21"} />
      </linearGradient>
    </defs>
    <path d="M12 2.2l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17l-6.1 3.4 1.5-6.7L2.3 9.1l6.8-.7z" fill={`url(#est${on ? 1 : 0})`}
      stroke={on ? "rgba(255,255,255,0.35)" : "rgba(212,212,216,0.2)"} strokeWidth={0.4} />
  </svg>
);

const TABLA = [["5★", "+20"], ["4★", "+15"], ["3★", "+10"], ["2★", "+5"], ["1★", "0"]];

export const CF5Tarjeta: React.FC = () => (
  <Estudio haz={-20}>
    <Riel paso={5} />
    <Vidrio x={96} y={600} w={888} h={610}>
      <div style={{ position: "absolute", left: 40, top: 150, ...etiquetaUI }}>TU RIVAL TE CALIFICÓ</div>
      <div style={{ position: "absolute", left: 40, top: 196, display: "flex", gap: 10 }}>
        {[1, 2, 3, 4, 5].map((k) => <Estrella key={k} size={74} on={k <= 4} />)}
      </div>
      <div style={{ position: "absolute", right: 40, top: 180, textAlign: "right" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 88, lineHeight: 1, color: RC.esmeralda400 }}>+15</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 4, color: RC.platino500 }}>PUNTOS</div>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 330, height: 1, background: hilo }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 362, display: "flex", justifyContent: "space-between" }}>
        {TABLA.map(([a, b], i) => (
          <div key={a} style={{ width: 146, height: 150, borderRadius: 20, textAlign: "center", paddingTop: 26, boxSizing: "border-box",
            border: i === 1 ? `1.5px solid ${RC.esmeralda400}` : "1px solid rgba(212,212,216,0.1)",
            background: i === 1 ? `${RC.esmeralda600}26` : "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: RC.platino500 }}>{a}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 56, color: i === 1 ? RC.esmeralda400 : RC.crema, marginTop: 6 }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 544, fontFamily: SANS, fontWeight: 500, fontSize: 24, color: RC.platino500 }}>Nadie se pone su propia nota.</div>
    </Vidrio>
    <Objeto src="ring-closers/trophies/five_stars.webp" x={540} y={560} w={290} />
    <Encabezado paso={5} titulo="La tarjeta"
      bajada={<>Al terminar, <B>cada uno califica al otro</B> de 1 a 5 estrellas y eso se vuelve puntos. Sin calificación, la pelea no suma.</>} />
  </Estudio>
);

// ── Paso 6 · La semana ────────────────────────────────────────────────────

const SEMANA: [string, string, string, boolean][] = [
  ["Enseñás", "Completada · 4★", "+15", true],
  ["Rivalidad", "Completada · 5★", "+20", true],
  ["Masterclass", "No te presentaste", "−15", false],
];

export const CF6Semana: React.FC = () => (
  <Estudio haz={-26}>
    <Riel paso={6} />
    <Vidrio x={96} y={600} w={888} h={610}>
      <div style={{ position: "absolute", left: 40, top: 150, ...etiquetaUI }}>TU SEMANA</div>
      {SEMANA.map(([a, b, c, ok], i) => (
        <Fila key={a} top={192 + i * 116} alto={100}>
          <Marca on={ok} x={!ok} />
          <div style={{ marginLeft: 24, flex: 1 }}><div style={{ ...t1, fontSize: 28 }}>{a}</div><div style={{ ...t2, fontSize: 22 }}>{b}</div></div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 52, color: ok ? RC.esmeralda400 : RC.platino500 }}>{c}</div>
        </Fila>
      ))}
      <div style={{ position: "absolute", left: 40, right: 40, top: 548, fontFamily: SANS, fontWeight: 500, fontSize: 24, color: RC.platino500 }}>Si se cancela o falta tu rival, no te resta.</div>
    </Vidrio>
    <Objeto src="ring-closers/trophies/first_week_complete.webp" x={540} y={560} w={290} />
    <Encabezado paso={6} titulo="La semana"
      bajada={<>Cumplí tus tres peleas: <B>si una queda sin hacer por vos, restás 15.</B> Sumá y subí de rango. <B>Link en la bio.</B></>} />
  </Estudio>
);

// ── Portada de la destacada ───────────────────────────────────────────────

/** Ícono redondo: aro de seis tramos (los pasos), el primero en esmeralda, y "cómo" en serif de metal. */
export const CFPortada: React.FC = () => {
  const R = 330;
  const punto = (g: number) => [540 + R * Math.cos((g * Math.PI) / 180), 960 + R * Math.sin((g * Math.PI) / 180)];
  const arco = (i: number) => {
    const [x0, y0] = punto(-90 + i * 60 + 5);
    const [x1, y1] = punto(-90 + (i + 1) * 60 - 5);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <Estudio>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {PASOS.map((_, i) => (
          <path key={i} d={arco(i)} fill="none" strokeLinecap="round" strokeWidth={i === 0 ? 11 : 6}
            stroke={i === 0 ? RC.esmeralda400 : "rgba(212,212,216,0.42)"} style={{ filter: i === 0 ? `drop-shadow(0 0 14px ${RC.esmeralda500})` : undefined }} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 220, lineHeight: 1,
        background: "linear-gradient(180deg, #ffffff 0%, #d4d4d8 45%, #6b6b73 100%)", WebkitBackgroundClip: "text", color: "transparent" }}>cómo</div>
    </Estudio>
  );
};
