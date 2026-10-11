import React from "react";
import { DISPLAY, MONO, RC, SANS } from "../elite-rc/dopamina";
import { CARD, Fondo, Pie, Texto } from "./Carrusel";

/**
 * Carrusel 2 de Ring Closers: "Los 3 closers de tu semana" (regla de los 3 niveles), 7 láminas 1080x1350.
 * Estructura que funciona hoy en Instagram: portada corta y "incompleta" (el peldaño de arriba, desenfocado),
 * lámina 2 con hoja de ruta, UN punto por lámina, una lámina para GUARDAR (checklist) y cierre para MANDAR.
 * Objeto propio de este carrusel: la escalera de tres peldaños (no repite odómetro, medalla ni tarjetas del reel).
 * Se exporta con `remotion still ... --frame=60 --public-dir=public-veteranos`.
 */
const EM = RC.esmeralda400;
const ALTO = 140;
const SEP = 22;

type Peldano = { n: number; titulo: string; sub: string };
// De arriba hacia abajo; `n` es el orden en que se cuentan (1 = por debajo de vos).
const PELDANOS: Peldano[] = [
  { n: 3, titulo: "Por encima de vos", sub: "NIVEL SUPERIOR" },
  { n: 2, titulo: "De tu nivel", sub: "NIVEL PAREJO" },
  { n: 1, titulo: "Por debajo de vos", sub: "NIVEL INFERIOR" },
];

/** Barritas tipo señal: cuantas más llenas, más alto el nivel del rival. */
const Pips: React.FC<{ nivel: number; on: boolean }> = ({ nivel, on }) => (
  <div style={{ position: "absolute", right: 44, top: (ALTO - 58) / 2, height: 58, display: "flex", alignItems: "flex-end", gap: 8 }}>
    {[0, 1, 2].map((k) => (
      <div key={k} style={{ width: 16, height: 20 + k * 19, borderRadius: 5, backgroundColor: k < nivel ? (on ? EM : RC.platino500) : "rgba(255,255,255,0.1)" }} />
    ))}
  </div>
);

