import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  BLANCO,
  BORDE,
  Cifra,
  Fuerte,
  LINEA,
  Linea,
  Marco,
  NAVY,
  Nota,
  ORO,
  ORO_VIVO,
  PAPEL,
  Papel,
  Rotulo,
  TENUE,
  Tarjeta,
  Texto,
  Titulo,
} from "../components/premium";
import { EASE, FONT_DISPLAY, FONT_MONO, FONT_TITULAR } from "../theme-panel";

/**
 * "No te eligen por el precio": el cliente no se va por plata, se va por
 * el tiempo que tardaste en contestarle.
 *
 * Mismo sistema que el video de reparto — papel blanco, navy para la
 * informacion, dorado solo en el acento — con dos recursos nuevos que
 * este guion pedia: la linea de tiempo del dia, que hace que la demora
 * ocupe lugar en pantalla igual que ocupo lugar en el dia, y el anillo
 * de porcentaje.
 */

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

/** Encabezado interno de tarjeta. */
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

/** Fila de veredicto: pregunta a la izquierda, Sí/No en píldora a la derecha. */
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

/**
 * Burbuja de mensaje entrante.
 *
 * A propósito NO imita el verde de WhatsApp: dentro de la paleta se leería
 * como un cuerpo extraño. Alcanza con la forma —esquina cortada del lado
 * de quien habla— para que se entienda que es un chat.
 */
const Burbuja: React.FC<{ texto: string; hora: string; delay: number }> = ({
  texto,
  hora,
  delay,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: 620,
        backgroundColor: PAPEL,
        border: `1px solid ${BORDE}`,
        borderRadius: "6px 22px 22px 22px",
        padding: "24px 28px 18px",
        opacity: ent(frame, delay, 11),
        translate: sube(frame, delay, 16, 15),
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 34,
          lineHeight: 1.3,
          color: NAVY,
          marginBottom: 10,
        }}
      >
        {texto}
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 22,
          color: TENUE,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {hora}
      </div>
    </div>
  );
};

// ── 01 · El hook ─────────────────────────────────────────────────────────

export const D1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Papel>
      <Marco>
        <div style={{ marginBottom: 28 }}>
          <Rotulo delay={6}>Lo que pasó de verdad</Rotulo>
        </div>
        <div style={{ marginBottom: 46 }}>
          <Titulo delay={11} size={74}>
            No se fue a otro lado por el precio.
          </Titulo>
        </div>

        <Tarjeta delay={34} padding="40px 44px 40px">
          <CabezalTarjeta titulo="WhatsApp de la agencia" extra="hoy" delay={38} />
          <div style={{ display: "flex", flexDirection: "column", paddingTop: 26 }}>
            <Burbuja
              texto="Hola, buenas. ¿Cuánto está la Amarok V6?"
              hora="10:12"
              delay={45}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 30,
                opacity: ent(frame, 62, 12),
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 6,
                  backgroundColor: TENUE,
                }}
              />
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: TENUE,
                }}
              >
                Visto · sin responder
              </span>
            </div>
          </div>
        </Tarjeta>
      </Marco>
    </Papel>
  );
};

// ── 02 · El otro contestó ────────────────────────────────────────────────

export const D2Otro: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>Mientras tanto</Rotulo>
      </div>
      <div style={{ marginBottom: 44 }}>
        <Titulo delay={5} size={66}>
          Otro concesionario le contestó.
        </Titulo>
      </div>

      <Tarjeta delay={19} padding="46px 48px 48px">
        <Cifra
          etiqueta="Lo que tardó en responderle"
          valor="5 min"
          delay={30}
          size={168}
        />
      </Tarjeta>

      <div style={{ marginTop: 44 }}>
        <Nota delay={56}>
          No le ganó con un mejor precio. Le ganó estando.
        </Nota>
      </div>
    </Marco>
  </Papel>
);

// ── 03 · Tu día ──────────────────────────────────────────────────────────

export const D3Noche: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>Cómo se te fue el día</Rotulo>
      </div>
      <div style={{ marginBottom: 40 }}>
        <Titulo delay={5} size={62}>
          Ibas a contestarle a la noche.
        </Titulo>
      </div>

      <Tarjeta delay={18} padding="44px 46px 30px">
        <CabezalTarjeta titulo="La consulta, hora por hora" delay={22} />
        <div style={{ paddingTop: 26 }}>
          <Linea
            delay={32}
            hitos={[
              { hora: "10:12", texto: "Te escribe preguntando el precio" },
              { hora: "10:17", texto: "El otro concesionario le responde" },
              { hora: "20:45", texto: "Cerrás, te acordás y le escribís" },
              { hora: "20:46", texto: "Ya había firmado en otro lado", acento: true },
            ]}
          />
        </div>
      </Tarjeta>
    </Marco>
  </Papel>
);

// ── 04 · El reencuadre ───────────────────────────────────────────────────

