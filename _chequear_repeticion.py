# -*- coding: utf-8 -*-
"""Transcribe cada segmento de voz con Gemini y lo compara contra el guion,
para encontrar una palabra/frase repetida por el TTS."""
import base64
import io
import json
import os
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))

def leer_key():
    with io.open(os.path.join(AQUI, ".env"), encoding="utf-8") as f:
        for linea in f:
            if linea.startswith("GEMINI_API_KEY="):
                return linea.split("=", 1)[1].strip()
    raise SystemExit("no key")

def transcribir(key, ruta_mp3):
    with open(ruta_mp3, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("ascii")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={key}"
    cuerpo = {
        "contents": [{"parts": [
            {"text": "Transcribi EXACTAMENTE lo que se dice en este audio, palabra por palabra, en espanol. Sin agregar ni quitar nada, sin puntuacion adicional a la que se escucha. Solo el texto transcrito, nada mas."},
            {"inlineData": {"mimeType": "audio/mp3", "data": audio_b64}},
        ]}],
    }
    req_data = json.dumps(cuerpo).encode("utf-8")
    for intento in range(4):
        try:
            req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                d = json.load(r)
            return d["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            if intento < 3:
                import time
                time.sleep(8 * (intento + 1))
                continue
            raise

with io.open(os.path.join(AQUI, "guion-rc-v2.json"), encoding="utf-8") as f:
    guion = json.load(f)

key = leer_key()
for seg in guion["segmentos"]:
    ruta = os.path.join(AQUI, "public", "voz-rc-v2", seg["id"] + ".mp3")
    esperado = seg["texto"]
    real = transcribir(key, ruta)
    n_esp = len(esperado.split())
    n_real = len(real.split())
    marca = "  <-- SOSPECHOSO" if n_real > n_esp else ""
    print(f"{seg['id']:16} esperado({n_esp}): {esperado}")
    print(f"{'':16} real    ({n_real}): {real}{marca}")
    print()
