import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Escena, Etiqueta, Fondo, Parrafo, Titular } from "../components/base";
import { C, EASE, FONT_MONO } from "../theme";

/** Los cuatro vendedores: el lead aterriza en el que menos carga tiene. */
const VENDEDORES = [
  { nombre: "Diego M.", carga: 5 },
  { nombre: "Sofía R.", carga: 8 },
  { nombre: "Martín P.", carga: 2 },
  { nombre: "Lucía A.", carga: 7 },
];

const GANADOR = 2;

export const S6Regla: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Fondo>
      <Escena>
        <div style={{ marginBottom: 28 }}>
          <Etiqueta delay={2} color={C.oroSuave}>
            La regla que ordena todo
          </Etiqueta>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Titular size={78} delay={6}>
            Un lead no puede
          </Titular>
        </div>
        <Titular size={78} resalte inclinacion={-1.2} delay={18}>
          quedar sin dueño
        </Titular>

        {/* Reparto entre vendedores */}
        <div style={{ display: "flex", gap: 16, marginTop: 64, width: 888 }}>
          {VENDEDORES.map((v, i) => {
            const esGanador = i === GANADOR;
            const asignado = frame > 128 && esGanador;

            return (
              <div
                key={v.nombre}
                style={{
                  flex: 1,
                  backgroundColor: asignado ? C.oro : "#FFFFFF",
                  border: `2px solid ${asignado ? C.oro : C.borde}`,
                  padding: "22px 18px 24px",
                  opacity: interpolate(
                    frame,
                    [56 + i * 8, 74 + i * 8],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.bezier(...EASE),
                    },
                  ),
                  translate: asignado
                    ? interpolate(frame, [128, 146], ["0px 0px", "0px -14px"], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.bezier(...EASE),
                      })
                    : "0px 0px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 20,
                    color: asignado ? C.navy : C.tenue,
                    letterSpacing: "0.04em",
                    marginBottom: 12,
                  }}
                >
                  {v.nombre}
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 44,
                    color: C.navy,
                  }}
                >
                  {v.carga}
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 16,
                    color: asignado ? C.navy : C.tenue,
                    letterSpacing: "0.14em",
                    marginTop: 8,
                  }}
                >
                  EN CARTERA
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 54 }}>
          <Parrafo delay={150} size={40} maxWidth={880}>
            Se ofrece a los más descargados y gana el primero que lo toma. Si
            nadie lo toma, se asigna igual.
          </Parrafo>
        </div>
      </Escena>
    </Fondo>
  );
};
