"""Mezcla genérica de un largo de Atlas Sur → <carpeta>/assets/mezcla.wav (-14 LUFS).

Uso: python mezcla.py <carpeta-del-video>
Lee <carpeta>/tiempos.json (lo escribe escenas.Video.escribir):
  musica.estilo     "tango" (bandoneón, habanera 3-3-2, La menor, 100 bpm), "caribe" (marimba + cuerdas, güira y tambora, 120 bpm)
                    u "orquesta" (samples reales de VSCO-2 CE: cuerdas, metales, timbales, arpa; 75 bpm)
  musica.clima      {sección: clima}; climas en CLIMA
  musica.silencios  [[t0, t1], …] la música se retira (golpes, frases fuertes)
  musica.ambientes  [[nombre_sfx, t0, t1, g], …] capas largas: viento, olas, multitud, rio, o un archivo real de
                    automatizacion/musica/ambientes/ (nombre con extensión, p. ej. "aulladores.ogg"), en bucle con fundido
Música original sintetizada (sin licencias), SFX de la biblioteca media-use + sintetizados, voz con ducking.
Base: largo-01-bolivia/mezcla.py (los SFX sintetizados son los mismos).
"""
import subprocess, json, sys
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile

AQUI = Path(sys.argv[1]).resolve()
SFX_DIR = Path.home() / ".claude/skills/media-use/audio/assets/sfx"
SR = 44100
D = json.loads((AQUI / "tiempos.json").read_text(encoding="utf-8"))
INI, DUR, TOTAL, SECS = D["ini"], D["dur"], D["total"], D["secciones"]
MUS = D.get("musica", {})
N = int((TOTAL + 0.5) * SR)
rng = np.random.default_rng(11)


def cargar(ruta):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def poner(dst, x, t, g=1.0):
    i = int(t * SR)
    if i < 0:
        x, i = x[-i:], 0
    if i >= len(dst):
        return
    n = min(len(x), len(dst) - i)
    dst[i:i + n] += g * x[:n]


def lp(x, f, o=2):
    return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, f1, f2):
    return signal.sosfilt(signal.butter(2, [f1, f2], "band", fs=SR, output="sos"), x)


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


def reverb(x, seg=3.2, mezcla=0.35):
    n = int(seg * SR)
    ir = lp(rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n)), 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    return (1 - mezcla) * x + mezcla * signal.fftconvolve(x, ir)[: len(x)]


def tt_(seg):
    return np.arange(int(seg * SR)) / SR


def env_ad(t, a, dec):
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t * dec)


# ---------- Tango en La menor ----------
ACORDES = {"Am": [57, 60, 64], "Dm": [57, 62, 65], "E7": [56, 59, 62, 64], "F": [57, 60, 65], "G7": [55, 59, 62, 65],
           "C": [55, 60, 64], "B7": [57, 59, 63, 66], "Em": [55, 59, 64], "Bb": [58, 62, 65]}
RAIZ = {"Am": 45, "Dm": 50, "E7": 40, "F": 41, "G7": 43, "C": 48, "B7": 47, "Em": 40, "Bb": 46}
# seq: 4 compases · pad: colchón de bandoneón · stab: acordes marcados · bajo: 0 nada, 1 habanera 3-3-2, 2 marcato en 4
# timbal: golpe grave por compás · mel: frase de bandoneón solista · brillo: filtro del colchón · arrastre: barrido antes del 1
CLIMA = {
    "misterio":  dict(seq=["Am", "Am", "E7", "E7"], pad=.05, stab=0, bajo=1, bg=.6, timbal=0, mel=.07, brillo=900, arrastre=0),
    "llanura":   dict(seq=["Am", "F", "Dm", "E7"], pad=.045, stab=0, bajo=1, bg=.5, timbal=0, mel=.07, brillo=1000, arrastre=0),
    "auge":      dict(seq=["Am", "Dm", "G7", "C"], pad=.035, stab=.05, bajo=1, bg=.9, timbal=0, mel=0, brillo=1500, arrastre=.04),
    "tension":   dict(seq=["Dm", "Am", "E7", "Am"], pad=.04, stab=.055, bajo=2, bg=.8, timbal=.4, mel=0, brillo=1100, arrastre=.05),
    "gloria":    dict(seq=["F", "G7", "C", "E7"], pad=.05, stab=.03, bajo=1, bg=.8, timbal=0, mel=.075, brillo=1600, arrastre=.03),
    "sigilo":    dict(seq=["Am", "Am", "Dm", "E7"], pad=.035, stab=0, bajo=1, bg=.45, timbal=0, mel=0, brillo=700, arrastre=0),
    "drama":     dict(seq=["Am", "F", "B7", "E7"], pad=.05, stab=.065, bajo=2, bg=1, timbal=1, mel=0, brillo=1300, arrastre=.06),
    "marcha":    dict(seq=["Am", "Dm", "E7", "Am"], pad=.035, stab=.06, bajo=2, bg=1, timbal=.6, mel=0, brillo=1300, arrastre=.04),
    "caos":      dict(seq=["Dm", "E7", "Am", "B7"], pad=.04, stab=.07, bajo=2, bg=1, timbal=1, mel=0, brillo=1700, arrastre=.07),
    "suspenso":  dict(seq=["Am", "F", "Am", "E7"], pad=.045, stab=.025, bajo=1, bg=.6, timbal=0, mel=0, brillo=900, arrastre=0),
    "reflexion": dict(seq=["F", "C", "Dm", "E7"], pad=.05, stab=0, bajo=1, bg=.5, timbal=0, mel=.065, brillo=1000, arrastre=0),
}
ESTILO = MUS.get("estilo", "tango")
COMPAS = {"caribe": 2.0, "orquesta": 3.2}.get(ESTILO, 2.4)  # 4/4: 120 bpm caribe, 100 bpm tango, 75 bpm orquesta
ORDEN = list(SECS.keys())
CLIMA_SEC = {s: MUS.get("clima", {}).get(s, "suspenso") for s in ORDEN}
LIMITES = [(s, SECS[s][0] if k else 0.0, SECS[ORDEN[k + 1]][0] if k + 1 < len(ORDEN) else TOTAL + 1) for k, s in enumerate(ORDEN)]


