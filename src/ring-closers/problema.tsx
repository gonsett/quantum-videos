import { interpolate, useCurrentFrame } from "remotion";
import { aparece, sube } from "./piezas";
import { DISPLAY, MONO, RC, SANS } from "./tema";

/**
 * Los objetos del round 2: el mundo sin sistema.
 *
 * Acá no aparece el esmeralda en ningún lado. Es deliberado: el acento de la
 * marca llega con el producto en el round 3, y su ausencia antes es parte de
 * lo que cuenta el video. Todo el round vive en platino y crema.
 */

const Tarjeta: React.FC<{
  titulo: string;
  extra?: string;
  delay: number;
  children: React.ReactNode;
}> = ({ titulo, extra, delay, children }) => {
  const frame = useCurrentFrame();
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
          {titulo}
        </span>
        {extra ? (
          <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, color: RC.platino500 }}>
            {extra}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
};

// ── A quién le escribís ──────────────────────────────────────────────────

export type Chat = {
  nombre: string;
  rango: string;
  ultimo: string;
  cuando: string;
  /** El que te contesta rápido: se marca cuando la voz lo dice. */
  comodo?: boolean;
  /** El que te haría mejorar y nunca aparece. */
  olvidado?: boolean;
};

/**
 * La lista de chats. Muestra en un solo cuadro lo que la voz afirma: la
 * conversación viva es con el de tu nivel, la muerta es con el de arriba.
 * No hace falta leer los mensajes, alcanza con ver cuál está vacía.
 */
export const ListaChats: React.FC<{
  chats: Chat[];
  delay: number;
  comodoEn: number;
  olvidadoEn: number;
}> = ({ chats, delay, comodoEn, olvidadoEn }) => {
  const frame = useCurrentFrame();
  return (
    <Tarjeta titulo="Tus chats" extra="PRÁCTICA" delay={delay}>
      {chats.map((c, i) => {
        const d = delay + 10 + i * 8;
        const olvidadoOp = c.olvidado ? aparece(frame, olvidadoEn, 12) : 0;
        const comodoOp = c.comodo ? aparece(frame, comodoEn, 10) : 0;
        return (
          <div
            key={c.nombre}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "28px 36px",
              borderBottom: i === chats.length - 1 ? "none" : `1px solid ${RC.tinta700}`,
              opacity: aparece(frame, d, 11) * (c.olvidado ? interpolate(olvidadoOp, [0, 1], [1, 0.72]) : 1),
              translate: sube(frame, d, 14, 13),
            }}
          >
            {/* Inicial: sin foto, un monograma en filete */}
            <div
              style={{
                width: 76,
                height: 76,
                flexShrink: 0,
                borderRadius: 38,
                border: `1px solid ${RC.tinta700}`,
                backgroundColor: RC.tinta800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: DISPLAY,
                fontWeight: 600,
                fontSize: 30,
                color: RC.platino300,
              }}
            >
              {c.nombre.split(" ").map((p) => p[0]).join("")}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: 44,
                    textTransform: "uppercase",
                    color: RC.crema,
                  }}
                >
                  {c.nombre}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 26, color: RC.platino500 }}>{c.rango}</span>
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 30,
                  color: c.olvidado ? RC.platino500 : RC.platino300,
                  fontStyle: c.olvidado ? "italic" : "normal",
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.ultimo}
              </div>
            </div>

            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontWeight: 500,
                  fontSize: 24,
                  color: RC.platino500,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {c.cuando}
              </div>
              {c.comodo ? (
                <div
                  style={{
                    marginTop: 10,
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: "0.06em",
                    color: RC.crema,
                    border: `1px solid ${RC.platino500}`,
                    borderRadius: 999,
                    padding: "4px 14px",
                    opacity: comodoOp,
                  }}
                >
                  RESPONDE EN 2 MIN
                </div>
              ) : null}
              {c.olvidado ? (
                <div
                  style={{
                    marginTop: 10,
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: "0.06em",
                    color: RC.platino300,
                    opacity: olvidadoOp,
                  }}
                >
                  NUNCA LE ESCRIBISTE
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </Tarjeta>
  );
};

// ── Cómo se corta sola ───────────────────────────────────────────────────

/**
 * Tres semanas de práctica coordinada a mano. Cada fila es una semana, cada
 * celda un día; las marcadas son las sesiones que se hicieron. Se vacía de
 * arriba hacia abajo, que es exactamente como se abandona en la realidad:
 * no hay un día en que se decide dejar, simplemente la tercera semana no
 * aparece nadie.
 */
export const Calendario: React.FC<{
  semanas: { etiqueta: string; dias: number[]; entra: number }[];
  delay: number;
}> = ({ semanas, delay }) => {
  const frame = useCurrentFrame();
  const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <Tarjeta titulo="Tus últimas 3 semanas" delay={delay}>
      <div style={{ padding: "26px 36px 30px" }}>
        {/* Cabecera de días */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ width: 150 }} />
          {DIAS.map((d, k) => (
            <div
              key={k}
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: MONO,
                fontSize: 22,
                color: RC.platino500,
              }}
            >
              {d}
            </div>
          ))}
          <div style={{ width: 70 }} />
        </div>

        {semanas.map((s) => {
          const op = aparece(frame, s.entra, 11);
          return (
            <div
              key={s.etiqueta}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                paddingTop: 18,
                paddingBottom: 18,
                borderTop: `1px solid ${RC.tinta700}`,
                opacity: op,
                translate: sube(frame, s.entra, 12, 12),
              }}
            >
              <div
                style={{
                  width: 150,
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 26,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: RC.platino300,
                }}
              >
                {s.etiqueta}
              </div>
              {DIAS.map((_, k) => {
                const hay = s.dias.includes(k);
                const orden = s.dias.indexOf(k);
                const llena = hay ? aparece(frame, s.entra + 6 + orden * 5, 8) : 0;
                return (
                  <div
                    key={k}
                    style={{
                      flex: 1,
                      height: 58,
                      borderRadius: 10,
                      border: `1px solid ${RC.tinta700}`,
                      backgroundColor: hay
                        ? `rgba(212,212,216,${0.82 * llena})`
                        : "transparent",
                    }}
                  />
                );
              })}
              <div
                style={{
                  width: 70,
                  textAlign: "right",
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 34,
                  color: s.dias.length ? RC.crema : RC.platino500,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.dias.length}
              </div>
            </div>
          );
        })}
      </div>
    </Tarjeta>
  );
};

/** El mensaje al grupo que nadie contesta. */
export const MensajeSinRespuesta: React.FC<{
  texto: string;
  hora: string;
  delay: number;
  vistoEn: number;
}> = ({ texto, hora, delay, vistoEn }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: aparece(frame, delay, 11),
        translate: sube(frame, delay, 18, 14),
      }}
    >
      <div
        style={{
          display: "inline-block",
          maxWidth: 760,
          backgroundColor: RC.tinta800,
          border: `1px solid ${RC.tinta700}`,
          borderRadius: "22px 22px 6px 22px",
          padding: "24px 30px 18px",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "0.08em",
            color: RC.platino500,
            marginBottom: 10,
          }}
        >
          GRUPO · PRÁCTICA CLOSERS
        </div>
        <div style={{ fontFamily: SANS, fontSize: 38, lineHeight: 1.3, color: RC.crema }}>
          {texto}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: MONO,
            fontSize: 22,
            color: RC.platino500,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {hora}
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "0.08em",
          color: RC.platino300,
          opacity: aparece(frame, vistoEn, 10),
        }}
      >
        VISTO POR 14 · 0 RESPUESTAS
      </div>
    </div>
  );
};
