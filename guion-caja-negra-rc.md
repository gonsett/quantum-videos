# Guion desarrollado: "La caja negra" (Ring Closers)

Borrador v1, 17/10/2026. Espera el OK de Javier antes de la muestra de 5 s.

- Formato: 9:16, unos 42 s, voz Callirrhoe en una sola toma corrida.
- Estética: inspección forense de lujo. Negro, platino y un solo acento esmeralda; vidrio, polvo en el haz de luz y grano.
- Héroe: un registrador de vuelo (caja negra) de titanio grafito, con el cilindro de memoria arriba y una franja de esmalte esmeralda. Es el mismo objeto todo el video y cambia de luz, de plano y de estado.
- Referencias: `out/caja-negra-rc/ref/r2-heroe-v2.png` (hallazgo), `r2-heroe-v3.png` (plano general) y `r2-escaner-v2.png` (escáner).

## Texto completo para la voz

Cuando se cae un avión, alguien busca la caja negra para saber qué pasó. Cuando se te cae una venta, nadie te dice nada. Te dicen «lo veo y te aviso», y desaparecen. ¿Fue el precio? ¿Te apuraste? ¿Fue algo que dijiste en el minuto doce? Nunca lo vas a saber. Y cuando adivinás, cambiás lo que no estaba mal, y repetís lo que sí. En Ring Closers, cada roleplay tiene su caja negra. Lo grabás, y la grabación vive en la pelea: volvés al minuto doce y lo ves con tus propios ojos. Y el closer que estuvo enfrente te pone nota. Un cliente se va sin decirte nada. Un closer te dice cómo estuviste. Ring Closers. Practicá con closers. Cerrá con clientes.

## Escena por escena

| # | Tiempo | Voz | Imagen | Sonido |
|---|---|---|---|---|
| 1. El hallazgo | 0–5 s | "Cuando se cae un avión, alguien busca la caja negra para saber qué pasó." | Oscuridad total. Un haz de linterna barre desde arriba a la izquierda, con polvo suspendido, y encuentra la caja: primero un filo platino, después la franja esmeralda. La cámara empuja lento. | Viento grave y lejano. Un golpe sordo y metálico cuando el haz toca la caja. |
| 2. Tu caja | 5–9 s | "Cuando se te cae una venta, nadie te dice nada." | Corte al mismo objeto, ahora con una etiqueta grabada a láser: "VENTA · 14/10". La linterna parpadea y se apaga. Queda solo el borde platino, que se pierde. | El viento se corta en seco en "nada". Silencio con aire de sala. |
| 3. "Lo veo y te aviso" | 9–12 s | "Te dicen «lo veo y te aviso», y desaparecen." | En la oscuridad flota la frase en serif itálica marfil, chica y elegante. En "desaparecen" se deshace en polvo que cae dentro del haz apagado. | Un susurro de arena que se lleva la frase. |
| 4. Las preguntas | 12–18 s | "¿Fue el precio? ¿Te apuraste? ¿Fue algo que dijiste en el minuto doce?" | Una línea de tiempo de vidrio de 0 a 40 min cruza el cuadro por delante de la caja desenfocada. Con cada pregunta se enciende una marca gris con un signo de pregunta fino: min 3, min 7 y min 12. | Un ping de sonar por pregunta, sin eco: nadie responde. |
| 5. Adivinar | 18–24 s | "Nunca lo vas a saber. Y cuando adivinás, cambiás lo que no estaba mal, y repetís lo que sí." | Las marcas se desordenan y se cruzan sobre la línea. Una se apaga donde no debía y otra queda. La cámara se aleja y la caja queda chica y sola en el negro. | Placas metálicas que se desacomodan y un pulso grave que se ahoga. Caída hueca en "lo que sí". |
| 6. Se abre | 24–28 s | "En Ring Closers, cada roleplay tiene su caja negra." | Golpe de luz: la tapa se abre con peso y sale un hilo de bruma. La franja esmeralda se enciende. | El golpe más grande hasta ahora, con un clic mecánico y cola de reverb. |
| 7. El minuto doce | 28–34 s | "Lo grabás, y la grabación vive en la pelea: volvés al minuto doce y lo ves con tus propios ojos." | Un escáner láser esmeralda, una sola línea perfecta, recorre la caja. La línea de tiempo vuelve, ahora nítida: el cabezal corre y se clava en "min 12", que deja de ser una pregunta y se vuelve un fotograma con una onda de voz. | El ping del escáner, ahora con eco y afinado. Un tic de cabezal al llegar al 12. |
| 8. La nota | 34–37 s | "Y el closer que estuvo enfrente te pone nota." | Sobre el vidrio aparece una tarjeta de evaluación mínima: cinco marcas finas que se encienden en esmeralda una a una, con la nota del rival. | Cinco notas cortas y cristalinas en escala ascendente. |
| 9. La tesis | 37–40 s | "Un cliente se va sin decirte nada. Un closer te dice cómo estuviste." | Plano general: la caja abierta e iluminada, la línea de tiempo y la tarjeta flotando. Es el reverso exacto del plano 2. | La música resuelve y queda un acorde abierto. |
| 10. Cierre | 40–43 s | "Ring Closers. Practicá con closers. Cerrá con clientes." | El logo de Ring Closers aparece grabado en la tapa con un barrido especular, y debajo, chico, "Practicá con closers. Cerrá con clientes." | El golpe final grande y la cola de la placa metálica. |

## Por qué el texto es verdad (revisado contra la app)
- **"Lo grabás, y la grabación vive en la pelea"**: la pelea tiene un link de Fathom ("Grabación de Fathom ya vinculada a esta pelea" y "Ver grabación en Fathom", en `components/game/fight-card.tsx`). Es opcional, por eso dice "lo grabás" y no "se graba solo".
- **"El closer que estuvo enfrente te pone nota"**: el rival te evalúa de 1 a 5 al terminar. Tu perfil muestra la "Valoración de sus pares (sobre 5)" desde la tercera evaluación.
- **Lo que se sacó del borrador**: "te escribe qué vio". La app guarda el comentario escrito, pero el evaluado no lo ve en ninguna pantalla. Si se suma esa función, la escena 8 puede mostrar una línea de comentario y el texto puede volver a decirlo.
- No repite frases de "Escuchate" ("la frase exacta donde se te fue", "tu roleplay se graba y queda guardado").
- Sin "gratis". No se menciona a los coaches.

## Dirección de voz (para el JSON)
Una closer rioplatense que le cuenta a un colega algo que a ella también le dolió:
- La apertura del avión, serena y casi documental.
- Desde "nadie te dice nada", más cerca, con un poco de bronca contenida.
- Las tres preguntas, rápidas, como cuando uno se las hace solo en el auto.
- "Nunca lo vas a saber", seco.
- Desde "En Ring Closers" gana luz y firmeza, sin subir el tono.

Nada de locutora ni de tono de anuncio. "Roleplay" y "closers" se dicen con pronunciación natural en inglés.

## Notas
- La fecha de la etiqueta ("14/10") y los minutos (3, 7 y 12) son inventados.
- El héroe es fotográfico y se trabaja en capas: una imagen base generada (con la tapa cerrada y otra con la tapa abierta) y luz, polvo, láser, línea de tiempo y tarjeta hechos en Remotion. La cámara se mueve sobre la imagen con paralaje y profundidad de campo.
