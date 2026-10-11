import { Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Noche, aparece, sube } from "../ring-closers/piezas";
import { DISPLAY, EASE, MARGEN, RC, SANS } from "../ring-closers/tema";
import { Acabado, Destello, Metal, Tarima } from "./efectos";

/**
 * "Secreto de closer #1": El cinturón no se gana una vez. Se defiende cada
 * semana. Sin locución: el ritmo lo marcan el texto y la música.
 *
 * Línea de tiempo (30 fps):
 *   0-152    El cinturón no se gana una vez. Se defiende cada semana.
 *   160-222  Cumplís tus tres peleas: sumás.
 *   232-294  Te falta una: perdés puntos.
 *   304-374  Y con los puntos se va el rango.  (el cinturón se apaga)
 *   388-486  Defendelo.  (el cinturón vuelve a encenderse)
 */
export const DURACION_SECRETO = 486;

const ease = Easing.bezier(...EASE);
const BRILLO = "0 0 28px rgba(16,185,129,0.55), 0 0 70px rgba(16,185,129,0.25)";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Linea: React.FC<{
  children: React.ReactNode;
  en: number;
  size: number;
  peso?: 400 | 500 | 700;
  color?: string;
  brillo?: boolean;
}> = ({ children, en, size, peso = 400, color = RC.platino300, brillo }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [en, en + 16], [0, 1], { ...clamp, easing: ease });
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: peso,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: "-0.01em",
        color,
        textShadow: brillo ? BRILLO : undefined,
        opacity: t,
        translate: `0px ${(1 - t) * 22}px`,
        filter: `blur(${(1 - t) * 8}px)`,
      }}
    >
      {children}
    </div>
  );
};

const BloqueInterno: React.FC<{ dur: number; salida: boolean; top: number; children: React.ReactNode }> = ({
  dur,
  salida,
  top,
  children,
}) => {
  const frame = useCurrentFrame();
  const s = salida ? interpolate(frame, [dur - 14, dur], [0, 1], clamp) : 0;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: MARGEN,
        right: MARGEN,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        textAlign: "center",
        opacity: 1 - s,
        translate: `0px ${-s * 30}px`,
        filter: `blur(${s * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Las líneas de un bloque cuentan sus cuadros desde que el bloque arranca. */
export const Bloque: React.FC<{
  desde: number;
  dur: number;
  salida?: boolean;
  /** Altura del bloque; 448 es la de los Secretos, la carátula de un round usa más abajo. */
  top?: number;
  children: React.ReactNode;
}> = ({ desde, dur, salida = true, top = 448, children }) => (
  <Sequence from={desde} durationInFrames={dur} layout="none">
    <BloqueInterno dur={dur} salida={salida} top={top}>
      {children}
    </BloqueInterno>
  </Sequence>
);

export const SecretoVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const entra = interpolate(frame, [50, 84], [0, 1], { ...clamp, easing: ease });

  // El cinturón se apaga cuando "se va el rango" y vuelve a encenderse en "Defendelo"
  const apaga = interpolate(frame, [318, 342], [0, 1], { ...clamp, easing: ease });
  const enciende = interpolate(frame, [388, 412], [0, 1], { ...clamp, easing: ease });
  const apagado = frame < 388 ? apaga : 1 - enciende;

  const flota = Math.sin(frame / 24) * 9;
  const giro = Math.sin(frame / 38) * 7;
  const cabeceo = 3 + Math.cos(frame / 45) * 1.5;
  const empuje = 1 + frame * 0.0003;

  const pasada1 = interpolate(frame, [76, 118], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const pasada2 = interpolate(frame, [396, 440], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const barrido = frame < 390 ? pasada1 : pasada2;

  const brilloFinal = interpolate(frame, [388, 420, 486], [0, 1, 0.55], clamp);

  const ANCHO = 780;
  const CENTRO_Y = 1180;
  const opacidadObjeto = entra * (1 - 0.74 * apagado);

  return (
    <Noche foco={0.85}>
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
          opacity: aparece(frame, 0, 14),
          translate: sube(frame, 0, 14, 14),
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

      <Bloque desde={0} dur={152}>
        <Linea en={8} size={46}>
          El cinturón no se gana una vez.
        </Linea>
        <Linea en={30} size={84} peso={700} color={RC.crema}>
          Se defiende
        </Linea>
        <Linea en={40} size={84} peso={700} color={RC.esmeralda400} brillo>
          cada semana.
        </Linea>
      </Bloque>

      <Bloque desde={160} dur={62}>
        <Linea en={0} size={46}>
          Cumplís tus tres peleas:
        </Linea>
        <Linea en={12} size={96} peso={700} color={RC.esmeralda400} brillo>
          sumás.
        </Linea>
      </Bloque>

      <Bloque desde={232} dur={62}>
        <Linea en={0} size={46}>
          Te falta una:
        </Linea>
        <Linea en={12} size={84} peso={700} color={RC.platino300}>
          perdés puntos.
        </Linea>
      </Bloque>

      <Bloque desde={304} dur={70}>
        <Linea en={0} size={46}>
          Y con los puntos,
        </Linea>
        <Linea en={12} size={84} peso={700} color={RC.crema}>
          se va el rango.
        </Linea>
      </Bloque>

      <Bloque desde={388} dur={98} salida={false}>
        <Linea en={4} size={112} peso={700} color={RC.esmeralda400} brillo>
          Defendelo.
        </Linea>
        <Linea en={26} size={46} color={RC.crema}>
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
          transform: `perspective(1500px) rotateY(${giro}deg) rotateX(${cabeceo}deg) scale(${empuje * (0.9 + 0.1 * entra)})`,
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
          opacity: aparece(frame, 96, 16),
        }}
      >
        @RING.CLOSERS
      </div>

      <Acabado />
    </Noche>
  );
};