export const D4Reframe: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>El precio no era el problema</Rotulo>
      </div>
      <div style={{ marginBottom: 42 }}>
        <Titulo delay={5} size={60}>
          Los perdés por el tiempo que tarda tu WhatsApp en contestar.
        </Titulo>
      </div>

      <Tarjeta delay={21} padding="44px 46px 28px">
        <CabezalTarjeta titulo="Por qué se fue" delay={26} />
        <Veredicto etiqueta="¿Por el precio del auto?" valor="No" delay={35} />
        <Veredicto etiqueta="¿Por la unidad que tenías?" valor="No" delay={48} />
        <Veredicto
          etiqueta="¿Por la demora en contestar?"
          valor="Sí"
          positivo
          delay={61}
          ultimo
        />
      </Tarjeta>
    </Marco>
  </Papel>
);

// ── 05 · Lo que pasa ahora ────────────────────────────────

/**
 * Espejo exacto de la escena 03: mismo componente, misma hora de arranque,
 * mismo formato de hito. Que el espectador reconozca la linea de tiempo que
 * ya vio, resuelta, es mas fuerte que cualquier dato que le podamos dar.
 */
export const D5Ahora: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>El mismo día, con AutomLead</Rotulo>
      </div>
      <div style={{ marginBottom: 40 }}>
        <Titulo delay={5} size={62}>
          No espera a que alguien se acuerde.
        </Titulo>
      </div>

      <Tarjeta delay={16} padding="44px 46px 30px">
        <CabezalTarjeta titulo="La misma consulta, hora por hora" delay={21} />
        <div style={{ paddingTop: 26 }}>
          <Linea
            delay={27}
            hitos={[
              { hora: "10:12", texto: "Te escribe preguntando el precio" },
              { hora: "10:12", texto: "Se asigna sola al que está libre" },
              { hora: "10:16", texto: "Martín ya le está respondiendo" },
              { hora: "10:41", texto: "Agendaron la prueba de manejo", acento: true },
            ]}
          />
        </div>
      </Tarjeta>
    </Marco>
  </Papel>
);

// ── 06 · La diferencia ───────────────────────────────────

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
          fontSize: 128,
          lineHeight: 0.96,
          letterSpacing: "-0.04em",
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
  const largo = interpolate(frame, [delay, delay + 16], [0, 74], {
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
          opacity: ent(frame, delay + 12, 8),
        }}
      />
    </div>
  );
};

/**
 * La cifra no sale de ningun estudio: sale del reloj de las dos escenas
 * anteriores. 10:12 a 20:45 son diez horas y media; 10:12 a 10:16 son
 * cuatro minutos. Es la aritmetica de la propia historia.
 */
export const D6Diferencia: React.FC = () => (
  <Papel>
    <Marco>
      <div style={{ marginBottom: 26 }}>
        <Rotulo delay={2}>La diferencia</Rotulo>
      </div>
      <div style={{ marginBottom: 40 }}>
        <Texto delay={5}>
          Mismo cliente, mismo día, <Fuerte>misma unidad</Fuerte>.
        </Texto>
      </div>

      <Tarjeta delay={16} padding="46px 48px 44px" acento>
        <CabezalTarjeta titulo="Tiempo hasta la respuesta" delay={21} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            paddingTop: 30,
          }}
        >
          <Columna etiqueta="Antes" valor="10:33" delay={29} tenue />
          <Flecha delay={42} />
          <Columna etiqueta="Con AutomLead" valor="0:04" delay={50} />
        </div>
      </Tarjeta>

      <div style={{ marginTop: 40 }}>
        <Nota delay={69}>
          Diez horas y media de diferencia sobre el mismo mensaje.
        </Nota>
      </div>
    </Marco>
  </Papel>
);

// ── 07 · Cierre ──────────────────────────────────────────────────────────

export const D7Cta: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Papel>
      <Marco>
        <div style={{ marginBottom: 26 }}>
          <Rotulo delay={2}>Cómo se arregla</Rotulo>
        </div>
        <div style={{ marginBottom: 44 }}>
          <Titulo delay={5} size={74}>
            Andá al perfil.
          </Titulo>
        </div>

        <div style={{ marginBottom: 48 }}>
          <Texto delay={21}>
            Ahí te muestro cómo un concesionario{" "}
            <Fuerte>deja de perder clientes por tardar en contestar</Fuerte>.
          </Texto>
        </div>

        <div
          style={{
            height: 3,
            backgroundColor: ORO_VIVO,
            width: interpolate(frame, [46, 68], [0, 888], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        />

        <div
          style={{
            marginTop: 46,
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            backgroundColor: NAVY,
            borderRadius: 999,
            padding: "26px 52px",
            boxShadow: "0 12px 34px rgba(10,23,51,0.22)",
            opacity: ent(frame, 62, 16),
            translate: sube(frame, 62, 18, 22),
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: ORO_VIVO,
            }}
          />
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 44,
              color: BLANCO,
            }}
          >
            @quantumcoffee.xyz
          </span>
        </div>
      </Marco>
    </Papel>
  );
};
