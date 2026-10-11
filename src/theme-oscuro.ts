import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const archivo = loadArchivo("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const archivoBlack = loadArchivoBlack("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
const mono = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

export const FONT_TITULAR = archivoBlack.fontFamily;
export const FONT_DISPLAY = archivo.fontFamily;
export const FONT_MONO = mono.fontFamily;

/**
 * Paleta Quantum Coffee, versión sobre fondo oscuro.
 *
 * Misma familia de colores que la versión clara: cambia cuál manda. Acá el
 * navy es el fondo y el off-white el texto, que es como funciona la web.
 * El dorado sigue siendo el acento y el único color que "habla".
 */
export const O = {
  /** navy profundo — fondo, un punto más oscuro que el de marca para que
      el dorado resalte */
  fondo: "#070E1E",
  /** navy de marca — superficies y tarjetas */
  navy: "#0A1733",
  /** un escalón más claro, para tarjetas sobre tarjetas */
  navy2: "#10203F",
  /** grafito — bordes y divisores */
  borde: "#232A35",
  /** borde vivo, para elementos activos */
  bordeVivo: "#33405A",
  /** blanco cálido — texto principal */
  texto: "#F8F9F7",
  /** mist — texto secundario sobre oscuro */
  mist: "#E8ECF2",
  /** derivado — texto terciario */
  tenue: "#8A94A6",
  /** dorado champagne — acento de marca */
  oro: "#B08D57",
  /** dorado brillante del feed — resaltes y confirmaciones */
  oroVivo: "#E8B01F",
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const SAFE_X = 96;
export const EASE = [0.16, 1, 0.3, 1] as const;
