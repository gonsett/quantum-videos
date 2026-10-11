import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { loadFont as cargarMano } from "@remotion/google-fonts/Caveat";
import { MONO, RC } from "../ring-closers/tema";
import { SANS, SERIF } from "../historias-rc/como-funciona";
import { Logo } from "../reel-rc/logo";
import { G, INI, TOTAL } from "./timeline";

/**
 * "La nota que no podés comprar" (02/10/2026). Muestra aprobada: `Muestra.tsx`.
 * Mundo de PAPEL MARFIL a plena luz (todos los videos anteriores son oscuros), tinta negra y UN acento
 * esmeralda que es tinta de sello. Objetos nuevos en la serie: CV de papel, tarjeta de puntaje, sello de goma,
 * lapicera, carpeta de candidatos. Una sola escena negra ("Se entrena") y placa de logo, como el formato Kayn.
 * Verdad del producto: peer_evaluations (1 a 5, comentario opcional, evaluator <> evaluated), promedio en el CV
 * ("Valoración de sus pares"), junto a cierres de práctica ganados y trofeos. Nombres y cifras: inventados.
 */
export const DURACION = TOTAL;

const MANO = cargarMano("normal", { weights: ["500", "700"] }).fontFamily;
const TINTA = "#141416", GRIS = "#7a766d", SELLO = "#0a8a5f", MARFIL = "#efe9dd", BIROME = "#1d2a4a";
const STAR = "M50,30 L54.7,43.53 L69.02,43.82 L57.61,52.47 L61.76,66.18 L50,58 L38.24,66.18 L42.39,52.47 L30.98,43.82 L45.3,43.53 Z";
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const iv = (f: number, a: number, b: number, o = 0, t = 1, e: (x: number) => number = ease) =>
  interpolate(f, [a, b], [o, t], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const sacude = (f: number, golpes: number[], k = 0.9) =>
  golpes.reduce((a, g) => a + (f >= g && f < g + 6 ? Math.sin((f - g) * 2.6) * (6 - (f - g)) * k : 0), 0);

// ── tiempos (todos salen de la voz) ──
const [S2, S3, S4, S5, S6, S7, S8] = ["e2-otro", "e3-puntua", "e4-nadie", "e5-suma", "e6-director", "e7-entrena", "e8-cierre"].map(INI);
const W = {
  tu: G("e1-cv", "tu"), diga: G("e1-cv", "diga"), cualquiera: G("e1-cv", "cualquiera"), excelente: G("e1-cv", "excelente"), objeciones: G("e1-cv", "objeciones"),
  aca: G("e2-otro", "aca"), no: G("e2-otro", "no"), aca2: G("e2-otro", "aca", 2), estrellas: G("e2-otro", "estrellas"), otro: G("e2-otro", "otro"),
  terminas: G("e3-puntua", "terminas"), enfrente: G("e3-puntua", "enfrente"), puntua: G("e3-puntua", "puntua"), de: G("e3-puntua", "de"), cinco: G("e3-puntua", "cinco"),
  nadie: G("e4-nadie", "nadie"), mismo: G("e4-nadie", "mismo"), forma: G("e4-nadie", "forma"),
  cada: G("e5-suma", "cada"), suma: G("e5-suma", "suma"), promedio: G("e5-suma", "promedio"), cv: G("e5-suma", "cv"), cierres: G("e5-suma", "cierres"), trofeos: G("e5-suma", "trofeos"),
  director: G("e6-director", "director"), abre: G("e6-director", "abre"), dijiste: G("e6-director", "dijiste"), lee2: G("e6-director", "lee", 2), dijeron: G("e6-director", "dijeron"), vos: G("e6-director", "vos"),
  nota: G("e7-entrena", "nota"), compra: G("e7-entrena", "compra"), entrena: G("e7-entrena", "entrena"),
  ring: G("e8-cierre", "ring"), closers: G("e8-cierre", "closers"),
};
const GOLPES_A = [W.puntua, W.puntua + 11, W.puntua + 22, W.puntua + 33];
const CAEN = Array.from({ length: 12 }, (_, i) => S5 - 2 + i * 11);
const NOTAS = [5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4]; // promedio 4,58 → 4,6
const RIVALES = ["Diego Ferrer", "Lucía Paz", "Bruno Sosa", "Tomás Rivero", "Ana Ledesma", "Iván Cuesta", "Sofía Lagos", "Nico Varela", "Paula Ríos", "Joaquín Bel", "Carla Mena", "Federico Aráoz"];
export const CORTES = [S4, S5, W.cv - 6, S6, S7, S8];

// ── piezas ──
const Estrella: React.FC<{ f: number; en: number; llena: boolean; size?: number; parcial?: number }> = ({ f, en, llena, size = 112, parcial }) => {
  const t = f - en;
  const s = llena ? interpolate(t, [0, 4, 9], [1.9, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const op = llena ? interpolate(t, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="26 26 48 46" style={{ position: "absolute", inset: 0 }}><path d={STAR} fill="none" stroke="rgba(20,20,22,0.25)" strokeWidth={1.2} /></svg>
      {llena ? (
        <svg viewBox="26 26 48 46" style={{ position: "absolute", inset: 0, transform: `scale(${s}) rotate(${(en % 7) - 3}deg)`, opacity: op * 0.88, filter: "url(#tinta)",
          clipPath: parcial !== undefined ? `inset(0 ${100 - parcial * 100}% 0 0)` : undefined }}>
          <path d={STAR} fill={SELLO} />
        </svg>
      ) : null}
    </div>
  );
};

const Sello: React.FC<{ x: number; y: number; alza: number; op: number }> = ({ x, y, alza, op }) => (
  <div style={{ position: "absolute", left: x, top: y - alza * 150, transform: `rotate(${-3 + alza * 4}deg)`, opacity: op, zIndex: 5 }}>
    <div style={{ position: "absolute", left: 10, top: 170 + alza * 150, width: 110, height: 40, borderRadius: "50%", background: "rgba(40,30,15,0.35)", filter: `blur(${6 + alza * 16}px)`, opacity: 1 - Math.min(1, alza) * 0.5 }} />
    <div style={{ position: "relative", width: 130, height: 190 }}>
      <div style={{ position: "absolute", left: 32, top: 0, width: 66, height: 66, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #c79a62, #6b4423 70%, #3b2410)", boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", left: 50, top: 50, width: 30, height: 80, background: "linear-gradient(90deg, #5a3a1d, #a77a48 45%, #4a2e15)" }} />
      <div style={{ position: "absolute", left: 0, top: 124, width: 130, height: 46, borderRadius: 6, background: "linear-gradient(180deg, #2a2a2e, #0f0f11)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.18)" }} />
      <div style={{ position: "absolute", left: 6, top: 166, width: 118, height: 10, borderRadius: 3, background: SELLO, opacity: 0.85 }} />
    </div>
  </div>
);

const Pluma: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 600, height: 34, transform: `rotate(${r}deg)`, zIndex: 4, filter: "drop-shadow(0 26px 18px rgba(60,48,28,0.35))" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 440, height: 34, borderRadius: 17, background: "linear-gradient(180deg, #3a3a40 0%, #0c0c0e 45%, #000 60%, #2b2b30 100%)" }} />
    <div style={{ position: "absolute", left: 300, top: 0, width: 26, height: 34, background: "linear-gradient(180deg, #f3dfa2, #a37c2c 55%, #f0d793)" }} />
    <div style={{ position: "absolute", left: 436, top: 5, width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: "70px solid #c9a24a" }} />
  </div>
);

const papel = (tono = 0): React.CSSProperties => ({
  borderRadius: 8, overflow: "hidden",
  background: tono ? "linear-gradient(165deg, #f6f1e7, #e6dfcf)" : "linear-gradient(165deg, #fbf8f1, #f1ebdf 70%, #e7e0d1)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 3px rgba(60,50,30,0.25)",
});
const Sombra: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <div style={{ position: "absolute", left: 30, right: 10, top: 60, bottom: -40, background: `rgba(70,60,40,${0.35 * k})`, filter: "blur(38px)", borderRadius: 30 }} />
);
const Reflejo = () => <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 35%)", pointerEvents: "none" }} />;
const Rot: React.FC<{ children: React.ReactNode; mt?: number }> = ({ children, mt = 0 }) => (
  <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 4, color: GRIS, textTransform: "uppercase", marginTop: mt }}>{children}</div>
);
const Ac: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "1.14em", color: SELLO, letterSpacing: 0 }}>{children}</span>
);

