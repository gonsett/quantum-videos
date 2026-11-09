# Reel 03 «Antes de abrir reservas» — guion (09/11)

Arranque de 3 s APROBADO 09/11 («si, sigue»): sillón vacío recortado, sin humanos.
Idea tomada de un reel de la competencia (5 pasos antes de ofrecer reservas), contada con la vara de Tupé.

Voz: Brio (Gemini TTS en AI Studio), una toma continua, charla sin apuro, con respiración.

| Paso | Voz | Pantalla real (demo con datos de muestra) | Respaldo en el sistema |
| --- | --- | --- | --- |
| Arranque | Antes de abrir reservas, hacé esto. | Sillón + título (aprobado) | — |
| 1 | Uno. Cargá cada servicio con lo que dura. Un corte no lleva lo mismo que corte y barba. | Ajustes → Servicios (Minutos 30 / 50) | t-ajustes.js, pestaña Servicios |
| 2 | Dos. Poné tus horarios, y bloqueá tu descanso. | Ajustes → Horarios; Agenda → «Bloquear un rato» → bloque «Descanso» | t-ajustes.js filaHorario; t-agenda.js modo bloquear |
| 3 | Tres. Al que llega sin turno, cargalo en la agenda. Así nunca das la misma hora dos veces. | Agenda → tocar hueco → «Nuevo turno» | t-agenda.js: tocar un hueco crea; libre() rechaza «Ahí ya hay otro turno.» |
| 4 | Cuatro. Reservá vos primero, como si fueras cliente. | Reserva pública: servicio → cuándo → «Confirmar turno» | reserva.html / landing res-*.webp |
| 5 | Cinco. Compartí tu link. | Ajustes → Barbería → «Link para reservar» + Copiar | t-ajustes.js / agenda tiraLink |
| Cierre | Tu sillón, listo para que reserven. Tupé. Probala. | Sillón con la luz encendida + logo + tupe.quantumcoffee.xyz | — |

Verdad: la app real NO tiene almuerzo fijo (ALMUERZO [0,0] con datos reales); el descanso se hace con «Bloquear». Por eso la voz dice «bloqueá tu descanso» y la pantalla muestra el bloqueo, no el almuerzo del demo. No hay modo «orden de llegada»: el que llega sin turno se carga a mano en la agenda.
