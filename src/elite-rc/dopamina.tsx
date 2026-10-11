/**
 * ⚠️ VARA DE CALIDAD (Javier, 19/09/2026): esta es la vara TIPOGRÁFICA y de movimiento que ningún video
 * nuevo puede bajar (Frase, Slam, ObjetoCae, Metal, Camara). "Mega dopamínico, mega profesional, mega
 * elegante, que se vea como si costara mil dólares". Lo que huele a CapCut (resaltadores, máscaras
 * palabra por palabra, plantillas) está prohibido como recurso principal. Ver el skill.
 */
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { DISPLAY, EASE, MARGEN, MONO, RC, SANS } from "../ring-closers/tema";
import { Metal } from "../secreto-rc/efectos";

/**
 * Caja de herramientas "dopamínica" de Ring Closers (19/09/2026): lo que hace que un
 * video se sienta rápido y con recompensa. Todo es determinista (nada de Math.random)
 * y todo pide sus cuadros por palabra, así que si se regenera una toma se reacomoda solo.
 *
 * Reglas de prolijidad que están codificadas acá:
 *   - las frases reservan su lugar final desde el primer cuadro (las palabras aparecen,
 *     no se mueven), así nada salta ni se pisa;
 *   - los titulares en Oswald mayúscula llevan interlineado >= 1.14: si no, el tilde de
 *     la línea de abajo pisa la de arriba (Javier lo vio en las historias de foto).
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(...EASE);

/** Rebote con sobreimpulso: 0 -> 1 pasando por ~1,1. `en` es el cuadro de arranque. */
export const pop = (frame: number, en: number, rigidez = 240, amort = 14) =>
  spring({ frame: frame - en, fps: 30, config: { damping: amort, stiffness: rigidez, mass: 0.6 }, durationInFrames: 22 });

const azar = (semilla: number) => {
  let s = semilla | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ── Golpes de cámara ─────────────────────────────────────────────────────

/** Suma el efecto de varios golpes (cuadros locales): sacudida, destello y un empujón de zoom. */
export const golpes = (frame: number, cuando: number[]) => {
  let x = 0;
  let y = 0;
  let flash = 0;
  let zoom = 0;
  for (const h of cuando) {
    const d = frame - h;
    if (d < 0) continue;
    const k = Math.exp(-d / 5);
    x += k * 10 * Math.sin(d * 2.7 + h);
    y += k * 7 * Math.cos(d * 3.1 + h * 1.3);
    flash = Math.max(flash, Math.exp(-d / 3));
    zoom += k * 0.04;
  }
  return { x, y, flash, zoom };
};

/** Contenedor que recibe la sacudida y el empujón de zoom. */
export const Camara: React.FC<{ g: ReturnType<typeof golpes>; children: React.ReactNode }> = ({ g, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      transform: `translate(${g.x}px, ${g.y}px) scale(${1 + g.zoom})`,
      transformOrigin: "50% 55%",
    }}
  >
    {children}
  </div>
);

/** Destello de pantalla completa que acompaña un golpe. */
export const Fogonazo: React.FC<{ nivel: number; color?: string }> = ({ nivel, color = "52,211,153" }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: `radial-gradient(circle at 50% 55%, rgba(${color},0.6) 0%, rgba(${color},0.12) 45%, rgba(${color},0) 70%)`,
      opacity: nivel * 0.9,
      mixBlendMode: "screen",
    }}
  />
);

// ── Texto ────────────────────────────────────────────────────────────────

export type Pal = {
  /** El texto tal cual se muestra. */
  t: string;
  /** Cuadro (local a la escena) en que la voz la dice; aparece unos cuadros antes. */
  en: number;
  acento?: boolean;
  /** Fuente alternativa: `display` = Oswald mayúscula. */
  display?: boolean;
  /** Tamaño propio (si no, el de la frase). */
  tam?: number;
};

/**
 * Frase con una palabra por golpe de voz. Cada línea se pasa armada (`lineas`) para
 * decidir los cortes a mano: nunca queda una palabra huérfana ni un renglón partido
 * de forma rara. Las palabras reservan su lugar desde el primer cuadro.
 */