def clima_en(t):
    for s, a, b in LIMITES:
        if a <= t < b:
            return s, CLIMA[CLIMA_SEC[s]]
    return ORDEN[-1], CLIMA[CLIMA_SEC[ORDEN[-1]]]


def acorde_en(t):
    _, c = clima_en(t)
    return c["seq"][int(t // COMPAS) % len(c["seq"])]


def lengueta(f, seg, ataque=.04, caida=.25, fuelle=True):
    """Nota de bandoneón: dos lengüetas (pulso estrecho, apenas desafinadas), fuelle con trémolo lento, filtro de caja."""
    t = tt_(seg + caida)
    x = signal.square(2 * np.pi * f * t, .38) * .6 + signal.square(2 * np.pi * f * 1.0025 * t + 1.1, .42) * .4
    x = lp(x, min(3200, f * 9), 2) + .35 * bp(x, 700, 1900)
    env = np.minimum(1, t / ataque) * np.clip((seg + caida - t) / caida, 0, 1)
    if fuelle:
        env *= 1 + .06 * np.sin(2 * np.pi * 4.8 * t)
    return x * env


def marimba(f, seg, caida=.25):
    """Tecla de marimba: parciales 1 · 3,93 · 9,2 que se apagan rápido, golpe de maza blanda."""
    t = tt_(seg + caida)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + .3 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t * 11)
         + .08 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t * 26))
    return x * np.minimum(1, t / .003)


def cuerdas(f, seg, ataque=.35, caida=.6):
    """Colchón de cuerdas: tres sierras apenas desafinadas, filtradas, con vibrato lento."""
    t = tt_(seg + caida)
    vib = 1 + .003 * np.sin(2 * np.pi * 5.2 * t)
    x = sum(signal.sawtooth(2 * np.pi * f * d * np.cumsum(vib) / SR) for d in (1, 1.004, .996)) / 3
    return lp(x, min(2600, f * 6), 2) * np.minimum(1, t / ataque) * np.clip((seg + caida - t) / caida, 0, 1)


NOTA = {}


def nota(m, seg, **kw):
    k = (m, round(seg, 2), tuple(sorted(kw.items())))
    if k not in NOTA:
        if ESTILO == "caribe":
            a = kw.get("ataque", .04)
            NOTA[k] = cuerdas(hz(m), seg, a, kw.get("caida", .6)) if a >= .2 else 1.6 * marimba(hz(m), seg, kw.get("caida", .25))
        else:
            NOTA[k] = lengueta(hz(m), seg, **kw)
    return NOTA[k]


