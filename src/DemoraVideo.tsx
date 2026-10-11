import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Marca } from "./components/marca";
import { PAPEL } from "./components/premium";
import { DURACION_DEM, ESCENAS_DEM } from "./timeline-demora";
import {
  D1Hook, D2Otro, D3Noche, D4Reframe,
  D5Ahora, D6Diferencia, D7Cta,
} from "./escenas-demora/escenas";

const COMPONENTES: Record<string, React.FC> = {
  "01-hook": D1Hook,
  "02-otro": D2Otro,
  "03-noche": D3Noche,
  "04-reframe": D4Reframe,
  "05-ahora": D5Ahora,
  "06-diferencia": D6Diferencia,
  "07-cta": D7Cta,
};

/**
 * "No te eligen por el precio": el cliente no se va por plata, se va por
 * el tiempo que tardas en contestarle.
 */
export const DemoraVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PAPEL }}>
    {ESCENAS_DEM.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}

    <Marca escenas={ESCENAS_DEM} duracion={DURACION_DEM} rotulo="Tiempo de respuesta" />

    <Audio src={staticFile("audio/cama-demora.wav")} volume={0.42} />

    {ESCENAS_DEM.map((e) => (
      <Sequence key={`v-${e.id}`} name={`voz-${e.id}`} from={e.from + e.vozDelay}>
        <Audio src={staticFile(`voz-demora-14x/${e.voz}.mp3`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
