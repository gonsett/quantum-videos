import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { RC, MONO } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";
import { SANS, SERIF } from "./como-funciona";

/**
 * Destacada "Directores" (02/10/2026). Lenguaje DISTINTO a las anteriores:
 *  - "Qué es": Oswald + bokeh de estrellas · "Cómo funciona": vidrio + haz oblicuo + riel de pasos
 *  - "Ofertas": UI real plana sobre negro + un protagonista, titular serif grande arriba a la izquierda
 * Acá: LA MESA DEL DIRECTOR. Una superficie oscura con una lámpara cenital (cono de luz cálida-neutra), y
 * sobre ella piezas FÍSICAS: los carnets de socio reales de la app (metal guilloché por rango, el mismo
 * `public/carnet/metal-*.webp` de ring-closers), con sombra de contacto. Rótulo de expediente en mono,
 * titular en sans 800 con UNA palabra en serif itálica. Sin numeración. Se exportan con `remotion still`.
 */

const W0 = 430; // ancho de diseño del carnet en la app (viewBox del guilloché)
const HEX = "50,10 85,32 85,68 50,90 15,68 15,32";
const STAR = "M50,30 L54.7,43.53 L69.02,43.82 L57.61,52.47 L61.76,66.18 L50,58 L38.24,66.18 L42.39,52.47 L30.98,43.82 L45.3,43.53 Z";
const RANGOS = ["aficionado", "prospecto", "contendiente", "campeon", "leyenda"] as const;
const ETIQUETA: Record<string, string> = { aficionado: "Aficionado", prospecto: "Prospecto", contendiente: "Contendiente", campeon: "Campeón", leyenda: "Leyenda" };

// Paleta por tema, copiada de ring-closers/lib/member-theme.ts
const TEMA = {
  aficionado: { c1: "#0a1c33", c2: "#1d5a9c", c3: "#7dd3fc", c4: "#22d3ee" },
  prospecto: { c1: "#2b1206", c2: "#b4531a", c3: "#ffc078", c4: "#ff6b3d" },
  contendiente: { c1: "#150d38", c2: "#5b3fd6", c3: "#c4b5fd", c4: "#f0abfc" },
  campeon: { c1: "#2a0812", c2: "#a3173f", c3: "#ffd86b", c4: "#fb923c" },
  leyenda: { c1: "#0a0a1a", c2: "#4a2f9a", c3: "#f5f5ff", c4: "#ff7ad9" },
  director: { c1: "#032a20", c2: "#0e7a58", c3: "#6ee7b7", c4: "#a3e635" },
} as const;
type Tema = keyof typeof TEMA;

const mezcla = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

export type DatosCarnet = { tema: Tema; nombre: string; alias?: string; numero: string; pais: string; comunidad?: string; esquina?: "roja" | "azul" };

