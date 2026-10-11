import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, EASE, FONT_DISPLAY, FONT_MONO, SAFE_X } from "../theme";
import { ESCENAS } from "../timeline";

/**
 * Marco fijo, calcado del layout de las publicaciones del feed:
 * cabecera con etiqueta a la izquierda y marca a la derecha bajo una
 * regla fina, y pie con el handle y una píldora dorada.
 */
export const Marco: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  let indice = 0;
  for (let i = 0; i < ESCENAS.length; i++) {
    if (frame >= ESCENAS[i].from) {
      indice = i;
    }
  }

  const entrada = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Cabecera */}
      <div style={{ paddingTop: 70, paddingLeft: SAFE_X, paddingRight: SAFE_X, opacity: entrada }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 30,
              color: C.navy,
              letterSpacing: "-0.01em",
            }}
          >
            Gestión comercial
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 30,
              color: C.navy,
              letterSpacing: "-0.01em",
            }}
          >
            AutomLead
          </div>
        </div>

        {/* Regla con el avance del video pintado en dorado */}
        <div style={{ height: 3, backgroundColor: C.borde, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: C.oro,
              width: `${interpolate(frame, [0, durationInFrames], [0, 100], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}%`,
            }}
          />
        </div>
      </div>

      {/* Pie */}
      <div
        style={{
          position: "absolute",
          bottom: 66,
          left: SAFE_X,
          right: SAFE_X,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: entrada,
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 28,
            color: C.grafito,
          }}
        >
          @quantumcoffee.xyz
        </div>

        {/* Píldora dorada con el número de escena */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: C.oro,
            borderRadius: 999,
            padding: "10px 22px",
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 24,
              color: C.navy,
              letterSpacing: "0.1em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(indice + 1).padStart(2, "0")} / {String(ESCENAS.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
