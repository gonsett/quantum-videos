import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Logo } from "../reel-rc/logo";
import { DISPLAY, MONO, RC, SANS } from "../ring-closers/tema";
import {
  Brillo,
  Camara,
  Chispas,
  Firma,
  Fogonazo,
  Frase,
  ObjetoCae,
  Slam,
  Tramos,
  golpes,
  pop,
  type Pal,
} from "./dopamina";
import { L } from "./timeline";

/**
 * Video para closers de élite. Seis escenas, una por toma de voz, y cada una arranca en un
 * beat (120 BPM): el corte trae su propio golpe de cámara. Todo lo que aparece en pantalla
 * se pide por palabra con `L(escena, palabra)`: no hay cuadros escritos a mano.
 *
 * Objetos (ninguno es un cinturón, ninguno se usó antes en un video): guante de plata con
 * estrella, medalla de diez roleplays, marco de oro en llamas, guante turquesa y medalla
 * azul de un año.
 *
 * Anclas: las palabras cortas ("y", "te", "la") son las menos fiables del reconocedor; los
 * cortes y los golpes se anclan en la palabra fuerte que sigue.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Envuelve una escena: cámara con el golpe de arranque (cae en el beat) y los golpes propios. */
const Base: React.FC<{ extra?: number[]; children: React.ReactNode; flash?: boolean }> = ({ extra = [], children, flash = true }) => {
  const frame = useCurrentFrame();
  const g = golpes(frame, [0, ...extra]);
  return (
    <>
      <Camara g={g}>{children}</Camara>
      {flash ? <Fogonazo nivel={g.flash} /> : null}
    </>
  );
};

const Etiqueta: React.FC<{ texto: string; en: number; top: number }> = ({ texto, en, top }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 30,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: RC.platino500,
        opacity: interpolate(frame, [en, en + 6], [0, 1], clamp),
      }}
    >
      {texto}
    </div>
  );
};

// ── 1 · Gancho ───────────────────────────────────────────────────────────
// "¿Sos closer y tenés un nivel altísimo? Con más razón tenés que usar Ring Closers."

export const E1Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e1-gancho";
  const c = (p: string, v = 1) => L(ID, p, v);
  const cae = 6; // el objeto toca el piso en el cuadro 15: primer beat
  const toca = cae + 9;
  const enRing = c("Ring");
  const dim = interpolate(frame, [c("Con") - 5, c("Con") + 6], [1, 0.4], clamp);

  const s1: Pal[][] = [
    [
      { t: "¿Sos", en: c("Sos") },
      { t: "closer", en: c("closer") },
      { t: "y", en: c("y") },
      { t: "tenés", en: c("tenés", 1) },
    ],
    [
      { t: "un", en: c("un") },
      { t: "nivel", en: c("nivel") },
      { t: "altísimo?", en: c("altísimo"), acento: true, display: true, tam: 104 },
    ],
  ];
  const s2: Pal[][] = [
    [
      { t: "Con", en: c("Con") },
      { t: "más", en: c("más") },
      { t: "razón", en: c("razón") },
    ],
    [
      { t: "tenés", en: c("tenés", 2) },
      { t: "que", en: c("que") },
      { t: "usar", en: c("usar") },
    ],
    [
      { t: "Ring", en: enRing, display: true, tam: 118 },
      { t: "Closers.", en: c("Closers"), display: true, tam: 118, acento: true },
    ],
  ];

  return (
    <Base extra={[toca, enRing - 2]}>
      <Frase lineas={s1} top={340} tam={70} interlineado={1.34} opacidad={dim} />
      <Frase lineas={s2} top={592} tam={62} interlineado={1.3} />
      <ObjetoCae src="historias/counter-2x.png" ancho={600} x={540} y={1200} en={cae} caida={420} barridoEn={toca + 4} brillo="rgba(210,225,255,0.28)" />
      <Chispas x={540} y={1400} en={toca} semilla={11} dir={-90} abanico={200} />
      <Chispas x={410} y={1105} en={enRing - 2} semilla={23} dir={-90} abanico={260} n={18} vida={22} />
      <Brillo x={410} y={1105} en={enRing - 2} tam={240} />
    </Base>
  );
};

// ── 2 · Puente: el detalle ───────────────────────────────────────────────
// "Porque arriba, la diferencia está en el detalle."

