import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";

/**
 * Escena minima para medir si el 3D es viable en esta maquina.
 * Sin GPU, Chrome cae a SwiftShader (OpenGL por software): el objetivo
 * de esta prueba es saber cuantos segundos cuesta un solo frame.
 */
const Escena: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-4, 2, 3]} intensity={1.4} color="#E8B01F" />

      <mesh position={[0, 0, 0]} rotation={[t * 0.4, t * 0.6, 0]}>
        <torusKnotGeometry args={[1.1, 0.36, 128, 24]} />
        <meshStandardMaterial color="#B08D57" metalness={0.9} roughness={0.18} />
      </mesh>

      <mesh position={[2.2, -1.3, -1]} rotation={[t * 0.3, t * 0.2, 0]}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#F8F9F7" metalness={0.35} roughness={0.3} />
      </mesh>
    </>
  );
};

export const Prueba3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#070E1E" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 5], fov: 45 }}>
        <Escena />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
