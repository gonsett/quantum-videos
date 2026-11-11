# Recorta la taza (foto ChatGPT sobre negro) y separa la máscara del oro para el brillo.
# Salida: taza.png (RGBA, recorte), oro.png (máscara blanca del filete dorado), crema.png (máscara de la crema), _control.jpg
import cv2, numpy as np, os
aqui = os.path.dirname(os.path.abspath(__file__))
im = cv2.imread(os.path.join(aqui, "taza-gpt.png"))
H, W = im.shape[:2]
x0, y0, x1, y1 = 185, 337, 1046, 973
# Alfa suave por luminancia (el fondo es negro casi puro) + grabCut para el cuerpo.
gc = np.full((H, W), cv2.GC_BGD, np.uint8)
gc[y0:y1, x0:x1] = cv2.GC_PR_BGD
mx = im.max(2)
gc[(mx > 30) & (gc == cv2.GC_PR_BGD)] = cv2.GC_PR_FGD
gc[cv2.erode((mx > 60).astype(np.uint8), np.ones((7, 7), np.uint8)) > 0] = cv2.GC_FGD
bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
cv2.grabCut(im, gc, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)
fg = ((gc == 1) | (gc == 3)).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(fg)
fg = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
# rellenar huecos interiores (asa)
cnts, hier = cv2.findContours(fg, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
a_body = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 1.1)
a_lum = np.clip((mx.astype(np.float32) - 8) / 30, 0, 1)
alpha = np.maximum(np.minimum(a_body, 1.0), 0) * np.clip(a_lum * 1.6 + cv2.erode(fg, np.ones((5, 5), np.uint8)), 0, 1)
# Negro limpio: restar el negro del fondo para que no quede halo.
rgb = im.astype(np.float32)
rgba = np.dstack([rgb.clip(0, 255).astype(np.uint8), (alpha * 255).clip(0, 255).astype(np.uint8)])[y0:y1, x0:x1]
cv2.imwrite(os.path.join(aqui, "taza.png"), rgba)
# Oro: tono dorado, saturado y claro, fuera de la crema.
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(np.float32)
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
gold = ((h > 6) & (h < 30) & (s > 150) & (v > 70)).astype(np.uint8)
crema = np.zeros((H, W), np.uint8)
cv2.ellipse(crema, (617, 457), (196, 60), 0, 0, 360, 1, -1)
gold[crema > 0] = 0
cv2.ellipse(gold, (790, 815), (70, 28), 0, 0, 360, 0, -1)
gold &= fg
gold = cv2.GaussianBlur(gold.astype(np.float32), (0, 0), .8)
cv2.imwrite(os.path.join(aqui, "oro.png"), np.dstack([np.full((H, W, 3), 255, np.uint8), (gold * 255).clip(0, 255).astype(np.uint8)])[y0:y1, x0:x1])
cr = cv2.GaussianBlur(crema.astype(np.float32), (0, 0), 3)
cv2.imwrite(os.path.join(aqui, "crema.png"), np.dstack([np.full((H, W, 3), 255, np.uint8), (cr * 255).astype(np.uint8)])[y0:y1, x0:x1])
a = alpha[y0:y1, x0:x1, None]
ctrl = (rgb[y0:y1, x0:x1] * a + np.array([60, 110, 150]) * (1 - a))
g = gold[y0:y1, x0:x1, None]
ctrl2 = rgb[y0:y1, x0:x1] * .25 + np.array([255, 255, 255]) * g * .9
cv2.imwrite(os.path.join(aqui, "_control.jpg"), np.vstack([ctrl, ctrl2]).clip(0, 255).astype(np.uint8))
print("ok", rgba.shape)
