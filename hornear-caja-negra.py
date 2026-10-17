"""Hornea en imágenes lo que antes calculaba el navegador en cada cuadro (caja negra):
bloom (desenfoque + contraste), bordes desvanecidos y desaturación del escáner, foco suave y grano.
Mismo aspecto, mucho menos trabajo por cuadro. Escribe en public/caja-negra-rc/."""
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
D = 'public/caja-negra-rc/'
def bloom(im, sat=1.0):
    # equivalente a CSS blur(26px) brightness(0.9) contrast(1.6) saturate(sat), a media resolución
    b = im.resize((im.width // 2, im.height // 2), Image.LANCZOS).filter(ImageFilter.GaussianBlur(13))
    a = np.asarray(b).astype(float) / 255 * 0.9
    a = np.clip((a - 0.5) * 1.6 + 0.5, 0, 1)
    out = Image.fromarray((a * 255).astype(np.uint8))
    return ImageEnhance.Color(out).enhance(sat) if sat != 1 else out
hal = Image.open(D + 'hallazgo.jpg').convert('RGB')
bloom(hal).save(D + 'hallazgo-bloom.jpg', quality=88)
esc = Image.open(D + 'escaner.jpg').convert('RGB')
esc = ImageEnhance.Color(esc).enhance(0.72)
W, H = esc.size
def rampa(n, a, b):  # 0 en los bordes, 1 entre a y b (fracciones), lineal como el linear-gradient
    u = np.linspace(0, 1, n)
    return np.clip(np.minimum(u / a, (1 - u) / (1 - b)), 0, 1)
m = rampa(H, 0.12, 0.86)[:, None] * rampa(W, 0.16, 0.84)[None, :]
e = (np.asarray(esc).astype(float) * m[..., None]).astype(np.uint8)
esc = Image.fromarray(e)
esc.save(D + 'escaner-v2.jpg', quality=92)
esc.filter(ImageFilter.GaussianBlur(1.4)).save(D + 'escaner-v2-foco.jpg', quality=92)
bloom(esc).save(D + 'escaner-v2-bloom.jpg', quality=88)
rng = np.random.default_rng(3)
for k in range(8):
    n = rng.random((1920, 1080))
    a = np.zeros((1920, 1080, 4), np.uint8); a[..., :3] = 255; a[..., 3] = (n * 0.06 * 255 * 1.6).clip(0, 255).astype(np.uint8)
    Image.fromarray(a, 'RGBA').save(D + f'grano-{k}.png', optimize=True)
print('ok')
