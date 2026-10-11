# -*- coding: utf-8 -*-
"""
Verifica cada toma de voz: la transcribe y la compara con el guion.

Existe porque el chequeo por duración/silencios NO detecta un tartamudeo
("La las ves"): solo una transcripción lo ve. Ver la habilidad
`video-cinematico-ring-closers` y la memoria `feedback-verificar-voz-con-transcripcion`.

Uso:
    python verificar-voz.py guion-secreto1.json voz-secreto1
    python verificar-voz.py guion-secreto1.json voz-secreto1 gemini-3.5-flash,gemini-3.5-transcribe
    python verificar-voz.py guion-secreto1.json voz-secreto1 cf:whisper-large-v3-turbo   # plan C, sin cupo de Gemini

- Corre TODOS los modelos (Gemini y, como segundo oído, Whisper de Cloudflare) y marca
  REVISAR si cualquiera de ellos encuentra algo. Un modelo que da 429 queda como "sin respuesta".
- Ignora signos de puntuación, mayúsculas, tildes y que el reconocedor escriba
  distinto el nombre de la marca ("Rainclosers" por "Ring Closers").
- Marca REVISAR si hay palabras de más, de menos o repetidas.
- Escribe el resultado en verificacion-<carpeta>.txt (UTF-8) y sale con código 1
  si alguna toma quedó en REVISAR o sin transcribir.
"""
import base64
import difflib
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
MARCA = {"ring", "closers", "closer"}
PROMPT = (
    "Transcribe exactamente lo que dice este audio en español, palabra por palabra, "
    "sin corregir. Si alguna palabra o sílaba se repite o tartamudea, escribila "
    "repetida. Responde solo la transcripción."
)


def leer_key():
    with io.open(os.path.join(AQUI, ".env"), encoding="utf-8") as f:
        for linea in f:
            if linea.startswith("GEMINI_API_KEY="):
                return linea.split("=", 1)[1].strip()
    raise SystemExit("Falta GEMINI_API_KEY en .env")


NUMEROS = {"0": "cero", "1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco", "6": "seis", "7": "siete", "8": "ocho", "9": "nueve", "10": "diez"}


def tokens(texto):
    # Whisper escribe "1." donde el guion dice "Uno:": mismo dicho, distinta grafía
    texto = re.sub(r"(\d{1,2})", lambda m: NUMEROS.get(m.group(1), m.group(1)), texto)
    t = unicodedata.normalize("NFD", texto.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", " ", t).split()


def comparar(esperado, escuchado):
    """Devuelve (ok, detalle). Puro: no toca la red, se puede probar solo."""
    e, h = tokens(esperado), tokens(escuchado)
    de_mas, faltan = [], []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, e, h).get_opcodes():
        if tag == "equal":
            continue
        pegado_e, pegado_h = "".join(e[i1:i2]), "".join(h[j1:j2])
        # "ring closers" vs "rainclosers": mismo sonido, distinta segmentación. Solo se
        # perdona en la marca: perdonarlo en cualquier palabra dejó pasar "subís de rango"
        # transcripto como "subiste rango" (18/09/2026).
        es_marca = any(t in MARCA for t in e[i1:i2])
        if tag == "replace" and es_marca and difflib.SequenceMatcher(None, pegado_e, pegado_h).ratio() >= 0.8:
            continue
        de_mas += h[j1:j2]
        faltan += e[i1:i2]
    repetidas = [
        h[i] for i in range(len(h) - 1)
        if h[i] == h[i + 1] and not any(e[k] == e[k + 1] == h[i] for k in range(len(e) - 1))
    ]
    ok = not de_mas and not faltan and not repetidas
    detalle = []
    if de_mas:
        detalle.append("de más: " + " ".join(de_mas))
    if faltan:
        detalle.append("faltan: " + " ".join(faltan))
    if repetidas:
        detalle.append("repetidas: " + " ".join(repetidas))
    return ok, "; ".join(detalle)


def leer_env(nombre):
    with io.open(os.path.join(AQUI, ".env"), encoding="utf-8") as f:
        for linea in f:
            if linea.startswith(nombre + "="):
                return linea.split("=", 1)[1].strip()
    return ""


def transcribir_cf(ruta, modelo):
    """Plan C cuando Gemini da 429: Whisper de Cloudflare Workers AI. Modelo: cf:whisper-large-v3-turbo."""
    cuenta, token = leer_env("CF_ACCOUNT_ID"), leer_env("CF_API_TOKEN")
    if not cuenta or not token:
        raise RuntimeError("faltan CF_ACCOUNT_ID / CF_API_TOKEN en .env")
    with open(ruta, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    url = "https://api.cloudflare.com/client/v4/accounts/%s/ai/run/@cf/openai/%s" % (cuenta, modelo.split(":", 1)[1])
    cuerpo = json.dumps({"audio": b64, "language": "es"}).encode()
    req = urllib.request.Request(
        url, data=cuerpo, headers={"Content-Type": "application/json", "Authorization": "Bearer " + token})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)["result"]["text"].strip()


