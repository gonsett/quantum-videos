import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FightCard, aparece, type Pelea } from "../ring-closers/piezas";
import { DISPLAY, EASE, MARGEN, RC } from "../ring-closers/tema";
import { Metal, Tarima } from "../secreto-rc/efectos";
import { Bloque, Linea } from "../secreto-rc/escenas";
import {
  Objeto,
  PanelPuntos,
  Ronda,
  TarjetaEvaluacion,
  TarjetaOferta,
  TarjetaPropuesta,
  TarjetaRanking,
  TarjetaSemanas,
} from "./piezas";
import { DUR, L, VOZ } from "./timeline";

/**
 * "Qué es Ring Closers": qué es, qué problema resuelve y por qué usarlo.
 *
 * Cada escena recibe cuadros LOCALES a ella y los pide por palabra con `L`,
 * nunca con números fijos: si se regenera una toma, la imagen se reacomoda.
 * Lo que va antes de `VOZ(escena)` es la carátula de un round (título escrito).
 */

const ease = Easing.bezier(...EASE);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Cinturón héroe con su tarima. Mismo movimiento que en los Secretos. */
export const Cinturon: React.FC<{
  entra: number;
  barrido: number;
  apagado?: number;
  golpe?: number;
  brillo?: number;
  sale?: number;
}> = ({ entra, barrido, apagado = 0, golpe = 0, brillo = 0, sale = 0 }) => {
  const frame = useCurrentFrame();
  const ANCHO = 780;
  const CENTRO_Y = 1180;
  const flota = Math.sin(frame / 24) * 9;
  const giro = Math.sin(frame / 38) * 7;
  const cabeceo = 3 + Math.cos(frame / 45) * 1.5;
  const empuje = 1 + frame * 0.00022;
  const visible = entra * (1 - sale);
  return (
    <>
      <Tarima y={CENTRO_Y} ancho={ANCHO} entra={visible * (1 - 0.85 * apagado) * (1 + 0.25 * brillo)} />
      <div
        style={{
          position: "absolute",
          left: 540 - ANCHO / 2,
          top: CENTRO_Y - ANCHO / 2 + flota + (1 - entra) * 110,
          opacity: visible * (1 - 0.74 * apagado),
          filter: `blur(${(1 - entra) * 14 + apagado * 5 + sale * 6}px)`,
          transform: `perspective(1500px) rotateY(${giro}deg) rotateX(${cabeceo}deg) scale(${
            empuje * (0.9 + 0.1 * entra) * (1 + 0.045 * golpe)
          })`,
        }}
      >
        <Metal src="secreto-rc/leyenda-hero.png" ancho={ANCHO} barrido={barrido} />
      </div>
    </>
  );
};

// ── Round 1 · ¿Qué es Ring Closers? ──────────────────────────────────────

export const E1QueEs: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e1-que-es";
  const dur = DUR(ID);
  const eQue = L(ID, "Qué") - 4;
  const eRing = L(ID, "Ring") - 4;
  // Las palabras cortas ("Un", "y", "te", "tu", "al") son las menos fiables del reconocedor: los cortes de bloque se anclan en la palabra fuerte que les sigue
  const eUn = L(ID, "ring", 2) - 9;
  const eRing2 = L(ID, "ring", 2);
  const eSe = L(ID, "se") - 4;
  const eEntre = L(ID, "entre") - 4;
  const eEntrenan = L(ID, "entrenan");

  // El cinturón entra con "un ring" y brilla cuando la voz dice "se entrenan"
  const entra = interpolate(frame, [eRing2 + 2, eRing2 + 36], [0, 1], { ...clamp, easing: ease });
  const barrido = interpolate(frame, [eEntrenan - 4, eEntrenan + 40], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const sale = interpolate(frame, [dur - 14, dur], [0, 1], clamp);

  return (
    <>
      <Ronda n={1} />
      <Bloque desde={0} dur={eUn - 2}>
        <Linea en={eQue} size={54}>
          ¿Qué es
        </Linea>
        <Linea en={eRing} size={108} peso={700} color={RC.esmeralda400} brillo>
          Ring Closers?
        </Linea>
      </Bloque>
      <Bloque desde={eUn} dur={dur - eUn}>
        <Linea en={0} size={46}>
          Un ring donde los closers
        </Linea>
        <Linea en={eSe - eUn} size={84} peso={700} color={RC.crema}>
          se entrenan
        </Linea>
        <Linea en={eEntre - eUn} size={84} peso={700} color={RC.crema}>
          entre sí.
        </Linea>
      </Bloque>
      <Cinturon entra={entra} barrido={barrido} sale={sale} />
    </>
  );
};

