import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { RC, DISPLAY } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";
import { SANS, SERIF } from "./como-funciona";

/**
 * Destacada "Ofertas" (27/09/2026). Lenguaje DISTINTO a "Qué es" (Oswald + bokeh) y a "Cómo funciona"
 * (vidrio + riel de pasos): acá se muestra la UI REAL de la app (components/postings/*), plana y nítida,
 * agrandada 2,4x, sobre negro con una luz alta; cada historia tiene UN protagonista (lupa, abanico, CV,
 * pedido, chat, cinturón). Titular editorial arriba a la izquierda, sin numeración (Javier sacó el "II").
 * Primera versión (tarjeta de metal en 3D) rechazada por "trucha". Se exportan con `remotion still --frame=0`.
 */

export const INK = { 950: "#0b0b0d", 900: "#141416", 800: "#1e1e21", 700: "#2a2a2e" };

/** Fondo de estudio: negro, una luz alta y neutra, sin manchas de color. */
export const Estudio2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "#070708", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -240, right: -240, top: 200, height: 1700, borderRadius: "50%", filter: "blur(40px)",
      background: "radial-gradient(ellipse at 50% 45%, rgba(244,244,245,0.07) 0%, rgba(244,244,245,0.025) 40%, transparent 68%)" }} />
    {children}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
    <Acabado />
  </AbsoluteFill>
);

/** Contraluz esmeralda detrás del objeto principal. */
const Contraluz: React.FC<{ x: number; y: number; w: number; h: number; o?: number }> = ({ x, y, w, h, o = 0x66 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: "50%", filter: "blur(60px)",
    background: `radial-gradient(ellipse, ${RC.esmeralda600}${o.toString(16)} 0%, ${RC.esmeralda600}1a 45%, transparent 70%)` }} />
);

/** Cabecera editorial: filete + OFERTAS + titular serif grande, alineado a la izquierda. */
export const Cabecera: React.FC<{ titulo: React.ReactNode; bajada?: React.ReactNode }> = ({ titulo, bajada }) => (
  <div style={{ position: "absolute", top: 270, left: 96, right: 96 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: RC.platino500 }}>
      <div style={{ width: 60, height: 1.5, background: RC.esmeralda400 }} />
      <span>OFERTAS</span>
    </div>
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 96, lineHeight: 0.98, color: RC.crema, marginTop: 30, letterSpacing: -1 }}>{titulo}</div>
    {bajada ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, lineHeight: 1.4, color: RC.platino500, marginTop: 26, maxWidth: 860 }}>{bajada}</div> : null}
  </div>
);

export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: RC.crema, fontWeight: 700 }}>{children}</span>;

// ── Piezas de UI calcadas de la app (components/postings/*), escala 2,4x ────────

const Chip: React.FC<{ children: React.ReactNode; apagado?: boolean }> = ({ children, apagado }) => (
  <span style={{ display: "inline-flex", alignItems: "center", height: 50, padding: "0 24px", borderRadius: 999, whiteSpace: "nowrap",
    border: `1.5px solid ${INK[700]}`, background: INK[800], color: apagado ? "#71717a" : RC.platino300, fontFamily: SANS, fontWeight: 600, fontSize: 24 }}>{children}</span>
);

const Badge: React.FC<{ children: React.ReactNode; ok?: boolean }> = ({ children, ok }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 50, padding: "0 22px", borderRadius: 12, whiteSpace: "nowrap",
    background: ok ? "rgba(16,185,129,0.15)" : INK[800], color: ok ? RC.esmeralda400 : RC.platino300, fontFamily: SANS, fontWeight: 700, fontSize: 24 }}>
    {ok ? <span style={{ width: 11, height: 11, borderRadius: 6, background: RC.esmeralda400 }} /> : null}
    {children}
  </span>
);

const Boton: React.FC<{ children: React.ReactNode; primario?: boolean }> = ({ children, primario }) => (
  <span style={{ display: "inline-flex", alignItems: "center", height: 88, padding: "0 38px", borderRadius: 20, whiteSpace: "nowrap",
    border: primario ? "none" : `1.5px solid ${INK[700]}`, background: primario ? RC.esmeralda500 : "transparent",
    boxShadow: primario ? `0 10px 40px ${RC.esmeralda600}66, inset 0 1.5px 0 rgba(255,255,255,0.25)` : undefined,
    color: primario ? "#03140d" : RC.crema, fontFamily: SANS, fontWeight: 700, fontSize: 30 }}>{children}</span>
);

