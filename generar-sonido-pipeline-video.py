"""Sonido del video Pipeline del director (actualizaciones RC #2): la paleta cálida aprobada en la Oficina
(drone, ticks, pops, campanas, reverb corta) + MÚSICA TENUE de fondo (pad de acordes, arpegio tipo Rhodes y bajo
suave) con ducking bajo la voz. Escribe public/pipeline-rc/sonido.wav."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
SR = 48000; FPS = 60; DUR = 1200 / FPS
f = lambda x: x / FPS
V0 = 30
w = lambda s: f(V0) + s                       # s = segundos dentro de voz.mp3
out = np.zeros((int(SR * (DUR + 1.5)), 2)); rng = np.random.default_rng(23)
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
def barrido(largo, a=600, b=7000):
    """hilo de luz: ruido filtrado que sube como un trazo"""
    n = int(SR * largo); x = rng.standard_normal(n); y = np.zeros(n)
    for i in range(0, n, 1200): u = i / n; c = a * (b / a) ** u; y[i:i + 1200] = bp(x[i:i + 1200], c, c * 1.25)
    return y * np.sin(np.pi * np.arange(n) / n) ** 1.5

n = len(out); t = np.arange(n) / SR
VOZ_A, VOZ_B = w(0.0), w(17.28)

# ---------- música tenue ----------
# 84 bpm, un acorde por compás: Fmaj9 → Am9 → Dm9 → G6/9 (y vuelve). Todo en voces suaves y graves.
BPM = 84; beat = 60 / BPM; comp = 4 * beat
nota = lambda m: 440 * 2 ** ((m - 69) / 12)
ACORDES = [(41, [53, 57, 60, 64, 67]), (45, [57, 60, 64, 67, 71]), (38, [53, 57, 60, 62, 64]), (43, [55, 59, 62, 64, 69])]
musica = np.zeros((n, 2))
def suma(x, t0, g, pan=0.0):
    i = int(t0 * SR); m = min(len(x), n - i)
    if m <= 0: return
    musica[i:i + m, 0] += x[:m] * g * (1 - max(pan, 0)); musica[i:i + m, 1] += x[:m] * g * (1 + min(pan, 0))
def pad(fqs, largo):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = sum(np.sin(2 * np.pi * fq * d * tt + rng.uniform(0, 6)) for fq in fqs for d in (0.997, 1.0, 1.004))
    e = np.minimum(tt / 0.9, 1) * np.minimum((largo - tt) / 0.9, 1)
    return lp(x * e, 1400)
def rhodes(fq, largo=1.4):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = np.sin(2 * np.pi * fq * tt + 0.6 * np.sin(2 * np.pi * fq * 2 * tt) * np.exp(-tt / 0.25))
    return x * env(m, 0.004, 0.55)
def bajo(fq, largo):
    m = int(SR * largo); tt = np.arange(m) / SR
    return lp(np.sin(2 * np.pi * fq * tt) + 0.25 * np.sin(2 * np.pi * 2 * fq * tt), 300) * np.minimum(tt / 0.05, 1) * np.exp(-tt / 2.2)
k = 0; t0 = 0.4
while t0 < DUR + 1:
    raiz, voces = ACORDES[k % 4]
    suma(pad([nota(v) for v in voces], comp + 0.9), t0 - 0.2, 0.010)
    suma(bajo(nota(raiz), comp), t0, 0.07)
    arp = [voces[1], voces[3], voces[2], voces[4], voces[3], voces[2], voces[4] + 12, voces[3]]
    for j, v in enumerate(arp):
        suma(rhodes(nota(v + 12)), t0 + j * beat / 2, 0.022 * (1 if j % 2 == 0 else 0.7), 0.35 * (-1) ** j)
    k += 1; t0 += comp
# entra de a poco, baja bajo la voz (ducking), crece al final con el logo
duck = np.ones(n); a, b = int((VOZ_A + 0.1) * SR), int((VOZ_B - 0.05) * SR); duck[a:b] = 0.42
duck = lp(duck, 4, 2)
entrada = np.clip(t / 1.6, 0, 1)
final = 1 + 0.5 * np.clip((t - f(1080)) / 1.0, 0, 1)
out += musica * (duck * entrada * final)[:, None]

# ---------- cama y efectos ----------
drone = (np.sin(2 * np.pi * 43.65 * t) + 0.5 * np.sin(2 * np.pi * 65.4 * t + 1)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.3 * t))
put(lp(drone * np.clip(t / 0.8, 0, 1), 150) * 0.12 * duck, 0)
put(aire(1.4, 800), 0.0, 0.5)
# 1: la nube; una tarjeta entra en foco en "closers"
put(campana(880), w(0.86), 0.04, -0.15); put(pop(1040), w(0.86), 0.1)
# 2: se dispersan; el hilo de luz en "rastro"
put(lp(samp('whoosh')[:, 0], 5000), w(3.35), 0.3)
put(barrido(1.3), w(4.25), 0.09, 0.2); put(campana(1318.5), w(4.3), 0.035, 0.25)
# 3: se arman las cinco columnas (cuadro 348 + i·9)
for i in range(5):
    put(golpe(0.22, 58 + 4 * i, 0.25), f(348 + i * 9 + 4), 1, 0.25 * (i - 2) / 2)
    put(tick(), f(348 + i * 9 + 6), 0.08, 0.3 * (i - 2) / 2)
put(samp('swoosh'), f(340), 0.3)
# la tarjeta cae en Descubierto ("tarjeta")
put(golpe(0.4, 62, 0.3), w(6.78)); put(pop(820), w(6.78), 0.16)
# 4: los saltos (despega → aterriza sobre el verbo), una nota más alta por etapa
SALTOS = [(8.62, 9.08), (9.34, 9.8), (10.06, 10.52), (12.70, 13.2)]
for i, (a_, b_) in enumerate(SALTOS):
    put(lp(samp('swoosh')[:, 0], 6500), w(a_) - 0.05, 0.22, 0.3 * (-1) ** i)
    put(tick(), w(b_), 0.18); put(pop(700 + 110 * i), w(b_) + 0.01, 0.2, 0.25 * (-1) ** i)
    if i < 3: put(campana([659.3, 784.0, 880.0][i]), w(b_) + 0.02, 0.035, 0.2 * (-1) ** i)
# 5: el cursor llega y ya está al día ("nada")
put(aire(0.8, 2500), w(11.0), 0.12, 0.3)
put(pop(980), w(11.8), 0.18); put(campana(1174.7), w(11.8) + 0.02, 0.035, -0.2)
# 6: firma → sello (cuadro SALTO+6) → "tu equipo"
SELLO = f(V0 + round(13.2 * 60) + 6)
put(riser(0.45), SELLO - 0.45, 0.25)
put(golpe(0.9, 48, 0.6), SELLO - 0.01); put(campana(880), SELLO + 0.02, 0.05)
sh = samp('shine'); m = min(len(sh), int(SR * 1.4)); put(sh[:m] * np.linspace(1, 0, m)[:, None], SELLO + 0.1, 0.13)
for i, fq in enumerate((523.3, 659.3, 784.0)): put(campana(fq), w(14.44) + i * 0.06, 0.03, 0.25 * (i - 1))
# 7: todo el pipeline → logo
LOGO = f(V0 + 900)
put(lp(samp('whoosh')[:, 0], 6000), w(14.95), 0.32)
put(riser(0.8), LOGO - 0.78, 0.3); put(golpe(1.0, 46, 0.8), LOGO - 0.02)
sh2 = samp('shine'); m = min(len(sh2), int(SR * 1.8)); put(sh2[:m] * np.linspace(1, 0, m)[:, None], LOGO + 0.15, 0.18)
put(campana(698.5), LOGO + f(14), 0.05, -0.2); put(campana(1046.5), w(16.4), 0.035, 0.2)
ir = rng.standard_normal(int(SR * 1.4)) * np.exp(-np.arange(int(SR * 1.4)) / SR / 0.45); ir = lp(ir, 3500) * 0.014
wet = np.stack([fftconvolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 1.0, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.6
wavfile.write('public/pipeline-rc/sonido.wav', SR, mix.astype(np.float32)); print('ok', DUR, 's pico', round(pk, 2))
