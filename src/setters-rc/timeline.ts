import datos from "../../timeline-setters-rc.json";
import { crearTimeline, type TimelineVoz } from "../ring-closers/timeline";

/** Línea de tiempo de "Señal detectada" (Ring Setters). La genera `node montaje.mjs montaje-setters-rc.json --whisper`. */
export const tl = crearTimeline(datos as unknown as TimelineVoz);

/** Cuadro GLOBAL en que la voz dice `palabra` dentro de `escena`. */
export const G = (escena: string, palabra: string, vez = 1) => tl.escena(escena).from + tl.cuadro(escena, palabra, vez);
export const INI = (escena: string) => tl.escena(escena).from;
export const DUR = (escena: string) => tl.escena(escena).durationInFrames;
export const TOTAL = tl.total;
