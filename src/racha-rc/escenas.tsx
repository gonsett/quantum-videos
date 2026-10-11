import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Cartel, Marco, Noche, aparece, sube } from "../ring-closers/piezas";
import { DISPLAY, EASE, MARGEN, MONO, RC, SANS } from "../ring-closers/tema";
import { Logo } from "../reel-rc/logo";
import { MarcaChica, Tarjeta, Zona } from "../reel-rc/escenas";
import { Subtitulos } from "../reel-rc/subtitulos";
import { racha } from "./timeline";

/**
 * Cuarto video de Ring Closers: "te cuesta subir de nivel".
 *
 * Tema nuevo a propósito (ver guion-racha-rc.json): racha, logros y el
 * momento de subida de rango no aparecieron en ningún video anterior — son
 * features de hoy. El comercial y el Reel ya cubrieron coordinación/regla
 * del 33%; estilos-rc cubrió personalización. Acá el "producto" que se
 * demuestra es la prueba visible de progreso, no el matching.
 *
 * Mecánica: una tarjeta que arranca apagada/gris (sin nada que mostrar) y
 * se enciende en esmeralda exactamente cuando la voz dice "se ve" — mismo
 * recurso de encendido-en-palabra-exacta que el candado de estilos-rc, pero
 * aplicado a gris→color en vez de bloqueado→desbloqueado.
 */

const ease = Easing.bezier(...EASE);
const { cuadro, escena } = racha;

const subs = (id: string, clave: string[]) => (
  <Subtitulos clips={escena(id).clips} duracionEscena={escena(id).durationInFrames} clave={clave} />
);

// ── Piezas propias ───────────────────────────────────────────────────────

const Llama: React.FC<{ size: number; color: string; opacidad?: number; escala?: number }> = ({
  size,
  color,
  opacidad = 1,
  escala = 1,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: opacidad, scale: String(escala), overflow: "visible" }}
  >
    <path d="M12 3c1.5 2.5-1 3.5-1 6a3 3 0 0 0 6 0c1.5 1.5 2.5 3.5 2.5 5.5a6.5 6.5 0 0 1-13 0C6.5 10.5 9 8 8.5 5.5 9.5 6 10.5 5.5 12 3Z" />
  </svg>
);

const Trofeo: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H5.5A1.5 1.5 0 0 0 4 7.5C4 9.5 5.5 11 8 11" />
    <path d="M16 6h2.5A1.5 1.5 0 0 1 20 7.5c0 2-1.5 3.5-4 3.5" />
    <path d="M12 14v3" />
    <path d="M9 20.5h6" />
    <path d="M10 17.5h4l.6 3H9.4l.6-3Z" />
  </svg>
);

// ── S1 · Sos closer. Practicás cada semana. ¿Y si no sabés si mejorás? ────

export const S1Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s1-gancho";
  const clips = escena(ID).clips;
  return (
    <Noche>
      <Zona>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 8 }}>
            {clips[0].palabras.map((w, k) => {
              const entra = interpolate(frame, [w.cuadro - 1, w.cuadro + 4], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: ease,
              });
              return (
                <span
                  key={k}
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: 94,
                    lineHeight: 1.04,
                    textTransform: "uppercase",
                    color: RC.crema,
                    opacity: entra,
                    translate: `0px ${(1 - entra) * 16}px`,
                  }}
                >
                  {w.palabra}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 20, rowGap: 6 }}>
            {clips[1].palabras.map((w, k) => {
              const entra = interpolate(frame, [w.cuadro - 1, w.cuadro + 4], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: ease,
              });
              return (
                <span
                  key={k}
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 600,
                    fontSize: 62,
                    lineHeight: 1.14,
                    color: RC.platino300,
                    opacity: entra,
                    translate: `0px ${(1 - entra) * 16}px`,
                  }}
                >
                  {w.palabra}
                </span>
              );
            })}
          </div>
        </div>
      </Zona>
    </Noche>
  );
};