/** Frente del carnet de socio, calcado de components/member/member-card.tsx (proporción 430 × 271). */
export const Carnet: React.FC<{ d: DatosCarnet; ancho: number; brillo?: number }> = ({ d, ancho, brillo = 0.5 }) => {
  const s = ancho / W0, t = TEMA[d.tema], dir = d.tema === "director";
  const iRango = dir ? -1 : RANGOS.indexOf(d.tema as (typeof RANGOS)[number]);
  const chip = dir ? { txt: "Director", bg: mezcla("#10b981", 0.22), fg: "#a7f3d0" } : d.esquina === "roja" ? { txt: "Esquina roja", bg: "rgba(239,68,68,0.22)", fg: "#fecaca" } : d.esquina === "azul" ? { txt: "Esquina azul", bg: "rgba(59,130,246,0.24)", fg: "#bfdbfe" } : null;
  return (
    <div style={{ position: "relative", width: ancho, height: ancho * (271 / 430), borderRadius: 13 * s, overflow: "hidden", color: "#f8fafc",
      boxShadow: `inset 0 0 0 ${1.2 * s}px rgba(255,255,255,0.16), inset 0 ${1.5 * s}px 0 rgba(255,255,255,0.22)`,
      background: [
        `linear-gradient(90deg, transparent 30%, ${mezcla(t.c1, 0.34)} 100%)`,
        `radial-gradient(90% 85% at 100% 0%, ${mezcla(t.c3, 0.26)}, transparent 62%)`,
        `radial-gradient(85% 95% at 0% 100%, ${mezcla(t.c4, 0.22)}, transparent 64%)`,
        `url("${staticFile(`carnet/metal-${d.tema}.webp`)}") center / cover no-repeat`,
        `linear-gradient(158deg, ${t.c2} 0%, ${t.c1} 64%, #05050a 100%)`,
      ].join(",") }}>
      <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(115deg, transparent 0 ${14.6 * s}px, ${mezcla(t.c3, 0.11)} ${14.6 * s}px ${19.8 * s}px)`,
        maskImage: "linear-gradient(90deg, transparent 35%, black 100%)", WebkitMaskImage: "linear-gradient(90deg, transparent 35%, black 100%)" }} />
      <svg viewBox="0 0 100 100" style={{ position: "absolute", right: -40 * s, bottom: -46 * s, width: 230 * s, height: 230 * s, opacity: 0.1 }}>
        <polygon points={HEX} fill="none" stroke={t.c3} strokeWidth={5} /><path d={STAR} fill={t.c3} />
      </svg>
      {/* cabecera */}
      <div style={{ position: "absolute", left: 20 * s, right: 20 * s, top: 18 * s, display: "flex", alignItems: "center", gap: 10 * s }}>
        <div style={{ width: 34 * s, height: 34 * s, borderRadius: 9 * s, background: "#0b0b0d", display: "grid", placeItems: "center", boxShadow: `0 0 0 ${1 * s}px rgba(255,255,255,0.12)` }}>
          <svg viewBox="0 0 100 100" style={{ width: 26 * s, height: 26 * s }}><polygon points={HEX} fill="none" stroke="#10b981" strokeWidth={6} /><path d={STAR} fill="#10b981" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15 * s, letterSpacing: 0.2 * s, lineHeight: 1.05 }}>Ring Closers</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 7.6 * s, letterSpacing: 1.9 * s, textTransform: "uppercase", opacity: 0.72, marginTop: 2 * s }}>Carnet de socio</div>
        </div>
        {chip ? <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 7.8 * s, letterSpacing: 1.3 * s, textTransform: "uppercase", padding: `${5 * s}px ${9 * s}px`, borderRadius: 99, background: chip.bg, color: chip.fg, boxShadow: `inset 0 0 0 ${1 * s}px rgba(255,255,255,0.14)` }}>{chip.txt}</div> : null}
      </div>
      {/* cuerpo */}
      <div style={{ position: "absolute", left: 20 * s, right: 20 * s, top: 68 * s, display: "flex", gap: 16 * s }}>
        <div style={{ width: 80 * s, height: 100 * s, borderRadius: 9 * s, overflow: "hidden", background: `linear-gradient(160deg, ${mezcla(t.c3, 0.28)}, ${mezcla(t.c1, 0.9)})`, boxShadow: `inset 0 0 0 ${1.2 * s}px rgba(255,255,255,0.2)`, position: "relative" }}>
          <svg viewBox="0 0 60 80" style={{ position: "absolute", left: 8 * s, right: 8 * s, bottom: 0, width: 64 * s, height: 86 * s }}>
            <circle cx="30" cy="27" r="13" fill={mezcla(t.c3, 0.42)} /><path d="M4 80C4 58 16 49 30 49s26 9 26 31Z" fill={mezcla(t.c3, 0.42)} />
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", height: 100 * s }}>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 21 * s, lineHeight: 1.05, letterSpacing: -0.2 * s }}>{d.nombre}</div>
            <div style={{ width: 30 * s, height: 2.2 * s, borderRadius: 2, background: t.c3, margin: `${7 * s}px 0 ${6 * s}px` }} />
            {d.alias ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14 * s, opacity: 0.88 }}>{d.alias}</div> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 * s, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 * s, fontFamily: SANS, fontWeight: 800, fontSize: 10 * s, letterSpacing: 1.4 * s, textTransform: "uppercase", padding: `${5 * s}px ${9 * s}px`, borderRadius: 7 * s, background: "rgba(5,5,10,0.42)", boxShadow: `inset 0 0 0 ${1 * s}px ${mezcla(t.c3, 0.35)}` }}>
              {dir ? <><span style={{ width: 7 * s, height: 7 * s, transform: "rotate(45deg)", background: t.c3 }} />Dirección comercial</> : <>
                {ETIQUETA[d.tema]}
                <span style={{ display: "flex", gap: 1.5 * s }}>{RANGOS.map((r, i) => (
                  <svg key={r} viewBox="28 28 44 42" style={{ width: 9 * s, height: 9 * s }}><path d={STAR} fill={i <= iRango ? t.c3 : "rgba(255,255,255,0.18)"} /></svg>
                ))}</span>
              </>}
            </div>
            {d.comunidad ? <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 9 * s, opacity: 0.75 }}>{d.comunidad}</span> : null}
          </div>
        </div>
      </div>
      {/* banda */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 66 * s, padding: `${13 * s}px ${20 * s}px`, display: "flex", gap: 30 * s, background: "linear-gradient(180deg, rgba(5,5,10,0.15), rgba(5,5,10,0.55))", borderTop: `${1 * s}px solid rgba(255,255,255,0.1)` }}>
        {[["N.º socio", d.numero], ["Promoción", "2026"], ["País", d.pais]].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 7 * s, letterSpacing: 1.6 * s, textTransform: "uppercase", opacity: 0.6 }}>{k}</div>
            <div style={{ fontFamily: k === "N.º socio" ? MONO : SANS, fontWeight: 700, fontSize: 15 * s, marginTop: 3 * s, letterSpacing: k === "N.º socio" ? 1.5 * s : 0 }}>{v}</div>
          </div>
        ))}
      </div>
      {/* reflejo de la lámpara sobre el laminado */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(118deg, transparent 28%, rgba(255,255,255,${0.16 * brillo}) 42%, transparent 52%)` }} />
    </div>
  );
};

