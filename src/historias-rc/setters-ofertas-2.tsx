import React from "react";
import { Img, staticFile } from "remotion";
import { RC, DISPLAY } from "../ring-closers/tema";
import { SANS } from "./como-funciona";
import { Estudio2, INK, B } from "./ofertas";
import { AMBAR, AMBAR_CLARO, Contraluz, Cabecera, Persona, Boton, SOMBRA_CARD, RoleplayCard } from "./setters-ofertas";
import { CarnetSetterFrente } from "./carnet-setter-real";

/** Láminas 03-06 de la destacada de Ring Setters (lenguaje Ofertas + la setter de Gemini). Datos de puntos y rangos reales
 *  (lib/scoring/weekly.ts: 10 + (estrellas-3)·5, -15 si no cumplís los tres cruces; lib/ranks-setter.ts). Nombres y horarios inventados. */

const CARD_BG = `linear-gradient(180deg, #19191c 0%, ${INK[900]} 100%)`;

// ── 03 · Agenda: vos ponés los horarios ──────────────────────────────────────

const Franja: React.FC<{ dia: string; horas: string[] }> = ({ dia, horas }) => (
  <div style={{ borderRadius: 26, padding: "30px 36px", background: CARD_BG, border: `1.5px solid ${INK[700]}`, boxShadow: SOMBRA_CARD }}>
    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, letterSpacing: 2, textTransform: "uppercase", color: RC.crema }}>{dia}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
      {horas.map((h) => (
        <div key={h} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 16, border: `1.5px solid ${INK[700]}`,
          background: "#0b0b0d", padding: "16px 24px" }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: RC.crema, fontVariantNumeric: "tabular-nums" }}>{h}</span>
          <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "#71717a", textDecoration: "underline" }}>Quitar</span>
        </div>
      ))}
    </div>
  </div>
);

export const SETOF3Agenda: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Vos ponés<br />los horarios.</>}
      bajada={<>Cargás cuándo podés. Si con el otro no coinciden, <B>igual los cruzamos con un horario sugerido.</B></>} />
    <div style={{ position: "absolute", left: 520, width: 488, top: 820, display: "flex", flexDirection: "column", gap: 20, transform: "rotate(2deg)" }}>
      <Franja dia="Martes" horas={["18:00 – 20:00"]} />
      <Franja dia="Jueves" horas={["19:00 – 21:00", "21:30 – 22:30"]} />
    </div>
    <Contraluz x={40} y={1290} w={760} h={420} o={0x66} />
    {/* protagonista: el aviso real del cruce flexible (setter-fight-card.tsx) */}
    <div style={{ position: "absolute", left: 72, width: 720, top: 1370, borderRadius: 26, padding: "34px 38px", background: "#1d1607",
      border: `1.5px solid ${AMBAR}66`, boxShadow: `0 50px 110px rgba(0,0,0,0.85), 0 0 60px ${AMBAR}26` }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: AMBAR }}>Sus horarios no coinciden</div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, lineHeight: 1.4, color: RC.crema, marginTop: 14 }}>
        Les sugerimos el jueves a las 20:30. Queda a 30 minutos de su franja.
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 26 }}><Boton primario>Proponer este horario</Boton></div>
    </div>
  </Estudio2>
);

// ── 04 · Evaluación: la nota la pone el otro ─────────────────────────────────

const Estrellas: React.FC<{ n: number; size: number; brillo?: boolean }> = ({ n, size, brillo }) => (
  <div style={{ display: "flex", gap: size * 0.18 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ fontSize: size, lineHeight: 1, color: i <= n ? AMBAR : "#52525b",
        textShadow: i <= n && brillo ? `0 0 ${size * 0.5}px ${AMBAR}aa, 0 6px 20px rgba(0,0,0,0.6)` : undefined }}>★</span>
    ))}
  </div>
);

