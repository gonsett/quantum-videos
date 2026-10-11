import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { P } from "./theme-panel";
import { ESCENAS_PANEL } from "./timeline-panel";
import {
  P1Espera,
  P2Contraste,
  P3Pulso,
  P4Leads,
  P5Score,
  P6Autos,
  P7Alerta,
  P8Cierre,
} from "./escenas-panel/escenas";

const COMPONENTES: Record<string, React.FC> = {
  espera: P1Espera,
  contraste: P2Contraste,
  pulso: P3Pulso,
  leads: P4Leads,
  score: P5Score,
  autos: P6Autos,
  alerta: P7Alerta,
  cierre: P8Cierre,
};

/**
 * Recorrido por el panel real de AutomLead.
 *
 * A diferencia de los dos anteriores, este video no lleva marco fijo: la
 * estructura la dan los pasos numerados y la alternancia claro/oscuro.
 * Un chrome permanente encima de capturas de producto compite con ellas.
 */
export const PanelVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: P.tinta }}>
      {ESCENAS_PANEL.map((escena) => {
        const Componente = COMPONENTES[escena.id];
        return (
          <Sequence
            key={escena.id}
            name={escena.id}
            from={escena.from}
            durationInFrames={escena.durationInFrames}
          >
            <Componente />
          </Sequence>
        );
      })}

      <Audio src={staticFile("audio/cama-panel.wav")} volume={0.38} />

      {ESCENAS_PANEL.map((escena) => (
        <Sequence
          key={`voz-${escena.id}`}
          name={`voz-${escena.id}`}
          from={escena.from + escena.vozDelay}
        >
          <Audio src={staticFile(`voz-panel-proc/${escena.voz}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
