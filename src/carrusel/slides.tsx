import { AbsoluteFill, Img, staticFile } from "remotion";
import { ARCHIVO, EXPANDIDA } from "./fuente";
import { FONT_MONO } from "../theme-panel";

/**
 * Carrusel "Operás tu concesionario a ciegas". Cuatro placas de 1080x1350.
 *
 * Se arma acá y no con un modelo de imagen por una razón concreta: los
 * modelos de imagen no tienen tipografías. Dibujan lo que sugiere la
 * descripción, así que cada generación devuelve otro ancho de letra, otro
 * margen y a veces otra ortografía. Cuatro placas que tienen que parecer
 * hermanas no se sacan así. Lo único que le pedimos al modelo es el busto,
 * que es donde sí es imbatible.
 *
 * Estructura: portada oscura, dos placas claras de argumento, cierre oscuro.
 * El navy y el oro son el hilo entre las cuatro.
 */

const NAVY = "#0A1733";
const NAVY_HONDO = "#04070D";
const PAPEL = "#F8F9F7";
const BLANCO = "#FFFFFF";
const TENUE = "#6B7480";
const LINEA = "#E7E8E4";
const BORDE = "#DEDFDA";
const ORO_VIVO = "#E8B01F";

/** Margen único del que cuelga todo. Ningún elemento toca el borde. */
const M = 76;
const ANCHO = 1080 - M * 2; // 928

// ── Piezas compartidas ───────────────────────────────────────────────────

/** Grilla técnica tenue, en su versión clara y oscura. */
const Grilla: React.FC<{ oscuro?: boolean }> = ({ oscuro = false }) => (
  <AbsoluteFill
    style={{
      backgroundImage: oscuro
        ? `linear-gradient(rgba(232,236,242,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(232,236,242,0.055) 1px, transparent 1px)`
        : `radial-gradient(${BORDE} 1.1px, transparent 1.1px)`,
      backgroundSize: oscuro ? "108px 108px" : "40px 40px",
      opacity: oscuro ? 1 : 0.5,
    }}
  />
);

const FondoOscuro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(165deg, ${NAVY} 0%, #071024 55%, ${NAVY_HONDO} 100%)`,
    }}
  >
    <Grilla oscuro />
    {/* Foco suave arriba a la izquierda */}
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 62% 40% at 22% 14%, rgba(64,96,160,0.30) 0%, rgba(0,0,0,0) 70%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

const FondoClaro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: PAPEL }}>
    <Grilla />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 70% 46% at 50% 34%, rgba(176,141,87,0.07) 0%, rgba(0,0,0,0) 72%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

/** El handle, arriba a la derecha, igual en las cuatro. */
const Handle: React.FC<{ oscuro?: boolean }> = ({ oscuro = false }) => (
  <div
    style={{
      position: "absolute",
      top: M,
      right: M,
      fontFamily: FONT_MONO,
      fontSize: 22,
      letterSpacing: "0.02em",
      color: oscuro ? "rgba(232,236,242,0.62)" : TENUE,
    }}
  >
    @quantumcoffee.xyz
  </div>
);

/** Pie con el marcador, igual en las cuatro. */
const Guardalo: React.FC<{ oscuro?: boolean }> = ({ oscuro = false }) => (
  <div
    style={{
      position: "absolute",
      left: M,
      bottom: M,
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}
  >
    <svg width="26" height="32" viewBox="0 0 26 32">
      <path
        d="M2 2h22v28l-11-8-11 8V2z"
        fill={oscuro ? PAPEL : NAVY}
      />
    </svg>
    <span
      style={{
        fontFamily: ARCHIVO,
        fontVariationSettings: EXPANDIDA(700, 100),
        fontSize: 30,
        color: oscuro ? PAPEL : NAVY,
      }}
    >
      Guardalo
    </span>
  </div>
);

/** Número de capítulo: dorado, monoespaciado, grande. */
const Capitulo: React.FC<{ n: string }> = ({ n }) => (
  <div
    style={{
      fontFamily: FONT_MONO,
      fontWeight: 700,
      fontSize: 92,
      lineHeight: 1,
      letterSpacing: "-0.02em",
      color: ORO_VIVO,
      fontVariantNumeric: "tabular-nums",
    }}
  >
    {n}
  </div>
);

/**
 * Fila de la lista. Es el mismo componente en la placa 02 y en la 03:
 * cambia sólo el valor de la derecha. Que el lector reconozca la misma
 * lista transformada es lo que hace que el carrusel cuente algo.
 */
const Fila: React.FC<{
  etiqueta: string;
  valor: string;
  resuelto?: boolean;
  ultimo?: boolean;
}> = ({ etiqueta, valor, resuelto = false, ultimo = false }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 28,
      paddingTop: 30,
      paddingBottom: 30,
      borderBottom: ultimo ? "none" : `1px solid ${LINEA}`,
    }}
  >
    <span
      style={{
        fontFamily: ARCHIVO,
        fontVariationSettings: EXPANDIDA(resuelto ? 600 : 400, 100),
        fontSize: 34,
        color: resuelto ? NAVY : TENUE,
      }}
    >
      {etiqueta}
    </span>
    <span
      style={{
        flexShrink: 0,
        fontFamily: resuelto ? ARCHIVO : FONT_MONO,
        fontVariationSettings: resuelto ? EXPANDIDA(700, 100) : undefined,
        fontWeight: 700,
        fontSize: resuelto ? 33 : 34,
        color: resuelto ? NAVY : TENUE,
        backgroundColor: resuelto ? ORO_VIVO : "transparent",
        border: `1px solid ${resuelto ? ORO_VIVO : BORDE}`,
        borderRadius: 999,
        padding: "9px 30px",
      }}
    >
      {valor}
    </span>
  </div>
);

