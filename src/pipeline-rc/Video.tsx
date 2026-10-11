import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Capa, Ctx, Cam, cl, ease, rebote, sacudida, TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { DISPLAY, MONO, RC } from "../ring-closers/tema";

/**
 * "Actualizaciones RC #2: Pipeline del director" (10/10/2026), 60 fps, un solo plano continuo.
 * Cinco monolitos de vidrio (las etapas reales del pipeline) y UNA tarjeta de closer que viaja
 * entre ellos como una joya sobre un riel. Voz Callirrhoe en una sola toma corrida (voz.mp3,
 * sin silencios mayores a 0,26 s); cada golpe visual cae sobre la palabra medida con whisper.
 */
const VERDE = RC.esmeralda500;
export const DUR_PIPE = 1200;

// La voz arranca en el cuadro 30; s = segundos dentro de voz.mp3 (tiempos de faster-whisper).
const V0 = 30;
const w = (s: number) => V0 + Math.round(s * 60);

// ---------- el mundo ----------
const SEP = 700;                                  // distancia entre columnas
const CX = (i: number) => i * SEP;
const COL_W = 560, COL_H = 1100, COL_Y = 330;     // monolito: va de y -220 a 880
const CARD_Y = 120;                               // la tarjeta vive en la parte alta de la columna
const ETAPAS = ["Descubierto", "Contactado", "En charla", "Oferta", "Contratado"];
const CUENTA = [14, 9, 6, 3, 8];

// Saltos de la tarjeta: [despega, aterriza, de, a]. Aterriza justo sobre el verbo.
const SALTOS: [number, number, number, number][] = [
  [w(8.62), w(9.08), 0, 1],      // lo seguís
  [w(9.34), w(9.8), 1, 2],       // le escribís
  [w(10.06), w(10.52), 2, 3],    // le ofrecés
  [w(12.70), w(13.2), 3, 4],     // cuando firma
];
const ACCION = ["Seguido", "Mensaje enviado", "Oferta enviada", "Contrato firmado"];
const SELLO = SALTOS[3][1] + 6;
const LLEGA_COLS = w(5.3);       // "ahora": se arman las columnas
const ENTRA_TARJETA = w(6.78);   // "tarjeta": cae en Descubierto
const RASTRO = w(4.3);
const NADA = w(11.8);
const EQUIPO = w(14.44);
const LOGO = w(15.0);

// ---------- cámara ----------
type Llave = [number, number, number, number];
const LLAVES: Llave[] = [
  [0, 0, 60, -2900],
  [w(1.0), 0, 90, -1900],
  [w(4.0), 40, 110, -1700],                 // cerca de la tarjeta y su hilo de luz
  [w(4.9), 260, 120, -1800],
  [w(6.2), 700, 220, -2750],                // retrocede: aparecen las cinco columnas
  [w(7.9), 560, 190, -2450],
  [SALTOS[0][0], 420, 170, -2150],
  [SALTOS[2][1] + 10, CX(3) - 100, 150, -1950],
  [NADA - 10, CX(3) + 40, 130, -1750],      // empuja hacia la tarjeta: llega el cursor
  [SALTOS[3][0], CX(3) + 120, 140, -1900],
  [SELLO + 6, CX(4) + 20, 130, -1700],
  [EQUIPO + 20, CX(4) - 40, 120, -1800],
  [LOGO + 40, CX(3) + 120, -420, -3000],    // todo el pipeline, desde arriba
  [DUR_PIPE, CX(3) + 300, -640, -2300],           // empuja hasta el logo
];
const curva = Easing.inOut(Easing.cubic);
const llave = (t: number) => {
  let i = 0;
  while (i < LLAVES.length - 2 && t > LLAVES[i + 1][0]) i++;
  const [ta, xa, ya, za] = LLAVES[i], [tb, xb, yb, zb] = LLAVES[i + 1];
  const u = curva(Math.min(1, Math.max(0, (t - ta) / (tb - ta))));
  return { x: xa + (xb - xa) * u, y: ya + (yb - ya) * u, z: za + (zb - za) * u };
};
const camara = (t: number): Cam => {
  const k = llave(t);
  const z = k.z + 60 * rebote(t, SELLO, 9, 220) - 40 * rebote(t, ENTRA_TARJETA, 12, 160);
  const x = k.x + Math.sin(t / 95) * 14 + sacudida(t, SELLO, 7);
  const y = k.y + Math.sin(t / 75) * 9 + sacudida(t, SELLO + 1, 6);
  const giro = interpolate(t, [LLEGA_COLS - 20, LLEGA_COLS + 90, SALTOS[3][0], SELLO + 40, LOGO + 40], [0, 7, 4, 1.5, 0], { ...cl, easing: ease });
  const roll = (interpolate(t, [0, 90], [-6, 0], { ...cl, easing: ease }) + Math.sin(t / 120) * 0.5) * Math.PI / 180;
  const yaw = (giro + Math.sin(t / 110) * 1.2) * Math.PI / 180;
  const pitch = (Math.sin(t / 140) * 0.8 + interpolate(t, [EQUIPO, DUR_PIPE], [0, -3], { ...cl, easing: ease })) * Math.PI / 180;
  return { x, y, z, roll, yaw, pitch };
};
// plano de foco: todo borroso → la tarjeta → la frase → el logo
const foco = (t: number) => interpolate(t, [0, w(0.8), w(1.6), LOGO, LOGO + 60], [-500, -500, 0, 0, -200], { ...cl, easing: ease });