// ── S2 · Cumplís y no queda nada... hasta que se ve ───────────────────────

export const S2Problema: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s2-problema";
  const enciende = cuadro(ID, "ve");
  const prende = interpolate(frame, [enciende, enciende + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <Noche>
      <MarcaChica />
      <Zona>
        <Tarjeta style={{ padding: "56px 48px", opacity: aparece(frame, 0, 12), translate: sube(frame, 0, 24, 14) }}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 26, letterSpacing: "0.16em", color: RC.platino500, marginBottom: 8 }}>
            TU SEMANA
          </div>
          <div style={{ position: "relative", height: 200, display: "flex", alignItems: "center" }}>
            <div
              style={{
                position: "absolute",
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 168,
                color: RC.platino500,
                opacity: 1 - prende,
              }}
            >
              —
            </div>
            <div
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: prende,
                translate: `0px ${(1 - prende) * 16}px`,
              }}
            >
              <Llama size={112} color={RC.esmeralda400} />
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, textTransform: "uppercase", color: RC.esmeralda500 }}>
                SE VE
              </span>
            </div>
          </div>
        </Tarjeta>
      </Zona>
      {subs(ID, ["ve"])}
    </Noche>
  );
};

// ── S3 · La racha se prende ────────────────────────────────────────────────

export const S3Racha: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s3-racha";
  const prende = cuadro(ID, "prende");
  const cuentaEn = prende + 4;
  const valor = Math.min(
    4,
    Math.max(
      1,
      Math.floor(
        interpolate(frame, [cuentaEn, cuentaEn + 66], [1, 4.9], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      ),
    ),
  );
  const ciclo = frame >= cuentaEn ? (frame - cuentaEn) % 20 : -1;
  const pulso = ciclo < 0 ? 1 : interpolate(ciclo, [0, 5, 20], [1, 1.1, 1], { extrapolateRight: "clamp" });

  return (
    <Noche>
      <MarcaChica />
      <Zona>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ opacity: aparece(frame, prende - 4, 10), scale: String(pulso) }}>
            <Llama size={184} color={RC.esmeralda400} />
          </div>
          <div style={{ marginTop: 30, fontFamily: MONO, fontWeight: 700, fontSize: 176, lineHeight: 1, color: RC.crema, opacity: aparece(frame, prende, 10) }}>
            {valor}
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 40,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: RC.esmeralda500,
              opacity: aparece(frame, prende, 10),
            }}
          >
            {valor === 1 ? "SEMANA SEGUIDA" : "SEMANAS SEGUIDAS"}
          </div>
        </div>
      </Zona>
      {subs(ID, ["prende", "dejás"])}
    </Noche>
  );
};

// ── S4 · Un logro te interrumpe ────────────────────────────────────────────

export const S4Logro: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s4-logro";
  const interrumpe = cuadro(ID, "interrumpe");
  const entra = interpolate(frame, [interrumpe, interrumpe + 11], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <Noche>
      <MarcaChica />
      <div
        style={{
          position: "absolute",
          left: MARGEN,
          right: MARGEN,
          top: 780,
          opacity: entra,
          translate: `0px ${(1 - entra) * 44}px`,
        }}
      >
        <Tarjeta style={{ display: "flex", alignItems: "center", gap: 30, padding: "38px 42px", borderColor: `${RC.esmeralda500}66` }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 999,
              border: `1px solid ${RC.esmeralda500}66`,
              backgroundColor: `${RC.esmeralda500}1a`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Trofeo size={46} color={RC.esmeralda500} />
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, letterSpacing: "0.16em", textTransform: "uppercase", color: RC.esmeralda500, marginBottom: 10 }}>
              Logro desbloqueado
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 42, color: RC.crema }}>Racha de 3</div>
          </div>
        </Tarjeta>
      </div>
      {subs(ID, ["interrumpe"])}
    </Noche>
  );
};

// ── S5 · Todo se detiene: subiste de rango ─────────────────────────────────