/** La mesa: superficie mate casi negra, lámpara cenital, polvo de luz y viñeta fuerte. */
export const Mesa: React.FC<{ children: React.ReactNode; luz?: { x: number; y: number } }> = ({ children, luz = { x: 540, y: 1000 } }) => (
  <AbsoluteFill style={{ background: "#060607", overflow: "hidden" }}>
    {/* textura de la mesa: grano fino de piedra */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
      <filter id="piedra"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={7} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.52  0 0 0 0.09 0" /></filter>
      <rect width={1080} height={1920} filter="url(#piedra)" />
    </svg>
    {/* charco de luz de la lámpara */}
    <div style={{ position: "absolute", left: luz.x - 720, top: luz.y - 640, width: 1440, height: 1280, borderRadius: "50%",
      background: "radial-gradient(ellipse at 50% 50%, rgba(236,232,222,0.16) 0%, rgba(236,232,222,0.07) 32%, rgba(236,232,222,0.02) 55%, transparent 70%)" }} />
    {children}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 62% at 50% 52%, transparent 50%, rgba(0,0,0,0.82) 100%)" }} />
    <Acabado />
  </AbsoluteFill>
);

/** Una pieza apoyada en la mesa: posición, giro en el plano y sombra de contacto + sombra larga suave. */
export const Apoyado: React.FC<{ x: number; y: number; giro?: number; alto?: number; children: React.ReactNode; z?: number }> = ({ x, y, giro = 0, alto = 0, children, z }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${giro}deg) translateY(${-alto}px)`, transformOrigin: "50% 50%", zIndex: z,
    filter: `drop-shadow(0 ${2 + alto * 0.15}px ${3 + alto * 0.1}px rgba(0,0,0,0.85)) drop-shadow(0 ${18 + alto * 0.8}px ${34 + alto * 0.8}px rgba(0,0,0,0.6))` }}>
    {children}
  </div>
);

/** Rótulo de expediente (mono) + titular sans 800 con una palabra en serif itálica. */
export const Rotulo: React.FC<{ seccion: string; titulo: React.ReactNode; top?: number }> = ({ seccion, titulo, top = 262 }) => (
  <div style={{ position: "absolute", left: 96, right: 96, top }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: MONO, fontSize: 21, letterSpacing: 5, color: RC.platino500, textTransform: "uppercase" }}>
      <span style={{ color: RC.esmeralda400 }}>●</span><span>Expediente · {seccion}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(161,161,170,0.28)" }} />
    </div>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, lineHeight: 1.04, letterSpacing: -1.6, color: RC.crema, marginTop: 34 }}>{titulo}</div>
  </div>
);

export const Ital: React.FC<{ children: React.ReactNode; verde?: boolean }> = ({ children, verde }) => (
  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, letterSpacing: 0, fontSize: "1.12em", color: verde ? RC.esmeralda400 : RC.crema }}>{children}</span>
);

export const Pie: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 1400 }) => (
  <div style={{ position: "absolute", left: 96, right: 96, top, fontFamily: SANS, fontWeight: 500, fontSize: 33, lineHeight: 1.42, color: RC.platino500 }}>{children}</div>
);
export const Fuerte: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: RC.crema, fontWeight: 700 }}>{children}</span>;

// ── 0 · Portada: el carnet de director sobre un abanico de carnets de closers ────────
export const DIRPortada: React.FC = () => (
  <Mesa luz={{ x: 540, y: 960 }}>
    {[
      { d: { tema: "aficionado", nombre: "Lucía Benítez", numero: "0187", pais: "Uruguay" }, x: 130, y: 700, g: -17 },
      { d: { tema: "contendiente", nombre: "Tomás Rivero", numero: "0122", pais: "Argentina" }, x: 170, y: 730, g: 10 },
      { d: { tema: "campeon", nombre: "Martina Rossi", numero: "0061", pais: "México" }, x: 140, y: 760, g: -5 },
    ].map((c, i) => (
      <Apoyado key={i} x={c.x} y={c.y} giro={c.g} alto={i * 6}><Carnet d={c.d as DatosCarnet} ancho={800} brillo={0.3} /></Apoyado>
    ))}
    <Apoyado x={150} y={800} giro={-1} alto={40}>
      <Carnet d={{ tema: "director", nombre: "Andrés Valdez", alias: "Head of Sales", numero: "0007", pais: "Uruguay" }} ancho={780} brillo={0.9} />
    </Apoyado>
  </Mesa>
);

// ── 1 · Apertura: los cinco rangos repartidos sobre la mesa, el campeón levantado ────────
export const DIR1Apertura: React.FC = () => (
  <Mesa luz={{ x: 560, y: 1010 }}>
    <Rotulo seccion="Directores" titulo={<>Contratá por lo que <Ital verde>hizo</Ital>,<br />no por lo que cuenta.</>} />
    {[
      { d: { tema: "aficionado", nombre: "Lucía Benítez", alias: "“La Zurda”", numero: "0187", pais: "Uruguay", esquina: "azul" }, x: -150, y: 690, g: -21 },
      { d: { tema: "prospecto", nombre: "Bruno Sosa", alias: "“El Rayo”", numero: "0143", pais: "Chile", esquina: "roja" }, x: 560, y: 650, g: 17 },
      { d: { tema: "contendiente", nombre: "Tomás Rivero", alias: "“Guardia Alta”", numero: "0122", pais: "Argentina", esquina: "azul" }, x: -170, y: 1000, g: 12 },
      { d: { tema: "leyenda", nombre: "Diego Ferrer", alias: "“El Eterno”", numero: "0009", pais: "España", esquina: "roja" }, x: 640, y: 990, g: -14 },
    ].map((c, i) => (
      <Apoyado key={i} x={c.x} y={c.y} giro={c.g}><Carnet d={c.d as DatosCarnet} ancho={600} brillo={0.25} /></Apoyado>
    ))}
    <Apoyado x={160} y={830} giro={-3} alto={46}>
      <Carnet d={{ tema: "campeon", nombre: "Martina Rossi", alias: "“La Fiera”", numero: "0061", pais: "México", comunidad: "Elite Closers", esquina: "roja" }} ancho={760} brillo={1} />
    </Apoyado>
    <Pie top={1430}>Cada closer llega con su <Fuerte>carnet</Fuerte>, sus <Fuerte>roleplays hechos</Fuerte> y la <Fuerte>nota que le pusieron sus rivales</Fuerte>.</Pie>
  </Mesa>
);

// ── Papel: ficha / hoja impresa marfil con fibra y luz de lámpara ────────
const TINTA = "#1d1d22", TINTA2 = "#6b6a66", VERDE_TINTA = "#0b7a55";
export const Papel: React.FC<{ w: number; h: number; children: React.ReactNode; tono?: string }> = ({ w, h, children, tono = "#efeae0" }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: 4, overflow: "hidden", color: TINTA,
    background: `linear-gradient(160deg, ${tono} 0%, #e3ddd0 70%, #d6cfc0 100%)` }}>
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
      <filter id={`fibra${w}`}><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={3} /><feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.37  0 0 0 0 0.3  0 0 0 0.12 0" /></filter>
      <rect width={w} height={h} filter={`url(#fibra${w})`} />
    </svg>
    {children}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 40%, rgba(0,0,0,0.10) 100%)" }} />
  </div>
);
const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; ls?: number; style?: React.CSSProperties }> = ({ children, size = 20, color = TINTA2, ls = 3, style }) => (
  <div style={{ fontFamily: MONO, fontSize: size, letterSpacing: ls, textTransform: "uppercase", color, ...style }}>{children}</div>
);
const Tilde: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg viewBox="0 0 30 30" style={{ width: size, height: size, flex: "none" }}><rect x="2" y="2" width="26" height="26" rx="4" fill="none" stroke={TINTA2} strokeWidth="2" />
    <path d="M7 16 L13 22 L25 6" fill="none" stroke={VERDE_TINTA} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const MARTINA: DatosCarnet = { tema: "campeon", nombre: "Martina Rossi", alias: "“La Fiera”", numero: "0061", pais: "México", comunidad: "Elite Closers", esquina: "roja" };
