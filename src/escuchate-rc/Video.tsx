import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Brillo, Camara, Chispas, DISPLAY, Firma, Fogonazo, Frase, MONO, RC, SANS, golpes, pop } from "../elite-rc/dopamina";
import { SERIF } from "../historias-rc/como-funciona";
import { Logo } from "../reel-rc/logo";
import { Acabado, Destello as Bokeh } from "../secreto-rc/efectos";
import { G, INI, TOTAL } from "./timeline";

/**
 * "Escuchate" (Fathom en Ring Closers, 01/10/2026). Lenguaje propio: SALA DE GRABACIÓN.
 * El héroe es la ONDA de una llamada (barras de vidrio en perspectiva con reflejo de piso): el cliente
 * habla, tu respuesta está VACÍA (no la recordás), se desarma, se repite en tres llamadas; después una
 * grabadora de cinta de metal la guarda en la pelea, la onda vuelve entera, el cabezal encuentra la frase
 * y se corrige. Rojo mientras duele (e1-e3), esmeralda desde que se graba. Sale mudo; audio aparte.
 */
export const DURACION = TOTAL;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
const sale = Easing.out(Easing.cubic);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const iv = (f: number, a: number, b: number, from = 0, to = 1, e = io) => interpolate(f, [a, b], [from, to], { ...clamp, easing: e });
const ROJO = "229,83,75";
const VERDE = "52,211,153";

// ── Anclas (cuadros globales, salen de la voz) ─────────────────────────────
const S2 = INI("e2-nadie"), S3 = INI("e3-repetis"), S4 = INI("e4-mejores"), S5 = INI("e5-fathom");
const S6 = INI("e6-frase"), S7 = INI("e7-corregis"), S8 = INI("e8-cierre");
const W = {
  lo: G("e1-gancho", "lo"),
  pensar: G("e1-gancho", "pensar"),
  resp: G("e1-gancho", "respondiste"),
  exac: G("e1-gancho", "exactamente"),
  acordas: G("e2-nadie", "acordas"),
  nadie: G("e2-nadie", "nadie"),
  escuchas: G("e3-repetis", "escuchas"),
  repetis: G("e3-repetis", "repetis"),
  proxima: G("e3-repetis", "proxima"),
  llamada: G("e3-repetis", "llamada"),
  mejores: G("e4-mejores", "mejores"),
  revisan: G("e4-mejores", "revisan"),
  grabadas: G("e4-mejores", "grabadas"),
  ring: G("e5-fathom", "ring"),
  fathom: G("e5-fathom", "fathom"),
  graba: G("e5-fathom", "graba"),
  guardado: G("e5-fathom", "guardado"),
  pelea: G("e5-fathom", "pelea"),
  volves: G("e6-frase", "volves"),
  encontras: G("e6-frase", "encontras"),
  frase: G("e6-frase", "frase"),
  fue: G("e6-frase", "fue"),
  corregis: G("e7-corregis", "corregis"),
  practicando: G("e7-corregis", "practicando"),
  cliente: G("e7-corregis", "cliente"),
  escuchate: G("e8-cierre", "escuchate"),
  ringFin: G("e8-cierre", "ring"),
};
const STRIPS = [W.escuchas - 2, W.repetis - 2, W.proxima - 2];
export const HITS_ESCUCHATE = [
  1, W.pensar - 1, W.exac - 1, W.acordas - 1, W.nadie - 1, ...STRIPS, S4 + 1, W.mejores - 1, W.fathom - 1,
  W.graba - 1, W.pelea - 1, S6 + 1, W.encontras + 4, W.fue - 1, W.corregis - 1, W.cliente - 1, W.escuchate - 1, W.ringFin - 1,
];

// ── La onda ────────────────────────────────────────────────────────────────
const N = 56;
const CORTE = 31; // barras 0..30 = cliente; 31..55 = tu respuesta
/** Envolvente de habla determinista por barra (sílabas = jorobas). */
const env = (i: number, semilla = 0) => {
  const a = Math.abs(Math.sin(i * 0.61 + semilla)) * 0.55 + Math.abs(Math.sin(i * 0.23 + 1.3 + semilla)) * 0.45;
  const pausa = i === CORTE - 1 || i === CORTE ? 0.15 : 1;
  return (0.22 + 0.78 * a) * pausa;
};
const vivo = (i: number, f: number) => 0.72 + 0.28 * Math.sin(f * 0.33 + i * 1.13) * Math.sin(f * 0.19 + i * 0.47);

type Barra = { h: number; rgb: string; a: number; hueco?: boolean; glow?: number; dy?: number; dx?: number };