export const SETOF4Nota: React.FC = () => (
  <Estudio2>
    <Persona n={2} top={-90} left={-60} ancho={1200} desde={24} hasta={64} />
    <Cabecera titulo={<>La nota<br />la pone el otro.</>}
      bajada={<>Después de cada roleplay, tu rival te califica. <B>Sin amigos, sin favores.</B></>} />
    <Contraluz x={100} y={1080} w={880} h={520} o={0x5a} />
    <RoleplayCard top={1120} estado="Completada" cruce="Masterclass" rival="Valentina G.">
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: RC.platino500 }}>Evaluar rival</div>
      <div style={{ marginTop: 18 }}><Estrellas n={4} size={86} brillo /></div>
      <div style={{ marginTop: 24, borderRadius: 18, border: `1.5px solid ${INK[700]}`, background: "#0b0b0d", padding: "22px 26px",
        fontFamily: SANS, fontWeight: 500, fontSize: 27, lineHeight: 1.45, color: RC.crema }}>
        Calificó rápido y no soltó el primer «no». Le faltó cerrar con fecha.
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 23, color: "#71717a", marginTop: 16 }}>Tu calificación se suma a sus puntos la próxima semana.</div>
    </RoleplayCard>
  </Estudio2>
);

// ── 05 · Puntos: cada estrella suma ──────────────────────────────────────────

const FilaPts: React.FC<{ cruce: string; n: number; pts: string; rojo?: boolean }> = ({ cruce, n, pts, rojo }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 0", borderTop: `1.5px solid ${INK[700]}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: rojo ? "#71717a" : RC.crema, width: 230 }}>{cruce}</span>
      {n ? <Estrellas n={n} size={34} /> : <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: "#71717a" }}>uno de los tres cruces</span>}
    </div>
    <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 40, color: rojo ? "#f87171" : AMBAR_CLARO }}>{pts}</span>
  </div>
);

