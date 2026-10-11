import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Noche, aparece, sube } from "../ring-closers/piezas";
import { DISPLAY, EASE, RC } from "../ring-closers/tema";
import { Acabado, Destello, Metal, Tarima } from "./efectos";
import { Bloque, Linea } from "./escenas";
import { A, FIN, secreto1 } from "./timeline1";

/**
 * "Secreto de closer #1" con locutor. Misma pieza que la versión muda, pero
 * cada texto y cada movimiento del cinturón salen de la voz: se piden por
 * palabra ("cada", "sumás", "rango", "Defendelo") en vez de números fijos,
 * así que si se regenera una toma la imagen se reacomoda sola.
 *
 * Además del texto y el cinturón, "Defendelo" lleva un golpe visual — destello
 * y una sacudida corta — que cae en el mismo cuadro que el impacto de sonido.
 */

const ease = Easing.bezier(...EASE);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SecretoVozVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = secreto1.total;

  // ── Cuadros de cada evento, medidos sobre la voz ─────────────────────────
  const eEtiqueta = A("s1-apertura", "Secreto") - 6;
  const eLinea1 = A("s1-apertura", "El") - 4;
  const eDefiende = A("s1-apertura", "Se", 2) - 4;
  const eCada = A("s1-apertura", "cada") - 4;
  const eCumplis = A("s2-cumplis", "Cumplís") - 4;
  const eSumas = A("s2-cumplis", "sumás") - 4;
  const eTe = A("s2-cumplis", "Te") - 4;
  const ePerdes = A("s2-cumplis", "perdés") - 4;
  const eY = A("s3-rango", "Y") - 4;
  const eSeVa = A("s3-rango", "se") - 4;
  const eVa = A("s3-rango", "va");
  const eDefendelo = A("s4-cierre", "Defendelo");
  // El golpe de sonido llega 0,1 s antes que la palabra: la imagen cae en el mismo cuadro
  const eGolpe = eDefendelo - 3;
  const eSubite = A("s4-cierre", "Subite") - 4;

  // ── Cinturón: entra con "cada semana", se apaga con "se va el rango" ─────
  const entra = interpolate(frame, [eCada + 6, eCada + 40], [0, 1], { ...clamp, easing: ease });
  const apaga = interpolate(frame, [eVa + 6, eVa + 32], [0, 1], { ...clamp, easing: ease });
  const enciende = interpolate(frame, [eGolpe, eGolpe + 24], [0, 1], { ...clamp, easing: ease });
  const apagado = frame < eGolpe ? apaga : 1 - enciende;

  const flota = Math.sin(frame / 24) * 9;
  const giro = Math.sin(frame / 38) * 7;
  const cabeceo = 3 + Math.cos(frame / 45) * 1.5;
  const empuje = 1 + frame * 0.00022;

  const pasada1 = interpolate(frame, [eCada + 32, eCada + 74], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const pasada2 = interpolate(frame, [eGolpe + 7, eGolpe + 51], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const barrido = frame < eGolpe ? pasada1 : pasada2;
  const brilloFinal = interpolate(frame, [eGolpe, eGolpe + 32, TOTAL], [0, 1, 0.55], clamp);

  // ── Golpe de "Defendelo": destello, sacudida y un pulso del cinturón ─────
  const desdeGolpe = frame - eGolpe;
  const golpe = desdeGolpe >= 0 ? Math.exp(-desdeGolpe / 6) : 0;
  const sacudida = golpe * 7 * Math.sin(desdeGolpe * 2.4);
  const destello = interpolate(frame, [eGolpe - 1, eGolpe + 1, eGolpe + 18], [0, 1, 0], clamp);

  const ANCHO = 780;
  const CENTRO_Y = 1180;
  const opacidadObjeto = entra * (1 - 0.74 * apagado);

  return (
    <Noche foco={0.85}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `${sacudida}px ${-Math.abs(sacudida) * 0.6}px`,
        }}
      >
        <Destello x={930} y={110} size={720} rot={18} blur={24} fase={0.4} opacidad={0.85 * (1 - 0.7 * apagado)} />
        <Destello x={90} y={1790} size={600} rot={-14} blur={28} fase={2.1} opacidad={0.7 * (1 - 0.7 * apagado)} />
        <Destello x={175} y={1010} size={110} rot={8} blur={2.5} fase={1.2} opacidad={0.55 * (1 - apagado)} />

        <div
          style={{
            position: "absolute",
            top: 330,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: aparece(frame, eEtiqueta, 14),
            translate: sube(frame, eEtiqueta, 14, 14),
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
            Secreto de closer #1
          </div>
        </div>

        <Bloque desde={0} dur={FIN("s1-apertura") + 8}>
          <Linea en={eLinea1} size={46}>
            El cinturón no se gana una vez.
          </Linea>
          <Linea en={eDefiende} size={84} peso={700} color={RC.crema}>
            Se defiende
          </Linea>
          <Linea en={eCada} size={84} peso={700} color={RC.esmeralda400} brillo>
            cada semana.
          </Linea>
        </Bloque>

        <Bloque desde={eCumplis} dur={eTe - eCumplis}>
          <Linea en={0} size={46}>
            Cumplís tus tres peleas:
          </Linea>
          <Linea en={eSumas - eCumplis} size={96} peso={700} color={RC.esmeralda400} brillo>
            sumás.
          </Linea>
        </Bloque>

        <Bloque desde={eTe} dur={eY - 2 - eTe}>
          <Linea en={0} size={46}>
            Te falta una:
          </Linea>
          <Linea en={ePerdes - eTe} size={84} peso={700} color={RC.platino300}>
            perdés puntos.
          </Linea>
        </Bloque>

        <Bloque desde={eY} dur={eVa + 46 - eY}>
          <Linea en={0} size={46}>
            Y con los puntos,
          </Linea>
          <Linea en={eSeVa - eY} size={84} peso={700} color={RC.crema}>
            se va el rango.
          </Linea>
        </Bloque>

        <Bloque desde={eDefendelo - 4} dur={TOTAL - (eDefendelo - 4)} salida={false}>
          <Linea en={0} size={112} peso={700} color={RC.esmeralda400} brillo>
            Defendelo.
          </Linea>
          <Linea en={eSubite - (eDefendelo - 4)} size={46} color={RC.crema}>
            Subite al ring.
          </Linea>
        </Bloque>

        <Tarima y={CENTRO_Y} ancho={ANCHO} entra={entra * (1 - 0.85 * apagado) * (1 + 0.25 * brilloFinal)} />
        <div
          style={{
            position: "absolute",
            left: 540 - ANCHO / 2,
            top: CENTRO_Y - ANCHO / 2 + flota + (1 - entra) * 110,
            opacity: opacidadObjeto,
            filter: `blur(${(1 - entra) * 14 + apagado * 5}px)`,
            transform: `perspective(1500px) rotateY(${giro}deg) rotateX(${cabeceo}deg) scale(${
              empuje * (0.9 + 0.1 * entra) * (1 + 0.045 * golpe)
            })`,
          }}
        >
          <Metal src="secreto-rc/leyenda-hero.png" ancho={ANCHO} barrido={barrido} />
        </div>

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
            opacity: aparece(frame, eCada + 40, 16),
          }}
        >
          @RING.CLOSERS
        </div>
      </div>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 62%, rgba(52,211,153,0.5) 0%, rgba(16,185,129,0.12) 45%, rgba(16,185,129,0) 70%)",
          opacity: destello,
          mixBlendMode: "screen",
        }}
      />
      <Acabado />
    </Noche>
  );
};
