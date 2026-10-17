"""Sonido de la MUESTRA de "La caja negra" (5,5 s): viento grave de hangar; clic de linterna y un golpe metálico
sordo cuando la luz encuentra la caja; arena que se lleva «lo veo y te aviso»; la linterna se apaga y queda nada.
Golpe grande al corte del escáner, el pulso del láser recorre la caja (brillo que sube), el cabezal corre con ticks
finos y se clava en el min 12: tic + ping de sonar afinado CON eco (antes no había respuesta) y un acorde abierto.
Escribe public/caja-negra-rc/muestra.wav."""
import os, sys, types
import numpy as np
_st = types.ModuleType('scipy.stats'); _st.scoreatpercentile = None; sys.modules.setdefault('scipy.stats', _st)
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
SR = 48000; FPS = 60; DUR = 330 / FPS
f2s = lambda f: f / FPS
PRENDE, ENCUENTRA, DESHACE, APAGA, CORTE, BARRE, LLEGA = map(f2s, (14, 36, 136, 166, 184, 206, 262))
out = np.zeros((int(SR * (DUR + 2.5)), 2)); rng = np.random.default_rng(11)
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
nota = lambda m: 440 * 2 ** ((m - 69) / 12)
def golpe(nivel=1.0, f0=50, cola=0.55, cuerpo_hi=420):
    n = int(SR * 2.0); t = np.arange(n) / SR; fr = f0 + 70 * np.exp(-t / 0.03)
    sub = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(fr) / SR)) * env(n, 0.002, cola)
    cuerpo = bp(rng.standard_normal(n), 90, cuerpo_hi) * env(n, 0.001, 0.07) * 1.4
    return (sub + cuerpo) * nivel
def metal(f0=180, largo=1.6, g=1.0):
    """Placa / chasis metálico: parciales inarmónicos que decaen distinto (cuerpo medio audible en celular)."""
    m = int(SR * largo); tt = np.arange(m) / SR; x = np.zeros(m)
    for r, a, d in [(1, 1, 0.5), (2.76, 0.6, 0.32), (5.4, 0.35, 0.18), (8.93, 0.2, 0.1), (13.3, 0.12, 0.06)]:
        x += a * np.sin(2 * np.pi * f0 * r * tt + rng.uniform(0, 6)) * np.exp(-tt / (d * largo / 1.6))
    x += 0.5 * bp(rng.standard_normal(m), 600, 5000) * np.exp(-tt / 0.012)
    return x * g
def clic(fq=2600, g=1.0, doble=True):
    m = int(SR * 0.1); x = np.zeros(m)
    for k, f, gg in [(0, fq, 1.0)] + ([(int(SR * 0.045), fq * 1.3, 0.55)] if doble else []):
        n = int(SR * 0.03); tt = np.arange(n) / SR
        x[k:k + n] += (np.sin(2 * np.pi * f * tt) + 0.8 * bp(rng.standard_normal(n), 1500, 8000)) * np.exp(-tt / 0.004) * gg
    return x * g
def ping(f=1318.5, largo=1.4):     # sonar: seno puro con un poco de 2.º armónico
    m = int(SR * largo); tt = np.arange(m) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.18 * np.sin(4 * np.pi * f * tt)) * env(m, 0.003, largo / 4.5)
def tic(fq=4200, g=1.0):
    m = int(SR * 0.03); tt = np.arange(m) / SR
    return (np.sin(2 * np.pi * fq * tt) * np.exp(-tt / 0.002) + 0.5 * bp(rng.standard_normal(m), 3000, 9000) * np.exp(-tt / 0.0012)) * g
def arena(largo):
    m = int(SR * largo); tt = np.arange(m) / SR
    gr = (rng.random(m) < 0.004) * rng.standard_normal(m)
    x = bp(gr + 0.25 * rng.standard_normal(m), 2500, 9000)
    return x * np.sin(np.pi * tt / largo) ** 1.5
def subida(largo, f0=300, f1=2400):
    m = int(SR * largo); tt = np.arange(m) / SR; u = tt / largo
    x = rng.standard_normal(m); out_ = np.zeros(m); blk = 1024
    for i in range(0, m, blk):
        c = f0 * (f1 / f0) ** (i / m); out_[i:i + blk] = bp(x[i:i + blk + 2048], c * 0.7, c * 1.3)[:len(out_[i:i + blk])]
    return out_ * u ** 2

