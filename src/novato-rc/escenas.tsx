import React from "react";
import { Img, staticFile } from "remotion";
import { AMBAR, Aro, Chip, DISPLAY, Linea, MONO, Onda, RC, SANS, Sube, TINTA, resorte, suave, tramo } from "./base";
import { L } from "./timeline";

/**
 * Seis escenas, una por toma de voz. Cada una recibe `f`: el cuadro LOCAL (0 = el beat en que
 * arranca la escena; negativo mientras la cámara todavía está subiendo hacia ella).
 * Las coordenadas son del cuadro de 1080x1920; lo importante vive entre y=280 y y=1500.
 */
type P = { f: number };
const EM = RC.esmeralda400;

const boxeadores = {
  vos: { src: "historias/guard_classic-2x.png", bbox: [216, 39, 830, 972] },
  otro: { src: "historias/southpaw-2x.png", bbox: [180, 41, 804, 978] },
};

/** Boxeador dentro de un círculo (avatar de la llamada y de la tarjeta de pelea). */
const Avatar: React.FC<{ f: number; x: number; y: number; d: number; who: "vos" | "otro"; en: number; ring: string; glow?: number; etiqueta?: string }> = ({
  f, x, y, d, who, en, ring, glow = 0, etiqueta,
}) => {
  const { src, bbox } = boxeadores[who];
  const esc = (d * 0.86) / (bbox[3] - bbox[1]);
  const lado = 1024 * esc;
  const k = resorte(f, en, 150, 15);
  if (f < en - 1) return null;
  return (
    <>
      <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2 + (1 - k) * 50, width: d, height: d, opacity: tramo(f, en, en + 6), transform: `scale(${0.86 + 0.14 * Math.min(k, 1.05)})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: "radial-gradient(circle at 50% 38%, #1c1d22, #0c0d10)" }}>
          <Img src={staticFile(src)} style={{ position: "absolute", left: d / 2 - ((bbox[0] + bbox[2]) / 2) * esc, top: d / 2 - ((bbox[1] + bbox[3]) / 2) * esc + d * 0.02, width: lado, height: lado, maxWidth: "none" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `${4}px solid ${ring}`, boxShadow: `0 0 ${16 + 44 * glow}px ${ring}` }} />
      </div>
      {etiqueta && (
        <div style={{ position: "absolute", left: x - 200, width: 400, top: y + d / 2 + 16, textAlign: "center", opacity: tramo(f, en + 4, en + 12), fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: RC.platino500 }}>
          {etiqueta}
        </div>
      )}
    </>
  );
};

// ── 1 · El gancho (ámbar: el cuero crudo del que recién empieza) ───────────────

export const E1: React.FC<P> = ({ f }) => {
  const c = (p: string, v = 1) => L("e1-gancho", p, v);
  const enEsto = c("Escuchá");
  const pil = resorte(f, enEsto - 2, 200, 15);
  return (
    <>
      <Linea f={f} top={290} tam={56} peso={600} color={RC.platino300} esp="0.06em"
        toks={[{ t: "Si", en: c("Si") }, { t: "sos", en: c("sos") }, { t: "un", en: c("un") }, { t: "closer", en: c("closer") }]} />
      <Linea f={f} top={364} tam={220} toks={[{ t: "novato", en: c("novato"), hl: true }]} />
      <Linea f={f} top={632} tam={60} toks={[{ t: "que", en: c("que") }, { t: "recién", en: c("recién") }, { t: "comienza,", en: c("comienza") }]} />
      <Linea f={f} top={728} tam={60} toks={[{ t: "y", en: c("y") }, { t: "no", en: c("no") }, { t: "sabés", en: c("sabés") }, { t: "cómo", en: c("cómo"), hl: true }]} />
      <Linea f={f} top={812} tam={60} toks={[{ t: "o", en: c("o") }, { t: "con quién", en: c("con"), hl: true }, { t: "practicar.", en: c("practicar") }]} />
      <Aro f={f} x={540} y={1145} r={228} en={12} color="rgba(245,165,36,0.6)" />
      <Sube f={f} src="ring-closers/shop/cuero-crudo.webp" bbox={[218, 85, 795, 937]} x={540} y={1145} alto={410} en={3} dist={300} />
      <Onda f={f} en={c("novato")} x={540} y={496} color={AMBAR} />
      <Onda f={f} en={c("cómo")} x={470} y={778} color={AMBAR} r={300} />
      <Onda f={f} en={c("quién")} x={540} y={862} color={AMBAR} r={340} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1395, display: "flex", justifyContent: "center", opacity: tramo(f, enEsto - 2, enEsto + 6), transform: `scale(${0.7 + 0.3 * Math.min(pil, 1.06)})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 40px 14px 30px", borderRadius: 999, border: `2px solid ${AMBAR}`, background: "rgba(245,165,36,0.1)", fontFamily: DISPLAY, fontWeight: 600, fontSize: 38, lineHeight: 1.2, letterSpacing: "0.16em", textTransform: "uppercase", color: RC.crema }}>
          <svg width="30" height="30" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={AMBAR} /></svg>
          Escuchá esto
        </div>
      </div>
      <Onda f={f} en={c("esto")} x={540} y={1435} color={AMBAR} r={380} />
    </>
  );
};

