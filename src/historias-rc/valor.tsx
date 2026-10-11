import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { RC, MONO } from "../ring-closers/tema";
import { Acabado } from "../secreto-rc/efectos";
import { SANS, SERIF } from "./como-funciona";
import { Carnet } from "./directores";

/**
 * Destacada "Lo que vale" (03/10/2026). Lenguaje DISTINTO a las anteriores:
 *  - "Qué es": Oswald + bokeh · "Cómo funciona": vidrio + haz oblicuo · "Ofertas": UI real plana
 *  - "Directores": mesa de piedra con carnets
 * Acá: LA VITRINA DE JOYERÍA. Una foto de producto (FLUX, `public/valor-rc/`) de un objeto sobre terciopelo
 * esmeralda en una vitrina a oscuras manda el cuadro; la ÚNICA pieza gráfica es una etiqueta de precio de
 * papel marfil colgando de un hilo, con lo que costaría eso afuera. Texto chico abajo. Sin numeración.
 */

/** La foto a sangre, fundida a negro arriba y abajo. */
const Foto: React.FC<{ src: string; top: number; size: number; x?: number; centro?: string }> = ({ src, top, size, x = 0, centro = "50% 50%" }) => (
  <Img
    src={staticFile(`valor-rc/${src}`)}
    style={{
      position: "absolute", top, left: (1080 - size) / 2 + x, width: size, height: size, objectFit: "cover",
      maskImage: `radial-gradient(ellipse 50% 50% at ${centro}, black 40%, transparent 98%)`,
      WebkitMaskImage: `radial-gradient(ellipse 50% 50% at ${centro}, black 40%, transparent 98%)`,
    }}
  />
);

/** Rótulo de vitrina: mono, platino, con un punto esmeralda. */
const Rotulo: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 236 }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 7, color: RC.platino500, textTransform: "uppercase" }}>
    <span style={{ color: RC.esmeralda400 }}>●</span>&nbsp;&nbsp;{children}
  </div>
);

/** Etiqueta de precio de papel marfil colgando de un hilo. */
const EtiquetaPrecio: React.FC<{ x: number; y: number; giro: number; arriba: string; precio: React.ReactNode; hilo?: [number, number]; w?: number }> = ({ x, y, giro, arriba, precio, hilo = [-90, -150], w = 330 }) => {
  const W = w, H = 170;
  return (
    <>
      {/* hilo: de un punto del objeto al ojal de la etiqueta */}
      <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible" }}>
        <path d={`M ${x + hilo[0]} ${y + hilo[1]} Q ${x - 30} ${y - 40} ${x + 22} ${y + 28}`} stroke="rgba(230,222,205,0.75)" strokeWidth={2.2} fill="none" />
      </svg>
      <div style={{ position: "absolute", left: x, top: y, width: W, height: H, transform: `rotate(${giro}deg)`, transformOrigin: "22px 28px", filter: "drop-shadow(0 26px 24px rgba(0,0,0,0.75)) drop-shadow(0 4px 5px rgba(0,0,0,0.6))" }}>
        <div style={{
          position: "absolute", inset: 0,
          clipPath: "polygon(34px 0, 100% 0, 100% 100%, 34px 100%, 0 calc(100% - 34px), 0 34px)",
          background: "radial-gradient(120% 90% at 30% 10%, #fbf6ea 0%, #efe6d2 55%, #ddd1b8 100%)",
        }}>
          {/* fibra del papel */}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.35, mixBlendMode: "multiply" }}>
            <filter id="papel"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} /><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.5 0" /></filter>
            <rect width={W} height={H} filter="url(#papel)" />
          </svg>
          {/* filete dorado */}
          <div style={{ position: "absolute", inset: 10, left: 44, border: "1px solid rgba(150,118,60,0.55)", clipPath: "inherit" }} />
          {/* ojal */}
          <div style={{ position: "absolute", left: 14, top: 20, width: 16, height: 16, borderRadius: 8, background: "#050505", boxShadow: "0 0 0 3px #c9a961, inset 0 2px 3px rgba(0,0,0,0.9)" }} />
          <div style={{ position: "absolute", left: 62, top: 30, right: 22, fontFamily: SANS, fontWeight: 700, fontSize: 15, letterSpacing: 3.2, textTransform: "uppercase", color: "#6b5a3c" }}>{arriba}</div>
          <div style={{ position: "absolute", left: 60, top: 62, right: 18, fontFamily: SERIF, fontStyle: "italic", fontSize: 60, lineHeight: 1, color: "#1a140c" }}>{precio}</div>
        </div>
      </div>
    </>
  );
};

