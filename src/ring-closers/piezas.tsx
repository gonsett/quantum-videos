import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ANCHO_UTIL, DISPLAY, EASE, MARGEN, MONO, RC, SANS } from "./tema";

/**
 * Piezas de Ring Closers.
 *
 * La restricción de marca que manda sobre todo lo demás: elaborado no es
 * recargado. Un solo acento por vez, líneas finas, nada de brillos. Cuando
 * dos cosas esmeralda comparten cuadro, una se apaga — el acento se mueve
 * en el tiempo en vez de repartirse en el espacio.
 */

const ease = Easing.bezier(...EASE);

export const aparece = (frame: number, delay: number, dur = 12) =>
  interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

export const sube = (frame: number, delay: number, px = 18, dur = 15) =>
  interpolate(frame, [delay, delay + dur], [`0px ${px}px`, "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

// ── Fondo ────────────────────────────────────────────────────────────────

/**
 * Noche bajo un reflector. Es la única fuente de luz de la escena y cae
 * desde arriba: no es un brillo decorativo, es la luz de un ring.
 */
export const Noche: React.FC<{
  children?: React.ReactNode;
  foco?: number;
}> = ({ children, foco = 1 }) => (
  <AbsoluteFill style={{ backgroundColor: RC.tinta950 }}>
    <AbsoluteFill
      style={{
        opacity: foco,
        background:
          "radial-gradient(ellipse 58% 44% at 50% 0%, rgba(212,212,216,0.075) 0%, rgba(11,11,13,0) 72%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

/**
 * Las tres cuerdas del ring, en filete de un pixel.
 *
 * Es el rasgo que se repite en todo el video para que se lea como sistema.
 * Son tres porque son tres las peleas de la semana.
 */
export const Cuerdas: React.FC<{ top: number; delay?: number }> = ({ top, delay = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 1,
            marginBottom: 22,
            backgroundColor: RC.tinta700,
            transformOrigin: "left center",
            scale: `${interpolate(frame, [delay + i * 4, delay + i * 4 + 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            })} 1`,
          }}
        />
      ))}
    </div>
  );
};

export const Marco: React.FC<{ children: React.ReactNode; top?: number }> = ({
  children,
  top,
}) => (
  <AbsoluteFill
    style={{
      paddingLeft: MARGEN,
      paddingRight: MARGEN,
      paddingTop: top ?? 230,
      justifyContent: top === undefined ? "center" : "flex-start",
    }}
  >
    <div style={{ width: ANCHO_UTIL }}>{children}</div>
  </AbsoluteFill>
);

// ── Tipografía ───────────────────────────────────────────────────────────

/** Rótulo de sección, igual que en la landing: filete esmeralda corto arriba. */
export const Rotulo: React.FC<{
  children: React.ReactNode;
  delay?: number;
  /** Sin acento en el round del problema: el esmeralda llega con el producto. */
  acento?: boolean;
}> = ({ children, delay = 0, acento = true }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ opacity: aparece(frame, delay, 10) }}>
      <div
        style={{
          height: 2,
          backgroundColor: acento ? RC.esmeralda500 : RC.platino500,
          marginBottom: 18,
          width: interpolate(frame, [delay, delay + 16], [0, 56], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      />
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: RC.platino500,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Titular de cartel. Una línea en crema y, si hace falta, el remate en esmeralda. */
export const Cartel: React.FC<{
  arriba: string;
  abajo?: string;
  delay?: number;
  size?: number;
  acento?: boolean;
  /** Retraso propio de la segunda línea, para caer sobre su palabra. */
  delayAbajo?: number;
  colorAbajo?: string;
}> = ({ arriba, abajo, delay = 0, size = 100, acento = true, delayAbajo, colorAbajo }) => {
  const dAbajo = delayAbajo ?? delay + 9;
  const frame = useCurrentFrame();
  const estilo: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 700,
    fontSize: size,
    lineHeight: 1.02,
    letterSpacing: "-0.005em",
    textTransform: "uppercase",
  };
  return (
    <div>
      <div
        style={{
          ...estilo,
          color: RC.crema,
          opacity: aparece(frame, delay, 11),
          translate: sube(frame, delay, 24, 16),
        }}
      >
        {arriba}
      </div>
      {abajo ? (
        <div
          style={{
            ...estilo,
            color: colorAbajo ?? (acento ? RC.esmeralda500 : RC.crema),
            opacity: aparece(frame, dAbajo, 11),
            translate: sube(frame, dAbajo, 24, 16),
          }}
        >
          {abajo}
        </div>
      ) : null}
    </div>
  );
};

export const Apoyo: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
}> = ({ children, delay = 0, size = 36 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.45,
        color: RC.platino300,
        opacity: aparece(frame, delay, 11),
        translate: sube(frame, delay, 14, 13),
      }}
    >
      {children}
    </div>
  );
};

