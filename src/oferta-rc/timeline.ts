import datos from "../../timeline-oferta-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo de "Secreto de contratación #1". La genera `node montaje.mjs montaje-oferta-rc.json --whisper`. */
export const oferta = crearTimeline(datos as unknown as TimelineVoz);
export const DURACION_OFERTA = oferta.total;

/** Cuadro, dentro de su escena, en que la voz dice `palabra`. */
export const L = (escena: string, palabra: string, vez = 1) => oferta.cuadro(escena, palabra, vez);
export const DUR = (escena: string) => oferta.escena(escena).durationInFrames;
