import datos from "../../timeline-ringclosers.json";

/**
 * Línea de tiempo de Ring Closers. La genera montaje-ringclosers.mjs.
 *
 * Las escenas no llevan números mágicos de sincronía: piden el cuadro de una
 * palabra ("encima", "rango") y lo reciben ya calculado sobre la toma real.
 * Si mañana se regenera la voz, la imagen se reacomoda sola.
 */

export type ClipRC = {
  voz: string;
  enEscena: number;
  cuadros: number;
  palabras: { palabra: string; cuadro: number }[];
};

export type EscenaRC = {
  id: string;
  round: number;
  from: number;
  durationInFrames: number;
  clips: ClipRC[];
};

export type TimelineVoz = {
  fps: number;
  total: number;
  escenas: EscenaRC[];
  clips: { voz: string; desde: number }[];
};

export const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/**
 * Ata las búsquedas a un timeline concreto. El comercial y el Reel tienen
 * cada uno su JSON, pero la forma de pedir "el cuadro de tal palabra" es la
 * misma.
 */
export const crearTimeline = (tl: TimelineVoz) => {
  const escena = (id: string) => {
    const e = tl.escenas.find((x) => x.id === id);
    if (!e) throw new Error(`Escena ${id} no está en el timeline`);
    return e;
  };

  /**
   * Cuadro (relativo al inicio de la escena) en que la voz dice `palabra`.
   * `vez` distingue repeticiones: "uno" aparece dos veces en "uno a tu
   * nivel, uno por encima".
   */
  const cuadro = (escenaId: string, palabra: string, vez = 1): number => {
    const buscada = normalizar(palabra);
    let vistas = 0;
    for (const clip of escena(escenaId).clips) {
      for (const w of clip.palabras) {
        if (normalizar(w.palabra) === buscada && ++vistas === vez) return w.cuadro;
      }
    }
    throw new Error(`"${palabra}" (vez ${vez}) no aparece en ${escenaId}`);
  };

  return { tl, escena, cuadro, total: tl.total };
};

const rc = crearTimeline(datos as TimelineVoz);

export const TIMELINE_RC = rc.tl;
export const DURACION_RC = rc.total;
export const escenaRC = rc.escena;
export const cuadro = rc.cuadro;
