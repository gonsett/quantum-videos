import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Marca } from "./components/marca";
import { PAPEL } from "./components/premium";
import { DURACION_REP, ESCENAS_REP } from "./timeline-reparto";
import {
  R1Rapido, R2Libre, R3SinAsignar, R4Entra,
  R5Ofrece, R6Empate, R7Nadie, R8Cierre,
} from "./escenas-reparto/escenas";

const COMPONENTES: Record<string, React.FC> = {
  "01-rapido": R1Rapido,
  "02-libre": R2Libre,
  "03-sinasignar": R3SinAsignar,
  "04-entra": R4Entra,
  "05-ofrece": R5Ofrece,
  "06-empate": R6Empate,
  "07-nadie": R7Nadie,
  "08-cierre": R8Cierre,
};

/**
 * El reparto de leads entre vendedores.
 *
 * Todo el video vive sobre papel blanco: el navy de Quantum Coffee es el
 * color de la información y el dorado aparece sólo donde hay que mirar.
 * El contraste ya no lo dan los fondos alternados sino las tarjetas.
 */
export const RepartoVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PAPEL }}>
    {ESCENAS_REP.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}

    <Marca escenas={ESCENAS_REP} duracion={DURACION_REP} rotulo="Reparto de leads" />

    <Audio src={staticFile("audio/cama-reparto.wav")} volume={0.36} />

    {ESCENAS_REP.map((e) => (
      <Sequence key={`v-${e.id}`} name={`voz-${e.id}`} from={e.from + e.vozDelay}>
        <Audio src={staticFile(`voz-reparto-14x/${e.voz}.mp3`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
