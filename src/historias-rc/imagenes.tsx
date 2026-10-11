import { Logo } from "../reel-rc/logo";
import { Img, staticFile } from "remotion";
import { DISPLAY, MONO, RC } from "../ring-closers/tema";
import { Apoyo, Etiqueta, Foto, Handle, Lienzo, Titular } from "./base";
import { MAPA_BARRIL } from "./mapa-lente";

/**
 * Destacada "Qué es Ring Closers": imágenes fijas, una por composición.
 * Cada una lleva un objeto distinto del catálogo (ver la tabla "Objetos ya
 * usados" de la habilidad video-cinematico-ring-closers) y frases que no se
 * usaron en ningún video. Se exportan con `remotion still --frame=60`.
 */

const pie = (s: string) => (
  <span style={{ color: RC.crema, fontWeight: 700 }}>{s}</span>
);

// ── 1 · Qué es ───────────────────────────────────────────────────────────

/**
 * Apertura liviana (pedido de Javier: "más light, que lo llamativo llegue después"):
 * la marca, el nombre y la definición, sin fuego ni objetos. Lo espectacular
 * queda para las imágenes que siguen.
 */
export const H1QueEs: React.FC = () => (
  <Lienzo>
    <Etiqueta top={300}>Qué es</Etiqueta>
    <div style={{ position: "absolute", top: 500, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Logo size={210} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 770,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: DISPLAY,
        fontWeight: 700,
        textTransform: "uppercase",
        lineHeight: 1.04,
        letterSpacing: "0.02em",
      }}
    >
      <div style={{ fontSize: 150, color: RC.crema }}>Ring</div>
      <div style={{ fontSize: 150, color: RC.esmeralda400, textShadow: "0 0 30px rgba(16,185,129,0.35)" }}>Closers</div>
    </div>
    <Apoyo top={1140} size={54}>
      Roleplay entre closers, con {pie("rival, fecha y marcador.")}
    </Apoyo>
    <Handle />
  </Lienzo>
);

// ── 2 · Tres rivales por semana ──────────────────────────────────────────

/** Una tarjeta por rival: cada guante en su casilla, sin que uno tape al otro. */
const TarjetaRival: React.FC<{
  x: number;
  nivel: string;
  verbo: string;
  barras: number;
  src: string;
  cuando: string;
  rotar?: number;
}> = ({ x, nivel, verbo, barras, src, cuando, rotar = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 840,
      width: 290,
      height: 580,
      backgroundColor: RC.tinta900,
      border: `1px solid ${RC.tinta700}`,
      borderRadius: 26,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        marginTop: 30,
        textAlign: "center",
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: RC.platino500,
      }}
    >
      {nivel}
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: i <= barras ? RC.esmeralda500 : RC.tinta700 }} />
      ))}
    </div>
    <Img
      src={staticFile(src)}
      style={{ position: "absolute", left: 9, top: 126, width: 272, height: 272, objectFit: "contain", rotate: `${rotar}deg` }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 412, textAlign: "center" }}>
      <span
        style={{
          display: "inline-block",
          padding: "8px 20px",
          border: `1px solid ${RC.tinta700}`,
          borderRadius: 999,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "0.06em",
          color: RC.platino300,
        }}
      >
        {cuando}
      </span>
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 40,
        textAlign: "center",
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: 52,
        textTransform: "uppercase",
        color: RC.crema,
      }}
    >
      {verbo}
    </div>
  </div>
);

export const H2Rivales: React.FC = () => (
  <Lienzo>
    <Etiqueta top={290}>Cómo funciona</Etiqueta>
    <Titular lineas={["Cada semana,", "tres rivales."]} size={134} top={366} acento={1} />
    <Apoyo top={682} size={42}>
      Cada uno cae en un día y horario distinto, según los horarios que cargues.
    </Apoyo>
    <TarjetaRival x={80} nivel="Menor nivel" verbo="Enseñás" barras={1} src="historias/southpaw-2x.png" cuando="MAR 19:00" rotar={-4} />
    <TarjetaRival x={395} nivel="Tu nivel" verbo="Te medís" barras={2} src="historias/guard_classic-2x.png" cuando="JUE 20:30" />
    <TarjetaRival x={710} nivel="Mayor nivel" verbo="Aprendés" barras={3} src="historias/knockout-2x.png" cuando="SÁB 11:00" rotar={4} />
    <Handle />
  </Lienzo>
);

