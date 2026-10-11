import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  EscenaOsc,
  EtiquetaOsc,
  FondoOscuro,
  ParrafoOsc,
  TitularOsc,
} from "../components/chat";
import { FONT_MONO, O, EASE } from "../theme-oscuro";

/** Sábado 22:00. El taller cerrado, la persiana baja. */
export const T1Cerrado: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FondoOscuro>
      <EscenaOsc>
        <div style={{ marginBottom: 34 }}>
          <EtiquetaOsc delay={6}>Sábado · 22:00</EtiquetaOsc>
        </div>

        <div style={{ marginBottom: 10 }}>
          <TitularOsc size={88} delay={14}>
            Tu taller
          </TitularOsc>
        </div>
        <TitularOsc size={88} delay={26}>
          está cerrado
        </TitularOsc>

        {/* Persiana: líneas horizontales que bajan */}
        <div
          style={{
            width: 888,
            marginTop: 56,
            display: "flex",
            flexDirection: "column",
            gap: 9,
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 10,
                backgroundColor: O.navy2,
                borderLeft: `4px solid ${O.borde}`,
                opacity: interpolate(
                  frame,
                  [46 + i * 6, 62 + i * 6],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(...EASE),
                  },
                ),
                translate: interpolate(
                  frame,
                  [46 + i * 6, 66 + i * 6],
                  ["0px -14px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(...EASE),
                  },
                ),
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <ParrafoOsc delay={104} size={42}>
            No hay nadie.
          </ParrafoOsc>
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 23,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: O.tenue,
            opacity: interpolate(frame, [118, 138], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Abre el lunes 08:00
        </div>
      </EscenaOsc>
    </FondoOscuro>
  );
};
