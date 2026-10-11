import datos from "../../timeline-racha-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo del cuarto video de Ring Closers. La genera `node montaje.mjs montaje-racha-rc.json`. */
export const racha = crearTimeline(datos as TimelineVoz);
export const DURACION_RACHA = racha.total;