def colchon():
    out = np.zeros(N)
    for k in range(int(TOTAL // COMPAS) + 1):
        t0 = k * COMPAS
        _, c = clima_en(t0 + .01)
        if not c["pad"]:
            continue
        x = sum(nota(m, COMPAS + .2, ataque=.35, caida=.6) for m in ACORDES[acorde_en(t0 + .01)])
        poner(out, lp(x, c["brillo"], 2), t0 - .1, c["pad"])
    return out


def marcados():
    """Acordes cortos de bandoneón en 3-3-2 (1, 4.º y 7.º corchea) y el «arrastre» que cae sobre el tiempo 1."""
    out = np.zeros(N)
    e = COMPAS / 8
    for k in range(int(TOTAL // COMPAS) + 1):
        t0 = k * COMPAS
        _, c = clima_en(t0 + .01)
        notas = ACORDES[acorde_en(t0 + .01)]
        if c["stab"]:
            for j, g in ((0, 1.0), (3, .8), (6, .85)):
                poner(out, sum(nota(m + 12 * (j == 0), .14, ataque=.008, caida=.06, fuelle=False) for m in notas), t0 + j * e, c["stab"] * g)
        if c["arrastre"] and k % 2 == 1:  # glissando ascendente de bajo a acorde, cada dos compases
            for j, m in enumerate(range(notas[0] - 12, notas[0], 2)):
                poner(out, nota(m, .07, ataque=.005, caida=.04, fuelle=False), t0 + COMPAS - .42 + j * .07, c["arrastre"])
    return out


def bajo():
    out = np.zeros(N)
    e = COMPAS / 8
    t = tt_(.7)
    for k in range(int(TOTAL // COMPAS) + 1):
        t0 = k * COMPAS
        _, c = clima_en(t0 + .01)
        if not c["bajo"]:
            continue
        m = RAIZ[acorde_en(t0 + .01)]
        if ESTILO == "caribe":  # tresillo del kompa / merengue lento
            golpes = [(0, m, 1.0), (3, m, .7), (4, m + 7, .8), (6, m + 12, .6)] if c["bajo"] == 1 else [(0, m, 1), (2, m + 7, .8), (3, m, .7), (4, m + 12, .9), (6, m + 7, .8)]
        else:
            golpes = [(0, m, 1.0), (3, m + 7, .75), (6, m + 12, .7)] if c["bajo"] == 1 else [(0, m, 1), (2, m + 7, .8), (4, m, .9), (6, m + 7, .8)]
        for j, mm, g in golpes:
            f = hz(mm - 12)
            x = (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .15 * signal.sawtooth(2 * np.pi * f * t)) * env_ad(t, .006, 5.5)
            poner(out, lp(x, 700), t0 + j * e, .2 * c["bg"] * g)
    return out


def timbales():
    out = np.zeros(N)
    t = tt_(1.4)
    f = 75 * np.exp(-t * 2.5) + 42
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.6) + .15 * lp(rng.standard_normal(len(t)), 400) * np.exp(-t * 18)
    for k in range(int(TOTAL // COMPAS) + 1):
        t0 = k * COMPAS
        _, c = clima_en(t0 + .01)
        if c["timbal"]:
            poner(out, x, t0, .3 * c["timbal"])
    return out


# frases del solista (corcheas desde el 1 del compás, nota relativa a la raíz del acorde en la escala de La menor armónica)
ESCALA = [57, 59, 60, 62, 64, 65, 68, 69, 71, 72, 74, 76, 77, 80, 81]
FRASES = [[(0, 4, 3), (3, 3, 1), (4, 2, 2), (6, 1, 2)], [(0, 2, 2), (2, 3, 1), (3, 4, 3), (6, 5, 2)],
          [(0, 7, 3), (3, 6, 1), (4, 4, 4)], [(1, 4, 1), (2, 5, 1), (3, 6, 1), (4, 7, 4)]]


def solista():
    out = np.zeros(N)
    e = COMPAS / 8
    for k in range(int(TOTAL // COMPAS) + 1):
        t0 = k * COMPAS
        sec, c = clima_en(t0 + .01)
        if not c["mel"] or k % 4 == 3:  # cada cuarto compás, respira
            continue
        raiz = ACORDES[acorde_en(t0 + .01)][0]
        base = min(range(len(ESCALA)), key=lambda i: abs(ESCALA[i] - (raiz + 12)))
        for j, grado, largo in FRASES[k % len(FRASES)]:
            m = ESCALA[min(len(ESCALA) - 1, max(0, base + grado - 3))]
            poner(out, nota(m, largo * e * .95, ataque=.03, caida=.18), t0 + j * e, c["mel"])
    return out


def ruido(seg):
    return rng.standard_normal(int(seg * SR))


def guira():
    """Güira (raspador de metal): semicorcheas «chik-chi-chik», más fuerte cuanto más energía tiene el clima."""
    out = np.zeros(N)
    largo, corto = hp(ruido(.11), 5000) * np.exp(-tt_(.11) * 22), hp(ruido(.05), 6000) * np.exp(-tt_(.05) * 70)
    s16 = COMPAS / 16
    for k in range(int(TOTAL // COMPAS) + 1):
        t0 = k * COMPAS
        _, c = clima_en(t0 + .01)
        if c["bg"] < .8:
            continue
        for j in range(16):
            poner(out, largo if j % 4 == 0 else corto, t0 + j * s16 + rng.uniform(-.004, .004), .022 * c["bg"] * (1 if j % 2 == 0 else .6))
    return out


def tambora():
    """Tambora y conga: parche grave en 1 y 3, golpe de aro («slap») en el 4 y medio."""
    out = np.zeros(N)
    t = tt_(.6)
    parche = np.sin(2 * np.pi * np.cumsum(160 * np.exp(-t * 18) + 95) / SR) * np.exp(-t * 9)
    slap = bp(ruido(.08), 900, 4000) * np.exp(-tt_(.08) * 55) + .4 * np.sin(2 * np.pi * 330 * tt_(.08)) * np.exp(-tt_(.08) * 40)
    e = COMPAS / 8
    for k in range(int(TOTAL // COMPAS) + 1):
        t0 = k * COMPAS
        _, c = clima_en(t0 + .01)
        if c["bg"] < .8 and not c["timbal"]:
            continue
        gan = .12 * max(c["bg"] - .3, c["timbal"])
        for j, x, g in ((0, parche, 1), (4, parche, .8), (7, slap, .7), (3, slap, .35)):
            poner(out, x, t0 + j * e, gan * g)
    return out


if ESTILO == "orquesta":  # orquesta real (VSCO-2 CE, CC0): ver orquesta.py
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import orquesta
    musica = reverb(orquesta.componer(N, TOTAL, COMPAS, clima_en, acorde_en, ACORDES, RAIZ, poner, lp, hp, rng), 3.4, .32)
else:
    musica = colchon() + marcados() + bajo() + timbales() + solista()
    if ESTILO == "caribe":
        musica += guira() + tambora()
    musica = reverb(musica, 2.6, .3)
tt = np.arange(N) / SR
musica *= np.minimum(1, tt / 1.2) * np.clip((TOTAL + 0.4 - tt) / 2.0, 0, 1)
for t0, t1 in MUS.get("silencios", []):
    a, b = int(t0 * SR), int(t1 * SR)
    musica[a:b] *= np.linspace(1, 0.15, b - a)
    c = min(N, b + int(1.2 * SR))
    musica[b:c] *= np.linspace(0.15, 1, c - b)

# ---------- Voz (una pista por frase) y ducking ----------
voz = np.zeros(N)
for i in range(len(INI)):
    poner(voz, cargar(AQUI / "voz" / f"s{i:03d}.wav"), INI[i])
envv = lp(np.abs(voz), 4)
envv = np.clip(envv / (np.max(envv) * 0.15), 0, 1)
musica *= 1.0 - 0.62 * envv


# ---------- SFX sintetizados ----------
def s_canon():
    t = tt_(3.0)
    boom = np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t * 3) + 30) / SR) * np.exp(-t * 2.2)
    estallido = lp(ruido(3.0), 1800) * np.exp(-t * 6) + 0.4 * lp(ruido(3.0), 300) * np.exp(-t * 1.5)
    return reverb(norm(boom * 1.2 + estallido), 3.5, 0.45)


def s_moneda():
    t = tt_(1.4)
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(2650, 6), (4180, 9), (5900, 12), (3320, 7)])
    rebote = np.zeros_like(x)
    for k, dt in enumerate([0.0, 0.18, 0.31, 0.4]):
        poner(rebote, x * (0.8 ** k), dt)
    return norm(rebote[: len(t)])


def s_sello():
    t = tt_(0.8)
    golpe = lp(ruido(0.8), 900) * np.exp(-t * 30) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 18)
    return norm(reverb(golpe, 0.8, 0.25))


def s_mazo():
    t = tt_(1.8)
    madera = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(180, 14), (420, 22), (950, 35)])
    madera += 0.5 * bp(ruido(1.8), 800, 3000) * np.exp(-t * 60)
    x = np.zeros_like(madera)
    poner(x, madera, 0); poner(x, madera * 0.9, 0.34)
    return norm(reverb(x, 2.4, 0.4))


def s_tren():
    t = tt_(5.0)
    x = np.zeros_like(t)
    golpe = bp(ruido(0.12), 200, 1200) * np.exp(-tt_(0.12) * 40)
    for k in range(40):
        base = k * 0.24
        poner(x, golpe, base); poner(x, golpe * 0.7, base + 0.09)
    vapor = bp(ruido(5.0), 2000, 6000) * 0.15
    silbato = (np.sin(2 * np.pi * 620 * t) + 0.6 * np.sin(2 * np.pi * 780 * t)) * np.clip((t - 3.2) * 4, 0, 1) * np.clip((4.6 - t) * 4, 0, 1) * 0.3
    return norm((x + vapor + silbato) * np.minimum(1, t / 1.0) * np.clip((5.0 - t), 0, 1))


def s_bocina():
    t = tt_(3.2)
    f = 98
    x = sum(signal.sawtooth(2 * np.pi * f * m * t) / m for m in (1, 2, 3, 1.5))
    return norm(reverb(lp(x, 900) * np.minimum(1, t / 0.25) * np.clip((2.6 - t) / 0.6, 0, 1), 4.0, 0.5))


def s_viento(seg=7.0):
    t = tt_(seg)
    x = bp(ruido(seg), 300, 2400)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * t / 3.1) * np.sin(2 * np.pi * t / 1.7 + 1)
    return norm(x * am * np.minimum(1, t / 1.5) * np.clip((seg - t) / 2, 0, 1))


def s_agua():
    t = tt_(6.0)
    x = np.zeros_like(t)
    for _ in range(70):
        f = rng.uniform(500, 1600)
        d = tt_(0.07)
        gota = np.sin(2 * np.pi * (f + 3000 * d) * d) * np.exp(-d * 60)
        poner(x, gota * rng.uniform(.2, 1), rng.uniform(0, 5.6))
    base = lp(ruido(6.0), 500) * 0.25
    return norm((x + base) * np.minimum(1, t / 0.8) * np.clip((6.0 - t) / 1.5, 0, 1))


def s_olas(seg=7.0):
    n = int(seg * SR)
    r = np.cumsum(rng.standard_normal(n)) * 0.02
    r = bp(r - lp(r, 30), 150, 1400)
    t = np.arange(n) / SR
    am = (0.5 + 0.5 * np.sin(2 * np.pi * t / 5.0 - 1.5)) ** 2
    return norm(r * am * np.minimum(1, np.minimum(t / 1.2, (seg - t) / 1.2)))


def s_rio(seg=6.0):
    t = tt_(seg)
    return norm(bp(ruido(seg), 400, 3500) * (0.7 + 0.3 * np.sin(2 * np.pi * t * 0.7)) * np.minimum(1, t / 1.0) * np.clip((seg - t) / 2, 0, 1))


def s_avion():
    t = tt_(5.5)
    zumbido = sum(signal.sawtooth(2 * np.pi * (120 + 25 * np.sin(t * 0.6)) * m * t) / m for m in (1, 2, 3))
    x = lp(zumbido, 1500) * 0.4 + bp(ruido(5.5), 300, 1500)
    return norm(x * np.sin(np.pi * t / 5.5) ** 2)


def s_multitud(seg=5.0):
    t = tt_(seg)
    voces = sum(bp(ruido(seg), f, f * 1.6) * (0.6 + 0.4 * np.sin(2 * np.pi * t * rng.uniform(.3, 1.2) + rng.uniform(0, 6))) for f in (250, 450, 800, 1300))
    gritos = np.zeros_like(t)
    for _ in range(int(6 * seg / 5)):
        d = tt_(0.6)
        f0 = rng.uniform(380, 650)
        gritos_k = signal.sawtooth(2 * np.pi * (f0 + 60 * np.sin(d * 8)) * d) * np.sin(np.pi * d / 0.6)
        poner(gritos, bp(gritos_k, 400, 2500) * 0.25, rng.uniform(0.5, seg - 0.8))
    return norm((voces + gritos) * np.minimum(1, t / 1.0) * np.clip((seg - t) / 1.5, 0, 1))


def s_tambor():  # redoble militar
    x = np.zeros(int(2.4 * SR))
    g = bp(ruido(0.09), 150, 4000) * np.exp(-tt_(0.09) * 45)
    for k in range(26):
        poner(x, g * (0.4 + 0.6 * k / 26), k * 0.06)
    poner(x, g * 1.6, 1.62)
    return norm(reverb(x, 1.5, 0.3))


def s_golpe_grave():
    t = tt_(4.0)
    x = np.sin(2 * np.pi * np.cumsum(40 * np.exp(-t * 0.8) + 32) / SR) * np.exp(-t * 1.1)
    return norm(reverb(x + 0.2 * lp(ruido(4.0), 200) * np.exp(-t * 4), 4, 0.4))


def s_riser_sub():
    t = tt_(2.0)
    x = np.sin(2 * np.pi * np.cumsum(40 + 60 * (t / 2) ** 2) / SR) * (t / 2) ** 2 + bp(ruido(2.0), 800, 5000) * (t / 2) ** 3 * 0.4
    return norm(x)


def s_tension():
    t = tt_(4.0)
    x = sum(np.sin(2 * np.pi * f * t) for f in (220, 233.1)) * np.sin(np.pi * t / 4) ** 2
    return norm(reverb(x, 3, 0.4))


def s_sigilo():
    t = tt_(3.0)
    x = np.sin(2 * np.pi * 880 * t + 3 * np.sin(2 * np.pi * 5 * t)) * np.exp(-t * 1.5) * 0.5
    x += np.sin(2 * np.pi * 932 * t) * np.exp(-t * 2) * 0.3
    return norm(reverb(x, 3.5, 0.6))


def s_papel():
    t = tt_(0.9)
    x = hp(ruido(0.9), 2500) * (np.abs(np.sin(2 * np.pi * t * 7)) ** 3) * np.sin(np.pi * t / 0.9)
    return norm(x)


def s_reloj():
    x = np.zeros(int(2.6 * SR))
    tic = bp(ruido(0.02), 2000, 7000) * np.exp(-tt_(0.02) * 300)
    for k in range(5):
        poner(x, tic * (1 if k % 2 == 0 else 0.6), k * 0.5)
    return norm(x)


def s_tic():
    """Un diente de la red del astrolabio: chasquido metálico seco con un poco de cuerpo."""
    x = np.zeros(int(0.25 * SR))
    poner(x, bp(ruido(0.03), 2500, 8000) * np.exp(-tt_(0.03) * 260), 0)
    poner(x, np.sin(2 * np.pi * 320 * tt_(0.08)) * np.exp(-tt_(0.08) * 60) * 0.35, 0)
    return norm(x)


def s_contador():
    x = np.zeros(int(1.4 * SR))
    c = np.sin(2 * np.pi * 1800 * tt_(0.025)) * np.exp(-tt_(0.025) * 120)
    tt0 = 0.0
    while tt0 < 1.25:
        poner(x, c * 0.7, tt0)
        tt0 += 0.03 + 0.11 * (tt0 / 1.3) ** 2
    return norm(x)


def s_aduana():  # barrera + sello de pasaporte
    t = tt_(1.0)
    chirrido = np.sin(2 * np.pi * (300 + 200 * t) * t) * np.sin(np.pi * np.clip(t / 0.5, 0, 1)) * 0.3
    x = np.zeros(int(1.6 * SR))
    poner(x, lp(chirrido, 2000), 0)
    poner(x, s_sello(), 0.65)
    return norm(x)


def s_marcha():
    x = np.zeros(int(4.0 * SR))
    paso = lp(ruido(0.12), 700) * np.exp(-tt_(0.12) * 35)
    for k in range(14):
        poner(x, paso * (0.8 + 0.2 * (k % 2)), k * 0.27)
    return norm(x * np.clip(np.linspace(0.3, 1.4, len(x)), 0, 1))


def s_pasos():
    x = np.zeros(int(4.0 * SR))
    casco = bp(ruido(0.05), 600, 2500) * np.exp(-tt_(0.05) * 90)
    for k in range(16):
        poner(x, casco * rng.uniform(.5, 1), k * 0.23 + (0.07 if k % 2 else 0))
    return norm(x * np.sin(np.pi * np.linspace(0, 1, len(x))))


def s_brillos():
    x = np.zeros(int(3.0 * SR))
    for k in range(18):
        f = rng.choice([1760, 2093, 2349, 2637, 3136])
        d = tt_(0.5)
        poner(x, np.sin(2 * np.pi * f * d) * np.exp(-d * 9), k * 0.11 + rng.uniform(0, .04))
    return norm(reverb(x, 2, 0.5))


def s_hundir():
    t = tt_(3.0)
    burbujas = np.zeros_like(t)
    for _ in range(40):
        d = tt_(0.05)
        f = rng.uniform(250, 700)
        poner(burbujas, np.sin(2 * np.pi * (f + 2000 * d) * d) * np.exp(-d * 50), rng.uniform(0.3, 2.8))
    crujido = lp(ruido(3.0), 400) * np.exp(-t * 1.2) * 0.6
    return norm(burbujas + crujido)


def s_error_grave():
    t = tt_(0.9)
    x = signal.square(2 * np.pi * 110 * t) * 0.5 + signal.square(2 * np.pi * 116.5 * t) * 0.5
    return norm(lp(x, 900) * np.minimum(1, t / 0.01) * np.clip((0.9 - t) / 0.3, 0, 1))


def s_corte():  # cuerda que se corta
    t = tt_(1.2)
    x = np.sin(2 * np.pi * np.cumsum(1200 * np.exp(-t * 6) + 80) / SR) * np.exp(-t * 4)
    return norm(x + 0.3 * hp(ruido(1.2), 3000) * np.exp(-t * 30))


def s_voto():
    t = tt_(0.35)
    return norm(np.sin(2 * np.pi * 660 * t) * np.exp(-t * 18) + 0.3 * np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 25))


def s_voto_rojo():
    t = tt_(0.35)
    return norm(np.sin(2 * np.pi * 330 * t) * np.exp(-t * 14) + 0.3 * np.sin(2 * np.pi * 495 * t) * np.exp(-t * 20))


def s_capitulo():  # golpe grave + acorde de bandoneón en La menor: separador de capítulo
    t = tt_(3.0)
    x = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 4) + 45) / SR) * np.exp(-t * 3)
    acorde = sum(nota(m, .5, ataque=.01, caida=1.2) for m in (57, 60, 64))[: len(t)]
    x[: len(acorde)] += 0.3 * acorde
    return norm(reverb(x, 3, 0.5))


