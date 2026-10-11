# -*- coding: utf-8 -*-
"""Voz contra efectos, palabra por palabra, en la banda 1-4 kHz (la que decide si se entiende).
Uso: medir-enmascarado.py <timeline.json> <voz.wav> <sfx.wav> <cama.wav> <sfxvol> [claves.json]
Imprime, para cada palabra clave, el nivel de la voz y el de los efectos y la cama en su ventana."""
import json, sys, wave
import numpy as np
try:
    from scipy.signal import butter, sosfilt
except ImportError:  # Control de aplicaciones de Windows a veces bloquea las DLL de scipy
    butter = None

tl_arch, voz_w, sfx_w, cama_w, sfxvol = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5])
tl = json.load(open(tl_arch, encoding="utf8"))
FPS = tl["fps"]


def leer(ruta):
    with wave.open(ruta) as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        d = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64) / 32768.0
    d = d.reshape(-1, ch).mean(axis=1) if ch > 1 else d
    return sr, d


def banda(x, sr, lo, hi):
    if butter is None:  # banda por FFT (paredes rectas): mismo criterio 1-4 kHz
        X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / sr)
        X[(fr < lo) | (fr > hi)] = 0
        return np.fft.irfft(X, len(x))
    sos = butter(4, [lo, hi], btype="band", fs=sr, output="sos")
    return sosfilt(sos, x)


sr_v, v = leer(voz_w)
sr_s, s = leer(sfx_w)
sr_c, c = leer(cama_w)
s = s * sfxvol
# la cama y la voz de la mezcla vienen a 48 kHz; el sfx también
vb, sb, cb = banda(v, sr_v, 1000, 4000), banda(s, sr_s, 1000, 4000), banda(c, sr_c, 1000, 4000)


def db(x):
    r = np.sqrt(np.mean(x ** 2)) if len(x) else 0
    return 20 * np.log10(r + 1e-9)


def ventana(x, sr, t0, t1):
    return x[int(max(0, t0) * sr): int(t1 * sr)]


def A(escena, palabra, vez=1):
    import unicodedata, re
    n = lambda q: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", q.lower()).encode("ascii", "ignore").decode())
    e = next(x for x in tl["escenas"] if x["id"] == escena)
    k = 0
    for c_ in e["clips"]:
        for w in c_["palabras"]:
            if n(w["palabra"]) == n(palabra):
                k += 1
                if k == vez:
                    return (e["from"] + w["cuadro"]) / FPS
    raise KeyError(palabra)


CLAVE = [
    ("e1-que-es", "Qué", 1, 0.9), ("e1-que-es", "Ring", 1, 0.5), ("e1-que-es", "Closers", 1, 0.6),
    ("e1-que-es", "ring", 2, 0.5), ("e1-que-es", "entrenan", 1, 0.6),
    ("e2-problema", "Practicar", 1, 0.6), ("e2-problema", "frena", 1, 0.5), ("e2-problema", "nadie", 1, 0.4), ("e2-problema", "sostiene", 1, 0.7),
    ("e3-solucion", "tres", 1, 0.5), ("e3-solucion", "roleplays", 1, 0.6), ("e3-solucion", "uno", 1, 0.3), ("e3-solucion", "uno", 2, 0.3), ("e3-solucion", "uno", 3, 0.3),
    ("e4-juego", "cumplís", 1, 0.5), ("e4-juego", "subís", 1, 0.4), ("e4-juego", "rango", 1, 0.5), ("e4-juego", "perdés", 1, 0.5), ("e4-juego", "puntos", 1, 0.5),
    ("e5-evaluan", "evalúan", 1, 0.6), ("e5-evaluan", "nivel", 1, 0.4), ("e5-evaluan", "real", 1, 0.5),
    ("e6-ven", "arriba", 1, 0.5), ("e6-ven", "directores", 1, 0.6), ("e6-ven", "buscan", 1, 0.5), ("e6-ven", "postularte", 1, 0.6), ("e6-ven", "ofertas", 1, 0.6),
    ("e7-cierre", "armó", 1, 0.4), ("e7-cierre", "Subite", 1, 0.5), ("e7-cierre", "ring", 1, 0.4),
]
if len(sys.argv) > 6:
    CLAVE = [tuple(x) for x in json.load(open(sys.argv[6], encoding="utf8"))]

print("%-13s %-11s %6s | %8s %8s %8s | %s" % ("escena", "palabra", "t(s)", "voz dB", "sfx dB", "cama dB", "diagnóstico (banda 1-4 kHz)"))
malas = 0
for esc, pal, vez, largo in CLAVE:
    t = A(esc, pal, vez)
    dv, ds, dc = db(ventana(vb, sr_v, t, t + largo)), db(ventana(sb, sr_s, t, t + largo)), db(ventana(cb, sr_c, t, t + largo))
    margen = dv - max(ds, dc)
    estado = "ok" if margen >= 6 else ("justo" if margen >= 3 else "TAPADA")
    if estado != "ok":
        malas += 1
    print("%-13s %-11s %6.2f | %8.1f %8.1f %8.1f | voz por encima %+5.1f dB  %s" % (esc, pal, t, dv, ds, dc, margen, estado))
print("\nPalabras con margen < 6 dB:", malas, "de", len(CLAVE))
