"""Sonido de "La mala racha": música tenue y elegante que se oscurece en el pozo (acordes menores,
filtro que se cierra con cada día perdido) y se abre al salir (mayor, arpegio Rhodes). Golpes cada vez más
graves en cada caída, campanas al encenderse cada día, cierre y logo. Ducking bajo la voz.
Escribe public/racha-rc/sonido.wav."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
SR = 48000; FPS = 60; DUR = 2400 / FPS
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

# ---------- música ----------
nota = lambda m: 440 * 2 ** ((m - 69) / 12)
BPM = 76; beat = 60 / BPM; comp = 4 * beat
# pozo: Dm(add9) → B♭maj7 → Gm9 → A7sus4 ; salida: Fmaj9 → C(add9) → Dm9 → B♭maj9
POZO = [(38, [50, 53, 57, 64]), (34, [50, 53, 57, 62]), (31, [50, 53, 57, 58, 62]), (33, [52, 55, 57, 62])]
SALIDA = [(41, [53, 57, 60, 64, 67]), (36, [52, 55, 60, 62, 67]), (38, [53, 57, 60, 62, 64]), (34, [50, 53, 57, 62, 65])]
oscura = np.zeros((n, 2)); clara = np.zeros((n, 2))
def suma(buf, x, t0, g, pan=0.0):
    i = int(t0 * SR); m = min(len(x), n - i)
    if m <= 0 or i < 0: return
    buf[i:i + m, 0] += x[:m] * g * (1 - max(pan, 0)); buf[i:i + m, 1] += x[:m] * g * (1 + min(pan, 0))
def pad(fqs, largo):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = sum(np.sin(2 * np.pi * fq * d * tt + rng.uniform(0, 6)) for fq in fqs for d in (0.997, 1.0, 1.004))
    e = np.minimum(tt / 1.2, 1) * np.minimum((largo - tt) / 1.2, 1)
    return lp(x * e, 1500)
def piano(fq, largo=3.0):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = np.sin(2 * np.pi * fq * tt) + 0.3 * np.sin(2 * np.pi * 2 * fq * tt) * np.exp(-tt / 0.4) + 0.1 * np.sin(2 * np.pi * 3 * fq * tt) * np.exp(-tt / 0.2)
    return x * env(m, 0.003, 1.1)
def rhodes(fq, largo=1.6):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = np.sin(2 * np.pi * fq * tt + 0.6 * np.sin(2 * np.pi * fq * 2 * tt) * np.exp(-tt / 0.25))
    return x * env(m, 0.004, 0.6)
def bajo(fq, largo):
    m = int(SR * largo); tt = np.arange(m) / SR
    return lp(np.sin(2 * np.pi * fq * tt) + 0.25 * np.sin(2 * np.pi * 2 * fq * tt), 300) * np.minimum(tt / 0.05, 1) * np.exp(-tt / 2.4)
# el pozo: pad grave y una nota de piano suelta por compás
k = 0; t0 = 0.2
while t0 < SALE + comp:
    raiz, voces = POZO[k % 4]
    suma(oscura, pad([nota(v) for v in voces], comp + 1.2), t0 - 0.3, 0.011)
    suma(oscura, bajo(nota(raiz), comp), t0, 0.06)
    suma(oscura, piano(nota(voces[-1] + 12)), t0 + beat * 1.5, 0.03, 0.3)
    suma(oscura, piano(nota(voces[1] + 12)), t0 + beat * 3, 0.022, -0.3)
    k += 1; t0 += comp
# la salida: arranca justo en "Se sale", arpegio que se abre
k = 0; t0 = SALE - 0.05
while t0 < DUR + 1:
    raiz, voces = SALIDA[k % 4]
    suma(clara, pad([nota(v) for v in voces], comp + 1.2), t0 - 0.3, 0.011)
    suma(clara, bajo(nota(raiz), comp), t0, 0.065)
    arp = [voces[0], voces[2], voces[1], voces[3], voces[2], voces[4], voces[3] + 12, voces[2]]
    for j, v in enumerate(arp):
        suma(clara, rhodes(nota(v + 12)), t0 + j * beat / 2, 0.02 * (1 if j % 2 == 0 else 0.7), 0.35 * (-1) ** j)
    k += 1; t0 += comp
# el pozo se va apagando: cruza a una versión con filtro cerrado a medida que caen los días
oscura_cerrada = lp(oscura, 520)
hundido = np.zeros(n)
for i, c in enumerate(CAE):
    if i >= 3: hundido += np.clip((t - c) / 0.4, 0, 1) * (0.04 + 0.1 * peso(i))
hundido = np.clip(hundido, 0, 0.92)
pozo = oscura * (1 - hundido)[:, None] + oscura_cerrada * hundido[:, None]
sale_mix = np.clip((t - (SALE - 0.6)) / 1.0, 0, 1)
musica = pozo * (1 - sale_mix)[:, None] + 1.7 * clara * np.clip((t - (SALE - 0.1)) / 0.5, 0, 1)[:, None]
# ducking bajo la voz y crece al final con el logo
duck = np.ones(n); duck[int((w(0) + 0.1) * SR):int((w(36.5)) * SR)] = 0.45
duck = lp(duck, 4, 2)
entrada = np.clip(t / 1.4, 0, 1)
final = 1 + 0.55 * np.clip((t - (w(36.5))) / 1.0, 0, 1)
out += musica * (duck * entrada * final)[:, None]

# ---------- efectos ----------
drone = (np.sin(2 * np.pi * 36.7 * t) + 0.5 * np.sin(2 * np.pi * 55 * t + 1)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * t))
put(lp(drone, 140) * 0.05 * duck * (0.6 + 0.6 * hundido) * (1 - sale_mix * 0.7) * np.clip(t / 0.8, 0, 1), 0)
put(aire(1.2, 700), 0.0, 0.4)
# cada día que cae pesa más
for i, c in enumerate(CAE):
    h = peso(i)
    put(golpe(0.16 + 0.34 * h, 56 - 12 * h, 0.25 + 0.45 * h), c - 0.005, 1, 0.25 * ((i % 7) - 3) / 3)
    put(lp(aire(0.25 + 0.2 * h, 1800), 1800), c - 0.25 - 0.15 * h, 0.06 + 0.1 * h)
# el último cae y el mundo se hunde
put(riser(0.5)[::-1] * 0.6, FONDO, 0.12)
# "Se sale": aire que sube
put(riser(0.9), SALE - 0.85, 0.12)
put(campana(698.5), SALE + 0.38, 0.03, -0.2)
# cada día que se enciende: campana de la escala de Fa mayor, subiendo
ESCALA = [65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89, 91, 93, 96]
for i, c in enumerate(LUZ):
    put(campana(nota(ESCALA[i] - 12)), c, 0.028, 0.3 * ((i % 7) - 3) / 3)
    put(pop(600 + 40 * i), c, 0.08, 0.3 * ((i % 7) - 3) / 3)
# día 15 cae suave y se enciende: CIERRE
put(golpe(0.3, 58, 0.3), CAE15)
put(riser(0.45), CIERRE - 0.45, 0.22)
put(golpe(0.5, 46, 0.6), CIERRE - 0.01)
for i, fq in enumerate((523.3, 659.3, 784.0, 1046.5)): put(campana(fq), CIERRE + i * 0.05, 0.035, 0.25 * (i - 1.5))
sh = samp('shine'); m = min(len(sh), int(SR * 1.4)); put(sh[:m] * np.linspace(1, 0, m)[:, None], CIERRE + 0.08, 0.12)
# logo
put(lp(samp('whoosh')[:, 0], 6000), LOGO - 0.3, 0.28)
put(golpe(0.5, 46, 0.8), LOGO + 0.02)
sh2 = samp('shine'); m = min(len(sh2), int(SR * 1.8)); put(sh2[:m] * np.linspace(1, 0, m)[:, None], LOGO + 0.2, 0.14)
put(campana(698.5), w(33.32), 0.03, -0.2); put(campana(1046.5), w(35.18), 0.035, 0.2)

ir = rng.standard_normal(int(SR * 1.8)) * np.exp(-np.arange(int(SR * 1.8)) / SR / 0.6); ir = lp(ir, 3500) * 0.016
wet = np.stack([fftconvolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 1.2, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.6
wavfile.write('public/racha-rc/sonido.wav', SR, mix.astype(np.float32)); print('ok', DUR, 's pico', round(pk, 2))