n = len(out); t = np.arange(n) / SR
# ---- viento de hangar: grave, lento, se corta en seco cuando se apaga la linterna ----
v = lp(rng.standard_normal(n), 320) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t + 1)) + 0.4 * bp(rng.standard_normal(n), 300, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t))
v *= np.minimum(t / 0.6, 1) * np.clip((APAGA + 0.12 - t) / 0.05, 0, 1)
put(v, 0, 0.09)
# sala: casi nada, el silencio tiene cuerpo
put(lp(rng.standard_normal(n), 380), 0, 0.01)
# ---- la linterna ----
put(clic(2200, 1.0), PRENDE - 0.01, 0.25, -0.3)
put(golpe(0.45, 44, 0.6), ENCUENTRA - 0.01)
put(lp(metal(118, 2.2), 3500), ENCUENTRA, 0.09)
# un pad grave muy bajo que respira (Mi menor: E2 + B2 + G3)
m = int(SR * (APAGA - ENCUENTRA + 0.15)); tt = np.arange(m) / SR
pad = sum(np.sin(2 * np.pi * nota(v_) * d * tt + rng.uniform(0, 6)) for v_ in (40, 47, 55) for d in (0.997, 1.003))
pad = lp(pad, 900) * np.minimum(tt / 0.8, 1) * np.clip((len(tt) / SR - tt) / 0.06, 0, 1)
put(pad, ENCUENTRA, 0.018)
# ---- la frase se deshace ----
put(arena(1.0), DESHACE - 0.05, 0.05, 0.1)
# ---- se apaga: dos clics flojos y nada ----
put(clic(1900, 0.7, False), APAGA - 0.005, 0.18, -0.3)
put(clic(1700, 0.5, False), APAGA + 0.1, 0.12, -0.3)
# ---- corte al escáner: el golpe grande ----
put(subida(0.22, 400, 3000), CORTE - 0.22, 0.05)
put(golpe(0.85, 38, 0.9, 520), CORTE - 0.008)
put(lp(metal(96, 2.6, 1.0), 4000), CORTE, 0.16)
put(clic(3000, 1.0), CORTE + 0.005, 0.14)
# encendido del láser: un zip fino que se abre del centro hacia afuera (estéreo que se separa)
m = int(SR * 0.32); tt = np.arange(m) / SR
zip_ = np.sin(2 * np.pi * np.cumsum(900 + 5200 * (tt / 0.32) ** 0.6) / SR) * np.exp(-tt / 0.09) * np.minimum(tt / 0.004, 1)
for pan in (-0.6, 0.6): put(lp(zip_, 7000), CORTE + 0.01, 0.05, pan)
# zumbido del láser: tono fino que se queda
m = int(SR * (DUR - CORTE + 1)); tt = np.arange(m) / SR
zum = (np.sin(2 * np.pi * 110 * tt) + 0.3 * np.sin(2 * np.pi * 220.4 * tt) + 0.08 * np.sin(2 * np.pi * 3520 * tt)) * np.minimum(tt / 0.4, 1)
put(lp(zum, 4000), CORTE, 0.022)
# ---- el pulso recorre el láser y el cabezal corre ----
put(subida((LLEGA - BARRE) * 0.9, 500, 5000), BARRE + 0.05, 0.035, 0.0)
put(ping(1318.5, 0.6), BARRE, 0.05)
k = 0
while BARRE + 0.14 + k * 0.075 < LLEGA - 0.04:
    put(tic(3800 + 120 * (k % 3), 1.0), BARRE + 0.14 + k * 0.075 * (1 - 0.3 * k / 16), 0.03, 0.15 * (-1) ** k)
    k += 1
# ---- llega al 12: tic, golpe, ping con eco y un acorde abierto ----
put(tic(5200, 1.0), LLEGA - 0.005, 0.12)
put(golpe(0.55, 46, 0.5), LLEGA - 0.01)
for i in range(4):  # el eco que antes no volvía
    put(ping(1318.5, 1.6), LLEGA + i * 0.21, 0.13 * 0.5 ** i, (-0.35, 0.35)[i % 2] * (i > 0))
m = int(SR * 2.4); tt = np.arange(m) / SR
acorde = sum(np.sin(2 * np.pi * nota(v_) * d * tt + rng.uniform(0, 6)) for v_ in (52, 59, 64, 66, 71) for d in (0.998, 1.002))
put(lp(acorde, 2400) * env(m, 0.08, 1.4), LLEGA + 0.02, 0.02)

ir = rng.standard_normal(int(SR * 2.2)) * np.exp(-np.arange(int(SR * 2.2)) / SR / 0.7); ir = lp(ir, 3800) * 0.018
wet = np.stack([fftconvolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 0.4, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.6
os.makedirs('public/caja-negra-rc', exist_ok=True)
wavfile.write('public/caja-negra-rc/muestra.wav', SR, mix.astype(np.float32)); print('ok', DUR, 's pico', round(pk, 2))
