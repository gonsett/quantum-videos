import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Cabezal, Tarjeta } from "../explicador-rc/escenas";
import { aparece, sube } from "../ring-closers/piezas";
import { DISPLAY, EASE, MARGEN, MONO, RC, SANS } from "../ring-closers/tema";

/**
 * Piezas de "Qué es Ring Closers": lo que la pantalla muestra como prueba
 * mientras la voz habla. Misma gramática que el resto de la marca (tarjeta de
 * 1 px, un solo acento por vez) y una regla propia de este video: el
 * esmeralda aparece con la solución. El problema se ve en platino.
 */

const ease = Easing.bezier(...EASE);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Marco ────────────────────────────────────────────────────────────────

/** Round actual y cuántos faltan: tres segmentos. Le dice a quien mira cuánto queda. */
export const Ronda: React.FC<{ n: number; total?: number; instantanea?: boolean }> = ({
  n,
  total = 3,
  instantanea,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 330,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: instantanea ? 1 : aparece(frame, 0, 14),
        translate: instantanea ? undefined : sube(frame, 0, 14, 14),
      }}
    >
      <div style={{ height: 2, width: 56, margin: "0 auto 18px", backgroundColor: RC.esmeralda500 }} />
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: RC.platino500,
        }}
      >
        Round {n} de {total}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: 34,
              height: 3,
              borderRadius: 2,
              backgroundColor: i + 1 < n ? RC.platino500 : i + 1 === n ? RC.esmeralda500 : RC.tinta700,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** Caja absoluta con entrada y salida para un objeto de prueba. */
export const Objeto: React.FC<{
  top: number;
  en: number;
  sale?: number;
  children: React.ReactNode;
}> = ({ top, en, sale, children }) => {
  const frame = useCurrentFrame();
  const s = sale === undefined ? 0 : interpolate(frame, [sale, sale + 12], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: MARGEN,
        right: MARGEN,
        opacity: aparece(frame, en, 12) * (1 - s),
        translate: sube(frame, en, 26, 17),
        filter: s > 0 ? `blur(${s * 8}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

export const Pildora: React.FC<{ children: React.ReactNode; en: number; color?: string }> = ({
  children,
  en,
  color = RC.esmeralda500,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 22px",
        border: `1px solid ${color}`,
        borderRadius: 999,
        opacity: aparece(frame, en, 8),
        translate: sube(frame, en, 10, 10),
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.08em", color }}>
        {children}
      </span>
    </div>
  );
};

const Tilde: React.FC<{ en: number; size?: number }> = ({ en, size = 44 }) => {
  const frame = useCurrentFrame();
  const trazo = interpolate(frame, [en, en + 12], [0, 1], { ...clamp, easing: ease });
  return (
    <svg width={size} height={size} viewBox="0 0 54 54">
      <circle cx="27" cy="27" r="25" fill="none" stroke={RC.esmeralda500} strokeWidth="2" />
      <path
        d="M16 27.5l7.5 7.5L38.5 20"
        fill="none"
        stroke={RC.esmeralda500}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - trazo}
      />
    </svg>
  );
};

// ── Round 2 · el problema ────────────────────────────────────────────────

/**
 * Tu práctica, semana a semana: siempre los mismos dos (A y B) y, a la tercera
 * semana, nada. Todo en platino — todavía no hay esmeralda, porque todavía no
 * hay solución.
 */
export const TarjetaSemanas: React.FC<{ chipsEn: number; vaciaEn: [number, number] }> = ({
  chipsEn,
  vaciaEn,
}) => {
  const frame = useCurrentFrame();
  return (
    <Tarjeta>
      <Cabezal izq="Tu práctica" der="LOS MISMOS DOS" />
      {Array.from({ length: 4 }, (_, i) => {
        // Las semanas 3 y 4 se vacían; las dos primeras quedan, como pasa en la vida real
        const vaciaAt = i >= 2 ? vaciaEn[i - 2] : 1e9;
        const vaciada = interpolate(frame, [vaciaAt, vaciaAt + 10], [0, 1], clamp);
        const chips = aparece(frame, chipsEn + i * 5, 9);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 32px",
              borderBottom: i < 3 ? `1px solid ${RC.tinta700}` : "none",
            }}
          >
            <span
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: vaciada > 0.5 ? RC.platino500 : RC.crema,
              }}
            >
              Semana {i + 1}
            </span>
            <div style={{ position: "relative", width: 112, height: 48 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  gap: 16,
                  justifyContent: "flex-end",
                  opacity: chips * (1 - vaciada),
                }}
              >
                {["A", "B"].map((letra) => (
                  <div
                    key={letra}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      border: `2px solid ${RC.platino500}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 22,
                      color: RC.platino300,
                    }}
                  >
                    {letra}
                  </div>
                ))}
              </div>
              <svg
                width="48"
                height="48"
                viewBox="0 0 54 54"
                style={{ position: "absolute", right: 0, top: 0, opacity: vaciada }}
              >
                <circle cx="27" cy="27" r="25" fill="none" stroke={RC.platino500} strokeOpacity="0.5" strokeWidth="2" strokeDasharray="4 6" />
              </svg>
            </div>
          </div>
        );
      })}
    </Tarjeta>
  );
};

