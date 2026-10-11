/**
 * "Lo que dejaste sobre la mesa" — tramo 3D (e6 la llamada, la moneda en lo negro, e7 el roleplay).
 * Javier (02/10/2026): el celular de la llamada "se ve medio cutre" y las monedas del final "quedaron como animaciones
 * baratas". Por eso este tramo deja el recorte 2D y pasa a geometría real: oro PBR (metal 1, reflejos de estudio,
 * canto estriado, relieve), un celular de titanio apoyado en una mesa de vidrio negro que vibra y derrama su luz sobre
 * el oro, y la mesa del roleplay vista desde arriba. Todo es la misma mesa: el oro nunca deja de ser un objeto.
 */
import React, { useMemo } from "react";
import { continueRender, delayRender, Easing, interpolate, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SANS, SERIF } from "../historias-rc/como-funciona";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const iv = (f: number, a: number, b: number, o = 0, t = 1, e: (x: number) => number = ease) => interpolate(f, [a, b], [o, t], { ...cl, easing: e });

// ── carga: la imagen de la moneda y las fuentes, antes del primer cuadro ──
let IMG: HTMLImageElement | null = null;
const useRecursos = () => {
  const [listo, setListo] = React.useState(!!IMG);
  const [h] = React.useState(() => (IMG ? null : delayRender("oro3d")));
  React.useEffect(() => {
    if (IMG) return;
    const im = new Image();
    im.src = staticFile("comision-rc/moneda-frente.png");
    Promise.all([
      im.decode(),
      document.fonts.load(`500 40px ${SANS}`), document.fonts.load(`700 40px ${SANS}`), document.fonts.load(`italic 40px ${SERIF}`),
    ]).then(() => { IMG = im; setListo(true); if (h !== null) continueRender(h); });
  }, [h]);
  return listo;
};

const lienzo = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const tex = (c: HTMLCanvasElement, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

/** Cara de la moneda: la acuñación real + lo que lleva grabado (texto o estrella), con bisel de luz y sombra. */
const cara = (grabar?: (x: CanvasRenderingContext2D) => void) => {
  const c = lienzo(512, 512), x = c.getContext("2d")!;
  x.drawImage(IMG!, 0, 0, 512, 512);
  if (grabar) {
    x.save(); x.translate(512, 512); x.scale(-1, -1); x.translate(-1.6, -1.6); x.globalAlpha = 0.55; x.fillStyle = "#fff1c4"; x.strokeStyle = "#fff1c4"; grabar(x); x.restore(); // luz del bisel
    x.save(); x.translate(512, 512); x.scale(-1, -1); x.fillStyle = "rgba(92,58,8,0.92)"; x.strokeStyle = "rgba(92,58,8,0.92)"; grabar(x); x.restore(); // el surco
  }
  return c;
};
const textoGrabado = (lineas: string[]) => (x: CanvasRenderingContext2D) => {
  const t = lineas.length > 2 ? 44 : 54;
  x.font = `800 ${t}px ${SANS}`; x.textAlign = "center"; x.textBaseline = "middle";
  lineas.forEach((l, i) => x.fillText(l, 256, 256 + (i - (lineas.length - 1) / 2) * t * 1.08));
};
const estrella = (x: CanvasRenderingContext2D) => {
  x.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 66 : 158, a = -Math.PI / 2 + (i * Math.PI) / 5; x[i ? "lineTo" : "moveTo"](256 + r * Math.cos(a), 262 + r * Math.sin(a)); }
  x.closePath(); x.lineWidth = 14; x.lineJoin = "round"; x.stroke();
};