const Tarjeta: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: BLANCO,
      border: `1px solid ${BORDE}`,
      borderRadius: 24,
      padding: "18px 44px 22px",
      boxShadow:
        "0 10px 40px rgba(10,23,51,0.07), 0 2px 6px rgba(10,23,51,0.04)",
    }}
  >
    {children}
  </div>
);

const LAS_CUATRO = [
  "De dónde viene cada consulta",
  "Quién la está atendiendo",
  "Cuánto tardaste en contestar",
  "Cuáles se perdieron y por qué",
];

// ── 01 · Portada ─────────────────────────────────────────────────────────

/**
 * Posición del busto y del visor, en coordenadas del lienzo.
 * Se ajustan mirando el render: el visor tiene que caer sobre los ojos y
 * seguir la inclinación de la cabeza.
 */
const BUSTO = { ancho: 1180, izq: -20, arriba: 300 };
const VISOR = { izq: 236, arriba: 700, ancho: 424, alto: 78, giro: -4.5 };

export const C1Portada: React.FC = () => (
  <FondoOscuro>
    {/* Panel diagonal de luz, detrás de la cabeza */}
    <div
      style={{
        position: "absolute",
        top: -160,
        left: 240,
        width: 900,
        height: 620,
        background:
          "linear-gradient(120deg, rgba(90,130,200,0.16) 0%, rgba(90,130,200,0) 72%)",
        transform: "rotate(-18deg)",
        filter: "blur(14px)",
      }}
    />

    {/* Busto */}
    <div
      style={{
        position: "absolute",
        left: BUSTO.izq,
        top: BUSTO.arriba,
        width: BUSTO.ancho,
      }}
    >
      <Img
        src={staticFile("carrusel/busto-1.png")}
        style={{ width: "100%", display: "block" }}
      />
    </div>

    {/* Degradado que funde el pie del busto con el fondo */}
    <AbsoluteFill
      style={{
        background: `linear-gradient(to bottom, rgba(4,7,13,0) 62%, ${NAVY_HONDO} 96%)`,
      }}
    />

    {/* El visor: primero el halo, después la banda sólida */}
    <div
      style={{
        position: "absolute",
        left: VISOR.izq - 60,
        top: VISOR.arriba - 60,
        width: VISOR.ancho + 120,
        height: VISOR.alto + 120,
        transform: `rotate(${VISOR.giro}deg)`,
        background:
          "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(232,176,31,0.55) 0%, rgba(232,176,31,0) 70%)",
        filter: "blur(26px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: VISOR.izq,
        top: VISOR.arriba,
        width: VISOR.ancho,
        height: VISOR.alto,
        borderRadius: 26,
        transform: `rotate(${VISOR.giro}deg)`,
        background: `linear-gradient(178deg, #FFD24A 0%, ${ORO_VIVO} 46%, #C98F0C 100%)`,
        boxShadow:
          "0 0 44px rgba(232,176,31,0.75), 0 0 120px rgba(232,176,31,0.35)",
      }}
    />

    <Handle oscuro />

    {/* Bloque tipográfico */}
    <div style={{ position: "absolute", left: M, top: 118, width: ANCHO }}>
      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(700, 100),
          fontSize: 42,
          letterSpacing: "0.02em",
          color: PAPEL,
          marginBottom: 14,
        }}
      >
        OPERÁS TU
      </div>

      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(800, 122),
          fontSize: 108,
          lineHeight: 0.98,
          letterSpacing: "-0.028em",
          color: PAPEL,
          whiteSpace: "nowrap",
        }}
      >
        CONCESIONARIO
      </div>

      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(800, 122),
          fontSize: 76,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: ORO_VIVO,
          marginTop: 12,
        }}
      >
        A CIEGAS
      </div>
    </div>

    {/* Bajada monoespaciada */}
    <div
      style={{
        position: "absolute",
        left: M,
        top: 862,
        width: 430,
        fontFamily: FONT_MONO,
        fontSize: 27,
        lineHeight: 1.52,
        color: "rgba(232,236,242,0.86)",
      }}
    >
      no sabés de dónde viene cada consulta, quién la atiende, ni cuál se está
      perdiendo
    </div>

    <Guardalo oscuro />
  </FondoOscuro>
);

