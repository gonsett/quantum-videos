import datos from "../../timeline-rc-v2.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo del Reel v2. La genera `node montaje.mjs montaje-rc-v2.json`. */
export const reel = crearTimeline(datos as TimelineVoz);
export const DURACION_REEL = reel.total;
