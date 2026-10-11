import datos from "../timeline-service.json";

/**
 * Linea de tiempo del segundo comercial (agenda de service).
 *
 * Fuente unica: timeline-service.json, que tambien lee
 * generar-musica-service.mjs para colocar los acentos en los mismos cortes.
 */
export type EscenaService = {
  id: string;
  voz: string;
  from: number;
  durationInFrames: number;
  vozDelay: number;
};

let acumulado = 0;

export const ESCENAS_SERVICE: EscenaService[] = datos.escenas.map((e) => {
  const escena: EscenaService = {
    id: e.id,
    voz: e.voz,
    from: acumulado,
    durationInFrames: e.durationInFrames,
    vozDelay: e.vozDelay,
  };
  acumulado += e.durationInFrames;
  return escena;
});

export const DURACION_SERVICE = acumulado;
