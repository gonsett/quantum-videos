# Traspaso: video "Los 7 segundos" (Ring Closers)

Aprobado por Javier el 11/10/2026: "Si, dale". Es el tema 1 de 5 que se le propusieron.

## Concepto
- **Dolor:** el closer dice el precio, del otro lado hay silencio y no lo aguanta. En el segundo 2 ya está justificando ("incluye esto, si pagás hoy…") y en el 4 ya bajó el precio sin que nadie se lo pidiera.
- **Visual (lenguaje nuevo, no repetir la hoja de "Sonás a guion" ni el calendario de "La mala racha"):**
  - Un cronómetro de precisión tipo relojería (bisel metálico, aguja fina, décimas) sobre negro.
  - La onda de la llamada, plana.
  - Cada vez que el closer rompe el silencio, cae una cifra que se le descuenta al precio. El precio se ve gris y tachado.
- **Salida:** con roleplay aprende a aguantar los 7 segundos. El cronómetro llega a 7, habla el otro, el precio queda entero y aparece el esmeralda.
- **Cierre:** logo y "Practicá con closers. Cerrá con clientes."

## Guion borrador (proponérselo a Javier y esperar su OK antes de generar la voz)
> Decís el precio. Y del otro lado… silencio. Uno. Dos. Y ya estás hablando: que incluye esto, que si pagás hoy… Al cuatro, ya bajaste el precio. Y nadie te lo pidió. Ese silencio no era un no: estaba pensando. Aguantar siete segundos no se aprende leyendo. Se aprende aguantándolos, contra alguien que te mira y no dice nada. En Ring Closers hacés roleplay con otros closers. Round tras round. Hasta que el silencio deja de pesarte, y el que habla primero es él. Ring Closers. Practicá con closers. Cerrá con clientes.

Datos inventados, por ejemplo: precio USD 2.400, descuento a USD 1.900.

## Orden de trabajo (reglas en memoria)
1. Guion: esperar el OK de Javier.
2. **Muestra en movimiento de 5 s** (el cronómetro) antes del video completo, y esperar el OK. Ver la memoria feedback-muestra-en-movimiento.
3. Voz:
   - Siempre **Callirrhoe**, que no suene a publicidad.
   - Una sola toma corrida, sin pausas mayores a 0,25 s.
   - Generarla con `generar-voz-gemini.py`.
   - Transcribirla con `verificar-voz.py`.
   - El guion va en `guion-silencio-rc.json`, con el mismo formato que `guion-libreto-rc.json`.
4. Sonido con drama y música tenue: copiar `generar-sonido-libreto-video.py`. Acá el tic del cronómetro es el instrumento principal y en el silencio no hay música.
5. Video:
   - Plantilla: `src/libreto-rc/Video.tsx` (cámara en spline continua, render en 4 partes de 600 cuadros, unidas con concat y `-c copy`, limitador `alimiter=limit=0.89`).
   - Carpeta nueva: `src/silencio-rc/`.
   - Salida: `out/silencio-rc/`.
6. Portada Nº 14 de la grilla:
   - Se edita `out/portadas-grilla/portada.html`.
   - El objeto héroe lo genera Javier en GPT; el prompt se agrega en `ring-closers-portadas/prompts-grilla-reels.md`.
7. Guardar en memoria `ring-closers-video-silencio.md` + su línea en MEMORY.md.

## Estética
- Negro premium, un solo acento esmeralda (#10b981 / #34d399), líneas finas y vidrio.
- Nunca nada que parezca CapCut. La vara es el video de élite y "La mala racha".
- Sin "gratis" ni precios de Ring Closers.
- Ring Closers complementa a los coaches, nunca los reemplaza.
- No mandarle a Javier nada de `qa/`.
