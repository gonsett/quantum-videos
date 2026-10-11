import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ANCHO, EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR, P } from "../theme-panel";

/**
 * Gramática de composición tomada del video de Padrón AGIP.
 *
 * Ese video no muestra capturas recortadas: construye pantallas de datos
 * con una jerarquía fija de cinco niveles. Medida sobre sus fotogramas y
 * escalada a 1080 de ancho:
 *
 *   Etiqueta   ~25 px  versalitas, tracking amplio, color de acento
 *   Titular    ~50 px  bold, texto principal
 *   Cuerpo     ~30 px  regular, secundario, con negrita inline en el dato
 *   Libro      ~30/42  fila: etiqueta izquierda, valor derecha, filete
 *   Remate     ~130 px numero enorme en el color de acento
 *
 * Todo cuelga de un mismo margen izquierdo y el bloque va centrado
 * vertical con mucho aire arriba y abajo. Cada pantalla dice UNA cosa.
 */

const ent = (frame: number, delay: number, dur = 12) =>
  interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

const sube = (frame: number, delay: number, px = 20, dur = 15) =>
  interpolate(frame, [delay, delay + dur], [`0px ${px}px`, "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

/** Nivel 1 — la etiqueta de sección. */
export const Rotulo: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
}> = ({ children, delay = 0, color = P.oro }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 25,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color,
        opacity: ent(frame, delay, 8),
      }}
    >
      {children}
    </div>
  );
};

/** Nivel 2 — el titular. Bold, sin caja, no en versalitas. */
export const Enunciado: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  oscuro?: boolean;
}> = ({ children, delay = 0, size = 52, oscuro = true }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.16,
        letterSpacing: "-0.022em",
        color: oscuro ? P.textoOscuro : P.textoClaro,
        maxWidth: ANCHO,
        opacity: ent(frame, delay, 11),
        translate: sube(frame, delay, 22, 14),
      }}
    >
      {children}
    </div>
  );
};

/** Nivel 3 — el cuerpo. Gris, con `fuerte` para la negrita inline. */
export const Cuerpo: React.FC<{
  children: React.ReactNode;
  delay?: number;
  oscuro?: boolean;
}> = ({ children, delay = 0, oscuro = true }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 400,
        fontSize: 30,
        lineHeight: 1.42,
        color: oscuro ? P.tenueOscuro : P.tenueClaro,
        maxWidth: ANCHO,
        opacity: ent(frame, delay, 10),
        translate: sube(frame, delay, 16, 13),
      }}
    >
      {children}
    </div>
  );
};

/** Resalte inline dentro del cuerpo, como el "0,10%" de la referencia. */
export const Fuerte: React.FC<{ children: React.ReactNode; oscuro?: boolean }> = ({
  children,
  oscuro = true,
}) => (
  <span style={{ fontWeight: 700, color: oscuro ? P.textoOscuro : P.textoClaro }}>
    {children}
  </span>
);

/**
 * Nivel 4 — el libro mayor. Es el recurso central de la referencia:
 * dos o tres filas con el valor alineado a la derecha, que arman un
 * argumento aritmético en pantalla.
 */
export const Libro: React.FC<{
  filas: { etiqueta: string; valor: string; acento?: boolean }[];
  delay?: number;
  oscuro?: boolean;
}> = ({ filas, delay = 0, oscuro = true }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ width: ANCHO }}>
      {filas.map((f, i) => {
        const d = delay + i * 14;
        return (
          <div
            key={f.etiqueta}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 24,
              paddingTop: 20,
              paddingBottom: 20,
              borderBottom: `1px solid ${oscuro ? P.bordeOscuro : P.bordeClaro}`,
              opacity: ent(frame, d, 10),
              translate: sube(frame, d, 14, 13),
            }}
          >
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 400,
                fontSize: 30,
                color: oscuro ? P.mist : P.grafito,
              }}
            >
              {f.etiqueta}
            </span>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 42,
                letterSpacing: "-0.02em",
                color: f.acento
                  ? P.oroVivo
                  : oscuro
                    ? P.textoOscuro
                    : P.textoClaro,
                whiteSpace: "nowrap",
              }}
            >
              {f.valor}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Nivel 5 — el remate. Etiqueta chica y número enorme en el acento.
 * En la referencia el número ocupa más de la mitad del ancho del cuadro:
 * es el clímax de la pantalla, no un dato más.
 */
export const Remate: React.FC<{
  etiqueta: string;
  valor: string;
  delay?: number;
  size?: number;
  oscuro?: boolean;
}> = ({ etiqueta, valor, delay = 0, size = 138, oscuro = true }) => {
  const frame = useCurrentFrame();

  return (
    <div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 32,
          color: oscuro ? P.textoOscuro : P.textoClaro,
          marginBottom: 8,
          opacity: ent(frame, delay, 10),
          translate: sube(frame, delay, 14, 13),
        }}
      >
        {etiqueta}
      </div>
      <div
        style={{
          fontFamily: FONT_TITULAR,
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: "-0.045em",
          color: P.oroVivo,
          opacity: ent(frame, delay + 8, 10),
          translate: sube(frame, delay + 8, 20, 14),
        }}
      >
        {valor}
      </div>
    </div>
  );
};
