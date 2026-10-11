"""Sonido de la muestra Oficina 3D (actualizaciones RC): cama sub oscura, aire al llegar, tick suave por palabra,
impacto en "en vivo.", pops en cada estado, swoosh en el giro, riser + golpe + brillo en el logo.
Samples: solo los de Pixabay de setters-goz. Escribe public/oficina-rc/sfx-muestra.wav."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly
SR = 48000; FPS = 60; DUR = 300 / FPS
W = [22, 34, 64, 82]; ESTADOS = [132, 142, 152, 162]; GIRO = 118; EMPUJE = 200; LOGO = 226
f = lambda x: x / FPS
out = np.zeros((int(SR * (DUR + 1.5)), 2)); rng = np.random.default_rng(11)
def lp(x, c, o=4): return sosfilt(butter(o, c, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, c, o=4): return sosfilt(butter(o, c, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x, axis=0)
def put(x, t, g=1.0, pan=0.0):
    i = int(t * SR); x = x if x.ndim == 2 else np.stack([x, x], 1)
    x = x * g * np.array([1 - max(pan, 0), 1 + min(pan, 0)]); n = min(len(x), len(out) - i); out[i:i + n] += x[:n]
def samp(n):
    sr, x = wavfile.read(f'public/setters-goz/{n}.wav'); x = x.astype(float); x = x / (32768 if np.abs(x).max() > 2 else 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    if sr != SR: x = resample_poly(x, SR, sr, axis=0)
    return x / np.abs(x).max()
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def golpe(nivel=1.0, f0=50, cola=0.55):
    n = int(SR * 1.6); t = np.arange(n) / SR; fr = f0 + 70 * np.exp(-t / 0.03)
    sub = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(fr) / SR)) * env(n, 0.002, cola)
    cuerpo = bp(rng.standard_normal(n), 90, 420) * env(n, 0.001, 0.07) * 1.4
    medio = np.sin(2 * np.pi * 180 * t) * env(n, 0.001, 0.09) * 0.35
    return (sub + cuerpo + medio) * nivel
def tick(): n = int(SR * 0.05); return hp(rng.standard_normal(n), 5000) * env(n, 0.0003, 0.007)
def pop(fq):
    n = int(SR * 0.25); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (fq + 500 * np.exp(-t / 0.01)) * t) * env(n, 0.001, 0.05) * 0.6
def campana(fq):
    n = int(SR * 2.5); t = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * fq * m * t) * np.exp(-t / d) for m, a, d in [(1, 1, 0.9), (2.76, 0.4, 0.4), (5.4, 0.2, 0.2)]) * env(n, 0.002, 9)
def riser(largo):
    n = int(SR * largo); t = np.arange(n) / SR; x = rng.standard_normal(n); y = np.zeros(n)
    for i in range(0, n, 2400): c = 300 + 5000 * (i / n) ** 2; y[i:i + 2400] = bp(x[i:i + 2400], c, c * 1.8)
    return lp(y, 9000) * (t / largo) ** 2.2 * 0.6
def aire(largo, c=900):
    n = int(SR * largo); t = np.arange(n) / SR; return lp(rng.standard_normal(n), c) * np.sin(np.pi * t / largo) ** 2
n = len(out); t = np.arange(n) / SR
drone = (np.sin(2 * np.pi * 43.65 * t) + 0.5 * np.sin(2 * np.pi * 65.4 * t + 1) + 0.2 * np.sin(2 * np.pi * 87.3 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.3 * t))
drone *= np.clip(t / 0.8, 0, 1); put(lp(drone, 150) * 0.17, 0)
pad = sum(np.sin(2 * np.pi * fq * t) for fq in (349.2, 523.3, 659.3)) * np.clip((t - f(LOGO)) / 0.6, 0, 1) * 0.02
put(lp(pad, 2500), 0)
put(aire(1.3, 800), 0.0, 0.55)
for i, w in enumerate(W[:3]): put(tick(), f(w), 0.12, 0.3 * (-1) ** i)
put(riser(0.8), f(W[3]) - 0.8, 0.35); put(golpe(0.9), f(W[3]) - 0.02); put(campana(880), f(W[3]), 0.05)
put(samp('swoosh'), f(GIRO) + 0.1, 0.55)
for i, e in enumerate(ESTADOS): put(pop(700 + 120 * i), f(e), 0.22, 0.35 * (-1) ** i)
put(lp(golpe(0.4, 54, 0.3), 220), f(196))
put(riser(0.9), f(LOGO) - 0.85, 0.45); put(lp(samp('whoosh')[:, 0], 6000), f(EMPUJE) + 0.1, 0.35)
put(golpe(1.15, 46, 0.8), f(LOGO) - 0.02)
sh = samp('shine'); m = min(len(sh), int(SR * 1.8)); put(sh[:m] * np.linspace(1, 0, m)[:, None], f(LOGO) + 0.15, 0.2)
put(campana(698.5), f(LOGO + 14), 0.06, -0.2)
ir = rng.standard_normal(int(SR * 1.2)) * np.exp(-np.arange(int(SR * 1.2)) / SR / 0.4); ir = lp(ir, 3500) * 0.012
wet = np.stack([np.convolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 0.3, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.89
wavfile.write('public/oficina-rc/sfx-muestra.wav', SR, mix.astype(np.float32)); print('ok', DUR, 's pico', round(pk, 2))
