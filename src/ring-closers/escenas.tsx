import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  Apoyo,
  Cartel,
  Cuerdas,
  Esquina,
  FightCard,
  Marco,
  Noche,
  PanelRango,
  Rotulo,
  aparece,
  sube,
  type Pelea,
} from "./piezas";
import { Calendario, ListaChats, MensajeSinRespuesta } from "./problema";
import { cuadro } from "./timeline";
import { DISPLAY, MARGEN, MONO, RC } from "./tema";

/**
 * Escenas del comercial de Ring Closers.
 *
 * Toda sincronía sale de `cuadro(escena, palabra)`: la imagen cae sobre la
 * palabra que la nombra, medida sobre la toma real de voz.
 *
 * Los números son posibles en el producto: un Prospecto con 295 pts cruza a
 * Contendiente (300, `lib/ranks.ts`) con 5★ + 4★ + 3★, que el cron puntúa
 * +20 +15 +10 = +45. Mateo R. y Bruno S. son los nombres de la landing.
 */

export const TOTAL_ROUNDS = 5;
const SEMANA = "SEMANA 37";
const CINTURON_ANTES = "ring-closers/belts/prospecto.webp";
const CINTURON_DESPUES = "ring-closers/belts/contendiente.webp";

const RIVALES = {
  debajo: { tercio: "Por debajo", nombre: "Mateo R.", rango: "Aficionado", franja: "MAR 19:00" },
  nivel: { tercio: "Tu nivel", nombre: "Lucía F.", rango: "Prospecto", franja: "JUE 20:30" },
  encima: { tercio: "Por encima", nombre: "Bruno S.", rango: "Contendiente", franja: "SÁB 11:00" },
};