// ── 3 · El roleplay, por videollamada ────────────────────────────────────

const RUTA_ESTRELLA = "M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

const Estrella: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 0 14px rgba(212,212,216,0.35))" }}>
    <path d={RUTA_ESTRELLA} fill={RC.platino300} stroke={RC.crema} strokeWidth="0.8" strokeLinejoin="round" />
  </svg>
);

export const H3Videollamada: React.FC = () => (
  <Lienzo>
    <Etiqueta top={290}>Cómo funciona</Etiqueta>
    <Titular lineas={["Tu roleplay,", "por Zoom o Meet."]} size={112} top={366} acento={1} />
    <Apoyo top={632} size={42}>
      La app agenda y te recuerda. Al terminar, tu rival te califica de 1 a 5.
    </Apoyo>
    <Foto src="ring-closers/shop/puno-leyenda.webp" ancho={640} x={540} y={1085} brillo="rgba(255,200,80,0.3)" />
    <div style={{ position: "absolute", top: 1420, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Estrella key={i} size={92} />
      ))}
    </div>
    <Handle />
  </Lienzo>
);

// ── 4 · Rangos y cinturones ──────────────────────────────────────────────

const RANGOS = [
  { id: "leyenda", nombre: "Leyenda", desde: "1.500" },
  { id: "campeon", nombre: "Campeón", desde: "700" },
  { id: "contendiente", nombre: "Contendiente", desde: "300" },
  { id: "prospecto", nombre: "Prospecto", desde: "100" },
  { id: "aficionado", nombre: "Aficionado", desde: "0" },
];

export const H4Rangos: React.FC = () => (
  <Lienzo>
    <Etiqueta top={290}>Cómo funciona</Etiqueta>
    <Titular lineas={["Cinco rangos,", "cinco cinturones."]} size={104} top={366} acento={1} />
    <Apoyo top={614} size={40}>
      Cumplir tus roleplays suma puntos; los que faltás restan.
    </Apoyo>
    {RANGOS.map((r, i) => {
      const y = 812 + i * 140;
      return (
        <div key={r.id}>
          <div
            style={{
              position: "absolute",
              left: 90,
              right: 90,
              top: y - 70,
              height: 1,
              backgroundColor: i === 0 ? "transparent" : "rgba(212,212,216,0.12)",
            }}
          />
          <Foto src={`historias/belt-${r.id}-2x.png`} ancho={300} x={260} y={y} sombra={false} />
          <div
            style={{
              position: "absolute",
              left: 470,
              top: y - 52,
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 56,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: i === 0 ? RC.esmeralda400 : RC.crema,
              textShadow: i === 0 ? "0 0 26px rgba(16,185,129,0.5)" : undefined,
            }}
          >
            {r.nombre}
          </div>
          <div style={{ position: "absolute", left: 472, top: y + 18, fontFamily: MONO, fontWeight: 500, fontSize: 28, color: RC.platino500 }}>
            desde {r.desde} pts
          </div>
        </div>
      );
    })}
    <Handle />
  </Lienzo>
);

// ── 5 · Colección ────────────────────────────────────────────────────────

const VITRINA = [
  { src: "trophies/streak_10.webp", nombre: "Racha de 10" },
  { src: "shop/cinturon-eterno.webp", nombre: "Cinturón eterno" },
  { src: "trophies/five_stars.webp", nombre: "Noqueaste" },
  { src: "shop/guardia-contendiente.webp", nombre: "Guardia contendiente" },
  { src: "trophies/cash_100k.webp", nombre: "Primeros $100.000" },
  { src: "shop/marco-bronce.webp", nombre: "Marco de bronce" },
];

