# Separa la navaja fotográfica en hoja (con cola) y mango, con alfa, más resplandores horneados.
import numpy as np, cv2
from scipy import ndimage as ndi
src = cv2.imread('tupe-navaja-1.png'); H, W = src.shape[:2]
L = src.max(axis=2)
obj = ndi.binary_opening(L > 6, iterations=1)
lab, n = ndi.label(obj); tam = ndi.sum(obj, lab, range(1, n + 1))
obj = ndi.binary_fill_holes(np.isin(lab, 1 + np.where(tam > 3000)[0]))
hoja = np.zeros_like(obj); mango = np.zeros_like(obj)
def borde(x):  # canto superior del mango donde el cabo lo toca (medido en la foto)
    return 410 - .45 * (x - 1100)
for x in range(W):
    if 900 <= x <= 1165:
        col = obj[:, x]; ys = np.arange(H)
        hoja[col & (ys < borde(x)), x] = True; mango[col & (ys >= borde(x)), x] = True
        continue
    col = obj[:, x]
    if not col.any(): continue
    l, k = ndi.label(col); runs = [np.where(l == i)[0] for i in range(1, k + 1)]
    runs = [r for r in runs if len(r) > 3]
    if not runs: continue
    if len(runs) >= 2:
        hoja[runs[0], x] = True
        for r in runs[1:]: mango[r, x] = True
    elif x > 1292: hoja[runs[0], x] = True
    else: mango[runs[0], x] = True
# Limpieza: la hoja empieza en x 135; se queda con su pieza grande y se cierran costuras de una columna.
hoja[:, :135] = False
hoja = ndi.binary_opening(hoja, structure=np.ones((5, 5)))
lh, nh = ndi.label(hoja); th = ndi.sum(hoja, lh, range(1, nh + 1)); hoja = np.isin(lh, 1 + np.where(th > 1500)[0])
hoja = ndi.binary_closing(hoja, structure=np.ones((1, 9))) & obj
hoja = ndi.binary_fill_holes(hoja)
mango = obj & ~hoja
mango = ndi.binary_opening(mango, structure=np.ones((3, 3)))
lm, nm = ndi.label(mango); tm = ndi.sum(mango, lm, range(1, nm + 1)); mango = lm == (1 + int(np.argmax(tm)))
PIV = (1213, 428)
# Perno: el cabo de la hoja escondido bajo el mango se reconstruye para que no aparezca un hueco al girar.
oculto = np.zeros((H, W), np.uint8); cv2.circle(oculto, PIV, 46, 255, -1)
cv2.fillPoly(oculto, [np.array([(1040, 356), (1262, 416), (1262, 476), (1040, 448)], np.int32)], 255)
oculto = (oculto > 0) & mango
# Se rellena columna por columna copiando el cabo visible, corrido en la dirección del cabo (50 px, 13 px abajo).
imgH = src.copy()
ys, xs = np.where(oculto)
for x in sorted(set(xs.tolist())):
    for y in ys[xs == x]:
        imgH[y, x] = imgH[y - 13, x - 50]
hoja2 = hoja | oculto
print('hoja %', round(hoja.mean() * 100, 2), 'mango %', round(mango.mean() * 100, 2))

def capa(img, m, nombre, esc=2):
    a = cv2.GaussianBlur((m * 255).astype(np.uint8), (0, 0), .7)
    a = np.clip((a.astype(np.float32) - 40) * 1.25, 0, 255).astype(np.uint8)
    big = cv2.resize(img, None, fx=esc, fy=esc, interpolation=cv2.INTER_LANCZOS4)
    bl = cv2.GaussianBlur(big, (0, 0), 1.6)
    big = np.clip(big.astype(np.float32) * 1.45 - bl.astype(np.float32) * .45, 0, 255).astype(np.uint8)
    ab = cv2.resize(a, None, fx=esc, fy=esc, interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(nombre + '.png', np.dstack([big, ab]))
    f = big.astype(np.float32) / 255; Lf = f.max(axis=2)
    g = (f * (np.clip((Lf - .62) / .38, 0, 1)[..., None])) * (ab[..., None] / 255.)
    g = cv2.GaussianBlur(g, (0, 0), 26) * 1.6 + cv2.GaussianBlur(g, (0, 0), 8) * .5
    g = cv2.resize(np.clip(g, 0, 1), None, fx=.5, fy=.5, interpolation=cv2.INTER_AREA)
    cv2.imwrite(nombre + '-luz.jpg', (g * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
    return np.dstack([big, ab])
h = capa(imgH, hoja2, 'hoja'); m = capa(src, mango, 'mango')
# Revisión: sobre gris, abierta (original) y con la hoja girada 25° y 150° hacia el mango (hoja detrás).
def rot(c, ang):
    M = cv2.getRotationMatrix2D((PIV[0] * 2, PIV[1] * 2), ang, 1)
    return cv2.warpAffine(c, M, (c.shape[1], c.shape[0]), flags=cv2.INTER_CUBIC, borderValue=(0, 0, 0, 0))
def sobre(f, c):
    al = c[..., 3:] / 255.; return c[..., :3] * al + f * (1 - al)
filas = []
for ang in (0, -12, -24):
    f = np.full(h.shape[:2] + (3,), 70, np.float32)
    f = sobre(sobre(f, rot(h, ang)), m)
    filas.append(cv2.resize(f.astype(np.uint8), None, fx=.35, fy=.35))
cv2.imwrite('_rev.jpg', np.vstack(filas))
