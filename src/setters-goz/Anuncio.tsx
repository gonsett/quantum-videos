import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Capa, Ctx, Cam, rebote, sacudida, cl, ease, TIGHT, SERIF, SERIF_IT, TINTA, AMBAR, Letras, Confeti, Estrella, Tipeo, Pal } from "./MuestraV2";
import { CarnetSetterFrente } from "../historias-rc/carnet-setter-real";
import TLJ from "../../timeline-anuncio-setters.json";

/**
 * Anuncio "Llegó Ring Setters" (04/10/2026). Motor de MuestraV2 (el formato Gozmotion aprobado), con las lecciones
 * del Completo rechazado: SIN cajas de selección, SIN pausas entre escenas (las tomas van recortadas y la cámara
 * viaja durante el final de la frase anterior), y un recurso DISTINTO por escena (diario, ticket de cita, logo con
 * radar, tarjetas apiladas, devolución con estrellas, tabla que se reordena, carnet que gira, ofertas con sello,
 * cuerdas de ring, placa final). La pared no es una tira: la cámara baja, avanza y vuelve a subir.
 * Javier: "dopamínico, pero tranquilo" → movimientos con rebote, golpes de cámara suaves (no sacudones).
 */

type Palabra = { palabra: string; cuadro: number };
type EscJ = { id: string; from: number; durationInFrames: number; clips: { voz: string; enEscena: number; palabras: Palabra[] }[] };
const ESC = (TLJ as { escenas: EscJ[] }).escenas.map((e) => ({ ...e, s: e.from * 2, d: e.durationInFrames * 2 }));
export const TOTAL_ANUNCIO = (TLJ as { total: number }).total * 2;

const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const W = (i: number, p: string, vez = 1) => {
  let n = 0;
  for (const x of ESC[i].clips[0].palabras) if (norm(x.palabra) === norm(p) && ++n === vez) return ESC[i].s + 2 * x.cuadro;
  throw new Error(`palabra ${p} no está en ${ESC[i].id}`);
};
// renglones para Tipeo: índices de palabras [desde, hasta), cortes de renglón y palabras en itálica ámbar
const frase = (i: number, desde: number, hasta: number, cortes: number[], acentos: number[] = []): Pal[][] => {
  const ps = ESC[i].clips[0].palabras;
  const r: Pal[][] = [[]];
  for (let j = desde; j < hasta; j++) {
    if (cortes.includes(j)) r.push([]);
    const t = (2 * ps[j].cuadro) / 60, fin = j + 1 < ps.length ? (2 * ps[j + 1].cuadro) / 60 : t + 0.4;
    r[r.length - 1].push({ palabra: ps[j].palabra, t, fin, it: acentos.includes(j), acento: acentos.includes(j) });
  }
  return r;
};

// centros de cada escena sobre la pared: avanza, baja, avanza, vuelve a subir, avanza
const C = [
  { x: 0, y: 0 }, { x: 2100, y: 0 }, { x: 2100, y: 2400 }, { x: 4200, y: 2400 }, { x: 6300, y: 2400 },
  { x: 6300, y: 0 }, { x: 8400, y: 0 }, { x: 10500, y: 0 }, { x: 12600, y: 0 }, { x: 14700, y: 0 },
];
const ANTES = 16, DESPUES = 22; // el viaje empieza durante la cola de la frase anterior: no hay pausa
const idx = (t: number) => { let i = 0; for (let j = 1; j < ESC.length; j++) if (ESC[j].s - ANTES <= t) i = j; return i; };

