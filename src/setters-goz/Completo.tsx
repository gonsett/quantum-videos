// Video completo de Ring Setters en el lenguaje Gozmotion (16 tomas, 60 fps).
// Tomas 01-02: la muestra v2 aprobada tal cual. Tomas 03-16: el mismo mundo (pared, cámara 3D, foco, rebotes),
// una escena por toma en la misma pared, unidas por látigos de cámara. Los tiempos salen de timeline-setters-rc.json (x2 a 60 fps).
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Escena, Capa, Ctx, Cam, rebote, sacudida, cl, ease, TIGHT, SERIF, SERIF_IT, TINTA, AMBAR, DUR_V2, X2, Caja, Letras, Confeti, velocidad } from "./MuestraV2";
import { CarnetSetterFrente } from "../historias-rc/carnet-setter-real";
import { TL } from "./timeline-completo";

const LEAD = 16;
export const S3 = DUR_V2 - 14;
type Esc = (typeof TL)[number] & { s: number };
export const ESC: Esc[] = (() => { let s = S3; return TL.map((e) => { const o = { ...e, s }; s += 2 * e.dur + LEAD; return o; }); })();
export const TOTAL_COMPLETO = ESC[ESC.length - 1].s + 2 * ESC[ESC.length - 1].dur + LEAD;
const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
export const W = (e: Esc, p: string, vez = 1) => {
  let n = 0;
  for (const x of e.palabras) if (norm(x.palabra) === norm(p) && ++n === vez) return e.s + LEAD + 2 * x.cuadro;
  return e.s + 60;
};

// palabra clave grande de cada escena (texto, palabra de la voz donde entra, vez, caja, palabra donde sale)
type Clave = { txt: string; p: string; vez?: number; caja?: boolean; hasta?: string };
const CLAVES: Clave[][] = [
  [{ txt: "la cita.", p: "cita" }],
  [{ txt: "todas las semanas.", p: "todas" }],
  [{ txt: "tu agenda.", p: "agenda", caja: true }],
  [{ txt: "un día antes.", p: "un" }],
  [{ txt: "la verdad.", p: "verdad", caja: true }],
  [{ txt: "show rate.", p: "show" }],
  [{ txt: "cada llamada.", p: "cada" }],
  [{ txt: "confirmada.", p: "confirmada", caja: true }],
  [{ txt: "señal.", p: "señal" }],
  [{ txt: "trofeos.", p: "trofeos" }],
  [{ txt: "directores.", p: "directores", caja: true }],
  [{ txt: "para setters.", p: "setters" }],
  [{ txt: "su ring.", p: "ring", hasta: "Ahora" }, { txt: "el suyo.", p: "suyo", caja: true }],
  [],
];
const golpes = (i: number) => {
  const e = ESC[i];
  const g = CLAVES[i].map((c) => W(e, c.p, c.vez));
  if (i === 0) g.push(W(e, "Setters"));
  if (i === 13) g.push(W(e, "Ring"), W(e, "abierto"));
  return g;
};

const XS = (i: number) => X2 + 2100 * (i + 1);
const idx = (t: number) => { let i = 0; for (let j = 0; j < ESC.length; j++) if (ESC[j].s <= t) i = j; return i; };
const WHIP = 30;
const camN = (t: number): Cam => {
  const i = idx(t), e = ESC[i], tl = t - e.s;
  const a = i === 0 ? X2 : XS(i - 1);
  const w = interpolate(tl, [0, WHIP], [0, 1], { ...cl, easing: Easing.inOut(Easing.poly(5)) });
  const arco = Math.sin(w * Math.PI);
  const g = golpes(i);
  let z = -1980 + 280 * interpolate(tl, [0, 2 * e.dur + LEAD], [0, 1], { ...cl, easing: Easing.out(Easing.quad) }) - 300 * arco;
  let x = a + (XS(i) - a) * w + Math.sin(t / 95) * 14;
  let y = -20 + Math.sin(t / 77) * 10;
  let roll = -9 * arco;
  for (const k of g) {
    z += 110 * rebote(t, k, 9, 210);
    x += sacudida(t, k, 8);
    y += sacudida(t, k + 1, 6);
    roll += sacudida(t, k, 0.45);
  }
  return { x, y, z, roll: (roll * Math.PI) / 180, yaw: ((Math.sin(t / 110) * 2.2 + 6 * arco) * Math.PI) / 180, pitch: (Math.sin(t / 130) * 1.2 * Math.PI) / 180 };
};
const velN = (f: number) => {
  const a = camN(f - 0.5), b = camN(f + 0.5);
  return Math.hypot(b.x - a.x, (b.z - a.z) * 0.3) * 0.88;
};

