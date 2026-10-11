import datos from "../../timeline-explicador-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo del explicador. La genera `node montaje.mjs montaje-explicador-rc.json`. */
export const explicador = crearTimeline(datos as TimelineVoz);
export const DURACION_EXPLICADOR = explicador.total;