/** Titular chico: sans + una palabra en serif itálica esmeralda; y un apoyo gris. */
const Texto: React.FC<{ top: number; titular: React.ReactNode; apoyo?: React.ReactNode }> = ({ top, titular, apoyo }) => (
  <div style={{ position: "absolute", top, left: 90, right: 90, textAlign: "center" }}>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 54, lineHeight: 1.12, letterSpacing: -1, color: RC.crema }}>{titular}</div>
    {apoyo && <div style={{ marginTop: 22, fontFamily: SANS, fontWeight: 400, fontSize: 30, lineHeight: 1.4, color: RC.platino500 }}>{apoyo}</div>}
  </div>
);

export const Verde: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: RC.esmeralda400, letterSpacing: 0 }}>{children}</span>
);

const Lienzo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "#020303" }}>
    {children}
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.65) 100%)" }} />
    <Acabado />
  </AbsoluteFill>
);

const Marca: React.FC = () => (
  <div style={{ position: "absolute", bottom: 250, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 20, letterSpacing: 8, color: "rgba(212,212,216,0.45)" }}>RING CLOSERS</div>
);

export const VALPortada: React.FC = () => (
  <Lienzo>
    <Foto src="joya-v1-hd.jpg" top={20} size={1560} x={240} centro="35% 50%" />
    <div style={{ position: "absolute", top: 1360, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 150, lineHeight: 1.0, color: RC.crema, whiteSpace: "nowrap" }}>Lo que vale.</div>
    </div>
    <Marca />
  </Lienzo>
);

export const VAL1Peleas: React.FC = () => (
  <Lienzo>
    <Foto src="guante-v1-hd.jpg" top={120} size={1560} x={20} />
    <EtiquetaPrecio x={610} y={1080} giro={-7} arriba="Tu rival, elegido por" precio={<>tus datos.</>} hilo={[-120, -170]} />
    <Texto top={1500} titular={<>Practicás con quien de verdad<br />te hace <Verde>mejorar.</Verde></>} apoyo={<>Mismo nivel, criterio y números reales.<br />Cero tiempo perdido.</>} />
  </Lienzo>
);

export const VAL2Agenda: React.FC = () => (
  <Lienzo>
    <Foto src="reloj-v1-hd.jpg" top={250} size={1300} x={110} />
    <EtiquetaPrecio x={610} y={1080} giro={-7} arriba="Se agenda" precio={<>solo.</>} hilo={[-120, -170]} w={330} />
    <Texto top={1500} titular={<>Se acomoda a tu <Verde>horario.</Verde></>} apoyo={<>Sin coordinar con nadie.<br />Sin mensajes de ida y vuelta.</>} />
  </Lienzo>
);

export const VAL3Fathom: React.FC = () => (
  <Lienzo>
    <Foto src="microfono-v2-hd.jpg" top={250} size={1300} x={0} />
    <EtiquetaPrecio x={610} y={1080} giro={6} arriba="Cada llamada" precio={<>analizada.</>} hilo={[-120, -170]} w={340} />
    <Texto top={1500} titular={<>Fathom graba y analiza<br />cada <Verde>pelea.</Verde></>} apoyo={<>Ves en qué fallaste y qué repetir,<br />con datos.</>} />
  </Lienzo>
);

