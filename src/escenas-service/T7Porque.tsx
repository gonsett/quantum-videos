import { EscenaOsc, EtiquetaOsc, FondoOscuro, ParrafoOsc, TitularOsc } from "../components/chat";
import { O } from "../theme-oscuro";

/** Por que no agenda un diagnostico: lo decide una persona. */
export const T7Porque: React.FC = () => {
  return (
    <FondoOscuro>
      <EscenaOsc>
        <div style={{ marginBottom: 30 }}>
          <EtiquetaOsc delay={2}>El criterio</EtiquetaOsc>
        </div>

        <div style={{ marginBottom: 34 }}>
          <ParrafoOsc delay={8} size={44} maxWidth={880}>
            Un diagnóstico puede llevar una hora o tres días.
          </ParrafoOsc>
        </div>

        <div style={{ marginBottom: 10 }}>
          <TitularOsc size={72} delay={62}>
            Eso lo decide
          </TitularOsc>
        </div>
        <div style={{ marginBottom: 10 }}>
          <TitularOsc size={72} delay={74}>
            alguien que
          </TitularOsc>
        </div>
        <TitularOsc size={72} resalte delay={88}>
          vio el auto
        </TitularOsc>

        <div style={{ marginTop: 44 }}>
          <ParrafoOsc delay={124} size={40} color={O.tenue}>
            No un bot.
          </ParrafoOsc>
        </div>
      </EscenaOsc>
    </FondoOscuro>
  );
};