def s_terremoto(seg=6.0):
    """Retumbo grave que crece, crujidos de estructura y cascotes."""
    t = tt_(seg)
    x = lp(ruido(seg), 90) * 3 * np.sin(np.pi * np.clip(t / seg, 0, 1)) ** .7 * (1 + .5 * np.sin(2 * np.pi * 7 * t))
    for _ in range(22):
        d = tt_(.3)
        poner(x, bp(ruido(.3), 300, 2500) * np.exp(-d * rng.uniform(10, 30)) * rng.uniform(.2, .8), rng.uniform(.8, seg - .5))
    return norm(reverb(x, 2.5, .3))


def s_fuego(seg=5.0):
    t = tt_(seg)
    x = lp(ruido(seg), 600) * .5
    for _ in range(int(40 * seg / 5)):
        d = tt_(.03)
        poner(x, hp(ruido(.03), 2000) * np.exp(-d * 120) * rng.uniform(.3, 1.2), rng.uniform(0, seg - .05))
    return norm(x * np.minimum(1, t / .8) * np.clip((seg - t) / 1.2, 0, 1))


def s_lluvia(seg=7.0):
    t = tt_(seg)
    x = bp(ruido(seg), 1500, 9000) * .5
    for _ in range(int(160 * seg / 7)):
        d = tt_(.012)
        poner(x, hp(ruido(.012), 3000) * np.exp(-d * 300) * rng.uniform(.2, 1), rng.uniform(0, seg - .02))
    return norm(x * np.minimum(1, t / 1.5) * np.clip((seg - t) / 2, 0, 1))