// ── Round 3 · por qué usarlo ─────────────────────────────────────────────

/**
 * Puntos y cinturón. Sube (+30: las tres peleas cumplidas) y cruza el umbral de
 * Contendiente (300, `lib/ranks.ts`): el cinturón cambia en ese cuadro. Después
 * baja 15 (pelea sin cumplir). 285 + 30 − 15 = 300: se queda justo en el piso,
 * así que perder puntos no cambia el rango y el video no promete de más.
 */
export const PanelPuntos: React.FC<{
  base: number;
  tope: number;
  piso: number;
  umbral: number;
  suma: { en: number; dur: number };
  resta: { en: number; dur: number };
}> = ({ base, tope, piso, umbral, suma, resta }) => {
  const frame = useCurrentFrame();
  const curva = Easing.bezier(0.33, 0, 0.2, 1);

  const subida = interpolate(frame, [suma.en, suma.en + suma.dur], [base, tope], { ...clamp, easing: curva });
  const bajada = interpolate(frame, [resta.en, resta.en + resta.dur], [0, tope - piso], { ...clamp, easing: curva });
  const valor = Math.round(subida - bajada);

  const cruceEn = suma.en + (suma.dur * (umbral - base)) / (tope - base);
  const cambio = interpolate(frame, [cruceEn, cruceEn + 12], [0, 1], { ...clamp, easing: ease });
  const perdiendo = frame >= resta.en;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 36,
        backgroundColor: RC.tinta900,
        border: `1px solid ${RC.tinta700}`,
        borderRadius: 24,
        padding: "34px 40px",
      }}
    >
      <div style={{ position: "relative", width: 360, height: 230, flexShrink: 0, margin: "-18px -24px -18px -20px" }}>
        <Img
          src={staticFile("ring-closers/belts/prospecto.webp")}
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
          src={staticFile("ring-closers/belts/contendiente.webp")}
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
              color: perdiendo ? RC.platino300 : RC.crema,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {valor}
          </span>
          <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: "0.1em", color: RC.platino500 }}>
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
            Prospecto
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
            Contendiente
          </div>
        </div>
        <div style={{ height: 2, marginTop: 10, backgroundColor: RC.esmeralda500, width: `${cambio * 100}%` }} />
      </div>

      {/* +30 mientras suma, −15 cuando falta una pelea */}
      <div
        style={{
          position: "absolute",
          top: 26,
          right: 32,
          padding: "8px 18px",
          border: `1px solid ${perdiendo ? RC.platino500 : RC.esmeralda500}`,
          borderRadius: 999,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 26,
          color: perdiendo ? RC.platino300 : RC.esmeralda400,
          opacity: aparece(frame, suma.en, 8),
        }}
      >
        {perdiendo ? "−15" : "+30"}
      </div>
    </div>
  );
};

const RUTA_ESTRELLA =
  "M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

