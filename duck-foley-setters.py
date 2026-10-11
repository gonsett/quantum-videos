"""Agacha el foley agudo de "Señal detectada" mientras habla la voz y lo suma a los golpes graves.

Los pings, ticks, monedas y brillos viven en 1-4 kHz, la banda que decide si se entiende la voz,
y tienen colas largas de sala: por eso tapaban palabras. Los golpes graves no se tocan (llevan el drama).

Uso: python duck-foley-setters.py out/setters/audio-voz.wav
Lee public/audio/sfx-setters-agudo.wav y sfx-setters-grave.wav, escribe public/audio/sfx-setters.wav.
"""
import sys
import numpy as np
from scipy.io import wavfile

PISO = 10 ** (-16 / 20)   # cuánto baja el foley con voz encima
ATAQUE, SUELTA, ANTICIPO = 0.015, 0.28, 0.04  # segundos

sr_v, voz = wavfile.read(sys.argv[1])
sr, agudo = wavfile.read("public/audio/sfx-setters-agudo.wav")
_, grave = wavfile.read("public/audio/sfx-setters-grave.wav")
tipo = agudo.dtype
f = lambda x: x.astype(np.float64) / (32768.0 if x.dtype == np.int16 else 1.0)
voz, agudo, grave = f(voz), f(agudo), f(grave)
if voz.ndim > 1:
    voz = voz.mean(axis=1)

# Envolvente de la voz en ventanas de 10 ms; "hay voz" = 40 dB bajo su pico.
paso = int(sr_v * 0.01)
n = len(voz) // paso
rms = np.sqrt((voz[: n * paso].reshape(n, paso) ** 2).mean(axis=1))
hay = rms > rms.max() * 10 ** (-40 / 20)
objetivo = np.where(hay, PISO, 1.0)
# Anticipo: el foley empieza a bajar un poco antes de la palabra.
k = int(ANTICIPO / 0.01)
objetivo = np.minimum(objetivo, np.concatenate([objetivo[k:], np.ones(k)]))
g = np.empty_like(objetivo)
a, r = 1 - np.exp(-0.01 / ATAQUE), 1 - np.exp(-0.01 / SUELTA)
v = 1.0
for i, o in enumerate(objetivo):
    v += (o - v) * (a if o < v else r)
    g[i] = v

t = np.arange(len(agudo)) / sr
ganancia = np.interp(t, np.arange(n) * 0.01, g, right=1.0)
largo = max(len(agudo), len(grave))
salida = np.zeros((largo, 2))
salida[: len(grave)] += grave if grave.ndim > 1 else grave[:, None]
salida[: len(agudo)] += (agudo if agudo.ndim > 1 else agudo[:, None]) * ganancia[:, None]
if tipo == np.int16:
    salida = np.clip(salida * 32768, -32768, 32767).astype(np.int16)
else:
    salida = salida.astype(np.float32)
wavfile.write("public/audio/sfx-setters.wav", sr, salida)
print(f"foley agachado: {100 * (g < 0.5).mean():.0f}% del tiempo bajo -6 dB · pico {np.abs(salida).max()}")
