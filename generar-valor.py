"""Objetos de la destacada "Lo que vale" (FLUX schnell en Cloudflare). Vitrina de joyería a oscuras, terciopelo verde, luz cenital."""
import io, os, sys
src = io.open("generar-imagenes.py", encoding="utf-8").read().replace("\nmain()", "")
sys.argv = ["x", "x.json", "x", "1"]
exec(src)
acc, tok = leer_cfg()
BASE = ", inside a luxury jewelry boutique display case at night, museum vitrine of thin glass with dark bronze frame, deep emerald green velvet, single narrow spotlight from directly above, everything else falls into pure black shadow, subtle glass reflections, high-end editorial product photograph, Hasselblad, 80mm, shallow depth of field, ultra detailed, photorealistic, no text, no logo"
P = {
 "portada": "an empty closed glass display case, a single tiny emerald gemstone glinting on the velvet",
 "guante": "a single black leather boxing glove with fine stitching resting on a velvet cushion like a precious jewel",
}
only = sys.argv[1:] and None
for k, p in P.items():
    for v in (1, 2, 3):
        try:
            open("public/valor-rc/%s-v%d.png" % (k, v), "wb").write(generar(acc, tok, p + BASE)); print(k, v, "ok", flush=True)
        except Exception as e: print(k, v, "FALLO", str(e)[:100], flush=True)