// golpes de cámara (suaves) en las palabras fuertes
const GOLPES: number[][] = [
  [W(0, "closers")], [W(1, "ninguna"), W(1, "cierre")], [W(2, "cita"), W(2, "Ring"), W(2, "Setters")], [W(3, "todas")],
  [W(4, "verdad"), W(4, "ir")], [W(5, "Subís"), W(5, "trofeos")], [W(6, "carnet"), W(6, "directores")], [W(7, "ofertas"), W(7, "setters")],
  [W(8, "ring"), W(8, "setters")], [W(9, "Ring"), W(9, "abierto")],
];
const zEsc = (i: number, t: number) => {
  const e = ESC[i];
  let z = -1960 + 240 * interpolate(t, [e.s, e.s + e.d], [0, 1], { ...cl, easing: Easing.out(Easing.quad) });
  if (i === 2) z -= 260 * interpolate(t, [W(2, "Llegó") - 6, W(2, "Ring") + 4], [0, 1], { ...cl, easing: ease }) * (1 - interpolate(t, [W(2, "Setters") + 10, e.s + e.d], [0, 0.6], cl));
  if (i === 9) z += 200 * interpolate(t, [e.s, e.s + e.d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return z;
};
const xEsc = (i: number, t: number) => (i === 8 ? interpolate(t, [ESC[8].s, W(8, "ring") + 10, W(8, "Ahora") - 6, W(8, "Ahora") + 30], [-150, -160, -160, 160], { ...cl, easing: ease }) : 0);

const camA = (t: number): Cam => {
  const i = idx(t), a = C[Math.max(0, i - 1)], b = C[i];
  const w = i === 0 ? 1 : interpolate(t, [ESC[i].s - ANTES, ESC[i].s + DESPUES], [0, 1], { ...cl, easing: Easing.inOut(Easing.poly(5)) });
  const arco = Math.sin(w * Math.PI);
  const dx = b.x - a.x, dy = b.y - a.y;
  const llegada = interpolate(t, [0, 120], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  let z = (i === 0 ? zEsc(0, t) : zEsc(i - 1, t) + (zEsc(i, t) - zEsc(i - 1, t)) * w) - 280 * arco - 600 * (1 - llegada);
  let x = a.x + dx * w + (i === 0 ? xEsc(0, t) : xEsc(i - 1, t) * (1 - w) + xEsc(i, t) * w) + Math.sin(t / 95) * 12;
  let y = a.y + dy * w - 20 + Math.sin(t / 77) * 9;
  let roll = (dx ? -7 : 4) * arco + interpolate(t, [0, 80], [6, 0], { ...cl, easing: ease });
  for (const g of GOLPES.flat()) {
    if (t < g - 2 || t > g + 90) continue;
    z += 80 * rebote(t, g, 10, 200);
    x += sacudida(t, g, 4);
    y += sacudida(t, g + 1, 3);
    roll += sacudida(t, g, 0.22);
  }
  const yaw = (Math.sin(t / 110) * 2 + (dx ? 5 : 0) * arco) * Math.PI / 180;
  const pitch = (Math.sin(t / 130) * 1.1 + (dy ? 4 * Math.sign(dy) : 0) * arco) * Math.PI / 180;
  return { x, y, z, roll: (roll * Math.PI) / 180, yaw, pitch };
};
const velA = (f: number) => {
  const a = camA(f - 0.5), b = camA(f + 0.5);
  return Math.hypot(b.x - a.x, b.y - a.y, (b.z - a.z) * 0.4);
};

// ---------- utilería ----------
const SOMBRA = "0 46px 90px rgba(45,35,25,0.26), 0 8px 18px rgba(45,35,25,0.18)";
const Papel: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ width: "100%", height: "100%", background: "#fbfaf7", borderRadius: 22, boxShadow: SOMBRA, boxSizing: "border-box", fontFamily: TIGHT, color: TINTA, position: "relative", ...style }}>{children}</div>
);
const Rotulo: React.FC<{ children: React.ReactNode; color?: string; tam?: number }> = ({ children, color = "#8a857e", tam = 22 }) => (
  <div style={{ fontFamily: TIGHT, fontSize: tam, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 600, color }}>{children}</div>
);
const Pieza: React.FC<{ k: Ctx; en: number; x: number; y: number; z?: number; w: number; h: number; rot?: number; desde?: "abajo" | "arriba" | "cerca"; children: React.ReactNode }> =
  ({ k, en, x, y, z = 0, w, h, rot = 0, desde = "abajo", children }) => {
    if (k.t < en - 2) return null;
    const r = rebote(k.t, en, 12, 165);
    const op = interpolate(k.t, [en, en + 6], [0, 1], cl);
    const dy = desde === "abajo" ? 160 : desde === "arriba" ? -220 : 0;
    const dz = desde === "cerca" ? -700 : 0;
    return <Capa k={k} x={x} y={y + (1 - r) * dy} z={z + (1 - r) * dz} w={w} h={h} rot={rot + (1 - r) * (desde === "arriba" ? -10 : 8)} esc={0.7 + 0.3 * r} op={op}>{children}</Capa>;
  };
const Obj: React.FC<{ src: string; gris?: boolean }> = ({ src, gris }) => (
  <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain", filter: `${gris ? "grayscale(1) contrast(1.12) " : ""}drop-shadow(0 30px 30px rgba(40,30,20,0.32))` }} />
);
const Iniciales: React.FC<{ txt: string; tam: number; acento?: boolean }> = ({ txt, tam, acento }) => (
  <div style={{ width: tam, height: tam, borderRadius: tam / 2, background: acento ? AMBAR : "#e4e0d8", color: acento ? "#fff" : "#5d5953", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: TIGHT, fontWeight: 600, fontSize: tam * 0.36, flexShrink: 0 }}>{txt}</div>
);
// anillos de radar que se dibujan y se expanden (la "señal" del setter)
const Radar: React.FC<{ t: number; en: number; tam: number; n?: number; lento?: boolean }> = ({ t, en, tam, n = 4, lento }) => (
  <svg width={tam} height={tam} viewBox="-100 -100 200 200" style={{ overflow: "visible" }}>
    {Array.from({ length: n }, (_, j) => {
      const a = en + j * 7;
      const dib = interpolate(t, [a, a + 34], [0, 1], { ...cl, easing: ease });
      const late = lento ? 1 + 0.03 * Math.sin((t - a) / 40 + j) : 1;
      return <circle key={j} r={(30 + j * 22) * late} fill="none" stroke={j === 0 ? AMBAR : TINTA} strokeWidth={j === 0 ? 1.6 : 0.7} opacity={j === 0 ? 0.95 : 0.45 - j * 0.07}
        pathLength={1} strokeDasharray={`${dib} 1`} transform="rotate(-90)" />;
    })}
  </svg>
);

