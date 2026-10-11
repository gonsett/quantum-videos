import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, MONO, ObjetoCae, RC, SANS } from "../elite-rc/dopamina";
import { Acabado, Destello as Bokeh } from "../secreto-rc/efectos";
import { ROJO } from "./escenas";
import { Caja } from "./VeteranosVideo";

/**
 * Carrusel de Ring Closers para veteranos (6 láminas 1080x1350, 4:5). Es el mismo mundo del reel
 * "El costo de aprender en vivo": el odómetro de "leads quemados" (rojo mientras duele, esmeralda
 * después), la medalla "$" de plata, el panel de disponibilidad, el sparring y el currículum. Cada
 * lámina tiene UN héroe; el texto es una capa discreta (gris → crema), sin resaltadores ni palabras
 * gigantes. Se exporta con `remotion still ... --frame=60 --public-dir=public-veteranos`.
 */
const EM = RC.esmeralda400;
export const CARD = {
  position: "absolute" as const,
  left: 110,
  width: 860,
  borderRadius: 30,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "linear-gradient(180deg,#171719,#101012)",
  boxShadow: "0 30px 70px rgba(0,0,0,0.55), 0 0 60px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
};

export const Fondo: React.FC<{ rojo?: boolean; children: React.ReactNode }> = ({ rojo = false, children }) => (
  <AbsoluteFill style={{ backgroundColor: "#07080a" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: rojo
          ? "radial-gradient(ellipse 800px 700px at 50% 0px, rgba(255,255,255,0.05), rgba(0,0,0,0) 70%), radial-gradient(ellipse 950px 800px at 50% 760px, rgba(229,83,75,0.17), rgba(0,0,0,0) 70%), linear-gradient(180deg, #07080a, #0b0c0f 55%, #07080a)"
          : "radial-gradient(ellipse 800px 700px at 50% 0px, rgba(255,255,255,0.05), rgba(0,0,0,0) 70%), radial-gradient(ellipse 950px 800px at 50% 760px, rgba(52,211,153,0.15), rgba(0,0,0,0) 70%), linear-gradient(180deg, #07080a, #0b0c0f 55%, #07080a)",
      }}
    />
    <div style={{ position: "absolute", inset: 0, filter: rojo ? "hue-rotate(205deg)" : undefined }}>
      <Bokeh x={950} y={90} size={640} rot={18} blur={24} fase={0.4} opacidad={0.8} />
      <Bokeh x={80} y={1290} size={560} rot={-14} blur={28} fase={2.1} opacidad={0.62} />
      <Bokeh x={160} y={700} size={100} rot={8} blur={2.5} fase={1.2} opacidad={0.5} />
    </div>
    {children}
    <Acabado />
  </AbsoluteFill>
);

export const Texto: React.FC<{ top: number; tam: number; peso?: number; color?: string; children: React.ReactNode }> = ({ top, tam, peso = 500, color = RC.platino300, children }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", whiteSpace: "nowrap", fontFamily: SANS, fontWeight: peso, fontSize: tam, lineHeight: 1.35, color }}>{children}</div>
);

const Hilo: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    {children}
    <i style={{ position: "absolute", left: 0, right: 0, bottom: 3, height: 2, backgroundColor: color }} />
  </span>
);

