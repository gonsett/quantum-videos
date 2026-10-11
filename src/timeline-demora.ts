import datos from "../timeline-demora.json";

/** Linea de tiempo del comercial de demora. Fuente unica del montaje y la musica. */
export type EscenaDem = {
  id: string;
  voz: string;
  from: number;
  durationInFrames: number;
  vozDelay: number;
};

let acumulado = 0;

export const ESCENAS_DEM: EscenaDem[] = datos.escenas.map((e) => {
  const escena: EscenaDem = {
    id: e.id, voz: e.voz, from: acumulado,
    durationInFrames: e.durationInFrames, vozDelay: e.vozDelay,
  };
  acumulado += e.durationInFrames;
  return escena;
});

export const DURACION_DEM = acumulado;