def s_hacha():
    """Tres hachazos sobre madera y el crujido del árbol que cae."""
    x = np.zeros(int(3.6 * SR))
    golpe = sum(np.sin(2 * np.pi * f * tt_(.35)) * np.exp(-tt_(.35) * d) for f, d in [(240, 20), (520, 30), (1100, 45)]) + .7 * bp(ruido(.35), 1500, 5000) * np.exp(-tt_(.35) * 70)
    for k in range(3):
        poner(x, golpe * (.8 + .1 * k), k * .55)
    cruje = bp(ruido(1.6), 200, 1200) * np.linspace(.2, 1, int(1.6 * SR)) * (1 + np.sin(2 * np.pi * 13 * tt_(1.6)))
    poner(x, cruje * .5, 1.8)
    return norm(reverb(x, 1.6, .3))


def s_cadenas():
    x = np.zeros(int(2.2 * SR))
    for _ in range(14):
        d = tt_(.25)
        f = rng.uniform(1800, 4200)
        eslabon = (np.sin(2 * np.pi * f * d) + .5 * np.sin(2 * np.pi * f * 1.7 * d)) * np.exp(-d * 35) + .3 * hp(ruido(.25), 3000) * np.exp(-d * 80)
        poner(x, eslabon * rng.uniform(.3, 1), rng.uniform(0, 1.8))
    return norm(reverb(x, 1.2, .3))