const SOMBRA = "0 46px 90px rgba(45,35,25,0.28), 0 8px 18px rgba(45,35,25,0.2)";
const Tarjeta: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ width: "100%", height: "100%", background: "#fbfaf7", borderRadius: 26, boxShadow: SOMBRA, padding: 44, boxSizing: "border-box", fontFamily: TIGHT, color: TINTA, ...style }}>{children}</div>
);
const Foto: React.FC<{ src: string }> = ({ src }) => (
  <div style={{ width: "100%", height: "100%", background: "#f6f4ef", padding: 18, boxShadow: SOMBRA, boxSizing: "border-box" }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.18)" }} />
  </div>
);
const Obj: React.FC<{ src: string }> = ({ src }) => (
  <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 30px 30px rgba(40,30,20,0.35))" }} />
);
const Rotulo: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "#8a857e" }) => (
  <div style={{ fontSize: 24, letterSpacing: 4, textTransform: "uppercase", fontWeight: 600, color }}>{children}</div>
);

// pieza que entra con rebote
const Pieza: React.FC<{ k: Ctx; en: number; x: number; y: number; z?: number; w: number; h: number; rot?: number; children: React.ReactNode }> =
  ({ k, en, x, y, z = 0, w, h, rot = 0, children }) => {
    const r = rebote(k.t, en, 12, 160);
    const op = interpolate(k.t, [en, en + 5], [0, 1], cl);
    return <Capa k={k} x={x} y={y + (1 - r) * 140} z={z} w={w} h={h} rot={rot + (1 - r) * 8} esc={0.6 + 0.4 * r} op={op}>{children}</Capa>;
  };

const Ondas: React.FC<{ t: number; n: number; alto: number; color?: string; vivo?: boolean }> = ({ t, n, alto, color = AMBAR, vivo = true }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, height: alto }}>
    {Array.from({ length: n }, (_, j) => {
      const a = 0.25 + 0.75 * Math.abs(Math.sin(j * 1.7 + (vivo ? t / 7 : 0)) * Math.cos(j * 0.37));
      return <div key={j} style={{ width: 9, height: alto * a, borderRadius: 5, background: color }} />;
    })}
  </div>
);