// ---------- la tarjeta ----------
const tarjeta = (t: number) => {
  // antes de la columna: flota entre las demás y se acerca
  if (t < ENTRA_TARJETA) {
    const a = interpolate(t, [0, w(1.4)], [0, 1], { ...cl, easing: ease });
    const cae = interpolate(t, [ENTRA_TARJETA - 30, ENTRA_TARJETA], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
    return { x: 0, y: CARD_Y + (1 - a) * 160 + Math.sin(t / 40) * 10 * (1 - cae), z: 700 * (1 - a) - 60 * (1 - cae), col: 0, rot: (1 - a) * -6 + Math.sin(t / 55) * 1.2 * (1 - cae), salto: 0 };
  }
  let x = 0, col = 0, y = CARD_Y, z = 0, rot = 0, salto = 0;
  for (const [a, b, de, hacia] of SALTOS) {
    if (t >= b) { x = CX(hacia); col = hacia; continue; }
    if (t > a) {
      const u = Easing.inOut(Easing.cubic)((t - a) / (b - a));
      x = CX(de) + (CX(hacia) - CX(de)) * u;
      col = u > 0.5 ? hacia : de;
      salto = Math.sin(Math.PI * u);
      y = CARD_Y - 70 * salto;
      z = -170 * salto;
      rot = 5 * Math.sin(Math.PI * 2 * u) * (1 - u);
    }
    break;
  }
  // asentamiento al aterrizar
  for (const [, b] of SALTOS) if (t >= b && t < b + 40) { const r = rebote(t, b, 9, 260); y += (1 - r) * -14; }
  return { x, y, z, col, rot, salto };
};
const brillo = (t: number, i: number) => {
  let v = 0;
  const llegada = i === 0 ? ENTRA_TARJETA : SALTOS.find(([, , , h]) => h === i)?.[1];
  const salida = SALTOS.find(([, , d]) => d === i)?.[0];
  if (llegada !== undefined && t >= llegada - 4) {
    const pico = interpolate(t, [llegada - 4, llegada + 2, llegada + 50], [0, 1, 0.32], cl);
    const apaga = salida !== undefined ? interpolate(t, [salida, salida + 24], [1, 0], cl) : 1;
    v = pico * apaga;
  }
  if (i === 4) v = Math.max(v, interpolate(t, [EQUIPO - 4, EQUIPO + 10, EQUIPO + 70], [0.32, 1, 0.55], cl) * (t >= EQUIPO - 4 ? 1 : 0));
  return v;
};

const Guante: React.FC<{ tam: number; anillo: string }> = ({ tam, anillo }) => (
  <div style={{ width: tam, height: tam, borderRadius: "50%", padding: 4, background: `conic-gradient(from 210deg, ${anillo}, rgba(255,255,255,0.08), ${anillo})`, flexShrink: 0 }}>
    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle at 40% 30%, #26262b, #0d0d0f)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("ring-closers/boxers/southpaw.webp")} style={{ width: "86%", height: "86%", objectFit: "contain", transform: "rotate(-12deg)" }} />
    </div>
  </div>
);

const Tarjeta: React.FC<{ t: number; col: number; luz: number; sello: number }> = ({ t, col, luz, sello }) => {
  const contratado = col === 4 && sello > 0;
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 26, padding: "30px 32px", boxSizing: "border-box",
      background: "linear-gradient(160deg, rgba(36,36,40,0.97), rgba(16,16,19,0.97))",
      border: `1.5px solid rgba(${contratado ? "52,211,153" : "255,255,255"},${0.12 + 0.35 * luz})`,
      boxShadow: `0 50px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.09), 0 0 ${60 + 60 * luz}px rgba(16,185,129,${0.1 + 0.32 * luz})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Guante tam={92} anillo={contratado ? "#34d399" : "rgba(212,212,216,0.55)"} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: "0.02em", color: "#f4f4f5", lineHeight: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>Zurdo Ríos</div>
          <div style={{ marginTop: 10, fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: "0.24em", color: "#a1a1aa" }}>CONTENDIENTE</div>
        </div>
        <div style={{ padding: "8px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", fontFamily: MONO, fontSize: 19, fontWeight: 600, color: "#d4d4d8" }}>1.840</div>
      </div>
      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))", margin: "26px 0 22px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative", height: 40, width: 260 }}>
          {ETAPAS.map((e, i) => {
            const op = i === col ? 1 : 0;
            return (
              <div key={e} style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 12, opacity: op }}>
                <span style={{ width: 11, height: 11, borderRadius: 6, background: i === 4 ? "#34d399" : "#10b981", boxShadow: "0 0 14px rgba(16,185,129,0.9)" }} />
                <span style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 28, color: "#ededee", letterSpacing: "-0.01em" }}>{e}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.28em", color: `rgba(167,243,208,${0.45 + 0.5 * luz})` }}>AUTO</div>
      </div>
    </div>
  );
};

// tarjeta fantasma (los otros closers de cada columna)
const Fantasma: React.FC<{ op: number }> = ({ op }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 24, opacity: op, background: "rgba(255,255,255,0.025)", border: "1.5px solid rgba(255,255,255,0.07)", padding: "34px 32px", boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ width: 80, height: 80, borderRadius: 40, background: "rgba(255,255,255,0.06)" }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "62%", height: 22, borderRadius: 6, background: "rgba(255,255,255,0.09)" }} />
        <div style={{ width: "38%", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.05)", marginTop: 14 }} />
      </div>
    </div>
    <div style={{ width: "44%", height: 16, borderRadius: 6, background: "rgba(255,255,255,0.05)", marginTop: 44 }} />
  </div>
);

// Monolito de vidrio
const Columna: React.FC<{ k: Ctx; i: number }> = ({ k, i }) => {
  const t = k.t;
  const en = LLEGA_COLS + i * 9;
  const r = rebote(t, en, 14, 120);
  const op = interpolate(t, [en - 2, en + 16], [0, 1], cl) * interpolate(t, [LOGO + 20, DUR_PIPE], [1, 0.75], cl);
  if (op <= 0) return null;
  const luz = brillo(t, i);
  const sweep = interpolate(t, [en + 10, en + 70], [0, 1], cl);
  const final = i === 4;
  const n = CUENTA[i] + (t >= ENTRA_TARJETA && tarjeta(t).col === i ? 1 : 0);
  return (
    <Capa k={k} x={CX(i)} y={COL_Y + (1 - r) * 520} z={(1 - r) * 300} w={COL_W} h={COL_H} op={op} dof={0.7}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 36, overflow: "hidden",
        background: `linear-gradient(180deg, rgba(255,255,255,${0.06 + 0.03 * luz}) 0%, rgba(255,255,255,0.018) 45%, rgba(16,185,129,${0.05 * luz}) 100%)`,
        border: `1.5px solid rgba(${luz > 0.05 ? "52,211,153" : "255,255,255"},${0.09 + 0.5 * luz})`,
        boxShadow: `0 0 ${80 * luz}px rgba(16,185,129,${0.35 * luz}), inset 0 1px 0 rgba(255,255,255,0.12)` }}>
        {/* filo superior de luz */}
        <div style={{ position: "absolute", left: 40, right: 40, top: 0, height: 2, background: `linear-gradient(90deg, transparent, rgba(${luz > 0.05 ? "110,231,183" : "255,255,255"},${0.25 + 0.7 * luz}), transparent)` }} />
        <div style={{ position: "absolute", left: 40, right: 40, top: 46, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 21, letterSpacing: "0.3em", color: final ? "rgba(110,231,183,0.95)" : `rgba(212,212,216,${0.7 + 0.3 * luz})` }}>{ETAPAS[i].toUpperCase()}</span>
          <span style={{ fontFamily: MONO, fontSize: 21, color: "rgba(161,161,170,0.8)" }}>{String(n).padStart(2, "0")}</span>
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 96, height: 1, background: "rgba(255,255,255,0.08)" }} />
        {/* reflejo que barre al armarse */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, transparent ${-30 + 140 * sweep}%, rgba(255,255,255,0.09) ${-20 + 140 * sweep}%, transparent ${-8 + 140 * sweep}%)` }} />
      </div>
      {/* charco de luz al pie */}
      <div style={{ position: "absolute", left: "10%", right: "10%", bottom: -50, height: 100, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(16,185,129,${0.35 * luz}), transparent 70%)` }} />
    </Capa>
  );
};

// Sello de "Contratado": dos anillos finos, check y texto en círculo
const Sello: React.FC<{ t: number }> = ({ t }) => {
  const r = rebote(t, SELLO, 10, 240);
  const op = interpolate(t, [SELLO - 3, SELLO + 2], [0, 1], cl);
  const onda = interpolate(t, [SELLO, SELLO + 45], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const giro = (t - SELLO) * 0.25;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 220, height: 220, opacity: op, transform: `scale(${2.3 - 1.3 * r}) rotate(-10deg)` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid rgba(52,211,153,${0.8 * (1 - onda)})`, transform: `scale(${1 + 0.9 * onda})` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,40,30,0.96) 55%, rgba(6,30,24,0.9))", border: "2px solid #34d399", boxShadow: "0 0 50px rgba(16,185,129,0.55), 0 20px 50px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", inset: 14, borderRadius: "50%", border: "1px solid rgba(52,211,153,0.6)" }} />
      <svg width={220} height={220} viewBox="0 0 220 220" style={{ position: "absolute", inset: 0, transform: `rotate(${giro}deg)` }}>
        <defs><path id="circSello" d="M110,110 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
        <text fill="#6ee7b7" style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.32em", fontWeight: 600 }}>
          <textPath href="#circSello">CONTRATADO · RING CLOSERS · CONTRATADO · RING CLOSERS ·</textPath>
        </text>
      </svg>
      <svg width={220} height={220} viewBox="0 0 220 220" style={{ position: "absolute", inset: 0 }}>
        <path d="M84 112 l18 18 l36 -40" fill="none" stroke="#34d399" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={90} strokeDashoffset={90 * (1 - interpolate(t, [SELLO + 4, SELLO + 18], [0, 1], { ...cl, easing: ease }))} />
      </svg>
    </div>
  );
};

