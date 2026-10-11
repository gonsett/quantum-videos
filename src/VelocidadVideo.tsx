import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import guion from "../guion-velocidad.json";
import { ESCENAS_VEL } from "./timeline-velocidad";
import { EASE, F, FONT_MONO, FONT_TITULAR, SAFE_X } from "./theme-fuga";

/**
 * Comercial con la estructura de KAYN (@kayn.marketing.co).
 *
 * El mecanismo, decodificado de sus guiones: cada LÍNEA del texto es una
 * tarjeta de subtítulo que entra sincronizada a la locución. Por eso las
 * líneas son de 2 a 5 palabras — el guion es el storyboard.
 *
 * Cada beat tiene una ilustración a sangre con deriva lenta, y las líneas
 * se apilan sobre un degradado que las despega del fondo.
 */

const LINEAS_POR_BEAT: Record<string, string[]> = Object.fromEntries(
  guion.segmentos.map((s) => [s.id, s.lineas]),
);

/** Ilustración a sangre con acercamiento lento. */
const Ilustracion: React.FC<{ imagen: string; duracion: number }> = ({
  imagen,
  duracion,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: F.fondo }}>
      <Img
        src={staticFile(`ilustraciones/${imagen}.png`)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // Deriva: la imagen nunca queda quieta, pero el movimiento
          // es lo bastante lento como para no distraer del texto
          scale: interpolate(frame, [0, duracion], [1.06, 1.14], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(...EASE),
          }),
        }}
      />

      {/* Degradado inferior: despega el texto de la imagen */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(4,7,14,0) 38%, rgba(4,7,14,0.82) 64%, rgba(4,7,14,0.96) 100%)",
        }}
      />
      {/* Viñeta suave */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 78% 62% at 50% 42%, rgba(0,0,0,0) 45%, rgba(4,7,14,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Las líneas del beat, entrando de a una.
 *
 * El reparto es proporcional al largo de cada línea dentro del tramo de
 * voz: una línea larga tarda más en decirse que una corta, así que se
 * reparte por caracteres y no en partes iguales.
 */
const Lineas: React.FC<{
  lineas: string[];
  vozDelay: number;
  vozFrames: number;
  resaltarUltima?: boolean;
}> = ({ lineas, vozDelay, vozFrames, resaltarUltima = true }) => {
  const frame = useCurrentFrame();

  const total = lineas.reduce((s, l) => s + l.length, 0);
  let acumulado = 0;
  const inicios = lineas.map((l) => {
    const inicio = vozDelay + (acumulado / total) * vozFrames;
    acumulado += l.length;
    return inicio;
  });

  return (
    <AbsoluteFill
      style={{
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
        paddingBottom: 210,
        justifyContent: "flex-end",
        alignItems: "flex-start",
      }}
    >
      <div style={{ width: 1080 - SAFE_X * 2 }}>
        {lineas.map((linea, i) => {
          const inicio = inicios[i];
          const esUltima = i === lineas.length - 1;
          const resalta = resaltarUltima && esUltima && lineas.length > 1;

          const ap = interpolate(frame, [inicio, inicio + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(...EASE),
          });

          const contenido = (
            <span
              style={{
                fontFamily: FONT_TITULAR,
                fontSize: 50,
                lineHeight: 1.1,
                letterSpacing: "-0.028em",
                color: resalta ? F.fondo : F.texto,
                textTransform: "uppercase",
              }}
            >
              {linea}
            </span>
          );

          if (resalta) {
            return (
              <div key={i} style={{ marginTop: i === 0 ? 0 : 10 }}>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: F.oroVivo,
                    padding: "6px 18px 12px",
                    rotate: "-1deg",
                    clipPath: `inset(0 ${100 - ap * 100}% 0 0)`,
                  }}
                >
                  {contenido}
                </div>
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                marginTop: i === 0 ? 0 : 10,
                opacity: ap,
                translate: interpolate(
                  frame,
                  [inicio, inicio + 16],
                  ["0px 18px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(...EASE),
                  },
                ),
              }}
            >
              {contenido}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Marca fija arriba y contador de beat, como la serie numerada de KAYN. */
const Firma: React.FC<{ indice: number; total: number }> = ({ indice, total }) => {
  const frame = useCurrentFrame();
  const ap = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
        paddingTop: 82,
        justifyContent: "flex-start",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", opacity: ap * 0.85 }}>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: F.oro,
            textTransform: "uppercase",
          }}
        >
          Secreto de venta #01
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.16em",
            color: F.tenue,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {String(indice).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const VelocidadVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: F.fondo }}>
      {ESCENAS_VEL.map((e, i) => (
        <Sequence
          key={e.id}
          name={e.id}
          from={e.from}
          durationInFrames={e.durationInFrames}
        >
          <Ilustracion imagen={e.id} duracion={e.durationInFrames} />
          <Lineas
            lineas={LINEAS_POR_BEAT[e.id] ?? []}
            vozDelay={e.vozDelay}
            vozFrames={e.vozFrames}
          />
          <Firma indice={i + 1} total={ESCENAS_VEL.length} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/cama-velocidad.wav")} volume={0.34} />

      {ESCENAS_VEL.map((e) => (
        <Sequence key={`v-${e.id}`} name={`voz-${e.id}`} from={e.from + e.vozDelay}>
          <Audio src={staticFile(`voz-velocidad-proc/${e.voz}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