def transcribir(clave, ruta, modelos):
    with open(ruta, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    cuerpo = json.dumps({"contents": [{"parts": [
        {"text": PROMPT},
        {"inline_data": {"mime_type": "audio/mp3", "data": b64}},
    ]}]}).encode()
    ultimo = ""
    for modelo in modelos:
        if modelo.startswith("cf:"):
            try:
                return modelo, transcribir_cf(ruta, modelo)
            except urllib.error.HTTPError as e:
                ultimo = "%s HTTP %d" % (modelo, e.code)
            except Exception as e:
                ultimo = "%s %s" % (modelo, str(e)[:80])
            continue
        url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s" % (modelo, clave)
        for intento in range(3):
            try:
                req = urllib.request.Request(url, data=cuerpo, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=90) as r:
                    parte = json.load(r)["candidates"][0]["content"]["parts"][0]
                # gemini-3.5-transcribe devuelve audioTranscription; los demás, text
                texto = parte.get("text") or parte.get("audioTranscription", {}).get("text", "")
                return modelo, texto.strip()
            except urllib.error.HTTPError as e:
                ultimo = "%s HTTP %d" % (modelo, e.code)
                if e.code == 404:
                    break  # el modelo no sirve con esta key: pasar al siguiente
                time.sleep(8 * (intento + 1))
            except Exception as e:  # timeout, red
                ultimo = "%s %s" % (modelo, str(e)[:60])
                time.sleep(8 * (intento + 1))
    return None, "ERROR (" + ultimo + ")"


def transcribir_todos(clave, ruta, modelos):
    """Corre CADA modelo por separado y devuelve [(modelo, texto|None, error|"")].

    Antes se usaba el primero que respondiera y eso dejó pasar un arranque en falso
    ("Practic… practic… Practicar siempre…") que gemini-3.5-transcribe no vio y
    Whisper sí (18/09/2026). Dos oídos distintos, y basta que uno marque para revisar.
    """
    salida = []
    for m in modelos:
        modelo, texto = transcribir(clave, ruta, [m])
        salida.append((m, texto if modelo else None, "" if modelo else texto))
        time.sleep(2)
    return salida


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    guion_arch, carpeta = sys.argv[1], sys.argv[2]
    modelos = sys.argv[3].split(",") if len(sys.argv) > 3 else ["gemini-3.5-flash", "gemini-3.5-transcribe", "cf:whisper-large-v3-turbo"]
    guion = json.load(io.open(os.path.join(AQUI, guion_arch), encoding="utf-8"))
    clave = leer_key()

    lineas, malas = [], 0
    for seg in guion["segmentos"]:
        ruta = os.path.join(AQUI, "public", carpeta, seg["id"] + ".mp3")
        resultados = transcribir_todos(clave, ruta, modelos)
        oyeron = [(m, t) for m, t, _ in resultados if t is not None]
        fallaron = [m for m, t, _ in resultados if t is None]
        partes, hay_revisar = [], False
        for m, t in oyeron:
            ok, det = comparar(seg["texto"], t)
            hay_revisar = hay_revisar or not ok
            partes.append("  oído (%s): %s%s" % (m, t, ("  <-- REVISAR: " + det) if not ok else ""))
        if not oyeron:
            estado = "SIN VERIFICAR"
        elif hay_revisar:
            estado = "REVISAR"
        else:
            estado = "OK (%d de %d oídos)" % (len(oyeron), len(modelos))
        if estado != "OK (%d de %d oídos)" % (len(modelos), len(modelos)):
            malas += 1
        if fallaron:
            partes.append("  sin respuesta: " + ", ".join(fallaron))
        bloque = "%-14s %s\n  guion: %s\n%s\n" % (seg["id"], estado, seg["texto"], "\n".join(partes))
        print(bloque)
        lineas.append(bloque)

    resumen = "%d toma(s) para revisar o sin verificar de %d" % (malas, len(guion["segmentos"]))
    print(resumen)
    with io.open(os.path.join(AQUI, "verificacion-%s.txt" % carpeta), "w", encoding="utf-8") as f:
        f.write("\n".join(lineas) + "\n" + resumen + "\n")
    sys.exit(1 if malas else 0)


if __name__ == "__main__":
    main()
