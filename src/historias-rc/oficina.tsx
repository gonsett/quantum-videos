// Destacada "Oficina 3D" (10/10/2026): acompaña al video Actualizaciones RC #1.
// Misma estética (negro, foco blanco, un solo esmeralda, Inter Tight + Instrument Serif itálica) pero otra puesta:
// "el plano" — la oficina dibujada como planta de arquitecto (muros, puertas con arco, cotas, rótulos de sala)
// y cada lámina entra a un ambiente distinto. Los estados viven solo en los anillos chicos. Todo dato es inventado.
import React from "react";
import { AbsoluteFill } from "remotion";
import { TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO } from "../ring-closers/tema";

const V = "#10b981", V4 = "#34d399", V3 = "#6ee7b7";
const EST = { llamada: "#f43f5e", reunion: "#60a5fa", roleplay: "#f59e0b", libre: "#10b981", ausente: "#71717a" } as const;
const MURO = "rgba(228,228,231,0.62)", MUEBLE = "rgba(244,244,245,0.3)", ROT = "rgba(212,212,216,0.6)";

// ---------- fondo común ----------
const Grano: React.FC = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "screen" }}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" /></filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

const Fondo: React.FC<{ children: React.ReactNode; n: number; cartela?: string; aviso?: boolean }> = ({ children, n, cartela, aviso = true }) => (
  <AbsoluteFill style={{ background: "#060607", overflow: "hidden", fontFamily: TIGHT }}>
    <div style={{ position: "absolute", left: -200, right: -200, top: -500, height: 1500, background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.085), transparent 62%)" }} />
    {/* papel de plano: cuadrícula de 1 px que se apaga hacia los bordes */}
    <div style={{ position: "absolute", inset: 0, opacity: 0.9,
      backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
      backgroundSize: "60px 60px", WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)" }} />
    {children}
    <div style={{ position: "absolute", left: 90, right: 90, top: 210, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: "rgba(212,212,216,0.75)" }}>
      <span><span style={{ color: V4 }}>●</span>&nbsp; OFICINA 3D</span>
      <span>PLANO {String(n).padStart(2, "0")} / 07</span>
    </div>
    {cartela && (
      <div style={{ position: "absolute", left: 90, right: 90, top: 262, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02))" }}>
        <div style={{ position: "absolute", right: 0, top: 14, fontFamily: MONO, fontSize: 16, letterSpacing: "0.28em", color: "rgba(161,161,170,0.7)" }}>{aviso ? cartela.split(" · ").slice(0, 2).join(" · ") : cartela}</div>
        {aviso && <div style={{ position: "absolute", left: 0, top: 13, fontFamily: MONO, fontSize: 16, letterSpacing: "0.2em", color: V3 }}>◆ ESTO ES EL PLANO · EN LA APP ES 3D</div>}
      </div>
    )}
    <Grano />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55))" }} />
  </AbsoluteFill>
);

// ---------- texto ----------
const Ac: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.18em", letterSpacing: "-0.02em", color: V, textShadow: "0 0 50px rgba(16,185,129,0.45)" }}>{children}</span>
);
const Titular: React.FC<{ children: React.ReactNode; top: number; tam?: number; sub?: string }> = ({ children, top, tam = 116, sub }) => (
  <div style={{ position: "absolute", left: 90, right: 70, top }}>
    <div style={{ color: "#f4f4f5", fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.02 }}>{children}</div>
    {sub && <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 22, letterSpacing: "0.24em", color: "rgba(161,161,170,0.95)", lineHeight: 1.65, whiteSpace: "pre-line" }}>{sub}</div>}
  </div>
);
const Abs: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, ...style }}>{children}</div>
);

// ---------- el plano (coordenadas 1400 × 1400) ----------
type P = { x: number; y: number; c: string; txt?: string; lado?: "d" | "i" | "a" | "b" };
const Persona: React.FC<P & { e: number }> = ({ x, y, c, txt, lado = "d", e }) => {
  const w = txt ? txt.length * 10.4 * e + 30 * e : 0, h = 34 * e;
  const lx = lado === "d" ? x + 34 * e : lado === "i" ? x - 34 * e - w : x - w / 2;
  const ly = lado === "a" ? y - 40 * e - h : lado === "b" ? y + 40 * e : y - h / 2;
  return (
    <g>
      <circle cx={x} cy={y} r={40 * e} fill={c} opacity={0.13} />
      <circle cx={x} cy={y} r={21 * e} fill="#0b0b0d" stroke={c} strokeWidth={3.5 * e} />
      <circle cx={x} cy={y} r={8.5 * e} fill="#f4f4f5" />
      {txt && (
        <g>
          <rect x={lx} y={ly} width={w} height={h} rx={h / 2} fill="rgba(14,14,17,0.94)" stroke="rgba(255,255,255,0.16)" strokeWidth={1.2 * e} />
          <circle cx={lx + 16 * e} cy={ly + h / 2} r={4.5 * e} fill={c} />
          <text x={lx + 28 * e} y={ly + h / 2 + 5.6 * e} fill="#e4e4e7" style={{ fontFamily: MONO, fontSize: 16 * e, letterSpacing: 0.6 * e, fontWeight: 500 }}>{txt}</text>
        </g>
      )}
    </g>
  );
};