const DIEGO: DatosCarnet = { tema: "leyenda", nombre: "Diego Ferrer", alias: "“El Eterno”", numero: "0009", pais: "España", esquina: "roja" };
const TOMAS: DatosCarnet = { tema: "contendiente", nombre: "Tomás Rivero", alias: "“Guardia Alta”", numero: "0122", pais: "Argentina", esquina: "azul" };
const LUCIA: DatosCarnet = { tema: "aficionado", nombre: "Lucía Benítez", alias: "“La Zurda”", numero: "0187", pais: "Uruguay", esquina: "azul" };
const BRUNO: DatosCarnet = { tema: "prospecto", nombre: "Bruno Sosa", alias: "“El Rayo”", numero: "0143", pais: "Chile", esquina: "roja" };

// ── 2 · Directorio: la ficha de búsqueda + el carnet marcado con estrella y nota ────────
export const DIR2Directorio: React.FC = () => (
  <Mesa luz={{ x: 560, y: 1000 }}>
    <Rotulo seccion="Directorio" titulo={<>Filtrá como un <Ital verde>scout</Ital>.</>} />
    <Apoyado x={430} y={600} giro={7} alto={8}><Carnet d={TOMAS} ancho={560} brillo={0.3} /></Apoyado>
    <Apoyado x={470} y={880} giro={-4} alto={30}><Carnet d={DIEGO} ancho={590} brillo={0.8} /></Apoyado>
    <Apoyado x={935} y={850} giro={-4} alto={44}>
      <div style={{ width: 92, height: 92, borderRadius: "50%", display: "grid", placeItems: "center", background: "radial-gradient(circle at 35% 30%, #34d399, #065f46 75%)", boxShadow: "inset 0 2px 2px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.4)" }}>
        <svg viewBox="28 28 44 42" style={{ width: 52, height: 52 }}><path d={STAR} fill="#ecfdf5" /></svg>
      </div>
    </Apoyado>
    <Apoyado x={600} y={1180} giro={5} alto={14}>
      <Papel w={400} h={190} tono="#f3e7b5">
        <div style={{ padding: "22px 26px" }}>
          <Mono size={16} ls={3} color="#7a6a2e">Nota privada · solo vos</Mono>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 31, lineHeight: 1.25, marginTop: 12, color: "#2b2614" }}>Maneja la objeción de precio mejor que nadie. Llamarlo.</div>
        </div>
      </Papel>
    </Apoyado>
    <Apoyado x={90} y={640} giro={-5} alto={20}>
      <Papel w={470} h={660}>
        <div style={{ padding: "34px 34px" }}>
          <Mono size={17} ls={4}>Ficha de búsqueda</Mono>
          <div style={{ height: 2, background: TINTA, margin: "14px 0 6px" }} />
          {[["Rango mínimo", "Contendiente"], ["Tasa de cierre", "≥ 30 %"], ["Cash cerrado", "≥ USD 20.000"], ["Comunidad", "Elite Closers"], ["Formación", "High ticket"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 0", borderBottom: "1px solid rgba(29,29,34,0.18)" }}>
              <Tilde />
              <div>
                <Mono size={15} ls={3}>{k}</Mono>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, marginTop: 4 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
      </Papel>
    </Apoyado>
    <Pie top={1430}>Filtrás por <Fuerte>rango, tasa de cierre, cash, comunidad y formación</Fuerte>. Marcás con estrella y le dejás una nota que <Fuerte>solo ves vos</Fuerte>.</Pie>
  </Mesa>
);

// ── 3 · CV: la hoja A4 impresa con las cifras medidas, el carnet apoyado encima ────────
export const DIR3CV: React.FC = () => {
  const t = TEMA.campeon;
  return (
    <Mesa luz={{ x: 540, y: 980 }}>
      <Rotulo seccion="Currículum" titulo={<>Un CV que no se<br />puede <Ital verde>inflar</Ital>.</>} />
      <Apoyado x={150} y={560} giro={3} alto={10}>
        <Papel w={780} h={790}>
          <div style={{ height: 230, position: "relative", background: `linear-gradient(90deg, ${mezcla(t.c1, 0.55)}, transparent), url("${staticFile("carnet/metal-campeon.webp")}") center/cover`, color: "#fff" }}>
            <div style={{ position: "absolute", left: 50, top: 50, width: 120, height: 140, borderRadius: 6, background: `linear-gradient(160deg, ${mezcla(t.c3, 0.4)}, ${t.c1})`, boxShadow: "8px 8px 0 rgba(255,255,255,0.25)" }} />
            <div style={{ position: "absolute", left: 210, top: 54 }}>
              <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1 }}>Martina Rossi</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, opacity: 0.9, marginTop: 8 }}>“La Fiera” · Closer high ticket</div>
              <Mono size={16} color="#ffe7a8" ls={4} style={{ marginTop: 16 }}>Campeón ★★★★ · Elite Closers</Mono>
            </div>
          </div>
          <div style={{ padding: "40px 50px", display: "flex", gap: 40 }}>
            <div style={{ flex: 1.15 }}>
              <Mono size={16} ls={4}>Trayectoria medida</Mono>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px 22px", marginTop: 22 }}>
                {[["48", "roleplays"], ["4,6", "nota de rivales"], ["32 %", "tasa de cierre"], ["31 h", "en el ring"]].map(([n, k]) => (
                  <div key={k} style={{ borderLeft: `3px solid ${t.c2}`, paddingLeft: 14 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 58, lineHeight: 1 }}>{n}</div>
                    <Mono size={14} ls={2} style={{ marginTop: 6 }}>{k}</Mono>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.45, color: TINTA2, marginTop: 30 }}>Registrado por Ring Closers. Los cierres son simulados, no ventas reales.</div>
            </div>
            <div style={{ flex: 1, background: mezcla(t.c2, 0.08), padding: "20px 22px", borderRadius: 4 }}>
              <Mono size={16} ls={4}>Trayectoria</Mono>
              {[["Senior closer", "2024 — hoy"], ["Setter", "2022 — 2024"]].map(([p, f]) => (
                <div key={p} style={{ marginTop: 18 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24 }}>{p}</div>
                  <div style={{ fontFamily: SANS, fontSize: 18, color: TINTA2 }}>{f}</div>
                </div>
              ))}
            </div>
          </div>
        </Papel>
      </Apoyado>
      <Apoyado x={20} y={1170} giro={-8} alto={40}><Carnet d={MARTINA} ancho={360} brillo={0.9} /></Apoyado>
      <Pie top={1430}>Roleplays, nota de rivales y tasa de cierre las <Fuerte>registra Ring Closers</Fuerte>. Una hoja A4 que bajás en PDF.</Pie>
    </Mesa>
  );
};

