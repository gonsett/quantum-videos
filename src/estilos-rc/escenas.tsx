import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Noche, aparece, sube } from "../ring-closers/piezas";
import { DISPLAY, EASE, MARGEN, MONO, RC, SANS } from "../ring-closers/tema";
import { Logo } from "../reel-rc/logo";
import { MarcaChica, Plano, Tarjeta, Zona } from "../reel-rc/escenas";
import { Subtitulos } from "../reel-rc/subtitulos";
import { estilos } from "./timeline";

/**
 * "Elegís cómo entrás al ring": los estilos de boxeo de Ring Closers.
 *
 * Sale de la sección "Tu esquina, tu estilo" de la landing, que ningún
 * video anterior tocó. Los nombres, las descripciones y el rango en que se
 * desbloquea cada estilo son los de `ring-closers/lib/ranks.ts`; las
 * ilustraciones son las de `public/game/boxers/`.
 *
 * El recurso central es el candado: un estilo bloqueado se ve apagado, y el
 * de Contragolpe se enciende en pantalla cuando la voz dice en qué rango se
 * desbloquea. El Noqueador queda cerrado a propósito — "recién en Campeón"
 * tiene que sentirse lejos.
 */

const ease = Easing.bezier(...EASE);
const { cuadro, escena } = estilos;

const GUANTE = (id: string) => `ring-closers/boxers/${id}.webp`;

// ── Piezas ───────────────────────────────────────────────────────────────

const Candado: React.FC<{ size: number; abierto: number }> = ({ size, abierto }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={RC.crema} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    {/* El arco sube y se corre al abrirse */}
    <path d="M8 11V7a4 4 0 0 1 8 0v4" style={{ translate: `${-3 * abierto}px ${-3 * abierto}px`, transformBox: "fill-box" }} />
  </svg>
);

/** Hexágono de línea: el contorno del logo, detrás de cada guante. */
const Hexagono: React.FC<{ size: number; opacidad?: number }> = ({ size, opacidad = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", opacity: opacidad }}>
    <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="none" stroke={RC.tinta700} strokeWidth={0.6} />
  </svg>
);

/**
 * Carta de un estilo: guante grande, nombre, descripción y en qué rango está.
 * `bloqueado` lo apaga con candado; `desbloqueaEn` lo enciende en ese cuadro.
 */
const CartaEstilo: React.FC<{
  guante: string;
  indice: string;
  nombre: string;
  descripcion: string;
  rango: string;
  bloqueado?: boolean;
  desbloqueaEn?: number;
  rangoEn?: number;
  delay?: number;
}> = ({ guante, indice, nombre, descripcion, rango, bloqueado = false, desbloqueaEn, rangoEn = 0, delay = 0 }) => {
  const frame = useCurrentFrame();
  const abre = desbloqueaEn === undefined ? 0 : aparece(frame, desbloqueaEn, 14);
  const apagado = bloqueado ? 1 - abre : 0;
  const empuje = desbloqueaEn === undefined ? 1 : interpolate(frame, [desbloqueaEn, desbloqueaEn + 16], [0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

  return (
    <Zona>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 26, letterSpacing: "0.14em", color: RC.platino500, marginBottom: 10, opacity: aparece(frame, delay, 8) }}>
          ESTILO {indice}
        </div>

        <div style={{ position: "relative", width: 520, height: 470, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Hexagono size={500} opacidad={aparece(frame, delay, 10)} />
          <Img
            src={staticFile(guante)}
            style={{
              width: 400,
              height: 400,
              objectFit: "contain",
              opacity: aparece(frame, delay + 2, 10),
              scale: String((desbloqueaEn !== undefined && frame >= desbloqueaEn ? empuje : 1) * interpolate(frame, [delay + 2, delay + 14], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })),
              filter: `grayscale(${apagado}) brightness(${1 - 0.68 * apagado})`,
            }}
          />
          {bloqueado ? (
            <div style={{ position: "absolute", opacity: apagado * aparece(frame, delay + 6, 8) }}>
              <Candado size={120} abierto={abre} />
            </div>
          ) : null}
        </div>

        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", color: RC.crema, marginTop: 6, opacity: aparece(frame, delay + 4, 10), translate: sube(frame, delay + 4, 18, 12) }}>
          {nombre}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 38, color: RC.platino300, marginTop: 10, opacity: aparece(frame, delay + 8, 10) }}>
          {descripcion}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 26, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.1em", opacity: aparece(frame, Math.max(delay + 10, rangoEn), 8) }}>
          <span style={{ color: RC.platino500 }}>{bloqueado ? (abre > 0.5 ? "DESBLOQUEADO EN" : "SE DESBLOQUEA EN") : "DESDE"}</span>
          <span style={{ color: bloqueado ? RC.esmeralda500 : RC.platino300 }}>{rango.toUpperCase()}</span>
        </div>
      </div>
    </Zona>
  );
};

