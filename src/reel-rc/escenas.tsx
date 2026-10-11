import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import {
  Cuerdas,
  FightCard,
  Noche,
  PanelRango,
  Rotulo,
  aparece,
  puntosPorEstrellas,
  sube,
  type Pelea,
} from "../ring-closers/piezas";
import { DISPLAY, EASE, MARGEN, MONO, RC, SANS } from "../ring-closers/tema";
import { Guante, Logo } from "./logo";
import { Subtitulos } from "./subtitulos";
import { reel } from "./timeline";

/**
 * Reel de Ring Closers v2. Formato nativo: cortes cada 1-2 s, nada sostenido
 * más de 4 s, subtítulos como guion para verlo sin sonido.
 *
 * Gancho y guion nuevos (guion-rc-v2.json) — reemplaza el guion anterior
 * (guion-reel-rc.json, descartado) y el de guion-ringclosers.json. El
 * Round 1 arranca en el ring vacío, nunca en el cinturón — pedido explícito.
 *
 * Layout pensado para la interfaz de Instagram encima: la imagen vive entre
 * 250 y 1110, los subtítulos entre 1180 y 1360.
 */

const ease = Easing.bezier(...EASE);
const { cuadro, escena } = reel;

// ── Utilidades de montaje ────────────────────────────────────────────────

export const Zona: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      top: 250,
      left: MARGEN,
      right: MARGEN,
      height: 860,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export const Plano: React.FC<{ desde: number; hasta?: number; children: React.ReactNode }> = ({
  desde,
  hasta = Number.POSITIVE_INFINITY,
  children,
}) => {
  const frame = useCurrentFrame();
  if (frame < desde || frame >= hasta) return null;
  const empuje = interpolate(frame, [desde, desde + 7], [1.035, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <AbsoluteFill style={{ scale: String(empuje), transformOrigin: "50% 36%" }}>{children}</AbsoluteFill>
  );
};

export const MarcaChica: React.FC<{ visible?: number }> = ({ visible = 1 }) => (
  <div style={{ position: "absolute", top: 150, left: MARGEN, opacity: visible }}>
    <Logo size={58} />
  </div>
);

export const Tarjeta: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      backgroundColor: RC.tinta900,
      border: `1px solid ${RC.tinta700}`,
      borderRadius: 26,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Cabezal: React.FC<{ izq: React.ReactNode; der?: React.ReactNode }> = ({ izq, der }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: RC.tinta800,
      borderBottom: `1px solid ${RC.tinta700}`,
      padding: "22px 36px",
    }}
  >
    <span
      style={{
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 28,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: RC.platino500,
      }}
    >
      {izq}
    </span>
    {der ? (
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: RC.platino300 }}>{der}</span>
    ) : null}
  </div>
);

// ── S1 · Gancho ──────────────────────────────────────────────────────────

/**
 * Ring vacío, una sola luz de trabajo, en silencio — nunca el cinturón (pedido
 * explícito del usuario, ya usado en el video anterior). El texto grande ES
 * el subtítulo: tiene que parar el scroll solo, con voz o sin ella.
 */
export const S1Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s1-gancho";
  const palabras = escena(ID).clips[0].palabras;
  const golpeEn = cuadro(ID, "mejorando");
  const golpe = interpolate(frame, [golpeEn, golpeEn + 8], [1.045, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <Noche foco={0.7}>
      <Cuerdas top={210} delay={0} />
      <Cuerdas top={1080} delay={4} />
      <Zona>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 26,
            rowGap: 0,
            scale: frame >= golpeEn ? String(golpe) : "1",
            transformOrigin: "0% 50%",
          }}
        >
          {palabras.map((w, k) => {
            const clave = frame >= 0 && cuadro(ID, "no") <= w.cuadro; // "no estás mejorando." en esmeralda
            const entra = interpolate(frame, [w.cuadro - 1, w.cuadro + 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            });
            return (
              <span
                key={k}
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 700,
                  fontSize: 118,
                  lineHeight: 1.04,
                  textTransform: "uppercase",
                  color: clave ? RC.esmeralda500 : RC.crema,
                  opacity: entra,
                  translate: `0px ${(1 - entra) * 18}px`,
                }}
              >
                {w.palabra}
              </span>
            );
          })}
        </div>
      </Zona>
    </Noche>
  );
};

// ── S2 · Problema ────────────────────────────────────────────────────────

const semanaBase = (marcaMedio: number, marcaTop: number, marcaFondo: number): Pelea[] => [
  { tercio: "Por debajo", nombre: "Sin contacto", rango: "Nunca practicado", franja: "—", estado: "evitada", marcaEn: marcaTop },
  { tercio: "Tu nivel", nombre: "Lucía F.", rango: "Mismo rango", franja: "MAR 19:00", estado: "cumplida", marcaEn: marcaMedio, estrellas: 3 },
  { tercio: "Por encima", nombre: "Sin contacto", rango: "Nunca practicado", franja: "—", estado: "evitada", marcaEn: marcaFondo },
];