def s_campana():
    t = tt_(5.0)
    x = sum(a * np.sin(2 * np.pi * 196 * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, .7), (2.0, .5, 1.1), (2.4, .45, 1.4), (3.0, .3, 1.9), (4.2, .2, 2.6), (.5, .4, .5)])
    return norm(reverb(x * np.minimum(1, t / .004), 3.5, .4))


SINT = {"terremoto": s_terremoto, "fuego": s_fuego, "lluvia": s_lluvia, "hacha": s_hacha, "cadenas": s_cadenas, "campana": s_campana,
        "cañon": s_canon, "moneda": s_moneda, "sello": s_sello, "mazo": s_mazo, "tren": s_tren, "bocina": s_bocina, "viento": s_viento,
        "agua": s_agua, "olas": s_olas, "rio": s_rio, "avion": s_avion, "multitud": s_multitud, "tambor": s_tambor, "golpe-grave": s_golpe_grave,
        "riser-sub": s_riser_sub, "tension": s_tension, "sigilo": s_sigilo, "papel": s_papel, "reloj": s_reloj, "tic": s_tic, "contador": s_contador,
        "aduana": s_aduana, "marcha": s_marcha, "pasos": s_pasos, "brillos": s_brillos, "hundir": s_hundir, "error-grave": s_error_grave,
        "corte": s_corte, "voto": s_voto, "voto-rojo": s_voto_rojo, "capitulo": s_capitulo}
