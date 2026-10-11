import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { Acabado } from "../secreto-rc/efectos";
import { DISPLAY, MONO, RC, SANS } from "../elite-rc/dopamina";

/**
 * Video para directores comerciales: "La firma" (26/09/2026). Lenguaje NUEVO, sin recursos de los
 * videos anteriores (ni estrellas, ni pestañas, ni objeto que cae): tormenta de currículums congelada
 * en el aire, haz de escaneo esmeralda que revela lo que el closer HACE debajo del papel, destello
 * anamórfico y serif cursiva para la palabra clave. Este archivo es el fotograma de muestra del escaneo.
 * Render: `remotion still src/index.ts Muestra-Directores out/directores/muestra.png --frame=0`.
 */
const { fontFamily: SERIF } = cargarSerif("italic");
const EM = RC.esmeralda400;

const azar = (s: number) => () => {
  s = (s * 16807) % 2147483647;
  return s / 2147483647;
};

// Hojas congeladas en el aire: profundidad = tamaño + desenfoque + luz.
const r = azar(11);
const HOJAS = Array.from({ length: 16 }, () => ({ x: r() * 1180 - 50, y: r() * 1900, z: r(), rot: (r() - 0.5) * 70, ry: (r() - 0.5) * 80 }));

const Hoja: React.FC<{ x: number; y: number; z: number; rot: number; ry: number }> = ({ x, y, z, rot, ry }) => {
  const w = 120 + z * 260;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.65, width: w, height: w * 1.3, borderRadius: 4, background: "linear-gradient(160deg,#d9dade,#8e9096)", opacity: 0.05 + z * 0.15, filter: `blur(${(1 - z) * 9 + 1.5}px)`, transform: `perspective(900px) rotateY(${ry}deg) rotate(${rot}deg)`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      {[0.14, 0.24, 0.32, 0.4, 0.5, 0.58].map((t, i) => (
        <div key={i} style={{ position: "absolute", left: "12%", top: `${t * 100}%`, width: i === 0 ? "46%" : `${58 + ((i * 17) % 25)}%`, height: Math.max(2, w * 0.018), background: "rgba(40,40,46,0.55)" }} />
      ))}
    </div>
  );
};

// Latido: una espiga por semana de racha.
const latido = (() => {
  const pts: string[] = ["M0,60"];
  for (let i = 0; i < 12; i++) {
    const x0 = 20 + i * 52;
    pts.push(`L${x0},60 L${x0 + 10},60 L${x0 + 16},${30 - (i % 3) * 8} L${x0 + 23},92 L${x0 + 30},18 L${x0 + 37},60`);
  }
  pts.push("L640,60");
  return pts.join(" ");
})();

const CORTE = 610; // dónde pasa el haz, en coordenadas de la hoja

