# -*- coding: utf-8 -*-
"""
Genera la locución con Gemini TTS (voz Callirrhoe).

La API devuelve PCM crudo de 16 bits a 24 kHz sin cabecera: hay que
construirle el WAV a mano antes de pasarlo a mp3.

La key sale de .env, que está en .gitignore. No se imprime nunca.

Uso:
    python generar-voz-gemini.py guion-fuga.json voz-fuga
"""
import base64
import io
import json
import os
import struct
import subprocess
import sys
import time
import urllib.error
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
GUION_ARCH = sys.argv[1] if len(sys.argv) > 1 else "guion-fuga.json"
SUBCARPETA = sys.argv[2] if len(sys.argv) > 2 else "voz-fuga"
VOZ = sys.argv[3] if len(sys.argv) > 3 else "Callirrhoe"
MODELO = sys.argv[4] if len(sys.argv) > 4 else "gemini-3.1-flash-tts-preview"
# Segundos entre segmentos, para respetar el limite por minuto del tier gratuito
PAUSA = float(os.environ.get("PAUSA_TTS", "22"))

SALIDA = os.path.join(AQUI, "public", SUBCARPETA)
SR = 24000


def leer_key():
    ruta = os.path.join(AQUI, ".env")
    if not os.path.exists(ruta):
        raise SystemExit("Falta .env con GEMINI_API_KEY")
    for linea in io.open(ruta, encoding="utf-8"):
        if linea.startswith("GEMINI_API_KEY="):
            return linea.split("=", 1)[1].strip()
    raise SystemExit("No encontré GEMINI_API_KEY en .env")


def escribir_wav(pcm, ruta):
    """La API entrega PCM pelado; el WAV se arma acá."""
    with open(ruta, "wb") as f:
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + len(pcm)))
        f.write(b"WAVE")
        f.write(b"fmt ")
        f.write(struct.pack("<IHHIIHH", 16, 1, 1, SR, SR * 2, 2, 16))
        f.write(b"data")
        f.write(struct.pack("<I", len(pcm)))
        f.write(pcm)


def sintetizar(key, texto, instruccion, intentos=3):
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "%s:generateContent?key=%s" % (MODELO, key)
    )
    # El prompt de estilo va delante del texto: es como Gemini TTS toma
    # la indicación de tono.
    contenido = instruccion + "\n\n" + texto if instruccion else texto

    cuerpo = {
        "contents": [{"parts": [{"text": contenido}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOZ}}
            },
        },
    }

    ultimo = None
    for intento in range(intentos):
        req = urllib.request.Request(
            url,
            data=json.dumps(cuerpo).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.load(r)
            parte = d["candidates"][0]["content"]["parts"][0]["inlineData"]
            return base64.b64decode(parte["data"])
        except urllib.error.HTTPError as e:
            ultimo = "HTTP %d: %s" % (e.code, e.read().decode("utf-8", "replace")[:200])
            # 429 y 5xx suelen resolverse esperando
            if e.code in (429, 500, 503) and intento < intentos - 1:
                espera = 25 * (intento + 1)
                print("   reintento en %ds (%s)" % (espera, ultimo[:60]))
                time.sleep(espera)
                continue
            raise SystemExit(ultimo)
        except Exception as e:
            ultimo = "%s: %s" % (type(e).__name__, str(e)[:150])
            if intento < intentos - 1:
                time.sleep(5)
                continue
            raise SystemExit(ultimo)
    raise SystemExit(ultimo)


def revisar_largos(guion, carpeta):
    """
    Avisa si algun segmento dura mucho mas de lo que su texto justifica.

    Gemini TTS a veces REPITE la frase entera: devuelve un audio del doble
    de largo que suena perfecto y pasa desapercibido hasta que ya esta
    montado en el video. Comparar duracion contra cantidad de palabras lo
    caza al instante. Una locucion normal ronda 0.45 s por palabra; una
    repetida se va a 0.9.
    """
    import subprocess
    sospechosos = []
    for seg in guion["segmentos"]:
        ruta = os.path.join(carpeta, "%s.mp3" % seg["id"])
        if not os.path.exists(ruta):
            continue
        salida = subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=nw=1:nk=1", ruta,
        ])
        seg_dur = float(salida.decode().strip())

        # Descontar las pausas: una frase como "Gratis. Sin tarjeta. Sin
        # vueltas." tiene poco texto y mucho silencio entre puntos, y sin
        # esto daba falsa alarma. Lo que delata una repeticion es HABLA de
        # mas, no silencio de mas.
        log = subprocess.run(
            ["ffmpeg", "-v", "info", "-i", ruta, "-af",
             "silencedetect=n=-40dB:d=0.2", "-f", "null", "-"],
            capture_output=True, text=True, errors="ignore",
        ).stderr
        silencio = sum(
            float(l.split("silence_duration:")[1].strip())
            for l in log.splitlines() if "silence_duration:" in l
        )
        habla = max(seg_dur - silencio, 0.1)

        palabras = len(seg["texto"].split())
        por_palabra = habla / max(palabras, 1)
        if por_palabra > 0.70:
            sospechosos.append((seg["id"], habla, palabras, por_palabra))

    if sospechosos:
        print("")
        print("ATENCION: estos segmentos duran de mas para su texto.")
        print("Lo tipico es que el modelo haya repetido la frase. Revisalos.")
        for sid, d, w, pp in sospechosos:
            print("  %-16s %5.2fs de habla / %2d palabras = %.2f s por palabra" % (sid, d, w, pp))


