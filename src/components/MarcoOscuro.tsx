import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EASE, FONT_DISPLAY, FONT_MONO, O, SAFE_X } from "../theme-oscuro";

/**
 * Marco del segundo comercial. Deliberadamente distinto al del primero:
 * ahí la cabecera llevaba dos etiquetas bajo una regla; acá el reloj de
 * la conversación va arriba a la derecha, porque el video entero pasa
 * dentro de un chat con hora.
 */
export const MarcoOscuro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const entrada = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Barra de avance al ras del borde */}
      <div style={{ height: 5, backgroundColor: O.borde }}>
        <div
          style={{
            height: "100%",
            backgroundColor: O.oro,
            width: `${interpolate(frame, [0, durationInFrames], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}%`,
          }}
        />
      </div>

      <div
        style={{
          paddingTop: 62,
          paddingLeft: SAFE_X,
          paddingRight: SAFE_X,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          opacity: entrada,
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 30,
            color: O.texto,
            letterSpacing: "-0.01em",
          }}
        >
          Turnos de service
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.16em",
            color: O.oro,
          }}
        >
          AUTOMLEAD
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: SAFE_X,
          right: SAFE_X,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: entrada * 0.92,
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 27,
            color: O.tenue,
          }}
        >
          @quantumcoffee.xyz
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 23,
            letterSpacing: "0.14em",
            color: O.tenue,
          }}
        >
          IA PARA CONCESIONARIAS
        </div>
      </div>
    </AbsoluteFill>
  );
};
