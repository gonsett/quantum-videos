/**
 * "Ya empezó sin vos" (27/09/2026), para closers. Lenguaje NUEVO de la serie: la arena de noche.
 * Un solo plano que baja: los estandartes del techo (e1) → el ring (e2, pelean y reciben nota) →
 * el tablero de progreso (e3, mejorás de verdad) → la pared de ofertas (e4, los directores eligen por rango) →
 * negro: el ranking con tu fila vacía (e5) → el puño leyenda contra la cámara y la placa (e6).
 * El fondo de tribunas es uno solo para todo el video y sube lento: la cámara nunca corta, desciende.
 * Todos los tiempos salen de la voz (`timeline.ts`).
 */
import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { RC } from "../ring-closers/tema";
import { Logo } from "../reel-rc/logo";
import { Acabado, Palabras } from "../oferta-rc/Muestra";
import { Destello, Metal } from "../secreto-rc/efectos";
import { GanchoComunidades } from "./Gancho";
import { DUR, L, comunidades } from "./timeline";

const SERIF = cargarSerif("italic").fontFamily;
const SANS = cargarManrope("normal", { weights: ["500", "700", "800"] }).fontFamily;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sale = Easing.out(Easing.cubic);
const rebota = Easing.out(Easing.back(1.8));
const r = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** impulso amortiguado desde el cuadro t (golpes, sacudidas, destellos) */
const imp = (f: number, t: number, k = 0.35) => (f < t ? 0 : Math.exp(-(f - t) * k));

/* ───────── piezas comunes ───────── */

/** Tribunas de la arena: una sola capa para todo el video, sube lento (la cámara baja). */
const Tribunas: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#050606", overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 55% at 50% 50%, #151918 0%, #0a0c0b 60%, transparent 100%)" }} />
    {Array.from({ length: 120 }).map((_, i) => {
      const d = 22 + r(i, 3) * 34;
      const y = ((r(i, 2) * 3200 - f * 1.6) % 3200 + 3200) % 3200 - 640;
      return (
        <div key={i} style={{ position: "absolute", left: r(i, 1) * 1100 - 30, top: y, width: d, height: d, borderRadius: "50%",
          background: r(i, 4) > 0.82 ? RC.esmeralda400 : "#f4f4f5", opacity: 0.08 + r(i, 5) * 0.2, filter: `blur(${9 + r(i, 6) * 12}px)` }} />
      );
    })}
  </AbsoluteFill>
);

