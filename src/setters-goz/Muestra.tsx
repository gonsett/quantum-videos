import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as cargarInter } from "@remotion/google-fonts/Inter";
import { loadFont as cargarNews } from "@remotion/google-fonts/Newsreader";
import { loadFont as cargarInstr } from "@remotion/google-fonts/InstrumentSerif";

/**
 * "Señal detectada" v2 — MUESTRA (04/10/2026). Lenguaje Gozmotion (ver memoria referencias-gozmotion):
 * papel claro con sombras de ventana, foto en blanco y negro con UN objeto en ámbar, frase chica en serif
 * que se tipea, palabra clave en otra voz (sans negra dentro de una caja de selección / itálica ámbar),
 * cámara que nunca se queda quieta y pasa de escena con paneo, no con corte.
 * La v1 (radar ámbar sobre negro, objetos 3D dorados) fue rechazada: "espantoso".
 */
const INTER = cargarInter("normal", { weights: ["800", "900"] }).fontFamily;
const NEWS = cargarNews("normal", { weights: ["400", "500"] }).fontFamily;
const INSTR = cargarInstr("italic").fontFamily;
const TINTA = "#151515", GRIS = "#2e2c2a", AMBAR = "#d97706";
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = 30;

type P = { palabra: string; t: number; fin: number };
// Tiempos de whisper (cache-palabras/voz-setters-rc), en segundos desde el arranque de cada toma.
const T1: P[] = [
  { palabra: "Durante", t: 0, fin: 0.76 }, { palabra: "años,", t: 0.76, fin: 1.26 }, { palabra: "todo", t: 1.7, fin: 1.92 },
  { palabra: "fue", t: 1.92, fin: 2.18 }, { palabra: "para", t: 2.18, fin: 2.36 }, { palabra: "los", t: 2.36, fin: 2.58 },
];
const T2: P[] = [
  { palabra: "Pero", t: 0, fin: 0.46 }, { palabra: "ninguna", t: 0.46, fin: 1 }, { palabra: "venta", t: 1, fin: 1.54 },
  { palabra: "empieza", t: 1.54, fin: 1.8 }, { palabra: "en", t: 1.8, fin: 1.96 }, { palabra: "el", t: 1.96, fin: 2.1 },
];
export const V1 = 12, V2 = 140, DUR_MUESTRA = 262;
const CLOSERS = V1 + Math.round(2.58 * FPS) - 2; // la palabra clave aterriza un pelo antes de oírse
const CIERRE = V2 + Math.round(2.1 * FPS) - 2;
const PANEO = [116, 146];

// Máquina de escribir sincronizada con la voz: cada palabra se tipea mientras se dice.
const Tipeo: React.FC<{ f: number; desde: number; palabras: P[]; tam: number }> = ({ f, desde, palabras, tam }) => {
  let txt = "";
  let escribiendo = false;
  palabras.forEach((p, i) => {
    const a = desde + p.t * FPS, b = desde + Math.min(p.fin, p.t + 0.32) * FPS;
    const n = Math.round(interpolate(f, [a, b], [0, p.palabra.length], cl));
    if (n > 0) txt += (i ? " " : "") + p.palabra.slice(0, n);
    if (f >= a && f < b + 4) escribiendo = true;
  });
  const cursor = escribiendo || Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{ fontFamily: NEWS, fontSize: tam, color: GRIS, letterSpacing: "-0.01em", whiteSpace: "nowrap", height: tam * 1.25 }}>
      {txt}
      <span style={{ display: "inline-block", width: 3, height: tam * 0.95, marginLeft: 4, background: TINTA, verticalAlign: "-0.12em", opacity: cursor && txt ? 0.8 : 0 }} />
    </div>
  );
};

