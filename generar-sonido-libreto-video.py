"""Sonido de "Sonás a guion": metrónomo seco mientras lee el teleprompter (se corta en seco), música menor
apretada que se abre a mayor con arpegio Rhodes al pasar al ring; papeles, lapicera, campanas de round y logo.
Escribe public/libreto-rc/sonido.wav."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
SR = 48000; FPS = 60; DUR = (30 + round(34.11 * 60) + 150) / FPS
V0 = 30
w = lambda s: V0 / FPS + s                    # s = segundos dentro de voz.mp3
out = np.zeros((int(SR * (DUR + 1.5)), 2)); rng = np.random.default_rng(31)
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
CAE = [w(s) for s in [0.0, 0.22, 0.68, 0.98, 3.1, 4.3, 6.42, 7.36, 8.64, 9.98, 10.9, 13.78, 15.64, 18.08]]
peso = lambda i: 0.04 * i if i < 4 else (i - 3) / 10
LUZ = [w(s) for s in [20.14, 21.0, 21.68, 22.54, 23.56, 24.7, 25.64, 26.76, 27.34, 27.62, 28.26, 28.72, 29.28, 29.42]]
SALE, FONDO = w(19.76), w(19.28)
CAE15, CIERRE, LOGO = w(30.52), w(31.52), w(32.3)
# ---- "Sonás a guion": metrónomo seco mientras lee, tensión menor, se abre a mayor al pasar al ring ----
n = len(out); t = np.arange(n) / SR
FIN_LEE, SE_NOTA, PIENSA = w(11.95), w(7.46), w(10.16)
COPIAS, CORTA, LIBRETO, RING = w(14.2), w(18.74), w(20.22), w(20.96)
RONDAS, NUEVA, DECIS, LOGO = [w(s) for s in (22.3, 24.6, 25.32, 26.12)], w(23.68), w(27.56), w(28.92)
nota = lambda m: 440 * 2 ** ((m - 69) / 12)
BPM = 76; beat = 60 / BPM; comp = 4 * beat
# guion: Am(add9) → Fmaj7(#11) → Dm9 → E7sus4 ; ring: Cmaj9 → G(add9) → Am9 → Fmaj9
TENSO = [(45, [57, 60, 64, 71]), (41, [57, 60, 64, 71]), (38, [57, 60, 62, 65]), (40, [56, 59, 62, 64])]
RING_AC = [(36, [55, 59, 62, 64, 67]), (43, [55, 59, 62, 64, 69]), (45, [55, 60, 64, 67, 71]), (41, [57, 60, 64, 67, 69])]
tensa = np.zeros((n, 2)); clara = np.zeros((n, 2))
def suma(buf, x, t0, g, pan=0.0):
    i = int(t0 * SR); m = min(len(x), n - i)
    if m <= 0 or i < 0: return
    buf[i:i + m, 0] += x[:m] * g * (1 - max(pan, 0)); buf[i:i + m, 1] += x[:m] * g * (1 + min(pan, 0))
def pad(fqs, largo):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = sum(np.sin(2 * np.pi * fq * d * tt + rng.uniform(0, 6)) for fq in fqs for d in (0.997, 1.0, 1.004))
    return lp(x * np.minimum(tt / 1.2, 1) * np.minimum((largo - tt) / 1.2, 1), 1500)
def piano(fq, largo=3.0):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = np.sin(2 * np.pi * fq * tt) + 0.3 * np.sin(2 * np.pi * 2 * fq * tt) * np.exp(-tt / 0.4) + 0.1 * np.sin(2 * np.pi * 3 * fq * tt) * np.exp(-tt / 0.2)
    return x * env(m, 0.003, 1.1)
def rhodes(fq, largo=1.6):
    m = int(SR * largo); tt = np.arange(m) / SR
    return np.sin(2 * np.pi * fq * tt + 0.6 * np.sin(2 * np.pi * fq * 2 * tt) * np.exp(-tt / 0.25)) * env(m, 0.004, 0.6)
def bajo(fq, largo):
    m = int(SR * largo); tt = np.arange(m) / SR
    return lp(np.sin(2 * np.pi * fq * tt) + 0.25 * np.sin(2 * np.pi * 2 * fq * tt), 300) * np.minimum(tt / 0.05, 1) * np.exp(-tt / 2.4)
def click(fq=2400, g=1.0):        # metrónomo de madera, seco
    m = int(SR * 0.05); tt = np.arange(m) / SR
    return (np.sin(2 * np.pi * fq * tt) * np.exp(-tt / 0.006) + 0.5 * bp(rng.standard_normal(m), 1500, 5000) * np.exp(-tt / 0.003)) * g
def papel(largo=0.18, c=2500):    # hoja que pasa
    m = int(SR * largo); tt = np.arange(m) / SR
    return bp(rng.standard_normal(m), c, c * 3) * np.sin(np.pi * tt / largo) ** 1.5
def birome(largo):                # lapicera raspando
    m = int(SR * largo); tt = np.arange(m) / SR; x = bp(rng.standard_normal(m), 2500, 7000)
    trazos = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 5.5 * tt + 2 * np.sin(2 * np.pi * 1.3 * tt)))
    return x * trazos * np.minimum(tt / 0.03, 1) * np.minimum((largo - tt) / 0.06, 1)
k = 0; t0 = 0.2
while t0 < RING + comp:
    raiz, voces = TENSO[k % 4]
    suma(tensa, pad([nota(v) for v in voces], comp + 1.2), t0 - 0.3, 0.011)
    suma(tensa, bajo(nota(raiz), comp), t0, 0.055)
    suma(tensa, piano(nota(voces[-1] + 12)), t0 + beat * 2, 0.022, 0.3)
    k += 1; t0 += comp
k = 0; t0 = RING - 0.05
while t0 < DUR + 1:
    raiz, voces = RING_AC[k % 4]
    suma(clara, pad([nota(v) for v in voces], comp + 1.2), t0 - 0.3, 0.011)
    suma(clara, bajo(nota(raiz), comp), t0, 0.065)
    arp = [voces[0], voces[2], voces[1], voces[3], voces[2], voces[4], voces[3] + 12, voces[2]]
    for j, v in enumerate(arp):
        suma(clara, rhodes(nota(v + 12)), t0 + j * beat / 2, 0.02 * (1 if j % 2 == 0 else 0.7), 0.35 * (-1) ** j)
    k += 1; t0 += comp
# mientras lee, la música está apretada (filtro cerrado); se nota → más cerrada; al cortar, se abre
cerrada = lp(tensa, 650)
apriete = np.clip((t - SE_NOTA) / 0.5, 0, 1) * 0.5 + 0.3
apriete *= 1 - np.clip((t - FIN_LEE) / 1.5, 0, 1) * 0.6
tens = tensa * (1 - apriete)[:, None] + cerrada * apriete[:, None]
abre = np.clip((t - (RING - 0.6)) / 1.0, 0, 1)
musica = tens * (1 - abre)[:, None] + 1.7 * clara * np.clip((t - (RING - 0.1)) / 0.5, 0, 1)[:, None]
duck = np.ones(n); duck[int((w(0) + 0.1) * SR):int(w(33.9) * SR)] = 0.45
duck = lp(duck, 4, 2)
final = 1 + 0.55 * np.clip((t - w(33.9)) / 1.0, 0, 1)
out += musica * (duck * np.clip(t / 1.4, 0, 1) * final)[:, None]

# ---------- efectos ----------
put(aire(1.2, 700), 0.0, 0.4)
drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t + 1)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * t))
put(lp(drone, 160) * 0.04 * duck * (1 - abre * 0.8) * np.clip(t / 0.8, 0, 1), 0)
# metrónomo: cada 0,36 s mientras lee; el primero de cada renglón, más agudo. Se corta en seco.
s = 0.1; i = 0
while w(s) < FIN_LEE:
    put(click(3000 if i % 2 == 0 else 2300, 1.0 if i % 2 == 0 else 0.7), w(s), 0.075, 0.15 * (-1) ** i)
    s += 0.36; i += 1
put(golpe(0.42, 44, 0.7), SE_NOTA - 0.005)                       # "se nota"
put(riser(0.5)[::-1] * 0.5, SE_NOTA, 0.08)
sh = samp('shine'); m = min(len(sh), int(SR * 1.2))               # "esto lo está leyendo."
put(lp(sh[:m], 5000) * np.linspace(1, 0, m)[:, None], PIENSA, 0.07)
for j in range(9): put(click(1800 + 90 * j, 0.5), PIENSA + 0.1 * j + 0.02 * rng.random(), 0.05, 0.4)  # tipeo
put(aire(0.5, 1500), FIN_LEE - 0.1, 0.12)                          # cartas se van
# veinte lecturas: las copias se apilan
for j in range(19): put(papel(0.16 + 0.05 * rng.random(), 2000 + 120 * j), COPIAS + j * 2 / FPS, 0.08 + 0.004 * j, 0.5 * rng.uniform(-1, 1))
# la corta
put(riser(0.4), CORTA - 0.4, 0.12)
put(golpe(0.55, 48, 0.7), CORTA - 0.005)
put(pop(620), CORTA + 0.02, 0.07)
# el libreto vuela
put(lp(samp('whoosh')[:, 0], 5000), LIBRETO - 0.25, 0.26)
for j in range(10): put(papel(0.25, 1800 + 200 * j), LIBRETO + 0.03 * j, 0.06, rng.uniform(-0.7, 0.7))
# ring: se abre
put(riser(0.9), RING - 0.85, 0.1)
put(campana(784.0), RING + 0.3, 0.03, -0.2)
# rounds: campana de boxeo + golpe suave + lapicera que escribe
for j, r in enumerate(RONDAS):
    put(golpe(0.3, 52, 0.35), r - 0.005, 1, 0.2 * (j - 1.5))
    put(campana(nota(76 + [0, 2, 4, 7][j])), r + 0.01, 0.03, 0.25 * (j - 1.5))
    put(papel(0.12, 3000), r + 0.05, 0.06)                        # tachado
    put(birome(0.62 if j < 3 else 0.7), r + 0.18, 0.05, 0.15 * (j - 1.5))
put(pop(700), NUEVA + 0.02, 0.07); put(lp(samp('swoosh')[:, 0], 5000), NUEVA + 0.4, 0.14)
put(birome(0.5), w(24.0) + 0.08, 0.04)
# "lo decís": se aclara
put(riser(0.6), DECIS - 0.55, 0.1)
put(campana(1046.5), DECIS + 0.05, 0.028, 0.2)
# logo
put(lp(samp('whoosh')[:, 0], 6000), LOGO - 0.3, 0.28)
put(golpe(0.5, 46, 0.8), LOGO + 0.02)
sh2 = samp('shine'); m = min(len(sh2), int(SR * 1.8)); put(sh2[:m] * np.linspace(1, 0, m)[:, None], LOGO + 0.2, 0.14)
put(campana(784.0), w(30.22), 0.03, -0.2); put(campana(1046.5), w(31.9), 0.035, 0.2)

ir = rng.standard_normal(int(SR * 1.8)) * np.exp(-np.arange(int(SR * 1.8)) / SR / 0.6); ir = lp(ir, 3500) * 0.016
wet = np.stack([fftconvolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 1.2, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.6
wavfile.write('public/libreto-rc/sonido.wav', SR, mix.astype(np.float32)); print('ok', DUR, 's pico', round(pk, 2))