// ── Round 2 · ¿Qué problema resuelve? ────────────────────────────────────

export const E2Problema: React.FC = () => {
  const ID = "e2-problema";
  const dur = DUR(ID);
  const voz = VOZ(ID);
  const ePracticar = L(ID, "Practicar") - 4;
  const eY = L(ID, "organizarlo") - 10;
  const eTe = L(ID, "te") - 4;
  const eNadie = L(ID, "nadie") - 4;

  return (
    <>
      <Ronda n={2} />
      {/* Carátula del round: título escrito, sin voz */}
      <Bloque desde={0} dur={voz - 6} top={660}>
        <Linea en={4} size={84} peso={700} color={RC.crema}>
          ¿Qué problema
        </Linea>
        <Linea en={10} size={112} peso={700} color={RC.crema}>
          resuelve?
        </Linea>
      </Bloque>

      <Bloque desde={ePracticar} dur={eY - 2 - ePracticar}>
        <Linea en={0} size={46}>
          Practicar siempre con los mismos dos
        </Linea>
        <Linea en={eTe - ePracticar} size={84} peso={700} color={RC.crema}>
          te frena,
        </Linea>
      </Bloque>
      <Bloque desde={eY} dur={dur - eY}>
        <Linea en={0} size={46}>
          y organizarlo a mano,
        </Linea>
        <Linea en={eNadie - eY} size={84} peso={700} color={RC.platino300}>
          nadie lo sostiene.
        </Linea>
      </Bloque>

      <Objeto top={900} en={L(ID, "los") - 8} sale={dur - 14}>
        <TarjetaSemanas chipsEn={L(ID, "mismos") - 2} vaciaEn={[L(ID, "nadie"), L(ID, "sostiene")]} />
      </Objeto>
    </>
  );
};

const PELEAS: Pelea[] = [
  { tercio: "Tercio 1", nombre: "Por debajo", rango: "Practicás enseñando", franja: "MAR 19:00", estado: "pendiente" },
  { tercio: "Tercio 2", nombre: "Tu nivel", rango: "Practicás compitiendo", franja: "JUE 20:30", estado: "pendiente" },
  { tercio: "Tercio 3", nombre: "Por encima", rango: "Practicás aprendiendo", franja: "SÁB 11:00", estado: "pendiente" },
];

export const E3Solucion: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e3-solucion";
  const dur = DUR(ID);
  const eRing = L(ID, "Ring") - 4;
  const eTres = L(ID, "tres") - 4;
  const ePor = L(ID, "por", 1) - 4;
  const sale = interpolate(frame, [dur - 14, dur], [0, 1], clamp);

  const cursores = [
    { desde: L(ID, "uno", 1), hasta: L(ID, "uno", 2) },
    { desde: L(ID, "uno", 2), hasta: L(ID, "uno", 3) },
    { desde: L(ID, "uno", 3), hasta: dur - 14 },
  ];

  return (
    <>
      <Ronda n={2} instantanea />
      <Bloque desde={0} dur={dur}>
        <Linea en={eRing} size={46}>
          Ring Closers te arma
        </Linea>
        <Linea en={eTres} size={84} peso={700} color={RC.esmeralda400} brillo>
          tres roleplays
        </Linea>
        <Linea en={ePor} size={84} peso={700} color={RC.crema}>
          por semana.
        </Linea>
      </Bloque>
      <div
        style={{
          position: "absolute",
          // La fight card mide ~715 px: a esta altura y con este escalado termina
          // en y≈1470, por encima del @handle (1545)
          top: 800,
          left: MARGEN,
          right: MARGEN,
          transform: "scale(0.94)",
          transformOrigin: "top center",
          opacity: 1 - sale,
          filter: sale > 0 ? `blur(${sale * 8}px)` : undefined,
        }}
      >
        <FightCard peleas={PELEAS} semana="TU SEMANA" delay={L(ID, "semana") - 6} cursores={cursores} />
      </div>
    </>
  );
};

