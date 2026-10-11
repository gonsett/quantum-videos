import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Escena, Fondo, Parrafo, Regla, Titular } from "../components/base";
import { C, EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR } from "../theme";

/** Cierre: la pregunta que deja instalada la duda, y el llamado. */
export const S8Cierre: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Fondo>
      <Escena>
        <div style={{ marginBottom: 8 }}>
          <Titular size={66} delay={4}>
            ¿Cuántas consultas
          </Titular>
        </div>
        <div style={{ marginBottom: 14 }}>
          <Titular size={66} delay={14}>
            se te enfriaron
          </Titular>
        </div>
        <Titular size={66} resalte inclinacion={-1.3} delay={26}>
          sin que te enteres
        </Titular>

        <div style={{ marginTop: 62, marginBottom: 40 }}>
          <Regla color={C.oro} delay={92} ancho={888} grosor={4} />
        </div>

        {/* Wordmark tipografico */}
        <div
          style={{
            fontFamily: FONT_TITULAR,
            fontSize: 76,
            letterSpacing: "-0.03em",
            color: C.navy,
            textTransform: "uppercase",
            opacity: interpolate(frame, [100, 126], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
            translate: interpolate(frame, [100, 130], ["0px 20px", "0px 0px"], {
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
            marginTop: 14,
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 25,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.tenue,
            opacity: interpolate(frame, [116, 140], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          Gestión de leads para concesionarias
        </div>

        {/* Llamado a la accion: pildora dorada, como en el feed */}
        <div
          style={{
            marginTop: 56,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            backgroundColor: C.oro,
            borderRadius: 999,
            padding: "24px 44px",
            opacity: interpolate(frame, [148, 172], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
            translate: interpolate(frame, [148, 176], ["0px 20px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 40,
              color: C.navy,
              letterSpacing: "-0.01em",
            }}
          >
            Agendá tu diagnóstico
          </div>
        </div>

        <div style={{ marginTop: 34 }}>
          <Parrafo delay={176} size={32} color={C.tenue} maxWidth={880}>
            Funciona sobre tu número de WhatsApp actual. No hay que cambiar
            nada de lo que ya usás.
          </Parrafo>
        </div>
      </Escena>
    </Fondo>
  );
};
