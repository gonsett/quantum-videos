// Destacada "La mala racha" (10/10/2026): acompaña al video Racha-RC-Video, sin capturas.
// Mismo contenido del guion, otra puesta: "contra las cuerdas". Las tres cuerdas del ring cruzan
// cada lámina: en el pozo vienen vencidas y grises; al salir quedan tensas y en esmeralda.
// El conteo de días va en palotes, no en el calendario del video. Todo dato es inventado.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO } from "../ring-closers/tema";

const V = "#10b981", V4 = "#34d399", V3 = "#6ee7b7";
const TOTAL = 7;

// ---------- fondo común ----------
const Grano: React.FC = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "screen" }}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" /></filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

// las cuerdas: salen del esquinero (izquierda) y se pierden a la derecha en perspectiva.
// `vence` = cuánto ceden (0 tensas, 1 vencidas); `verde` = 0 gris, 1 esmeralda.
const Cuerdas: React.FC<{ y: number; vence: number; verde?: boolean; op?: number }> = ({ y, vence, verde, op = 1 }) => {
  const PX = 70;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: op, overflow: "visible" }}>
      <defs>
        <linearGradient id="fadeC" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="0.7" stopColor="#fff" stopOpacity="0.7" /><stop offset="1" stopColor="#fff" stopOpacity="0.05" /></linearGradient>
        <mask id="mC"><rect x={-100} y={0} width={1300} height={1920} fill="url(#fadeC)" /></mask>
        <linearGradient id="poste" x1="0" x2="1"><stop offset="0" stopColor="#0b0b0d" /><stop offset="0.45" stopColor="#2a2a30" /><stop offset="1" stopColor="#101013" /></linearGradient>
      </defs>
      <g mask="url(#mC)">
        {[0, 1, 2].map((i) => {
          const y0 = y + i * 150, y1 = y0 + 380 + i * 120, cae = vence * (150 + i * 80);
          const d = `M ${PX} ${y0} C 380 ${y0 + cae * 1.15}, 760 ${y1 + cae * 0.85}, 1200 ${y1}`;
          const g = 26 - i * 4;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="rgba(0,0,0,0.75)" strokeWidth={g + 14} transform="translate(0 40)" style={{ filter: "blur(16px)" }} />
              <path d={d} fill="none" stroke={verde ? "#0b3426" : "#26262b"} strokeWidth={g} strokeLinecap="round" />
              <path d={d} fill="none" stroke={verde ? "rgba(6,20,16,0.9)" : "rgba(8,8,10,0.9)"} strokeWidth={g * 0.35} transform={`translate(0 ${g * 0.3})`} strokeLinecap="round" />
              <path d={d} fill="none" stroke={verde ? V3 : "rgba(244,244,245,0.42)"} strokeWidth={2.4} transform={`translate(0 ${-g * 0.26})`} strokeLinecap="round"
                style={verde ? { filter: "drop-shadow(0 0 10px rgba(16,185,129,0.95))" } : undefined} />
            </g>
          );
        })}
      </g>
      {/* esquinero con sus tres almohadillas */}
      <rect x={PX - 48} y={y - 75} width={96} height={700} rx={14} fill="url(#poste)" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={PX - 62} y={y - 40 + i * 150} width={124} height={80} rx={20} fill={verde ? "#0c3a2b" : "#1b1b1f"} stroke={verde ? V4 : "rgba(255,255,255,0.2)"} strokeWidth={1.8}
            style={verde ? { filter: "drop-shadow(0 0 16px rgba(16,185,129,0.6))" } : undefined} />
          <rect x={PX - 50} y={y - 33 + i * 150} width={100} height={3} rx={1.5} fill={verde ? "rgba(167,243,208,0.7)" : "rgba(255,255,255,0.22)"} />
        </g>
      ))}
    </svg>
  );
};

