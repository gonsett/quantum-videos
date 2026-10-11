import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Capa, Ctx, Cam, cl, ease, rebote, sacudida, TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO, RC } from "../ring-closers/tema";

/**
 * "Actualizaciones RC #1: Oficina 3D" — video completo (10/10/2026), 36 s, 60 fps, un solo plano continuo.
 * Parte de la muestra aprobada (Muestra.tsx) y la estira a 7 escenas con la voz Callirrhoe:
 * la oficina real en paneles de vidrio repartidos en el espacio; la cámara viaja de uno a otro sin cortes.
 * Capturas reales de la app (datos de demostración) en public/oficina-rc/app/.
 */
const VERDE = RC.esmeralda500;
export const DUR_OFI_V = 2160;

// Arranque de cada toma de voz (cuadros) y su largo (s): 01-vivo … 07-lugar.
export const VOZ = [30, 236, 650, 1030, 1310, 1712, 1836];
const LARGO = [2.84, 6.44, 5.96, 4.24, 6.24, 1.68, 3.4];
const VOZ_ARCH = ["01-vivo", "02-equipo", "03-dia", "04-toque", "05-canales", "06-recreo", "07-lugar"];
// palabra clave dentro de cada toma (s desde el arranque de la toma)
const w = (i: number, s: number) => VOZ[i] + Math.round(s * 60);

// Dónde vive cada panel en el mundo
const X0 = 0, X1 = 2700, X2 = 5400, X3 = 8100, X4 = 11000;
const PY = 250;                       // los paneles van un poco por debajo del centro
const PW = 1280, PH = 1000;           // las capturas son 1280×1000 (CSS) a DPR 2

// ---------- cámara: llaves suaves + deriva continua (nunca queda quieta) ----------
type Llave = [number, number, number, number];   // t, x, y, z
const LLAVES: Llave[] = [
  [0, X0, -30, -2650],
  [80, X0, -30, -2000],
  [205, X0, -10, -1900],
  [275, X0, 60, -2250],                 // retrocede para ver a todo el equipo
  [620, X0, 60, -2080],
  [700, X0, 50, -1960],
  [1010, X0, 40, -1800],
  [1130, X0, 40, -1820],
  [1190, X1, 0, -2000],                 // viaje a la llamada
  [1295, X1, 0, -1830],
  [1360, X2, 0, -2080],                 // viaje a canales
  [1695, X2, 0, -1880],
  [1745, X3, 20, -2000],                // recreo
  [1830, X3 + 1250, 40, -1900],         // se desliza al gimnasio
  [1890, X4, -80, -2500],               // retrocede: todo en un solo lugar
  [1975, X4, -110, -2350],
  [2050, X4, -620, -1720],              // empuja hasta el logo
  [2160, X4, -640, -1640],
];
const curva = Easing.inOut(Easing.cubic);
const llave = (t: number) => {
  let i = 0;
  while (i < LLAVES.length - 2 && t > LLAVES[i + 1][0]) i++;
  const [ta, xa, ya, za] = LLAVES[i], [tb, xb, yb, zb] = LLAVES[i + 1];
  const u = curva(Math.min(1, Math.max(0, (t - ta) / (tb - ta))));
  return { x: xa + (xb - xa) * u, y: ya + (yb - ya) * u, z: za + (zb - za) * u, u, viaje: Math.abs(xb - xa) > 100 ? Math.sin(Math.PI * u) : 0, dir: Math.sign(xb - xa) };
};
const camara = (t: number): Cam => {
  const k = llave(t);
  const z = k.z + 260 * k.viaje + 70 * rebote(t, w(0, 1.85), 10, 200);
  const x = k.x + Math.sin(t / 90) * 12 + sacudida(t, w(0, 1.85), 6);
  const y = k.y + Math.sin(t / 70) * 8 + sacudida(t, w(0, 1.85) + 1, 5);
  const roll = (interpolate(t, [0, 80], [-7, 0], { ...cl, easing: ease }) + Math.sin(t / 120) * 0.6 + 3.5 * k.viaje * k.dir) * Math.PI / 180;
  const yaw = (Math.sin(t / 100) * 1.8 - 4 * k.viaje * k.dir) * Math.PI / 180;
  const pitch = (Math.sin(t / 130) * 1) * Math.PI / 180;
  return { x, y, z, roll, yaw, pitch };
};