// ── 4 · Oferta: la oferta impresa con el sello de rango mínimo ────────
export const DIR4Oferta: React.FC = () => (
  <Mesa luz={{ x: 520, y: 1000 }}>
    <Rotulo seccion="Ofertas" titulo={<>Publicá la oferta.<br />Se postula <Ital verde>quien da la talla</Ital>.</>} />
    <Apoyado x={640} y={1150} giro={14} alto={0}>
      <div style={{ opacity: 0.6, filter: "saturate(0.5) brightness(0.7)" }}><Carnet d={LUCIA} ancho={360} brillo={0.1} /></div>
    </Apoyado>
    <Apoyado x={150} y={620} giro={-3} alto={22}>
      <div style={{ position: "relative", width: 780, height: 720, borderRadius: 10, overflow: "hidden", color: RC.crema,
        background: "linear-gradient(160deg, #1b1c1f, #0d0e10 70%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
        <div style={{ padding: "46px 52px" }}>
          <Mono size={17} ls={5} color={RC.esmeralda400}>Oferta · Closer high ticket</Mono>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 54, marginTop: 14, lineHeight: 1.08 }}>Mentoría de inversión</div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.14)", margin: "30px 0 8px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 40 }}>
            {[["Rubro", "Educación online"], ["Pago", "Comisión"], ["Comisión", "12 %"], ["Ticket", "USD 3.000"], ["Modalidad", "Remoto"], ["Leads", "Calientes, agendados"]].map(([k, v]) => (
              <div key={k} style={{ padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <Mono size={15} ls={3} color={RC.platino500}>{k}</Mono>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, marginTop: 6 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, transparent 30%, rgba(255,255,255,0.06) 44%, transparent 55%)" }} />
      </div>
    </Apoyado>
    <div style={{ position: "absolute", left: 470, top: 1200, transform: "rotate(-12deg)", border: `5px solid ${mezcla("#10b981", 0.85)}`, borderRadius: 14, padding: "14px 24px", color: mezcla("#34d399", 0.92), textAlign: "center",
      maskImage: "radial-gradient(circle at 30% 40%, black 55%, rgba(0,0,0,0.7) 80%)", WebkitMaskImage: "radial-gradient(circle at 30% 40%, black 55%, rgba(0,0,0,0.7) 80%)" }}>
      <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 5 }}>RANGO MÍNIMO</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 2, marginTop: 2 }}>CONTENDIENTE</div>
    </div>
    <Pie top={1430}>Rubro, pago, comisión, ticket, modalidad y leads. Si pedís <Fuerte>Contendiente</Fuerte>, un Aficionado <Fuerte>no puede postularse</Fuerte>.</Pie>
  </Mesa>
);