const Avatar: React.FC<{ ini: string; size?: number }> = ({ ini, size = 96 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: `linear-gradient(145deg, #3a3a40, ${INK[800]})`,
    border: `1.5px solid ${INK[700]}`, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: SANS, fontWeight: 700, fontSize: size / 3, color: RC.platino300 }}>{ini}</div>
);

/** Caja de texto de la app con lo que escribió el closer y el cursor de escritura. */
const Campo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ borderRadius: 20, border: `1.5px solid ${INK[700]}`, background: INK[900], padding: "26px 28px",
    boxShadow: `0 0 0 5px ${RC.esmeralda500}33`, fontFamily: SANS, fontWeight: 500, fontSize: 28, lineHeight: 1.45, color: RC.crema }}>
    {children}<span style={{ display: "inline-block", width: 3, height: 34, background: RC.esmeralda400, marginLeft: 4, verticalAlign: -6 }} />
  </div>
);

/** Puntero del mouse, para marcar el botón que se toca. */
const Cursor: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={70} height={90} viewBox="0 0 28 36" style={{ position: "absolute", left: x, top: y, filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.6))" }}>
    <path d="M2 2 L2 28 L9 21.5 L13.5 32 L18 30 L13.5 19.8 L23 19.8 Z" fill="#fafafa" stroke="#0b0b0d" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

const Divisor: React.FC<{ m?: string }> = ({ m = "34px 0 30px" }) => <div style={{ height: 1.5, background: INK[700], margin: m }} />;

const CHIPS_SAAS = ["SaaS B2B", "Fijo + comisión · 10%", "Ticket promedio $3.000", "Remoto", "Leads: los provee la empresa", "Rango Contendiente o más"];

/** Tarjeta de oferta como la ve el closer (PostingRow). `fantasma` = oferta de atrás, sin contenido legible. */
export const OfertaCard: React.FC<{
  top: number; left?: number; w?: number; escala?: number; opacidad?: number; rot?: number; fantasma?: boolean; alto?: number;
  titulo?: string; firma?: string; iniciales?: string; abierta?: boolean; boton?: string | null; desc?: string | null; chips?: string[];
  children?: React.ReactNode;
}> = ({ top, left = 72, w = 936, escala = 1, opacidad = 1, rot = 0, fantasma, alto = 520, titulo = "Closer para cuenta de SaaS B2B",
  firma = "Martina Ríos · Directora comercial · Nubo", iniciales = "MR", abierta = true, boton = "Postularme",
  desc = "Llamadas de cierre con leads ya calificados. Agenda armada y una semana de acompañamiento para arrancar.", chips = CHIPS_SAAS, children }) => (
  <div style={{ position: "absolute", left, width: w, top, transform: `rotate(${rot}deg) scale(${escala})`, transformOrigin: "50% 0%", opacity: opacidad,
    borderRadius: 34, background: `linear-gradient(180deg, #19191c 0%, ${INK[900]} 100%)`, border: `1.5px solid ${INK[700]}`,
    boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.06), 0 50px 110px rgba(0,0,0,0.75), 0 12px 30px rgba(0,0,0,0.5)", padding: 44 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 26, visibility: fantasma ? "hidden" : "visible" }}>
      <Avatar ini={iniciales} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, lineHeight: 1.1, textTransform: "uppercase", color: RC.crema, letterSpacing: 0.5 }}>{titulo}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 25, color: RC.platino500, marginTop: 8 }}>{firma}</div>
      </div>
    </div>
    {fantasma ? <div style={{ height: alto }} /> : (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 34 }}>
          <Badge ok={abierta}>{abierta ? "Abierta" : "No abierta ahora"}</Badge>
          {boton ? <Boton>{boton}</Boton> : null}
        </div>
        {desc ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 29, lineHeight: 1.45, color: RC.platino500, marginTop: 30 }}>{desc}</div> : null}
        {chips.length ? (
          <>
            <Divisor />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>{chips.map((c) => <Chip key={c}>{c}</Chip>)}</div>
          </>
        ) : null}
        {children}
      </>
    )}
  </div>
);

