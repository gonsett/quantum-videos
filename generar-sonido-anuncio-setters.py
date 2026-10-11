"""Sonido del anuncio "Llegó Ring Setters" (04/10/2026). Pedido de Javier: "dopamínico, pero sin tantos efectos de
sonido berreta, sino a la vez tranquilo". Entonces: un TEMA musical sintetizado (pad cálido + arpegio de pulsos con
eco + bombo y charles suaves, 94 BPM, La menor → Fa → Do → Sol) que arranca íntimo, se corta un compás antes de
"Llegó Ring Setters" y vuelve entero justo en "Ring" (cae en el tiempo 1 del compás 5). Efectos: pocos y suaves
(un soplo por cambio de escena, dos golpes graves cálidos en el logo, un brillo en las estrellas y en el final).
Mezcla: la música y los efectos se agachan en 1-4 kHz bajo la voz; los graves casi no se tocan.
Salidas: out/setters-anuncio/{voz,musica,sfx}.wav y audio-anuncio.m4a; imprime LUFS y el margen de voz por palabra."""
import json, re, subprocess, unicodedata
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
TL = json.load(open('timeline-anuncio-setters.json', encoding='utf8'))
DUR = TL['total'] / 30
N = int(SR * (DUR + 0.5))
rng = np.random.default_rng(11)
def lp(x, f, o=4): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=4): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x, axis=0)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def st(x): return x if x.ndim == 2 else np.stack([x, x], 1)
def put(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR); x = st(x) * g * np.array([1 - max(pan, 0), 1 + min(pan, 0)])
    if i < 0: x, i = x[-i:], 0
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n]
def lee(p):
    if p.endswith('.mp3'):
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
        return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
    sr, x = wavfile.read(p); x = x.astype(float); x = x / (32768 if np.abs(x).max() > 2 else 1)
    x = st(x)
    return resample_poly(x, SR, sr, axis=0) if sr != SR else x
def norm(w): return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', w.lower()).encode('ascii', 'ignore').decode())
E = TL['escenas']
def W(i, p, vez=1):
    n = 0
    for x in E[i]['clips'][0]['palabras']:
        if norm(x['palabra']) == norm(p):
            n += 1
            if n == vez: return (E[i]['from'] + x['cuadro']) / 30
    raise KeyError(p)

# ---------- voz ----------
voz = np.zeros((N, 2))
for e in E:
    c = e['clips'][0]
    put(voz, lee(f"public/voz-anuncio-setters/{c['voz']}.mp3"), (e['from'] + c['enEscena']) / 30)

# ---------- música ----------
RING = W(2, 'Ring')
BEAT = RING / 16                       # "Ring" cae en el tiempo 1 del compás 5
BAR = 4 * BEAT
FIN_RING = W(9, 'Ring')
mus = np.zeros((N, 2))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
ACORDES = [[57, 60, 64, 71], [53, 57, 60, 64], [48, 55, 59, 64], [55, 59, 62, 66]]   # Am(9) Fmaj7 Cmaj7 G(add#11 suave)
BAJOS = [45, 41, 36, 43]
def pad(notas, largo):
    n = int(SR * largo); t = np.arange(n) / SR; x = np.zeros((n, 2))
    for m in notas:
        for d, lado in ((-0.07, 0), (0.07, 1)):
            f = hz(m) * 2 ** (d / 12)
            x[:, lado] += sum(np.sin(2 * np.pi * f * k * t + k) / k ** 1.6 for k in range(1, 6))
    a = np.minimum(t / 0.9, 1) * np.minimum((largo - t) / 0.6, 1).clip(0, 1)
    return lp(x * a[:, None], 1600) * 0.05
def pulso(m, g=1.0):
    n = int(SR * 0.9); t = np.arange(n) / SR; f = hz(m)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)) * env(n, 0.004, 0.22)
    return lp(x, 2200) * 0.09 * g
def bombo(g=1.0):
    n = int(SR * 0.5); t = np.arange(n) / SR; f = 48 + 60 * np.exp(-t / 0.025)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.2) + 0.25 * np.sin(2 * np.pi * 150 * t) * env(n, 0.001, 0.03)) * 0.42 * g
def charles(g=1.0):
    n = int(SR * 0.08); return hp(rng.standard_normal(n), 7000) * env(n, 0.001, 0.018) * 0.05 * g
def bajo(m, largo):
    n = int(SR * largo); t = np.arange(n) / SR
    x = np.tanh(1.5 * np.sin(2 * np.pi * hz(m) * t)) * np.minimum(t / 0.02, 1) * np.minimum((largo - t) / 0.1, 1).clip(0, 1)
    return lp(x, 300) * 0.12
CORTE = (RING - BAR, RING)            # compás de silencio rítmico antes de "Ring"
compases = int(np.ceil(DUR / BAR)) + 1
for b in range(compases):
    t0 = b * BAR
    if t0 > FIN_RING + 0.05: break
    ch = ACORDES[b % 4]
    put(mus, pad(ch, BAR + 0.7), t0)
    en_corte = CORTE[0] - 0.01 <= t0 < CORTE[1] - 0.01
    lleno = t0 >= RING - 0.01
    if b >= 1 and not en_corte: put(mus, bajo(BAJOS[b % 4], BAR * 0.98), t0, 1.0 if lleno else 0.6)
    for s in range(8):                 # arpegio en corcheas, con eco ping-pong
        ts = t0 + s * BEAT / 2
        if en_corte and s >= 2: break
        m = ch[[0, 2, 1, 3, 2, 1, 3, 2][s]] + 12
        g = (0.55 if b == 0 else 0.8) * (1.0 if s % 2 == 0 else 0.7)
        put(mus, pulso(m, g), ts, 1, -0.25 if s % 2 else 0.25)
        put(mus, pulso(m, g * 0.35), ts + BEAT * 0.75, 1, 0.5 if s % 2 else -0.5)
    if lleno or (b >= 2 and not en_corte):
        for q in range(4):
            if q in (0, 2): put(mus, bombo(1.0 if lleno else 0.7), t0 + q * BEAT)
            put(mus, charles(1.0 if lleno else 0.6), t0 + q * BEAT + BEAT / 2, 1, 0.3)
