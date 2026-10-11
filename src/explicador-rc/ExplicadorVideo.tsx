import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { RC } from "../ring-closers/tema";
import { S1QueEs, S2Problema, S3Solucion, S4Rango, S5Ofertas, S6Cierre } from "./escenas";
import { explicador } from "./timeline";

const COMPONENTES: Record<string, React.FC> = {
  "s1-que-es": S1QueEs,
  "s2-problema": S2Problema,
  "s3-solucion": S3Solucion,
  "s4-rango": S4Rango,
  "s5-ofertas": S5Ofertas,
  "s6-cierre": S6Cierre,
};

/**
 * Explicador simple de Ring Closers, 9:16 nativo. Sin gancho de venta: qué
 * es, cómo funciona, rango y cinturones, currículum y ofertas de trabajo.
 *
 * El audio va para previsualizar en el Studio; el render final sale mudo y
 * se mezcla con `mezclar-audio.mjs`.
 */
export const ExplicadorVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RC.tinta950 }}>
    {explicador.tl.escenas.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/cama-explicador-rc.wav")} volume={0.6} />
    {explicador.tl.clips.map((c) => (
      <Sequence key={c.voz} name={`voz-${c.voz}`} from={c.desde}>
        <Audio src={staticFile(`voz-explicador-rc/${c.voz}.mp3`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
