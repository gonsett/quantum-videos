import { Easing, interpolate } from "remotion";
import { C, FONT_MONO } from "../theme";

/** Los dos extremos de la escala: 3 segundos y 32 h 13 m. */
export const SEG_MIN = 3;
export const SEG_MAX = 32 * 3600 + 13 * 60;

/**
 * La escala es logaritmica, igual que en el sitio: si fuera lineal,
 * los tres segundos y los treinta y dos minutos serian el mismo pixel.
 */
export const progresoALogSeg = (p: number) =>
  SEG_MIN * Math.pow(SEG_MAX / SEG_MIN, Math.max(0, Math.min(1, p)));

export const logSegAProgreso = (s: number) =>
  Math.log(s / SEG_MIN) / Math.log(SEG_MAX / SEG_MIN);

/** Formatea igual que el sitio: 3 s · 12 min · 1 h 40 m · 32 h 13 m. */
export const formatear = (segundos: number) => {
  const s = Math.floor(segundos);
  if (s < 60) {
    return `${s} s`;
  }
  if (s < 3600) {
    return `${Math.floor(s / 60)} min`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h} h ${String(m).padStart(2, "0")} m`;
};

/** Cifra grande del cronometro. */
export const Cifra: React.FC<{
  texto: string;
  color: string;
  size?: number;
}> = ({ texto, color, size = 150 }) => {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.09em",
        color,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {texto}
    </div>
  );
};

const TICKS = [
  { s: 3, etiqueta: "3 s" },
  { s: 60, etiqueta: "1 min" },
  { s: 3600, etiqueta: "1 h" },
  { s: SEG_MAX, etiqueta: "32 h" },
];

/**
 * Riel logaritmico con el marcador corriendo.
 * Es el mismo eje para los dos relojes: por eso se pueden comparar.
 */
export const Riel: React.FC<{
  progreso: number;
  color: string;
  ancho?: number;
}> = ({ progreso, color, ancho = 888 }) => {
  const p = Math.max(0, Math.min(1, progreso));

  return (
    <div style={{ width: ancho, position: "relative" }}>
      <div
        style={{
          height: 4,
          backgroundColor: C.borde,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: ancho * p,
            backgroundColor: color,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: ancho * p - 9,
            top: -7,
            width: 18,
            height: 18,
            backgroundColor: color,
            borderRadius: 9,
          }}
        />
      </div>

      <div style={{ position: "relative", height: 34, marginTop: 16 }}>
        {TICKS.map((t, i) => {
          const esUltimo = i === TICKS.length - 1;
          const esPrimero = i === 0;

          return (
            <div
              key={t.etiqueta}
              style={{
                position: "absolute",
                left: ancho * logSegAProgreso(t.s),
                // Los extremos se alinean hacia adentro para no desbordar el riel
                translate: esPrimero ? "0 0" : esUltimo ? "-100% 0" : "-50% 0",
                whiteSpace: "nowrap",
                fontFamily: FONT_MONO,
                fontSize: 22,
                letterSpacing: "0.1em",
                color: C.tenue,
              }}
            >
              {t.etiqueta}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Curva de aceleracion del cronometro sin sistema: arranca lento y se dispara. */
export const avanceReloj = (
  frame: number,
  desde: number,
  hasta: number,
) =>
  interpolate(frame, [desde, hasta], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.55, 0, 0.85, 0.5),
  });
