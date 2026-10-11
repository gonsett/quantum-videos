/**
 * "Secreto de contratación #1" completo (26/09/2026): formato Kayn con piel de Ring Closers.
 * e1 gancho (lluvia de guantes, aprobado: "SEEEEE, ahora sí") → e2 la oferta se entierra en un grupo →
 * e3 en Ring Closers: visible / filtrada / probada, sobre hoja punteada, y llegan postulantes con currículum →
 * e4 escena INVERTIDA (negro puro, láser esmeralda): el guante que no llega al rango rebota →
 * e5 el marco de bronce se vuelve puerta, la cámara lo atraviesa → placa del logo.
 * Todos los tiempos salen de la voz (`timeline.ts`); nada de números fijos por palabra.
 */
import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { RC } from "../ring-closers/tema";
import { Logo } from "../reel-rc/logo";
import { Acabado, Estrella, Palabras } from "./Muestra";
import { GanchoOferta } from "./Gancho";
import { Metal } from "../secreto-rc/efectos";
import { DUR, L, oferta } from "./timeline";

const SERIF = cargarSerif("italic").fontFamily;
const SANS = cargarManrope("normal", { weights: ["500", "700", "800"] }).fontFamily;
const FONDO = "#070808";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sale = Easing.out(Easing.cubic);
const r = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const imp = (dt: number) => (dt < 0 ? 0 : Math.exp(-dt * 0.4) * Math.cos(dt * 2.2));

/* ───────── piezas comunes ───────── */

const Estudio: React.FC<{ luz?: number; halo?: number }> = ({ luz = 1, halo = 1 }) => (
  <>
    <AbsoluteFill style={{ background: FONDO }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 46% at 50% 44%, #1c1f1e 0%, #0d0f0e 55%, transparent 100%)", opacity: luz }} />
    <div style={{ position: "absolute", left: 540 - 440, top: 520, width: 880, height: 760, borderRadius: "50%",
      background: `radial-gradient(circle, ${RC.esmeralda600}30 0%, ${RC.esmeralda600}0d 42%, transparent 70%)`, filter: "blur(24px)", opacity: halo }} />
  </>
);

const Titulo: React.FC<{ serif: string; sans: string; en: number; en2?: number; acento?: string[]; top?: number; salida?: number }> = ({
  serif, sans, en, en2, acento, top = 290, salida,
}) => {
  const f = useCurrentFrame();
  const o = salida === undefined ? 1 : interpolate(f, [salida, salida + 8], [1, 0], cl);
  return (
    <div style={{ position: "absolute", top, width: "100%", textAlign: "center", opacity: o, filter: `blur(${(1 - o) * 8}px)` }}>
      <Palabras texto={serif} desde={en} f={f} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 62, lineHeight: 1.05, color: RC.platino500 }} />
      <Palabras texto={sans} desde={en2 ?? en + 8} f={f} acento={acento}
        style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.12, letterSpacing: -1.2, color: "#f4f4f5" }} />
    </div>
  );
};

const LetraChica: React.FC<{ texto: string; en: number; top?: number }> = ({ texto, en, top = 1440 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 21,
      letterSpacing: 2.6, color: "#6f6f77", opacity: interpolate(f, [en, en + 12], [0, 1], cl) }}>{texto}</div>
  );
};

/** Barrido de luz recortado con la forma de la tarjeta (brillo de vidrio). */
const Barrido: React.FC<{ p: number; radio: number }> = ({ p, radio }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: radio, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: -200, bottom: -200, width: 180, left: `${-30 + p * 160}%`, transform: "rotate(18deg)",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.13), transparent)" }} />
  </div>
);

