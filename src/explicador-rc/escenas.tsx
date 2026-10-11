import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  Cuerdas,
  FightCard,
  Noche,
  PanelRango,
  Rotulo,
  aparece,
  sube,
  type Pelea,
} from "../ring-closers/piezas";
import { DISPLAY, EASE, MARGEN, MONO, RC, SANS } from "../ring-closers/tema";
import { Logo } from "../reel-rc/logo";
import { explicador } from "./timeline";

/**
 * Explicador simple de Ring Closers: qué es, cómo funciona, rango, currículum
 * y ofertas de trabajo. Sin gancho de venta — tono calmo, de explicación
 * entre colegas, distinto del comercial (guion-ringclosers.json) y del Reel
 * (guion-rc-v2.json). Mismo lenguaje visual que ambos: Noche, Cuerdas,
 * FightCard, PanelRango — nada nuevo que no sea la carta de currículum y
 * ofertas, construida con la misma gramática (Tarjeta 1px + un acento).
 */

const ease = Easing.bezier(...EASE);
const { cuadro, escena } = explicador;

// ── Utilidades de montaje (mismas que reel-rc/escenas.tsx) ─────────────────

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
  return <div style={{ position: "absolute", inset: 0 }}>{children}</div>;
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
        fontSize: 26,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: RC.platino500,
      }}
    >
      {izq}
    </span>
    {der ? (
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: RC.platino300 }}>{der}</span>
    ) : null}
  </div>
);

const Pildora: React.FC<{ children: React.ReactNode; delay: number; punto?: boolean }> = ({
  children,
  delay,
  punto = true,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 20px",
        border: `1px solid ${RC.esmeralda500}`,
        borderRadius: 999,
        opacity: aparece(frame, delay, 8),
      }}
    >
      {punto ? (
        <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: RC.esmeralda500 }} />
      ) : null}
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.08em", color: RC.esmeralda500 }}>
        {children}
      </span>
    </div>
  );
};

const Vacio: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 54 54">
    <circle cx="27" cy="27" r="25" fill="none" stroke={RC.tinta700} strokeWidth="2" strokeDasharray="4 6" />
  </svg>
);

const Check: React.FC<{ en: number }> = ({ en }) => {
  const frame = useCurrentFrame();
  const trazo = interpolate(frame, [en, en + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <svg width="40" height="40" viewBox="0 0 54 54">
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

// ── S1 · ¿Qué es? ────────────────────────────────────────────────────────

export const S1QueEs: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s1-que-es";
  const desdeRespuesta = cuadro(ID, "Una");
  const desdeTarjeta = desdeRespuesta + 40;

  return (
    <Noche foco={0.6}>
      <Cuerdas top={210} delay={0} />
      <Cuerdas top={1080} delay={4} />
      <Zona>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 88,
              lineHeight: 1.12,
              textTransform: "uppercase",
              color: RC.crema,
              opacity: aparece(frame, 4, 14),
              translate: sube(frame, 4, 20, 14),
            }}
          >
            ¿Qué es Ring Closers?
          </div>
          <div
            style={{
              marginTop: 40,
              fontFamily: SANS,
              fontSize: 42,
              lineHeight: 1.4,
              color: RC.esmeralda500,
              opacity: aparece(frame, desdeRespuesta - 2, 12),
              translate: sube(frame, desdeRespuesta - 2, 18, 12),
            }}
          >
            Una app para entrenar como closer de ventas.
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            opacity: aparece(frame, desdeTarjeta, 12),
            translate: sube(frame, desdeTarjeta, 20, 14),
          }}
        >
          <Tarjeta>
            <Cabezal izq="Tu boxeador" />
            <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "26px 32px" }}>
              <Img
                src={staticFile("ring-closers/belts/aficionado.webp")}
                style={{ width: 74, height: 50, objectFit: "contain" }}
              />
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, textTransform: "uppercase", color: RC.crema }}>
                  Nombre de ring
                </div>
                <div style={{ marginTop: 4, fontFamily: MONO, fontSize: 22, letterSpacing: "0.08em", color: RC.platino500 }}>
                  NIVEL INICIAL: A ELEGIR
                </div>
              </div>
            </div>
          </Tarjeta>
        </div>
      </Zona>
    </Noche>
  );
};