// ---------- las diez escenas ----------
const Contenido: React.FC<{ k: Ctx; i: number }> = ({ k, i }) => {
  const t = k.t, e = ESC[i], { x: X, y: Y } = C[i];
  const w = (p: string, vez = 1) => W(i, p, vez);
  const fin = e.s + e.d;
  const sale = (a = fin - 10, b = fin + 16) => interpolate(t, [a, b], [1, 0], cl);
  switch (i) {
    case 0: { // el closer, con CLOSERS detrás de la cabeza (la muestra aprobada, sin la caja)
      const sube = rebote(t, 6, 14, 90);
      const clos = rebote(t, w("closers"), 10, 190);
      return (
        <>
          <Capa k={k} x={X} y={Y - 690} z={-170} w={700} h={50} op={interpolate(t, [20, 40], [0, 1], cl) * sale()}>
            <div style={{ textAlign: "center" }}><Rotulo>N° 0001 · Ring Closers</Rotulo></div>
          </Capa>
          <Capa k={k} x={X + 40} y={Y - 150} z={300} w={1400} h={330} esc={0.92 + 0.08 * clos}>
            {t >= w("closers") - 2 ? (
              <div style={{ width: 1400, height: 330, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Letras t={t} en={w("closers")} texto="CLOSERS" paso={2.2} style={{ fontFamily: TIGHT, fontWeight: 900, fontSize: 235, letterSpacing: "-0.05em", color: TINTA, lineHeight: 1 }} />
              </div>
            ) : null}
          </Capa>
          <Capa k={k} x={X + 110} y={Y + 640 + (1 - sube) * 600} z={140} w={1700} h={1700} op={0.28 * Math.min(1, sube * 1.4)} desenf={10}>
            <Img src={staticFile("setters-goz/closer-recorte.png")} style={{ width: "100%", height: "100%", filter: "brightness(0)" }} />
          </Capa>
          <Capa k={k} x={X} y={Y + 600 + (1 - sube) * 700} z={0} w={1700} h={1700}>
            <Img src={staticFile("setters-goz/closer-recorte.png")} style={{ width: "100%", height: "100%", filter: "contrast(1.1) brightness(1.02)" }} />
          </Capa>
          <Capa k={k} x={X + 420} y={Y - 430} z={120} w={130} h={130} rot={t * 0.6} esc={Math.max(0, rebote(t, w("closers") + 14, 8, 240))}><Estrella color={TINTA} tam={130} /></Capa>
          <Capa k={k} x={X - 430} y={Y + 330} z={-120} w={80} h={80} rot={-t * 0.8} esc={Math.max(0, rebote(t, w("closers") + 20, 8, 240))}><Estrella color={AMBAR} tam={80} /></Capa>
          <Capa k={k} x={X} y={Y - 470} z={-170} w={1000} h={200} op={sale()}>
            <Tipeo t={t} desde={e.s} renglones={frase(0, 0, 7, [2], [6])} tam={88} />
          </Capa>
        </>
      );
    }
    case 1: { // recorte de diario que cae: el titular se escribe solo y "cierre" queda tachado
      const cae = rebote(t, e.s - 8, 11, 140);
      const tacha = interpolate(t, [w("cierre") + 26, w("cierre") + 46], [0, 1], { ...cl, easing: ease });
      return (
        <>
          <Capa k={k} x={X + 10} y={Y + 60 - (1 - cae) * 1000} z={30} w={940} h={1360} rot={-2.5 - (1 - cae) * 12}>
            <Papel style={{ borderRadius: 4, padding: "56px 60px", background: "#f8f6f1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `3px solid ${TINTA}`, paddingBottom: 14 }}>
                <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1, letterSpacing: "-0.01em" }}>El Diario de Ventas</div>
                <Rotulo tam={16}>Edición N° 41</Rotulo>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #b9b3a9", padding: "10px 0", marginBottom: 40 }}>
                <Rotulo tam={15}>Comercial</Rotulo><Rotulo tam={15}>Octubre</Rotulo><Rotulo tam={15}>Opinión</Rotulo>
              </div>
              <div style={{ height: 300 }}>
                <Tipeo t={t} desde={e.s} renglones={frase(1, 0, 7, [3])} tam={82} />
              </div>
              <div style={{ position: "relative", height: 560, marginTop: 30 }}>
                <Img src={staticFile("setters-goz/cierre.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%", filter: "grayscale(1) contrast(1.1)" }} />
              </div>
              <div style={{ display: "flex", gap: 22, marginTop: 26 }}>
                {[0, 1, 2].map((j) => (
                  <div key={j} style={{ flex: 1 }}>{[0, 1, 2, 3].map((l) => <div key={l} style={{ height: 6, marginBottom: 10, width: `${70 + ((j * 7 + l * 13) % 30)}%`, background: "#cfc9be" }} />)}</div>
                ))}
              </div>
            </Papel>
          </Capa>
          {/* "cierre." grande, en itálica, por delante del diario: se tacha con un trazo ámbar */}
          <Capa k={k} x={X + 150} y={Y + 470} z={-160} w={760} h={300} rot={-4}>
            {t >= w("cierre") - 2 ? (
              <div style={{ position: "relative", width: 760, height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Letras t={t} en={w("cierre")} texto="cierre." paso={2.4} style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 250, color: TINTA, letterSpacing: "-0.03em", lineHeight: 1 }} />
                <svg width={760} height={300} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                  <path d="M40,170 C220,150 420,175 720,138" fill="none" stroke={AMBAR} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${tacha} 1`} />
                </svg>
              </div>
            ) : null}
          </Capa>
          <Capa k={k} x={X - 420} y={Y - 520} z={-80} w={90} h={90} rot={t * 0.7} esc={Math.max(0, rebote(t, w("venta"), 8, 240))}><Estrella color={AMBAR} tam={90} /></Capa>
        </>
      );
    }
    case 2: { // la setter, el ticket de la cita y el logo con el radar
      const sube = rebote(t, e.s - 4, 13, 95);
      const llego = w("Llegó");
      const f1 = interpolate(t, [llego - 8, llego + 8], [1, 0], cl);
      const ticket = interpolate(t, [llego - 4, llego + 14], [1, 0], cl);
      return (
        <>
          <Capa k={k} x={X} y={Y - 700} z={-170} w={1000} h={190} op={f1} desenf={(1 - f1) * 12}>
            <Tipeo t={t} desde={e.s} renglones={frase(2, 0, 7, [3], [6])} tam={80} />
          </Capa>
          {t >= w("Ring") - 2 ? (
            <>
              <Capa k={k} x={X} y={Y - 260} z={340} w={1500} h={1500}><Radar t={t} en={w("Ring") - 4} tam={1500} n={5} /></Capa>
              <Capa k={k} x={X} y={Y - 470} z={300} w={1300} h={160}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Letras t={t} en={w("Ring")} texto="RING" paso={2.6} style={{ fontFamily: TIGHT, fontWeight: 900, fontSize: 150, letterSpacing: "0.2em", color: TINTA, lineHeight: 1 }} />
                </div>
              </Capa>
              <Capa k={k} x={X + 20} y={Y - 230} z={300} w={1500} h={330} esc={0.9 + 0.1 * rebote(t, w("Setters"), 10, 190)}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Letras t={t} en={w("Setters")} texto="Setters" paso={2.2} style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 300, color: AMBAR, letterSpacing: "-0.03em", lineHeight: 1 }} />
                </div>
              </Capa>
            </>
          ) : null}
          <Capa k={k} x={X + 150} y={Y + 700 + (1 - sube) * 800} z={140} w={1500} h={1500} op={0.26 * Math.min(1, sube * 1.4)} desenf={10}>
            <Img src={staticFile("setters-goz/setter-recorte2.png")} style={{ width: "100%", height: "100%", filter: "brightness(0)" }} />
          </Capa>
          <Capa k={k} x={X + 40} y={Y + 660 + (1 - sube) * 900} z={0} w={1500} h={1500}>
            <Img src={staticFile("setters-goz/setter-recorte2.png")} style={{ width: "100%", height: "100%", filter: "grayscale(1) contrast(1.12)" }} />
          </Capa>
          {/* ticket de la cita: entra en "cita" y se va cuando llega el logo */}
          <Pieza k={k} en={w("cita") - 4} x={X - 300} y={Y + 140} z={-200} w={440} h={250} rot={-5}>
            <div style={{ width: "100%", height: "100%", opacity: ticket }}>
              <Papel style={{ padding: "30px 34px", borderRadius: 16 }}>
                <Rotulo tam={16}>Cita agendada</Rotulo>
                <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.05, marginTop: 10 }}>Jue 8 · 19:00</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontWeight: 600, fontSize: 22, color: AMBAR }}>
                  <svg width={30} height={30} viewBox="0 0 30 30"><circle cx={15} cy={15} r={14} fill={AMBAR} /><path d="M8,15.5 L13,20 L22,10" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" /></svg>
                  Confirmada
                </div>
              </Papel>
            </div>
          </Pieza>
          <Confeti k={k} desde={w("Setters") - 4} hasta={fin + 10} n={30} cx={X} ancho={1700} semilla="b" />
          <Capa k={k} x={X - 440} y={Y - 30} z={-120} w={100} h={100} rot={t * 0.7} esc={Math.max(0, rebote(t, w("Setters") + 12, 8, 240))}><Estrella color={AMBAR} tam={100} /></Capa>
          <Capa k={k} x={X + 450} y={Y - 640} z={60} w={70} h={70} rot={-t} esc={Math.max(0, rebote(t, w("Setters") + 18, 8, 240))}><Estrella color={TINTA} tam={70} /></Capa>
        </>
      );
    }
    case 3: { // tres roleplays que caen y se apilan + la semana que se completa
      const rivales = [["Martín P.", "MP"], ["Tomás R.", "TR"], ["Valentina G.", "VG"]];
      const dias = ["L", "M", "M", "J", "V", "S", "D"];
      const ent = [w("Practicás") + 4, w("llamadas"), w("setters")];
      return (
        <>
          <Capa k={k} x={X} y={Y - 690} z={-170} w={1000} h={190} op={sale()}>
            <Tipeo t={t} desde={e.s} renglones={frase(3, 0, 6, [3])} tam={76} />
          </Capa>
          {rivales.map(([n, ini], j) => (
            <Pieza key={j} k={k} en={ent[j]} desde="arriba" x={X - 20 + (j - 1) * 30} y={Y + 40 + j * 70} z={-20 * j} w={860} h={430} rot={[-6, 4, -1.5][j]}>
              <Papel style={{ padding: "36px 46px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><Rotulo tam={18}>Roleplay · Semana 41</Rotulo><Rotulo tam={18} color={AMBAR}>{["Enseñás", "Rivalidad", "Aprendés"][j]}</Rotulo></div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 46 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Iniciales txt="VOS" tam={96} acento /><span style={{ fontWeight: 600, fontSize: 34 }}>Vos</span></div>
                  <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 90, color: AMBAR, lineHeight: 1 }}>vs</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}><span style={{ fontWeight: 600, fontSize: 34 }}>{n}</span><Iniciales txt={ini} tam={96} /></div>
                </div>
                <div style={{ borderTop: "1.5px solid #e4e0d8", marginTop: 46, paddingTop: 22, fontSize: 26, color: "#8a857e", fontWeight: 500 }}>{["martes", "jueves", "sábado"][j]} · 19:00 · llamada de agenda</div>
              </Papel>
            </Pieza>
          ))}
          {/* la semana: un punto ámbar por día, se encienden con "todas las semanas" */}
          <Capa k={k} x={X} y={Y + 700} z={-140} w={900} h={150} op={interpolate(t, [w("todas") - 16, w("todas")], [0, 1], cl)}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {dias.map((d, j) => {
                const en = w("todas") + j * 6;
                const r = Math.max(0, rebote(t, en, 9, 230));
                return (
                  <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 86, height: 86, borderRadius: 43, border: `2px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 70, height: 70, borderRadius: 35, background: AMBAR, transform: `scale(${r})` }} />
                    </div>
                    <span style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 24, color: "#5d5953" }}>{d}</span>
                  </div>
                );
              })}
            </div>
          </Capa>
        </>
      );
    }
    case 4: { // la devolución del compañero: estrellas que se encienden y el "sí, iba a ir"
      const estrellas = [0, 1, 2, 3, 4].map((j) => w("verdad") + 4 + j * 7);
      const si = w("ir");
      return (
        <>
          <Capa k={k} x={X} y={Y - 720} z={-170} w={1000} h={190} op={sale()}>
            <Tipeo t={t} desde={e.s} renglones={frase(4, 0, 9, [4], [8])} tam={72} />
          </Capa>
          <Pieza k={k} en={e.s + 6} desde="cerca" x={X} y={Y + 150} z={0} w={880} h={1080} rot={-2}>
            <Papel style={{ padding: "54px 60px" }}>
              <Rotulo tam={18}>Devolución del roleplay</Rotulo>
              <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 30 }}>
                <Iniciales txt="TR" tam={92} />
                <div><div style={{ fontWeight: 600, fontSize: 34 }}>Tomás R.</div><div style={{ fontSize: 24, color: "#8a857e", marginTop: 4 }}>tu compañero de la semana</div></div>
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 50 }}>
                {estrellas.map((en, j) => {
                  const r = Math.max(0, rebote(t, en, 8, 240));
                  return (
                    <div key={j} style={{ position: "relative", width: 104, height: 104 }}>
                      <div style={{ position: "absolute", inset: 0, opacity: 0.18 }}><Estrella color={TINTA} tam={104} /></div>
                      <div style={{ position: "absolute", inset: 0, transform: `scale(${r}) rotate(${(1 - r) * 40}deg)` }}><Estrella color={AMBAR} tam={104} /></div>
                    </div>
                  );
                })}
              </div>
              <div style={{ borderTop: "1.5px solid #e4e0d8", marginTop: 50, paddingTop: 40, height: 230 }}>
                <Tipeo t={t} desde={e.s} renglones={frase(4, 9, 17, [12], [13])} tam={70} />
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
                {["Sí, iba a ir", "No iba"].map((o, j) => {
                  const on = j === 0 ? interpolate(t, [si + 6, si + 14], [0, 1], cl) : 0;
                  return (
                    <div key={j} style={{ height: 76, padding: "0 34px", borderRadius: 38, display: "flex", alignItems: "center", fontWeight: 600, fontSize: 28,
                      border: `2px solid ${on ? AMBAR : "#d6d1c8"}`, background: on ? AMBAR : "transparent", color: on ? "#fff" : "#8a857e",
                      transform: `scale(${j === 0 ? 1 + 0.08 * Math.sin(Math.min(1, Math.max(0, (t - si - 6) / 14)) * Math.PI) : 1})` }}>{o}</div>
                  );
                })}
              </div>
            </Papel>
          </Pieza>
        </>
      );
    }
    case 5: { // la tabla de la comunidad: tu fila sube del 6° al 2° puesto; después, los trofeos
      const filas = [["Sofía L.", "SL", 1840], ["Diego A.", "DA", 1710], ["Camila R.", "CR", 1655], ["Nico B.", "NB", 1590], ["Pablo M.", "PM", 1530]];
      const sube = interpolate(t, [w("Subís") + 6, w("tabla") + 10], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
      const posVos = 5 - 4 * sube; // de 6° (índice 5) a 2° (índice 1)
      const pts = Math.round(1480 + 270 * sube);
      const trofeos = [["setters-rc/tro/setter_first_roleplay-hd.webp", w("ganás")], ["setters-rc/tro/setter_five_stars-hd.webp", w("trofeos")], ["setters-rc/tro/setter_streak_10-hd.webp", w("setter")]] as const;
      return (
        <>
          <Capa k={k} x={X} y={Y - 730} z={-170} w={1000} h={190} op={sale()}>
            <Tipeo t={t} desde={e.s} renglones={frase(5, 0, 7, [3])} tam={72} />
          </Capa>
          <Pieza k={k} en={e.s + 2} x={X} y={Y - 20} z={20} w={860} h={980} rot={1.5}>
            <Papel style={{ padding: "48px 50px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><Rotulo tam={18}>Tabla · tu comunidad</Rotulo><Rotulo tam={18}>Octubre</Rotulo></div>
              <div style={{ position: "relative", height: 6 * 132, marginTop: 34 }}>
                {filas.map((f, b) => {
                  const pos = b + interpolate(posVos, [b, b + 1], [1, 0], cl); // baja un lugar cuando "Vos" lo pasa
                  return (
                    <div key={b} style={{ position: "absolute", left: 0, right: 0, top: pos * 132, height: 116, display: "flex", alignItems: "center", gap: 24,
                      borderBottom: "1.5px solid #ece8e1", fontSize: 30, fontWeight: 500, color: "#3b3834" }}>
                      <span style={{ width: 50, fontFamily: SERIF, fontSize: 46, color: "#a39d93" }}>{Math.round(pos + 1)}</span>
                      <Iniciales txt={f[1] as string} tam={70} /><span style={{ flex: 1 }}>{f[0]}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{f[2]}</span>
                    </div>
                  );
                })}
                <div style={{ position: "absolute", left: -20, right: -20, top: posVos * 132 - 6, height: 128, display: "flex", alignItems: "center", gap: 24, padding: "0 20px",
                  background: "#fff", borderRadius: 18, boxShadow: `0 ${18 + 30 * Math.sin(sube * Math.PI)}px ${40 + 40 * Math.sin(sube * Math.PI)}px rgba(45,35,25,0.22)`,
                  borderLeft: `8px solid ${AMBAR}`, fontSize: 32, fontWeight: 600, transform: `scale(${1 + 0.05 * Math.sin(sube * Math.PI)})` }}>
                  <span style={{ width: 50, fontFamily: SERIF, fontSize: 50, color: AMBAR }}>{Math.round(posVos + 1)}</span>
                  <Iniciales txt="VOS" tam={74} acento /><span style={{ flex: 1 }}>Vos</span>
                  <span style={{ color: AMBAR, fontSize: 26, opacity: sube }}>▲ {Math.round(4 * sube)}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{pts}</span>
                </div>
              </div>
            </Papel>
          </Pieza>
          {trofeos.map(([src, en], j) => (
            <Pieza key={j} k={k} en={en} desde="cerca" x={X + [-310, 20, 330][j]} y={Y + 560 - (j === 1 ? 50 : 0)} z={-260} w={j === 1 ? 380 : 320} h={j === 1 ? 380 : 320}>
              <Obj src={src} />
            </Pieza>
          ))}
        </>
      );
    }
    case 6: { // el carnet gira y queda; el CV detrás; los directores lo están mirando
      const gira = rebote(t, w("carnet") - 4, 13, 120);
      const vistas = Math.round(interpolate(t, [w("directores"), w("directores") + 50], [0, 12], { ...cl, easing: Easing.out(Easing.cubic) }));
      return (
        <>
          <Capa k={k} x={X} y={Y - 740} z={-170} w={1000} h={190} op={sale()}>
            <Tipeo t={t} desde={e.s} renglones={frase(6, 0, 9, [5])} tam={72} />
          </Capa>
          <Pieza k={k} en={w("CV")} x={X + 250} y={Y + 300} z={180} w={640} h={900} rot={7}>
            <Papel style={{ borderRadius: 6, padding: "56px 54px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <Img src={staticFile("historias-setters-gem/avatar.jpg")} style={{ width: 110, height: 110, borderRadius: 55, objectFit: "cover", filter: "grayscale(1)" }} />
                <div><div style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1 }}>Lucía Ferraz</div><Rotulo tam={16} color={AMBAR}>Appointment setter</Rotulo></div>
              </div>
              {["Experiencia", "Show rate", "Logros"].map((s, j) => (
                <div key={j} style={{ marginTop: 44 }}>
                  <Rotulo tam={15}>{s}</Rotulo>
                  {[0, 1, 2].map((l) => <div key={l} style={{ height: 7, marginTop: 14, width: `${60 + ((j * 11 + l * 17) % 38)}%`, background: "#d9d3c9" }} />)}
                </div>
              ))}
            </Papel>
          </Pieza>
          {t >= w("carnet") - 6 ? (
            <Capa k={k} x={X - 40} y={Y - 80} z={-60} w={900} h={568} esc={0.8 + 0.2 * gira} op={interpolate(t, [w("carnet") - 6, w("carnet")], [0, 1], cl)}>
              <div style={{ width: 900, height: 568, transform: `perspective(2200px) rotateY(${(1 - gira) * 160 - 8}deg) rotateX(${(1 - gira) * 20 + 6}deg) rotateZ(-3deg)`,
                filter: "drop-shadow(0 50px 50px rgba(40,30,20,0.35))" }}>
                <CarnetSetterFrente ancho={900} />
              </div>
            </Capa>
          ) : null}
          <Pieza k={k} en={w("directores")} x={X - 120} y={Y + 620} z={-220} w={560} h={150} rot={-3}>
            <Papel style={{ borderRadius: 75, padding: "0 30px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ display: "flex" }}>{["DM", "AR", "JC"].map((x, j) => <div key={j} style={{ marginLeft: j ? -22 : 0, border: "4px solid #fbfaf7", borderRadius: 50 }}><Iniciales txt={x} tam={78} acento={j === 0} /></div>)}</div>
              <div><div style={{ fontFamily: SERIF, fontSize: 54, lineHeight: 1 }}>{vistas} directores</div><div style={{ fontSize: 22, color: "#8a857e" }}>vieron tu carnet</div></div>
            </Papel>
          </Pieza>
        </>
      );
    }
    case 7: { // ofertas que llegan como avisos, y el sello "para setters"
      const ofertas = [["Setter high ticket", "USD 1.200 + comisión", "Equipo Delta"], ["Setter bilingüe", "USD 1.500 + bonos", "Norte Coaching"], ["Setter de agenda", "USD 900 + comisión", "Grupo Alba"]];
      const ent = [w("llegan"), w("ofertas"), w("trabajo")];
      const sello = w("setters") - 3;
      const sr = rebote(t, sello, 9, 260);
      return (
        <>
          {ofertas.map(([a, b, c], j) => (
            <Pieza key={j} k={k} en={ent[j]} desde="arriba" x={X} y={Y - 470 + j * 300} z={-40 * j} w={900} h={250} rot={[-1.5, 1, -0.5][j]}>
              <Papel style={{ padding: "34px 40px", display: "flex", alignItems: "center", gap: 30 }}>
                <div style={{ width: 120, height: 120, borderRadius: 26, background: j === 0 ? AMBAR : "#ece8e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width={60} height={60} viewBox="0 0 60 60"><rect x={6} y={18} width={48} height={34} rx={6} fill="none" stroke={j === 0 ? "#fff" : TINTA} strokeWidth={4} /><path d="M20,18 V12 a4,4 0 0 1 4,-4 h12 a4,4 0 0 1 4,4 V18" fill="none" stroke={j === 0 ? "#fff" : TINTA} strokeWidth={4} /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><Rotulo tam={16} color={j === 0 ? AMBAR : "#8a857e"}>Nueva oferta</Rotulo><Rotulo tam={16}>ahora</Rotulo></div>
                  <div style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1.05, marginTop: 6 }}>{a}</div>
                  <div style={{ fontSize: 25, color: "#5d5953", marginTop: 6, fontWeight: 500 }}>{b} · {c}</div>
                </div>
              </Papel>
            </Pieza>
          ))}
          {t >= sello - 2 ? (
            <Capa k={k} x={X + 230} y={Y - 360} z={-180} w={420} h={180} rot={-12} esc={1 + (1 - sr) * 1.4} op={interpolate(t, [sello - 2, sello + 3], [0, 0.92], cl)}>
              <div style={{ width: "100%", height: "100%", border: `6px solid ${AMBAR}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: TIGHT, fontWeight: 900, fontSize: 52, letterSpacing: "0.12em", color: AMBAR, mixBlendMode: "multiply", background: "rgba(217,119,6,0.06)" }}>PARA SETTERS</div>
            </Capa>
          ) : null}
          <Capa k={k} x={X} y={Y + 590} z={-170} w={1000} h={190} op={sale()}>
            <Tipeo t={t} desde={e.s} renglones={frase(7, 0, 9, [4], [8])} tam={70} />
          </Capa>
        </>
      );
    }
    case 8: { // las cuerdas del ring: los closers a la izquierda, los setters a la derecha
      const ahora = w("Ahora");
      const f1 = interpolate(t, [ahora - 6, ahora + 8], [1, 0], cl);
      const cl8 = rebote(t, w("closers") - 6, 13, 110), st8 = rebote(t, w("setters") - 8, 13, 110);
      return (
        <>
          {[0, 1, 2].map((j) => {
            const d = interpolate(t, [e.s - 10 + j * 5, e.s + 30 + j * 5], [0, 1], { ...cl, easing: ease });
            return (
              <Capa key={j} k={k} x={X} y={Y - 120 + j * 150} z={320} w={3000} h={14}>
                <div style={{ width: `${d * 100}%`, height: 9, borderRadius: 5, background: j === 1 ? AMBAR : "#3b3834", opacity: 0.75, boxShadow: "0 18px 14px rgba(40,30,20,0.18)" }} />
              </Capa>
            );
          })}
          <Capa k={k} x={X - 380} y={Y - 470} z={160} w={700} h={170} op={interpolate(t, [w("closers"), w("closers") + 10], [0, 1], cl)}>
            {t >= w("closers") ? <Letras t={t} en={w("closers")} texto="CLOSERS" paso={2} style={{ fontFamily: TIGHT, fontWeight: 900, fontSize: 140, letterSpacing: "-0.04em", color: "#3b3834", lineHeight: 1 }} /> : null}
          </Capa>
          <Capa k={k} x={X + 380} y={Y - 300} z={160} w={800} h={260}>
            {t >= w("setters") ? <Letras t={t} en={w("setters")} texto="Setters" paso={2} style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 220, color: AMBAR, letterSpacing: "-0.03em", lineHeight: 1 }} /> : null}
          </Capa>
          <Capa k={k} x={X - 400} y={Y + 640 + (1 - cl8) * 900} z={40} w={1300} h={1300}>
            <Img src={staticFile("setters-goz/closer-recorte.png")} style={{ width: "100%", height: "100%", filter: "grayscale(1) contrast(1.05) brightness(1.04)" }} />
          </Capa>
          <Capa k={k} x={X + 400} y={Y + 660 + (1 - st8) * 1500} z={0} w={1300} h={1300} op={t >= w("setters") - 8 ? 1 : 0}>
            <Img src={staticFile("setters-goz/setter-recorte2.png")} style={{ width: "100%", height: "100%", filter: "grayscale(1) contrast(1.12)" }} />
          </Capa>
          <Capa k={k} x={X - 160} y={Y - 700} z={-170} w={1000} h={120} op={f1}>
            <Tipeo t={t} desde={e.s} renglones={frase(8, 0, 6, [])} tam={64} />
          </Capa>
          <Capa k={k} x={X + 160} y={Y - 700} z={-170} w={1100} h={120} op={interpolate(t, [ahora - 4, ahora + 4], [0, 1], cl) * sale()}>
            <Tipeo t={t} desde={e.s} renglones={frase(8, 6, 12, [], [11])} tam={64} />
          </Capa>
          <Capa k={k} x={X + 560} y={Y - 560} z={-60} w={90} h={90} rot={t * 0.8} esc={Math.max(0, rebote(t, w("suyo") + 4, 8, 240))}><Estrella color={AMBAR} tam={90} /></Capa>
        </>
      );
    }
    default: { // 9 · placa final: el logo con el radar, abierto
      const ya = [w("Ya"), w("está"), w("abierto")];
      const boton = w("abierto") + 40;
      return (
        <>
          <Capa k={k} x={X} y={Y - 260} z={260} w={1800} h={1800}><Radar t={t} en={e.s - 10} tam={1800} n={6} lento /></Capa>
          <Capa k={k} x={X} y={Y - 420} z={0} w={1000} h={120}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Letras t={t} en={w("Ring")} texto="RING" paso={2.6} style={{ fontFamily: TIGHT, fontWeight: 900, fontSize: 104, letterSpacing: "0.3em", color: TINTA, lineHeight: 1 }} />
            </div>
          </Capa>
          <Capa k={k} x={X} y={Y - 210} z={0} w={1200} h={300} esc={0.92 + 0.08 * rebote(t, w("Setters"), 10, 190)}>
            {t >= w("Setters") - 2 ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Letras t={t} en={w("Setters")} texto="Setters" paso={2.2} style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: 280, color: AMBAR, letterSpacing: "-0.03em", lineHeight: 1 }} />
              </div>
            ) : null}
          </Capa>
          <Capa k={k} x={X} y={Y + 60} z={-40} w={1000} h={60}>
            <div style={{ display: "flex", justifyContent: "center", gap: 26 }}>
              {["YA", "ESTÁ", "ABIERTO"].map((p, j) => (
                <span key={j} style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 40, letterSpacing: "0.42em", color: j === 2 ? AMBAR : TINTA,
                  opacity: interpolate(t, [ya[j] - 2, ya[j] + 8], [0, 1], cl), transform: `translateY(${(1 - Math.max(0, rebote(t, ya[j] - 2, 11, 200))) * 30}px)` }}>{p}</span>
              ))}
            </div>
          </Capa>
          <Pieza k={k} en={boton} x={X} y={Y + 300} z={-80} w={760} h={120}>
            <div style={{ width: "100%", height: "100%", borderRadius: 60, background: TINTA, color: "#f6f3ec", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: TIGHT, fontWeight: 600, fontSize: 34, boxShadow: "0 30px 60px rgba(30,25,20,0.3)" }}>
              Elegí «Soy setter» al registrarte
            </div>
          </Pieza>
          <Capa k={k} x={X} y={Y + 450} z={-80} w={900} h={50} op={interpolate(t, [boton + 14, boton + 30], [0, 1], cl)}>
            <div style={{ textAlign: "center", fontFamily: TIGHT, fontWeight: 500, fontSize: 28, color: "#5d5953", letterSpacing: "0.04em" }}>ringclosers.quantumcoffee.xyz</div>
          </Capa>
          <Confeti k={k} desde={w("abierto") - 4} hasta={fin} n={34} cx={X} ancho={1700} semilla="b" />
          <Capa k={k} x={X + 400} y={Y - 560} z={-60} w={110} h={110} rot={t * 0.6} esc={Math.max(0, rebote(t, w("Setters") + 12, 8, 240))}><Estrella color={AMBAR} tam={110} /></Capa>
          <Capa k={k} x={X - 420} y={Y + 150} z={60} w={70} h={70} rot={-t * 0.8} esc={Math.max(0, rebote(t, w("abierto") + 8, 8, 240))}><Estrella color={TINTA} tam={70} /></Capa>
        </>
      );
    }
  }
};

// pared de revoque en mosaico (espejada), con la sombra de la rama que se mece
const Pared: React.FC<{ k: Ctx }> = ({ k }) => {
  const vaiven = Math.sin(k.t / 60 * 0.9) * 1.6 + Math.sin(k.t / 60 * 2.3) * 0.5;
  const tiles: { x: number; y: number; n: number }[] = [];
  for (let c = 0; c < 4; c++) for (let r = 0; r < 2; r++) tiles.push({ x: 1100 + 5200 * c, y: 3600 * r, n: c * 2 + r });
  return (
    <>
      {tiles.filter((p) => Math.abs(p.x - k.c.x) < 5200 && Math.abs(p.y - k.c.y) < 4200).map((p) => (
        <Capa key={p.n} k={k} x={p.x} y={p.y} z={500} w={5204} h={3604} dof={0.35}>
          <Img src={staticFile("setters-goz/revoque.jpg")} style={{ width: "100%", height: "100%", transform: `scale(${p.n % 2 ? -1 : 1}, ${(p.n >> 1) % 2 ? -1 : 1})` }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 35% at 30% 30%, rgba(255,250,240,0.5), transparent 70%), radial-gradient(ellipse 40% 35% at 72% 60%, rgba(255,250,240,0.45), transparent 70%)" }} />
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", left: [1250, 3350][i], top: [-380, 1500][i], width: 1500, height: 1500, transformOrigin: "100% 0%",
              transform: `rotate(${vaiven + i * 8}deg) scaleX(${i ? -1 : 1})`, opacity: 0.18, filter: "blur(7px)", mixBlendMode: "multiply" }}>
              <Img src={staticFile("setters-goz/rama.png")} style={{ width: "100%", height: "100%" }} />
            </div>
          ))}
        </Capa>
      ))}
    </>
  );
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const k: Ctx = { t, c: camA(t), fz: -110 };
  const i = idx(t);
  return (
    <AbsoluteFill style={{ background: "#e7e5e1", overflow: "hidden" }}>
      <Pared k={k} />
      {[i - 1, i, i + 1].filter((j) => j >= 0 && j < ESC.length).map((j) => <Contenido key={j} k={k} i={j} />)}
      {/* apertura: nubes que la cámara atraviesa */}
      {t < 90 ? [
        { x: -520, y: -300, z: -1550, w: 2200, src: "nube1", s: -1 },
        { x: 560, y: 380, z: -1450, w: 2400, src: "nube2", s: 1 },
        { x: 80, y: -900, z: -1250, w: 2000, src: "nube1", s: 1 },
      ].map((n, j) => (
        <Capa key={j} k={k} x={n.x + n.s * interpolate(t, [0, 70], [0, 900], { ...cl, easing: Easing.out(Easing.quad) })} y={n.y} z={n.z} w={n.w} h={n.w * 0.6} op={interpolate(t, [40, 75], [1, 0], cl)} dof={0.7}>
          <Img src={staticFile(`setters-goz/${n.src}.png`)} style={{ width: "100%", height: "100%" }} />
        </Capa>
      )) : null}
      {/* en los viajes horizontales, una nube cruza por delante (no en todos: varía el paso) */}
      {[2, 5, 8].map((j) => {
        const s = ESC[j].s, a = C[j - 1], b = C[j];
        if (Math.abs(t - s) > 50) return null;
        return (
          <Capa key={`v${j}`} k={k} x={(a.x + b.x) / 2 + 200} y={(a.y + b.y) / 2 - 100} z={-420} w={2600} h={1560} op={interpolate(t, [s - 30, s - 6, s + 10, s + 34], [0, 0.9, 0.9, 0], cl)} dof={0.6}>
            <Img src={staticFile(`setters-goz/nube${j % 2 ? 1 : 2}.png`)} style={{ width: "100%", height: "100%" }} />
          </Capa>
        );
      })}
    </AbsoluteFill>
  );
};

export const AnuncioSetters: React.FC = () => {
  const f = useCurrentFrame();
  const v = velA(f);
  const n = v > 30 ? 6 : v > 10 ? 4 : 1;
  return (
    <AbsoluteFill style={{ background: "#e7e5e1" }}>
      {Array.from({ length: n }, (_, j) => (
        <AbsoluteFill key={j} style={{ opacity: 1 / (j + 1) }}>
          <Mundo t={n === 1 ? f : f - 0.35 + (0.7 * j) / (n - 1)} />
        </AbsoluteFill>
      ))}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="granoA"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 3)} />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.07 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 58%, rgba(55,48,40,0.2))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#granoA)" /></svg>
      {ESC.map((e) => (
        <Sequence key={e.id} from={e.s + 2 * e.clips[0].enEscena}><Audio src={staticFile(`voz-anuncio-setters/${e.clips[0].voz}.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