// ── Fight card ───────────────────────────────────────────────────────────

export type EstadoPelea = "pendiente" | "cumplida" | "evitada";

export type Pelea = {
  tercio: string;
  nombre: string;
  rango: string;
  franja: string;
  estado: EstadoPelea;
  /** Cuándo se marca como cumplida o se tacha, en cuadros de la escena. */
  marcaEn?: number;
  estrellas?: number;
};

const Estrellas: React.FC<{ n: number; opacidad: number }> = ({ n, opacidad }) => (
  <div style={{ display: "flex", gap: 5, opacity: opacidad }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} width="22" height="22" viewBox="0 0 24 24">
        <path
          d="M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
          fill={i < n ? RC.platino300 : "none"}
          stroke={i < n ? RC.platino300 : RC.tinta700}
          strokeWidth="1.6"
        />
      </svg>
    ))}
  </div>
);

/** Puntos que da un tercio según las estrellas: la fórmula del cron real. */
export const puntosPorEstrellas = (n: number) => 10 + (n - 3) * 5;

const FilaPelea: React.FC<{
  pelea: Pelea;
  delay: number;
  ultima: boolean;
  apagada: boolean;
  cursor?: { desde: number; hasta: number };
  franjasDesde?: number;
}> = ({ pelea, delay, ultima, apagada, cursor, franjasDesde }) => {
  const frame = useCurrentFrame();
  const marca = pelea.marcaEn ?? Number.POSITIVE_INFINITY;
  const marcada = frame >= marca;

  // El check se dibuja: longitud del trazo de 0 a 1. Sin marcaEn (pelea
  // "pendiente", sin marcar todavía) el rango sería [Infinity, Infinity] y
  // interpolate revienta — ninguno de los dos se usa fuera de cumplida/evitada.
  const trazo = Number.isFinite(marca)
    ? interpolate(frame, [marca, marca + 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: ease,
      })
    : 0;

  const tachado = Number.isFinite(marca)
    ? interpolate(frame, [marca, marca + 14], [0, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: ease,
      })
    : 0;

  const evitada = pelea.estado === "evitada";
  const cumplida = pelea.estado === "cumplida";

  // Filete esmeralda a la izquierda mientras la voz nombra este tercio
  const cursorOpacidad = cursor
    ? aparece(frame, cursor.desde, 6) * (1 - aparece(frame, cursor.hasta, 6))
    : 0;

  const colorFranja =
    franjasDesde === undefined
      ? RC.platino300
      : frame >= franjasDesde
        ? RC.crema
        : RC.platino500;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "30px 36px",
        borderBottom: ultima ? "none" : `1px solid ${RC.tinta700}`,
        opacity: aparece(frame, delay, 11) * (evitada && marcada ? 0.62 : 1),
        translate: sube(frame, delay, 16, 14),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 22,
          bottom: 22,
          width: 4,
          borderRadius: 2,
          backgroundColor: RC.esmeralda500,
          opacity: cursorOpacidad,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: RC.platino500,
            marginBottom: 8,
          }}
        >
          {pelea.tercio}
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 54,
              lineHeight: 1.05,
              textTransform: "uppercase",
              color: RC.crema,
            }}
          >
            {pelea.nombre}
          </div>
          {evitada ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "54%",
                height: 3,
                width: `${tachado}%`,
                backgroundColor: RC.platino500,
              }}
            />
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 6 }}>
          <span style={{ fontFamily: SANS, fontSize: 28, color: RC.platino500 }}>
            {pelea.rango}
          </span>
          {cumplida && pelea.estrellas ? (
            <Estrellas
              n={pelea.estrellas}
              opacidad={interpolate(frame, [marca + 6, marca + 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            />
          ) : null}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 28,
            color: colorFranja,
            fontVariantNumeric: "tabular-nums",
            marginBottom: 14,
          }}
        >
          {pelea.franja}
        </div>

        {cumplida ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "flex-end" }}>
            {pelea.estrellas ? (
              <span
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 30,
                  color: RC.crema,
                  fontVariantNumeric: "tabular-nums",
                  opacity: interpolate(frame, [marca + 8, marca + 18], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                +{puntosPorEstrellas(pelea.estrellas)}
              </span>
            ) : null}
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle
                cx="27"
                cy="27"
                r="25"
                fill="none"
                stroke={marcada ? (apagada ? RC.tinta700 : RC.esmeralda500) : RC.tinta700}
                strokeWidth="2"
              />
              <path
                d="M16 27.5l7.5 7.5L38.5 20"
                fill="none"
                stroke={apagada ? RC.platino500 : RC.esmeralda500}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - trazo}
              />
            </svg>
          </div>
        ) : evitada ? (
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "0.08em",
              color: RC.platino500,
              opacity: interpolate(frame, [marca + 8, marca + 18], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            SIN CUMPLIR
          </div>
        ) : (
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r="25" fill="none" stroke={RC.tinta700} strokeWidth="2" strokeDasharray="4 6" />
          </svg>
        )}
      </div>
    </div>
  );
};