// ── Round 3 · ¿Por qué usarlo? ───────────────────────────────────────────

export const E4Juego: React.FC = () => {
  const ID = "e4-juego";
  const dur = DUR(ID);
  const voz = VOZ(ID);
  const ePorque = L(ID, "Porque") - 4;
  const eCumplis = L(ID, "cumplís") - 4;
  const eSubis = L(ID, "subís") - 4;
  const eTe = L(ID, "falta") - 10;
  const ePerdes = L(ID, "perdés") - 4;

  return (
    <>
      <Ronda n={3} />
      <Bloque desde={0} dur={voz - 6} top={660}>
        <Linea en={4} size={84} peso={700} color={RC.crema}>
          ¿Por qué
        </Linea>
        <Linea en={10} size={112} peso={700} color={RC.esmeralda400} brillo>
          usarlo?
        </Linea>
      </Bloque>

      <Bloque desde={ePorque} dur={eTe - 2 - ePorque}>
        <Linea en={0} size={46}>
          Porque hay algo en juego:
        </Linea>
        <Linea en={eCumplis - ePorque} size={84} peso={700} color={RC.crema}>
          cumplís,
        </Linea>
        <Linea en={eSubis - ePorque} size={84} peso={700} color={RC.esmeralda400} brillo>
          subís de rango.
        </Linea>
      </Bloque>
      <Bloque desde={eTe} dur={dur - eTe}>
        <Linea en={0} size={46}>
          Te falta una:
        </Linea>
        <Linea en={ePerdes - eTe} size={84} peso={700} color={RC.platino300}>
          perdés puntos.
        </Linea>
      </Bloque>

      <Objeto top={900} en={ePorque + 10} sale={dur - 14}>
        <PanelPuntos
          base={285}
          tope={315}
          piso={300}
          umbral={300}
          suma={{ en: eSubis + 2, dur: 40 }}
          resta={{ en: ePerdes + 6, dur: 22 }}
        />
      </Objeto>
    </>
  );
};

export const E5Evaluan: React.FC = () => {
  const ID = "e5-evaluan";
  const dur = DUR(ID);
  const ePorque = L(ID, "Porque") - 4;
  const eTu = L(ID, "nivel") - 10;
  const eEs = L(ID, "real") - 12;

  return (
    <>
      <Ronda n={3} instantanea />
      <Bloque desde={0} dur={dur}>
        <Linea en={ePorque} size={46}>
          Porque otros closers te evalúan:
        </Linea>
        <Linea en={eTu} size={84} peso={700} color={RC.crema}>
          tu nivel
        </Linea>
        <Linea en={eEs} size={84} peso={700} color={RC.esmeralda400} brillo>
          es real.
        </Linea>
      </Bloque>
      <Objeto top={900} en={L(ID, "otros") - 4} sale={dur - 14}>
        <TarjetaEvaluacion estrellasEn={L(ID, "evalúan")} verificadoEn={L(ID, "real") - 2} />
      </Objeto>
    </>
  );
};

