# Recorta el sillón (rembg), limpia el alfa, sube a 2x y hornea máscara de brillo y resplandor.
import numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
src = cv2.imread('../tupe-sillon-v1.png')
rg = np.array(Image.open('../sillon-rembg-v1.png'))[..., 3].astype(np.float32)
m = rg > 128
l, n = ndi.label(m); tam = ndi.sum(m, l, range(1, n + 1)); m = l == (1 + int(np.argmax(tam)))
m = ndi.binary_fill_holes(m)
a = rg * ndi.binary_dilation(m, iterations=3)
a = np.where(m, np.maximum(a, 0), a)
ys, xs = np.where(a > 8); y0, y1, x0, x1 = ys.min() - 24, ys.max() + 24, xs.min() - 24, xs.max() + 24
print('caja', x0, y0, x1, y1)
img = src[y0:y1, x0:x1]; al = a[y0:y1, x0:x1]
E = 2
big = cv2.resize(img, None, fx=E, fy=E, interpolation=cv2.INTER_LANCZOS4)
bl = cv2.GaussianBlur(big, (0, 0), 1.6)
big = np.clip(big.astype(np.float32) * 1.45 - bl.astype(np.float32) * .45, 0, 255).astype(np.uint8)
ab = cv2.resize(al, None, fx=E, fy=E, interpolation=cv2.INTER_CUBIC)
ab = np.clip((ab - 30) * 1.15, 0, 255).astype(np.uint8)
ab = cv2.GaussianBlur(ab, (0, 0), .6)
cv2.imwrite('sillon.png', np.dstack([big, ab]))
Image.fromarray(np.dstack([big[..., ::-1], ab])).save('sillon.webp', quality=94, method=6)
# máscara para el barrido: solo dónde hay metal o cuero brillante
f = big.astype(np.float32) / 255; L = f.max(axis=2)
brillo = np.clip((L - .28) / .5, 0, 1) * (ab / 255.)
mk = (np.clip(brillo, 0, 1) * 255).astype(np.uint8)
Image.fromarray(np.dstack([np.full_like(mk, 255)] * 3 + [mk])).save('sillon-mascara.webp', quality=90, method=6)
# silueta completa para oscurecer
Image.fromarray(np.dstack([np.zeros_like(ab)] * 3 + [ab])).save('sillon-silueta.webp', quality=90, method=6)
# resplandor horneado de las luces altas
g = f * (np.clip((L - .6) / .4, 0, 1)[..., None]) * (ab[..., None] / 255.)
g = cv2.GaussianBlur(g, (0, 0), 30) * 1.7 + cv2.GaussianBlur(g, (0, 0), 9) * .6
g = cv2.resize(np.clip(g, 0, 1), None, fx=.5, fy=.5, interpolation=cv2.INTER_AREA)
cv2.imwrite('sillon-luz.jpg', (g * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
print('tam', big.shape)