/** Lupa de inspección: círculo de vidrio que muestra `children` ampliado, unido por un hilo a (hx, hy). */
const Lupa: React.FC<{ cx: number; cy: number; r: number; hx: number; hy: number; children: React.ReactNode }> = ({ cx, cy, r, hx, hy, children }) => {
  const dx = cx - hx, dy = cy - hy, d = Math.hypot(dx, dy);
  const ex = cx - (r * dx) / d, ey = cy - (r * dy) / d;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={hx} y1={hy} x2={ex} y2={ey} stroke={RC.esmeralda400} strokeWidth={2} />
        <circle cx={hx} cy={hy} r={7} fill={RC.esmeralda400} />
        <circle cx={hx} cy={hy} r={16} fill="none" stroke={RC.esmeralda400} strokeOpacity={0.35} strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: cx - r - 60, top: cy - r - 60, width: 2 * r + 120, height: 2 * r + 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${RC.esmeralda600}55 0%, transparent 65%)`, filter: "blur(30px)" }} />
      <div style={{ position: "absolute", left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: "50%", overflow: "hidden",
        background: `radial-gradient(circle at 50% 35%, #1c1c20 0%, ${INK[950]} 100%)`,
        boxShadow: `0 0 0 2.5px ${RC.esmeralda400}, 0 0 0 12px rgba(255,255,255,0.035), 0 40px 90px rgba(0,0,0,0.85)` }}>
        {children}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
          background: "linear-gradient(150deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 30%, transparent 50%)",
          boxShadow: "inset 0 0 50px rgba(0,0,0,0.7)" }} />
      </div>
    </>
  );
};

// ── 0 · Portada: sobre cerrado con lacre esmeralda ────────────────────────────

export const OFPortada: React.FC = () => {
  const W = 600, H = 400, x0 = 540 - W / 2, y0 = 960 - H / 2 + 20;
  // borde irregular del lacre
  const lacre = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2, r = 96 + (i % 2 ? 5 : 0) + Math.sin(i * 1.7) * 3;
    return `${i ? "L" : "M"} ${540 + r * Math.cos(a)} ${y0 + 250 + r * Math.sin(a)}`;
  }).join(" ") + " Z";
  return (
    <Estudio2>
      <Contraluz x={140} y={640} w={800} h={640} o={0x55} />
      <div style={{ position: "absolute", left: x0 + 40, top: y0 + H - 10, width: W - 80, height: 60, borderRadius: "50%", background: "rgba(0,0,0,0.9)", filter: "blur(30px)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="papel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#232327" /><stop offset="1" stopColor="#111113" />
          </linearGradient>
          <linearGradient id="solapa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c2c31" /><stop offset="1" stopColor="#1a1a1d" />
          </linearGradient>
          <radialGradient id="cera" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#6ee7b7" /><stop offset="0.35" stopColor="#10b981" /><stop offset="1" stopColor="#065f46" />
          </radialGradient>
        </defs>
        <rect x={x0} y={y0} width={W} height={H} rx={26} fill="url(#papel)" stroke="rgba(212,212,216,0.28)" strokeWidth={2} />
        <path d={`M ${x0 + 14} ${y0 + H - 14} L 540 ${y0 + 200} L ${x0 + W - 14} ${y0 + H - 14}`} fill="none" stroke="rgba(212,212,216,0.12)" strokeWidth={2} />
        <path d={`M ${x0 + 4} ${y0 + 8} L 540 ${y0 + 250} L ${x0 + W - 4} ${y0 + 8} Z`} fill="url(#solapa)" stroke="rgba(212,212,216,0.35)" strokeWidth={2} strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.55))" }} />
        <path d={lacre} fill="url(#cera)" style={{ filter: `drop-shadow(0 0 30px ${RC.esmeralda500}aa) drop-shadow(0 10px 14px rgba(0,0,0,0.6))` }} />
        <circle cx={540} cy={y0 + 250} r={66} fill="none" stroke="#064e3b" strokeOpacity={0.55} strokeWidth={4} />
        <circle cx={540} cy={y0 + 250} r={62} fill="none" stroke="#a7f3d0" strokeOpacity={0.35} strokeWidth={1.5} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: y0 + 250 - 42, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1,
        color: "#064e3b", textShadow: "0 1.5px 0 rgba(167,243,208,0.45)" }}>RC</div>
    </Estudio2>
  );
};