/** Materiales de oro compartidos. */
const useOro = (env: THREE.Texture, grabados: (string[] | "estrella" | null)[]) => {
  return useMemo(() => {
    const canto = lienzo(1024, 16), y = canto.getContext("2d")!;
    for (let i = 0; i < 1024; i += 8) { y.fillStyle = "#fff"; y.fillRect(i, 0, 4, 16); y.fillStyle = "#555"; y.fillRect(i + 4, 0, 4, 16); }
    const ct = tex(canto, false); ct.wrapS = THREE.RepeatWrapping; ct.repeat.set(2, 1);
    const borde = new THREE.MeshStandardMaterial({ envMap: env, envMapIntensity: 1.1, color: "#d29a36", metalness: 1, roughness: 0.24, bumpMap: ct, bumpScale: 3 });
    const caras = grabados.map((gb) => {
      const c = cara(gb === "estrella" ? estrella : gb ? textoGrabado(gb) : undefined);
      const t = tex(c);
      return new THREE.MeshStandardMaterial({ envMap: env, envMapIntensity: 0.75, map: t, bumpMap: tex(c, false), bumpScale: 2.2, metalness: 1, roughness: 0.34, color: "#f5b94e" });
    });
    return { borde, caras };
  }, [env]); // eslint-disable-line react-hooks/exhaustive-deps
};

const useEntorno = () => {
  const { gl, scene } = useThree();
  return useMemo(() => {
    const env = new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05;
    return env;
  }, [gl, scene]);
};

const Camara: React.FC<{ pos: [number, number, number]; mira: [number, number, number]; fov: number }> = ({ pos, mira, fov }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...pos); c.fov = fov; c.near = 0.05; c.far = 60; c.updateProjectionMatrix(); c.lookAt(...mira);
  return null;
};

/** Una moneda: cilindro con canto estriado y dos caras acuñadas. Eje = Y (apoyada en la mesa). */
const GEO: Record<string, THREE.CylinderGeometry> = {};
const geo = (r: number, h: number) => (GEO[`${r}-${h}`] ??= new THREE.CylinderGeometry(r, r, h, 96, 1));
const Moneda: React.FC<{ r: number; h?: number; cara: THREE.Material; borde: THREE.Material; pos: [number, number, number]; rot?: [number, number, number]; esc?: number }> = ({ r, h = r * 0.16, cara, borde, pos, rot = [0, 0, 0], esc = 1 }) => (
  <group position={pos} rotation={rot} scale={esc}>
    <mesh geometry={geo(r, h)} material={[borde, cara, cara]} castShadow receiveShadow rotation={[0, Math.PI * 1.5, 0]} />
  </group>
);
const Pila: React.FC<{ n: number; r: number; x: number; z: number; cara: THREE.Material; borde: THREE.Material; giro?: number }> = ({ n, r, x, z, cara, borde, giro = 0 }) => {
  const h = r * 0.16;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Moneda key={i} r={r} cara={cara} borde={borde} pos={[x + Math.sin(i * 2.1 + giro) * r * 0.035, h / 2 + i * h * 1.002, z + Math.cos(i * 1.7) * r * 0.035]} rot={[0, giro + i * 0.7, 0]} />
      ))}
    </>
  );
};

/** Mesa de vidrio negro: el reflejo es la escena espejada debajo de un vidrio ahumado. */
const Mesa: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <group scale={[1, -1, 1]}>{children}</group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial color="#020304" transparent opacity={0.9} roughness={0.12} envMapIntensity={0.25} />
    </mesh>
  </>
);

const Rotulo: React.FC<{ texto: string; pos: [number, number, number]; ancho: number; op?: number; color?: string; peso?: number; espacio?: number }> = ({ texto, pos, ancho, op = 1, color = "#c9d1d4", peso = 600, espacio = 14 }) => {
  const mapa = useMemo(() => {
    const c = lienzo(1024, 128), x = c.getContext("2d")!;
    x.font = `${peso} 64px ${SANS}`; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle";
    (x as unknown as { letterSpacing: string }).letterSpacing = `${espacio}px`;
    x.fillText(texto, 512, 66);
    return tex(c);
  }, [texto, color, peso, espacio]);
  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ancho, ancho / 8]} />
      <meshBasicMaterial map={mapa} transparent opacity={op} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

// ═════════ e6: la llamada que vale plata ═════════
export type TiemposLlamada = { S6: number; llamada: number; plata: number; negro: number };

