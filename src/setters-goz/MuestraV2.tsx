import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as cargarTight } from "@remotion/google-fonts/InterTight";
import { loadFont as cargarInstr } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarBarras } from "@remotion/google-fonts/LibreBarcode128";

/**
 * Ring Setters en lenguaje Gozmotion — MUESTRA v2 (04/10/2026). Replica cómo está armado su proyecto de AE
 * (memoria referencias-gozmotion, "Cómo está armado por dentro"):
 * 60 fps; mundo 3D de verdad — cada capa tiene x, y, z y se proyecta con una cámara (posición, giro, sacudida),
 * así hay parallax y profundidad de campo (desenfoque según la distancia al plano de foco, con cambios de foco);
 * pared de revoque con la sombra de una rama que se mece; nubes en primer plano que la cámara atraviesa;
 * transición con papelitos que caen y barrido con desenfoque de movimiento real (varias muestras por cuadro);
 * palabra clave detrás de la cabeza del sujeto (tapa de revista), letras que entran con rebote (Smart Bounce),
 * estrellas de 4 puntas, código de barras y textos chicos de utilería. Un solo acento: ámbar.
 * La v1 de la muestra (30 fps, 2D) gustó, pero "tiene que ser totalmente exacto a Gozmotion".
 */
export const TIGHT = cargarTight("normal", { weights: ["500", "600", "900"] }).fontFamily;
export const SERIF = cargarInstr("normal").fontFamily;
export const SERIF_IT = cargarInstr("italic").fontFamily;
export const BARRAS = cargarBarras().fontFamily;
export const TINTA = "#141312", GRIS = "#1f1d1b", AMBAR = "#d97706";
export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const FPS = 60;
export const s2f = (s: number) => Math.round(s * FPS);

export type Pal = { palabra: string; t: number; fin: number; it?: boolean; acento?: boolean; caja?: number };
// Tiempos de whisper de voz-setters-rc (segundos desde el arranque de cada toma).
const T1: Pal[][] = [
  [{ palabra: "Durante", t: 0, fin: 0.76 }, { palabra: "años,", t: 0.76, fin: 1.26, it: true, acento: true }],
  [{ palabra: "todo", t: 1.7, fin: 1.92 }, { palabra: "fue", t: 1.92, fin: 2.18 }, { palabra: "para", t: 2.18, fin: 2.36 }, { palabra: "los", t: 2.36, fin: 2.58 }],
];
const T2: Pal[][] = [
  [{ palabra: "Pero", t: 0, fin: 0.46 }, { palabra: "ninguna", t: 0.46, fin: 1, it: true, caja: 300 }, { palabra: "venta", t: 1, fin: 1.54 }],
  [{ palabra: "empieza", t: 1.54, fin: 1.8 }, { palabra: "en", t: 1.8, fin: 1.96 }, { palabra: "el", t: 1.96, fin: 2.1 }],
];
export const V1 = 24, V2 = 280, DUR_V2 = 530;
const TODO = V1 + s2f(1.7) - 8;          // el empujón cae en la pausa antes de "todo"
const CLOSERS = V1 + s2f(2.58) - 4;
const BARRIDO = [232, 286];               // paso de escena: barrido lateral con papelitos y nubes
const NINGUNA = V2 + s2f(0.46);
const VENTA = V2 + s2f(1.0) - 4;
const CIERRE = V2 + s2f(2.1) - 4;
export const X2 = 2100;                          // la escena 2 vive a la derecha de la 1, sobre la misma pared

// ---------- cámara ----------
export type Cam = { x: number; y: number; z: number; roll: number; yaw: number; pitch: number };
export const P = 1500;                           // distancia focal: a z=0 con la cámara en z=-P, escala 1
export const rebote = (t: number, en: number, damping = 11, stiffness = 170) =>
  spring({ frame: t - en, fps: FPS, config: { damping, stiffness, mass: 0.7 } });
