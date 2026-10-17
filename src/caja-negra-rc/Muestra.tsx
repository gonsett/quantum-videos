import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { cl, ease, SERIF_IT } from "../setters-goz/MuestraV2";
import { MONO } from "../ring-closers/tema";

/**
 * "La caja negra" — MUESTRA v2 de 5,5 s (17/10/2026), 60 fps, sin voz.
 * Una linterna se prende en la oscuridad y encuentra la caja negra (polvo en el haz, barrido especular).
 * «Lo veo y te aviso» flota debajo y se deshace en polvo. La luz parpadea y se apaga.
 * Golpe en negro: el láser esmeralda se enciende desde el centro y, a medida que se abre, ilumina la caja.
 * Arriba, una línea de tiempo de un pelo flota en el aire; el cabezal corre hasta el minuto 12:
 * la pregunta se vuelve una onda de voz y aparece «minuto 12» en serif.
 * v2: sin destello blanco, sin caja de vidrio, caja más chica y respirando, bloom, bokeh delante, giro en perspectiva.
 */
export const DUR_CN_MUESTRA = 330;
const PRENDE = 14;            // clic de la linterna
const FRASE = 84;             // entra «Lo veo y te aviso»
const DESHACE = 136;          // la frase se vuelve polvo
const APAGA = 166;            // la linterna parpadea y se apaga
const CORTE = 184;            // golpe: se enciende el láser
const BARRE = 206;            // el pulso recorre el láser
const LLEGA = 262;            // el cabezal se clava en el min 12

const VERDE_C = "#34d399";
const MARFIL = "#efece6";
const IW = 1536, IH = 2688;   // las placas reescaladas
const LASER_Y = 0.4911 * IH;  // fila del láser en escaner.jpg

// un blur en 0 igual cuesta una capa: si no hay desenfoque, no hay filtro
export const bl = (v: number) => (v > 0.05 ? `blur(${v}px)` : undefined);

export const golpe = (t: number, en: number, amp: number) => {
  const d = (t - en) / 60;
  if (d < 0) return 0;
  return amp * Math.exp(-d / 0.18) * Math.sin(d * 28);
};

// la linterna: dos parpadeos al prender, tres al apagar
const linterna = (t: number) => {
  const on = interpolate(t, [PRENDE, PRENDE + 3, PRENDE + 6, PRENDE + 9, PRENDE + 13, PRENDE + 22], [0, 0.55, 0.08, 0.8, 0.45, 1], cl);
  const off = interpolate(t, [APAGA, APAGA + 3, APAGA + 6, APAGA + 9, APAGA + 13], [1, 0.25, 0.7, 0.12, 0], cl);
  return t < APAGA ? on : off;
};

// ---------- la placa: imagen + bloom + overlays en coordenadas de la imagen ----------
// rápido: nada de filter/mask por cuadro; bloom, bordes, foco y desaturación vienen horneados (hornear-caja-negra.py)
export const Placa: React.FC<{ src: string; s: number; x: number; y: number; giro?: number; rot?: number; foco?: number; luz?: number;
  focoSrc?: string; children?: React.ReactNode }> =
  ({ src, s, x, y, giro = 0, rot = 0, foco = 0, luz = 1, focoSrc, children }) => {
    const base = src.replace(".jpg", "");
    const img = { position: "absolute" as const, inset: 0, width: IW, height: IH };
    return (
      <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
        <div style={{ position: "absolute", left: 540 - IW / 2, top: 960 - IH / 2, width: IW, height: IH,
          transform: `translate(${x}px, ${y}px) scale(${s}) rotateY(${giro}deg) rotate(${rot}deg)`,
          }}>
          <Img src={staticFile(`caja-negra-rc/${src}`)} style={img} />
          {foco > 0.01 && <Img src={staticFile(`caja-negra-rc/${focoSrc ?? base + "-foco.jpg"}`)} style={{ ...img, opacity: foco }} />}
          {/* bloom: los brillos respiran un halo, como la halación de la película */}
          <Img src={staticFile(`caja-negra-rc/${base}-bloom.jpg`)} style={{ ...img, mixBlendMode: "screen", opacity: 0.32 * luz * luz }} />
          {luz < 0.995 && <div style={{ ...img, background: "#000", opacity: 1 - luz }} />}
          {children}
        </div>
      </div>
    );
  };

