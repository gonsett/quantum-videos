import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Escena, Etiqueta, Fondo, Parrafo } from "../components/base";
import { C, EASE, FONT_DISPLAY, FONT_MONO } from "../theme";

/** Entra la consulta: un sabado a las 23:47. */
export const S1Gancho: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Fondo>
      <Escena>
        <div style={{ marginBottom: 40 }}>
          <Etiqueta delay={6} color={C.oroSuave}>
            Sábado · 23:47
          </Etiqueta>
        </div>

        {/* Burbuja de mensaje entrante: tarjeta sobre papel */}
        <div
          style={{
            position: "relative",
            maxWidth: 830,
            backgroundColor: "#FFFFFF",
            border: `2px solid ${C.borde}`,
            borderLeft: `10px solid ${C.oro}`,
            padding: "42px 46px 36px",
            boxShadow: "0 2px 0 rgba(10,23,51,0.06)",
            opacity: interpolate(frame, [14, 32], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
            translate: interpolate(frame, [14, 36], ["0px 40px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 58,
              lineHeight: 1.24,
              color: C.navy,
            }}
          >
            Hola, sigue disponible la Amarok 2019?
          </div>
          <div
            style={{
              marginTop: 26,
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 23,
              letterSpacing: "0.16em",
              color: C.tenue,
              opacity: interpolate(frame, [40, 56], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            WHATSAPP · CONSULTA ENTRANTE
          </div>
        </div>

        <div style={{ marginTop: 54 }}>
          <Parrafo delay={96} size={44}>
            Está mirando una camioneta que tenés publicada.
          </Parrafo>
        </div>
      </Escena>
    </Fondo>
  );
};
