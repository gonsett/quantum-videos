# -*- coding: utf-8 -*-
"""
Genera las ilustraciones del comercial con FLUX.1 [schnell] en Cloudflare
Workers AI.

Por qué Cloudflare: FLUX schnell es Apache 2.0 (uso comercial sin
atribución), el tier gratuito da 100.000 requests por día y tarda 1-2
segundos por imagen. Con eso se puede generar VARIAS variantes de cada
beat y quedarse con la mejor, que es como se compensa que schnell sea la
variante chica del modelo.

La consistencia entre imágenes es el problema difícil: nueve imágenes
lindas pero de nueve autores distintos arruinan el video. Se sostiene con
un andamiaje fijo de estilo que va en todos los prompts, y variando sólo
el sujeto.

Uso:
    python generar-imagenes.py guion-velocidad.json ilustraciones 4
"""
import base64
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
GUION_ARCH = sys.argv[1] if len(sys.argv) > 1 else "guion-velocidad.json"
SUBCARPETA = sys.argv[2] if len(sys.argv) > 2 else "ilustraciones"
VARIANTES = int(sys.argv[3]) if len(sys.argv) > 3 else 4

MODELO = "@cf/black-forest-labs/flux-1-schnell"

# Andamiaje: esto es lo que hace que las nueve parezcan del mismo autor.
# Va idéntico en todos los prompts; sólo cambia el sujeto.
ESTILO = (
    " Editorial 3D product illustration. Deep navy background, almost black. "
    "Champagne gold as the only accent color. Soft studio lighting with a "
    "single warm key light and subtle rim light. Glossy reflective surfaces, "
    "shallow depth of field. Centered composition, object floating or isolated, "
    "generous empty space around it. Cinematic, minimal, premium, high detail. "
    "No text, no words, no letters, no people, no hands, no logos."
)


def leer_cfg():
    ruta = os.path.join(AQUI, ".env")
    cfg = {}
    for linea in io.open(ruta, encoding="utf-8"):
        if "=" in linea:
            k, v = linea.split("=", 1)
            cfg[k.strip()] = v.strip()
    return cfg["CF_ACCOUNT_ID"], cfg["CF_API_TOKEN"]


def generar(acc, tok, prompt, intentos=3):
    url = "https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s" % (acc, MODELO)
    # El endpoint no acepta seed: sin ella cada llamada varia sola,
    # que es justo lo que queremos para generar variantes.
    cuerpo = {"prompt": prompt, "steps": 8}

    for intento in range(intentos):
        req = urllib.request.Request(
            url,
            data=json.dumps(cuerpo).encode("utf-8"),
            headers={"Authorization": "Bearer " + tok,
                     "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.load(r)
            if not d.get("success"):
                raise RuntimeError(str(d.get("errors"))[:200])
            return base64.b64decode(d["result"]["image"])
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:180]
            if e.code in (429, 500, 502, 503) and intento < intentos - 1:
                time.sleep(4 * (intento + 1))
                continue
            raise RuntimeError("HTTP %d: %s" % (e.code, msg))
        except Exception:
            if intento < intentos - 1:
                time.sleep(3)
                continue
            raise
    raise RuntimeError("sin resultado")


def main():
    acc, tok = leer_cfg()
    with io.open(os.path.join(AQUI, GUION_ARCH), encoding="utf-8") as f:
        guion = json.load(f)

    salida = os.path.join(AQUI, "public", SUBCARPETA)
    os.makedirs(salida, exist_ok=True)

    t_total = time.time()
    total = 0

    for seg in guion["segmentos"]:
        prompt = seg["imagen"] + "." + ESTILO
        for v in range(VARIANTES):
            nombre = "%s-v%d.png" % (seg["id"], v + 1)
            ruta = os.path.join(salida, nombre)
            t0 = time.time()
            try:
                img = generar(acc, tok, prompt)
                open(ruta, "wb").write(img)
                print("  %-22s %4d KB  %.1fs" % (nombre, len(img) // 1024, time.time() - t0))
                total += 1
            except Exception as e:
                print("  %-22s FALLO: %s" % (nombre, str(e)[:110]))

    print("\n%d imagenes en %.0fs -> public/%s" % (total, time.time() - t_total, SUBCARPETA))
    print("Siguiente paso: elegir una variante por beat y renombrarla <id>.png")


main()