// ── 2 · Cómo: una llamada de práctica (ámbar) ─────────────────────────────────

export const E2: React.FC<P> = ({ f }) => {
  const c = (p: string, v = 1) => L("e2-como", p, v);
  const enLlamada = c("llamada");
  const enOtro = c("otro");
  const hablaVos = tramo(f, enLlamada, enLlamada + 12) * (1 - tramo(f, enOtro - 2, enOtro + 6) * 0.35);
  const hablaOtro = tramo(f, enOtro + 4, enOtro + 16);
  const bars = Array.from({ length: 23 }, (_, i) => {
    const forma = Math.abs(Math.sin(f * 0.42 + i * 0.8) * Math.cos(f * 0.17 + i * 0.31));
    const lado = i < 11 ? hablaVos : i > 11 ? hablaOtro : Math.max(hablaVos, hablaOtro);
    const alt = 8 + 100 * forma * (0.12 + 0.88 * lado);
    return { alt, color: i > 11 ? RC.crema : AMBAR };
  });
  const seg = Math.max(0, Math.floor((f - c("Roleplay")) / 30));
  const pulso = 0.6 + 0.4 * Math.sin(f / 5);
  return (
    <>
      <Chip f={f} en={c("Cómo")} top={300} texto="Cómo" color={AMBAR} />
      <Linea f={f} top={372} tam={200} toks={[{ t: "roleplay", en: c("Roleplay"), hl: true }]} />
      <Linea f={f} top={650} tam={44} fuente={SANS} mayus={false} color={RC.platino300} lh={1.3}
        toks={[{ t: "Una", en: c("Una") }, { t: "llamada", en: c("llamada") }, { t: "de", en: c("de", 1) }, { t: "venta", en: c("venta") }, { t: "de", en: c("de", 2) }, { t: "práctica,", en: c("práctica") }]} />
      <Linea f={f} top={712} tam={44} fuente={SANS} mayus={false} color={RC.platino300} lh={1.3}
        toks={[{ t: "con", en: c("con") }, { t: "otro", en: c("otro") }, { t: "closer", en: c("closer") }, { t: "real.", en: c("real") }]} />
      {/* la llamada */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: tramo(f, 30, 40), fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: "0.12em", color: RC.platino300 }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: AMBAR, opacity: pulso }} />
        EN LLAMADA · 00:{String(seg).padStart(2, "0")}
      </div>
      <Avatar f={f} x={225} y={1165} d={280} who="vos" en={34} ring={AMBAR} glow={hablaVos} etiqueta="Vos" />
      <Avatar f={f} x={855} y={1165} d={280} who="otro" en={enOtro} ring={RC.crema} glow={hablaOtro} etiqueta="Otro closer" />
      <div style={{ position: "absolute", left: 404, top: 1165 - 60, width: 272, height: 120, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: tramo(f, enLlamada, enLlamada + 8) }}>
        {bars.map((b, i) => (
          <span key={i} style={{ width: 7, height: b.alt, borderRadius: 4, backgroundColor: b.color }} />
        ))}
      </div>
      <Onda f={f} en={c("Roleplay")} x={540} y={492} color={AMBAR} />
      <Onda f={f} en={enOtro} x={855} y={1165} color={RC.crema} r={260} />
    </>
  );
};

// ── 3 · Con quién: Ring Closers te lo arma (esmeralda) ────────────────────────

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const ENCENDIDAS = [1, 3, 4, 8, 10, 12, 15, 17, 19, 20];

