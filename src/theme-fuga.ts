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
 * Paleta del comercial de fuga de cartera. Quantum Coffee sobre fondo
 * muy oscuro: el 3D necesita negro profundo para que los materiales
 * metálicos tengan contra qué recortarse.
 */
export const F = {
  /** Fondo, más oscuro que el navy de marca para dar contraste al 3D */
  fondo: "#04070E",
  navy: "#0A1733",
  navy2: "#101C36",
  borde: "#232A35",
  texto: "#F8F9F7",
  mist: "#E8ECF2",
  tenue: "#8A94A6",
  /** dorado champagne: material de los objetos que se van */
  oro: "#B08D57",
  /** dorado vivo: resaltes tipográficos */
  oroVivo: "#E8B01F",
  /** claro: material de los objetos que quedan en el sistema */
  claro: "#E8ECF2",
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const SAFE_X = 96;
export const ANCHO = VIDEO.width - SAFE_X * 2;

/** Curva de entrada. Tupla explícita para poder hacerle spread a Easing.bezier. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