const Cursor: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.6))" }}>
    <path d="M4 2.5 L4 19 L8.6 14.8 L11.6 21.5 L14.4 20.3 L11.5 13.8 L17.8 13.6 Z" fill="#fafaf9" stroke="#0b0b0d" strokeWidth={1.2} strokeLinejoin="round" />
  </svg>
);

const Chip: React.FC<{ txt: string; verde?: boolean }> = ({ txt, verde }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, height: 66, padding: "0 28px", borderRadius: 33, whiteSpace: "nowrap",
    background: verde ? "rgba(6,40,30,0.92)" : "rgba(18,18,21,0.9)", border: `1.5px solid ${verde ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.12)"}`,
    boxShadow: "0 24px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    <span style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 30, color: "#ededee", letterSpacing: "-0.01em" }}>{txt}</span>
  </div>
);

// ---------- texto ----------
const Palabra: React.FC<{ t: number; en: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, en, children, style }) => {
  const r = rebote(t, en, 13, 160);
  const vis = interpolate(t, [en - 1, en + 7], [0, 1], cl);
  return (
    <span style={{ display: "inline-block", opacity: vis, transform: `translateY(${(1 - r) * 46}px) scale(${0.94 + 0.06 * r})`, filter: `blur(${(1 - vis) * 14}px)`, ...style }}>{children}</span>
  );
};
const acento = (t: number, en: number): React.CSSProperties => ({
  fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.19em", letterSpacing: "-0.02em", color: VERDE,
  textShadow: `0 0 40px rgba(16,185,129,${0.45 * interpolate(t, [en, en + 30], [1, 0.4], cl)})`,
});
const italica: React.CSSProperties = { fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.19em", letterSpacing: "-0.02em" };
type Pal = { p: string; s: number; ac?: boolean; it?: boolean };
const Frase: React.FC<{ k: Ctx; renglones: Pal[][]; hasta: number; tam?: number }> = ({ k, renglones, hasta, tam = 108 }) => {
  const t = k.t;
  const primera = w(renglones[0][0].s);
  const op = interpolate(t, [hasta - 2, hasta + 9], [1, 0], cl);
  if (t < primera - 30 || op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 250 + Math.sin(t / 80) * 6, opacity: op, filter: op < 1 ? `blur(${(1 - op) * 18}px)` : undefined, transform: `translateX(${Math.sin(t / 110) * 8}px)` }}>
      <div style={{ textAlign: "center", color: "#f4f4f5", fontFamily: TIGHT, fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.04 }}>
        {renglones.map((r, i) => (
          <div key={i}>{r.map((pal, j) => (
            <React.Fragment key={j}>{j > 0 && " "}<Palabra t={t} en={w(pal.s) - 2} style={pal.ac ? acento(t, w(pal.s)) : pal.it ? italica : undefined}>{pal.p}</Palabra></React.Fragment>
          ))}</div>
        ))}
      </div>
    </div>
  );
};

