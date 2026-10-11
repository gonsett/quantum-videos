import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Escena, Etiqueta, Fondo, Parrafo } from "../components/base";
import { Cifra, Riel, logSegAProgreso } from "../components/Reloj";
import { C, EASE, FONT_MONO } from "../theme";

const CHIPS = ["respondido", "cualificado", "Diego M. lo tomó", "puntaje 72"];

/** El mismo eje, el otro reloj. Aca cierra la comparacion. */
export const S5AutomLead: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Fondo>
      <Escena>
        {/* El reloj anterior, ya reducido: queda como referencia */}
        <div
          style={{
            opacity: interpolate(frame, [0, 12], [1, 0.4], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginBottom: 18,
          }}
        >
          <Etiqueta color={C.tenue} size={21}>
            Hoy, sin sistema
          </Etiqueta>
          <div style={{ marginTop: 10 }}>
            <Cifra texto="32 h 13 m" color={C.navy} size={62} />
          </div>
        </div>

        <div
          style={{
            width: 888,
            height: 2,
            backgroundColor: C.borde,
            margin: "30px 0 38px",
          }}
        />

        <div style={{ marginBottom: 22 }}>
          <Etiqueta delay={8} color={C.oroSuave}>
            Con AutomLead
          </Etiqueta>
        </div>

        {/* La respuesta va sobre caja dorada: es el resalte del feed */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: C.oro,
            padding: "6px 30px 14px",
            opacity: interpolate(frame, [14, 26], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
            scale: interpolate(frame, [14, 32], [0.9, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
              output: "perceptual-scale",
            }),
          }}
        >
          <Cifra texto="3 s" color={C.navy} size={186} />
        </div>

        <div style={{ marginTop: 42 }}>
          <Riel
            progreso={interpolate(frame, [14, 30], [0, logSegAProgreso(3)], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            })}
            color={C.oro}
          />
        </div>

        {/* Estado del lead ya resuelto */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 11,
            marginTop: 52,
            maxWidth: 900,
          }}
        >
          {CHIPS.map((chip, i) => (
            <div
              key={chip}
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 23,
                letterSpacing: "0.03em",
                color: C.navy,
                backgroundColor: "#FFFFFF",
                border: `2px solid ${C.borde}`,
                padding: "10px 17px",
                opacity: interpolate(frame, [58 + i * 10, 76 + i * 10], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(...EASE),
                }),
                translate: interpolate(
                  frame,
                  [58 + i * 10, 80 + i * 10],
                  ["0px 14px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(...EASE),
                  },
                ),
              }}
            >
              {chip}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 42 }}>
          <Parrafo delay={120} size={36} color={C.tenue}>
            Los dos relojes miden lo mismo: el tiempo hasta la primera
            respuesta.
          </Parrafo>
        </div>
      </Escena>
    </Fondo>
  );
};
