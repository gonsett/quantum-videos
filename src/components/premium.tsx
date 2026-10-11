import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ANCHO, EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR, SAFE_X } from "../theme-panel";

/**
 * Sistema visual premium sobre papel blanco.
 *
 * Lo que separa "texto sobre un fondo" de algo que se lee como caro:
 *
 * 1. CAPAS. Nada flota suelto: todo vive dentro de una tarjeta blanca con
 *    borde de un pixel y sombra larga y muy suave. La sombra es lo que da
 *    la sensación de material.
 * 2. RITMO DE 8. Todos los espaciados son múltiplos de 8. Un ojo entrenado
 *    lo nota aunque no sepa por qué.
 * 3. CIFRAS TABULARES. Los números en monoespaciada con `tabular-nums`, para
 *    que no bailen al animarse.
 * 4. ACENTO ESCASO. El dorado aparece en muy pocos lugares por cuadro. Si
 *    está en todos lados deja de significar.
 * 5. ENTRADAS QUE ASIENTAN. Las cosas llegan y se posan, no aparecen.
 */

export const PAPEL = "#F8F9F7";
export const BLANCO = "#FFFFFF";
export const NAVY = "#0A1733";
export const NAVY_SUAVE = "#3A4560";
export const GRAFITO = "#232A35";
export const TENUE = "#6B7480";
export const LINEA = "#E7E8E4";
export const BORDE = "#DEDFDA";
export const ORO = "#B08D57";
export const ORO_VIVO = "#E8B01F";

const ent = (frame: number, delay: number, dur = 12) =>
  interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

