// Frente del carnet de setter tal como lo dibuja la app (ring-closers/components/member/setter-card.tsx),
// con su CSS copiado. Se renderiza suelto, con fondo transparente, para pegarlo en fotos.
import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { loadFont as cargarOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as cargarManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as cargarMono } from "@remotion/google-fonts/JetBrainsMono";
import { SETTER_CARD_CSS } from "./setter-card-css";

const { fontFamily: OSW } = cargarOswald();
const { fontFamily: MAN } = cargarManrope();
const { fontFamily: MON } = cargarMono();

const GUILLOCHE = (() => {
  const paths: string[] = [];
  for (let r = 0; r < 14; r++) {
    const wave = 44 + (r % 3) * 14;
    const amp = 7 + (r % 4) * 4.5;
    const y = 8 + r * 19.5;
    let d = `M-30 ${y}q${wave / 4} ${-amp} ${wave / 2} 0`;
    for (let x = -30 + wave / 2; x < 470; x += wave / 2) d += "t" + wave / 2 + " 0";
    paths.push(d);
  }
  return paths.join("");
})();

const RANGOS = ["aprendiz", "rastreador", "operador", "controlador", "leyenda_radar"];

export const CarnetSetterReal: React.FC<{ ancho: number; vertical?: boolean; foto?: string }> = ({ ancho, vertical, foto }) => (
  <AbsoluteFill style={{ background: "transparent" }}><CarnetSetterFrente ancho={ancho} vertical={vertical} foto={foto} /></AbsoluteFill>
);

/** Versión vertical (credencial colgante) para fotos donde la tarjeta se sostiene parada: mismas piezas y CSS de la
 *  app, reacomodadas en columna. 100cqw = ancho, alto = 158,6cqw. */
const VERTICAL_CSS = `
.sc-v .sc-scene{aspect-ratio:auto!important;height:100%}
.sc-v .sc-watermark{right:-30cqw;top:-22cqw;width:120cqw}
.sc-v .sc-header{top:7cqw;left:7cqw;right:7cqw;gap:4cqw}
.sc-v .sc-logoTile{width:17cqw;height:17cqw;border-radius:3.4cqw}
.sc-v .sc-wordmark{font-size:7.6cqw}
.sc-v .sc-kind{font-size:3.4cqw}
.sc-v .sc-body{top:33cqw;left:7cqw;right:7cqw;bottom:24cqw;flex-direction:column;align-items:center;gap:7cqw}
.sc-v .sc-photoFrame{width:52cqw;height:60cqw;padding:1cqw;border-radius:2.6cqw;box-shadow:2.2cqw 2.2cqw 0 0 color-mix(in srgb,var(--c4) 80%,var(--c2))}
.sc-v .sc-photo{border-radius:1.8cqw}
.sc-v .sc-info{width:100%;align-items:center;text-align:center;gap:4cqw;justify-content:flex-start}
.sc-v .sc-info>div:first-child{display:flex;flex-direction:column;align-items:center}
.sc-v .sc-nameL{font-size:10.4cqw}
.sc-v .sc-bar{width:20cqw;height:1.2cqw;margin-top:2.2cqw}
.sc-v .sc-alias{font-size:5cqw;margin-top:2cqw}
.sc-v .sc-tag{flex-direction:row;align-items:center;gap:3cqw;justify-content:center}
.sc-v .sc-rank{font-size:4.6cqw;gap:2.2cqw}
.sc-v .sc-pip{width:1.9cqw;height:1.9cqw}
.sc-v .sc-community{font-size:3.6cqw;padding:1.3cqw 3.2cqw;align-self:center}
.sc-v .sc-band{height:20cqw;padding:0 7cqw}
.sc-v .sc-facts{column-gap:5cqw}
.sc-v .sc-factLabel{font-size:2.9cqw}
.sc-v .sc-factValue{font-size:4.8cqw;margin-top:1.5cqw}
.sc-v .sc-front .sc-surface{--scrim:linear-gradient(180deg,transparent 35%,color-mix(in srgb,var(--c1) 34%,transparent) 100%)}
.sc-v .sc-stripes{-webkit-mask-image:linear-gradient(180deg,transparent 18%,#000 92%);mask-image:linear-gradient(180deg,transparent 18%,#000 92%)}
`;

