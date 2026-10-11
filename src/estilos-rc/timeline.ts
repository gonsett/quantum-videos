import datos from "../../timeline-estilos-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo del video de estilos. La genera `node montaje.mjs montaje-estilos-rc.json`. */
export const estilos = crearTimeline(datos as TimelineVoz);
export const DURACION_ESTILOS = estilos.total;
