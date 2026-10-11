import { Img, staticFile } from "remotion";
import { DISPLAY, MONO } from "../ring-closers/tema";
import { SANS } from "./como-funciona";

/**
 * Historias de Ring Setters sobre key art de GPT Image (1024x1536).
 * La foto va a 1080 de ancho (1620 de alto) centrada; arriba y abajo se completa con
 * la misma foto desenfocada y oscura (esa franja la tapa la interfaz de Instagram).
 * El texto de GPT se borró de la foto y se pone acá, más grande, en acabado metal.
 */
const AMBAR = "#F59E0B";
const FOTO_TOP = 150;
const escala = 1080 / 1024;

const Fondo: React.FC<{ src: string }> = ({ src }) => (
  <>
    <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover", filter: "blur(40px) brightness(0.1)", transform: "scale(1.1)" }} />
    <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: FOTO_TOP, width: 1080, height: 1536 * escala }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: FOTO_TOP - 2, height: 300, background: "linear-gradient(#070708, rgba(7,7,8,0))" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: FOTO_TOP + 1536 * escala - 260, height: 262, background: "linear-gradient(rgba(7,7,8,0), #070708)" }} />
  </>
);

const metal: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0) 1px 3px)," +
    "linear-gradient(180deg, #fbf3e6 0%, #d9d6d0 30%, #9c9c9b 50%, #6e6f71 56%, #c4c3c0 76%, #8c8c8b 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: "drop-shadow(0 -1px 0 rgba(245,158,11,0.45)) drop-shadow(0 3px 2px rgba(0,0,0,0.9)) drop-shadow(0 14px 28px rgba(0,0,0,0.75))",
};

const Texto: React.FC<{ top: number; kicker: string; titulo: string[]; bajada: string; size: number }> = ({ top, kicker, titulo, bajada, size }) => (
  <div style={{ position: "absolute", left: 76, top }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: MONO, fontSize: 28, letterSpacing: "0.3em", color: AMBAR, fontWeight: 700 }}>
      <div style={{ width: 64, height: 3, background: AMBAR }} />
      {kicker}
    </div>
    <div style={{ marginTop: 14 }}>
      {titulo.map((l) => (
        <div key={l} style={{ ...metal, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.0, letterSpacing: "0.005em", textTransform: "uppercase", whiteSpace: "nowrap", transform: "scaleX(0.8)", transformOrigin: "left" }}>{l}</div>
      ))}
    </div>
    <div style={{ marginTop: 22, fontFamily: SANS, fontWeight: 600, fontSize: 40, letterSpacing: "0.08em", color: "rgba(236,234,230,0.88)", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>{bajada}</div>
  </div>
);

export const SETGptPortada: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#070708", overflow: "hidden" }}>
    <Fondo src="historias-setters/0-portada.png" />
    <Texto top={1010} kicker="RING SETTERS · NUEVO" titulo={["LAS LLAMADAS", "QUE ABREN PUERTAS"]} bajada="TU VOZ. SU PRÓXIMA REUNIÓN." size={122} />
  </div>
);

/**
 * Serie de Gemini (768x1376, ya llevada a 1080x1920 en public/historias-setters-gem/).
 * La foto cubre todo; abajo, un degradé oscuro donde va el texto (zona vacía que pidió el prompt).
 */
const LAMINAS_GEM: { kicker: string; titulo: string[]; bajada: string; size: number; top?: number }[] = [
  { kicker: "RING SETTERS · NUEVO", titulo: ["LAS LLAMADAS", "QUE ABREN PUERTAS"], bajada: "TU VOZ. SU PRÓXIMA REUNIÓN.", size: 122 },
  { kicker: "QUÉ ES", titulo: ["PRACTICÁ TUS", "LLAMADAS DE AGENDA"], bajada: "CON OTRO SETTER · COMO SI FUERA REAL", size: 116 },
  { kicker: "AGENDA", titulo: ["TE EMPAREJAMOS", "AUNQUE NO COINCIDAN"], bajada: "RECORDATORIO 24 H ANTES", size: 116, top: 1290 },
  { kicker: "DESPUÉS DE CADA PRÁCTICA", titulo: ["VOS REPORTÁS.", "TU COMPAÑERO CONFIRMA."], bajada: "AGENDÓ · HUBIERA IDO", size: 104 },
  { kicker: "CON FATHOM", titulo: ["TE ESCUCHÁS", "Y SUMÁS"], bajada: "CADA GRABACIÓN TE DA PUNTOS", size: 140 },
  { kicker: "TU PROGRESO", titulo: ["SUBÍ EN LA TABLA.", "GANÁ TROFEOS."], bajada: "RANGO · TROFEOS · RACHA", size: 116 },
  { kicker: "TU CARRERA", titulo: ["TU CARNET, TU CV", "Y OFERTAS PARA SETTERS"], bajada: "ELEGÍ «SOY SETTER» AL REGISTRARTE", size: 104 },
  { kicker: "RING SETTERS", titulo: ["ELEGÍ «SOY SETTER»", "AL REGISTRARTE"], bajada: "¿SOS CLOSER? PASALE EL LINK A TU SETTER", size: 112 },
];

export const SETGem: React.FC<{ n: number }> = ({ n }) => {
  const l = LAMINAS_GEM[n];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#070708", overflow: "hidden" }}>
      <Img src={staticFile(`historias-setters-gem/${n}.jpg`)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 900, background: "linear-gradient(rgba(7,7,8,0), rgba(7,7,8,0.55) 40%, rgba(7,7,8,0.9))" }} />
      <Texto top={l.top ?? 1150} kicker={l.kicker} titulo={l.titulo} bajada={l.bajada} size={l.size} />
    </div>
  );
};
