import { AbsoluteFill } from "remotion";
import { ARCHIVO, EXPANDIDA } from "../carrusel/fuente";
import { FONT_DISPLAY, FONT_MONO, SAFE_X } from "../theme-panel";

/**
 * Portada del reel "No te eligen por el precio".
 *
 * El problema que resuelve no es el mismo que el de una placa suelta: en la
 * cuadricula del perfil Instagram NO muestra el reel entero, muestra un
 * recorte del centro. Todo lo que este arriba o abajo de esa franja existe
 * solo cuando alguien abre el video.
 *
 * Por eso la pieza se compone en dos capas:
 *
 *   · Dentro de la franja central (y 420 a 1500) va el mensaje completo:
 *     titular y la burbuja de WhatsApp. Con eso solo ya se entiende.
 *   · Fuera de la franja van la marca y el dominio, que son firma y no
 *     mensaje: si el recorte se los come, no se pierde nada.
 *
 * El elemento que frena el pulgar no es el titular sino la burbuja: un
 * dueno de agencia reconoce ese mensaje sin leerlo, porque lo tiene en el
 * telefono ahora mismo.
 */

const PAPEL = "#F8F9F7";
const NAVY = "#0A1733";
const TENUE = "#6B7480";
const BORDE = "#DEDFDA";
const ORO = "#B08D57";
const ORO_VIVO = "#E8B01F";

/** Franja que sobrevive al recorte cuadrado de la cuadricula. */
const CENTRO_Y = 616;

export const PortadaDemora: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PAPEL }}>
    {/* Grilla de puntos, la misma del video */}
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
          "radial-gradient(ellipse 72% 44% at 50% 40%, rgba(176,141,87,0.09) 0%, rgba(0,0,0,0) 72%)",
      }}
    />

    {/* ── Firma: fuera del recorte de la cuadricula ── */}
    <div
      style={{
        position: "absolute",
        top: 168,
        left: SAFE_X,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: NAVY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: ORO_VIVO }} />
      </div>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 33,
          letterSpacing: "-0.01em",
          color: NAVY,
        }}
      >
        AutomLead
      </span>
    </div>

    <div
      style={{
        position: "absolute",
        bottom: 168,
        left: SAFE_X,
        right: SAFE_X,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `1px solid ${BORDE}`,
        paddingTop: 26,
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 26,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: TENUE,
        }}
      >
        Tiempo de respuesta
      </span>
      <span
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 26,
          color: ORO,
        }}
      >
        quantumcoffee.xyz
      </span>
    </div>

    {/* ── Mensaje: todo dentro de la franja que sobrevive al recorte ── */}
    <div style={{ position: "absolute", top: CENTRO_Y, left: SAFE_X, width: 888 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 30 }}>
        <div style={{ width: 56, height: 5, backgroundColor: ORO_VIVO }} />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: ORO,
          }}
        >
          Concesionarias
        </span>
      </div>

      <div
        style={{
          fontFamily: ARCHIVO,
          fontVariationSettings: EXPANDIDA(800, 108),
          fontSize: 100,
          lineHeight: 0.99,
          letterSpacing: "-0.035em",
          color: NAVY,
        }}
      >
        NO SE FUE
        <br />
        POR EL PRECIO
      </div>

      {/* La burbuja: el elemento que frena el pulgar */}
      <div
        style={{
          marginTop: 62,
          backgroundColor: "#FFFFFF",
          border: `1px solid ${BORDE}`,
          borderRadius: "8px 28px 28px 28px",
          padding: "34px 38px 26px",
          maxWidth: 760,
          boxShadow: "0 12px 44px rgba(10,23,51,0.08), 0 2px 6px rgba(10,23,51,0.04)",
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 44,
            lineHeight: 1.26,
            color: NAVY,
            marginBottom: 14,
          }}
        >
          Hola, buenas. ¿Cuánto está la Amarok V6?
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            color: TENUE,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          10:12
        </div>
      </div>

      <div
        style={{
          marginTop: 34,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: TENUE }} />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: TENUE,
          }}
        >
          Visto · sin responder
        </span>
      </div>
    </div>
  </AbsoluteFill>
);