// La firma de Gozmotion: la palabra clave dentro de la caja de selección de un programa de diseño.
const Seleccion: React.FC<{ f: number; en: number; children: React.ReactNode; w: number; h: number }> = ({ f, en, children, w, h }) => {
  const t = f - en;
  const traza = interpolate(t, [-6, 4], [0, 1], { ...cl, easing: ease });
  const tir = spring({ frame: Math.max(0, t - 2), fps: FPS, config: { damping: 11, stiffness: 220 } });
  const palabra = interpolate(t, [0, 10], [0, 1], { ...cl, easing: ease });
  const per = 2 * (w + h);
  const esq = [[0, 0], [w, 0], [0, h], [w, h], [w / 2, 0], [w / 2, h]];
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <svg width={w + 40} height={h + 40} style={{ position: "absolute", left: -20, top: -20, overflow: "visible" }}>
        <rect x={20} y={20} width={w} height={h} fill="none" stroke={AMBAR} strokeWidth={2} strokeDasharray={`${per * traza} ${per}`} />
        {t >= 0 ? esq.map(([x, y], i) => (
          <rect key={i} x={20 + x - 9} y={20 + y - 9} width={18} height={18} fill="#fff" stroke={AMBAR} strokeWidth={2.5}
            style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scale(${tir})` }} />
        )) : null}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: palabra,
        filter: `blur(${(1 - palabra) * 14}px)`, transform: `scale(${1.14 - 0.14 * palabra})` }}>{children}</div>
    </div>
  );
};

// Destello de 4 puntas (el brillo de Gozmotion), en el metal del cinturón.
const Destello: React.FC<{ f: number; en: number; x: number; y: number; tam: number }> = ({ f, en, x, y, tam }) => {
  const t = f - en;
  const s = interpolate(t, [0, 5, 16], [0, 1, 0], cl);
  return (
    <svg width={tam} height={tam} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2, transform: `scale(${s}) rotate(${t * 3}deg)`, mixBlendMode: "screen" }}>
      <path d="M0,-50 C4,-8 8,-4 50,0 C8,4 4,8 0,50 C-4,8 -8,4 -50,0 C-8,-4 -4,-8 0,-50Z" fill="#fff6e0" />
      <circle r={9} fill="#fff" />
    </svg>
  );
};

export const MuestraGoz: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, PANEO, [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const velPan = Math.sin(pan * Math.PI); // para el desenfoque de movimiento del paneo
  // Escena 1: el closer sube desde abajo y la cámara empuja todo el tiempo.
  const e1 = interpolate(f, [0, 26], [0, 1], { ...cl, easing: ease });
  const empuje1 = interpolate(f, [0, PANEO[1]], [1, 1.07]);
  // Escena 2: el apretón de manos entra con el paneo y sigue empujando.
  const empuje2 = interpolate(f, [PANEO[0], DUR_MUESTRA], [1.1, 1]);
  const enfoque2 = interpolate(f, [PANEO[0] + 8, PANEO[1] + 6], [10, 0], cl);
  const sal1 = interpolate(f, [PANEO[0] - 4, PANEO[0] + 12], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const subraya = interpolate(f, [CIERRE + 4, CIERRE + 20], [0, 1], { ...cl, easing: ease });
  const cierreOp = interpolate(f, [CIERRE - 2, CIERRE + 10], [0, 1], { ...cl, easing: ease });
  const finOp = interpolate(f, [DUR_MUESTRA - 10, DUR_MUESTRA], [1, 0], cl);
  return (
    <AbsoluteFill style={{ background: "#ecebe8", overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="grano"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2)} />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.09 0" /></filter>
      </svg>
      {/* El papel con la luz de ventana: sombras de ventana y de hojas muy suaves, que derivan lento y se corren
          con el paneo más despacio que las fotos (profundidad). Nada de hojas nítidas: solo su sombra. */}
      <div style={{ position: "absolute", inset: -200, transform: `translateX(${-pan * 160 + f * 0.25}px)` }}>
        <Img src={staticFile("setters-goz/papel.jpg")} style={{ position: "absolute", left: 0, top: 380, width: 1700, height: 2140, objectFit: "cover",
          filter: "grayscale(1) blur(14px) contrast(0.8) brightness(1.08)", opacity: 0.32, mixBlendMode: "multiply" }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 260 + i * 330, top: -300, width: 230, height: 2900, background: "rgba(255,255,255,0.55)",
            transform: "rotate(28deg)", filter: "blur(38px)" }} />
        ))}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 40% 35%, rgba(255,255,255,0.35), transparent 70%)" }} />

      {/* ESCENA 1: el closer, en blanco y negro con el cinturón en ámbar */}
      <div style={{ position: "absolute", left: -110 - pan * 1100, top: 600, width: 1300, height: 1300, maskImage: "linear-gradient(180deg, transparent 0%, #000 14%, #000 100%)", WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 14%, #000 100%)", 
        transform: `translateY(${(1 - e1) * 90}px) scale(${empuje1})`, transformOrigin: "50% 80%",
        opacity: e1, filter: `blur(${(1 - e1) * 10 + velPan * 6}px)`, mixBlendMode: "multiply" }}>
        <Img src={staticFile("setters-goz/closer.jpg")} style={{ width: "100%", height: "100%", filter: "contrast(1.08)" }} />
      </div>
      <Sequence from={CLOSERS + 2} layout="none"><Destello f={f} en={CLOSERS + 2} x={765 - pan * 1100} y={1115} tam={150} /></Sequence>

      {/* ESCENA 2: el cierre (apretón de manos, la lapicera en ámbar) */}
      <div style={{ position: "absolute", left: 1300 - pan * 1390, top: 680, width: 1240, height: 1240, maskImage: "radial-gradient(ellipse 50% 46% at 50% 58%, #000 52%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 50% 46% at 50% 58%, #000 52%, transparent 100%)", 
        transform: `scale(${empuje2})`, transformOrigin: "50% 60%", filter: `blur(${enfoque2 + velPan * 6}px)`, mixBlendMode: "multiply" }}>
        <Img src={staticFile("setters-goz/cierre.jpg")} style={{ width: "100%", height: "100%", filter: "contrast(1.06)" }} />
      </div>

      {/* TEXTO 1 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center",
        opacity: 1 - sal1, transform: `translate(${-sal1 * 260}px, ${-sal1 * 30}px)`, filter: `blur(${sal1 * 12}px)` }}>
        <Tipeo f={f} desde={V1} palabras={T1} tam={52} />
        <div style={{ height: 34 }} />
        <Seleccion f={f} en={CLOSERS} w={640} h={170}>
          <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 150, letterSpacing: "-0.055em", color: TINTA, lineHeight: 1 }}>closers</span>
        </Seleccion>
      </div>

      {/* TEXTO 2 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center",
        opacity: interpolate(f, [V2 - 6, V2 + 2], [0, 1], cl) }}>
        <Tipeo f={f} desde={V2} palabras={T2} tam={52} />
        <div style={{ position: "relative", marginTop: 6, opacity: cierreOp, filter: `blur(${(1 - cierreOp) * 12}px)`, transform: `translateY(${(1 - cierreOp) * 24}px)` }}>
          <span style={{ fontFamily: INSTR, fontStyle: "italic", fontSize: 200, color: AMBAR, letterSpacing: "-0.02em", lineHeight: 1.05 }}>cierre.</span>
          <div style={{ position: "absolute", left: 6, bottom: 8, height: 3, width: `${subraya * 96}%`, background: AMBAR, opacity: 0.85 }} />
        </div>
      </div>

      {/* Viñeta suave + grano: papel fotografiado, no pantalla */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, rgba(60,55,50,0.22))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#grano)" /></svg>
      <AbsoluteFill style={{ background: "#ecebe8", opacity: 1 - finOp }} />

      <Sequence from={V1}><Audio src={staticFile("voz-setters-rc/01-anios.mp3")} /></Sequence>
      <Sequence from={V2}><Audio src={staticFile("voz-setters-rc/02-cierre.mp3")} /></Sequence>
      <Audio src={staticFile("setters-goz/sfx-muestra.wav")} volume={0.62} />
    </AbsoluteFill>
  );
};