export const Frase: React.FC<{
  lineas: Pal[][];
  top: number;
  tam: number;
  interlineado?: number;
  color?: string;
  /** 0-1: para atenuar la frase cuando entra otra. */
  opacidad?: number;
  /** Cuadro local desde el que la frase sale (sube y se desvanece). */
  sale?: number;
}> = ({ lineas, top, tam, interlineado = 1.3, color = RC.crema, opacidad = 1, sale }) => {
  const frame = useCurrentFrame();
  const s = sale === undefined ? 0 : interpolate(frame, [sale, sale + 10], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: MARGEN,
        right: MARGEN,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: opacidad * (1 - s),
        translate: `0px ${-s * 26}px`,
        filter: s > 0 ? `blur(${s * 8}px)` : undefined,
      }}
    >
      {lineas.map((linea, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            columnGap: Math.round(Math.max(...linea.map((w) => w.tam ?? tam)) * 0.3),
            lineHeight: interlineado,
          }}
        >
          {linea.map((w, j) => {
            const p = pop(frame, w.en - 4);
            const vis = interpolate(frame, [w.en - 4, w.en - 1], [0, 1], clamp);
            const tamano = w.tam ?? tam;
            return (
              <span
                key={j}
                style={{
                  display: "inline-block",
                  fontFamily: w.display ? DISPLAY : SANS,
                  fontWeight: 700,
                  fontSize: tamano,
                  textTransform: w.display ? "uppercase" : undefined,
                  letterSpacing: w.display ? "0.01em" : "-0.01em",
                  color: w.acento ? RC.esmeralda400 : color,
                  textShadow: w.acento ? "0 0 32px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.22)" : undefined,
                  opacity: vis,
                  transform: `translateY(${(1 - Math.min(p, 1)) * 22}px) scale(${(0.6 + 0.4 * p) * (w.acento ? 1.04 : 1)})`,
                  transformOrigin: "50% 80%",
                  filter: p < 0.9 ? `blur(${(1 - Math.min(p, 1)) * 5}px)` : undefined,
                }}
              >
                {w.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Palabra gigante que cae de golpe (Oswald, mayúsculas). Interlineado propio para que no se pisen los tildes. */
export const Slam: React.FC<{
  texto: string;
  en: number;
  top: number;
  tam: number;
  color?: string;
  brillo?: boolean;
}> = ({ texto, en, top, tam, color = RC.crema, brillo }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [en, en + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const escala = 1.65 - 0.65 * t;
  const espaciado = 0.16 - 0.14 * t;
  const blanco = interpolate(frame, [en, en + 2, en + 8], [1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: tam,
        lineHeight: 1.16,
        textTransform: "uppercase",
        letterSpacing: `${espaciado}em`,
        color,
        opacity: interpolate(frame, [en, en + 2], [0, 1], clamp),
        transform: `scale(${escala})`,
        transformOrigin: "50% 60%",
        textShadow: brillo
          ? `0 0 ${34 + blanco * 40}px rgba(16,185,129,${0.55 + blanco * 0.3}), 0 0 90px rgba(16,185,129,0.25)`
          : undefined,
      }}
    >
      {texto}
    </div>
  );
};

// ── Objetos ──────────────────────────────────────────────────────────────

/**
 * Objeto que cae con rebote, se aplasta al tocar el piso, flota y recibe un barrido de luz
 * (recortado con su propio alfa). Sirve para cualquier imagen del catálogo, no solo cinturones.
 */
export const ObjetoCae: React.FC<{
  src: string;
  ancho: number;
  x: number;
  y: number;
  en: number;
  caida?: number;
  barridoEn?: number;
  rotar?: number;
  brillo?: string;
  sombra?: boolean;
}> = ({ src, ancho, x, y, en, caida = 420, barridoEn, rotar = 0, brillo, sombra = true }) => {
  const frame = useCurrentFrame();
  const CAE = 9; // cuadros de caída
  const tCae = interpolate(frame, [en, en + CAE], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const d = frame - (en + CAE); // cuadros desde que toca
  const rebote = d >= 0 ? -70 * Math.abs(Math.sin((d * Math.PI) / 9)) * Math.exp(-d / 7) : 0;
  const aplasta = d >= 0 ? Math.exp(-d / 3) : 0;
  const flota = d > 14 ? Math.sin((frame - en) / 22) * 7 : 0;
  const dy = -(1 - tCae) * caida + rebote + flota;
  const altura = Math.max(0, -dy);
  const barrido =
    barridoEn === undefined
      ? 0
      : interpolate(frame, [barridoEn, barridoEn + 34], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  if (frame < en) return null;
  return (
    <>
      {sombra ? (
        <div
          style={{
            position: "absolute",
            left: x - ancho * 0.36,
            top: y + ancho * 0.4,
            width: ancho * 0.72,
            height: ancho * 0.1,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(10px)",
            opacity: 1 - 0.55 * Math.min(1, altura / 320),
            transform: `scale(${1 - 0.35 * Math.min(1, altura / 400)})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x - ancho / 2,
          top: y - ancho / 2 + dy,
          width: ancho,
          height: ancho,
          opacity: Math.min(1, (frame - en + 1) / 3),
          transform: `rotate(${rotar + Math.sin((frame - en) / 40) * 1.6}deg) scale(${1 + 0.1 * aplasta}, ${1 - 0.16 * aplasta})`,
          transformOrigin: "50% 92%",
          filter: brillo ? `drop-shadow(0 0 40px ${brillo})` : undefined,
        }}
      >
        <Metal src={src} ancho={ancho} barrido={barrido} />
      </div>
    </>
  );
};

/** Chispas que salen de un punto: líneas cortas que se estiran, caen y se apagan. */
export const Chispas: React.FC<{
  x: number;
  y: number;
  en: number;
  n?: number;
  semilla?: number;
  /** Dirección media en grados (0 = derecha, 90 = abajo, -90 = arriba). */
  dir?: number;
  abanico?: number;
  vida?: number;
  fuerza?: number;
}> = ({ x, y, en, n = 26, semilla = 7, dir = -90, abanico = 300, vida = 26, fuerza = 1 }) => {
  const frame = useCurrentFrame();
  const edad = frame - en;
  if (edad < 0 || edad > vida) return null;
  const r = azar(semilla);
  const colores = ["#ffe6a8", "#ffffff", "#34d399", "#ffd27a"];
  const lineas = Array.from({ length: n }, (_, i) => {
    const ang = ((dir + (r() - 0.5) * abanico) * Math.PI) / 180;
    const vel = (260 + r() * 520) * fuerza;
    const largo = 14 + r() * 30;
    const v = r() * 0.5 + 0.5;
    const t = edad / 30;
    const px = x + Math.cos(ang) * vel * t;
    const py = y + Math.sin(ang) * vel * t + 620 * t * t;
    const vx = Math.cos(ang) * vel;
    const vy = Math.sin(ang) * vel + 1240 * t;
    const norma = Math.hypot(vx, vy) || 1;
    const l = largo * (1 - edad / vida) * v;
    return {
      key: i,
      x1: px,
      y1: py,
      x2: px - (vx / norma) * l,
      y2: py - (vy / norma) * l,
      o: 1 - edad / vida,
      c: colores[i % colores.length],
      g: 2 + r() * 3,
    };
  });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 7px rgba(255,200,90,0.8))" }}>
      {lineas.map((l) => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.c} strokeWidth={l.g} strokeLinecap="round" opacity={l.o} />
      ))}
    </svg>
  );
};

/** Estrella de brillo de cuatro puntas que se abre y se cierra: el "destello" de un objeto pulido. */
export const Brillo: React.FC<{ x: number; y: number; en: number; tam?: number }> = ({ x, y, en, tam = 260 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [en, en + 5, en + 20], [0, 1, 0], clamp);
  if (t <= 0) return null;
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 100 100"
      style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2, opacity: t, transform: `scale(${0.4 + 0.9 * t}) rotate(${t * 40}deg)`, filter: "drop-shadow(0 0 16px rgba(255,255,255,0.9))" }}
    >
      <polygon points="50,0 55,45 100,50 55,55 50,100 45,55 0,50 45,45" fill="#ffffff" />
    </svg>
  );
};

// ── Marco de la pieza ────────────────────────────────────────────────────

const TRAMOS = ["Afilás", "Te conocen", "Te buscan"];

/** Los tres verbos arriba: cuál está activo. Le dice a quien mira dónde está y cuánto falta. */
export const Tramos: React.FC<{ activo: number; en?: number }> = ({ activo, en = 0 }) => {
  const frame = useCurrentFrame();
  const vis = interpolate(frame, [en, en + 8], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 292,
        left: MARGEN,
        right: MARGEN,
        display: "flex",
        justifyContent: "space-between",
        opacity: vis,
      }}
    >
      {TRAMOS.map((t, i) => (
        <div key={t} style={{ textAlign: "center", flex: 1 }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 27,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: i === activo ? RC.esmeralda400 : RC.platino500,
              opacity: i === activo ? 1 : 0.5,
            }}
          >
            {t}
          </div>
          <div
            style={{
              height: 3,
              margin: "14px auto 0",
              width: i === activo ? "70%" : "30%",
              borderRadius: 2,
              backgroundColor: i === activo ? RC.esmeralda500 : RC.tinta700,
              boxShadow: i === activo ? "0 0 14px rgba(16,185,129,0.6)" : undefined,
            }}
          />
        </div>
      ))}
    </div>
  );
};

/** @handle fijo abajo. */
export const Firma: React.FC<{ en?: number }> = ({ en = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1545,
        textAlign: "center",
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 28,
        letterSpacing: "0.22em",
        color: RC.platino500,
        opacity: interpolate(frame, [en, en + 12], [0, 1], clamp),
      }}
    >
      @RING.CLOSERS
    </div>
  );
};

export { DISPLAY, MONO, RC, SANS };
