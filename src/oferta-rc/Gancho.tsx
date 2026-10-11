/**
 * Gancho de "Secreto de contratación #1": "Cien postulantes. Ninguno sabe cerrar." (26/09/2026).
 * Javier: el primer cuadro tiene que ser "mega re contra épicamente dopamínico, no basicón".
 * Lluvia de guantes de cuero crudo (gente que nunca entrenó) con profundidad de campo real: los de adelante enormes y
 * desenfocados, los del fondo chicos. Cada guante que cae suma al contador y sacude la cámara según su cercanía.
 * En el 100 cae un guante gigante al frente: destello, onda expansiva en el piso, polvo, golpe de zoom, estrellas.
 * Después se corta la luz: todo se apaga salvo "Ninguno sabe cerrar".
 */
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { RC } from "../ring-closers/tema";
import { Acabado, Estrella, Palabras } from "./Muestra";

const SERIF = cargarSerif("italic").fontFamily;
const SANS = cargarManrope("normal", { weights: ["500", "800"] }).fontFamily;
const FONDO = "#070808";
const GUANTE = staticFile("ring-closers/shop/cuero-crudo.webp");

const N = 38;
const CAIDA = 9;

const r = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type G = { z: number; x: number; piso: number; tam: number; aterriza: number; rot0: number; rot1: number; blur: number };
const armarGuantes = (GOLPE: number): G[] => Array.from({ length: N }, (_, i) => {
  const z = r(i, 1) * (i % 6 === 0 ? 1 : 0.8); // pocos guantes al frente: que no tapen el golpe
  const tam = 110 + z * z * 520;
  return {
    z,
    x: 40 + r(i, 2) * 1000,
    piso: 1060 + z * 620,
    tam,
    // cada vez más seguidos: la lluvia acelera hacia el golpe
    aterriza: 4 + Math.sqrt((i + r(i, 3) * 0.8) / N) * (GOLPE - 8),
    rot0: -200 + r(i, 4) * 400,
    rot1: -40 + r(i, 5) * 80,
    blur: z > 0.82 ? 4 + (z - 0.82) * 50 : z < 0.2 ? 2.5 : 0,
  };
}).sort((a, b) => a.z - b.z);

const impulso = (dt: number) => (dt < 0 ? 0 : Math.exp(-dt * 0.45) * Math.cos(dt * 2.1));

const Guante: React.FC<{ g: G; f: number; apagado: number }> = ({ g, f, apagado }) => {
  const ini = g.aterriza - CAIDA;
  if (f < ini) return null;
  const cayendo = f < g.aterriza;
  const p = cayendo ? (f - ini) / CAIDA : 1;
  const y0 = -g.tam - 60;
  const dt = f - g.aterriza;
  const rebote = dt > 0 && dt < 14 ? -Math.abs(Math.sin(dt * 0.6)) * 70 * g.z * Math.exp(-dt * 0.3) : 0;
  const y = y0 + (g.piso - y0) * p * p + rebote;
  const rot = cayendo ? g.rot0 + (g.rot1 - g.rot0) * p : g.rot1 + Math.sin(dt * 0.5) * 6 * Math.exp(-dt * 0.2);
  const estira = cayendo ? `scale(${0.9}, ${1.18})` : dt < 3 ? `scale(${1.12 - dt * 0.04}, ${0.86 + dt * 0.047})` : "";
  const alto = Math.max(0, (g.piso - y) / 600);
  return (
    <>
      {/* sombra de contacto: crece y se oscurece a medida que el guante llega */}
      <div style={{ position: "absolute", left: g.x - g.tam * 0.4, top: g.piso + g.tam * 0.36, width: g.tam * 0.8, height: g.tam * 0.14,
        borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.85), transparent 70%)",
        opacity: interpolate(alto, [0, 1.5], [1, 0], cl), filter: `blur(${4 + g.blur}px)` }} />
      {cayendo && (
        <Img src={GUANTE} style={{ position: "absolute", left: g.x - g.tam / 2, top: y - g.tam / 2 - g.tam * 0.28, width: g.tam, height: g.tam,
          opacity: 0.25, transform: `rotate(${rot - 10}deg) scale(0.92,1.3)`, filter: `blur(${g.blur + 8}px) brightness(${1 - apagado * 0.8})` }} />
      )}
      <Img src={GUANTE} style={{ position: "absolute", left: g.x - g.tam / 2, top: y - g.tam / 2, width: g.tam, height: g.tam,
        transform: `rotate(${rot}deg) ${estira}`, transformOrigin: "50% 80%",
        filter: `blur(${g.blur + (cayendo ? 2 : 0)}px) brightness(${(0.55 + g.z * 0.5) * (1 - apagado * 0.82)}) saturate(${0.8 - apagado * 0.8}) drop-shadow(0 20px 30px rgba(0,0,0,0.6))` }} />
    </>
  );
};