// ---------- la escena ----------
const Escena: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camara(t), fz: foco(t) };
  const tj = tarjeta(t);
  const sello = t >= SELLO - 3 ? 1 : 0;
  const luzTarjeta = Math.max(tj.salto, ...SALTOS.map(([, b]) => interpolate(t, [b - 2, b + 4, b + 40], [0, 1, 0], cl)), interpolate(t, [w(0.86), w(1.3), w(2.8)], [0, 0.8, 0.2], cl), t > SELLO ? 0.55 : 0);
  const dispersa = interpolate(t, [w(3.4), w(5.0)], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#040405", overflow: "hidden" }}>
      {/* resplandor esmeralda que sigue a la tarjeta */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at ${50 + Math.sin(t / 130) * 8}% ${62 + Math.sin(t / 90) * 4}%, rgba(16,185,129,${0.1 + 0.05 * Math.sin(t / 50)}), transparent 70%)` }} />

      {/* 1. la nube de closers: decenas de tarjetas desenfocadas */}
      {dispersa < 1 && Array.from({ length: 26 }, (_, i) => {
        const r = (n: number) => random(`nube-${i}-${n}`);
        const ang = r(5) * Math.PI * 2;
        const x = (r(1) - 0.5) * 2600 + Math.cos(ang) * 2200 * dispersa + Math.sin(t / 80 + i) * 14;
        const y = (r(2) - 0.5) * 2600 + 100 + Math.sin(ang) * 1800 * dispersa + Math.cos(t / 70 + i) * 12;
        const z = -500 + r(3) * 3400 + 1200 * dispersa;
        const op = interpolate(t, [0, 30 + r(4) * 40], [0, 0.9], cl) * (1 - dispersa);
        if (Math.abs(x) < 420 && Math.abs(y - CARD_Y) < 260 && z < 900) return null;   // deja libre a la protagonista
        return (
          <Capa key={i} k={k} x={x} y={y} z={z} w={520} h={290} op={op} rot={(r(6) - 0.5) * 16} dof={1.2}>
            <Fantasma op={1} />
          </Capa>
        );
      })}

      {/* 2. el hilo de luz: el rastro que después es el riel */}
      {(() => {
        const traza = interpolate(t, [RASTRO - 6, RASTRO + 70], [0, 1], { ...cl, easing: ease });
        if (traza <= 0) return null;
        const largo = CX(4) + 900;
        const op = interpolate(t, [LOGO + 20, DUR_PIPE], [1, 0.4], cl);
        return (
          <Capa k={k} x={-300 + largo / 2} y={CARD_Y} z={40} w={largo} h={40} op={op} dof={0.4}>
            <div style={{ position: "absolute", left: 0, top: 19, height: 2, width: `${traza * 100}%`,
              background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.9) 12%, rgba(110,231,183,0.9) 88%, rgba(110,231,183,0))", boxShadow: "0 0 18px rgba(16,185,129,0.8)" }} />
            <div style={{ position: "absolute", left: `calc(${traza * 100}% - 14px)`, top: 6, width: 28, height: 28, borderRadius: 14, opacity: traza < 1 ? 1 : 0,
              background: "radial-gradient(circle, #d1fae5, rgba(52,211,153,0.6) 40%, transparent 70%)" }} />
          </Capa>
        );
      })()}

      {/* 3. los cinco monolitos */}
      {[0, 1, 2, 3, 4].map((i) => <Columna key={i} k={k} i={i} />)}
      {/* los otros closers de cada columna */}
      {[0, 1, 2, 3, 4].map((i) => [0, 1].map((j) => {
        const en = LLEGA_COLS + i * 9 + 18 + j * 8;
        const op = interpolate(t, [en, en + 20], [0, j === 0 ? 0.75 : 0.4], cl) * interpolate(t, [LOGO + 20, DUR_PIPE], [1, 0.7], cl);
        if (op <= 0) return null;
        return (
          <Capa key={`${i}-${j}`} k={k} x={CX(i)} y={CARD_Y + 330 + j * 300 + (1 - rebote(t, en, 14, 140)) * 120} z={0} w={490} h={260} op={op} dof={0.7}>
            <Fantasma op={1} />
          </Capa>
        );
      }))}

      {/* la tarjeta protagonista */}
      <Capa k={k} x={tj.x} y={tj.y} z={tj.z} w={520} h={290} rot={tj.rot} op={interpolate(t, [4, 40], [0, 1], cl)} dof={0.8}>
        <Tarjeta t={t} col={tj.col} luz={luzTarjeta} sello={sello} />
        {t >= SELLO - 3 && (
          <div style={{ position: "absolute", right: -70, top: -96 }}><Sello t={t} /></div>
        )}
      </Capa>

      {/* acción de cada salto: chip que sube y se va */}
      {SALTOS.map(([, b, , h], i) => {
        if (t < b - 2 || t > b + 70) return null;
        const r = rebote(t, b, 12, 200);
        const op = interpolate(t, [b - 2, b + 6, b + 46, b + 70], [0, 1, 1, 0], cl);
        return (
          <Capa key={i} k={k} x={CX(h)} y={CARD_Y - 240 - 40 * r - interpolate(t, [b + 40, b + 70], [0, 40], cl)} z={-120} w={520} h={80} op={op} esc={0.9 + 0.1 * r} dof={0.5}>
            <div style={{ display: "flex", justifyContent: "center" }}><Chip txt={ACCION[i]} verde={i === 3} /></div>
          </Capa>
        );
      })}

      {/* 5. el cursor llega a arrastrarla... y ya está al día */}
      {(() => {
        const A = w(11.0), B = NADA + 4;
        if (t < A - 5 || t > NADA + 60) return null;
        const u = interpolate(t, [A, B], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
        const va = interpolate(t, [NADA + 18, NADA + 50], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
        const op = interpolate(t, [A - 5, A + 8], [0, 1], cl) * (1 - va);
        const x = CX(3) + 480 - 330 * u + 120 * va, y = CARD_Y + 520 - 430 * u + 260 * va;
        const tip = interpolate(t, [NADA - 2, NADA + 8], [0, 1], { ...cl, easing: ease }) * interpolate(t, [NADA + 50, NADA + 62], [1, 0], cl);
        return (
          <>
            <Capa k={k} x={CX(3)} y={CARD_Y - 240} z={-120} w={560} h={80} op={tip} esc={0.92 + 0.08 * rebote(t, NADA, 12, 200)} dof={0.5}>
              <div style={{ display: "flex", justifyContent: "center" }}><Chip txt="Ya está al día" /></div>
            </Capa>
            <Capa k={k} x={x} y={y} z={-200} w={64} h={64} op={op} dof={0.5}><Cursor /></Capa>
          </>
        );
      })()}

      {/* ===== frases ===== */}
      <Frase k={k} hasta={w(3.0)} renglones={[[{ p: "Encontrar", s: 0 }, { p: "closers", s: 0.86 }], [{ p: "ya", s: 1.64 }, { p: "no", s: 1.88 }, { p: "es", s: 2.06 }, { p: "el", s: 2.26 }, { p: "problema.", s: 2.4, it: true }]]} />
      <Frase k={k} hasta={w(5.1)} renglones={[[{ p: "El", s: 3.14 }, { p: "problema", s: 3.24 }, { p: "es", s: 3.56 }], [{ p: "seguirles", s: 3.76 }, { p: "el", s: 4.12 }, { p: "rastro.", s: 4.3, ac: true }]]} />
      <Frase k={k} hasta={w(7.36)} renglones={[[{ p: "Ahora", s: 5.26 }, { p: "cada", s: 5.44 }, { p: "closer", s: 5.8 }], [{ p: "tiene", s: 6.26 }, { p: "su", s: 6.58 }, { p: "tarjeta.", s: 6.78, it: true }]]} />
      <Frase k={k} hasta={w(8.66)} renglones={[[{ p: "Y", s: 7.4 }, { p: "avanza", s: 7.56 }, { p: "sola.", s: 7.9, ac: true }]]} tam={124} />
      <Frase k={k} hasta={w(11.1)} renglones={[[{ p: "Lo", s: 8.76 }, { p: "seguís,", s: 8.9 }, { p: "le", s: 9.58 }, { p: "escribís,", s: 9.62 }], [{ p: "le", s: 10.32 }, { p: "ofrecés.", s: 10.34, it: true }]]} tam={100} />
      <Frase k={k} hasta={w(12.5)} renglones={[[{ p: "Vos", s: 11.16 }, { p: "no", s: 11.32 }, { p: "cargás", s: 11.44 }], [{ p: "nada.", s: 11.8, ac: true }]]} tam={118} />
      <Frase k={k} hasta={w(15.0)} renglones={[[{ p: "Y", s: 12.3 }, { p: "cuando", s: 12.66 }, { p: "firma,", s: 12.88 }], [{ p: "ya", s: 13.6 }, { p: "es", s: 13.8 }, { p: "parte", s: 13.9 }, { p: "de", s: 14.22 }], [{ p: "tu", s: 14.44, ac: true }, { p: "equipo.", s: 14.56, ac: true }]]} tam={100} />

      {/* ===== logo ===== */}
      {(() => {
        const op = interpolate(t, [LOGO - 6, LOGO + 6], [0, 1], cl);
        if (op <= 0) return null;
        const c1 = w(15.12), c2 = w(16.4);
        return (
          <Capa k={k} x={CX(3) + 300} y={-1160} z={-250} w={1100} h={820} op={op} dof={0.3}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.55))", transform: `scale(${0.85 + 0.15 * rebote(t, LOGO, 12, 170)})` }}>
                <Logo size={300} dibujoEn={LOGO} />
              </div>
              <div style={{ marginTop: 40, fontFamily: TIGHT, fontWeight: 600, fontSize: 104, color: "#f4f4f5", letterSpacing: "-0.045em", lineHeight: 1, textAlign: "center", whiteSpace: "nowrap" }}>
                <Palabra t={t} en={c1}>Pipeline</Palabra>{" "}
                <Palabra t={t} en={w(15.62)} style={acento(t, w(15.62))}>del director</Palabra>
              </div>
              <div style={{ marginTop: 30, fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: "0.34em", color: "rgba(167,243,208,0.8)", whiteSpace: "nowrap",
                opacity: interpolate(t, [c2, c2 + 14], [0, 1], cl), transform: `translateY(${interpolate(t, [c2, c2 + 18], [18, 0], { ...cl, easing: ease })}px)` }}>
                RING CLOSERS · YA DISPONIBLE
              </div>
            </div>
          </Capa>
        );
      })()}
    </AbsoluteFill>
  );
};

const velocidad = (f: number) => {
  const a = camara(f - 0.5), b = camara(f + 0.5);
  const ta = tarjeta(f - 0.5), tb = tarjeta(f + 0.5);
  return Math.max(Math.hypot(b.x - a.x, b.y - a.y, (b.z - a.z) * 0.6) + Math.abs(b.roll - a.roll) * 1500, Math.abs(tb.x - ta.x) * 0.7);
};

export const VideoPipeline: React.FC = () => {
  const f = useCurrentFrame();
  const v = velocidad(f);
  const n = v > 40 ? 8 : v > 22 ? 6 : v > 9 ? 4 : 1;
  return (
    <AbsoluteFill style={{ background: "#040405" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={n === 1 ? f : f - 0.35 + (0.7 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="granoPipe"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 3)} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#granoPipe)" /></svg>
      <AbsoluteFill style={{ background: "#040405", opacity: interpolate(f, [0, 8], [1, 0], cl) }} />
      <Sequence from={V0}><Audio src={staticFile("voz-pipeline-rc/voz.mp3")} /></Sequence>
      <Audio src={staticFile("pipeline-rc/sonido.wav")} />
    </AbsoluteFill>
  );
};
