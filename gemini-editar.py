"""Edición de imagen con Gemini a partir de fotos de referencia. Uso: python gemini-editar.py salida.png "prompt" img1 [img2 ...]
La key sale de .env (GEMINI_API_KEY) y no se imprime. Modelos en orden: MODELOS env o los de abajo."""
import sys, os, json, base64, urllib.request, urllib.error, mimetypes
key = [l.split("=", 1)[1].strip() for l in open(".env", encoding="utf8") if l.startswith("GEMINI_API_KEY=")][0]
sal, prompt, imgs = sys.argv[1], sys.argv[2], sys.argv[3:]
modelos = os.environ.get("MODELOS", "gemini-3-pro-image-preview,gemini-3.1-flash-image-preview,gemini-2.5-flash-image").split(",")
partes = [{"inlineData": {"mimeType": mimetypes.guess_type(i)[0] or "image/png", "data": base64.b64encode(open(i, "rb").read()).decode()}} for i in imgs]
partes.append({"text": prompt})
for m in modelos:
    url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s" % (m, key)
    cuerpo = {"contents": [{"parts": partes}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "9:16"}}}
    try:
        r = json.load(urllib.request.urlopen(urllib.request.Request(url, json.dumps(cuerpo).encode(), {"Content-Type": "application/json"}), timeout=240))
        for p in r["candidates"][0]["content"]["parts"]:
            if "inlineData" in p:
                open(sal, "wb").write(base64.b64decode(p["inlineData"]["data"])); print("ok", m, flush=True); sys.exit(0)
        print("sin imagen", m, str(r)[:200], flush=True)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, m, e.read().decode()[:200].replace(key, "***"), flush=True)
    except Exception as e:
        print("ERR", m, str(e)[:150], flush=True)
sys.exit(1)
