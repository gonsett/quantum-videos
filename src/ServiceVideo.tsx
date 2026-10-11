import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { O } from "./theme-oscuro";
import { MarcoOscuro } from "./components/MarcoOscuro";
import { ESCENAS_SERVICE } from "./timeline-service";
import { T1Cerrado } from "./escenas-service/T1Cerrado";
import { T2Consulta } from "./escenas-service/T2Consulta";
import { T3Asistente } from "./escenas-service/T3Asistente";
import { T4Horarios } from "./escenas-service/T4Horarios";
import { T5Cargado } from "./escenas-service/T5Cargado";
import { T6Limite } from "./escenas-service/T6Limite";
import { T7Porque } from "./escenas-service/T7Porque";
import { T8Cierre } from "./escenas-service/T8Cierre";

const COMPONENTES: Record<string, React.FC> = {
  cerrado: T1Cerrado,
  consulta: T2Consulta,
  asistente: T3Asistente,
  horarios: T4Horarios,
  cargado: T5Cargado,
  limite: T6Limite,
  porque: T7Porque,
  cierre: T8Cierre,
};

export const ServiceVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: O.fondo }}>
      {ESCENAS_SERVICE.map((escena) => {
        const Componente = COMPONENTES[escena.id];
        return (
          <Sequence
            key={escena.id}
            name={escena.id}
            from={escena.from}
            durationInFrames={escena.durationInFrames}
          >
            <Componente />
          </Sequence>
        );
      })}

      <MarcoOscuro />

      {/* Esta pista sale a -13.4 dBFS de pico contra los -9.6 de la del primer
          comercial, asi que necesita mas nivel para el mismo peso percibido. */}
      <Audio src={staticFile("audio/cama-service.wav")} volume={0.5} />

      {ESCENAS_SERVICE.map((escena) => (
        <Sequence
          key={`voz-${escena.id}`}
          name={`voz-${escena.id}`}
          from={escena.from + escena.vozDelay}
        >
          <Audio src={staticFile(`voz-service-proc/${escena.voz}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
