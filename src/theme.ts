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

/** Titulares: la grotesca pesada del feed. */
export const FONT_TITULAR = archivoBlack.fontFamily;
/** Texto corrido y etiquetas. */
export const FONT_DISPLAY = archivo.fontFamily;
/** Cifras y datos. */
export const FONT_MONO = mono.fontFamily;

/**
 * Paleta tomada del feed real de @quantumcoffee.xyz, muestreada de las
 * publicaciones (no estimada a ojo).
 *
 * El feed es de fondo CLARO: navy para titulares, dorado brillante para
 * cajas de resalte y botones, dorado apagado para la línea fina. La web
 * es oscura, pero acá manda el feed porque el video se publica ahí.
 *
 * Semántica del video: la paleta no tiene verde ni rojo, así que la espera
 * se muestra en navy sólido (pesada, opresiva) y la respuesta en dorado
 * brillante (el resalte, lo que importa).
 */
export const C = {
  /** blanco cálido — fondo principal */
  papel: "#F8F9F7",
  /** un punto más cálido, para bloques */
  papel2: "#F1F1EE",
  /** navy profundo — titulares y texto */
  navy: "#0A1733",
  /** medido en el feed, algo más saturado */
  navyHondo: "#051932",
  /** grafito — texto secundario sobre claro */
  grafito: "#232A35",
  /** derivado — texto terciario */
  tenue: "#6b7480",
  /** dorado brillante — cajas de resalte, píldoras, CTA */
  oro: "#E8B01F",
  /** dorado champagne — línea fina, círculos, detalles */
  oroSuave: "#B08D57",
  /** líneas de grilla sobre papel */
  linea: "#E2E3E0",
  /** borde de bloques */
  borde: "#D8D9D5",
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** Margen lateral seguro para 1080 de ancho. */
export const SAFE_X = 96;

/** Curva de entrada: rapida y asentada, sin rebote. */
export const EASE = [0.16, 1, 0.3, 1] as const;
