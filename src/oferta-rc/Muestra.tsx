/**
 * "Secreto de contratación #1 — Una oferta no es un volante" (26/09/2026).
 * ARQUITECTURA de Kayn "Secret" (objeto real que flota y gira al centro, texto chico arriba en serif itálica +
 * sans negra, estrellas de 4 puntas que barren desde las esquinas, letra chica, placa de marca) con la PIEL de
 * Ring Closers (Javier: "el formato de Kayn pero con el toque de Ring Closers"; el fondo blanco y las estrellas
 * negras planas eran demasiado gráficos): negro de estudio, platino, un solo acento esmeralda, estrellas de luz
 * desenfocadas, grano. Muestra de la escena 1: megáfono 3D real (esmalte negro, cromo, luz de contorno esmeralda).
 */
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { RC } from "../ring-closers/tema";
import { Metal } from "../secreto-rc/efectos";

const SERIF = cargarSerif("italic").fontFamily;
const SANS = cargarManrope("normal", { weights: ["500", "800"] }).fontFamily;
const FONDO = "#070808";

/** Reflejos de estudio sin archivos externos; se asignan en el mismo render (una captura no espera efectos). */
const useEntorno = () => {
  const { gl, scene } = useThree();
  return useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return env;
  }, [gl, scene]);
};

const Megafono: React.FC<{ f: number }> = ({ f }) => {
  const env = useEntorno();
  const esmalte = useMemo(() => new THREE.MeshPhysicalMaterial({ envMap: env, envMapIntensity: 0.9, color: "#0e0f10", roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06 }), [env]);
  const cromo = useMemo(() => new THREE.MeshStandardMaterial({ envMap: env, envMapIntensity: 1.1, color: "#e4e4e7", metalness: 1, roughness: 0.14 }), [env]);
  const interior = useMemo(() => new THREE.MeshStandardMaterial({ envMap: env, envMapIntensity: 0.8, color: "#b4b4b8", metalness: 1, roughness: 0.22, side: THREE.BackSide }), [env]);
  const goma = useMemo(() => new THREE.MeshPhysicalMaterial({ envMap: env, envMapIntensity: 0.5, color: "#141414", roughness: 0.6 }), [env]);
  const rejilla = useMemo(() => new THREE.MeshStandardMaterial({ envMap: env, color: "#2a2a2a", metalness: 0.6, roughness: 0.55 }), [env]);

  // Perfil de la bocina (eje Y): de la garganta angosta a la boca ancha.
  const perfil = useMemo(() => {
    const p: THREE.Vector2[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      p.push(new THREE.Vector2(0.2 + 0.62 * Math.pow(t, 1.35), t * 1.7));
    }
    return p;
  }, []);
  const bocina = useMemo(() => new THREE.LatheGeometry(perfil, 96), [perfil]);
  const bocinaIn = useMemo(() => new THREE.LatheGeometry(perfil.map((v) => new THREE.Vector2(v.x * 0.965, v.y)), 96), [perfil]);

  const giro = interpolate(f, [0, 90], [-1.0, -0.72]) + Math.sin(f / 22) * 0.05;
  const flota = Math.sin(f / 18) * 0.05;
  return (
    <group position={[-0.3, 0.1 + flota, 0]} rotation={[0.16, giro, 0.22]}>
      <group rotation={[0, 0, -Math.PI / 2]}>
        <mesh geometry={bocina} material={esmalte} position={[0, -0.35, 0]} />
        <mesh geometry={bocinaIn} material={interior} position={[0, -0.35, 0]} />
        <mesh material={cromo} position={[0, 1.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.815, 0.035, 24, 128]} />
        </mesh>
        <mesh material={cromo} position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.3, 0.26, 0.75, 64]} />
        </mesh>
        {[-0.4, -1.02].map((y) => (
          <mesh key={y} material={cromo} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.305, 0.025, 16, 96]} />
          </mesh>
        ))}
        <mesh material={rejilla} position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.04, 64]} />
        </mesh>
      </group>
      <mesh material={goma} position={[-0.72, -0.5, 0]} rotation={[0, 0, -0.28]}>
        <capsuleGeometry args={[0.14, 0.55, 8, 24]} />
      </mesh>
      <mesh material={cromo} position={[-0.72, -0.2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.2, 24]} />
      </mesh>
      <mesh material={goma} position={[-0.52, -0.36, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.05, 0.2, 0.08]} />
      </mesh>
    </group>
  );
};