# final: el acorde de La menor queda sonando después de "abierto"
put(mus, pad([45, 57, 64, 71, 76], DUR - FIN_RING + 0.4), FIN_RING, 1.4)
put(mus, pulso(81, 1.2), FIN_RING); put(mus, pulso(88, 0.8), FIN_RING + BEAT)
# subida suave (no riser de efecto): el pad del corte se abre con filtro
n = int(SR * BAR); tt = np.arange(n) / SR
sweep = np.zeros((n, 2)); ruido = rng.standard_normal((n, 2))
for i in range(0, n, 2400):
    c = 400 + 3800 * (i / n) ** 2; sweep[i:i + 2400] = bp(ruido[i:i + 2400], c, c * 1.5)
put(mus, sweep * ((tt / BAR) ** 2 * 0.07)[:, None], CORTE[0])
fade = np.clip((DUR + 0.3 - np.arange(N) / SR) / 1.6, 0, 1); mus *= fade[:, None]

# ---------- efectos: pocos y suaves ----------
sfx = np.zeros((N, 2))
sw = lee('public/setters-goz/swoosh.wav'); sh = lee('public/setters-goz/shine.wav')
sw /= np.abs(sw).max(); sh /= np.abs(sh).max()
for j, e in enumerate(E[1:], 1):
    put(sfx, lp(sw, 5000), e['from'] / 30 - 0.42, 0.16, 0.3 if j % 2 else -0.3)
def calido(g):
    n = int(SR * 1.4); t = np.arange(n) / SR; f = 46 + 40 * np.exp(-t / 0.04)
    return lp(np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(n, 0.003, 0.5) + 0.3 * np.sin(2 * np.pi * 220 * t) * env(n, 0.002, 0.12), 900) * g
put(sfx, calido(0.55), W(2, 'Setters') - 0.04)
put(sfx, calido(0.5), W(9, 'Setters') - 0.04)
put(sfx, sh, W(4, 'verdad') + 0.2, 0.12)
put(sfx, sh, W(9, 'abierto') + 0.45, 0.14)
put(sfx, calido(0.28), W(7, 'setters') - 0.06)   # el sello

# ---------- mezcla: música y efectos se agachan en la banda de la voz ----------
def envolvente(x, ms=60):
    a = np.abs(x).mean(1); k = int(SR * ms / 1000)
    e = np.convolve(a, np.ones(k) / k, 'same'); return np.clip(e / (np.percentile(e[e > 1e-4], 90) + 1e-9), 0, 1)
ev = envolvente(voz)
ev = np.convolve(ev, np.ones(int(SR * 0.12)) / int(SR * 0.12), 'same')   # suave, sin bombeo
def agachar(x, db_medios, db_graves):
    g_m = 10 ** (-db_medios * ev / 20); g_g = 10 ** (-db_graves * ev / 20)
    graves = lp(x, 250); resto = x - graves
    return graves * g_g[:, None] + resto * g_m[:, None]
mus_m = agachar(mus, 15, 4) * 0.55
sfx_m = agachar(sfx, 16, 2)
mezcla = voz + mus_m + sfx_m
os_ = 'out/setters-anuncio'
for nom, x in (('voz', voz), ('musica', mus_m), ('sfx', sfx_m), ('mezcla-cruda', mezcla)):
    wavfile.write(f'{os_}/{nom}.wav', SR, (x / max(1.0, np.abs(mezcla).max()) * 0.9).astype(np.float32))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{os_}/mezcla-cruda.wav', '-af', 'loudnorm=I=-14.5:TP=-1.5:LRA=7', '-ar', '48000',
                '-c:a', 'aac', '-b:a', '256k', f'{os_}/audio-anuncio.m4a'], check=True)
r = subprocess.run(['ffmpeg', '-i', f'{os_}/audio-anuncio.m4a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print('\n'.join(l for l in r.splitlines()[-12:] if 'I:' in l or 'Peak:' in l or 'LRA:' in l))

# margen de voz en 1-4 kHz, por palabra (ventana de 150 ms)
vb, ob = bp(voz, 1000, 4000), bp(mus_m + sfx_m, 1000, 4000)
peor = []
for i, e in enumerate(E):
    for p in e['clips'][0]['palabras']:
        t = (e['from'] + p['cuadro']) / 30; a, b = int(t * SR), int((t + 0.15) * SR)
        m = 10 * np.log10((vb[a:b] ** 2).mean() + 1e-12) - 10 * np.log10((ob[a:b] ** 2).mean() + 1e-12)
        peor.append((m, e['id'], p['palabra']))
peor.sort()
print('peores márgenes (dB):', [(round(m, 1), i, w) for m, i, w in peor[:6]])
print('BEAT', round(BEAT, 4), 'BPM', round(60 / BEAT, 1))
