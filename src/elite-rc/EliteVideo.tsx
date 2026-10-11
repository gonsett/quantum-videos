import { Sequence, interpolate, useCurrentFrame } from "remotion";
import { Noche } from "../ring-closers/piezas";
import { Acabado, Destello as Bokeh } from "../secreto-rc/efectos";
import { E1Gancho, E2Puente, E3Afilas, E4Conocen, E5Buscan, E6Cierre } from "./escenas";
import { elite } from "./timeline";

const COMPONENTES: Record<string, React.FC> = {
  "e1-gancho": E1Gancho,
  "e2-puente": E2Puente,
  "e3-afilas": E3Afilas,
  "e4-conocen": E4Conocen,
  "e5-buscan": E5Buscan,
  "e6-cierre": E6Cierre,
};

/** Las estrellas desenfocadas de las esquinas: a pleno en la apertura y el cierre, bajas mientras hay tarjetas. */
const Estrellas: React.FC = () => {
  const frame = useCurrentFrame();
  const e3 = elite.escena("e3-afilas").from;
  const e6 = elite.escena("e6-cierre").from;
  const k = interpolate(frame, [e3 - 10, e3 + 10, e6 - 6, e6 + 12], [1, 0.42, 0.42, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Bokeh x={930} y={110} size={720} rot={18} blur={24} fase={0.4} opacidad={0.8 * k} />
      <Bokeh x={90} y={1790} size={600} rot={-14} blur={28} fase={2.1} opacidad={0.66 * k} />
      <Bokeh x={175} y={1010} size={110} rot={8} blur={2.5} fase={1.2} opacidad={0.5 * k} />
    </>
  );
};

/**
 * Video para closers de élite (9:16). Seis escenas, una por toma de voz; cada una arranca en un
 * beat de 120 BPM. Sale mudo del render; la voz y la música se mezclan aparte.
 */
export const EliteVideo: React.FC = () => (
  <Noche foco={0.9}>
    <Estrellas />
    {elite.tl.escenas.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}
    <Acabado />
  </Noche>
);
