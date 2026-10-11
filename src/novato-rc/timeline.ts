import datos from "../../timeline-novato-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/**
 * Línea de tiempo del video para closers novatos. La genera
 * `node montaje.mjs montaje-novato-rc.json --whisper` (lo arma `armar-montaje-novato.mjs`).
 * Cada escena arranca en un beat (múltiplos de 15 cuadros = 120 BPM a 30 fps).
 */
export const novato = crearTimeline(datos as unknown as TimelineVoz);
export const DURACION_NOVATO = novato.total;

/** 120 BPM a 30 fps: un beat cada 15 cuadros. */
export const BEAT = 15;

/** Cuadro, dentro de su escena, en que la voz dice `palabra`. `vez` distingue repeticiones. */
export const L = (escena: string, palabra: string, vez = 1) => novato.cuadro(escena, palabra, vez);

/** Cuadro absoluto en que empieza la escena. */
export const DESDE = (escena: string) => novato.escena(escena).from;

/** Duración de una escena, en cuadros. */
export const DUR = (escena: string) => novato.escena(escena).durationInFrames;
