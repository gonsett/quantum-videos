import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/InstrumentSerif";
import { Acabado } from "../secreto-rc/efectos";
import { Camara, DISPLAY, Firma, golpes, MONO, RC, SANS } from "../elite-rc/dopamina";
import { A, BEAT, DESDE, DUR } from "./timeline";

/**
 * Video para directores comerciales y dueños de empresa: "La firma" (26/09/2026).
 *
 * REGLA (Javier): ningún video puede parecerse al anterior. Acá no hay estrellas, ni pestañas, ni
 * objeto que cae, ni titulares Oswald con brillo. El lenguaje es de cine: plano detalle de una
 * lapicera que firma, sello seco, tormenta de currículums que vuela a cámara y se congela, un haz de
 * escaneo que revela debajo del papel lo que el closer HACE (racha, valoración de pares, rango,
 * disponibilidad), destellos anamórficos en cada golpe y serif cursiva para la palabra clave.
 */
const { fontFamily: SERIF } = cargarSerif("italic");
const EM = RC.esmeralda400;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.16, 1, 0.3, 1);
const tr = (f: number, a: number, b: number, e: (t: number) => number = suave) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

const azar = (s: number) => () => {
  s = (s * 16807) % 2147483647;
  return s / 2147483647;
};

// ── Texto: renglón que entra como un cambio de foco (de grande y borroso a nítido) ──
const Linea: React.FC<{ en: number; top: number; tam?: number; peso?: number; color?: string; sale?: number; children: React.ReactNode }> = ({ en, top, tam = 46, peso = 500, color = RC.platino300, sale, children }) => {
  const f = useCurrentFrame();
  const k = tr(f, en - 3, en + 14);
  const s = sale === undefined ? 0 : tr(f, sale, sale + 8);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", whiteSpace: "nowrap", fontFamily: SANS, fontWeight: peso, fontSize: tam, lineHeight: 1.3, color, opacity: k * (1 - s), transform: `scale(${1.08 - 0.08 * k})`, filter: k < 1 || s > 0 ? `blur(${(1 - k) * 10 + s * 8}px)` : undefined }}>
      {children}
    </div>
  );
};

/** La palabra que importa: serif cursiva, entra con un respiro de luz. */
const Clave: React.FC<{ en: number; color?: string; tam?: number; children: React.ReactNode }> = ({ en, color = EM, tam = 124, children }) => {
  const f = useCurrentFrame();
  const k = tr(f, en - 2, en + 10);
  const luz = interpolate(f, [en, en + 3, en + 16], [0, 1, 0], clamp);
  return (
    <span style={{ display: "inline-block", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: tam, lineHeight: 1.1, color, opacity: k, transform: `translateY(${(1 - k) * 18}px)`, textShadow: color === EM ? `0 0 ${30 + luz * 40}px rgba(16,185,129,${0.45 + luz * 0.4})` : `0 0 ${luz * 40}px rgba(255,255,255,${luz * 0.6})` }}>
      {children}
    </span>
  );
};

// ── Destello anamórfico: la raya horizontal de lente de cine en cada golpe ──
const Anamorfico: React.FC<{ y: number; en: number; fuerza?: number; color?: string }> = ({ y, en, fuerza = 1, color = "52,211,153" }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [en - 1, en + 1, en + 18], [0, 1, 0], clamp) * fuerza;
  if (k <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", left: -300, right: -300, top: y - 10, height: 20, background: `radial-gradient(ellipse at center, rgba(235,255,248,${k}), rgba(${color},${0.5 * k}) 30%, rgba(0,0,0,0) 70%)`, filter: "blur(3px)", mixBlendMode: "screen", transform: `scaleX(${0.6 + 0.6 * k})` }} />
      <div style={{ position: "absolute", left: 540 - 160, top: y - 160, width: 320, height: 320, borderRadius: 160, background: `radial-gradient(circle, rgba(235,255,248,${0.7 * k}), rgba(${color},0) 60%)`, mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 540 + 220, top: y + 60, width: 90, height: 90, borderRadius: 45, border: `2px solid rgba(${color},${0.35 * k})`, filter: "blur(2px)" }} />
    </>
  );
};

