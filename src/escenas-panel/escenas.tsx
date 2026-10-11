import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  FondoClaro,
  FondoOscuroP,
  Lienzo,
  Paso,
  VentanaProducto,
} from "../components/producto";
import { FOCOS } from "./focos";
import {
  ANCHO,
  EASE,
  FONT_DISPLAY,
  FONT_MONO,
  FONT_TITULAR,
  P,
} from "../theme-panel";

// ── Piezas compartidas ───────────────────────────────────────────────────

const Etiqueta: React.FC<{
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
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        opacity: interpolate(frame, [delay, delay + 12], [0, 1], {
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

const Cifra: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  delay?: number;
}> = ({ children, size = 190, color = P.textoOscuro, delay = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.06em",
        color,
        fontVariantNumeric: "tabular-nums",
        opacity: interpolate(frame, [delay, delay + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
        scale: interpolate(frame, [delay, delay + 22], [0.94, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
          output: "perceptual-scale",
        }),
      }}
    >
      {children}
    </div>
  );
};

const Pie: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
}> = ({ children, delay = 0, size = 40, color = P.mist }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.34,
        color,
        maxWidth: ANCHO,
        opacity: interpolate(frame, [delay, delay + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
        translate: interpolate(frame, [delay, delay + 22], ["0px 16px", "0px 0px"], {
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

// ── 01 · La espera (oscura) ──────────────────────────────────────────────

export const P1Espera: React.FC = () => (
  <FondoOscuroP>
    <Lienzo>
      <div style={{ marginBottom: 30 }}>
        <Etiqueta delay={20}>Velocidad de respuesta</Etiqueta>
      </div>
      <Cifra delay={30} size={230}>
        3.1 h
      </Cifra>
      <div style={{ marginTop: 40 }}>
        <Pie delay={64} size={44}>
          Eso tarda una persona en llamar a un lead nuevo.
        </Pie>
      </div>
    </Lienzo>
  </FondoOscuroP>
);

// ── 02 · El contraste (oscura) ───────────────────────────────────────────

export const P2Contraste: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FondoOscuroP>
      <Lienzo>
        <div style={{ marginBottom: 34 }}>
          <Etiqueta delay={2}>Lo que mide tu panel</Etiqueta>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div>
            <Cifra delay={8} size={128} color={P.oroVivo}>
              37s
            </Cifra>
            <div style={{ marginTop: 16 }}>
              <Pie delay={24} size={28} color={P.tenueOscuro}>
                tarda el bot
              </Pie>
            </div>
          </div>

          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 62,
              color: P.tenueOscuro,
              opacity: interpolate(frame, [34, 50], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            →
          </div>

          <div>
            <Cifra delay={52} size={128}>
              3.1 h
            </Cifra>
            <div style={{ marginTop: 16 }}>
              <Pie delay={66} size={28} color={P.tenueOscuro}>
                tarda una persona
              </Pie>
            </div>
          </div>
        </div>

        {/* El remate, sobre caja dorada */}
        <div
          style={{
            marginTop: 60,
            display: "inline-block",
            backgroundColor: P.oroVivo,
            padding: "12px 24px 18px",
            rotate: "-1deg",
            clipPath: `inset(0 ${100 - interpolate(frame, [104, 128], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            })}% 0 0)`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_TITULAR,
              fontSize: 50,
              letterSpacing: "-0.025em",
              color: P.navy,
              textTransform: "uppercase",
            }}
          >
            Por cada lead que entra
          </span>
        </div>
      </Lienzo>
    </FondoOscuroP>
  );
};

// ── 03 a 06 · El producto (claras) ───────────────────────────────────────

const PasoProducto: React.FC<{
  numero: string;
  titulo: string;
  imagen: string;
  foco: keyof typeof FOCOS;
  pie: string;
  /** En recortes muy cerrados la deriva se come los bordes: bajarla. */
  deriva?: number;
}> = ({ numero, titulo, imagen, foco, pie, deriva = 0.045 }) => (
  <FondoClaro>
    <Lienzo>
      <div style={{ marginBottom: 38 }}>
        <Paso numero={numero} titulo={titulo} delay={2} />
      </div>
      <VentanaProducto imagen={imagen} foco={FOCOS[foco]} delay={18} deriva={deriva} />
      <div style={{ marginTop: 34 }}>
        <Pie delay={64} size={32} color={P.tenueClaro}>
          {pie}
        </Pie>
      </div>
    </Lienzo>
  </FondoClaro>
);

export const P3Pulso: React.FC = () => (
  <PasoProducto
    numero="01"
    titulo="El pulso, en vivo"
    imagen="ui/velocidad.png"
    foco="pulso"
    pie="37 segundos el bot. 3.1 horas una persona. Por cada lead."
  />
);

export const P4Leads: React.FC = () => (
  <PasoProducto
    numero="02"
    titulo="Cada lead con su dueño"
    imagen="ui/leads.png"
    foco="leads"
    pie="Temperatura, estado y vendedor asignado. 86 de 86."
  />
);

export const P5Score: React.FC = () => (
  <PasoProducto
    numero="03"
    titulo="La charla y el puntaje"
    imagen="ui/conversacion.png"
    foco="score"
    deriva={0.015}
    pie="El puntaje lo calcula la base según los datos cargados, no la IA."
  />
);

export const P6Autos: React.FC = () => (
  <PasoProducto
    numero="04"
    titulo="El auto, por patente"
    imagen="ui/vehiculos.png"
    foco="autos"
    pie="Dueño, kilometraje y último service. La historia no se va con el vendedor."
  />
);

// ── 07 · La alerta (oscura) ──────────────────────────────────────────────

export const P7Alerta: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FondoOscuroP>
      <Lienzo>
        <div style={{ marginBottom: 30 }}>
          <Etiqueta delay={2}>Y lo que no querés ver</Etiqueta>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
          <Cifra delay={10} size={210} color={P.oroVivo}>
            13
          </Cifra>
          <div
            style={{
              fontFamily: FONT_TITULAR,
              fontSize: 46,
              lineHeight: 1.1,
              color: P.textoOscuro,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              maxWidth: 470,
              opacity: interpolate(frame, [28, 50], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...EASE),
              }),
            }}
          >
            leads sin atender
          </div>
        </div>

        <div style={{ marginTop: 44 }}>
          <Pie delay={78} size={40}>
            Asignados, y nadie los contactó todavía.
          </Pie>
        </div>

        {/* La línea que duele */}
        <div
          style={{
            marginTop: 40,
            width: ANCHO,
            borderLeft: `8px solid ${P.oroVivo}`,
            backgroundColor: P.navy,
            padding: "24px 30px",
            opacity: interpolate(frame, [130, 156], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
            translate: interpolate(frame, [130, 160], ["0px 18px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 22,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: P.tenueOscuro,
              marginBottom: 12,
            }}
          >
            El que más espera
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 42,
              color: P.textoOscuro,
            }}
          >
            Hace 7 días
          </div>
        </div>
      </Lienzo>
    </FondoOscuroP>
  );
};

// ── 08 · Cierre (oscura) ─────────────────────────────────────────────────

export const P8Cierre: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <FondoOscuroP>
      <Lienzo>
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontFamily: FONT_TITULAR,
              fontSize: 74,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              color: P.textoOscuro,
              textTransform: "uppercase",
              opacity: interpolate(frame, [4, 26], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...EASE),
              }),
              translate: interpolate(frame, [4, 30], ["0px 22px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...EASE),
              }),
            }}
          >
            Lo que no se mide
          </div>
        </div>

        <div
          style={{
            display: "inline-block",
            backgroundColor: P.oroVivo,
            padding: "10px 24px 16px",
            rotate: "-1.2deg",
            clipPath: `inset(0 ${100 - interpolate(frame, [22, 46], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            })}% 0 0)`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_TITULAR,
              fontSize: 74,
              letterSpacing: "-0.03em",
              color: P.navy,
              textTransform: "uppercase",
            }}
          >
            no se arregla
          </span>
        </div>

        <div style={{ marginTop: 66, marginBottom: 34 }}>
          <div
            style={{
              height: 3,
              backgroundColor: P.oro,
              width: interpolate(frame, [56, 82], [0, ANCHO], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...EASE),
              }),
            }}
          />
        </div>

        <div
          style={{
            fontFamily: FONT_TITULAR,
            fontSize: 62,
            letterSpacing: "-0.03em",
            color: P.textoOscuro,
            textTransform: "uppercase",
            opacity: interpolate(frame, [70, 94], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          AutomLead
        </div>

        <div
          style={{
            marginTop: 34,
            display: "inline-flex",
            backgroundColor: P.oroVivo,
            borderRadius: 999,
            padding: "22px 44px",
            opacity: interpolate(frame, [98, 124], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
            translate: interpolate(frame, [98, 128], ["0px 18px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 38,
              color: P.navy,
              letterSpacing: "-0.01em",
            }}
          >
            Agendá tu diagnóstico
          </span>
        </div>

        <div style={{ marginTop: 30 }}>
          <Pie delay={132} size={28} color={P.tenueOscuro}>
            quantumcoffee.xyz
          </Pie>
        </div>
      </Lienzo>
    </FondoOscuroP>
  );
};