def main():
    key = leer_key()
    with io.open(os.path.join(AQUI, GUION_ARCH), encoding="utf-8") as f:
        guion = json.load(f)

    instruccion = guion.get("_instruccion_voz", "")
    os.makedirs(SALIDA, exist_ok=True)

    resultado = []
    t_total = time.time()

    for seg in guion["segmentos"]:
        mp3_previo = os.path.join(SALIDA, seg["id"] + ".mp3")
        if os.path.exists(mp3_previo):
            # Ya generado en una corrida anterior: no gastamos cuota de nuevo
            dur = float(subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=nw=1:nk=1", mp3_previo],
                capture_output=True, text=True).stdout.strip())
            resultado.append({"id": seg["id"], "segundos": round(dur, 3)})
            print("%-18s %6.2f s  (ya estaba)" % (seg["id"], dur))
            continue

        t0 = time.time()
        pcm = sintetizar(key, seg["texto"], instruccion)

        wav = os.path.join(SALIDA, seg["id"] + ".wav")
        escribir_wav(pcm, wav)
        mp3 = os.path.join(SALIDA, seg["id"] + ".mp3")
        subprocess.run(
            ["ffmpeg", "-v", "error", "-i", wav, "-c:a", "libmp3lame",
             "-b:a", "192k", "-y", mp3],
            check=True,
        )
        os.remove(wav)

        dur = len(pcm) / 2 / SR
        resultado.append({"id": seg["id"], "segundos": round(dur, 3)})
        print("%-18s %6.2f s de audio  (%.0fs)" % (seg["id"], dur, time.time() - t0))
        # El tier gratuito limita por minuto: espaciamos para no chocar la cuota
        time.sleep(PAUSA)

    total = sum(r["segundos"] for r in resultado)
    print("\nVOZ: %s (%s)" % (VOZ, MODELO))
    print("TOTAL LOCUCION: %.2f s | computo: %.0fs" % (total, time.time() - t_total))

    with io.open(os.path.join(AQUI, "duraciones-" + SUBCARPETA + ".json"), "w",
                 encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)

    print("\nFrames minimos por escena (30 fps, + pausa):")
    for r in resultado:
        print("  %-18s %4d" % (r["id"], int(r["segundos"] * 30) + 12))

    revisar_largos(guion, SALIDA)


main()
