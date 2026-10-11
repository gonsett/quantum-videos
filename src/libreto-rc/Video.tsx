import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Capa, Ctx, Cam, P, cl, ease, rebote, TIGHT, SERIF_IT } from "../setters-goz/MuestraV2";
import { Logo } from "../reel-rc/logo";
import { MONO, RC } from "../ring-closers/tema";
import ENV from "./env.json";

/**
 * "Sonás a guion" (10/10/2026), 60 fps, un solo plano continuo. Dolor del closer que recita.
 * La hoja: un guion impreso perfecto bajo un foco, leído por un teleprompter a ritmo de metrónomo.
 * Del otro lado, el prospecto oye una voz plana y piensa "esto lo está leyendo"; la hoja se apaga.
 * Veinte copias no lo arreglan; un closer que te corta, sí. En los rounds cada renglón impreso se tacha
 * y se reescribe a mano en esmeralda, hasta que la hoja queda casi en blanco: ya no lo recitás, lo decís.
 * Voz Callirrhoe en una toma corrida (voz.mp3, huecos ≤ 0,25 s); tiempos de faster-whisper.
 */
const VERDE = RC.esmeralda500, TINTA_V = RC.esmeralda600;
const INK = "#1c1b19", GRIS_P = "#a8a297";

const V0 = 30;
const w = (s: number) => V0 + Math.round(s * 60);
const seg = (t: number) => (t - V0) / 60;
export const DUR_LIBRETO = w(34.11) + 150;

// ---------- la hoja (coordenadas locales: 0,0 arriba a la izquierda) ----------
const HW = 820, HH = 1160;
const wy = (ly: number) => ly - HH / 2;          // local → mundo

type Seg = [string, boolean?];
const LIN: Record<string, { y: number; segs: Seg[] }> = {
  l1: { y: 172, segs: [["Hola, ¿cómo estás? "], ["Te llamo por la sesión", true]] },
  l2: { y: 216, segs: [["que agendaste el martes."]] },
  l3: { y: 346, segs: [["Contame, "], ["¿qué te llevó a pedir la llamada?", true]] },
  l4: { y: 474, segs: [["El programa son "], ["12 semanas", true], [", con seguimiento."]] },
  o1: { y: 640, segs: [["→ Entiendo. "], ["¿Caro comparado con qué?", true]] },
  o2: { y: 750, segs: [["→ Perfecto. "], ["¿Qué es lo que te frena?", true]] },
  o3: { y: 860, segs: [["→ ¿Qué creés que te va a preguntar?"]] },
};
const PAUSA = new Set(["l2", "l3"]);
const PREG = [{ y: 600, txt: "1.  «Es caro.»" }, { y: 710, txt: "2.  «Lo tengo que pensar.»" }, { y: 820, txt: "3.  «Lo hablo con mi socio.»" }];
const SECC = [{ y: 120, txt: "01 · APERTURA" }, { y: 298, txt: "02 · DESCUBRIMIENTO" }, { y: 426, txt: "03 · PROPUESTA" }, { y: 556, txt: "04 · OBJECIONES" }];

// el teleprompter: siete renglones a ritmo de metrónomo, siempre igual
const ORDEN = ["l1", "l2", "l3", "l4", "o1", "o2", "o3"];
const LEE0 = 0.1, LEE = 0.72, FIN_LEE = w(11.95);
const leido = (t: number, id: string) => {
  const j = ORDEN.indexOf(id);
  return Math.min(1, Math.max(0, (seg(t) - LEE0 - LEE * j) / LEE));
};
const cursor = (t: number) => {
  const s = seg(t) - LEE0;
  if (s < 0 || t > FIN_LEE) return null;
  const n = Math.floor(s / LEE);
  return { i: n % 7, p: (s - n * LEE) / LEE, n };
};

// los rounds: se tacha lo impreso y se escribe a mano lo dicho
const RONDAS = [
  { en: w(22.3), id: "l1", mano: "Vi que agendaste. ¿Qué te movió a hacerlo?", x: 70, dy: -40 },
  { en: w(24.6), id: "l3", mano: "¿Qué cambió para que hoy sí quieras hablar?", x: 70, dy: -40 },
  { en: w(25.32), id: "o1", mano: "¿Caro contra qué? Contame.", x: 372, dy: -42 },
  { en: w(26.12), id: "o4", mano: "Un curso te explica. Acá lo hacés.", x: 92, dy: 0 },
];
const Q4 = w(24.0);
const NUEVA = w(23.68), CORTA = w(18.74), LIBRETO = w(20.22), RING = w(20.96);
const DECIS = w(27.56), LOGO = w(28.92);
const SE_NOTA = w(7.46), PIENSA = w(10.16);
// las copias aterrizan una tras otra; cada una es una lectura más (07 → 20)
const aterriza = (i: number) => w(14.2) + 22 + i * 3;
const lecturas = (t: number) => { let n = 0; for (let i = 0; i < 19; i++) if (t >= aterriza(i)) n++; return 7 + Math.round((n * 13) / 19); };
// el desgaste de tanto leerla: aparece con las lecturas y se lo lleva el corte
const desgaste = (t: number) => interpolate(t, [w(13.4), w(15.2), CORTA - 20, w(19.3)], [0, 1, 1, 0], { ...cl, easing: ease });