/** Transición a negro. Solo se usa donde el brief pide silencio. */
const Apagon: React.FC<{ desde: number; dur?: number }> = ({ desde, dur = 6 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: RC.tinta950,
        opacity: interpolate(frame, [desde, desde + dur], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

// ── Round 1 · El gancho ─────────────────────────────────────────────────

/**
 * Dos planos. Primero el cinturón solo, encendiéndose bajo el reflector,
 * mientras la voz dice "la pelea que evitás". El corte a la fight card cae
 * en la pausa, antes de "es la que te falta" — la tachadura llega con
 * "falta".
 */
export const R1Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "r1-gancho";
  const corte = cuadro(ID, "la", 2) - 14;
  const enCard = frame >= corte;

  const peleas: Pelea[] = [
    { ...RIVALES.debajo, estado: "cumplida", marcaEn: corte + 16 },
    { ...RIVALES.nivel, estado: "cumplida", marcaEn: corte + 22 },
    { ...RIVALES.encima, estado: "evitada", marcaEn: Math.max(cuadro(ID, "falta") + 6, corte + 30) },
  ];

  if (!enCard) {
    const luz = interpolate(frame, [2, 46], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <Noche foco={luz}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Img
            src={staticFile(CINTURON_DESPUES)}
            style={{
              width: 640,
              filter: `brightness(${interpolate(luz, [0, 1], [0.04, 1])})`,
              scale: String(interpolate(frame, [0, corte], [1.06, 1])),
            }}
          />
        </AbsoluteFill>
      </Noche>
    );
  }

  return (
    <Noche>
      <Esquina round={1} total={TOTAL_ROUNDS} visible={aparece(frame, corte, 10)} />
      <Marco>
        <div style={{ marginBottom: 34 }}>
          <Rotulo delay={corte + 2}>3 peleas, cada semana</Rotulo>
        </div>
        <div style={{ marginBottom: 64 }}>
          <Cartel
            arriba="La pelea que evitás"
            abajo="es la que te falta"
            delay={corte + 2}
            delayAbajo={Math.max(cuadro(ID, "la", 2), corte + 8)}
            size={98}
          />
        </div>
        <FightCard peleas={peleas} semana={SEMANA} delay={corte + 6} apagadaDesde={0} />
      </Marco>
    </Noche>
  );
};

// ── Round 2 · A quién le escribís ───────────────────────────────────────

export const R2Comodidad: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "r2-comodidad";
  return (
    <Noche>
      <Esquina round={2} total={TOTAL_ROUNDS} visible={aparece(frame, 0, 8)} />
      <Marco>
        <div style={{ marginBottom: 34 }}>
          <Rotulo delay={2} acento={false}>
            Cómo elegís con quién practicar
          </Rotulo>
        </div>
        <div style={{ marginBottom: 56 }}>
          <Cartel
            arriba="Elegís por comodidad"
            abajo="no por nivel"
            delay={cuadro(ID, "elegis")}
            delayAbajo={cuadro(ID, "no")}
            colorAbajo={RC.platino500}
            size={96}
          />
        </div>
        <ListaChats
          delay={cuadro(ID, "le") - 6}
          comodoEn={cuadro(ID, "rapido")}
          olvidadoEn={cuadro(ID, "nunca")}
          chats={[
            { nombre: "Lucía F.", rango: "Prospecto", ultimo: "Dale, el jueves repetimos", cuando: "ahora", comodo: true },
            { nombre: "Mateo R.", rango: "Aficionado", ultimo: "Gracias por la de ayer", cuando: "2 d" },
            { nombre: "Bruno S.", rango: "Contendiente", ultimo: "Sin mensajes", cuando: "—", olvidado: true },
          ]}
        />
      </Marco>
    </Noche>
  );
};

// ── Round 2 · Cómo se corta sola ────────────────────────────────────────

/**
 * Cierra con un apagón a negro sobre "sin avisar": es la pausa que pide el
 * brief, y la música corta en el mismo cuadro. El silencio es el golpe.
 */
export const R2Tercera: React.FC = () => {
  const ID = "r2-tercera";
  return (
    <Noche>
      <Esquina round={2} total={TOTAL_ROUNDS} />
      <Marco>
        <div style={{ marginBottom: 34 }}>
          <Rotulo delay={2} acento={false}>
            Cuando lo coordinás a mano
          </Rotulo>
        </div>
        <div style={{ marginBottom: 50 }}>
          <Cartel
            arriba="A la tercera semana"
            abajo="nadie arma nada"
            delay={cuadro(ID, "tercera") - 4}
            delayAbajo={cuadro(ID, "nadie")}
            colorAbajo={RC.platino500}
            size={96}
          />
        </div>
        <div style={{ marginBottom: 44 }}>
          <Calendario
            delay={8}
            semanas={[
              { etiqueta: "Sem 1", dias: [1, 3, 5], entra: cuadro(ID, "primera") },
              { etiqueta: "Sem 2", dias: [2], entra: cuadro(ID, "primera") + 24 },
              { etiqueta: "Sem 3", dias: [], entra: cuadro(ID, "tercera") },
            ]}
          />
        </div>
        <MensajeSinRespuesta
          texto="¿Quién arma los roleplays esta semana?"
          hora="LUN 09:14"
          delay={cuadro(ID, "nadie") + 4}
          vistoEn={cuadro(ID, "corta")}
        />
      </Marco>
      <Apagon desde={cuadro(ID, "avisar") + 14} />
    </Noche>
  );
};

// ── Round 3 · La solución, demostrada ───────────────────────────────────

/**
 * Una sola toma que evoluciona: la fight card se arma, un filete esmeralda
 * baja por las filas mientras la voz nombra cada tercio, se encienden las
 * franjas con "disponibilidad", se marcan los checks con "cumplís" y el
 * cinturón cambia con "subís de rango".
 *
 * El esmeralda nunca está en dos lugares a la vez: primero es el filete,
 * después los checks, después el rango.
 */
export const R3Solucion: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "r3-solucion";

  const checks = cuadro(ID, "cumplis", 1);
  const subida = cuadro(ID, "subis");
  const rango = cuadro(ID, "rango");

  const peleas: Pelea[] = [
    { ...RIVALES.debajo, estado: "cumplida", marcaEn: checks, estrellas: 5 },
    { ...RIVALES.nivel, estado: "cumplida", marcaEn: checks + 7, estrellas: 4 },
    { ...RIVALES.encima, estado: "cumplida", marcaEn: checks + 14, estrellas: 3 },
  ];

  const uno1 = cuadro(ID, "uno", 1);
  const uno2 = cuadro(ID, "uno", 2);
  const cruzando = cuadro(ID, "cruzando");

  // El aviso de "afuera" ocupa el lugar donde después aparece el panel
  const afueraOp = aparece(frame, cuadro(ID, "afuera") - 4, 10) * (1 - aparece(frame, subida - 6, 8));

  return (
    <Noche>
      <Esquina round={3} total={TOTAL_ROUNDS} />
      <Marco top={250}>
        <div style={{ marginBottom: 30 }}>
          <Rotulo delay={4}>Con Ring Closers</Rotulo>
        </div>
        <div style={{ marginBottom: 36 }}>
          <Cartel arriba="Tus 3 peleas de la semana" delay={cuadro(ID, "arma") - 4} size={76} />
        </div>

        <FightCard
          peleas={peleas}
          semana={SEMANA}
          delay={cuadro(ID, "tres") - 8}
          apagadaDesde={subida}
          franjasDesde={cuadro(ID, "disponibilidad")}
          cursores={[
            { desde: cuadro(ID, "rival"), hasta: uno1 },
            { desde: uno1, hasta: uno2 },
            { desde: uno2, hasta: cruzando },
          ]}
        />

        <div style={{ position: "relative", height: 272, marginTop: 30 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              border: `1px dashed ${RC.tinta700}`,
              borderRadius: 24,
              opacity: afueraOp,
              translate: sube(frame, cuadro(ID, "afuera") - 4, 14, 12),
            }}
          >
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 48,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: RC.crema,
              }}
            >
              La pelea es afuera
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: MONO,
                fontWeight: 500,
                fontSize: 30,
                letterSpacing: "0.12em",
                color: RC.platino300,
                opacity: aparece(frame, cuadro(ID, "zoom") - 2, 8),
              }}
            >
              ZOOM · MEET · WHATSAPP
            </div>
          </div>

          <div style={{ position: "absolute", inset: 0 }}>
            <PanelRango
              desde={295}
              hasta={340}
              cuentaEn={rango - 10}
              duracionCuenta={34}
              umbral={300}
              rangoAntes="Prospecto"
              rangoDespues="Contendiente"
              cinturonAntes={CINTURON_ANTES}
              cinturonDespues={CINTURON_DESPUES}
              delay={subida - 4}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: "0.08em",
            color: RC.platino500,
            opacity: aparece(frame, cuadro(ID, "no"), 10),
            translate: sube(frame, cuadro(ID, "no"), 10, 10),
          }}
        >
          SI NO CUMPLÍS LAS 3 · −15 PTS
        </div>
      </Marco>
    </Noche>
  );
};

