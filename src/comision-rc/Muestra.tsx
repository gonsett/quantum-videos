import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MONO } from "../ring-closers/tema";
import { SANS, SERIF } from "../historias-rc/como-funciona";
import { Acabado } from "../secreto-rc/efectos";

/**
 * "Lo que dejaste sobre la mesa" (02/10/2026) — MUESTRA en movimiento (5 s, muda).
 * Lenguaje nuevo: MESA DE NEGOCIACIÓN DE NOCHE, vidrio negro que refleja. Héroe 1: el celular apoyado con el
 * grupo "Closers · Equipo" y tu mensaje de comisión (las reacciones caen con rebote). Héroe 2: la cámara se
 * aleja y al fondo de la mesa aparecen las FICHAS de póker (metal + esmeralda), lo que quedó del otro lado.
 * Datos inventados (montos, nombres, reacciones).
 */
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ESM = "#19c58c";

const Burbuja: React.FC<{ de?: string; texto: string; hora: string; mia?: boolean; op: number; y: number }> = ({ de, texto, hora, mia, op, y }) => (
  <div style={{ display: "flex", justifyContent: mia ? "flex-end" : "flex-start", opacity: op, transform: `translateY(${y}px)` }}>
    <div style={{ maxWidth: 360, padding: "14px 20px 10px", borderRadius: 22, background: mia ? "#0f3b2c" : "#1b1e22", color: "#e9ecef", fontFamily: SANS }}>
      {de ? <div style={{ fontSize: 19, fontWeight: 700, color: "#8fb3a6", marginBottom: 4 }}>{de}</div> : null}
      <div style={{ fontSize: 27, fontWeight: 500, lineHeight: 1.25 }}>{texto}</div>
      <div style={{ fontSize: 16, color: "rgba(233,236,239,0.45)", textAlign: "right", marginTop: 4, fontFamily: MONO }}>{hora}</div>
    </div>
  </div>
);

/** Pantalla del chat del grupo (coordenadas propias de 520 × 1060). */
const Chat: React.FC<{ f: number }> = ({ f }) => {
  const llega = interpolate(f, [16, 30], [0, 1], { ...cl, easing: ease });
  const reacciones = ["👏", "🔥", "🏆", "💸", "👑"];
  const resp = (en: number) => interpolate(f, [en, en + 10], [0, 1], { ...cl, easing: ease });
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
        <div style={{ alignSelf: "center", fontFamily: SANS, fontSize: 17, color: "rgba(241,243,245,0.5)", background: "#16191c", padding: "6px 16px", borderRadius: 12 }}>1 de octubre</div>
        <Burbuja de="Mati" texto="Septiembre: USD 5.900" hora="09:02" op={1} y={0} />
        <Burbuja de="Lu" texto="USD 7.200 💪" hora="09:07" op={1} y={0} />
        <div style={{ position: "relative" }}>
          <div style={{ transform: `scale(${0.9 + 0.1 * llega})`, transformOrigin: "100% 100%" }}>
            <Burbuja texto="Septiembre: USD 8.400" hora="09:12 ✓✓" mia op={llega} y={(1 - llega) * 40} />
          </div>
          <div style={{ position: "absolute", right: 18, bottom: -34, display: "flex", gap: 2, background: "#1b1e22", borderRadius: 20, padding: "4px 10px", border: "2px solid #0b0d0f", opacity: interpolate(f, [34, 38], [0, 1], cl) }}>
            {reacciones.map((r, i) => {
              const en = 34 + i * 5;
              const t = f - en;
              const caida = interpolate(t, [0, 6, 10, 14], [-60, 6, -3, 0], cl);
              const esc = interpolate(t, [0, 6, 10], [0.4, 1.25, 1], cl);
              return <span key={r} style={{ fontSize: 26, display: "inline-block", transform: `translateY(${caida}px) scale(${esc})`, opacity: t < 0 ? 0 : 1 }}>{r}</span>;
            })}
            <span style={{ fontFamily: SANS, fontSize: 19, color: "rgba(241,243,245,0.7)", marginLeft: 6, alignSelf: "center", opacity: interpolate(f, [56, 60], [0, 1], cl) }}>
              {Math.round(interpolate(f, [56, 72], [5, 12], cl))}
            </span>
          </div>
        </div>
        <div style={{ height: 18 }} />
        <Burbuja de="Fede" texto="Récord del equipo 👑" hora="09:13" op={resp(62)} y={(1 - resp(62)) * 30} />
        <Burbuja de="Caro" texto="Crack!!" hora="09:13" op={resp(74)} y={(1 - resp(74)) * 30} />
      </div>
    </div>
  );
};