// muro con huecos de puerta: [x1,y1,x2,y2, huecos[]] — los huecos son tramos a lo largo del muro
type Muro = [number, number, number, number, [number, number][]?];
const MUROS: Muro[] = [
  [40, 40, 1360, 40], [1360, 40, 1360, 1360], [1360, 1360, 40, 1360], [40, 1360, 40, 40],
  [860, 40, 860, 420, [[300, 370]]], [860, 420, 1360, 420],
  [860, 760, 1360, 760, [[1050, 1130]]],
  [40, 860, 1360, 860, [[290, 370], [960, 1040]]],
  [700, 860, 700, 1360],
];
const VIDRIOS: [number, number, number, number][] = [[860, 420, 860, 760], [40, 760, 380, 760], [520, 760, 860, 760]];
const segmentos = ([x1, y1, x2, y2, hu = []]: Muro) => {
  const hor = y1 === y2, a = hor ? Math.min(x1, x2) : Math.min(y1, y2), b = hor ? Math.max(x1, x2) : Math.max(y1, y2);
  const cortes: [number, number][] = []; let p = a;
  [...hu].sort((m, n) => m[0] - n[0]).forEach(([s, t]) => { cortes.push([p, s]); p = t; });
  cortes.push([p, b]);
  return cortes.map(([s, t]) => (hor ? [s, y1, t, y1] : [x1, s, x1, t]));
};
// arcos de puerta (barrido de la hoja, punteado)
const PUERTAS = ["M860 300 A70 70 0 0 1 930 370", "M1050 760 A80 80 0 0 0 1130 840", "M290 860 A80 80 0 0 0 370 940", "M960 860 A80 80 0 0 0 1040 940"];
const PUESTOS = [110, 350, 590].flatMap((x) => [130, 340, 550].map((y) => ({ x, y })));

type Capa = "todo" | "piso" | "muebles" | "muros" | "personas";
const Plano: React.FC<{ vb: [number, number, number, number]; w: number; personas?: P[]; e?: number; rotulos?: boolean; cotas?: boolean; foco?: [number, number, number, number]; fundido?: boolean; capa?: Capa; ondas?: [number, number] }> = ({ vb, w, personas = [], e = 1, rotulos = true, cotas = true, foco, fundido, capa = "todo", ondas }) => {
  const ver = (c: Capa) => capa === "todo" || capa === c;
  const h = (w * vb[3]) / vb[2];
  const Rot = ({ x, y, t, s }: { x: number; y: number; t: string; s?: string }) => (
    <g>
      <text x={x} y={y} fill={ROT} style={{ fontFamily: MONO, fontSize: 17, letterSpacing: 4, fontWeight: 500 }}>{t}</text>
      {s && <text x={x} y={y + 26} fill="rgba(161,161,170,0.5)" style={{ fontFamily: MONO, fontSize: 13, letterSpacing: 3 }}>{s}</text>}
    </g>
  );
  return (
    <svg width={w} height={h} viewBox={vb.join(" ")} style={{ overflow: "hidden", ...(fundido ? { WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 55%, transparent 100%)" } : {}) }}>
      <defs>
        <filter id="neon" x="-20%" y="-400%" width="140%" height="900%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
      </defs>
      {ver("piso") && <>
      {/* piso */}
      <rect x={40} y={40} width={1320} height={1320} fill={capa === "piso" ? "rgba(22,22,25,0.96)" : "rgba(255,255,255,0.018)"} />
      {foco && <rect x={foco[0]} y={foco[1]} width={foco[2]} height={foco[3]} fill="rgba(16,185,129,0.05)" />}
      {/* pasillo con neón esmeralda */}
      <line x1={70} y1={810} x2={1330} y2={810} stroke={V} strokeWidth={14} opacity={0.55} filter="url(#neon)" />
      <line x1={70} y1={810} x2={1330} y2={810} stroke={V3} strokeWidth={2.5} />
      {capa === "piso" && personas.map((q, i) => <ellipse key={i} cx={q.x} cy={q.y + 6} rx={30 * e} ry={30 * e} fill="rgba(0,0,0,0.55)" stroke={q.c} strokeOpacity={0.35} strokeWidth={1.5} />)}
      </>}
      {ver("muebles") && <>
      {/* sala de ventas: 9 puestos */}
      {PUESTOS.map(({ x, y }, i) => (
        <g key={i} stroke={MUEBLE} strokeWidth={1.5} fill="rgba(255,255,255,0.03)">
          <rect x={x} y={y} width={190} height={74} rx={6} />
          <line x1={x + 60} y1={y + 14} x2={x + 130} y2={y + 14} strokeWidth={4} stroke="rgba(244,244,245,0.4)" />
          <rect x={x + 70} y={y + 34} width={50} height={16} rx={3} />
          <circle cx={x + 95} cy={y + 112} r={24} />
        </g>
      ))}
      {/* dirección */}
      <g stroke={MUEBLE} strokeWidth={1.5} fill="rgba(255,255,255,0.03)">
        <rect x={980} y={150} width={250} height={92} rx={8} />
        <circle cx={1105} cy={290} r={28} />
        <rect x={1296} y={80} width={36} height={290} rx={4} />
        {[120, 190, 260, 330].map((y) => <circle key={y} cx={1314} cy={y} r={9} />)}
        <circle cx={920} cy={95} r={26} /><circle cx={920} cy={95} r={12} />
      </g>
      {/* reuniones: mesa redonda y 6 sillas */}
      <g stroke={MUEBLE} strokeWidth={1.5} fill="rgba(255,255,255,0.03)">
        <circle cx={1110} cy={590} r={92} />
        {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={1110 + 138 * Math.cos((a * Math.PI) / 180)} cy={590 + 118 * Math.sin((a * Math.PI) / 180)} r={22} />)}
        <rect x={1320} y={480} width={14} height={220} rx={3} />
      </g>
      {/* recreo: ping-pong, sillón en L, mesa ratona, planta */}
      <g stroke={MUEBLE} strokeWidth={1.5} fill="rgba(255,255,255,0.03)">
        <rect x={120} y={960} width={320} height={170} rx={4} />
        <line x1={280} y1={950} x2={280} y2={1140} strokeDasharray="5 5" />
        <line x1={120} y1={1045} x2={440} y2={1045} strokeWidth={0.8} />
        <path d="M80 1200 h360 v60 h-300 v80 h-60 z" />
        <rect x={190} y={1205} width={120} height={0} />
        <rect x={500} y={1190} width={110} height={70} rx={6} />
        <circle cx={640} cy={920} r={26} /><circle cx={640} cy={920} r={11} />
      </g>
      {/* gimnasio: rack, banco, colchonetas, mancuernas */}
      <g stroke={MUEBLE} strokeWidth={1.5} fill="rgba(255,255,255,0.03)">
        <rect x={760} y={930} width={70} height={360} rx={4} />
        {[970, 1030, 1090, 1150, 1210, 1260].map((y) => <line key={y} x1={768} y1={y} x2={822} y2={y} />)}
        <rect x={930} y={990} width={220} height={60} rx={14} />
        <rect x={1000} y={970} width={80} height={100} rx={8} fill="none" />
        <rect x={900} y={1140} width={160} height={180} rx={6} strokeDasharray="8 6" />
        <rect x={1100} y={1140} width={160} height={180} rx={6} strokeDasharray="8 6" />
        {[1210, 1260, 1310].map((x) => <g key={x}><circle cx={x} cy={940} r={11} /><circle cx={x} cy={1000} r={11} /></g>)}
      </g>
      </>}
      {ver("muros") && <>
      {/* muros y vidrios */}
      {MUROS.flatMap(segmentos).map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={MURO} strokeWidth={7} strokeLinecap="square" />)}
      {VIDRIOS.map(([a, b, c, d], i) => (
        <g key={i} stroke="rgba(167,243,208,0.45)" strokeWidth={1.5}>
          <line x1={a - (a === c ? 4 : 0)} y1={b - (b === d ? 4 : 0)} x2={c - (a === c ? 4 : 0)} y2={d - (b === d ? 4 : 0)} />
          <line x1={a + (a === c ? 4 : 0)} y1={b + (b === d ? 4 : 0)} x2={c + (a === c ? 4 : 0)} y2={d + (b === d ? 4 : 0)} />
        </g>
      ))}
      {PUERTAS.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(244,244,245,0.35)" strokeWidth={1.3} strokeDasharray="4 5" />)}
      </>}
      {ver("piso") && rotulos && (
        <g>
          <Rot x={70} y={710} t="SALA DE VENTAS" s="9 PUESTOS" />
          <Rot x={890} y={380} t="DIRECCIÓN" />
          <Rot x={890} y={720} t="REUNIONES" s="VIDRIO · 6" />
          <Rot x={70} y={845} t="PASILLO" />
          <Rot x={70} y={1320} t="RECREO" />
          <Rot x={730} y={1330} t="GIMNASIO" />
        </g>
      )}
      {ver("piso") && cotas && (
        <g stroke="rgba(161,161,170,0.55)" strokeWidth={1.2} fill="rgba(161,161,170,0.75)">
          <line x1={40} y1={4} x2={1360} y2={4} />
          <line x1={40} y1={-8} x2={40} y2={16} /><line x1={1360} y1={-8} x2={1360} y2={16} /><line x1={860} y1={-4} x2={860} y2={12} />
          <text x={420} y={-10} stroke="none" style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 3 }}>14,30 m</text>
          <text x={1060} y={-10} stroke="none" style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 3 }}>8,70 m</text>
        </g>
      )}
      {ver("personas") && ondas && [70, 110, 155].map((r, i) => <circle key={r} cx={ondas[0]} cy={ondas[1]} r={r} fill="none" stroke={V4} strokeWidth={2.2} opacity={0.75 - i * 0.2} />)}
      {ver("personas") && personas.map((p, i) => <Persona key={i} {...p} e={e} />)}
    </svg>
  );
};

