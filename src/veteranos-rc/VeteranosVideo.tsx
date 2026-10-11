import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Camara, DISPLAY, Firma, Fogonazo, MONO, RC, golpes } from "../elite-rc/dopamina";
import { Acabado, Destello as Bokeh } from "../secreto-rc/efectos";
import { E1, E2, E3, E4, E5, E6, ROJO } from "./escenas";
import { A, DESDE, DUR } from "./timeline";

/**
 * "El costo de aprender en vivo": video para closers veteranos (9:16).
 * El HÉROE es un odómetro mecánico de tambores 3D ("leads quemados"): ocupa el centro mientras duele
 * (rojo), se rebobina a cero cuando entra Ring Closers (esmeralda), se corre arriba mientras se
 * muestran los guantes y las tarjetas, y vuelve al centro en el cierre. Las estrellas desenfocadas
 * de la serie pasan de rojo a esmeralda con él. Sale mudo del render; la voz y la música van aparte.
 */
const ESCENAS = [
  { id: "e1-gancho", C: E1 },
  { id: "e2-hueso", C: E2 },
  { id: "e3-ring", C: E3 },
  { id: "e4-simple", C: E4 },
  { id: "e5-trayectoria", C: E5 },
  { id: "e6-cierre", C: E6 },
];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inOut = Easing.inOut(Easing.cubic);
const mezcla = (a: number, b: number, t: number) => a + (b - a) * t;

const INCS = [A("e1-gancho", "lead"), A("e2-hueso", "cuesta"), A("e2-hueso", "mal"), A("e2-hueso", "vuelve")];
const RESET = A("e3-ring", "Ring");
const S6 = DESDE("e6-cierre");
const HITS = [...INCS.map((t) => t - 1), RESET - 1, A("e3-ring", "con") + 1, A("e6-cierre", "lead") - 1];

// ── Odómetro: tres tambores de diez caras (cilindros en 3D) dentro de una caja de metal ──
const CARA = 190; // alto de una cara
const RADIO = CARA / 2 / Math.tan(Math.PI / 10);
const VENTANA = CARA * 1.55;