const Fondo: React.FC<{ children: React.ReactNode; n: number; luz?: string }> = ({ children, n, luz = "rgba(255,255,255,0.08)" }) => (
  <AbsoluteFill style={{ background: "#060607", overflow: "hidden", fontFamily: TIGHT }}>
    {/* foco cenital del ring */}
    <div style={{ position: "absolute", left: -260, right: -260, top: -520, height: 1600, background: `radial-gradient(ellipse at 50% 30%, ${luz}, transparent 62%)` }} />
    {children}
    <div style={{ position: "absolute", left: 90, right: 90, top: 210, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: "rgba(212,212,216,0.75)" }}>
      <span><span style={{ color: n >= 5 ? V4 : "rgba(212,212,216,0.5)" }}>●</span>&nbsp; LA MALA RACHA</span>
      <span>{String(n).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}</span>
    </div>
    <Grano />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
  </AbsoluteFill>
);

// ---------- texto ----------
const Ac: React.FC<{ children: React.ReactNode; gris?: boolean }> = ({ children, gris }) => (
  <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.16em", letterSpacing: "-0.02em",
    color: gris ? "#a1a1aa" : V, textShadow: gris ? undefined : "0 0 50px rgba(16,185,129,0.45)" }}>{children}</span>
);
const Titular: React.FC<{ children: React.ReactNode; top: number; tam?: number; sub?: string; left?: number }> = ({ children, top, tam = 116, sub, left = 90 }) => (
  <div style={{ position: "absolute", left, right: 80, top }}>
    <div style={{ color: "#f4f4f5", fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.03 }}>{children}</div>
    {sub && <div style={{ marginTop: 34, fontFamily: MONO, fontSize: 23, letterSpacing: "0.26em", color: "rgba(161,161,170,0.95)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{sub}</div>}
  </div>
);

// ---------- palotes ----------
// un palote "a tiza": trazo con leve curva y grosor desparejo
const Palote: React.FC<{ x: number; y: number; h: number; rot: number; col: string; diag?: boolean; w?: number }> = ({ x, y, h, rot, col, diag, w = 120 }) => (
  <svg width={diag ? w + 60 : 40} height={h + 40} style={{ position: "absolute", left: x, top: y, overflow: "visible", transform: `rotate(${rot}deg)` }}>
    {diag
      ? <path d={`M 0 ${h * 0.78} Q ${w * 0.5} ${h * 0.52} ${w + 50} ${h * 0.18}`} stroke={col} strokeWidth={9} strokeLinecap="round" fill="none" />
      : <path d={`M 20 0 Q ${16 + rot * 0.6} ${h * 0.5} 22 ${h}`} stroke={col} strokeWidth={10} strokeLinecap="round" fill="none" />}
  </svg>
);
const Palotes: React.FC<{ x: number; y: number; n: number; h?: number; col?: string; verdes?: number }> = ({ x, y, n, h = 190, col = "rgba(212,212,216,0.55)", verdes = 0 }) => {
  const piezas: React.ReactNode[] = [];
  const rots = [-3, 2, -1, 3, -2, 1, -3, 2, 0, -2, 3, -1, 2, -2, 1];
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5), k = i % 5, gx = x + (g % 2) * 0 + g * 290, gy = y;
    const c = i >= n - verdes ? V4 : col;
    if (k < 4) piezas.push(<Palote key={i} x={gx + k * 46} y={gy + (i % 3) * 4} h={h} rot={rots[i % rots.length]} col={c} />);
    else piezas.push(<Palote key={i} x={gx - 34} y={gy} h={h} rot={0} col={c} diag w={170} />);
  }
  return <>{piezas}</>;
};

// ---------- láminas ----------
export const RAPortada: React.FC = () => (
  <Fondo n={0}>
    <Cuerdas y={1470} vence={1} />
    {/* catorce palotes: dos semanas */}
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
      <Palotes x={170} y={430} n={10} h={240} />
      <Palotes x={170} y={730} n={4} h={240} />
      {/* el día 15, todavía sin marcar */}
      <svg width={40} height={280} style={{ position: "absolute", left: 360, top: 730, overflow: "visible" }}>
        <path d="M 20 0 Q 18 120 22 240" stroke={V4} strokeWidth={4} strokeDasharray="14 16" strokeLinecap="round" fill="none" style={{ filter: "drop-shadow(0 0 12px rgba(16,185,129,0.8))" }} />
      </svg>
    </div>
    <div style={{ position: "absolute", left: 470, top: 830, fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: "rgba(161,161,170,0.8)", lineHeight: 1.8 }}>
      14 DÍAS<br />0 CIERRES<br /><span style={{ color: V3 }}>DÍA 15 ?</span>
    </div>
    <Titular top={1060} tam={136}>
      Dos semanas<br /><Ac gris>sin cerrar.</Ac>
    </Titular>
    <div style={{ position: "absolute", right: 90, top: 1760, fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: "rgba(212,212,216,0.6)" }}>
      CÓMO SE SALE&nbsp;&nbsp;<span style={{ color: V4 }}>→</span>
    </div>
  </Fondo>
);

const LLAMADAS = [
  { d: "VIE 18:10", n: "Sofía M.", e: "No cerró" },
  { d: "VIE 11:30", n: "Andrés P.", e: "No cerró" },
  { d: "JUE 16:45", n: "Lucía R.", e: "Lo va a pensar" },
  { d: "JUE 09:20", n: "Martín G.", e: "No cerró" },
  { d: "MIÉ 17:00", n: "Paula V.", e: "No contestó más" },
  { d: "MIÉ 10:15", n: "Diego A.", e: "No cerró" },
];
export const RA1Anterior: React.FC = () => (
  <Fondo n={1}>
    <Cuerdas y={1640} vence={0.9} op={0.85} />
    {/* registro de llamadas: cada una arrastra a la siguiente */}
    <div style={{ position: "absolute", left: 90, right: 90, top: 380 }}>
      <div style={{ borderRadius: 30, padding: "34px 36px 16px", background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))", border: "1.5px solid rgba(255,255,255,0.09)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 60px 110px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, letterSpacing: "0.28em", color: "rgba(212,212,216,0.75)", marginBottom: 14 }}>
          <span>LLAMADAS DE LA SEMANA</span><span>0 / 6</span>
        </div>
        {LLAMADAS.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 0", borderTop: "1px solid rgba(255,255,255,0.07)", opacity: 1 - i * 0.13 }}>
            <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="rgba(212,212,216,0.7)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
            <span style={{ fontFamily: MONO, fontSize: 21, letterSpacing: "0.12em", color: "#8b8b93", width: 170 }}>{l.d}</span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 34, color: "#e4e4e7" }}>{l.n}</span>
            <span style={{ fontSize: 26, color: "#9b9ba3", fontStyle: "italic" }}>{l.e}</span>
          </div>
        ))}
      </div>
    </div>
    <Titular top={1170} tam={104}>
      Y entrás a cada llamada pensando en <Ac gris>la anterior.</Ac>
    </Titular>
  </Fondo>
);

