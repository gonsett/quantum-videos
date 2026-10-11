import datos from "../../timeline-comision-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo de "Lo que dejaste sobre la mesa". La genera `node montaje.mjs montaje-comision-rc.json --whisper`. */
export const tl = crearTimeline(datos as unknown as TimelineVoz);

/** Cuadro GLOBAL en que la voz dice `palabra` dentro de `escena`. */
export const G = (escena: string, palabra: string, vez = 1) => tl.escena(escena).from + tl.cuadro(escena, palabra, vez);
export const INI = (escena: string) => tl.escena(escena).from;
export const TOTAL = tl.total;