LARGOS = {"viento": s_viento, "olas": s_olas, "rio": s_rio, "multitud": s_multitud, "lluvia": s_lluvia, "fuego": s_fuego, "terremoto": s_terremoto}  # admiten duración, para ambientes


def normalizar(cruda, salida):
    """-14 LUFS en dos pasadas (una sola se queda corta en videos largos)."""
    medir = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(cruda), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                            "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(medir[medir.rindex("{"):medir.rindex("}") + 1])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(cruda), "-af",
                    f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
                    f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "44100", str(salida) + ".tmp.wav"], check=True)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(salida) + ".tmp.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    i = float(r[r.rindex("I:"):].split()[1])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(salida) + ".tmp.wav", "-af",
                    f"volume={-14.0 - i:.2f}dB,alimiter=limit=0.84:attack=2:release=60:level=false", "-ar", "44100", str(salida)], check=True)
    Path(str(salida) + ".tmp.wav").unlink()
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(salida), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(r[r.rindex("I:"):].split()[1])


cache = {}
sfx = np.zeros(N)
faltan = set()
for t, nombre, g in D["sfx"]:
    if nombre in SINT:
        if nombre not in cache or nombre in ("cañon", "olas", "agua", "multitud", "hundir", "terremoto", "fuego", "lluvia", "cadenas"):  # los orgánicos se regeneran: nunca suenan igual
            cache[nombre] = SINT[nombre]()
        x = cache[nombre]
    else:
        ruta = SFX_DIR / f"{nombre}.mp3"
        if not ruta.exists():
            faltan.add(nombre)
            continue
        if nombre not in cache:
            cache[nombre] = cargar(ruta)
        x = signal.resample(cache[nombre], int(len(cache[nombre]) / rng.uniform(0.92, 1.08)))  # otro tono cada vez
    poner(sfx, x, t, g * rng.uniform(0.85, 1.05))