/** Pie de cada lámina: el @ a la izquierda y, si hay más, la pista de deslizar (una flecha fina). */
export const Pie: React.FC<{ sigue?: boolean }> = ({ sigue = true }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top: 1236, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.22em", color: RC.platino500 }}>
    <span>@RING.CLOSERS</span>
    {sigue ? (
      <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
        DESLIZÁ
        <svg width="46" height="18" viewBox="0 0 46 18"><path d="M0 9H43M36 2l7 7-7 7" fill="none" stroke={RC.platino500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    ) : null}
  </div>
);

// 1 · El gancho: el odómetro en 1 (rojo)
export const C1: React.FC = () => (
  <Fondo rojo>
    <Texto top={150} tam={52}>Cada objeción nueva que probás</Texto>
    <Texto top={222} tam={52}>en una llamada real,</Texto>
    <Caja v={1} col={ROJO} rgb="229,83,75" pulso={0.35} cy={640} escala={0.98} frame={0} />
    <Texto top={950} tam={72} peso={700} color={RC.crema}>
      <Hilo color={ROJO}>la pagás con un lead.</Hilo>
    </Texto>
    <Pie />
  </Fondo>
);

// 2 · Cuesta: el odómetro sube a 4
export const C2: React.FC = () => (
  <Fondo rojo>
    <Texto top={160} tam={56}>Ir al hueso funciona.</Texto>
    <Caja v={4} col={ROJO} rgb="229,83,75" pulso={0.5} cy={560} escala={0.9} frame={0} />
    <Texto top={860} tam={84} peso={700} color={RC.crema}>
      Pero <Hilo color={ROJO}>cuesta.</Hilo>
    </Texto>
    <Texto top={990} tam={46}>cada llamada que sale mal</Texto>
    <Texto top={1052} tam={46}>es una venta que no vuelve.</Texto>
    <Pie />
  </Fondo>
);

// 3 · Ring Closers: la medalla de plata
export const C3: React.FC = () => (
  <Fondo>
    <Caja v={0} col={EM} rgb="52,211,153" pulso={0.2} cy={195} escala={0.4} frame={0} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 54, letterSpacing: "0.34em", textTransform: "uppercase", color: EM }}>Ring Closers</div>
    <Texto top={428} tam={48}>te deja probar, fallar y ajustar</Texto>
    <ObjetoCae src="historias/cash_50k-2x.png" ancho={520} x={540} y={800} en={0} brillo="rgba(190,225,210,0.22)" />
    <Texto top={1078} tam={44}>con otro closer de verdad,</Texto>
    <Texto top={1138} tam={44}>antes de que te cueste plata.</Texto>
    <Pie />
  </Fondo>
);