/** Plano: entra desde abajo y sale hacia arriba con desenfoque de movimiento (la cámara que baja). */
const Plano: React.FC<{ dur: number; children: React.ReactNode; salida?: boolean }> = ({ dur, children, salida = true }) => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 12], [1, 0], { ...cl, easing: sale });
  const va = salida ? interpolate(f, [dur - 9, dur], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) }) : 0;
  const y = entra * 520 - va * 620;
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px)`, filter: `blur(${(entra + va) * 14}px)`, opacity: 1 - va * 0.6 }}>{children}</AbsoluteFill>
  );
};

/** Título chico: línea serif itálica en platino + línea sans con una palabra de acento. */
const Titulo: React.FC<{ serif: string; sans: string; en: number; en2: number; acento?: string[]; top?: number }> = ({ serif, sans, en, en2, acento, top = 290 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top, width: "100%", textAlign: "center", textShadow: "0 4px 30px #000" }}>
      <Palabras texto={serif} desde={en} f={f} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 60, lineHeight: 1.05, color: RC.platino500 }} />
      <Palabras texto={sans} desde={en2} f={f} acento={acento}
        style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.12, letterSpacing: -1.2, color: "#f4f4f5" }} />
    </div>
  );
};

const Halo: React.FC<{ y: number; fuerza?: number }> = ({ y, fuerza = 1 }) => (
  <div style={{ position: "absolute", left: 60, top: y - 420, width: 960, height: 840, borderRadius: "50%", opacity: fuerza,
    background: `radial-gradient(circle, ${RC.esmeralda600}40 0%, ${RC.esmeralda600}10 45%, transparent 70%)`, filter: "blur(28px)" }} />
);

const Chispas: React.FC<{ f: number; t: number; x: number; y: number; n?: number }> = ({ f, t, x, y, n = 18 }) => {
  const dt = f - t;
  if (dt < 0 || dt > 26) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, j) => {
        const a = r(j, 11) * Math.PI * 2;
        const v = 14 + r(j, 12) * 22;
        return (
          <div key={j} style={{ position: "absolute", left: x + Math.cos(a) * v * dt, top: y + Math.sin(a) * v * dt + dt * dt * 0.6,
            width: 5, height: 5, borderRadius: 3, background: j % 3 ? "#f4f4f5" : RC.esmeralda400, opacity: 1 - dt / 26, boxShadow: `0 0 8px ${RC.esmeralda400}` }} />
        );
      })}
    </>
  );
};

const Destellar: React.FC<{ f: number; t: number }> = ({ f, t }) => (
  <AbsoluteFill style={{ background: "#f4f4f5", opacity: 0.32 * imp(f, t, 0.45), mixBlendMode: "screen", pointerEvents: "none" }} />
);

/* ───────── e1: los estandartes ───────── */

const E1: React.FC = () => (
  <Plano dur={DUR("e1-gancho")}>
    <GanchoComunidades acabado={false}
      tiempos={[L("e1-gancho", "Elite") + 5, L("e1-gancho", "Five") + 4, L("e1-gancho", "Ese") + 4]}
      frase={[L("e1-gancho", "Mientras") - 3, L("e1-gancho", "ellos") - 3]} />
  </Plano>
);

/* ───────── e2: pelean en el ring y cada pelea deja una nota ───────── */

const Rincon: React.FC<{ src: string; nombre: string; lado: 1 | -1; en: number; f: number }> = ({ src, nombre, lado, en, f }) => {
  const e = interpolate(f, [en, en + 10], [0, 1], { ...cl, easing: rebota });
  return (
    <div style={{ position: "absolute", top: 130, [lado < 0 ? "left" : "right"]: 30, width: 400, textAlign: "center",
      transform: `translateX(${lado * (1 - e) * 500}px)`, opacity: e }}>
      <div style={{ width: 370, height: 370, margin: "0 auto", borderRadius: "50%", overflow: "hidden", background: "#0a0b0b",
        border: `3px solid ${lado < 0 ? RC.esmeralda500 : "#d4d4d8"}`, boxShadow: `0 0 50px ${lado < 0 ? RC.esmeralda500 + "55" : "#d4d4d833"}` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: "#f4f4f5", marginTop: 24 }}>{nombre}</div>
    </div>
  );
};

const E2: React.FC = () => {
  const f = useCurrentFrame();
  const pelean = L("e2-entrenan", "pelean");
  const closer = L("e2-entrenan", "closer");
  const nota = L("e2-entrenan", "nota.");
  const golpe = pelean - 2;
  const tarjeta = interpolate(f, [golpe - 6, golpe], [1.35, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const vis = interpolate(f, [golpe - 6, golpe - 2], [0, 1], cl);
  const estrellas = interpolate(f, [nota - 4, nota + 16], [0, 5], cl);
  const valor = interpolate(f, [nota - 4, nota + 18], [3.8, 4.9], { ...cl, easing: sale });
  const panel = interpolate(f, [nota - 10, nota], [0, 1], { ...cl, easing: rebota });
  const sac = 14 * imp(f, golpe, 0.4) * Math.cos((f - golpe) * 2.6);
  return (
    <Plano dur={DUR("e2-entrenan")}>
      <AbsoluteFill style={{ transform: `translateY(${sac}px)` }}>
        <Halo y={900} />
        <Titulo serif="cada semana," sans="pelean de verdad." en={L("e2-entrenan", "Cada") - 3} en2={pelean - 3} acento={["verdad."]} />
        {/* la tarjeta de pelea */}
        <div style={{ position: "absolute", left: 40, top: 470, width: 1000, height: 740, borderRadius: 44, opacity: vis,
          transform: `scale(${tarjeta})`, background: "linear-gradient(160deg, #161a19, #0a0c0b)", border: "1.5px solid rgba(212,212,216,0.18)",
          boxShadow: `0 60px 120px rgba(0,0,0,0.8), 0 0 ${90 * imp(f, golpe, 0.12)}px ${RC.esmeralda500}66` }}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 0, height: 2, background: `linear-gradient(90deg, transparent, ${RC.esmeralda400}, transparent)` }} />
          <div style={{ position: "absolute", top: 40, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: "#8a8a92" }}>
            ROLEPLAY · <span style={{ color: RC.esmeralda400 }}>EN VIVO</span>
          </div>
          <Rincon src="ring-closers/boxers/counter.webp" nombre="Closer n.º 014" lado={-1} en={golpe + 1} f={f} />
          <Rincon src="ring-closers/boxers/knockout.webp" nombre="Closer n.º 031" lado={1} en={golpe + 5} f={f} />
          <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 130, color: "#f4f4f5",
            transform: `scale(${1 + 0.4 * imp(f, closer, 0.3)})`, textShadow: `0 0 40px ${RC.esmeralda500}` }}>vs</div>
          <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: 4, color: "#6f6f77" }}>
            DEL OTRO LADO, OTRO CLOSER
          </div>
        </div>
        {/* la nota */}
        <div style={{ position: "absolute", left: 140, top: 1260, width: 800, height: 260, borderRadius: 32, opacity: panel,
          transform: `translateY(${(1 - panel) * 80}px) scale(${0.9 + panel * 0.1})`, background: `${RC.esmeralda500}12`,
          border: `1.5px solid ${RC.esmeralda500}88`, boxShadow: `0 0 ${60 * imp(f, nota + 16, 0.15)}px ${RC.esmeralda500}88`, textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 5, color: RC.esmeralda400, marginTop: 26 }}>NOTA DE TU RIVAL</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 26, marginTop: 10 }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, color: "#f4f4f5", letterSpacing: -3 }}>{valor.toFixed(1).replace(".", ",")}</div>
            <div style={{ fontSize: 54, letterSpacing: 4 }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const on = Math.min(1, Math.max(0, estrellas - i));
                return <span key={i} style={{ color: on > 0.5 ? RC.esmeralda400 : "#2a2d2c", display: "inline-block", transform: `scale(${1 + 0.5 * on * (1 - on) * 4})` }}>★</span>;
              })}
            </div>
          </div>
        </div>
        <Chispas f={f} t={golpe} x={540} y={840} />
        <Chispas f={f} t={nota + 16} x={540} y={1390} n={14} />
      </AbsoluteFill>
      <Destellar f={f} t={golpe} />
    </Plano>
  );
};

/* ───────── e3: mejorás de verdad ───────── */

const PUNTOS = [3.1, 3.6, 4.2, 4.7];

const E3: React.FC = () => {
  const f = useCurrentFrame();
  const trababa = L("e3-mejoran", "trababa");
  const cuarta = L("e3-mejoran", "cuarta");
  const solo = L("e3-mejoran", "solo.");
  const numeros = L("e3-mejoran", "números.");
  const dibujo = interpolate(f, [trababa - 4, solo + 4], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const X = (i: number) => 90 + i * 250;
  const Y = (v: number) => 560 - (v - 2.8) * 225;
  const d = PUNTOS.map((v, i) => `${i ? "L" : "M"} ${X(i)} ${Y(v)}`).join(" ");
  const largo = 900;
  const m1 = interpolate(f, [solo - 6, solo + 4], [0, 1], { ...cl, easing: rebota });
  const m2 = interpolate(f, [numeros - 6, numeros + 4], [0, 1], { ...cl, easing: rebota });
  const sube = f >= numeros + 8;
  return (
    <Plano dur={DUR("e3-mejoran")}>
      <Halo y={860} />
      <Titulo serif="semana a semana," sans="se nota." en={L("e3-mejoran", "Lo") - 2} en2={cuarta - 3} acento={["nota."]} />
      <div style={{ position: "absolute", left: 50, top: 470, width: 980, height: 700, borderRadius: 36, background: "linear-gradient(160deg, #151918, #0a0c0b)",
        border: "1.5px solid rgba(212,212,216,0.16)", boxShadow: "0 60px 120px rgba(0,0,0,0.8)" }}>
        <div style={{ position: "absolute", left: 50, top: 36, fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 5, color: "#8a8a92" }}>TU NOTA PROMEDIO</div>
        <svg width={980} height={700} style={{ position: "absolute", inset: 0 }}>
          {[3, 3.5, 4, 4.5].map((v) => <line key={v} x1={60} x2={940} y1={Y(v)} y2={Y(v)} stroke="rgba(212,212,216,0.08)" strokeWidth={2} />)}
          <path d={d} fill="none" stroke={RC.esmeralda400} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={largo} strokeDashoffset={largo * (1 - dibujo)} style={{ filter: `drop-shadow(0 0 14px ${RC.esmeralda500})` }} />
          {PUNTOS.map((v, i) => {
            const on = dibujo * 3 >= i - 0.02;
            return <circle key={i} cx={X(i)} cy={Y(v)} r={on ? 16 : 0} fill="#0a0c0b" stroke={RC.esmeralda400} strokeWidth={6} />;
          })}
        </svg>
        {PUNTOS.map((v, i) => (
          <div key={i} style={{ position: "absolute", left: X(i) - 60, top: 640, width: 120, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 22,
            letterSpacing: 3, color: i === 3 && dibujo > 0.98 ? RC.esmeralda400 : "#6f6f77" }}>SEM {i + 1}</div>
        ))}
        <div style={{ position: "absolute", left: X(3) - 110, top: Y(4.7) - 130, width: 220, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 76,
          color: "#f4f4f5", opacity: dibujo > 0.98 ? 1 : 0, transform: `scale(${1 + 0.3 * imp(f, solo + 4, 0.3)})`, textShadow: `0 0 30px ${RC.esmeralda500}` }}>4,7</div>
      </div>
      {/* medallas que se ganan entrenando */}
      <div style={{ position: "absolute", left: 30, top: 1200, transform: `translateY(${(1 - m1) * -500}px) rotate(${(1 - m1) * -30}deg)`, opacity: m1 }}>
        <Metal src="ring-closers/trophies/streak_10.webp" ancho={340} barrido={interpolate(f, [solo, solo + 30], [0, 1], cl)} />
      </div>
      <div style={{ position: "absolute", right: 30, top: 1200, transform: `translateY(${(1 - m2) * -500}px) rotate(${(1 - m2) * 30}deg)`, opacity: m2 }}>
        <Metal src="ring-closers/trophies/ten_roleplays.webp" ancho={340} barrido={interpolate(f, [numeros, numeros + 30], [0, 1], cl)} />
      </div>
      {/* sube de rango */}
      <div style={{ position: "absolute", left: 370, top: 1260, width: 340, textAlign: "center", opacity: interpolate(f, [numeros - 2, numeros + 6], [0, 1], cl) }}>
        <Img src={staticFile(`ring-closers/belts/${sube ? "campeon" : "contendiente"}.webp`)}
          style={{ width: 320, height: 200, objectFit: "contain", transform: `scale(${1 + 0.35 * imp(f, numeros + 8, 0.3)})`, filter: `drop-shadow(0 0 ${sube ? 30 : 0}px ${RC.esmeralda500})` }} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: sube ? RC.esmeralda400 : "#8a8a92" }}>{sube ? "CAMPEÓN ↑" : "CONTENDIENTE"}</div>
      </div>
      <Chispas f={f} t={numeros + 8} x={540} y={1300} />
      <Chispas f={f} t={solo} x={210} y={1300} n={12} />
      <Destellar f={f} t={numeros + 8} />
    </Plano>
  );
};

/* ───────── e4: las mejores ofertas, y eligen por rango ───────── */

const OFERTAS = [
  ["Closer High Ticket", "USD 5.000", "20 %"], ["Setter + Closer", "USD 3.000", "15 %"], ["Closer Infoproducto", "USD 8.000", "12 %"],
  ["Closer B2B", "USD 12.000", "10 %"], ["Closer Mentoría", "USD 4.500", "18 %"], ["Closer Remoto", "USD 6.000", "15 %"],
];

const Oferta: React.FC<{ o: string[]; campeon: boolean }> = ({ o, campeon }) => (
  <div style={{ width: 300, height: 190, borderRadius: 22, padding: "20px 22px", background: "linear-gradient(160deg, #171b1a, #0b0d0c)",
    border: "1.5px solid rgba(212,212,216,0.14)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: 2, color: RC.esmeralda400 }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: RC.esmeralda400 }} />ABIERTA
    </div>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 25, color: "#f4f4f5", marginTop: 10 }}>{o[0]}</div>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: "#ececef", marginTop: 8 }}>{o[1]}</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 16, letterSpacing: 2, color: "#7c7c84", marginTop: 4 }}>
      {o[2]} COMISIÓN{campeon ? <span style={{ color: RC.esmeralda400 }}> · RANGO CAMPEÓN</span> : null}
    </div>
  </div>
);

const E4: React.FC = () => {
  const f = useCurrentFrame();
  const directores = L("e4-ofertas", "directores");
  const mejores = L("e4-ofertas", "mejores");
  const rango = L("e4-ofertas", "rango.");
  const pared = interpolate(f, [directores - 6, directores + 6], [0, 1], { ...cl, easing: sale });
  const marco = interpolate(f, [rango - 10, rango], [0, 1], { ...cl, easing: rebota });
  const aviso = interpolate(f, [rango + 4, rango + 12], [0, 1], { ...cl, easing: rebota });
  return (
    <Plano dur={DUR("e4-ofertas")}>
      <Halo y={950} />
      <Titulo serif="lo que nadie te cuenta:" sans="las mejores ofertas están acá." en={L("e4-ofertas", "nadie") - 4} en2={mejores - 4} acento={["acá."]} />
      {/* la pared de ofertas, que sube sin parar */}
      <div style={{ position: "absolute", left: 0, top: 520, width: 1080, height: 980, overflow: "hidden", opacity: pared * (1 - marco * 0.6), filter: `blur(${1.5 + marco * 5}px)`,
        maskImage: "linear-gradient(transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(transparent, #000 12%, #000 88%, transparent)" }}>
        {[0, 1, 2].map((c) => (
          <div key={c} style={{ position: "absolute", left: 40 + c * 340, top: -((f * (4 + c * 1.2) + c * 90) % 660), display: "flex", flexDirection: "column", gap: 30 }}>
            {Array.from({ length: 8 }).map((_, k) => <Oferta key={k} o={OFERTAS[(k + c * 2) % 6]} campeon={(k + c) % 3 === 0} />)}
          </div>
        ))}
      </div>
      {/* el marco de oro elige a un closer */}
      <div style={{ position: "absolute", left: 540 - 300, top: 700, width: 600, height: 600, transform: `scale(${0.4 + marco * 0.6}) rotate(${(1 - marco) * -12}deg)`, opacity: marco }}>
        <div style={{ position: "absolute", left: 150, top: 150, width: 300, height: 300, borderRadius: "50%", overflow: "hidden" }}>
          <Img src={staticFile("ring-closers/boxers/legend.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <Metal src="ring-closers/shop/marco-oro.webp" ancho={600} barrido={interpolate(f, [rango, rango + 30], [0, 1], cl)} />
      </div>
      <div style={{ position: "absolute", left: 540 - 330, top: 1340, width: 660, padding: "22px 30px", borderRadius: 999, opacity: aviso,
        transform: `translateY(${(1 - aviso) * 60}px) scale(${0.85 + aviso * 0.15})`, background: "#0d1211", border: `2px solid ${RC.esmeralda500}`,
        boxShadow: `0 0 50px ${RC.esmeralda500}66`, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: RC.esmeralda400, boxShadow: `0 0 16px ${RC.esmeralda400}` }} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: "#f4f4f5" }}>Oferta recibida</div>
        <div style={{ marginLeft: "auto", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: RC.esmeralda400 }}>USD 8.000</div>
      </div>
      <Chispas f={f} t={rango} x={540} y={1000} n={22} />
      <Destellar f={f} t={rango} />
    </Plano>
  );
};

/* ───────── e5: negro. el ranking ya arrancó; tu fila está vacía ───────── */

const FILAS = [
  ["Closer n.º 007", "LEYENDA", "2.480"], ["Closer n.º 031", "LEYENDA", "2.315"], ["Closer n.º 014", "CAMPEÓN", "2.090"], ["Closer n.º 052", "CAMPEÓN", "1.960"],
  ["Closer n.º 019", "CAMPEÓN", "1.845"], ["Closer n.º 066", "CONTENDIENTE", "1.620"], ["Closer n.º 003", "CONTENDIENTE", "1.540"], ["Closer n.º 088", "CONTENDIENTE", "1.410"],
  ["Closer n.º 041", "CONTENDIENTE", "1.300"], ["Closer n.º 072", "PROSPECTO", "1.120"], ["Closer n.º 025", "PROSPECTO", "980"],
];
const BOXERS = ["southpaw", "speed", "guard_classic", "guard_high", "counter", "knockout", "legend"];

const E5: React.FC = () => {
  const f = useCurrentFrame();
  const arranco = L("e5-ranking", "arrancó.");
  const todavia = L("e5-ranking", "todavía");
  const ALTO = 112;
  const tope = FILAS.length * ALTO;
  const scroll = interpolate(f, [arranco - 14, todavia], [0, tope - 5 * ALTO], { ...cl, easing: Easing.out(Easing.poly(4)) });
  const parpadeo = f > todavia ? 0.55 + 0.45 * Math.abs(Math.cos((f - todavia) * 0.22)) : 0.4;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: "#8a8a92",
        opacity: interpolate(f, [0, 10], [0, 1], cl) }}>
        EL RANKING <span style={{ color: RC.esmeralda400 }}>YA ARRANCÓ</span>
      </div>
      <div style={{ position: "absolute", left: 70, top: 420, width: 940, height: 5.6 * ALTO + 120, overflow: "hidden",
        maskImage: "linear-gradient(transparent, #000 18%, #000)", WebkitMaskImage: "linear-gradient(transparent, #000 18%, #000)" }}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          {[...FILAS, null].map((fila, i) => (
            <div key={i} style={{ height: ALTO - 14, marginBottom: 14, borderRadius: 22, display: "flex", alignItems: "center", gap: 22, padding: "0 28px",
              background: fila ? "linear-gradient(120deg, #121615, #0a0c0b)" : "transparent",
              border: fila ? "1.5px solid rgba(212,212,216,0.1)" : `3px dashed ${RC.esmeralda400}`, opacity: fila ? 1 : parpadeo,
              boxShadow: fila ? "none" : `0 0 ${40 * parpadeo}px ${RC.esmeralda500}66` }}>
              <div style={{ width: 70, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: fila ? "#6f6f77" : RC.esmeralda400 }}>#{i + 1}</div>
              {fila ? (
                <>
                  <div style={{ width: 70, height: 70, borderRadius: 35, overflow: "hidden", border: "2px solid rgba(212,212,216,0.2)" }}>
                    <Img src={staticFile(`ring-closers/boxers/${BOXERS[i % 7]}.webp`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: "#e4e4e7" }}>{fila[0]}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: "#8a8a92", width: 190 }}>{fila[1]}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: "#f4f4f5", width: 110, textAlign: "right" }}>{fila[2]}</div>
                </>
              ) : (
                <div style={{ flex: 1, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 58, color: RC.esmeralda400, marginRight: 70 }}>— vos —</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1380, width: "100%", textAlign: "center" }}>
        <Palabras texto="tu nombre todavía no está." desde={L("e5-ranking", "Tu") - 2} f={f} acento={["no", "está."]}
          style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: -1, color: "#f4f4f5" }} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────── e6: el puño contra la cámara y la placa ───────── */

const E6: React.FC = () => {
  const f = useCurrentFrame();
  const ring = L("e6-cierre", "ring.");
  const choque = ring + 2;
  const puno = interpolate(f, [0, choque], [0.85, 3.2], { ...cl, easing: Easing.in(Easing.cubic) });
  const placa = choque + 6;
  const d = f - placa;
  return (
    <AbsoluteFill>
      {f < choque + 2 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Halo y={960} fuerza={1.3} />
          <div style={{ transform: `scale(${puno})`, filter: `blur(${Math.max(0, puno - 1.6) * 6}px)` }}>
            <Metal src="ring-closers/shop/puno-leyenda.webp" ancho={560} barrido={interpolate(f, [0, choque], [0, 1], cl)} />
          </div>
          <div style={{ position: "absolute", top: 1440, width: "100%", textAlign: "center" }}>
            <Palabras texto="Entrá al ring." desde={L("e6-cierre", "Entrá") - 2} f={f} acento={["ring."]}
              style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: -1.2, color: "#f4f4f5" }} />
          </div>
        </AbsoluteFill>
      )}
      {f >= choque && (
        <AbsoluteFill style={{ background: "#050606" }}>
          <Halo y={860} fuerza={1.2} />
          <Destello x={200} y={560} size={200} rot={8} blur={7} opacidad={0.55} />
          <Destello x={900} y={1250} size={150} rot={-10} blur={5} opacidad={0.5} />
          <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", transform: `scale(${1 + 0.08 * imp(f, placa, 0.2)})` }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Logo size={230} dibujoEn={placa} /></div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: 14, color: "#f4f4f5", marginTop: 40, opacity: interpolate(d, [6, 16], [0, 1], cl) }}>RING CLOSERS</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: RC.platino500, marginTop: 12, opacity: interpolate(d, [12, 22], [0, 1], cl) }}>ya empezó.</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: "#8a8a92", marginTop: 80, opacity: interpolate(d, [20, 30], [0, 1], cl) }}>
              ENTRÁ AL RING · <span style={{ color: RC.esmeralda400 }}>LINK EN LA BIO</span>
            </div>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#f4f4f5", opacity: interpolate(f, [choque - 1, choque, choque + 10], [0, 0.95, 0], cl), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const ESCENAS: Record<string, React.FC> = { "e1-gancho": E1, "e2-entrenan": E2, "e3-mejoran": E3, "e4-ofertas": E4, "e5-ranking": E5, "e6-cierre": E6 };

export const ComunidadesVideo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#050606" }}>
      <Tribunas f={f} />
      {comunidades.tl.escenas.map((e) => {
        const C = ESCENAS[e.id];
        return (
          <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.durationInFrames}>
            <C />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(0,0,0,0.7) 100%)", pointerEvents: "none" }} />
      <Acabado f={f} />
    </AbsoluteFill>
  );
};

export const DURACION = comunidades.total;
