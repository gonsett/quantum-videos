# Pasa hoja y mango a webp y hornea el resplandor con alfa = luminancia.
import cv2, numpy as np
for p in ("hoja", "mango"):
    img = cv2.imread(f"{p}.png", cv2.IMREAD_UNCHANGED)
    cv2.imwrite(f"{p}.webp", img, [cv2.IMWRITE_WEBP_QUALITY, 94])
    luz = cv2.imread(f"{p}-luz.jpg").astype(np.float32) / 255
    a = luz.max(axis=2, keepdims=True)
    rgb = luz / np.maximum(a, 1e-3)
    cv2.imwrite(f"{p}-luz.webp", (np.dstack([rgb, a]) * 255).clip(0, 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 90])