const Onda: React.FC<{ barras: Barra[]; cy: number; ancho: number; alto: number; cabezal?: number; cabezalRgb?: string; tilt: number; f: number }> = ({
  barras, cy, ancho, alto, cabezal, cabezalRgb = VERDE, tilt, f,
}) => {
  const paso = ancho / N;
  const bw = paso * 0.56;
  const fila = (reflejo: boolean) => (
    <div style={{ position: "absolute", left: 0, top: 0, width: ancho, height: alto, transform: reflejo ? `translateY(${alto * 0.98}px) scaleY(-1)` : undefined, opacity: reflejo ? 0.2 : 1, WebkitMaskImage: reflejo ? "linear-gradient(0deg, rgba(0,0,0,0.9), rgba(0,0,0,0) 55%)" : undefined }}>
      {barras.map((b, i) => {
        const h = Math.max(6, b.h * alto * 0.5);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * paso + (paso - bw) / 2 + (b.dx ?? 0),
              top: alto / 2 - h + (b.dy ?? 0),
              width: bw,
              height: h * 2,
              borderRadius: bw / 2,
              opacity: b.a,
              background: b.hueco ? "transparent" : `linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(${b.rgb},1) 22%, rgba(${b.rgb},0.85) 50%, rgba(${b.rgb},1) 78%, rgba(255,255,255,0.8) 100%)`,
              border: b.hueco ? `2px dashed rgba(${b.rgb},0.7)` : undefined,
              boxShadow: !b.hueco && (b.glow ?? 0) > 0 ? `0 0 ${18 * (b.glow ?? 0)}px rgba(${b.rgb},${0.55 * (b.glow ?? 0)})` : undefined,
            }}
          />
        );
      })}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 540 - ancho / 2, top: cy - alto / 2, width: ancho, height: alto, perspective: 1700 }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg) rotateY(${Math.sin(f / 70) * 7}deg)` }}>
        {fila(true)}
        {fila(false)}
        {cabezal !== undefined && (
          <div style={{ position: "absolute", left: cabezal * ancho - 2, top: -40, width: 4, height: alto + 80, background: `rgba(${cabezalRgb},1)`, boxShadow: `0 0 22px rgba(${cabezalRgb},0.9), 0 0 60px rgba(${cabezalRgb},0.4)` }}>
            <div style={{ position: "absolute", left: -13, top: -18, width: 0, height: 0, borderLeft: "15px solid transparent", borderRight: "15px solid transparent", borderTop: `20px solid rgba(${cabezalRgb},1)` }} />
          </div>
        )}
      </div>
    </div>
  );
};

/** Corchete fino alrededor del tramo de la respuesta (en vez de resaltador). */
const Corchete: React.FC<{ x0: number; x1: number; y: number; h: number; rgb: string; t: number; texto: string }> = ({ x0, x1, y, h, rgb, t, texto }) => {
  if (t <= 0) return null;
  const w = (x1 - x0) * t;
  return (
    <div style={{ position: "absolute", left: x0, top: y - h / 2, width: x1 - x0, height: h, opacity: Math.min(1, t * 2) }}>
      <svg width={x1 - x0} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={`M 18 0 L 0 0 L 0 ${h} L 18 ${h}`} stroke={`rgb(${rgb})`} strokeWidth={3} fill="none" />
        <path d={`M ${x1 - x0 - 18} 0 L ${x1 - x0} 0 L ${x1 - x0} ${h} L ${x1 - x0 - 18} ${h}`} stroke={`rgb(${rgb})`} strokeWidth={3} fill="none" />
        <line x1={0} y1={h + 18} x2={w} y2={h + 18} stroke={`rgba(${rgb},0.8)`} strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: h + 32, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.18em", color: `rgb(${rgb})`, textShadow: `0 0 18px rgba(${rgb},0.6)` }}>
        {texto}
      </div>
    </div>
  );
};

/** Cita hablada: serif itálica, entra con foco óptico (no se desliza). */
const Cita: React.FC<{ f: number; en: number; top: number; tam: number; etiqueta: string; etiquetaRgb?: string; texto: string; color?: string; salida?: number; brillo?: string }> = ({
  f, en, top, tam, etiqueta, etiquetaRgb = "161,161,170", texto, color = RC.crema, salida, brillo,
}) => {
  const p = pop(f, en, 200, 16);
  const vis = iv(f, en, en + 4, 0, 1, sale);
  const fuera = salida === undefined ? 0 : iv(f, salida, salida + 10);
  if (vis <= 0 || fuera >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, textAlign: "center", opacity: vis * (1 - fuera), transform: `translateY(${(1 - Math.min(p, 1)) * 30 + fuera * 40}px) scale(${0.9 + 0.1 * Math.min(p, 1.05)})`, filter: p < 0.9 || fuera > 0 ? `blur(${(1 - Math.min(p, 1)) * 10 + fuera * 10}px)` : undefined }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", color: `rgb(${etiquetaRgb})`, marginBottom: 14 }}>{etiqueta}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: tam, lineHeight: 1.12, color, textShadow: brillo ? `0 0 40px rgba(${brillo},0.45)` : "0 4px 30px rgba(0,0,0,0.6)" }}>{texto}</div>
    </div>
  );
};

// ── La tira de una llamada (escena 3) ───────────────────────────────────────
const Tira: React.FC<{ f: number; en: number; n: number; y: number; atras: number }> = ({ f, en, n, y, atras }) => {
  const t = iv(f, en, en + 7, 0, 1, sale);
  if (t <= 0) return null;
  const escala = lerp(1.35, 1, t) * (1 - atras * 0.1);
  const barras = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div style={{ position: "absolute", left: 90, top: y - 120, width: 900, height: 240, opacity: t * (1 - atras * 0.3), transform: `translateY(${-atras * 150}px) scale(${escala})`, filter: atras > 0 ? `blur(${atras * 2.5}px)` : undefined, borderRadius: 28, background: "linear-gradient(160deg, rgba(40,40,46,0.9), rgba(14,14,17,0.95))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
      <div style={{ position: "absolute", left: 32, top: 24, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.22em", color: RC.platino500 }}>LLAMADA {n}</div>
      <div style={{ position: "absolute", right: 32, top: 24, fontFamily: MONO, fontWeight: 500, fontSize: 24, color: RC.platino500 }}>14:07</div>
      {barras.map((i) => {
        const tuya = i >= 22;
        const h = (tuya ? 0.5 : env(i, n)) * 120;
        return (
          <div key={i} style={{ position: "absolute", left: 40 + i * 20.5, top: 140 - h / 2, width: 11, height: h, borderRadius: 6, background: tuya ? "transparent" : "linear-gradient(180deg,#e4e4e7,#71717a)", border: tuya ? `2px dashed rgba(${ROJO},0.85)` : undefined }} />
        );
      })}
      <div style={{ position: "absolute", left: 40 + 22 * 20.5 - 10, top: 66, width: 18 * 20.5 + 6, height: 148, border: `2px solid rgba(${ROJO},0.9)`, borderRadius: 12, boxShadow: `0 0 26px rgba(${ROJO},0.35)` }} />
    </div>
  );
};

// ── La grabadora de cinta (escenas 4-5) ─────────────────────────────────────
const Carrete: React.FC<{ x: number; y: number; r: number; giro: number; pack: number }> = ({ x, y, r, giro, pack }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2 }}>
    {/* cinta enrollada */}
    <div style={{ position: "absolute", left: r - r * pack, top: r - r * pack, width: r * 2 * pack, height: r * 2 * pack, borderRadius: "50%", background: "radial-gradient(circle, #2a1d14 0%, #160f0a 60%, #0b0806 100%)", boxShadow: "inset 0 0 18px rgba(0,0,0,0.9)" }} />
    {/* brida de metal con ventanas */}
    <div style={{ position: "absolute", inset: 0, transform: `rotate(${giro}deg)` }}>
      <svg width={r * 2} height={r * 2} viewBox="-100 -100 200 200">
        <defs>
          <radialGradient id="metalCarrete" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="45%" stopColor="#a1a1aa" />
            <stop offset="80%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#27272a" />
          </radialGradient>
          <mask id="ventanas">
            <rect x="-100" y="-100" width="200" height="200" fill="white" />
            {[0, 120, 240].map((a) => (
              <path key={a} transform={`rotate(${a})`} d="M -26 -86 A 90 90 0 0 1 26 -86 L 14 -30 A 32 32 0 0 0 -14 -30 Z" fill="black" />
            ))}
          </mask>
        </defs>
        <circle r="98" fill="url(#metalCarrete)" mask="url(#ventanas)" opacity="0.92" />
        <circle r="98" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <circle r="22" fill="#18181b" stroke="#71717a" strokeWidth="3" />
        {[0, 120, 240].map((a) => (
          <rect key={a} transform={`rotate(${a})`} x="-3" y="-21" width="6" height="9" fill="#a1a1aa" />
        ))}
      </svg>
    </div>
    {/* reflejo fijo (la luz no gira con el carrete) */}
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0) 40%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.1))", pointerEvents: "none" }} />
  </div>
);

const Vumetro: React.FC<{ x: number; y: number; nivel: number; rgb: string }> = ({ x, y, nivel, rgb }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 200, height: 110, borderRadius: 14, background: "linear-gradient(180deg,#e9e3d0,#cfc6ab)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.15)", overflow: "hidden" }}>
    <svg width={200} height={110} style={{ position: "absolute", inset: 0 }}>
      <path d="M 30 86 A 80 80 0 0 1 170 86" stroke="#3f3f46" strokeWidth={2} fill="none" />
      <path d="M 130 50 A 80 80 0 0 1 170 86" stroke={`rgb(${rgb})`} strokeWidth={5} fill="none" />
      <line x1={100} y1={104} x2={100 + Math.cos(Math.PI * (1 - (0.15 + 0.7 * nivel))) * 80} y2={104 - Math.sin(Math.PI * (1 - (0.15 + 0.7 * nivel))) * 80} stroke="#111" strokeWidth={2.5} />
      <circle cx={100} cy={104} r={7} fill="#111" />
    </svg>
  </div>
);

const Grabadora: React.FC<{ f: number; cy: number; escala: number; op: number; velocidad: number; rec: number; barrido: number }> = ({ f, cy, escala, op, velocidad, rec, barrido }) => {
  const giro = velocidad;
  const prog = 0.5 + 0.12 * Math.sin(f / 90);
  const nivel = (k: number) => Math.min(1, Math.max(0, 0.35 + 0.35 * Math.sin(f * 0.41 + k) * Math.sin(f * 0.23 + k * 2) + rec * 0.25));
  return (
    <div style={{ position: "absolute", left: 540 - 480, top: cy - 380, width: 960, height: 760, opacity: op, transform: `scale(${escala})`, transformOrigin: "50% 50%" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: "linear-gradient(160deg,#3a3b41 0%,#1b1c20 35%,#0e0e11 62%,#2c2d33 100%)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: `0 50px 110px rgba(0,0,0,0.75), 0 0 ${90 + 80 * rec}px rgba(${VERDE},${0.1 + 0.2 * rec}), inset 0 2px 0 rgba(255,255,255,0.18)` }} />
      {/* cepillado */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)" }} />
      {/* barrido especular */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 44, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, bottom: -200, width: 260, left: -400 + barrido * 1700, transform: "rotate(18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))" }} />
      </div>
      <Carrete x={240} y={250} r={190} giro={giro} pack={lerp(0.85, 0.45, prog)} />
      <Carrete x={720} y={250} r={190} giro={giro * 1.3} pack={lerp(0.45, 0.85, prog)} />
      {/* recorrido de la cinta */}
      <svg width={960} height={760} style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${240 - 190 * lerp(0.85, 0.45, prog)} 250 L 120 520 L 840 520 L ${720 + 190 * lerp(0.45, 0.85, prog)} 250`} stroke="#3b2a1d" strokeWidth={7} fill="none" />
        {Array.from({ length: 34 }, (_, i) => {
          const x = 140 + ((i * 21 + f * 6 * (velocidad > 0 ? 1 : 0)) % 700);
          const h = 4 + env(i + Math.floor(f / 3)) * 10 * rec;
          return <rect key={i} x={x} y={520 - h / 2} width={4} height={h} rx={2} fill={`rgba(${VERDE},${0.25 + 0.75 * rec})`} />;
        })}
      </svg>
      {/* cabezal */}
      <div style={{ position: "absolute", left: 420, top: 490, width: 120, height: 70, borderRadius: 12, background: "linear-gradient(180deg,#d4d4d8,#52525b)", boxShadow: "0 6px 16px rgba(0,0,0,0.7)" }} />
      <Vumetro x={150} y={600} nivel={nivel(0)} rgb={ROJO} />
      <Vumetro x={610} y={600} nivel={nivel(1.7)} rgb={ROJO} />
      {/* REC */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 630, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: rec > 0.5 && Math.floor(f / 12) % 2 === 0 ? `rgb(${ROJO})` : "#3f1d1b", boxShadow: rec > 0.5 ? `0 0 26px rgba(${ROJO},0.9)` : undefined }} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: "0.2em", color: rec > 0.5 ? RC.crema : RC.platino500 }}>REC</div>
      </div>
    </div>
  );
};

