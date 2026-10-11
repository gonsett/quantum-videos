# -*- coding: utf-8 -*-
"""
Imágenes verticales con Gemini (plan B cuando Cloudflare no tiene cuota). Mismo JSON que generar-imagenes-rayos.py.
Uso: python generar-imagenes-gemini.py planos.json <carpeta-salida> [modelo] [variantes] [solo-id,...]
"""
import base64, io, json, os, sys, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
PLANOS = sys.argv[1]
SALIDA = os.path.join(AQUI, sys.argv[2])
MODELO = sys.argv[3] if len(sys.argv) > 3 else "gemini-3.1-flash-image"
VARIANTES = int(sys.argv[4]) if len(sys.argv) > 4 else 1
SOLO = set(sys.argv[5].split(",")) if len(sys.argv) > 5 else None

KEY = next(l.split("=", 1)[1].strip() for l in io.open(os.path.join(AQUI, ".env"), encoding="utf-8") if l.startswith("GEMINI_API_KEY"))


def generar(prompt, intentos=3):
    url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s" % (MODELO, KEY)
    cuerpo = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "9:16"}},
    }
    datos = json.dumps(cuerpo).encode("utf-8")
    for intento in range(intentos):
        req = urllib.request.Request(url, data=datos, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                d = json.loads(r.read())
            for parte in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in parte:
                    return base64.b64decode(parte["inlineData"]["data"])
            raise RuntimeError("sin imagen: " + json.dumps(d)[:200])
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:300]
            if e.code in (500, 502, 503) and intento < intentos - 1:
                time.sleep(5 * (intento + 1))
                continue
            raise RuntimeError("HTTP %d: %s" % (e.code, msg))
    raise RuntimeError("sin resultado")


def main():
    cfg = json.load(io.open(os.path.join(AQUI, PLANOS), encoding="utf-8"))
    os.makedirs(SALIDA, exist_ok=True)
    trabajos = [(p, v) for p in cfg["planos"] if not SOLO or p["id"] in SOLO for v in range(VARIANTES)]

    def uno(t):
        p, v = t
        ruta = os.path.join(SALIDA, "%s-%d.png" % (p["id"], v))
        if os.path.exists(ruta):
            return "ya estaba " + ruta
        try:
            img = generar(p["prompt"] + " " + cfg["estilo"])
            open(ruta, "wb").write(img)
            return "ok " + os.path.basename(ruta)
        except Exception as e:
            return "ERROR %s: %s" % (p["id"], e)

    with ThreadPoolExecutor(4) as ex:
        for r in ex.map(uno, trabajos):
            print(r, flush=True)


main()
