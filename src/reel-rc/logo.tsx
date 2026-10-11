import { Easing, interpolate, useCurrentFrame } from "remotion";
import { EASE, RC } from "../ring-closers/tema";

/**
 * El logo de Ring Closers: el cinturón reducido a hexágono + estrella.
 *
 * La geometría es la de `ring-closers/components/shell/logo-mark.tsx`,
 * copiada punto por punto. No es una reinterpretación: es la misma marca
 * que ve el usuario en la app y en el favicon.
 *
 * `dibujoEn` hace que el hexágono se trace y la estrella entre después. Sin
 * él, el logo aparece ya armado (para la marca chica recurrente).
 */
export const Logo: React.FC<{
  size: number;
  dibujoEn?: number;
  opacidad?: number;
}> = ({ size, dibujoEn, opacidad = 1 }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(...EASE);

  const trazo =
    dibujoEn === undefined
      ? 1
      : interpolate(frame, [dibujoEn, dibujoEn + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
  const estrella =
    dibujoEn === undefined
      ? 1
      : interpolate(frame, [dibujoEn + 14, dibujoEn + 26], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity: opacidad, overflow: "visible" }}>
      <polygon
        points="50,10 85,32 85,68 50,90 15,68 15,32"
        fill="none"
        stroke={RC.esmeralda500}
        strokeWidth={6}
        strokeLinejoin="miter"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - trazo}
      />
      <path
        d="M50,30 L54.7,43.53 L69.02,43.82 L57.61,52.47 L61.76,66.18 L50,58 L38.24,66.18 L42.39,52.47 L30.98,43.82 L45.3,43.53 Z"
        fill={RC.esmeralda500}
        style={{
          opacity: estrella,
          transformOrigin: "50px 50px",
          transformBox: "view-box",
          scale: String(interpolate(estrella, [0, 1], [0.7, 1])),
        }}
      />
    </svg>
  );
};

/**
 * El guante de la app (`GloveIcon` en components/shell/icons.tsx): línea
 * simple de 1.75 de grosor sobre una grilla de 24. Mismo trazo que la UI,
 * a propósito distinto de las ilustraciones de cinturones.
 */
export const Guante: React.FC<{ size: number; color?: string }> = ({
  size,
  color = RC.esmeralda500,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.5 10.5V6a2 2 0 1 1 4 0v3.5" />
    <path d="M12.5 9.5V6.5a2 2 0 1 1 4 0v5" />
    <path d="M16.5 11.5V9a2 2 0 1 1 4 0v6.5A5 5 0 0 1 15.5 20.5H12A5 5 0 0 1 7 15.5v-3a2 2 0 1 1 4 0" />
  </svg>
);