export const E2Puente: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e2-puente";
  const c = (p: string, v = 1) => L(ID, p, v);
  const enDetalle = c("detalle");

  // Tarjeta de detalle (macro de la estrella del guante). La estrella está en (371, 419) de la imagen de 1024 px.
  const CARD = { x: 140, y: 800, w: 800, h: 640 };
  const S = 1420; // ancho al que se dibuja la imagen dentro de la tarjeta
  const estrella = { x: 0.3623 * S, y: 0.4092 * S };
  const entra = pop(frame, 4, 200, 16);
  const barrido = interpolate(frame, [c("diferencia") - 2, enDetalle + 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });

  const lineas: Pal[][] = [
    [
      { t: "Porque", en: c("Porque") },
      { t: "arriba,", en: c("arriba") },
    ],
    [
      { t: "la", en: c("la") },
      { t: "diferencia", en: c("diferencia") },
      { t: "está", en: c("está") },
    ],
    [
      { t: "en", en: c("en") },
      { t: "el", en: c("el") },
      { t: "detalle.", en: enDetalle, display: true, tam: 122, acento: true },
    ],
  ];

  const esquina = (pos: React.CSSProperties, b: React.CSSProperties) => (
    <div style={{ position: "absolute", width: 64, height: 64, borderColor: RC.esmeralda400, borderStyle: "solid", borderWidth: 0, ...b, ...pos }} />
  );

  return (
    <Base extra={[enDetalle - 2]}>
      <Frase lineas={lineas} top={352} tam={70} interlineado={1.34} />
      {/* macro */}
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 30,
          overflow: "hidden",
          backgroundColor: RC.tinta900,
          border: `1px solid ${RC.tinta700}`,
          opacity: Math.min(1, entra * 1.4),
          transform: `scale(${0.92 + 0.08 * Math.min(1, entra)})`,
        }}
      >
        <Img
          src={staticFile("historias/counter-2x.png")}
          style={{
            position: "absolute",
            width: S,
            height: S,
            maxWidth: "none",
            left: CARD.w / 2 - estrella.x + 66,
            top: CARD.h / 2 - estrella.y,
            transform: `scale(${1 + 0.05 * barrido})`,
            transformOrigin: `${estrella.x}px ${estrella.y}px`,
          }}
        />
        {/* línea de escaneo */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: barrido * CARD.h,
            height: 3,
            backgroundColor: RC.esmeralda400,
            opacity: barrido > 0 && barrido < 1 ? 0.9 : 0,
            boxShadow: "0 0 24px rgba(52,211,153,0.9)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>
      {/* marco de visor */}
      {esquina({ left: CARD.x - 14, top: CARD.y - 14 }, { borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 14 })}
      {esquina({ left: CARD.x + CARD.w - 50, top: CARD.y - 14 }, { borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 14 })}
      {esquina({ left: CARD.x - 14, top: CARD.y + CARD.h - 50 }, { borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 14 })}
      {esquina({ left: CARD.x + CARD.w - 50, top: CARD.y + CARD.h - 50 }, { borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 14 })}
      <Brillo x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h / 2} en={enDetalle - 2} tam={340} />
    </Base>
  );
};

// ── 3 · Afilás ───────────────────────────────────────────────────────────
// "Uno: afilás. Roleplay con closers de tu altura, y con alguno mejor."