export const S5Rankup: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s5-rankup";
  const detiene = cuadro(ID, "detiene");
  const rangoEn = cuadro(ID, "rango");

  const revela = interpolate(frame, [detiene, detiene + 22], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const subeBrillo = interpolate(frame, [detiene + 16, detiene + 30], [1, 1.34], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const bajaBrillo = interpolate(frame, [detiene + 30, detiene + 48], [1.34, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const brillo = frame < detiene + 30 ? subeBrillo : bajaBrillo;
  const textoEn = rangoEn - 8;

  return (
    <Noche>
      <Marco top={280}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: RC.platino500,
              opacity: aparece(frame, 0, 10),
            }}
          >
            Nuevo rango
          </div>
          <div style={{ marginTop: 22, width: 270, height: 270, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: `inset(0 ${100 - revela}% 0 0)`,
                filter: `brightness(${brillo}) drop-shadow(0 4px 22px rgba(16,185,129,0.4))`,
              }}
            >
              <Img src={staticFile("ring-closers/belts/contendiente.webp")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>
          <div
            style={{
              marginTop: 24,
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 76,
              textTransform: "uppercase",
              color: RC.esmeralda500,
              opacity: aparece(frame, textoEn, 10),
            }}
          >
            CONTENDIENTE
          </div>
          <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 30, color: RC.platino300, opacity: aparece(frame, textoEn + 4, 10) }}>
            Prospecto <span style={{ color: RC.platino500 }}>→</span> Contendiente
          </div>
          <div style={{ marginTop: 18, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: RC.crema, opacity: aparece(frame, textoEn + 8, 10) }}>
            340 <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 20, color: RC.platino500 }}>pts</span>
          </div>
        </div>
      </Marco>
    </Noche>
  );
};

// ── S6 · No es un casillero. Es la prueba de que mejorás de verdad ────────

export const S6Cierre: React.FC = () => {
  const ID = "s6-cierre";
  const prueba = Math.max(0, cuadro(ID, "prueba") - 6);
  return (
    <Noche>
      <MarcaChica />
      <Marco top={560}>
        <Cartel arriba="No es un casillero" abajo="que tildás." delay={0} acento={false} size={90} />
        <div style={{ height: 48 }} />
        <Cartel arriba="Es la prueba" abajo="de que mejorás de verdad." delay={prueba} size={90} colorAbajo={RC.esmeralda500} />
      </Marco>
    </Noche>
  );
};

// ── S7 · Ring Closers. Gratis. Subí de nivel, y que se note ────────────────

export const S7Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const ID = "s7-cta";
  const gratis = cuadro(ID, "gratis");
  const subi = cuadro(ID, "subi");
  return (
    <Noche>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 260, paddingLeft: MARGEN, paddingRight: MARGEN }}>
        <div style={{ opacity: aparece(frame, 0, 8), translate: sube(frame, 0, 20, 12) }}>
          <Logo size={128} />
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 136,
            lineHeight: 1,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            opacity: aparece(frame, 2, 8),
            translate: sube(frame, 2, 20, 12),
          }}
        >
          <span style={{ color: RC.crema }}>RING </span>
          <span style={{ color: RC.esmeralda500 }}>CLOSERS</span>
        </div>
        <div style={{ marginTop: 30, fontFamily: SANS, fontSize: 40, color: RC.platino300, opacity: aparece(frame, gratis - 2, 8) }}>
          Gratis. Subí de nivel, y que se note.
        </div>
        <div
          style={{
            marginTop: 54,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 50,
            letterSpacing: "0.08em",
            color: RC.crema,
            border: `1px solid ${RC.platino500}`,
            borderRadius: 999,
            padding: "18px 50px",
            opacity: aparece(frame, subi - 8, 8),
            translate: sube(frame, subi - 8, 14, 10),
          }}
        >
          SUBÍ DE NIVEL
        </div>
      </AbsoluteFill>
    </Noche>
  );
};
