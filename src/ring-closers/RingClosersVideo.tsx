import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import {
  R1Gancho,
  R2Comodidad,
  R2Tercera,
  R3Solucion,
  R4Honestidad,
  R5Cierre,
} from "./escenas";
import { RC } from "./tema";
import { TIMELINE_RC } from "./timeline";

const COMPONENTES: Record<string, React.FC> = {
  "r1-gancho": R1Gancho,
  "r2-comodidad": R2Comodidad,
  "r2-tercera": R2Tercera,
  "r3-solucion": R3Solucion,
  "r4-honestidad": R4Honestidad,
  "r5-cierre": R5Cierre,
};

/**
 * Comercial de Ring Closers, 9:16.
 *
 * El audio va en la composición para poder previsualizar en el Studio, pero
 * el render final sale mudo y se mezcla con `mezclar-audio.mjs`: la etapa de
 * mezcla de Remotion se cae en esta máquina con muchas pistas.
 */
export const RingClosersVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RC.tinta950 }}>
    {TIMELINE_RC.escenas.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}

    <Audio src={staticFile("audio/cama-ringclosers.wav")} volume={0.6} />

    {TIMELINE_RC.clips.map((c) => (
      <Sequence key={c.voz} name={`voz-${c.voz}`} from={c.desde}>
        <Audio src={staticFile(`voz-ringclosers-final/${c.voz}.mp3`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
