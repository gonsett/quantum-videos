import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { C, EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR, SAFE_X } from "../theme";

/**
 * Fondo del feed: papel claro con grilla tenue y línea fina dorada.
 * Los nodos y diagonales replican el grafismo de las publicaciones.
 */
export const Fondo: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      {/* Grilla de papel */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.linea} 1px, transparent 1px), linear-gradient(90deg, ${C.linea} 1px, transparent 1px)`,
          backgroundSize: "68px 68px",
          opacity: 0.85,
        }}
      />

      {/* Línea fina dorada con nodos: el grafismo del feed */}
      <AbsoluteFill>
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <g stroke={C.oro} strokeWidth="2.5" fill="none" opacity="0.5">
            <path d="M -40 250 L 210 148 L 470 250" />
            <path d="M 1120 1600 L 880 1700 L 640 1618" />
          </g>
          <g fill={C.oro} opacity="0.62">
            <rect x="200" y="138" width="20" height="20" />
            <rect x="870" y="1690" width="20" height="20" />
          </g>
          <g stroke={C.oroSuave} strokeWidth="2" fill="none" opacity="0.34">
            <path d="M 1080 300 L 900 420" />
            <path d="M 0 1540 L 190 1430" />
          </g>
        </svg>
      </AbsoluteFill>

      {children}
    </AbsoluteFill>
  );
};

/** Etiqueta monoespaciada en versalitas. */
export const Etiqueta: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
  size?: number;
}> = ({ children, color = C.tenue, delay = 0, size = 26 }) => {
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

/** Regla fina que se abre de izquierda a derecha. */
export const Regla: React.FC<{
  color?: string;
  delay?: number;
  ancho?: number;
  grosor?: number;
}> = ({ color = C.oro, delay = 0, ancho = 300, grosor = 3 }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        height: grosor,
        backgroundColor: color,
        width: interpolate(frame, [delay, delay + 18], [0, ancho], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
      }}
    />
  );
};

/**
 * Titular pesado del feed: grotesca negra, muy apretada.
 * `resalte` pinta la caja dorada detrás, el gesto característico
 * de las publicaciones.
 */
export const Titular: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  resalte?: boolean;
  inclinacion?: number;
  delay?: number;
}> = ({
  children,
  size = 104,
  color = C.navy,
  resalte = false,
  inclinacion = 0,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const entrada = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  const contenido = (
    <span
      style={{
        fontFamily: FONT_TITULAR,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: "-0.025em",
        color: resalte ? C.navy : color,
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
          translate: interpolate(frame, [delay, delay + 24], ["0px 26px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(...EASE),
          }),
        }}
      >
        {contenido}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-block",
        backgroundColor: C.oro,
        padding: "10px 22px 16px",
        rotate: `${inclinacion}deg`,
        // La caja se abre de izquierda a derecha, como un marcador
        clipPath: `inset(0 ${100 - entrada * 100}% 0 0)`,
      }}
    >
      {contenido}
    </div>
  );
};

/** Contenedor de escena con margen seguro. */
export const Escena: React.FC<{
  children: React.ReactNode;
  justify?: React.CSSProperties["justifyContent"];
  align?: React.CSSProperties["alignItems"];
}> = ({ children, justify = "center", align = "flex-start" }) => {
  return (
    <AbsoluteFill
      style={{
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
        justifyContent: justify,
        alignItems: align,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Texto corrido sobre papel. */
export const Parrafo: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  delay?: number;
  maxWidth?: number;
}> = ({ children, size = 42, color = C.grafito, delay = 0, maxWidth = 840 }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.34,
        color,
        maxWidth,
        opacity: interpolate(frame, [delay, delay + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
        translate: interpolate(frame, [delay, delay + 24], ["0px 18px", "0px 0px"], {
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