/** Una pila de fichas: metal oscuro con incrustación esmeralda, vista desde arriba en ángulo. */
const Pila: React.FC<{ n: number; r: number; brillo: number }> = ({ n, r, brillo }) => {
  const ry = r * 0.36, alto = r * 0.17;
  const H = n * alto + ry * 2 + 4;
  return (
    <svg width={r * 2 + 8} height={H} viewBox={`${-r - 4} ${-ry - 2} ${r * 2 + 8} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`canto${r}`} x1="0" x2="1">
          <stop offset="0" stopColor="#0c0f10" /><stop offset="0.35" stopColor="#5b6266" /><stop offset="0.5" stopColor="#c9d0d3" /><stop offset="0.65" stopColor="#4a5155" /><stop offset="1" stopColor="#0a0c0d" />
        </linearGradient>
        <radialGradient id={`cara${r}`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#3a4246" /><stop offset="0.6" stopColor="#15191b" /><stop offset="1" stopColor="#0a0c0d" />
        </radialGradient>
      </defs>
      {Array.from({ length: n }, (_, k) => {
        const j = n - 1 - k; // de abajo hacia arriba
        const y = j * alto;
        return (
          <g key={k} transform={`translate(0 ${(n - 1) * alto - y})`}>
            <path d={`M${-r},0 L${-r},${alto} A${r},${ry} 0 0 0 ${r},${alto} L${r},0 Z`} fill={`url(#canto${r})`} />
            {Array.from({ length: 6 }, (_, s) => {
              const a0 = Math.PI * (0.08 + s * 0.15), a1 = a0 + 0.07;
              const x0 = -Math.cos(a0) * r, x1 = -Math.cos(a1) * r;
              return <path key={s} d={`M${x0},${Math.sin(a0) * ry + 1} L${x1},${Math.sin(a1) * ry + 1} L${x1},${Math.sin(a1) * ry + alto - 1} L${x0},${Math.sin(a0) * ry + alto - 1} Z`} fill={ESM} opacity={0.85} />;
            })}
            <ellipse cx={0} cy={0} rx={r} ry={ry} fill={`url(#cara${r})`} stroke="#6d767a" strokeWidth={1} />
          </g>
        );
      })}
      <g transform={`translate(0 0)`}>
        <ellipse cx={0} cy={0} rx={r * 0.78} ry={ry * 0.78} fill="none" stroke={ESM} strokeWidth={2} strokeDasharray="10 7" opacity={0.75} />
        <ellipse cx={0} cy={0} rx={r * 0.55} ry={ry * 0.55} fill="none" stroke="rgba(220,228,230,0.35)" strokeWidth={1} />
        <ellipse cx={-r * 0.25} cy={-ry * 0.35} rx={r * 0.5} ry={ry * 0.25} fill="white" opacity={0.07 + 0.12 * brillo} />
      </g>
    </svg>
  );
};

