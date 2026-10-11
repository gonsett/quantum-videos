import { Easing, interpolate, useCurrentFrame } from "remotion";
import { DISPLAY, EASE, RC } from "../ring-closers/tema";
import { normalizar, type ClipRC } from "../ring-closers/timeline";

/**
 * Subtítulos quemados, palabra por palabra.
 *
 * El Reel se ve primero sin sonido, así que los subtítulos son el guion.
 * Cada palabra aparece en el cuadro en que la voz la dice (medido sobre la
 * toma real), agrupadas en bloques cortos de hasta 3 palabras que se cortan
 * en la puntuación: un bloque es lo que el ojo lee de un vistazo.
 *
 * Posición: franja centrada entre y 1180 y 1360, con 800 px de ancho. Queda
 * por encima del texto de la publicación de Instagram y a la izquierda de
 * la columna de botones, que tapan el tercio inferior y el borde derecho.
 */

const MAX_PALABRAS = 3;

type Bloque = { palabras: { texto: string; cuadro: number }[]; desde: number; hasta: number };

const armarBloques = (clips: ClipRC[], finEscena: number): Bloque[] => {
  const bloques: Bloque[] = [];
  for (const clip of clips) {
    let actual: { texto: string; cuadro: number }[] = [];
    const cerrar = () => {
      if (actual.length) bloques.push({ palabras: actual, desde: actual[0].cuadro, hasta: 0 });
      actual = [];
    };
    for (const w of clip.palabras) {
      actual.push({ texto: w.palabra, cuadro: w.cuadro });
      const cortaPuntuacion = /[.,:;!?—]$/.test(w.palabra);
      if (cortaPuntuacion || actual.length >= MAX_PALABRAS) cerrar();
    }
    cerrar();
  }
  // Cada bloque dura hasta que empieza el siguiente; el último, hasta el final
  bloques.forEach((b, k) => {
    b.hasta = k < bloques.length - 1 ? bloques[k + 1].desde : finEscena;
  });
  return bloques;
};

export const Subtitulos: React.FC<{
  clips: ClipRC[];
  duracionEscena: number;
  /** Palabras que van en esmeralda (se comparan sin tildes ni puntuación). */
  clave: string[];
}> = ({ clips, duracionEscena, clave }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(...EASE);
  const claves = new Set(clave.map(normalizar));
  const bloques = armarBloques(clips, duracionEscena);
  const bloque = bloques.find((b) => frame >= b.desde - 1 && frame < b.hasta);
  if (!bloque) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        right: 140,
        top: 1180,
        height: 180,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "center",
        columnGap: 20,
        rowGap: 4,
      }}
    >
      {bloque.palabras.map((w, k) => {
        const entra = interpolate(frame, [w.cuadro - 1, w.cuadro + 3], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
        const esClave = claves.has(normalizar(w.texto));
        return (
          <span
            key={`${w.cuadro}-${k}`}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 1.08,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: esClave ? RC.esmeralda500 : RC.crema,
              opacity: entra,
              translate: `0px ${(1 - entra) * 10}px`,
            }}
          >
            {w.texto.replace(/[—]/g, "")}
          </span>
        );
      })}
    </div>
  );
};
