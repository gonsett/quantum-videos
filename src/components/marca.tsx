import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BORDE, LINEA, NAVY, ORO, ORO_VIVO, TENUE } from "./premium";
import { EASE, FONT_DISPLAY, FONT_MONO, SAFE_X } from "../theme-panel";

/**
 * Marco fijo que corre por encima de todas las escenas.
 *
 * Es el detalle que mas levanta una pieza por lo poco que cuesta: barra de
 * progreso, marca y contador de capitulo presentes todo el tiempo. Da la
 * sensacion de un sistema y no de placas sueltas pegadas una atras de otra.
 */
export const Marca: React.FC<{
  /** Cortes del montaje, para saber en que capitulo estamos. */
  escenas: { from: number; durationInFrames: number }[];
  /** Cuadros totales, para el avance de la barra. */
  duracion: number;
  /** Lo que dice el pie a la izquierda. */
  rotulo: string;
}> = ({ escenas, duracion, rotulo }) => {
  const frame = useCurrentFrame();

  const avance = interpolate(frame, [0, duracion], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const indice = escenas.findIndex(
    (e) => frame >= e.from && frame < e.from + e.durationInFrames,
  );
  const n = String(Math.max(indice, 0) + 1).padStart(2, "0");
  const total = String(escenas.length).padStart(2, "0");

  const aparece = interpolate(frame, [6, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  return (
    <AbsoluteFill style={{ opacity: aparece }}>
      {/* Barra de progreso */}
      <div
        style={{
          position: "absolute",
          top: 116,
          left: SAFE_X,
          width: 888,
          height: 4,
          borderRadius: 2,
          backgroundColor: LINEA,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${avance * 100}%`,
            height: "100%",
            borderRadius: 2,
            backgroundColor: ORO_VIVO,
          }}
        />
      </div>

      {/* Marca y contador */}
      <div
        style={{
          position: "absolute",
          top: 142,
          left: SAFE_X,
          width: 888,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: NAVY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: ORO_VIVO }}
            />
          </div>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "-0.01em",
              color: NAVY,
            }}
          >
            AutomLead
          </span>
        </div>

        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 21,
            letterSpacing: "0.12em",
            color: TENUE,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {n} / {total}
        </span>
      </div>

      {/* Pie: el tema de la pieza y el dominio */}
      <div
        style={{
          position: "absolute",
          bottom: 118,
          left: SAFE_X,
          width: 888,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${BORDE}`,
          paddingTop: 20,
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 20,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: TENUE,
          }}
        >
          {rotulo}
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: "0.04em",
            color: ORO,
          }}
        >
          quantumcoffee.xyz
        </span>
      </div>
    </AbsoluteFill>
  );
};
