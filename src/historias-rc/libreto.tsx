// Destacada "Sonás a guion" (10/10/2026): acompaña al video Libreto-RC-Video, sin capturas.
// Mismo contenido del guion, otra puesta: "el teleprompter". Un vidrio ahumado con el guion encima
// y la cámara detrás: en el pozo el closer lee; al salir el teleprompter se apaga y aparece el esmeralda.
// Todo dato es inventado.
import React from "react";
import { AbsoluteFill } from "remotion";
import { TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO } from "../ring-closers/tema";

const V = "#10b981", V4 = "#34d399", V3 = "#6ee7b7";
const TOTAL = 7;

// ---------- fondo común ----------
const Grano: React.FC = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.08, mixBlendMode: "screen" }}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" /></filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

const Fondo: React.FC<{ children: React.ReactNode; n: number; luz?: string }> = ({ children, n, luz = "rgba(255,255,255,0.07)" }) => (
  <AbsoluteFill style={{ background: "#060607", overflow: "hidden", fontFamily: TIGHT }}>
    <div style={{ position: "absolute", left: -260, right: -260, top: -520, height: 1600, background: `radial-gradient(ellipse at 50% 30%, ${luz}, transparent 62%)` }} />
    {children}
    <div style={{ position: "absolute", left: 90, right: 90, top: 210, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: "rgba(212,212,216,0.75)" }}>
      <span><span style={{ color: n >= 5 ? V4 : "rgba(212,212,216,0.5)" }}>●</span>&nbsp; SONÁS A GUION</span>
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

// ---------- el teleprompter ----------
// Vidrio sin marco, inclinado delante de la cámara: la lente se ve detrás, el guion flota sobre el
// vidrio y se pierde en perspectiva; la línea de lectura lleva la flecha de cue. `act` = renglón leído.
type Renglon = { t: React.ReactNode; marca?: string };
const Prompter: React.FC<{ top: number; lineas: Renglon[]; act: number; apagado?: boolean; verde?: boolean; alto?: number; inclin?: number; riel?: [string, string] }> = ({ top, lineas, act, apagado, verde, alto = 900, inclin = 30, riel }) => {
  const W = 1000, LH = 100, X = 40;
  const acento = verde ? V4 : "#f4f4f5";
  const lenteY = top + alto * 0.62;
  return (
    <>
      {/* la cámara detrás del vidrio: cuerpo y lente */}
      <div style={{ position: "absolute", left: 540 - 250, top: lenteY - 250, width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, #020203 0 17%, #0d0e11 18% 21%, #040405 22% 40%, #17181c 41% 43%, #08090b 44% 62%, #1d1e23 63% 64.5%, #0a0b0d 65% 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 40px 120px rgba(0,0,0,0.9)" }}>
        {/* reflejos de los elementos de la lente */}
        <div style={{ position: "absolute", left: "30%", top: "25%", width: 120, height: 48, borderRadius: "50%", background: verde ? "rgba(52,211,153,0.28)" : "rgba(170,190,255,0.12)", filter: "blur(10px)", transform: "rotate(-32deg)" }} />
        <div style={{ position: "absolute", left: "58%", top: "60%", width: 40, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.1)", filter: "blur(5px)", transform: "rotate(-32deg)" }} />
        {apagado && <div style={{ position: "absolute", left: "50%", top: "50%", width: 16, height: 16, margin: -8, borderRadius: 8, background: verde ? V4 : "#ef4444",
          boxShadow: verde ? "0 0 34px 6px rgba(52,211,153,0.8)" : "0 0 26px 4px rgba(239,68,68,0.7)" }} />}
      </div>
      <div style={{ position: "absolute", left: X, top, width: W, height: alto, perspective: 1500, perspectiveOrigin: "50% 20%" }}>
        <div style={{ position: "absolute", inset: 0, transform: `rotateX(${inclin}deg)`, transformOrigin: "50% 100%" }}>
          {/* el vidrio ahumado */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, overflow: "hidden",
            background: "linear-gradient(180deg, rgba(14,15,18,0.55), rgba(10,11,13,0.35) 60%, rgba(14,15,18,0.6))",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09), inset 0 2px 0 rgba(255,255,255,0.22)" }}>
            {!apagado && (
              <div style={{ position: "absolute", left: 0, right: 0, top: alto * 0.42 - LH / 2 - act * LH }}>
                {lineas.map((l, i) => {
                  const d = Math.abs(i - act);
                  return (
                    <div key={i} style={{ height: LH, display: "flex", alignItems: "center", gap: 18, paddingLeft: 110,
                      fontSize: 50, fontWeight: 500, letterSpacing: "-0.025em", whiteSpace: "nowrap",
                      color: d === 0 ? acento : "rgba(228,228,231,0.92)", opacity: d === 0 ? 1 : Math.max(0.1, 0.6 - d * 0.15),
                      filter: d > 1 ? `blur(${(d - 1) * 1.1}px)` : undefined,
                      textShadow: d === 0 ? (verde ? "0 0 34px rgba(52,211,153,0.65)" : "0 0 30px rgba(255,255,255,0.4)") : undefined }}>
                      <span>{l.t}</span>
                      {l.marca && <span style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.22em", padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(161,161,170,0.4)", color: "rgba(161,161,170,0.95)" }}>{l.marca}</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {!apagado && <>
              <div style={{ position: "absolute", left: 0, right: 0, top: alto * 0.42 - LH / 2, height: LH, background: "linear-gradient(90deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 60%, transparent)",
                borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }} />
              <svg width={48} height={44} style={{ position: "absolute", left: 44, top: alto * 0.42 - 22 }}><path d="M 4 4 L 42 22 L 4 40 Z" fill={acento} style={{ filter: `drop-shadow(0 0 12px ${verde ? "rgba(52,211,153,0.9)" : "rgba(255,255,255,0.55)"})` }} /></svg>
            </>}
            {/* reflejos del vidrio */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(112deg, transparent 14%, rgba(255,255,255,0.08) 24%, transparent 33%, transparent 64%, rgba(255,255,255,0.04) 71%, transparent 77%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,6,7,0.92), transparent 26%, transparent 80%, rgba(6,6,7,0.7))" }} />
          </div>
          {/* canto pulido del vidrio */}
          <div style={{ position: "absolute", left: 0, right: 0, top: -1, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.8) 55%, rgba(255,255,255,0.3) 80%, transparent)" }} />
        </div>
      </div>
      {/* riel inferior: aluminio anodizado negro con la luz de estado */}
      <div style={{ position: "absolute", left: 70, right: 70, top: top + alto - 6, height: 46, borderRadius: 10,
        background: "linear-gradient(180deg, #2b2c31, #121316 55%, #0a0a0c)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.2), 0 30px 60px rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", fontFamily: MONO, fontSize: 15, letterSpacing: "0.34em", color: "rgba(161,161,170,0.6)" }}>
        <span><span style={{ color: apagado ? (verde ? V4 : "#ef4444") : "#ef4444", textShadow: "0 0 10px currentColor" }}>●</span>&nbsp; {riel ? riel[0] : apagado ? (verde ? "EN VIVO · SIN GUION" : "SIN GUION") : "REC · PROMPT 1.0×"}</span>
        <span>{riel ? riel[1] : apagado ? "—" : `LÍNEA ${String(act + 1).padStart(2, "0")} / ${String(lineas.length).padStart(2, "0")}`}</span>
      </div>
    </>
  );
};

const GUION: Renglon[] = [
  { t: "Hola, ¿cómo estás?", marca: "SONREÍR" },
  { t: "Te llamo por la sesión del martes." },
  { t: "Contame, ¿qué te llevó a pedirla?", marca: "PAUSA" },
  { t: "Entiendo perfectamente." },
  { t: "¿Caro comparado con qué?", marca: "OBJ. 1" },
  { t: "¿Qué es lo que te frena?", marca: "OBJ. 2" },
  { t: "¿Qué creés que te va a preguntar?", marca: "OBJ. 3" },
];

// ---------- láminas ----------
export const LBPortada: React.FC = () => (
  <Fondo n={0}>
    <Prompter top={400} lineas={GUION} act={3} alto={860} />
    <Titular top={1400} tam={150}>
      Sonás<br /><Ac gris>a guion.</Ac>
    </Titular>
    <div style={{ position: "absolute", right: 90, top: 1760, fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: "rgba(212,212,216,0.6)" }}>
      POR QUÉ SE NOTA&nbsp;&nbsp;<span style={{ color: V4 }}>→</span>
    </div>
  </Fondo>
);

export const LBMemoria: React.FC = () => (
  <Fondo n={1}>
    <Titular top={330} tam={112} sub={"CADA FRASE · CADA PAUSA\nLA RESPUESTA A CADA OBJECIÓN"}>
      Te lo sabés<br /><Ac gris>de memoria.</Ac>
    </Titular>
    <Prompter top={800} lineas={GUION} act={2} alto={900} inclin={26} />
  </Fondo>
);

// lo que escucha el prospecto: el mismo compás de punta a punta
const Metrono: React.FC<{ top: number }> = ({ top }) => {
  const barras = Array.from({ length: 44 }, (_, i) => 120 + ((i * 37) % 11) * 2);   // casi iguales: cero matiz
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top }}>
      <div style={{ borderRadius: 30, padding: "40px 44px 46px", background: "linear-gradient(180deg, rgba(28,29,33,0.92), rgba(12,13,15,0.92))",
        boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.12), 0 40px 100px rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 20, letterSpacing: "0.28em", color: "rgba(161,161,170,0.9)" }}>
          <span>LO QUE ESCUCHA EL PROSPECTO</span><span>00:41</span>
        </div>
        <div style={{ marginTop: 44, height: 170, display: "flex", alignItems: "center", gap: 7 }}>
          {barras.map((h, i) => <div key={i} style={{ flex: 1, height: h, borderRadius: 4, background: "rgba(212,212,216,0.55)" }} />)}
        </div>
        {/* compás: marcas idénticas */}
        <div style={{ position: "relative", height: 26, marginTop: 18 }}>
          {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ position: "absolute", left: `${i * 9.09}%`, width: 2, height: i % 4 === 0 ? 26 : 14, background: "rgba(161,161,170,0.5)" }} />)}
        </div>
        <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          {[["TONO", "plano"], ["RITMO", "idéntico"], ["PAUSAS", "ensayadas"]].map(([k, v]) => (
            <div key={k} style={{ borderRadius: 18, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
              <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: "0.28em", color: "rgba(161,161,170,0.8)" }}>{k}</div>
              <div style={{ marginTop: 10, fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 46, color: "#d4d4d8" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LBEscucha: React.FC = () => (
  <Fondo n={2}>
    <Titular top={330} tam={104}>
      No escucha<br />lo que decís.<br /><Ac gris>Escucha que leés.</Ac>
    </Titular>
    <Metrono top={900} />
    <div style={{ position: "absolute", left: 90, right: 90, top: 1610, fontSize: 38, lineHeight: 1.4, color: "rgba(212,212,216,0.85)", letterSpacing: "-0.01em" }}>
      Del otro lado no hay una charla.<br />Hay alguien <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 44 }}>leyéndole</span> un texto.
    </div>
  </Fondo>
);

const LUZ_V = "rgba(16,185,129,0.16)";
const Vidrio: React.FC<{ top: number; children: React.ReactNode; verde?: boolean }> = ({ top, children, verde }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top, borderRadius: 30, padding: "40px 44px 44px",
    background: "linear-gradient(180deg, rgba(28,29,33,0.92), rgba(12,13,15,0.92))",
    border: `1px solid ${verde ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)"}`,
    boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.12), 0 40px 100px rgba(0,0,0,0.7)${verde ? ", 0 0 70px rgba(16,185,129,0.14)" : ""}` }}>{children}</div>
);
const Rotulo: React.FC<{ izq: string; der?: string; verde?: boolean }> = ({ izq, der, verde }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 20, letterSpacing: "0.28em", color: verde ? V3 : "rgba(161,161,170,0.9)" }}>
    <span>{izq}</span>{der && <span>{der}</span>}
  </div>
);

// 03: veinte pasadas idénticas del mismo texto
export const LBVeinte: React.FC = () => (
  <Fondo n={3}>
    <Titular top={330} tam={100}>
      Un guion no<br />se vuelve tuyo<br /><Ac gris>leyéndolo veinte veces.</Ac>
    </Titular>
    <Vidrio top={880}>
      <Rotulo izq="HISTORIAL DEL PROMPT" der="20 PASADAS" />
      <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 9 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: MONO, fontSize: 17, letterSpacing: "0.16em", color: `rgba(161,161,170,${0.35 + i * 0.03})` }}>
            <span style={{ width: 40 }}>{String(i + 1).padStart(2, "0")}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(90deg, rgba(212,212,216,${0.18 + i * 0.02}), rgba(212,212,216,${0.32 + i * 0.025}))` }} />
            </div>
            <span>04:12</span>
          </div>
        ))}
      </div>
    </Vidrio>
    <div style={{ position: "absolute", left: 90, right: 90, top: 1700, fontFamily: MONO, fontSize: 22, letterSpacing: "0.26em", color: "rgba(161,161,170,0.9)", lineHeight: 1.8 }}>
      MISMO TEXTO · MISMA VELOCIDAD<br />NADIE DEL OTRO LADO
    </div>
  </Fondo>
);

// 04: te corta. El prompter se quedó sin renglones
export const LBCorte: React.FC = () => (
  <Fondo n={4}>
    <Prompter top={300} lineas={[...GUION, { t: "" }]} act={7} alto={760} inclin={28} riel={["SIN GUION", "LÍNEA 08 / 07"]} />
    <div style={{ position: "absolute", left: 120, right: 70, top: 1130, transform: "rotate(-1.5deg)" }}>
      <div style={{ borderRadius: 28, padding: "34px 40px 38px", background: "linear-gradient(180deg, rgba(36,37,42,0.97), rgba(18,19,22,0.97))",
        border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.16), 0 50px 120px rgba(0,0,0,0.85)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 18, letterSpacing: "0.28em", color: "rgba(161,161,170,0.95)" }}>
          <span style={{ color: "#ef4444", textShadow: "0 0 10px #ef4444" }}>●</span> PROSPECTO · TE INTERRUMPE
        </div>
        <div style={{ marginTop: 22, fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 76, lineHeight: 1.08, color: "#f4f4f5", letterSpacing: "-0.02em" }}>
          —Pará. ¿Y eso a mí en qué me cambia?
        </div>
      </div>
    </div>
    <Titular top={1500} tam={96}>
      Y ahí no hay<br />renglón que <Ac gris>te salve.</Ac>
    </Titular>
  </Fondo>
);

