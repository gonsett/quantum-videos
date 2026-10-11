"""Sonido del video completo "Los 7 segundos" (47,4 s): mismo instrumento que la muestra aprobada (tic de 1/5 s,
toc + latido por segundo) leyendo reloj.json, rebobinado, latido mientras el cliente piensa, campanas de ring y
música tenue que sube en los rounds y abre en 7,0. Escribe public/silencio-rc/sonido.wav."""
import os, sys, types
import numpy as np
# Smart App Control bloquea una DLL de scipy.stats (que acá no se usa): se reemplaza por un módulo vacío
_st = types.ModuleType('scipy.stats'); _st.scoreatpercentile = None; sys.modules.setdefault('scipy.stats', _st)
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve
import json
SR = 48000; FPS = 60; V0 = 30; DUR = 2845 / FPS
w = lambda s: (V0 + round(s * 60)) / FPS   # segundo de voz -> segundo de video
RELOJ = json.load(open('src/silencio-rc/reloj.json', encoding='utf-8'))
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


def campana(fq):
    n = int(SR * 2.5); t = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * fq * m * t) * np.exp(-t / d) for m, a, d in [(1, 1, 0.9), (2.76, 0.4, 0.4), (5.4, 0.2, 0.2)]) * env(n, 0.002, 9)
def pad(fqs, largo, ataque=1.2, cierre=1.2):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = sum(np.sin(2 * np.pi * fq * d * tt + rng.uniform(0, 6)) for fq in fqs for d in (0.997, 1.0, 1.004))
    return lp(x * np.minimum(tt / ataque, 1) * np.clip((largo - tt) / cierre, 0, 1), 1500)
def piano(fq, largo=3.0):
    m = int(SR * largo); tt = np.arange(m) / SR
    x = np.sin(2 * np.pi * fq * tt) + 0.3 * np.sin(2 * np.pi * 2 * fq * tt) * np.exp(-tt / 0.4) + 0.1 * np.sin(2 * np.pi * 3 * fq * tt) * np.exp(-tt / 0.2)
    return x * env(m, 0.003, 1.1)
def reversa(largo):                # cinta para atrás: tics que se aceleran y un barrido que sube
    m = int(SR * largo); tt = np.arange(m) / SR
    x = np.zeros(m); k = 0.0; dt = 0.11
    while k < largo - 0.03:
        a = tic(3600 + 900 * k / largo, 0.6); i = int(k * SR); x[i:i + len(a)] += a[:m - i]
        k += dt; dt = max(0.035, dt * 0.88)
    fr = 200 + 1800 * (tt / largo) ** 2
    bar = bp(rng.standard_normal(m), 400, 3000) * 0.5 + 0.3 * np.sin(2 * np.pi * np.cumsum(fr) / SR)
    return x + lp(bar, 5000) * (tt / largo) ** 1.5 * np.clip((largo - tt) / 0.05, 0, 1)

n = len(out); t = np.arange(n) / SR
PRECIO, FRENA, FIN, LOGO = w(0.55), w(11.6), w(40.32), w(41.1)
CAE = [w(7.36), w(8.94)]
# sala: aire muy bajo debajo de todo, el silencio tiene cuerpo
put(lp(rng.standard_normal(n), 400) * 0.012, 0.0)

# ---- "Decís el precio": acorde suspendido (Am9) que se corta en seco al apretar el cronómetro ----
ARRANCA = w(1.85)
m = int(SR * (ARRANCA + 0.1)); tt = np.arange(m) / SR
acorde = sum(np.sin(2 * np.pi * nota(v) * d * tt + rng.uniform(0, 6)) for v in (45, 57, 60, 64, 71) for d in (0.997, 1.0, 1.004))
acorde = lp(acorde, 1600) * np.minimum(tt / 0.25, 1) * np.clip((ARRANCA + 0.01 - tt) / 0.02, 0, 1)
put(acorde, 0.0, 0.016)
put(golpe(0.42, 46, 0.5), PRECIO - 0.005)
sh = samp('shine'); k = min(len(sh), int(SR * 0.5)); put(lp(sh[:k], 4500) * np.linspace(1, 0, k)[:, None], PRECIO + 0.02, 0.05)

# ---- el reloj: un tic en cada salto de 1/5, toc + latido en cada segundo entero (lee reloj.json) ----
arranques = [w(s0) for s0, r0, s1, r1, p in RELOJ['tramos'] if p and r0 == 0]
for a in arranques: put(clic_pulsador(), a - 0.015, 0.2)
for s0, r0, s1, r1, p in RELOJ['tramos']:
    if not p: continue
    k = int(np.floor(r0 * 5 + 1e-6)) + 1
    rapido = (r1 - r0) / (s1 - s0) > 1.6          # rounds a velocidad: ratchet, sin latido
    while k / 5 <= r1 + 1e-6:
        ts = w(s0 + (k / 5 - r0) / (r1 - r0) * (s1 - s0))
        if k % 5 == 0 and not rapido:
            put(toc(), ts, 0.16); put(latido(), ts, 0.55)
        elif k % 5 == 0:
            put(toc(0.8), ts, 0.12)
        else:
            put(tic(4200 if k % 2 else 3900, 0.8 if rapido else 1.0), ts, 0.07, 0.12 * (-1) ** k)
        k += 1