export const sacudida = (t: number, en: number, amp: number, dec = 0.16) => {
  const d = (t - en) / FPS;
  if (d < 0) return 0;
  return amp * Math.exp(-d / dec) * (Math.sin(d * 71) + 0.6 * Math.sin(d * 113 + 1.3));
};
export const camara = (t: number): Cam => {
  const barrido = interpolate(t, BARRIDO, [0, 1], { ...cl, easing: Easing.inOut(Easing.poly(5)) });
  const llegada = interpolate(t, [0, 120], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  let z = -2150 + 600 * llegada + 110 * rebote(t, TODO) + 120 * rebote(t, CLOSERS, 9, 220);
  z += interpolate(t, [CLOSERS, BARRIDO[0]], [0, 60], cl);
  // escena 2: arranca un poco más lejos y empuja; golpes de cámara en "venta" y "cierre."
  const z2 = -1720 + interpolate(t, [BARRIDO[1], DUR_V2], [0, 170], cl) + 70 * rebote(t, VENTA) + 230 * rebote(t, CIERRE, 9, 230);
  z = z + (z2 - z) * barrido;
  const x = X2 * barrido + sacudida(t, CLOSERS, 7) + sacudida(t, CIERRE, 9) + Math.sin(t / 95) * 14;
  const y = -20 + Math.sin(t / 77) * 10 + sacudida(t, CLOSERS + 1, 6) + sacudida(t, CIERRE + 1, 8) + sacudida(t, TODO, 3);
  const roll = (interpolate(t, [0, 80], [6, 0], { ...cl, easing: ease }) - 9 * Math.sin(barrido * Math.PI) + sacudida(t, CIERRE, 0.5) + sacudida(t, CLOSERS, 0.35)) * Math.PI / 180;
  const yaw = (Math.sin(t / 110) * 2.2 + 6 * Math.sin(barrido * Math.PI)) * Math.PI / 180;
  const pitch = Math.sin(t / 130) * 1.2 * Math.PI / 180;
  return { x, y, z, roll, yaw, pitch };
};
export const proyectar = (c: Cam, x: number, y: number, z: number) => {
  let dx = x - c.x, dy = y - c.y, dz = z - c.z;
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
  [dx, dz] = [dx * cy - dz * sy, dx * sy + dz * cy];
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  [dy, dz] = [dy * cp - dz * sp, dy * sp + dz * cp];
  const s = P / dz;
  let X = dx * s, Y = dy * s;
  const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  [X, Y] = [X * cr - Y * sr, X * sr + Y * cr];
  return { X: 540 + X, Y: 960 + Y, s, d: dz };
};
// Plano de foco (z del mundo): la frase, después el sujeto, después la palabra clave.
const foco = (t: number) =>
  t < BARRIDO[0]
    ? interpolate(t, [CLOSERS - 4, CLOSERS + 12], [-170, 150], cl)
    : interpolate(t, [BARRIDO[1], NINGUNA + 30, CIERRE - 4, CIERRE + 10], [-160, -160, -160, -60], cl);
export const APERTURA = 20;

export type Ctx = { t: number; c: Cam; fz: number };
export const Capa: React.FC<{ k: Ctx; x: number; y: number; z: number; w: number; h: number; rot?: number; esc?: number; op?: number;
  dof?: number; desenf?: number; style?: React.CSSProperties; children?: React.ReactNode }> =
  ({ k, x, y, z, w, h, rot = 0, esc = 1, op = 1, dof = 1, desenf = 0, style, children }) => {
    const p = proyectar(k.c, x, y, z);
    if (p.d < 60 || op <= 0.001) return null;
    const fd = k.fz - k.c.z;
    const borroso = Math.min(46, APERTURA * P * Math.abs(1 / fd - 1 / p.d) * dof) + desenf; // en px de pantalla
    const s = p.s * esc;
    return (
      <div style={{ position: "absolute", left: p.X - w / 2, top: p.Y - h / 2, width: w, height: h, opacity: op,
        transform: `rotate(${rot + (k.c.roll * 180) / Math.PI}deg) scale(${s})`,
        filter: borroso > 0.35 ? `blur(${borroso / s}px)` : undefined, ...style }}>{children}</div>
    );
  };

// ---------- piezas ----------
export const Estrella: React.FC<{ color: string; tam: number }> = ({ color, tam }) => (
  <svg width={tam} height={tam} viewBox="-50 -50 100 100"><path d="M0,-50 C5,-9 9,-5 50,0 C9,5 5,9 0,50 C-5,9 -9,5 -50,0 C-9,-5 -5,-9 0,-50Z" fill={color} /></svg>
);

// Frase en serif que se tipea letra por letra con la voz; una palabra puede ir en itálica (y en ámbar).
export const Tipeo: React.FC<{ t: number; desde: number; renglones: Pal[][]; tam: number }> = ({ t, desde, renglones, tam }) => {
  let ultimo = -1;
  renglones.flat().forEach((p) => { if (t >= desde + p.t * FPS) ultimo = desde + p.t * FPS; });
  const cursorVis = t - ultimo < 26 || Math.floor(t / 16) % 2 === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tam * 0.02 }}>
      {renglones.map((r, i) => (
        <div key={i} style={{ fontFamily: SERIF, fontSize: tam, color: GRIS, letterSpacing: "-0.015em", lineHeight: 1.02, whiteSpace: "nowrap", height: tam * 1.04 }}>
          {r.map((p, j) => {
            const a = desde + p.t * FPS, b = desde + Math.min(p.fin, p.t + 0.3) * FPS;
            const n = Math.round(interpolate(t, [a, b], [0, p.palabra.length], cl));
            if (n === 0) return null;
            return (
              <React.Fragment key={j}>
                {j ? " " : ""}
                <span style={{ position: "relative", fontFamily: p.it ? SERIF_IT : SERIF, fontStyle: p.it ? "italic" : "normal", color: p.acento ? AMBAR : GRIS }}>
                  {p.palabra.slice(0, n)}
                  {p.caja ? (
                    <span style={{ position: "absolute", inset: 0, opacity: interpolate(t, [a + 70, a + 84], [1, 0], cl) }}>
                      <Caja t={t} en={a + 10} inset="-2px -10px -6px -8px" color={TINTA} grosor={2.5} tir={16} />
                    </span>
                  ) : null}
                </span>
              </React.Fragment>
            );
          })}
          {i === renglones.length - 1 || renglones[i + 1].every((p) => t < desde + p.t * FPS) ? (
            r.some((p) => t >= desde + p.t * FPS) ? (
              <span style={{ display: "inline-block", width: 4, height: tam * 0.8, marginLeft: 6, background: TINTA, verticalAlign: "-0.06em", opacity: cursorVis ? 0.85 : 0 }} />
            ) : null
          ) : null}
        </div>
      ))}
    </div>
  );
};