/** Titular chico, tinta negra; entra con desenfoque óptico y sale igual. */
const Titular: React.FC<{ f: number; en: number; sale: number; top?: number; color?: string; children: React.ReactNode }> = ({ f, en, sale, top = 300, color = TINTA, children }) => {
  if (f < en - 2 || f > sale + 2) return null;
  const a = iv(f, en, en + 16) * iv(f, sale - 8, sale, 1, 0, Easing.in(Easing.quad));
  return (
    <div style={{ position: "absolute", left: 96, right: 96, top, opacity: a, transform: `translateY(${(1 - iv(f, en, en + 16)) * 18}px)`, filter: a < 0.99 ? `blur(${(1 - a) * 6}px)` : undefined }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, lineHeight: 1.08, letterSpacing: -1.4, color }}>{children}</div>
    </div>
  );
};

/** Tarjeta de puntaje (840 x 860). */
const Tarjeta: React.FC<{
  f: number; numero: string; puntua: string; puntuada: string; golpes: number[]; llenas: number;
  comentario?: string; trazo?: number; firma?: number; firmaTexto?: string; subraya?: number; pulso5?: number; regla?: number;
}> = ({ f, numero, puntua, puntuada, golpes, llenas, comentario, trazo = 0, firma = 0, firmaTexto, subraya = 0, pulso5 = 0, regla = 0 }) => (
  <>
    <Sombra />
    <div style={{ position: "relative", width: "100%", height: "100%", ...papel() }}>
      <div style={{ padding: "52px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 21, letterSpacing: 5, color: GRIS, textTransform: "uppercase" }}>
          <span>Tarjeta de puntaje</span><span>Roleplay N.º {numero}</span>
        </div>
        <div style={{ height: 3, background: TINTA, margin: "20px 0 0" }} />
        {[["Puntúa", puntua], ["Puntuada", puntuada]].map(([k, v], i) => (
          <div key={k} style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 26, padding: "26px 0", borderBottom: "1.5px solid rgba(20,20,22,0.16)" }}>
            <span style={{ width: 170, fontFamily: MONO, fontSize: 19, letterSpacing: 4, color: GRIS, textTransform: "uppercase" }}>{k}</span>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: TINTA }}>{v}</span>
            {i === 0 && subraya > 0 ? <div style={{ position: "absolute", left: 196, bottom: 14, height: 5, width: 440 * subraya, background: SELLO, opacity: 0.8, borderRadius: 3, filter: "url(#tinta)" }} /> : null}
          </div>
        ))}
        <Rot mt={40}>Valoración</Rot>
        <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ transform: i === 4 && pulso5 ? `scale(${1 + 0.12 * Math.sin(pulso5 * Math.PI)})` : undefined }}>
              <Estrella f={f} en={golpes[i] ?? 99999} llena={i < llenas} />
            </div>
          ))}
        </div>
        <Rot mt={48}>Comentario</Rot>
        <div style={{ position: "relative", marginTop: 10, height: 120 }}>
          {comentario ? <div style={{ fontFamily: MANO, fontWeight: 500, fontSize: 60, color: BIROME, clipPath: `inset(0 ${100 - trazo * 100}% 0 0)`, transform: "rotate(-1.5deg)" }}>{comentario}</div> : null}
          <div style={{ position: "absolute", left: 0, right: 0, top: 86, height: 1.5, background: "rgba(20,20,22,0.18)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 54, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 4, color: GRIS }}>FIRMA DEL RIVAL</span>
        {firmaTexto ? <span style={{ fontFamily: MANO, fontWeight: 700, fontSize: 68, color: BIROME, transform: "rotate(-6deg)", clipPath: `inset(0 ${100 - firma * 100}% 0 0)` }}>{firmaTexto}</span> : null}
      </div>
      {regla > 0 ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 470, height: 112, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${TINTA}`, borderRadius: 6,
          fontFamily: MONO, fontSize: 26, letterSpacing: 5, color: TINTA, opacity: regla, transform: `scale(${1.5 - 0.5 * regla}) rotate(-2deg)`, background: "rgba(239,233,221,0.92)", filter: "url(#tinta)" }}>
          QUIEN PUNTÚA ≠ QUIEN ES PUNTUADO
        </div>
      ) : null}
      <Reflejo />
    </div>
  </>
);

/** Tarjeta chica para la pila (560 x 360). */
const Mini: React.FC<{ f: number; i: number }> = ({ f, i }) => (
  <div style={{ position: "relative", width: 560, height: 360, ...papel(i % 2), boxShadow: "0 16px 30px rgba(70,60,40,0.3), 0 1px 2px rgba(60,50,30,0.3)" }}>
    <div style={{ padding: "34px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 16, letterSpacing: 4, color: GRIS }}><span>TARJETA DE PUNTAJE</span><span>N.º {String(36 + i * 1).padStart(3, "0")}</span></div>
      <div style={{ height: 2, background: TINTA, marginTop: 14 }} />
      <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 3, color: GRIS, marginTop: 22 }}>PUNTÚA</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: TINTA, marginTop: 4 }}>{RIVALES[i]}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
        {[0, 1, 2, 3, 4].map((k) => <Estrella key={k} f={f} en={-99} llena={k < NOTAS[i]} size={62} />)}
      </div>
    </div>
    <Reflejo />
  </div>
);

/** El CV en papel (800 x 1000). modo "yo": lo que escribió ella; modo "real": con los datos de Ring Closers. */
const CV: React.FC<{ f: number; modo: "yo" | "real" }> = ({ f, modo }) => {
  const yo = modo === "yo";
  const lineas = ["Excelente manejo de objeciones.", "Cierre agresivo y efectivo.", "Líder natural. Alta resiliencia."];
  const tipea = yo ? [iv(f, W.excelente - 4, W.objeciones + 10, 0, 1, Easing.linear), iv(f, W.objeciones + 10, W.objeciones + 26, 0, 1, Easing.linear), iv(f, W.objeciones + 26, W.objeciones + 44, 0, 1, Easing.linear)] : [1, 1, 1];
  const tacha = yo ? [0, 1, 2].map((k) => iv(f, W.no - 6 + k * 5, W.no + 2 + k * 5, 0, 1, Easing.out(Easing.quad))) : [0, 0, 0];
  const dibujadas = yo ? iv(f, W.diga - 2, W.diga + 22, 0, 1, Easing.inOut(Easing.quad)) : 0;
  // modo real
  const fila = (en: number) => iv(f, en, en + 12);
  const apaga = yo ? 0 : iv(f, W.dijiste - 10, W.dijiste + 6) * 0.72;
  const tag = yo ? 0 : iv(f, W.dijiste - 10, W.dijiste + 4);
  const tagPares = yo ? 0 : iv(f, W.dijeron - 6, W.dijeron + 8);
  const circulo = yo ? 0 : iv(f, W.dijeron - 2, W.dijeron + 20, 0, 1, Easing.inOut(Easing.cubic));
  const luz = yo ? 0 : iv(f, W.lee2 - 6, W.lee2 + 14);
  return (
    <>
      <Sombra />
      <div style={{ position: "relative", width: "100%", height: "100%", ...papel() }}>
        <div style={{ padding: "54px 64px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, letterSpacing: 5, color: GRIS }}>
            <span>CURRÍCULUM</span><span>{yo ? "BORRADOR" : "RING CLOSERS · CV"}</span>
          </div>
          <div style={{ height: 3, background: TINTA, margin: "18px 0 30px" }} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, letterSpacing: -1.2, color: TINTA }}>Martina Rossi</div>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 28, color: GRIS, marginTop: 4 }}>Closer de ventas · High ticket</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 44 }}>
            <Rot>Perfil</Rot>
            <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 3, color: TINTA, border: `1.5px solid ${TINTA}`, padding: "4px 10px", borderRadius: 4, opacity: tag }}>LO ESCRIBIÓ ELLA</span>
          </div>
          <div style={{ opacity: 1 - apaga, filter: apaga ? `blur(${apaga * 3}px)` : undefined }}>
            {lineas.map((l, k) => (
              <div key={k} style={{ position: "relative", marginTop: 16, height: 46 }}>
                <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: TINTA, clipPath: `inset(0 ${100 - tipea[k] * 100}% 0 0)`, display: "inline-block" }}>{l}</span>
                {yo && tipea[k] > 0 && tipea[k] < 1 ? <span style={{ display: "inline-block", width: 3, height: 38, background: TINTA, verticalAlign: "middle", marginLeft: -((1 - tipea[k]) * l.length * 17.5) }} /> : null}
                {tacha[k] > 0 ? <div style={{ position: "absolute", left: -10, top: 18, height: 9, width: `${tacha[k] * (60 + l.length * 1.9)}%`, background: TINTA, borderRadius: 5, transform: `rotate(${k % 2 ? 1.2 : -1}deg)`, filter: "url(#tinta)" }} /> : null}
              </div>
            ))}
          </div>
          {yo ? (
            <div style={{ marginTop: 50 }}>
              <Rot>Autoevaluación</Rot>
              <svg width={520} height={100} viewBox="0 0 260 50" style={{ marginTop: 8, overflow: "visible" }}>
                {[0, 1, 2, 3, 4].map((k) => (
                  <path key={k} d={STAR} transform={`translate(${k * 50 - 22}, -22) rotate(${(k * 7) % 9 - 4} 50 50)`} fill="none" stroke={BIROME} strokeWidth={2.2} strokeLinejoin="round"
                    pathLength={1} strokeDasharray="1" strokeDashoffset={1 - Math.min(1, Math.max(0, dibujadas * 5 - k))} />
                ))}
              </svg>
              <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, fontFamily: MANO, fontSize: 44, color: BIROME, opacity: dibujadas, transform: "rotate(-2deg)" }}>5 de 5, obvio.</div>
            </div>
          ) : (
            <>
              <div style={{ height: 1.5, background: "rgba(20,20,22,0.16)", margin: "30px 0 22px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Rot>Valoración de sus pares</Rot>
                <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 3, color: SELLO, border: `1.5px solid ${SELLO}`, padding: "4px 10px", borderRadius: 4, opacity: tagPares }}>LA PUSIERON SUS RIVALES</span>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 26, marginTop: 14, opacity: fila(W.cv), filter: `drop-shadow(0 0 ${luz * 30}px rgba(255,250,235,${luz}))` }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2, 3, 4].map((k) => <Estrella key={k} f={f} en={W.cv + 4 + k * 3} llena size={66} parcial={k === 4 ? 0.6 : undefined} />)}
                </div>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -2, color: TINTA }}>4,6</span>
                <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: GRIS }}>/ 5</span>
                <svg width={760} height={170} viewBox="0 0 760 170" style={{ position: "absolute", left: -30, top: -40, overflow: "visible" }}>
                  <path d="M40,95 C30,30 300,8 520,18 C700,26 745,70 720,112 C690,160 360,166 160,150 C60,142 22,118 58,70" fill="none" stroke={SELLO} strokeWidth={5} strokeLinecap="round"
                    pathLength={1} strokeDasharray="1" strokeDashoffset={1 - circulo} style={{ filter: "url(#tinta)" }} />
                </svg>
              </div>
              <div style={{ opacity: 1 - apaga * 0.6 }}>
                {[["Roleplays completados", "48", W.cv + 10], ["Cierres de práctica ganados", "19", W.cierres - 4], ["Trofeos", "7", W.trofeos - 4]].map(([k, v, en]) => (
                  <div key={k as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: "1.5px solid rgba(20,20,22,0.12)", opacity: fila(en as number), transform: `translateY(${(1 - fila(en as number)) * 14}px)` }}>
                    <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: TINTA }}>{k}</span>
                    <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: TINTA }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 2, color: GRIS, marginTop: 18, opacity: fila(W.trofeos) }}>Los cierres son simulados, no ventas reales.</div>
            </>
          )}
        </div>
        {/* el resto se apaga cuando el director lee solo lo de sus pares */}
        <Reflejo />
      </div>
    </>
  );
};

/** Carpeta del director (tapa que se abre hacia la izquierda). */
const Tapa: React.FC<{ f: number }> = ({ f }) => {
  const abre = iv(f, W.abre - 6, W.abre + 16, 0, 1, Easing.inOut(Easing.cubic));
  if (abre >= 1) return null;
  return (
    <div style={{ position: "absolute", inset: -14, transformOrigin: "0% 50%", transform: `rotateY(${-abre * 165}deg)`, backfaceVisibility: "hidden", zIndex: 6, borderRadius: 10,
      background: "linear-gradient(160deg, #e2cc9e, #cdb37f 60%, #bb9f6c)", boxShadow: "0 3px 6px rgba(60,45,20,0.35), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
      <div style={{ position: "absolute", left: 80, top: 120, right: 80, padding: "26px 30px", background: "#f7f2e6", borderRadius: 4, boxShadow: "0 1px 2px rgba(60,45,20,0.3)" }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 5, color: GRIS }}>DIRECCIÓN COMERCIAL</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: TINTA, marginTop: 8 }}>Candidatos</div>
        <div style={{ fontFamily: MANO, fontSize: 44, color: BIROME, marginTop: 6, transform: "rotate(-2deg)" }}>revisar hoy</div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.25), transparent 40%)", borderRadius: 10 }} />
    </div>
  );
};

/** Mundo de papel: luz de ventana, persiana, fibra. */
const Mundo: React.FC<{ f: number }> = ({ f }) => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 30% 30%, rgba(255,253,247,0.9), transparent 60%), linear-gradient(180deg, transparent 60%, rgba(120,110,90,0.18))" }} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#fibra)" /></svg>
    <AbsoluteFill style={{ background: "repeating-linear-gradient(-28deg, transparent 0 120px, rgba(90,78,55,0.13) 120px 175px)", filter: "blur(14px)", transform: `translateX(${(f % 1438) * 0.25 - 120}px)`,
      WebkitMaskImage: "linear-gradient(200deg, black 25%, transparent 85%)", maskImage: "linear-gradient(200deg, black 25%, transparent 85%)" }} />
  </>
);

export const NotaVideo: React.FC = () => {
  const f = useCurrentFrame();
  const negro = f >= S7 && f < S8;
  // cámara: empuje lento por escena + golpe de zoom en cada corte
  const punch = CORTES.reduce((a, c) => a + (f >= c && f < c + 12 ? (1 - (f - c) / 12) ** 2 * 0.06 : 0), 0);
  const ini = [0, S2, S3, S4, S5, S6, S7, S8].filter((x) => x <= f).pop() ?? 0;
  const empuje = 1 + (f - ini) * 0.00035;
  const cam = `scale(${empuje + punch})`;

  // e1 → e2: el CV se va, entra la tarjeta
  const cvEntra = iv(f, 0, 30);
  const cvSale = iv(f, W.aca2 - 6, W.aca2 + 18, 0, 1, Easing.in(Easing.cubic));
  const tEntra = iv(f, W.aca2 - 2, W.aca2 + 30);
  const sacA = sacude(f, GOLPES_A);
  const posX = (i: number) => 60 + i * 134 - 9;
  const selloX = interpolate(f, GOLPES_A, GOLPES_A.map((_, i) => posX(i)), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const dist = Math.min(...GOLPES_A.map((g) => Math.abs(f - g)));
  const alza = f < GOLPES_A[0] - 10 ? 1 : Math.min(1, dist / 7) * (f > GOLPES_A[3] + 6 ? 2.4 : 0.75);
  const selloOp = iv(f, W.enfrente, W.enfrente + 8) * iv(f, GOLPES_A[3] + 10, GOLPES_A[3] + 20, 1, 0);

  // e4: el sello baja sobre tu propia tarjeta y rebota
  const bloqueo = W.mismo - 2;
  const alzaB = f < bloqueo ? iv(f, W.nadie, bloqueo, 1.4, 0.55, Easing.in(Easing.cubic)) : f < bloqueo + 10 ? 0.55 + Math.sin(((f - bloqueo) / 10) * Math.PI) * 0.35 : iv(f, bloqueo + 10, bloqueo + 26, 0.55, 2.6);
  const sacB = sacude(f, [bloqueo], 1.6);
  const tira = iv(f, W.forma + 18, W.forma + 38, 0, 1, Easing.in(Easing.cubic));

  // e5: la pila
  const promedioVivo = (() => {
    const n = CAEN.filter((c) => f >= c + 7).length;
    return n ? NOTAS.slice(0, n).reduce((a, b) => a + b, 0) / n : 0;
  })();
  const pilaSale = iv(f, W.cv - 8, W.cv + 10, 0, 1, Easing.in(Easing.cubic));
  const cv2Entra = iv(f, W.cv - 6, W.cv + 20);

  // e7: escena negra
  const estrellaN = iv(f, W.nota - 3, W.nota + 6);
  const golpeN = sacude(f, [W.nota - 1, W.entrena - 1], 1.4);

  return (
    <AbsoluteFill style={{ background: negro ? "#0b0b0c" : MARFIL, overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="tinta"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="r" /><feDisplacementMap in="SourceGraphic" in2="r" scale={2.2} /></filter>
        <filter id="fibra"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={3} seed={9} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 0.10 0" /></filter>
        <filter id="grano"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={Math.floor(f / 2)} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.07 0" /></filter>
      </svg>
      {!negro && <Mundo f={f} />}

      {/* ── titulares (capa discreta, arriba) ── */}
      <Titular f={f} en={W.tu - 4} sale={W.aca - 2}>Tu CV dice<br />lo que <Ac>vos</Ac> querés.</Titular>
      <Titular f={f} en={W.estrellas - 10} sale={S3 + 6}>Tus estrellas<br />las pone <Ac>otro</Ac>.</Titular>
      <Titular f={f} en={W.terminas + 4} sale={S4 - 2}>Tu rival te puntúa.<br />De una a <Ac>cinco</Ac>.</Titular>
      <Titular f={f} en={W.nadie - 4} sale={S5 - 2}>Nadie se puntúa<br />a sí <Ac>mismo</Ac>.</Titular>
      <Titular f={f} en={W.cada - 4} sale={W.cv - 8}>Cada nota<br /><Ac>se suma</Ac>.</Titular>
      <Titular f={f} en={W.cv - 2} sale={S6 - 2} top={210}>El promedio queda<br />en tu <Ac>CV</Ac>.</Titular>
      <Titular f={f} en={W.director - 8} sale={W.dijiste - 14} top={210}>Un día, un director<br />lo <Ac>abre</Ac>.</Titular>
      <Titular f={f} en={W.dijiste - 12} sale={W.lee2 - 4} top={210}>No lee lo que<br />dijiste.</Titular>
      <Titular f={f} en={W.lee2 - 2} sale={S7 - 2} top={210}>Lee lo que<br /><Ac>dijeron de vos</Ac>.</Titular>

      <AbsoluteFill style={{ perspective: 1800, transform: cam }}>
        {/* e1-e2: el CV que escribió ella */}
        {f < W.aca2 + 20 && (
          <div style={{ position: "absolute", left: 140, top: 540, width: 800, height: 1000,
            transform: `translate(${-cvSale * 1100}px, ${(1 - cvEntra) * 700}px) rotateX(${16 - cvEntra * 4}deg) rotateZ(${-2.5 - cvSale * 14}deg)`, transformOrigin: "50% 80%", filter: cvSale > 0 ? `blur(${cvSale * 10}px)` : undefined }}>
            <CV f={f} modo="yo" />
            <Pluma x={460} y={940} r={-22} />
          </div>
        )}

        {/* e2-e3: la tarjeta del rival */}
        {f >= W.aca2 - 2 && f < S4 + 2 && (
          <div style={{ position: "absolute", left: 120, top: 640, width: 840, height: 860,
            transform: `translateY(${(1 - tEntra) * 900 + sacA}px) rotateX(${18 - tEntra * 6}deg) rotateZ(${-4 + tEntra * 1.5}deg)`, transformOrigin: "50% 80%" }}>
            {[{ r: 7, x: 40, y: 40 }, { r: -6, x: -36, y: 70 }].map((c, i) => (
              <div key={i} style={{ position: "absolute", inset: 0, transform: `translate(${c.x}px, ${c.y}px) rotate(${c.r}deg)`, ...papel(1), boxShadow: "0 18px 40px rgba(70,60,40,0.28)" }} />
            ))}
            <Tarjeta f={f} numero="048" puntua="Tomás Rivero · rival" puntuada="Martina Rossi" golpes={GOLPES_A} llenas={4}
              comentario="Cerró bien la objeción de precio." trazo={iv(f, W.cinco + 6, W.cinco + 34, 0, 1, Easing.linear)}
              firma={iv(f, W.cinco + 30, S4 - 2, 0, 1, Easing.linear)} firmaTexto="T. Rivero" subraya={iv(f, W.enfrente - 4, W.enfrente + 12)}
              pulso5={f >= W.cinco - 2 && f < W.cinco + 12 ? (f - W.cinco + 2) / 14 : 0} />
            <Sello x={selloX} y={300} alza={alza} op={selloOp} />
            <Pluma x={470} y={860} r={-24} />
          </div>
        )}

        {/* e4: tu propia tarjeta — el sello no baja */}
        {f >= S4 && f < S5 + 2 && (
          <div style={{ position: "absolute", left: 120, top: 640, width: 840, height: 860,
            transform: `translate(${-tira * 1300}px, ${sacB}px) rotateX(13deg) rotateZ(${-2 - tira * 18}deg)`, transformOrigin: "50% 80%", filter: tira > 0 ? `blur(${tira * 8}px)` : undefined }}>
            <Tarjeta f={f} numero="049" puntua="Martina Rossi" puntuada="Martina Rossi" golpes={[]} llenas={0} regla={iv(f, W.forma - 4, W.forma + 4, 0, 1, Easing.out(Easing.back(1.6)))} />
            <Sello x={posX(0) + 140} y={300} alza={alzaB} op={iv(f, S4, S4 + 8) * iv(f, W.forma, W.forma + 8, 1, 0)} />
          </div>
        )}

        {/* e5: la pila de tarjetas de distintos rivales */}
        {f >= S5 - 2 && f < W.cv + 12 && (
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${pilaSale * 1400}px)` }}>
            {CAEN.map((c, i) => {
              const cae = iv(f, c, c + 9, 0, 1, Easing.in(Easing.quad));
              if (f < c) return null;
              const rebote = f >= c + 9 && f < c + 15 ? Math.sin(((f - c - 9) / 6) * Math.PI) * 10 : 0;
              const rz = ((i * 37) % 23) - 11;
              const dx = ((i * 53) % 140) - 70, dy = ((i * 29) % 90) - 45;
              return (
                <div key={i} style={{ position: "absolute", left: 150 + dx, top: 860 + dy - i * 4, transform: `translateY(${-(1 - cae) * 1300 - rebote}px) rotate(${rz + (1 - cae) * 20}deg) scale(${1.35 + (1 - cae) * 0.3})`, transformOrigin: "0 0", zIndex: i }}>
                  <Mini f={f} i={i} />
                </div>
              );
            })}
            {/* el promedio, anotado a mano junto a la pila */}
            <div style={{ position: "absolute", right: 70, top: 560, textAlign: "right", opacity: iv(f, CAEN[1], CAEN[1] + 8), zIndex: 30 }}>
              <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 5, color: GRIS }}>PROMEDIO</div>
              <div style={{ fontFamily: MANO, fontWeight: 700, fontSize: 150, lineHeight: 1, color: SELLO, transform: `scale(${1 + 0.18 * Math.sin(iv(f, W.promedio - 4, W.promedio + 10, 0, 1, Easing.linear) * Math.PI)}) rotate(-4deg)`, transformOrigin: "100% 50%" }}>
                {promedioVivo.toFixed(1).replace(".", ",")}
              </div>
            </div>
          </div>
        )}

        {/* e5-e6: el CV real, con lo que pusieron los demás; e6: adentro de la carpeta del director */}
        {f >= W.cv - 8 && f < S7 && (
          <div style={{ position: "absolute", left: 140, top: 450, width: 800, height: 1150,
            transform: `translateY(${(1 - cv2Entra) * 1200}px) rotateX(${f >= S6 ? 14 - iv(f, W.abre, W.abre + 40) * 8 : 12}deg) rotateZ(${f >= S6 ? 1.5 : -2}deg)`, transformOrigin: "50% 80%" }}>
            {f >= S6 && (
              <div style={{ position: "absolute", inset: -14, borderRadius: 10, background: "linear-gradient(160deg, #d9c193, #c4a873)", boxShadow: "0 30px 60px rgba(60,45,20,0.35)" }}>
                <div style={{ position: "absolute", right: 60, top: -46, width: 240, height: 60, borderRadius: "10px 10px 0 0", background: "#d9c193" }} />
              </div>
            )}
            <CV f={f} modo="real" />
            {f >= S6 && <Tapa f={f} />}
          </div>
        )}

        {/* e7: escena negra — una sola estrella sellada */}
        {negro && (
          <AbsoluteFill>
            <div style={{ position: "absolute", left: 540 - 260, top: 560, width: 520, height: 520, transform: `translateY(${golpeN}px) scale(${interpolate(f - W.nota, [-3, 2, 8], [1.9, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 + iv(f, W.entrena - 2, W.entrena + 8, 0, 1) * 0.06)})`, opacity: estrellaN }}>
              <svg viewBox="26 26 48 46" width={520} height={520} style={{ filter: "url(#tinta)", overflow: "visible" }}>
                <path d={STAR} fill={RC.esmeralda500} />
              </svg>
              <div style={{ position: "absolute", inset: -80, background: `radial-gradient(circle, rgba(16,185,129,${0.18 + iv(f, W.entrena - 2, W.entrena + 6) * 0.14}), transparent 65%)`, zIndex: -1 }} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1230, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 52, color: RC.platino500, letterSpacing: -0.6,
              opacity: iv(f, W.compra - 12, W.compra + 2), filter: `blur(${(1 - iv(f, W.compra - 12, W.compra + 2)) * 6}px)` }}>No se compra.</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1310, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 84, color: RC.crema, letterSpacing: -1.6,
              opacity: iv(f, W.entrena - 8, W.entrena + 4), transform: `translateY(${(1 - iv(f, W.entrena - 8, W.entrena + 6)) * 20}px)`, filter: `blur(${(1 - iv(f, W.entrena - 8, W.entrena + 4)) * 8}px)` }}>
              Se <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "1.14em", color: RC.esmeralda400 }}>entrena</span>.
            </div>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#grano)" /></svg>
          </AbsoluteFill>
        )}

        {/* e8: placa — el sello se vuelve el logo */}
        {f >= S8 && (
          <AbsoluteFill>
            <div style={{ position: "absolute", left: 540 - 170, top: 640, width: 340, height: 340, transform: `scale(${0.9 + 0.1 * iv(f, S8, S8 + 20)})` }}>
              <Logo size={340} dibujoEn={S8 + 4} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, color: TINTA,
              letterSpacing: `${interpolate(iv(f, W.ring - 4, W.ring + 24), [0, 1], [0.6, 0.32])}em`, opacity: iv(f, W.ring - 4, W.ring + 6) }}>RING CLOSERS</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1140, textAlign: "center", fontFamily: MANO, fontSize: 46, color: BIROME, opacity: iv(f, W.closers + 10, W.closers + 26), transform: "rotate(-2deg)" }}>
              la nota no se compra.
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* profundidad de campo y viñeta (solo en el mundo de papel) */}
      {!negro && (
        <>
          <AbsoluteFill style={{ backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(180deg, transparent 74%, black 97%)", maskImage: "linear-gradient(180deg, transparent 74%, black 97%)" }} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 95% 75% at 50% 45%, transparent 55%, rgba(90,80,60,0.28) 100%)" }} />
        </>
      )}
      {negro && <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 65% at 50% 42%, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />}
    </AbsoluteFill>
  );
};