/** Placa de Fathom (solo el nombre en texto: no usamos su logo). */
const PlacaFathom: React.FC<{ f: number; en: number; y: number; op: number }> = ({ f, en, y, op }) => {
  const p = pop(f, en, 220, 15);
  if (f < en - 2) return null;
  return (
    <div style={{ position: "absolute", left: 540 - 230, top: y, width: 460, height: 110, opacity: Math.min(1, (f - en + 2) / 4) * op, transform: `translateX(${(1 - Math.min(p, 1)) * 320}px)`, borderRadius: 26, background: "linear-gradient(160deg, rgba(52,52,58,0.92), rgba(16,16,19,0.96))", border: `1px solid rgba(${VERDE},0.35)`, boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(${VERDE},0.18)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 46, letterSpacing: "0.22em", color: RC.crema }}>FATHOM</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: RC.esmeralda400, boxShadow: `0 0 16px rgba(${VERDE},0.9)` }} />
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 22, color: RC.esmeralda400 }}>conectado</div>
      </div>
    </div>
  );
};

/** La tarjeta de la pelea con la grabación guardada. */
const Pelea: React.FC<{ f: number; en: number; y: number; escala: number; op: number; brillo: number }> = ({ f, en, y, escala, op, brillo }) => {
  const p = pop(f, en, 200, 14);
  if (f < en - 2) return null;
  return (
    <div style={{ position: "absolute", left: 90, top: y, width: 900, height: 300, opacity: Math.min(1, (f - en + 2) / 4) * op, transform: `translateY(${(1 - Math.min(p, 1)) * 140}px) scale(${escala * (0.94 + 0.06 * Math.min(p, 1.1))})`, transformOrigin: "50% 50%", borderRadius: 34, background: "linear-gradient(160deg, rgba(44,44,50,0.95), rgba(12,12,15,0.97))", border: `1px solid rgba(${VERDE},${0.2 + 0.5 * brillo})`, boxShadow: `0 40px 90px rgba(0,0,0,0.75), 0 0 ${40 + 70 * brillo}px rgba(${VERDE},${0.15 + 0.3 * brillo}), inset 0 1px 0 rgba(255,255,255,0.14)` }}>
      <div style={{ position: "absolute", left: 40, top: 32, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.26em", color: RC.platino500 }}>PELEA · OBJECIONES</div>
      <div style={{ position: "absolute", right: 40, top: 32, fontFamily: MONO, fontWeight: 500, fontSize: 22, color: RC.platino500 }}>HOY 19:30</div>
      <div style={{ position: "absolute", left: 40, top: 78, fontFamily: SANS, fontWeight: 700, fontSize: 50, color: RC.crema, letterSpacing: "-0.01em" }}>
        Vos <span style={{ color: RC.platino500, fontWeight: 400, fontSize: 36 }}>vs</span> Martina R.
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 178, height: 84, borderRadius: 20, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 20, paddingLeft: 18 }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: RC.esmeralda500, boxShadow: `0 0 ${20 + 30 * brillo}px rgba(${VERDE},0.8)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 0, height: 0, marginLeft: 5, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: "18px solid #06110c" }} />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: RC.crema }}>Grabación guardada</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, height: 50 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} style={{ width: 5, height: 8 + env(i, 2) * 38, borderRadius: 3, background: `rgba(${VERDE},${0.5 + 0.5 * brillo})` }} />
          ))}
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, color: RC.platino500, paddingRight: 22 }}>18:42</div>
      </div>
    </div>
  );
};

// ── Fondo y HUD ─────────────────────────────────────────────────────────────
const Fondo: React.FC<{ f: number }> = ({ f }) => {
  const mez = iv(f, S4 - 6, S4 + 10);
  const rgb = [0, 1, 2].map((i) => Math.round(lerp([229, 83, 75][i], [52, 211, 153][i], mez))).join(",");
  const hue = 205 * (1 - mez);
  const anillos = [...HITS_ESCUCHATE].filter((h) => f >= h && f - h < 40);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 900px 700px at 50% 860px, rgba(${rgb},0.17), rgba(0,0,0,0) 70%), radial-gradient(ellipse 800px 900px at 50% -100px, rgba(255,255,255,0.05), rgba(0,0,0,0) 70%), linear-gradient(180deg,#060709,#0b0c10 50%,#060709)` }} />
      {/* piso de estudio: rejilla en perspectiva que avanza */}
      <div style={{ position: "absolute", left: -400, right: -400, top: 1100, height: 900, perspective: 600, opacity: 0.5 }}>
        <div style={{ position: "absolute", inset: 0, transform: "rotateX(72deg)", transformOrigin: "50% 0%", backgroundImage: `linear-gradient(rgba(${rgb},0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(${rgb},0.16) 1px, transparent 1px)`, backgroundSize: "90px 90px", backgroundPosition: `0px ${(f * 3) % 90}px`, WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0) 80%)" }} />
      </div>
      {anillos.map((h) => {
        const d = (f - h) / 40;
        return <div key={h} style={{ position: "absolute", left: 540 - 900 * d, top: 860 - 900 * d, width: 1800 * d, height: 1800 * d, borderRadius: "50%", border: `2px solid rgba(${rgb},${0.35 * (1 - d)})` }} />;
      })}
      <div style={{ position: "absolute", inset: 0, filter: `hue-rotate(${hue}deg)` }}>
        <Bokeh x={940} y={160} size={680} rot={16} blur={24} fase={0.4} opacidad={0.75} />
        <Bokeh x={110} y={1760} size={600} rot={-12} blur={28} fase={2.1} opacidad={0.6} />
        <Bokeh x={160} y={420} size={120} rot={8} blur={3} fase={1.2} opacidad={0.45} />
      </div>
    </>
  );
};