// ── 5 · Pipeline: carriles grabados en la mesa, un carnet por etapa ────────
export const DIR5Pipeline: React.FC = () => {
  const filas: { etapa: string; c: DatosCarnet[]; on?: boolean }[] = [
    { etapa: "Descubierto", c: [LUCIA] },
    { etapa: "Contactado", c: [TOMAS] },
    { etapa: "En charla", c: [DIEGO] },
    { etapa: "Oferta", c: [] },
    { etapa: "Contratado", c: [MARTINA], on: true },
  ];
  return (
    <Mesa luz={{ x: 560, y: 1000 }}>
      <Rotulo seccion="Pipeline" titulo={<>El seguimiento<br />se <Ital verde>mueve solo</Ital>.</>} />
      {filas.map((f, i) => {
        const y = 600 + i * 158;
        return (
          <React.Fragment key={f.etapa}>
            <div style={{ position: "absolute", left: 96, right: 96, top: y + 140, height: 1, background: "rgba(161,161,170,0.18)" }} />
            <div style={{ position: "absolute", left: 96, top: y + 52, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: f.on ? RC.esmeralda400 : "rgba(161,161,170,0.5)" }} />
              <Mono size={21} ls={4} color={f.on ? RC.esmeralda400 : RC.platino500}>{f.etapa}</Mono>
            </div>
            {f.c.map((c, j) => (
              <Apoyado key={j} x={450 + j * 250} y={y + 6} giro={(i + j) % 2 ? 3 : -3} alto={f.on ? 26 : 4}>
                <Carnet d={c} ancho={204} brillo={f.on ? 0.9 : 0.25} />
              </Apoyado>
            ))}
          </React.Fragment>
        );
      })}
      <Apoyado x={700} y={1084} giro={-4} alto={34}><Carnet d={BRUNO} ancho={204} brillo={0.8} /></Apoyado>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={700} y={922} width={204} height={128} rx={10} fill="none" stroke="rgba(161,161,170,0.4)" strokeWidth={2} strokeDasharray="6 8" />
        <path d="M 802 1052 L 802 1072 M 794 1064 L 802 1074 L 810 1064" fill="none" stroke={RC.esmeralda400} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Pie top={1430}>Seguís, proponés, se postula, acepta: <Fuerte>cada carnet avanza de etapa</Fuerte> sin que cargues nada a mano.</Pie>
    </Mesa>
  );
};