// La firma: caja de selección de programa de diseño con tiradores que entran con rebote.
// Fluida: ocupa el contenedor (position absolute + inset), así abraza la palabra sin medirla.
export const Caja: React.FC<{ t: number; en: number; inset: string; color?: string; grosor?: number; tir?: number }> = ({ t, en, inset, color = AMBAR, grosor = 3, tir: lado = 22 }) => {
  const d = t - en;
  if (d < -12) return null;
  const traza = interpolate(d, [-12, 6], [0, 1], { ...cl, easing: ease });
  const tir = Math.max(0, rebote(t, en, 8, 260));
  const esq = [[0, 0], [100, 0], [0, 100], [100, 100], [50, 0], [50, 100], [0, 50], [100, 50]];
  return (
    <span style={{ position: "absolute", inset, pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={0} y={0} width="100%" height="100%" pathLength={1} fill="none" stroke={color} strokeWidth={grosor} strokeDasharray={`${traza} 1`} />
      </svg>
      {esq.map(([x, y], i) => (
        <span key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: lado, height: lado, marginLeft: -lado / 2, marginTop: -lado / 2,
          background: "#fff", border: `${grosor}px solid ${color}`, boxSizing: "border-box", transform: `scale(${tir})` }} />
      ))}
    </span>
  );
};

// Palabra clave letra por letra: cada letra cae desde la cámara (escala grande, desenfocada) y rebota en su lugar.
export const Letras: React.FC<{ t: number; en: number; texto: string; style: React.CSSProperties; paso?: number }> = ({ t, en, texto, style, paso = 2.4 }) => (
  <div style={{ display: "flex", whiteSpace: "pre", ...style }}>
    {texto.split("").map((ch, i) => {
      const a = en + i * paso;
      const r = rebote(t, a, 10, 210);
      const vis = interpolate(t, [a - 1, a + 5], [0, 1], cl);
      return (
        <span key={i} style={{ display: "inline-block", opacity: vis, transform: `translateY(${(1 - r) * -90}px) scale(${1 + (1 - r) * 1.3}) rotate(${(1 - r) * (i % 2 ? 9 : -9)}deg)`,
          filter: `blur(${Math.max(0, 1 - vis * 1.2) * 18}px)`, transformOrigin: "50% 80%" }}>{ch}</span>
      );
    })}
  </div>
);

