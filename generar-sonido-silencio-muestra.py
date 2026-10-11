"""Sonido de la MUESTRA de "Los 7 segundos" (5,5 s): el precio cae, un acorde corto que se corta en seco al apretar
el cronómetro, y desde ahí manda el tic (escape mecánico cada 1/5 s, un toc grave + latido en cada segundo).
A los 2,1 s el closer rompe el silencio: un murmullo apagado; cada descuento cae con un impacto que baja.
En 4,2 la aguja se clava: clic, caída hueca y queda solo el aire de la sala.
Escribe public/silencio-rc/muestra.wav."""
import os, sys, types
import numpy as np
# Smart App Control bloquea una DLL de scipy.stats (que acá no se usa): se reemplaza por un módulo vacío
_st = types.ModuleType('scipy.stats'); _st.scoreatpercentile = None; sys.modules.setdefault('scipy.stats', _st)
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
SR = 48000; FPS = 60; DUR = 330 / FPS
f2s = lambda f: f / FPS
PRECIO, ARRANCA, HABLA, FRENA = f2s(14), f2s(30), f2s(156), f2s(282)
CAE = [f2s(186), f2s(244)]
out = np.zeros((int(SR * (DUR + 1.5)), 2)); rng = np.random.default_rng(7)
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
    n = int(SR * 1.8); t = np.arange(n) / SR; fr = f0 + 70 * np.exp(-t / 0.03)
    sub = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(fr) / SR)) * env(n, 0.002, cola)
    cuerpo = bp(rng.standard_normal(n), 90, 420) * env(n, 0.001, 0.07) * 1.4
    return (sub + cuerpo) * nivel
def aire(largo, c=900):
    n = int(SR * largo); t = np.arange(n) / SR; return lp(rng.standard_normal(n), c) * np.sin(np.pi * t / largo) ** 2
nota = lambda m: 440 * 2 ** ((m - 69) / 12)

def tic(fq=4200, g=1.0):          # escape de relojería: metálico, cortito, con un pequeño rebote
    m = int(SR * 0.04); tt = np.arange(m) / SR
    a = np.sin(2 * np.pi * fq * tt) * np.exp(-tt / 0.0025) + 0.6 * bp(rng.standard_normal(m), 3000, 9000) * np.exp(-tt / 0.0015)
    b = np.zeros(m); k = int(SR * 0.006); b[k:] = a[:m - k] * 0.35
    return (a + b) * g
def toc(g=1.0):                    # el segundo entero: más grave, de madera
    m = int(SR * 0.08); tt = np.arange(m) / SR
    return (np.sin(2 * np.pi * 1350 * tt) * np.exp(-tt / 0.008) + 0.5 * bp(rng.standard_normal(m), 900, 3000) * np.exp(-tt / 0.004)) * g
def latido(g=1.0):                 # lub-dub grave, se siente más de lo que se oye
    def uno(f, d):
        m = int(SR * 0.3); tt = np.arange(m) / SR
        return np.sin(2 * np.pi * (f + 30 * np.exp(-tt / 0.02)) * tt) * env(m, 0.004, d)
    x = np.zeros(int(SR * 0.6)); a = uno(52, 0.08); x[:len(a)] += a; b = uno(44, 0.07) * 0.7; k = int(SR * 0.17); x[k:k + len(b)] += b
    return lp(x, 180) * g
def clic_pulsador(g=1.0):          # el botón de la corona: dos clics metálicos (baja y suelta)
    m = int(SR * 0.12); x = np.zeros(m)
    for k, fq, gg in [(0, 2600, 1.0), (int(SR * 0.055), 3400, 0.6)]:
        n = int(SR * 0.03); tt = np.arange(n) / SR
        x[k:k + n] += (np.sin(2 * np.pi * fq * tt) + 0.8 * bp(rng.standard_normal(n), 1500, 8000)) * np.exp(-tt / 0.004) * gg
    return x * g