export const VAL4Nota: React.FC = () => (
  <Lienzo>
    <Foto src="sobre-v2-hd.jpg" top={250} size={1300} x={40} />
    <EtiquetaPrecio x={610} y={1080} giro={-7} arriba="Tu rival te deja" precio={<>su nota.</>} hilo={[-120, -170]} w={330} />
    <Texto top={1500} titular={<>Te puntúa alguien<br />que te <Verde>escuchó.</Verde></>} apoyo={<>Una valoración honesta<br />después de cada pelea.</>} />
  </Lienzo>
);

export const VAL5Metricas: React.FC = () => (
  <Lienzo>
    <Foto src="instrumento-v1-hd.jpg" top={250} size={1300} x={0} />
    <EtiquetaPrecio x={610} y={1080} giro={5} arriba="Tu progreso," precio={<>medido.</>} hilo={[-120, -170]} w={330} />
    <Texto top={1500} titular={<>Métricas que muestran<br />cuánto <Verde>mejorás.</Verde></>} apoyo={<>Cierres, objeciones y constancia,<br />semana a semana.</>} />
  </Lienzo>
);

export const VAL6Carnet: React.FC = () => (
  <Lienzo>
    <Foto src="carnet-v3-hd.jpg" top={200} size={1300} x={114} />
    {/* el carnet real de la app, montado sobre la chapa en blanco de la foto (medida en el render: x 157-835, y 718) */}
    <div style={{ position: "absolute", left: 201, top: 718, width: 678, height: 678 * 271 / 430, borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 40px rgba(0,0,0,0.55)" }}>
      <Carnet d={{ tema: "campeon", nombre: "Martina Rossi", alias: "“La Fiera”", numero: "0061", pais: "México", comunidad: "Elite Closers", esquina: "roja" }} ancho={678} brillo={0.9} />
      {/* luz del foco cenital: más clara arriba, cae hacia abajo, y un reflejo del vidrio */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 35%, rgba(0,0,0,0.38) 100%), linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.10) 46%, transparent 54%)" }} />
    </div>
    <EtiquetaPrecio x={650} y={1220} giro={-5} arriba="Lo miran" precio={<>directores.</>} hilo={[-90, -200]} w={367} />
    <Texto top={1500} titular={<>Tu carnet y tu CV, a la vista<br />de quien <Verde>contrata.</Verde></>} apoyo={<>Los directores que buscan closers<br />ven tu nivel real.</>} />
  </Lienzo>
);

export const VAL7Ofertas: React.FC = () => (
  <Lienzo>
    <Foto src="llave-v2-hd.jpg" top={250} size={1300} x={-10} />
    <EtiquetaPrecio x={620} y={1230} giro={5} arriba="Ofertas de" precio={<>trabajo.</>} hilo={[-50, -170]} w={330} />
    <Texto top={1500} titular={<>Una sola oferta paga<br />años de <Verde>suscripción.</Verde></>} apoyo={<>Directores publican puestos<br />para closers como vos.</>} />
  </Lienzo>
);

export const VAL8Closers: React.FC = () => (
  <Lienzo>
    <Foto src="libro-v2-hd.jpg" top={250} size={1300} x={0} />
    <EtiquetaPrecio x={560} y={1080} giro={-7} arriba="Ya entrenan" precio={<>105 closers.</>} hilo={[-120, -170]} w={394} />
    <Texto top={1500} titular={<>Más de 100 closers<br />ya entrenan <Verde>acá.</Verde></>} apoyo={<>Cada semana, más rivales<br />para medirte.</>} />
  </Lienzo>
);

export const VAL9Cierre: React.FC = () => (
  <Lienzo>
    <Foto src="abierta-v1-hd.jpg" top={60} size={1300} />
    <Texto top={1300} titular={<>Todo esto cuesta menos<br />que la comisión que<br />perdés este <Verde>mes.</Verde></>} apoyo={<span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: RC.crema }}>Entrá a la vitrina.</span>} />
    <div style={{ position: "absolute", top: 1660, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 20, letterSpacing: 8, color: "rgba(212,212,216,0.45)" }}>RING CLOSERS</div>
  </Lienzo>
);