export const SETOF5Puntos: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Cada estrella<br />suma.</>}
      bajada={<>Diez puntos por roleplay y cinco más por cada estrella arriba de tres. <B>Si faltás a uno, restás.</B></>} />
    <Contraluz x={60} y={820} w={960} h={620} o={0x44} />
    <div style={{ position: "absolute", left: 72, width: 936, top: 860, borderRadius: 30, padding: "40px 48px 20px",
      background: CARD_BG, border: `1.5px solid ${INK[700]}`, boxShadow: SOMBRA_CARD }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: 7, textTransform: "uppercase", color: RC.platino500, marginBottom: 14 }}>Tu semana</div>
      <FilaPts cruce="Masterclass" n={5} pts="+20" />
      <FilaPts cruce="Rivalidad" n={4} pts="+15" />
      <FilaPts cruce="Enseñás" n={3} pts="+10" />
      <div style={{ opacity: 0.7 }}><FilaPts cruce="Si faltás a" n={0} pts="−15" rojo /></div>
    </div>
    {/* protagonista: medallón del total */}
    <div style={{ position: "absolute", left: 370, top: 1400, width: 340, height: 340, borderRadius: "50%",
      background: "radial-gradient(circle at 40% 30%, #2a2118 0%, #0f0d0a 70%)",
      boxShadow: `0 0 0 3px ${AMBAR}, 0 0 0 14px rgba(255,255,255,0.035), 0 0 80px ${AMBAR}55, 0 40px 90px rgba(0,0,0,0.9)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 19, letterSpacing: 5, color: RC.platino500 }}>ESTA SEMANA</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 150, lineHeight: 1, color: RC.crema, marginTop: 6 }}>
        <span style={{ color: AMBAR, fontSize: 96 }}>+</span>45
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 21, color: RC.platino500, marginTop: 4 }}>puntos</div>
    </div>
  </Estudio2>
);

// ── 06 · Rango: del radar a la torre ─────────────────────────────────────────

const RANGOS_SET: [string, string, number][] = [
  ["Leyenda del radar", "Torre maestra", 1500], ["Controlador", "Vector confirmado", 700], ["Operador", "Blanco fijo", 300],
  ["Rastreador", "Contacto estable", 100], ["Aprendiz", "Señal intermitente", 0],
];

export const SETOF6Rango: React.FC = () => (
  <Estudio2>
    <Cabecera titulo={<>Del radar<br />a la torre.</>}
      bajada={<>Cinco rangos. Los puntos te suben <B>y tu carnet lo muestra.</B></>} />
    <Contraluz x={500} y={880} w={560} h={560} o={0x66} />
    <div style={{ position: "absolute", left: 72, width: 600, top: 900, display: "flex", flexDirection: "column", gap: 14 }}>
      {RANGOS_SET.map(([r, l, p]) => {
        const yo = r === "Operador", arriba = p > 300;
        return (
          <div key={r} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 30px", borderRadius: 22,
            background: yo ? "#1d1607" : arriba ? "rgba(20,20,22,0.7)" : CARD_BG,
            border: `1.5px solid ${yo ? AMBAR : INK[700]}`, boxShadow: yo ? `0 0 50px ${AMBAR}33, 0 30px 70px rgba(0,0,0,0.7)` : "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, textTransform: "uppercase", letterSpacing: 1, color: arriba ? "#71717a" : RC.crema }}>{r}</div>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: yo ? AMBAR_CLARO : "#71717a", marginTop: 4 }}>{l}</div>
            </div>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: yo ? RC.crema : "#71717a" }}>{yo ? "Vos · 340" : `${p} pts`}</span>
          </div>
        );
      })}
    </div>
    <Img src={staticFile("setters-rc/tro/setter_rank_operador-hd.webp")} style={{ position: "absolute", left: 610, top: 960, width: 440,
      filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.9))" }} />
  </Estudio2>
);

// ── 07 · Cierre: el carnet oficial como pieza de museo (v2, 04/10/2026: la v1 "plana, rara" flotaba de costado sobre negro) ──
// Lenguaje de la vitrina aprobada ("10 veces mejor"): foco cenital blanco, pedestal de piedra con reflejo, color solo en
// líneas finas. El carnet se para sobre el pedestal; el CV queda detrás en penumbra; la placa del pedestal es el llamado.

const Escuadra: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 46, height: 46, transform: `rotate(${r}deg)`,
    borderTop: `1.5px solid ${AMBAR}`, borderLeft: `1.5px solid ${AMBAR}`, opacity: 0.85 }} />
);

const CV_RENGLONES = ["Experiencia", "Show rate", "Logros"];

export const SETOF7Carnet: React.FC = () => {
  const CW = 800, CH = CW / 1.586, CX = (1080 - CW) / 2, PISO = 1395; // el carnet apoya su canto en PISO
  return (
    <Estudio2>
      <Cabecera titulo={<>Tu carnet<br />te presenta.</>} bajada={<>Carnet, CV y ofertas pensadas para setters.</>} />
      {/* cono de luz cenital */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 900, filter: "blur(30px)",
        clipPath: "polygon(41% 0, 59% 0, 92% 100%, 8% 100%)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.045) 60%, rgba(255,255,255,0.0) 100%)" }} />
      {/* el CV, detrás y en penumbra */}
      <div style={{ position: "absolute", left: 470, top: 760, width: 470, height: 640, transform: "rotate(7deg)", borderRadius: 6,
        background: "#ece6da", padding: "44px 40px", filter: "brightness(0.42) blur(1.2px)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Img src={staticFile("historias-setters-gem/avatar.jpg")} style={{ width: 84, height: 84, borderRadius: 42, objectFit: "cover", filter: "grayscale(1)" }} />
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 38, color: "#1b1712", lineHeight: 1 }}>Lucía Ferraz</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, letterSpacing: 3, color: "#b7791f", marginTop: 8 }}>APPOINTMENT SETTER</div>
          </div>
        </div>
        {CV_RENGLONES.map((r, j) => (
          <div key={r} style={{ marginTop: 40 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, letterSpacing: 3, color: "#8a857e" }}>{r.toUpperCase()}</div>
            {[0, 1, 2].map((l) => <div key={l} style={{ height: 6, marginTop: 12, width: `${58 + ((j * 13 + l * 19) % 38)}%`, background: "#cfc8bb" }} />)}
          </div>
        ))}
      </div>
      {/* contraluz ámbar mínimo detrás del carnet */}
      <Contraluz x={200} y={PISO - CH - 40} w={680} h={CH + 40} o={0x40} />
      {/* pedestal de piedra */}
      <div style={{ position: "absolute", left: 150, width: 780, top: PISO + 10, bottom: -40,
        background: "linear-gradient(90deg, #0c0c0d 0%, #1d1d20 30%, #26262a 50%, #1a1a1d 72%, #0a0a0b 100%)" }} />
      <div style={{ position: "absolute", left: 150, width: 780, top: PISO + 10, height: 260,
        background: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent)" }} />
      <div style={{ position: "absolute", left: 150, width: 780, top: PISO - 40, height: 100, borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 40%, #3a3a3f 0%, #232326 55%, #161618 100%)",
        boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.10), 0 1.5px 0 ${AMBAR}66` }} />
      {/* reflejo del carnet en la piedra pulida */}
      <div style={{ position: "absolute", left: CX, top: PISO - 2, width: CW, height: 70, overflow: "hidden", borderRadius: "0 0 50% 50%" }}>
        <div style={{ transform: "scaleY(-1) translateY(-2px)", transformOrigin: "50% 0", opacity: 0.16, filter: "blur(2px)",
          WebkitMaskImage: "linear-gradient(0deg, #000 0%, transparent 14%)", maskImage: "linear-gradient(0deg, #000 0%, transparent 14%)" }}>
          <div style={{ marginTop: -CH }}><CarnetSetterFrente ancho={CW} /></div>
        </div>
      </div>
      {/* sombra de contacto */}
      <div style={{ position: "absolute", left: CX + 60, top: PISO - 14, width: CW - 120, height: 30, borderRadius: "50%", filter: "blur(10px)", background: "rgba(0,0,0,0.85)" }} />
      {/* el carnet, parado, apenas inclinado hacia atrás */}
      <div style={{ position: "absolute", left: CX, top: PISO - CH, width: CW, height: CH, perspective: 2600 }}>
        <div style={{ position: "relative", transform: "rotateX(9deg) rotateY(-7deg)", transformOrigin: "50% 100%",
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.75))" }}>
          <CarnetSetterFrente ancho={CW} />
          {/* barrido de luz del foco sobre el plástico */}
          <div style={{ position: "absolute", inset: 0, borderRadius: CW * 0.036, overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
            <div style={{ position: "absolute", inset: "-20% -10%",
              background: "linear-gradient(112deg, transparent 30%, rgba(255,255,255,0.05) 38%, rgba(255,255,255,0.22) 44%, rgba(255,255,255,0.05) 50%, transparent 58%)" }} />
          </div>
        </div>
      </div>
      {/* "lo están viendo": una sola pieza de UI, chica */}
      <div style={{ position: "absolute", left: 96, top: PISO - CH - 120, display: "flex", alignItems: "center", gap: 16, padding: "14px 26px 14px 14px",
        borderRadius: 999, background: "rgba(20,20,23,0.85)", border: `1.5px solid ${INK[700]}`, boxShadow: "0 20px 40px rgba(0,0,0,0.7)" }}>
        <div style={{ display: "flex" }}>
          {["DM", "AR", "JC"].map((n, j) => (
            <div key={n} style={{ width: 52, height: 52, borderRadius: 26, marginLeft: j ? -14 : 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: j === 0 ? AMBAR : INK[700], color: j === 0 ? "#1c1103" : RC.platino300, border: "3px solid #141417",
              fontFamily: SANS, fontWeight: 800, fontSize: 19 }}>{n}</div>
          ))}
        </div>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 27, color: RC.crema }}>12 directores vieron tu carnet</span>
      </div>
      {/* escuadras de vitrina */}
      <Escuadra x={70} y={PISO - CH - 170} r={0} />
      <Escuadra x={1080 - 116} y={PISO - CH - 170} r={90} />
      {/* placa del pedestal: el llamado */}
      <div style={{ position: "absolute", left: 0, right: 0, top: PISO + 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ width: 70, height: 1.5, background: AMBAR }} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: RC.crema }}>ELEGÍ «SOY SETTER»</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 4, color: RC.platino500 }}>AL REGISTRARTE</div>
      </div>
    </Estudio2>
  );
};
