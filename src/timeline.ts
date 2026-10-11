import datos from "../timeline.json";

/**
 * Linea de tiempo del comercial.
 *
 * Las duraciones salen de medir la locucion real generada con edge-tts,
 * no son estimaciones: cada escena dura lo que dura su frase mas una pausa.
 * El archivo timeline.json es la fuente unica: tambien lo lee
 * generar-audio.mjs para colocar los golpes sonoros en el mismo lugar.
 */
export type Escena = {
  id: string;
  /** Archivo de voz en public/voz/. */
  voz: string;
  /** Frame donde arranca la escena (acumulado, no se escribe a mano). */
  from: number;
  durationInFrames: number;
  /** Retraso de la voz respecto al inicio de la escena, en frames. */
  vozDelay: number;
};

let acumulado = 0;

export const ESCENAS: Escena[] = datos.escenas.map((e) => {
  const escena: Escena = {
    id: e.id,
    voz: e.voz,
    from: acumulado,
    durationInFrames: e.durationInFrames,
    vozDelay: e.vozDelay,
  };
  acumulado += e.durationInFrames;
  return escena;
});

export const DURACION_TOTAL = acumulado;
