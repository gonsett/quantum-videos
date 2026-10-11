import type { Foco } from "../components/producto";

/**
 * Recortes sobre cada captura del panel.
 *
 * La regla que manda acá es la legibilidad en un celular, no mostrar la
 * pantalla completa. Las capturas tienen tipografía de interfaz de ~14 px:
 * si recorto 1500 px de origen en los 888 útiles, esa tipografía baja a
 * 8 px y no se lee. Por eso cada recorte es angosto —entre 640 y 1010 px
 * de origen— y toma sólo la región que sostiene la frase de esa escena.
 *
 * Factor de escala resultante por escena, para no perderlo de vista:
 *   pulso  888/640  = 1.39x
 *   leads  888/700  = 1.27x
 *   score  888/345  = 2.57x
 *   autos  888/700  = 1.27x
 */
export const FOCOS: Record<string, Foco> = {
  /** El contraste 37s → 3.1 h: las cifras ya son grandes en el producto. */
  pulso: { x: 350, y: 160, w: 640, h: 180, srcW: 1896, srcH: 905 },

  /** Interés, temperatura y estado: las columnas que sostienen la frase. */
  leads: { x: 560, y: 255, w: 700, h: 300, srcW: 1896, srcH: 901 },

  /** El panel de score, que es lo más legible de toda la interfaz. */
  score: { x: 1568, y: 8, w: 349, h: 334, srcW: 1917, srcH: 905 },

  /** Patente y modelo. */
  autos: { x: 350, y: 350, w: 700, h: 300, srcW: 1895, srcH: 902 },
};
