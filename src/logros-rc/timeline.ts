import datos from "../../timeline-logros-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo de "Un año en treinta segundos". La genera `node montaje.mjs montaje-logros-rc.json`. */
export const logros = crearTimeline(datos as unknown as TimelineVoz);

/** Cuadro GLOBAL (desde el inicio del video) en que la voz dice `palabra` dentro de `escena`. */
export const G = (escena: string, palabra: string, vez = 1) => logros.escena(escena).from + logros.cuadro(escena, palabra, vez);
export const INI = (escena: string) => logros.escena(escena).from;
export const TOTAL = logros.total;
