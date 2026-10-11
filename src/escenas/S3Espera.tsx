import { useCurrentFrame } from "remotion";
import { Escena, Etiqueta, Fondo, Parrafo } from "../components/base";
import {
  Cifra,
  Riel,
  avanceReloj,
  formatear,
  progresoALogSeg,
} from "../components/Reloj";
import { C } from "../theme";

/** El cronometro sin sistema empieza a correr y se dispara. */
export const S3Espera: React.FC = () => {
  const frame = useCurrentFrame();

  // Corre de frame 14 a 138: arranca casi quieto y se acelera.
  // Tiene que cerrar antes del final de la escena (156 frames).
  const p = avanceReloj(frame, 14, 138);
  const segundos = progresoALogSeg(p);

  // Sobre papel el peso lo da el navy: la cifra se vuelve mas solida
  // a medida que la espera crece.
  const color = p < 0.35 ? C.tenue : C.navy;

  return (
    <Fondo>
      <Escena>
        <div style={{ marginBottom: 26 }}>
          <Etiqueta delay={2} color={C.oroSuave}>
            Hoy, sin sistema
          </Etiqueta>
        </div>

        <div style={{ marginBottom: 52 }}>
          <Parrafo delay={6} size={44}>
            El mensaje queda en el celular de alguien.
          </Parrafo>
        </div>

        <Cifra texto={formatear(segundos)} color={color} size={172} />

        <div style={{ marginTop: 50 }}>
          <Riel progreso={p} color={C.navy} />
        </div>

        <div style={{ marginTop: 52 }}>
          <Parrafo delay={106} size={38} color={C.tenue}>
            Sin dueño · sin puntaje
          </Parrafo>
        </div>
      </Escena>
    </Fondo>
  );
};
