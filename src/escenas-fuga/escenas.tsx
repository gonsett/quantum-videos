import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import {
  Cliente,
  Escena3D,
  Luces,
  Rejilla,
  Telefono,
  entrada,
  salida,
} from "../components/tres";
import {
  ANCHO,
  EASE,
  F,
  FONT_DISPLAY,
  FONT_MONO,
  FONT_TITULAR,
  SAFE_X,
} from "../theme-fuga";

// ── Capa de texto sobre el 3D ────────────────────────────────────────────

const Texto: React.FC<{
  children: React.ReactNode;
  posicion?: "arriba" | "abajo";
}> = ({ children, posicion = "abajo" }) => (
  <AbsoluteFill
    style={{
      paddingLeft: SAFE_X,
      paddingRight: SAFE_X,
      justifyContent: posicion === "arriba" ? "flex-start" : "flex-end",
      alignItems: "flex-start",
      paddingTop: posicion === "arriba" ? 190 : 0,
      paddingBottom: posicion === "abajo" ? 230 : 0,
      pointerEvents: "none",
    }}
  >
    <div style={{ width: ANCHO }}>{children}</div>
  </AbsoluteFill>
);

const Linea: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  color?: string;
  resalte?: boolean;
}> = ({ children, size = 66, delay = 0, color = F.texto, resalte = false }) => {
  const frame = useCurrentFrame();
  const e = entrada(frame, delay, delay + 20);

  const texto = (
    <span
      style={{
        fontFamily: FONT_TITULAR,
        fontSize: size,
        lineHeight: 1.06,
        letterSpacing: "-0.028em",
        color: resalte ? F.navy : color,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );

  if (resalte) {
    return (
      <div
        style={{
          display: "inline-block",
          backgroundColor: F.oroVivo,
          padding: "8px 20px 14px",
          rotate: "-1.1deg",
          clipPath: `inset(0 ${100 - e * 100}% 0 0)`,
        }}
      >
        {texto}
      </div>
    );
  }

  return (
    <div
      style={{
        opacity: e,
        translate: interpolate(frame, [delay, delay + 24], ["0px 22px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...EASE),
        }),
      }}
    >
      {texto}
    </div>
  );
};

const Nota: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
  size?: number;
}> = ({ children, delay = 0, color = F.tenue, size = 27 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color,
        opacity: entrada(frame, delay, delay + 14),
      }}
    >
      {children}
    </div>
  );
};

/** Posiciones estables entre frames: sin Math.random en el render. */
const disperso = (i: number, radio: number): [number, number, number] => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  const c = Math.sin(i * 39.425) * 24680.1357;
  const fr = (x: number) => x - Math.floor(x);
  return [
    (fr(a) - 0.5) * radio * 2,
    (fr(b) - 0.5) * radio * 1.5,
    (fr(c) - 0.5) * radio,
  ];
};

// ── 01 · La renuncia ─────────────────────────────────────────────────────

export const F1Renuncia: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const ap = entrada(frame, 8, 40);

  return (
    <>
      <Escena3D camaraZ={6.2}>
        <Luces />
        <Telefono
          posicion={[0, 0.35, 0]}
          rotacion={[0.1, t * 0.35, 0.04]}
          escala={ap * 1.15}
        />
      </Escena3D>
      <Texto>
        <div style={{ marginBottom: 20 }}>
          <Nota delay={20} color={F.oro}>
            Martes · 09:14
          </Nota>
        </div>
        <Linea delay={30} size={62}>
          Tu mejor vendedor
        </Linea>
        <div style={{ marginTop: 8 }}>
          <Linea delay={44} size={62}>
            renuncia
          </Linea>
        </div>
      </Texto>
    </>
  );
};

// ── 02 · Se lleva el teléfono ────────────────────────────────────────────

