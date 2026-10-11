"""Sonido de la muestra Gozmotion de Ring Setters: cama sub con golpes graves ~1/s (como sus camas),
impacto + obturador en cada palabra clave, swoosh en el paneo, brillo en el destello, ticks de tipeo agudos y suaves.
Samples: solo los de Pixabay (licencia libre). Escribe public/setters-goz/sfx-muestra.wav."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly
SR = 48000; FPS = 30; DUR = 262 / FPS
V1, V2 = 12 / FPS, 140 / FPS
CLOSERS, CIERRE = (12 + 77 - 2) / FPS, (140 + 63 - 2) / FPS
PAN = 116 / FPS
out = np.zeros((int(SR * (DUR + 1.5)), 2))
rng = np.random.default_rng(7)
def lp(x, f, o=4): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def put(x, t, g=1.0, pan=0.0):
    i = int(t * SR); x = x if x.ndim == 2 else np.stack([x, x], 1)
    x = x * g * np.array([1 - max(pan, 0), 1 + min(pan, 0)])
    n = min(len(x), len(out) - i); out[i:i + n] += x[:n]
def samp(n):
    sr, x = wavfile.read(f'public/setters-goz/{n}.wav'); x = x.astype(float)
    x = x / (32768 if np.abs(x).max() > 2 else 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    if sr != SR: x = resample_poly(x, SR, sr, axis=0)
    return x / np.abs(x).max()
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def golpe(nivel=1.0, f0=52, cola=0.55):
    n = int(SR * 1.6); t = np.arange(n) / SR
    f = f0 + 70 * np.exp(-t / 0.03)
    sub = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(n, 0.002, cola)
    cuerpo = bp(rng.standard_normal(n), 90, 420) * env(n, 0.001, 0.07) * 1.4
    medio = np.sin(2 * np.pi * 180 * t) * env(n, 0.001, 0.09) * 0.35   # que se oiga en el celular
    return (sub + cuerpo + medio) * nivel
def obturador():
    n = int(SR * 0.25); t = np.arange(n) / SR
    a = hp(rng.standard_normal(n), 2500) * env(n, 0.0005, 0.012)
    b = np.zeros(n); k = int(0.07 * SR); b[k:] = hp(rng.standard_normal(n - k), 3000) * env(n - k, 0.0005, 0.018)
    return (a + 0.8 * b) * 0.5
def tick():
    n = int(SR * 0.04); return hp(rng.standard_normal(n), 6000) * env(n, 0.0003, 0.006)
def riser(largo):
    n = int(SR * largo); t = np.arange(n) / SR
    x = rng.standard_normal(n); y = np.zeros(n)
    for i in range(0, n, 2400):  # barrido de pasabanda que sube
        c = 300 + 5000 * (i / n) ** 2; y[i:i + 2400] = bp(x[i:i + 2400], c, c * 1.8)
    return lp(y, 9000) * (t / largo) ** 2.2 * 0.6
# Cama: drone sub en mi (41,2 Hz) + quinta suave, filtrada, con respiración lenta.
n = len(out); t = np.arange(n) / SR
drone = (np.sin(2 * np.pi * 41.2 * t) + 0.5 * np.sin(2 * np.pi * 61.7 * t + 1) + 0.25 * np.sin(2 * np.pi * 82.4 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * t))
drone *= np.clip(t / 1.2, 0, 1) * np.clip((DUR + 0.8 - t) / 1.2, 0, 1)
put(lp(drone, 140) * 0.16, 0)
# Pulso grave cada ~1,07 s (el de sus camas), corrido a los huecos.
for k in np.arange(0.15, DUR, 1.07):
    if abs(k - CLOSERS) > 0.4 and abs(k - CIERRE) > 0.4: put(lp(golpe(0.33, 48, 0.3), 220), k)
# Tipeo: un tick por palabra que aparece.
T1 = [0, .76, 1.7, 1.92, 2.18, 2.36]; T2 = [0, .46, 1, 1.54, 1.8, 1.96]
for i, w in enumerate(T1): put(tick(), V1 + w, 0.09, 0.3 * (-1) ** i)
for i, w in enumerate(T2): put(tick(), V2 + w, 0.09, 0.3 * (-1) ** i)
# "closers": riser corto, impacto, obturador de cámara y brillo en el destello.
put(riser(0.9), CLOSERS - 0.9, 0.5)
put(golpe(0.95), CLOSERS - 0.03)
put(obturador(), CLOSERS + 0.02, 0.55)
put(samp('shine')[: int(SR * 1.6)] * np.linspace(1, 0, int(SR * 1.6))[:, None], CLOSERS + 0.1, 0.22)
# Paneo: swoosh grave de AE + whoosh de aire.
put(samp('swoosh'), PAN - 0.1, 0.8)
put(lp(samp('whoosh')[:, 0], 6000), PAN + 0.05, 0.35)
# "cierre.": riser más largo, el impacto más grande y obturador.
put(riser(1.0), CIERRE - 1.24, 0.4)  # corta antes de "el": silencio y golpe
put(golpe(1.2, 46, 0.8), CIERRE - 0.03)
put(obturador(), CIERRE + 0.1, 0.6)  # después de "el"
put(samp('shine')[: int(SR * 2)] * np.linspace(1, 0, int(SR * 2))[:, None], CIERRE + 0.15, 0.18, 0.2)
# Reverb corta de sala (convolución con ruido decayente) para los golpes.
ir = rng.standard_normal(int(SR * 1.2)) * np.exp(-np.arange(int(SR * 1.2)) / SR / 0.35)
ir = lp(ir, 3500) * 0.012
wet = np.stack([np.convolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = out + wet
mix = mix[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 0.4, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.89
wavfile.write('public/setters-goz/sfx-muestra.wav', SR, mix.astype(np.float32))
print('ok', round(DUR, 2), 's, pico normalizado desde', round(pk, 2))