AMB_DIR = Path(__file__).resolve().parent.parent / "musica" / "ambientes"


def ambiente_real(nombre, seg):
    """Grabación real (automatizacion/musica/ambientes/, ver CREDITOS.md): en bucle con fundido cruzado y entrada/salida suaves."""
    if nombre not in cache:
        x = hp(cargar(AMB_DIR / nombre), 40)
        cache[nombre] = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * .12  # mismo nivel RMS para todas las grabaciones
    x, n, f = cache[nombre], int(seg * SR), int(1.5 * SR)
    if len(x) <= 3 * f:
        x = np.tile(x, 4)
    out = np.zeros(n + 3 * f)
    i = int(rng.uniform(0, max(1, len(x) - n)))  % max(1, len(x) - 3 * f)  # cada uso arranca en otro punto
    pos, rampa = 0, np.linspace(0, 1, f)
    while pos < n:
        trozo = x[i:i + max(n - pos + f, 2 * f + 1)].copy()  # nunca menos de 2 fundidos (si no, el bucle no avanza)
        if len(trozo) <= 2 * f:
            i = 0; continue
        trozo[:f] *= rampa; trozo[-f:] *= rampa[::-1]
        out[pos:pos + len(trozo)] += trozo
        pos += len(trozo) - f; i = 0
    out = out[:n]
    env = np.minimum(1, np.arange(n) / f) * np.minimum(1, (n - np.arange(n)) / f)
    return out * env


for nombre, t0, t1, g in MUS.get("ambientes", []):
    poner(sfx, ambiente_real(nombre, t1 - t0) if "." in nombre else LARGOS[nombre](t1 - t0), t0, g)
if faltan:
    print("AVISO: SFX inexistentes (no suenan):", sorted(faltan))

# insertos con sonido propio (p. ej. el logo del canal): suenan tal cual y la música se calla mientras tanto
ins = np.zeros(N)
for ruta, t0, g in MUS.get("insertos", []):
    x = cargar(AQUI / ruta)
    poner(ins, x, t0, g)
    a_, b_, f_ = int(t0 * SR), min(N, int((t0 + len(x) / SR) * SR)), int(.6 * SR)
    musica[a_:b_] = 0
    musica[max(0, a_ - f_):a_] *= np.linspace(1, 0, a_ - max(0, a_ - f_))
    c_ = min(N, b_ + f_)
    musica[b_:c_] *= np.linspace(0, 1, c_ - b_)
mezcla = voz * 1.0 + musica * 0.55 + sfx * 0.42 + ins
mezcla /= np.max(np.abs(mezcla)) / 0.89
wavfile.write(AQUI / "assets" / "mezcla-cruda.wav", SR, (mezcla * 32767).astype(np.int16))
lufs = normalizar(AQUI / "assets" / "mezcla-cruda.wav", AQUI / "assets" / "mezcla.wav")
print("mezcla ok", round(N / SR, 2), "s,", len(D["sfx"]), "efectos,", lufs, "LUFS")