// ficha: cuándo se toca a la persona, cuándo se levanta la tarjeta, cuándo se aprieta "Llamar"
const TOCA = w(2, 0.6), FICHA = w(2, 1.0), LEVANTA = [FICHA + 30, FICHA + 80];
const STATS = [w(2, 3.02), w(2, 3.85), w(2, 5.0)];
const APRIETA = w(3, 1.5);

const foco = (t: number) => interpolate(t, [0, 120, 230, LEVANTA[0], LEVANTA[1], APRIETA + 20, APRIETA + 60, 1980, 2040],
  [-260, -260, 0, 0, -700, -700, 0, 0, -120], { ...cl, easing: ease });

// ---------- piezas ----------
const Palabra: React.FC<{ t: number; en: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, en, children, style }) => {
  const r = rebote(t, en, 13, 160);
  const vis = interpolate(t, [en - 1, en + 7], [0, 1], cl);
  return (
    <span style={{ display: "inline-block", opacity: vis, transform: `translateY(${(1 - r) * 46}px) scale(${0.94 + 0.06 * r})`,
      filter: `blur(${(1 - vis) * 14}px)`, ...style }}>{children}</span>
  );
};
const acento = (t: number, en: number): React.CSSProperties => ({
  fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.19em", letterSpacing: "-0.02em", color: VERDE,
  textShadow: `0 0 40px rgba(16,185,129,${0.45 * interpolate(t, [en, en + 30], [1, 0.4], cl)})`,
});
const italicaBlanca: React.CSSProperties = { fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.19em", letterSpacing: "-0.02em" };

type Pal = { p: string; en: number; ac?: boolean; it?: boolean };
const Frase: React.FC<{ k: Ctx; x: number; y?: number; renglones: Pal[][]; sale: number; rotulo?: string; tam?: number }> = ({ k, x, y = -560, renglones, sale, rotulo, tam = 112 }) => {
  const t = k.t;
  const primera = renglones[0][0].en;
  const op = interpolate(t, [sale - 4, sale + 22], [1, 0], cl);
  if (t < primera - 30 || op <= 0) return null;
  return (
    <>
      {rotulo && (
        <Capa k={k} x={x} y={y - 200} z={-300} w={900} h={50} op={interpolate(t, [primera - 20, primera], [0, 1], cl) * op}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: "0.38em", color: "rgba(167,243,208,0.75)", textAlign: "center", lineHeight: "50px" }}>{rotulo}</div>
        </Capa>
      )}
      <Capa k={k} x={x} y={y} z={-300} w={1150} h={300} op={op} dof={0.25} desenf={(1 - op) * 18}>
        <div style={{ textAlign: "center", color: "#f4f4f5", fontFamily: TIGHT, fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.02 }}>
          {renglones.map((r, i) => (
            <div key={i}>{r.map((pal, j) => (
              <React.Fragment key={j}>{j > 0 && " "}<Palabra t={t} en={pal.en} style={pal.ac ? acento(t, pal.en) : pal.it ? italicaBlanca : undefined}>{pal.p}</Palabra></React.Fragment>
            ))}</div>
          ))}
        </div>
      </Capa>
    </>
  );
};

