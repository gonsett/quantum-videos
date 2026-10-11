import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { DISPLAY, MONO, ObjetoCae, RC, SANS } from "../elite-rc/dopamina";
import { L } from "./timeline";

/**
 * Video para closers veteranos: "El costo de aprender en vivo".
 *
 * Lección de la primera muestra (Javier: "parece el subtítulo predeterminado de TikTok"): letras
 * enormes y centradas con la palabra clave en color SON un subtítulo, aunque se usen componentes de
 * élite. Acá la jerarquía es la de élite de verdad: el HÉROE VISUAL manda (el odómetro mecánico, los
 * guantes, las tarjetas) y el texto es una capa discreta: renglones enteros que aparecen con
 * desenfoque óptico, peso tipográfico para enfatizar y un hilo fino que se dibuja (nada de
 * resaltadores, ni palabras gigantes, ni color en las letras).
 */
export const ROJO = "#e5534b";
const EM = RC.esmeralda400;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.16, 1, 0.3, 1);
const tr = (f: number, a: number, b: number, e: (t: number) => number = suave) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

/** Empuje lento de cámara: la escena "se acerca" un 3 % mientras dura. */
const Dolly: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.03 * (f / dur)})`, transformOrigin: "50% 58%" }}>{children}</div>;
};

/** Un renglón entero: sube y se enfoca lento cuando la voz llega a su primera palabra. */
const Linea: React.FC<{
  en: number;
  top: number;
  tam: number;
  children: React.ReactNode;
  peso?: number;
  color?: string;
  fuente?: string;
  esp?: string;
  mayus?: boolean;
}> = ({ en, top, tam, children, peso = 500, color = RC.platino300, fuente = SANS, esp = "0", mayus = false }) => {
  const f = useCurrentFrame();
  const k = tr(f, en - 3, en + 20);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        whiteSpace: "nowrap",
        fontFamily: fuente,
        fontWeight: peso,
        fontSize: tam,
        lineHeight: 1.35,
        letterSpacing: esp,
        textTransform: mayus ? "uppercase" : "none",
        color,
        opacity: k,
        transform: `translateY(${(1 - k) * 26}px)`,
        filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Hilo fino que se dibuja bajo una frase. */
const Hilo: React.FC<{ en: number; color: string; children: React.ReactNode }> = ({ en, color, children }) => {
  const f = useCurrentFrame();
  const k = tr(f, en, en + 16);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <i style={{ position: "absolute", left: 0, right: 0, bottom: 3, height: 2, backgroundColor: color, transformOrigin: "left center", transform: `scaleX(${k})` }} />
    </span>
  );
};

type P = { dur: number };

// ── 1 · El gancho: el odómetro (héroe, global) en 0 y una sola frase que lo mueve ──
export const E1: React.FC<P> = ({ dur }) => {
  const c = (p: string, v = 1) => L("e1-gancho", p, v);
  return (
    <Dolly dur={dur}>
      <Linea en={c("Cada")} top={380} tam={52}>Cada objeción nueva que probás</Linea>
      <Linea en={c("en")} top={452} tam={52}>en una llamada real,</Linea>
      <Linea en={c("la")} top={1290} tam={66} peso={700} color={RC.crema}>
        la pagás <Hilo en={c("con")} color={ROJO}>con un lead.</Hilo>
      </Linea>
    </Dolly>
  );
};

// ── 2 · Ir al hueso cuesta ────────────────────────────────────────────────────
export const E2: React.FC<P> = ({ dur }) => {
  const c = (p: string, v = 1) => L("e2-hueso", p, v);
  return (
    <Dolly dur={dur}>
      <Linea en={c("Ir")} top={385} tam={56}>Ir al hueso funciona.</Linea>
      <Linea en={c("Pero")} top={1265} tam={76} peso={700} color={RC.crema}>
        Pero <Hilo en={c("cuesta")} color={ROJO}>cuesta.</Hilo>
      </Linea>
      <Linea en={c("cada")} top={1375} tam={44}>cada llamada que sale mal</Linea>
      <Linea en={c("es")} top={1435} tam={44}>es una venta que no vuelve.</Linea>
    </Dolly>
  );
};

// ── 3 · Ring Closers: el sparring (esmeralda) ────────────────────────────────
export const E3: React.FC<P> = ({ dur }) => {
  const c = (p: string, v = 1) => L("e3-ring", p, v);
  const f = useCurrentFrame();
  const cae = c("con") - 8;
  const toca = cae + 9;
  // La medalla cae por delante de los dos renglones de arriba (ya dichos): se van a segundo plano
  // (desenfoque + menos luz) mientras pasa y vuelven a foco cuando toca, para que la corona nunca
  // pise letras nítidas.
  const atras = tr(f, cae - 4, cae + 1) * (1 - tr(f, toca + 3, toca + 20));
  return (
    <Dolly dur={dur}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.85 * atras, filter: atras > 0.01 ? `blur(${atras * 7}px)` : undefined }}>
        <Linea en={c("Ring")} top={640} tam={54} peso={600} color={EM} fuente={DISPLAY} esp="0.34em" mayus>Ring Closers</Linea>
        <Linea en={c("te", 1)} top={718} tam={46}>te deja probar, fallar y ajustar</Linea>
      </div>
      {/* El "$" de plata entre dos guantes: la plata que no se quema, y el brillo lo cruza justo cuando se dice "plata". */}
      <ObjetoCae src="historias/cash_50k-2x.png" ancho={580} x={540} y={1075} en={cae} caida={300} barridoEn={c("plata") - 3} brillo="rgba(190,225,210,0.22)" />
      <Linea en={c("con")} top={1338} tam={44}>con otro closer de verdad,</Linea>
      <Linea en={c("antes")} top={1398} tam={44}>antes de que te cueste plata.</Linea>
    </Dolly>
  );
};

// La semana que el closer marca: 3 franjas por día (mañana, tarde, noche). El jueves de noche es el
// que después se convierte en el sparring de la tarjeta.
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const FRANJAS = ["MAÑ", "TAR", "NOC"];
const MARCADAS: [number, number][] = [[0, 1], [1, 2], [2, 0], [2, 2], [3, 2], [4, 1], [5, 0]];
const ELEGIDA: [number, number] = [3, 2];

// ── 4 · Sin sistemas raros (esmeralda) ───────────────────────────────────────
export const E4: React.FC<P> = ({ dur }) => {
  const f = useCurrentFrame();
  const c = (p: string, v = 1) => L("e4-simple", p, v);
  const enCard = c("llega") - 4;
  const k = tr(f, enCard + 4, enCard + 16);
  const sale = tr(f, enCard - 2, enCard + 8);
  const elige = tr(f, c("y") - 6, c("y") + 2);
  const tap = c("quién");
  const ok = tr(f, tap, tap + 6);
  const onda = tr(f, tap, tap + 16);
  return (
    <Dolly dur={dur}>
      <Linea en={c("Sin")} top={750} tam={66} peso={700} color={RC.crema}>Sin sistemas raros.</Linea>
      {f < enCard + 10 && (
        <div style={{ position: "absolute", left: 110, top: 885, width: 860, height: 272, borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(180deg,#171719,#101012)", boxShadow: "0 30px 70px rgba(0,0,0,0.55), 0 0 60px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.06)", opacity: tr(f, c("Marcás") - 12, c("Marcás") + 2) * (1 - sale), transform: `translateY(${(1 - tr(f, c("Marcás") - 12, c("Marcás") + 6)) * 44 - sale * 26}px)`, filter: sale > 0 ? `blur(${sale * 6}px)` : undefined }}>
          <div style={{ position: "absolute", left: 40, top: 28, display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: EM }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: EM }} />
            TU SEMANA · DISPONIBILIDAD
          </div>
          {DIAS.map((d, i) => (
            <div key={d} style={{ position: "absolute", left: 150 + i * 96, top: 78, width: 84, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: "0.1em", color: RC.platino500 }}>{d}</div>
          ))}
          {FRANJAS.map((nombre, r) => (
            <div key={nombre} style={{ position: "absolute", left: 40, top: 118 + r * 44 + 6, fontFamily: MONO, fontWeight: 600, fontSize: 17, letterSpacing: "0.12em", color: RC.platino500 }}>{nombre}</div>
          ))}
          {DIAS.map((_, i) =>
            FRANJAS.map((__, r) => {
              const n = MARCADAS.findIndex(([a, b]) => a === i && b === r);
              const marcada = n >= 0;
              const esElegida = i === ELEGIDA[0] && r === ELEGIDA[1];
              const m = marcada ? tr(f, c("Marcás") + n * 3, c("Marcás") + n * 3 + 8) : 0;
              const fondo = esElegida ? 0.05 + 0.3 * m + 0.65 * elige : 0.03 + 0.3 * m;
              return (
                <div
                  key={`${i}-${r}`}
                  style={{
                    position: "absolute",
                    left: 150 + i * 96,
                    top: 118 + r * 44,
                    width: 84,
                    height: 34,
                    borderRadius: 11,
                    backgroundColor: marcada ? `rgba(52,211,153,${fondo})` : "rgba(255,255,255,0.035)",
                    border: `1px solid ${marcada ? `rgba(52,211,153,${0.12 + 0.6 * m})` : "rgba(255,255,255,0.08)"}`,
                    opacity: marcada && !esElegida ? 1 - 0.55 * elige : 1,
                    transform: `scale(${marcada ? 0.86 + 0.14 * m + (esElegida ? 0.1 * elige : 0) : 1})`,
                    boxShadow: esElegida && elige > 0 ? `0 0 ${34 * elige}px rgba(52,211,153,${0.55 * elige})` : undefined,
                  }}
                />
              );
            }),
          )}
        </div>
      )}
      <div style={{ position: "absolute", left: 110, top: 910, width: 860, height: 230, borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(180deg,#171719,#101012)", boxShadow: "0 30px 70px rgba(0,0,0,0.55), 0 0 60px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.06)", opacity: k, transform: `translateY(${(1 - k) * 60}px)` }}>
        <div style={{ position: "absolute", left: 40, top: 34, display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: EM }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: EM }} />
          SPARRING · JUEVES 19:00
        </div>
        <div style={{ position: "absolute", left: 40, top: 86, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: RC.crema }}>Con un closer de tu nivel</div>
        <div style={{ position: "absolute", left: 40, top: 148, fontFamily: SANS, fontWeight: 500, fontSize: 27, color: RC.platino500 }}>Confirmás con un toque</div>
        <div style={{ position: "absolute", right: 36, top: 73, width: 250, height: 84 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 42, border: `2px solid ${EM}`, backgroundColor: `rgba(52,211,153,${0.08 + 0.92 * ok})` }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, lineHeight: 1.2, letterSpacing: "0.14em", color: ok > 0.5 ? "#0a0a0c" : EM }}>
            {ok > 0.5 ? "✓ LISTO" : "CONFIRMAR"}
          </div>
          {f >= tap && onda < 1 && <div style={{ position: "absolute", left: 125 - 90, top: 42 - 90, width: 180, height: 180, borderRadius: "50%", border: `3px solid ${EM}`, opacity: 0.7 * (1 - onda), transform: `scale(${0.2 + 0.8 * onda})` }} />}
        </div>
      </div>
      <Linea en={c("Marcás")} top={1220} tam={46}>Marcás cuándo podés,</Linea>
      <Linea en={c("y")} top={1282} tam={46}>y te llega con quién.</Linea>
    </Dolly>
  );
};

// ── 5 · Tu trayectoria, con tus números (esmeralda) ──────────────────────────
const miles = (n: number) => Math.round(n).toLocaleString("es-UY");
export const E5: React.FC<P> = ({ dur }) => {
  const f = useCurrentFrame();
  const c = (p: string, v = 1) => L("e5-trayectoria", p, v);
  const enCard = c("con") - 6;
  const k = tr(f, enCard, enCard + 14);
  const cuenta = tr(f, c("números") - 2, c("números") + 24, Easing.out(Easing.quad));
  return (
    <Dolly dur={dur}>
      <Linea en={c("trayectoria")} top={745} tam={66} peso={700} color={RC.crema}>Tu trayectoria,</Linea>
      <Linea en={c("con")} top={823} tam={46}>con tus números,</Linea>
      <div style={{ position: "absolute", left: 110, top: 940, width: 860, height: 380, borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(180deg,#171719,#101012)", boxShadow: "0 30px 70px rgba(0,0,0,0.55), 0 0 60px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.06)", opacity: k, transform: `translateY(${(1 - k) * 60}px)` }}>
        <div style={{ position: "absolute", left: 44, top: 34, fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: "0.26em", color: RC.platino500 }}>CURRÍCULUM</div>
        <div style={{ position: "absolute", right: 40, top: 30, padding: "4px 16px", border: `1px solid ${RC.tinta700}`, borderRadius: 999, fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: RC.platino500 }}>EJEMPLO</div>
        <div style={{ position: "absolute", left: 44, right: 44, top: 88, height: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", left: 44, top: 116, width: 330 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, lineHeight: 1.1, color: EM }}>{Math.round(34 * cuenta)} %</div>
          <div style={{ marginTop: 8, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.1em", color: RC.platino500 }}>TASA DE CIERRE</div>
        </div>
        <div style={{ position: "absolute", left: 420, top: 116, width: 400 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, lineHeight: 1.1, color: EM, whiteSpace: "nowrap" }}>{miles(18500 * cuenta)}</div>
          <div style={{ marginTop: 8, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.1em", color: RC.platino500 }}>MAYOR CASH COBRADO (USD)</div>
        </div>
      </div>
      <Linea en={c("queda")} top={1380} tam={46}>queda guardada en tu perfil.</Linea>
    </Dolly>
  );
};

// ── 6 · Cierre: el odómetro en cero vuelve al centro (héroe, global) ─────────
export const E6: React.FC<P> = ({ dur }) => {
  const f = useCurrentFrame();
  const c = (p: string, v = 1) => L("e6-cierre", p, v);
  const en = c("lead") + 8;
  const k = tr(f, en, en + 10);
  return (
    <Dolly dur={dur}>
      <Linea en={c("Practicá")} top={1150} tam={68} peso={700} color={RC.crema}>Practicá donde</Linea>
      <Linea en={c("no")} top={1240} tam={68} peso={700} color={RC.crema}>
        no te cuesta <Hilo en={c("un")} color={EM}>un lead.</Hilo>
      </Linea>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1392, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 22}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 50px 20px 40px", borderRadius: 999, backgroundColor: RC.crema, color: "#0a0a0c", fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, lineHeight: 1.2, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 20V5M12 5l-6 6M12 5l6 6" fill="none" stroke="#0a0a0c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Link en la bio
        </div>
      </div>
    </Dolly>
  );
};