export const E3: React.FC<P> = ({ f }) => {
  const c = (p: string, v = 1) => L("e3-conquien", p, v);
  const nivel = c("nivel");
  const horarios = c("horarios");
  const enProp = c("te", 2);
  const sel = tramo(f, nivel - 8, nivel + 10, suave);
  const selX = 90 + 610 * (1 - sel);
  const etiqueta = { fuente: DISPLAY, peso: 500, tam: 30, color: RC.platino500, esp: "0.16em" };
  const card = tramo(f, enProp - 2, enProp + 14);
  const vs = resorte(f, c("rivales") - 4, 220, 13);
  return (
    <>
      <Chip f={f} en={c("Con")} top={300} texto="Con quién" color={EM} />
      <Linea f={f} top={366} tam={132} acento={EM} toks={[{ t: "Ring Closers", en: c("Ring"), hl: true }]} />
      <Linea f={f} top={536} tam={88} toks={[{ t: "te", en: c("te", 1) }, { t: "lo", en: c("lo") }, { t: "arma.", en: c("arma") }]} />
      <Onda f={f} en={c("Ring")} x={540} y={445} color={EM} />

      {/* A · el nivel */}
      <Linea f={f} top={700} tam={etiqueta.tam} fuente={etiqueta.fuente} peso={etiqueta.peso} color={etiqueta.color} esp={etiqueta.esp}
        toks={[{ t: "Elegís", en: c("Elegís") }, { t: "tu", en: c("tu") }, { t: "nivel", en: nivel }]} />
      <div style={{ position: "absolute", left: 90, top: 748, width: 900, height: 76, opacity: tramo(f, nivel - 14, nivel - 6) }}>
        <div style={{ position: "absolute", left: selX - 90, top: 0, width: 290, height: 76, borderRadius: 38, backgroundColor: EM }} />
        {["Principiante", "Intermedio", "Avanzado"].map((t, j) => {
          const activo = Math.abs(selX - (90 + 305 * j)) < 150;
          return (
            <div key={t} style={{ position: "absolute", left: j * 305, top: 0, width: 290, height: 76, borderRadius: 38, border: `1.5px solid ${RC.tinta700}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 30, lineHeight: 1.2, letterSpacing: "0.1em", textTransform: "uppercase", color: activo ? TINTA : RC.platino300 }}>
              {t}
            </div>
          );
        })}
      </div>

      {/* B · los horarios */}
      <Linea f={f} top={860} tam={etiqueta.tam} fuente={etiqueta.fuente} peso={etiqueta.peso} color={etiqueta.color} esp={etiqueta.esp}
        toks={[{ t: "Marcás", en: c("marcás") }, { t: "tus", en: c("tus") }, { t: "horarios", en: horarios }]} />
      <div style={{ position: "absolute", left: 91, top: 906, width: 898, height: 270, opacity: tramo(f, horarios - 12, horarios - 4) }}>
        {DIAS.map((d, i) => (
          <div key={d} style={{ position: "absolute", left: i * 130, top: 0, width: 118, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 24, color: RC.platino500 }}>{d}</div>
        ))}
        {Array.from({ length: 21 }, (_, n) => {
          const fila = Math.floor(n / 7);
          const col = n % 7;
          const idx = ENCENDIDAS.indexOf(n);
          const k = idx < 0 ? 0 : tramo(f, horarios + 6 + idx * 2, horarios + 14 + idx * 2);
          return (
            <div key={n} style={{ position: "absolute", left: col * 130, top: 44 + fila * 80, width: 118, height: 70, borderRadius: 14, border: `1px solid ${k > 0.05 ? EM : RC.tinta700}`, backgroundColor: `rgba(52,211,153,${0.9 * k})`, transform: `scale(${1 - 0.06 * Math.sin(Math.PI * k)})` }} />
          );
        })}
      </div>

      {/* C · los rivales */}
      <Linea f={f} top={1210} tam={etiqueta.tam} fuente={etiqueta.fuente} peso={etiqueta.peso} color={etiqueta.color} esp={etiqueta.esp}
        toks={[{ t: "Te", en: enProp }, { t: "propone", en: c("propone") }, { t: "rivales", en: c("rivales") }]} />
      <div style={{ position: "absolute", left: 90, top: 1256, width: 900, height: 196, borderRadius: 28, border: `1px solid ${RC.tinta700}`, backgroundColor: RC.tinta900, opacity: card, transform: `translateX(${(1 - card) * 140}px)` }}>
        <Avatar f={f + 0} x={190} y={98} d={128} who="vos" en={enProp + 4} ring={EM} />
        <Avatar f={f + 0} x={710} y={98} d={128} who="otro" en={enProp + 8} ring={RC.crema} />
        <div style={{ position: "absolute", left: 260, width: 380, top: 30, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, lineHeight: 1.1, color: EM, transform: `scale(${0.6 + 0.4 * Math.min(vs, 1.1)})`, opacity: tramo(f, c("rivales") - 4, c("rivales") + 2) }}>VS</div>
        <div style={{ position: "absolute", left: 260, width: 380, top: 122, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.08em", color: RC.platino300 }}>JUEVES · 19:00</div>
      </div>
    </>
  );
};

// ── 4 · De tu nivel, y también de los que saben más (esmeralda) ───────────────

const ESCALERA = [
  { src: "ring-closers/shop/cuero-crudo.webp", bbox: [218, 85, 795, 937], x: 150, base: 1470, alto: 233 },
  { src: "ring-closers/shop/filo-obsidiana.webp", bbox: [114, 51, 885, 980], x: 380, base: 1380, alto: 272 },
  { src: "ring-closers/shop/guardia-contendiente.webp", bbox: [133, 53, 864, 972], x: 615, base: 1290, alto: 287 },
  { src: "ring-closers/shop/puno-leyenda.webp", bbox: [92, 16, 914, 1008], x: 870, base: 1200, alto: 320 },
];

export const E4: React.FC<P> = ({ f }) => {
  const c = (p: string, v = 1) => L("e4-mas", p, v);
  const cues = [c("nivel"), c("también"), c("saben"), c("más")];
  const camino = tramo(f, c("Ahí"), c("rápido") + 6, suave);
  return (
    <>
      <Linea f={f} top={300} tam={120} toks={[{ t: "De", en: c("De", 1) }, { t: "tu", en: c("tu") }, { t: "nivel,", en: c("nivel") }]} />
      <Linea f={f} top={456} tam={50} peso={500} color={RC.platino300} acento={EM}
        toks={[{ t: "y", en: c("y") }, { t: "también", en: c("también") }, { t: "de", en: c("de", 2) }, { t: "los", en: c("los") }, { t: "que", en: c("que") }]} />
      <Linea f={f} top={524} tam={170} acento={EM} toks={[{ t: "saben más.", en: c("saben"), hl: true }]} />
      <Linea f={f} top={744} tam={40} fuente={SANS} mayus={false} color={RC.platino300}
        toks={[{ t: "Ahí", en: c("Ahí") }, { t: "se", en: c("se") }, { t: "aprende", en: c("aprende") }, { t: "rápido.", en: c("rápido") }]} />
      <Onda f={f} en={c("saben")} x={540} y={626} color={EM} />

      {/* el camino que sube */}
      <svg width={1080} height={700} style={{ position: "absolute", left: 0, top: 800 }}>
        <path d="M 150 400 C 240 380, 300 300, 380 270 S 540 200, 615 165 S 780 90, 870 42" fill="none" stroke={EM} strokeWidth={3} strokeLinecap="round" strokeDasharray="2 14" pathLength={100} style={{ strokeDashoffset: 100 * (1 - camino) }} opacity={0.6} />
      </svg>
      {ESCALERA.map((g, i) => (
        <Sube key={i} f={f} src={g.src} bbox={g.bbox} x={g.x} y={g.base - g.alto / 2} alto={g.alto} en={cues[i]} dist={200} fase={i} sombra={false} />
      ))}
      <Onda f={f} en={cues[3]} x={870} y={1040} color={EM} r={360} />
    </>
  );
};

// ── 5 · Todos los que están arriba hicieron su primer roleplay (esmeralda) ───

const FILAS = [
  { rango: "Leyenda", nombre: "Otro closer", pts: "1.520" },
  { rango: "Campeón", nombre: "Otro closer", pts: "740" },
  { rango: "Contendiente", nombre: "Otro closer", pts: "310" },
  { rango: "Prospecto", nombre: "Otro closer", pts: "120" },
  { rango: "Aficionado", nombre: "Vos", pts: "0", vos: true },
];

const Estrella: React.FC<{ color: string; k: number }> = ({ color, k }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" style={{ filter: k > 0.1 ? `drop-shadow(0 0 ${8 * k}px ${color})` : undefined, transform: `scale(${1 + 0.35 * Math.sin(Math.PI * Math.min(1, k))})` }}>
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill={k > 0.5 ? color : "none"} stroke={k > 0.1 ? color : "rgba(130,135,145,0.55)"} strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const E5: React.FC<P> = ({ f }) => {
  const c = (p: string, v = 1) => L("e5-primero", p, v);
  return (
    <>
      <Linea f={f} top={300} tam={52} peso={600} color={RC.platino300} acento={EM}
        toks={[{ t: "Todos", en: c("Todos") }, { t: "los", en: c("los") }, { t: "que", en: c("que") }, { t: "hoy", en: c("hoy") }, { t: "están", en: c("están") }]} />
      <Linea f={f} top={370} tam={200} acento={EM} toks={[{ t: "arriba", en: c("arriba"), hl: true }]} />
      <Linea f={f} top={622} tam={60} toks={[{ t: "en", en: c("en") }, { t: "el", en: c("el") }, { t: "ranking,", en: c("ranking") }]} />
      <Linea f={f} top={730} tam={52} peso={600} color={RC.platino300}
        toks={[{ t: "alguna", en: c("alguna") }, { t: "vez", en: c("vez") }, { t: "hicieron", en: c("hicieron") }]} />
      <Linea f={f} top={800} tam={92} acento={EM}
        toks={[{ t: "su", en: c("su") }, { t: "primer", en: c("primer"), hl: true }, { t: "roleplay.", en: c("roleplay") }]} />
      <Onda f={f} en={c("arriba")} x={540} y={490} color={EM} />
      {FILAS.map((r, i) => {
        const i0 = 4 - i;
        const en = c("ranking") + i0 * 5;
        const k = tramo(f, en, en + 12);
        const luz = tramo(f, c("roleplay") + 18 + i0 * 3, c("roleplay") + 26 + i0 * 3);
        const col = r.vos ? AMBAR : EM;
        return (
          <React.Fragment key={r.rango}>
            <div style={{ position: "absolute", left: 90, top: 966 + i * 102, width: 900, height: 88, borderRadius: 22, backgroundColor: RC.tinta900, border: `1.5px solid ${r.vos ? AMBAR : RC.tinta700}`, opacity: k, transform: `translateY(${(1 - k) * 44}px)`, display: "flex", alignItems: "center" }}>
              <span style={{ width: 300, paddingLeft: 30, fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: r.vos ? AMBAR : RC.platino300 }}>{r.rango}</span>
              <span style={{ flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: r.vos ? AMBAR : RC.crema }}>{r.nombre}</span>
              <span style={{ width: 170, textAlign: "right", fontFamily: MONO, fontWeight: 700, fontSize: 28, color: RC.platino300 }}>{r.pts} pts</span>
              <span style={{ width: 96, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Estrella color={col} k={luz} />
              </span>
            </div>
            <Onda f={f} en={c("roleplay") + 18 + i0 * 3} x={942} y={1010 + i * 102} color={col} r={90} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ── 6 · Hacé el tuyo (esmeralda + el trofeo "Primer combate") ─────────────────

export const E6: React.FC<P> = ({ f }) => {
  const c = (p: string, v = 1) => L("e6-cierre", p, v);
  const enAca = c("acá");
  const cta = resorte(f, enAca + 4, 190, 14);
  const late = 0.5 + 0.5 * Math.sin(f / 6);
  return (
    <>
      <Linea f={f} top={300} tam={132} acento={EM} toks={[{ t: "Hacé", en: c("Hacé") }, { t: "el", en: c("el") }, { t: "tuyo.", en: c("tuyo"), hl: true }]} />
      <Linea f={f} top={480} tam={52} fuente={SANS} mayus={false} color={RC.crema}
        toks={[{ t: "Tu", en: c("Tu") }, { t: "primer", en: c("primer"), color: EM }, { t: "combate", en: c("combate"), color: EM }, { t: "empieza", en: c("empieza") }, { t: "acá.", en: enAca }]} />
      <Onda f={f} en={c("tuyo")} x={700} y={392} color={EM} />
      <Aro f={f} x={540} y={935} r={330} en={c("combate") - 6} color="rgba(52,211,153,0.6)" />
      <Sube f={f} src="ring-closers/trophies/first_roleplay.webp" bbox={[116, 33, 886, 896]} x={540} y={935} alto={590} en={c("combate") - 2} dist={320} />
      <Onda f={f} en={enAca} x={540} y={935} color={EM} r={540} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center", opacity: tramo(f, enAca + 4, enAca + 12), transform: `scale(${0.7 + 0.3 * Math.min(cta, 1.06)})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 50px 20px 40px", borderRadius: 999, backgroundColor: RC.crema, color: TINTA, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, lineHeight: 1.2, letterSpacing: "0.14em", textTransform: "uppercase", boxShadow: `0 0 ${18 + 30 * late}px rgba(52,211,153,${0.25 + 0.25 * late})` }}>
          <svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 20V5M12 5l-6 6M12 5l6 6" fill="none" stroke={TINTA} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Link en la bio
        </div>
      </div>
    </>
  );
};
