# -*- coding: utf-8 -*-
"""
Imágenes fotorrealistas verticales para "Rayos X de ventas" (formato Kayn "Brand X-Ray", 26/09/2026).
Cloudflare Workers AI. Lee planos-rayos.json: {"estilo": "...", "planos": [{"id","prompt"}...]}.
Uso: python generar-imagenes-rayos.py planos-rayos.json <carpeta-salida> [modelo] [variantes] [solo-id,...]
"""
import base64, io, json, os, sys, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
PLANOS = sys.argv[1]
SALIDA = os.path.join(AQUI, sys.argv[2])
MODELO = sys.argv[3] if len(sys.argv) > 3 else "@cf/leonardo/lucid-origin"
VARIANTES = int(sys.argv[4]) if len(sys.argv) > 4 else 1
SOLO = set(sys.argv[5].split(",")) if len(sys.argv) > 5 else None


def leer_cfg():
    cfg = {}
    for linea in io.open(os.path.join(AQUI, ".env"), encoding="utf-8"):
        if "=" in linea:
            k, v = linea.split("=", 1)
            cfg[k.strip()] = v.strip()
    return cfg["CF_ACCOUNT_ID"], cfg["CF_API_TOKEN"]


ACC, TOK = leer_cfg()


def generar(prompt, intentos=4):
    url = "https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s" % (ACC, MODELO)
    cuerpo = {"prompt": prompt, "width": 1088, "height": 1920}
    if "schnell" in MODELO:
        cuerpo = {"prompt": prompt, "steps": 8}
    datos = json.dumps(cuerpo).encode("utf-8")
    for intento in range(intentos):
        req = urllib.request.Request(url, data=datos, headers={"Authorization": "Bearer " + TOK, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                crudo = r.read()
            if crudo[:1] != b"{":
                return crudo
            d = json.loads(crudo)
            if not d.get("success", True):
                raise RuntimeError(str(d.get("errors"))[:200])
            res = d.get("result", d)
            return base64.b64decode(res["image"])
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:300]
            if e.code in (429, 500, 502, 503) and intento < intentos - 1:
                time.sleep(5 * (intento + 1))
                continue
            raise RuntimeError("HTTP %d: %s" % (e.code, msg))
    raise RuntimeError("sin resultado")


def main():
    cfg = json.load(io.open(os.path.join(AQUI, PLANOS), encoding="utf-8"))
    os.makedirs(SALIDA, exist_ok=True)
    trabajos = []
    for p in cfg["planos"]:
        if SOLO and p["id"] not in SOLO:
            continue
        for v in range(VARIANTES):
            trabajos.append((p, v))

    def uno(t):
        p, v = t
        ruta = os.path.join(SALIDA, "%s-%d.jpg" % (p["id"], v))
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