const Pastilla: React.FC<{ txt: React.ReactNode; c?: string; icono?: React.ReactNode; tachar?: number }> = ({ txt, c, icono, tachar = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, height: 84, padding: "0 34px", borderRadius: 42, position: "relative",
    background: "rgba(18,18,21,0.82)", border: "1.5px solid rgba(255,255,255,0.10)", boxShadow: `0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
    whiteSpace: "nowrap" }}>
    {c && <span style={{ width: 18, height: 18, borderRadius: 9, background: c, boxShadow: `0 0 18px ${c}` }} />}
    {icono}
    <span style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 36, color: tachar > 0.5 ? "rgba(237,237,238,0.55)" : "#ededee", letterSpacing: "-0.01em", position: "relative" }}>
      {txt}
      {tachar > 0 && <span style={{ position: "absolute", left: -4, top: "52%", height: 4, borderRadius: 2, width: `calc(${tachar * 100}% + 8px)`, background: "#f43f5e" }} />}
    </span>
  </div>
);
const Parlante = () => (
  <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#a7f3d0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

// Panel de vidrio con una captura; entra girando desde un ángulo y queda de frente.
const Panel: React.FC<{ k: Ctx; x: number; y?: number; z?: number; desde: number; giro?: [number, number, number]; brillo?: number; op?: number; esc?: number; children: React.ReactNode }> =
  ({ k, x, y = PY, z = 0, desde, giro = [-26, 14, -4], brillo = 0, op = 1, esc = 1, children }) => {
    const t = k.t;
    const g = interpolate(t, [desde, desde + 70], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
    const sweep = interpolate(t, [desde + 20, desde + 90], [0, 1], cl);
    return (
      <Capa k={k} x={x} y={y} z={z} w={PW} h={PH} op={op} esc={esc}>
        <div style={{ width: "100%", height: "100%", transform: `perspective(2600px) rotateY(${giro[0] * (1 - g)}deg) rotateX(${giro[1] * (1 - g)}deg) rotateZ(${giro[2] * (1 - g)}deg)`, transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", inset: -24, borderRadius: 50, background: "rgba(255,255,255,0.035)", border: "1.5px solid rgba(255,255,255,0.09)",
            boxShadow: `0 120px 220px rgba(0,0,0,0.75), 0 0 140px rgba(16,185,129,${0.16 + 0.25 * brillo})` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 30, overflow: "hidden", border: `1.5px solid rgba(16,185,129,${0.3 + 0.4 * brillo})`, background: "#0b0b0d" }}>
            {children}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${-20 + 120 * sweep}%, rgba(255,255,255,0.10) ${-12 + 120 * sweep}%, transparent ${-2 + 120 * sweep}%)` }} />
          </div>
        </div>
      </Capa>
    );
  };
const Foto: React.FC<{ n: string; op?: number; style?: React.CSSProperties }> = ({ n, op = 1, style }) => (
  <Img src={staticFile(`oficina-rc/app/${n}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: op, filter: "contrast(1.06) saturate(1.08)", ...style }} />
);

// Toque: círculo que se aprieta y onda que se abre
const Toque: React.FC<{ t: number; en: number }> = ({ t, en }) => {
  if (t < en - 14 || t > en + 50) return null;
  const baja = interpolate(t, [en - 14, en, en + 10], [0, 1, 0.6], cl);
  const onda = interpolate(t, [en, en + 40], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: -60, top: -60, width: 120, height: 120 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid rgba(255,255,255,${0.9 * (1 - onda)})`, transform: `scale(${0.4 + 1.6 * onda})` }} />
      <div style={{ position: "absolute", inset: 30, borderRadius: "50%", background: `rgba(255,255,255,${0.55 * baja})`, transform: `scale(${1.2 - 0.3 * baja})`, boxShadow: "0 0 30px rgba(255,255,255,0.5)" }} />
    </div>
  );
};

// ---------- la escena ----------
// Tarjeta de Lucas recortada de la captura: en la foto ocupa x 1848–2486, y 398–896 (px a DPR 2).
const CARD = { x: 1848, y: 398, w: 638, h: 498 };
const CARD_REL = { x: (CARD.x + CARD.w / 2) / 2 - PW / 2, y: (CARD.y + CARD.h / 2) / 2 - PH / 2 };   // centro, relativo al panel (mundo)
const CAJAS = [32, 228, 424];          // cajas de LLAMADAS / CIERRES / COBRADO dentro de la tarjeta (px DPR 2), y 218–362