// ── La firma: curva cursiva determinista, la lapicera sigue la punta ──
const FIRMA = Array.from({ length: 120 }, (_, i) => {
  const t = i / 119;
  return { x: 60 + t * 540 + 22 * Math.cos(t * 26), y: 70 - 34 * Math.sin(t * 26) * (0.55 + 0.45 * Math.sin(t * 5 + 1)) - 12 * Math.sin(t * 3) };
});
const Lapicera: React.FC<{ x: number; y: number; alza: number }> = ({ x, y, alza }) => (
  <div style={{ position: "absolute", left: x, top: y - 560 - alza, width: 40, height: 560, transformOrigin: "20px 560px", transform: "rotate(32deg)", filter: "drop-shadow(-30px 40px 30px rgba(0,0,0,0.75))" }}>
    <div style={{ position: "absolute", left: 4, top: 0, width: 32, height: 330, borderRadius: "16px 16px 4px 4px", background: "linear-gradient(90deg,#5d6068 0%,#f4f5f7 28%,#aeb1b8 52%,#3c3e44 100%)" }} />
    <div style={{ position: "absolute", left: 30, top: 40, width: 7, height: 200, borderRadius: 3, background: "linear-gradient(90deg,#9ea1a8,#f2f3f5)" }} />
    <div style={{ position: "absolute", left: 3, top: 326, width: 34, height: 14, background: `linear-gradient(90deg,#0a3b2b,${EM},#0a3b2b)` }} />
    <div style={{ position: "absolute", left: 6, top: 340, width: 28, height: 150, borderRadius: "3px 3px 12px 12px", background: "linear-gradient(90deg,#050506,#2b2c31 35%,#0b0b0d)" }} />
    <div style={{ position: "absolute", left: 11, top: 488, width: 18, height: 72, clipPath: "polygon(0 0,100% 0,56% 100%,44% 100%)", background: "linear-gradient(90deg,#8b8e95,#ffffff 45%,#6d7077)" }} />
  </div>
);

const Contrato: React.FC<{ k: number; titulo: string; verde?: boolean; stampEn?: number }> = ({ k, titulo, verde, stampEn }) => {
  const f = useCurrentFrame();
  const n = Math.max(1, Math.round(k * FIRMA.length));
  const pts = FIRMA.slice(0, n);
  const punta = pts[pts.length - 1];
  const sello = stampEn === undefined ? 0 : tr(f, stampEn, stampEn + 5, Easing.out(Easing.cubic));
  const tinta = verde ? EM : "#1b1c22";
  return (
    <div style={{ position: "absolute", left: 90, top: 560, width: 900, height: 900, transform: "perspective(1200px) rotateX(34deg) rotateZ(-6deg)", transformOrigin: "50% 60%" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: verde ? "linear-gradient(165deg,#f1f0ec,#d8d6cf)" : "linear-gradient(165deg,#eceae5,#c6c4be)", boxShadow: "0 80px 140px rgba(0,0,0,0.9)" }}>
        <div style={{ position: "absolute", left: 70, top: 64, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.24em", color: "#2a2b31" }}>{titulo}</div>
        {[140, 180, 220, 260, 300, 340, 380].map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 70, top: t, width: [700, 740, 620, 720, 680, 560, 420][i], height: 10, borderRadius: 2, background: "rgba(40,40,46,0.28)" }} />
        ))}
        <div style={{ position: "absolute", left: 70, top: 640, width: 700, height: 2, background: "rgba(40,40,46,0.5)" }} />
        <div style={{ position: "absolute", left: 70, top: 656, fontFamily: MONO, fontSize: 18, letterSpacing: "0.18em", color: "#55565c" }}>FIRMA DEL CLOSER</div>
        <svg width={760} height={160} style={{ position: "absolute", left: 60, top: 500, overflow: "visible", filter: verde ? `drop-shadow(0 0 10px ${EM})` : undefined }}>
          <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={tinta} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {sello > 0 && (
          <div style={{ position: "absolute", left: 300, top: 420, padding: "18px 34px", border: "6px solid #3a3b41", borderRadius: 14, fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, lineHeight: 1.15, letterSpacing: "0.1em", whiteSpace: "nowrap", color: "#3a3b41", opacity: 0.85 * sello, transform: `rotate(-9deg) scale(${2.2 - 1.2 * sello})`, mixBlendMode: "multiply" }}>
            30 DÍAS · 0 CIERRES
          </div>
        )}
      </div>
      {k > 0 && k < 1 && <Lapicera x={60 + punta.x} y={500 + punta.y} alza={0} />}
      {k >= 1 && <Lapicera x={60 + punta.x + 40} y={500 + punta.y - 10} alza={60 * Math.min(1, (f % 1000) / 1000 + 0.4)} />}
    </div>
  );
};

