import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MONO, RC } from "../ring-closers/tema";
import { SANS, SERIF } from "../historias-rc/como-funciona";
import { Logo } from "../reel-rc/logo";
import { Acabado } from "../secreto-rc/efectos";
import { G, INI, TOTAL } from "./timeline";
import { Llamada3D, MonedaNegra3D, Pelea3D } from "./Oro3D";

/**
 * "Lo que dejaste sobre la mesa" (02/10/2026). Mesa de negociación de noche: vidrio negro que refleja, una lámpara
 * cálida, oro real (fotos FLUX recortadas en public/comision-rc). Lenguaje de película: cámara continua con peso,
 * profundidad de campo, polvo en la luz, destellos anamórficos, monedas que caen con desenfoque de movimiento,
 * golpes de cámara en los cortes. Una sola escena negra ("Se entrenan antes": una moneda gira en la oscuridad)
 * y placa de logo. Datos inventados: montos, nombres, reacciones.
 */
export const DURACION = TOTAL;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const iv = (f: number, a: number, b: number, o = 0, t = 1, e: (x: number) => number = ease) =>
  interpolate(f, [a, b], [o, t], { ...cl, easing: e });
const ESM = "#19c58c", ORO = "#e9b955", ROJO = "#d4675c";

// ── tiempos (todos salen de la voz; si Whisper parte una palabra, cae al inicio de la escena + margen) ──
const g = (e: string, p: string, vez = 1, fb = 0) => {
  try { return G(e, p, vez); } catch { return INI(e) + fb; }
};
const [S1, S2, S3, S4, S5, S6, S7, S8, S9] = ["e1-grupo", "e2-record", "e3-mesa", "e4-objeciones", "e5-venta", "e6-antes", "e7-ring", "e8-otro", "e9-cierre"].map(INI);
const W = {
  grupo: g("e1-grupo", "grupo", 1, 50), comisionaste: g("e1-grupo", "comisionaste", 1, 100),
  felicitan: g("e2-record", "felicitan", 1, 10), record: g("e2-record", "record", 1, 50),
  nadie: g("e3-mesa", "nadie", 1, 10), cuanto: g("e3-mesa", "cuanto", 1, 80), mesa: g("e3-mesa", "mesa", 1, 130),
  pensar: g("e4-objeciones", "pensar", 1, 40), caro: g("e4-objeciones", "caro", 1, 110), pareja: g("e4-objeciones", "pareja", 1, 190),
  cada: g("e5-venta", "cada", 1, 4), venta: g("e5-venta", "venta", 1, 40), fue: g("e5-venta", "fue", 1, 90),
  llamada: g("e6-antes", "llamada", 1, 50), plata: g("e6-antes", "plata", 1, 90), entrenan: g("e6-antes", "entrenan", 1, 120), antes: g("e6-antes", "antes", 1, 150),
  tira: g("e7-ring", "tira", 1, 70), roleplay: g("e7-ring", "roleplay", 1, 100), respondes: g("e7-ring", "respondes", 1, 140),
  equivocas: g("e7-ring", "equivocas", 1, 170), puntua: g("e7-ring", "puntua", 1, 205),
  numero: g("e8-otro", "numero", 1, 50), otro: g("e8-otro", "otro", 1, 100),
  ring: g("e9-cierre", "ring", 1, 8), closers: g("e9-cierre", "closers", 1, 20),
};
const NEGRO_DESDE = W.entrenan - 3;
const OBJ = [
  { en: W.pensar, x: 340, y: 712, txt: ["LO TENGO", "QUE PENSAR"], monto: 2400 },
  { en: W.caro, x: 560, y: 742, txt: ["ES CARO"], monto: 1900 },
  { en: W.pareja, x: 780, y: 712, txt: ["LO TENGO QUE", "HABLAR CON", "MI PAREJA"], monto: 3100 },
].map((o) => ({ ...o, cae: o.en + 8 }));
/** golpes de cámara: cuadros donde la imagen recibe el golpe (y el sonido el impacto) */
export const GOLPES = [W.comisionaste, W.mesa, ...OBJ.map((o) => o.cae + 6), W.fue + 4, NEGRO_DESDE, S7, W.puntua, W.numero, W.ring];

const punch = (f: number) => GOLPES.reduce((a, gp) => a + (f >= gp && f < gp + 10 ? Math.exp(-(f - gp) / 3) : 0), 0);
const flash = (f: number, gs: number[], k = 0.16) => gs.reduce((a, gp) => a + (f >= gp && f < gp + 8 ? k * Math.exp(-(f - gp) / 2.2) : 0), 0);
const sacude = (f: number, gs: number[], k = 1) => gs.reduce((a, gp) => a + (f >= gp && f < gp + 8 ? Math.sin((f - gp) * 2.7) * (8 - (f - gp)) * k : 0), 0);