/** Estrella de 4 puntas hecha de LUZ (núcleo blanco, cuerpo esmeralda, halo desenfocado) que entra barriendo. */
export const Estrella: React.FC<{ desde: [number, number]; hasta: [number, number]; size: number; rot: number; inicio: number; f: number; blur?: number; id: string }> = ({
  desde, hasta, size, rot, inicio, f, blur = 0, id,
}) => {
  const p = interpolate(f, [inicio, inicio + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const x = desde[0] + (hasta[0] - desde[0]) * p;
  const y = desde[1] + (hasta[1] - desde[1]) * p;
  const s = size * (0.55 + 0.45 * p) * (1 + Math.sin((f - inicio) / 40) * 0.04);
  const deriva = Math.sin((f - inicio) / 30) * 4;
  const forma = "M0 -100 C 5 -20 20 -5 100 0 C 20 5 5 20 0 100 C -5 20 -20 5 -100 0 C -20 -5 -5 -20 0 -100 Z";
  return (
    <svg viewBox="-100 -100 200 200" width={s} height={s}
      style={{ position: "absolute", left: x - s / 2, top: y - s / 2, opacity: p, overflow: "visible",
        transform: `rotate(${rot + (1 - p) * -40 + deriva}deg)`, filter: `blur(${blur}px)` }}>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="18%" stopColor={RC.esmeralda400} />
          <stop offset="100%" stopColor={RC.esmeralda600} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <path d={forma} fill={`url(#${id})`} style={{ filter: `drop-shadow(0 0 ${size * 0.05}px ${RC.esmeralda500})` }} />
    </svg>
  );
};

export const Palabras: React.FC<{ texto: string; desde: number; f: number; style: React.CSSProperties; acento?: string[] }> = ({ texto, desde, f, style, acento = [] }) => (
  <div style={style}>
    {texto.split(" ").map((w, i) => {
      const p = interpolate(f, [desde + i * 3, desde + i * 3 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      return (
        <span key={i} style={{ display: "inline-block", marginRight: "0.26em", opacity: p, transform: `translateY(${(1 - p) * 10}px)`,
          filter: `blur(${(1 - p) * 6}px)`, color: acento.includes(w) ? RC.esmeralda400 : undefined }}>{w}</span>
      );
    })}
  </div>
);

/** Grano de película animado + viñeta, encima de todo. */
export const Acabado: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.22 }}>
      <svg width="100%" height="100%">
        <filter id="granoOf"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 50} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#granoOf)" />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, transparent 45%, rgba(0,0,0,0.7) 100%)" }} />
  </AbsoluteFill>
);

export const MuestraOferta: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const flota = Math.sin(f / 18) * 0.05;
  return (
    <AbsoluteFill style={{ background: FONDO }}>
      {/* luz de estudio: un cono gris que cae sobre el objeto + halo esmeralda detrás */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 42% at 50% 46%, #1c1f1e 0%, #0d0f0e 55%, transparent 100%)" }} />
      <div style={{ position: "absolute", left: width / 2 - 380, top: 560, width: 760, height: 760, borderRadius: "50%",
        background: `radial-gradient(circle, ${RC.esmeralda600}33 0%, ${RC.esmeralda600}10 40%, transparent 70%)`, filter: "blur(20px)" }} />
      {/* piso: charco de luz y sombra de contacto que se achica cuando el objeto sube */}
      <div style={{ position: "absolute", left: width / 2 - 360, top: 1220, width: 720, height: 120, borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(212,212,216,0.10) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", left: width / 2 - 270, top: 1255, width: 540, height: 56, borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 72%)",
        transform: `scale(${1 - flota * 1.6})`, filter: "blur(5px)" }} />

      <Estrella id="e1" desde={[-220, -200]} hasta={[70, 120]} size={380} rot={14} inicio={0} f={f} blur={3} />
      <Estrella id="e2" desde={[1300, 2150]} hasta={[990, 1790]} size={520} rot={-10} inicio={4} f={f} blur={9} />
      <Estrella id="e3" desde={[1180, 520]} hasta={[930, 640]} size={90} rot={0} inicio={14} f={f} blur={1.5} />

      {/* héroe: la lupa del scout de Ring Closers (el director busca talento), flota, gira apenas, barrido de luz */}
      <div style={{ position: "absolute", left: width / 2 - 390, top: 520 + flota * 180, width: 780, height: 780, perspective: 1600 }}>
        <div style={{ transform: `rotateY(${Math.sin(f / 26) * 8 - 4}deg) rotateX(${3 + Math.sin(f / 31) * 2}deg) rotateZ(${-8 + Math.sin(f / 40) * 2}deg) scale(${interpolate(f, [0, 90], [0.96, 1.02])})`,
          filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.7)) saturate(0.85)" }}>
          <Metal src="ring-closers/scout/magnifying-glass.webp" ancho={780} barrido={interpolate(f, [8, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center" }}>
        <Palabras texto="el secreto de contratación" desde={6} f={f}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, lineHeight: 1.05, color: RC.platino500 }} />
        <Palabras texto="que ningún grupo te cuenta" desde={20} f={f} acento={["grupo"]}
          style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.12, letterSpacing: -1.2, color: "#f4f4f5" }} />
      </div>

      <div style={{ position: "absolute", top: 1420, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 500,
        fontSize: 21, letterSpacing: 2.4, color: "#6b6b72", opacity: interpolate(f, [30, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        SECRETO DE CONTRATACIÓN N.º 01 — PARA DIRECTORES COMERCIALES
      </div>
      <Acabado f={f} />
    </AbsoluteFill>
  );
};