export const S2Problema: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s2-problema";
  const clips = escena(ID).clips;
  const finEscena = escena(ID).durationInFrames;

  const marcaMedio = cuadro(ID, "mismos");
  const marcaTop = cuadro(ID, "nunca", 1);
  const marcaFondo = cuadro(ID, "nunca", 2);
  const corteB = clips[2].enEscena - 4; // arranca "Repetís..."

  return (
    <Noche>
      <MarcaChica visible={aparece(frame, 0, 6)} />

      <Plano desde={0} hasta={corteB}>
        <Zona>
          <FightCard peleas={semanaBase(marcaMedio, marcaTop, marcaFondo)} semana="SEMANA 34" delay={2} />
        </Zona>
      </Plano>

      <Plano desde={corteB}>
        <Zona>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {["SEMANA 32", "SEMANA 33", "SEMANA 34"].map((s, i) => (
              <Tarjeta key={s} style={{ opacity: aparece(frame, corteB + i * 6, 8) }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "22px 32px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 600,
                      fontSize: 26,
                      letterSpacing: "0.14em",
                      color: RC.platino500,
                    }}
                  >
                    {s}
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 30, color: RC.crema }}>Lucía F. · 3★</span>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: RC.platino300 }}>
                    +{puntosPorEstrellas(3)}
                  </span>
                </div>
              </Tarjeta>
            ))}
            <div
              style={{
                marginTop: 14,
                textAlign: "center",
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 46,
                textTransform: "uppercase",
                color: RC.platino300,
                opacity: aparece(frame, cuadro(ID, "subis") - 6, 10),
              }}
            >
              Mismo patrón. <span style={{ color: RC.esmeralda500 }}>Mismo puntaje.</span>
            </div>
          </div>
        </Zona>
      </Plano>

      <Subtitulos clips={clips} duracionEscena={finEscena} clave={["mismos", "nunca", "subis"]} />
    </Noche>
  );
};

// ── S3 · Solución ────────────────────────────────────────────────────────

const TERCIOS = ["Por debajo", "Igual", "Por encima"];

export const S3Solucion: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s3-solucion";
  const clips = escena(ID).clips;
  const finEscena = escena(ID).durationInFrames;

  const entradas = [cuadro(ID, "uno", 1), cuadro(ID, "uno", 2), cuadro(ID, "uno", 3)];
  const comodo = clips[1].enEscena - 2; // "Cada semana..."
  const panelDesde = clips[2].enEscena - 2; // "Cumplís las tres..."
  const cuentaEn = cuadro(ID, "sumas");

  return (
    <Noche>
      <MarcaChica />

      <Plano desde={0} hasta={comodo}>
        <Zona>
          <div style={{ marginBottom: 30, opacity: aparece(frame, 0, 8) }}>
            <Rotulo delay={0}>Las tres franjas</Rotulo>
          </div>
          {TERCIOS.map((t, i) => {
            const d = entradas[i] - 2;
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 30,
                  height: 152,
                  marginBottom: i < 2 ? 20 : 0,
                  padding: "0 36px",
                  backgroundColor: RC.tinta900,
                  border: `1px solid ${RC.tinta700}`,
                  borderRadius: 22,
                  opacity: aparece(frame, d, 6),
                  translate:
                    interpolate(frame, [d, d + 9], [-36, 0], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: ease,
                    }) + "px 0px",
                }}
              >
                <Guante size={64} />
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: 58,
                    textTransform: "uppercase",
                    color: RC.crema,
                  }}
                >
                  {t}
                </div>
              </div>
            );
          })}
        </Zona>
      </Plano>

      <Plano desde={comodo} hasta={panelDesde}>
        <Zona>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 88,
                lineHeight: 1.05,
                textTransform: "uppercase",
                color: RC.crema,
                opacity: aparece(frame, comodo + 2, 9),
                translate: sube(frame, comodo + 2, 20, 12),
              }}
            >
              Cada semana.
            </div>
            <div
              style={{
                marginTop: 20,
                fontFamily: SANS,
                fontSize: 40,
                color: RC.platino300,
                opacity: aparece(frame, cuadro(ID, "comodo") - 4, 9),
              }}
            >
              Sin opción de elegir cómodo.
            </div>
          </div>
        </Zona>
      </Plano>

      <Plano desde={panelDesde}>
        <Zona>
          <PanelRango
            desde={260}
            hasta={305}
            cuentaEn={cuentaEn}
            duracionCuenta={26}
            umbral={300}
            rangoAntes="Prospecto"
            rangoDespues="Contendiente"
            cinturonAntes="ring-closers/belts/prospecto.webp"
            cinturonDespues="ring-closers/belts/contendiente.webp"
            delay={panelDesde + 2}
          />
        </Zona>
      </Plano>

      <Subtitulos clips={clips} duracionEscena={finEscena} clave={["comodo", "sumas", "rango"]} />
    </Noche>
  );
};

// ── S4 · Oportunidad ─────────────────────────────────────────────────────