const tc = (seg: number) => {
  const s = Math.max(0, seg);
  const m = Math.floor(s / 60), r = Math.floor(s % 60), c = Math.floor((s * 30) % 30);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}:${String(c).padStart(2, "0")}`;
};

/** Código de tiempo del "monitor": corre, se congela en la respuesta, rebobina al revisar. */
const tiempo = (f: number) => {
  if (f < W.resp) return 14 * 60 + 2 + f / 30;
  if (f < S4) return 14 * 60 + 7 + (W.resp - W.resp) / 30;
  if (f < W.volves) return 18 * 60 + 42;
  if (f < W.encontras) return lerp(18 * 60 + 42, 0, iv(f, W.volves - 4, W.volves + 14)) + iv(f, W.volves + 14, W.encontras, 0, 14 * 60 + 7);
  return 14 * 60 + 7 + Math.max(0, f - W.encontras - 10) / 30;
};

const HUD: React.FC<{ f: number }> = ({ f }) => {
  const rojo = f < S4;
  const rgb = rojo ? ROJO : VERDE;
  const etiqueta = f < S4 ? "LLAMADA 14 · CLIENTE" : f < S6 ? "SALA DE REVISIÓN" : f < S8 ? "REVISIÓN · PELEA" : "";
  if (f >= S8 + 6) return null;
  const glitch = f >= W.acordas && f < W.acordas + 8 ? Math.sin(f * 9) * 8 : 0;
  return (
    <div style={{ position: "absolute", left: 96, right: 96, top: 288, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.16em", color: RC.platino500, opacity: iv(f, 0, 4) * iv(f, S8, S8 + 6, 1, 0) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: `rgb(${rgb})`, opacity: Math.floor(f / 10) % 2 ? 1 : 0.35, boxShadow: `0 0 14px rgba(${rgb},0.9)` }} />
        {etiqueta}
      </div>
      <div style={{ color: RC.crema, transform: `translateX(${glitch}px)` }}>{tc(tiempo(f))}</div>
    </div>
  );
};

// ── El video ────────────────────────────────────────────────────────────────
export const EscuchateVideo: React.FC = () => {
  const f = useCurrentFrame();
  const g = golpes(f, HITS_ESCUCHATE);

  // --- estado de la onda ---
  const ondaVisible = f < S3 + 4 || (f >= S6 - 2 && f < S8 + 22);
  const entrada0 = (i: number) => iv(f, Math.abs(i - N / 2) * 0.28, Math.abs(i - N / 2) * 0.28 + 6, 0, 1, Easing.out(Easing.back(2)));
  const rehace = (i: number) => iv(f, S6 + Math.abs(i - N / 2) * 0.22, S6 + Math.abs(i - N / 2) * 0.22 + 7, 0, 1, Easing.out(Easing.back(2)));
  const deshace = (i: number) => iv(f, W.acordas - 2 + ((i * 37) % 17), W.acordas + 18 + ((i * 37) % 17), 0, 1, Easing.in(Easing.quad));
  const colapsa = iv(f, S8 - 2, S8 + 14);
  const habla = f < W.pensar + 14 ? 1 : 0.35;
  // en e6-e7 la respuesta ya está GRABADA (llena); en e7 se re-graba en esmeralda de izquierda a derecha
  const regraba = (i: number) => iv(f, W.corregis + (i - CORTE) * 0.9, W.corregis + (i - CORTE) * 0.9 + 6);
  const barras: Barra[] = Array.from({ length: N }, (_, i) => {
    const tuya = i >= CORTE;
    if (f < S6 - 2) {
      const e = entrada0(i);
      const d = f >= W.acordas - 2 ? deshace(i) : 0;
      if (!tuya) {
        const h = env(i) * e * (habla > 0.5 ? vivo(i, f) : 1);
        return { h: h * (1 - d * 0.6), rgb: "228,228,231", a: (1 - d) * (f < W.resp ? 1 : 0.75), glow: 0.3, dy: -d * 260 * (0.5 + ((i * 13) % 7) / 7), dx: d * Math.sin(i) * 40 };
      }
      const falta = iv(f, W.exac - 2, W.exac + 4);
      const parpadeo = f >= W.resp ? 0.55 + 0.45 * Math.sin(f * 0.9 + i) : 0.4;
      return { h: 0.42 * e, rgb: f >= W.exac - 2 ? ROJO : "161,161,170", a: e * parpadeo * (1 - d) * (0.6 + 0.4 * falta), hueco: true, dy: -d * 300, dx: d * Math.cos(i) * 50 };
    }
    // e6 en adelante
    const e = rehace(i);
    const c = 1 - colapsa;
    if (!tuya) return { h: env(i) * e * c, rgb: "212,212,216", a: (f >= W.encontras ? 0.45 : 1) * c + 0.0, glow: 0.2 };
    const r = regraba(i);
    const h = lerp(env(i, 4), env(i, 9) * 1.15, r) * e * c * (r > 0 && r < 1 ? 1.25 : 1);
    const rgb = f < W.frase - 2 ? "212,212,216" : r > 0.5 ? VERDE : ROJO;
    return { h, rgb, a: c, glow: f >= W.frase ? 0.9 : 0.2 };
  });
  // cabezal
  let cabezal: number | undefined;
  if (f < S2) cabezal = interpolate(f, [0, W.resp], [0.04, CORTE / N], clamp);
  else if (f >= S6 && f < S8) {
    if (f < W.volves) cabezal = 0.97;
    else if (f < W.volves + 14) cabezal = iv(f, W.volves - 2, W.volves + 14, 0.97, 0.02, Easing.inOut(Easing.quad));
    else if (f < W.encontras + 6) cabezal = iv(f, W.volves + 14, W.encontras + 6, 0.02, CORTE / N, Easing.out(Easing.cubic));
    else if (f < W.corregis) cabezal = CORTE / N;
    else cabezal = iv(f, W.corregis, W.corregis + 25 * 0.9 + 6, CORTE / N, 1, Easing.linear);
  }
  const ondaCy = f < S6 ? 860 : 900;
  const ondaAncho = 940;
  const xCorte0 = 540 - ondaAncho / 2 + (CORTE - 0.2) * (ondaAncho / N);
  const xCorte1 = 540 + ondaAncho / 2 - 4;

  // --- grabadora ---
  const gEntra = iv(f, S4 - 2, S4 + 9, 0, 1, sale);
  const gArriba = iv(f, W.guardado - 10, W.guardado + 8);
  const gFuera = iv(f, S6 - 4, S6 + 6);
  const gEscala = lerp(1.25, 1, gEntra) * lerp(1, 0.6, gArriba) * lerp(1, 1.6, gFuera);
  const gCy = lerp(lerp(1050, 860, gEntra), 560, gArriba);
  const rec = iv(f, W.graba - 2, W.graba + 3);
  const vel = (f - S4) * 3 + Math.max(0, f - W.graba) * 9;
  const barrido = iv(f, W.mejores - 2, W.mejores + 22, 0, 1, Easing.inOut(Easing.quad));

  // --- tarjeta de la pelea (e5 → zoom adentro en e6) ---
  const peleaZoom = iv(f, S6 - 6, S6 + 4, 1, 2.6, Easing.in(Easing.cubic));
  const peleaOp = iv(f, S6 - 2, S6 + 4, 1, 0);
  const peleaBrillo = Math.max(iv(f, W.pelea - 2, W.pelea + 4), 0) * (0.6 + 0.4 * Math.sin(f / 8));

  return (
    <AbsoluteFill style={{ backgroundColor: "#060709", overflow: "hidden" }}>
      <Fondo f={f} />
      <Camara g={g}>
        {/* fantasmas de otras llamadas (e2 "Nadie") */}
        {f >= W.nadie - 4 && f < S3 + 6 &&
          Array.from({ length: 8 }, (_, k) => {
            const col = k % 2, fila = Math.floor(k / 2);
            const t = iv(f, W.nadie - 4 + k * 1.5, W.nadie + 6 + k * 1.5, 0, 1, sale);
            const fuera = iv(f, S3 - 4, S3 + 6);
            return (
              <div key={k} style={{ position: "absolute", left: 120 + col * 450, top: 470 + fila * 210, width: 390, height: 130, opacity: t * 0.75 * (1 - fuera), transform: `scale(${lerp(0.6, 1, t)})`, filter: `blur(${1 + fila * 0.6}px)`, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(20,20,24,0.7)" }}>
                {Array.from({ length: 22 }, (_, i) => {
                  const tuya = i >= 13;
                  const h = (tuya ? 0.45 : env(i, k + 3)) * 80;
                  return <div key={i} style={{ position: "absolute", left: 18 + i * 16.5, top: 65 - h / 2, width: 8, height: h, borderRadius: 4, background: tuya ? "transparent" : "rgba(212,212,216,0.7)", border: tuya ? `1.5px dashed rgba(${ROJO},${0.9 - 0.6 * iv(f, W.nadie + 10 + k * 2, W.nadie + 24 + k * 2)})` : undefined }} />;
                })}
              </div>
            );
          })}

        {ondaVisible && <Onda barras={barras} cy={ondaCy} ancho={ondaAncho} alto={420} cabezal={cabezal} cabezalRgb={f < S6 ? (f >= W.exac ? ROJO : "228,228,231") : f >= W.corregis ? VERDE : "228,228,231"} tilt={14} f={f} />}

        {/* e1: el corchete "sin registro" */}
        {f < S2 + 4 && <Corchete x0={xCorte0} x1={xCorte1} y={ondaCy} h={330} rgb={ROJO} t={iv(f, W.exac - 2, W.exac + 8) * iv(f, W.acordas - 4, W.acordas + 4, 1, 0)} texto="TU RESPUESTA · SIN REGISTRO" />}
        {/* e6: el corchete encuentra la frase */}
        {f >= S6 && f < S8 && <Corchete x0={xCorte0} x1={xCorte1} y={ondaCy} h={330} rgb={f >= W.corregis + 10 ? VERDE : ROJO} t={iv(f, W.encontras + 4, W.encontras + 12) * iv(f, S8 - 6, S8, 1, 0)} texto={f >= W.corregis + 10 ? "14:07 · CORREGIDA" : "14:07 · ACÁ SE TE FUE"} />}

        {/* e3: la misma falla en tres llamadas */}
        {f >= S3 - 2 && f < S4 + 4 && (
          <div style={{ position: "absolute", inset: 0, opacity: iv(f, S4 - 4, S4 + 3, 1, 0), transform: `scale(${lerp(1, 0.7, iv(f, S4 - 4, S4 + 3))})` }}>
            {STRIPS.map((en, k) => {
              const atras = STRIPS.filter((e2, j) => j > k && f >= e2 + 2).length;
              return <Tira key={k} f={f} en={en} n={12 + k} y={880} atras={atras} />;
            })}
            {f >= W.llamada - 2 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: "0.24em", color: `rgb(${ROJO})`, textShadow: `0 0 20px rgba(${ROJO},0.6)`, opacity: iv(f, W.llamada - 2, W.llamada + 3), transform: `scale(${pop(f, W.llamada - 2)})` }}>
                EL MISMO ERROR · ×3
              </div>
            )}
          </div>
        )}

        {/* e4-e5: la grabadora */}
        {f >= S4 - 2 && f < S6 + 6 && <Grabadora f={f} cy={gCy} escala={gEscala} op={gEntra * iv(f, S6 - 2, S6 + 6, 1, 0)} velocidad={vel} rec={rec} barrido={barrido} />}
        {f >= S4 - 2 && f < S6 + 6 && <Brillo x={330} y={gCy - 260 * gEscala} en={W.mejores} tam={300} />}
        {f >= S5 && f < S6 + 4 && <PlacaFathom f={f} en={W.fathom - 3} y={lerp(1180, 900, gArriba)} op={iv(f, S6 - 6, S6, 1, 0)} />}
        {f >= S5 && f < S6 + 4 && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <line x1={540} y1={lerp(1180, 900, gArriba)} x2={540} y2={gCy + 380 * gEscala} stroke={`rgba(${VERDE},0.8)`} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-f * 2} opacity={iv(f, W.fathom, W.fathom + 8) * iv(f, S6 - 6, S6, 1, 0)} />
          </svg>
        )}
        {f >= W.guardado - 4 && f < S6 + 6 && <Pelea f={f} en={W.guardado - 2} y={1080} escala={peleaZoom} op={peleaOp} brillo={peleaBrillo} />}
        {f >= W.pelea - 2 && f < W.pelea + 28 && <Chispas x={540} y={1100} en={W.pelea - 1} n={30} semilla={11} />}
        {f >= W.pelea - 2 && f < W.pelea + 28 && <Brillo x={880} y={1110} en={W.pelea} tam={260} />}

        {/* citas */}
        <Cita f={f} en={W.lo - 3} top={430} tam={86} etiqueta="CLIENTE" texto="«Lo tengo que pensar.»" salida={S2 + 4} />
        <Cita f={f} en={W.volves - 2} top={420} tam={58} etiqueta="CLIENTE · 14:02" texto="«Lo tengo que pensar.»" color={RC.platino300} salida={S8 - 6} />
        <Cita f={f} en={W.frase - 2} top={1240} tam={60} etiqueta="VOS · 14:07" etiquetaRgb={ROJO} texto="«Dale, pensalo tranquilo y me avisás.»" salida={W.corregis + 2} />
        {f >= W.corregis - 2 && f < W.corregis + 12 && (
          <div style={{ position: "absolute", left: 150, top: 1372, height: 3, width: 780 * iv(f, W.corregis - 2, W.corregis + 3), background: `rgb(${ROJO})`, boxShadow: `0 0 12px rgba(${ROJO},0.8)` }} />
        )}
        <Cita f={f} en={W.corregis + 4} top={1240} tam={60} etiqueta="VOS · ROLEPLAY ✓" etiquetaRgb={VERDE} texto="«¿Qué es lo que tenés que pensar?»" brillo={VERDE} salida={S8 - 4} />
        {f >= W.encontras + 4 && f < W.encontras + 24 && <Brillo x={xCorte0 + 20} y={ondaCy - 160} en={W.encontras + 6} tam={240} />}
        {f >= W.cliente - 2 && f < W.cliente + 28 && <Chispas x={760} y={900} en={W.cliente - 1} n={26} semilla={5} />}

        {/* subtítulos chicos: solo donde la imagen no lo dice sola */}
        {f < S2 + 4 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <SeqFrase f={f} desde={0} lineas={[[{ t: "¿Qué", en: W.resp - 4 }, { t: "respondiste", en: W.resp }, { t: "exactamente?", en: W.exac, acento: true }]]} top={1390} tam={50} salida={S2 + 2} />
          </div>
        )}
        <SeqFrase f={f} desde={S2} lineas={[[{ t: "No", en: W.acordas - 6 }, { t: "te", en: W.acordas - 3 }, { t: "acordás.", en: W.acordas }], [{ t: "Nadie", en: W.nadie, acento: true }, { t: "se", en: W.nadie + 4 }, { t: "acuerda.", en: W.nadie + 8 }]]} top={1380} tam={50} salida={S3 + 2} />
        <SeqFrase f={f} desde={S3} lineas={[[{ t: "Lo", en: W.escuchas - 8 }, { t: "que", en: W.escuchas - 5 }, { t: "no", en: W.escuchas - 3 }, { t: "escuchás,", en: W.escuchas }], [{ t: "lo", en: W.repetis - 3 }, { t: "repetís.", en: W.repetis, acento: true }]]} top={1230} tam={50} salida={S4 - 2} />
        <SeqFrase f={f} desde={S4} lineas={[[{ t: "Los", en: W.mejores - 4 }, { t: "mejores", en: W.mejores }, { t: "revisan", en: W.revisan }], [{ t: "sus", en: W.revisan + 6 }, { t: "llamadas", en: W.grabadas - 8 }, { t: "grabadas.", en: W.grabadas, acento: true }]]} top={1350} tam={50} salida={S5 + 6} />
        <SeqFrase f={f} desde={S7} lineas={[[{ t: "Practicando,", en: W.practicando, acento: true }, { t: "no", en: W.cliente - 14 }, { t: "perdiendo", en: W.cliente - 8 }, { t: "un", en: W.cliente - 3 }, { t: "cliente.", en: W.cliente }]]} top={1430} tam={46} salida={S8 - 2} />

        {/* e8: cierre */}
        {f >= S8 && (
          <>
            <div style={{ position: "absolute", left: 540 - 520 * (1 - colapsa) - 6, top: 896, width: 1040 * (1 - colapsa) + 12, height: 4, background: RC.esmeralda400, boxShadow: `0 0 26px rgba(${VERDE},0.9)`, opacity: iv(f, S8, S8 + 4) * iv(f, S8 + 14, S8 + 22, 1, 0) }} />
            <div style={{ position: "absolute", left: 540 - 160, top: 640, width: 320, height: 320, opacity: iv(f, S8 + 10, S8 + 16), transform: `scale(${0.8 + 0.2 * Math.min(1, pop(f, S8 + 10))})` }}>
              <Logo size={320} dibujoEn={S8 + 10} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 120, color: RC.crema, opacity: iv(f, W.escuchate - 4, W.escuchate + 2), transform: `translateY(${(1 - Math.min(1, pop(f, W.escuchate - 4))) * 30}px)`, filter: f < W.escuchate + 2 ? `blur(${(1 - iv(f, W.escuchate - 4, W.escuchate + 2)) * 12}px)` : undefined, textShadow: "0 0 50px rgba(52,211,153,0.35)" }}>
              Escuchate.
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 40, letterSpacing: `${lerp(0.6, 0.34, iv(f, W.ringFin - 2, W.ringFin + 12))}em`, color: RC.platino300, opacity: iv(f, W.ringFin - 2, W.ringFin + 4) }}>
              RING CLOSERS
            </div>
            {f >= W.ringFin - 2 && f < W.ringFin + 30 && <Chispas x={540} y={800} en={W.ringFin - 1} n={36} semilla={3} />}
          </>
        )}
      </Camara>
      <HUD f={f} />
      <Fogonazo nivel={g.flash * 0.7} color={f < S4 ? ROJO : VERDE} />
      <Firma en={10} />
      <Acabado />
    </AbsoluteFill>
  );
};

/** Frase que solo existe en su tramo (para no dibujar todas las frases en todos los cuadros). */
const SeqFrase: React.FC<{ f: number; desde: number; lineas: React.ComponentProps<typeof Frase>["lineas"]; top: number; tam: number; salida: number }> = ({ f, desde, lineas, top, tam, salida }) => {
  if (f < desde - 10 || f > salida + 12) return null;
  return <Frase lineas={lineas} top={top} tam={tam} sale={salida} color={RC.platino300} />;
};
