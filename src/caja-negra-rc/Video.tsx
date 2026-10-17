import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cl, ease, rebote, SERIF_IT, TIGHT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO } from "../ring-closers/tema";
import { bl, Bokeh, golpe, Placa, Polvo } from "./Muestra";
import M from "./momentos.json";

/**
 * "La caja negra" (17/10/2026), 60 fps, voz Callirrhoe en una toma corrida (voz.mp3, huecos ≤ 0,25 s).
 * Mismo mundo que la muestra aprobada: placas fotográficas con bloom/foco horneados (hornear-caja-negra.py),
 * polvo, bokeh delante, grano horneado, desenfoque de movimiento solo donde hay movimiento rápido.
 * 1 hallazgo · 2 tu caja (VENTA · 14/10, la luz se apaga en «nada») · 3 «lo veo y te aviso» se hace polvo ·
 * 4 preguntas en la línea de tiempo · 5 adivinar (las marcas se desordenan) · 6 se abre (golpe más grande) ·
 * 7 el minuto 12 (láser + cabezal) · 8 la nota del rival · 9 la tesis · 10 logo.
 * Los momentos salen de las palabras (armar-voz-caja-negra.py → momentos.json), compartidos con el sonido.
 */
const V0 = 70;                                        // la linterna se prende antes de la primera palabra
const w = (s: number) => V0 + Math.round(s * 60);
export const DUR_CN = w(M.fin) + 170;

const VERDE_C = "#34d399";
const MARFIL = "#efece6";
const IH = 2688;
const LASER_Y = 0.4911 * IH;

// ---------- momentos (cuadros) ----------
const PRENDE = 14;
const TU = w(M.tu) - 4;
const APAGA = w(M.nada) + 4;
const FRASE = w(M.dicen) - 6, DESHACE = w(M.desaparecen);
const PREG = w(M.fue) - 14;
const MARCAS_EN = [w(M.precio), w(M.apuraste), w(M.doce1)];
const NUNCA = w(M.nunca) - 4, ADIVINA = w(M.adivinas), MAL = w(M.mal), SI = w(M.si);
const ABRE = w(M.en) - 8;
const GRABA = w(M.grabas) - 10, BARRE = w(M.volves), LLEGA = w(M.doce2);
const NOTA0 = w(M.closer1) - 10, NOTA = w(M.nota);
const TESIS = w(M.cliente) - 10;
const LOGO = w(M.logo) - 10, C1 = w(M.practica), C2 = w(M.cerra);
const CORTES = [TU, FRASE - 20, PREG, NUNCA, ABRE, GRABA, NOTA0, TESIS, LOGO];

// la linterna: parpadea al prender, se apaga en «nada»
const linterna = (t: number) => {
  const on = interpolate(t, [PRENDE, PRENDE + 3, PRENDE + 6, PRENDE + 9, PRENDE + 13, PRENDE + 22], [0, 0.55, 0.08, 0.8, 0.45, 1], cl);
  const off = interpolate(t, [APAGA, APAGA + 3, APAGA + 6, APAGA + 9, APAGA + 13], [1, 0.25, 0.7, 0.12, 0], cl);
  return t < APAGA ? on : off;
};

const Barrido: React.FC<{ t: number; desde: number; dur?: number; fuerza?: number }> = ({ t, desde, dur = 90, fuerza = 0.75 }) => {
  const b = interpolate(t, [desde, desde + dur], [-0.4, 1.4], cl);
  return <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay",
    background: `linear-gradient(115deg, transparent ${(b - 0.12) * 100}%, rgba(255,255,255,${fuerza}) ${b * 100}%, transparent ${(b + 0.12) * 100}%)` }} />;
};


// «Lo veo y te aviso.»: entra con foco; se deshace letra por letra en polvo que cae
const FRASE_TXT = "«Lo veo y te aviso.»";
const Frase: React.FC<{ t: number }> = ({ t }) => {
  if (t < FRASE - 2 || t > DESHACE + 60) return null;
  const entra = interpolate(t, [FRASE, FRASE + 26], [0, 1], { ...cl, easing: ease });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center",
      fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 76, color: MARFIL, letterSpacing: "-0.01em",
      opacity: entra, filter: bl((1 - entra) * 10), transform: `translateY(${(1 - entra) * 18}px)` }}>
      {FRASE_TXT.split("").map((ch, i) => {
        const r = random(`d${i}`);
        const a = DESHACE + r * 22;
        const d = interpolate(t, [a, a + 30], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: 1 - d,
            transform: `translate(${(random(`dx${i}`) - 0.5) * 40 * d}px, ${d * (60 + r * 90)}px)`, filter: bl(d * 7) }}>{ch}</span>
        );
      })}
    </div>
  );
};