// la propuesta que se va achicando sola
export const RA3Cedes: React.FC = () => {
  const precios = [
    { p: "USD 3.500", nota: "lo que vale" },
    { p: "USD 2.900", nota: "apurado, antes de la objeción" },
    { p: "USD 2.400", nota: "y nadie te lo pidió" },
  ];
  return (
    <Fondo n={3}>
      <Cuerdas y={1720} vence={1} op={0.85} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 400, borderRadius: 30, padding: "40px 44px", background: "linear-gradient(160deg, rgba(38,38,42,0.96), rgba(15,15,18,0.96))", border: "1.5px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09), 0 60px 110px rgba(0,0,0,0.7)", transform: "rotate(-1.5deg)" }}>
        <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: "0.28em", color: "rgba(212,212,216,0.75)" }}>TU PROPUESTA · PROGRAMA 3 MESES</div>
        {precios.map((x, i) => {
          const ult = i === precios.length - 1;
          return (
            <div key={i} style={{ marginTop: i ? 26 : 36, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20 }}>
              <span style={{ position: "relative", fontFamily: TIGHT, fontWeight: 600, fontSize: 92 - i * 4, letterSpacing: "-0.04em", color: ult ? "#d4d4d8" : "rgba(161,161,170,0.55)" }}>
                {x.p}
                {!ult && <span style={{ position: "absolute", left: -8, right: -8, top: "54%", height: 5, borderRadius: 3, background: "rgba(228,228,231,0.75)", transform: `rotate(${i ? 2 : -2}deg)` }} />}
              </span>
              <span style={{ fontSize: 25, fontStyle: "italic", color: "#8b8b93", textAlign: "right", maxWidth: 300, lineHeight: 1.2 }}>{x.nota}</span>
            </div>
          );
        })}
      </div>
      <Titular top={1110} tam={108}>
        Apurás el precio.<br />Bajás el tono.<br /><Ac gris>Cedés antes.</Ac>
      </Titular>
    </Fondo>
  );
};

