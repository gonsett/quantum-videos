"""Sonido del video completo de "La caja negra": momentos desde src/caja-negra-rc/momentos.json (V0=70). Escribe public/caja-negra-rc/sonido.wav."""
import os, sys, types
import numpy as np
_st = types.ModuleType('scipy.stats'); _st.scoreatpercentile = None; sys.modules.setdefault('scipy.stats', _st)
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
import json
SR = 48000; FPS = 60; V0 = 70
M = json.load(open('src/caja-negra-rc/momentos.json'))
w = lambda k, d=0: (V0 + round(M[k] * FPS) + d) / FPS     # igual que w() del video, en segundos
DUR = (V0 + round(M['fin'] * FPS) + 170) / FPS
PRENDE, ENCUENTRA = 14 / FPS, 36 / FPS
TU, APAGA = w('tu', -4), w('nada', 4)
DESHACE = w('desaparecen'); PREG = w('fue', -14)
NUNCA, ADIVINA, MAL, SI = w('nunca', -4), w('adivinas'), w('mal'), w('si')
ABRE, CADA = w('en', -8), w('cada')
GRABA, BARRE, LLEGA = w('grabas', -10), w('volves'), w('doce2')
NOTA0, NOTA = w('closer1', -10), w('nota')
TESIS, T2 = w('cliente', -10), w('closer2', -8)
LOGO, C1, C2 = w('logo', -10), w('practica'), w('cerra')
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
def pad_(notas, desde, hasta, g, corte=900):
    m = int(SR * (hasta - desde)); tt = np.arange(m) / SR
    p = sum(np.sin(2 * np.pi * nota(v_) * d * tt + rng.uniform(0, 6)) for v_ in notas for d in (0.997, 1.003))
    p = lp(p, corte) * np.minimum(tt / 0.8, 1) * np.clip((len(tt) / SR - tt) / 0.5, 0, 1)
    put(p, desde, g)
# ---- 1. hangar: viento grave que se corta en seco cuando la venta se cae ----
v = lp(rng.standard_normal(n), 320) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t + 1)) + 0.4 * bp(rng.standard_normal(n), 300, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t))
v *= np.minimum(t / 0.6, 1) * np.clip((APAGA + 0.12 - t) / 0.05, 0, 1)
put(v, 0, 0.09)
put(lp(rng.standard_normal(n), 380), 0, 0.01)          # sala: el silencio tiene cuerpo
put(clic(2200, 1.0), PRENDE - 0.01, 0.25, -0.3)
put(golpe(0.5, 44, 0.6), ENCUENTRA - 0.01)
put(lp(metal(118, 2.2), 3500), ENCUENTRA, 0.09)
pad_((40, 47, 55), ENCUENTRA, APAGA + 0.1, 0.018)
# ---- 2. "cuando se te cae una venta": golpe sordo, la luz muere ----
put(golpe(0.6, 42, 0.7), TU - 0.01)
put(lp(metal(104, 2.0), 3000), TU, 0.07)
put(clic(1900, 0.7, False), APAGA - 0.005, 0.18, -0.3)
put(clic(1700, 0.5, False), APAGA + 0.1, 0.12, -0.3)
# ---- 3. "lo veo y te aviso" se deshace en arena ----
put(arena(1.1), DESHACE - 0.05, 0.05, 0.1)
pad_((40, 47), APAGA + 0.2, NUNCA, 0.012, 600)
# ---- 4. preguntas: pings de sonar SIN eco (nadie responde) ----
for i, k in enumerate(('fue', 'apuraste', 'doce1')):
    put(ping(1318.5 - 60 * i, 0.9), w(k, -10), 0.055, (-0.25, 0.25, 0)[i])
# ---- 5. "nunca lo vas a saber": golpe grave; al adivinar, el orden se revuelve ----
put(golpe(0.6, 40, 0.8), NUNCA - 0.01)
put(lp(metal(90, 2.4), 3000), NUNCA, 0.08)
for k in range(9):                                     # piezas de metal que se reacomodan mal
    put(lp(metal(220 + 40 * (k % 4), 0.35), 5000), ADIVINA + 0.25 + k * 0.11, 0.035, 0.4 * (-1) ** k)