/** golpe: cuadro en que cae el guante gigante (contador a 100); remate: entra "Ninguno sabe cerrar"; apagon: se corta la luz. */
export const GanchoOferta: React.FC<{ golpe?: number; remate?: number; apagon?: number; bajada?: boolean }> = ({ golpe = 50, remate, apagon, bajada = true }) => {
  const f = useCurrentFrame();
  const GOLPE = golpe;
  const APAGON = apagon ?? golpe + 26;
  const GUANTES = React.useMemo(() => armarGuantes(golpe), [golpe]);
  const { width } = useVideoConfig();

  const aterrizados = GUANTES.filter((g) => g.aterriza <= f).length;
  const cuenta = f >= GOLPE ? 100 : Math.min(99, Math.round((aterrizados / N) * 99));
  const ultimo = Math.max(-99, ...GUANTES.filter((g) => g.aterriza <= f).map((g) => g.aterriza));
  const tic = interpolate(f - ultimo, [0, 4], [1, 0], cl);

  // sacudida de cámara: suma de impulsos de cada aterrizaje, pesada por cercanía; el golpe final pesa mucho más
  let sx = 0, sy = 0;
  for (const g of GUANTES) {
    const k = impulso(f - g.aterriza) * g.z * g.z * 9;
    sx += k * (r(g.x, 7) - 0.5) * 2;
    sy += k;
  }
  sy += impulso(f - GOLPE) * 38;
  sx += impulso(f - GOLPE - 1) * 16;

  const zoom = 1 + interpolate(f, [GOLPE, GOLPE + 3, GOLPE + 22], [0, 0.09, 0.02], { ...cl, easing: Easing.out(Easing.cubic) }) + f * 0.0006;
  const destello = interpolate(f, [GOLPE, GOLPE + 1, GOLPE + 9], [0, 0.55, 0], cl);
  const apagado = interpolate(f, [APAGON, APAGON + 5], [0, 1], { ...cl, easing: Easing.out(Easing.quad) });

  // guante gigante del golpe
  const gIni = GOLPE - 7;
  const gp = interpolate(f, [gIni, GOLPE], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const gdt = f - GOLPE;
  const gy = -700 + (1330 + 700) * gp + (gdt > 0 && gdt < 16 ? -Math.abs(Math.sin(gdt * 0.5)) * 60 * Math.exp(-gdt * 0.28) : 0);
  const gEst = f < GOLPE ? "scale(0.92,1.15)" : gdt < 4 ? `scale(${1.14 - gdt * 0.035},${0.84 + gdt * 0.04})` : "";

  const onda = interpolate(f, [GOLPE, GOLPE + 18], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const numBrillo = interpolate(f, [GOLPE, GOLPE + 3, GOLPE + 20], [0, 1, 0.25], cl);

  return (
    <AbsoluteFill style={{ background: FONDO, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${zoom})` }}>
        {/* cono de luz de estudio + halo esmeralda que late con el golpe */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 50% at 50% 38%, #1d2120 0%, #0c0e0d 55%, transparent 100%)", opacity: 1 - apagado * 0.85 }} />
        <div style={{ position: "absolute", left: width / 2 - 520, top: 180, width: 1040, height: 700, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${RC.esmeralda500}${f >= GOLPE ? "40" : "1a"} 0%, transparent 65%)`, filter: "blur(30px)",
          opacity: (0.6 + numBrillo * 0.8) * (1 - apagado) }} />

        {/* el contador: pieza de metal platino detrás de la lluvia */}
        <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: 7, color: "#8a8a92", opacity: interpolate(f, [2, 10], [0, 1], cl) * (1 - apagado * 0.7) }}>
            POSTULANTES
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 330, lineHeight: 1, letterSpacing: -14, fontVariantNumeric: "tabular-nums",
            backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${RC.platino300} 38%, #5d5d64 62%, ${RC.platino300} 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            transform: `scale(${1 + tic * 0.035 + numBrillo * 0.06})`,
            filter: `drop-shadow(0 0 ${numBrillo * 40}px ${RC.esmeralda400}) brightness(${1 - apagado * 0.75})`,
            opacity: interpolate(f, [0, 6], [0, 1], cl) }}>
            {String(cuenta).padStart(3, "0")}
          </div>
        </div>

        {/* onda expansiva en el piso y polvo */}
        <div style={{ position: "absolute", left: width / 2 - 700 * onda, top: 1560 - 90 * onda - 130, width: 1400 * onda, height: 180 * onda, borderRadius: "50%",
          border: `3px solid ${RC.esmeralda400}`, opacity: (1 - onda) * 0.9, filter: "blur(2px)", boxShadow: `0 0 40px ${RC.esmeralda500}` }} />
        {f >= GOLPE && Array.from({ length: 26 }, (_, i) => {
          const d = f - GOLPE;
          const ang = Math.PI + r(i, 9) * Math.PI;
          const v = 18 + r(i, 10) * 30;
          const px = width / 2 + Math.cos(ang) * v * d * 1.4;
          const py = 1410 + Math.sin(ang) * v * d * 0.9 + 1.4 * d * d;
          return <div key={i} style={{ position: "absolute", left: px, top: py, width: 3 + r(i, 11) * 6, height: 3 + r(i, 11) * 6, borderRadius: "50%",
            background: i % 3 ? "#b8a58c" : RC.esmeralda400, opacity: interpolate(d, [0, 18], [0.9, 0], cl), filter: "blur(1px)" }} />;
        })}

        {GUANTES.filter((g) => g.z < 0.82).map((g, i) => <Guante key={i} g={g} f={f} apagado={apagado} />)}

        {GUANTES.filter((g) => g.z >= 0.82).map((g, i) => <Guante key={i} g={g} f={f} apagado={apagado} />)}
        {/* el guante gigante del golpe, al frente y en foco */}
        {f >= gIni && (
          <Img src={GUANTE} style={{ position: "absolute", left: width / 2 - 360, top: gy - 360, width: 720, height: 720,
            transform: `rotate(${interpolate(gp, [0, 1], [-60, -12])}deg) ${gEst}`, transformOrigin: "50% 85%",
            filter: `brightness(${1.05 - apagado * 0.8}) saturate(${0.85 - apagado * 0.8}) drop-shadow(0 50px 60px rgba(0,0,0,0.8)) blur(${f < GOLPE ? 3 : 0}px)` }} />
        )}

      </AbsoluteFill>

      <Estrella id="g1" desde={[-260, 60]} hasta={[120, 300]} size={420} rot={12} inicio={GOLPE} f={f} blur={4} />
      <Estrella id="g2" desde={[1350, 1900]} hasta={[960, 1500]} size={560} rot={-14} inicio={GOLPE + 2} f={f} blur={10} />
      <Estrella id="g3" desde={[1150, 200]} hasta={[900, 560]} size={100} rot={0} inicio={GOLPE + 6} f={f} blur={1.5} />

      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 70%, #ffffff, ${RC.esmeralda400} 60%)`, opacity: destello, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#000", opacity: apagado * 0.35 }} />

      {/* el remate: solo esto queda con luz */}
      <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center" }}>
        <Palabras texto="Ninguno sabe cerrar." desde={remate ?? GOLPE + 12} f={f} acento={["cerrar."]}
          style={{ fontFamily: SANS, fontWeight: 800, fontSize: 66, letterSpacing: -1.5, color: "#f4f4f5", textShadow: "0 6px 30px rgba(0,0,0,0.9)" }} />
        {bajada && <Palabras texto="y los tenés que entrevistar a todos" desde={APAGON + 2} f={f}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: RC.platino500, marginTop: 14 }} />}
      </div>
      <Acabado f={f} />
    </AbsoluteFill>
  );
};
