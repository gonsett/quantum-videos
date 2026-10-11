"""Monedas de oro fotorrealistas para "Lo que dejaste sobre la mesa" (FLUX schnell en Cloudflare, sin crédito de Weave).
Fondo negro puro: en el video se componen con mix-blend-mode lighten / máscara de luminancia sobre la mesa negra."""
import io, os, sys
src = io.open("generar-imagenes.py", encoding="utf-8").read().replace("\nmain()", "")
sys.argv = ["x", "x.json", "x", "1"]
exec(src)
acc, tok = leer_cfg()
BASE = ", studio product photograph, 85mm macro lens, dramatic single softbox rim light from above, deep pure black seamless background, no table, no reflection, isolated, ultra detailed, sharp focus, 8k, photorealistic, real 24k polished gold"
P = {
 "pila": "a single tall neat stack of twelve thick polished solid gold coins with fine reeded milled edges, three-quarter view from slightly above",
 "moneda": "one single thick polished solid gold coin lying flat, three-quarter view from above, plain smooth mirror face with a raised rim and fine reeded milled edge, no design, no text",
 "pilas": "four stacks of polished solid gold coins of different heights side by side, reeded milled edges, three-quarter view from slightly above",
}
for k, p in P.items():
    for v in (1, 2):
        try:
            open("public/comision-rc/%s-v%d.png" % (k, v), "wb").write(generar(acc, tok, p + BASE)); print(k, v, "ok", flush=True)
        except Exception as e: print(k, v, "FALLO", str(e)[:100], flush=True)