// Papelito de confeti: rectángulo de papel que gira en 3D (aleteo) mientras cae.
export const Papel: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const r = (n: number) => random(`papel-${i}-${n}`);
  const ax = r(1) * 360 + t * (4 + r(2) * 7), ay = r(3) * 360 + t * (3 + r(4) * 6);
  const linea = r(5) > 0.45;
  return (
    <div style={{ width: "100%", height: "100%", transform: `perspective(500px) rotateX(${ax}deg) rotateY(${ay}deg) rotateZ(${r(6) * 360}deg)`,
      background: r(7) > 0.85 ? "#e9e3d6" : "#f7f5f0", boxShadow: "0 6px 14px rgba(0,0,0,0.18)", padding: "14% 12%", boxSizing: "border-box" }}>
      {linea ? [0, 1, 2, 3].map((j) => <div key={j} style={{ height: 3, marginBottom: 7, width: `${55 + random(`l${i}${j}`) * 45}%`, background: "rgba(40,38,35,0.35)" }} />) : null}
    </div>
  );
};
export const Confeti: React.FC<{ k: Ctx; desde: number; hasta: number; n: number; cx: number; ancho: number; semilla: string }> = ({ k, desde, hasta, n, cx, ancho, semilla }) => {
  if (k.t < desde || k.t > hasta + 40) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const r = (m: number) => random(`${semilla}-${i}-${m}`);
        const t0 = desde + r(1) * 30;
        const d = (k.t - t0) / FPS;
        if (d < 0) return null;
        const z = semilla === "b" ? 60 + r(2) * 380 : -700 + r(2) * 1000;
        const x = cx + (r(3) - 0.5) * ancho + Math.sin(d * (2 + r(4) * 2) + r(5) * 6) * 90;
        const y = -1500 + r(6) * 300 + d * (900 + r(7) * 500);
        const op = interpolate(k.t, [hasta, hasta + 40], [1, 0], cl);
        return (
          <Capa key={i} k={k} x={x} y={y} z={z} w={70 + r(8) * 50} h={90 + r(9) * 50} op={op} dof={0.8}>
            <Papel t={k.t} i={i + (semilla === "b" ? 100 : 0)} />
          </Capa>
        );
      })}
    </>
  );
};