/**
 * La fight card, en vertical.
 *
 * En la landing las tres peleas van en fila, pero en un 9:16 eso deja cada
 * tarjeta de 280 px con el nombre ilegible en un teléfono. Apiladas quedan
 * como un cartel de box real, que también lista las peleas una debajo de
 * la otra — y el nombre se lee de un vistazo.
 */
export const FightCard: React.FC<{
  peleas: Pelea[];
  semana: string;
  delay?: number;
  /** Apaga los checks cuando el acento tiene que irse a otro lado. */
  apagadaDesde?: number;
  cursores?: ({ desde: number; hasta: number } | undefined)[];
  franjasDesde?: number;
}> = ({ peleas, semana, delay = 0, apagadaDesde, cursores, franjasDesde }) => {
  const frame = useCurrentFrame();
  const apagada = apagadaDesde !== undefined && frame >= apagadaDesde;
  return (
    <div
      style={{
        backgroundColor: RC.tinta900,
        border: `1px solid ${RC.tinta700}`,
        borderRadius: 24,
        overflow: "hidden",
        opacity: aparece(frame, delay, 12),
        translate: sube(frame, delay, 26, 17),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: RC.tinta800,
          padding: "20px 36px",
          borderBottom: `1px solid ${RC.tinta700}`,
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: RC.platino500,
          }}
        >
          Fight card
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: "0.06em",
            color: RC.platino500,
          }}
        >
          {semana}
        </span>
      </div>
      {peleas.map((p, i) => (
        <FilaPelea
          key={p.tercio}
          pelea={p}
          delay={delay + 10 + i * 8}
          ultima={i === peleas.length - 1}
          apagada={apagada}
          cursor={cursores?.[i]}
          franjasDesde={franjasDesde}
        />
      ))}
    </div>
  );
};

