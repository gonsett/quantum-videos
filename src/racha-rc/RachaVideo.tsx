import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { RC } from "../ring-closers/tema";
import { S1Gancho, S2Problema, S3Racha, S4Logro, S5Rankup, S6Cierre, S7Cta } from "./escenas";
import { racha } from "./timeline";

const COMPONENTES: Record<string, React.FC> = {
  "s1-gancho": S1Gancho,
  "s2-problema": S2Problema,
  "s3-racha": S3Racha,
  "s4-logro": S4Logro,
  "s5-rankup": S5Rankup,
  "s6-cierre": S6Cierre,
  "s7-cta": S7Cta,
};

/** Cuarto video de Ring Closers: racha, logros y el momento de subir de rango. Render mudo + `mezclar-audio.mjs`. */
export const RachaVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RC.tinta950 }}>
    {racha.tl.escenas.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/cama-racha-rc.wav")} volume={0.6} />
    {racha.tl.clips.map((c) => (
      <Sequence key={c.voz} name={`voz-${c.voz}`} from={c.desde}>
        <Audio src={staticFile(`voz-racha-rc-final/${c.voz}.mp3`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
