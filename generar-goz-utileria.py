"""Utilería propia para el motor Gozmotion (FLUX schnell en Cloudflare): reemplaza los stocks de sus zips
(licencia desconocida). revoque = fondo; rama = silueta que se usa como sombra que se mece; nube = nubes para
primer plano y transiciones; cierre2 = apretón de manos aislado en blanco para recortarlo limpio."""
import io, sys
src = io.open("generar-imagenes.py", encoding="utf-8").read().replace("\nmain()", "")
sys.argv = ["x", "x.json", "x", "1"]
exec(src)
acc, tok = leer_cfg()
P = {
 "revoque": "flat top-down texture of a smooth light warm grey microcement plaster wall, very subtle mottled trowel marks, fine mineral grain, perfectly even soft diffuse lighting, no shadows, seamless, photorealistic macro texture, no objects, no text",
 "rama": "solid pure black silhouette of a flowering cherry blossom branch with many small leaves and flowers entering diagonally from the top right corner, on a pure white background, high contrast cutout, no gradients, no text",
 "nube": "a single big fluffy white cumulus cloud isolated on a pure black background, soft volumetric detail, bright white highlights, photorealistic, centered, no text",
 "cierre2": "close-up of two hands in black suit sleeves and white cuffs shaking firmly, above a signed contract sheet with a fountain pen, dramatic black and white studio photograph, high contrast, isolated on a seamless pure white background, everything monochrome except the fountain pen which is vivid amber orange, editorial, Hasselblad, ultra detailed, photorealistic, no text",
}
for k, p in P.items():
    for v in (1, 2, 3):
        try:
            open("public/setters-goz/%s-v%d.png" % (k, v), "wb").write(generar(acc, tok, p)); print(k, v, "ok", flush=True)
        except Exception as e: print(k, v, "FALLO", str(e)[:100], flush=True)
