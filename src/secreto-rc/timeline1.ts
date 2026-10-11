import datos from "../../timeline-secreto1.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo con locutor. La genera `node montaje.mjs montaje-secreto1.json`. */
export const secreto1 = crearTimeline(datos as TimelineVoz);
export const DURACION_SECRETO_VOZ = secreto1.total;

/** Cuadro absoluto en que la voz dice `palabra`: inicio de su escena + su cuadro dentro de ella. */
export const A = (escena: string, palabra: string, vez = 1) =>
  secreto1.escena(escena).from + secreto1.cuadro(escena, palabra, vez);

/** Cuadro absoluto en que termina una escena. */
export const FIN = (escena: string) => {
  const e = secreto1.escena(escena);
  return e.from + e.durationInFrames;
};
