import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  EscenaOsc,
  EtiquetaOsc,
  FondoOscuro,
  ParrafoOsc,
  TitularOsc,
} from "../components/chat";
import { EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR, O } from "../theme-oscuro";

/** Tres turnos ya cargados cuando el taller abre el lunes. */
const TURNOS = [
  { hora: "08:30", auto: "Corolla · AC441KJ" },
  { hora: "09:30", auto: "Hilux · AB123CD" },
  { hora: "11:00", auto: "Amarok · AD920LM" },
];

export const T8Cierre: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FondoOscuro>
      <EscenaOsc>
        <div style={{ marginBottom: 28 }}>
          <EtiquetaOsc delay={2}>Lunes · 08:00</EtiquetaOsc>
        </div>

        <div style={{ marginBottom: 10 }}>
          <TitularOsc size={66} delay={6}>
            Tu taller abre
          </TitularOsc>
        </div>
        <TitularOsc size={54} resalte delay={18}>
          con los turnos ya cargados
        </TitularOsc>

        {/* La agenda del lunes, ya llena */}
        <div
          style={{
            width: 888,
            marginTop: 44,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {TURNOS.map((t, i) => (
            <div
              key={t.hora}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                backgroundColor: O.navy,
                borderLeft: `6px solid ${O.oro}`,
                padding: "16px 24px",
                opacity: interpolate(frame, [48 + i * 12, 66 + i * 12], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(...EASE),
                }),
                translate: interpolate(
                  frame,
                  [48 + i * 12, 70 + i * 12],
                  ["-18px 0px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(...EASE),
                  },
                ),
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 32,
                  color: O.oroVivo,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {t.hora}
              </span>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 28,
                  color: O.mist,
                }}
              >
                {t.auto}
              </span>
            </div>
          ))}
        </div>

        {/* Marca y llamado */}
        <div
          style={{
            marginTop: 48,
            fontFamily: FONT_TITULAR,
            fontSize: 58,
            letterSpacing: "-0.03em",
            color: O.texto,
            textTransform: "uppercase",
            opacity: interpolate(frame, [104, 128], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          AutomLead
        </div>

        <div
          style={{
            marginTop: 30,
            display: "inline-flex",
            backgroundColor: O.oroVivo,
            borderRadius: 999,
            padding: "20px 40px",
            opacity: interpolate(frame, [132, 158], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
            translate: interpolate(frame, [132, 162], ["0px 18px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 36,
              color: O.navy,
              letterSpacing: "-0.01em",
            }}
          >
            Agendá tu diagnóstico
          </span>
        </div>

        <div style={{ marginTop: 26 }}>
          <ParrafoOsc delay={162} size={28} color={O.tenue} maxWidth={880}>
            Sobre tu número de WhatsApp actual. El mismo que usás para vender.
          </ParrafoOsc>
        </div>
      </EscenaOsc>
    </FondoOscuro>
  );
};