const subs = (id: string, clave: string[]) => (
  <Subtitulos clips={escena(id).clips} duracionEscena={escena(id).durationInFrames} clave={clave} />
);

// ── E1 · No elegís un avatar ─────────────────────────────────────────────

export const E1Avatar: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e1-avatar";
  const palabras = escena(ID).clips[0].palabras;
  const segundoElegis = cuadro(ID, "elegis", 2);
  const fila = ["guard_classic", "guard_high", "southpaw", "counter", "knockout", "legend"];

  return (
    <Noche>
      <Zona>
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 24 }}>
          {palabras.map((w, k) => {
            const clave = k >= palabras.length - 4; // "cómo entrás al ring."
            const entra = interpolate(frame, [w.cuadro - 1, w.cuadro + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
            // La segunda oración arranca en su propia línea
            const salto = k > 0 && palabras[k - 1].palabra.endsWith(".");
            return (
              <>
              {salto ? <div key={`s${k}`} style={{ flexBasis: "100%", height: 18 }} /> : null}
              <span key={k} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, lineHeight: 1.02, textTransform: "uppercase", color: clave ? RC.esmeralda500 : RC.crema, opacity: entra, translate: `0px ${(1 - entra) * 18}px` }}>
                {w.palabra}
              </span>
              </>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 60 }}>
          {fila.map((g, k) => (
            <Img
              key={g}
              src={staticFile(GUANTE(g))}
              style={{ width: 128, height: 128, objectFit: "contain", opacity: aparece(frame, segundoElegis + k * 3, 8), translate: sube(frame, segundoElegis + k * 3, 16, 10) }}
            />
          ))}
        </div>
      </Zona>
    </Noche>
  );
};

// ── E2 · Las dos guardias ────────────────────────────────────────────────

export const E2Guardias: React.FC = () => {
  const ID = "e2-guardias";
  const corte = cuadro(ID, "guardia", 2) - 3;
  return (
    <Noche>
      <MarcaChica />
      <Plano desde={0} hasta={corte}>
        <CartaEstilo guante={GUANTE("guard_classic")} indice="01" nombre="Guardia clásica" descripcion="El básico, sólido y directo." rango="Aficionado" delay={0} />
      </Plano>
      <Plano desde={corte}>
        <CartaEstilo guante={GUANTE("guard_high")} indice="02" nombre="Guardia cruzada" descripcion="Defensivo, dos guantes en alto." rango="Aficionado" delay={corte} />
      </Plano>
      {subs(ID, ["solido", "directo", "defensivo"])}
    </Noche>
  );
};

// ── E3 · Zurdo ───────────────────────────────────────────────────────────

export const E3Zurdo: React.FC = () => (
  <Noche>
    <MarcaChica />
    <CartaEstilo guante={GUANTE("southpaw")} indice="03" nombre="Zurdo" descripcion="Guardia invertida, difícil de leer." rango="Prospecto" delay={0} />
    {subs("e3-zurdo", ["leer"])}
  </Noche>
);

// ── E4 · Contragolpe: el que se desbloquea en pantalla ───────────────────