export const E6Ven: React.FC = () => {
  const ID = "e6-ven";
  const dur = DUR(ID);
  const ePorque = L(ID, "Porque") - 4;
  const eDirectores = L(ID, "directores") - 4;
  const eBuscan = L(ID, "buscan") - 4;
  const eY = L(ID, "podés") - 10;
  const ePostularte = L(ID, "postularte") - 4;

  return (
    <>
      <Ronda n={3} instantanea />
      <Bloque desde={ePorque} dur={eY - 2 - ePorque}>
        <Linea en={0} size={46}>
          Porque arriba te ven:
        </Linea>
        <Linea en={eDirectores - ePorque} size={62} peso={700} color={RC.crema}>
          directores comerciales
        </Linea>
        <Linea en={eBuscan - ePorque} size={84} peso={700} color={RC.esmeralda400} brillo>
          buscan closers,
        </Linea>
      </Bloque>
      <Bloque desde={eY} dur={dur - eY}>
        <Linea en={0} size={46}>
          y podés
        </Linea>
        <Linea en={ePostularte - eY} size={84} peso={700} color={RC.esmeralda400} brillo>
          postularte a ofertas.
        </Linea>
      </Bloque>

      <Objeto top={800} en={L(ID, "arriba") - 4} sale={eY - 2}>
        <TarjetaRanking en={0} />
      </Objeto>
      <Objeto top={1220} en={L(ID, "buscan") - 6} sale={eY - 2}>
        <TarjetaPropuesta en={L(ID, "buscan") - 6} />
      </Objeto>
      <Objeto top={900} en={eY + 6} sale={dur - 14}>
        <TarjetaOferta enviadaEn={L(ID, "ofertas")} />
      </Objeto>
    </>
  );
};

// ── Cierre ───────────────────────────────────────────────────────────────

export const E7Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e7-cierre";
  const dur = DUR(ID);
  const eLo = L(ID, "armó") - 8;
  const eSubite = L(ID, "Subite") - 4;
  const eAl = L(ID, "ring") - 9;
  // El golpe de sonido llega 0,1 s antes que la palabra: la imagen cae en el mismo cuadro
  const eGolpe = L(ID, "Subite") - 3;

  const entra = interpolate(frame, [6, 40], [0, 1], { ...clamp, easing: ease });
  const enciende = interpolate(frame, [eGolpe, eGolpe + 24], [0, 1], { ...clamp, easing: ease });
  const apagado = frame < eGolpe ? 0.55 : 0.55 * (1 - enciende);
  const barrido = interpolate(frame, [eGolpe + 7, eGolpe + 51], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const brillo = interpolate(frame, [eGolpe, eGolpe + 32, dur], [0, 1, 0.55], clamp);

  const desdeGolpe = frame - eGolpe;
  const golpe = desdeGolpe >= 0 ? Math.exp(-desdeGolpe / 6) : 0;
  const sacudida = golpe * 7 * Math.sin(desdeGolpe * 2.4);
  const destello = interpolate(frame, [eGolpe - 1, eGolpe + 1, eGolpe + 18], [0, 1, 0], clamp);

  return (
    <>
      <div style={{ position: "absolute", inset: 0, translate: `${sacudida}px ${-Math.abs(sacudida) * 0.6}px` }}>
        <Bloque desde={0} dur={dur} salida={false}>
          <Linea en={eLo} size={46} color={RC.crema}>
            Lo armó un closer.
          </Linea>
          <Linea en={eSubite} size={112} peso={700} color={RC.esmeralda400} brillo>
            Subite
          </Linea>
          <Linea en={eAl} size={112} peso={700} color={RC.esmeralda400} brillo>
            al ring.
          </Linea>
        </Bloque>
        <Cinturon entra={entra} barrido={barrido} apagado={apagado} golpe={golpe} brillo={brillo} />
      </div>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 62%, rgba(52,211,153,0.5) 0%, rgba(16,185,129,0.12) 45%, rgba(16,185,129,0) 70%)",
          opacity: destello,
          mixBlendMode: "screen",
        }}
      />
    </>
  );
};

/** @handle fijo abajo, para que el video se reconozca si se comparte suelto. */
export const Handle: React.FC<{ desde: number }> = ({ desde }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1545,
        textAlign: "center",
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 28,
        letterSpacing: "0.22em",
        color: RC.platino500,
        opacity: aparece(frame, desde, 16),
      }}
    >
      @RING.CLOSERS
    </div>
  );
};
