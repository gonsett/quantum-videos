import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

/**
 * Tema de Ring Closers.
 *
 * Los valores salen de `ring-closers/app/globals.css`, no de una
 * interpretación: el video tiene que verse como la app, y un esmeralda "más
 * o menos" se nota al lado de la landing. Las tres familias son las mismas
 * que carga `app/layout.tsx`.
 *
 * Nada de esto se comparte con AutomLead. Viven en el mismo proyecto de
 * Remotion por las herramientas de voz y música, pero son marcas distintas
 * con paletas que no se mezclan.
 */

const oswald = loadOswald("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
const manrope = loadManrope("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

/** Titulares: cartel de pelea. Siempre en mayúsculas. */
export const DISPLAY = oswald.fontFamily;
/** Texto de apoyo. */
export const SANS = manrope.fontFamily;
/** Todo número, hora o puntaje: tiene que leerse como marcador. */
export const MONO = mono.fontFamily;

export const RC = {
  tinta950: "#0b0b0d",
  tinta900: "#141416",
  tinta800: "#1e1e21",
  tinta700: "#2a2a2e",
  platino300: "#d4d4d8",
  platino500: "#a1a1aa",
  esmeralda400: "#34d399",
  esmeralda500: "#10b981",
  esmeralda600: "#059669",
  crema: "#fafaf9",
} as const;

/** Margen seguro del formato vertical. */
export const MARGEN = 96;
export const ANCHO_UTIL = 1080 - MARGEN * 2; // 888

/** Mismo easing que el resto de las piezas: entra rápido, se posa. */
export const EASE = [0.16, 1, 0.3, 1] as const;
