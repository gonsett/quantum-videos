import datos from "../../timeline-que-es-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/**
 * Línea de tiempo de "Qué es Ring Closers". La genera
 * `node montaje.mjs montaje-que-es-rc.json` (con `--estimar` arma un borrador
 * sin voz, marcado con `_borrador`, solo para mostrar la imagen).
 */
export const queEs = crearTimeline(datos as unknown as TimelineVoz);
export const DURACION_QUE_ES = queEs.total;
export const ES_BORRADOR = "_borrador" in datos;

/** Cuadro, dentro de su escena, en que la voz dice `palabra`. `vez` distingue repeticiones. */
export const L = (escena: string, palabra: string, vez = 1) => queEs.cuadro(escena, palabra, vez);

/** Cuadro absoluto en que la voz dice `palabra`. */
export const A = (escena: string, palabra: string, vez = 1) =>
  queEs.escena(escena).from + queEs.cuadro(escena, palabra, vez);

/** Duración de una escena, en cuadros. */
export const DUR = (escena: string) => queEs.escena(escena).durationInFrames;

/** Cuadro (local a la escena) en que empieza la voz de su primera toma: lo anterior es la carátula. */
export const VOZ = (escena: string) => queEs.escena(escena).clips[0].enEscena;