export const E3Afilas: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e3-afilas";
  const c = (p: string, v = 1) => L(ID, p, v);
  const enSlam = c("afilás") - 6;
  const cae = enSlam + 4;
  const toca = cae + 9;
  const enMejor = c("mejor");

  const lineas: Pal[][] = [
    [
      { t: "Roleplay", en: c("Roleplay") },
      { t: "con", en: c("con", 1) },
      { t: "closers", en: c("closers") },
    ],
    [
      { t: "de", en: c("de") },
      { t: "tu", en: c("tu") },
      { t: "altura,", en: c("altura") },
      { t: "y", en: c("y") },
      { t: "con", en: c("con", 2) },
      { t: "alguno", en: c("alguno") },
      { t: "mejor.", en: enMejor, acento: true },
    ],
  ];
  const pill = pop(frame, enMejor - 3, 220, 14);

  // Chispas de afilar: ráfagas cortas y seguidas desde el borde de la medalla
  const rafagas = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
    <Chispas key={i} x={738} y={1375} en={toca + 4 + i * 5} semilla={31 + i} dir={205} abanico={70} n={14} vida={16} fuerza={0.8} />
  ));

  return (
    <Base extra={[toca, enMejor - 2]}>
      <Tramos activo={0} en={2} />
      <Etiqueta texto="Uno" en={enSlam - 2} top={372} />
      <Slam texto="Afilás" en={enSlam} top={418} tam={236} color={RC.esmeralda400} brillo />
      <Frase lineas={lineas} top={716} tam={46} interlineado={1.34} color={RC.platino300} />
      <ObjetoCae src="ring-closers/trophies/ten_roleplays.webp" ancho={540} x={540} y={1150} en={cae} caida={300} barridoEn={toca + 3} brillo="rgba(220,225,235,0.25)" />
      {rafagas}
      {/* "▲ mejor" */}
      <div
        style={{
          position: "absolute",
          top: 1436,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(frame, [enMejor - 3, enMejor], [0, 1], clamp),
          transform: `scale(${0.6 + 0.4 * pill})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 30px",
            border: `2px solid ${RC.esmeralda500}`,
            borderRadius: 999,
            boxShadow: "0 0 26px rgba(16,185,129,0.3)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24">
            <path d="M12 20V6M12 6l-6 6M12 6l6 6" fill="none" stroke={RC.esmeralda400} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: "0.14em", color: RC.crema }}>ALGUIEN MEJOR</span>
        </div>
      </div>
      <Firma en={6} />
    </Base>
  );
};

// ── 4 · Te conocen ───────────────────────────────────────────────────────
// "Dos: te conocen. Tu lugar en el ranking es público."

const FILAS_INICIO = [
  { n: "Otro closer", p: 1180, yo: false },
  { n: "Otro closer", p: 1020, yo: false },
  { n: "Otro closer", p: 860, yo: false },
  { n: "Tu boxeador", p: 640, yo: true },
];

const Ranking: React.FC<{ en: number; sube: number }> = ({ en, sube }) => {
  const frame = useCurrentFrame();
  const PASO = 78;
  const t = interpolate(frame, [sube, sube + 18], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", left: 140, top: 1180, width: 800, height: PASO * 4 }}>
      {FILAS_INICIO.map((f, i) => {
        const inicio = i;
        const fin = f.yo ? 0 : i + 1;
        const pos = inicio + (fin - inicio) * t;
        const puesto = Math.round(pos) + 1;
        const pts = f.yo ? Math.round(640 + (1240 - 640) * t) : f.p;
        const entra = interpolate(frame, [en + i * 3, en + i * 3 + 8], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: pos * PASO,
              width: 800,
              height: 68,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "0 28px",
              boxSizing: "border-box",
              backgroundColor: RC.tinta900,
              border: `1px solid ${f.yo && t > 0.05 ? RC.esmeralda500 : RC.tinta700}`,
              borderRadius: 18,
              opacity: entra,
              boxShadow: f.yo && t > 0.05 ? "0 0 26px rgba(16,185,129,0.35)" : undefined,
              zIndex: f.yo ? 2 : 1,
            }}
          >
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: RC.platino500, width: 58 }}>#{puesto}</span>
            <span
              style={{
                flex: 1,
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 32,
                textTransform: "uppercase",
                color: f.yo ? RC.crema : RC.platino300,
              }}
            >
              {f.n}
            </span>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: f.yo ? RC.crema : RC.platino500 }}>
              {pts.toLocaleString("es-UY")} pts
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const E4Conocen: React.FC = () => {
  const ID = "e4-conocen";
  const c = (p: string, v = 1) => L(ID, p, v);
  const enSlam = c("conocen") - 8;
  const cae = enSlam + 5;
  const toca = cae + 9;
  const sube = c("ranking") - 2;

  const lineas: Pal[][] = [
    [
      { t: "Tu", en: c("Tu") },
      { t: "lugar", en: c("lugar") },
      { t: "en", en: c("en") },
      { t: "el", en: c("el") },
      { t: "ranking", en: c("ranking") },
      { t: "es", en: c("es") },
      { t: "público.", en: c("público"), acento: true },
    ],
  ];
  return (
    <Base extra={[toca, sube + 2]}>
      <Tramos activo={1} en={2} />
      <Etiqueta texto="Dos" en={enSlam - 2} top={372} />
      <Slam texto="Te conocen" en={enSlam} top={418} tam={172} color={RC.esmeralda400} brillo />
      <Frase lineas={lineas} top={640} tam={44} interlineado={1.34} color={RC.platino300} />
      <ObjetoCae src="ring-closers/shop/marco-oro.webp" ancho={420} x={540} y={956} en={cae} caida={260} barridoEn={toca + 3} brillo="rgba(255,150,30,0.35)" sombra={false} />
      <div style={{ position: "absolute", left: 540 - 56, top: 956 - 56 }}>
        <Logo size={112} />
      </div>
      <Chispas x={540} y={1150} en={toca} semilla={41} dir={-90} abanico={220} n={22} />
      <Ranking en={c("lugar")} sube={sube} />
      <Firma en={6} />
    </Base>
  );
};

// ── 5 · Te buscan ────────────────────────────────────────────────────────
// "Tres: te buscan. Los directores comerciales recorren ese ranking, y si les interesás, te mandan una propuesta."

const Ficha: React.FC<{ x: number; src: string; nombre: string; rango: string; pts: string; centro?: boolean; en: number; luz?: number }> = ({
  x,
  src,
  nombre,
  rango,
  pts,
  centro,
  en,
  luz = 0,
}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, en, 220, 15);
  const foco = centro ? luz : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 140,
        top: 880,
        width: 280,
        height: 400,
        borderRadius: 26,
        backgroundColor: RC.tinta900,
        border: `${centro && foco > 0.3 ? 2 : 1}px solid ${centro && foco > 0.3 ? RC.esmeralda500 : RC.tinta700}`,
        boxShadow: centro ? `0 0 ${50 * foco}px rgba(16,185,129,${0.45 * foco})` : undefined,
        opacity: Math.min(1, p * 1.5) * (centro ? 1 : 0.62 + 0.0 * foco),
        transform: `translateY(${(1 - Math.min(p, 1)) * 40}px) scale(${(0.8 + 0.2 * p) * (1 + 0.05 * foco)})`,
        overflow: "hidden",
      }}
    >
      <Img src={staticFile(src)} style={{ position: "absolute", left: 40, top: 22, width: 200, height: 200, maxWidth: "none", objectFit: "contain" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 242, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, textTransform: "uppercase", color: centro ? RC.crema : RC.platino300 }}>
        {nombre}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 296, textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 25, letterSpacing: "0.16em", textTransform: "uppercase", color: RC.platino500 }}>
        {rango}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 342, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 28, color: centro ? RC.esmeralda400 : RC.platino500 }}>
        {pts}
      </div>
    </div>
  );
};

const Propuesta: React.FC<{ x: number; en: number; empresa: string }> = ({ x, en, empresa }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, en, 200, 12);
  const pulso = interpolate(frame, [en + 4, en + 20], [0, 1], clamp);
  if (frame < en) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 1320,
        width: 430,
        height: 150,
        boxSizing: "border-box",
        borderRadius: 24,
        backgroundColor: RC.tinta900,
        border: `1px solid ${RC.tinta700}`,
        padding: "20px 26px",
        opacity: Math.min(1, p * 2),
        transform: `translateY(${(1 - Math.min(p, 1)) * -260}px) scale(${0.9 + 0.1 * p})`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* aviso: un punto que late en la esquina */}
      <div
        style={{
          position: "absolute",
          right: -8,
          top: -8,
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: RC.esmeralda500,
          boxShadow: `0 0 ${10 + 22 * (1 - pulso)}px rgba(16,185,129,${0.9 - 0.4 * pulso})`,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 23, letterSpacing: "0.2em", textTransform: "uppercase", color: RC.platino500 }}>Propuesta</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: RC.esmeralda400, border: `1px solid ${RC.esmeralda500}`, borderRadius: 999, padding: "3px 14px" }}>NUEVA</span>
      </div>
      <div style={{ marginTop: 14, fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, textTransform: "uppercase", color: RC.crema }}>Director comercial</div>
      <div style={{ marginTop: 2, fontFamily: SANS, fontWeight: 500, fontSize: 25, color: RC.platino500 }}>{empresa}</div>
    </div>
  );
};

export const E5Buscan: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e5-buscan";
  const c = (p: string, v = 1) => L(ID, p, v);
  const enSlam = c("buscan") - 8;
  const enFichas = c("directores") - 2;
  const enRecorren = c("recorren");
  const enInteresas = c("interesás");
  const enPropuesta = c("propuesta");
  const luz = interpolate(frame, [enInteresas - 6, enInteresas + 12], [0, 1], clamp);
  // el haz de luz recorre las fichas de izquierda a derecha y se queda en la del medio
  const haz = interpolate(frame, [enRecorren, enInteresas], [-0.25, 0.5], { ...clamp, easing: Easing.inOut(Easing.quad) });

  const lineas: Pal[][] = [
    [
      { t: "Los", en: c("Los") },
      { t: "directores", en: c("directores") },
      { t: "comerciales", en: c("comerciales") },
    ],
    [
      { t: "recorren", en: enRecorren },
      { t: "ese", en: c("ese") },
      { t: "ranking,", en: c("ranking") },
    ],
    [
      { t: "y", en: c("y") },
      { t: "si", en: c("si") },
      { t: "les", en: c("les") },
      { t: "interesás,", en: enInteresas, acento: true },
    ],
    [
      { t: "te", en: c("te", 2) },
      { t: "mandan", en: c("mandan") },
      { t: "una", en: c("una") },
      { t: "propuesta.", en: enPropuesta, acento: true },
    ],
  ];

  return (
    <Base extra={[enPropuesta - 3, enPropuesta + 5]}>
      <Tramos activo={2} en={2} />
      <Etiqueta texto="Tres" en={enSlam - 2} top={372} />
      <Slam texto="Te buscan" en={enSlam} top={418} tam={186} color={RC.esmeralda400} brillo />
      <Frase lineas={lineas} top={640} tam={40} interlineado={1.3} color={RC.platino300} />
      <Ficha x={236} src="historias/southpaw-2x.png" nombre="Otro closer" rango="Contendiente" pts="1.020 pts" en={enFichas} luz={luz} />
      <Ficha x={540} src="historias/legend-2x.png" nombre="Tu boxeador" rango="Campeón" pts="1.240 pts" en={enFichas + 3} centro luz={luz} />
      <Ficha x={844} src="historias/guard_classic-2x.png" nombre="Otro closer" rango="Campeón" pts="1.180 pts" en={enFichas + 6} luz={luz} />
      {/* haz de luz de búsqueda */}
      <div
        style={{
          position: "absolute",
          left: 540 + (haz - 0.5) * 1080 - 150,
          top: 870,
          width: 300,
          height: 420,
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(210,255,235,0.16) 50%, rgba(255,255,255,0) 100%)",
          mixBlendMode: "screen",
          opacity: interpolate(frame, [enRecorren - 4, enRecorren + 2], [0, 1], clamp) * (1 - luz * 0.6),
        }}
      />
      <Propuesta x={90} en={enPropuesta - 2} empresa="Empresa A" />
      <Propuesta x={560} en={enPropuesta + 8} empresa="Empresa B" />
      <Firma en={6} />
    </Base>
  );
};

// ── 6 · Cierre ───────────────────────────────────────────────────────────
// "Vos entrená. Que te busquen, sin mover un dedo."

export const E6Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e6-cierre";
  const c = (p: string, v = 1) => L(ID, p, v);
  const enVos = c("Vos") - 5;
  const enQue = c("Que") - 5;
  const enSin = c("sin") - 5;
  const enDedo = c("dedo");
  const cae = enQue;
  const toca = cae + 9;
  const rayos = frame * 0.35;
  const cta = pop(frame, enDedo + 4, 200, 14);

  return (
    <Base extra={[toca, enDedo - 2]}>
      <Slam texto="Vos entrená." en={enVos} top={372} tam={146} />
      <Slam texto="Que te busquen," en={enQue} top={560} tam={116} color={RC.esmeralda400} brillo />
      <Slam texto="Sin mover un dedo." en={enSin} top={708} tam={92} />
      {/* rayos de luz detrás de la medalla */}
      <div
        style={{
          position: "absolute",
          left: 540 - 420,
          top: 1160 - 420,
          width: 840,
          height: 840,
          borderRadius: "50%",
          background: `conic-gradient(from ${rayos}deg, rgba(52,211,153,0.0), rgba(52,211,153,0.22), rgba(52,211,153,0.0) 12%, rgba(52,211,153,0.0) 25%, rgba(52,211,153,0.2) 37%, rgba(52,211,153,0.0) 50%, rgba(52,211,153,0.0) 62%, rgba(52,211,153,0.22) 75%, rgba(52,211,153,0.0) 87%)`,
          WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 70%)",
          maskImage: "radial-gradient(circle, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 70%)",
          opacity: interpolate(frame, [toca, toca + 14], [0, 1], clamp),
        }}
      />
      <ObjetoCae src="ring-closers/trophies/tenure_1y.webp" ancho={520} x={540} y={1150} en={cae} caida={300} barridoEn={toca + 3} brillo="rgba(90,140,255,0.4)" />
      <Chispas x={540} y={1300} en={toca} semilla={57} dir={-90} abanico={240} n={30} />
      <Brillo x={540} y={1090} en={enDedo - 2} tam={300} />
      <div
        style={{
          position: "absolute",
          top: 1424,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(frame, [enDedo + 2, enDedo + 8], [0, 1], clamp),
          transform: `scale(${0.7 + 0.3 * cta})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 40px",
            border: `2px solid ${RC.esmeralda500}`,
            borderRadius: 999,
            boxShadow: "0 0 30px rgba(16,185,129,0.3)",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24">
            <path d="M12 20V5M12 5l-6 6M12 5l6 6" fill="none" stroke={RC.esmeralda400} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: "0.14em", color: RC.crema }}>LINK EN LA BIO</span>
        </div>
      </div>
      <Firma en={6} />
    </Base>
  );
};