const pantalla = (c: HTMLCanvasElement, f: number, T: TiemposLlamada) => {
  const x = c.getContext("2d")!, W = c.width, H = c.height, rel = f - T.S6;
  const perdida = iv(f, T.plata + 10, T.plata + 18);
  x.clearRect(0, 0, W, H);
  // fondo: vidrio esmeralda profundo con dos luces desenfocadas
  const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#0d2a22"); bg.addColorStop(0.55, "#06120f"); bg.addColorStop(1, "#020605");
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  const luz = (cx: number, cy: number, r: number, col: string) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H); };
  luz(W * 0.25, H * 0.18, 420, `rgba(25,197,140,${0.28 * (1 - perdida * 0.7)})`);
  luz(W * 0.85, H * 0.62, 380, `rgba(233,185,85,${0.12 * (1 - perdida * 0.6)})`);
  // isla y barra de estado
  x.fillStyle = "#000"; x.beginPath(); x.roundRect(W / 2 - 92, 26, 184, 52, 26); x.fill();
  x.fillStyle = "rgba(255,255,255,0.85)"; x.font = `600 30px ${SANS}`; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("21:47", 54, 54);
  x.textAlign = "center";
  // quién llama
  x.fillStyle = perdida > 0.5 ? "rgba(212,103,92,0.95)" : "rgba(220,240,232,0.6)";
  x.font = `500 26px ${SANS}`; (x as unknown as { letterSpacing: string }).letterSpacing = "6px";
  x.fillText(perdida > 0.5 ? "LLAMADA PERDIDA" : "LLAMADA ENTRANTE", W / 2, 196);
  (x as unknown as { letterSpacing: string }).letterSpacing = "0px";
  x.fillStyle = `rgba(245,247,248,${1 - perdida * 0.45})`; x.font = `500 76px ${SANS}`; x.fillText("Daniel M.", W / 2, 290);
  x.fillStyle = `rgba(245,247,248,${0.5 - perdida * 0.2})`; x.font = `400 30px ${SANS}`; x.fillText("Cierre  ·  programa anual", W / 2, 352);
  // lo que vale la llamada
  const brillo = iv(f, T.plata - 6, T.plata + 2) * (1 - iv(f, T.plata + 2, T.plata + 14));
  x.font = `italic 104px ${SERIF}`;
  const oro = x.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0);
  const s = interpolate(f, [T.plata - 8, T.plata + 10], [-0.3, 1.3], cl);
  oro.addColorStop(0, "#c99a45"); oro.addColorStop(Math.min(1, Math.max(0, s - 0.15)), "#e9c27a");
  oro.addColorStop(Math.min(1, Math.max(0, s)), brillo > 0.02 ? "#fff6dc" : "#efcc85"); oro.addColorStop(Math.min(1, Math.max(0, s + 0.15)), "#e9c27a"); oro.addColorStop(1, "#c99a45");
  x.globalAlpha = 1 - perdida * 0.55; x.fillStyle = oro; x.fillText("USD 12.000", W / 2, 560); x.globalAlpha = 1;
  if (perdida > 0) { x.strokeStyle = "rgba(212,103,92,0.9)"; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - 230, 566); x.lineTo(W / 2 - 230 + 460 * iv(f, T.plata + 12, T.plata + 22), 566); x.stroke(); }
  x.fillStyle = "rgba(245,247,248,0.4)"; x.font = `400 24px ${SANS}`; x.fillText("comisión en juego", W / 2, 640);
  // deslizar para responder: vidrio, perilla y brillo que recorre el texto
  const op = 1 - perdida;
  if (op > 0.01) {
    x.globalAlpha = op;
    const py = H - 250, px = 60, pw = W - 120, ph = 128;
    x.fillStyle = "rgba(255,255,255,0.09)"; x.strokeStyle = "rgba(255,255,255,0.16)"; x.lineWidth = 2;
    x.beginPath(); x.roundRect(px, py, pw, ph, ph / 2); x.fill(); x.stroke();
    const k = 8 * Math.max(0, Math.sin(rel / 5)); // la perilla insinúa el gesto
    x.fillStyle = "#f4f6f7"; x.beginPath(); x.arc(px + ph / 2 + k, py + ph / 2, ph / 2 - 10, 0, Math.PI * 2); x.fill();
    x.save(); x.translate(px + ph / 2 + k, py + ph / 2); x.rotate(-0.75); x.strokeStyle = "#19c58c"; x.lineWidth = 9; x.lineCap = "round";
    x.beginPath(); x.arc(0, 0, 17, Math.PI * 0.6, Math.PI * 1.4); x.stroke(); x.restore();
    const sh = ((rel * 9) % (pw + 400)) - 200;
    const tg = x.createLinearGradient(px + sh - 120, 0, px + sh + 120, 0);
    tg.addColorStop(0, "rgba(255,255,255,0.38)"); tg.addColorStop(0.5, "rgba(255,255,255,0.95)"); tg.addColorStop(1, "rgba(255,255,255,0.38)");
    x.fillStyle = tg; x.font = `500 32px ${SANS}`; x.fillText("deslizá para responder", W / 2 + 50, py + ph / 2 + 2);
    x.globalAlpha = 1;
  }
  x.fillStyle = "rgba(255,255,255,0.75)"; x.beginPath(); x.roundRect(W / 2 - 80, H - 40, 160, 9, 5); x.fill();
  return 1 - perdida * 0.7;
};