put(golpe(0.5, 36, 0.9, 300), SI + 0.05)               # caída hueca en "lo que sí"
# ---- 6. el golpe MÁS grande hasta acá: se abre la caja ----
put(subida(0.45, 300, 3200), ABRE - 0.45, 0.06)
put(golpe(0.95, 36, 1.0, 520), ABRE - 0.008)
put(lp(metal(84, 2.8, 1.0), 4000), ABRE, 0.18)
put(clic(3000, 1.0), ABRE + 0.005, 0.12)
pad_((40, 47, 52, 59), ABRE + 0.1, GRABA, 0.02, 1200)
# ---- 7. láser: zip al grabar, zumbido, el cabezal corre y se clava en el 12 ----
m = int(SR * 0.32); tt = np.arange(m) / SR
zip_ = np.sin(2 * np.pi * np.cumsum(900 + 5200 * (tt / 0.32) ** 0.6) / SR) * np.exp(-tt / 0.09) * np.minimum(tt / 0.004, 1)
for pan in (-0.6, 0.6): put(lp(zip_, 7000), GRABA + 0.01, 0.06, pan)
put(golpe(0.55, 46, 0.5), GRABA - 0.01)
m = int(SR * (NOTA0 - GRABA)); tt = np.arange(m) / SR
zum = (np.sin(2 * np.pi * 110 * tt) + 0.3 * np.sin(2 * np.pi * 220.4 * tt) + 0.08 * np.sin(2 * np.pi * 3520 * tt)) * np.minimum(tt / 0.4, 1) * np.clip((len(tt) / SR - tt) / 0.4, 0, 1)
put(lp(zum, 900), GRABA, 0.02)
put(subida((LLEGA - BARRE) * 0.9, 500, 5000), BARRE + 0.05, 0.035)
put(ping(1318.5, 0.6), BARRE, 0.04)
k = 0
while BARRE + 0.14 + k * 0.075 < LLEGA - 0.04:
    put(tic(3800 + 120 * (k % 3), 1.0), BARRE + 0.14 + k * 0.075 * (1 - 0.3 * k / 16), 0.03, 0.15 * (-1) ** k); k += 1
put(tic(5200, 1.0), LLEGA - 0.07, 0.1)
put(golpe(0.6, 46, 0.5), LLEGA - 0.01)
for i in range(4):                                     # ahora SÍ vuelve el eco
    put(lp(ping(1318.5, 1.6), 2500), LLEGA - 0.06 + i * 0.21, 0.06 * 0.3 ** i, (-0.35, 0.35)[i % 2] * (i > 0))
m = int(SR * 2.4); tt = np.arange(m) / SR
ac = sum(np.sin(2 * np.pi * nota(v_) * d * tt + rng.uniform(0, 6)) for v_ in (52, 59, 64, 66, 71) for d in (0.998, 1.002))
put(lp(ac, 1100) * env(m, 0.08, 1.4), LLEGA + 0.02, 0.014)
# ---- 8. la nota del rival: tarjeta + 4 notas cristalinas que suben ----
put(golpe(0.5, 48, 0.45), NOTA0 - 0.01)
put(clic(2800, 0.8), NOTA0, 0.1, 0.2)
for i, mm in enumerate((76, 79, 83, 88)):
    put(ping(nota(mm), 1.2), NOTA - 12 / FPS + i * 9 / FPS, 0.03, (-0.3, -0.1, 0.1, 0.3)[i])
# ---- 9. tesis: el acorde que resuelve ----
put(golpe(0.55, 42, 0.7), TESIS - 0.01)
pad_((40, 47, 52, 56, 59), TESIS, LOGO + 0.3, 0.016, 1400)
put(golpe(0.5, 44, 0.6), T2 - 0.01)
put(ping(nota(76), 1.6), T2 + 0.02, 0.03)
# ---- 10. cierre: el golpe más grande del video ----
put(subida(0.6, 250, 3500), LOGO - 0.6, 0.07)
put(golpe(1.0, 34, 1.3, 560), LOGO - 0.008)
put(lp(metal(72, 3.4, 1.0), 4000), LOGO, 0.2)
put(clic(3200, 1.0), LOGO + 0.005, 0.12)
m = int(SR * (DUR - LOGO + 0.5)); tt = np.arange(m) / SR
fin = sum(np.sin(2 * np.pi * nota(v_) * d * tt + rng.uniform(0, 6)) for v_ in (40, 52, 59, 64, 68, 71) for d in (0.998, 1.002))
put(lp(fin, 2600) * env(m, 0.15, 2.4), LOGO + 0.02, 0.022)
put(ping(nota(88), 1.4), C2 - 0.08, 0.05, 0.2)      # destello en "Cerrá con clientes"

ir = rng.standard_normal(int(SR * 2.2)) * np.exp(-np.arange(int(SR * 2.2)) / SR / 0.7); ir = lp(ir, 3800) * 0.018
wet = np.stack([fftconvolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 0.6, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.5
os.makedirs('public/caja-negra-rc', exist_ok=True)
wavfile.write('public/caja-negra-rc/sonido.wav', SR, mix.astype(np.float32)); print('ok', round(DUR, 2), 's pico', round(pk, 2))
