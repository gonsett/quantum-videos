import { Sequence, interpolate, useCurrentFrame } from "remotion";
import { Noche } from "../ring-closers/piezas";
import { Acabado, Destello } from "../secreto-rc/efectos";
import { E1QueEs, E2Problema, E3Solucion, E4Juego, E5Evaluan, E6Ven, E7Cierre, Handle } from "./escenas";
import { A, queEs } from "./timeline";

const COMPONENTES: Record<string, React.FC> = {
  "e1-que-es": E1QueEs,
  "e2-problema": E2Problema,
  "e3-solucion": E3Solucion,
  "e4-juego": E4Juego,
  "e5-evaluan": E5Evaluan,
  "e6-ven": E6Ven,
  "e7-cierre": E7Cierre,
};

/**
 * Las estrellas desenfocadas de las esquinas acompañan todo el video: a pleno
 * en la apertura y el cierre (donde manda el cinturón) y bajas mientras la
 * pantalla muestra pruebas, para que no compitan con las tarjetas.
 */
const Estrellas: React.FC = () => {
  const frame = useCurrentFrame();
  const e2 = queEs.escena("e2-problema").from;
  const e7 = queEs.escena("e7-cierre").from;
  const k = interpolate(frame, [e2, e2 + 24, e7 - 12, e7 + 20], [1, 0.4, 0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Destello x={930} y={110} size={720} rot={18} blur={24} fase={0.4} opacidad={0.85 * k} />
      <Destello x={90} y={1790} size={600} rot={-14} blur={28} fase={2.1} opacidad={0.7 * k} />
      <Destello x={175} y={1010} size={110} rot={8} blur={2.5} fase={1.2} opacidad={0.55 * k} />
    </>
  );
};

/**
 * "Qué es Ring Closers" — 9:16. Estilo de la serie "Secreto de closer":
 * tipografía cinética, cinturón metálico, estrellas desenfocadas y grano.
 * Tres rounds: qué es, qué problema resuelve, por qué usarlo.
 *
 * Sale mudo del render; la voz y el diseño sonoro se mezclan aparte.
 */
export const QueEsVideo: React.FC = () => (
  <Noche foco={0.85}>
    <Estrellas />
    {queEs.tl.escenas.map((e) => {
      const C = COMPONENTES[e.id];
      return (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
          <C />
        </Sequence>
      );
    })}
    <Sequence from={A("e1-que-es", "ring", 2) + 30} layout="none">
      <Handle desde={0} />
    </Sequence>
    <Acabado />
  </Noche>
);
