import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Archivo variable, cargada desde el proyecto y no desde Google.
 *
 * Es la MISMA familia que usan los videos, pero acá se usa el eje de ancho
 * (`wdth`), que la versión estática no expone. Ese eje es todo el punto:
 * la palabra "CONCESIONARIO" tiene trece letras y en ancho normal no entra
 * con aire; en ancho expandido entra y además se lee de un golpe.
 *
 * Se sirve local para que el render sea reproducible: si Google cambia el
 * archivo, la pieza no cambia sola.
 */
const handle = delayRender("Cargando Archivo variable");

const archivo = new FontFace(
  "ArchivoVar",
  `url(${staticFile("fuentes/Archivo.ttf")}) format("truetype")`,
  { weight: "100 900", stretch: "62% 125%" },
);

archivo
  .load()
  .then((cargada) => {
    document.fonts.add(cargada);
    continueRender(handle);
  })
  .catch((e) => {
    // Si falla, mejor renderizar con la de respaldo que colgar el render
    console.error("No se pudo cargar Archivo variable:", e);
    continueRender(handle);
  });

export const ARCHIVO = "ArchivoVar";

/** Ancho expandido para titulares. 125 es el tope del eje. */
export const EXPANDIDA = (peso: number, ancho = 118) =>
  `'wdth' ${ancho}, 'wght' ${peso}`;