// el plano levantado: piso, muebles con espesor, muros extruidos y la gente flotando sobre su puesto.
// Son capas del mismo SVG separadas en Z (sin filtros en el contenedor: aplanarían el 3D).
type P3 = { vb: [number, number, number, number]; w: number; personas?: P[]; e?: number; rx: number; rz?: number; alto?: number; rotulos?: boolean; ondas?: [number, number]; fundido?: boolean };
const Plano3D: React.FC<P3> = ({ vb, w, personas = [], e = 1, rx, rz = 0, alto = 70, rotulos = true, ondas, fundido }) => {
  const h = (w * vb[3]) / vb[2], k = w / vb[2];
  const capa = (c: Capa, z: number, op = 1, key?: React.Key) => (
    <div key={key} style={{ position: "absolute", inset: 0, transform: `translateZ(${z * k}px)`, opacity: op }}>
      <Plano vb={vb} w={w} personas={personas} e={e} capa={c} rotulos={rotulos} cotas={false} ondas={ondas} />
    </div>
  );
  const pasos = 16;
  return (
    <div style={{ width: w, height: h, ...(fundido ? { WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 55%, transparent 100%)" } : {}) }}>
    <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d", transform: `perspective(2600px) rotateX(${rx}deg) rotateZ(${rz}deg)` }}>
      {capa("piso", 0)}
      {[0, 1, 2, 3, 4].map((i) => capa("muebles", (i / 4) * alto * 0.32, i === 4 ? 1 : 0.35, `m${i}`))}
      {Array.from({ length: pasos + 1 }, (_, i) => capa("muros", (i / pasos) * alto, i === pasos ? 1 : 0.22, `w${i}`))}
      {capa("personas", alto * 0.62)}
    </div>
    </div>
  );
};

// el equipo de "Norte Ventas" (inventado)
const EQUIPO: P[] = [
  { x: 205, y: 242, c: EST.llamada, txt: "MICA · LLAMADA · 12:40", lado: "b" },
  { x: 445, y: 242, c: EST.libre },
  { x: 685, y: 242, c: EST.roleplay },
  { x: 205, y: 452, c: EST.libre },
  { x: 445, y: 452, c: EST.llamada, txt: "TOMI · LLAMADA · 04:12", lado: "b" },
  { x: 685, y: 452, c: EST.ausente },
  { x: 205, y: 662, c: EST.llamada },
  { x: 445, y: 662, c: EST.libre },
  { x: 685, y: 662, c: EST.roleplay, txt: "LU · ROLEPLAY · 18:05", lado: "b" },
  { x: 1105, y: 290, c: EST.reunion },
  { x: 1248, y: 590, c: EST.reunion }, { x: 1041, y: 488, c: EST.reunion }, { x: 1041, y: 692, c: EST.reunion },
  { x: 360, y: 1290, c: EST.ausente },
  { x: 990, y: 1020, c: EST.libre },
];

// ---------- piezas de vidrio ----------
const Vidrio: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; luz?: boolean }> = ({ children, style, luz }) => (
  <div style={{ position: "relative", borderRadius: 30, boxSizing: "border-box",
    background: "linear-gradient(160deg, rgba(36,36,40,0.97), rgba(13,13,16,0.97))",
    border: `1.5px solid ${luz ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.13)"}`,
    boxShadow: `0 60px 120px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.1)${luz ? ", 0 0 90px rgba(16,185,129,0.18)" : ""}`, ...style }}>
    <div style={{ position: "absolute", left: 50, right: 50, top: 0, height: 2, background: `linear-gradient(90deg, transparent, rgba(110,231,183,${luz ? 0.75 : 0.3}), transparent)` }} />
    {children}
  </div>
);
const Mono: React.FC<{ children: React.ReactNode; c?: string; s?: number; style?: React.CSSProperties }> = ({ children, c = "#a1a1aa", s = 18, style }) => (
  <div style={{ fontFamily: MONO, fontSize: s, letterSpacing: "0.24em", color: c, fontWeight: 500, ...style }}>{children}</div>
);
const Punto: React.FC<{ c: string; t?: number }> = ({ c, t = 14 }) => (
  <span style={{ display: "inline-block", width: t, height: t, borderRadius: t, background: c, boxShadow: `0 0 ${t}px ${c}`, flexShrink: 0 }} />
);
const Inicial: React.FC<{ l: string; c: string; t?: number }> = ({ l, c, t = 64 }) => (
  <div style={{ width: t, height: t, borderRadius: t, flexShrink: 0, border: `3px solid ${c}`, background: "radial-gradient(circle at 40% 30%, #2a2a30, #0e0e11)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: t * 0.4, color: "#f4f4f5", boxShadow: `0 0 26px ${c}55` }}>{l}</div>
);
// línea de llamada de arquitecto: del punto al rótulo, con quiebre
const Llamada: React.FC<{ d: string; fin: [number, number] }> = ({ d, fin }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <path d={d} fill="none" stroke="rgba(110,231,183,0.75)" strokeWidth={1.6} />
    <circle cx={fin[0]} cy={fin[1]} r={5} fill={V4} />
  </svg>
);
const Icono: React.FC<{ d: string; t?: number; c?: string }> = ({ d, t = 30, c = "#e4e4e7" }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const IC = {
  tel: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  chat: "M4 5h16v11H9l-5 4z",
  nota: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5",
  mic: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3M5 11a7 7 0 0 0 14 0M12 18v3",
  cam: "M3 7h12v10H3zM15 10l6-3v10l-6-3",
  pantalla: "M3 4h18v12H3zM8 20h8M12 16v4",
  vol: "M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8",
  link: "M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1",
};

// ---------- láminas ----------
export const OF0Portada: React.FC = () => (
  <Fondo n={0}>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, height: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: "perspective(2200px) rotateX(50deg) rotateZ(-32deg) scale(1.02)", filter: "drop-shadow(0 50px 70px rgba(0,0,0,0.7))" }}>
        <Plano vb={[-20, -40, 1440, 1440]} w={900} personas={EQUIPO.map(({ txt, ...p }) => p)} e={1.15} cotas={false} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 90, top: 330, display: "flex", alignItems: "center", gap: 14, height: 54, padding: "0 24px", borderRadius: 27, background: "rgba(6,40,30,0.85)", border: "1.5px solid rgba(52,211,153,0.6)", boxShadow: "0 0 40px rgba(16,185,129,0.3)" }}>
      <Punto c={V4} t={14} /><Mono c={V3} s={20}>EN VIVO · 15 CONECTADOS</Mono>
    </div>
    <div style={{ position: "absolute", left: 90, top: 404, display: "flex", alignItems: "center", height: 44, padding: "0 20px", borderRadius: 22, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)" }}>
      <Mono c="rgba(228,228,231,0.85)" s={18}>◆ ESTO ES EL PLANO · EN LA APP, LA OFICINA ES <span style={{ color: V3 }}>3D</span></Mono>
    </div>
    <Titular top={1290} tam={134} sub={"NOVEDAD EN RING CLOSERS\nOFICINA 3D · YA DISPONIBLE"}>
      Tu oficina,<br />ahora <Ac>en vivo.</Ac>
    </Titular>
  </Fondo>
);

const LEYENDA: [string, string, string][] = [["En llamada", EST.llamada, "3"], ["Roleplay", EST.roleplay, "2"], ["Reunión", EST.reunion, "4"], ["Disponible", EST.libre, "4"], ["Ausente", EST.ausente, "2"]];
export const OF1Equipo: React.FC = () => (
  <Fondo n={1} cartela="PLANTA · SALA DE VENTAS · ESC 1:50">
    <Abs x={70} y={330}>
      <Plano vb={[30, 30, 860, 760]} w={940} personas={EQUIPO.slice(0, 9)} e={1.2} cotas={false} foco={[40, 40, 820, 720]} />
    </Abs>
    {/* leyenda de plano */}
    <Abs x={90} y={1200} style={{ width: 900 }}>
      <Mono s={16} c="rgba(161,161,170,0.75)" style={{ marginBottom: 18 }}>LEYENDA</Mono>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 20 }}>
        {LEYENDA.map(([t, c, n]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Punto c={c} t={13} />
            <span style={{ fontSize: 25, fontWeight: 500, color: "#d4d4d8" }}>{t}</span>
            <span style={{ fontFamily: MONO, fontSize: 20, color: "rgba(161,161,170,0.8)" }}>{n}</span>
          </div>
        ))}
      </div>
    </Abs>
    <Titular top={1345} tam={112} sub="QUIÉN LLAMA, QUIÉN ENTRENA, DESDE CUÁNDO">
      Todo tu equipo,<br /><Ac>en tiempo real.</Ac>
    </Titular>
  </Fondo>
);

