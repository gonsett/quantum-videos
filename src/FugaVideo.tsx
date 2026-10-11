import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { F } from "./theme-fuga";
import { ESCENAS_FUGA } from "./timeline-fuga";
import {
  F1Renuncia,
  F2Telefono,
  F3Cartera,
  F4Ochentaiseis,
  F5Todo,
  F6Fuga,
  F7Sistema,
  F8Cierre,
} from "./escenas-fuga/escenas";

const COMPONENTES: Record<string, React.FC> = {
  renuncia: F1Renuncia,
  telefono: F2Telefono,
  cartera: F3Cartera,
  ochentaiseis: F4Ochentaiseis,
  todo: F5Todo,
  fuga: F6Fuga,
  sistema: F7Sistema,
  cierre: F8Cierre,
};

/**
 * Comercial de fuga de cartera, con ilustracion 3D generada por codigo.
 * Sin marco fijo: cada escena es una imagen completa, al estilo de la
 * referencia de KAYN.
 */
export const FugaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: F.fondo }}>
      {ESCENAS_FUGA.map((escena) => {
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

      <Audio src={staticFile("audio/cama-fuga.wav")} volume={0.36} />

      {ESCENAS_FUGA.map((escena) => (
        <Sequence
          key={`voz-${escena.id}`}
          name={`voz-${escena.id}`}
          from={escena.from + escena.vozDelay}
        >
          <Audio src={staticFile(`voz-fuga-proc/${escena.voz}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