// ── 6 · Mi equipo + alerta guardada ────────
export const DIR6Equipo: React.FC = () => (
  <Mesa luz={{ x: 540, y: 1000 }}>
    <Rotulo seccion="Mi equipo" titulo={<>Tu equipo, <Ital verde>en orden</Ital>.<br />Y un aviso si aparece otro.</>} />
    {[MARTINA, DIEGO, TOMAS].map((c, i) => (
      <Apoyado key={i} x={96 + i * 22} y={590 + i * 150} alto={8 + i * 4}><Carnet d={c} ancho={470} brillo={0.4} /></Apoyado>
    ))}
    <Apoyado x={560} y={760} giro={4} alto={30}>
      <Papel w={440} h={560}>
        <div style={{ padding: "34px 34px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 12, background: VERDE_TINTA }} />
            <Mono size={17} ls={4} color={VERDE_TINTA}>Alerta guardada</Mono>
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, lineHeight: 1.1, marginTop: 20 }}>2 closers nuevos cumplen tu búsqueda</div>
          <div style={{ height: 1, background: "rgba(29,29,34,0.25)", margin: "26px 0 18px" }} />
          {[["Rango", "Contendiente o más"], ["Tasa de cierre", "≥ 30 %"], ["Comunidad", "Elite Closers"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <Mono size={15} ls={2}>{k}</Mono>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22 }}>{v}</div>
            </div>
          ))}
          <Mono size={14} ls={3} style={{ marginTop: 22 }}>Por mail y en la app · cada semana</Mono>
        </div>
      </Papel>
    </Apoyado>
    <Pie top={1430}>Los closers que sumaste, en un solo lugar. Guardás una búsqueda y <Fuerte>cada semana te avisamos</Fuerte> si entró alguien que la cumple.</Pie>
  </Mesa>
);