def baja(f0=520, f1=110, largo=0.5):  # tono que cae: el precio que se te va
    m = int(SR * largo); tt = np.arange(m) / SR
    fr = f1 + (f0 - f1) * np.exp(-tt / (largo / 3))
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) + 0.3 * np.sin(2 * np.pi * 2 * np.cumsum(fr) / SR)
    return lp(x, 2500) * env(m, 0.004, largo / 2.2)
def murmullo(largo):               # tu voz detrás de la pared: sílabas apagadas, sin palabras
    m = int(SR * largo); tt = np.arange(m) / SR
    x = bp(rng.standard_normal(m), 180, 900) + 0.4 * np.sin(2 * np.pi * (170 + 25 * np.sin(2 * np.pi * 1.7 * tt)) * tt)
    sil = np.clip(np.sin(2 * np.pi * 4.6 * tt) * np.sin(2 * np.pi * 1.1 * tt + 1) + 0.25, 0, 1) ** 1.5
    return lp(x * sil, 700) * np.minimum(tt / 0.08, 1) * np.minimum((largo - tt) / 0.03, 1)

n = len(out); t = np.arange(n) / SR
# ---- antes de apretar: un acorde menor suspendido (Am9) que se corta en seco al arrancar ----
m = int(SR * (ARRANCA + 0.1)); tt = np.arange(m) / SR
acorde = sum(np.sin(2 * np.pi * nota(v) * d * tt + rng.uniform(0, 6)) for v in (45, 57, 60, 64, 71) for d in (0.997, 1.0, 1.004))
acorde = lp(acorde, 1600) * np.minimum(tt / 0.15, 1) * np.clip((ARRANCA + 0.01 - tt) / 0.02, 0, 1)
put(acorde, 0.0, 0.018)
put(aire(0.9, 600), 0.0, 0.35)
put(golpe(0.42, 46, 0.5), PRECIO - 0.005)                  # el precio cae sobre la mesa
sh = samp('shine'); k = min(len(sh), int(SR * 0.5)); put(lp(sh[:k], 4500) * np.linspace(1, 0, k)[:, None], PRECIO + 0.02, 0.05)
# ---- se aprieta: clic y corre el tiempo ----
put(clic_pulsador(), ARRANCA - 0.015, 0.22)
paso = 0
while ARRANCA + paso * 0.2 < FRENA - 0.01:
    ts = ARRANCA + paso * 0.2
    if paso % 5 == 0 and paso > 0:
        put(toc(), ts, 0.16, 0.0)
        put(latido(), ts, 0.55)
    else:
        put(tic(4200 if paso % 2 else 3900), ts, 0.07 + 0.01 * (paso / 21), 0.12 * (-1) ** paso)
    paso += 1
# sala: aire muy bajo debajo de todo, el silencio tiene cuerpo
sala = lp(rng.standard_normal(n), 400) * 0.012
put(sala, 0.0)
# ---- rompés el silencio ----
put(murmullo(FRENA - HABLA), HABLA, 0.06, -0.15)
for c in CAE:
    put(lp(samp('whoosh')[:, 0], 4000), c - 0.32, 0.12)
    put(golpe(0.36, 42, 0.45), c - 0.005)
    put(baja(), c + 0.01, 0.05)
# ---- la aguja se clava ----
put(clic_pulsador(1.2), FRENA - 0.015, 0.26)
put(golpe(0.55, 38, 0.9), FRENA - 0.005)
put(baja(300, 55, 1.2), FRENA + 0.02, 0.06)
put(aire(1.0, 450), FRENA + 0.05, 0.3)

ir = rng.standard_normal(int(SR * 1.6)) * np.exp(-np.arange(int(SR * 1.6)) / SR / 0.5); ir = lp(ir, 3500) * 0.016
wet = np.stack([fftconvolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 0.4, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.6
os.makedirs('public/silencio-rc', exist_ok=True)
wavfile.write('public/silencio-rc/muestra.wav', SR, mix.astype(np.float32)); print('ok', DUR, 's pico', round(pk, 2))