const Escena: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camara(t), fz: foco(t) };
  const sube = rebote(t, 4, 15, 70);
  const cuadro = Math.min(179, Math.max(0, Math.floor(t / 2)));

  // escena 1→3: el mismo panel; la grabación se funde en la foto del equipo, y después en la de la ficha
  const aEquipo = interpolate(t, [VOZ[1] - 10, VOZ[1] + 30], [0, 1], cl);
  const aFicha = interpolate(t, [FICHA - 4, FICHA + 10], [0, 1], cl);
  const lev = interpolate(t, LEVANTA, [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const levR = rebote(t, LEVANTA[0] + 20, 12, 120);
  // la tarjeta vuela hacia la llamada después del toque
  const vuela = interpolate(t, [APRIETA + 14, APRIETA + 74], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const panel0Op = interpolate(t, [APRIETA + 20, APRIETA + 70], [1, 0.0], cl);
  const atenua = 1 - 0.55 * lev * (1 - vuela);

  const cardX = X0 + CARD_REL.x * (1 - lev) + (X1 - X0) * vuela;
  const cardY = PY + CARD_REL.y * (1 - lev) + 210 * lev * (1 - vuela) + (PY - 210) * 0;
  const cardZ = -700 * Math.min(lev, 1 - vuela) - 2 * levR;
  const cardEsc = 1 + 0.9 * Math.min(lev, 1 - vuela * 0.95);
  const cardOp = (t >= FICHA ? 1 : 0) * interpolate(vuela, [0.6, 1], [1, 0], cl) * (lev > 0.001 || t < LEVANTA[0] ? 1 : 1);
  const tarjetaSuelta = t >= LEVANTA[0] - 1;

  const ESTADOS = [
    { txt: "En llamada", c: "#f43f5e", x: -300, y: -40, z: -160, en: w(1, 3.65) },
    { txt: "En roleplay", c: "#f59e0b", x: 300, y: 130, z: -300, en: w(1, 4.7) },
    { txt: "Disponible", c: "#10b981", x: -250, y: 640, z: -220, en: w(1, 5.75) },
  ];
  const pastSale = FICHA - 10;

  return (
    <AbsoluteFill style={{ background: "#040405", overflow: "hidden" }}>
      {/* resplandor esmeralda enorme que se desplaza */}
      <AbsoluteFill style={{ filter: "blur(120px)", opacity: interpolate(t, [0, 50], [0.25, 1], cl) }}>
        <div style={{ position: "absolute", width: 1300, height: 1300, borderRadius: "50%", left: -260 + Math.sin(t / 80) * 160, top: 380 + Math.cos(t / 95) * 220,
          background: "radial-gradient(circle, rgba(16,185,129,0.55), rgba(16,185,129,0) 65%)" }} />
        <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", left: 380 + Math.cos(t / 70) * 140, top: 1080 + Math.sin(t / 85) * 180,
          background: "radial-gradient(circle, rgba(5,150,105,0.45), rgba(5,150,105,0) 65%)" }} />
        <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", left: 300 + Math.sin(t / 150) * 200, top: -200 + interpolate(t, [1950, DUR_OFI_V], [0, 500], cl),
          background: "radial-gradient(circle, rgba(52,211,153,0.28), rgba(52,211,153,0) 65%)", opacity: 0.25 + 0.75 * interpolate(t, [1950, 2030], [0, 1], cl) }} />
      </AbsoluteFill>

      {/* polvo: acompaña a la cámara en x para que siempre haya */}
      {Array.from({ length: 30 }, (_, i) => {
        const r = (m: number) => random(`polvo-${i}-${m}`);
        const cx = k.c.x, span = 2800;
        const px = cx + ((((r(1) * span - cx) % span) + span) % span) - span / 2;
        return (
          <Capa key={i} k={k} x={px} y={(r(2) - 0.5) * 3600 - t * (0.4 + r(3))} z={-900 + r(4) * 1700} w={10} h={10} op={0.25 + r(5) * 0.4} dof={0.6}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#a7f3d0" }} />
          </Capa>
        );
      })}

      {/* ===== 1–3: la oficina (grabación → equipo → ficha) ===== */}
      <Panel k={k} x={X0} y={PY + (1 - sube) * 900} z={160 * (1 - aEquipo)} desde={60} giro={[-30, 16, -4]} op={panel0Op} brillo={interpolate(t, [190, 230, 270], [0, 1, 0], cl)}>
        {aEquipo < 1 && <Img src={staticFile(`oficina-rc/f/${String(cuadro + 1).padStart(3, "0")}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.08) saturate(1.1)" }} />}
        <Foto n="equipo" op={aEquipo} />
        <Foto n="ficha" op={aFicha} />
        {/* la tarjeta, mientras está suelta, deja su hueco a oscuras en la captura */}
        {tarjetaSuelta && <div style={{ position: "absolute", left: CARD.x / 2, top: CARD.y / 2, width: CARD.w / 2, height: CARD.h / 2, borderRadius: 14, background: "rgba(10,10,12,0.85)", opacity: lev * (1 - vuela) }} />}
        <div style={{ position: "absolute", inset: 0, background: "#040405", opacity: 1 - atenua }} />
        {/* toque sobre Lucas */}
        <div style={{ position: "absolute", left: 290, top: 404 }}><Toque t={t} en={TOCA} /></div>
      </Panel>

      {/* estados del equipo, sincronizados con la voz */}
      {ESTADOS.map((e) => {
        const r = rebote(t, e.en, 11, 170);
        const op = interpolate(t, [e.en - 2, e.en + 8], [0, 1], cl) * interpolate(t, [pastSale, pastSale + 24], [1, 0], cl);
        if (op <= 0) return null;
        return (
          <Capa key={e.txt} k={k} x={X0 + e.x} y={e.y + (1 - r) * 120} z={e.z - (1 - r) * 500} w={460} h={84} op={op} esc={0.8 + 0.2 * r}>
            <div style={{ display: "flex", justifyContent: "center" }}><Pastilla txt={e.txt} c={e.c} /></div>
          </Capa>
        );
      })}

      {/* la tarjeta de Lucas, que se levanta del panel y después vuela a la llamada */}
      {tarjetaSuelta && cardOp > 0 && (
        <Capa k={k} x={cardX} y={cardY} z={cardZ} w={CARD.w / 2} h={CARD.h / 2} esc={cardEsc} op={cardOp} rot={-3 * Math.sin(Math.PI * lev) + 6 * vuela}>
          <div style={{ position: "relative", width: CARD.w / 2, height: CARD.h / 2, borderRadius: 14, overflow: "hidden",
            boxShadow: `0 40px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px rgba(16,185,129,${0.25 * lev})`,
            backgroundImage: `url(${staticFile("oficina-rc/app/ficha.png")})`, backgroundSize: `${2560 / 2}px ${2000 / 2}px`, backgroundPosition: `${-CARD.x / 2}px ${-CARD.y / 2}px` }}>
            {CAJAS.map((cx, i) => {
              const on = interpolate(t, [STATS[i] - 2, STATS[i] + 8], [0, 1], cl);
              const pulso = rebote(t, STATS[i], 9, 220);
              return (
                <div key={i} style={{ position: "absolute", left: cx / 2, top: 218 / 2, width: 180 / 2, height: 144 / 2, borderRadius: 8,
                  border: `1.5px solid rgba(16,185,129,${on})`, boxShadow: `0 0 ${14 * on}px rgba(16,185,129,${0.7 * on}), inset 0 0 ${12 * on}px rgba(16,185,129,${0.25 * on})`,
                  transform: `scale(${1 + 0.06 * on * (1 - pulso) + 0.0})` }} />
              );
            })}
            {/* toque en "Llamar" (x 197–382, y 394–464) */}
            <div style={{ position: "absolute", left: 290 / 2, top: 429 / 2, transform: "scale(0.5)" }}><Toque t={t} en={APRIETA} /></div>
          </div>
        </Capa>
      )}

      <Frase k={k} x={X0} renglones={[[{ p: "Tu", en: w(0, 0.29) }, { p: "oficina,", en: w(0, 0.45) }], [{ p: "ahora", en: w(0, 1.45) }, { p: "en vivo.", en: w(0, 1.85), ac: true }]]}
        sale={VOZ[1] - 6} rotulo="NUEVO · OFICINA 3D" tam={118} />
      <Frase k={k} x={X0} renglones={[[{ p: "Todo", en: w(1, 0.9) }, { p: "tu", en: w(1, 1.12) }, { p: "equipo,", en: w(1, 1.28) }], [{ p: "en", en: w(1, 1.7) }, { p: "tiempo", en: w(1, 1.8) }, { p: "real.", en: w(1, 2.05) }]]}
        sale={VOZ[2] - 8} rotulo="EQUIPO · EN VIVO" />
      <Frase k={k} x={X0} renglones={[[{ p: "Tocás", en: w(2, 0.34) }, { p: "a", en: w(2, 0.75) }, { p: "cualquiera", en: w(2, 0.88) }], [{ p: "y", en: w(2, 1.82) }, { p: "ves", en: w(2, 1.95) }, { p: "su día.", en: w(2, 2.15), ac: true }]]}
        sale={VOZ[3] - 6} />

      {/* ===== 4: la llamada ===== */}
      {(() => {
        const llega = interpolate(t, [APRIETA + 30, APRIETA + 80], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
        const pul = (n: number) => ((t - APRIETA - 60 - n * 30) % 90 + 90) % 90 / 90;
        const sinZ = w(3, 2.18), sinL = w(3, 3.05);
        return (
          <>
            <Panel k={k} x={X1} desde={APRIETA + 20} giro={[24, -10, 3]} op={llega * interpolate(t, [1340, 1380], [1, 0.25], cl)} esc={0.85 + 0.15 * llega}>
              <Foto n="llamar" />
              {t > APRIETA + 50 && [0, 1, 2].map((n) => (
                <div key={n} style={{ position: "absolute", left: "50%", top: "47.7%", width: 120, height: 120, marginLeft: -60, marginTop: -60, borderRadius: "50%",
                  border: "2px solid rgba(16,185,129,0.8)", opacity: (1 - pul(n)) * 0.9, transform: `scale(${1 + 3 * pul(n)})` }} />
              ))}
            </Panel>
            {[{ txt: "Sin Zoom", x: -230, y: 60, z: -260, en: sinZ }, { txt: "Sin links", x: 230, y: 470, z: -200, en: sinL }].map((p) => {
              const r = rebote(t, p.en, 11, 170);
              const op = interpolate(t, [p.en - 2, p.en + 8], [0, 1], cl) * interpolate(t, [VOZ[4], VOZ[4] + 26], [1, 0], cl);
              if (op <= 0) return null;
              return (
                <Capa key={p.txt} k={k} x={X1 + p.x} y={p.y + (1 - r) * 120} z={p.z - (1 - r) * 400} w={400} h={84} op={op} esc={1.35} dof={0.3}>
                  <div style={{ display: "flex", justifyContent: "center" }}><Pastilla txt={p.txt} tachar={interpolate(t, [p.en + 12, p.en + 26], [0, 1], { ...cl, easing: ease })} /></div>
                </Capa>
              );
            })}
            <Frase k={k} x={X1} renglones={[[{ p: "Lo", en: w(3, 0.55) }, { p: "llamás", en: w(3, 0.72) }, { p: "con", en: w(3, 1.15) }], [{ p: "un toque.", en: w(3, 1.35), ac: true }]]} sale={VOZ[4] - 4} />
          </>
        );
      })()}

      {/* ===== 5: canales y salas de voz ===== */}
      {(() => {
        const llega = interpolate(t, [VOZ[4] - 20, VOZ[4] + 30], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
        const SALAS = [
          { txt: "Sala de equipo", gente: ["SM", "TA", "JS"], x: 230, y: -60, z: -260, en: w(4, 2.3) },
          { txt: "La esquina", gente: ["AV", "LF"], x: -230, y: 560, z: -200, en: w(4, 2.9) },
        ];
        return (
          <>
            <Panel k={k} x={X2} desde={VOZ[4] - 20} giro={[-22, 12, -3]} op={llega * interpolate(t, [1720, 1770], [1, 0.25], cl)} esc={0.85 + 0.15 * llega}>
              <Foto n="canales" />
            </Panel>
            {SALAS.map((s) => {
              const r = rebote(t, s.en, 11, 170);
              const op = interpolate(t, [s.en - 2, s.en + 8], [0, 1], cl) * interpolate(t, [VOZ[5] - 10, VOZ[5] + 16], [1, 0], cl);
              if (op <= 0) return null;
              return (
                <Capa key={s.txt} k={k} x={X2 + s.x} y={s.y + (1 - r) * 120} z={s.z - (1 - r) * 400} w={600} h={84} op={op}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Pastilla icono={<Parlante />} txt={<span style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>{s.txt}
                      <span style={{ display: "inline-flex" }}>{s.gente.map((g, i) => (
                        <span key={g} style={{ width: 46, height: 46, borderRadius: 23, marginLeft: i ? -12 : 0, background: "#26262b", border: "2px solid #121215",
                          fontFamily: TIGHT, fontWeight: 600, fontSize: 18, color: "#d4d4d8", display: "inline-flex", alignItems: "center", justifyContent: "center",
                          opacity: interpolate(t, [s.en + 6 + i * 5, s.en + 12 + i * 5], [0, 1], cl) }}>{g}</span>
                      ))}</span></span>} />
                  </div>
                </Capa>
              );
            })}
            <Frase k={k} x={X2} renglones={[[{ p: "Canales", en: w(4, 0.54) }, { p: "y", en: w(4, 2.03) }, { p: "salas", en: w(4, 2.2) }, { p: "de", en: w(4, 2.55) }, { p: "voz,", en: w(4, 2.7) }],
              [{ p: "todo", en: w(4, 4.06) }, { p: "adentro.", en: w(4, 4.35), ac: true }]]} sale={VOZ[5] - 6} tam={104} />
          </>
        );
      })()}

      {/* ===== 6: recreo y gimnasio ===== */}
      {(() => {
        const llega = interpolate(t, [VOZ[5] - 30, VOZ[5] + 20], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
        const sale = interpolate(t, [1860, 1900], [1, 0], cl);
        return (
          <>
            <Panel k={k} x={X3} desde={VOZ[5] - 30} giro={[24, -12, 3]} op={llega * sale} esc={0.85 + 0.15 * llega}><Foto n="recreo" /></Panel>
            <Panel k={k} x={X3 + 1450} y={PY + 60} z={300} desde={VOZ[5] + 10} giro={[-20, 10, -3]} op={interpolate(t, [VOZ[5] + 10, VOZ[5] + 50], [0, 1], cl) * sale}><Foto n="gimnasio" /></Panel>
            <Frase k={k} x={k.c.x * 0.8 + (X3 + 600) * 0.2} renglones={[[{ p: "Hasta", en: w(5, 0.26) }, { p: "el", en: w(5, 0.6) }, { p: "recreo.", en: w(5, 0.96), it: true }]]} sale={VOZ[6] - 4} />
          </>
        );
      })()}

      {/* ===== 7: todo en un solo lugar, y el logo ===== */}
      {(() => {
        const FOTOS = ["app/equipo.png", "app/ficha.png", "f/090.jpg", "app/canales.png", "app/recreo.png", "app/gimnasio.png"];
        const ab = interpolate(t, [2010, 2050], [1, 0], cl);
        return (
          <>
            {FOTOS.map((n, i) => {
              const en = VOZ[6] + 10 + i * 7;
              const r = rebote(t, en, 12, 140);
              const col = i % 3, fila = Math.floor(i / 3);
              const op = interpolate(t, [en - 2, en + 10], [0, 1], cl) * ab;
              if (op <= 0) return null;
              return (
                <Capa key={n} k={k} x={X4 + (col - 1) * 470 + (1 - r) * (col - 1) * 600} y={260 + fila * 400 + (1 - r) * 500} z={200 + (1 - r) * 900 - 60 * col} w={420} h={328} op={op} rot={(col - 1) * 3 * (1 - r)}>
                  <div style={{ width: "100%", height: "100%", borderRadius: 14, overflow: "hidden", border: "1.5px solid rgba(16,185,129,0.4)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
                    <Img src={staticFile(`oficina-rc/${n}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </Capa>
              );
            })}
            <Frase k={k} x={X4} y={-470} renglones={[[{ p: "Tu", en: w(6, 0.27) }, { p: "equipo,", en: w(6, 0.71) }], [{ p: "en", en: w(6, 1.58) }, { p: "un solo lugar.", en: w(6, 1.8), ac: true }]]} sale={2000} />
            {(() => {
              const LOGO = 2030;
              return (
                <Capa k={k} x={X4} y={-610} z={-120} w={900} h={700} op={interpolate(t, [LOGO - 6, LOGO + 4], [0, 1], cl)}>
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
              );
            })()}
          </>
        );
      })()}
    </AbsoluteFill>
  );
};

const velocidad = (f: number) => {
  const a = camara(f - 0.5), b = camara(f + 0.5);
  return Math.hypot(b.x - a.x, b.y - a.y, (b.z - a.z) * 0.6) + Math.abs(b.roll - a.roll) * 1500;
};

export const VideoOficina: React.FC = () => {
  const f = useCurrentFrame();
  const v = velocidad(f);
  const n = v > 40 ? 8 : v > 22 ? 6 : v > 9 ? 4 : 1;
  return (
    <AbsoluteFill style={{ background: "#040405" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={n === 1 ? f : f - 0.35 + (0.7 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="granoOfiV"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 3)} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#granoOfiV)" /></svg>
      <AbsoluteFill style={{ background: "#040405", opacity: interpolate(f, [0, 8], [1, 0], cl) }} />
      {VOZ.map((d, i) => (
        <Sequence key={i} from={d} durationInFrames={Math.ceil(LARGO[i] * 60) + 10}>
          <Audio src={staticFile(`voz-oficina-rc/${VOZ_ARCH[i]}.mp3`)} />
        </Sequence>
      ))}
      <Audio src={staticFile("oficina-rc/sfx-video.wav")} />
    </AbsoluteFill>
  );
};