const Chip: React.FC<{ k: string; v: string; acento?: boolean }> = ({ k, v, acento }) => (
  <div style={{ padding: "14px 18px", borderRadius: 16, background: acento ? `${RC.esmeralda500}14` : "rgba(255,255,255,0.035)",
    border: `1.5px solid ${acento ? RC.esmeralda500 + "88" : "rgba(212,212,216,0.12)"}` }}>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 17, letterSpacing: 2, color: acento ? RC.esmeralda400 : "#7c7c84" }}>{k}</div>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: acento ? "#eafff6" : "#ececef", marginTop: 4 }}>{v}</div>
  </div>
);

/** La oferta de Ring Closers como objeto: vidrio oscuro, filo platino, línea esmeralda arriba. */
export const TarjetaOferta: React.FC<{ brillo?: number; barrido?: number; encendida?: number }> = ({ brillo = 1, barrido = -1, encendida = 0 }) => (
  <div style={{ position: "relative", width: 720, borderRadius: 34, padding: "38px 40px 40px",
    background: "linear-gradient(160deg, #171b1a 0%, #0c0e0e 60%, #0a0b0b 100%)",
    border: "1.5px solid rgba(212,212,216,0.18)",
    boxShadow: `0 60px 120px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 ${80 * encendida}px ${RC.esmeralda500}${encendida ? "55" : "00"}`,
    filter: `brightness(${brillo})` }}>
    <div style={{ position: "absolute", left: 40, right: 40, top: 0, height: 2, background: `linear-gradient(90deg, transparent, ${RC.esmeralda400}, transparent)` }} />
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Logo size={38} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: 4, color: "#8c8c94" }}>OFERTA · RING CLOSERS</div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: 17, letterSpacing: 2, color: RC.esmeralda400 }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: RC.esmeralda400, boxShadow: `0 0 12px ${RC.esmeralda400}` }} />ABIERTA
      </div>
    </div>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, letterSpacing: -1.5, color: "#f4f4f5", marginTop: 26 }}>Closer High Ticket</div>
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 34, color: RC.platino500, marginTop: 2 }}>mentoría de ventas · remoto</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 30 }}>
      <Chip k="COMISIÓN" v="15 %" />
      <Chip k="TICKET" v="USD 3.000" />
      <Chip k="LEADS" v="Calificados" />
      <Chip k="RANGO MÍNIMO" v="Campeón" acento />
    </div>
    {barrido >= 0 && <Barrido p={barrido} radio={34} />}
  </div>
);

/* ───────── e2: la oferta se entierra en un grupo ───────── */

const MENSAJES = ["info?", "me interesa", "precio?", "hola", "yo!!", "sigue?", "interesado", "me sumo", "info x priv", "cuánto pagan?", "me interesa", "yo", "disponible", "me interesa!!", "hola buenas", "pasame info"];