// polvo dentro del haz: el haz baja desde arriba a la izquierda hacia la caja
export const Polvo: React.FC<{ t: number; luz: number }> = ({ t, luz }) => (
  <>
    {Array.from({ length: 70 }, (_, i) => {
      const u = random(`u${i}`), v = random(`v${i}`) - 0.5;
      const ax = 60 + u * 760, ay = 40 + u * 1180;
      const ancho = 60 + u * 260;
      const x = ax + v * ancho * 2 + Math.sin(t / 70 + i) * 14;
      const y = ay + v * ancho * -0.6 - ((t * (0.25 + random(`w${i}`) * 0.5)) % 160) + 80;
      const tam = 2 + random(`s${i}`) * 5;
      const brillo = (1 - Math.abs(v) * 1.6) * (0.35 + 0.65 * Math.abs(Math.sin(t / (18 + i % 7) + i)));
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: tam, height: tam, borderRadius: tam,
        background: tam > 5 ? "radial-gradient(circle, #f4f1ea 30%, transparent 75%)" : "#f4f1ea", opacity: Math.max(0, brillo) * luz * 0.75 }} />;
    })}
  </>
);

// bokeh delante de la cámara: discos grandes y fuera de foco que cruzan más rápido que la caja (paralaje)
export const Bokeh: React.FC<{ t: number; luz: number; tinte: string }> = ({ t, luz, tinte }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 9 }, (_, i) => {
      const tam = (70 + random(`bt${i}`) * 150) * 1.35;
      const x = ((random(`bx${i}`) * 1400 - 160 + t * (0.6 + random(`bv${i}`) * 0.9)) % 1400) - 160;
      const y = random(`by${i}`) * 1920 + Math.sin(t / 90 + i) * 30;
      const o = (0.05 + random(`bo${i}`) * 0.1) * luz * (0.7 + 0.3 * Math.sin(t / 40 + i * 2));
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: tam, height: tam, borderRadius: tam,
        background: `radial-gradient(circle, ${tinte} 0%, ${tinte} 30%, transparent 70%)`, opacity: o }} />;
    })}
  </AbsoluteFill>
);

// «Lo veo y te aviso»: entra con foco; se deshace letra por letra en polvo que cae
const FRASE_TXT = "«Lo veo y te aviso.»";
const Frase: React.FC<{ t: number }> = ({ t }) => {
  if (t < FRASE - 2 || t > APAGA + 10) return null;
  const entra = interpolate(t, [FRASE, FRASE + 26], [0, 1], { ...cl, easing: ease });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1360, display: "flex", justifyContent: "center",
      fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 62, color: MARFIL, letterSpacing: "-0.01em",
      opacity: entra, filter: bl((1 - entra) * 10), transform: `translateY(${(1 - entra) * 18}px)` }}>
      {FRASE_TXT.split("").map((ch, i) => {
        const r = random(`d${i}`);
        const a = DESHACE + r * 22;
        const d = interpolate(t, [a, a + 26], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: 1 - d,
            transform: `translate(${(random(`dx${i}`) - 0.5) * 40 * d}px, ${d * (50 + r * 70)}px)`, filter: bl(d * 7) }}>{ch}</span>
        );
      })}
    </div>
  );
};

