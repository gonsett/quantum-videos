import datos from "../timeline-reparto.json";

/** Linea de tiempo del comercial de reparto. Fuente unica del montaje y la musica. */
export type EscenaRep = {
  id: string;
  voz: string;
  from: number;
  durationInFrames: number;
  vozDelay: number;
};

let acumulado = 0;

export const ESCENAS_REP: EscenaRep[] = datos.escenas.map((e) => {
  const escena: EscenaRep = {
    id: e.id, voz: e.voz, from: acumulado,
    durationInFrames: e.durationInFrames, vozDelay: e.vozDelay,
  };
  acumulado += e.durationInFrames;
  return escena;
});

export const DURACION_REP = acumulado;
