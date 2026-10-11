import { Img, staticFile } from "remotion";
import { Noche } from "../ring-closers/piezas";
import { DISPLAY, RC, SANS } from "../ring-closers/tema";
import { Acabado, Destello } from "../secreto-rc/efectos";

/**
 * Base de las historias DE FOTO de Ring Closers (destacada "Qué es").
 *
 * Son imágenes fijas de 1080x1920 que se leen en 3-4 segundos y tienen que
 * entenderse solas, en orden, para alguien que no conoce nada. Se renderizan con
 * `remotion still --frame=60` (los fundidos de entrada de Destello ya cerraron).
 *
 * Zonas seguras de una historia: arriba ~250 px y abajo ~340 px los tapa Instagram
 * (barra de progreso, nombre, campo de respuesta). Todo lo importante va entre
 * y=260 y y=1580.
 */

export const ESTRELLAS_FOTO = [
  { x: 940, y: 120, size: 760, rot: 18, blur: 26, fase: 0.4, opacidad: 0.8 },
  { x: 70, y: 1800, size: 640, rot: -14, blur: 30, fase: 2.1, opacidad: 0.65 },
  { x: 150, y: 1010, size: 104, rot: 8, blur: 2.5, fase: 1.2, opacidad: 0.5 },
];

/** Fondo común: noche, luz de arriba, bokeh esmeralda en las esquinas y grano de película. */
export const Lienzo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Noche foco={1}>
    {ESTRELLAS_FOTO.map((e) => (
      <Destello key={`${e.x}-${e.y}`} {...e} />
    ))}
    {children}
    <Acabado />
  </Noche>
);

/** Etiqueta de sección arriba: filete esmeralda y texto en mayúsculas espaciadas. */
export const Etiqueta: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 300 }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
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
      {children}
    </div>
  </div>
);

/** @handle abajo, para que la imagen se reconozca si alguien la comparte suelta. */
export const Handle: React.FC = () => (
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
    }}
  >
    @RING.CLOSERS
  </div>
);

/** Titular gigante en Oswald, en mayúsculas. `acento` pinta esa línea de esmeralda con resplandor. */
export const Titular: React.FC<{
  lineas: string[];
  size: number;
  top: number;
  acento?: number;
  interlineado?: number;
}> = ({ lineas, size, top, acento, interlineado = 1.14 }) => (
  <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center" }}>
    {lineas.map((l, i) => (
      <div
        key={i}
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: size,
          lineHeight: interlineado,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          color: i === acento ? RC.esmeralda400 : RC.crema,
          textShadow: i === acento ? "0 0 34px rgba(16,185,129,0.55), 0 0 90px rgba(16,185,129,0.25)" : undefined,
        }}
      >
        {l}
      </div>
    ))}
  </div>
);

/** Línea de apoyo, en Manrope, centrada y con ancho de lectura cómodo. */
export const Apoyo: React.FC<{ children: React.ReactNode; top: number; size?: number }> = ({
  children,
  top,
  size = 46,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 110,
      right: 110,
      textAlign: "center",
      fontFamily: SANS,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1.28,
      color: RC.platino300,
    }}
  >
    {children}
  </div>
);

/** Una imagen del catálogo, sin animación, con sombra de piso opcional. */
export const Foto: React.FC<{
  src: string;
  ancho: number;
  x: number;
  y: number;
  rotar?: number;
  sombra?: boolean;
  brillo?: string;
}> = ({ src, ancho, x, y, rotar = 0, sombra = true, brillo }) => (
  <>
    {sombra ? (
      <div
        style={{
          position: "absolute",
          left: x - ancho * 0.42,
          top: y + ancho * 0.42,
          width: ancho * 0.84,
          height: ancho * 0.12,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(12px)",
        }}
      />
    ) : null}
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: x - ancho / 2,
        top: y - ancho / 2,
        width: ancho,
        height: ancho,
        objectFit: "contain",
        rotate: `${rotar}deg`,
        filter: brillo ? `drop-shadow(0 0 40px ${brillo})` : undefined,
      }}
    />
  </>
);
