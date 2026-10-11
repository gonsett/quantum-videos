"""Sonido del video completo Oficina 3D (actualizaciones RC #1): misma paleta cálida que la muestra aprobada,
con ducking bajo la voz. Escribe public/oficina-rc/sfx-video.wav."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
SR = 48000; FPS = 60; DUR = 2160 / FPS
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

VOZ = [30, 236, 650, 1030, 1310, 1712, 1836]; LARGO = [2.84, 6.44, 5.96, 4.24, 6.24, 1.68, 3.4]
w = lambda i, s: f(VOZ[i]) + s
LOGO = 2030
n = len(out); t = np.arange(n) / SR
# ducking: la cama baja 7 dB mientras habla la voz
duck = np.ones(n)
for v, l in zip(VOZ, LARGO):
    a, b = int((f(v) + 0.15) * SR), int((f(v) + l - 0.1) * SR); duck[a:b] = 0.45
duck = lp(duck, 6, 2)
drone = (np.sin(2 * np.pi * 43.65 * t) + 0.5 * np.sin(2 * np.pi * 65.4 * t + 1) + 0.2 * np.sin(2 * np.pi * 87.3 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.3 * t))
drone *= np.clip(t / 0.8, 0, 1); put(lp(drone, 150) * 0.17 * duck, 0)
# pad cálido que entra después de la primera frase y crece al final
padEnv = np.clip((t - 3.2) / 2.0, 0, 1) * (0.5 + 0.5 * np.clip((t - f(1880)) / 1.5, 0, 1))
pad = sum(np.sin(2 * np.pi * fq * t + i) for i, fq in enumerate((174.6, 261.6, 349.2, 440.0))) * padEnv * 0.012 * duck
put(lp(pad, 1800), 0)
put(aire(1.3, 800), 0.0, 0.55)
# 1: frase + golpe en "en vivo."
for i, s in enumerate([0.29, 0.45, 1.45]): put(tick(), w(0, s), 0.12, 0.3 * (-1) ** i)
put(riser(0.8), w(0, 1.85) - 0.8, 0.35); put(golpe(0.9), w(0, 1.85) - 0.02); put(campana(880), w(0, 1.85), 0.05)
put(samp('swoosh'), f(205), 0.4)
# 2: equipo, estados
for i, s in enumerate([0.9, 1.28, 2.05]): put(tick(), w(1, s), 0.09, 0.3 * (-1) ** i)
for i, s in enumerate([3.65, 4.7, 5.75]): put(pop(700 + 120 * i), w(1, s), 0.22, 0.35 * (-1) ** i)
# 3: toque, ficha, se levanta, números
put(tick(), w(2, 0.6), 0.25); put(pop(1050), w(2, 0.62), 0.18)
put(lp(samp('whoosh')[:, 0], 5000), w(2, 1.5), 0.25)
put(campana(987.8), w(2, 2.15), 0.045, 0.2)
for i, s in enumerate([3.02, 3.85, 5.0]): put(pop(880 + 110 * i), w(2, s), 0.2, 0.3 * (-1) ** i); put(campana(1318.5 + 150 * i), w(2, s), 0.018)
# 4: toque en Llamar, vuelo, llamando, sin zoom / sin links
put(tick(), w(3, 1.5), 0.25); put(pop(1100), w(3, 1.52), 0.2); put(campana(880), w(3, 1.35), 0.045, -0.2)
put(samp('swoosh'), w(3, 1.75), 0.5)
for k in range(3): put(campana(523.3) * 0.5, w(3, 2.0) + k * 1.5, 0.03, 0.15 * (-1) ** k)
for i, s in enumerate([2.18, 3.05]): put(pop(620 + 90 * i), w(3, s), 0.2, 0.3 * (-1) ** i); put(hp(rng.standard_normal(int(SR * 0.12)), 2500) * env(int(SR * 0.12), 0.01, 0.05), w(3, s) + 0.25, 0.05)
# 5: canales
put(samp('swoosh'), f(1300), 0.45)
for i, s in enumerate([2.3, 2.9]): put(pop(760 + 140 * i), w(4, s), 0.2, 0.3 * (-1) ** i)
put(campana(987.8), w(4, 4.35), 0.045, 0.2)
# 6: recreo y gimnasio
put(samp('swoosh'), f(1700), 0.45); put(lp(samp('whoosh')[:, 0], 6000), f(1760), 0.25)
put(pop(980), w(5, 0.96), 0.15)
# 7: todo en un solo lugar → logo
put(lp(samp('whoosh')[:, 0], 6000), f(1835), 0.3)
for i in range(6): put(pop(660 + 70 * i), f(1846 + i * 7), 0.13, 0.4 * ((i % 3) - 1))
put(campana(1046.5), w(6, 1.8), 0.05, -0.15)
put(riser(1.0), f(LOGO) - 0.95, 0.45); put(lp(samp('whoosh')[:, 0], 6000), f(1985), 0.35)
put(golpe(1.15, 46, 0.8), f(LOGO) - 0.02)
sh = samp('shine'); m = min(len(sh), int(SR * 1.8)); put(sh[:m] * np.linspace(1, 0, m)[:, None], f(LOGO) + 0.15, 0.2)
put(campana(698.5), f(LOGO + 14), 0.06, -0.2); put(campana(1046.5), f(LOGO + 26), 0.035, 0.2)
ir = rng.standard_normal(int(SR * 1.2)) * np.exp(-np.arange(int(SR * 1.2)) / SR / 0.4); ir = lp(ir, 3500) * 0.012
wet = np.stack([fftconvolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 0.6, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.6
wavfile.write('public/oficina-rc/sfx-video.wav', SR, mix.astype(np.float32)); print('ok', DUR, 's pico', round(pk, 2))