// 05: el prompter se apaga y aparece el esmeralda
export const LBDiciendolo: React.FC = () => (
  <Fondo n={5} luz={LUZ_V}>
    <Prompter top={340} lineas={GUION} act={0} apagado verde alto={820} inclin={26} />
    <Titular top={1300} tam={124} sub={"CONTRA ALGUIEN QUE TE CORTA\nY NO SIGUE TU LIBRETO."}>
      Se vuelve tuyo<br /><Ac>diciéndolo.</Ac>
    </Titular>
  </Fondo>
);

// 06: round tras round, cada vez mirás menos el guion
const MIRADAS = [14, 11, 9, 7, 5, 3, 1, 0];
export const LBRounds: React.FC = () => (
  <Fondo n={6} luz={LUZ_V}>
    <Titular top={330} tam={100}>
      Roleplay con otros closers.<br /><Ac>Round tras round.</Ac>
    </Titular>
    <Vidrio top={800} verde>
      <Rotulo izq="MIRADAS AL GUION" der="POR ROUND" verde />
      <div style={{ marginTop: 40, height: 420, display: "flex", alignItems: "flex-end", gap: 22 }}>
        {MIRADAS.map((m, i) => {
          const ult = i === MIRADAS.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: MONO, fontSize: 22, color: ult ? V4 : "rgba(212,212,216,0.8)" }}>{m}</span>
              <div style={{ width: "100%", height: ult ? 6 : 26 * m, borderRadius: 8,
                background: ult ? V4 : `linear-gradient(180deg, rgba(212,212,216,${0.55 - i * 0.04}), rgba(16,185,129,${0.1 + i * 0.07}))`,
                boxShadow: ult ? "0 0 24px rgba(52,211,153,0.9)" : undefined }} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 22 }}>
        {MIRADAS.map((_, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 17, letterSpacing: "0.1em", color: i === 7 ? V3 : "rgba(161,161,170,0.75)" }}>R{i + 1}</div>)}
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "34px 0 28px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 30, color: "#ededee", fontWeight: 600 }}>
        <span>Vos <span style={{ color: "#71717a", fontWeight: 400 }}>vs.</span> Tomás G.</span>
        <span style={{ fontFamily: MONO, fontSize: 17, letterSpacing: "0.24em", color: "#a1a1aa", fontWeight: 400 }}>HACE DE PROSPECTO</span>
      </div>
    </Vidrio>
    <div style={{ position: "absolute", left: 90, right: 90, top: 1700, fontFamily: MONO, fontSize: 22, letterSpacing: "0.26em", color: V3 }}>
      R8 · CERO MIRADAS. LO DECÍS.
    </div>
  </Fondo>
);

