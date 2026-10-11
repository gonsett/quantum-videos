import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EASE, F } from "../theme-fuga";

/**
 * Escenografía 3D del comercial de fuga de cartera.
 *
 * Todo es geometría real con materiales y luces: no hay imágenes ni
 * modelos importados. La idea visual es una sola y se sostiene en las
 * ocho escenas: hay objetos que se van del cuadro y objetos que quedan
 * anclados a una estructura.
 *
 * Rendimiento medido en esta máquina (2 núcleos, sin GPU, SwiftShader):
 * 0,59 s por frame a 1080x1920. Un video de 55 s tarda unos 16 minutos.
 * Por eso las escenas tienen pocos cuerpos y las esferas usan pocos
 * segmentos: subir la geometría sube el render de forma lineal.
 */

/** Luces comunes: una clave cálida dorada y un relleno frío. */
export const Luces: React.FC<{ intensidad?: number }> = ({ intensidad = 1 }) => (
  <>
    <ambientLight intensity={0.42 * intensidad} />
    <directionalLight position={[5, 7, 6]} intensity={2.4 * intensidad} color="#FFF3DC" />
    <pointLight position={[-5, 1, 4]} intensity={1.8 * intensidad} color={F.oro} />
    <pointLight position={[3, -4, 2]} intensity={0.7 * intensidad} color="#4A6FA5" />
  </>
);

/** El teléfono: la pieza que se lleva el vendedor. */
export const Telefono: React.FC<{
  posicion: [number, number, number];
  rotacion: [number, number, number];
  escala?: number;
}> = ({ posicion, rotacion, escala = 1 }) => {
  // Burbujas alternadas: las del vendedor en dorado, las del cliente en claro.
  // Sin esto el objeto se lee como un rectangulo dorado plano; son las
  // burbujas las que lo vuelven un telefono con conversaciones adentro,
  // que es exactamente de lo que habla el video.
  const burbujas = [
    { y: 0.68, x: -0.16, w: 0.50, propia: false },
    { y: 0.42, x: 0.20, w: 0.42, propia: true },
    { y: 0.16, x: -0.22, w: 0.38, propia: false },
    { y: -0.11, x: 0.14, w: 0.54, propia: true },
    { y: -0.40, x: -0.18, w: 0.46, propia: false },
    { y: -0.66, x: 0.22, w: 0.36, propia: true },
  ];

  return (
    <group position={posicion} rotation={rotacion} scale={escala}>
      {/* Marco metalico */}
      <mesh>
        <boxGeometry args={[1.12, 2.18, 0.13]} />
        <meshStandardMaterial color="#20293C" metalness={0.94} roughness={0.2} />
      </mesh>
      {/* Pantalla apagada: oscura, para que las burbujas resalten */}
      <mesh position={[0, 0, 0.069]}>
        <boxGeometry args={[0.97, 1.99, 0.012]} />
        <meshStandardMaterial color="#0B1220" metalness={0.45} roughness={0.5} />
      </mesh>
      {/* Las conversaciones */}
      {burbujas.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0.083]}>
          <boxGeometry args={[b.w, 0.17, 0.015]} />
          <meshStandardMaterial
            color={b.propia ? F.oro : F.claro}
            emissive={b.propia ? F.oro : F.claro}
            emissiveIntensity={b.propia ? 0.55 : 0.3}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Un cliente de la cartera. Los que se van llevan material dorado;
 * los que quedan en el sistema, material claro.
 */
export const Cliente: React.FC<{
  posicion: [number, number, number];
  radio?: number;
  seVa?: boolean;
  opacidad?: number;
}> = ({ posicion, radio = 0.16, seVa = false, opacidad = 1 }) => (
  <mesh position={posicion}>
    <sphereGeometry args={[radio, 14, 12]} />
    <meshStandardMaterial
      color={seVa ? F.oro : F.claro}
      metalness={seVa ? 0.85 : 0.45}
      roughness={seVa ? 0.22 : 0.36}
      transparent={opacidad < 1}
      opacity={opacidad}
      emissive={seVa ? F.oro : "#000000"}
      emissiveIntensity={seVa ? 0.16 : 0}
    />
  </mesh>
);

/**
 * Rejilla de anclajes: la estructura que retiene. Aparece cuando entra
 * el sistema y es lo que diferencia "queda en la empresa" de "se va en
 * el celular".
 */
export const Rejilla: React.FC<{
  filas: number;
  columnas: number;
  paso?: number;
  progreso: number;
}> = ({ filas, columnas, paso = 0.62, progreso }) => {
  const piezas: React.ReactElement[] = [];
  const anchoTotal = (columnas - 1) * paso;
  const altoTotal = (filas - 1) * paso;

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const i = f * columnas + c;
      const umbral = i / (filas * columnas);
      if (progreso < umbral) continue;

      const local = Math.min(1, (progreso - umbral) * 6);
      const x = c * paso - anchoTotal / 2;
      const y = -(f * paso) + altoTotal / 2;

      piezas.push(
        <mesh key={i} position={[x, y, 0]} scale={local}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color={F.claro}
            metalness={0.55}
            roughness={0.3}
          />
        </mesh>,
      );
    }
  }

  return <group>{piezas}</group>;
};

/** Lienzo 3D con el fondo de marca detrás. */
export const Escena3D: React.FC<{
  children: React.ReactNode;
  camaraZ?: number;
}> = ({ children, camaraZ = 6 }) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: F.fondo }}>
      {/* Resplandor dorado detrás del 3D */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 38% at 50% 42%, rgba(176,141,87,0.16) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, camaraZ], fov: 42 }}
        style={{ position: "absolute", inset: 0 }}
      >
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Curva de salida: acelera al irse, como algo que se pierde. */
export const salida = (frame: number, desde: number, hasta: number) =>
  interpolate(frame, [desde, hasta], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.55, 0, 0.85, 0.35),
  });

/** Curva de entrada asentada. */
export const entrada = (frame: number, desde: number, hasta: number) =>
  interpolate(frame, [desde, hasta], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

/** Deriva suave para que nada quede completamente quieto. */
export const useDeriva = (velocidad = 1) => {
  const frame = useCurrentFrame();
  const t = (frame / 30) * velocidad;
  return t;
};
