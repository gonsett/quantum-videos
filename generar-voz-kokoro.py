# -*- coding: utf-8 -*-
"""
Genera la locucion con Kokoro-82M (ONNX, Apache 2.0) y mide cada segmento.

Frente a edge-tts: corre 100% local, sin endpoint de terceros, y la licencia
permite uso comercial sin zona gris. A cambio, las voces son de espanol
neutro, no rioplatense.

Limitacion conocida del modelo: no lee digitos. El guion los escribe en
letras a proposito ("treinta y dos horas"), asi que no afecta.
"""
import io
import json
import os
import subprocess
import sys
import time

import soundfile as sf
from kokoro_onnx import Kokoro

AQUI = os.path.dirname(os.path.abspath(__file__))
GUION_ARCH = sys.argv[1] if len(sys.argv) > 1 else "guion.json"
SUBCARPETA = sys.argv[2] if len(sys.argv) > 2 else "voz"
VOZ = sys.argv[3] if len(sys.argv) > 3 else "ef_dora"
VELOCIDAD = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
SALIDA = os.path.join(AQUI, "public", SUBCARPETA)


def a_mp3(wav, mp3):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-i", wav, "-c:a", "libmp3lame",
         "-b:a", "192k", "-y", mp3],
        check=True,
    )
    os.remove(wav)


def main():
    with io.open(os.path.join(AQUI, GUION_ARCH), encoding="utf-8") as f:
        guion = json.load(f)

    os.makedirs(SALIDA, exist_ok=True)
    k = Kokoro(
        os.path.join(AQUI, "modelos", "kokoro-v1.0.onnx"),
        os.path.join(AQUI, "modelos", "voices-v1.0.bin"),
    )

    resultado = []
    t_total = time.time()

    for seg in guion["segmentos"]:
        t0 = time.time()
        muestras, sr = k.create(
            seg["texto"], voice=VOZ, speed=VELOCIDAD, lang="es"
        )
        wav = os.path.join(SALIDA, seg["id"] + ".wav")
        sf.write(wav, muestras, sr)
        a_mp3(wav, os.path.join(SALIDA, seg["id"] + ".mp3"))

        dur = len(muestras) / sr
        resultado.append({"id": seg["id"], "segundos": round(dur, 3)})
        print("%-16s %6.2f s de audio  (%.0fs de computo)"
              % (seg["id"], dur, time.time() - t0))

    total = sum(r["segundos"] for r in resultado)
    print("\nVOZ: %s | TOTAL LOCUCION: %.2f s | computo: %.0fs"
          % (VOZ, total, time.time() - t_total))

    with io.open(os.path.join(AQUI, "duraciones-" + SUBCARPETA + ".json"), "w",
                 encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)

    # Los frames de cada escena tienen que cubrir su frase
    print("\nFrames necesarios por escena (30 fps, + pausa de respiracion):")
    for r in resultado:
        print("  %-16s %4d frames minimo" % (r["id"], int(r["segundos"] * 30) + 12))


main()
