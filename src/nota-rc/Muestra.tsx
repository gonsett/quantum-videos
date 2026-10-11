import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { loadFont as cargarMano } from "@remotion/google-fonts/Caveat";
import { MONO } from "../ring-closers/tema";
import { SANS, SERIF } from "../historias-rc/como-funciona";

/**
 * "La nota que no podés comprar" (02/10/2026) — MUESTRA en movimiento (5 s, muda).
 * Lenguaje nuevo, opuesto a todos los anteriores (oscuros): MUNDO DE PAPEL MARFIL a plena luz, tinta
 * negra y UN acento esmeralda que es tinta de sello. Héroe: la tarjeta de puntaje del rival (como la del
 * juez en el ring), en perspectiva, con profundidad de campo. Las estrellas se SELLAN, no aparecen.
 * Verdad del producto: peer_evaluations (1 a 5 estrellas + comentario opcional, nadie se puntúa a sí mismo),
 * promedio en el CV como "Valoración de sus pares".
 */
const MANO = cargarMano("normal", { weights: ["500", "700"] }).fontFamily;
const TINTA = "#141416", GRIS = "#7a766d", SELLO = "#0a8a5f", MARFIL = "#efe9dd";
const STAR = "M50,30 L54.7,43.53 L69.02,43.82 L57.61,52.47 L61.76,66.18 L50,58 L38.24,66.18 L42.39,52.47 L30.98,43.82 L45.3,43.53 Z";
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Estrella: React.FC<{ f: number; en: number; llena: boolean }> = ({ f, en, llena }) => {
  const t = f - en;
  const s = llena ? interpolate(t, [0, 4, 9], [1.9, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const op = llena ? interpolate(t, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const tinta = llena ? interpolate(t, [2, 14], [1, 0.86], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <div style={{ position: "relative", width: 112, height: 112 }}>
      <svg viewBox="26 26 48 46" style={{ position: "absolute", inset: 0 }}><path d={STAR} fill="none" stroke="rgba(20,20,22,0.25)" strokeWidth={1.2} /></svg>
      {llena ? (
        <svg viewBox="26 26 48 46" style={{ position: "absolute", inset: 0, transform: `scale(${s}) rotate(${(en % 7) - 3}deg)`, opacity: op * tinta, filter: "url(#tinta)" }}>
          <path d={STAR} fill={SELLO} />
        </svg>
      ) : null}
    </div>
  );
};

export const MuestraNota: React.FC = () => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 34], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const golpes = [44, 58, 72, 86];
  const sacudida = golpes.reduce((a, g) => a + (f >= g && f < g + 6 ? Math.sin((f - g) * 2.6) * (6 - (f - g)) * 0.9 : 0), 0);
  const empuje = interpolate(f, [0, 150], [1, 1.07]);
  const texto = interpolate(f, [104, 124], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const firma = interpolate(f, [128, 146], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const posX = (i: number) => 60 + i * 134 - 9;
  const selloX = interpolate(f, golpes, golpes.map((_, i) => posX(i)), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const dist = Math.min(...golpes.map((g) => Math.abs(f - g)));
  const alza = f < golpes[0] - 10 ? 1 : Math.min(1, dist / 7) * (f > golpes[3] + 6 ? 2.4 : 0.75);
  const selloOp = interpolate(f, [30, 38, 100, 108], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const trazo = interpolate(f, [96, 132], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: MARFIL, overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="tinta"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="r" />
          <feDisplacementMap in="SourceGraphic" in2="r" scale={2.2} /></filter>
        <filter id="fibra"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={3} seed={9} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 0.10 0" /></filter>
      </svg>
      {/* luz de ventana: un lado más claro, sombra suave del otro */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 30% 30%, rgba(255,253,247,0.9), transparent 60%), linear-gradient(180deg, transparent 60%, rgba(120,110,90,0.18))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#fibra)" /></svg>
      {/* sombra de persiana: luz de ventana que cruza en diagonal */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(-28deg, transparent 0 120px, rgba(90,78,55,0.13) 120px 175px)", filter: "blur(14px)", transform: `translateX(${f * 0.25}px)`,
        WebkitMaskImage: "linear-gradient(200deg, black 25%, transparent 85%)", maskImage: "linear-gradient(200deg, black 25%, transparent 85%)" }} />

      {/* titular: chico, tinta negra, la palabra emocional en serif itálica */}
      <div style={{ position: "absolute", left: 96, right: 96, top: 300, opacity: texto, transform: `translateY(${(1 - texto) * 18}px)`, filter: `blur(${(1 - texto) * 6}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, lineHeight: 1.08, letterSpacing: -1.4, color: TINTA }}>
          Tus estrellas<br />las pone <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "1.14em", color: SELLO, letterSpacing: 0 }}>otro</span>.
        </div>
      </div>

      {/* la tarjeta de puntaje en perspectiva */}
      <AbsoluteFill style={{ perspective: 1800, transform: `scale(${empuje})` }}>
        <div style={{ position: "absolute", left: 120, top: 640, width: 840, height: 860,
          transform: `translateY(${(1 - entra) * 700 + sacudida}px) rotateX(${18 - entra * 6}deg) rotateZ(${-4 + entra * 1.5}deg)`, transformOrigin: "50% 80%" }}>
          {/* otras tarjetas de rivales debajo: muchas evaluaciones, no una */}
          {[{ r: 7, x: 40, y: 40 }, { r: -6, x: -36, y: 70 }].map((c, i) => (
            <div key={i} style={{ position: "absolute", inset: 0, transform: `translate(${c.x}px, ${c.y}px) rotate(${c.r}deg)`, borderRadius: 8, background: "linear-gradient(165deg, #f6f1e7, #e6dfcf)", boxShadow: "0 18px 40px rgba(70,60,40,0.28), 0 1px 2px rgba(60,50,30,0.3)" }}>
              <div style={{ position: "absolute", left: 60, right: 60, top: 52, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 21, letterSpacing: 5, color: GRIS, opacity: 0.7 }}><span>TARJETA DE PUNTAJE</span><span>N.º 04{5 + i}</span></div>
            </div>
          ))}
          {/* sombra en la mesa */}
          <div style={{ position: "absolute", left: 30, right: 10, top: 60, bottom: -40, background: "rgba(70,60,40,0.35)", filter: "blur(38px)", borderRadius: 30 }} />
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 8, overflow: "hidden", background: "linear-gradient(165deg, #fbf8f1, #f1ebdf 70%, #e7e0d1)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 3px rgba(60,50,30,0.25)" }}>
            <div style={{ padding: "52px 60px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 21, letterSpacing: 5, color: GRIS, textTransform: "uppercase" }}>
                <span>Tarjeta de puntaje</span><span>Roleplay N.º 048</span>
              </div>
              <div style={{ height: 3, background: TINTA, margin: "20px 0 0" }} />
              {[["Puntúa", "Tomás Rivero · rival"], ["Puntuada", "Martina Rossi"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 26, padding: "26px 0", borderBottom: "1.5px solid rgba(20,20,22,0.16)" }}>
                  <span style={{ width: 170, fontFamily: MONO, fontSize: 19, letterSpacing: 4, color: GRIS, textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: TINTA }}>{v}</span>
                </div>
              ))}
              <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 4, color: GRIS, textTransform: "uppercase", marginTop: 40 }}>Valoración</div>
              <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
                {[0, 1, 2, 3, 4].map((i) => <Estrella key={i} f={f} en={golpes[i] ?? 9999} llena={i < 4} />)}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 4, color: GRIS, textTransform: "uppercase", marginTop: 48 }}>Comentario</div>
              <div style={{ position: "relative", marginTop: 10, height: 120 }}>
                <div style={{ fontFamily: MANO, fontWeight: 500, fontSize: 60, color: "#1d2a4a", clipPath: `inset(0 ${100 - trazo * 100}% 0 0)`, transform: "rotate(-1.5deg)" }}>Cerró bien la objeción de precio.</div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 86, height: 1.5, background: "rgba(20,20,22,0.18)" }} />
              </div>
            </div>
            <div style={{ position: "absolute", left: 60, right: 60, bottom: 54, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 4, color: GRIS }}>FIRMA DEL RIVAL</span>
              <span style={{ fontFamily: MANO, fontWeight: 700, fontSize: 68, color: "#1d2a4a", transform: "rotate(-6deg)", clipPath: `inset(0 ${100 - firma * 100}% 0 0)` }}>T. Rivero</span>
            </div>
            {/* reflejo de la luz sobre la cartulina */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 35%)" }} />
          </div>
          {/* el sello de goma que estampa cada estrella */}
          <div style={{ position: "absolute", left: selloX, top: 300 - alza * 150, transform: `rotate(${-3 + alza * 4}deg)`, opacity: selloOp, zIndex: 5 }}>
            <div style={{ position: "absolute", left: 10, top: 170 + alza * 150, width: 110, height: 40, borderRadius: "50%", background: "rgba(40,30,15,0.35)", filter: `blur(${6 + alza * 16}px)`, opacity: 1 - alza * 0.5 }} />
            <div style={{ position: "relative", width: 130, height: 190 }}>
              <div style={{ position: "absolute", left: 32, top: 0, width: 66, height: 66, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #c79a62, #6b4423 70%, #3b2410)", boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.35)" }} />
              <div style={{ position: "absolute", left: 50, top: 50, width: 30, height: 80, background: "linear-gradient(90deg, #5a3a1d, #a77a48 45%, #4a2e15)" }} />
              <div style={{ position: "absolute", left: 0, top: 124, width: 130, height: 46, borderRadius: 6, background: "linear-gradient(180deg, #2a2a2e, #0f0f11)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.18)" }} />
              <div style={{ position: "absolute", left: 6, top: 166, width: 118, height: 10, borderRadius: 3, background: SELLO, opacity: 0.85 }} />
            </div>
          </div>
          {/* pluma apoyada en el borde */}
          <div style={{ position: "absolute", left: 470, top: 860, width: 600, height: 34, transform: "rotate(-24deg)", zIndex: 4, filter: "drop-shadow(0 26px 18px rgba(60,48,28,0.35))" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 440, height: 34, borderRadius: 17, background: "linear-gradient(180deg, #3a3a40 0%, #0c0c0e 45%, #000 60%, #2b2b30 100%)" }} />
            <div style={{ position: "absolute", left: 300, top: 0, width: 26, height: 34, background: "linear-gradient(180deg, #f3dfa2, #a37c2c 55%, #f0d793)" }} />
            <div style={{ position: "absolute", left: 436, top: 5, width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: "70px solid #c9a24a" }} />
          </div>
        </div>
      </AbsoluteFill>
      {/* profundidad de campo: borde inferior y superior desenfocados */}
      <AbsoluteFill style={{ backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(180deg, transparent 72%, black 96%)", maskImage: "linear-gradient(180deg, transparent 72%, black 96%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 95% 75% at 50% 45%, transparent 55%, rgba(90,80,60,0.28) 100%)" }} />
    </AbsoluteFill>
  );
};