// ---------- piezas de vidrio ----------
const Vidrio: React.FC<{ children: React.ReactNode; top: number; verde?: boolean; rot?: number; pad?: string }> = ({ children, top, verde, rot = 0, pad = "36px 40px" }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top, borderRadius: 30, padding: pad, transform: `rotate(${rot}deg)`,
    background: verde ? "linear-gradient(160deg, rgba(10,44,33,0.95), rgba(6,20,16,0.96))" : "linear-gradient(160deg, rgba(38,38,42,0.96), rgba(15,15,18,0.96))",
    border: `1.5px solid ${verde ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)"}`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.09), 0 60px 110px rgba(0,0,0,0.7)${verde ? ", 0 0 90px rgba(16,185,129,0.22)" : ""}` }}>
    {verde && <div style={{ position: "absolute", left: 60, right: 60, top: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(110,231,183,0.85), transparent)" }} />}
    {children}
  </div>
);
const Rot: React.FC<{ children: React.ReactNode; der?: React.ReactNode; verde?: boolean }> = ({ children, der, verde }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, letterSpacing: "0.28em", color: verde ? V3 : "rgba(212,212,216,0.75)" }}>
    <span>{children}</span>{der && <span>{der}</span>}
  </div>
);
const LUZ_V = "rgba(16,185,129,0.13)";

// lo que el prospecto oye del otro lado: la transcripción con las dudas marcadas
export const RA2Escucha: React.FC = () => {
  const T: [string, boolean][] = [["Eh…", true], [" bueno, el programa sale… ", false], ["mirá,", true], [" si te complica el precio, ", false], ["capaz", true], [" podemos ver algo.", false]];
  return (
    <Fondo n={2}>
      <Cuerdas y={1700} vence={0.95} op={0.85} />
      <Vidrio top={390}>
        <Rot der="03:42">LO QUE ESCUCHA EL PROSPECTO</Rot>
        <div style={{ marginTop: 34, fontSize: 50, lineHeight: 1.34, color: "#a1a1aa", fontWeight: 500, letterSpacing: "-0.02em" }}>
          “{T.map(([t, duda], i) => duda
            ? <span key={i} style={{ color: "#f4f4f5", fontStyle: "italic", textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: "rgba(228,228,231,0.5)", textUnderlineOffset: 12, textDecorationThickness: 2 }}>{t}</span>
            : <span key={i}>{t}</span>)}”
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "38px 0 28px" }} />
        <Rot der="31 %">SEGURIDAD EN LA VOZ</Rot>
        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 34, borderRadius: 5, background: i < 6 ? "rgba(212,212,216,0.7)" : "rgba(255,255,255,0.06)" }} />
          ))}
        </div>
      </Vidrio>
      <Titular top={1150} tam={104}>
        El prospecto no sabe de tu racha. <Ac gris>Pero la escucha.</Ac>
      </Titular>
    </Fondo>
  );
};

// discos de pesas: cada llamada perdida, más grande que la anterior
export const RA4Pesa: React.FC = () => {
  const D = [
    { n: "LLAMADA 10", w: 300, h: 54 }, { n: "LLAMADA 11", w: 420, h: 62 }, { n: "LLAMADA 12", w: 540, h: 72 },
    { n: "LLAMADA 13", w: 680, h: 84 }, { n: "LLAMADA 14", w: 840, h: 100 },
  ];
  let y = 430;
  return (
    <Fondo n={4}>
      <Cuerdas y={1720} vence={1} op={0.85} />
      <div style={{ position: "absolute", left: 534, top: 380, width: 12, height: 480, borderRadius: 6, background: "linear-gradient(90deg, #3a3a40, #8b8b93, #2a2a2f)" }} />
      {D.map((d, i) => {
        const top = y; y += d.h + 12;
        return (
          <div key={i} style={{ position: "absolute", left: 540 - d.w / 2, top, width: d.w, height: d.h, borderRadius: d.h / 2.2,
            background: "linear-gradient(180deg, #3a3a40 0%, #1b1b1f 45%, #0f0f12 100%)", border: "1.5px solid rgba(255,255,255,0.14)",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.14), 0 30px 60px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <span style={{ fontFamily: MONO, fontSize: 15 + i * 2.5, letterSpacing: "0.26em", color: `rgba(212,212,216,${0.5 + i * 0.1})` }}>{d.n}</span>
            {i > 1 && <span style={{ fontFamily: MONO, fontSize: 15 + i * 2.5, letterSpacing: "0.2em", color: "rgba(161,161,170,0.7)" }}>· NO CERRÓ</span>}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 120, right: 120, top: y + 8, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} />
      <Titular top={1150} tam={104} sub="CON LEADS REALES, NO SALÍS DE AHÍ.">
        Cada llamada que perdés pesa más que <Ac gris>la anterior.</Ac>
      </Titular>
    </Fondo>
  );
};

// la salida: las cuerdas se tensan y se encienden
export const RA5Sale: React.FC = () => (
  <Fondo n={5} luz={LUZ_V}>
    <Cuerdas y={1500} vence={0} verde />
    <Vidrio top={440} verde rot={-2}>
      <Rot verde der="ROLEPLAY">LO QUE CUESTA PERDER ACÁ</Rot>
      <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", gap: 24 }}>
        <span style={{ fontWeight: 600, fontSize: 150, letterSpacing: "-0.05em", color: "#f4f4f5", lineHeight: 1 }}>$0</span>
        <span style={{ fontSize: 30, color: V3, fontStyle: "italic" }}>ni un lead, ni una comisión</span>
      </div>
    </Vidrio>
    <Titular top={900} tam={132} sub="DONDE PERDER NO CUESTA NADA.">
      Se sale<br /><Ac>practicando.</Ac>
    </Titular>
  </Fondo>
);

const Guante: React.FC<{ tam: number; img: string; verde?: boolean }> = ({ tam, img, verde }) => (
  <div style={{ width: tam, height: tam, borderRadius: "50%", padding: 4, background: `conic-gradient(from 210deg, ${verde ? V4 : "rgba(212,212,216,0.55)"}, rgba(255,255,255,0.08), ${verde ? V4 : "rgba(212,212,216,0.55)"})`, boxShadow: verde ? "0 0 40px rgba(16,185,129,0.5)" : undefined }}>
    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle at 40% 30%, #26262b, #0d0d0f)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile(`ring-closers/boxers/${img}.webp`)} style={{ width: "86%", height: "86%", objectFit: "contain" }} />
    </div>
  </div>
);

// el roleplay: la objeción que te mata, los rounds contados en palotes (ahora esmeralda)
export const RA6Roleplay: React.FC = () => (
  <Fondo n={6} luz={LUZ_V}>
    <Cuerdas y={1720} vence={0} verde op={0.9} />
    <Vidrio top={380}>
      <Rot der="LA QUE TE ESTÁ MATANDO">OBJECIÓN</Rot>
      <div style={{ marginTop: 26, fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 96, color: "#f4f4f5", letterSpacing: "-0.03em", lineHeight: 1.05 }}>“Es muy caro.”</div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "32px 0 26px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Guante tam={92} img="southpaw" verde />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 32, color: "#ededee" }}>Vos <span style={{ color: "#71717a", fontWeight: 400 }}>vs.</span> Vera R.</div>
          <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 17, letterSpacing: "0.24em", color: "#a1a1aa" }}>CLOSER · HACE DE PROSPECTO</div>
        </div>
        <Guante tam={92} img="speed" />
      </div>
    </Vidrio>
    <div style={{ position: "absolute", left: 90, top: 880, fontFamily: MONO, fontSize: 19, letterSpacing: "0.28em", color: V3 }}>ROUNDS</div>
    <Palotes x={150} y={930} n={8} h={150} verdes={8} />
    <div style={{ position: "absolute", left: 700, top: 980, fontFamily: MONO, fontSize: 22, letterSpacing: "0.26em", color: "rgba(212,212,216,0.75)", lineHeight: 1.8 }}>8 ROUNDS<br /><span style={{ color: V3 }}>MISMA OBJECIÓN</span></div>
    <Titular top={1170} tam={96} sub="LAS VECES QUE HAGA FALTA.">
      Roleplay con otros closers, con la objeción que te está <Ac>matando.</Ac>
    </Titular>
  </Fondo>
);

export const RA7Cierre: React.FC = () => (
  <Fondo n={7} luz={LUZ_V}>
    <Cuerdas y={1640} vence={0} verde />
    {/* los catorce, chicos, y el día 15 marcado */}
    <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.5)", transformOrigin: "0 0" }}>
      <Palotes x={180} y={640} n={14} h={170} col="rgba(212,212,216,0.3)" />
      <Palote x={1080} y={620} h={210} rot={-4} col={V4} />
    </div>
    <div style={{ position: "absolute", left: 600, top: 350, fontFamily: MONO, fontSize: 20, letterSpacing: "0.28em", color: V3 }}>DÍA 15 · CIERRE</div>
    <Titular top={480} tam={124}>
      Hasta que la llamada vuelve a ser <Ac>tuya.</Ac>
    </Titular>
    <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
      <div style={{ filter: "drop-shadow(0 0 40px rgba(16,185,129,0.55))" }}><Logo size={170} /></div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: "0.34em", color: "rgba(228,228,231,0.85)" }}>RING CLOSERS</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1230, textAlign: "center", fontWeight: 600, fontSize: 56, letterSpacing: "-0.035em", color: "#f4f4f5", lineHeight: 1.15 }}>
      Practicá con closers.<br /><Ac>Cerrá con clientes.</Ac>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1440, display: "flex", justifyContent: "center" }}>
      <div style={{ height: 92, padding: "0 52px", borderRadius: 46, display: "flex", alignItems: "center", gap: 18, border: "1.5px solid rgba(52,211,153,0.7)", background: "rgba(6,40,30,0.8)", boxShadow: "0 0 50px rgba(16,185,129,0.3)", fontWeight: 600, fontSize: 36, color: "#f4f4f5" }}>
        Link en el perfil <span style={{ color: V4 }}>→</span>
      </div>
    </div>
  </Fondo>
);

export const LAMINAS_RA = [
  { id: "0-portada", c: RAPortada },
  { id: "1-anterior", c: RA1Anterior },
  { id: "2-escucha", c: RA2Escucha },
  { id: "3-cedes", c: RA3Cedes },
  { id: "4-pesa", c: RA4Pesa },
  { id: "5-sale", c: RA5Sale },
  { id: "6-roleplay", c: RA6Roleplay },
  { id: "7-cierre", c: RA7Cierre },
];
