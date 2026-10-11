import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { aparece } from "../ring-closers/piezas";
import { RC } from "../ring-closers/tema";

/**
 * Efectos del estilo "objeto cromado + tipografía cinética".
 *
 * Referencia de estilo: profundidad de campo (formas desenfocadas en las
 * esquinas), un objeto con brillo metálico como pieza central y un barrido
 * de luz que lo recorre. Se resuelve con capas 2D, sin motor 3D: el objeto
 * es un render que ya existe (los cinturones) y la sensación de volumen sale
 * del tilt en perspectiva, la sombra de piso y el destello especular.
 *
 * Acento único: esmeralda. El rojo de la referencia no entra: en Ring Closers
 * es solo de las etiquetas de esquina.
 */

/** Estrella de cuatro puntas, larga y fina, desenfocada como bokeh de lente. */
export const Destello: React.FC<{
  x: number;
  y: number;
  size: number;
  rot: number;
  blur: number;
  fase?: number;
  opacidad?: number;
  color?: string;
}> = ({ x, y, size, rot, blur, fase = 0, opacidad = 0.9, color = RC.esmeralda500 }) => {
  const frame = useCurrentFrame();
  const giro = rot + Math.sin(frame / 60 + fase) * 4;
  const respira = 1 + Math.sin(frame / 50 + fase) * 0.05;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity: aparece(frame, 0, 24) * opacidad,
        rotate: `${giro}deg`,
        scale: String(respira),
        filter: `blur(${blur}px)`,
      }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id={`d${x}${y}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={RC.esmeralda400} stopOpacity="1" />
            <stop offset="55%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon
          points="100,0 108,92 200,100 108,108 100,200 92,108 0,100 92,92"
          fill={`url(#d${x}${y})`}
        />
      </svg>
    </div>
  );
};

/**
 * Objeto con brillo metálico: la imagen y, encima, una banda de luz que se
 * recorta con el alfa de la propia imagen (mask), así solo brilla el metal y
 * nunca el vacío alrededor.
 */
export const Metal: React.FC<{ src: string; ancho: number; barrido: number }> = ({
  src,
  ancho,
  barrido,
}) => {
  const url = staticFile(src);
  return (
    <div style={{ position: "relative", width: ancho, height: ancho, isolation: "isolate" }}>
      <Img src={url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage: `url("${url}")`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          backgroundImage:
            "linear-gradient(105deg, rgba(255,255,255,0) 45%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 55%)",
          backgroundSize: "320% 100%",
          backgroundPosition: `${100 - barrido * 100}% 0`,
          backgroundRepeat: "no-repeat",
          mixBlendMode: "screen",
          opacity: 0.7,
        }}
      />
    </div>
  );
};

/** Piso del objeto: contacto oscuro debajo y un halo esmeralda detrás que lo despega del fondo. */
export const Tarima: React.FC<{ y: number; ancho: number; entra: number }> = ({ y, ancho, entra }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 540 - ancho * 0.62,
        top: y - ancho * 0.5,
        width: ancho * 1.24,
        height: ancho,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.20) 0%, rgba(16,185,129,0) 62%)",
        filter: "blur(30px)",
        opacity: entra,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 540 - ancho * 0.48,
        top: y + ancho * 0.36,
        width: ancho * 0.96,
        height: ancho * 0.16,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)",
        filter: "blur(14px)",
        opacity: entra,
      }}
    />
  </>
);

/** Grano de película y viñeta: lo que saca al render del aspecto "de computadora". */
export const Acabado: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay" }}>
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={7 + Math.floor(frame / 2)} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grano)" opacity="0.09" />
      </svg>
    </AbsoluteFill>
  );
};