// ── cámara de la mesa: [cuadro, escala, y] con transiciones suaves entre llaves ──
const CAM: [number, number, number][] = [
  [S1, 1.72, -400], [W.comisionaste + 20, 1.86, -470], [W.nadie, 1.9, -490],
  [W.cuanto + 6, 1.0, 560], [S4 + 4, 1.0, 560], [S4 + 30, 1.55, 589], [S5, 1.6, 575],
  [W.venta + 6, 1.62, 565], [W.fue + 30, 1.0, 560],
  [S6, 1.0, 560], [S6 + 26, 1.62, -380], [NEGRO_DESDE, 1.74, -430],
  [S8, 1.62, -380], [S9, 1.78, -440],
];
const camara = (f: number) => {
  let i = 0;
  while (i < CAM.length - 1 && f > CAM[i + 1][0]) i++;
  const [a, s0, y0] = CAM[i], [b, s1, y1] = CAM[Math.min(i + 1, CAM.length - 1)];
  const t = b === a ? 1 : iv(f, a, b, 0, 1, io);
  return { s: s0 + (s1 - s0) * t, y: y0 + (y1 - y0) * t };
};

/** Destello anamórfico: raya horizontal azulada + núcleo cálido (como un lente de cine). */
const Flare: React.FC<{ x: number; y: number; a: number; ancho?: number }> = ({ x, y, a, ancho = 900 }) =>
  a <= 0.01 ? null : (
    <>
      <div style={{ position: "absolute", left: x - ancho / 2, top: y - 3, width: ancho, height: 6, opacity: a, background: "linear-gradient(90deg, transparent, rgba(140,190,255,0.55) 35%, rgba(255,245,225,0.95) 50%, rgba(140,190,255,0.55) 65%, transparent)", filter: "blur(2px)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: x - 70, top: y - 70, width: 140, height: 140, opacity: a, background: "radial-gradient(circle, rgba(255,236,200,0.9), rgba(255,200,120,0.25) 35%, transparent 65%)", mixBlendMode: "screen" }} />
    </>
  );

/** Polvo suspendido en el cono de la lámpara (determinista). */
const Polvo: React.FC<{ f: number; op: number }> = ({ f, op }) => (
  <>
    {Array.from({ length: 34 }, (_, i) => {
      const r = (k: number) => (Math.sin(i * 91.7 + k * 13.1) * 43758.5453) % 1;
      const x = 140 + Math.abs(r(1)) * 800 + Math.sin(f / 40 + i) * 20;
      const y = 120 + ((Math.abs(r(2)) * 1500 - f * (0.25 + Math.abs(r(3)) * 0.5)) % 1500 + 1500) % 1500;
      const t = 2 + Math.abs(r(4)) * 5;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: t, height: t, borderRadius: "50%", background: "rgba(255,230,190,0.9)", opacity: op * (0.12 + Math.abs(r(5)) * 0.3) * (0.6 + 0.4 * Math.sin(f / 9 + i)), filter: `blur(${Math.abs(r(6)) * 3}px)` }} />;
    })}
  </>
);

