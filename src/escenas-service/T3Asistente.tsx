import { Burbuja, EscenaOsc, EtiquetaOsc, FondoOscuro } from "../components/chat";

/** El asistente contesta y pide la patente. */
export const T3Asistente: React.FC = () => {
  return (
    <FondoOscuro>
      <EscenaOsc>
        <div style={{ marginBottom: 34 }}>
          <EtiquetaOsc delay={2}>Whatsapp · mismo número</EtiquetaOsc>
        </div>

        <div style={{ width: 888, display: "flex", flexDirection: "column", gap: 18 }}>
          <Burbuja lado="cliente" hora="22:00" delay={0} ancho={640}>
            Hola, necesito hacerle el service de los 40.000 a la Hilux
          </Burbuja>
          <Burbuja lado="asistente" hora="22:00" delay={16} ancho={560}>
            Te lo agendo. ¿Me pasás la patente?
          </Burbuja>
          <Burbuja lado="cliente" hora="22:01" delay={64} ancho={300}>
            AB123CD
          </Burbuja>
        </div>
      </EscenaOsc>
    </FondoOscuro>
  );
};