export const MuestraComision: React.FC = () => {
  const f = useCurrentFrame();
  // cámara: plano cerrado sobre el mensaje → se aleja y se inclina para revelar las fichas al fondo
  const atras = interpolate(f, [80, 140], [0, 1], { ...cl, easing: io });
  const escala = interpolate(atras, [0, 1], [1.75, 1.0]) * interpolate(f, [0, 80], [1, 1.04], cl);
  const camY = interpolate(atras, [0, 1], [-430, 560]);
  const fichasOp = interpolate(f, [92, 120], [0, 1], cl);
  const foco = interpolate(atras, [0, 1], [10, 0.6]);
  const telBlur = interpolate(atras, [0.5, 1], [0, 2.2], cl);
  // oro real (fotos FLUX recortadas): pilas altas al fondo, pilas cortas y monedas sueltas adelante
  const pilas = [
    { x: 230, y: 470, w: 190, t: "pila" }, { x: 450, y: 430, w: 215, t: "pila" }, { x: 905, y: 470, w: 180, t: "pila" },
    { x: 690, y: 500, w: 230, t: "corta", n: 4 }, { x: 330, y: 610, w: 250, t: "corta", n: 2 },
    { x: 610, y: 650, w: 250, t: "moneda" }, { x: 860, y: 680, w: 240, t: "moneda" },
  ];
  return (
    <AbsoluteFill style={{ background: "#040506", overflow: "hidden" }}>
      {/* el mundo: la mesa entera, la cámara la mueve */}
      <AbsoluteFill style={{ transform: `translateY(${camY}px) scale(${escala})`, transformOrigin: "50% 62%" }}>
        {/* vidrio negro: lámpara cenital, reflejo de horizonte */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 26% at 50% 22%, rgba(255,214,150,0.13), transparent 70%), radial-gradient(ellipse 70% 40% at 50% 62%, rgba(25,197,140,0.07), transparent 70%), linear-gradient(180deg,#020303 0%,#0a0d0f 30%,#07090a 100%)" }} />
        <div style={{ position: "absolute", left: -200, right: -200, top: 360, height: 2, background: "linear-gradient(90deg,transparent,rgba(200,215,220,0.22),transparent)", filter: "blur(1.5px)" }} />
        {/* fichas al fondo de la mesa + su reflejo */}
        <div style={{ opacity: fichasOp, filter: `blur(${foco}px)` }}>
          {pilas.map((p, i) => {
            const br = interpolate(f, [108 + i * 4, 120 + i * 4, 132 + i * 4], [1, 1.35, 1], cl);
            const ar = p.t === "pila" ? 684 / 371 : 316 / 427;
            const n = p.t === "corta" ? p.n ?? 1 : 1, paso = p.w * 0.09;
            const alto = p.w * ar + (n - 1) * paso;
            const pieza = (k: number, refl = false) => (
              <Img key={k} src={staticFile(`comision-rc/${p.t === "pila" ? "pila" : "moneda"}.png`)}
                style={{ position: "absolute", left: 0, width: p.w, top: refl ? k * paso : alto - p.w * ar - k * paso, filter: refl ? undefined : `brightness(${br}) saturate(1.05)` }} />
            );
            return (
              <React.Fragment key={i}>
                <div style={{ position: "absolute", left: p.x - p.w / 2, top: p.y - alto, width: p.w, height: alto, filter: "drop-shadow(0 22px 20px rgba(0,0,0,0.85))" }}>
                  {Array.from({ length: n }, (_, k) => pieza(k))}
                </div>
                <div style={{ position: "absolute", left: p.x - p.w / 2, top: p.y + 4, width: p.w, height: alto, transform: "scaleY(-1)", transformOrigin: "50% 0", opacity: 0.22, maskImage: "linear-gradient(0deg, black, transparent 45%)", WebkitMaskImage: "linear-gradient(0deg, black, transparent 45%)" }}>
                  {Array.from({ length: n }, (_, k) => pieza(k, true))}
                </div>
                <div style={{ position: "absolute", left: p.x - p.w * 0.7, top: p.y - 30, width: p.w * 1.4, height: 70, background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,190,80,0.18), transparent 70%)", filter: "blur(10px)" }} />
              </React.Fragment>
            );
          })}
        </div>
        {/* el celular apoyado en la mesa, en perspectiva */}
        <div style={{ position: "absolute", left: 270, top: 640, width: 540, height: 1080, perspective: 1800, filter: `blur(${telBlur}px)`, opacity: interpolate(atras, [0.5, 1], [1, 0.8], cl) }}>
          {/* luz de la pantalla sobre el vidrio */}
          <div style={{ position: "absolute", left: -160, right: -160, top: 120, bottom: -160, background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(25,197,140,0.16), transparent 70%)", filter: "blur(30px)" }} />
          <div style={{ position: "absolute", inset: 0, transform: "rotateX(24deg)", transformOrigin: "50% 100%", borderRadius: 64, background: "linear-gradient(145deg,#2a2f33,#0b0d0e 40%,#1b1f22)", padding: 14, boxShadow: "0 60px 90px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(210,220,225,0.25)" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 52, overflow: "hidden" }}>
              <Chat f={f} />
              {/* reflejo de la lámpara que barre el vidrio de la pantalla */}
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${interpolate(f, [0, 150], [10, 60])}%, rgba(255,255,255,0.06) ${interpolate(f, [0, 150], [18, 68])}%, transparent ${interpolate(f, [0, 150], [30, 80])}%)` }} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* texto: una línea discreta al final */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", opacity: interpolate(f, [122, 140], [0, 1], cl), transform: `translateY(${interpolate(f, [122, 140], [14, 0], { ...cl, easing: ease })}px)`, filter: `blur(${interpolate(f, [122, 140], [6, 0], cl)}px)` }}>
        <div style={{ fontFamily: SANS, fontSize: 40, color: "rgba(230,234,236,0.6)", fontWeight: 500 }}>¿Y cuánto dejaste</div>
        <div style={{ fontFamily: SERIF, fontSize: 64, color: "#eef1f2", marginTop: 4 }}>sobre la mesa?</div>
      </div>
      <Acabado />
    </AbsoluteFill>
  );
};