export const H5Coleccion: React.FC = () => (
  <Lienzo>
    <Etiqueta top={290}>Cómo funciona</Etiqueta>
    <Titular lineas={["Todo lo que", "ganás se ve."]} size={132} top={366} acento={1} />
    <Apoyo top={686} size={42}>
      Trofeos por logros, guantes, marcos y cinturones para tu perfil.
    </Apoyo>
    {VITRINA.map((v, i) => {
      const col = i % 3;
      const fila = Math.floor(i / 3);
      const x = 195 + col * 345;
      const y = 950 + fila * 340;
      return (
        <div key={v.src}>
          <Foto src={`ring-closers/${v.src}`} ancho={290} x={x} y={y} sombra={false} />
          <div
            style={{
              position: "absolute",
              left: x - 170,
              top: y + 146,
              width: 340,
              textAlign: "center",
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 25,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: RC.platino500,
            }}
          >
            {v.nombre}
          </div>
        </div>
      );
    })}
    <Handle />
  </Lienzo>
);

// ── 6 · Ranking público ──────────────────────────────────────────────────

const FILAS = [
  { n: "Otro closer", p: "1.640", yo: false },
  { n: "Tu boxeador", p: "812", yo: true },
  { n: "Otro closer", p: "795", yo: false },
];

/**
 * La tabla con medidas fijas (encabezado 84 px, filas de 88 px) para que la lupa
 * apunte a un punto exacto: el mismo componente se dibuja dos veces, una a tamaño
 * normal y otra agrandada, y esa segunda es lo que se ve a través del lente.
 */
const TablaRanking: React.FC = () => (
  <div
    style={{
      width: 900,
      backgroundColor: RC.tinta900,
      border: `1px solid ${RC.tinta700}`,
      borderRadius: 26,
      overflow: "hidden",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        height: 84,
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 36px",
        backgroundColor: RC.tinta800,
        borderBottom: `1px solid ${RC.tinta700}`,
      }}
    >
      <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", color: RC.platino500 }}>
        Ranking
      </span>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: RC.platino300 }}>PÚBLICO</span>
    </div>
    {FILAS.map((f, i) => (
      <div
        key={i}
        style={{
          position: "relative",
          height: 88,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 34px",
          borderBottom: i < FILAS.length - 1 ? "1px solid rgba(212,212,216,0.24)" : "none",
        }}
      >
        {f.yo ? (
          <div style={{ position: "absolute", left: 0, top: 16, bottom: 16, width: 5, borderRadius: 3, backgroundColor: RC.esmeralda500 }} />
        ) : null}
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: RC.platino500, width: 54 }}>#{i + 1}</span>
        <span
          style={{
            flex: 1,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 38,
            textTransform: "uppercase",
            color: f.yo ? RC.crema : RC.platino300,
          }}
        >
          {f.n}
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: f.yo ? RC.crema : RC.platino500, opacity: f.yo ? 1 : 0.55 }}>{f.p} pts</span>
      </div>
    ))}
  </div>
);

// Geometría de la lupa (magnifying-glass.webp, 1024 px): el vidrio es una elipse de
// centro (713, 241) y semiejes (183, 160) medidos sobre la imagen.
const TABLA = { left: 90, top: 872 };
// Punto de la tabla (coordenadas locales) que queda en el centro del lente: el "812" de tu fila
const FOCO = { x: 761, y: 84 + 88 + 44 };
const LUPA = { ancho: 600, cx: 713, cy: 241, rx: 178, ry: 156 };
const AUMENTO = 2.0;
const BARRIL = 0.5; // cuánto se comprime el borde del lente respecto del centro

