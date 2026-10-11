# AutomLead / Quantum Coffee — comerciales verticales

Cuatro comerciales en 1080×1920, todos generados por código con Remotion.
Nada de lo que suena o se ve viene de librerías de terceros: **el resultado
es del cliente sin licencia de nadie.**

## Los cuatro videos

| Composición | Mecanismo visual | Fondo | Música | Voz |
| --- | --- | --- | --- | --- |
| `AutomLead` | Dos cronómetros sobre eje logarítmico | Blanco | 112 BPM, Do mayor | Kokoro |
| `Service` | Conversación que llena un calendario | Navy | 88 BPM, Fa mayor | Kokoro |
| `Panel` | Recorrido de producto en pasos | Alterna | 104 BPM, Sol mayor | Kokoro |
| `Fuga` | **3D**: objetos que se van vs. anclados | Negro | 76 BPM, Re menor | **Gemini Callirrhoe** |

Regla del proyecto: **ningún molde repetido.** La marca se mantiene; lo que
cambia en cada video es el mecanismo, el fondo y el carácter musical.

```bash
npx remotion studio                       # previsualizar
npx remotion render Fuga out/fuga.mp4 --crf=20 --concurrency=3
```

## Fuente única de la línea de tiempo

Cada video tiene su `timeline-*.json`, leído por dos consumidores: el
montaje (`src/timeline-*.ts`) y el generador de música. Cambiar una
duración ahí reacomoda **las dos cosas** a la vez. Los `from` se calculan
acumulando; no se escriben a mano.

⚠️ **Al cambiar duraciones, revisá las animaciones internas de la escena.**
No están atadas al JSON: usan números de frame propios. Si una escena se
acorta por debajo de su animación, se corta a la mitad. Ya pasó dos veces
(el cronómetro de `S3Espera` y la rejilla de `T4Horarios`).

## Voz

### Gemini TTS — la buena

```bash
python generar-voz-gemini.py guion-fuga.json voz-fuga Callirrhoe
```

Modelo `gemini-3.1-flash-tts-preview`, voz **Callirrhoe**. La API devuelve
PCM crudo de 16 bits a 24 kHz **sin cabecera**: el script arma el WAV a mano
antes de pasarlo a mp3.

El campo `_instruccion_voz` del guion se antepone al texto y es como el
modelo toma la indicación de tono. Verificado que la usa como guía y no la
lee en voz alta.

La key vive en `.env`, que está en `.gitignore`. **No la imprimas en logs.**

### Kokoro — la alternativa local

```bash
python generar-voz-kokoro.py guion.json voz ef_dora 1.0
```

Apache 2.0, corre 100 % local, sin key. Español neutro, no rioplatense.
Rinde ~6 s de audio por cada 22 s de cómputo en esta máquina.
**Limitación:** no lee dígitos — escribilos con palabras.

### Proceso de locución

```bash
bash procesar-voz.sh public/voz-fuga public/voz-fuga-proc
```

Cadena de broadcast: highpass, de-esser, cuerpo en 190 Hz, presencia en
4,2 kHz, aire en 11 kHz, compresión y reflexiones cortas de sala. Buena
parte de lo que delata a un TTS es que sale cruda, sonando en el vacío.

## Música y diseño sonoro

Todo se compone en `generar-musica-*.mjs` sobre el sintetizador propio de
`sintetizador.mjs` (osciladores con corte anti-aliasing, ADSR, filtro
pasabajos, notas).

El de `fuga` además trae una **biblioteca de efectos**: whoosh con filtro
barrido y paneo, impacto grave con click, chispa, enganche y riser. En un
video de frases tajantes lo que puntúa son los efectos, no la melodía.

### Por qué no un modelo generativo de música

| Modelo | Motivo |
| --- | --- |
| ACE-Step 1.5 | 3,5B params: ~7 GB de RAM (hay 3,6 libres) y horas sin GPU |
| Stable Audio Open Small | HuggingFace responde 401 — requiere cuenta |
| MusicGen | Pesos CC-BY-NC: prohibido comercialmente |

Componer por código da algo que ningún modelo ofrece: que los acentos caigan
**exactamente** sobre los cortes del montaje.

## 3D (composición `Fuga`)

`@remotion/three` + React Three Fiber. Geometría real con materiales, luces
y cámara: no hay imágenes ni modelos importados.

**Rendimiento medido** en esta máquina (2 núcleos físicos, sin GPU,
SwiftShader):

| | |
| --- | --- |
| Geometría procedural | **0,59 s/frame** |
| Con `.glb` externo cargado | **~0,3 s/frame** |
| Video de 59,5 s (1785 frames) | **~15 min** |

Subir la geometría sube el render de forma lineal: por eso las esferas usan
pocos segmentos y cada escena tiene pocos cuerpos.

### Integrar un modelo `.glb`

Está probado y funciona (`src/PruebaGLB.tsx`). Requisitos:

- Formato `.glb`, **menos de ~2 MB**
- Cargar con `useGLTF(staticFile("modelos3d/x.glb"))` — la ruta directa da 404
- **Licencia que permita uso comercial.** Cuidado: CC-BY obliga a atribución
  visible, y varios modelos gratuitos traen logos de terceros en la malla

Fuentes CC0 razonables: Poly Pizza, Quaternius, Kenney.

## Paletas

Todas son Quantum Coffee; cambia cuál manda.

| Archivo | Uso |
| --- | --- |
| `theme.ts` | Fondo claro. Muestreado del feed de Instagram real |
| `theme-oscuro.ts` | Navy sobre oscuro |
| `theme-panel.ts` | Las dos caras, para alternar |
| `theme-fuga.ts` | Negro profundo, para que el 3D recorte |

Colores medidos del feed (no estimados): papel `#F8F9F7`, navy `#051932`,
dorado vivo `#E8B01F`, dorado champagne `#B08D57`.

**Decisión semántica recurrente:** la paleta no tiene verde ni rojo. Donde
un video necesita separar "malo" de "bueno", la espera va en gris frío o
navy sólido y la respuesta en dorado.

Tipografías: **Archivo Black** (titulares) + **Archivo** (texto) +
**JetBrains Mono** (cifras).

## Pase final antes de publicar

```bash
ffmpeg -i out/fuga.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -movflags +faststart -y out/AutomLead-fuga-1080x1920.mp4
```

−14 LUFS es el estándar de Instagram y TikTok. `+faststart` adelanta el
`moov` para que arranque sin esperar la descarga completa.

## Corrección pendiente en el sitio

`automlead.iamautom.com` muestra **"14 h 03 m"** en el bloque de los relojes
y **"+32 h 13 m"** como diferencia final. Son inconsistentes.

De sábado 23:47 a lunes 08:00 hay exactamente **32 h 13 m**, que es la cifra
que usan estos videos.
