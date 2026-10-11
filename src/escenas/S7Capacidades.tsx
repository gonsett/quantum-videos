import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Escena, Etiqueta, Fondo } from "../components/base";
import { C, EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR } from "../theme";

const CAPACIDADES = [
  {
    cifra: "3 s",
    titulo: "Contesta siempre",
    detalle:
      "Domingo a la madrugada incluido. Mientras el cliente todavía está mirando el auto.",
  },
  {
    cifra: "0 → 100",
    titulo: "Puntúa con una cuenta auditable",
    detalle:
      "Si un gerente pregunta por qué este lead tiene 60 y aquel 45, hay una respuesta.",
  },
  {
    cifra: "t. resp.",
    titulo: "Muestra cuánto tarda cada vendedor",
    detalle:
      "El promedio general esconde al vendedor que tarda dos días. Acá se ve.",
  },
];

/** Tres capacidades, una por vez, en fichas sobre papel. */
export const S7Capacidades: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Fondo>
      <Escena>
        <div style={{ marginBottom: 42 }}>
          <Etiqueta delay={2} color={C.oroSuave}>
            Lo que hace por vos
          </Etiqueta>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 888 }}>
          {CAPACIDADES.map((cap, i) => {
            const inicio = 10 + i * 92;

            return (
              <div
                key={cap.titulo}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `2px solid ${C.borde}`,
                  borderLeft: `10px solid ${C.oro}`,
                  padding: "30px 36px 32px",
                  opacity: interpolate(frame, [inicio, inicio + 20], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(...EASE),
                  }),
                  translate: interpolate(
                    frame,
                    [inicio, inicio + 24],
                    ["0px 26px", "0px 0px"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.bezier(...EASE),
                    },
                  ),
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 58,
                    lineHeight: 1,
                    color: C.navy,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {cap.cifra}
                </div>
                <div
                  style={{
                    fontFamily: FONT_TITULAR,
                    fontSize: 40,
                    lineHeight: 1.14,
                    letterSpacing: "-0.02em",
                    color: C.navy,
                    textTransform: "uppercase",
                    marginTop: 18,
                  }}
                >
                  {cap.titulo}
                </div>
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 500,
                    fontSize: 31,
                    lineHeight: 1.4,
                    color: C.grafito,
                    marginTop: 12,
                  }}
                >
                  {cap.detalle}
                </div>
              </div>
            );
          })}
        </div>
      </Escena>
    </Fondo>
  );
};