// ---------- la escena completa, como función del tiempo (para promediar muestras de desenfoque de movimiento) ----------
export const Escena: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camara(t), fz: foco(t) };
  const vaiven = Math.sin(t / 60 * 0.9) * 1.6 + Math.sin(t / 60 * 2.3) * 0.5; // la rama se mece
  // escena 1
  const sube = rebote(t, 6, 14, 90);
  const frase1Sal = interpolate(t, [BARRIDO[0] - 6, BARRIDO[0] + 14], [1, 0], cl);
  const clos = rebote(t, CLOSERS, 10, 190);
  // escena 2
  const cae = rebote(t, BARRIDO[1] - 24, 10, 150);
  const subraya = interpolate(t, [CIERRE + 18, CIERRE + 40], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ background: "#e7e5e1", overflow: "hidden" }}>
      {/* PARED de revoque: un plano grande al fondo, con luz cálida y la sombra de la rama que se mece */}
      <Capa k={k} x={1050} y={0} z={500} w={5200} h={3600} dof={0.35}>
        <Img src={staticFile("setters-goz/revoque.jpg")} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 35% at 30% 30%, rgba(255,250,240,0.55), transparent 70%), radial-gradient(ellipse 40% 35% at 72% 34%, rgba(255,250,240,0.5), transparent 70%)" }} />
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: [1250, 3350][i], top: -380, width: 1500, height: 1500, transformOrigin: "100% 0%",
            transform: `rotate(${vaiven + i * 8}deg) scaleX(${i ? -1 : 1})`, opacity: 0.2, filter: "blur(7px)", mixBlendMode: "multiply" }}>
            <Img src={staticFile("setters-goz/rama.png")} style={{ width: "100%", height: "100%" }} />
          </div>
        ))}
      </Capa>

      {/* ===== ESCENA 1: el closer ===== */}
      <Capa k={k} x={-250} y={-600} z={-170} w={500} h={60} op={interpolate(t, [20, 40], [0, 1], cl) * frase1Sal}>
        <div style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 40, color: "#5d5953", textAlign: "center", lineHeight: "60px" }}>en las ventas,</div>
      </Capa>
      <Capa k={k} x={250} y={-600} z={-170} w={500} h={60} op={interpolate(t, [26, 46], [0, 1], cl) * frase1Sal}>
        <div style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 24, letterSpacing: "0.42em", color: "#5d5953", textAlign: "center", lineHeight: "60px" }}>SIEMPRE IGUAL</div>
      </Capa>
      {/* palabra clave DETRÁS del sujeto: la cabeza tapa parte de las letras (tapa de revista) */}
      <Capa k={k} x={40} y={-150} z={300} w={1400} h={330} esc={0.92 + 0.08 * clos}>
        {t >= CLOSERS - 2 ? (
          <div style={{ position: "relative", width: 1400, height: 330, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Letras t={t} en={CLOSERS} texto="CLOSERS" paso={2.2} style={{ fontFamily: TIGHT, fontWeight: 900, fontSize: 235, letterSpacing: "-0.05em", color: TINTA, lineHeight: 1 }} />
              <Caja t={t} en={CLOSERS + 8} inset="-14px -34px -10px -24px" />
            </div>
          </div>
        ) : null}
      </Capa>
      {/* sombra propia del sujeto sobre la pared */}
      <Capa k={k} x={110} y={640 + (1 - sube) * 600} z={140} w={1700} h={1700} op={0.3 * Math.min(1, sube * 1.4)} desenf={10}>
        <Img src={staticFile("setters-goz/closer-recorte.png")} style={{ width: "100%", height: "100%", filter: "brightness(0)" }} />
      </Capa>
      <Capa k={k} x={0} y={600 + (1 - sube) * 700} z={0} w={1700} h={1700}>
        <Img src={staticFile("setters-goz/closer-recorte.png")} style={{ width: "100%", height: "100%", filter: "contrast(1.1) brightness(1.02)" }} />
      </Capa>
      <Capa k={k} x={420} y={-430} z={120} w={150} h={150} rot={t * 0.6} esc={Math.max(0, rebote(t, CLOSERS + 14, 8, 240))}>
        <Estrella color={TINTA} tam={150} />
      </Capa>
      <Capa k={k} x={-430} y={330} z={-120} w={90} h={90} rot={-t * 0.8} esc={Math.max(0, rebote(t, CLOSERS + 20, 8, 240))}>
        <Estrella color={AMBAR} tam={90} />
      </Capa>
      {/* la frase, más cerca de la cámara que el sujeto */}
      <Capa k={k} x={0} y={-430} z={-170} w={1000} h={220} op={frase1Sal} desenf={(1 - frase1Sal) * 14}>
        <Tipeo t={t} desde={V1} renglones={T1} tam={96} />
      </Capa>

      {/* ===== ESCENA 2: el cierre ===== */}
      <Capa k={k} x={X2} y={-690} z={-170} w={600} h={60} op={interpolate(t, [BARRIDO[1] - 10, BARRIDO[1] + 10], [0, 1], cl)}>
        <div style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 24, letterSpacing: "0.42em", color: "#5d5953", textAlign: "center", lineHeight: "60px" }}>N° 0002</div>
      </Capa>
      <Capa k={k} x={X2 + 470} y={540} z={-30} w={520} h={150} rot={90} op={interpolate(t, [BARRIDO[1], BARRIDO[1] + 20], [0, 1], cl)}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: BARRAS, fontSize: 96, lineHeight: 0.9, color: TINTA }}>CIERRE02</div>
          <div style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 18, letterSpacing: "0.5em", color: "#3b3834" }}>PRIMERA SEÑAL · 00:00</div>
        </div>
      </Capa>
      {/* la foto del cierre como copia en papel, con borde blanco y sombra: cae y rebota sobre la pared */}
      <Capa k={k} x={X2 + 20} y={420 - (1 - cae) * 900} z={40} w={900} h={1000} rot={-3 - (1 - cae) * 14}>
        <div style={{ width: "100%", height: "100%", background: "#fbfaf7", padding: 20, boxSizing: "border-box", boxShadow: "0 40px 70px rgba(30,25,20,0.28), 0 6px 14px rgba(30,25,20,0.2)" }}>
          <Img src={staticFile("setters-goz/cierre.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%", filter: "contrast(1.08)" }} />
        </div>
      </Capa>
      <Capa k={k} x={X2 - 390} y={-90} z={-60} w={110} h={110} rot={t * 0.7} esc={Math.max(0, rebote(t, CIERRE + 16, 8, 240))}>
        <Estrella color={AMBAR} tam={110} />
      </Capa>
      <Capa k={k} x={X2 + 420} y={-360} z={100} w={70} h={70} rot={-t} esc={Math.max(0, rebote(t, CIERRE + 22, 8, 240))}>
        <Estrella color={TINTA} tam={70} />
      </Capa>
      <Confeti k={k} desde={CIERRE - 4} hasta={DUR_V2 - 40} n={22} cx={X2} ancho={1500} semilla="b" />
      <Capa k={k} x={X2} y={-500} z={-170} w={1000} h={220} op={interpolate(t, [V2 - 4, V2 + 2], [0, 1], cl)}>
        <div style={{ position: "relative" }}>
          <Tipeo t={t} desde={V2} renglones={T2} tam={96} />
        </div>
      </Capa>
      <Capa k={k} x={X2 - 10} y={-190} z={-90} w={1000} h={360}>
        {t >= CIERRE - 2 ? (
          <div style={{ position: "relative", width: 1000, height: 360, display: "flex", justifyContent: "center" }}>
            <Letras t={t} en={CIERRE} texto="cierre." paso={2.6} style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 330, color: AMBAR, letterSpacing: "-0.03em", lineHeight: 1 }} />
            <div style={{ position: "absolute", left: 150, top: 312, height: 6, width: 700 * subraya, background: AMBAR }} />
          </div>
        ) : null}
      </Capa>

      {/* ===== primer plano: nubes que la cámara atraviesa y papelitos ===== */}
      {[
        { x: -520, y: -300, z: -1550, w: 2200, src: "nube1", sale: -1 },
        { x: 560, y: 380, z: -1450, w: 2400, src: "nube2", sale: 1 },
        { x: 80, y: -900, z: -1250, w: 2000, src: "nube1", sale: 1 },
      ].map((n, i) => {
        const abre = interpolate(t, [0, 70], [0, 1], { ...cl, easing: Easing.out(Easing.quad) });
        return (
          <Capa key={`n${i}`} k={k} x={n.x + n.sale * abre * 900} y={n.y} z={n.z} w={n.w} h={n.w * 0.6} op={interpolate(t, [40, 75], [1, 0], cl)} dof={0.7}>
            <Img src={staticFile(`setters-goz/${n.src}.png`)} style={{ width: "100%", height: "100%" }} />
          </Capa>
        );
      })}
      {[
        { x: 900, y: -250, z: -500, w: 2600, src: "nube2" },
        { x: 1300, y: 500, z: -380, w: 2300, src: "nube1" },
      ].map((n, i) => (
        <Capa key={`m${i}`} k={k} x={n.x} y={n.y} z={n.z} w={n.w} h={n.w * 0.6}
          op={interpolate(t, [BARRIDO[0] - 10, BARRIDO[0] + 20, BARRIDO[1] - 12, BARRIDO[1] + 10], [0, 0.95, 0.95, 0], cl)} dof={0.6}>
          <Img src={staticFile(`setters-goz/${n.src}.png`)} style={{ width: "100%", height: "100%" }} />
        </Capa>
      ))}
      <Confeti k={k} desde={BARRIDO[0] - 30} hasta={BARRIDO[1] + 50} n={46} cx={X2 * 0.55} ancho={2600} semilla="a" />
    </AbsoluteFill>
  );
};

