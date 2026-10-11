#!/usr/bin/env bash
# Acelera la locución sin subirle el tono.
#
# `atempo` estira el tiempo preservando la altura: la voz suena más ágil,
# no más aguda. A 1.4x la Callirrhoe deja de tener ese arrastre de TTS que
# la delata y pasa a leer como alguien que sabe lo que va a decir.
#
# Se aplica DESPUÉS de procesar-voz.sh, no antes: el de-esser y el compand
# trabajan mejor sobre el material a velocidad original.
#
# Uso:  bash acelerar-voz.sh public/voz-demora-proc public/voz-demora-14x 1.4

set -euo pipefail

ORIGEN="${1:-public/voz-proc}"
DESTINO="${2:-public/voz-14x}"
FACTOR="${3:-1.4}"
mkdir -p "$DESTINO"

for f in "$ORIGEN"/*.mp3; do
  nombre=$(basename "$f")
  ffmpeg -v error -i "$f" -af "atempo=$FACTOR" -c:a libmp3lame -b:a 192k -y "$DESTINO/$nombre"
  printf '  %-22s %sx\n' "$nombre" "$FACTOR"
done

echo "Listo: $DESTINO"
