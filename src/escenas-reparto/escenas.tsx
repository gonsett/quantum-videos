import { Easing, interpolate, useCurrentFrame } from "remotion";
import { VentanaProducto, type Foco } from "../components/producto";
import {
  BORDE,
  Cifra,
  Fuerte,
  LINEA,
  Marco,
  NAVY,
  Nota,
  ORO,
  ORO_VIVO,
  PAPEL,
  Papel,
  Pildora,
  Rotulo,
  TENUE,
  Tarjeta,
  Texto,
  Titulo,
  Vendedor,
} from "../components/premium";
import { EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR } from "../theme-panel";

/**
 * Reparto de leads sobre papel blanco, con el navy de Quantum Coffee
 * como color de la información y el dorado sólo en el acento.
 *
 * Lo que cambia frente a la versión anterior, que se leía pobre:
 *
 * · Nada flota. Cada dato vive dentro de una tarjeta blanca con sombra;
 *   esa capa es lo que separa "texto sobre un fondo" de una pieza armada.
 * · La carga de los vendedores se muestra como BARRA. Comparar longitudes
 *   es instantáneo; comparar cifras sueltas obliga a leer y restar.
 * · Cada pantalla tiene tres niveles (rótulo, titular, evidencia) en vez
 *   de dos. Es lo que le faltaba de densidad.
 */

/** Único recorte de captura que sobrevive: la tarjeta sin asignar. */
const FOCO_SIN_ASIGNAR: Foco = {
  x: 1105, y: 488, w: 380, h: 158, srcW: 1896, srcH: 905,
};

const ent = (frame: number, delay: number, dur = 12) =>
  interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

const sube = (frame: number, delay: number, px = 16, dur = 14) =>
  interpolate(frame, [delay, delay + dur], [`0px ${px}px`, "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

/** Encabezado interno de tarjeta: título chico + filete a lo ancho. */
const CabezalTarjeta: React.FC<{
  titulo: string;
  extra?: string;
  delay: number;
}> = ({ titulo, extra, delay }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 26,
        marginBottom: 10,
        borderBottom: `1px solid ${LINEA}`,
        opacity: ent(frame, delay, 9),
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 25,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: TENUE,
        }}
      >
        {titulo}
      </span>
      {extra ? (
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 25,
            color: ORO,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {extra}
        </span>
      ) : null}
    </div>
  );
};

/** Fila de veredicto: etiqueta a la izquierda, Sí/No en píldora a la derecha. */
const Veredicto: React.FC<{
  etiqueta: string;
  valor: string;
  positivo?: boolean;
  delay: number;
  ultimo?: boolean;
}> = ({ etiqueta, valor, positivo = false, delay, ultimo = false }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 28,
        paddingTop: 30,
        paddingBottom: 30,
        borderBottom: ultimo ? "none" : `1px solid ${LINEA}`,
        opacity: ent(frame, delay, 10),
        translate: sube(frame, delay, 14, 14),
      }}
    >
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: positivo ? 700 : 400,
          fontSize: 36,
          color: positivo ? NAVY : TENUE,
        }}
      >
        {etiqueta}
      </span>
      <span
        style={{
          flexShrink: 0,
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 35,
          letterSpacing: "-0.01em",
          color: positivo ? NAVY : TENUE,
          backgroundColor: positivo ? ORO_VIVO : PAPEL,
          border: `1px solid ${positivo ? ORO_VIVO : BORDE}`,
          borderRadius: 999,
          padding: "8px 32px",
        }}
      >
        {valor}
      </span>
    </div>
  );
};

/** Columna de cifra para la comparacion antes/despues. */
const Columna: React.FC<{
  etiqueta: string;
  valor: string;
  delay: number;
  tenue?: boolean;
}> = ({ etiqueta, valor, delay, tenue = false }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ opacity: ent(frame, delay, 11), translate: sube(frame, delay, 18, 15) }}>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: TENUE,
          marginBottom: 14,
        }}
      >
        {etiqueta}
      </div>
      <div
        style={{
          fontFamily: FONT_TITULAR,
          fontSize: 176,
          lineHeight: 0.94,
          letterSpacing: "-0.05em",
          color: tenue ? "#C2C6CC" : NAVY,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {valor}
      </div>
    </div>
  );
};

/** Flecha del antes/despues: se dibuja sola de izquierda a derecha. */
const Flecha: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const largo = interpolate(frame, [delay, delay + 18], [0, 96], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 30 }}>
      <div style={{ width: largo, height: 4, backgroundColor: ORO_VIVO }} />
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: "13px solid transparent",
          borderBottom: "13px solid transparent",
          borderLeft: `18px solid ${ORO_VIVO}`,
          opacity: ent(frame, delay + 14, 8),
        }}
      />
    </div>
  );
};

// ── 01 · Cómo se reparte hoy ─────────────────────────────────────────────

