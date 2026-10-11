import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Capa, Ctx, Cam, cl, ease, rebote, sacudida, TIGHT, SERIF_IT, FPS } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO, RC } from "../ring-closers/tema";

/**
 * Serie "Actualizaciones" de Ring Closers — MUESTRA de la Oficina 3D (09/10/2026).
 * Motion "elevado" al estilo de las referencias riki.bosso (Spotify) y motionloved:
 * fondo negro con un resplandor esmeralda enorme que se desplaza, la oficina REAL flotando en 3D
 * con profundidad de campo, frase palabra por palabra con UNA palabra en esmeralda (serif itálica),
 * cero cortes: un solo plano continuo que termina empujando hasta el logo.
 * Motor: la cámara proyectada y Capa de setters-goz/MuestraV2 (60 fps, desenfoque de movimiento real).
 */
export const DUR_OFI = 300;
const VERDE = RC.esmeralda500;
const W1 = 22, W2 = 34, W3 = 64, W4 = 82;      // "Tu" "oficina," "ahora" "en vivo."
const GIRO = [118, 196];                         // el panel gira hasta quedar de frente
const EMPUJE = [200, 262];                       // la cámara entra hacia el logo
const LOGO = 226;

const camara = (t: number): Cam => {
  const llegada = interpolate(t, [0, 70], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const empuje = interpolate(t, EMPUJE, [0, 1], { ...cl, easing: Easing.inOut(Easing.poly(4)) });
  const z = -2350 + 520 * llegada + 90 * rebote(t, W4, 10, 200) + interpolate(t, [70, EMPUJE[0]], [0, 140], cl) + 620 * empuje;
  const x = interpolate(empuje, [0, 1], [0, 0]) + Math.sin(t / 90) * 12 + sacudida(t, W4, 6);
  const y = -30 + interpolate(empuje, [0, 1], [0, -560]) + Math.sin(t / 70) * 8 + sacudida(t, W4 + 1, 5);
  const roll = (interpolate(t, [0, 80], [-7, 0], { ...cl, easing: ease }) + Math.sin(t / 120) * 0.6 + 4 * Math.sin(empuje * Math.PI)) * Math.PI / 180;
  const yaw = (Math.sin(t / 100) * 1.8 - 5 * Math.sin(empuje * Math.PI)) * Math.PI / 180;
  const pitch = (Math.sin(t / 130) * 1 + interpolate(empuje, [0, 1], [0, -4])) * Math.PI / 180;
  return { x, y, z, roll, yaw, pitch };
};
// Foco: la frase, después el panel, y al final el logo.
const foco = (t: number) => interpolate(t, [0, W4 + 18, GIRO[0] + 10, EMPUJE[0], LOGO + 4], [-300, -300, 60, 60, -120], { ...cl, easing: ease });

const Palabra: React.FC<{ t: number; en: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, en, children, style }) => {
  const r = rebote(t, en, 13, 160);
  const vis = interpolate(t, [en - 1, en + 7], [0, 1], cl);
  return (
    <span style={{ display: "inline-block", opacity: vis, transform: `translateY(${(1 - r) * 46}px) scale(${0.94 + 0.06 * r})`,
      filter: `blur(${(1 - vis) * 14}px)`, ...style }}>{children}</span>
  );
};