export const S4Oportunidad: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s4-oportunidad";
  const clips = escena(ID).clips;
  const finEscena = escena(ID).durationInFrames;

  const corteB = cuadro(ID, "directores") - 6;
  const corteC = clips[2].enEscena - 4; // "Cuanto más alto..."

  return (
    <Noche>
      <MarcaChica />

      {/* A · Y mientras subís, alguien más está mirando */}
      <Plano desde={0} hasta={corteB}>
        <Zona>
          <Tarjeta>
            <Cabezal izq="Leaderboard" der="#3" />
            <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "36px 32px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, textTransform: "uppercase", color: RC.crema }}>
                  Tu boxeador
                </div>
                <div style={{ fontFamily: SANS, fontSize: 28, color: RC.platino500, marginTop: 6 }}>Contendiente · 340 pts</div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 20px",
                  border: `1px solid ${RC.esmeralda500}`,
                  borderRadius: 999,
                  opacity: aparece(frame, cuadro(ID, "mirando") - 3, 8),
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: RC.esmeralda500,
                    opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0.3,
                  }}
                />
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.08em", color: RC.esmeralda500 }}>
                  TE ESTÁN VIENDO
                </span>
              </div>
            </div>
          </Tarjeta>
        </Zona>
      </Plano>

      {/* B · Directores comerciales buscan closers directo en el ranking */}
      <Plano desde={corteB} hasta={corteC}>
        <Zona>
          <Tarjeta>
            <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "30px 32px", borderBottom: `1px solid ${RC.tinta700}` }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  border: `1px solid ${RC.tinta700}`,
                  backgroundColor: RC.tinta800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 26,
                  color: RC.platino300,
                }}
              >
                DC
              </div>
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: RC.crema }}>Director Comercial</div>
                <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.06em", color: RC.platino500 }}>NUEVA PROPUESTA</div>
              </div>
            </div>
            <div style={{ padding: "32px 32px 40px" }}>
              <div
                style={{
                  backgroundColor: RC.tinta800,
                  border: `1px solid ${RC.tinta700}`,
                  borderRadius: "26px 26px 26px 6px",
                  padding: "26px 30px",
                  fontFamily: SANS,
                  fontSize: 36,
                  lineHeight: 1.35,
                  color: RC.crema,
                  opacity: aparece(frame, corteB + 4, 8),
                }}
              >
                Vi tu rango en Ring Closers. Busco closers para una cuenta premium, comisión...
              </div>
            </div>
          </Tarjeta>
        </Zona>
      </Plano>

      {/* C · Cuanto más alto tu rango, más real la oportunidad */}
      <Plano desde={corteC}>
        <Zona>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 76,
                lineHeight: 1.08,
                textTransform: "uppercase",
                color: RC.crema,
                opacity: aparece(frame, corteC + 2, 10),
                translate: sube(frame, corteC + 2, 22, 13),
              }}
            >
              Cuanto más alto tu rango,
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 76,
                lineHeight: 1.08,
                marginTop: 28,
                textTransform: "uppercase",
                color: RC.esmeralda500,
                opacity: aparece(frame, cuadro(ID, "real") - 2, 10),
                translate: sube(frame, cuadro(ID, "real") - 2, 22, 13),
              }}
            >
              más real la oportunidad.
            </div>
          </div>
        </Zona>
      </Plano>

      <Subtitulos clips={clips} duracionEscena={finEscena} clave={["mirando", "directores", "real"]} />
    </Noche>
  );
};

// ── S5 · CTA ─────────────────────────────────────────────────────────────

/**
 * Sin subtítulos: la pantalla ya dice lo mismo que la voz, y repetirlo en
 * dos lugares del mismo cuadro se lee como error, no como refuerzo.
 */
export const S5Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s5-cta";
  const gratis = cuadro(ID, "gratis");
  const ring = cuadro(ID, "ring", 2); // "Ring Closers" (1) ... "subite al ring" (2)

  return (
    <Noche>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 260 }}>
        <div style={{ opacity: aparece(frame, 0, 8), translate: sube(frame, 0, 20, 12) }}>
          <Logo size={128} />
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 132,
            lineHeight: 1,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            opacity: aparece(frame, 2, 8),
            translate: sube(frame, 2, 20, 12),
          }}
        >
          <span style={{ color: RC.crema }}>RING </span>
          <span style={{ color: RC.esmeralda500 }}>CLOSERS</span>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: SANS,
            fontSize: 42,
            color: RC.platino300,
            opacity: aparece(frame, gratis - 2, 8),
          }}
        >
          Gratis. Sin tarjeta, sin vueltas.
        </div>
        <div
          style={{
            marginTop: 54,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: "0.14em",
            color: RC.crema,
            border: `1px solid ${RC.platino500}`,
            borderRadius: 999,
            padding: "18px 40px",
            opacity: aparece(frame, ring - 4, 8),
            translate: sube(frame, ring - 4, 14, 10),
          }}
        >
          SUBITE AL RING
        </div>
      </AbsoluteFill>
    </Noche>
  );
};