// ── I · Apertura: abanico de ofertas ─────────────────────────────────────────

export const OF1Apertura: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Tu próximo trabajo<br />puede salir de acá.</>}
      bajada={<>Directores y dueños publican ofertas. <B>Las ves todas, siempre.</B></>} />
    <Contraluz x={100} y={820} w={880} h={560} />
    <OfertaCard top={880} left={150} w={800} rot={-8} opacidad={0.55} fantasma alto={300} titulo="Closer high ticket" firma="Diego Sosa · Dueño · Ascend" iniciales="DS"
      boton={null} desc={null} chips={["Infoproductos", "Comisión · 15%", "Remoto"]} />
    <OfertaCard top={850} left={130} w={800} rot={7} opacidad={0.75} fantasma alto={300} titulo="Setter + closer inmobiliario" firma="Lucía Ferreira · Head of Sales" iniciales="LF"
      boton={null} desc={null} chips={["Inmobiliaria", "Fijo + comisión · 3%", "Híbrido"]} />
    <OfertaCard top={900} left={140} w={800} titulo="Closer para seguros" firma="Pablo Méndez · Director comercial" iniciales="PM"
      desc={null} chips={["Seguros", "Fijo", "Remoto", "Leads: los provee la empresa"]} />
  </Estudio2>
);

// ── II · Qué trae cada oferta (aprobada) ─────────────────────────────────────

export const OF2Ficha: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Cada oferta,<br />con letra chica<br />a la vista.</>} />
    <Contraluz x={120} y={640} w={840} h={420} />
    <OfertaCard top={722} escala={0.88} opacidad={0.3} fantasma />
    <OfertaCard top={750} escala={0.94} opacidad={0.6} fantasma />
    <OfertaCard top={782} />
    <Lupa cx={790} cy={1405} r={210} hx={500} hy={1286}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 5, color: RC.platino500 }}>FIJO + COMISIÓN</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 104, textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 190, lineHeight: 1, color: RC.crema, letterSpacing: -2 }}>
        10<span style={{ fontSize: 110, color: RC.esmeralda400 }}>%</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 316, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 22, color: RC.platino500 }}>por cada venta cerrada</div>
    </Lupa>
    <div style={{ position: "absolute", left: 96, width: 430, top: 1500, fontFamily: SANS, fontWeight: 500, fontSize: 27, lineHeight: 1.4, color: RC.platino500 }}>
      Pago, ticket, leads y rango mínimo, <span style={{ color: RC.crema, fontWeight: 700 }}>antes de postularte.</span>
    </div>
  </Estudio2>
);

// ── III · Postularse: formulario abierto + el CV detrás ──────────────────────

const HojaCV: React.FC<{ left: number; top: number; rot: number }> = ({ left, top, rot }) => (
  <div style={{ position: "absolute", left, top, width: 440, height: 622, transform: `rotate(${rot}deg)`, borderRadius: 10,
    background: "linear-gradient(180deg, #fafafa, #e7e7ea)", boxShadow: "0 40px 90px rgba(0,0,0,0.8)", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 130, background: "#18181b" }}>
      <div style={{ width: 70, height: 70, borderRadius: 35, background: "#3f3f46", margin: "36px auto 0" }} />
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 8, borderRadius: 4, background: "#3f3f46", margin: `${i ? 14 : 30}px 22px 0` }} />)}
      <div style={{ height: 8, width: 60, borderRadius: 4, background: RC.esmeralda500, margin: "30px 22px 0" }} />
    </div>
    <div style={{ position: "absolute", left: 160, right: 28, top: 38 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: "#18181b" }}>CURRÍCULUM</div>
      <div style={{ height: 3, width: 50, background: RC.esmeralda600, margin: "12px 0 24px" }} />
      {[1, 0.8, 0.9, 0.6, 0, 1, 0.85, 0.7, 0, 0.95, 0.75, 0.9, 0.5].map((w, i) =>
        <div key={i} style={{ height: w ? 9 : 18, width: `${w * 100}%`, borderRadius: 4, background: "#d4d4d8", marginBottom: 14 }} />)}
    </div>
  </div>
);