export const H6Ranking: React.FC = () => {
  const k = LUPA.ancho / 1024;
  const rx = LUPA.rx * k;
  const ry = LUPA.ry * k;
  // el centro del lente cae justo sobre el foco de la tabla
  const lenteX = TABLA.left + FOCO.x;
  const lenteY = TABLA.top + FOCO.y;
  const imgX = lenteX - LUPA.cx * k + LUPA.ancho / 2;
  const imgY = lenteY - LUPA.cy * k + LUPA.ancho / 2;
  return (
    <Lienzo>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          {/* distorsión de barril: el centro agranda más que el borde, como un vidrio curvo */}
          <filter id="lente-barril" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feImage href={MAPA_BARRIL} x={0} y={0} width={2 * rx} height={2 * ry} preserveAspectRatio="none" result="mapa" />
            <feDisplacementMap in="SourceGraphic" in2="mapa" scale={2 * BARRIL * rx} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <Etiqueta top={290}>Cómo funciona</Etiqueta>
      <Titular lineas={["El ranking", "es público."]} size={132} top={366} acento={1} />
      <Apoyo top={686} size={40}>
        Los directores comerciales lo miran para encontrar closers. Podés cargar tu currículum y postularte a ofertas.
      </Apoyo>
      <div style={{ position: "absolute", left: TABLA.left, top: TABLA.top }}>
        <TablaRanking />
      </div>
      <Foto src="ring-closers/scout/magnifying-glass.webp" ancho={LUPA.ancho} x={imgX} y={imgY} brillo="rgba(255,200,120,0.25)" />
      {/* El lente: la misma tabla, agrandada y curvada, recortada al vidrio */}
      <div
        style={{
          position: "absolute",
          left: lenteX - rx,
          top: lenteY - ry,
          width: 2 * rx,
          height: 2 * ry,
          borderRadius: "50%",
          overflow: "hidden",
          backgroundColor: RC.tinta900,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: "url(#lente-barril) drop-shadow(1.6px 0 0 rgba(255,70,70,0.32)) drop-shadow(-1.6px 0 0 rgba(70,190,255,0.32))",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: rx - FOCO.x * AUMENTO,
              top: ry - FOCO.y * AUMENTO,
              width: 900,
              transform: `scale(${AUMENTO})`,
              transformOrigin: "0 0",
            }}
          >
            <TablaRanking />
          </div>
        </div>
        {/* vidrio: borde que se oscurece, brillo diagonal, calidez abajo y un tinte apenas azul */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.62) 100%), linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.07) 24%, rgba(255,255,255,0) 42%), linear-gradient(315deg, rgba(255,190,110,0.22) 0%, rgba(255,190,110,0) 30%), rgba(120,160,255,0.05)",
            boxShadow: "inset 0 0 0 2px rgba(255,210,140,0.16), inset 0 0 24px rgba(0,0,0,0.7)",
          }}
        />
      </div>
      <Handle />
    </Lienzo>
  );
};

// ── 7 · Entrar ───────────────────────────────────────────────────────────

export const H7Entrar: React.FC = () => (
  <Lienzo>
    <Etiqueta top={290}>Cómo entrar</Etiqueta>
    <Titular lineas={["Cargá tus horarios,", "el resto llega solo."]} size={92} top={366} acento={1} />
    <Apoyo top={606} size={42}>
      Elegís tu nivel y tu comunidad, y la app te propone rivales durante la semana.
    </Apoyo>
    <Foto src="ring-closers/shop/filo-obsidiana.webp" ancho={700} x={540} y={1040} brillo="rgba(220,50,50,0.28)" />
    <div style={{ position: "absolute", top: 1405, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "16px 40px",
          border: `2px solid ${RC.esmeralda500}`,
          borderRadius: 999,
          boxShadow: "0 0 30px rgba(16,185,129,0.25)",
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24">
          <path d="M12 20V5M12 5l-6 6M12 5l6 6" fill="none" stroke={RC.esmeralda400} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: "0.14em", color: RC.crema }}>LINK EN LA BIO</span>
      </div>
    </div>
    <Handle />
  </Lienzo>
);

// ── Portada de la destacada ──────────────────────────────────────────────

/**
 * Solo es el ícono redondo de la destacada (Instagram recorta un círculo del centro y
 * escribe "Qué es" debajo): la marca grande y limpia, reconocible a 110 px.
 */
export const HPortada: React.FC = () => (
  <Lienzo>
    <div
      style={{
        position: "absolute",
        left: 540 - 280,
        top: 960 - 280,
        width: 560,
        height: 560,
        borderRadius: "50%",
        border: `2px solid ${RC.tinta700}`,
        background: "radial-gradient(circle, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 65%)",
      }}
    />
    <div style={{ position: "absolute", left: 540 - 180, top: 960 - 180 }}>
      <Logo size={360} />
    </div>
  </Lienzo>
);
