import datos from "../../timeline-veteranos-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/**
 * Línea de tiempo del video para closers veteranoss. La genera
 * `node montaje.mjs montaje-veteranos-rc.json --whisper` (lo arma `armar-montaje-veteranos.mjs`).
 * Cada escena arranca en un beat (múltiplos de 15 cuadros = 120 BPM a 30 fps).
 */
export const veteranos = crearTimeline(datos as unknown as TimelineVoz);
export const DURACION_VETERANOS = veteranos.total;

/** 120 BPM a 30 fps: un beat cada 15 cuadros. */
export const BEAT = 15;

/** Cuadro, dentro de su escena, en que la voz dice `palabra`. `vez` distingue repeticiones. */
export const L = (escena: string, palabra: string, vez = 1) => veteranos.cuadro(escena, palabra, vez);

/** Cuadro absoluto en que empieza la escena. */
export const DESDE = (escena: string) => veteranos.escena(escena).from;

/** Duración de una escena, en cuadros. */
export const DUR = (escena: string) => veteranos.escena(escena).durationInFrames;

/** Cuadro absoluto en que la voz dice `palabra`. */
export const A = (escena: string, palabra: string, vez = 1) => veteranos.escena(escena).from + veteranos.cuadro(escena, palabra, vez);
