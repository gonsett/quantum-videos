import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { C } from "./theme";
import { Marco } from "./components/Marco";
import { ESCENAS } from "./timeline";
import { S1Gancho } from "./escenas/S1Gancho";
import { S2Pregunta } from "./escenas/S2Pregunta";
import { S3Espera } from "./escenas/S3Espera";
import { S4Golpe } from "./escenas/S4Golpe";
import { S5AutomLead } from "./escenas/S5AutomLead";
import { S6Regla } from "./escenas/S6Regla";
import { S7Capacidades } from "./escenas/S7Capacidades";
import { S8Cierre } from "./escenas/S8Cierre";

const COMPONENTES: Record<string, React.FC> = {
  gancho: S1Gancho,
  pregunta: S2Pregunta,
  espera: S3Espera,
  golpe: S4Golpe,
  automlead: S5AutomLead,
  regla: S6Regla,
  capacidades: S7Capacidades,
  cierre: S8Cierre,
};

export const AutomLeadVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      {ESCENAS.map((escena) => {
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

      <Marco />

      {/* Banda sonora compuesta (ver generar-musica.mjs). A 0.42 acompana
          sin competir: la voz manda con holgura y la musica sostiene el
          fondo sin pedir atencion. */}
      <Audio src={staticFile("audio/cama.wav")} volume={0.34} />

      {/* Locucion: cada segmento arranca con su escena */}
      {ESCENAS.map((escena) => (
        <Sequence
          key={`voz-${escena.id}`}
          name={`voz-${escena.id}`}
          from={escena.from + escena.vozDelay}
        >
          <Audio src={staticFile(`voz-proc/${escena.voz}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