// ---------- la línea de tiempo: un pelo flotando en el aire, sin caja ----------
const MARCAS = [3, 7, 12];
const MIN_TOTAL = 40;
const Linea: React.FC<{ t: number }> = ({ t }) => {
  const W = 860, L = W;
  const dibuja = interpolate(t, [CORTE + 10, CORTE + 40], [0, 1], { ...cl, easing: ease });
  const cab = interpolate(t, [BARRE, LLEGA], [0, 12], { ...cl, easing: Easing.bezier(0.45, 0, 0.12, 1) });
  const llego = t >= LLEGA;
  const pulso = llego ? Math.exp(-(t - LLEGA) / 22) : 0;
  const verde = interpolate(t, [LLEGA, LLEGA + 14], [0, 1], cl);
  const titulo = interpolate(t, [LLEGA + 2, LLEGA + 30], [0, 1], { ...cl, easing: ease });
  const xm = (m: number) => (m / MIN_TOTAL) * L;
  const RIEL = 250;
  return (
    <div style={{ position: "absolute", left: 540 - W / 2, top: 300, width: W, height: 380 }}>
      {/* «minuto 12»: la única cosa grande; el resto, susurro */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: SERIF_IT, fontStyle: "italic",
        fontSize: 108, lineHeight: 1, color: MARFIL, letterSpacing: "-0.02em",
        opacity: titulo, filter: bl((1 - titulo) * 12), transform: `translateY(${(1 - titulo) * 22}px) scale(${1.04 - 0.04 * titulo})` }}>
        minuto <span style={{ color: VERDE_C, textShadow: `0 0 ${20 + 30 * pulso}px rgba(16,185,129,0.45)` }}>12</span>
      </div>
      {/* rótulo en susurro */}
      <div style={{ position: "absolute", left: 0, right: 0, top: RIEL + 62, display: "flex", justifyContent: "space-between", opacity: dibuja * 0.9,
        fontFamily: MONO, fontSize: 16, letterSpacing: "0.38em", color: "rgba(161,161,170,0.8)" }}>
        <span>GRABACIÓN DEL ROLEPLAY</span>
        <span style={{ color: verde > 0.5 ? VERDE_C : "rgba(161,161,170,0.8)" }}>{`${String(Math.floor(cab)).padStart(2, "0")}:${String(Math.floor((cab % 1) * 60)).padStart(2, "0")}`}</span>
      </div>
      {/* el riel: se dibuja desde el centro, se pierde en las puntas */}
      <div style={{ position: "absolute", left: L / 2 - (L / 2) * dibuja, width: L * dibuja, top: RIEL, height: 1.5,
        background: "linear-gradient(90deg, transparent, rgba(239,236,230,0.4) 12%, rgba(239,236,230,0.4) 88%, transparent)" }} />
      <div style={{ position: "absolute", left: 0, width: xm(cab), top: RIEL - 0.5, height: 2.5,
        background: "linear-gradient(90deg, transparent, rgba(239,236,230,0.9) 30%)" }} />
      {Array.from({ length: MIN_TOTAL / 5 + 1 }, (_, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: xm(i * 5) - 0.5, top: RIEL + 10, width: 1, height: i % 2 ? 6 : 12,
            background: "rgba(239,236,230,0.3)", opacity: dibuja }} />
          {i % 2 === 0 && i > 0 && i < 8 && <div style={{ position: "absolute", left: xm(i * 5) - 30, width: 60, top: RIEL + 30, textAlign: "center",
            fontFamily: MONO, fontSize: 15, color: "rgba(161,161,170,0.6)", opacity: dibuja }}>{i * 5}</div>}
        </React.Fragment>
      ))}
      {/* las preguntas: la del 12 se vuelve una onda */}
      {MARCAS.map((m, i) => {
        const es12 = m === 12;
        const ap = interpolate(t, [CORTE + 24 + i * 8, CORTE + 44 + i * 8], [0, 1], { ...cl, easing: ease });
        const apagada = es12 ? 0 : interpolate(t, [LLEGA, LLEGA + 24], [0, 0.7], cl);
        return (
          <div key={m} style={{ position: "absolute", left: xm(m) - 40, width: 80, top: RIEL - 118, height: 118, opacity: ap * (1 - apagada),
            transform: `translateY(${(1 - ap) * 10}px)`, filter: bl((1 - ap) * 6) }}>
            <div style={{ position: "absolute", left: 39.5, top: 76, width: 1, height: 42,
              background: es12 && verde > 0 ? `rgba(52,211,153,${0.4 + 0.6 * verde})` : "linear-gradient(180deg, transparent, rgba(239,236,230,0.45))" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 18, display: "flex", justifyContent: "center", fontFamily: SERIF_IT, fontStyle: "italic",
              fontSize: 54, lineHeight: 1, color: "rgba(212,212,216,0.7)", opacity: es12 ? 1 - verde : 1, filter: bl(es12 ? verde * 6 : 0) }}>?</div>
            {es12 && verde > 0 && (
              <svg width={80} height={60} style={{ position: "absolute", left: 0, top: 14, overflow: "visible" }}>
                {Array.from({ length: 13 }, (_, k) => {
                  const h = (3 + 44 * Math.abs(Math.sin(k * 1.7 + 0.6)) * Math.sin((Math.PI * (k + 0.5)) / 13)) * verde * (1 + 0.18 * Math.sin(t / 5 + k));
                  return <rect key={k} x={2 + k * 6} y={30 - h / 2} width={2.2} height={h} rx={1.1} fill={VERDE_C}
                    style={{ filter: `drop-shadow(0 0 ${5 + 10 * pulso}px rgba(16,185,129,0.8))` }} />;
                })}
              </svg>
            )}
          </div>
        );
      })}
      {/* cabezal */}
      {t >= BARRE - 6 && (
        <>
          <div style={{ position: "absolute", left: xm(cab) - 1, top: RIEL - 34, width: 2, height: 52,
            background: llego ? VERDE_C : MARFIL, boxShadow: llego ? `0 0 ${12 + 28 * pulso}px rgba(16,185,129,0.9)` : "0 0 8px rgba(255,255,255,0.5)",
            opacity: interpolate(t, [BARRE - 6, BARRE + 4], [0, 1], cl) }} />
          <div style={{ position: "absolute", left: xm(cab) - 5, top: RIEL - 4, width: 10, height: 10, borderRadius: 5,
            background: llego ? VERDE_C : MARFIL, transform: `scale(${1 + 0.6 * pulso})` }} />
        </>
      )}
    </div>
  );
};