const E2Grupo: React.FC = () => {
  const f = useCurrentFrame();
  const grupo = L("e2-grupo", "grupo:");
  const enterrada = L("e2-grupo", "enterrada,");
  const cualquiera = L("e2-grupo", "cualquiera.");
  const escribe = L("e2-grupo", "escribe");
  // la tarjeta entra flotando y después se hunde bajo los mensajes
  const entra = interpolate(f, [0, 14], [0, 1], { ...cl, easing: sale });
  const hunde = interpolate(f, [grupo, enterrada + 6], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const flota = Math.sin(f / 16) * 10;
  const tarjetaY = 760 + (1 - entra) * 120 + hunde * 520 + flota;
  // cada mensaje cae del borde superior y se apila encima de la tarjeta
  const n = MENSAJES.length;
  const golpes = Array.from({ length: n }, (_, i) => grupo + 2 + Math.pow(i / n, 0.8) * (enterrada - grupo + 4));
  const ultimo = Math.max(-99, ...golpes.filter((g) => g <= f));
  const sy = imp(f - ultimo) * 6 + imp(f - enterrada - 4) * 16;
  // en "escribe" revientan burbujas de "me interesa" por todo el cuadro
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Estudio luz={1 - hunde * 0.6} halo={1 - hunde} />
      <Estrella id="e2a" desde={[-240, -160]} hasta={[80, 150]} size={360} rot={12} inicio={0} f={f} blur={3} />
      <Estrella id="e2b" desde={[1320, 2100]} hasta={[980, 1760]} size={480} rot={-12} inicio={2} f={f} blur={9} />
      <AbsoluteFill style={{ transform: `translateY(${sy}px)` }}>
        <div style={{ position: "absolute", left: 180, top: tarjetaY, perspective: 1800 }}>
          <div style={{ transform: `rotateX(${10 + hunde * 22}deg) rotateY(${Math.sin(f / 30) * 6 - 3}deg) rotateZ(${-3 + hunde * 6}deg) scale(${1.28 - hunde * 0.3})`,
            opacity: 1 - hunde * 0.55, filter: `blur(${hunde * 5}px)` }}>
            <TarjetaOferta brillo={1 - hunde * 0.55} barrido={interpolate(f, [4, 40], [0, 1], cl)} />
          </div>
        </div>
        {MENSAJES.map((m, i) => {
          const g = golpes[i];
          if (f < g - 6) return null;
          const p = interpolate(f, [g - 6, g], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
          const x = 110 + r(i, 1) * 560;
          const yFin = 820 + r(i, 2) * 620;
          const y = -140 + (yFin + 140) * p + (f > g ? -Math.abs(Math.sin((f - g) * 0.7)) * 14 * Math.exp(-(f - g) * 0.4) : 0);
          const z = 0.8 + r(i, 3) * 0.6;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${-8 + r(i, 4) * 16}deg) scale(${z})`, transformOrigin: "left top",
              padding: "18px 26px", borderRadius: "26px 26px 26px 6px", background: "linear-gradient(180deg, #2a2e2d, #1d201f)",
              border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
              fontFamily: SANS, fontWeight: 500, fontSize: 38, color: "#b9b9c0", whiteSpace: "nowrap",
              filter: `blur(${z > 1.05 ? 3 : 0}px) brightness(${0.7 + z * 0.3})` }}>
              {m}
              <span style={{ fontSize: 20, color: "#6d6d74", marginLeft: 14 }}>{`${9 + (i % 3)}:${String(10 + i * 3).padStart(2, "0")}`}</span>
            </div>
          );
        })}
        {/* "te escribe cualquiera": estallan decenas de "me interesa" chicos alrededor */}
        {Array.from({ length: 24 }, (_, i) => {
          const t = escribe + i * 1.1;
          if (f < t) return null;
          const s = interpolate(f, [t, t + 5, t + 9], [0, 1.15, 1], cl);
          return (
            <div key={i} style={{ position: "absolute", left: 40 + r(i, 8) * 860, top: 520 + r(i, 9) * 1100, transform: `scale(${s * (0.55 + r(i, 10) * 0.4)})`,
              padding: "12px 20px", borderRadius: 22, background: "#232726", border: "1px solid rgba(255,255,255,0.07)",
              fontFamily: SANS, fontWeight: 700, fontSize: 30, color: "#9d9da5", opacity: interpolate(f, [cualquiera + 20, cualquiera + 34], [1, 0.35], cl) }}>
              me interesa
            </div>
          );
        })}
      </AbsoluteFill>
      <Titulo serif="en un grupo," sans="tu oferta se entierra" en={Math.max(0, grupo - 26)} en2={Math.max(6, enterrada - 14)} acento={["entierra"]} />
      <LetraChica texto={`PUBLICADA HACE 2 H · ${n} MENSAJES ENCIMA`} en={enterrada + 2} />
    </AbsoluteFill>
  );
};

/* ───────── e3: visible, filtrada, probada ───────── */

const Criterio: React.FC<{ palabra: string; detalle: string; en: number; top: number }> = ({ palabra, detalle, en, top }) => {
  const f = useCurrentFrame();
  const letras = Math.floor(interpolate(f, [en, en + palabra.length * 1.6], [0, palabra.length], cl));
  const check = interpolate(f, [en + 2, en + 7, en + 11], [0, 1.25, 1], cl);
  const flash = interpolate(f, [en + 2, en + 4, en + 16], [0, 1, 0], cl);
  const det = interpolate(f, [en + 8, en + 18], [0, 1], { ...cl, easing: sale });
  if (f < en) return null;
  return (
    <div style={{ position: "absolute", left: 150, top, display: "flex", alignItems: "center", gap: 34 }}>
      <div style={{ position: "relative", width: 76, height: 76 }}>
        <div style={{ position: "absolute", inset: -40 * flash, borderRadius: "50%", border: `2px solid ${RC.esmeralda400}`, opacity: flash }} />
        <div style={{ width: 76, height: 76, borderRadius: 38, transform: `scale(${check})`,
          background: `radial-gradient(circle at 35% 30%, ${RC.esmeralda400}, ${RC.esmeralda600})`,
          boxShadow: `0 0 ${30 + flash * 40}px ${RC.esmeralda500}aa, inset 0 2px 0 rgba(255,255,255,0.35)`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#04140d" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, letterSpacing: -2, color: "#f4f4f5", lineHeight: 1 }}>
          {palabra.slice(0, letras)}<span style={{ opacity: f < en + palabra.length * 1.6 + 6 && Math.floor(f / 4) % 2 === 0 ? 1 : 0, color: RC.esmeralda400 }}>|</span>
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 36, color: RC.platino500, marginTop: 8, opacity: det, transform: `translateX(${(1 - det) * 14}px)` }}>{detalle}</div>
      </div>
    </div>
  );
};

const POSTULANTES = [
  { boxeador: "southpaw", cinturon: "campeon", nombre: "Closer n.º 014", semanas: 14, nota: "4,9" },
  { boxeador: "speed", cinturon: "leyenda", nombre: "Closer n.º 031", semanas: 22, nota: "4,8" },
  { boxeador: "guard_classic", cinturon: "campeon", nombre: "Closer n.º 057", semanas: 11, nota: "4,7" },
];

const Postulante: React.FC<{ p: (typeof POSTULANTES)[number]; en: number; i: number }> = ({ p, en, i }) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [en, en + 12], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.4)) });
  return (
    <div style={{ position: "absolute", left: 150 + i * 16, top: 1140 + i * 140, width: 780, height: 132, borderRadius: 26,
      transform: `translateX(${(1 - e) * 700}px) rotate(${(1 - e) * 6}deg)`, opacity: e,
      background: "linear-gradient(120deg, #161a19, #0c0e0e)", border: "1.5px solid rgba(212,212,216,0.14)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 22, padding: "0 26px" }}>
      <div style={{ width: 88, height: 88, borderRadius: 44, overflow: "hidden", background: "#0a0b0b", border: `2px solid ${RC.esmeralda500}66` }}>
        <Img src={staticFile(`ring-closers/boxers/${p.boxeador}.webp`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: "#f4f4f5" }}>{p.nombre}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 21, letterSpacing: 1.4, color: "#8a8a92", marginTop: 4 }}>
          {p.semanas} SEMANAS EN EL RING · <span style={{ color: RC.esmeralda400 }}>★ {p.nota}</span>
        </div>
      </div>
      <Img src={staticFile(`ring-closers/belts/${p.cinturon}.webp`)} style={{ width: 120, height: 120, objectFit: "contain", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))" }} />
    </div>
  );
};

const E3Criterio: React.FC = () => {
  const f = useCurrentFrame();
  const visible = L("e3-criterio", "Visible.");
  const filtrada = L("e3-criterio", "Filtrada.");
  const probada = L("e3-criterio", "Probada.");
  const cada = L("e3-criterio", "Cada");
  const ring = L("e3-criterio", "ring.", 2);
  const sube = interpolate(f, [0, 22], [0, 1], { ...cl, easing: sale });
  const lista = interpolate(f, [cada - 8, cada + 4], [1, 0], cl);
  const sy = imp(f - visible) * 5 + imp(f - filtrada) * 5 + imp(f - probada) * 7 + imp(f - ring) * 18;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Estudio luz={1} halo={0.7 + sube * 0.6} />
      {/* la hoja punteada de Kayn, en versión de estudio: puntos platino finos */}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(212,212,216,0.16) 1.6px, transparent 1.8px)", backgroundSize: "34px 34px",
        opacity: interpolate(f, [visible - 14, visible], [0, 0.9], cl), maskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, black 30%, transparent 80%)", transform: `translateY(${-f * 0.4}px)` }} />
      <Estrella id="e3a" desde={[1350, -200]} hasta={[960, 180]} size={420} rot={-16} inicio={0} f={f} blur={4} />
      <Estrella id="e3b" desde={[-300, 2100]} hasta={[110, 1720]} size={520} rot={10} inicio={3} f={f} blur={10} />
      <Estrella id="e3c" desde={[-100, 700]} hasta={[120, 820]} size={80} rot={0} inicio={probada} f={f} blur={1} />
      <AbsoluteFill style={{ transform: `translateY(${sy}px)` }}>
        {/* parte 1: la lupa de scout, el héroe del "filtrada / probada" */}
        <div style={{ position: "absolute", left: 540 - 250, top: 420 + (1 - sube) * 500 + Math.sin(f / 18) * 10, opacity: lista,
          transform: `rotate(${-12 + Math.sin(f / 26) * 4}deg) scale(${0.9 + sube * 0.1 + imp(f - probada) * 0.05})`, filter: "drop-shadow(0 50px 60px rgba(0,0,0,0.75))" }}>
          <Metal src="ring-closers/scout/magnifying-glass.webp" ancho={500} barrido={interpolate(f, [visible - 10, probada + 20], [0, 1], cl)} />
        </div>
        <div style={{ opacity: lista, filter: `blur(${(1 - lista) * 10}px)`, transform: "translateY(130px)" }}>
          <Criterio palabra="Visible." detalle="la ven todos los closers, siempre" en={visible} top={930} />
          <Criterio palabra="Filtrada." detalle="solo tu rango mínimo o más" en={filtrada} top={1110} />
          <Criterio palabra="Probada." detalle="cada uno con su historial de ring" en={probada} top={1290} />
        </div>
        {POSTULANTES.map((p, i) => (
          <Postulante key={i} p={p} en={cada + 6 + i * 10} i={i} />
        ))}
        {/* parte 2: la medalla de cinco estrellas, gigante; entra en "Cada" y golpea en "ring" */}
        {f >= cada - 10 && (
          <div style={{ position: "absolute", left: 540 - 290, top: 450 + Math.sin(f / 17) * 9 - interpolate(f, [cada - 10, cada + 8], [700, 0], { ...cl, easing: sale }),
            transform: `scale(${1 + imp(f - ring) * 0.12}) rotate(${Math.sin(f / 30) * 5}deg)`, filter: "drop-shadow(0 50px 60px rgba(0,0,0,0.75))" }}>
            <div style={{ position: "absolute", inset: -60, borderRadius: "50%", border: `3px solid ${RC.esmeralda400}`,
              transform: `scale(${1 + Math.max(0, f - ring) * 0.05})`, opacity: interpolate(f, [ring, ring + 2, ring + 18], [0, 0.9, 0], cl) }} />
            <Metal src="ring-closers/trophies/five_stars.webp" ancho={580} barrido={interpolate(f, [ring - 2, ring + 28], [0, 1], cl)} />
          </div>
        )}
      </AbsoluteFill>
      <Titulo serif="en Ring Closers," sans="tu oferta es otra cosa" en={0} en2={L("e3-criterio", "tu") - 4} acento={["otra", "cosa"]} salida={cada - 10} />
      <div style={{ opacity: interpolate(f, [cada - 4, cada + 6], [0, 1], cl) }}>
        <Titulo serif="cada postulante llega" sans="con su currículum de ring" en={cada} en2={L("e3-criterio", "con") - 4} acento={["ring"]} />
      </div>
      <LetraChica texto="SEMANAS ENTRENANDO · CALIFICACIÓN DE SUS RIVALES · RANGO" en={ring} top={1500} />
    </AbsoluteFill>
  );
};

/* ───────── e4: escena invertida, el rango como barrera ───────── */

const E4Rango: React.FC = () => {
  const f = useCurrentFrame();
  const rango = L("e4-rango", "rango");
  const g1 = L("e4-rango", "pediste,");
  const g2 = L("e4-rango", "siquiera");
  const cae = L("e4-rango", "postular.");
  // el guante sube hacia la línea, choca dos veces y cae
  const LINEA = 1010;
  const golpe = (t: number) => {
    const d = f - t;
    if (d < 0) return 0;
    return Math.exp(-d * 0.18) * Math.abs(Math.sin(d * 0.28)) * 190;
  };
  let y: number;
  if (f < g1) y = interpolate(f, [0, g1], [1900, LINEA + 20], { ...cl, easing: Easing.in(Easing.quad) });
  else if (f < g2 - 8) y = LINEA + 20 + golpe(g1);
  else if (f < g2) y = interpolate(f, [g2 - 8, g2], [LINEA + 20 + golpe(g2 - 8), LINEA + 20], { ...cl, easing: Easing.in(Easing.cubic) });
  else y = LINEA + 20 + golpe(g2);
  const caida = interpolate(f, [cae, cae + 24], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  y += caida * 1100;
  const choque = Math.max(interpolate(f, [g1, g1 + 2, g1 + 14], [0, 1, 0], cl), interpolate(f, [g2, g2 + 2, g2 + 16], [0, 1.3, 0], cl));
  const sx = imp(f - g1) * 10 + imp(f - g2) * 16;
  const sy = -imp(f - g1) * 8 - imp(f - g2) * 14;
  const apaga = interpolate(f, [g1, g2 + 10], [0, 1], cl);
  const lineaEntra = interpolate(f, [2, 16], [0, 1], { ...cl, easing: sale });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Estrella id="e4a" desde={[-280, -240]} hasta={[120, 200]} size={460} rot={20} inicio={0} f={f} blur={2} />
      <Estrella id="e4b" desde={[1360, 2200]} hasta={[940, 1700]} size={600} rot={-8} inicio={2} f={f} blur={12} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {/* el láser del rango mínimo */}
        <div style={{ position: "absolute", left: 540 - 520 * lineaEntra, width: 1040 * lineaEntra, top: LINEA - 2, height: 4, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${RC.esmeralda400} 12%, #eafff6 50%, ${RC.esmeralda400} 88%, transparent)`,
          boxShadow: `0 0 ${24 + choque * 60}px ${RC.esmeralda400}, 0 0 ${80 + choque * 120}px ${RC.esmeralda600}` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: LINEA - 180, height: 360,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${RC.esmeralda500}${choque > 0.05 ? "44" : "1c"}, transparent 70%)`, opacity: lineaEntra }} />
        <div style={{ position: "absolute", top: LINEA - 64, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 6,
          color: RC.esmeralda400, opacity: interpolate(f, [rango - 4, rango + 6], [0, 1], cl) }}>RANGO MÍNIMO · CAMPEÓN</div>
        {/* chispas en cada choque */}
        {[g1, g2].map((t, k) => f >= t && f < t + 22 && Array.from({ length: 22 }, (_, i) => {
          const d = f - t;
          const a = Math.PI + 0.15 + r(i + k * 40, 3) * (Math.PI - 0.3);
          const v = 14 + r(i + k * 40, 4) * 26;
          return <div key={`${k}-${i}`} style={{ position: "absolute", left: 540 + Math.cos(a) * v * d * 1.3, top: LINEA + Math.sin(a) * v * d * 0.8 + 0.9 * d * d,
            width: 5, height: 5, borderRadius: 3, background: i % 4 ? "#eafff6" : RC.esmeralda400, boxShadow: `0 0 8px ${RC.esmeralda400}`,
            opacity: interpolate(d, [0, 20], [1, 0], cl) }} />;
        }))}
        <Img src={staticFile("ring-closers/shop/guardia-contendiente.webp")} style={{ position: "absolute", left: 540 - 320, top: y, width: 640, height: 640,
          transform: `rotate(${-8 + Math.sin(f / 9) * 3 + caida * 40}deg)`,
          filter: `saturate(${1 - apaga * 0.9}) brightness(${1 - apaga * 0.45 - caida * 0.4}) drop-shadow(0 -10px 40px ${RC.esmeralda600}55)` }} />
      </AbsoluteFill>
      <Titulo serif="y el que no llega al rango," sans="ni siquiera se puede postular" en={2} en2={L("e4-rango", "ni") - 4} acento={["postular"]} />
      <LetraChica texto="EL RANGO SE GANA ENTRENANDO. NO SE DECLARA." en={cae - 4} top={480} />
    </AbsoluteFill>
  );
};

/* ───────── e5: el marco se vuelve puerta → placa ───────── */

const E5Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const oferta_ = L("e5-cierre", "oferta.");
  const abri = L("e5-cierre", "Abrí");
  const puerta = L("e5-cierre", "puerta.");
  const cruza = puerta + 10;
  const placa = cruza + 12;
  const luz = interpolate(f, [abri - 6, puerta + 6], [0.15, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const zoom = interpolate(f, [puerta + 2, cruza + 12], [1, 9], { ...cl, easing: Easing.in(Easing.cubic) });
  const flota = Math.sin(f / 17) * 12;
  const flash = interpolate(f, [cruza + 6, cruza + 12, placa + 10], [0, 1, 0], cl);
  const rayos = Array.from({ length: 14 }, (_, i) => i);
  if (f >= placa) {
    const d = f - placa;
    return (
      <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", left: 540 - 400, top: 560, width: 800, height: 800, borderRadius: "50%",
          background: `radial-gradient(circle, ${RC.esmeralda600}33, transparent 65%)`, filter: "blur(30px)" }} />
        <Estrella id="e5p" desde={[-300, 300]} hasta={[1400, 1500]} size={520} rot={30} inicio={0} f={d} blur={6} />
        <div style={{ transform: `scale(${interpolate(d, [0, 20], [0.9, 1], { ...cl, easing: sale })})`, textAlign: "center", marginTop: -80 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={170} dibujoEn={placa} /></div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: 10, color: "#f4f4f5", marginTop: 40,
            opacity: interpolate(d, [10, 22], [0, 1], cl) }}>RING CLOSERS</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: RC.platino500, marginTop: 10,
            opacity: interpolate(d, [18, 30], [0, 1], cl) }}>donde los closers se hacen</div>
        </div>
        <div style={{ position: "absolute", top: 1440, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: 3,
          color: "#7a7a82", opacity: interpolate(d, [28, 40], [0, 1], cl) }}>
          PUBLICÁ TU OFERTA · <span style={{ color: RC.esmeralda400 }}>LINK EN LA BIO</span>
        </div>
        <AbsoluteFill style={{ background: "#eafff6", opacity: flash }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Estudio luz={1 - luz * 0.3} halo={0.6} />
      <Estrella id="e5a" desde={[1360, -220]} hasta={[950, 170]} size={400} rot={-18} inicio={0} f={f} blur={4} />
      <Estrella id="e5b" desde={[-300, 2150]} hasta={[120, 1750]} size={520} rot={12} inicio={3} f={f} blur={11} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 930px" }}>
        {/* rayos de luz que salen de la puerta */}
        <div style={{ position: "absolute", left: 540, top: 930, opacity: luz * 0.9 }}>
          {rayos.map((i) => (
            <div key={i} style={{ position: "absolute", left: 0, top: -6, width: 900, height: 12 + r(i, 1) * 26, transformOrigin: "0 50%",
              transform: `rotate(${i * (360 / 14) + f * 0.4}deg)`,
              background: `linear-gradient(90deg, ${RC.esmeralda400}88, transparent)`, filter: "blur(10px)", opacity: 0.35 + r(i, 2) * 0.4 }} />
          ))}
        </div>
        {/* el interior de la puerta: luz */}
        <div style={{ position: "absolute", left: 540 - 250, top: 930 - 250 + flota, width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, #ffffff ${luz * 30}%, ${RC.esmeralda400} ${20 + luz * 40}%, ${RC.esmeralda600}00 72%)`,
          opacity: luz, filter: `blur(${6 - luz * 4}px)`, boxShadow: `0 0 ${luz * 200}px ${RC.esmeralda500}` }} />
        <Img src={staticFile("ring-closers/shop/marco-bronce.webp")} style={{ position: "absolute", left: 540 - 380, top: 930 - 380 + flota, width: 760, height: 760,
          transform: `rotateZ(${Math.sin(f / 30) * 4}deg)`, filter: `drop-shadow(0 50px 70px rgba(0,0,0,0.8)) brightness(${0.9 + luz * 0.4})` }} />
      </AbsoluteFill>
      <div style={{ opacity: interpolate(f, [puerta + 2, puerta + 10], [1, 0], cl) }}>
        <Titulo serif="no publiques una oferta." sans="Abrí una puerta." en={L("e5-cierre", "No") - 2} en2={abri - 3} acento={["puerta."]} />
      </div>
      <LetraChica texto="SECRETO DE CONTRATACIÓN N.º 01 — PARA DIRECTORES COMERCIALES" en={oferta_} />
      <AbsoluteFill style={{ background: "#eafff6", opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ───────── e1: el gancho aprobado, con los tiempos de la voz ───────── */

const E1Gancho: React.FC = () => {
  const ninguno = L("e1-gancho", "Ninguno");
  const f = useCurrentFrame();
  const golpe = L("e1-gancho", "Cien") - 3;
  // palabras desde el cuadro 0: sin ellas el gancho no capta (Javier, 26/09/2026)
  const sale = interpolate(f, [golpe - 6, golpe], [1, 0], cl);
  return (
    <AbsoluteFill>
      <E1Base golpe={golpe} ninguno={ninguno} />
      <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", opacity: sale, filter: `blur(${(1 - sale) * 10}px)`,
        textShadow: "0 4px 30px rgba(0,0,0,0.9)" }}>
        <Palabras texto="Publicaste una búsqueda de closers" desde={L("e1-gancho", "Publicaste") - 4} f={f} acento={["closers"]}
          style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: 1.12, letterSpacing: -1.2, color: "#f4f4f5", padding: "0 70px" }} />
        <Palabras texto="y te llegaron…" desde={L("e1-gancho", "Y") - 3} f={f} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 60, color: RC.platino500, marginTop: 10 }} />
      </div>
    </AbsoluteFill>
  );
};

const E1Base: React.FC<{ golpe: number; ninguno: number }> = ({ golpe, ninguno }) => {
  return <GanchoOferta golpe={golpe} remate={ninguno - 2} apagon={L("e1-gancho", "cerrar.") + 12} bajada={false} />;
};

const ESCENAS: Record<string, React.FC> = {
  "e1-gancho": E1Gancho,
  "e2-grupo": E2Grupo,
  "e3-criterio": E3Criterio,
  "e4-rango": E4Rango,
  "e5-cierre": E5Cierre,
};

export const OfertaVideo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: FONDO }}>
      {oferta.tl.escenas.map((e) => {
        const C = ESCENAS[e.id];
        return (
          <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
            <C />
          </Sequence>
        );
      })}
      <Acabado f={f} />
    </AbsoluteFill>
  );
};

export const DURACION = oferta.total;
export { DUR };