// ── Tormenta de currículums: vuelan a cámara con aceleraciones en cada beat y se congelan ──
const r = azar(11);
const HOJAS = Array.from({ length: 26 }, () => ({ ang: r() * Math.PI * 2, rad: 120 + r() * 520, z0: r(), rot: (r() - 0.5) * 80, ry: (r() - 0.5) * 90 }));

const Tormenta: React.FC<{ viaje: number; atenua: number; vis: number }> = ({ viaje, atenua, vis }) => (
  <div style={{ position: "absolute", inset: 0, opacity: vis }}>
    {HOJAS.map((h, i) => {
      const z = (h.z0 + viaje) % 1;
      const esc = 0.15 + z * z * 2.4;
      const w = 260 * esc;
      const x = 540 + Math.cos(h.ang) * h.rad * (0.2 + z * 1.8);
      const y = 900 + Math.sin(h.ang) * h.rad * (0.2 + z * 1.8);
      const op = Math.min(1, z * 4) * (1 - Math.max(0, (z - 0.8) / 0.2));
      return (
        <div key={i} style={{ position: "absolute", left: x - w / 2, top: y - w * 0.65, width: w, height: w * 1.3, borderRadius: 4, background: "linear-gradient(160deg,#dcdde1,#8e9096)", opacity: op * (0.5 - 0.42 * atenua) * (atenua > 0 && z > 0.55 ? 1 - atenua : 1), filter: `blur(${Math.abs(z - 0.45) * 14 + atenua * 4}px)`, transform: `perspective(900px) rotateY(${h.ry + viaje * 60}deg) rotate(${h.rot + viaje * 40}deg)` }}>
          <div style={{ position: "absolute", left: "12%", top: "58%", fontFamily: SERIF, fontStyle: "italic", fontSize: w * 0.12, color: "#3a3a40", whiteSpace: "nowrap" }}>“Cierro todo.”</div>
          {[0.14, 0.24, 0.32, 0.4].map((t, j) => (
            <div key={j} style={{ position: "absolute", left: "12%", top: `${t * 100}%`, width: `${50 + j * 9}%`, height: Math.max(2, w * 0.02), background: "rgba(40,40,46,0.45)" }} />
          ))}
        </div>
      );
    })}
  </div>
);

// ── La hoja escaneada ──
const latido = (() => {
  const p: string[] = ["M0,60"];
  for (let i = 0; i < 12; i++) {
    const x0 = 20 + i * 52;
    p.push(`L${x0},60 L${x0 + 10},60 L${x0 + 16},${30 - (i % 3) * 8} L${x0 + 23},92 L${x0 + 30},18 L${x0 + 37},60`);
  }
  p.push("L640,60");
  return p.join(" ");
})();
const FINAL = 680;

