import { Escena, Fondo, Titular } from "../components/base";
import { C } from "../theme";

/**
 * La pregunta que ordena todo el video.
 * La caja dorada cae sobre "en contestar", que es el verbo del problema.
 */
export const S2Pregunta: React.FC = () => {
  return (
    <Fondo>
      <Escena>
        <div style={{ marginBottom: 6 }}>
          <Titular size={76} color={C.navy} delay={2}>
            ¿Cuánto tarda
          </Titular>
        </div>
        <div style={{ marginBottom: 14 }}>
          <Titular size={76} color={C.navy} delay={12}>
            tu concesionaria
          </Titular>
        </div>
        <Titular size={76} resalte inclinacion={-1.4} delay={24}>
          en contestar eso
        </Titular>
      </Escena>
    </Fondo>
  );
};
