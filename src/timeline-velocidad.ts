import datos from "../timeline-velocidad.json";

/** Linea de tiempo del comercial con estructura KAYN. Fuente unica del montaje y la musica. */
export type EscenaVel = {
  id: string;
  voz: string;
  from: number;
  durationInFrames: number;
  vozDelay: number;
  /** Frames que dura la locucion: reparte la entrada de las lineas. */
  vozFrames: number;
};

let acumulado = 0;

export const ESCENAS_VEL: EscenaVel[] = datos.escenas.map((e) => {
  const escena: EscenaVel = {
    id: e.id,
    voz: e.voz,
    from: acumulado,
    durationInFrames: e.durationInFrames,
    vozDelay: e.vozDelay,
    vozFrames: e.vozFrames,
  };
  acumulado += e.durationInFrames;
  return escena;
});

export const DURACION_VEL = acumulado;