const Metrica: React.FC<{ k: string; v: string; u?: string }> = ({ k, v, u }) => (
  <div style={{ padding: "22px 24px", borderRadius: 20, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)" }}>
    <Mono s={15}>{k}</Mono>
    <div style={{ marginTop: 10, fontWeight: 600, fontSize: 52, letterSpacing: "-0.03em", color: "#f4f4f5", lineHeight: 1 }}>
      {u && <span style={{ fontSize: 26, color: "#a1a1aa", marginRight: 8, letterSpacing: 0 }}>{u}</span>}{v}
    </div>
  </div>
);
const Boton: React.FC<{ ic: string; t: string; verde?: boolean }> = ({ ic, t, verde }) => (
  <div style={{ flex: 1, height: 76, borderRadius: 38, display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    background: verde ? "rgba(6,40,30,0.95)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${verde ? "rgba(52,211,153,0.65)" : "rgba(255,255,255,0.13)"}`, fontWeight: 600, fontSize: 28, color: "#ededee" }}>
    <Icono d={ic} t={28} c={verde ? V4 : "#d4d4d8"} />{t}
  </div>
);
export const OF2Ficha: React.FC = () => (
  <Fondo n={2} cartela="DETALLE · PUESTO 01 · ESC 1:20">
    <Abs x={-150} y={290} style={{ opacity: 0.85 }}>
      <Plano vb={[60, 80, 420, 300]} w={980} personas={[{ x: 205, y: 242, c: EST.llamada }, { x: 445, y: 242, c: EST.libre }]} e={0.9} cotas={false} rotulos={false} fundido />
    </Abs>
    <Llamada d="M234 668 L330 668" fin={[234, 668]} />
    {/* ficha */}
    <Abs x={330} y={560} style={{ width: 680 }}>
      <Vidrio luz style={{ padding: "34px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Inicial l="MF" c={EST.llamada} t={92} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 42, letterSpacing: "-0.02em", color: "#f4f4f5", lineHeight: 1 }}>Mica Ferreyra</div>
            <Mono s={16} style={{ marginTop: 10 }}>CLOSER · NORTE VENTAS</Mono>
          </div>
        </div>
        <div style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 12, height: 48, padding: "0 20px", borderRadius: 24, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.35)" }}>
          <Punto c={EST.llamada} t={11} /><span style={{ fontSize: 24, fontWeight: 500, color: "#f4f4f5" }}>En llamada</span><Mono s={18} c="#d4d4d8">12:40</Mono>
        </div>
        <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Metrica k="LLAMADAS HOY" v="14" />
          <Metrica k="CIERRES" v="2" />
          <Metrica k="COBRADO" u="USD" v="4.800" />
          <Metrica k="PRÓXIMA" v="16:30" />
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 14 }}>
          <Boton ic={IC.tel} t="Llamar" verde /><Boton ic={IC.chat} t="Escribir" /><Boton ic={IC.nota} t="Nota" />
        </div>
      </Vidrio>
    </Abs>
    <Titular top={1360} tam={112}>
      Tocás a cualquiera y ves <Ac>su día.</Ac>
    </Titular>
  </Fondo>
);

const Onda: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {[62, 98, 136].map((r, i) => <circle key={r} cx={x} cy={y} r={r} fill="none" stroke={V4} strokeWidth={1.6} opacity={0.6 - i * 0.13} />)}
  </svg>
);
const Tile: React.FC<{ l: string; n: string; c: string; habla?: boolean }> = ({ l, n, c, habla }) => (
  <div style={{ height: 150, borderRadius: 20, position: "relative", background: "radial-gradient(circle at 50% 35%, #232328, #0d0d10)", border: `1.5px solid ${habla ? "rgba(52,211,153,0.75)" : "rgba(255,255,255,0.1)"}`, boxShadow: habla ? "0 0 30px rgba(16,185,129,0.35)" : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Inicial l={l} c={c} t={62} />
    <div style={{ position: "absolute", left: 14, bottom: 10, fontSize: 18, fontWeight: 500, color: "#d4d4d8" }}>{n}</div>
  </div>
);
export const OF3Llamar: React.FC = () => (
  <Fondo n={3} cartela="PLANTA · REUNIONES · VIDRIO">
    <Abs x={150} y={300} style={{ opacity: 0.9 }}>
      <Plano vb={[850, 400, 520, 380]} w={780} personas={[{ x: 1248, y: 590, c: EST.reunion }, { x: 1041, y: 488, c: EST.reunion }, { x: 1041, y: 692, c: EST.reunion }, { x: 1179, y: 488, c: EST.reunion }, { x: 1179, y: 692, c: EST.reunion }, { x: 972, y: 590, c: EST.libre }]} e={1} cotas={false} ondas={[972, 590]} fundido />
    </Abs>
    {/* tarjeta de llamada 1 a 1 */}
    <Abs x={470} y={330} style={{ width: 520 }}>
      <Vidrio luz style={{ padding: "26px 28px", display: "flex", alignItems: "center", gap: 20 }}>
        <Inicial l="TB" c={EST.libre} t={76} />
        <div style={{ flex: 1 }}>
          <Mono s={15} c={V3}>LLAMANDO…</Mono>
          <div style={{ marginTop: 8, fontWeight: 600, fontSize: 36, color: "#f4f4f5", letterSpacing: "-0.02em" }}>Tomi Báez</div>
        </div>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: V, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 34px rgba(16,185,129,0.6)" }}><Icono d={IC.tel} t={32} c="#04140e" /></div>
      </Vidrio>
    </Abs>
    {/* sala de equipo: hasta 6 */}
    <Abs x={90} y={900} style={{ width: 900 }}>
      <Vidrio style={{ padding: "24px 24px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <Mono s={16} c="#d4d4d8">SALA DE EQUIPO · 6 / 6</Mono>
          <div style={{ display: "flex", gap: 12 }}>
            {[IC.mic, IC.cam, IC.pantalla].map((d) => <div key={d} style={{ width: 52, height: 52, borderRadius: 26, border: "1.5px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icono d={d} t={24} c="#d4d4d8" /></div>)}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Tile l="LP" n="Lu" c={EST.reunion} habla /><Tile l="FO" n="Facu" c={EST.reunion} /><Tile l="SM" n="Sofi" c={EST.reunion} />
          <Tile l="ND" n="Nico" c={EST.reunion} /><Tile l="CS" n="Caro" c={EST.reunion} /><Tile l="JA" n="Juan" c={EST.reunion} />
        </div>
      </Vidrio>
    </Abs>
    <Titular top={1365} tam={112} sub="1 A 1 CON TIMBRE · SALA HASTA 6">
      Lo llamás<br />con <Ac>un toque.</Ac>
    </Titular>
  </Fondo>
);

const Canal: React.FC<{ n: string; m?: string; on?: boolean }> = ({ n, m, on }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 66, padding: "0 18px", borderRadius: 16, background: on ? "rgba(16,185,129,0.08)" : undefined, border: on ? "1px solid rgba(52,211,153,0.35)" : "1px solid transparent" }}>
    <span style={{ fontSize: 31, fontWeight: on ? 600 : 500, color: on ? "#f4f4f5" : "#c4c4c8" }}><span style={{ color: on ? V4 : "#71717a", marginRight: 8 }}>#</span>{n}</span>
    {m && <span style={{ minWidth: 40, height: 34, padding: "0 10px", borderRadius: 17, background: on ? V : "rgba(255,255,255,0.1)", color: on ? "#04140e" : "#e4e4e7", fontFamily: MONO, fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>{m}</span>}
  </div>
);
const SalaVoz: React.FC<{ n: string; gente: [string, string][]; habla?: number }> = ({ n, gente, habla }) => (
  <div style={{ padding: "16px 18px", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 28, fontWeight: 500, color: "#e4e4e7" }}><Icono d={IC.vol} t={26} c={V4} />{n}<Mono s={15} style={{ marginLeft: "auto" }}>{gente.length} EN SALA</Mono></div>
    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
      {gente.map(([l, c], i) => <Inicial key={l} l={l} c={i === habla ? V4 : c} t={52} />)}
    </div>
  </div>
);
export const OF4Canales: React.FC = () => (
  <Fondo n={4} cartela="ÍNDICE · CANALES Y SALAS" aviso={false}>
    <Abs x={-120} y={340} style={{ opacity: 0.28, filter: "blur(2px)" }}>
      <Plano vb={[40, 700, 1320, 240]} w={1320} cotas={false} rotulos={false} />
    </Abs>
    <Abs x={90} y={330} style={{ width: 900 }}>
      <Vidrio luz style={{ padding: "30px 30px 26px", display: "flex", gap: 26 }}>
        <div style={{ flex: 1.05 }}>
          <Mono s={16} style={{ marginBottom: 12, paddingLeft: 18 }}>TEXTO</Mono>
          <Canal n="general" m="3" on /><Canal n="closers" m="12" /><Canal n="setters" /><Canal n="dirección" m="1" />
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <Mono s={16} style={{ marginBottom: -2 }}>VOZ</Mono>
          <SalaVoz n="Sala de equipo" gente={[["LP", EST.ausente], ["FO", EST.ausente], ["SM", EST.ausente]]} habla={0} />
          <SalaVoz n="La esquina" gente={[["ND", EST.ausente], ["CS", EST.ausente]]} />
        </div>
      </Vidrio>
    </Abs>
    {/* un mensaje real de #general, con lo que trae */}
    <Abs x={90} y={790} style={{ width: 900 }}>
      <Vidrio style={{ padding: "26px 30px" }}>
        <div style={{ display: "flex", gap: 18 }}>
          <Inicial l="MF" c={EST.ausente} t={64} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}><span style={{ fontWeight: 600, fontSize: 28, color: "#f4f4f5" }}>Mica</span><Mono s={15}>11:42</Mono></div>
            <div style={{ marginTop: 6, fontSize: 30, color: "#d4d4d8", lineHeight: 1.35 }}>Cerré con la clínica 🙌 <span style={{ color: V4, fontWeight: 600 }}>@Tomi</span> te paso el guion de la objeción de precio.</div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {["🔥 6", "👏 4", "💬 3 en el hilo"].map((r) => <span key={r} style={{ height: 44, padding: "0 16px", borderRadius: 22, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", fontSize: 22, color: "#d4d4d8", display: "flex", alignItems: "center" }}>{r}</span>)}
            </div>
          </div>
        </div>
      </Vidrio>
    </Abs>
    <Abs x={90} y={1118} style={{ display: "flex", gap: 12, flexWrap: "wrap", width: 900 }}>
      {["MENCIONES", "REACCIONES", "HILOS", "FIJADOS", "NOTAS DE VOZ"].map((t) => (
        <span key={t} style={{ height: 46, padding: "0 18px", borderRadius: 23, border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 16, letterSpacing: "0.2em", color: V3 }}>{t}</span>
      ))}
    </Abs>
    <Titular top={1270} tam={112} sub="SOLO TU EQUIPO · SIN APPS AFUERA">
      Canales y salas de voz, <Ac>todo adentro.</Ac>
    </Titular>
  </Fondo>
);

const ESTADOS: [string, string][] = [["En llamada", EST.llamada], ["Roleplay", EST.roleplay], ["Reunión", EST.reunion], ["Entrenando", EST.libre], ["Recreo", EST.ausente], ["Almorzando", EST.ausente]];
export const OF5Recreo: React.FC = () => (
  <Fondo n={5} cartela="PLANTA · RECREO + GIMNASIO">
    <Abs x={70} y={330}>
      <Plano vb={[30, 840, 1340, 540]} w={940} e={1.5} cotas={false}
        personas={[{ x: 200, y: 1000, c: EST.ausente, txt: "FACU · RECREO", lado: "a" }, { x: 360, y: 1300, c: EST.ausente, txt: "SOFI · ALMORZANDO", lado: "d" }, { x: 1040, y: 1020, c: EST.libre, txt: "NICO · ENTRENANDO", lado: "i" }]} />
    </Abs>
    <Abs x={90} y={780} style={{ width: 900 }}>
      <Mono s={16} c="rgba(161,161,170,0.75)" style={{ marginBottom: 18 }}>TU ESTADO, A MANO</Mono>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {ESTADOS.map(([t, c], i) => (
          <div key={t} style={{ height: 88, borderRadius: 22, padding: "0 26px", display: "flex", alignItems: "center", gap: 16,
            background: i === 4 ? "rgba(6,40,30,0.9)" : "rgba(255,255,255,0.03)", border: `1.5px solid ${i === 4 ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.1)"}` }}>
            <Punto c={c} t={14} /><span style={{ fontSize: 32, fontWeight: 500, color: "#ededee" }}>{t}</span>
            {i === 4 && <svg width={30} height={30} viewBox="0 0 24 24" style={{ marginLeft: "auto" }} fill="none" stroke={V4} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
          </div>
        ))}
      </div>
    </Abs>
    <Titular top={1210} tam={128} sub={"PING-PONG, SILLONES Y GIMNASIO\nTU EQUIPO SABE CUÁNDO NO MOLESTARTE"}>
      Hasta <Ac>el recreo.</Ac>
    </Titular>
  </Fondo>
);

// escritorio en planta, grande, con cotas de personalización
const Escritorio: React.FC = () => (
  <svg width={940} height={760} viewBox="0 0 940 760" style={{ overflow: "visible" }}>
    <g stroke={MUEBLE} strokeWidth={2} fill="rgba(255,255,255,0.03)">
      {/* escritorio marfil */}
      <rect x={150} y={150} width={640} height={250} rx={14} fill="rgba(245,240,225,0.07)" stroke="rgba(245,240,225,0.55)" />
      {/* monitor con fondo de pantalla */}
      <rect x={330} y={178} width={280} height={22} rx={6} fill="rgba(16,185,129,0.25)" stroke={V4} />
      <line x1={470} y1={200} x2={470} y2={226} />
      <rect x={435} y={226} width={70} height={14} rx={4} />
      <rect x={370} y={290} width={200} height={56} rx={8} />
      <rect x={600} y={300} width={44} height={60} rx={20} />
      {/* taza */}
      <circle cx={700} cy={250} r={24} /><circle cx={700} cy={250} r={14} />
      {/* planta */}
      <g stroke="rgba(110,231,183,0.7)">
        <circle cx={220} cy={230} r={44} fill="rgba(16,185,129,0.08)" />
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={220 + 24 * Math.cos((a * Math.PI) / 180)} cy={230 + 24 * Math.sin((a * Math.PI) / 180)} rx={16} ry={9} transform={`rotate(${a} ${220 + 24 * Math.cos((a * Math.PI) / 180)} ${230 + 24 * Math.sin((a * Math.PI) / 180)})`} />)}
      </g>
      {/* silla */}
      <circle cx={470} cy={490} r={70} stroke="rgba(244,244,245,0.5)" />
      <path d="M405 450 A80 80 0 0 0 535 450" strokeWidth={10} stroke="rgba(244,244,245,0.4)" fill="none" strokeLinecap="round" />
    </g>
    {/* vitrina con trofeos */}
    <g>
      <rect x={150} y={600} width={640} height={110} rx={10} fill="rgba(255,255,255,0.03)" stroke="rgba(167,243,208,0.45)" strokeWidth={1.5} />
      <rect x={156} y={606} width={628} height={98} rx={7} fill="none" stroke="rgba(167,243,208,0.2)" strokeWidth={1} />
      {[230, 350, 470, 590, 710].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={688} rx={38} ry={6} fill="rgba(255,255,255,0.08)" />
          {i === 2
            ? <g><rect x={x - 46} y={638} width={92} height={30} rx={10} fill="none" stroke={V4} strokeWidth={2} /><circle cx={x} cy={653} r={13} fill="rgba(16,185,129,0.25)" stroke={V4} strokeWidth={2} /></g>
            : <path d={`M${x - 18} 632 h36 v14 a18 18 0 0 1 -36 0 z M${x - 4} 664 v10 h-10 v6 h28 v-6 h-10 v-10`} fill="none" stroke={i % 2 ? "rgba(244,244,245,0.6)" : "rgba(110,231,183,0.75)"} strokeWidth={2} />}
        </g>
      ))}
    </g>
    {/* cotas */}
    <g stroke="rgba(161,161,170,0.6)" strokeWidth={1.2}>
      <line x1={150} y1={110} x2={790} y2={110} /><line x1={150} y1={98} x2={150} y2={122} /><line x1={790} y1={98} x2={790} y2={122} />
      <line x1={110} y1={150} x2={110} y2={400} /><line x1={98} y1={150} x2={122} y2={150} /><line x1={98} y1={400} x2={122} y2={400} />
    </g>
    <text x={420} y={98} fill="rgba(161,161,170,0.85)" style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 3 }}>1,60 m</text>
    <text x={80} y={300} fill="rgba(161,161,170,0.85)" transform="rotate(-90 80 300)" style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 3 }}>0,70 m</text>
  </svg>
);
const Rotulo: React.FC<{ x: number; y: number; t: string; children?: React.ReactNode; der?: boolean }> = ({ x, y, t, children, der }) => (
  <Abs x={x} y={y} style={{ textAlign: der ? "right" : "left" }}>
    <Mono s={16} c="#d4d4d8">{t}</Mono>
    {children && <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: der ? "flex-end" : "flex-start" }}>{children}</div>}
  </Abs>
);
const Muestra: React.FC<{ c: string; on?: boolean }> = ({ c, on }) => (
  <span style={{ width: 34, height: 34, borderRadius: 17, background: c, border: on ? `2px solid ${V4}` : "1.5px solid rgba(255,255,255,0.2)", boxShadow: on ? "0 0 0 4px rgba(52,211,153,0.2)" : undefined }} />
);
export const OF6Escritorio: React.FC = () => (
  <Fondo n={6} cartela="DETALLE · TU PUESTO · ESC 1:10">
    <Abs x={70} y={380}><Escritorio /></Abs>
    <Llamada d="M290 566 L290 452" fin={[290, 566]} />
    <Rotulo x={232} y={400} t="PLANTA" />
    <Llamada d="M610 558 L610 452" fin={[610, 558]} />
    <Rotulo x={540} y={366} t="FONDO"><Muestra c="#0f2a22" on /><Muestra c="#1e1b2e" /><Muestra c="#2a1a12" /></Rotulo>
    <Llamada d="M860 700 L990 700" fin={[860, 700]} />
    <Rotulo x={870} y={716} t="ESCRITORIO"><Muestra c="#ede6d3" on /><Muestra c="#3b2a1e" /><Muestra c="#18181b" /></Rotulo>
    <Llamada d="M470 870 L290 870" fin={[470, 870]} />
    <Rotulo x={110} y={884} t="SILLA"><Muestra c="#18181b" on /><Muestra c="#7f1d1d" /><Muestra c="#1e3a8a" /><Muestra c="#e4e4e7" /></Rotulo>
    <Abs x={90} y={1112} style={{ width: 900, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 18 }}>
      <Mono s={16} c={V3}>VITRINA · TUS TROFEOS Y CINTURONES GANADOS</Mono>
    </Abs>
    <Titular top={1230} tam={116} sub="COLORES, PLANTA, OBJETOS Y FONDO">
      Tu escritorio,<br /><Ac>a tu manera.</Ac>
    </Titular>
  </Fondo>
);

export const OF7Cierre: React.FC = () => (
  <Fondo n={7}>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1590, height: 760, display: "flex", justifyContent: "center", opacity: 0.38, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%)" }}>
      <div style={{ transform: "perspective(2200px) rotateX(58deg) rotateZ(-30deg)", filter: "blur(1px)" }}>
        <Plano vb={[-20, -40, 1440, 1440]} w={760} personas={EQUIPO.map(({ txt, ...p }) => p)} e={1.15} cotas={false} rotulos={false} />
      </div>
    </div>
    <Abs x={0} y={360} style={{ width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ filter: "drop-shadow(0 0 40px rgba(16,185,129,0.55))" }}><Logo size={210} /></div>
    </Abs>
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", color: "#f4f4f5", fontWeight: 600, fontSize: 118, letterSpacing: "-0.045em", lineHeight: 1.02 }}>
      Tu equipo,<br />en <Ac>un solo lugar.</Ac>
    </div>
    {/* invitación */}
    <Abs x={140} y={940} style={{ width: 800 }}>
      <Vidrio luz style={{ padding: "26px 28px" }}>
        <Mono s={15} c={V3}>CREÁS TU EMPRESA · INVITÁS POR LINK</Mono>
        <div style={{ marginTop: 16, height: 70, borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", gap: 14, padding: "0 20px" }}>
          <Icono d={IC.link} t={28} c={V4} />
          <span style={{ fontFamily: MONO, fontSize: 22, color: "#d4d4d8", letterSpacing: "0.04em" }}>invitación · Norte Ventas</span>
          <span style={{ marginLeft: "auto", height: 44, padding: "0 18px", borderRadius: 22, background: V, color: "#04140e", fontWeight: 600, fontSize: 22, display: "flex", alignItems: "center" }}>Copiar</span>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          {["Dueño", "Director", "Closer", "Setter"].map((r) => <span key={r} style={{ flex: 1, height: 50, borderRadius: 25, border: "1px solid rgba(255,255,255,0.13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 500, color: "#e4e4e7" }}>{r}</span>)}
        </div>
      </Vidrio>
    </Abs>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontSize: 30, color: "rgba(161,161,170,0.95)" }}>Solo los de tu empresa ven tu oficina.</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1390, display: "flex", justifyContent: "center" }}>
      <div style={{ height: 96, padding: "0 54px", borderRadius: 48, display: "flex", alignItems: "center", gap: 18, border: "1.5px solid rgba(52,211,153,0.7)", background: "rgba(6,40,30,0.85)", boxShadow: "0 0 50px rgba(16,185,129,0.3)", fontWeight: 600, fontSize: 38, color: "#f4f4f5" }}>
        Link en el perfil <span style={{ color: V4 }}>→</span>
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1530, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: "0.32em", color: V3 }}>OFICINA 3D · YA DISPONIBLE</div>
  </Fondo>
);

export const LAMINAS_OF = [
  { id: "0-portada", c: OF0Portada },
  { id: "1-equipo", c: OF1Equipo },
  { id: "2-ficha", c: OF2Ficha },
  { id: "3-llamar", c: OF3Llamar },
  { id: "4-canales", c: OF4Canales },
  { id: "5-recreo", c: OF5Recreo },
  { id: "6-escritorio", c: OF6Escritorio },
  { id: "7-cierre", c: OF7Cierre },
];
