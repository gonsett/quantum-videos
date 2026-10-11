import datos from "../../timeline-comunidades-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo de "Ya empezó sin vos". La genera `node montaje.mjs montaje-comunidades-rc.json`. */
export const comunidades = crearTimeline(datos as unknown as TimelineVoz);

/** Cuadro, dentro de su escena, en que la voz dice `palabra`. */
export const L = (escena: string, palabra: string, vez = 1) => comunidades.cuadro(escena, palabra, vez);
export const DUR = (escena: string) => comunidades.escena(escena).durationInFrames;