const EscenaLlamada: React.FC<{ f: number; T: TiemposLlamada }> = ({ f, T }) => {
  const env = useEntorno();
  const { borde, caras } = useOro(env, [null]);
  const c = useMemo(() => lienzo(600, 1300), []);
  const mapa = useMemo(() => tex(c), [c]);
  const brillo = pantalla(c, f, T);
  mapa.needsUpdate = true;
  const rel = f - T.S6;
  const suena = f < T.plata + 10 && rel % 42 < 18; // ráfagas de vibración
  const vib = suena ? 1 : 0;
  const dx = vib * Math.sin(f * 7.3) * 0.009, dz = vib * Math.cos(f * 5.1) * 0.006, rz = vib * Math.sin(f * 9.7) * 0.012;
  const deriva = Math.floor(Math.min(rel, T.plata + 10 - T.S6) / 42) * 0.012; // el celular camina sobre el vidrio
  const t = iv(f, T.S6, T.negro + 4, 0, 1, Easing.bezier(0.33, 0, 0.2, 1));
  const pos: [number, number, number] = [interpolate(t, [0, 1], [-0.45, 0.1]), interpolate(t, [0, 1], [3.4, 2.9]), interpolate(t, [0, 1], [3.6, 2.45])];
  const r = 0.36;
  return (
    <>
      <Camara pos={pos} mira={[0.1, 0, 0.1]} fov={34} />
      <ambientLight intensity={0.05} />
      <spotLight position={[-2.2, 5, -2.6]} angle={0.55} penumbra={0.9} intensity={70} color="#ffe2b0" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <pointLight position={[2.6, 1.2, 2.8]} intensity={4} color="#9fb4c8" />
      {/* la pantalla ilumina lo que tiene cerca */}
      <pointLight position={[0.1 + dx, 0.35, 0.05]} intensity={2.6 * brillo * (0.85 + 0.15 * vib)} distance={2.6} decay={2} color="#3fe0aa" />
      <Mesa>
        <group position={[0.1 + dx + deriva, 0.04, 0.05 + dz]} rotation={[0, 0.16 + rz + deriva * 2, 0]}>
          <RoundedBox args={[0.8, 0.075, 1.66]} radius={0.034} smoothness={6} castShadow receiveShadow>
            <meshStandardMaterial color="#5b5e62" metalness={1} roughness={0.32} envMapIntensity={1.2} />
          </RoundedBox>
          <mesh position={[0, 0.0385, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.77, 1.63]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <mesh position={[0, 0.039, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.735, 1.594]} />
            <meshBasicMaterial map={mapa} toneMapped={false} />
          </mesh>
          {/* vidrio frontal: refleja el estudio */}
          <mesh position={[0, 0.0395, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.77, 1.63]} />
            <meshPhysicalMaterial color="#000" transparent opacity={0.16} roughness={0.04} metalness={0} clearcoat={1} envMapIntensity={2} />
          </mesh>
        </group>
        <Pila n={7} r={r} x={-0.98} z={-0.78} cara={caras[0]} borde={borde} />
        <Pila n={4} r={r} x={1.02} z={-0.42} cara={caras[0]} borde={borde} giro={1.2} />
        <Pila n={2} r={r} x={0.86} z={1.28} cara={caras[0]} borde={borde} giro={2.2} />
        <Pila n={3} r={r} x={-0.38} z={-1.62} cara={caras[0]} borde={borde} giro={0.5} />
        <Moneda r={r} cara={caras[0]} borde={borde} pos={[-0.84, r * 0.08, 1.0]} rot={[0, 0.4, 0]} />
        <Moneda r={r} cara={caras[0]} borde={borde} pos={[-1.1, 0.13, 0.38]} rot={[0.0, 0.2, -0.36]} />
      </Mesa>
    </>
  );
};

export const Llamada3D: React.FC<{ f: number; T: TiemposLlamada }> = ({ f, T }) => {
  const listo = useRecursos();
  return (
    <ThreeCanvas width={1080} height={1920} shadows>
      {listo && <EscenaLlamada f={f} T={T} />}
    </ThreeCanvas>
  );
};

// ═════════ la moneda en lo negro ═════════
const EscenaNegra: React.FC<{ f: number; desde: number; para: number }> = ({ f, desde, para }) => {
  const env = useEntorno();
  const { borde, caras } = useOro(env, [null]);
  const p = interpolate(f, [desde - 6, para], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const ang = p * Math.PI * 2 * 3.5 + Math.PI; // 3,5 vueltas; se detiene de frente
  const cabeceo = (1 - p) * 0.22 * Math.sin(f / 5);
  return (
    <>
      <Camara pos={[0, 0, 6.2]} mira={[0, 0, 0]} fov={26} />
      <ambientLight intensity={0.02} />
      <spotLight position={[-3, 4, 4]} angle={0.4} penumbra={1} intensity={22} color="#ffe6bd" />
      <spotLight position={[3.5, -1, -2.5]} angle={0.5} penumbra={1} intensity={18} color="#fff2d6" />
      <group rotation={[cabeceo, ang, 0]} position={[0, 0.27 + Math.sin(f / 14) * 0.015, 0]}>
        <Moneda r={0.5} h={0.075} cara={caras[0]} borde={borde} pos={[0, 0, 0]} rot={[Math.PI / 2, 0, 0]} />
      </group>
    </>
  );
};
export const MonedaNegra3D: React.FC<{ f: number; desde: number; para: number }> = (p) => {
  const listo = useRecursos();
  return <ThreeCanvas width={1080} height={1920}>{listo && <EscenaNegra {...p} />}</ThreeCanvas>;
};

// ═════════ e7: la mesa del roleplay ═════════
export type TiemposPelea = { S7: number; S8: number; tira: number; respondes: number; equivocas: number; puntua: number };
const OBJ_TXT = [["LO TENGO", "QUE PENSAR"], ["ES CARO"], ["LO TENGO QUE", "HABLAR CON", "MI PAREJA"]];

const EscenaPelea: React.FC<{ f: number; T: TiemposPelea }> = ({ f, T }) => {
  const env = useEntorno();
  const { borde, caras } = useOro(env, [null, ...OBJ_TXT, "estrella"]);
  const rojo = useMemo(() => { const m = (caras[2] as THREE.MeshStandardMaterial).clone(); return m; }, [caras]);
  const r = 0.27, h = r * 0.16;
  const PILA = { x: -0.55, z: 1.1, n: 4 };
  const t = iv(f, T.S7, T.S8, 0, 1, Easing.linear);
  // la moneda que se equivoca se tiñe de rojo
  const err = iv(f, T.equivocas - 2, T.equivocas + 4) * (1 - iv(f, T.equivocas + 40, T.equivocas + 60));
  rojo.color.setRGB(1, 1 - 0.55 * err, 1 - 0.6 * err); rojo.emissive.setRGB(0.18 * err, 0.02 * err, 0.0);
  const monedas = OBJ_TXT.map((_, i) => {
    const tira = T.tira - 6 + i * 7;
    const x0 = [-0.64, 0.02, 0.66][i], z0 = -0.3 + (i === 1 ? -0.1 : 0);
    const llega = iv(f, tira, tira + 20, 0, 1, Easing.bezier(0.1, 0.7, 0.2, 1));
    let x = x0 + (1 - llega) * (i - 1) * 0.4, z = interpolate(llega, [0, 1], [-3.4, z0]), y = 0, rotY = (1 - llega) * 7 * (i % 2 ? -1 : 1), rx = 0, rz = 0;
    if (i !== 1) {
      const vuelve = i === 0 ? T.respondes + 2 : T.puntua - 22;
      const k = iv(f, vuelve, vuelve + 18, 0, 1, io);
      const piso = PILA.n + (i === 2 && f >= T.respondes + 20 ? 1 : 0);
      x = interpolate(k, [0, 1], [x, PILA.x]); z = interpolate(k, [0, 1], [z, PILA.z]);
      y = Math.sin(k * Math.PI) * 0.4 + k * (piso * h * 1.002);
      rotY += k * Math.PI * 2;
    } else {
      const k = iv(f, T.equivocas + 14, T.equivocas + 40, 0, 1, Easing.in(Easing.quad));
      x = x + k * 1.9; z = z + k * 1.2;
      const fuera = Math.max(0, x - 1.25);
      y = -fuera * fuera * 2.5; rz = -fuera * 1.4; rotY -= k * 4;
    }
    return { x, y, z, rotY, rx, rz, i };
  });
  const cam: [number, number, number] = [interpolate(t, [0, 1], [-0.12, 0.1]), interpolate(t, [0, 1], [6.4, 5.9]), interpolate(t, [0, 1], [2.5, 2.2])];
  const rotEstrellas = (i: number) => {
    const en = T.puntua + i * 5, k = f - en;
    if (k < 0) return null;
    const y = k < 6 ? 0.9 * (1 - k / 6) ** 2 : 0.05 * Math.max(0, Math.sin((k - 6) * 0.9)) * Math.exp(-(k - 6) / 4);
    return { y, s: k < 6 ? 1.15 : 1 };
  };
  const linea = iv(f, T.S7 + 4, T.S7 + 30);
  return (
    <>
      <Camara pos={cam} mira={[0, 0, 0.25]} fov={30} />
      <ambientLight intensity={0.04} />
      <spotLight position={[-1.6, 7, 3.6]} angle={0.5} penumbra={0.9} intensity={60} color="#ffe2b0" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <pointLight position={[2.2, 1.4, 2.4]} intensity={2} color="#9fb4c8" />
      <Mesa>
        {/* el ring: una línea esmeralda dividiendo la mesa */}
        <mesh position={[0, 0.003, 0.38]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6 * linea, 0.008]} />
          <meshBasicMaterial color="#19c58c" toneMapped={false} transparent opacity={0.75} />
        </mesh>
        <Rotulo texto="MARTINA R." pos={[0, 0.004, -1.0]} ancho={1.3} op={0.6 * iv(f, T.S7 + 10, T.S7 + 30)} />
        <Rotulo texto="VOS" pos={[0.35, 0.004, 1.42]} ancho={1.0} op={0.8 * iv(f, T.S7 + 16, T.S7 + 36)} color="#e9eef0" />
        <Pila n={PILA.n} r={r} x={PILA.x} z={PILA.z} cara={caras[0]} borde={borde} giro={0.4} />
        {monedas.map((m) => (
          <Moneda key={m.i} r={r} cara={m.i === 1 ? rojo : caras[m.i + 1]} borde={borde} pos={[m.x, h / 2 + m.y, m.z]} rot={[m.rx, m.rotY, m.rz]} />
        ))}
        {Array.from({ length: 5 }, (_, i) => {
          const x = -0.68 + i * 0.34, z = -0.3;
          if (i === 4) {
            const op = iv(f, T.puntua + 22, T.puntua + 30) * 0.5;
            return (
              <mesh key={i} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.15, 0.157, 96]} />
                <meshBasicMaterial color="#c9d1d4" transparent opacity={op} toneMapped={false} />
              </mesh>
            );
          }
          const e = rotEstrellas(i);
          if (!e) return null;
          return <Moneda key={i} r={0.155} cara={caras[4]} borde={borde} pos={[x, 0.015 + e.y, z]} esc={e.s} />;
        })}
      </Mesa>
    </>
  );
};
export const Pelea3D: React.FC<{ f: number; T: TiemposPelea }> = (p) => {
  const listo = useRecursos();
  return <ThreeCanvas width={1080} height={1920} shadows>{listo && <EscenaPelea {...p} />}</ThreeCanvas>;
};