// Muestras por cuadro según la velocidad de la cámara: desenfoque de movimiento real solo cuando hace falta.
export const velocidad = (f: number) => {
  const a = camara(f - 0.5), b = camara(f + 0.5);
  return Math.hypot(b.x - a.x, b.y - a.y, (b.z - a.z) * 0.6) + Math.abs(b.roll - a.roll) * 1500;
};

export const MuestraGozV2: React.FC = () => {
  const f = useCurrentFrame();
  const v = velocidad(f);
  const n = v > 30 ? 8 : v > 10 ? 5 : 1;
  const fin = interpolate(f, [DUR_V2 - 14, DUR_V2], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: "#e7e5e1" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={n === 1 ? f : f - 0.35 + (0.7 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="grano2"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 3)} />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.075 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 58%, rgba(55,48,40,0.2))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#grano2)" /></svg>
      <AbsoluteFill style={{ background: "#e7e5e1", opacity: fin }} />
      <Sequence from={V1}><Audio src={staticFile("voz-setters-rc/01-anios.mp3")} /></Sequence>
      <Sequence from={V2}><Audio src={staticFile("voz-setters-rc/02-cierre.mp3")} /></Sequence>
      <Audio src={staticFile("setters-goz/sfx-muestra-v2.wav")} volume={0.62} />
    </AbsoluteFill>
  );
};
