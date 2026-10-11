import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  Burbuja,
  EscenaOsc,
  FichaAgenda,
  FondoOscuro,
} from "../components/chat";
import { EASE, FONT_MONO, O } from "../theme-oscuro";

const FILAS = [
  { campo: "Turno", valor: "mié. 12/8 · 09:30 hs" },
  { campo: "Auto", valor: "Hilux · AB123CD" },
  { campo: "Trabajo", valor: "Service de rutina (40.000 km)" },
  { campo: "Cargado", valor: "sáb. 8/8 · 22:02" },
];

/** El turno queda cargado en la agenda, sin nadie del taller despierto. */
export const T5Cargado: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FondoOscuro>
      <EscenaOsc>
        <div style={{ width: 888, marginBottom: 32 }}>
          <Burbuja lado="asistente" hora="22:02" delay={4} ancho={620}>
            Reservado: mié. 12/8 09:30 hs. Te esperamos.
          </Burbuja>
        </div>

        <FichaAgenda filas={FILAS} delay={38} />

        {/* El remate: nadie del taller intervino */}
        <div
          style={{
            marginTop: 34,
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: interpolate(frame, [140, 166], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <div style={{ width: 42, height: 3, backgroundColor: O.oroVivo }} />
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 25,
              letterSpacing: "0.08em",
              color: O.oroVivo,
            }}
          >
            Sin que nadie del taller estuviera
          </div>
        </div>
      </EscenaOsc>
    </FondoOscuro>
  );
};