// ── 7 · Cierre: el carnet de director solo, la invitación ────────
export const DIR7Cierre: React.FC = () => (
  <Mesa luz={{ x: 540, y: 960 }}>
    <Rotulo seccion="Tu lugar" titulo={<>Entrá como <Ital verde>director</Ital>.</>} />
    <Apoyado x={130} y={720} giro={-4} alto={50}>
      <Carnet d={{ tema: "director", nombre: "Tu nombre", alias: "Tu empresa", numero: "00··", pais: "Tu país" }} ancho={820} brillo={1} />
    </Apoyado>
    <div style={{ position: "absolute", left: 96, right: 96, top: 1340, display: "flex", alignItems: "center", gap: 22 }}>
      {["Entrá con Google", "Elegí “Busco closers”"].map((s, i) => (
        <React.Fragment key={s}>
          {i ? <div style={{ flex: "none", width: 40, height: 1, background: RC.platino500 }} /> : null}
          <div style={{ padding: "18px 26px", borderRadius: 999, border: `1.5px solid ${i ? RC.esmeralda400 : "rgba(161,161,170,0.45)"}`, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: i ? RC.esmeralda400 : RC.crema }}>{s}</div>
        </React.Fragment>
      ))}
    </div>
    <Pie top={1450}>Tu carnet de director te espera adentro. <Fuerte>Link en el perfil.</Fuerte></Pie>
  </Mesa>
);