// ---------- la escena ----------
const Escena: React.FC<{ t: number }> = ({ t }) => {
  const luz = linterna(t);
  if (t < CORTE) {
    // HALLAZGO: empuje lento hacia la caja, con un giro mínimo en perspectiva
    const s = interpolate(t, [0, CORTE], [0.735, 0.79], { easing: Easing.bezier(0.33, 0, 0.4, 1) });
    const y = interpolate(t, [0, CORTE], [10, -40]);
    const barrido = interpolate(t, [PRENDE + 30, PRENDE + 120], [-0.4, 1.4], cl);
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <AbsoluteFill style={{ opacity: luz }}>
          <Placa src="hallazgo.jpg" s={s} x={Math.sin(t / 90) * 6} y={y + Math.sin(t / 70) * 4}
            giro={interpolate(t, [0, CORTE], [-2.2, 1.2])} rot={Math.sin(t / 120) * 0.25}>
            {/* barrido especular: overlay sobre negro deja el negro intacto, solo brilla el metal */}
            <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay",
              background: `linear-gradient(115deg, transparent ${(barrido - 0.12) * 100}%, rgba(255,255,255,0.75) ${barrido * 100}%, transparent ${(barrido + 0.12) * 100}%)` }} />
            <Polvo t={t} luz={luz} />
          </Placa>
          <Bokeh t={t} luz={luz} tinte="rgba(244,241,234,1)" />
        </AbsoluteFill>
        <Frase t={t} />
      </AbsoluteFill>
    );
  }
  // ESCÁNER: el láser se enciende desde el centro y trae la luz
  const d = t - CORTE;
  const abre = interpolate(d, [0, 16], [0, 1], { ...cl, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const ilumina = interpolate(d, [2, 30], [0.06, 1], { ...cl, easing: Easing.out(Easing.quad) });
  const s = interpolate(d, [0, DUR_CN_MUESTRA - CORTE], [0.69, 0.655], { easing: Easing.out(Easing.cubic) });
  const sh = golpe(t, CORTE, 7);
  const foco = interpolate(t, [CORTE + 18, CORTE + 46], [0, 1], { ...cl, easing: ease });
  const px = interpolate(t, [BARRE, BARRE + 50], [-0.05, 1.05], { ...cl, easing: Easing.bezier(0.5, 0, 0.3, 1) });
  const vivo = t >= BARRE && t <= BARRE + 54;
  const llega = t >= LLEGA ? Math.exp(-(t - LLEGA) / 30) : 0;
  // el láser como objeto de luz: núcleo blanco verdoso, halo esmeralda y una estela anamórfica
  const anchoL = abre * IW * 0.5;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Placa src="escaner-v2.jpg" s={s} x={Math.sin(t / 95) * 5} y={70 + sh} giro={interpolate(d, [0, 146], [1.6, -1.2])}
        rot={golpe(t, CORTE, 0.25)} foco={foco} luz={ilumina}>
        <div style={{ position: "absolute", left: IW / 2 - anchoL, width: anchoL * 2, top: LASER_Y - 2.5, height: 5, borderRadius: 3, mixBlendMode: "screen",
          background: "linear-gradient(90deg, transparent, rgba(220,255,240,0.95) 8%, rgba(220,255,240,0.95) 92%, transparent)",
          opacity: 0.55 + 0.25 * llega + 0.1 * Math.sin(t / 3) ** 2, filter: "blur(1.2px)" }} />
        <div style={{ position: "absolute", left: IW / 2 - anchoL, width: anchoL * 2, top: LASER_Y - 70, height: 140, mixBlendMode: "screen",
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(16,185,129,${0.22 + 0.25 * llega + 0.4 * Math.exp(-d / 10)}), transparent 70%)` }} />
        {vivo && (
          <div style={{ position: "absolute", left: px * IW - 210, top: LASER_Y - 70, width: 420, height: 140, mixBlendMode: "screen",
            background: "radial-gradient(ellipse 50% 16% at 50% 50%, rgba(240,255,248,0.95), rgba(52,211,153,0.5) 45%, transparent 75%)" }} />
        )}
      </Placa>
      {/* estela anamórfica en la punta del encendido: una raya horizontal larga y fina */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: Math.exp(-d / 14) * (d >= 0 ? 1 : 0) }}>
        <div style={{ position: "absolute", left: -200, right: -200, top: 960 + 70 + sh + (LASER_Y - IH / 2) * s - 3, height: 6,
          background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.5) 30%, rgba(230,255,245,0.9) 50%, rgba(52,211,153,0.5) 70%, transparent)",
          filter: "blur(3px)" }} />
      </AbsoluteFill>
      <Bokeh t={t + 400} luz={ilumina * 0.9} tinte="rgba(52,211,153,1)" />
      {/* la línea de tiempo, adelante: entra desenfocada y hace foco */}
      <AbsoluteFill style={{ filter: foco < 0.99 ? `blur(${(1 - foco) * 8}px)` : undefined, opacity: interpolate(t, [CORTE + 8, CORTE + 26], [0, 1], cl),
        transform: `translateY(${sh * 0.5}px)` }}><Linea t={t} /></AbsoluteFill>
    </AbsoluteFill>
  );
};

// desenfoque de movimiento adaptativo: submuestras solo donde algo se mueve rápido (el resto es un empuje lento: 1 alcanza)
const muestras = (f: number) =>
  f >= CORTE - 2 && f <= CORTE + 30 ? 6 : f >= BARRE - 4 && f <= LLEGA + 12 ? 4 : f >= DESHACE && f <= DESHACE + 50 ? 3 : 1;

export const MuestraCajaNegra: React.FC = () => {
  const f = useCurrentFrame();
  const n = muestras(f);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={n === 1 ? f : f - 0.3 + (0.6 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      {/* gradación: sombras apenas frías, viñeta */}
      <AbsoluteFill style={{ background: "rgba(10,28,26,0.18)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 47%, transparent 52%, rgba(0,0,0,0.7))" }} />
      <Img src={staticFile(`caja-negra-rc/grano-${Math.floor(f / 2) % 8}.png`)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [DUR_CN_MUESTRA - 24, DUR_CN_MUESTRA], [0, 1], cl) }} />
      <Audio src={staticFile("caja-negra-rc/muestra.wav")} />
    </AbsoluteFill>
  );
};