const Contenido: React.FC<{ k: Ctx; i: number }> = ({ k, i }) => {
  const e = ESC[i], t = k.t, X = XS(i);
  const w = (p: string, vez = 1) => W(e, p, vez);
  switch (i) {
    case 0: { // Llegó Ring Setters
      const en = w("Setters");
      return (<>
        <Capa k={k} x={X} y={-160} z={240} w={1400} h={360} op={interpolate(t, [en - 4, en + 4], [0, 1], cl)}>
          <div style={{ textAlign: "center" }}><Letras t={t} en={en - 2} texto="SETTERS" style={{ fontFamily: TIGHT, fontWeight: 900, fontSize: 330, letterSpacing: -8, color: TINTA, lineHeight: 1 }} /></div>
        </Capa>
        <Pieza k={k} en={e.s + 20} x={X + 170} y={170} w={1080} h={1080}><Obj src="setters-goz/setter-recorte2.png" /></Pieza>
      </>);
    }
    case 1: return (<>
      {[0, 1].map((j) => (
        <Pieza key={j} k={k} en={j ? w("otros") : w("Practicás")} x={X + (j ? 200 : -190)} y={j ? 40 : -70} z={j ? -40 : 0} w={520} h={760} rot={j ? 6 : -6}>
          <Tarjeta style={{ background: j ? "#1c1b19" : "#fbfaf7", color: j ? "#f3efe8" : TINTA, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Rotulo color={j ? "#a8a29a" : undefined}>Práctica de setting</Rotulo>
            <div><div style={{ fontSize: 54, fontWeight: 900 }}>{j ? "Tomás G." : "Vos"}</div><div style={{ fontSize: 26, opacity: 0.6 }}>{j ? "Setter · Five Stars" : "Setter · llamada en curso"}</div></div>
            <Ondas t={t} n={22} alto={150} />
            <div style={{ fontFamily: TIGHT, fontWeight: 600, fontSize: 40, color: AMBAR }}>{`0${4 + j}:${String(Math.floor(t / 60) % 60).padStart(2, "0")}`}</div>
          </Tarjeta>
        </Pieza>))}
    </>);
    case 2: {
      const ac = w("acomoda");
      return (<>
        <Pieza k={k} en={e.s + 22} x={X - 60} y={-30} w={820} h={700}>
          <Tarjeta>
            <Rotulo>Esta semana</Rotulo>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginTop: 26 }}>
              {["L", "M", "M", "J", "V", "S", "D"].map((d, j) => <div key={"d" + j} style={{ fontSize: 26, fontWeight: 600, textAlign: "center", opacity: 0.5 }}>{d}</div>)}
              {Array.from({ length: 28 }, (_, j) => {
                const on = [3, 9, 12, 17, 22, 25].includes(j);
                const r = on ? rebote(t, ac + (j % 7) * 4, 12, 200) : 0;
                return <div key={j} style={{ height: 96, borderRadius: 12, background: "#efece6", position: "relative", overflow: "hidden" }}>
                  {on && <div style={{ position: "absolute", inset: 6, borderRadius: 8, background: AMBAR, transform: `scale(${r})`, opacity: 0.9 }} />}
                </div>;
              })}
            </div>
          </Tarjeta>
        </Pieza>
        <Pieza k={k} en={w("Vos")} x={X + 270} y={330} z={-60} w={380} h={480} rot={7}><Foto src="historias-setters-gem/2.jpg" /></Pieza>
      </>);
    }
    case 3: {
      const avisos = [["Te proponen una práctica", "Jueves · 19:00 · con Tomás G.", w("proponen")], ["Recordatorio", "Mañana tenés práctica a las 19:00", w("recuerda")], ["Confirmada", "Los dos van a estar", w("antes")]] as const;
      return (<>{avisos.map(([a, b, en], j) => (
        <Pieza key={j} k={k} en={en} x={X + (j - 1) * 30} y={-230 + j * 230} z={-j * 20} w={860} h={190} rot={j % 2 ? 2 : -2}>
          <Tarjeta style={{ padding: "34px 40px", display: "flex", gap: 30, alignItems: "center" }}>
            <div style={{ width: 92, height: 92, borderRadius: 22, background: j === 2 ? TINTA : AMBAR, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 50, fontWeight: 900 }}>{j === 2 ? "✓" : "•"}</div>
            <div><div style={{ fontSize: 40, fontWeight: 900 }}>{a}</div><div style={{ fontSize: 28, opacity: 0.6, marginTop: 6 }}>{b}</div></div>
          </Tarjeta>
        </Pieza>))}</>);
    }
    case 4: {
      const no = w("ir");
      return (
        <Pieza k={k} en={w("terminar")} x={X} y={-20} w={860} h={640}>
          <Tarjeta style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Rotulo>Devolución de tu compañero</Rotulo>
            <div style={{ fontFamily: SERIF, fontSize: 92, lineHeight: 1 }}>¿Esa cita <i style={{ fontFamily: SERIF_IT, color: AMBAR }}>iba a ir</i>?</div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Sí", "No"].map((s, j) => (
                <div key={s} style={{ flex: 1, height: 120, borderRadius: 18, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, fontWeight: 900,
                  background: j && t > no ? TINTA : "#efece6", color: j && t > no ? "#fff" : TINTA }}>
                  {s}{j === 1 && <Caja t={t} en={no} inset="-14px" />}
                </div>))}
            </div>
          </Tarjeta>
        </Pieza>);
    }
    case 5: {
      const pct = interpolate(t, [w("tasa"), w("rate") + 20], [0, 78], { ...cl, easing: ease });
      const R = 250, C = 2 * Math.PI * R;
      return (
        <Pieza k={k} en={e.s + 22} x={X} y={0} w={700} h={760}>
          <Tarjeta style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 560, height: 560 }}>
              <svg width={560} height={560} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={280} cy={280} r={R} fill="none" stroke="#ece8e1" strokeWidth={36} />
                <circle cx={280} cy={280} r={R} fill="none" stroke={AMBAR} strokeWidth={36} strokeLinecap="round" strokeDasharray={`${(C * pct) / 100} ${C}`} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 170, fontWeight: 900, letterSpacing: -6 }}>{Math.round(pct)}%</div>
                <Rotulo>Show rate</Rotulo>
              </div>
            </div>
          </Tarjeta>
        </Pieza>);
    }
    case 6: return (<>
      <Pieza k={k} en={e.s + 20} x={X - 120} y={-120} w={620} h={780} rot={-4}><Foto src="historias-setters-gem/4.jpg" /></Pieza>
      <Pieza k={k} en={w("Fathom")} x={X + 140} y={330} z={-70} w={760} h={250} rot={2}>
        <Tarjeta style={{ padding: "30px 38px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><Rotulo>Fathom · grabación</Rotulo><Rotulo color={AMBAR}>12:48</Rotulo></div>
          <div style={{ marginTop: 22 }}><Ondas t={t} n={44} alto={110} color={TINTA} vivo={false} /></div>
        </Tarjeta>
      </Pieza>
    </>);
    case 7: {
      const n = Math.round(interpolate(t, [w("suma"), w("créditos") + 30], [0, 120], { ...cl, easing: ease }));
      return (<>
        <Pieza k={k} en={w("Cada")} x={X} y={-60} w={820} h={560}>
          <Tarjeta style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <Rotulo>Cita confirmada</Rotulo>
            <div style={{ fontSize: 250, fontWeight: 900, letterSpacing: -10, color: AMBAR, lineHeight: 1.05 }}>+{n}</div>
            <Rotulo>créditos</Rotulo>
          </Tarjeta>
        </Pieza>
        <Pieza k={k} en={w("suma")} x={X + 330} y={270} z={-120} w={300} h={300}><Obj src="setters-rc/sig/oro-hd.webp" /></Pieza>
      </>);
    }
    case 8: {
      const ins = ["setters-rc/ins/antena-hd.webp", "setters-rc/ins/satelite-hd.webp", "setters-rc/ins/torre-hd.webp"];
      const sig = ["setters-rc/sig/cian-hd.webp", "setters-rc/sig/fosforo-hd.webp"];
      return (<>
        <Pieza k={k} en={w("carnet")} x={X} y={-120} w={900} h={568} rot={-4}><CarnetSetterFrente ancho={900} /></Pieza>
        {ins.map((s, j) => <Pieza key={s} k={k} en={w("insignias") + j * 6} x={X - 300 + j * 300} y={330} z={-80} w={250} h={250}><Obj src={s} /></Pieza>)}
        {sig.map((s, j) => <Pieza key={s} k={k} en={w("colores") + j * 6} x={X + (j ? 380 : -380)} y={-470} z={-120} w={200} h={200}><Obj src={s} /></Pieza>)}
      </>);
    }
    case 9: {
      const filas = ["Valentina S.", "Tomás G.", "Vos", "Martina R.", "Joaquín P."];
      const sube = interpolate(t, [w("Subís") + 10, w("comunidad")], [3, 0], { ...cl, easing: ease });
      return (<>
        <Pieza k={k} en={e.s + 20} x={X - 40} y={-60} w={820} h={740}>
          <Tarjeta>
            <Rotulo>Tabla · Five Stars</Rotulo>
            <div style={{ position: "relative", marginTop: 24, height: 560 }}>
              {filas.filter((f) => f !== "Vos").map((f, j) => {
                const pos = j + (j >= Math.round(sube) ? 1 : 0);
                return <div key={f} style={{ position: "absolute", left: 0, right: 0, top: pos * 110, height: 96, display: "flex", alignItems: "center", gap: 26, fontSize: 38, fontWeight: 600, borderBottom: "1px solid #e6e2db" }}>
                  <span style={{ width: 50, opacity: 0.45 }}>{pos + 1}</span>{f}<span style={{ marginLeft: "auto", opacity: 0.5 }}>{2400 - pos * 310}</span></div>;
              })}
              <div style={{ position: "absolute", left: -18, right: -18, top: sube * 110, height: 96, borderRadius: 16, background: AMBAR, color: "#fff", display: "flex", alignItems: "center", gap: 26, padding: "0 18px", fontSize: 40, fontWeight: 900, boxShadow: SOMBRA }}>
                <span style={{ width: 50 }}>{Math.round(sube) + 1}</span>Vos<span style={{ marginLeft: "auto" }}>{2400 - Math.round(sube) * 310 + 120}</span></div>
            </div>
          </Tarjeta>
        </Pieza>
        <Pieza k={k} en={w("trofeos")} x={X + 320} y={360} z={-110} w={360} h={360}><Obj src="setters-rc/tro/setter_rank_leyenda_radar-hd.webp" /></Pieza>
      </>);
    }
    case 10: return (<>
      <Pieza k={k} en={w("carnet")} x={X - 110} y={-200} w={780} h={492} rot={-6}><CarnetSetterFrente ancho={780} /></Pieza>
      <Pieza k={k} en={w("CV")} x={X + 190} y={200} z={-60} w={520} h={700} rot={5}>
        <Tarjeta style={{ borderRadius: 6, padding: 40 }}>
          <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Img src={staticFile("historias-setters-gem/avatar.jpg")} style={{ width: 110, height: 110, borderRadius: 55, objectFit: "cover", filter: "grayscale(1)" }} />
            <div><div style={{ fontSize: 36, fontWeight: 900 }}>Lucía Ferraz</div><div style={{ fontSize: 22, color: AMBAR, fontWeight: 600 }}>Setter · Operador</div></div>
          </div>
          {[1, 0.8, 0.9, 0.6, 1, 0.7, 0.85, 0.5].map((a, j) => <div key={j} style={{ height: 14, width: `${a * 100}%`, background: j % 4 === 0 ? "#cfc9bf" : "#e6e2db", borderRadius: 7, marginTop: j % 4 === 0 ? 40 : 16 }} />)}
        </Tarjeta>
      </Pieza>
    </>);
    case 11: {
      const ofs = [["Setter remoto", "USD 1.200 + comisión", w("llegan")], ["Appointment setter", "High ticket · 100 % remoto", w("ofertas")], ["Setter bilingüe", "Infoproductos · desde ya", w("trabajo")]] as const;
      return (<>{ofs.map(([a, b, en], j) => (
        <Pieza key={j} k={k} en={en} x={X + (j - 1) * 40} y={-260 + j * 250} z={-j * 25} w={840} h={210} rot={j % 2 ? -3 : 2}>
          <Tarjeta style={{ padding: "34px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><Rotulo color={AMBAR}>Oferta para setters</Rotulo><div style={{ fontSize: 46, fontWeight: 900, marginTop: 8 }}>{a}</div><div style={{ fontSize: 28, opacity: 0.6 }}>{b}</div></div>
            <div style={{ fontSize: 30, fontWeight: 900, padding: "18px 26px", borderRadius: 14, background: TINTA, color: "#fff" }}>Ver</div>
          </Tarjeta>
        </Pieza>))}</>);
    }
    case 12: return (<>
      <Pieza k={k} en={w("closers")} x={X - 250} y={120} w={1000} h={1000}><Obj src="setters-goz/closer-recorte.png" /></Pieza>
      <Pieza k={k} en={w("setters")} x={X + 260} y={150} z={-50} w={1000} h={1000}><Obj src="setters-goz/setter-recorte2.png" /></Pieza>
    </>);
    case 13: {
      const en = w("Ring"), ab = w("abierto");
      return (<>
        <Pieza k={k} en={e.s + 18} x={X} y={-330} w={360} h={360}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <path d="M50,50 L50,12 A38,38 0 0,1 82.9,31 Z" fill={AMBAR} fillOpacity={0.35} transform={`rotate(${(t - e.s) * 1.5} 50 50)`} />
            {[38, 26, 14].map((r) => <circle key={r} cx={50} cy={50} r={r} fill="none" stroke={TINTA} strokeWidth={2.4} />)}
            <circle cx={50} cy={50} r={5} fill={AMBAR} />
          </svg>
        </Pieza>
        <Capa k={k} x={X} y={0} z={0} w={1100} h={200} op={interpolate(t, [en - 3, en + 3], [0, 1], cl)}>
          <div style={{ textAlign: "center" }}><Letras t={t} en={en - 2} texto="Ring Setters" style={{ fontFamily: TIGHT, fontWeight: 900, fontSize: 118, letterSpacing: -4, color: TINTA }} /></div>
        </Capa>
        <Confeti k={k} desde={ab - 6} hasta={ab + 200} n={26} cx={X} ancho={1300} semilla="fin" />
      </>);
    }
  }
  return null;
};

const ClaveGrande: React.FC<{ k: Ctx; i: number }> = ({ k, i }) => {
  const e = ESC[i];
  const fin = i === 13;
  const lista: Clave[] = fin ? [{ txt: "Ya está abierto.", p: "Ya", caja: true }] : CLAVES[i];
  return (<>{lista.map((c) => {
    const en = W(e, c.p, c.vez);
    const sal = c.hasta ? W(e, c.hasta) : 1e9;
    const op = interpolate(k.t, [en - 3, en + 3], [0, 1], cl) * interpolate(k.t, [sal - 4, sal + 6], [1, 0], cl);
    return (
      <Capa key={c.txt} k={k} x={XS(i)} y={fin ? 190 : 580} z={-80} w={1060} h={200} op={op}>
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Letras t={k.t} en={en - 2} texto={c.txt} style={{ fontFamily: SERIF_IT, fontSize: 150, color: AMBAR, lineHeight: 1.05 }} />
            {c.caja && <Caja t={k.t} en={en + 10} inset="-10px -24px" />}
          </div>
        </div>
      </Capa>);
  })}</>);
};

const Frase: React.FC<{ k: Ctx; i: number }> = ({ k, i }) => {
  const e = ESC[i];
  if (i === 13) return null;
  return (
    <Capa k={k} x={XS(i)} y={-700} z={-160} w={940} h={240}>
      <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.08, color: TINTA, textAlign: "center" }}>
        {e.palabras.map((p, j) => {
          const en = e.s + LEAD + 2 * p.cuadro;
          return <span key={j} style={{ opacity: interpolate(k.t, [en - 2, en + 4], [0, 1], cl) }}>{p.palabra} </span>;
        })}
      </div>
    </Capa>);
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const i = idx(t), e = ESC[i];
  const c = camN(t);
  const g = golpes(i);
  const fz = g.length ? interpolate(t - e.s, [WHIP, g[0] - e.s - 8, g[0] - e.s + 8], [-160, -160, -40], cl) : -60;
  const k: Ctx = { t, c, fz };
  const vaiven = Math.sin((t / 60) * 0.9) * 1.6 + Math.sin((t / 60) * 2.3) * 0.5;
  const j0 = Math.round((c.x - 1050) / 5200);
  const arco = Math.sin(interpolate(t - e.s, [0, WHIP], [0, 1], cl) * Math.PI);
  const visibles = [i - 1, i].filter((j) => j >= 0);
  return (
    <AbsoluteFill style={{ background: "#e7e5e1", overflow: "hidden" }}>
      {[j0 - 1, j0, j0 + 1].map((j) => (
        <Capa key={j} k={k} x={1050 + 5200 * j} y={0} z={500} w={5200} h={3600} dof={0.35}>
          <Img src={staticFile("setters-goz/revoque.jpg")} style={{ width: "100%", height: "100%", transform: Math.abs(j) % 2 ? "scaleX(-1)" : undefined }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 35% at 30% 30%, rgba(255,250,240,0.55), transparent 70%), radial-gradient(ellipse 40% 35% at 72% 34%, rgba(255,250,240,0.5), transparent 70%)" }} />
          {[0, 1].map((q) => (
            <Img key={q} src={staticFile("setters-goz/rama.png")} style={{ position: "absolute", left: [1250, 3350][q], top: -380, width: 1500, height: 1500, transformOrigin: "100% 0%",
              transform: `rotate(${vaiven + q * 8}deg) scaleX(${q ? -1 : 1})`, opacity: 0.2, filter: "blur(7px)", mixBlendMode: "multiply" }} />
          ))}
        </Capa>
      ))}
      {visibles.map((j) => <React.Fragment key={j}><Contenido k={k} i={j} /><Frase k={k} i={j} /><ClaveGrande k={k} i={j} /></React.Fragment>)}
      {arco > 0.02 && <Capa k={k} x={(i === 0 ? X2 : XS(i - 1)) / 2 + XS(i) / 2} y={-200} z={-500} w={1800} h={1100} op={arco * 0.85}>
        <Img src={staticFile(i % 2 ? "setters-goz/nube1.png" : "setters-goz/nube2.png")} style={{ width: "100%", height: "100%" }} />
      </Capa>}
      {i > 0 && <Confeti k={k} desde={e.s - 6} hasta={e.s + 70} n={12} cx={XS(i) - 300} ancho={1300} semilla={"w" + i} />}
    </AbsoluteFill>
  );
};

export const SettersGozCompleto: React.FC = () => {
  const f = useCurrentFrame();
  const v = f < S3 ? velocidad(f) : velN(f);
  const n = v > 30 ? 8 : v > 10 ? 5 : 1;
  const R = (t: number) => (t < S3 ? <Escena t={t} /> : <Mundo t={t} />);
  const fin = interpolate(f, [TOTAL_COMPLETO - 20, TOTAL_COMPLETO], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: "#e7e5e1" }}>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>{R(n === 1 ? f : f - 0.35 + (0.7 * i) / (n - 1))}</AbsoluteFill>
      ))}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="grano3"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 3)} />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.075 0" /></filter>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 58%, rgba(55,48,40,0.2))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><rect width={1080} height={1920} filter="url(#grano3)" /></svg>
      <AbsoluteFill style={{ background: "#e7e5e1", opacity: fin }} />
    </AbsoluteFill>
  );
};
