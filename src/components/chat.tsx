import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR, O, SAFE_X } from "../theme-oscuro";

/**
 * Fondo oscuro Quantum Coffee: navy con una trama de puntos muy tenue
 * y dos trazos dorados finos. Sobrio, para que el dorado sea lo único
 * que llama la atención.
 */
export const FondoOscuro: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: O.fondo }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${O.borde} 1.4px, transparent 1.4px)`,
          backgroundSize: "46px 46px",
          opacity: 0.55,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 66% 44% at 50% 38%, rgba(176,141,87,0.10) 0%, rgba(0,0,0,0) 72%)`,
        }}
      />
      <AbsoluteFill>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920">
          <g stroke={O.oro} strokeWidth="2" fill="none" opacity="0.28">
            <path d="M -30 210 L 180 120 L 400 210" />
            <path d="M 1110 1720 L 900 1810 L 700 1730" />
          </g>
          <g fill={O.oro} opacity="0.4">
            <rect x="172" y="112" width="16" height="16" />
            <rect x="892" y="1802" width="16" height="16" />
          </g>
        </svg>
      </AbsoluteFill>
      {children}
    </AbsoluteFill>
  );
};

export const EscenaOsc: React.FC<{
  children: React.ReactNode;
  justify?: React.CSSProperties["justifyContent"];
}> = ({ children, justify = "center" }) => (
  <AbsoluteFill
    style={{
      paddingLeft: SAFE_X,
      paddingRight: SAFE_X,
      justifyContent: justify,
      alignItems: "flex-start",
    }}
  >
    {children}
  </AbsoluteFill>
);

export const EtiquetaOsc: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
  size?: number;
}> = ({ children, color = O.oro, delay = 0, size = 26 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color,
        opacity: interpolate(frame, [delay, delay + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
      }}
    >
      {children}
    </div>
  );
};

export const TitularOsc: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  resalte?: boolean;
  delay?: number;
}> = ({ children, size = 82, color = O.texto, resalte = false, delay = 0 }) => {
  const frame = useCurrentFrame();
  const entrada = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  const texto = (
    <span
      style={{
        fontFamily: FONT_TITULAR,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: "-0.025em",
        color: resalte ? O.navy : color,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );

  if (!resalte) {
    return (
      <div
        style={{
          opacity: entrada,
          translate: interpolate(frame, [delay, delay + 24], ["0px 24px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(...EASE),
          }),
        }}
      >
        {texto}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-block",
        backgroundColor: O.oroVivo,
        padding: "8px 20px 14px",
        rotate: "-1.2deg",
        clipPath: `inset(0 ${100 - entrada * 100}% 0 0)`,
      }}
    >
      {texto}
    </div>
  );
};

export const ParrafoOsc: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  delay?: number;
  maxWidth?: number;
}> = ({ children, size = 40, color = O.mist, delay = 0, maxWidth = 850 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.36,
        color,
        maxWidth,
        opacity: interpolate(frame, [delay, delay + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
        translate: interpolate(frame, [delay, delay + 24], ["0px 16px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
      }}
    >
      {children}
    </div>
  );
};

/**
 * Burbuja de conversación. `lado` decide de quién es: el cliente entra
 * por la izquierda con borde gris, el asistente por la derecha con
 * borde dorado.
 */
export const Burbuja: React.FC<{
  lado: "cliente" | "asistente";
  hora: string;
  children: React.ReactNode;
  delay: number;
  ancho?: number;
}> = ({ lado, hora, children, delay, ancho = 660 }) => {
  const frame = useCurrentFrame();
  const esCliente = lado === "cliente";

  const entrada = interpolate(frame, [delay, delay + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: esCliente ? "flex-start" : "flex-end",
        width: "100%",
        opacity: entrada,
        translate: interpolate(
          frame,
          [delay, delay + 20],
          [esCliente ? "-24px 10px" : "24px 10px", "0px 0px"],
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
          maxWidth: ancho,
          backgroundColor: esCliente ? O.navy : O.navy2,
          border: `2px solid ${esCliente ? O.borde : O.oro}`,
          padding: "22px 26px 18px",
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 500,
            fontSize: 34,
            lineHeight: 1.3,
            color: O.texto,
          }}
        >
          {children}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT_MONO,
            fontSize: 20,
            letterSpacing: "0.12em",
            color: O.tenue,
            textAlign: "right",
          }}
        >
          {hora}
        </div>
      </div>
    </div>
  );
};

/** Chip de horario libre. Se pinta en dorado cuando el cliente lo elige. */
export const Horario: React.FC<{
  children: React.ReactNode;
  delay: number;
  elegidoEn?: number;
}> = ({ children, delay, elegidoEn }) => {
  const frame = useCurrentFrame();
  const elegido = elegidoEn !== undefined && frame >= elegidoEn;

  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 26,
        color: elegido ? O.navy : O.mist,
        backgroundColor: elegido ? O.oroVivo : "transparent",
        border: `2px solid ${elegido ? O.oroVivo : O.bordeVivo}`,
        padding: "12px 20px",
        opacity: interpolate(frame, [delay, delay + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
        translate: elegido
          ? interpolate(frame, [elegidoEn as number, (elegidoEn as number) + 12], ["0px 0px", "0px -8px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            })
          : "0px 0px",
      }}
    >
      {children}
    </div>
  );
};

/** Ficha de la agenda del taller: los campos se cargan de a uno. */
export const FichaAgenda: React.FC<{
  filas: { campo: string; valor: string }[];
  delay: number;
  titulo?: string;
}> = ({ filas, delay, titulo = "En la agenda del taller" }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: 888,
        backgroundColor: O.navy,
        border: `2px solid ${O.oro}`,
        padding: "26px 32px 30px",
        opacity: interpolate(frame, [delay, delay + 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
        translate: interpolate(frame, [delay, delay + 20], ["0px 20px", "0px 0px"], {
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
          fontSize: 22,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: O.oro,
          marginBottom: 22,
        }}
      >
        {titulo}
      </div>

      {filas.map((f, i) => {
        const aparece = delay + 8 + i * 9;
        return (
          <div
            key={f.campo}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 20,
              paddingBottom: 14,
              marginBottom: 14,
              borderBottom: i < filas.length - 1 ? `1px solid ${O.borde}` : "none",
              opacity: interpolate(frame, [aparece, aparece + 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...EASE),
              }),
            }}
          >
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 22,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: O.tenue,
                whiteSpace: "nowrap",
              }}
            >
              {f.campo}
            </span>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 32,
                color: O.texto,
                textAlign: "right",
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
