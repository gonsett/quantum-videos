"""Imágenes de "Señal detectada" v2, lenguaje Gozmotion (FLUX schnell en Cloudflare).
Fotos en blanco y negro sobre fondo blanco puro: se montan con multiply sobre el papel, así no hace falta recortar."""
import io, sys
src = io.open("generar-imagenes.py", encoding="utf-8").read().replace("\nmain()", "")
sys.argv = ["x", "x.json", "x", "1"]
exec(src)
acc, tok = leer_cfg()
BW = ", dramatic black and white studio photograph, high contrast, deep blacks, fine film grain, isolated on a seamless pure white background, soft contact shadow on the floor, editorial magazine photography, Hasselblad, 85mm, ultra detailed, photorealistic, no text, no logo"
P = {
 "closer": "half body portrait of a confident salesman in his thirties in a sharp tailored black suit and white shirt, a heavy championship boxing belt resting on his shoulder, slight smirk, looking at the camera, monochrome except the belt which is vivid amber gold",
 "cierre": "close-up of two hands in suit sleeves shaking firmly over a signed contract on a desk, a fountain pen lying beside, monochrome except the fountain pen which is vivid amber orange",
 "setter": "half body portrait of a focused young woman sales setter wearing a slim headset with microphone, holding a smartphone, determined look slightly off camera, monochrome except the small headset light which glows vivid amber",
}
PAPEL = "empty seamless light warm grey paper wall, soft natural sunlight entering from a window casting long diagonal window frame shadows and blurred palm leaf shadows across the wall, minimalist, calm, high-end editorial set, photorealistic, no objects, no text"
quien = sys.argv[1:] if len(sys.argv) > 1 else None
for k, p in list(P.items()) + [("papel", PAPEL)]:
    for v in (1, 2, 3):
        try:
            open("public/setters-goz/%s-v%d.png" % (k, v), "wb").write(generar(acc, tok, p if k == "papel" else p + BW)); print(k, v, "ok", flush=True)
        except Exception as e: print(k, v, "FALLO", str(e)[:100], flush=True)