// 07: cierre
export const LBCierre: React.FC = () => (
  <Fondo n={7} luz={LUZ_V}>
    <Titular top={380} tam={118}>
      Hasta que ya no<br />lo recitás:<br /><Ac>lo decís.</Ac>
    </Titular>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center" }}>
      <div style={{ filter: "drop-shadow(0 0 40px rgba(16,185,129,0.55))" }}><Logo size={170} /></div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: "0.34em", color: "rgba(228,228,231,0.85)" }}>RING CLOSERS</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1270, textAlign: "center", fontWeight: 600, fontSize: 56, letterSpacing: "-0.035em", color: "#f4f4f5", lineHeight: 1.15 }}>
      Practicá con closers.<br /><Ac>Cerrá con clientes.</Ac>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1480, display: "flex", justifyContent: "center" }}>
      <div style={{ height: 92, padding: "0 52px", borderRadius: 46, display: "flex", alignItems: "center", gap: 18, border: "1.5px solid rgba(52,211,153,0.7)", background: "rgba(6,40,30,0.8)", boxShadow: "0 0 50px rgba(16,185,129,0.3)", fontWeight: 600, fontSize: 36, color: "#f4f4f5" }}>
        Link en el perfil <span style={{ color: V4 }}>→</span>
      </div>
    </div>
  </Fondo>
);

export const LAMINAS_LB = [
  { id: "0-portada", c: LBPortada },
  { id: "1-memoria", c: LBMemoria },
  { id: "2-escucha", c: LBEscucha },
  { id: "3-veinte", c: LBVeinte },
  { id: "4-corte", c: LBCorte },
  { id: "5-diciendolo", c: LBDiciendolo },
  { id: "6-rounds", c: LBRounds },
  { id: "7-cierre", c: LBCierre },
];