export const OF3Postular: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Postularte<br />es un botón.</>}
      bajada={<>Contale por qué encajás. <B>El director ve tu CV</B> junto a tu postulación.</>} />
    <Contraluz x={200} y={760} w={860} h={520} />
    <HojaCV left={560} top={690} rot={6} />
    <OfertaCard top={800} titulo="Closer para seguros" firma="Pablo Méndez · Director comercial" iniciales="PM" boton="Cerrar" desc={null}
      chips={["Seguros", "Fijo", "Remoto"]}>
      <div style={{ marginTop: 34 }}>
        <Campo>Vendí seguros de vida por teléfono dos años. Manejo la objeción de precio y cierro en la primera llamada.</Campo>
        <div style={{ marginTop: 28 }}><Boton primario>Enviar postulación</Boton></div>
      </div>
    </OfertaCard>
    <Cursor x={400} y={1498} />
  </Estudio2>
);

// ── IV · Oferta no abierta: el pedido de reunión ─────────────────────────────

export const OF4Reunion: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>¿No está abierta?<br />Igual tocás la puerta.</>}
      bajada={<>Pedís una reunión y contás el motivo. <B>El director decide.</B></>} />
    <OfertaCard top={800} opacidad={0.45} titulo="Closer high ticket" firma="Diego Sosa · Dueño · Ascend" iniciales="DS" abierta={false}
      boton="Pedir una reunión" desc={null} chips={["Infoproductos", "Comisión · 15%", "Remoto", "Rango Prospecto o más"]} />
    <Contraluz x={120} y={1040} w={860} h={520} />
    <div style={{ position: "absolute", left: 130, width: 860, top: 1130, transform: "rotate(-2.5deg)", borderRadius: 30, padding: 44,
      background: `linear-gradient(180deg, #1c1c20 0%, ${INK[900]} 100%)`, border: `1.5px solid ${RC.esmeralda500}66`,
      boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.07), 0 60px 120px rgba(0,0,0,0.85), 0 0 60px ${RC.esmeralda600}33` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Badge>Pendiente</Badge>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 25, color: RC.platino500 }}>Pedido de reunión · esperando respuesta</span>
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, lineHeight: 1.12, color: RC.crema, marginTop: 30 }}>
        “Cerré infoproductos todo el año pasado. Cuando reabran, me gustaría estar primero.”
      </div>
    </div>
  </Estudio2>
);

// ── V · Del otro lado: la bandeja del director y el chat ─────────────────────

const Onda: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, height: 46 }}>
    {[10, 22, 34, 18, 40, 28, 14, 36, 24, 44, 30, 16, 26, 38, 20, 12, 30, 22, 14, 8].map((h, i) =>
      <div key={i} style={{ width: 6, height: h, borderRadius: 3, background: i < 8 ? RC.esmeralda400 : "rgba(212,212,216,0.35)" }} />)}
  </div>
);

export const OF5Director: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Del otro lado,<br />te ven entero.</>}
      bajada={<>Tu rango, tus puntos y tu CV. <B>Si le cerrás, se abre el chat.</B></>} />
    <Contraluz x={100} y={760} w={880} h={480} />
    {/* bandeja: fila de application-inbox */}
    <div style={{ position: "absolute", left: 72, width: 936, top: 770, borderRadius: 34, padding: 44,
      background: `linear-gradient(180deg, #19191c 0%, ${INK[900]} 100%)`, border: `1.5px solid ${INK[700]}`,
      boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.06), 0 50px 110px rgba(0,0,0,0.75)" }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: 4, color: RC.platino500, textTransform: "uppercase" }}>
        Postulaciones y pedidos de reunión · 3 por responder
      </div>
      <div style={{ marginTop: 28, borderRadius: 22, border: `1.5px solid ${INK[700]}`, background: "rgba(30,30,33,0.5)", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: RC.crema }}>El Tanque</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 25, color: RC.platino500, marginTop: 6 }}>Contendiente · 480 pts · Postulación</div>
          </div>
          <Badge>Pendiente</Badge>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, lineHeight: 1.45, color: RC.crema, marginTop: 22 }}>
          Vendí seguros de vida por teléfono dos años. Cierro en la primera llamada.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
          <Boton>Ver currículum</Boton>
          <Boton primario>Aceptar</Boton>
          <Boton>Rechazar</Boton>
        </div>
      </div>
    </div>
    {/* hilo: Aceptar → chat */}
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <path d="M 505 1296 L 505 1340 Q 505 1370 535 1370 L 700 1370 Q 730 1370 730 1400 L 730 1420" fill="none" stroke={RC.esmeralda400} strokeWidth={2} />
      <circle cx={505} cy={1296} r={7} fill={RC.esmeralda400} />
    </svg>
    {/* chat que se abre */}
    <div style={{ position: "absolute", left: 300, width: 708, top: 1420, borderRadius: 30, padding: "28px 32px",
      background: `linear-gradient(180deg, #1c1c20 0%, ${INK[900]} 100%)`, border: `1.5px solid ${RC.esmeralda500}66`,
      boxShadow: `0 50px 110px rgba(0,0,0,0.85), 0 0 50px ${RC.esmeralda600}33` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Avatar ini="PM" size={64} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 20, borderRadius: 24, background: INK[800], padding: "16px 24px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: RC.esmeralda500, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: "15px solid #03140d", borderTop: "10px solid transparent", borderBottom: "10px solid transparent", marginLeft: 4 }} />
          </div>
          <Onda />
          <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: RC.platino500 }}>0:18</span>
        </div>
      </div>
    </div>
  </Estudio2>
);