export const E4Contragolpe: React.FC = () => {
  const ID = "e4-contragolpe";
  const clips = escena(ID).clips;
  return (
    <Noche>
      <MarcaChica />
      <CartaEstilo
        guante={GUANTE("counter")}
        indice="04"
        nombre="Contragolpe"
        descripcion="Pega justo cuando el otro bajó la guardia."
        rango="Contendiente"
        bloqueado
        rangoEn={clips[1].enEscena}
        desbloqueaEn={cuadro(ID, "contendiente")}
        delay={0}
      />
      {subs(ID, ["pega", "contendiente"])}
    </Noche>
  );
};

// ── E5 · Noqueador: queda cerrado ────────────────────────────────────────

export const E5Noqueador: React.FC = () => {
  const ID = "e5-noqueador";
  return (
    <Noche>
      <MarcaChica />
      <CartaEstilo guante={GUANTE("knockout")} indice="05" nombre="Noqueador" descripcion="Una mano que termina peleas." rango="Campeón" bloqueado rangoEn={cuadro(ID, "campeon") - 2} delay={0} />
      {subs(ID, ["campeon"])}
    </Noche>
  );
};

// ── E6 · La prueba de que llegaste ───────────────────────────────────────

/**
 * La ficha de boxeador es pública (FAQ de la landing): nombre de ring, rango
 * y puntos. Por eso el estilo es prueba y no adorno — lo ve todo el mundo.
 */
export const E6Prueba: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e6-prueba";
  const prueba = cuadro(ID, "prueba");
  return (
    <Noche>
      <MarcaChica />
      <Zona>
        <Tarjeta style={{ opacity: aparece(frame, 0, 10), translate: sube(frame, 0, 24, 14) }}>
          <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: RC.tinta800, borderBottom: `1px solid ${RC.tinta700}`, padding: "22px 36px" }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 28, letterSpacing: "0.2em", color: RC.platino500 }}>FICHA DE BOXEADOR</span>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: RC.platino300 }}>PÚBLICA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 36, padding: "40px 40px" }}>
            <div style={{ position: "relative", width: 250, height: 250, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Hexagono size={250} />
              <Img src={staticFile(GUANTE("counter"))} style={{ width: 190, height: 190, objectFit: "contain" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 74, lineHeight: 1, color: RC.crema }}>LA MÁQUINA</div>
              <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.08em", color: RC.platino500, marginTop: 12 }}>NOMBRE DE RING</div>
              <div style={{ height: 1, backgroundColor: RC.tinta700, margin: "26px 0" }} />
              {[
                { k: "RANGO", v: "Contendiente", acento: true },
                { k: "ESTILO", v: "Contragolpe", acento: true },
                { k: "PUNTOS", v: "340", acento: false },
              ].map((f) => (
                <div key={f.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontFamily: MONO, fontSize: 24, letterSpacing: "0.1em", color: RC.platino500 }}>{f.k}</span>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, textTransform: "uppercase", color: f.acento && frame >= prueba ? RC.esmeralda500 : RC.crema }}>
                    {f.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Tarjeta>
      </Zona>
      {subs(ID, ["prueba", "llegaste"])}
    </Noche>
  );
};

// ── E7 · Cómo se llega ───────────────────────────────────────────────────

const CAMINO = [
  { rango: "Leyenda", belt: "leyenda", guantes: ["legend"] },
  { rango: "Campeón", belt: "campeon", guantes: ["knockout"] },
  { rango: "Contendiente", belt: "contendiente", guantes: ["counter"] },
  { rango: "Prospecto", belt: "prospecto", guantes: ["speed", "southpaw"] },
  { rango: "Aficionado", belt: "aficionado", guantes: ["guard_classic", "guard_high"] },
];

export const E7Camino: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e7-camino";
  const clips = escena(ID).clips;
  const corte = clips[1].enEscena - 3;
  const miedo = cuadro(ID, "miedo");

  return (
    <Noche>
      <MarcaChica />

      {/* A · A esos rangos no se llega peleando con el cómodo: el camino con sus estilos */}
      <Plano desde={0} hasta={corte}>
        <Zona>
          <div>
            {CAMINO.map((r, i) => {
              const d = 2 + (CAMINO.length - 1 - i) * 4; // se arma de abajo hacia arriba
              const arriba = i < 2; // Campeón y Leyenda: todavía cerrados para esta ficha
              return (
                <div key={r.rango} style={{ display: "flex", alignItems: "center", gap: 26, height: 150, borderBottom: i < CAMINO.length - 1 ? `1px solid ${RC.tinta700}` : "none", opacity: aparece(frame, d, 8) * (arriba ? 0.45 : 1), translate: sube(frame, d, 14, 10) }}>
                  <Img src={staticFile(`ring-closers/belts/${r.belt}.webp`)} style={{ width: 170, height: 110, objectFit: "contain", filter: arriba ? "grayscale(1)" : "none" }} />
                  <div style={{ flex: 1, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, textTransform: "uppercase", color: r.rango === "Contendiente" ? RC.esmeralda500 : RC.crema }}>{r.rango}</div>
                  {r.guantes.map((g) => (
                    <Img key={g} src={staticFile(GUANTE(g))} style={{ width: 96, height: 96, objectFit: "contain", filter: arriba ? "grayscale(1) brightness(0.5)" : "none" }} />
                  ))}
                </div>
              );
            })}
          </div>
        </Zona>
      </Plano>

      {/* B · Tus tres peleas, incluida la que te da miedo */}
      <Plano desde={corte}>
        <Zona>
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 34, letterSpacing: "0.2em", color: RC.platino300, marginBottom: 30, opacity: aparece(frame, corte, 8) }}>
            TUS 3 PELEAS DE LA SEMANA
          </div>
          {[
            { t: "Por debajo", ok: true },
            { t: "Tu nivel", ok: true },
            { t: "Por encima", ok: false },
          ].map((p, i) => {
            const d = corte + 4 + i * 5;
            const esMiedo = !p.ok;
            const marca = esMiedo && frame >= miedo;
            return (
              <div key={p.t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 170, marginBottom: 20, padding: "0 40px", backgroundColor: RC.tinta900, border: `1px solid ${marca ? RC.esmeralda500 : RC.tinta700}`, borderRadius: 24, opacity: aparece(frame, d, 8), translate: sube(frame, d, 14, 10) }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, textTransform: "uppercase", color: RC.crema }}>{p.t}</span>
                {esMiedo ? (
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: RC.esmeralda500, opacity: aparece(frame, miedo - 2, 8) }}>LA QUE TE DA MIEDO</span>
                ) : (
                  <svg width={58} height={58} viewBox="0 0 54 54">
                    <circle cx="27" cy="27" r="25" fill="none" stroke={RC.tinta700} strokeWidth="2" />
                    <path d="M16 27.5l7.5 7.5L38.5 20" fill="none" stroke={RC.platino300} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </Zona>
      </Plano>

      {subs(ID, ["comodo", "miedo"])}
    </Noche>
  );
};