// ── 02 · Lo que no ves ───────────────────────────────────────────────────

export const C2NoVes: React.FC = () => (
  <FondoClaro>
    <Handle />
    <div style={{ position: "absolute", left: M, top: 150, width: ANCHO }}>
      <Capitulo n="01" />
      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(800, 118),
          fontSize: 84,
          lineHeight: 1.02,
          letterSpacing: "-0.028em",
          color: NAVY,
          marginTop: 22,
          marginBottom: 26,
        }}
      >
        LO QUE NO VES
      </div>
      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(400, 100),
          fontSize: 34,
          lineHeight: 1.4,
          color: TENUE,
          marginBottom: 54,
        }}
      >
        Cuatro preguntas que hoy no tienen respuesta en tu concesionaria.
      </div>

      <Tarjeta>
        {LAS_CUATRO.map((t, i) => (
          <Fila
            key={t}
            etiqueta={t}
            valor="?"
            ultimo={i === LAS_CUATRO.length - 1}
          />
        ))}
      </Tarjeta>
    </div>
    <Guardalo />
  </FondoClaro>
);

// ── 03 · Con la luz prendida ─────────────────────────────────────────────

const RESPUESTAS = ["Marketplace", "Martín P.", "4 min", "0"];

export const C3ConLuz: React.FC = () => (
  <FondoClaro>
    <Handle />
    <div style={{ position: "absolute", left: M, top: 150, width: ANCHO }}>
      <Capitulo n="02" />
      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(800, 118),
          fontSize: 84,
          lineHeight: 1.02,
          letterSpacing: "-0.028em",
          color: NAVY,
          marginTop: 22,
          marginBottom: 26,
        }}
      >
        CON LA LUZ PRENDIDA
      </div>
      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(400, 100),
          fontSize: 34,
          lineHeight: 1.4,
          color: TENUE,
          marginBottom: 54,
        }}
      >
        Las mismas cuatro, con respuesta y con nombre.
      </div>

      <Tarjeta>
        {LAS_CUATRO.map((t, i) => (
          <Fila
            key={t}
            etiqueta={t}
            valor={RESPUESTAS[i]}
            resuelto
            ultimo={i === LAS_CUATRO.length - 1}
          />
        ))}
      </Tarjeta>
    </div>
    <Guardalo />
  </FondoClaro>
);

// ── 04 · Cierre ──────────────────────────────────────────────────────────

export const C4Cierre: React.FC = () => (
  <FondoOscuro>
    <Handle oscuro />

    {/* Eco del visor: la misma banda, ahora sola */}
    <div
      style={{
        position: "absolute",
        left: M,
        top: 300,
        width: 300,
        height: 74,
        borderRadius: 24,
        background: `linear-gradient(178deg, #FFD24A 0%, ${ORO_VIVO} 46%, #C98F0C 100%)`,
        boxShadow:
          "0 0 44px rgba(232,176,31,0.7), 0 0 130px rgba(232,176,31,0.32)",
      }}
    />

    <div style={{ position: "absolute", left: M, top: 452, width: ANCHO }}>
      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(800, 118),
          fontSize: 92,
          lineHeight: 1.03,
          letterSpacing: "-0.03em",
          color: PAPEL,
        }}
      >
        PRENDÉ LA LUZ
      </div>

      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(400, 100),
          fontSize: 36,
          lineHeight: 1.42,
          color: "rgba(232,236,242,0.78)",
          marginTop: 32,
          maxWidth: 800,
        }}
      >
        En el perfil te muestro cómo un concesionario deja de perder clientes
        por no ver lo que pasa con sus consultas.
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          marginTop: 56,
          backgroundColor: PAPEL,
          borderRadius: 999,
          padding: "28px 54px",
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            backgroundColor: ORO_VIVO,
          }}
        />
        <span
          style={{
            fontFamily: ARCHIVO,
            fontVariationSettings: EXPANDIDA(800, 105),
            fontSize: 42,
            color: NAVY,
          }}
        >
          @quantumcoffee.xyz
        </span>
      </div>
    </div>

    <Guardalo oscuro />
  </FondoOscuro>
);