// ── Round 4 · Honestidad ────────────────────────────────────────────────

/**
 * El round quieto. El cinturón no se mueve más que un respiro, y cuando
 * llega "hoy lo usan closers reales" las líneas anteriores bajan a platino
 * para que esa sea la única cosa encendida del cuadro.
 */
export const R4Honestidad: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "r4-honestidad";
  const hoy = cuadro(ID, "hoy");
  const atenua = interpolate(frame, [hoy - 4, hoy + 8], [1, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Noche>
      <Esquina round={4} total={TOTAL_ROUNDS} visible={aparece(frame, 0, 10)} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
        <Img
          src={staticFile(CINTURON_DESPUES)}
          style={{
            width: 460,
            opacity: aparece(frame, 2, 20) * interpolate(atenua, [0.42, 1], [0.55, 1]),
            scale: String(interpolate(frame, [0, 330], [1, 1.04])),
          }}
        />
      </AbsoluteFill>

      <Marco top={730}>
        <div style={{ opacity: atenua }}>
          <Cartel
            arriba="No lo armó un equipo"
            abajo="de producto."
            delay={cuadro(ID, "esto")}
            delayAbajo={cuadro(ID, "equipo")}
            acento={false}
            size={88}
          />
          <div style={{ marginTop: 30 }}>
            <Cartel arriba="Lo armó un closer." delay={cuadro(ID, "lo", 2)} size={88} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Apoyo delay={cuadro(ID, "para")} size={38}>
              Para su propio grupo de práctica.
            </Apoyo>
          </div>
        </div>

        <div style={{ marginTop: 64 }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 76,
              lineHeight: 1.04,
              textTransform: "uppercase",
              color: RC.esmeralda500,
              opacity: aparece(frame, hoy, 12),
              translate: sube(frame, hoy, 22, 16),
            }}
          >
            Hoy lo usan closers reales.
          </div>
        </div>
      </Marco>
    </Noche>
  );
};

// ── Round 5 · Cierre ────────────────────────────────────────────────────

export const R5Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "r5-cierre";

  const condiciones = [
    { txt: "GRATIS", en: cuadro(ID, "gratis") },
    { txt: "SIN TARJETA", en: cuadro(ID, "tarjeta") - 8 },
    { txt: "SIN VUELTAS", en: cuadro(ID, "vueltas") - 8 },
  ];

  return (
    <Noche>
      {/* El cierre queda adentro del ring: tres cuerdas arriba y tres abajo */}
      <Cuerdas top={540} delay={2} />
      <Cuerdas top={1310} delay={10} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: MARGEN,
          paddingRight: MARGEN,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 128,
            lineHeight: 1,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            textAlign: "center",
            color: RC.esmeralda500,
            opacity: aparece(frame, cuadro(ID, "ring", 1) - 4, 12),
            translate: sube(frame, cuadro(ID, "ring", 1) - 4, 26, 18),
          }}
        >
          RING CLOSERS
        </div>

        <div style={{ display: "flex", gap: 22, marginTop: 40, alignItems: "center" }}>
          {condiciones.map((c, k) => (
            <div key={c.txt} style={{ display: "flex", alignItems: "center", gap: 22 }}>
              {k > 0 ? (
                <span style={{ color: RC.tinta700, fontFamily: MONO, fontSize: 30, opacity: aparece(frame, c.en, 8) }}>·</span>
              ) : null}
              <span
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: "0.1em",
                  color: RC.platino300,
                  opacity: aparece(frame, c.en, 8),
                }}
              >
                {c.txt}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 90,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 78,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: RC.crema,
            opacity: aparece(frame, cuadro(ID, "subite") - 2, 12),
            translate: sube(frame, cuadro(ID, "subite") - 2, 20, 15),
          }}
        >
          Subite al ring
        </div>

        <div
          style={{
            marginTop: 34,
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 32,
            letterSpacing: "0.02em",
            color: RC.platino300,
            border: `1px solid ${RC.tinta700}`,
            borderRadius: 999,
            padding: "18px 38px",
            opacity: aparece(frame, cuadro(ID, "subite") + 10, 12),
          }}
        >
          ringclosers.quantumcoffee.xyz
        </div>
      </AbsoluteFill>
    </Noche>
  );
};