const ESTADOS = [
  { txt: "En llamada", c: "#f43f5e", x: -290, y: -60, z: -120, en: 132 },
  { txt: "Roleplay", c: "#f59e0b", x: 320, y: 120, z: -260, en: 142 },
  { txt: "En reunión", c: "#60a5fa", x: -300, y: 520, z: -40, en: 152 },
  { txt: "Disponible", c: "#10b981", x: 280, y: 650, z: -330, en: 162 },
];
const Pastilla: React.FC<{ txt: string; c: string }> = ({ txt, c }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, height: 84, padding: "0 34px", borderRadius: 42,
    background: "rgba(18,18,21,0.78)", border: "1.5px solid rgba(255,255,255,0.10)", boxShadow: `0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
    backdropFilter: "blur(8px)", whiteSpace: "nowrap" }}>
    <span style={{ width: 18, height: 18, borderRadius: 9, background: c, boxShadow: `0 0 18px ${c}` }} />
    <span style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 36, color: "#ededee", letterSpacing: "-0.01em" }}>{txt}</span>
  </div>
);

const Escena: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camara(t), fz: foco(t) };
  const giro = interpolate(t, GIRO, [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const sube = rebote(t, 4, 15, 70);
  const fraseSal = interpolate(t, [EMPUJE[0] - 4, EMPUJE[0] + 26], [1, 0], cl);
  const cuadro = Math.min(179, Math.max(0, Math.floor(t / 2)));   // 30 fps de grabación a 60 fps
  const brillo = interpolate(t, [GIRO[1] - 30, GIRO[1] + 10, GIRO[1] + 40], [0, 1, 0], cl);
  return (
    <AbsoluteFill style={{ background: "#040405", overflow: "hidden" }}>
      {/* resplandor esmeralda enorme y difuso que se desplaza (pantalla, no capa: no tiene parallax) */}
      <AbsoluteFill style={{ filter: "blur(120px)", opacity: interpolate(t, [0, 50], [0.25, 1], cl) }}>
        <div style={{ position: "absolute", width: 1300, height: 1300, borderRadius: "50%", left: -260 + Math.sin(t / 80) * 160, top: 380 + Math.cos(t / 95) * 220,
          background: "radial-gradient(circle, rgba(16,185,129,0.55), rgba(16,185,129,0) 65%)" }} />
        <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", left: 380 + Math.cos(t / 70) * 140, top: 1080 + Math.sin(t / 85) * 180,
          background: "radial-gradient(circle, rgba(5,150,105,0.45), rgba(5,150,105,0) 65%)" }} />
        <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", left: 300, top: -200 + interpolate(t, [EMPUJE[0], DUR_OFI], [0, 500], cl),
          background: "radial-gradient(circle, rgba(52,211,153,0.28), rgba(52,211,153,0) 65%)", opacity: interpolate(t, [EMPUJE[0], EMPUJE[1]], [0.2, 1], cl) }} />
      </AbsoluteFill>

      {/* polvo en el aire, a distintas profundidades */}
      {Array.from({ length: 26 }, (_, i) => {
        const r = (m: number) => random(`polvo-${i}-${m}`);
        return (
          <Capa key={i} k={k} x={(r(1) - 0.5) * 2600} y={(r(2) - 0.5) * 3600 - t * (0.4 + r(3))} z={-900 + r(4) * 1700} w={10} h={10} op={0.25 + r(5) * 0.4} dof={0.6}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#a7f3d0" }} />
          </Capa>
        );
      })}

      {/* LA OFICINA real, como un panel de vidrio que flota y gira hasta quedar de frente */}
      <Capa k={k} x={0} y={330 + (1 - sube) * 900} z={160} w={1600} h={900} esc={1}>
        <div style={{ width: "100%", height: "100%", transform: `perspective(2600px) rotateY(${-30 * (1 - giro)}deg) rotateX(${16 * (1 - giro)}deg) rotateZ(${-4 * (1 - giro)}deg)`,
          transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", inset: -26, borderRadius: 54, background: "rgba(255,255,255,0.035)", border: "1.5px solid rgba(255,255,255,0.09)",
            boxShadow: `0 120px 220px rgba(0,0,0,0.75), 0 0 140px rgba(16,185,129,${0.18 + 0.25 * brillo})` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 32, overflow: "hidden", border: `1.5px solid rgba(16,185,129,${0.35 + 0.4 * brillo})` }}>
            <Img src={staticFile(`oficina-rc/f/${String(cuadro + 1).padStart(3, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.08) saturate(1.1)" }} />
            {/* reflejo de vidrio que barre */}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${20 + 60 * giro}%, rgba(255,255,255,0.10) ${28 + 60 * giro}%, transparent ${38 + 60 * giro}%)` }} />
          </div>
        </div>
      </Capa>

      {/* estados del equipo, flotando delante con desenfoque según la distancia */}
      {ESTADOS.map((e) => {
        const r = rebote(t, e.en, 11, 170);
        const op = interpolate(t, [e.en - 2, e.en + 8], [0, 1], cl) * interpolate(t, [EMPUJE[0], EMPUJE[0] + 30], [1, 0], cl);
        return (
          <Capa key={e.txt} k={k} x={e.x} y={e.y + (1 - r) * 120} z={e.z - (1 - r) * 500} w={420} h={84} op={op} esc={0.8 + 0.2 * r}>
            <div style={{ display: "flex", justifyContent: "center" }}><Pastilla txt={e.txt} c={e.c} /></div>
          </Capa>
        );
      })}

      {/* rótulo chico de utilería */}
      <Capa k={k} x={0} y={-640} z={-300} w={800} h={50} op={interpolate(t, [10, 30], [0, 1], cl) * fraseSal}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: "0.38em", color: "rgba(167,243,208,0.75)", textAlign: "center", lineHeight: "50px" }}>
          NUEVO · OFICINA 3D
        </div>
      </Capa>
      {/* la frase, palabra por palabra; una sola palabra en esmeralda */}
      <Capa k={k} x={0} y={-430} z={-300} w={1100} h={300} op={fraseSal} desenf={(1 - fraseSal) * 18}>
        <div style={{ textAlign: "center", color: "#f4f4f5", fontFamily: TIGHT, fontWeight: 600, fontSize: 118, letterSpacing: "-0.045em", lineHeight: 1.0 }}>
          <div><Palabra t={t} en={W1}>Tu</Palabra> <Palabra t={t} en={W2}>oficina,</Palabra></div>
          <div>
            <Palabra t={t} en={W3}>ahora</Palabra>{" "}
            <Palabra t={t} en={W4} style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: 140, letterSpacing: "-0.02em", color: VERDE,
              textShadow: `0 0 40px rgba(16,185,129,${0.45 * interpolate(t, [W4, W4 + 30], [1, 0.4], cl)})` }}>en vivo.</Palabra>
          </div>
        </div>
      </Capa>

      {/* cierre: logo que se traza, nombre y crédito */}
      <Capa k={k} x={0} y={-600} z={-120} w={900} h={700} op={interpolate(t, [LOGO - 6, LOGO + 4], [0, 1], cl)}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ filter: `drop-shadow(0 0 30px rgba(16,185,129,0.55))`, transform: `scale(${0.85 + 0.15 * rebote(t, LOGO, 12, 170)})` }}>
            <Logo size={260} dibujoEn={LOGO} />
          </div>
          <div style={{ marginTop: 36, fontFamily: TIGHT, fontWeight: 600, fontSize: 82, color: "#f4f4f5", letterSpacing: "-0.04em",
            opacity: interpolate(t, [LOGO + 14, LOGO + 26], [0, 1], cl), transform: `translateY(${interpolate(t, [LOGO + 14, LOGO + 30], [24, 0], { ...cl, easing: ease })}px)` }}>
            Ring Closers
          </div>
          <div style={{ marginTop: 18, fontFamily: MONO, fontWeight: 500, fontSize: 20, letterSpacing: "0.3em", color: "rgba(167,243,208,0.75)", whiteSpace: "nowrap",
            opacity: interpolate(t, [LOGO + 26, LOGO + 40], [0, 1], cl) }}>
            OFICINA 3D · YA DISPONIBLE
          </div>
        </div>
      </Capa>
    </AbsoluteFill>
  );
};

const velocidad = (f: number) => {
  const a = camara(f - 0.5), b = camara(f + 0.5);
  return Math.hypot(b.x - a.x, b.y - a.y, (b.z - a.z) * 0.6) + Math.abs(b.roll - a.roll) * 1500;
};

export const MuestraOficina: React.FC = () => {
  const f = useCurrentFrame();
  const v = velocidad(f);
  const n = v > 22 ? 6 : v > 9 ? 4 : 1;
  return (
    <AbsoluteFill style={{ background: "#040405" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={n === 1 ? f : f - 0.35 + (0.7 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="granoOfi"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 3)} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#granoOfi)" /></svg>
      <AbsoluteFill style={{ background: "#040405", opacity: interpolate(f, [0, 8], [1, 0], cl) }} />
      <Audio src={staticFile("oficina-rc/sfx-muestra.wav")} />
    </AbsoluteFill>
  );
};
export { FPS as FPS_OFI };