// ---------- la línea de tiempo: un pelo flotando en el aire ----------
const MIN_TOTAL = 40;
const Linea: React.FC<{ t: number; aparece: number; marcasEn: number[]; desorden?: boolean; barre?: number; llega?: number; top?: number }> =
  ({ t, aparece, marcasEn, desorden = false, barre, llega, top = 300 }) => {
    const W = 860, L = W, RIEL = 250;
    const dibuja = interpolate(t, [aparece, aparece + 30], [0, 1], { ...cl, easing: ease });
    const cab = barre !== undefined && llega !== undefined ? interpolate(t, [barre, llega], [0, 12], { ...cl, easing: Easing.bezier(0.45, 0, 0.12, 1) }) : 0;
    const llego = llega !== undefined && t >= llega;
    const pulso = llego ? Math.exp(-(t - llega!) / 22) : 0;
    const verde = llega !== undefined ? interpolate(t, [llega, llega + 14], [0, 1], cl) : 0;
    const titulo = llega !== undefined ? interpolate(t, [llega + 2, llega + 30], [0, 1], { ...cl, easing: ease }) : 0;
    const xm = (m: number) => (m / MIN_TOTAL) * L;
    // adivinar: las marcas se corren a donde no eran; en «mal» se apaga la que importaba, en «sí» se repite la otra
    const corre = desorden ? interpolate(t, [ADIVINA, MAL], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) }) : 0;
    const DESTINO = [26, 17, 33];
    const MIN_MARCA = [3, 7, 12];
    return (
      <div style={{ position: "absolute", left: 540 - W / 2, top, width: W, height: 380 }}>
        {llega !== undefined && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: SERIF_IT, fontStyle: "italic",
            fontSize: 108, lineHeight: 1, color: MARFIL, letterSpacing: "-0.02em",
            opacity: titulo, filter: bl((1 - titulo) * 12), transform: `translateY(${(1 - titulo) * 22}px) scale(${1.04 - 0.04 * titulo})` }}>
            minuto <span style={{ color: VERDE_C, textShadow: `0 0 ${20 + 30 * pulso}px rgba(16,185,129,0.45)` }}>12</span>
          </div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, top: RIEL + 62, display: "flex", justifyContent: "space-between", opacity: dibuja * 0.9,
          fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: "rgba(161,161,170,0.8)" }}>
          <span>GRABACIÓN DEL ROLEPLAY</span>
          <span style={{ color: verde > 0.5 ? VERDE_C : "rgba(161,161,170,0.8)" }}>
            {barre !== undefined ? `${String(Math.floor(cab)).padStart(2, "0")}:${String(Math.floor((cab % 1) * 60)).padStart(2, "0")}` : "SIN NOTAS"}
          </span>
        </div>
        <div style={{ position: "absolute", left: L / 2 - (L / 2) * dibuja, width: L * dibuja, top: RIEL, height: 1.5,
          background: "linear-gradient(90deg, transparent, rgba(239,236,230,0.6) 12%, rgba(239,236,230,0.6) 88%, transparent)" }} />
        {barre !== undefined && <div style={{ position: "absolute", left: 0, width: xm(cab), top: RIEL - 0.5, height: 2.5,
          background: "linear-gradient(90deg, transparent, rgba(239,236,230,0.9) 30%)" }} />}
        {Array.from({ length: MIN_TOTAL / 5 + 1 }, (_, i) => (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: xm(i * 5) - 0.5, top: RIEL + 10, width: 1, height: i % 2 ? 6 : 12,
              background: "rgba(239,236,230,0.3)", opacity: dibuja }} />
            {i % 2 === 0 && i > 0 && i < 8 && <div style={{ position: "absolute", left: xm(i * 5) - 30, width: 60, top: RIEL + 30, textAlign: "center",
              fontFamily: MONO, fontSize: 20, color: "rgba(161,161,170,0.75)", opacity: dibuja }}>{i * 5}</div>}
          </React.Fragment>
        ))}
        {MIN_MARCA.map((m0, i) => {
          const es12 = m0 === 12;
          const en = marcasEn[i];
          const ap = interpolate(t, [en, en + 20], [0, 1], { ...cl, easing: ease });
          const m = m0 + (DESTINO[i] - m0) * corre * (0.8 + 0.2 * Math.sin(t / 9 + i));
          const apagaMal = desorden && es12 ? interpolate(t, [MAL, MAL + 14], [0, 0.85], cl) : 0;
          const repite = desorden && i === 0 ? interpolate(t, [SI, SI + 10], [0, 1], cl) : 0;
          const apagada = llega !== undefined && !es12 ? interpolate(t, [llega, llega + 24], [0, 0.7], cl) : 0;
          return (
            <div key={m0} style={{ position: "absolute", left: xm(m) - 40, width: 80, top: RIEL - 118, height: 118, opacity: ap * (1 - apagada) * (1 - apagaMal),
              transform: `translateY(${(1 - ap) * 10}px) scale(${1 + 0.25 * repite * Math.exp(-(t - SI) / 20)})`, filter: bl((1 - ap) * 6) }}>
              <div style={{ position: "absolute", left: 39.5, top: 76, width: 1, height: 42,
                background: es12 && verde > 0 ? `rgba(52,211,153,${0.4 + 0.6 * verde})` : "linear-gradient(180deg, transparent, rgba(239,236,230,0.45))" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 18, display: "flex", justifyContent: "center", fontFamily: SERIF_IT, fontStyle: "italic",
                fontSize: 72, lineHeight: 1, color: repite > 0 ? "rgba(239,236,230,0.95)" : "rgba(212,212,216,0.7)",
                opacity: es12 ? 1 - verde : 1, filter: bl(es12 ? verde * 6 : 0) }}>?</div>
              {es12 && verde > 0 && (
                <svg width={80} height={60} style={{ position: "absolute", left: 0, top: 14, overflow: "visible" }}>
                  {Array.from({ length: 13 }, (_, k) => {
                    const h = (3 + 44 * Math.abs(Math.sin(k * 1.7 + 0.6)) * Math.sin((Math.PI * (k + 0.5)) / 13)) * verde * (1 + 0.18 * Math.sin(t / 5 + k));
                    return <rect key={k} x={2 + k * 6} y={30 - h / 2} width={2.2} height={h} rx={1.1} fill={VERDE_C} />;
                  })}
                </svg>
              )}
            </div>
          );
        })}
        {barre !== undefined && t >= barre - 6 && (
          <>
            <div style={{ position: "absolute", left: xm(cab) - 1, top: RIEL - 34, width: 2, height: 52,
              background: llego ? VERDE_C : MARFIL, boxShadow: llego ? `0 0 ${12 + 28 * pulso}px rgba(16,185,129,0.9)` : "0 0 8px rgba(255,255,255,0.5)",
              opacity: interpolate(t, [barre - 6, barre + 4], [0, 1], cl) }} />
            <div style={{ position: "absolute", left: xm(cab) - 5, top: RIEL - 4, width: 10, height: 10, borderRadius: 5,
              background: llego ? VERDE_C : MARFIL, transform: `scale(${1 + 0.6 * pulso})` }} />
          </>
        )}
      </div>
    );
  };

