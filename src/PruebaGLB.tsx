import { ThreeCanvas } from "@remotion/three";
import { useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useState, useEffect } from "react";

/**
 * Prueba de viabilidad: cargar un .glb real y medir cuanto cuesta el frame.
 * Sin GPU, Chrome renderiza con SwiftShader; un modelo pesado puede
 * multiplicar el tiempo por diez.
 */
const Modelo: React.FC = () => {
  const frame = useCurrentFrame();
  const { scene } = useGLTF(staticFile("modelos3d/prueba.glb"));
  return (
    <primitive
      object={scene}
      scale={1.4}
      position={[0, -1, 0]}
      rotation={[0, (frame / 30) * 0.5, 0]}
    />
  );
};

export const PruebaGLB: React.FC = () => {
  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("cargando glb"));

  useEffect(() => {
    // Damos margen para que el loader resuelva antes de capturar
    const t = setTimeout(() => continueRender(handle), 1500);
    return () => clearTimeout(t);
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070E1E" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 1, 7], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 7, 6]} intensity={2.4} />
        <pointLight position={[-5, 2, 4]} intensity={1.6} color="#B08D57" />
        <Suspense fallback={null}>
          <Modelo />
        </Suspense>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
