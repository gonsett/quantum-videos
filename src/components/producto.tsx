import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  ANCHO,
  EASE,
  FONT_DISPLAY,
  FONT_MONO,
  FONT_TITULAR,
  P,
  SAFE_X,
} from "../theme-panel";

// ── Fondos ───────────────────────────────────────────────────────────────

/** Escena clara: papel con grilla tenue. Para mostrar producto. */
export const FondoClaro: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: P.papel }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${P.lineaClara} 1px, transparent 1px), linear-gradient(90deg, ${P.lineaClara} 1px, transparent 1px)`,
        backgroundSize: "72px 72px",
        opacity: 0.8,
      }}
    />
    {children}
  </AbsoluteFill>
);

/** Escena oscura: navy con puntos. Para las cifras. */
export const FondoOscuroP: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: P.tinta }}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${P.bordeOscuro} 1.4px, transparent 1.4px)`,
        backgroundSize: "46px 46px",
        opacity: 0.6,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 62% 40% at 50% 40%, rgba(232,176,31,0.09) 0%, rgba(0,0,0,0) 70%)`,
      }}
    />
    {children}
  </AbsoluteFill>
);

export const Lienzo: React.FC<{
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

// ── Encabezado de paso ───────────────────────────────────────────────────

/**
 * "01 · Ves el pulso de tu concesionaria", con la insignia de marca arriba.
 * Es el gesto que estructura el video de referencia: el número promete
 * que hay un final.
 */
export const Paso: React.FC<{
  numero: string;
  titulo: string;
  oscuro?: boolean;
  delay?: number;
}> = ({ numero, titulo, oscuro = false, delay = 0 }) => {
  const frame = useCurrentFrame();

  const entrada = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  return (
    <div
      style={{
        opacity: entrada,
        translate: interpolate(frame, [delay, delay + 22], ["0px 18px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
      }}
    >
      {/* Insignia de marca */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 30,
            height: 30,
            backgroundColor: P.oroVivo,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 19,
            color: P.navy,
          }}
        >
          ✓
        </div>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 27,
            color: oscuro ? P.textoOscuro : P.textoClaro,
          }}
        >
          AutomLead
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 28,
            color: P.oro,
            letterSpacing: "0.06em",
          }}
        >
          {numero}
        </span>
        <span
          style={{
            fontFamily: FONT_TITULAR,
            fontSize: 52,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            color: oscuro ? P.textoOscuro : P.textoClaro,
          }}
        >
          {titulo}
        </span>
      </div>
    </div>
  );
};

// ── Ventana de producto ──────────────────────────────────────────────────

export type Foco = {
  /** Recorte en pixeles sobre la imagen original. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Tamaño nativo de la captura: hace falta para escalar el recorte. */
  srcW: number;
  srcH: number;
};

/**
 * Captura real del producto dentro de un marco de navegador.
 *
 * El recorte importa: las capturas son apaisadas (1900x900) y el video es
 * vertical. Mostrarlas enteras las dejaria de ~500px de alto, ilegibles en
 * un celular. Cada escena recorta la region que le interesa y la escala al
 * ancho util.
 *
 * La deriva lenta evita que la captura se sienta como una foto pegada.
 */
export const VentanaProducto: React.FC<{
  imagen: string;
  foco: Foco;
  url?: string;
  delay?: number;
  deriva?: number;
  ancho?: number;
}> = ({
  imagen,
  foco,
  url = 'app.automlead.com',
  delay = 0,
  deriva = 0.05,
  ancho = ANCHO,
}) => {
  const frame = useCurrentFrame();

  const BARRA = 52;
  const escala = ancho / foco.w;
  const alto = foco.h * escala;

  const entrada = interpolate(frame, [delay, delay + 13], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE),
  });

  return (
    <div
      style={{
        width: ancho,
        backgroundColor: '#FFFFFF',
        border: `2px solid ${P.bordeClaro}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 18px 44px rgba(10,23,51,0.13)',
        opacity: entrada,
        translate: interpolate(frame, [delay, delay + 16], ['0px 34px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(...EASE),
        }),
      }}
    >
      <div
        style={{
          height: BARRA,
          backgroundColor: P.papelHondo,
          borderBottom: `1px solid ${P.bordeClaro}`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 20,
          gap: 9,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: '#DFE0DC' }}
          />
        ))}
        <div
          style={{
            marginLeft: 18,
            fontFamily: FONT_MONO,
            fontSize: 20,
            color: P.tenueClaro,
            letterSpacing: '0.02em',
          }}
        >
          {url}
        </div>
      </div>

      {/* Ventanilla del recorte. La imagen va a tamaño completo escalado y
          desplazada para que el foco quede encuadrado. */}
      <div style={{ width: ancho, height: alto, overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            width: foco.srcW * escala,
            height: foco.srcH * escala,
            left: -foco.x * escala,
            top: -foco.y * escala,
            transformOrigin: `${foco.x + foco.w / 2}px ${foco.y + foco.h / 2}px`,
            scale: 1 + deriva * interpolate(frame, [delay, delay + 150], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <Img
            src={staticFile(imagen)}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
};
