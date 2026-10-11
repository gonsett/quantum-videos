import datos from "../timeline-fuga.json";

/** Linea de tiempo del comercial de fuga. Fuente unica del montaje y la musica. */
export type EscenaFuga = {
  id: string;
  voz: string;
  from: number;
  durationInFrames: number;
  vozDelay: number;
};

let acumulado = 0;

export const ESCENAS_FUGA: EscenaFuga[] = datos.escenas.map((e) => {
  const escena: EscenaFuga = {
    id: e.id,
    voz: e.voz,
    from: acumulado,
    durationInFrames: e.durationInFrames,
    vozDelay: e.vozDelay,
  };
  acumulado += e.durationInFrames;
  return escena;
});

export const DURACION_FUGA = acumulado;