// el láser (sobre escaner-v2): núcleo, halo y pulso
const Laser: React.FC<{ t: number; desde: number; pulsoEn?: number; extra?: number }> = ({ t, desde, pulsoEn, extra = 0 }) => {
  const d = t - desde;
  const abre = interpolate(d, [0, 16], [0, 1], { ...cl, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const ancho = abre * 1536 * 0.5;
  const px = pulsoEn !== undefined ? interpolate(t, [pulsoEn, pulsoEn + 50], [-0.05, 1.05], { ...cl, easing: Easing.bezier(0.5, 0, 0.3, 1) }) : -1;
  return (
    <>
      <div style={{ position: "absolute", left: 768 - ancho, width: ancho * 2, top: LASER_Y - 2.5, height: 5, borderRadius: 3, mixBlendMode: "screen",
        background: "linear-gradient(90deg, transparent, rgba(220,255,240,0.95) 8%, rgba(220,255,240,0.95) 92%, transparent)",
        opacity: 0.55 + 0.25 * extra + 0.1 * Math.sin(t / 3) ** 2 }} />
      <div style={{ position: "absolute", left: 768 - ancho, width: ancho * 2, top: LASER_Y - 70, height: 140, mixBlendMode: "screen",
        background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(16,185,129,${0.22 + 0.25 * extra + 0.4 * Math.exp(-Math.max(d, 0) / 10)}), transparent 70%)` }} />
      {px > -0.05 && px < 1.05 && (
        <div style={{ position: "absolute", left: px * 1536 - 210, top: LASER_Y - 70, width: 420, height: 140, mixBlendMode: "screen",
          background: "radial-gradient(ellipse 50% 16% at 50% 50%, rgba(240,255,248,0.95), rgba(52,211,153,0.5) 45%, transparent 75%)" }} />
      )}
    </>
  );
};

// la tarjeta de la nota: vidrio mínimo, cinco marcas que se encienden
const Tarjeta: React.FC<{ t: number; en: number; esc?: number; top?: number }> = ({ t, en, esc = 1, top = 1180 }) => {
  const a = interpolate(t, [en, en + 30], [0, 1], { ...cl, easing: ease });
  if (a <= 0) return null;
  const W = 700;
  return (
    <div style={{ position: "absolute", left: 540 - W / 2, top, width: W, height: 300, borderRadius: 28, opacity: a,
      transform: `translateY(${(1 - a) * 40}px) scale(${esc * (0.97 + 0.03 * a)})`, filter: bl((1 - a) * 10),
      background: "linear-gradient(160deg, rgba(30,33,33,0.9), rgba(9,10,10,0.92))", border: "1px solid rgba(239,236,230,0.16)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
      <div style={{ position: "absolute", left: 48, top: 44, fontFamily: MONO, fontSize: 17, letterSpacing: "0.36em", color: "rgba(161,161,170,0.85)" }}>NOTA DE TU RIVAL</div>
      <div style={{ position: "absolute", right: 48, top: 30, fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 64, color: MARFIL, lineHeight: 1,
        opacity: interpolate(t, [NOTA + 30, NOTA + 50], [0, 1], cl) }}>4<span style={{ fontSize: 30, color: "rgba(161,161,170,0.8)" }}> / 5</span></div>
      <div style={{ position: "absolute", left: 48, right: 48, top: 150, display: "flex", justifyContent: "space-between" }}>
        {Array.from({ length: 5 }, (_, i) => {
          const pr = interpolate(t, [NOTA - 24 + i * 9, NOTA - 12 + i * 9], [0, 1], cl);
          const lit = i < 4 ? pr : 0;
          const flash = i < 4 && t >= NOTA - 12 + i * 9 ? Math.exp(-(t - (NOTA - 12 + i * 9)) / 14) : 0;
          return <div key={i} style={{ width: 104, height: 8, borderRadius: 4,
            background: lit > 0 ? `rgba(52,211,153,${0.25 + 0.75 * lit})` : "rgba(239,236,230,0.12)",
            boxShadow: lit > 0 ? `0 0 ${8 + 24 * flash}px rgba(16,185,129,${0.4 + 0.5 * flash})` : undefined }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 48, top: 196, fontFamily: MONO, fontSize: 15, letterSpacing: "0.3em", color: "rgba(161,161,170,0.6)",
        opacity: interpolate(t, [NOTA + 10, NOTA + 30], [0, 1], cl) }}>DEL CLOSER QUE ESTUVO ENFRENTE</div>
    </div>
  );
};

// etiqueta grabada a láser en la banda de la caja (general.jpg)
const Etiqueta: React.FC<{ t: number }> = ({ t }) => {
  const a = interpolate(t, [TU + 10, TU + 40], [0, 1], { ...cl, easing: ease });
  return (
    <div style={{ position: "absolute", left: 800 - 300, top: 1700 - 40, width: 600, height: 80, display: "flex", alignItems: "center", justifyContent: "center",
      transform: "rotate(1.2deg) skewX(-6deg)", fontFamily: MONO, fontWeight: 500, fontSize: 46, letterSpacing: "0.32em",
      color: "rgba(230,232,228,0.92)", textShadow: "0 1px 0 rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.25)", opacity: a,
      clipPath: `inset(0 ${(1 - a) * 100}% 0 0)` }}>VENTA · 14/10</div>
  );
};

// ---------- la frase de la voz, arriba (mismo lenguaje que «Los 7 segundos») ----------
const Palabra: React.FC<{ t: number; en: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, en, children, style }) => {
  const r = rebote(t, en, 13, 160);
  const vis = interpolate(t, [en - 1, en + 7], [0, 1], cl);
  return <span style={{ display: "inline-block", opacity: vis, transform: `translateY(${(1 - r) * 40}px) scale(${0.95 + 0.05 * r})`, filter: bl((1 - vis) * 14), ...style }}>{children}</span>;
};
const italica: React.CSSProperties = { fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.19em", letterSpacing: "-0.02em" };
const acentoV = (t: number, en: number): React.CSSProperties => ({ ...italica, color: VERDE_C,
  textShadow: `0 0 40px rgba(16,185,129,${0.45 * interpolate(t, [en, en + 30], [1, 0.4], cl)})` });
type Pal = { p: string; s: number; ac?: boolean; it?: boolean };
const FraseVoz: React.FC<{ t: number; renglones: Pal[][]; hasta: number; tam?: number }> = ({ t, renglones, hasta, tam = 100 }) => {
  const primera = w(renglones[0][0].s);
  const op = interpolate(t, [w(hasta) - 2, w(hasta) + 8], [1, 0], cl);
  if (t < primera - 30 || op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 210 + Math.sin(t / 80) * 5, opacity: op, filter: op < 1 ? bl((1 - op) * 18) : undefined, transform: `translateX(${Math.sin(t / 110) * 7}px)` }}>
      <div style={{ textAlign: "center", color: "#f4f4f5", fontFamily: TIGHT, fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.05,
        textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
        {renglones.map((r, i) => (
          <div key={i}>{r.map((pl, j) => (
            <React.Fragment key={j}>{j > 0 && " "}<Palabra t={t} en={w(pl.s) - 2} style={pl.ac ? acentoV(t, w(pl.s)) : pl.it ? italica : undefined}>{pl.p}</Palabra></React.Fragment>
          ))}</div>
        ))}
      </div>
    </div>
  );
};
const pal = (txt: string, ...s: number[]): Pal[] => txt.split(" ").map((p, i) => ({ p: p.replace(/[*_]/g, ""), s: s[i], ac: p.startsWith("*"), it: p.startsWith("_") }));
const FRASES: { r: Pal[][]; hasta: number; tam?: number }[] = [
  { r: [pal("Cuando se cae", 0.0, 0.18, 0.46), pal("un _avión,", 0.7, 0.86)], hasta: 1.42, tam: 112 },
  { r: [pal("alguien busca", 1.48, 1.78), pal("la *caja negra", 2.12, 2.32, 2.58), pal("para saber qué pasó.", 2.98, 3.24, 3.58, 3.76)], hasta: 4.34, tam: 100 },
  { r: [pal("Cuando se te cae", 4.4, 4.56, 4.82, 4.94), pal("una _venta,", 5.2, 5.38)], hasta: 6.14, tam: 108 },
  { r: [pal("nadie te dice", 6.2, 6.4, 6.62), pal("_nada.", 6.86)], hasta: 7.4, tam: 116 },
  { r: [pal("Te dicen…", 7.46, 7.6)], hasta: 9.3, tam: 100 },
  { r: [pal("y _desaparecen.", 9.42, 9.88)], hasta: 10.8, tam: 108 },
  { r: [pal("¿Fue el _precio?", 10.92, 11.04, 11.16), pal("¿Te _apuraste?", 11.86, 11.96)], hasta: 12.74, tam: 104 },
  { r: [pal("¿Fue algo que dijiste", 12.8, 12.98, 13.2, 13.4), pal("en el minuto _doce?", 13.9, 14.12, 14.24, 14.64)], hasta: 15.22, tam: 96 },
  { r: [pal("Nunca lo vas", 15.28, 15.6, 15.74), pal("a _saber.", 15.9, 16.02)], hasta: 16.48, tam: 116 },
  { r: [pal("Y cuando _adivinás,", 16.54, 16.64, 16.82), pal("cambiás lo que", 17.78, 18.2, 18.4), pal("no estaba _mal,", 18.52, 18.64, 18.92)], hasta: 19.2, tam: 100 },
  { r: [pal("y repetís", 19.26, 19.68), pal("lo que _sí.", 20.16, 20.32, 20.44)], hasta: 20.92, tam: 112 },
  { r: [pal("En Ring Closers,", 20.98, 21.12, 21.32), pal("cada *roleplay", 22.26, 22.48), pal("tiene su caja negra.", 23.1, 23.54, 23.76, 24.02)], hasta: 24.64, tam: 100 },
  { r: [pal("Lo _grabás,", 24.7, 24.8)], hasta: 25.56, tam: 116 },
  { r: [pal("y la grabación", 25.62, 25.74, 25.84), pal("vive en la _pelea.", 26.36, 26.66, 26.9, 27.04)], hasta: 27.42, tam: 104 },
  { r: [pal("Volvés al minuto *doce", 27.48, 28.06, 28.24, 28.66)], hasta: 28.96, tam: 96 },
  { r: [pal("y lo ves con tus", 29.0, 29.42, 29.54, 29.7, 29.86), pal("propios _ojos.", 30.02, 30.42)], hasta: 30.88, tam: 104 },
  { r: [pal("Y el closer", 30.94, 31.16, 31.28), pal("que estuvo _enfrente", 31.64, 31.86, 32.14), pal("te pone *nota.", 32.64, 33.02, 33.28)], hasta: 33.82, tam: 100 },
  { r: [pal("Un cliente se va", 33.88, 34.02, 34.68, 35.04), pal("sin decirte _nada.", 35.2, 35.36, 35.86)], hasta: 36.36, tam: 100 },
  { r: [pal("Un *closer", 36.42, 36.56), pal("te dice cómo", 36.98, 37.4, 37.66), pal("_estuviste.", 37.92)], hasta: 38.6, tam: 108 },
];

// ---------- la escena ----------
const Escena: React.FC<{ t: number }> = ({ t }) => {
  const luz = linterna(t);
  const sh = (desde: number, a: number) => golpe(t, desde, a);

  if (t < TU) {
    // 1. HALLAZGO
    const s = interpolate(t, [0, TU], [0.72, 0.8], { easing: Easing.bezier(0.33, 0, 0.4, 1) });
    return (
      <AbsoluteFill style={{ opacity: luz }}>
        <Placa src="hallazgo.jpg" s={s} x={Math.sin(t / 90) * 6} y={interpolate(t, [0, TU], [10, -50]) + Math.sin(t / 70) * 4}
          giro={interpolate(t, [0, TU], [-2.2, 1.2])} rot={Math.sin(t / 120) * 0.25}>
          <Barrido t={t} desde={PRENDE + 40} dur={110} />
          <Polvo t={t} luz={luz} />
        </Placa>
        <Bokeh t={t} luz={luz} tinte="rgba(244,241,234,1)" />
      </AbsoluteFill>
    );
  }
  if (t < FRASE - 20) {
    // 2. TU CAJA: la etiqueta, y en «nada» la linterna se muere
    const s = interpolate(t, [TU, FRASE], [0.66, 0.7]);
    return (
      <AbsoluteFill style={{ opacity: luz }}>
        <Placa src="general.jpg" s={s} x={0} y={-120 + sh(TU, 6)} giro={interpolate(t, [TU, FRASE], [1.5, -1])}>
          <Etiqueta t={t} />
          <Barrido t={t} desde={TU + 30} dur={80} fuerza={0.5} />
          <Polvo t={t + 300} luz={luz * 0.7} />
        </Placa>
        <Bokeh t={t} luz={luz * 0.8} tinte="rgba(244,241,234,1)" />
      </AbsoluteFill>
    );
  }
  if (t < PREG) {
    // 3. «Lo veo y te aviso» en la oscuridad: apenas el filo de la caja
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ opacity: 0.32 }}>
          <Placa src="general.jpg" s={0.7} x={0} y={60} foco={1} />
        </AbsoluteFill>
        <Frase t={t} />
      </AbsoluteFill>
    );
  }
  if (t < NUNCA) {
    // 4. LAS PREGUNTAS: línea de tiempo delante de la caja fuera de foco, luz fría y baja
    const s = interpolate(t, [PREG, NUNCA], [0.7, 0.74]);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ opacity: interpolate(t, [PREG, PREG + 30], [0, 0.75], cl) }}>
          <Placa src="hallazgo.jpg" s={s} x={0} y={380} foco={1} luz={0.8} />
        </AbsoluteFill>
        <Bokeh t={t + 900} luz={0.5} tinte="rgba(244,241,234,1)" />
        <Linea t={t} aparece={PREG + 4} marcasEn={MARCAS_EN} top={560} />
      </AbsoluteFill>
    );
  }
  if (t < ABRE) {
    // 5. ADIVINAR: la cámara se aleja, la caja queda chica y sola; las marcas se desordenan
    const s = interpolate(t, [NUNCA, ABRE], [0.6, 0.44], { easing: Easing.out(Easing.cubic) });
    const sale = interpolate(t, [ABRE - 14, ABRE], [1, 0], cl);
    return (
      <AbsoluteFill style={{ opacity: sale }}>
        <AbsoluteFill style={{ opacity: 0.85 }}>
          <Placa src="general.jpg" s={s} x={0} y={200} giro={interpolate(t, [NUNCA, ABRE], [-1, 1])} />
        </AbsoluteFill>
        <Linea t={t} aparece={-100} marcasEn={[-100, -100, -100]} desorden top={560} />
      </AbsoluteFill>
    );
  }
  if (t < GRABA) {
    // 6. SE ABRE: el golpe más grande; la luz esmeralda sale de adentro
    const d = t - ABRE;
    const ilumina = interpolate(d, [0, 26], [0.05, 1], { ...cl, easing: Easing.out(Easing.quad) });
    const s = interpolate(d, [0, GRABA - ABRE], [0.78, 0.71], { easing: Easing.out(Easing.cubic) });
    return (
      <AbsoluteFill>
        <Placa src="abre.jpg" s={s} x={Math.sin(t / 80) * 5} y={150 + sh(ABRE, 12)} rot={sh(ABRE, 0.4)} luz={ilumina}
          giro={interpolate(d, [0, 120], [2, -1])}>
          <Barrido t={t} desde={ABRE + 8} dur={70} fuerza={0.6} />
        </Placa>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 30% at 50% 47%, rgba(16,185,129,0.35), transparent 70%)", mixBlendMode: "screen",
          opacity: Math.exp(-d / 16) }} />
        <Bokeh t={t + 200} luz={ilumina} tinte="rgba(52,211,153,1)" />
      </AbsoluteFill>
    );
  }
  if (t < TESIS) {
    // 7. EL MINUTO 12 y 8. LA NOTA: escáner, cabezal, y la tarjeta adelante
    const d = t - GRABA;
    const ilumina = interpolate(d, [2, 30], [0.06, 1], { ...cl, easing: Easing.out(Easing.quad) });
    const s = interpolate(d, [0, TESIS - GRABA], [0.69, 0.63], { easing: Easing.out(Easing.cubic) });
    const nota = interpolate(t, [NOTA0, NOTA0 + 30], [0, 1], { ...cl, easing: ease });
    const foco = interpolate(t, [GRABA + 18, GRABA + 46], [0, 1], { ...cl, easing: ease });
    const llega = t >= LLEGA ? Math.exp(-(t - LLEGA) / 30) : 0;
    const sube = interpolate(t, [NOTA0, NOTA0 + 40], [0, 1], { ...cl, easing: ease });
    return (
      <AbsoluteFill>
        <Placa src="escaner-v2.jpg" s={s} x={Math.sin(t / 95) * 5} y={110 + sh(GRABA, 7) + sh(LLEGA, 3)} giro={interpolate(d, [0, 400], [1.6, -1.6])}
          rot={sh(GRABA, 0.25)} foco={nota > 0 ? 1 : foco} focoSrc={nota > 0 ? "escaner-v2-desfoco.jpg" : undefined} luz={ilumina * (1 - 0.35 * nota)}>
          <Laser t={t} desde={GRABA} pulsoEn={BARRE - 50} extra={llega} />
        </Placa>
        <AbsoluteFill style={{ mixBlendMode: "screen", opacity: Math.exp(-Math.max(d, 0) / 14) }}>
          <div style={{ position: "absolute", left: -200, right: -200, top: 960 + 110 + (LASER_Y - IH / 2) * s - 3, height: 6,
            background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.5) 30%, rgba(230,255,245,0.9) 50%, rgba(52,211,153,0.5) 70%, transparent)",
            filter: "blur(3px)" }} />
        </AbsoluteFill>
        <Bokeh t={t + 400} luz={ilumina * 0.9} tinte="rgba(52,211,153,1)" />
        <AbsoluteFill style={{ filter: foco < 0.99 ? `blur(${(1 - foco) * 8}px)` : undefined, opacity: interpolate(t, [GRABA + 8, GRABA + 26], [0, 1], cl) * (1 - sube),
          transform: `translateY(${40 * sube}px)` }}>
          <Linea t={t} aparece={GRABA + 10} marcasEn={[GRABA + 24, GRABA + 32, GRABA + 40]} barre={BARRE} llega={LLEGA} top={1380} />
        </AbsoluteFill>
        <Tarjeta t={t} en={NOTA0} top={1420} />
      </AbsoluteFill>
    );
  }
  if (t < LOGO) {
    // 9. LA TESIS: plano general, la caja abierta e iluminada; dos renglones, uno apagado, uno encendido
    const d = t - TESIS;
    const s = interpolate(d, [0, LOGO - TESIS], [0.56, 0.52]);
    const sale = interpolate(t, [LOGO - 14, LOGO], [1, 0], cl);
    return (
      <AbsoluteFill style={{ opacity: sale }}>
        <Placa src="escaner-v2.jpg" s={s} x={0} y={170} luz={interpolate(d, [0, 20], [0.4, 0.85], cl)} giro={interpolate(d, [0, 200], [-1.5, 1])}>
          <Laser t={t} desde={TESIS - 40} />
        </Placa>
        <Bokeh t={t + 600} luz={0.7} tinte="rgba(52,211,153,1)" />
      </AbsoluteFill>
    );
  }
  // 10. CIERRE: logo sobre la caja en penumbra
  const d = t - LOGO;
  const ent = interpolate(d, [0, 24], [0, 1], cl);
  const acento = (en: number) => ({ color: interpolate(t, [en, en + 12], [0, 1], cl) > 0.5 ? VERDE_C : "#f4f4f5" });
  const Pal: React.FC<{ en: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ en, children, style }) => {
    const a = interpolate(t, [en - 4, en + 14], [0, 1], { ...cl, easing: ease });
    return <span style={{ display: "inline-block", opacity: a, filter: bl((1 - a) * 8), transform: `translateY(${(1 - a) * 16}px)`, ...style }}>{children}</span>;
  };
  return (
    <AbsoluteFill style={{ opacity: ent }}>
      <AbsoluteFill style={{ opacity: 0.4 }}>
        <Placa src="hallazgo.jpg" s={interpolate(d, [0, 200], [0.62, 0.6])} x={0} y={420} foco={1} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.55))", transform: `scale(${0.85 + 0.15 * rebote(t, LOGO, 12, 170)})` }}>
          <Logo size={240} dibujoEn={LOGO} />
        </div>
        <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: "0.4em", color: "rgba(167,243,208,0.85)", whiteSpace: "nowrap",
          opacity: interpolate(t, [LOGO + 6, LOGO + 22], [0, 1], cl), transform: `translateY(${interpolate(t, [LOGO + 6, LOGO + 26], [16, 0], { ...cl, easing: ease })}px)` }}>
          RING CLOSERS
        </div>
        <div style={{ marginTop: 56, fontFamily: TIGHT, fontWeight: 600, fontSize: 84, color: "#f4f4f5", letterSpacing: "-0.045em", lineHeight: 1.1, textAlign: "center", whiteSpace: "nowrap" }}>
          <div><Pal en={C1}>Practicá con closers.</Pal></div>
          <div><Pal en={C2} style={acento(C2)}>Cerrá con clientes.</Pal></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// desenfoque de movimiento solo donde algo se mueve rápido
const RAPIDO: [number, number, number][] = [
  ...CORTES.map((c) => [c - 3, c + 26, 5] as [number, number, number]),
  [BARRE - 54, LLEGA + 12, 4], [DESHACE, DESHACE + 60, 3], [ADIVINA, SI + 20, 3], [NOTA - 30, NOTA + 30, 3], [LOGO, LOGO + 40, 4],
];
const muestras = (f: number) => RAPIDO.reduce((n, [a, b, k]) => (f >= a && f <= b ? Math.max(n, k) : n), 1);

export const VideoCajaNegra: React.FC = () => {
  const f = useCurrentFrame();
  const n = muestras(f);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={n === 1 ? f : f - 0.3 + (0.6 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{ background: "rgba(10,28,26,0.18)", mixBlendMode: "soft-light" }} />
      {FRASES.map((fr, i) => <FraseVoz key={i} t={f} renglones={fr.r} hasta={fr.hasta} tam={fr.tam} />)}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 47%, transparent 52%, rgba(0,0,0,0.7))" }} />
      <Img src={staticFile(`caja-negra-rc/grano-${Math.floor(f / 2) % 8}.png`)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [DUR_CN - 30, DUR_CN - 1], [0, 1], cl) }} />
      <Sequence from={V0}><Audio src={staticFile("voz-caja-negra-rc/voz.mp3")} /></Sequence>
      <Audio src={staticFile("caja-negra-rc/sonido.wav")} />
    </AbsoluteFill>
  );
};
