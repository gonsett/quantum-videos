import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Acabado } from "../secreto-rc/efectos";
import { DISPLAY, H, RC, W, mezclar, tramo } from "./base";
import { E1, E2, E3, E4, E5, E6 } from "./escenas";
import { BEAT, DESDE, DUR } from "./timeline";

/**
 * "El ascenso": video para closers novatos (9:16). La cámara sube de escena en escena atravesando
 * las sogas del ring; el fondo pasa del ámbar del cuero crudo al esmeralda de la marca justo cuando
 * entra Ring Closers (escena 3). Sale mudo del render; voz y música se mezclan aparte.
 */
const ESCENAS = [
  { id: "e1-gancho", C: E1 },
  { id: "e2-como", C: E2 },
  { id: "e3-conquien", C: E3 },
  { id: "e4-mas", C: E4 },
  { id: "e5-primero", C: E5 },
  { id: "e6-cierre", C: E6 },
];
const PAN = 14; // cuadros que tarda la cámara en subir de una escena a la siguiente
const ANTES = 10; // la subida arranca 10 cuadros antes del beat: la voz entra cuando la cámara ya asentó
const subida = Easing.bezier(0.7, 0, 0.2, 1);

const inicioPan = (i: number) => DESDE(ESCENAS[i].id) - ANTES;
/** Posición de la cámara en el "mundo" vertical: la escena i vive en y = i * H. */
const camara = (frame: number) => ESCENAS.reduce((y, _, i) => (i === 0 ? y : y + H * tramo(frame, inicioPan(i), inicioPan(i) + PAN, subida)), 0);

const frac = (x: number) => x - Math.floor(x);

/** Brasas que suben: el ascenso hecho ambiente. Deterministas. */
const Brasas: React.FC<{ frame: number; cam: number; mez: number }> = ({ frame, cam, mez }) => (
  <>
    {Array.from({ length: 38 }, (_, i) => {
      const r1 = frac(Math.sin(i * 12.9898) * 43758.5453);
      const r2 = frac(Math.sin(i * 78.233) * 12345.6789);
      const r3 = frac(Math.sin(i * 39.346) * 9876.543);
      const par = 0.15 + 0.5 * r3;
      const v = 18 + 60 * r2;
      const y = ((((r1 * 2200 - (frame / 30) * v - cam * par) % 2200) + 2200) % 2200) - 140;
      const x = (r2 * W + Math.sin(frame / 40 + i) * 14 + W) % W;
      const t = 2 + 4 * r3;
      const op = (0.14 + 0.42 * r1) * (0.6 + 0.4 * Math.sin(frame / 9 + i * 2));
      return <span key={i} style={{ position: "absolute", left: x, top: y, width: t, height: t, borderRadius: "50%", backgroundColor: mezclar(mez), opacity: op, filter: t > 4.5 ? "blur(1px)" : undefined }} />;
    })}
  </>
);

/** Tres sogas que cruzan la pantalla cuando la cámara sube, cada una a distinta velocidad (paralaje). */
const PARALAJE: [number, number, number][] = [
  [1.55, 10, -70],
  [1.0, 6, 0],
  [0.68, 4, 80],
];
const Sogas: React.FC<{ frame: number; cam: number; mez: number }> = ({ frame, cam, mez }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
    <defs>
      <linearGradient id="soga" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={mezclar(mez, 0)} />
        <stop offset="0.14" stopColor={mezclar(mez, 0.95)} />
        <stop offset="0.86" stopColor={mezclar(mez, 0.95)} />
        <stop offset="1" stopColor={mezclar(mez, 0)} />
      </linearGradient>
    </defs>
    {ESCENAS.slice(1).map((_, i) => {
      const p = tramo(frame, inicioPan(i + 1), inicioPan(i + 1) + PAN, (t) => t);
      if (p <= 0 || p >= 1) return null;
      const alfa = Math.sin(Math.PI * p) ** 1.3;
      return PARALAJE.map(([par, grosor, off], j) => {
        const ys = 960 + ((i + 1) * H + off - cam - 960) * par;
        return (
          <g key={`${i}-${j}`} opacity={alfa}>
            <path d={`M -40 ${ys} Q 540 ${ys + 26} 1120 ${ys}`} fill="none" stroke="url(#soga)" strokeWidth={grosor} strokeLinecap="round" />
            <path d={`M -40 ${ys - grosor * 0.35} Q 540 ${ys + 26 - grosor * 0.35} 1120 ${ys - grosor * 0.35}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} />
          </g>
        );
      });
    })}
  </svg>
);

/** Guía a la izquierda: una escalera fina con un punto que sube con la cámara. */
const Guia: React.FC<{ prog: number; mez: number }> = ({ prog, mez }) => {
  const yDot = 1500 - prog * 1200;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={42} y1={300} x2={42} y2={1500} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
      <line x1={42} y1={yDot} x2={42} y2={1500} stroke={mezclar(mez, 0.85)} strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={35} x2={49} y1={1500 - i * 240} y2={1500 - i * 240} stroke={prog * 5 >= i - 0.02 ? mezclar(mez, 0.9) : "rgba(255,255,255,0.22)"} strokeWidth={2} />
      ))}
      <circle cx={42} cy={yDot} r={17} fill={mezclar(mez, 0.2)} />
      <circle cx={42} cy={yDot} r={8} fill={mezclar(mez)} />
    </svg>
  );
};

export const NovatoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const y = camara(frame);
  const v = Math.abs(y - camara(frame - 1));
  const blur = Math.min(14, v * 0.03);
  const mez = tramo(y, H, 2 * H, (t) => t);
  const pulso = 1 + 0.011 * Math.exp(-(frame % BEAT) / 3.2);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080a" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="movimiento" x="-5%" y="-20%" width="110%" height="140%">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 900px 900px at 50% ${1150 - y * 0.02}px, ${mezclar(mez, 0.17)}, rgba(0,0,0,0) 70%), radial-gradient(ellipse 700px 500px at 50% 200px, ${mezclar(mez, 0.07)}, rgba(0,0,0,0) 70%), linear-gradient(180deg, #07080a, #0b0c0f 55%, #07080a)`,
        }}
      />
      <Brasas frame={frame} cam={y} mez={mez} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${pulso})`, filter: blur > 0.6 ? "url(#movimiento)" : undefined }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translateY(${-y}px)` }}>
          {ESCENAS.map((e, i) => {
            const d = DESDE(e.id);
            if (frame < d - ANTES - 2 || frame > d + DUR(e.id) + 6) return null;
            return (
              <div key={e.id} style={{ position: "absolute", left: 0, top: i * H, width: W, height: H }}>
                <e.C f={frame - d} />
              </div>
            );
          })}
        </div>
        <Sogas frame={frame} cam={y} mez={mez} />
      </div>
      <Guia prog={y / (5 * H)} mez={mez} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1545, textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 28, letterSpacing: "0.22em", color: RC.platino500, opacity: tramo(frame, 20, 34) }}>
        @RING.CLOSERS
      </div>
      <Acabado />
    </AbsoluteFill>
  );
};