// ---------- cámara ----------
type Llave = [number, number, number, number];   // [t, x, y del objetivo, z]
const LLAVES: Llave[] = [
  [0, 0, -150, -1560],                         // la hoja entera bajo el foco
  [w(2.6), 0, -80, -1420],
  [w(5.2), 0, 0, -1280],
  [w(6.4), 30, 120, -1620],                     // retrocede: el otro lado
  [w(7.7), 0, 40, -1950],
  [w(9.6), 0, 40, -1800],
  [w(11.5), 0, 60, -1660],
  [w(12.6), -40, 40, -1750],                    // de vuelta a la hoja
  [w(14.6), 30, -40, -1420],                    // se apilan las lecturas
  [w(16.6), 50, 20, -1580],
  [w(18.0), 0, 0, -2100],
  [w(18.6), 0, 0, -2060],
  [w(20.3), 0, 0, -2250],
  [w(21.4), 0, wy(170), -1400],
  [w(22.3), 0, wy(180), -1060],                 // round 1
  [w(23.2), 0, wy(240), -1160],
  [w(23.9), 0, wy(330), -1500],                 // la objeción nueva
  [w(24.6), 0, wy(350), -1080],                 // round 2
  [w(25.32), 0, wy(630), -1090],                // round 3
  [w(26.12), 0, wy(950), -1100],                // round 4
  [w(27.2), 0, wy(700), -1500],
  [w(28.4), 0, 0, -2050],                       // lo decís: la hoja casi en blanco
  [w(29.4), 0, -560, -3200],                    // el logo
  [DUR_LIBRETO, 0, -580, -2900],
];
const TS = LLAVES.map((k) => k[0]);
const tangentes = (eje: number) => {
  const n = LLAVES.length, v = LLAVES.map((k) => k[eje]);
  const d = TS.slice(0, -1).map((t, i) => (v[i + 1] - v[i]) / (TS[i + 1] - t));
  const m = v.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = Math.hypot(a, b);
    if (h > 3) { m[i] = (3 * a * d[i]) / h; m[i + 1] = (3 * b * d[i]) / h; }
  }
  m[0] = 0; m[n - 1] = 0;
  return m;
};
const TAN = [1, 2, 3].map(tangentes);
const llave = (t: number) => {
  const tt = Math.min(TS[TS.length - 1], Math.max(0, t));
  let i = 0;
  while (i < LLAVES.length - 2 && tt > TS[i + 1]) i++;
  const h = TS[i + 1] - TS[i], u = (tt - TS[i]) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const eje = (e: number) => h00 * LLAVES[i][e] + h10 * h * TAN[e - 1][i] + h01 * LLAVES[i + 1][e] + h11 * h * TAN[e - 1][i + 1];
  return { x: eje(1), y: eje(2), z: eje(3) };
};
const golpe = (t: number, en: number, amp: number) => {
  const d = (t - en) / 60;
  if (d < 0) return 0;
  return amp * Math.exp(-d / 0.2) * Math.sin(d * 26);
};
const OFF = (t: number) => interpolate(t, [LOGO - 10, LOGO + 50], [230, 0], { ...cl, easing: ease });
const camara = (t: number): Cam => {
  const k = llave(t);
  let sy = golpe(t, SE_NOTA, 5) + golpe(t, CORTA, 11) + golpe(t, LIBRETO, 6) + golpe(t, DECIS + 17, 4) + golpe(t, LOGO, 3);
  RONDAS.forEach((r) => { sy += golpe(t, r.en, 3.5); });
  const sx = golpe(t, CORTA, 4) + golpe(t, LIBRETO, -3);
  const y = k.y - OFF(t) * (-k.z) / P + Math.sin(t / 75) * 6 + sy;
  const x = k.x + Math.sin(t / 95) * 10 + sx;
  const roll = (interpolate(t, [0, 90], [-3, 0], { ...cl, easing: ease }) + Math.sin(t / 120) * 0.4 + golpe(t, CORTA, 0.3)) * Math.PI / 180;
  const yaw = Math.sin(t / 130) * 1.0 * Math.PI / 180;
  const pitch = Math.sin(t / 140) * 0.8 * Math.PI / 180;
  return { x, y, z: k.z, roll, yaw, pitch };
};
const foco = (t: number) => interpolate(t,
  [w(5.6), w(6.6), w(11.7), w(12.3), w(18.4), w(18.7), w(20.6), w(21.2), w(23.5), w(23.8), w(24.3), w(24.7), LOGO, LOGO + 40],
  [0, -520, -520, 0, 0, -480, -480, 0, 0, -400, -400, 0, 0, -1300], { ...cl, easing: ease });

// ---------- piezas de la hoja ----------
const Renglon: React.FC<{ t: number; id: string; impreso: number }> = ({ t, id, impreso }) => {
  const L = LIN[id];
  const p = t < FIN_LEE + 600 ? leido(t, id) : 1;
  const c = cursor(t);
  const actual = c && ORDEN[c.i] === id ? c.p : -1;
  const r = RONDAS.find((x) => x.id === id);
  const tacha = r ? interpolate(t, [r.en, r.en + 10], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) }) : 0;
  const marca = (k: number) => interpolate(t, [w(1.94) + k * 4, w(1.94) + k * 4 + 16], [0, 1], { ...cl, easing: ease });
  const pausa = interpolate(t, [w(2.96) - 2, w(2.96) + 6, w(2.96) + 30], [0, 1, 0], cl);
  let km = 0;
  return (
    <div style={{ position: "absolute", left: 70, top: L.y, whiteSpace: "nowrap", fontFamily: TIGHT, fontWeight: 500, fontSize: 29, letterSpacing: "-0.012em", lineHeight: "36px", height: 36,
      opacity: impreso * (1 - 0.55 * tacha), display: "flex", alignItems: "center" }}>
      <span style={{ position: "relative", display: "inline-block" }}>
        <span style={{ color: GRIS_P }}>
          {L.segs.map(([txt, m], j) => {
            const v = m ? marca(km++) : 0;
            return <span key={j} style={m ? { background: "linear-gradient(transparent 52%, rgba(120,110,92,0.24) 52%, rgba(120,110,92,0.24) 92%, transparent 92%)",
              backgroundSize: `${v * 100}% 100%`, backgroundRepeat: "no-repeat" } : undefined}>{txt}</span>;
          })}
        </span>
        <span style={{ position: "absolute", left: 0, top: 0, color: INK, clipPath: `inset(-6px ${(1 - p) * 100}% -6px 0)` }}>
          {L.segs.map(([txt]) => txt).join("")}
        </span>
        {actual >= 0 && (
          <span style={{ position: "absolute", left: `${actual * 100}%`, top: 1, width: 2.5, height: 34, background: INK, opacity: 0.85 }} />
        )}
        {tacha > 0 && <span style={{ position: "absolute", left: -6, top: 18, height: 2.5, width: `calc(${tacha * 100}% + 12px)`, background: "rgba(28,27,25,0.8)" }} />}
      </span>
      {PAUSA.has(id) && (
        <span style={{ marginLeft: 16, fontFamily: MONO, fontSize: 13, letterSpacing: "0.18em", color: INK, opacity: 0.55 + 0.45 * pausa, padding: "3px 9px",
          border: "1px solid rgba(28,27,25,0.4)", borderRadius: 4, transform: `scale(${1 + 0.14 * pausa})`, background: `rgba(28,27,25,${0.1 * pausa})` }}>‖ PAUSA</span>
      )}
    </div>
  );
};