export const R1Rapido: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Papel>
      <Marco>
        <div style={{ marginBottom: 28 }}>
          <Rotulo delay={8}>Cómo se reparte hoy</Rotulo>
        </div>
        <div style={{ marginBottom: 48 }}>
          <Titulo delay={14} size={76}>
            El lead se lo queda el vendedor más rápido con el celular.
          </Titulo>
        </div>

        <Tarjeta delay={44} padding="40px 44px 44px">
          <CabezalTarjeta titulo="Consulta entrante" extra="09:41" delay={50} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              paddingTop: 28,
              opacity: ent(frame, 56, 11),
              translate: sube(frame, 56, 14, 14),
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 42,
                  color: NAVY,
                  marginBottom: 8,
                }}
              >
                Hilux SRV 2019
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 31, color: TENUE }}>
                Consulta por WhatsApp
              </div>
            </div>
            <Pildora delay={64}>Sin asignar</Pildora>
          </div>
        </Tarjeta>

        <div style={{ marginTop: 44 }}>
          <Nota delay={82}>
            Nadie decidió que fuera él. Vio el mensaje antes.
          </Nota>
        </div>
      </Marco>
    </Papel>
  );
};

// ── 02 · El criterio real ────────────────────────────────────────────────

export const R2Libre: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>El criterio real</Rotulo>
      </div>
      <div style={{ marginBottom: 40 }}>
        <Texto delay={6}>
          No lo decide la carga de trabajo. Lo decide{" "}
          <Fuerte>quién mira el teléfono primero</Fuerte>.
        </Texto>
      </div>

      <Tarjeta delay={26} padding="44px 46px 28px">
        <CabezalTarjeta titulo="Quién se lo llevó" delay={32} />
        <Veredicto etiqueta="El que estaba más libre" valor="No" delay={44} />
        <Veredicto etiqueta="El que mejor lo iba a atender" valor="No" delay={60} />
        <Veredicto
          etiqueta="El más rápido con el celular"
          valor="Sí"
          positivo
          delay={76}
          ultimo
        />
      </Tarjeta>

      <div style={{ marginTop: 44 }}>
        <Nota delay={100}>
          No es injusto por mala intención. Es injusto porque no hay criterio.
        </Nota>
      </div>
    </Marco>
  </Papel>
);

// ── 03 · La cifra: lo que queda en el camino ─────────────────────────────

export const R3SinAsignar: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>Lo que queda en el camino</Rotulo>
      </div>
      <div style={{ marginBottom: 42 }}>
        <Texto delay={6}>
          Los que nadie agarra no desaparecen. Quedan en el tablero,{" "}
          <Fuerte>sin dueño</Fuerte>.
        </Texto>
      </div>

      <Tarjeta delay={24} padding="44px 46px 48px">
        <div style={{ marginBottom: 32 }}>
          <Cifra
            etiqueta="Leads sin vendedor asignado"
            valor="28"
            delay={34}
            size={224}
          />
        </div>
        <VentanaProducto
          imagen="ui/velocidad.png"
          foco={FOCO_SIN_ASIGNAR}
          delay={68}
          deriva={0.02}
          ancho={796}
        />
      </Tarjeta>
    </Marco>
  </Papel>
);

// ── 04 · El mecanismo ────────────────────────────────────────────────────

const PASOS = [
  { n: "01", t: "Mira quién tiene menos carga" },
  { n: "02", t: "Se la ofrece sólo a esos" },
  { n: "03", t: "Gana el primero que la toma" },
];

export const R4Entra: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Papel>
      <Marco>
        <div style={{ marginBottom: 26 }}>
          <Rotulo delay={2}>Cuando entra una consulta</Rotulo>
        </div>
        <div style={{ marginBottom: 44 }}>
          <Titulo delay={6} size={72}>
            El reparto se abre solo.
          </Titulo>
        </div>

        <Tarjeta delay={22} padding="44px 46px 44px">
          <CabezalTarjeta titulo="Qué hace el sistema" extra="3 pasos" delay={28} />
          {PASOS.map((p, i) => {
            const d = 40 + i * 16;
            return (
              <div
                key={p.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  paddingTop: 32,
                  paddingBottom: 32,
                  borderBottom:
                    i === PASOS.length - 1 ? "none" : `1px solid ${LINEA}`,
                  opacity: ent(frame, d, 10),
                  translate: sube(frame, d, 16, 14),
                }}
              >
                <span
                  style={{
                    width: 68,
                    height: 68,
                    flexShrink: 0,
                    borderRadius: 18,
                    backgroundColor: NAVY,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                >
                  {p.n}
                </span>
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 44,
                    color: NAVY,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {p.t}
                </span>
              </div>
            );
          })}
        </Tarjeta>
      </Marco>
    </Papel>
  );
};

// ── 05 · A quién se le ofrece ────────────────────────────────────────────