// ── piezas de oro ──
const AR_PILA = 684 / 371, AR_MON = 316 / 427;
const Moneda: React.FC<{ w: number; brillo?: number; txt?: string[]; tinte?: number }> = ({ w, brillo = 1, txt, tinte = 0 }) => (
  <div style={{ position: "relative", width: w, height: w * AR_MON }}>
    <Img src={staticFile("comision-rc/moneda.png")} style={{ width: w, filter: `brightness(${brillo}) saturate(1.05)${tinte > 0 ? ` sepia(${tinte * 0.4}) hue-rotate(${-tinte * 25}deg)` : ""}` }} />
    {txt ? (
      <div style={{ position: "absolute", left: "12%", right: "12%", top: "16%", bottom: "26%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "scaleY(0.78) rotate(-6deg)" }}>
        {txt.map((l) => (
          <div key={l} style={{ fontFamily: SANS, fontWeight: 800, fontSize: w * (txt.length > 2 ? 0.078 : 0.1), letterSpacing: w * 0.004, lineHeight: 1.12, color: "rgba(64,36,4,0.94)", textShadow: "0 1.5px 0 rgba(255,236,170,0.65), 0 -1px 0 rgba(60,30,0,0.5)", whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>
    ) : null}
  </div>
);
const Pila: React.FC<{ w: number; n?: number; brillo?: number; alta?: boolean }> = ({ w, n = 1, brillo = 1, alta }) => {
  const paso = w * 0.09, ar = alta ? AR_PILA : AR_MON;
  const alto = w * ar + (n - 1) * paso;
  return (
    <div style={{ position: "relative", width: w, height: alto }}>
      {Array.from({ length: n }, (_, k) => (
        <Img key={k} src={staticFile(`comision-rc/${alta ? "pila" : "moneda"}.png`)} style={{ position: "absolute", left: 0, width: w, top: alto - w * ar - k * paso, filter: `brightness(${brillo}) saturate(1.05)` }} />
      ))}
    </div>
  );
};
/** Pone una pieza apoyada en (x, y) del vidrio, con sombra, reflejo y luz cálida debajo. */
const Apoyada: React.FC<{ x: number; y: number; w: number; alto: number; op?: number; children: React.ReactNode; reflejo?: React.ReactNode }> = ({ x, y, w, alto, op = 1, children, reflejo }) => (
  <div style={{ opacity: op }}>
    <div style={{ position: "absolute", left: x - w * 0.7, top: y - 34, width: w * 1.4, height: 76, background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,190,80,0.2), transparent 70%)", filter: "blur(10px)" }} />
    <div style={{ position: "absolute", left: x - w / 2, top: y + 4, width: w, height: alto, transform: "scaleY(-1)", transformOrigin: "50% 0", opacity: 0.22, maskImage: "linear-gradient(0deg, black, transparent 45%)", WebkitMaskImage: "linear-gradient(0deg, black, transparent 45%)" }}>{reflejo ?? children}</div>
    <div style={{ position: "absolute", left: x - w / 2, top: y - alto, width: w, height: alto, filter: "drop-shadow(0 22px 20px rgba(0,0,0,0.85))" }}>{children}</div>
  </div>
);

const PILAS = [
  { x: 230, y: 470, w: 190, alta: true }, { x: 450, y: 430, w: 215, alta: true }, { x: 905, y: 470, w: 180, alta: true },
  { x: 690, y: 500, w: 230, n: 4 }, { x: 360, y: 590, w: 220, n: 2 },
];

// ── el celular ──
const Burbuja: React.FC<{ de?: string; texto: string; hora: string; mia?: boolean; op?: number; y?: number }> = ({ de, texto, hora, mia, op = 1, y = 0 }) => (
  <div style={{ display: "flex", justifyContent: mia ? "flex-end" : "flex-start", opacity: op, transform: `translateY(${y}px)` }}>
    <div style={{ maxWidth: 380, padding: "14px 20px 10px", borderRadius: 22, background: mia ? "#0f3b2c" : "#1b1e22", color: "#e9ecef", fontFamily: SANS }}>
      {de ? <div style={{ fontSize: 19, fontWeight: 700, color: "#8fb3a6", marginBottom: 4 }}>{de}</div> : null}
      <div style={{ fontSize: 27, fontWeight: 500, lineHeight: 1.25 }}>{texto}</div>
      <div style={{ fontSize: 16, color: "rgba(233,236,239,0.45)", textAlign: "right", marginTop: 4, fontFamily: MONO }}>{hora}</div>
    </div>
  </div>
);
const Reacciones: React.FC<{ f: number; en: number; hasta: number; lista: string[] }> = ({ f, en, hasta, lista }) => (
  <div style={{ position: "absolute", right: 18, bottom: -34, display: "flex", gap: 2, background: "#1b1e22", borderRadius: 20, padding: "4px 10px", border: "2px solid #0b0d0f", opacity: iv(f, en - 2, en + 2) }}>
    {lista.map((r, i) => {
      const t = f - (en + i * 4);
      return <span key={i} style={{ fontSize: 26, display: "inline-block", transform: `translateY(${interpolate(t, [0, 6, 10, 14], [-60, 6, -3, 0], cl)}px) scale(${interpolate(t, [0, 6, 10], [0.4, 1.25, 1], cl)})`, opacity: t < 0 ? 0 : 1 }}>{r}</span>;
    })}
    <span style={{ fontFamily: SANS, fontSize: 19, color: "rgba(241,243,245,0.7)", marginLeft: 6, alignSelf: "center", opacity: iv(f, en + 20, en + 24) }}>{Math.round(interpolate(f, [en + 20, en + 40], [5, hasta], cl))}</span>
  </div>
);
const Pantalla: React.FC<{ f: number }> = ({ f }) => {
  const oct = f >= S8;
  const llamada = f >= S6 && f < S8;
  if (llamada) {
    const pulso = 0.5 + 0.5 * Math.sin((f - S6) / 4);
    return (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 60% at 50% 30%, #12352a, #07100d 70%)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 150 }}>
        <div style={{ fontFamily: SANS, fontSize: 22, letterSpacing: 4, color: "rgba(220,240,232,0.6)" }}>LLAMADA ENTRANTE</div>
        <div style={{ width: 150, height: 150, borderRadius: 75, marginTop: 50, background: "linear-gradient(135deg,#2c3236,#121517)", display: "grid", placeItems: "center", fontFamily: SANS, fontWeight: 700, fontSize: 52, color: "#e9ecef", boxShadow: `0 0 0 ${10 + pulso * 16}px rgba(25,197,140,${0.18 - pulso * 0.1})` }}>DM</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: "#f1f3f5", marginTop: 36 }}>Daniel M.</div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: "rgba(241,243,245,0.55)", marginTop: 8 }}>Cierre · programa anual</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: ORO, marginTop: 60, transform: `scale(${1 + 0.08 * iv(f, W.plata - 4, W.plata + 4) * (1 - iv(f, W.plata + 4, W.plata + 18))})` }}>USD 12.000</div>
        <div style={{ position: "absolute", bottom: 120, display: "flex", gap: 140 }}>
          <div style={{ width: 110, height: 110, borderRadius: 55, background: "#c0453b" }} />
          <div style={{ width: 110, height: 110, borderRadius: 55, background: "#1fae79", transform: `scale(${1 + pulso * 0.08})` }} />
        </div>
      </div>
    );
  }
  const llega = oct ? iv(f, W.numero - 12, W.numero) : iv(f, W.comisionaste - 10, W.comisionaste + 2);
  const resp = (en: number) => iv(f, en, en + 10);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0b0d0f", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "54px 26px 18px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: "linear-gradient(135deg,#1d6b51,#0c2a20)", color: "#d9f5ea", fontFamily: SANS, fontWeight: 800, fontSize: 21, display: "grid", placeItems: "center" }}>CE</div>
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: "#f1f3f5" }}>Closers · Equipo</div>
          <div style={{ fontFamily: SANS, fontSize: 18, color: "rgba(241,243,245,0.45)" }}>14 miembros</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "22px 22px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "flex-end", paddingBottom: 70 }}>
        <div style={{ alignSelf: "center", fontFamily: SANS, fontSize: 17, color: "rgba(241,243,245,0.5)", background: "#16191c", padding: "6px 16px", borderRadius: 12 }}>{oct ? "1 de noviembre" : "1 de octubre"}</div>
        <Burbuja de="Mati" texto={oct ? "Octubre: USD 6.300" : "Septiembre: USD 5.900"} hora="09:02" />
        <Burbuja de="Lu" texto={oct ? "USD 7.900 🙌" : "USD 7.200 💪"} hora="09:07" />
        <div style={{ position: "relative" }}>
          <div style={{ transform: `scale(${0.9 + 0.1 * llega})`, transformOrigin: "100% 100%" }}>
            <Burbuja texto={oct ? "Octubre: USD 11.200" : "Septiembre: USD 8.400"} hora="09:12 ✓✓" mia op={llega} y={(1 - llega) * 40} />
          </div>
          {oct ? <Reacciones f={f} en={W.numero + 8} hasta={14} lista={["😳", "🔥", "🏆", "👑", "💸"]} /> : <Reacciones f={f} en={W.felicitan - 2} hasta={12} lista={["👏", "🔥", "🏆", "💸", "👑"]} />}
        </div>
        <div style={{ height: 18 }} />
        {oct ? (
          <>
            <Burbuja de="Fede" texto="¿Qué cambiaste? 👀" hora="09:13" op={resp(W.otro - 4)} y={(1 - resp(W.otro - 4)) * 30} />
            <Burbuja de="Caro" texto="Pasá el secreto" hora="09:14" op={resp(W.otro + 10)} y={(1 - resp(W.otro + 10)) * 30} />
          </>
        ) : (
          <>
            <Burbuja de="Fede" texto="Récord del equipo 👑" hora="09:13" op={resp(W.record - 6)} y={(1 - resp(W.record - 6)) * 30} />
            <Burbuja de="Caro" texto="Crack!!" hora="09:13" op={resp(W.record + 10)} y={(1 - resp(W.record + 10)) * 30} />
          </>
        )}
      </div>
    </div>
  );
};