// ── Cinturón y marcador ──────────────────────────────────────────────────

/**
 * El panel de rango. Mismo objeto que la tarjeta de la landing (cinturón a
 * la izquierda, puntaje en mono a la derecha), agrandado al formato vertical.
 *
 * El cinturón cambia exactamente cuando el marcador cruza el umbral del
 * rango, no cuando termina de contar: 300 es el piso de Contendiente en
 * `lib/ranks.ts`, y es ahí donde el producto sube al usuario.
 */
export const PanelRango: React.FC<{
  desde: number;
  hasta: number;
  cuentaEn: number;
  duracionCuenta?: number;
  umbral: number;
  rangoAntes: string;
  rangoDespues: string;
  cinturonAntes: string;
  cinturonDespues: string;
  delay?: number;
}> = ({
  desde,
  hasta,
  cuentaEn,
  duracionCuenta = 30,
  umbral,
  rangoAntes,
  rangoDespues,
  cinturonAntes,
  cinturonDespues,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const valor = Math.round(
    interpolate(frame, [cuentaEn, cuentaEn + duracionCuenta], [desde, hasta], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 0, 0.2, 1),
    }),
  );

  // Cuadro exacto en que el marcador cruza el umbral
  const t = (umbral - desde) / (hasta - desde);
  const cruceEn = cuentaEn + duracionCuenta * t;

  const cambio = interpolate(frame, [cruceEn, cruceEn + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 36,
        backgroundColor: RC.tinta900,
        border: `1px solid ${RC.tinta700}`,
        borderRadius: 24,
        padding: "34px 40px",
        opacity: aparece(frame, delay, 12),
        translate: sube(frame, delay, 26, 17),
      }}
    >
      <div style={{ position: "relative", width: 360, height: 230, flexShrink: 0, margin: "-18px -24px -18px -20px" }}>
        <Img
          src={staticFile(cinturonAntes)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            scale: "1.28",
            opacity: 1 - cambio,
          }}
        />
        <Img
          src={staticFile(cinturonDespues)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: cambio,
            scale: String(interpolate(cambio, [0, 1], [1.2, 1.28])),
          }}
        />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 112,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: RC.crema,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {valor}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: "0.1em",
              color: RC.platino500,
            }}
          >
            PTS
          </span>
        </div>

        <div style={{ position: "relative", height: 62, marginTop: 14 }}>
          <div
            style={{
              position: "absolute",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 46,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: RC.platino500,
              opacity: 1 - cambio,
              translate: `0px ${-18 * cambio}px`,
            }}
          >
            {rangoAntes}
          </div>
          <div
            style={{
              position: "absolute",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 46,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: RC.esmeralda500,
              opacity: cambio,
              translate: `0px ${18 * (1 - cambio)}px`,
            }}
          >
            {rangoDespues}
          </div>
        </div>

        <div
          style={{
            height: 2,
            marginTop: 10,
            backgroundColor: RC.esmeralda500,
            width: `${cambio * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

// ── Marco fijo ───────────────────────────────────────────────────────────

/**
 * Marca y round actual, presentes todo el video.
 *
 * El contador es de rounds y no "01 / 05": los cinco beats del guion son
 * cinco rounds. Es la misma función que la barra de progreso de los otros
 * videos, dicha en el idioma del producto.
 */
export const Esquina: React.FC<{ round: number; total: number; visible?: number }> = ({
  round,
  total,
  visible = 1,
}) => (
  <div
    style={{
      position: "absolute",
      top: 118,
      left: MARGEN,
      right: MARGEN,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      opacity: visible,
    }}
  >
    <span
      style={{
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: "0.14em",
        color: RC.crema,
      }}
    >
      RING CLOSERS
    </span>
    <span
      style={{
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: 24,
        letterSpacing: "0.1em",
        color: RC.platino500,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      ROUND {String(round).padStart(2, "0")}/{String(total).padStart(2, "0")}
    </span>
  </div>
);
