import { Burbuja, EscenaOsc, EtiquetaOsc, FondoOscuro } from "../components/chat";

/** Entra la consulta de service. */
export const T2Consulta: React.FC = () => {
  return (
    <FondoOscuro>
      <EscenaOsc>
        <div style={{ marginBottom: 40 }}>
          <EtiquetaOsc delay={4}>Whatsapp · mismo número</EtiquetaOsc>
        </div>

        <div style={{ width: 888 }}>
          <Burbuja lado="cliente" hora="22:00" delay={12}>
            Hola, necesito hacerle el service de los 40.000 a la Hilux
          </Burbuja>
        </div>
      </EscenaOsc>
    </FondoOscuro>
  );
};
