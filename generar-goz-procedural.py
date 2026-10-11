"""Utilería procedural del motor Gozmotion (sin stock de terceros):
revoque.png (pared de revoque claro), rama.png (silueta de rama con flores, alfa, para la sombra que se mece),
nube1/2.png (nubes blancas con alfa para primer plano y transiciones)."""
import numpy as np, math, random
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import zoom, gaussian_filter
rng = np.random.default_rng(3); random.seed(3)
def ruido(h, w, escalas):
    t = np.zeros((h, w))
    for s, a in escalas:
        r = rng.standard_normal((h // s + 2, w // s + 2))
        t += a * zoom(r, s, order=3)[:h, :w]
    return t
# Revoque: base gris cálido, manchas de llana grandes + grano mineral fino.
H, W = 2600, 1700
n = ruido(H, W, [(260, 3.0), (90, 2.0), (24, 1.2)]) + rng.standard_normal((H, W)) * 2.2
base = np.array([233, 231, 227], float)
img = np.clip(base[None, None, :] + n[..., None] * np.array([1, 1, 0.95]), 0, 255).astype(np.uint8)
Image.fromarray(img).save("public/setters-goz/revoque.png")
# Rama: rama principal que entra desde arriba a la derecha, ramitas, hojas (elipses) y flores (5 pétalos).
S = 1600; im = Image.new("L", (S, S), 0); d = ImageDraw.Draw(im)
def rama(x, y, ang, largo, grosor, nivel):
    if nivel == 0 or largo < 30: return
    pasos = 12; px, py = x, y
    for i in range(pasos):
        ang += random.uniform(-0.09, 0.09)
        nx, ny = px + math.cos(ang) * largo / pasos, py + math.sin(ang) * largo / pasos
        g = max(2, int(grosor * (1 - i / pasos * 0.5)))
        d.line([px, py, nx, ny], fill=255, width=g)
        if nivel <= 2 and random.random() < 0.55:   # hoja
            a = ang + random.choice([-1, 1]) * random.uniform(0.6, 1.2); L = random.uniform(40, 75)
            cx, cy = nx + math.cos(a) * L / 2, ny + math.sin(a) * L / 2
            hoja = Image.new("L", (int(L * 2), int(L * 2)), 0); ImageDraw.Draw(hoja).ellipse([L * 0.5, L * 0.82, L * 1.5, L * 1.18], fill=255)
            hoja = hoja.rotate(-math.degrees(a), resample=Image.BICUBIC); im.paste(255, (int(cx - L), int(cy - L)), hoja)
        if nivel <= 2 and random.random() < 0.35:   # flor
            r = random.uniform(9, 15); fx, fy = nx + random.uniform(-25, 25), ny + random.uniform(-25, 25)
            for k in range(5):
                a = k * 2 * math.pi / 5 + random.random()
                d.ellipse([fx + math.cos(a) * r - r, fy + math.sin(a) * r - r, fx + math.cos(a) * r + r, fy + math.sin(a) * r + r], fill=255)
        if random.random() < 0.22 * nivel / 3:
            rama(nx, ny, ang + random.choice([-1, 1]) * random.uniform(0.4, 0.9), largo * 0.55, grosor * 0.6, nivel - 1)
        px, py = nx, ny
rama(S + 40, -40, math.radians(140), 1500, 22, 3)
rama(S + 40, 260, math.radians(165), 900, 14, 3)
al = np.asarray(im.filter(ImageFilter.GaussianBlur(1.2)))
out = np.zeros((S, S, 4), np.uint8); out[..., 3] = al
Image.fromarray(out).save("public/setters-goz/rama.png")
# Nubes: ruido fractal con forma de cúmulo (base plana, cima redondeada), alfa suave.
for i, sem in enumerate([11, 23], 1):
    rng = np.random.default_rng(sem)
    h, w = 900, 1500
    yy, xx = np.mgrid[0:h, 0:w] / np.array([h, w])[:, None, None]
    forma = np.zeros((h, w))
    for _ in range(9):   # bultos
        cx, cy, r = rng.uniform(0.2, 0.8), rng.uniform(0.45, 0.7), rng.uniform(0.12, 0.24)
        forma = np.maximum(forma, 1 - np.hypot((xx - cx) * 1.6, (yy - cy) * 1.9) / r)
    forma *= np.clip((0.82 - yy) / 0.12, 0, 1)
    n = ruido(h, w, [(160, 1.0), (60, 0.6), (20, 0.35), (6, 0.15)])
    dens = np.clip(forma * 1.6 + n * 0.35, 0, 1)
    dens = gaussian_filter(dens, 2)
    luz = np.clip(0.78 + 0.25 * (1 - yy) + n * 0.08, 0, 1)
    rgb = (np.stack([luz, luz, luz * 0.99], -1) * 255).astype(np.uint8)
    Image.fromarray(np.dstack([rgb, (dens ** 1.3 * 255).astype(np.uint8)])).save(f"public/setters-goz/nube{i}.png")
print("ok")