// ── VI · Tu rango abre puertas ───────────────────────────────────────────────

const Fila: React.FC<{ titulo: string; rango: string; bloqueada?: boolean }> = ({ titulo, rango, bloqueada }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "30px 36px", borderRadius: 26,
    background: bloqueada ? "rgba(20,20,22,0.6)" : `linear-gradient(180deg, #19191c 0%, ${INK[900]} 100%)`,
    border: `1.5px solid ${bloqueada ? INK[800] : INK[700]}`, boxShadow: bloqueada ? undefined : "0 30px 70px rgba(0,0,0,0.6)" }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, textTransform: "uppercase", color: bloqueada ? "#71717a" : RC.crema }}>{titulo}</div>
      <div style={{ marginTop: 14 }}><Chip apagado={bloqueada}>{rango}</Chip></div>
    </div>
    {bloqueada ? (
      <svg width={44} height={52} viewBox="0 0 22 26"><rect x={2} y={11} width={18} height={14} rx={3} fill="#52525b" />
        <path d="M6 11 V7 a5 5 0 0 1 10 0 V11" fill="none" stroke="#52525b" strokeWidth={2.4} /></svg>
    ) : (
      <div style={{ width: 52, height: 52, borderRadius: 26, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={26} height={26} viewBox="0 0 26 26"><path d="M5 13.5 L10.5 19 L21 7.5" fill="none" stroke={RC.esmeralda400} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    )}
  </div>
);

export const OF6Rango: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Tu rango<br />abre puertas.</>}
      bajada={<>Cada oferta pide un rango mínimo. <B>Subí y se te abren más.</B></>} />
    <Contraluz x={240} y={640} w={600} h={420} o={0x77} />
    <Img src={staticFile("ring-closers/belts/contendiente.webp")} style={{ position: "absolute", left: 540 - 250, top: 590, width: 500,
      filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.8))" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: RC.platino500 }}>
      TU RANGO · <span style={{ color: RC.crema }}>CONTENDIENTE</span>
    </div>
    <div style={{ position: "absolute", left: 72, right: 72, top: 1095, display: "flex", flexDirection: "column", gap: 18 }}>
      <Fila titulo="Closer para seguros" rango="Rango Prospecto o más" />
      <Fila titulo="Closer para cuenta de SaaS B2B" rango="Rango Contendiente o más" />
      <Fila titulo="Closer high ticket" rango="Rango Campeón o más · tu rango todavía no llega" bloqueada />
    </div>
  </Estudio2>
);
