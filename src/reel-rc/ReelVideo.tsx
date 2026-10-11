import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { RC } from "../ring-closers/tema";
import { S1Gancho, S2Problema, S3Solucion, S4Oportunidad, S5Cta } from "./escenas";
import { reel } from "./timeline";

const COMPONENTES: Record<string, React.FC> = {
  "s1-gancho": S1Gancho,
  "s2-problema": S2Problema,
  "s3-solucion": S3Solucion,
  "s4-oportunidad": S4Oportunidad,
  "s5-cta": S5Cta,
};

/**
 * Reel de Ring Closers v2, 9:16 nativo. Gancho y guion nuevos — reemplaza
 * la version anterior (guion-reel-rc.json, voz acelerada y rechazada).
 *
 * El audio va para previsualizar en el Studio; el render final sale mudo y
 * se mezcla con `mezclar-audio.mjs --duck`.
 */
export const ReelVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RC.tinta950 }}>
    {reel.tl.escenas.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/cama-rc-v2.wav")} volume={0.6} />
    {reel.tl.clips.map((c) => (
      <Sequence key={c.voz} name={`voz-${c.voz}`} from={c.desde}>
        <Audio src={staticFile(`voz-rc-v2/${c.voz}.mp3`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