const Escaneo: React.FC<{ haz: number; dibujo: number; semanas: number; puntos: number[]; nota: number; metal: number; chip: number }> = ({ haz, dibujo, semanas, puntos, nota, metal, chip }) => (
  <>
    <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: "linear-gradient(165deg,#eceae5,#c9c7c1)", clipPath: `inset(${haz}px 0 0 0)` }}>
      {[712, 744, 776].map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 60, top: t, width: [420, 560, 500][i], height: 10, borderRadius: 2, background: "rgba(40,40,46,0.35)" }} />
      ))}
      <div style={{ position: "absolute", left: 60, top: 810, fontFamily: SERIF, fontStyle: "italic", fontSize: 58, color: "#3a3a40" }}>“Cierro todo.”</div>
      <div style={{ position: "absolute", right: 60, top: 900, fontFamily: MONO, fontSize: 18, letterSpacing: "0.14em", color: "#6a6a70" }}>CURRÍCULUM · 1 DE 40</div>
    </div>
    <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: "linear-gradient(180deg,#07130f,#050807)", border: "1px solid rgba(52,211,153,0.25)", clipPath: `inset(0 0 ${960 - haz}px 0)` }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(52,211,153,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.06) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "absolute", left: 40, top: 36, fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.22em", color: EM }}>● EN VIVO · RING CLOSERS</div>
      <svg width={640} height={110} style={{ position: "absolute", left: 40, top: 96, filter: `drop-shadow(0 0 8px ${EM})` }}>
        <path d={latido} pathLength={1} fill="none" stroke={EM} strokeWidth={4} strokeLinejoin="round" strokeDasharray="1" strokeDashoffset={1 - dibujo} />
      </svg>
      <div style={{ position: "absolute", left: 40, top: 222, display: "flex", alignItems: "baseline", gap: 22 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.1, color: RC.crema, minWidth: 110 }}>{semanas}</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: RC.platino300 }}>SEMANAS SEGUIDAS ENTRENANDO</span>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 360, height: 1, background: "rgba(52,211,153,0.2)" }} />
      <div style={{ position: "absolute", left: 40, top: 392, display: "flex", alignItems: "center", gap: 14 }}>
        {puntos.map((v, i) => (
          <div key={i} style={{ width: 34, height: 34, borderRadius: 17, border: `2px solid ${EM}`, background: `linear-gradient(90deg, ${EM} ${v * 100}%, transparent ${v * 100}%)`, boxShadow: v > 0 ? `0 0 ${12 + 10 * v}px rgba(52,211,153,0.6)` : undefined, transform: `scale(${1 + 0.25 * Math.sin(Math.PI * Math.min(1, v * 1.4))})` }} />
        ))}
        <span style={{ marginLeft: 16, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: RC.crema }}>{nota.toFixed(1).replace(".", ",")}</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: RC.platino300 }}>/ 5 · SUS PARES</span>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 470, height: 1, background: "rgba(52,211,153,0.2)" }} />
      <div style={{ position: "absolute", left: 40, top: 494, display: "flex", alignItems: "baseline", gap: 22 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, lineHeight: 1.15, letterSpacing: "0.12em", backgroundImage: `linear-gradient(100deg,#a9adb5 ${metal * 140 - 40}%,#ffffff ${metal * 140 - 20}%,#a9adb5 ${metal * 140}%)`, WebkitBackgroundClip: "text", color: "transparent" }}>CAMPEÓN</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: RC.platino300 }}>RANGO GANADO EN EL RING</span>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 580, height: 1, background: "rgba(52,211,153,0.2)" }} />
      <div style={{ position: "absolute", left: 40, top: 604, display: "flex", gap: 16 }}>
        {["FULL-TIME", "PART-TIME", "NO DISPONIBLE"].map((t, i) => (
          <div key={t} style={{ padding: "8px 20px", borderRadius: 999, border: `1.5px solid ${i === 0 ? `rgba(52,211,153,${0.3 + 0.7 * chip})` : "rgba(255,255,255,0.14)"}`, background: i === 0 ? `rgba(52,211,153,${0.9 * chip})` : "transparent", fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: "0.12em", color: i === 0 ? (chip > 0.5 ? "#04130d" : EM) : RC.platino500, boxShadow: i === 0 && chip > 0 ? `0 0 ${24 * chip}px rgba(52,211,153,0.6)` : undefined }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  </>
);

// ── Composición ──
export const DirectoresVideo: React.FC = () => {
  const f = useCurrentFrame();
  const e = (id: string) => DESDE(id);
  const e2 = e("e2-grupo");
  const e3 = e("e3-hambre");
  const e4 = e("e4-calidad");
  const e5 = e("e5-rango");
  const e6 = e("e6-cierre");
  const fin = e6 + DUR("e6-cierre");

  // Golpes: dónde cae cada impacto (mismos cuadros que el diseño sonoro).
  const nada = A("e1-gancho", "nada");
  const ring = A("e3-hambre", "Ring");
  const hambre = A("e3-hambre", "hambre");
  const calidad = A("e4-calidad", "calidad");
  const rango = A("e5-rango", "rango");
  const busca = A("e5-rango", "busca");
  const probados = A("e6-cierre", "probados");
  const HITS = [nada - 1, e2, ring - 2, hambre - 1, calidad - 1, rango - 1, busca, probados - 1];
  const g = golpes(f, HITS);

  // Firma del gancho y del cierre.
  const firma1 = tr(f, A("e1-gancho", "contrataste") - 6, A("e1-gancho", "entrevista") + 4, Easing.inOut(Easing.quad));
  const firma2 = tr(f, A("e6-cierre", "Contratá") - 4, probados - 2, Easing.inOut(Easing.quad));

  // Tormenta: viaja con aceleraciones en cada beat y se congela en "Ring".
  const congelado = ring - 2;
  const fv = Math.min(f, congelado);
  let viaje = Math.max(0, (fv - e2 + 6) / 30) * 0.22;
  for (let b = e2; b < congelado; b += BEAT) viaje += 0.05 * tr(fv, b, b + 6);
  const tormentaVis = tr(f, e2 - 6, e2 + 2) * (1 - tr(f, e6 - 4, e6 + 10));

  // Hoja escaneada.
  const entra = tr(f, ring - 2, ring + 14);
  const haz =
    f < e4
      ? 40 + 320 * tr(f, A("e3-hambre", "Ves") - 4, A("e3-hambre", "semanas") + 6, Easing.inOut(Easing.quad))
      : f < e5
        ? 360 + 115 * tr(f, e4, A("e4-calidad", "closers"), Easing.inOut(Easing.quad))
        : 475 + (FINAL - 475) * tr(f, e5, busca - 2, Easing.inOut(Easing.quad));
  const dibujo = tr(f, A("e3-hambre", "semanas") - 10, A("e3-hambre", "semanas") + 20, Easing.linear);
  const semanas = Math.round(12 * tr(f, A("e3-hambre", "semanas") - 4, hambre - 4, Easing.out(Easing.quad)));
  const p0 = A("e4-calidad", "calificaron");
  const puntos = [0, 1, 2, 3, 4].map((i) => (i < 4 ? 1 : 0.7) * tr(f, p0 + i * 6, p0 + i * 6 + 5, Easing.out(Easing.cubic)));
  const nota = 4.7 * tr(f, p0, p0 + 30, Easing.out(Easing.quad));
  const metal = tr(f, rango - 2, rango + 22, Easing.inOut(Easing.quad));
  const chip = tr(f, busca, busca + 5);
  const hojaVis = entra * (1 - tr(f, e6 - 2, e6 + 10));
  const hazY = 380 + haz;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050506" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 900px 700px at 50% 1000px, rgba(52,211,153,${f >= ring ? 0.1 : 0.02}), rgba(0,0,0,0) 70%), linear-gradient(180deg,#050506,#0a0b0c 50%,#050506)` }} />
      <Camara g={g}>
        <Tormenta viaje={viaje} atenua={tr(f, ring - 2, ring + 10)} vis={tormentaVis} />

        {/* 1 · Gancho: la firma y el sello. */}
        {f < e2 + 8 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - tr(f, e2 - 2, e2 + 8), filter: `saturate(${1 - 0.8 * tr(f, nada, nada + 6)})` }}>
            <Contrato k={firma1} titulo="CONTRATO · CLOSER COMERCIAL" stampEn={nada - 1} />
          </div>
        )}
        <Linea en={A("e1-gancho", "El")} top={250} sale={e2 - 4}>El último closer que contrataste</Linea>
        <Linea en={A("e1-gancho", "hablaba")} top={312} sale={e2 - 4}>
          hablaba como un <span style={{ color: RC.crema, fontWeight: 700 }}>campeón.</span>
        </Linea>
        <Linea en={A("e1-gancho", "Al")} top={1420} tam={44} color={RC.platino300} sale={e2 - 4}>
          Al mes, no había cerrado <Clave en={nada} color={RC.crema}>nada.</Clave>
        </Linea>

        {/* 2 · El grupo: la tormenta. */}
        <Linea en={A("e2-grupo", "Porque")} top={270} sale={ring - 4}>Porque lo sacaste de un grupo</Linea>
        <Linea en={A("e2-grupo", "donde")} top={1420} tam={44} sale={ring - 4}>
          donde todos dicen <Clave en={A("e2-grupo", "mismo")} color={RC.crema}>lo mismo.</Clave>
        </Linea>
        {f >= e2 && f < ring && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.2em", color: RC.platino500 }}>
            CURRÍCULUMS RECIBIDOS · {String(Math.min(40, Math.round(40 * tr(f, e2, ring - 6, Easing.in(Easing.quad))))).padStart(2, "0")}
          </div>
        )}

        {/* 3-5 · La hoja escaneada. */}
        {hojaVis > 0 && (
          <div style={{ position: "absolute", left: 180, top: 380, width: 720, height: 960, opacity: hojaVis, transform: `perspective(1400px) rotateY(${-7 + (1 - entra) * 30}deg) rotateX(4deg) rotate(${-1.5 + (1 - entra) * 12}deg) scale(${2.1 - 1.1 * entra}) translateY(${Math.sin(f / 40) * 6}px)`, filter: entra < 1 ? `blur(${(1 - entra) * 12}px)` : undefined, boxShadow: "0 60px 120px rgba(0,0,0,0.85)" }}>
            <Escaneo haz={haz} dibujo={dibujo} semanas={semanas} puntos={puntos} nota={nota} metal={metal} chip={chip} />
          </div>
        )}
        {hojaVis > 0 && haz < FINAL - 2 && (
          <div style={{ opacity: hojaVis }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: hazY - 120, height: 120, background: "linear-gradient(180deg, rgba(52,211,153,0), rgba(52,211,153,0.16))", mixBlendMode: "screen" }} />
            <div style={{ position: "absolute", left: 120, right: 120, top: hazY - 2, height: 4, background: "#d9fff0", boxShadow: `0 0 16px ${EM}, 0 0 50px ${EM}, 0 0 110px rgba(16,185,129,0.8)` }} />
            <div style={{ position: "absolute", left: -200, right: -200, top: hazY - 14, height: 28, background: "radial-gradient(ellipse at center, rgba(180,255,230,0.55), rgba(52,211,153,0.15) 35%, rgba(0,0,0,0) 70%)", filter: "blur(4px)", mixBlendMode: "screen" }} />
          </div>
        )}
        <Linea en={A("e3-hambre", "En")} top={250} sale={A("e3-hambre", "Ves") - 4}>En Ring Closers no ves lo que dice.</Linea>
        <Linea en={A("e3-hambre", "Ves")} top={262} sale={e4 - 4}>
          <span style={{ color: RC.crema, fontWeight: 700 }}>Ves lo que hace.</span>
        </Linea>
        <Linea en={A("e3-hambre", "Eso")} top={1390} tam={44} sale={e4 - 4}>
          Eso es <Clave en={hambre}>hambre.</Clave>
        </Linea>
        <Linea en={A("e4-calidad", "Cómo")} top={250} sale={e5 - 4}>Cómo lo calificaron</Linea>
        <Linea en={A("e4-calidad", "los")} top={312} sale={e5 - 4}>los closers que pelearon contra él.</Linea>
        <Linea en={A("e4-calidad", "Eso")} top={1390} tam={44} sale={e5 - 4}>
          Eso es <Clave en={calidad}>calidad.</Clave>
        </Linea>
        <Linea en={A("e5-rango", "Su")} top={250} sale={e6 - 4}>
          Su rango, <span style={{ color: RC.crema, fontWeight: 700 }}>ganado en el ring.</span>
        </Linea>
        <Linea en={A("e5-rango", "Y")} top={1400} tam={44} sale={e6 - 4}>Y si busca full-time o part-time.</Linea>

        {/* 6 · Cierre: la firma que se enciende. */}
        {f >= e6 - 2 && (
          <div style={{ position: "absolute", inset: 0, opacity: tr(f, e6 - 2, e6 + 10), transform: `translateY(${(1 - tr(f, e6 - 2, e6 + 14)) * 80}px)` }}>
            <Contrato k={firma2} titulo="CONTRATO · CLOSER PROBADO" verde={f >= probados - 2} />
          </div>
        )}
        <Linea en={A("e6-cierre", "Dejá")} top={250}>Dejá de contratar promesas.</Linea>
        <Linea en={A("e6-cierre", "Contratá")} top={312} tam={50} peso={700} color={RC.crema}>
          Contratá closers <Clave en={probados} tam={112}>probados.</Clave>
        </Linea>
        {f >= A("e6-cierre", "Link") - 4 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center", opacity: tr(f, A("e6-cierre", "Link") - 4, A("e6-cierre", "Link") + 8) }}>
            <div style={{ padding: "16px 44px", borderRadius: 999, border: `1.5px solid ${EM}`, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: "0.2em", color: EM }}>LINK EN LA BIO ↑</div>
          </div>
        )}
      </Camara>

      {[nada, ring, hambre, calidad, rango, probados].map((h, i) => (
        <Anamorfico key={i} y={i === 0 ? 1100 : i === 1 ? 900 : i === 5 ? 1080 : Math.min(1340, hazY)} en={h - 1} fuerza={i === 5 ? 1.3 : i === 0 ? 0.6 : 1} color={i === 0 ? "220,222,228" : "52,211,153"} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: tr(f, fin - 8, fin) }} />
      <Firma en={e6} />
      <Acabado />
    </AbsoluteFill>
  );
};