export const F2Telefono: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const va = salida(frame, 26, 118);

  return (
    <>
      <Escena3D camaraZ={6.2}>
        <Luces />
        <Telefono
          posicion={[-va * 7, 0.35 + va * 1.1, -va * 3]}
          rotacion={[0.1, t * 0.35 + va * 1.4, 0.04 - va * 0.5]}
          escala={1.15}
        />
      </Escena3D>
      <Texto>
        <Linea delay={4} size={76}>
          Se lleva
        </Linea>
        <div style={{ marginTop: 8 }}>
          <Linea delay={16} size={76} resalte>
            el teléfono
          </Linea>
        </div>
      </Texto>
    </>
  );
};

// ── 03 · Y con él, la cartera ────────────────────────────────────────────

export const F3Cartera: React.FC = () => {
  const frame = useCurrentFrame();
  const va = salida(frame, 20, 150);

  return (
    <>
      <Escena3D camaraZ={7}>
        <Luces />
        <Telefono
          posicion={[-2.4 - va * 5, 1.3 + va * 1.4, -1.4]}
          rotacion={[0.1, 1.2 + va, -0.3]}
          escala={0.95}
        />
        {/* La cartera se va detrás del teléfono, en fila */}
        {Array.from({ length: 26 }).map((_, i) => {
          const [x, y, z] = disperso(i + 3, 2.6);
          const retardo = (i % 8) * 0.05;
          const p = Math.max(0, Math.min(1, va - retardo)) / (1 - retardo || 1);
          return (
            <Cliente
              key={i}
              seVa
              radio={0.13}
              posicion={[x - p * 6.5, y + p * 1.6, z - p * 1.2]}
              opacidad={1 - p * 0.75}
            />
          );
        })}
      </Escena3D>
      <Texto>
        <Linea delay={6} size={62}>
          Y con el teléfono
        </Linea>
        <div style={{ marginTop: 8 }}>
          <Linea delay={22} size={62} resalte>
            se lleva tu cartera
          </Linea>
        </div>
      </Texto>
    </>
  );
};

// ── 04 · Ochenta y seis ──────────────────────────────────────────────────

export const F4Ochentaiseis: React.FC = () => {
  const frame = useCurrentFrame();
  const ap = entrada(frame, 6, 44);

  return (
    <>
      <Escena3D camaraZ={7.6}>
        <Luces intensidad={0.92} />
        {Array.from({ length: 44 }).map((_, i) => {
          const [x, y, z] = disperso(i, 3.1);
          const flota = Math.sin(frame / 30 + i) * 0.07;
          return (
            <Cliente
              key={i}
              seVa
              radio={0.15 * ap}
              posicion={[x, y + flota, z]}
            />
          );
        })}
      </Escena3D>
      <Texto posicion="arriba">
        <div
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 210,
            lineHeight: 1,
            letterSpacing: "-0.06em",
            color: F.oroVivo,
            opacity: entrada(frame, 10, 34),
          }}
        >
          86
        </div>
        <div style={{ marginTop: 18 }}>
          <Linea delay={40} size={50}>
            clientes que hablaron
          </Linea>
        </div>
        <div style={{ marginTop: 6 }}>
          <Linea delay={54} size={50} resalte>
            con él, no con vos
          </Linea>
        </div>
      </Texto>
    </>
  );
};

// ── 05 · Todo lo que se va ───────────────────────────────────────────────

const PIEZAS = [
  "Cada charla",
  "Cada precio que tiró",
  "Cada auto que prometió",
];

export const F5Todo: React.FC = () => {
  const frame = useCurrentFrame();
  const va = salida(frame, 130, 320);

  return (
    <>
      <Escena3D camaraZ={7.6}>
        <Luces intensidad={0.85} />
        {Array.from({ length: 44 }).map((_, i) => {
          const [x, y, z] = disperso(i, 3.1);
          const dir = ((i % 5) - 2) * 0.9;
          return (
            <Cliente
              key={i}
              seVa
              radio={0.15}
              posicion={[x + va * dir * 2.4, y + va * 2.2, z - va * 1.4]}
              opacidad={1 - va * 0.85}
            />
          );
        })}
      </Escena3D>
      <Texto posicion="arriba">
        {PIEZAS.map((p, i) => (
          <div key={p} style={{ marginBottom: 14 }}>
            <Linea delay={10 + i * 26} size={48}>
              {p}
            </Linea>
          </div>
        ))}
        <div style={{ marginTop: 34 }}>
          <Nota delay={132} color={F.oro} size={30}>
            En un WhatsApp que ya no controlás
          </Nota>
        </div>
      </Texto>
    </>
  );
};