export const R5Ofrece: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>A quién se le ofrece</Rotulo>
      </div>
      <div style={{ marginBottom: 40 }}>
        <Texto delay={6}>
          No a todos. Sólo a los que <Fuerte>pueden atenderla bien</Fuerte>.
        </Texto>
      </div>

      <Tarjeta delay={20} padding="44px 46px 38px">
        <CabezalTarjeta titulo="Carga por vendedor" extra="ahora" delay={26} />
        <Vendedor nombre="Martín P." carga={2} max={8} delay={38} elegido elegidoEn={86} />
        <Vendedor nombre="Diego M." carga={5} max={8} delay={48} />
        <Vendedor nombre="Lucía A." carga={7} max={8} delay={58} />
        <Vendedor nombre="Sofía R." carga={8} max={8} delay={68} />
      </Tarjeta>

      <div style={{ marginTop: 30 }}>
        <Pildora delay={92} acento>
          Se le ofrece a Martín
        </Pildora>
      </div>
    </Marco>
  </Papel>
);

// ── 06 · El desempate ────────────────────────────────────────────────────

export const R6Empate: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>Ante empate</Rotulo>
      </div>
      <div style={{ marginBottom: 42 }}>
        <Titulo delay={6} size={64}>
          Gana el que hace más tiempo que no recibe uno.
        </Titulo>
      </div>

      <Tarjeta delay={26} padding="44px 46px 34px">
        <CabezalTarjeta titulo="Empatados en carga" extra="2 y 2" delay={32} />
        <Vendedor nombre="Martín P." carga={2} max={8} delay={44} />
        <Vendedor nombre="Nicolás B." carga={2} max={8} delay={54} elegido elegidoEn={110} />

        <div
          style={{
            marginTop: 26,
            paddingTop: 26,
            borderTop: `1px solid ${LINEA}`,
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <Rotulo delay={80}>Desempate</Rotulo>
          </div>
          <Veredicto etiqueta="Martín · recibió hace 40 min" valor="No" delay={94} />
          <Veredicto
            etiqueta="Nicolás · recibió hace 3 h"
            valor="Sí"
            positivo
            delay={110}
            ultimo
          />
        </div>
      </Tarjeta>

      <div style={{ marginTop: 30 }}>
        <Texto delay={140} size={34}>
          El criterio es el mismo siempre y <Fuerte>se puede explicar</Fuerte>.
        </Texto>
      </div>
    </Marco>
  </Papel>
);

// ── 07 · Ninguno queda sin dueño ─────────────────────────────────────────

export const R7Nadie: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>Y si nadie la toma</Rotulo>
      </div>
      <div style={{ marginBottom: 42 }}>
        <Texto delay={6}>
          Dentro de la ventana de tiempo, el sistema se la asigna igual al que{" "}
          <Fuerte>menos carga tiene</Fuerte>.
        </Texto>
      </div>

      <Tarjeta delay={26} padding="48px 48px 46px" acento>
        <CabezalTarjeta titulo="Leads sin dueño" extra="garantizado" delay={34} />
        {/* Antes y despues en la misma linea: la flecha hace el argumento
            sin que haga falta explicarlo. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            paddingTop: 30,
          }}
        >
          <Columna etiqueta="Hoy" valor="28" delay={44} tenue />
          <Flecha delay={62} />
          <Columna etiqueta="Con AutomLead" valor="0" delay={74} />
        </div>
      </Tarjeta>

      <div style={{ marginTop: 44 }}>
        <Nota delay={82}>
          Sin planillas y sin pedirle a nadie que se acuerde.
        </Nota>
      </div>
    </Marco>
  </Papel>
);

// ── 08 · Cierre ──────────────────────────────────────────────────────────

export const R8Cierre: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Papel>
      <Marco>
        <div style={{ marginBottom: 26 }}>
          <Rotulo delay={2}>La diferencia</Rotulo>
        </div>
        <div style={{ marginBottom: 52 }}>
          <Titulo delay={6} size={70}>
            No es un reparto por confianza. Es una regla que podés auditar.
          </Titulo>
        </div>

        <div
          style={{
            height: 3,
            backgroundColor: ORO_VIVO,
            width: interpolate(frame, [40, 62], [0, 888], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        />

        <div
          style={{
            marginTop: 46,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 74,
            letterSpacing: "-0.035em",
            color: NAVY,
            opacity: ent(frame, 56, 14),
          }}
        >
          AutomLead
        </div>

        <div
          style={{
            marginTop: 34,
            display: "inline-flex",
            backgroundColor: NAVY,
            borderRadius: 999,
            padding: "30px 58px",
            boxShadow: "0 12px 34px rgba(10,23,51,0.22)",
            opacity: ent(frame, 74, 16),
            translate: sube(frame, 74, 18, 22),
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 44,
              color: "#FFFFFF",
            }}
          >
            Agendá tu diagnóstico
          </span>
        </div>


      </Marco>
    </Papel>
  );
};