// ── S2 · Problema ────────────────────────────────────────────────────────

const SEMANAS_PROBLEMA = ["Semana 1", "Semana 2", "Semana 3"] as const;

export const S2Problema: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s2-problema";
  const desdeTarjeta = cuadro(ID, "tercera") - 10;

  return (
    <Noche>
      <MarcaChica visible={aparece(frame, 0, 6)} />
      <Zona>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1.18,
            textTransform: "uppercase",
            color: RC.platino300,
            opacity: aparece(frame, 4, 12),
            translate: sube(frame, 4, 20, 13),
          }}
        >
          Practicar solo, sin sistema, se abandona a la tercera semana.
        </div>

        <div
          style={{
            marginTop: 48,
            opacity: aparece(frame, desdeTarjeta, 10),
            translate: sube(frame, desdeTarjeta, 20, 13),
          }}
        >
          <Tarjeta>
            <Cabezal izq="Tu práctica" />
            {SEMANAS_PROBLEMA.map((s, i) => {
              const vacia = i === 2;
              return (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "22px 32px",
                    borderBottom: i < 2 ? `1px solid ${RC.tinta700}` : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 700,
                      fontSize: 30,
                      textTransform: "uppercase",
                      color: vacia ? RC.platino500 : RC.crema,
                    }}
                  >
                    {s}
                  </span>
                  {vacia ? <Vacio /> : <Check en={0} />}
                </div>
              );
            })}
          </Tarjeta>
        </div>
      </Zona>
    </Noche>
  );
};

// ── S3 · Cómo funciona ───────────────────────────────────────────────────

const TERCIOS: Pelea[] = [
  { tercio: "Tercio 1", nombre: "Menor nivel", rango: "Practicás enseñando", franja: "MAR 19:00", estado: "pendiente" },
  { tercio: "Tercio 2", nombre: "Tu nivel", rango: "Practicás compitiendo", franja: "JUE 20:30", estado: "pendiente" },
  { tercio: "Tercio 3", nombre: "Mayor nivel", rango: "Practicás aprendiendo", franja: "SÁB 11:00", estado: "pendiente" },
];

export const S3Solucion: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s3-solucion";
  const clips = escena(ID).clips;

  const corteA = clips[1].enEscena - 4; // arranca "Uno con alguien..."
  const corteB = clips[2].enEscena - 4; // arranca "Vos peleás afuera..."

  const cursores = [
    { desde: cuadro(ID, "uno", 1), hasta: cuadro(ID, "uno", 2) },
    { desde: cuadro(ID, "uno", 2), hasta: cuadro(ID, "uno", 3) },
    { desde: cuadro(ID, "uno", 3), hasta: corteB },
  ];

  return (
    <Noche>
      <MarcaChica />

      <Plano desde={0} hasta={corteA}>
        <Zona>
          <Rotulo delay={0}>Cómo funciona</Rotulo>
          <div
            style={{
              marginTop: 20,
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 66,
              lineHeight: 1.15,
              textTransform: "uppercase",
              color: RC.crema,
              opacity: aparece(frame, 8, 12),
              translate: sube(frame, 8, 20, 13),
            }}
          >
            Te arma tres roleplays por semana.
          </div>
        </Zona>
      </Plano>

      <Plano desde={corteA} hasta={corteB}>
        <Zona>
          <FightCard peleas={TERCIOS} semana="TU SEMANA" delay={corteA + 2} cursores={cursores} />
        </Zona>
      </Plano>

      <Plano desde={corteB}>
        <Zona>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 60,
                textTransform: "uppercase",
                color: RC.crema,
                opacity: aparece(frame, corteB + 2, 10),
                translate: sube(frame, corteB + 2, 18, 12),
              }}
            >
              Peleás afuera.
            </div>
            <div style={{ marginTop: 34, opacity: aparece(frame, cuadro(ID, "Zoom") - 4, 10) }}>
              <div
                style={{
                  display: "inline-block",
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: "0.14em",
                  color: RC.platino300,
                  border: `1px solid ${RC.platino500}`,
                  borderRadius: 999,
                  padding: "16px 36px",
                }}
              >
                ZOOM · MEET
              </div>
            </div>
          </div>
        </Zona>
      </Plano>
    </Noche>
  );
};

