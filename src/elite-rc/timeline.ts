import datos from "../../timeline-elite-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/**
 * Línea de tiempo del video para closers de élite. La genera
 * `node montaje.mjs montaje-elite-rc.json --whisper` (o `--estimar` para un borrador sin voz).
 * Cada escena arranca en un beat (múltiplos de 15 cuadros = 120 BPM a 30 fps), así los cortes
 * caen en el compás de la música. Lo arma `armar-montaje-elite.mjs`.
 */
export const elite = crearTimeline(datos as unknown as TimelineVoz);
export const DURACION_ELITE = elite.total;
export const ES_BORRADOR = "_borrador" in datos;

/** 120 BPM a 30 fps: un beat cada 15 cuadros. */
export const BEAT = 15;

/** Cuadro, dentro de su escena, en que la voz dice `palabra`. `vez` distingue repeticiones. */
export const L = (escena: string, palabra: string, vez = 1) => elite.cuadro(escena, palabra, vez);

/** Cuadro absoluto en que la voz dice `palabra`. */
export const A = (escena: string, palabra: string, vez = 1) =>
  elite.escena(escena).from + elite.cuadro(escena, palabra, vez);

/** Duración de una escena, en cuadros. */
export const DUR = (escena: string) => elite.escena(escena).durationInFrames;

/** Cuadro (local a la escena) en que empieza la voz de su primera toma. */
export const VOZ = (escena: string) => elite.escena(escena).clips[0].enEscena;