export const MuestraDirectores: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#050506" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 900px 700px at 50% 1000px, rgba(52,211,153,0.10), rgba(0,0,0,0) 70%), linear-gradient(180deg,#050506,#0a0b0c 50%,#050506)" }} />
    {HOJAS.map((h, i) => (
      <Hoja key={i} {...h} />
    ))}

    <div style={{ position: "absolute", top: 262, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 44, color: RC.platino300 }}>
      No ves lo que dice. <span style={{ color: RC.crema, fontWeight: 700 }}>Ves lo que hace.</span>
    </div>

    {/* La hoja escaneada. */}
    <div style={{ position: "absolute", left: 180, top: 380, width: 720, height: 960, transform: "perspective(1400px) rotateY(-7deg) rotateX(4deg) rotate(-1.5deg)", boxShadow: "0 60px 120px rgba(0,0,0,0.85)" }}>
      {/* Papel: lo que dice. */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: "linear-gradient(165deg,#eceae5,#c9c7c1)", clipPath: `inset(${CORTE}px 0 0 0)` }}>
        {[650, 690, 730, 770].map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 60, top: t, width: [420, 560, 500, 380][i], height: 10, borderRadius: 2, background: "rgba(40,40,46,0.35)" }} />
        ))}
        <div style={{ position: "absolute", left: 60, top: 810, fontFamily: SERIF, fontStyle: "italic", fontSize: 58, color: "#3a3a40" }}>“Cierro todo.”</div>
        <div style={{ position: "absolute", right: 60, top: 900, fontFamily: MONO, fontSize: 18, letterSpacing: "0.14em", color: "#6a6a70" }}>CURRÍCULUM · 1 DE 40</div>
      </div>
      {/* Debajo del papel: lo que hace. */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: "linear-gradient(180deg,#07130f,#050807)", border: "1px solid rgba(52,211,153,0.25)", clipPath: `inset(0 0 ${960 - CORTE}px 0)` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(52,211,153,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.06) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", left: 40, top: 36, fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.22em", color: EM }}>● EN VIVO · RING CLOSERS</div>
        <svg width={640} height={110} style={{ position: "absolute", left: 40, top: 96, filter: `drop-shadow(0 0 8px ${EM})` }}>
          <path d={latido} fill="none" stroke={EM} strokeWidth={4} strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", left: 40, top: 222, display: "flex", alignItems: "baseline", gap: 22 }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.1, color: RC.crema }}>12</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: RC.platino300 }}>SEMANAS SEGUIDAS ENTRENANDO</span>
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 360, height: 1, background: "rgba(52,211,153,0.2)" }} />
        <div style={{ position: "absolute", left: 40, top: 392, display: "flex", alignItems: "center", gap: 14 }}>
          {[1, 1, 1, 1, 0.7].map((v, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 17, border: `2px solid ${EM}`, background: `linear-gradient(90deg, ${EM} ${v * 100}%, transparent ${v * 100}%)`, boxShadow: `0 0 12px rgba(52,211,153,0.6)` }} />
          ))}
          <span style={{ marginLeft: 16, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: RC.crema }}>4,7</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: RC.platino300 }}>/ 5 · SUS RIVALES</span>
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 470, height: 1, background: "rgba(52,211,153,0.2)" }} />
        <div style={{ position: "absolute", left: 40, top: 494, display: "flex", alignItems: "baseline", gap: 22 }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, lineHeight: 1.15, letterSpacing: "0.12em", background: "linear-gradient(180deg,#ffffff,#a9adb5 55%,#ffffff)", WebkitBackgroundClip: "text", color: "transparent" }}>CAMPEÓN</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: RC.platino300 }}>RANGO GANADO EN EL RING</span>
        </div>
      </div>
    </div>

    {/* Haz de escaneo + destello anamórfico. */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 380 + CORTE - 120, height: 120, background: "linear-gradient(180deg, rgba(52,211,153,0), rgba(52,211,153,0.16))", mixBlendMode: "screen" }} />
    <div style={{ position: "absolute", left: 120, right: 120, top: 380 + CORTE - 2, height: 4, background: "#d9fff0", boxShadow: `0 0 16px ${EM}, 0 0 50px ${EM}, 0 0 110px rgba(16,185,129,0.8)` }} />
    <div style={{ position: "absolute", left: -200, right: -200, top: 380 + CORTE - 14, height: 28, background: "radial-gradient(ellipse at center, rgba(180,255,230,0.55), rgba(52,211,153,0.15) 35%, rgba(0,0,0,0) 70%)", filter: "blur(4px)", mixBlendMode: "screen" }} />
    <div style={{ position: "absolute", left: 540 - 90, top: 380 + CORTE - 90, width: 180, height: 180, borderRadius: 90, background: "radial-gradient(circle, rgba(220,255,240,0.5), rgba(52,211,153,0) 65%)", mixBlendMode: "screen" }} />

    <div style={{ position: "absolute", top: 1390, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 44, color: RC.platino300 }}>
      Eso es <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 120, color: EM, textShadow: "0 0 40px rgba(16,185,129,0.45)" }}>hambre.</span>
    </div>
    <Acabado />
  </AbsoluteFill>
);
