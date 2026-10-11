import datos from "../../timeline-directores-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/**
 * Línea de tiempo del video para directores comerciales ("La firma"). La genera
 * `node montaje.mjs montaje-directores-rc.json --whisper` (lo arma `armar-montaje-directores.mjs`).
 * Cada escena arranca en un beat (múltiplos de 15 cuadros = 120 BPM a 30 fps).
 */
export const directores = crearTimeline(datos as unknown as TimelineVoz);
export const DURACION_DIRECTORES = directores.total;
export const BEAT = 15;
export const L = (escena: string, palabra: string, vez = 1) => directores.cuadro(escena, palabra, vez);
export const DESDE = (escena: string) => directores.escena(escena).from;
export const DUR = (escena: string) => directores.escena(escena).durationInFrames;
export const A = (escena: string, palabra: string, vez = 1) => DESDE(escena) + L(escena, palabra, vez);
