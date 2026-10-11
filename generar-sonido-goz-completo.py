# Sonido del video completo Gozmotion de Ring Setters (60 fps). Tiempos = Completo.tsx (timeline x2 + LEAD 16, S3 = 516).
import json, subprocess, numpy as np
from scipy.io import wavfile
SR = 48000; FPS = 60; LEAD = 16; S3 = 516
d = json.load(open('timeline-setters-rc.json', encoding='utf8'))
esc = [e for e in d['escenas'][2:]]
s = S3; S = []
for e in esc: S.append(s); s += 2 * e['durationInFrames'] + LEAD
TOT = s / FPS
N = int(TOT * SR) + SR
def lee(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def pon(buf, x, t, g=1.0):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), len(buf) - i); buf[i:i + n] += g * x[:n]
voz = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
pon(voz, lee('public/voz-setters-rc/01-anios.mp3'), 24 / FPS)
pon(voz, lee('public/voz-setters-rc/02-cierre.mp3'), 280 / FPS)
import unicodedata, re
def norm(w): return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', w.lower()).encode('ascii', 'ignore').decode())
def W(i, p, vez=1):
    n = 0
    for x in esc[i]['clips'][0]['palabras']:
        if norm(x['palabra']) == norm(p):
            n += 1
            if n == vez: return (S[i] + LEAD + 2 * x['cuadro']) / FPS
    return (S[i] + 60) / FPS
for i, e in enumerate(esc):
    c = e['clips'][0]
    pon(voz, lee('public/voz-setters-rc/%s.mp3' % c['voz']), (S[i] + 2 * c['enEscena'] + LEAD) / FPS)
# muestra aprobada (0 - 8,6 s) tal cual
_, m = wavfile.read('public/setters-goz/sfx-muestra-v2.wav'); m = m.astype(np.float32)
if m.ndim > 1: m = m.mean(1)
m /= 32768 if m.dtype != np.float32 and np.abs(m).max() > 2 else 1
if np.abs(m).max() > 2: m /= 32768
m = m[:int(S3 / FPS * SR)]; f = int(0.25 * SR); m[-f:] *= np.linspace(1, 0, f)
pon(sfx, m, 0)
t = lambda n: np.arange(int(n * SR)) / SR
def golpe(g=1.0):
    tt = t(1.4); fr = 38 + 70 * np.exp(-tt * 9)
    sub = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 3.2)
    cuerpo = np.sin(2 * np.pi * 140 * tt) * np.exp(-tt * 18) * 0.5
    ruido = np.random.default_rng(1).standard_normal(len(tt)) * np.exp(-tt * 40) * 0.25
    return g * np.tanh(1.6 * (sub + cuerpo + ruido)) * 0.8
def tick():
    tt = t(0.05); return np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 140) * 0.12
whoosh = lee('public/setters-goz/whoosh.wav'); shine = lee('public/setters-goz/shine.wav'); swoosh = lee('public/setters-goz/swoosh.wav')
CL = [[('cita',)], [('todas',)], [('agenda', 1, 1)], [('un',)], [('verdad', 1, 1)], [('show',)], [('cada',)], [('confirmada', 1, 1)], [('señal',)],
      [('trofeos',)], [('directores', 1, 1)], [('setters',)], [('ring',), ('suyo', 1, 1)], [('Ya', 1, 1)]]
for i in range(len(esc)):
    a = S[i] / FPS
    pon(sfx, whoosh, a - 0.05, 0.55 if i else 0.75)
    for x in esc[i]['clips'][0]['palabras']: pon(sfx, tick(), (S[i] + LEAD + 2 * x['cuadro']) / FPS - 0.01)
    for k in CL[i]:
        tk = W(i, k[0], k[1] if len(k) > 1 else 1)
        pon(sfx, golpe(0.85), tk - 0.1)
        if len(k) > 2: pon(sfx, shine, tk + 0.18, 0.4)
    if i in (8, 9): pon(sfx, swoosh, W(i, 'insignias' if i == 8 else 'trofeos') - 0.05, 0.5)
pon(sfx, golpe(0.8), W(0, 'Setters') - 0.1); pon(sfx, golpe(1.2), W(13, 'abierto') - 0.1); pon(sfx, golpe(0.9), W(13, 'Ring') - 0.1)
# cama: drone grave + pulso cada 1,07 s desde la escena 3
tt = np.arange(N) / SR; a0 = S3 / FPS
dr = (np.sin(2 * np.pi * 55 * tt) * 0.5 + np.sin(2 * np.pi * 82.4 * tt) * 0.3 + np.sin(2 * np.pi * 110 * tt + np.sin(tt * 0.7)) * 0.15) * 0.09
env = np.clip((tt - a0 + 0.3) / 0.6, 0, 1) * np.clip((TOT - tt) / 1.5, 0, 1)
sfx += (dr * env).astype(np.float32)
pt = t(0.4); pulso = np.sin(2 * np.pi * np.cumsum(60 + 50 * np.exp(-pt * 30)) / SR) * np.exp(-pt * 9) * 0.32
p = a0
while p < TOT - 1.6: pon(sfx, pulso, p); p += 1.07
# agachar agudos de los efectos bajo la voz (-18 dB), graves intactos
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x).astype(np.float32)
bajo = lp(lp(sfx, 900), 900); alto = sfx - bajo
ev = np.abs(voz); ev = lp(lp(ev, 8), 8); act = np.clip(ev / 0.02, 0, 1)
act = np.maximum.accumulate(act[::-1])[::-1] * 0 + act  # sin anticipación
gain = 1 - act * (1 - 10 ** (-18 / 20))
mix = voz + 0.62 * (bajo + alto * gain)
mix = mix[:int(TOT * SR)]
wavfile.write('out/setters-goz/completo-crudo.wav', SR, (mix / max(1.0, np.abs(mix).max()) * 0.95).astype(np.float32))
print('TOT', round(TOT, 2), 'S', S[:3])
