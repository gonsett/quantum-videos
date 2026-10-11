import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  Burbuja,
  EscenaOsc,
  EtiquetaOsc,
  FichaAgenda,
  FondoOscuro,
} from "../components/chat";
import { EASE, FONT_MONO, O } from "../theme-oscuro";

const FILAS = [
  { campo: "Auto", valor: "Hilux · AB123CD" },
  { campo: "Síntoma", valor: "Ruido raro al frenar" },
  { campo: "Kilometraje", valor: "41.200 km" },
];

/**
 * El contraste: acá NO agenda. La ficha se carga igual pero el campo
 * de la fecha queda deliberadamente vacío.
 */
export const T6Limite: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FondoOscuro>
      <EscenaOsc>
        <div style={{ marginBottom: 28 }}>
          <EtiquetaOsc delay={2} color={O.tenue}>
            Lo que no agenda, a propósito
          </EtiquetaOsc>
        </div>

        <div style={{ width: 888, marginBottom: 30 }}>
          <Burbuja lado="cliente" hora="22:04" delay={10} ancho={640}>
            Che, y el auto hace un ruido raro cuando freno
          </Burbuja>
        </div>

        <FichaAgenda filas={FILAS} delay={54} titulo="Queda anotado" />

        {/* El campo que queda vacío a propósito */}
        <div
          style={{
            width: 888,
            marginTop: 20,
            border: `2px dashed ${O.bordeVivo}`,
            padding: "22px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            opacity: interpolate(frame, [140, 166], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 22,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: O.tenue,
            }}
          >
            Fecha
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 30,
              color: O.tenue,
              letterSpacing: "0.06em",
            }}
          >
            — sin asignar —
          </span>
        </div>

        <div
          style={{
            marginTop: 34,
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.06em",
            color: O.oroVivo,
            maxWidth: 860,
            lineHeight: 1.4,
            opacity: interpolate(frame, [190, 218], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          Anota el síntoma. No da fecha.
        </div>
      </EscenaOsc>
    </FondoOscuro>
  );
};