/** Texto discreto que entra con desenfoque óptico, en espacio de pantalla. */
const Linea: React.FC<{ f: number; en: number; sale: number; top: number; chica?: string; grande: string; color?: string }> = ({ f, en, sale, top, chica, grande, color = "#eef1f2" }) => {
  if (f < en - 2 || f > sale + 2) return null;
  const a = iv(f, en, en + 16) * iv(f, sale - 8, sale, 1, 0, Easing.in(Easing.quad));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: a, transform: `translateY(${(1 - iv(f, en, en + 16)) * 16}px)`, filter: a < 0.99 ? `blur(${(1 - a) * 7}px)` : undefined }}>
      {chica ? <div style={{ fontFamily: SANS, fontSize: 40, color: "rgba(230,234,236,0.6)", fontWeight: 500 }}>{chica}</div> : null}
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color, marginTop: 4 }}>{grande}</div>
    </div>
  );
};

// ── e7: la pelea ──
const Pelea: React.FC<{ f: number }> = ({ f }) => {
  const entra = iv(f, S7, S7 + 22);
  const estrellas = 4;
  const lado = (i: number) => {
    // cada moneda: la tira el rival (entra por la derecha), vuelve a tu lado cuando respondés
    const tira = W.tira - 4 + i * 6;
    const vuelve = [W.respondes + 2, W.equivocas + 22, W.puntua - 8][i];
    const x = interpolate(f, [tira, tira + 16, vuelve, vuelve + 18], [1300, 790, 790, 290], { ...cl, easing: ease });
    const y = 1130 + i * 210;
    return { x, y, gira: iv(f, vuelve, vuelve + 10), error: i === 1 ? iv(f, W.equivocas - 2, W.equivocas + 3) * (1 - iv(f, W.equivocas + 18, W.equivocas + 24)) : 0 };
  };
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + iv(f, S7, S8, 0, 0.06, Easing.linear)})` }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 30% at 50% 18%, rgba(255,214,150,0.13), transparent 70%), linear-gradient(180deg,#020303 0%,#0a0d0f 35%,#07090a 100%)" }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 300, height: 640, borderRadius: 34, opacity: entra, transform: `translateY(${(1 - entra) * 60}px) perspective(1600px) rotateX(${(1 - entra) * 18 + 8}deg)`, transformOrigin: "50% 100%",
        background: "linear-gradient(160deg, rgba(40,46,50,0.75), rgba(10,12,13,0.92))", border: "1.5px solid rgba(210,220,225,0.2)", boxShadow: "0 60px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: ESM }}>ROLEPLAY · OBJECIONES</div>
        {[{ x: 70, ini: "VOS", n: "Vos", s: "closer" }, { x: 570, ini: "MR", n: "Martina R.", s: "closer · rival" }].map((p) => (
          <div key={p.ini} style={{ position: "absolute", left: p.x, top: 130, width: 260, textAlign: "center" }}>
            <div style={{ width: 150, height: 150, margin: "0 auto", borderRadius: 75, background: "linear-gradient(135deg,#2c3236,#101315)", border: `2px solid ${p.ini === "VOS" ? ESM : "rgba(210,220,225,0.35)"}`, display: "grid", placeItems: "center", fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#e9ecef" }}>{p.ini}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: "#f1f3f5", marginTop: 20 }}>{p.n}</div>
            <div style={{ fontFamily: SANS, fontSize: 22, color: "rgba(241,243,245,0.5)", marginTop: 4 }}>{p.s}</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 76, color: "rgba(238,241,242,0.85)" }}>vs</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontSize: 22, letterSpacing: 3, color: "rgba(241,243,245,0.5)", opacity: iv(f, W.puntua - 6, W.puntua) }}>TU RIVAL TE PUNTÚA</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14 }}>
            {Array.from({ length: 5 }, (_, i) => {
              const en = W.puntua + i * 5, t = f - en, llena = i < estrellas;
              return (
                <svg key={i} viewBox="26 26 48 46" width={78} height={78} style={{ transform: `scale(${llena ? interpolate(t, [0, 4, 9], [1.9, 0.92, 1], cl) : 1})`, opacity: llena ? (t < 0 ? 0.15 : 1) : iv(f, W.puntua - 6, W.puntua) * 0.3, filter: llena && t >= 0 ? "drop-shadow(0 0 14px rgba(233,185,85,0.6))" : undefined }}>
                  <path d="M50,30 L54.7,43.53 L69.02,43.82 L57.61,52.47 L61.76,66.18 L50,58 L38.24,66.18 L42.39,52.47 L30.98,43.82 L45.3,43.53 Z" fill={llena && t >= 0 ? ORO : "none"} stroke="rgba(233,185,85,0.6)" strokeWidth={1} />
                </svg>
              );
            })}
          </div>
        </div>
      </div>
      {/* las objeciones vienen del lado del rival y vuelven a tu lado */}
      {OBJ.map((o, i) => {
        const p = lado(i);
        const flip = Math.abs(Math.cos(p.gira * Math.PI));
        const tem = i === 1 ? Math.sin((f - W.equivocas) * 2.3) * 10 * p.error : 0;
        return (
          <div key={i} style={{ position: "absolute", left: p.x - 140 + tem, top: p.y - 104, filter: `drop-shadow(0 26px 22px rgba(0,0,0,0.85))${p.error > 0.05 ? ` drop-shadow(0 0 ${24 * p.error}px rgba(212,103,92,0.8))` : ""}` }}>
            <div style={{ transform: `scaleY(${0.25 + 0.75 * flip})` }}>
              <Moneda w={280} txt={p.gira < 0.5 ? o.txt : undefined} brillo={1 + 0.4 * (1 - flip) + 0.15 * p.gira} tinte={p.error} />
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 60, top: 1730, fontFamily: SANS, fontSize: 26, color: "rgba(241,243,245,0.45)", opacity: iv(f, W.respondes, W.respondes + 10) }}>tu lado</div>
    </AbsoluteFill>
  );
};

export const ComisionVideo: React.FC = () => {
  const f = useCurrentFrame();
  const negro = f >= NEGRO_DESDE && f < S7;
  const pelea = f >= S7 && f < S8;
  const llamada3d = f >= S6 && f < NEGRO_DESDE;
  const logo = f >= S9;
  const cam = camara(f);
  const p = punch(f);
  const shake = sacude(f, OBJ.map((o) => o.cae + 6), 0.9) + sacude(f, [W.fue + 4], 1.4);
  // cuánto dejaste sobre la mesa
  const perdido = OBJ.reduce((a, o) => a + o.monto * iv(f, o.cae + 6, o.cae + 26, 0, 1, Easing.out(Easing.cubic)), 0);
  const contadorOp = iv(f, S4 + 10, S4 + 26) * (1 - iv(f, S6 + 6, S6 + 18));
  const salen = iv(f, W.fue - 2, W.fue + 30, 0, 1, Easing.in(Easing.cubic)); // las pilas se van en e5
  const vuelven = f >= S8; // en e8 el oro volvió
  const lamparaBaja = iv(f, W.fue, W.fue + 30) * (1 - iv(f, S6, S6 + 20));
  const enfoqueTel = cam.s > 1.45 ? 0 : 1; // con la cámara sobre el celular, el oro queda fuera de foco
  const oroFoco = f >= W.cuanto - 6 && f < S6 + 6; // de "¿cuánto…" hasta la llamada, el oro manda
  const desfoqueOro = oroFoco ? 0 : interpolate(cam.s, [1.0, 1.3, 1.55, 1.9], [0.6, 0.4, 6, 10], cl);
  const desfoqueTel = interpolate(cam.s, [1.0, 1.3, 1.55], [2.2, 3.5, 0], cl);
  return (
    <AbsoluteFill style={{ background: "#040506", overflow: "hidden" }}>
      {!negro && !pelea && !logo && !llamada3d && (
        <AbsoluteFill style={{ transform: `translate(${shake}px, ${cam.y + shake * 0.6}px) scale(${cam.s * (1 + 0.035 * p)})`, transformOrigin: "50% 62%" }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 26% at 50% 22%, rgba(255,214,150,0.13), transparent 70%), radial-gradient(ellipse 70% 40% at 50% 62%, rgba(25,197,140,0.07), transparent 70%), linear-gradient(180deg,#020303 0%,#0a0d0f 30%,#07090a 100%)" }} />
          <div style={{ position: "absolute", left: -200, right: -200, top: 360, height: 2, background: "linear-gradient(90deg,transparent,rgba(200,215,220,0.22),transparent)", filter: "blur(1.5px)" }} />
          {/* oro al fondo */}
          <div style={{ filter: `blur(${desfoqueOro}px)` }}>
            {PILAS.map((q, i) => {
              const sale = vuelven ? 0 : iv(salen, i * 0.08, 0.6 + i * 0.08, 0, 1, Easing.linear);
              const alto = q.alta ? q.w * AR_PILA : q.w * AR_MON + ((q.n ?? 1) - 1) * q.w * 0.09;
              const br = 1 + 0.35 * iv(f, W.mesa + i * 4, W.mesa + 8 + i * 4) * (1 - iv(f, W.mesa + 10 + i * 4, W.mesa + 24 + i * 4)) + (vuelven ? 0.15 : 0);
              return (
                <div key={i} style={{ transform: `translateY(${-sale * 260}px) scale(${1 - sale * 0.4})`, transformOrigin: `${q.x}px ${q.y}px`, opacity: 1 - sale, filter: sale > 0 ? `blur(${sale * 10}px)` : undefined }}>
                  <Apoyada x={q.x} y={q.y} w={q.w} alto={alto}><Pila w={q.w} n={q.n} alta={q.alta} brillo={br} /></Apoyada>
                </div>
              );
            })}
            {/* las tres objeciones grabadas, adelante */}
            {OBJ.map((o, i) => {
              const t = f - o.cae;
              const cae = !vuelven && t > 0;
              const dy = cae ? t * t * 1.9 : 0, rot = cae ? t * 3.2 * (i === 1 ? -1 : 1) : 0;
              const vel = cae ? Math.min(16, t * 0.9) : 0;
              const brillo = 1 + 0.5 * iv(f, o.en - 4, o.en + 2) * (1 - iv(f, o.en + 4, o.en + 14));
              const w = 250, alto = w * AR_MON;
              if (cae && t > 34) return null;
              return (
                <div key={i} style={{ transform: `translate(${cae ? t * (i - 1) * 3 : 0}px, ${dy}px) rotate(${rot}deg) scale(${1 + (cae ? t * 0.02 : 0)})`, transformOrigin: `${o.x}px ${o.y - alto / 2}px`, filter: vel > 0 ? `blur(${vel}px)` : undefined, opacity: cae ? 1 - iv(t, 18, 34) : 1 }}>
                  <Apoyada x={o.x} y={o.y} w={w} alto={alto} reflejo={<Moneda w={w} />}><Moneda w={w} txt={o.txt} brillo={brillo + (vuelven ? 0.15 : 0)} /></Apoyada>
                </div>
              );
            })}
          </div>
          <Polvo f={f} op={0.9 - lamparaBaja * 0.6} />
          {/* el celular */}
          <div style={{ position: "absolute", left: 270, top: 640, width: 540, height: 1080, perspective: 1800, filter: desfoqueTel > 0.05 ? `blur(${desfoqueTel}px)` : undefined, opacity: interpolate(cam.s, [1.0, 1.3], [0.8, 1], cl) * (f < S6 - 10 ? 1 - iv(f, W.cuanto + 10, S4 + 10) : iv(f, S6 - 10, S6 + 6)) }}>
            <div style={{ position: "absolute", left: -160, right: -160, top: 120, bottom: -160, background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(25,197,140,${f >= S6 && f < S8 ? 0.3 : 0.16}), transparent 70%)`, filter: "blur(30px)" }} />
            <div style={{ position: "absolute", inset: 0, transform: "rotateX(24deg)", transformOrigin: "50% 100%", borderRadius: 64, background: "linear-gradient(145deg,#2a2f33,#0b0d0e 40%,#1b1f22)", padding: 14, boxShadow: "0 60px 90px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(210,220,225,0.25)" }}>
              <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 52, overflow: "hidden" }}>
                <Pantalla f={f} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${(f % 300) / 5}%, rgba(255,255,255,0.06) ${(f % 300) / 5 + 8}%, transparent ${(f % 300) / 5 + 20}%)` }} />
              </div>
            </div>
          </div>
          {/* destellos sobre el oro y sobre el mensaje */}
          {OBJ.map((o, i) => <Flare key={i} x={o.x + 40} y={o.y - 120} a={iv(f, o.en - 4, o.en + 1) * (1 - iv(f, o.en + 2, o.en + 14))} ancho={700} />)}
          <Flare x={650} y={1060} a={iv(f, W.comisionaste - 2, W.comisionaste + 2) * (1 - iv(f, W.comisionaste + 3, W.comisionaste + 16))} ancho={800} />
          <Flare x={450} y={260} a={iv(f, W.mesa - 2, W.mesa + 3) * (1 - iv(f, W.mesa + 4, W.mesa + 20))} ancho={1000} />
          <Flare x={650} y={1060} a={iv(f, W.numero - 2, W.numero + 2) * (1 - iv(f, W.numero + 3, W.numero + 18))} ancho={900} />
        </AbsoluteFill>
      )}
      {/* la lámpara baja cuando se va todo */}
      {!negro && !pelea && !logo && !llamada3d && <AbsoluteFill style={{ background: `rgba(0,0,0,${lamparaBaja * 0.45})` }} />}

      {/* textos en pantalla, chicos */}
      {!negro && !pelea && !logo && !llamada3d && (
        <>
          <Linea f={f} en={W.cuanto - 4} sale={S4 + 8} top={300} chica="¿Cuánto dejaste" grande="sobre la mesa?" />
          <Linea f={f} en={W.cada - 2} sale={S6 - 2} top={1170} chica="Cada una" grande="era una venta." />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1440, textAlign: "center", opacity: contadorOp }}>
            <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 5, color: "rgba(230,234,236,0.55)" }}>LO QUE DEJASTE SOBRE LA MESA</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 72, color: ROJO, marginTop: 10, letterSpacing: -1, fontVariantNumeric: "tabular-nums", transform: `scale(${1 + 0.06 * punch(f) * (f > S4 ? 1 : 0)})` }}>
              − USD {Math.round(perdido / 100) * 100 === 0 ? "0" : Math.round(perdido).toLocaleString("es-AR")}
            </div>
          </div>
        </>
      )}

      {/* e6: escena negra — una moneda gira en la oscuridad */}
      {negro && (
        <AbsoluteFill style={{ background: "#000" }}>
          <div style={{ position: "absolute", left: 540 - 380, top: 760 - 380, width: 760, height: 760, background: `radial-gradient(circle, rgba(233,185,85,${0.1 + 0.14 * iv(f, W.antes + 10, W.antes + 26)}), transparent 62%)`, opacity: iv(f, NEGRO_DESDE, NEGRO_DESDE + 14) }} />
          <AbsoluteFill style={{ opacity: iv(f, NEGRO_DESDE, NEGRO_DESDE + 10) }}><MonedaNegra3D f={f} desde={NEGRO_DESDE} para={W.antes + 26} /></AbsoluteFill>
          <Flare x={480} y={700} a={iv(f, W.antes + 18, W.antes + 26) * (1 - iv(f, W.antes + 27, W.antes + 40)) * 0.9} ancho={1100} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", opacity: iv(f, W.entrenan - 4, W.entrenan + 8), filter: `blur(${(1 - iv(f, W.entrenan - 4, W.entrenan + 8)) * 8}px)` }}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 52, color: RC.platino500, letterSpacing: -0.6 }}>Se entrenan</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 110, color: ORO, marginTop: 6, opacity: iv(f, W.antes - 6, W.antes + 4), transform: `translateY(${(1 - iv(f, W.antes - 6, W.antes + 8)) * 20}px)` }}>antes.</div>
          </div>
        </AbsoluteFill>
      )}

      {llamada3d && (
        <AbsoluteFill style={{ background: "#030405" }}>
          <Llamada3D f={f} T={{ S6, llamada: W.llamada, plata: W.plata, negro: NEGRO_DESDE }} />
        </AbsoluteFill>
      )}
      {pelea && (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 30% at 50% 12%, rgba(255,214,150,0.08), transparent 70%), #030405" }}>
          <Pelea3D f={f} T={{ S7, S8, tira: W.tira, respondes: W.respondes, equivocas: W.equivocas, puntua: W.puntua }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: ESM, opacity: 0.85 * iv(f, S7 + 8, S7 + 26) }}>ROLEPLAY · OBJECIONES</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: SANS, fontSize: 24, letterSpacing: 4, color: "rgba(241,243,245,0.6)", opacity: iv(f, W.puntua - 4, W.puntua + 6) }}>TU RIVAL TE PUNTÚA</div>
        </AbsoluteFill>
      )}

      {/* e9: placa del logo */}
      {logo && (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 40%, #0d1112, #020303 70%)" }}>
          <div style={{ position: "absolute", left: 540 - 170, top: 640, width: 340, height: 340, transform: `scale(${0.9 + 0.1 * iv(f, S9, S9 + 20)})` }}>
            <Logo size={340} dibujoEn={S9 + 4} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, color: RC.platino500,
            letterSpacing: `${interpolate(iv(f, W.ring - 4, W.ring + 24), [0, 1], [0.6, 0.32])}em`, opacity: iv(f, W.ring - 4, W.ring + 6) }}>RING CLOSERS</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1140, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: ORO, opacity: iv(f, W.closers + 12, W.closers + 30) }}>
            las objeciones se entrenan antes.
          </div>
          <Flare x={interpolate(f, [W.ring - 4, W.ring + 26], [180, 900], cl)} y={1086} a={iv(f, W.ring - 4, W.ring) * (1 - iv(f, W.ring + 20, W.ring + 30))} ancho={1000} />
          <Polvo f={f} op={0.5} />
        </AbsoluteFill>
      )}

      {/* golpe de luz en los cortes y viñeta de cine */}
      <AbsoluteFill style={{ background: `rgba(255,240,215,${flash(f, GOLPES)})`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 65% at 50% 46%, transparent 45%, rgba(0,0,0,0.6) 100%)" }} />
      <Acabado />
    </AbsoluteFill>
  );
};