const RANGOS_PREVIEW = ["aficionado", "prospecto", "contendiente", "campeon", "leyenda"] as const;

// ── S4 · Rango y cinturones ──────────────────────────────────────────────

export const S4Rango: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s4-rango";
  const clips = escena(ID).clips;
  const panelDesde = clips[1].enEscena - 4; // arranca "De Aficionado a Leyenda..."

  return (
    <Noche>
      <MarcaChica />

      <Plano desde={0} hasta={panelDesde}>
        <Zona>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 66,
                lineHeight: 1.15,
                textTransform: "uppercase",
                color: RC.crema,
                opacity: aparece(frame, 4, 10),
                translate: sube(frame, 4, 20, 12),
              }}
            >
              Cumplís, sumás puntos.
            </div>
            <div
              style={{
                marginTop: 24,
                fontFamily: SANS,
                fontSize: 38,
                color: RC.esmeralda500,
                opacity: aparece(frame, cuadro(ID, "rango") - 4, 10),
              }}
            >
              Y subís de rango.
            </div>
          </div>

          <div
            style={{
              marginTop: 52,
              display: "flex",
              justifyContent: "center",
              gap: 22,
              opacity: aparece(frame, cuadro(ID, "rango") + 10, 12),
              translate: sube(frame, cuadro(ID, "rango") + 10, 18, 12),
            }}
          >
            {RANGOS_PREVIEW.map((r, i) => (
              <div key={r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Img
                  src={staticFile(`ring-closers/belts/${r}.webp`)}
                  style={{ width: 62, height: 42, objectFit: "contain", opacity: i === 0 ? 1 : 0.35 }}
                />
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === 0 ? RC.esmeralda500 : RC.tinta700,
                  }}
                />
              </div>
            ))}
          </div>
        </Zona>
      </Plano>

      <Plano desde={panelDesde}>
        <Zona>
          <PanelRango
            desde={85}
            hasta={115}
            cuentaEn={panelDesde + 4}
            duracionCuenta={24}
            umbral={100}
            rangoAntes="Aficionado"
            rangoDespues="Prospecto"
            cinturonAntes="ring-closers/belts/aficionado.webp"
            cinturonDespues="ring-closers/belts/prospecto.webp"
            delay={panelDesde + 2}
          />
          <div
            style={{
              marginTop: 26,
              textAlign: "center",
              fontFamily: SANS,
              fontSize: 34,
              color: RC.platino300,
              opacity: aparece(frame, cuadro(ID, "Leyenda") - 4, 10),
            }}
          >
            Hasta <span style={{ color: RC.crema, fontWeight: 700 }}>Leyenda</span>, con cinturón digital en cada nivel.
          </div>
        </Zona>
      </Plano>
    </Noche>
  );
};

// ── S5 · Ranking, currículum y ofertas ───────────────────────────────────

