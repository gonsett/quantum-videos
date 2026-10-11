import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  Burbuja,
  EscenaOsc,
  EtiquetaOsc,
  FondoOscuro,
  Horario,
} from "../components/chat";
import { EASE, FONT_MONO, O } from "../theme-oscuro";

/** Los horarios libres de verdad. El cliente elige uno. */
const LIBRES = [
  { texto: "lun. 10/8  08:30", elegido: false },
  { texto: "lun. 10/8  15:00", elegido: false },
  { texto: "mié. 12/8  09:30", elegido: true },
  { texto: "jue. 13/8  11:00", elegido: false },
];

const ELEGIDO_EN = 96;

export const T4Horarios: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FondoOscuro>
      <EscenaOsc>
        <div style={{ marginBottom: 30 }}>
          <EtiquetaOsc delay={2}>Agenda real del taller</EtiquetaOsc>
        </div>

        <div style={{ width: 888 }}>
          <Burbuja lado="asistente" hora="22:01" delay={6} ancho={620}>
            Listo. Estos son los horarios libres:
          </Burbuja>
        </div>

        {/* Los cuatro huecos disponibles */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 26,
            alignItems: "flex-end",
            width: 888,
          }}
        >
          {LIBRES.map((h, i) => (
            <Horario
              key={h.texto}
              delay={24 + i * 11}
              elegidoEn={h.elegido ? ELEGIDO_EN : undefined}
            >
              {h.texto}
            </Horario>
          ))}
        </div>

        {/* La elección del cliente */}
        <div style={{ width: 888, marginTop: 28 }}>
          <Burbuja lado="cliente" hora="22:02" delay={ELEGIDO_EN - 8} ancho={360}>
            El miércoles 9:30
          </Burbuja>
        </div>

        <div
          style={{
            marginTop: 34,
            fontFamily: FONT_MONO,
            fontSize: 24,
            letterSpacing: "0.1em",
            color: O.tenue,
            opacity: interpolate(frame, [128, 150], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          Si uno se ocupa mientras elige, le ofrece los que quedan.
        </div>
      </EscenaOsc>
    </FondoOscuro>
  );
};