// 4 · Sin sistemas raros: la semana marcada y el sparring que llega
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const FRANJAS = ["MAÑ", "TAR", "NOC"];
const MARCADAS: [number, number][] = [[0, 1], [1, 2], [2, 0], [2, 2], [3, 2], [4, 1], [5, 0]];
const ELEGIDA: [number, number] = [3, 2];
export const C4: React.FC = () => (
  <Fondo>
    <Texto top={130} tam={78} peso={700} color={RC.crema}>Sin sistemas raros.</Texto>
    <div style={{ ...CARD, top: 290, height: 272 }}>
      <div style={{ position: "absolute", left: 40, top: 28, display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: EM }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: EM }} />
        TU SEMANA · DISPONIBILIDAD
      </div>
      {DIAS.map((d, i) => (
        <div key={d} style={{ position: "absolute", left: 150 + i * 96, top: 78, width: 84, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: "0.1em", color: RC.platino500 }}>{d}</div>
      ))}
      {FRANJAS.map((nombre, r) => (
        <div key={nombre} style={{ position: "absolute", left: 40, top: 118 + r * 44 + 6, fontFamily: MONO, fontWeight: 600, fontSize: 17, letterSpacing: "0.12em", color: RC.platino500 }}>{nombre}</div>
      ))}
      {DIAS.map((_, i) =>
        FRANJAS.map((__, r) => {
          const marcada = MARCADAS.some(([a, b]) => a === i && b === r);
          const elegida = i === ELEGIDA[0] && r === ELEGIDA[1];
          return (
            <div
              key={`${i}-${r}`}
              style={{
                position: "absolute",
                left: 150 + i * 96,
                top: 118 + r * 44,
                width: 84,
                height: 34,
                borderRadius: 11,
                backgroundColor: elegida ? "rgba(52,211,153,0.7)" : marcada ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.035)",
                border: `1px solid ${marcada ? "rgba(52,211,153,0.55)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: elegida ? "0 0 34px rgba(52,211,153,0.55)" : undefined,
              }}
            />
          );
        }),
      )}
    </div>
    {/* Hilo fino del casillero elegido a la tarjeta: lo que marcás se vuelve el sparring */}
    <div style={{ position: "absolute", left: 110 + 150 + 3 * 96 + 42 - 1, top: 562, width: 2, height: 96, background: `linear-gradient(180deg, ${EM}, rgba(52,211,153,0))` }} />
    <div style={{ ...CARD, top: 660, height: 230 }}>
      <div style={{ position: "absolute", left: 40, top: 34, display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: EM }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: EM }} />
        SPARRING · JUEVES 19:00
      </div>
      <div style={{ position: "absolute", left: 40, top: 86, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: RC.crema }}>Con un closer de tu nivel</div>
      <div style={{ position: "absolute", left: 40, top: 148, fontFamily: SANS, fontWeight: 500, fontSize: 27, color: RC.platino500 }}>Confirmás con un toque</div>
      <div style={{ position: "absolute", right: 36, top: 73, width: 250, height: 84 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 42, border: `2px solid ${EM}`, backgroundColor: EM }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, lineHeight: 1.2, letterSpacing: "0.14em", color: "#0a0a0c" }}>✓ LISTO</div>
      </div>
    </div>
    <Texto top={990} tam={48}>Marcás cuándo podés,</Texto>
    <Texto top={1054} tam={48}>y te llega con quién.</Texto>
    <Pie />
  </Fondo>
);

// 5 · La trayectoria: el currículum con números
export const C5: React.FC = () => (
  <Fondo>
    <Texto top={230} tam={82} peso={700} color={RC.crema}>Tu trayectoria,</Texto>
    <Texto top={334} tam={52}>con tus números,</Texto>
    <div style={{ ...CARD, top: 480, height: 380 }}>
      <div style={{ position: "absolute", left: 44, top: 34, fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: "0.26em", color: RC.platino500 }}>CURRÍCULUM</div>
      <div style={{ position: "absolute", right: 40, top: 30, padding: "4px 16px", border: `1px solid ${RC.tinta700}`, borderRadius: 999, fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: RC.platino500 }}>EJEMPLO</div>
      <div style={{ position: "absolute", left: 44, right: 44, top: 88, height: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
      <div style={{ position: "absolute", left: 44, top: 116, width: 330 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, lineHeight: 1.1, color: EM }}>34 %</div>
        <div style={{ marginTop: 8, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.1em", color: RC.platino500 }}>TASA DE CIERRE</div>
      </div>
      <div style={{ position: "absolute", left: 420, top: 116, width: 400 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, lineHeight: 1.1, color: EM, whiteSpace: "nowrap" }}>18.500</div>
        <div style={{ marginTop: 8, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.1em", color: RC.platino500 }}>MAYOR CASH COBRADO (USD)</div>
      </div>
    </div>
    <Texto top={950} tam={52}>queda guardada en tu perfil.</Texto>
    <Pie />
  </Fondo>
);

// 6 · Cierre: el odómetro en cero, esmeralda
export const C6: React.FC = () => (
  <Fondo>
    <Caja v={0} col={EM} rgb="52,211,153" pulso={0.45} cy={400} escala={0.98} frame={0} />
    <Texto top={760} tam={76} peso={700} color={RC.crema}>Practicá donde</Texto>
    <Texto top={852} tam={76} peso={700} color={RC.crema}>
      no te cuesta <Hilo color={EM}>un lead.</Hilo>
    </Texto>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1010, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 50px 20px 40px", borderRadius: 999, backgroundColor: RC.crema, color: "#0a0a0c", fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, lineHeight: 1.2, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        <svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 20V5M12 5l-6 6M12 5l6 6" fill="none" stroke="#0a0a0c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Link en la bio
      </div>
    </div>
    <Pie sigue={false} />
  </Fondo>
);
