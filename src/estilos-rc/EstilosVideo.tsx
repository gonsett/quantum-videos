import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { RC } from "../ring-closers/tema";
import { E1Avatar, E2Guardias, E3Zurdo, E4Contragolpe, E5Noqueador, E6Prueba, E7Camino, E8Cta } from "./escenas";
import { estilos } from "./timeline";

const COMPONENTES: Record<string, React.FC> = {
  "e1-avatar": E1Avatar,
  "e2-guardias": E2Guardias,
  "e3-zurdo": E3Zurdo,
  "e4-contragolpe": E4Contragolpe,
  "e5-noqueador": E5Noqueador,
  "e6-prueba": E6Prueba,
  "e7-camino": E7Camino,
  "e8-cta": E8Cta,
};

/** Reel de Ring Closers sobre los estilos. Render mudo + `mezclar-audio.mjs --duck`. */
export const EstilosVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RC.tinta950 }}>
    {estilos.tl.escenas.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/cama-estilos-rc.wav")} volume={0.6} />
    {estilos.tl.clips.map((c) => (
      <Sequence key={c.voz} name={`voz-${c.voz}`} from={c.desde}>
        <Audio src={staticFile(`voz-estilos-rc-final/${c.voz}.mp3`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
