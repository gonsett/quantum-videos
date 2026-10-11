import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Escena, Etiqueta, Fondo, Parrafo, Titular } from "../components/base";
import { Cifra, Riel } from "../components/Reloj";
import { C, EASE, FONT_MONO } from "../theme";

/** El cronometro se detiene. La cifra es el golpe. */
export const S4Golpe: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Fondo>
      <Escena>
        <div style={{ marginBottom: 26 }}>
          <Etiqueta color={C.oroSuave}>Hoy, sin sistema</Etiqueta>
        </div>

        <div
          style={{
            scale: interpolate(frame, [0, 14], [1.06, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
              output: "perceptual-scale",
            }),
          }}
        >
          <Cifra texto="32 h 13 m" color={C.navy} size={172} />
        </div>

        <div style={{ marginTop: 50 }}>
          <Riel progreso={1} color={C.navy} />
        </div>

        <div
          style={{
            marginTop: 60,
            paddingLeft: 26,
            borderLeft: `8px solid ${C.oro}`,
            opacity: interpolate(frame, [26, 48], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
            translate: interpolate(frame, [26, 52], ["0px 20px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 23,
              letterSpacing: "0.2em",
              color: C.tenue,
              marginBottom: 14,
            }}
          >
            LUNES 08:00
          </div>
          <Parrafo size={44} maxWidth={820}>
            Nadie lo vio hasta que abrió la agencia.
          </Parrafo>
        </div>

        <div style={{ marginTop: 50 }}>
          <Titular size={56} resalte inclinacion={-1.2} delay={108}>
            Ya eligió otra concesionaria
          </Titular>
        </div>
      </Escena>
    </Fondo>
  );
};