const Tambor: React.FC<{ v: number; color: string; vivo: boolean }> = ({ v, color, vivo }) => (
  <div style={{ position: "relative", width: 190, height: VENTANA, overflow: "hidden", perspective: 1000, background: "#050506", borderRadius: 14, boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", transformStyle: "preserve-3d" }}>
      {Array.from({ length: 10 }, (_, d) => {
        let cara = (((d - v) % 10) + 10) % 10;
        if (cara > 5) cara -= 10;
        const grados = cara * 36;
        if (Math.abs(grados) > 84) return null;
        const luz = Math.max(0, Math.cos((grados * Math.PI) / 180));
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: 0,
              top: (VENTANA - CARA) / 2,
              width: "100%",
              height: CARA,
              lineHeight: `${CARA}px`,
              textAlign: "center",
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: CARA * 0.98,
              color: vivo ? color : "rgba(250,250,249,0.3)",
              opacity: 0.05 + 0.95 * luz ** 3.2,
              textShadow: vivo ? `0 0 34px ${color}66` : undefined,
              transform: `translateZ(${-RADIO}px) rotateX(${-grados}deg) translateZ(${RADIO}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            {d}
          </div>
        );
      })}
    </div>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,6,1) 0%, rgba(5,5,6,0) 34%, rgba(5,5,6,0) 66%, rgba(5,5,6,1) 100%)" }} />
  </div>
);

const Tornillo: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x - 8, top: y - 8, width: 16, height: 16, borderRadius: 8, background: "radial-gradient(circle at 35% 30%, #6b6d75, #1a1b1e 70%)", boxShadow: "0 1px 2px rgba(0,0,0,0.7)" }} />
);

const Odometro: React.FC<{ frame: number }> = ({ frame }) => {
  const back = Easing.out(Easing.back(1.7));
  let v = INCS.reduce((s, t) => s + interpolate(frame, [t - 1, t + 8], [0, 1], { ...clamp, easing: back }), 0);
  v *= 1 - interpolate(frame, [RESET - 6, RESET + 18], [0, 1], { ...clamp, easing: inOut });
  const col = frame < INCS[0] - 1 ? RC.crema : frame < RESET + 8 ? ROJO : RC.esmeralda400;
  const rgb = frame < RESET + 8 ? "229,83,75" : "52,211,153";
  const pulso = Math.max(0, ...[...INCS, RESET + 10].map((t) => (frame >= t ? Math.exp(-(frame - t) / 8) : 0)));
  // posición: centro (900) → arriba y chico durante las escenas 3 a 5 → vuelve al centro (860) en el cierre
  const chico = interpolate(frame, [RESET - 12, RESET + 14], [0, 1], { ...clamp, easing: inOut });
  const vuelve = interpolate(frame, [S6 - 8, S6 + 14], [0, 1], { ...clamp, easing: inOut });
  const cy = mezcla(mezcla(900, 450, chico), 860, vuelve);
  const escala = mezcla(mezcla(1, 0.52, chico), 1, vuelve);
  return <Caja v={v} col={col} rgb={rgb} pulso={pulso} cy={cy} escala={escala} frame={frame} />;
};

/** La caja de metal con los tres tambores (también la usa la portada, con `frame` en 0). */
export const Caja: React.FC<{ v: number; col: string; rgb: string; pulso: number; cy: number; escala: number; frame: number }> = ({ v, col, rgb, pulso, cy, escala, frame }) => {
  return (
    <div style={{ position: "absolute", left: 540 - 350, top: cy - 215, width: 700, height: 430, transform: `scale(${escala})`, transformOrigin: "50% 50%" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 40,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "linear-gradient(145deg,#33343a 0%,#17181b 38%,#0d0d0f 60%,#26272c 100%)",
          boxShadow: `0 40px 90px rgba(0,0,0,0.65), 0 0 ${60 + 80 * pulso}px rgba(${rgb},${0.1 + 0.35 * pulso}), inset 0 2px 0 rgba(255,255,255,0.18), inset 0 -2px 0 rgba(0,0,0,0.6)`,
        }}
      />
      <Tornillo x={30} y={30} />
      <Tornillo x={670} y={30} />
      <Tornillo x={30} y={400} />
      <Tornillo x={670} y={400} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: DISPLAY, fontWeight: 500, fontSize: 28, letterSpacing: "0.36em", color: RC.platino500, textShadow: "0 1px 0 rgba(255,255,255,0.08)" }}>LEADS QUEMADOS</div>
      <div style={{ position: "absolute", left: 34, top: 84, width: 632, height: VENTANA + 14, borderRadius: 26, background: "#020203", boxShadow: "inset 0 4px 14px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.1)", padding: 7 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 0 }}>
          <Tambor v={0} color={col} vivo={false} />
          <Tambor v={0} color={col} vivo={false} />
          <Tambor v={v} color={col} vivo />
        </div>
        <div style={{ position: "absolute", inset: 7, borderRadius: 20, pointerEvents: "none", background: "linear-gradient(115deg, rgba(255,255,255,0.1), rgba(255,255,255,0) 38%, rgba(255,255,255,0.05) 62%, rgba(255,255,255,0))" }} />
      </div>
      {INCS.map((t, i) => {
        const d = frame - t;
        if (d < 0 || d > 24) return null;
        return (
          <div key={i} style={{ position: "absolute", right: 46, top: 96 - d * 2.4, opacity: 1 - d / 24, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: ROJO }}>
            +1
          </div>
        );
      })}
    </div>
  );
};

const Fondo: React.FC<{ frame: number }> = ({ frame }) => {
  const mez = interpolate(frame, [RESET - 10, RESET + 10], [0, 1], clamp);
  const rgb = [0, 1, 2].map((i) => Math.round([229, 83, 75][i] + ([52, 211, 153][i] - [229, 83, 75][i]) * mez)).join(",");
  const hue = 205 * (1 - mez); // las estrellas de la serie son esmeralda: se llevan a rojo mientras duele
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 800px 900px at 50% 0px, rgba(255,255,255,0.05), rgba(0,0,0,0) 70%), radial-gradient(ellipse 950px 900px at 50% 1000px, rgba(${rgb},0.16), rgba(0,0,0,0) 70%), radial-gradient(ellipse 700px 500px at 50% 380px, rgba(${rgb},0.08), rgba(0,0,0,0) 70%), linear-gradient(180deg, #07080a, #0b0c0f 55%, #07080a)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, filter: `hue-rotate(${hue}deg)` }}>
        <Bokeh x={930} y={110} size={720} rot={18} blur={24} fase={0.4} opacidad={0.8} />
        <Bokeh x={90} y={1790} size={600} rot={-14} blur={28} fase={2.1} opacidad={0.66} />
        <Bokeh x={175} y={1010} size={110} rot={8} blur={2.5} fase={1.2} opacidad={0.5} />
      </div>
    </>
  );
};

export const VeteranosVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const g = golpes(frame, HITS);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080a" }}>
      <Fondo frame={frame} />
      <Camara g={g}>
        <Odometro frame={frame} />
        {ESCENAS.map(({ id, C }) => (
          <Sequence key={id} from={DESDE(id)} durationInFrames={DUR(id)}>
            <C dur={DUR(id)} />
          </Sequence>
        ))}
      </Camara>
      <Fogonazo nivel={g.flash * 0.8} color={frame < RESET ? "229,83,75" : "52,211,153"} />
      <Firma en={20} />
      <Acabado />
    </AbsoluteFill>
  );
};