// ── 06 · Fuga de activos ─────────────────────────────────────────────────

export const F6Fuga: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  return (
    <>
      <Escena3D camaraZ={6.6}>
        <Luces intensidad={0.7} />
        {/* Un solo cuerpo: la escena es tipográfica, el 3D acompaña */}
        <mesh position={[2.1, -1.7, -1.2]} rotation={[t * 0.2, t * 0.3, 0]}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial
            color={F.oro}
            metalness={0.92}
            roughness={0.2}
            flatShading
          />
        </mesh>
      </Escena3D>
      <Texto>
        <div style={{ marginBottom: 26 }}>
          <Nota delay={4} color={F.tenue}>
            Llamalo por su nombre
          </Nota>
        </div>
        <Linea delay={14} size={58}>
          Eso no es rotación
        </Linea>
        <div style={{ marginTop: 16 }}>
          <Linea delay={72} size={74} resalte>
            Es fuga de activos
          </Linea>
        </div>
      </Texto>
    </>
  );
};

// ── 07 · El sistema retiene ──────────────────────────────────────────────

export const F7Sistema: React.FC = () => {
  const frame = useCurrentFrame();
  const arma = entrada(frame, 20, 150);

  return (
    <>
      <Escena3D camaraZ={7.2}>
        <Luces />
        <group position={[0, 0.5, 0]}>
          <Rejilla filas={6} columnas={5} paso={0.72} progreso={arma} />
        </group>
      </Escena3D>
      <Texto>
        <Linea delay={90} size={54}>
          La conversación es
        </Linea>
        <div style={{ marginTop: 10 }}>
          <Linea delay={106} size={54} resalte>
            de la empresa
          </Linea>
        </div>
        <div style={{ marginTop: 24 }}>
          <Nota delay={140} color={F.tenue} size={28}>
            No del celular de nadie
          </Nota>
        </div>
      </Texto>
    </>
  );
};

// ── 08 · Cierre ──────────────────────────────────────────────────────────

export const F8Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const va = salida(frame, 10, 90);

  return (
    <>
      <Escena3D camaraZ={7.2}>
        <Luces />
        {/* El teléfono se va... */}
        <Telefono
          posicion={[-1.8 - va * 6, 1.9 + va * 1.5, -1]}
          rotacion={[0.1, 1 + va * 1.2, -0.25]}
          escala={0.8}
        />
        {/* ...pero la rejilla queda intacta */}
        <group position={[0, 0.2, 0]}>
          <Rejilla filas={6} columnas={5} paso={0.72} progreso={1} />
        </group>
      </Escena3D>
      <Texto>
        <Linea delay={96} size={58}>
          El vendedor se va
        </Linea>
        <div style={{ marginTop: 12 }}>
          <Linea delay={112} size={58} resalte>
            Los clientes se quedan
          </Linea>
        </div>

        <div
          style={{
            marginTop: 44,
            display: "inline-flex",
            backgroundColor: F.oroVivo,
            borderRadius: 999,
            padding: "20px 40px",
            opacity: entrada(frame, 168, 194),
            translate: interpolate(frame, [168, 198], ["0px 18px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(...EASE),
            }),
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 36,
              color: F.navy,
            }}
          >
            Agendá tu diagnóstico
          </span>
        </div>

        <div style={{ marginTop: 24 }}>
          <Nota delay={202} color={F.tenue} size={26}>
            quantumcoffee.xyz
          </Nota>
        </div>
      </Texto>
    </>
  );
};