const sube = (frame: number, delay: number, px = 20, dur = 16) =>
  interpolate(frame, [delay, delay + dur], [`0px ${px}px`, "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

/** Papel con grilla de puntos apenas perceptible y un halo cálido. */
export const Papel: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: PAPEL }}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${BORDE} 1.1px, transparent 1.1px)`,
        backgroundSize: "40px 40px",
        opacity: 0.5,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 70% 48% at 50% 38%, rgba(176,141,87,0.07) 0%, rgba(0,0,0,0) 72%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

export const Marco: React.FC<{
  children: React.ReactNode;
  justify?: React.CSSProperties["justifyContent"];
}> = ({ children, justify = "center" }) => (
  <AbsoluteFill
    style={{
      paddingLeft: SAFE_X,
      paddingRight: SAFE_X,
      // Deja libre la franja del marco fijo: cabecera arriba, pie abajo.
      paddingTop: 214,
      paddingBottom: 192,
      justifyContent: justify,
      alignItems: "flex-start",
    }}
  >
    <div style={{ width: ANCHO }}>{children}</div>
  </AbsoluteFill>
);

/** Tarjeta: la unidad de composición. Todo vive adentro de una. */
export const Tarjeta: React.FC<{
  children: React.ReactNode;
  delay?: number;
  padding?: string;
  acento?: boolean;
}> = ({ children, delay = 0, padding = "48px 48px 52px", acento = false }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        backgroundColor: BLANCO,
        border: `1px solid ${acento ? ORO_VIVO : BORDE}`,
        borderRadius: 24,
        padding,
        // Sombra larga y muy suave: es lo que da sensación de material
        boxShadow: acento
          ? "0 10px 40px rgba(232,176,31,0.18), 0 2px 8px rgba(10,23,51,0.05)"
          : "0 10px 40px rgba(10,23,51,0.07), 0 2px 6px rgba(10,23,51,0.04)",
        opacity: ent(frame, delay, 13),
        translate: sube(frame, delay, 26, 17),
      }}
    >
      {children}
    </div>
  );
};

/** Rótulo de sección: versalitas monoespaciadas con filete corto al lado. */
export const Rotulo: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: ent(frame, delay, 9) }}>
      <div
        style={{
          width: interpolate(frame, [delay, delay + 16], [0, 50], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(...EASE),
          }),
          height: 4,
          backgroundColor: ORO_VIVO,
        }}
      />
      <span
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 29,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: ORO,
        }}
      >
        {children}
      </span>
    </div>
  );
};

/** Titular. Bold, navy, apretado. */
export const Titulo: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
}> = ({ children, delay = 0, size = 68 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.14,
        letterSpacing: "-0.024em",
        color: NAVY,
        opacity: ent(frame, delay, 11),
        translate: sube(frame, delay, 22, 14),
      }}
    >
      {children}
    </div>
  );
};

export const Texto: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
}> = ({ children, delay = 0, size = 38, color = TENUE }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.4,
        color,
        opacity: ent(frame, delay, 10),
        translate: sube(frame, delay, 14, 12),
      }}
    >
      {children}
    </div>
  );
};

export const Fuerte: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontWeight: 700, color: NAVY }}>{children}</span>
);

/**
 * Fila de vendedor con barra de carga.
 *
 * Es el elemento que hacía falta: mostrar la carga como BARRA en vez de
 * como número suelto. El ojo compara longitudes al instante; con cifras
 * hay que leerlas y restarlas.
 */
export const Vendedor: React.FC<{
  nombre: string;
  carga: number;
  max: number;
  delay: number;
  elegido?: boolean;
  elegidoEn?: number;
}> = ({ nombre, carga, max, delay, elegido = false, elegidoEn }) => {
  const frame = useCurrentFrame();
  const marcado = elegido && elegidoEn !== undefined && frame >= elegidoEn;

  const crece = interpolate(frame, [delay + 6, delay + 26], [0, carga / max], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        paddingTop: 22,
        paddingBottom: 22,
        opacity: ent(frame, delay, 10),
        translate: sube(frame, delay, 14, 13),
      }}
    >
      {/* Inicial en círculo */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          flexShrink: 0,
          backgroundColor: marcado ? ORO_VIVO : PAPEL,
          border: `1px solid ${marcado ? ORO_VIVO : BORDE}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 26,
          color: NAVY,
        }}
      >
        {iniciales}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: marcado ? 700 : 500,
              fontSize: 34,
              color: NAVY,
            }}
          >
            {nombre}
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 29,
              color: marcado ? ORO : TENUE,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {carga} en cartera
          </span>
        </div>

        {/* La barra: comparación instantánea */}
        <div style={{ height: 14, borderRadius: 7, backgroundColor: LINEA, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${crece * 100}%`,
              borderRadius: 7,
              backgroundColor: marcado ? ORO_VIVO : NAVY,
            }}
          />
        </div>
      </div>
    </div>
  );
};

/** Cifra grande de remate, con etiqueta encima. */
export const Cifra: React.FC<{
  etiqueta: string;
  valor: string;
  delay?: number;
  size?: number;
  color?: string;
}> = ({ etiqueta, valor, delay = 0, size = 156, color = NAVY }) => {
  const frame = useCurrentFrame();
  return (
    <div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: TENUE,
          marginBottom: 18,
          opacity: ent(frame, delay, 9),
        }}
      >
        {etiqueta}
      </div>
      <div
        style={{
          fontFamily: FONT_TITULAR,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          color,
          fontVariantNumeric: "tabular-nums",
          opacity: ent(frame, delay + 6, 11),
          translate: sube(frame, delay + 6, 22, 15),
        }}
      >
        {valor}
      </div>
    </div>
  );
};

/**
 * Anillo de porcentaje.
 *
 * Un numero suelto dice "82%". El anillo ademas muestra cuanto es 82 de 100
 * sin que haya que pensarlo, y el arco creciendo da el movimiento que a una
 * cifra estatica le falta.
 */
export const Anillo: React.FC<{
  porcentaje: number;
  etiqueta: string;
  delay?: number;
  diametro?: number;
}> = ({ porcentaje, etiqueta, delay = 0, diametro = 260 }) => {
  const frame = useCurrentFrame();
  const r = diametro / 2 - 16;
  const vuelta = 2 * Math.PI * r;

  const avance = interpolate(frame, [delay + 4, delay + 34], [0, porcentaje / 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 40,
        opacity: ent(frame, delay, 12),
        translate: sube(frame, delay, 18, 15),
      }}
    >
      <svg width={diametro} height={diametro} style={{ flexShrink: 0 }}>
        <circle
          cx={diametro / 2}
          cy={diametro / 2}
          r={r}
          fill="none"
          stroke={LINEA}
          strokeWidth={22}
        />
        <circle
          cx={diametro / 2}
          cy={diametro / 2}
          r={r}
          fill="none"
          stroke={ORO_VIVO}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={`${vuelta * avance} ${vuelta}`}
          transform={`rotate(-90 ${diametro / 2} ${diametro / 2})`}
        />
        <text
          x={diametro / 2}
          y={diametro / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONT_TITULAR}
          fontSize={64}
          fill={NAVY}
        >
          {Math.round(avance * 100)}%
        </text>
      </svg>

      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 400,
          fontSize: 34,
          lineHeight: 1.34,
          color: TENUE,
        }}
      >
        {etiqueta}
      </div>
    </div>
  );
};

/**
 * Linea de tiempo vertical de una jornada.
 *
 * Cada hito entra en orden con su punto sobre un filete continuo. Es el
 * recurso que hace que una demora se VEA: el hueco entre dos puntos ocupa
 * lugar en la pantalla igual que ocupo lugar en el dia.
 */
export const Linea: React.FC<{
  hitos: { hora: string; texto: string; acento?: boolean }[];
  delay?: number;
}> = ({ hitos, delay = 0 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: "relative" }}>
      {/* Filete que baja detras de los puntos */}
      <div
        style={{
          position: "absolute",
          left: 13,
          top: 16,
          width: 3,
          backgroundColor: LINEA,
          height: interpolate(
            frame,
            [delay, delay + hitos.length * 16],
            // Del centro del primer punto al centro del ultimo, nada mas
            [0, (hitos.length - 1) * 118],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            },
          ),
        }}
      />

      {hitos.map((h, i) => {
        const d = delay + i * 16;
        return (
          <div
            key={h.hora}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 28,
              height: 118,
              opacity: ent(frame, d, 10),
              translate: sube(frame, d, 14, 13),
            }}
          >
            <div
              style={{
                width: 29,
                height: 29,
                marginTop: 8,
                flexShrink: 0,
                borderRadius: 15,
                backgroundColor: h.acento ? ORO_VIVO : BLANCO,
                border: `3px solid ${h.acento ? ORO_VIVO : BORDE}`,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 27,
                  letterSpacing: "0.08em",
                  color: h.acento ? ORO : TENUE,
                  marginBottom: 8,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {h.hora}
              </div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: h.acento ? 700 : 400,
                  fontSize: 34,
                  lineHeight: 1.2,
                  color: h.acento ? NAVY : TENUE,
                }}
              >
                {h.texto}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Nota al pie de la escena: filete dorado a la izquierda y texto atenuado.
 *
 * Cumple dos funciones. Da un tercer nivel de lectura a las pantallas que
 * si no quedan con demasiado aire, y deja el remate argumental fuera del
 * titular, que asi puede quedarse corto y contundente.
 */
export const Nota: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        borderLeft: `4px solid ${ORO_VIVO}`,
        paddingLeft: 30,
        opacity: ent(frame, delay, 12),
        translate: sube(frame, delay, 16, 15),
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 400,
          fontSize: 33,
          lineHeight: 1.4,
          color: TENUE,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Píldora de estado, para chips tipo "Asignado" o "Sin asignar". */
export const Pildora: React.FC<{
  children: React.ReactNode;
  delay?: number;
  acento?: boolean;
}> = ({ children, delay = 0, acento = false }) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        backgroundColor: acento ? ORO_VIVO : PAPEL,
        border: `1px solid ${acento ? ORO_VIVO : BORDE}`,
        borderRadius: 999,
        padding: "14px 28px",
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 27,
        color: NAVY,
        opacity: ent(frame, delay, 9),
        translate: sube(frame, delay, 12, 12),
      }}
    >
      {children}
    </span>
  );
};
