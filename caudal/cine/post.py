# Terminación de cada cuadro: resplandor de lente, viñeta, grano de película, grado cálido y rótulos nítidos.
# python post.py <carpeta render (c%04d.png 16 bit)> <carpeta salida> <fps de salida>
# El cuadro de salida i corresponde al cuadro de render i * (60 / fps).
import os, sys
import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
import linea as ln

AQUI = os.path.dirname(os.path.abspath(__file__))
ENT, SAL, FPS = sys.argv[1], sys.argv[2], int(sys.argv[3])
os.makedirs(SAL, exist_ok=True)
PASO = ln.FPS // FPS
MARFIL = np.array([.93, .885, .79], np.float32)
ROT = {k: np.asarray(Image.open(os.path.join(AQUI, 'data', k + '.png')).convert('L'), np.float32) / 255 for k, *_ in ln.ROTULOS}

H, W = 1920, 1080
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.hypot((xx - W / 2) / (W * .62), (yy - H * .47) / (H * .6))
VINETA = (1 - .38 * np.clip(r - .45, 0, None) ** 1.6)[..., None].astype(np.float32)


def lin(a):
    a = np.clip(a, 0, None)
    return np.where(a <= .04045, a / 12.92, ((a + .055) / 1.055) ** 2.4)


def srgb(a):
    a = np.clip(a, 0, 1)
    return np.where(a <= .0031308, a * 12.92, 1.055 * a ** (1 / 2.4) - .055)


def terminar(src, n_salida):
    f = n_salida * PASO
    t = f / ln.FPS
    crudo = cv2.imread(src, cv2.IMREAD_UNCHANGED)
    tope = 65535.0 if crudo.dtype == np.uint16 else 255.0
    im = cv2.cvtColor(crudo[..., :3], cv2.COLOR_BGR2RGB).astype(np.float32) / tope
    if im.shape[:2] != (H, W):
        im = cv2.resize(im, (W, H), interpolation=cv2.INTER_LANCZOS4)
    L = lin(im)
    # resplandor: solo lo que pasa de cierto brillo, en dos tamaños, teñido de miel
    luz = np.clip(L - .9, 0, None)
    bloom = np.zeros_like(L)
    for sig, peso in ((5, .10), (24, .07), (80, .05)):
        bloom += peso * np.stack([gaussian_filter(luz[..., c], sig) for c in range(3)], -1)
    L = L + bloom * np.array([1.0, .86, .62], np.float32)
    # grado cálido sutil: sombras un poco más chocolate, luces champán
    lum = (L * np.array([.2126, .7152, .0722], np.float32)).sum(-1, keepdims=True)
    sombra = np.clip(1 - lum * 6, 0, 1)
    L = L * (1 - .06 * sombra) + .06 * sombra * lum * np.array([1.12, .98, .78], np.float32)
    L = L * VINETA
    out = srgb(L)
    # rótulos: marfil, sin desenfoque, siempre legibles
    for k, cx, cy, a, b in ln.ROTULOS:
        al = ln.alfa_rotulo(t, a, b)
        if al <= .003:
            continue
        m = ROT[k]
        h, w = m.shape
        x0, y0 = int(cx - w / 2), int(cy - h / 2)
        reg = out[y0:y0 + h, x0:x0 + w]
        mm = (m * al)[..., None] * .92
        reg[...] = reg * (1 - mm) + MARFIL * mm
    # grano de película, distinto en cada cuadro, más visible en medios tonos
    rng = np.random.default_rng(f)
    g = gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), .7)
    peso = .022 * (1 - np.abs(out.mean(-1, keepdims=True) - .45) * 1.4).clip(.25, 1)
    out = out + g[..., None] * peso
    Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8)).save(os.path.join(SAL, 'p%04d.png' % n_salida), compress_level=1)


if __name__ == '__main__':
    hechos = 0
    for nom in sorted(os.listdir(ENT)):
        if not (nom.startswith('c') and nom.endswith('.png')):
            continue
        f = int(nom[1:5])
        if f % PASO:
            continue
        terminar(os.path.join(ENT, nom), f // PASO)
        hechos += 1
    print('post', hechos, flush=True)