// ── E8 · CTA ─────────────────────────────────────────────────────────────

export const E8Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "e8-cta";
  const guardia = cuadro(ID, "guardia");
  return (
    <Noche>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 260, paddingLeft: MARGEN, paddingRight: MARGEN }}>
        <div style={{ opacity: aparece(frame, 0, 8), translate: sube(frame, 0, 20, 12) }}>
          <Logo size={128} />
        </div>
        <div style={{ marginTop: 34, fontFamily: DISPLAY, fontWeight: 700, fontSize: 136, lineHeight: 1, letterSpacing: "0.04em", whiteSpace: "nowrap", opacity: aparece(frame, 2, 8), translate: sube(frame, 2, 20, 12) }}>
          <span style={{ color: RC.crema }}>RING </span>
          <span style={{ color: RC.esmeralda500 }}>CLOSERS</span>
        </div>
        <div style={{ marginTop: 30, fontFamily: SANS, fontSize: 42, color: RC.platino300, opacity: aparece(frame, cuadro(ID, "gratis") - 2, 8) }}>
          Gratis. Sin tarjeta, sin vueltas.
        </div>
        <div style={{ marginTop: 54, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: "0.08em", color: RC.crema, border: `1px solid ${RC.platino500}`, borderRadius: 999, padding: "18px 50px", opacity: aparece(frame, guardia - 8, 8), translate: sube(frame, guardia - 8, 14, 10) }}>
          ELEGÍ TU GUARDIA
        </div>
      </AbsoluteFill>
    </Noche>
  );
};