export const CarnetSetterFrente: React.FC<{ ancho: number; vertical?: boolean; foto?: string }> = ({ ancho, vertical, foto = "historias-setters-gem/avatar.jpg" }) => (
  <div className={vertical ? "sc-v" : undefined} style={{ position: "relative", width: ancho, height: vertical ? ancho * 1.586 : ancho / 1.586, ["--font-display" as string]: OSW, ["--font-sans" as string]: MAN, ["--font-mono" as string]: MON }}>
    <style>{SETTER_CARD_CSS + (vertical ? VERTICAL_CSS : "")}</style>
    <div className="sc-scene" style={{ ["--card-max" as string]: `${ancho}px`, width: ancho }}>
      <div className="sc-tilt">
        <div className="sc-flip">
          <div className="sc-face sc-front" style={{ boxShadow: "none" }}>
            <div className="sc-surface">
              <svg className="sc-guilloche" viewBox="0 0 430 271" preserveAspectRatio="xMidYMid slice"><path d={GUILLOCHE} /></svg>
              <div className="sc-stripes" />
              <svg className="sc-watermark" viewBox="0 0 100 100">
                <path d="M50,50 L50,12 A38,38 0 0,1 82.9,31 Z" />
                <circle cx={50} cy={50} r={38} /><circle cx={50} cy={50} r={26} /><circle cx={50} cy={50} r={14} />
                <line x1={50} y1={50} x2={50} y2={4} /><circle cx={50} cy={50} r={5} />
              </svg>
              <div className="sc-header">
                <div className="sc-logoTile">
                  <svg viewBox="0 0 100 100">
                    <path d="M50,50 L50,12 A38,38 0 0,1 82.9,31 Z" fill="var(--c3)" fillOpacity={0.35} />
                    <circle cx={50} cy={50} r={38} fill="none" stroke="var(--c3)" strokeWidth={3} />
                    <circle cx={50} cy={50} r={26} fill="none" stroke="var(--c3)" strokeWidth={3} />
                    <circle cx={50} cy={50} r={14} fill="none" stroke="var(--c3)" strokeWidth={3} />
                    <line x1={50} y1={50} x2={50} y2={4} stroke="var(--c3)" strokeWidth={3} />
                    <circle cx={50} cy={50} r={5} fill="var(--c3)" />
                  </svg>
                </div>
                <div className="sc-titleBlock">
                  <div className="sc-wordmark"><span className="sc-ring">Ring</span> <span className="sc-role">Setters</span></div>
                  <div className="sc-kind">Carnet de setter</div>
                </div>
              </div>
              <div className="sc-body">
                <div className="sc-photoFrame">
                  <div className="sc-photo" style={{ backgroundImage: `url("${staticFile(foto)}")` }} />
                </div>
                <div className="sc-info">
                  <div>
                    <h3 className="sc-name sc-nameL">Lucía Ferraz</h3>
                    <div className="sc-bar" />
                    <p className="sc-alias">“Radar”</p>
                  </div>
                  <div className="sc-tag">
                    <div className="sc-rank">
                      <span>Operador</span>
                      <span className="sc-pips">{RANGOS.map((r, i) => <span key={r} className={`sc-pip ${i <= 2 ? "sc-pipOn" : ""}`} />)}</span>
                    </div>
                    <span className="sc-community">Five Stars</span>
                  </div>
                </div>
              </div>
              <div className="sc-band">
                <div className="sc-facts">
                  <div><div className="sc-factLabel">N.º socio</div><div className="sc-factValue"><span className="sc-number">RS-000042</span></div></div>
                  <div><div className="sc-factLabel">Promoción</div><div className="sc-factValue">2026</div></div>
                  <div><div className="sc-factLabel">País</div><div className="sc-factValue">Uruguay</div></div>
                </div>
              </div>
              <div className="sc-holo" />
              <div className="sc-glint" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
