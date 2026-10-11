import datos from "../timeline-panel.json";

/** Linea de tiempo del recorrido por el panel. Fuente unica del montaje y la musica. */
export type EscenaPanel = {
  id: string;
  voz: string;
  from: number;
  durationInFrames: number;
  vozDelay: number;
};

let acumulado = 0;

export const ESCENAS_PANEL: EscenaPanel[] = datos.escenas.map((e) => {
  const escena: EscenaPanel = {
    id: e.id,
    voz: e.voz,
    from: acumulado,
    durationInFrames: e.durationInFrames,
    vozDelay: e.vozDelay,
  };
  acumulado += e.durationInFrames;
  return escena;
});

export const DURACION_PANEL = acumulado;
