# -*- coding: utf-8 -*-
"""
Genera el busto de marmol de la portada del carrusel con FLUX.1 [schnell].

Va SIN el visor dorado y SIN texto: esas dos cosas se dibujan despues en
HTML, donde se pueden posicionar al pixel y corregir sin volver a generar.
Pedirle texto a un modelo de imagen es lo que venia fallando.

FLUX schnell es Apache 2.0, asi que la imagen se puede usar comercialmente
sin atribucion.

Uso:
    python generar-busto.py [variantes]
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
VARIANTES = int(sys.argv[1]) if len(sys.argv) > 1 else 4
MODELO = "@cf/black-forest-labs/flux-1-schnell"
SALIDA = os.path.join(AQUI, "public", "carrusel")

PROMPT = (
    "A classical Greco-Roman marble bust of a woman with braided hair, facing "
    "forward, head and shoulders, cropped at the chest. Photorealistic weathered "
    "matte stone with fine surface texture. Isolated against a deep navy almost "
    "black background. Dramatic low-key studio lighting: a single warm golden key "
    "light from the upper right carving the cheekbone, the jaw and the shoulder, "
    "leaving the left side of the face in deep shadow. Warm champagne gold rim "
    "light along the contour. Museum photography, cinematic, high detail, "
    "shallow depth of field. Serene neutral expression, eyes closed. "
    "No text, no words, no letters, no logos, no watermark, no props."
)


def leer_env(clave):
    ruta = os.path.join(AQUI, ".env")
    if not os.path.exists(ruta):
        raise SystemExit("Falta .env")
    for linea in io.open(ruta, encoding="utf-8"):
        linea = linea.strip()
        if linea.startswith(clave + "="):
            return linea.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("Falta %s en .env" % clave)


def main():
    token = leer_env("CF_API_TOKEN")
    cuenta = leer_env("CF_ACCOUNT_ID")
    os.makedirs(SALIDA, exist_ok=True)

    url = "https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s" % (cuenta, MODELO)

    for i in range(1, VARIANTES + 1):
        destino = os.path.join(SALIDA, "busto-%d.png" % i)
        if os.path.exists(destino):
            print("  busto-%d.png ya existe, se saltea" % i)
            continue

        cuerpo = json.dumps({"prompt": PROMPT, "steps": 8}).encode("utf-8")
        pedido = urllib.request.Request(
            url,
            data=cuerpo,
            headers={
                "Authorization": "Bearer %s" % token,
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(pedido, timeout=120) as r:
                datos = json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            print("  variante %d: HTTP %s %s" % (i, e.code, e.read()[:200]))
            continue

        b64 = datos.get("result", {}).get("image")
        if not b64:
            print("  variante %d: respuesta sin imagen" % i)
            continue

        with open(destino, "wb") as f:
            f.write(base64.b64decode(b64))
        print("  busto-%d.png  %.0f KB" % (i, os.path.getsize(destino) / 1024))
        time.sleep(1)

    print("Listo: %s" % SALIDA)


if __name__ == "__main__":
    main()