const Escalera: React.FC<{ top: number; activos?: number[]; borroso?: number }> = ({ top, activos = [], borroso }) => (
  <>
    {PELDANOS.map((p, i) => {
      const on = activos.includes(p.n);
      const dim = activos.length > 0 && !on;
      const difuso = borroso === p.n;
      return (
        <div
          key={p.n}
          style={{
            ...CARD,
            top: top + i * (ALTO + SEP),
            height: ALTO,
            opacity: difuso ? 0.6 : dim ? 0.5 : 1,
            filter: difuso ? "blur(7px)" : undefined,
            border: `1px solid ${on ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.1)"}`,
            background: on ? "linear-gradient(180deg, rgba(52,211,153,0.17), rgba(52,211,153,0.05))" : CARD.background,
            boxShadow: on ? "0 30px 70px rgba(0,0,0,0.5), 0 0 70px rgba(52,211,153,0.28), inset 0 1px 0 rgba(255,255,255,0.08)" : CARD.boxShadow,
          }}
        >
          <div style={{ position: "absolute", left: 36, top: (ALTO - 64) / 2, width: 64, height: 64, borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${on ? EM : "rgba(255,255,255,0.25)"}`, backgroundColor: on ? EM : "transparent", color: on ? "#0a0a0c" : RC.platino300, fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, lineHeight: 1 }}>{p.n}</div>
          <div style={{ position: "absolute", left: 128, top: 26, fontFamily: SANS, fontWeight: 700, fontSize: 40, lineHeight: 1.3, color: on ? RC.crema : RC.platino300 }}>{p.titulo}</div>
          <div style={{ position: "absolute", left: 128, top: 86, fontFamily: MONO, fontWeight: 600, fontSize: 21, letterSpacing: "0.14em", color: on ? EM : RC.platino500 }}>{p.sub}</div>
          <Pips nivel={p.n} on={on} />
        </div>
      );
    })}
  </>
);

const Titulo: React.FC<{ top: number; tam: number; lineas: string[] }> = ({ top, tam, lineas }) => (
  <>
    {lineas.map((l, i) => (
      <Texto key={l} top={top + i * Math.round(tam * 1.3)} tam={tam} peso={700} color={RC.crema}>{l}</Texto>
    ))}
  </>
);

// 1 · Portada: promesa corta; el peldaño de arriba, desenfocado (la lámina se siente incompleta)
export const D1: React.FC = () => (
  <Fondo>
    <Titulo top={112} tam={72} lineas={["Los 3 closers con los que", "tenés que practicar", "cada semana."]} />
    <Escalera top={480} borroso={3} />
    <Texto top={1030} tam={40}>Uno por debajo, uno parejo y el que incomoda.</Texto>
    <Pie />
  </Fondo>
);

// 2 · Hoja de ruta: qué te da cada uno
export const D2: React.FC = () => (
  <Fondo>
    <Titulo top={130} tam={68} lineas={["Una semana bien armada", "tiene tres roleplays."]} />
    <Texto top={352} tam={44}>Uno de cada nivel. Cada uno te da algo distinto.</Texto>
    <Escalera top={490} activos={[1, 2, 3]} />
    <Texto top={1030} tam={40}>Así se arma tu semana en Ring Closers.</Texto>
    <Pie />
  </Fondo>
);

const Paso: React.FC<{ n: number; lineas: string[]; cuerpo: string[] }> = ({ n, lineas, cuerpo }) => (
  <Fondo>
    <div style={{ position: "absolute", left: 0, right: 0, top: 118, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.26em", color: EM }}>ROLEPLAY {n} DE 3</div>
    <Titulo top={176} tam={78} lineas={lineas} />
    <Escalera top={470} activos={[n]} />
    <Texto top={1000} tam={44}>{cuerpo[0]}</Texto>
    <Texto top={1062} tam={44}>{cuerpo[1]}</Texto>
    <Pie />
  </Fondo>
);

// 3 · Por debajo · 4 · Parejo · 5 · Por encima
export const D3: React.FC = () => <Paso n={1} lineas={["Alguien por", "debajo de vos."]} cuerpo={["Te obliga a explicar lo que ya hacés", "en automático. Ahí ves qué no sabés decir."]} />;
export const D4: React.FC = () => <Paso n={2} lineas={["Alguien de", "tu nivel."]} cuerpo={["Es tu espejo: mismos recursos y vicios.", "Ves qué de lo tuyo ya no funciona."]} />;
export const D5: React.FC = () => <Paso n={3} lineas={["Alguien por", "encima de vos."]} cuerpo={["Te muestra el techo de tu oficio.", "Incomoda. Por eso sirve."]} />;

// 6 · Para guardar: la semana como checklist
const FILAS: [string, number][] = [
  ["1 con alguien por debajo", 1],
  ["1 con alguien de tu nivel", 2],
  ["1 con alguien por encima", 3],
];
export const D6: React.FC = () => (
  <Fondo>
    <Titulo top={126} tam={76} lineas={["Tu semana, lista", "para guardar."]} />
    <div style={{ ...CARD, top: 400, height: 540 }}>
      <div style={{ position: "absolute", left: 44, top: 34, display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: EM }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: EM }} />
        ESTA SEMANA · 3 ROLEPLAYS
      </div>
      <div style={{ position: "absolute", left: 44, right: 44, top: 90, height: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
      {FILAS.map(([t, n], i) => (
        <div key={n} style={{ position: "absolute", left: 0, right: 0, top: 120 + i * 116, height: 100 }}>
          <div style={{ position: "absolute", left: 44, top: 22, width: 56, height: 56, borderRadius: 14, border: `2px solid ${RC.platino500}` }} />
          <div style={{ position: "absolute", left: 130, top: 26, fontFamily: SANS, fontWeight: 700, fontSize: 38, lineHeight: 1.3, color: RC.crema }}>{t}</div>
          <div style={{ position: "absolute", right: 44, top: 21, height: 58, display: "flex", alignItems: "flex-end", gap: 8 }}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ width: 16, height: 20 + k * 19, borderRadius: 5, backgroundColor: k < n ? EM : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 44, right: 44, top: 470, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 27, color: RC.platino500 }}>Con uno solo que falte, la semana queda incompleta.</div>
    </div>
    <Texto top={1030} tam={48}>Guardalo y tachalo cada semana.</Texto>
    <Pie />
  </Fondo>
);

// 7 · Cierre: mandarlo y dónde se arma solo
export const D7: React.FC = () => (
  <Fondo>
    <Titulo top={126} tam={74} lineas={["Mandáselo al closer", "con el que practicás."]} />
    <Texto top={358} tam={44}>Y armen juntos la semana completa.</Texto>
    <Escalera top={470} activos={[1, 2, 3]} />
    <Texto top={1010} tam={40}>Ring Closers te empareja con uno de cada nivel.</Texto>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 46px 16px 36px", borderRadius: 999, backgroundColor: RC.crema, color: "#0a0a0c", fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, lineHeight: 1.2, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        <svg width="28" height="28" viewBox="0 0 24 24"><path d="M12 20V5M12 5l-6 6M12 5l6 6" fill="none" stroke="#0a0a0c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Link en la bio
      </div>
    </div>
    <Pie sigue={false} />
  </Fondo>
);