/** Otro closer te califica de 1 a 5: las estrellas se llenan una por una. */
export const TarjetaEvaluacion: React.FC<{ estrellasEn: number; verificadoEn: number }> = ({
  estrellasEn,
  verificadoEn,
}) => {
  const frame = useCurrentFrame();
  const LLENAS = 4;
  return (
    <Tarjeta>
      <Cabezal izq="Evaluación" der="ENTRE PARES" />
      <div style={{ padding: "34px 36px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              border: `2px solid ${RC.platino500}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 28,
              color: RC.platino300,
            }}
          >
            C
          </div>
          <div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 34,
                textTransform: "uppercase",
                color: RC.crema,
              }}
            >
              Tu último roleplay
            </div>
            <div style={{ marginTop: 4, fontFamily: SANS, fontSize: 26, color: RC.platino500 }}>
              Te califica otro closer
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40 }}>
          {Array.from({ length: 5 }, (_, i) => {
            const llena = i < LLENAS;
            const t = llena ? interpolate(frame, [estrellasEn + i * 6, estrellasEn + i * 6 + 9], [0, 1], { ...clamp, easing: ease }) : 0;
            return (
              <svg key={i} width="84" height="84" viewBox="0 0 24 24" style={{ scale: String(1 + 0.12 * Math.sin(t * Math.PI)) }}>
                <path d={RUTA_ESTRELLA} fill="none" stroke={RC.tinta700} strokeWidth="1.4" />
                <path d={RUTA_ESTRELLA} fill={RC.platino300} stroke={RC.platino300} strokeWidth="1.4" opacity={t} />
              </svg>
            );
          })}
        </div>

        <div style={{ marginTop: 34, textAlign: "center" }}>
          <Pildora en={verificadoEn}>NIVEL VERIFICADO</Pildora>
        </div>
      </div>
    </Tarjeta>
  );
};

const FILAS_RANKING = [
  { nombre: "Otro closer", pts: "412", yo: false },
  { nombre: "Tu boxeador", pts: "340", yo: true },
  { nombre: "Otro closer", pts: "295", yo: false },
];

/** El ranking público, que es lo que miran los directores. */
export const TarjetaRanking: React.FC<{ en: number }> = ({ en }) => {
  const frame = useCurrentFrame();
  return (
    <Tarjeta>
      <Cabezal izq="Ranking" der="PÚBLICO" />
      <div style={{ padding: "8px 0" }}>
        {FILAS_RANKING.map((f, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "20px 32px",
              borderBottom: i < FILAS_RANKING.length - 1 ? `1px solid ${RC.tinta700}` : "none",
              opacity: aparece(frame, en + 4 + i * 6, 8),
            }}
          >
            {f.yo ? (
              <div style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 4, borderRadius: 2, backgroundColor: RC.esmeralda500 }} />
            ) : null}
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: RC.platino500, width: 44 }}>#{i + 1}</span>
            <span
              style={{
                flex: 1,
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 34,
                textTransform: "uppercase",
                color: f.yo ? RC.crema : RC.platino300,
              }}
            >
              {f.nombre}
            </span>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: f.yo ? RC.crema : RC.platino500 }}>
              {f.pts} pts
            </span>
          </div>
        ))}
      </div>
    </Tarjeta>
  );
};

/** Un director comercial te encontró en el ranking. */
export const TarjetaPropuesta: React.FC<{ en: number }> = ({ en }) => (
  <Tarjeta>
    <Cabezal izq="Propuesta" der="NUEVA" />
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 32px" }}>
      <div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, textTransform: "uppercase", color: RC.crema }}>
          Director comercial
        </div>
        <div style={{ marginTop: 6, fontFamily: SANS, fontSize: 26, color: RC.platino500 }}>
          Empresa C · te encontró en el ranking
        </div>
      </div>
      <Pildora en={en + 6}>TE BUSCA</Pildora>
    </div>
  </Tarjeta>
);

/** Una oferta abierta y el momento en que te postulás. */
export const TarjetaOferta: React.FC<{ enviadaEn: number }> = ({ enviadaEn }) => {
  const frame = useCurrentFrame();
  const enviada = interpolate(frame, [enviadaEn, enviadaEn + 10], [0, 1], clamp);
  return (
    <Tarjeta>
      <Cabezal izq="Oferta abierta" />
      <div style={{ padding: "30px 32px" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, textTransform: "uppercase", color: RC.crema }}>
          Closer B2B remoto
        </div>
        <div style={{ marginTop: 6, fontFamily: SANS, fontSize: 26, color: RC.platino500 }}>Empresa C</div>

        <div style={{ position: "relative", height: 74, marginTop: 30 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${RC.esmeralda500}`,
              borderRadius: 999,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "0.1em",
              color: RC.esmeralda500,
              opacity: 1 - enviada,
            }}
          >
            POSTULARME
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              opacity: enviada,
            }}
          >
            <Tilde en={enviadaEn} />
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, textTransform: "uppercase", color: RC.crema }}>
              Postulación enviada
            </span>
          </div>
        </div>
      </div>
    </Tarjeta>
  );
};