// texto a mano en esmeralda, se escribe con un borde suave
const Mano: React.FC<{ t: number; en: number; txt: string; x: number; y: number; tam?: number; dur?: number }> = ({ t, en, txt, x, y, tam = 37, dur = 34 }) => {
  const p = interpolate(t, [en, en + dur], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  if (p <= 0) return null;
  const brillo = interpolate(t, [en, en + dur, en + dur + 50], [0.6, 0.6, 0.18], cl);
  const borde = `linear-gradient(90deg, #000 ${p * 104 - 6}%, transparent ${p * 104}%)`;
  return (
    <div style={{ position: "absolute", left: x, top: y, whiteSpace: "nowrap", fontFamily: SERIF_IT, fontStyle: "italic", fontSize: tam, lineHeight: 1.1, color: TINTA_V,
      letterSpacing: "-0.01em", transform: "rotate(-1.2deg)", transformOrigin: "0 50%", WebkitMaskImage: borde, maskImage: borde,
      textShadow: `0 0 18px rgba(16,185,129,${brillo})` }}>{txt}</div>
  );
};

const Hoja: React.FC<{ t: number }> = ({ t }) => {
  const impreso = interpolate(t, [DECIS - 4, DECIS + 40], [1, 0.06], { ...cl, easing: ease });
  const c = cursor(t);
  const bandaY = c ? LIN[ORDEN[c.i]].y : LIN.o3.y;
  const bandaOp = interpolate(t, [w(LEE0) - 6, w(LEE0) + 6, FIN_LEE - 10, FIN_LEE], [0, 1, 1, 0], cl);
  const lect = lecturas(t);
  const dg = desgaste(t);
  const memo = (k: number) => rebote(t, w(4.84) + k * 5, 12, 200);
  const vEm = interpolate(t, [RING, w(22.2)], [0, 1], { ...cl, easing: ease });
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 6, overflow: "hidden",
      background: "linear-gradient(172deg, #f1ede5 0%, #e7e2d8 60%, #ddd7cb 100%)",
      boxShadow: `0 70px 140px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08), 0 0 ${120 * vEm}px rgba(16,185,129,${0.18 * vEm})` }}>
      {/* banda del teleprompter */}
      <div style={{ position: "absolute", left: 30, right: 30, top: bandaY - 7, height: 50, borderRadius: 6, background: "rgba(28,27,25,0.06)", opacity: bandaOp }} />
      <div style={{ position: "absolute", left: 38, top: bandaY + 9, width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: `12px solid ${INK}`, opacity: bandaOp * 0.8 }} />

      {/* membrete */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 46, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 17, letterSpacing: "0.26em", color: INK, opacity: impreso }}>
        <span>GUION DE LLAMADA</span><span style={{ opacity: 0.6 }}>LECTURA Nº {String(lect).padStart(2, "0")}</span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 80, height: 1.5, background: INK, opacity: 0.7 * impreso }} />
      {SECC.map((s) => (
        <div key={s.y} style={{ position: "absolute", left: 70, top: s.y, fontFamily: MONO, fontSize: 14, letterSpacing: "0.28em", color: INK, opacity: 0.5 * impreso }}>{s.txt}</div>
      ))}
      {PREG.map((q, k) => (
        <div key={q.y} style={{ position: "absolute", left: 70, top: q.y, display: "flex", alignItems: "center", gap: 18, opacity: impreso }}>
          <span style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 26, color: INK, letterSpacing: "-0.01em" }}>{q.txt}</span>
          {t > w(4.84) + k * 5 - 1 && (
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.2em", color: INK, opacity: 0.6, padding: "2px 8px", border: "1px solid rgba(28,27,25,0.35)", borderRadius: 3,
              transform: `scale(${0.6 + 0.4 * memo(k)})`, display: "inline-block" }}>✓ DE MEMORIA</span>
          )}
        </div>
      ))}
      {/* la cuarta objeción no está en el guion */}
      <div style={{ position: "absolute", left: 70, top: 930, display: "flex", alignItems: "flex-end", gap: 14, opacity: impreso }}>
        <span style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 26, color: INK }}>4.</span>
        <span style={{ width: 600, borderBottom: "2px dotted rgba(28,27,25,0.35)", marginBottom: 7 }} />
      </div>
      <div style={{ position: "absolute", left: 92, top: 1012, width: 640, borderBottom: "2px dotted rgba(28,27,25,0.25)", opacity: impreso }} />
      {Object.keys(LIN).map((id) => <Renglon key={id} t={t} id={id} impreso={impreso} />)}

      {/* sello */}
      <div style={{ position: "absolute", left: 70, top: 1072, padding: "8px 14px", border: "2px solid rgba(28,27,25,0.55)", borderRadius: 4, transform: "rotate(-2.5deg)",
        fontFamily: MONO, fontSize: 15, letterSpacing: "0.22em", color: "rgba(28,27,25,0.7)", opacity: impreso }}>REGLA Nº 1: NO SALIRSE DEL GUION</div>

      {/* lo escrito a mano */}
      <Mano t={t} en={Q4} txt="«¿Y esto en qué se diferencia de un curso?»" x={112} y={918} tam={33} />
      {RONDAS.map((r, i) => {
        const y = r.id === "o4" ? 970 : LIN[r.id].y + r.dy;
        const b = rebote(t, r.en, 12, 190);
        return (
          <React.Fragment key={i}>
            <Mano t={t} en={r.en + 6} txt={r.mano} x={r.x} y={y} />
            {t >= r.en - 1 && (
              <div style={{ position: "absolute", left: 14, top: (r.id === "o4" ? 970 : LIN[r.id].y) - 4, width: 44, height: 44, borderRadius: 22, border: `1.5px solid ${TINTA_V}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 13, letterSpacing: "0.05em", color: TINTA_V,
                transform: `scale(${0.4 + 0.6 * b})`, boxShadow: `0 0 ${24 * interpolate(t, [r.en, r.en + 40], [1, 0.25], cl)}px rgba(16,185,129,0.6)`, background: "rgba(16,185,129,0.08)" }}>R{i + 1}</div>
            )}
          </React.Fragment>
        );
      })}
      {dg > 0.001 && <Desgaste t={t} dg={dg} lect={lect} />}
      {/* luz del foco sobre el papel */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 50% 35%, transparent 45%, rgba(20,18,15,0.32))" }} />
    </div>
  );
};

// de tanto leerla: lápiz que subraya lo mismo una y otra vez, palotes por lectura y la hoja doblada
const SUB = [
  { y: 172 + 33, x: 300, w: 330, r: -0.6 }, { y: 346 + 33, x: 190, w: 420, r: 0.5 }, { y: 474 + 33, x: 300, w: 160, r: -0.8 },
  { y: 640 + 33, x: 250, w: 330, r: 0.4 }, { y: 750 + 33, x: 245, w: 330, r: -0.5 }, { y: 216 + 33, x: 70, w: 340, r: 0.7 },
  { y: 860 + 33, x: 120, w: 440, r: -0.4 }, { y: 172 + 38, x: 310, w: 300, r: 0.9 }, { y: 346 + 38, x: 200, w: 380, r: -0.7 },
];
const Desgaste: React.FC<{ t: number; dg: number; lect: number }> = ({ t, dg, lect }) => {
  const extra = lect - 7;                                     // 0 → 13 lecturas nuevas
  return (
    <div style={{ position: "absolute", inset: 0, opacity: dg, pointerEvents: "none" }}>
      {/* pliegues: la hoja doblada en tres de tanto llevarla */}
      {[387, 773].map((y) => (
        <div key={y} style={{ position: "absolute", left: 0, right: 0, top: y - 30, height: 60,
          background: "linear-gradient(180deg, transparent, rgba(40,36,30,0.07) 46%, rgba(255,255,255,0.22) 50%, rgba(40,36,30,0.1) 54%, transparent)" }} />
      ))}
      {/* subrayados de lápiz, uno más por lectura */}
      {SUB.map((u, i) => {
        const p = interpolate(extra, [i * 1.3, i * 1.3 + 1.2], [0, 1], cl);
        if (p <= 0) return null;
        return <div key={i} style={{ position: "absolute", left: u.x, top: u.y, width: u.w * p, height: 3, borderRadius: 2, background: "rgba(48,46,42,0.5)", transform: `rotate(${u.r}deg)` }} />;
      })}
      {/* palotes de lectura en el margen: de a cinco, con la tachada */}
      <div style={{ position: "absolute", right: 66, top: 112, display: "flex", gap: 16, opacity: 0.75 }}>
        {Array.from({ length: Math.ceil(lect / 5) }, (_, g) => {
          const n = Math.min(5, lect - g * 5);
          return (
            <div key={g} style={{ position: "relative", width: 38, height: 40 }}>
              {Array.from({ length: Math.min(4, n) }, (_, j) => (
                <div key={j} style={{ position: "absolute", left: 4 + j * 9, top: 2, width: 2.4, height: 36, background: "#3a3833", transform: `rotate(${(j % 2 ? 2 : -3)}deg)` }} />
              ))}
              {n === 5 && <div style={{ position: "absolute", left: -2, top: 18, width: 44, height: 2.4, background: "#3a3833", transform: "rotate(-24deg)" }} />}
            </div>
          );
        })}
      </div>
      {/* la hoja se amarillenta y se gasta en los bordes */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(120,98,60,0.22))", mixBlendMode: "multiply" }} />
    </div>
  );
};

// una copia más del mismo guion: solo papel y renglones
const Copia: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 6, overflow: "hidden", background: "linear-gradient(172deg, #e9e5dc, #d6d0c4)", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
    <div style={{ position: "absolute", left: 70, right: 70, top: 80, height: 1.5, background: "rgba(28,27,25,0.5)" }} />
    {[172, 216, 346, 474, 600, 640, 710, 750, 820, 860].map((y, i) => (
      <div key={y} style={{ position: "absolute", left: 70, top: y + 12, height: 12, width: 380 + ((i * 137) % 260), borderRadius: 3, background: "rgba(28,27,25,0.22)" }} />
    ))}
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 50% 35%, transparent 45%, rgba(20,18,15,0.35))" }} />
  </div>
);

// ---------- el otro lado ----------
const Vidrio: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "linear-gradient(160deg, rgba(36,36,40,0.9), rgba(16,16,18,0.94))",
    border: "1px solid rgba(255,255,255,0.11)", boxShadow: "0 40px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)", ...style }}>{children}</div>
);
const tick = (t: number) => {
  const s = seg(t) - LEE0;
  if (s < 0 || t > FIN_LEE) return 0;
  const d = s - Math.floor(s / (LEE / 2)) * (LEE / 2);
  return Math.exp(-d / 0.09);
};
const Llamada: React.FC<{ t: number }> = ({ t }) => {
  const s = Math.floor(252 + Math.max(0, seg(t)));
  return (
    <Vidrio>
      <div style={{ position: "absolute", left: 32, top: 32, width: 92, height: 92, borderRadius: 46, background: "linear-gradient(160deg, #3f3f46, #27272a)", border: "1px solid rgba(255,255,255,0.14)",
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TIGHT, fontWeight: 600, fontSize: 36, color: "#d4d4d8", letterSpacing: "-0.02em" }}>MG</div>
      <div style={{ position: "absolute", left: 150, top: 38, fontFamily: TIGHT, fontWeight: 600, fontSize: 40, color: "#f4f4f5", letterSpacing: "-0.03em" }}>Martín G.</div>
      <div style={{ position: "absolute", left: 150, top: 94, fontFamily: MONO, fontSize: 16, letterSpacing: "0.26em", color: "rgba(161,161,170,0.8)" }}>PROSPECTO · ESCUCHANDO</div>
      <div style={{ position: "absolute", right: 34, top: 44, display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 20, letterSpacing: "0.12em", color: "#d4d4d8" }}>
        <span style={{ width: 9, height: 9, borderRadius: 5, background: "#e4e4e7", opacity: 0.5 + 0.5 * Math.abs(Math.sin(t / 22)) }} />
        {String(Math.floor(s / 60)).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}
      </div>
    </Vidrio>
  );
};
// lo que escucha: barras idénticas que laten con el metrónomo
const VozPlana: React.FC<{ t: number; gris: number }> = ({ t, gris }) => {
  const k = tick(t), N = 34;
  return (
    <Vidrio>
      <div style={{ position: "absolute", left: 34, right: 34, top: 28, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 15, letterSpacing: "0.26em", color: "rgba(161,161,170,0.75)" }}>
        <span>LO QUE ESCUCHA</span><span>MISMO TONO · MISMO RITMO</span>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 70, bottom: 30, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {Array.from({ length: N }, (_, i) => (
          <div key={i} style={{ width: 8, height: 22 + 60 * k * (0.75 + 0.25 * gris), borderRadius: 4, background: `rgba(212,212,216,${0.35 + 0.4 * k})` }} />
        ))}
      </div>
    </Vidrio>
  );
};
const Piensa: React.FC<{ t: number }> = ({ t }) => {
  const txt = "esto lo está leyendo.";
  const n = Math.round(interpolate(t, [PIENSA, w(11.1)], [0, txt.length], cl));
  const car = t - PIENSA < 70 || Math.floor(t / 16) % 2 === 0;
  return (
    <Vidrio style={{ borderRadius: 30 }}>
      <div style={{ position: "absolute", left: 40, top: 34, fontFamily: MONO, fontSize: 15, letterSpacing: "0.3em", color: "rgba(161,161,170,0.75)" }}>LO QUE PIENSA MARTÍN</div>
      <div style={{ position: "absolute", left: 40, top: 80, display: "flex", gap: 10, opacity: interpolate(t, [PIENSA - 4, PIENSA + 4], [1, 0], cl) }}>
        {[0, 1, 2].map((i) => <span key={i} style={{ width: 12, height: 12, borderRadius: 6, background: "#a1a1aa", opacity: 0.35 + 0.65 * Math.abs(Math.sin(t / 12 - i * 0.7)) }} />)}
      </div>
      <div style={{ position: "absolute", left: 40, top: 66, fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 76, color: "#e4e4e7", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        «{txt.slice(0, n)}{n < txt.length ? "" : "»"}
        <span style={{ display: "inline-block", width: 3, height: 62, marginLeft: 6, background: "#d4d4d8", opacity: car && t > PIENSA ? 0.8 : 0, verticalAlign: "-6px" }} />
      </div>
    </Vidrio>
  );
};
// el closer que te corta
const Corte: React.FC<{ t: number; txt: string; rotulo: string; en: number; chip?: string }> = ({ t, txt, rotulo, en, chip }) => (
  <Vidrio>
    <div style={{ position: "absolute", left: 32, top: 30, width: 84, height: 84, borderRadius: 42, overflow: "hidden", border: "1px solid rgba(255,255,255,0.16)", background: "#18181b" }}>
      <Img src={staticFile("ring-closers/boxers/counter.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <div style={{ position: "absolute", left: 140, top: 40, fontFamily: TIGHT, fontWeight: 600, fontSize: 32, color: "#f4f4f5", letterSpacing: "-0.03em" }}>Vera R.</div>
    <div style={{ position: "absolute", left: 140, top: 84, fontFamily: MONO, fontSize: 14, letterSpacing: "0.26em", color: "rgba(161,161,170,0.8)" }}>{rotulo}</div>
    {chip && (
      <div style={{ position: "absolute", right: 30, top: 42, fontFamily: MONO, fontSize: 13, letterSpacing: "0.22em", color: "#6ee7b7", padding: "6px 12px", borderRadius: 20,
        border: "1px solid rgba(52,211,153,0.55)", background: "rgba(16,185,129,0.1)", transform: `scale(${0.7 + 0.3 * rebote(t, en + 8, 12, 200)})` }}>{chip}</div>
    )}
    <div style={{ position: "absolute", left: 34, right: 34, top: 140, fontFamily: TIGHT, fontWeight: 600, fontSize: 40, color: "#f4f4f5", letterSpacing: "-0.035em", lineHeight: 1.12 }}>{txt}</div>
  </Vidrio>
);

// ---------- la voz que vuelve a ser tuya ----------
const nivel = (f: number) => {
  const i = Math.round(f - V0);
  let s = 0, n = 0;
  for (let k = -2; k <= 2; k++) { const v = (ENV as number[])[i + k]; if (v !== undefined) { s += v; n++; } }
  return n ? s / n : 0;
};
const Onda: React.FC<{ f: number }> = ({ f }) => {
  const op = interpolate(f, [DECIS - 10, DECIS + 20, LOGO - 6, LOGO + 16], [0, 1, 1, 0], cl);
  if (op <= 0) return null;
  const A = 10 + 70 * nivel(f);
  const N = 140, W = 760;
  const pts: string[] = [];
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const ventana = Math.sin(Math.PI * u) ** 1.6;
    const y = A * ventana * Math.sin(k * 0.34 - f * 0.22) * (0.6 + 0.4 * Math.sin(k * 0.09 + f * 0.05));
    pts.push(`${(u * W).toFixed(1)},${(60 + y).toFixed(1)}`);
  }
  return (
    <div style={{ position: "absolute", left: (1080 - W) / 2, top: 1640, width: W, height: 120, opacity: op }}>
      <svg width={W} height={120} style={{ overflow: "visible", filter: "drop-shadow(0 0 10px rgba(16,185,129,0.8))" }}>
        <line x1={0} y1={60} x2={W} y2={60} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        <polyline points={pts.join(" ")} fill="none" stroke="#34d399" strokeOpacity={0.95} strokeWidth={2.4} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 128, right: 0, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 15, letterSpacing: "0.3em", color: "rgba(167,243,208,0.75)" }}>
        <span>TU VOZ EN LA LLAMADA</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#34d399", boxShadow: "0 0 10px #34d399" }} />TUYA
        </span>
      </div>
    </div>
  );
};

// ---------- texto ----------
const Palabra: React.FC<{ t: number; en: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, en, children, style }) => {
  const r = rebote(t, en, 13, 160);
  const vis = interpolate(t, [en - 1, en + 7], [0, 1], cl);
  return <span style={{ display: "inline-block", opacity: vis, transform: `translateY(${(1 - r) * 40}px) scale(${0.95 + 0.05 * r})`, filter: `blur(${(1 - vis) * 14}px)`, ...style }}>{children}</span>;
};
const italica: React.CSSProperties = { fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: "1.19em", letterSpacing: "-0.02em" };
const acento = (t: number, en: number): React.CSSProperties => ({ ...italica, color: VERDE,
  textShadow: `0 0 40px rgba(16,185,129,${0.45 * interpolate(t, [en, en + 30], [1, 0.4], cl)})` });
type Pal = { p: string; s: number; ac?: boolean; it?: boolean };
const Frase: React.FC<{ t: number; renglones: Pal[][]; hasta: number; tam?: number }> = ({ t, renglones, hasta, tam = 100 }) => {
  const primera = w(renglones[0][0].s);
  const op = interpolate(t, [w(hasta) - 2, w(hasta) + 8], [1, 0], cl);
  if (t < primera - 30 || op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 230 + Math.sin(t / 80) * 5, opacity: op, filter: op < 1 ? `blur(${(1 - op) * 18}px)` : undefined, transform: `translateX(${Math.sin(t / 110) * 7}px)` }}>
      <div style={{ textAlign: "center", color: "#f4f4f5", fontFamily: TIGHT, fontWeight: 600, fontSize: tam, letterSpacing: "-0.045em", lineHeight: 1.05 }}>
        {renglones.map((r, i) => (
          <div key={i}>{r.map((pal, j) => (
            <React.Fragment key={j}>{j > 0 && " "}<Palabra t={t} en={w(pal.s) - 2} style={pal.ac ? acento(t, w(pal.s)) : pal.it ? italica : undefined}>{pal.p}</Palabra></React.Fragment>
          ))}</div>
        ))}
      </div>
    </div>
  );
};
const pal = (txt: string, ...s: number[]): Pal[] => txt.split(" ").map((p, i) => ({ p: p.replace(/[*_]/g, ""), s: s[i], ac: p.startsWith("*"), it: p.startsWith("_") }));

const FRASES: { r: Pal[][]; hasta: number; tam?: number }[] = [
  { r: [pal("Te lo sabés", 0, 0.08, 0.22), pal("de _memoria.", 0.5, 0.74)], hasta: 1.64, tam: 120 },
  { r: [pal("Cada frase,", 1.7, 1.94), pal("cada _pausa,", 2.8, 2.96)], hasta: 3.86, tam: 116 },
  { r: [pal("la respuesta", 3.92, 4.06), pal("a cada _objeción.", 4.38, 4.72, 4.84)], hasta: 5.62, tam: 104 },
  { r: [pal("Y aun así,", 5.68, 5.82, 5.92), pal("del otro lado", 6.54, 6.68, 6.9), pal("se _nota.", 7.22, 7.46)], hasta: 8.2, tam: 104 },
  { r: [pal("El prospecto", 8.26, 8.34), pal("no escucha", 8.78, 8.86), pal("lo que _decís.", 9.28, 9.38, 9.48)], hasta: 10.1, tam: 100 },
  { r: [pal("Un guion", 12.04, 12.18), pal("no se vuelve tuyo", 12.38, 12.6, 12.76, 13.16), pal("leyéndolo", 13.6), pal("veinte _veces.", 14.38, 14.74)], hasta: 15.46, tam: 96 },
  { r: [pal("Se vuelve tuyo", 15.52, 15.64, 15.88), pal("_diciéndolo,", 16.74)], hasta: 17.64, tam: 112 },
  { r: [pal("contra alguien", 17.7, 18.16), pal("que te _corta", 18.42, 18.6, 18.74), pal("y no sigue tu libreto.", 19.32, 19.42, 19.62, 20.02, 20.22)], hasta: 20.9, tam: 92 },
  { r: [pal("En Ring Closers", 20.96, 21.1, 21.34), pal("hacés *roleplay", 22.3, 22.64), pal("con otros closers.", 23.14, 23.38, 23.68)], hasta: 24.54, tam: 100 },
  { r: [pal("Round", 24.6), pal("tras _round.", 25.02, 25.32)], hasta: 25.7, tam: 124 },
  { r: [pal("Hasta que ya no", 25.76, 26.12, 26.26, 26.4), pal("lo _recitás:", 26.52, 26.64)], hasta: 27.5, tam: 104 },
  { r: [pal("lo *decís.", 27.56, 27.84)], hasta: 28.84, tam: 150 },
];

// ---------- la escena ----------
const Escena: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camara(t), fz: foco(t) };
  // la hoja se gasta: del otro lado se nota y se apaga
  const gris = interpolate(t, [w(6.9), SE_NOTA + 6, w(11.8), w(12.6)], [0, 1, 1, 0.55], { ...cl, easing: ease })
    * interpolate(t, [RING, w(22.0)], [1, 0], { ...cl, easing: ease });
  const esmeralda = interpolate(t, [RING, w(26)], [0, 1], { ...cl, easing: ease });
  const finHoja = interpolate(t, [LOGO, LOGO + 50], [1, 0], cl);
  // el otro lado
  const ent = (a: number) => interpolate(t, [a, a + 40], [0, 1], { ...cl, easing: ease });
  const sal = interpolate(t, [w(11.75), w(12.25)], [1, 0], { ...cl, easing: Easing.in(Easing.cubic) });
  const lado = (a: number) => ({ op: ent(a) * sal, z: -500 - 650 * (1 - ent(a)) + 420 * (1 - sal) });
  const cLl = lado(w(5.9)), cVoz = lado(w(6.35)), cPi = lado(w(9.9));
  // las copias
  const finCopias = interpolate(t, [RING - 10, w(21.6)], [1, 0], cl);
  // los cortes
  const corte = { op: interpolate(t, [CORTA - 14, CORTA - 4, w(20.7), w(21.1)], [0, 1, 1, 0], cl), r: rebote(t, CORTA - 10, 11, 200) };
  const nueva = { op: interpolate(t, [NUEVA - 10, NUEVA, w(24.2), w(24.5)], [0, 1, 1, 0], cl), r: rebote(t, NUEVA - 8, 11, 200) };
  return (
    <AbsoluteFill style={{ background: "#050506", overflow: "hidden" }}>
      {/* el foco sobre la hoja; resplandor esmeralda al aparecer los rounds */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at 50% 60%, rgba(235,228,214,${0.075 * (1 - 0.6 * gris)}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 45% at ${50 + Math.sin(t / 130) * 8}% ${62 + Math.sin(t / 90) * 4}%, rgba(16,185,129,${(0.14 + 0.04 * Math.sin(t / 50)) * esmeralda}), transparent 70%)` }} />

      {/* las veinte copias, detrás */}
      {finCopias > 0 && Array.from({ length: 19 }, (_, i) => {
        const a = aterriza(i) - 22;
        const v = interpolate(t, [a, a + 22], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
        if (v <= 0) return null;
        const lado2 = i % 2 ? 1 : -1;
        const vu = 1 - v;
        const vuela = t >= LIBRETO ? rebote(t, LIBRETO + (i % 5), 9, 120) : 0;
        const dx = Math.sin(i * 1.7) * 34 + lado2 * (70 + 14 * i) * vuela;
        const dy = Math.cos(i * 1.3) * 26 + (i % 3 - 1) * 40 * vuela;
        const rot = Math.sin(i * 2.3) * 3.2 + lado2 * (5 + i * 0.6) * vuela;
        return (
          <Capa key={i} k={k} x={dx + lado2 * (900 + 40 * (i % 4)) * vu} y={dy - (300 + 30 * (i % 3)) * vu} z={30 * (i + 1) - 420 * vu} w={HW} h={HH}
            rot={rot + lado2 * 24 * vu} op={v * v * finCopias * (1 - 0.03 * i)} dof={0.9}>
            <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) brightness(0.62)" }}><Copia /></div>
          </Capa>
        );
      })}

      {/* la hoja */}
      <Capa k={k} x={0} y={0} z={0} w={HW} h={HH} op={finHoja} dof={0.9} desenf={3 * gris * sal}>
        <div style={{ position: "absolute", inset: 0, filter: gris > 0.01 ? `grayscale(${gris}) brightness(${1 - 0.5 * gris})` : undefined }}>
          <Hoja t={t} />
        </div>
      </Capa>

      {/* ===== el contador de lecturas ===== */}
      {(() => {
        const op = interpolate(t, [w(13.5), w(13.9), CORTA - 24, CORTA - 6], [0, 1, 1, 0], cl);
        if (op <= 0) return null;
        const lect = lecturas(t);
        const ultimo = [...Array(19).keys()].map(aterriza).filter((a) => a <= t).pop() ?? -999;
        const pulso = Math.exp(-(t - ultimo) / 7);
        return (
          <Capa k={k} x={250} y={330} z={-330 + 200 * (1 - op)} w={330} h={150} op={op} dof={0.8} rot={1.5}>
            <Vidrio style={{ borderRadius: 24 }}>
              <div style={{ position: "absolute", left: 30, top: 26, fontFamily: MONO, fontSize: 15, letterSpacing: "0.3em", color: "rgba(161,161,170,0.8)" }}>LECTURA</div>
              <div style={{ position: "absolute", left: 28, top: 52, fontFamily: TIGHT, fontWeight: 600, fontSize: 72, letterSpacing: "-0.04em", color: "#f4f4f5", lineHeight: 1,
                transform: `scale(${1 + 0.06 * pulso})`, transformOrigin: "0 50%" }}>
                <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, fontSize: 44, color: "#a1a1aa", marginRight: 10 }}>Nº</span>{String(lect).padStart(2, "0")}
              </div>
            </Vidrio>
          </Capa>
        );
      })()}

      {/* ===== el otro lado ===== */}
      {cLl.op > 0 && <Capa k={k} x={0} y={-420} z={cLl.z} w={720} h={156} op={cLl.op} dof={0.8}><Llamada t={t} /></Capa>}
      {cVoz.op > 0 && <Capa k={k} x={0} y={-160} z={cVoz.z} w={720} h={210} op={cVoz.op} dof={0.8}><VozPlana t={t} gris={gris} /></Capa>}
      {cPi.op > 0 && <Capa k={k} x={0} y={120} z={-640 + 520 * (1 - ent(w(9.9))) + 420 * (1 - sal)} w={700} h={190} op={cPi.op} dof={0.8} rot={-1}><Piensa t={t} /></Capa>}

      {/* ===== los que te cortan ===== */}
      {corte.op > 0 && (
        <Capa k={k} x={0} y={-110} z={-480 - 380 * (1 - corte.r)} w={760} h={270} op={corte.op} rot={1.5 * (1 - corte.r)} dof={0.8}>
          <Corte t={t} en={CORTA} rotulo="CLOSER · TE CORTA" txt="—Pará, pará. ¿Y eso a mí en qué me cambia?" />
        </Capa>
      )}
      {nueva.op > 0 && (
        <Capa k={k} x={0} y={-280} z={-400 - 380 * (1 - nueva.r) + 380 * interpolate(t, [w(24.15), w(24.5)], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) })}
          w={700} h={270} op={nueva.op} rot={-1.2} dof={0.8}>
          <Corte t={t} en={NUEVA} rotulo="CLOSER · ROUND 1" chip="FUERA DEL GUION" txt="—¿Y esto en qué se diferencia de un curso?" />
        </Capa>
      )}

      {/* oscurece arriba para que se lea la frase */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,6,0.96) 0%, rgba(5,5,6,0.9) 26%, rgba(5,5,6,0.45) 35%, transparent 44%)" }} />

      {/* ===== frases ===== */}
      {FRASES.map((fr, i) => <Frase key={i} t={t} renglones={fr.r} hasta={fr.hasta} tam={fr.tam} />)}

      {/* ===== logo ===== */}
      {(() => {
        const op = interpolate(t, [LOGO - 6, LOGO + 8], [0, 1], cl);
        if (op <= 0) return null;
        const c1 = w(30.22), c2 = w(31.9);
        return (
          <Capa k={k} x={0} y={-590} z={-250} w={1060} h={820} esc={1.75} op={op} dof={0.3}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.55))", transform: `scale(${0.85 + 0.15 * rebote(t, LOGO, 12, 170)})` }}>
                <Logo size={260} dibujoEn={LOGO} />
              </div>
              <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: "0.4em", color: "rgba(167,243,208,0.85)", whiteSpace: "nowrap",
                opacity: interpolate(t, [LOGO + 6, LOGO + 22], [0, 1], cl), transform: `translateY(${interpolate(t, [LOGO + 6, LOGO + 26], [16, 0], { ...cl, easing: ease })}px)` }}>
                RING CLOSERS
              </div>
              <div style={{ marginTop: 44, fontFamily: TIGHT, fontWeight: 600, fontSize: 92, color: "#f4f4f5", letterSpacing: "-0.045em", lineHeight: 1.08, textAlign: "center", whiteSpace: "nowrap" }}>
                <div><Palabra t={t} en={c1}>Practicá</Palabra>{" "}<Palabra t={t} en={w(30.76)}>con</Palabra>{" "}<Palabra t={t} en={w(30.98)}>closers.</Palabra></div>
                <div><Palabra t={t} en={c2} style={acento(t, c2)}>Cerrá</Palabra>{" "}<Palabra t={t} en={w(32.36)} style={acento(t, w(32.36))}>con</Palabra>{" "}<Palabra t={t} en={w(32.58)} style={acento(t, w(32.58))}>clientes.</Palabra></div>
              </div>
            </div>
          </Capa>
        );
      })()}
    </AbsoluteFill>
  );
};

export const VideoLibreto: React.FC = () => {
  const f = useCurrentFrame();
  // obturador constante: siempre las mismas 6 submuestras
  const n = 6;
  return (
    <AbsoluteFill style={{ background: "#050506" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Escena t={f - 0.3 + (0.6 * i) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <Onda f={f} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="granoLibreto"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#granoLibreto)" /></svg>
      <AbsoluteFill style={{ background: "#050506", opacity: interpolate(f, [0, 8], [1, 0], cl) }} />
      <Sequence from={V0}><Audio src={staticFile("voz-libreto-rc/voz.mp3")} /></Sequence>
      <Audio src={staticFile("libreto-rc/sonido.wav")} />
    </AbsoluteFill>
  );
};
