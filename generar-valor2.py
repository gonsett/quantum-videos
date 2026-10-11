"""Láminas 2-9 de "Lo que vale" (FLUX schnell en Cloudflare). Mismo BASE que generar-valor.py."""
import io, sys
src = io.open("generar-imagenes.py", encoding="utf-8").read().replace("\nmain()", "")
sys.argv = ["x", "x.json", "x", "1"]
exec(src)
acc, tok = leer_cfg()
BASE = ", inside a luxury jewelry boutique display case at night, museum vitrine of thin glass with dark bronze frame, deep emerald green velvet, single narrow spotlight from directly above, everything else falls into pure black shadow, subtle glass reflections, high-end editorial product photograph, Hasselblad, 80mm, shallow depth of field, ultra detailed, photorealistic, no text, no logo, centered composition"
P = {
 "reloj": "an open antique gold pocket watch with visible gears and an intricate dial, chain coiled on the velvet",
 "microfono": "a vintage silver studio ribbon microphone standing upright on a small stand like a precious artifact",
 "sobre": "a single cream paper envelope sealed with a dark emerald green wax seal, lying slightly angled on the velvet",
 "instrumento": "an antique brass precision instrument, a sextant with fine engraved scales and a small magnifier",
 "carnet": "a single black metal membership card with engraved silver edges standing upright on a small velvet stand",
 "llave": "a single ornate antique bronze key lying diagonally on the velvet",
 "libro": "an open thick leather-bound members ledger with handwritten signature rows filling the cream pages, a fountain pen beside it",
 "abierta": "an open glass display case with its glass door swung open, empty velvet pedestal glowing under the spotlight, inviting",
}
for k, p in P.items():
    for v in (1, 2):
        try:
            open("public/valor-rc/%s-v%d.png" % (k, v), "wb").write(generar(acc, tok, p + BASE)); print(k, v, "ok", flush=True)
        except Exception as e: print(k, v, "FALLO", str(e)[:100], flush=True)
