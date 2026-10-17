"""Voz de "La caja negra": transcribe las tres tomas con faster-whisper (local), elige la que coincide con el guion,
recorta los huecos a 0,22 s y calcula los momentos del video (en segundos de voz) a partir de las palabras.
Escribe public/voz-caja-negra-rc/voz.mp3, palabras.json y src/caja-negra-rc/momentos.json (lo leen el video y el sonido).
Uso: python armar-voz-caja-negra.py [toma]   (sin toma: elige sola)"""
import json, re, subprocess, sys, unicodedata, difflib, numpy as np
from faster_whisper import WhisperModel
SR = 48000; MAX = 0.22; UMBRAL_DB = -32
CARP = 'public/voz-caja-negra-rc/'
GUION = json.load(open('guion-caja-negra-rc.json', encoding='utf-8'))['segmentos'][0]['texto']
norm = lambda s: re.sub(r'[^a-zñ0-9 ]', '', unicodedata.normalize('NFKD', s.lower().replace('ñ', '~')).encode('ascii', 'ignore').decode().replace('~', 'ñ'))
ESPERADO = norm(GUION).split()
m = WhisperModel('small', device='cpu', compute_type='int8')
def leer(src, sr):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-f', 'f32le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True).stdout, np.float32).copy()
def palabras(src):
    segs, _ = m.transcribe(leer(src, 16000), language='es', word_timestamps=True, initial_prompt='Ring Closers, roleplay, closers.')
    return [[round(w.start, 2), round(w.end, 2), w.word.strip()] for s in segs for w in s.words]
def diferencias(pal):
    oido = [{'12': 'doce'}.get(x, x) for p in pal for x in norm(p[2]).split()]
    sm = difflib.SequenceMatcher(a=ESPERADO, b=oido, autojunk=False)
    return [(op, ' '.join(ESPERADO[a:b]), ' '.join(oido[c:d])) for op, a, b, c, d in sm.get_opcodes() if op != 'equal']

tomas = [sys.argv[1]] if len(sys.argv) > 1 else ['toma-a', 'toma-b', 'toma-c']
res = {}
for t in tomas:
    try:
        d = diferencias(palabras(CARP + t + '.mp3'))
    except Exception as e:
        print(t, 'no se pudo leer', e); continue
    res[t] = d; print(t, 'diferencias:', d if d else 'ninguna')
# las marcas (ring/closer) se perdonan; el resto cuenta
def peso(d): return sum(1 for op, a, b in d if not (set((a + ' ' + b).split()) <= {'ring', 'closers', 'closer', 'rinc', 'rin', 'clousers', 'closer', 'closers.'}))
elegida = min(res, key=lambda t: (peso(res[t]), t)); print('ELEGIDA', elegida)

# recorte de huecos (regla: nada > 0,25 s entre frases)
x = leer(CARP + elegida + '.mp3', SR)
hop = 480; n = len(x) // hop
rms = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) + 1e-9 for i in range(n)]); db = 20 * np.log10(rms / rms.max())
quieto = db < UMBRAL_DB
v = np.where(~quieto)[0]; a0, a1 = v[0] * hop, (v[-1] + 1) * hop
partes = []; i = 0; cursor = a0
while i < n:
    if quieto[i]:
        j = i
        while j < n and quieto[j]: j += 1
        s, e = i * hop, j * hop
        if s > a0 and e < a1 and (e - s) / SR > MAX:
            keep = int(MAX * SR); partes.append(x[cursor:s + keep // 2]); cursor = e - keep // 2
        i = j
    else: i += 1
partes.append(x[cursor:a1])
f = int(0.008 * SR); y = partes[0]
for p in partes[1:]:
    r = np.linspace(1, 0, f); y = np.concatenate([y[:-f], y[-f:] * r + p[:f] * (1 - r), p[f:]])
y = np.concatenate([np.zeros(int(0.03 * SR), np.float32), y.astype(np.float32)])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', CARP + 'voz.mp3'], input=y.tobytes(), check=True)
pal = palabras(CARP + 'voz.mp3')
json.dump(pal, open(CARP + 'palabras.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('duración', round(len(y) / SR, 2), 's; diferencias tras el recorte:', diferencias(pal) or 'ninguna')

def W(palabra, vez=1, fin=False):
    k = 0
    for p in pal:
        if norm(p[2]) in (palabra, {'doce': '12'}.get(palabra)):
            k += 1
            if k == vez: return p[1] if fin else p[0]
    raise SystemExit(f'no encuentro «{palabra}» #{vez}')
M = {
    'tu': W('cuando', 2), 'nada': W('nada', 1), 'dicen': W('dicen'), 'desaparecen': W('desaparecen'),
    'fue': W('fue', 1), 'precio': W('precio'), 'apuraste': W('apuraste'), 'doce1': W('doce', 1),
    'nunca': W('nunca'), 'adivinas': W('adivinas'), 'mal': W('mal'), 'si': W('si'),
    'en': W('en', 2), 'cada': W('cada'), 'grabas': W('grabas'), 'pelea': W('pelea'), 'volves': W('volves'), 'doce2': W('doce', 2), 'ojos': W('ojos'),
    'closer1': W('closer', 1), 'nota': W('nota'), 'cliente': W('cliente'), 'nada2': W('nada', 2), 'closer2': W('closer', 2), 'estuviste': W('estuviste'),
    'practica': W('practica'), 'cerra': W('cerra'), 'clientes': W('clientes', fin=True), 'fin': pal[-1][1],
}
# «Ring Closers.» del cierre: la palabra antes de «practicá»
ip = next(i for i, p in enumerate(pal) if norm(p[2]) == 'practica')
M['logo'] = pal[ip - 2][0] if norm(pal[ip - 1][2]).startswith('clos') else pal[ip - 1][0]
json.dump(M, open('src/caja-negra-rc/momentos.json', 'w'), indent=1)
print(M)
