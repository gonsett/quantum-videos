#!/usr/bin/env bash
# Cadena de proceso de locución, la misma que se le hace a una voz grabada.
#
# Buena parte de lo que delata a un TTS es que sale cruda: sin cuerpo en los
# graves, sin presencia en los medios-altos, con dinámica plana y sin ninguna
# reflexión de sala. Suena como si estuviera en el vacío.
#
# Orden de la cadena (importa):
#   1. highpass 85 Hz   - saca retumbe que no aporta a una voz
#   2. de-esser         - doma las eses, que en TTS salen muy marcadas
#   3. warmth 190 Hz    - cuerpo y efecto de proximidad (voz "cerca")
#   4. presencia 4.2k   - inteligibilidad y filo de locutor
#   5. aire 11k         - abre el timbre sin sisear
#   6. compand          - densidad de broadcast: sube lo bajo, doma los picos
#   7. aecho corto      - reflexiones tempranas: la saca del vacío
#   8. loudnorm         - nivel parejo entre segmentos
#
# Uso:  bash procesar-voz.sh
# Lee public/voz/*.mp3 y escribe public/voz-proc/*.mp3

set -euo pipefail

ORIGEN="${1:-public/voz}"
DESTINO="${2:-public/voz-proc}"
mkdir -p "$DESTINO"

CADENA="highpass=f=85,\
deesser=i=0.35:m=0.5:f=0.5,\
equalizer=f=190:t=q:w=1.1:g=2.4,\
equalizer=f=4200:t=q:w=1.5:g=3.2,\
equalizer=f=11000:t=q:w=1.0:g=1.8,\
compand=attacks=0.005:decays=0.18:points=-70/-70|-32/-16|-18/-9|-6/-5|0/-4:soft-knee=5:gain=2,\
aecho=0.85:0.35:14|23:0.11|0.07,\
loudnorm=I=-17:TP=-2.0:LRA=9"

for f in "$ORIGEN"/*.mp3; do
  nombre=$(basename "$f")
  ffmpeg -v error -i "$f" -af "$CADENA" -c:a libmp3lame -b:a 192k -y "$DESTINO/$nombre"
  printf '  %-22s procesado\n' "$nombre"
done

echo "Listo: $DESTINO"