export const S5Ofertas: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s5-ofertas";
  const clips = escena(ID).clips;

  const corteA = clips[1].enEscena - 4; // arranca "Podés cargar tu currículum..."
  const corteB = clips[2].enEscena - 4; // arranca "Y hay ofertas de trabajo..."
  const corteC = clips[3].enEscena - 4; // arranca "Las ves, te postulás..."

  const FILAS = [
    { nombre: "Tu boxeador", pts: "340" },
    { nombre: "Otro closer", pts: "295" },
    { nombre: "Otro closer", pts: "260" },
  ];

  return (
    <Noche>
      <MarcaChica />

      {/* A · Ranking público, lo miran los directores */}
      <Plano desde={0} hasta={corteA}>
        <Zona>
          <Tarjeta>
            <Cabezal izq="Ranking" der="Público" />
            <div style={{ padding: "10px 0" }}>
              {FILAS.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                    padding: "20px 32px",
                    borderBottom: i < FILAS.length - 1 ? `1px solid ${RC.tinta700}` : "none",
                    opacity: aparece(frame, 4 + i * 6, 8),
                  }}
                >
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: RC.platino500, width: 40 }}>
                    #{i + 1}
                  </span>
                  <span style={{ flex: 1, fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, textTransform: "uppercase", color: RC.crema }}>
                    {f.nombre}
                  </span>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: RC.platino300 }}>{f.pts} pts</span>
                </div>
              ))}
            </div>
          </Tarjeta>
          <div style={{ marginTop: 28, textAlign: "center", opacity: aparece(frame, cuadro(ID, "directores") - 4, 8) }}>
            <Pildora delay={cuadro(ID, "directores") - 4}>LOS DIRECTORES LO MIRAN</Pildora>
          </div>
        </Zona>
      </Plano>

      {/* B · Currículum: empresas, tasa de cierre, cash collect */}
      <Plano desde={corteA} hasta={corteB}>
        <Zona>
          <Tarjeta>
            <Cabezal izq="Currículum" />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { empresa: "Empresa A", tasa: "28% cierre", cash: "$12.000" },
                { empresa: "Empresa B", tasa: "34% cierre", cash: "$18.500" },
              ].map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: "26px 32px",
                    borderBottom: i === 0 ? `1px solid ${RC.tinta700}` : "none",
                    opacity: aparece(frame, corteA + 6 + i * 10, 9),
                  }}
                >
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, textTransform: "uppercase", color: RC.crema }}>
                    {e.empresa}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 20 }}>
                    <span style={{ fontFamily: MONO, fontSize: 26, color: RC.platino300 }}>{e.tasa}</span>
                    <span style={{ fontFamily: MONO, fontSize: 26, color: RC.esmeralda500 }}>{e.cash}</span>
                  </div>
                </div>
              ))}
            </div>
          </Tarjeta>
        </Zona>
      </Plano>

      {/* C · Ofertas de trabajo, publicadas ahí mismo */}
      <Plano desde={corteB} hasta={corteC}>
        <Zona>
          <Tarjeta>
            <Cabezal izq="Ofertas de trabajo" />
            <div style={{ padding: "30px 32px", opacity: aparece(frame, corteB + 6, 9) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, textTransform: "uppercase", color: RC.crema }}>
                    Closer B2B remoto
                  </div>
                  <div style={{ marginTop: 6, fontFamily: SANS, fontSize: 26, color: RC.platino500 }}>Empresa C</div>
                </div>
                <Pildora delay={corteB + 10} punto>ABIERTA</Pildora>
              </div>
            </div>
          </Tarjeta>
        </Zona>
      </Plano>

      {/* D · Te postulás, te contactan directo */}
      <Plano desde={corteC}>
        <Zona>
          <Tarjeta>
            <Cabezal izq="Ofertas de trabajo" />
            <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "30px 32px" }}>
              <Check en={corteC + 4} />
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, textTransform: "uppercase", color: RC.crema }}>
                  Postulación enviada
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: SANS,
                    fontSize: 26,
                    color: RC.platino500,
                    opacity: aparece(frame, cuadro(ID, "contacta") - 4, 8),
                  }}
                >
                  El director te contacta directo.
                </div>
              </div>
            </div>
          </Tarjeta>
        </Zona>
      </Plano>
    </Noche>
  );
};

// ── S6 · Cierre ──────────────────────────────────────────────────────────

export const S6Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s6-cierre";
  const desdeLugar = cuadro(ID, "Todo");
  const ring = cuadro(ID, "ring", 2);

  return (
    <Noche>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 260 }}>
        <div style={{ opacity: aparece(frame, 0, 8), translate: sube(frame, 0, 20, 12) }}>
          <Logo size={128} />
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 118,
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
            fontSize: 40,
            color: RC.platino300,
            opacity: aparece(frame, desdeLugar - 2, 8),
          }}
        >
          Todo en un solo lugar.
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
      </div>
    </Noche>
  );
};
