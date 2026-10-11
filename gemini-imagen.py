"""Imagen con Gemini (la misma familia que usa Gozmotion). Uso: python gemini-imagen.py salida.png "prompt" [modelo]
La key sale de .env (GEMINI_API_KEY) y no se imprime."""
import sys, json, base64, urllib.request, urllib.error
key = [l.split("=", 1)[1].strip() for l in open(".env", encoding="utf8") if l.startswith("GEMINI_API_KEY=")][0]
sal, prompt = sys.argv[1], sys.argv[2]
modelos = [sys.argv[3]] if len(sys.argv) > 3 else ["gemini-3.1-flash-image-preview", "gemini-3-pro-image-preview", "gemini-2.5-flash-image"]
for m in modelos:
    url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s" % (m, key)
    cuerpo = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1"}}}
    try:
        r = json.load(urllib.request.urlopen(urllib.request.Request(url, json.dumps(cuerpo).encode(), {"Content-Type": "application/json"}), timeout=180))
        for p in r["candidates"][0]["content"]["parts"]:
            if "inlineData" in p:
                open(sal, "wb").write(base64.b64decode(p["inlineData"]["data"])); print("ok", m, flush=True); sys.exit(0)
        print("sin imagen", m, str(r)[:200])
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, m, e.read().decode()[:160].replace(key, "***"), flush=True)
sys.exit(1)
