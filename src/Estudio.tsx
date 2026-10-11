import { ThreeCanvas } from "@remotion/three";
import { RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { F } from "./theme-fuga";

/**
 * Prueba de calidad: el mismo teléfono con el set completo que faltaba.
 *
 * Lo que cambia respecto de la versión anterior, en orden de impacto:
 *
 * 1. MAPA DE ENTORNO. Un material metálico refleja su alrededor; sin
 *    entorno no hay nada que reflejar y el metal se ve como plástico mate.
 *    RoomEnvironment viene con three y genera un estudio sintético, que es
 *    justo lo que usan los renders de producto. Este es el error que más
 *    pesaba.
 * 2. TONE MAPPING ACES. Curva de respuesta de cine. Sin esto los valores
 *    altos se saturan feo y el resultado se ve "de computadora".
 * 3. SOMBRAS. Luz direccional que proyecta sobre un plano de apoyo: sin
 *    sombra los objetos flotan pegados al fondo.
 * 4. BISELES. RoundedBox en vez de boxGeometry. El borde redondeado atrapa
 *    un reflejo lineal y es lo que dibuja la silueta del objeto.
 * 5. MATERIAL FÍSICO con clearcoat: la capa de barniz sobre el metal.
 */

const Entorno: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    // Estudio sintético convertido a mapa de reflexión
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.02);
    scene.environment = env.texture;

    // Curva de cine + espacio de color correcto
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.55;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    return () => {
      pmrem.dispose();
      env.texture.dispose();
    };
  }, [gl, scene]);

  return null;
};

const TelefonoBueno: React.FC<{ giro: number }> = ({ giro }) => {
  const burbujas = [
    { y: 0.68, x: -0.16, w: 0.5, propia: false },
    { y: 0.42, x: 0.2, w: 0.42, propia: true },
    { y: 0.16, x: -0.22, w: 0.38, propia: false },
    { y: -0.11, x: 0.14, w: 0.54, propia: true },
    { y: -0.4, x: -0.18, w: 0.46, propia: false },
    { y: -0.66, x: 0.22, w: 0.36, propia: true },
  ];

  return (
    <group rotation={[0.08, giro, 0.03]} position={[0, 0.35, 0]}>
      {/* Cuerpo biselado: el bisel es lo que atrapa el reflejo lineal */}
      <RoundedBox args={[1.12, 2.2, 0.14]} radius={0.07} smoothness={5} castShadow>
        <meshPhysicalMaterial
          color="#1A2334"
          metalness={1}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* Pantalla: vidrio oscuro, muy pulido */}
      <RoundedBox args={[0.98, 2.02, 0.02]} radius={0.035} smoothness={4} position={[0, 0, 0.072]}>
        <meshPhysicalMaterial
          color="#070C16"
          metalness={0.2}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.1}
        />
      </RoundedBox>

      {/* Conversaciones, también biseladas */}
      {burbujas.map((b, i) => (
        <RoundedBox
          key={i}
          args={[b.w, 0.17, 0.022]}
          radius={0.026}
          smoothness={4}
          position={[b.x, b.y, 0.088]}
        >
          <meshPhysicalMaterial
            color={b.propia ? F.oro : "#EDF0F4"}
            metalness={b.propia ? 0.95 : 0.2}
            roughness={b.propia ? 0.18 : 0.35}
            clearcoat={0.8}
            emissive={b.propia ? F.oro : "#FFFFFF"}
            emissiveIntensity={b.propia ? 0.22 : 0.12}
            envMapIntensity={1.4}
          />
        </RoundedBox>
      ))}
    </group>
  );
};

export const Estudio: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const giro = 0.35 + (frame / 30) * 0.28;

  return (
    <AbsoluteFill style={{ backgroundColor: F.fondo }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 58% 40% at 50% 40%, rgba(176,141,87,0.28) 0%, rgba(0,0,0,0) 72%)",
        }}
      />
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0.35, 0.25, 4.5], fov: 38 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Entorno />

        {/* Clave cálida con sombra */}
        <directionalLight
          position={[4, 6, 5]}
          intensity={2.6}
          color="#FFF1D9"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={22}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0012}
        />
        {/* Contra dorada: dibuja el borde del objeto */}
        <pointLight position={[-4.5, 1.5, 2.5]} intensity={12} color={F.oro} distance={16} />
        {/* Contraluz: recorta la silueta contra el fondo */}
        <spotLight
          position={[-2.5, 3.5, -4]}
          intensity={45}
          angle={0.9}
          penumbra={1}
          color="#BFD4FF"
          distance={18}
        />
        {/* Relleno frio muy bajo, para que las sombras no sean negro puro */}
        <ambientLight intensity={0.24} color="#8FA8CC" />

        <TelefonoBueno giro={giro} />

        {/* Piso que recibe la sombra */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]} receiveShadow>
          <planeGeometry args={[26, 26]} />
          <shadowMaterial opacity={0.7} />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
