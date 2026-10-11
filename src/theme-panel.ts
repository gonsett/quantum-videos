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
 * Paleta Quantum Coffee con las dos caras en un solo lugar.
 *
 * Este video alterna: las escenas de dato van en oscuro y las de producto
 * en claro, igual que el video de referencia de Padrón AGIP. El contraste
 * entre ambas es lo que marca los capítulos sin necesidad de transiciones.
 */
export const P = {
  // ── Cara clara: para las escenas de producto ──
  papel: "#F8F9F7",
  papelHondo: "#F1F1EE",
  lineaClara: "#E4E5E1",
  bordeClaro: "#D9DAD6",

  // ── Cara oscura: para las escenas de dato ──
  tinta: "#070E1E",
  navy: "#0A1733",
  navy2: "#10203F",
  bordeOscuro: "#232A35",

  // ── Texto ──
  /** sobre claro */
  textoClaro: "#0A1733",
  grafito: "#232A35",
  tenueClaro: "#6B7480",
  /** sobre oscuro */
  textoOscuro: "#F8F9F7",
  mist: "#E8ECF2",
  tenueOscuro: "#8A94A6",

  // ── Acento ──
  /** dorado champagne: línea fina, etiquetas, detalles */
  oro: "#B08D57",
  /** dorado vivo: cajas de resalte, píldoras, cifras clave */
  oroVivo: "#E8B01F",
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const SAFE_X = 96;
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Ancho útil de contenido dentro del margen seguro. */
export const ANCHO = VIDEO.width - SAFE_X * 2;