# ---- rompés el silencio: murmullo y los descuentos ----
put(murmullo(w(11.6) - w(4.6)), w(4.6), 0.045, -0.15)
for c in CAE:
    put(lp(samp('whoosh')[:, 0], 4000), c - 0.32, 0.12)
    put(golpe(0.36, 42, 0.45), c - 0.005)
    put(baja(), c + 0.01, 0.05)
# ---- 4,2: la aguja se clava ----
put(clic_pulsador(1.2), FRENA - 0.015, 0.26)
put(golpe(0.55, 38, 0.9), FRENA - 0.005)
put(baja(300, 55, 1.2), FRENA + 0.02, 0.06)
put(aire(1.4, 450), FRENA + 0.05, 0.3)
# ---- rebobinado: la cinta vuelve ----
put(reversa(w(16.0) - w(14.9)), w(14.9), 0.11)
put(lp(samp('whoosh')[::-1, 0], 3000), w(15.4), 0.1)
put(clic_pulsador(0.8), w(16.0), 0.16)
# ---- del otro lado: solo un latido lento mientras el cliente hace cuentas ----
for k, s in enumerate(np.arange(16.5, 22.9, 1.15)): put(latido(0.75 - 0.03 * k), w(s), 0.5)
put(aire(6.5, 380), w(16.3), 0.25)
# teclas de la cuenta (2.400 ÷ 12) muy bajito
for i in range(24): put(tic(2400 + 300 * (i % 3), 0.5), w(16.7) + i * 50 / 60 / 24, 0.025, 0.2)

# ---- tesis: campanita sobre "siete" ----
put(campana(nota(79)), w(23.62), 0.018, 0.15)
put(golpe(0.25, 44, 0.5), w(28.98))                          # "aguantándolos"

# ---- los rounds: campana de ring + música tenue que sube ----
for i, r in enumerate(RELOJ['rounds']):
    put(campana(nota(76)), w(r) - 0.01, 0.05, -0.15 + 0.15 * i)
    put(campana(nota(76)), w(r) + 0.16, 0.03, 0.15 - 0.15 * i)
    put(golpe(0.22, 48, 0.4), w(r))
M0 = w(32.4); musica = np.zeros((int(SR * (FIN - M0 + 0.05)), 2))
acordes = [(32.4, (45, 52, 60, 64)), (35.58, (41, 48, 57, 64)), (38.1, (43, 50, 59, 62))]   # Am · F · G
for i, (s, vs) in enumerate(acordes):
    fin = acordes[i + 1][0] + 0.6 if i + 1 < len(acordes) else 40.36
    x = pad([nota(v) for v in vs], w(fin) - w(s), 0.8, 0.5)
    j = int((w(s) - M0) * SR); musica[j:j + len(x)] += np.stack([x, x], 1)[: len(musica) - j]
musica *= np.linspace(0.4, 1.0, len(musica))[:, None]
put(musica, M0, 0.012)
for s, v in [(32.62, 69), (33.58, 72), (35.58, 76), (36.76, 74), (38.12, 71)]: put(piano(nota(v), 2.5), w(s), 0.03, 0.1)
# ---- 7,0: campana limpia y el acorde abre (C mayor 9) ----
put(clic_pulsador(1.1), FIN - 0.015, 0.22)
put(golpe(0.45, 40, 0.8), FIN)
put(campana(nota(84)), FIN + 0.01, 0.05)
put(pad([nota(v) for v in (48, 55, 64, 67, 74)], DUR - FIN, 0.05, 2.0), FIN, 0.02)
sh2 = samp('shine'); m2 = min(len(sh2), int(SR * 1.5)); put(sh2[:m2] * np.linspace(1, 0, m2)[:, None], FIN + 0.05, 0.1)
# ---- logo ----
put(lp(samp('whoosh')[:, 0], 6000), LOGO - 0.3, 0.24)
put(golpe(0.45, 46, 0.8), LOGO + 0.02)
for s, v in [(42.0, 72), (43.42, 76), (43.92, 79)]: put(piano(nota(v), 3.0), w(s), 0.03, 0.1)

ir = rng.standard_normal(int(SR * 1.8)) * np.exp(-np.arange(int(SR * 1.8)) / SR / 0.6); ir = lp(ir, 3500) * 0.016
wet = np.stack([fftconvolve(out[:, c], ir)[: len(out)] for c in (0, 1)], 1)
mix = (out + wet)[: int(SR * DUR)] * np.clip((DUR - np.arange(int(SR * DUR)) / SR) / 1.2, 0, 1)[:, None]
# mismo nivel de tic que la muestra aprobada; los picos (7,0, logo) se redondean con un limitador suave
pk = np.abs(mix).max(); mix = mix / pk * 0.6 * 1.9; mix = 0.85 * np.tanh(mix / 0.85)
os.makedirs('public/silencio-rc', exist_ok=True)
wavfile.write('public/silencio-rc/sonido.wav', SR, mix.astype(np.float32)); print('ok', DUR, 's pico', round(pk, 2))
