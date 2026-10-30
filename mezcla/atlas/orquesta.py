"""Estilo «orquesta» de mezcla.py: orquesta real con samples de VSCO-2 CE (Versilian Studios, CC0, dominio público).
Samples en automatizacion/musica/vsco/ (bajar_vsco: ver README). Misma lógica de climas que el tango y el caribe:
cada clima decide colchón de cuerdas, contrabajo y tuba, ostinato de cellos, trémolo, timbales, trompas y arpa.
"""
import re
from functools import lru_cache
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy import signal

VSCO = Path(__file__).resolve().parent.parent / "musica" / "vsco"
SR = 44100
PC = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
INST = {  # carpeta, capa de intensidad preferida (regex sobre el nombre)
    "violines": ("Strings/Violin Section/susVib", r"_v2"),
    "violas": ("Strings/Viola Section/susvib", r"_v1_1"),
    "cellos": ("Strings/Cello Section/susvib", r"_v3_1"),
    "contrabajo": ("Strings/Solo Contrabass/SusVib", r"_v1_rr1"),
    "trem_vln": ("Strings/Violin Section/Trem", r"_v1"),
    "trem_vc": ("Strings/Cello Section/trem", r"_v2_1"),
    "spic": ("Strings/Cello Section/spic", r"_v1_RR2"),
    "trompa": ("Brass/F Horn/sus", r"_v3_1"),
    "trombon": ("Brass/Tenor Trombone/sus", r"_v2_1"),
    "tuba": ("Brass/Tuba/sus", r"_v2_rr1"),
    "arpa": ("Strings/Harp", r"_mf"),
}


def leer(f):
    x, sr = sf.read(f, dtype="float32", always_2d=True)
    x = x.mean(1)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr).astype(np.float32)
    return x


def tono(x):
    """Frecuencia fundamental (autocorrelación sobre medio segundo estable) → nota MIDI con decimales."""
    a = x[int(.25 * SR):int(.75 * SR)]
    if len(a) < 2000:
        a = x[:int(.5 * SR)]
    a = a - a.mean()
    c = signal.fftconvolve(a, a[::-1])[len(a) - 1:]
    lo, hi = int(SR / 1400), int(SR / 27)
    k = lo + int(np.argmax(c[lo:hi]))
    # evitar el error de octava: si la mitad del período también correlaciona fuerte, quedarse con ella
    while k // 2 > lo and c[k // 2] > .85 * c[k]:
        k //= 2
    return 69 + 12 * np.log2(SR / k / 440)


@lru_cache(None)
def banco(nombre):
    """[(midi, ruta)] con la octava corregida: el número del nombre se ajusta con la afinación medida."""
    carpeta, capa = INST[nombre]
    archivos = sorted((VSCO / carpeta).glob("*.wav"))
    pref = [f for f in archivos if re.search(capa, f.name)] or archivos
    notas = []
    for f in pref:
        m = re.search(r"_([A-G]#?)(-?\d)(?=[_.])", f.name)
        if m:
            notas.append((12 * (int(m.group(2)) + 1) + PC[m.group(1)], f))
    # medir 3 muestras y decidir la convención de octava de este instrumento
    dif = [round((tono(leer(f)) - n) / 12) for n, f in notas[::max(1, len(notas) // 3)][:3]]
    off = 12 * max(set(dif), key=dif.count)
    return [(n + off, f) for n, f in notas]


@lru_cache(None)
def muestra(f):
    return leer(f)


def tocar(inst, m, seg, vel=1.0, ataque=.25, caida=.8):
    """Una nota: el sample más cercano, llevado a la altura justa por remuestreo, con ataque y caída suaves."""
    n, f = min(banco(inst), key=lambda e: abs(e[0] - m))
    x = muestra(f)
    r = 2 ** ((m - n) / 12)
    if abs(r - 1) > 1e-3:
        x = np.interp(np.arange(0, len(x) - 1, r), np.arange(len(x)), x).astype(np.float32)
    total = int((seg + caida) * SR)
    x = x[:total]
    if len(x) < total:  # sostenido más largo que el sample: se extiende con la cola (fundido)
        x = np.concatenate([x, np.zeros(total - len(x), np.float32)])
    t = np.arange(total) / SR
    env = np.minimum(1, t / max(ataque, .003)) * np.clip((seg + caida - t) / caida, 0, 1)
    return x * env * vel


def componer(N, TOTAL, COMPAS, clima_en, acorde_en, ACORDES, RAIZ, poner, lp, hp, rng):
    out = {k: np.zeros(N) for k in ("cuerdas", "bajos", "ritmo", "metal", "perc", "arpa")}
    e = COMPAS / 8
    previo, k0 = None, 0
    for k in range(int(TOTAL // COMPAS) + 1):
        t0 = k * COMPAS
        sec, c = clima_en(t0 + .01)
        ac = acorde_en(t0 + .01)
        notas, raiz = ACORDES[ac], RAIZ[ac]
        if sec != previo:
            previo, k0 = sec, k
        arco = .65 + .35 * min(1, (k - k0) / 6)  # arco dentro de la sección: entra suave y crece hasta el compás 6
        L = COMPAS + .5
        if c["pad"]:  # colchón: cellos en la raíz, violas y violines en el acorde abierto
            g = c["pad"] * 5.5 * arco
            poner(out["cuerdas"], tocar("cellos", raiz + 12, L, ataque=.6, caida=1.2), t0 - .15, g * .9)
            for j, m in enumerate(notas):
                poner(out["cuerdas"], tocar("violas", m, L, ataque=.7, caida=1.2), t0 - .15, g * .55)
                if c["brillo"] >= 1000:
                    poner(out["cuerdas"], tocar("violines", m + 12, L, ataque=.9, caida=1.4), t0 - .15, g * .38)
        if c["bajo"]:
            poner(out["bajos"], tocar("contrabajo", raiz, L, ataque=.35, caida=1.0), t0 - .05, .55 * c["bg"] * arco)
            if c["timbal"] >= .6:
                poner(out["bajos"], tocar("tuba", raiz, L * .9, ataque=.2, caida=.8), t0, .28 * c["bg"])
        if c["bajo"] == 2:  # ostinato de cellos en spiccato: el motor de la tensión
            for j in range(8):
                m = raiz + (12 if j % 4 == 2 else 0) + (7 if j % 4 == 3 else 0)
                poner(out["ritmo"], tocar("spic", m, .18, ataque=.004, caida=.12), t0 + j * e, .5 * c["bg"] * (1 if j % 2 == 0 else .7))
        if c["stab"] >= .05 and k % 2 == 0:  # trémolo alto: nervio
            poner(out["cuerdas"], tocar("trem_vln", notas[-1] + 12, 2 * COMPAS, ataque=.8, caida=.8), t0, c["stab"] * 2.6)
            poner(out["cuerdas"], tocar("trem_vc", raiz, 2 * COMPAS, ataque=.8, caida=.8), t0, c["stab"] * 2.2)
        if c["timbal"]:
            hit = timbal(raiz)
            poner(out["perc"], hit, t0, .55 * c["timbal"])
            if c["timbal"] >= 1 and k % 4 == 3:
                poner(out["perc"], hit, t0 + 6 * e, .4)
                poner(out["perc"], hit, t0 + 7 * e, .5)
        if c["mel"] and k % 4 != 3:
            if c["brillo"] >= 1500 or c.get("trompas"):  # gloria / auge: trompas en terceras, línea larga
                for j, m in ((0, notas[1] + 12), (4, notas[2] + 12)):
                    poner(out["metal"], tocar("trompa", m - 12, 4 * e, ataque=.15, caida=.6), t0 + j * e, c["mel"] * 4.2)
            else:  # misterio / reflexión: arpa arpegiada
                arp = [raiz + 12, notas[0] + 12, notas[1] + 12, notas[2] + 12, notas[1] + 24, notas[2] + 12]
                for j, m in enumerate(arp):
                    poner(out["arpa"], tocar("arpa", m, 1.2, ataque=.003, caida=1.0), t0 + j * e * 1.3, c["mel"] * 4.0)
        if c.get("trombones") or (c["stab"] >= .06 and c["timbal"] >= 1):  # golpe de metales en el 1 (drama, caos)
            if k % 2 == 0:
                for m in notas:
                    poner(out["metal"], tocar("trombon", m - 12, .9, ataque=.03, caida=.5), t0, .32)
    mez = (out["cuerdas"] + out["bajos"] * .9 + out["ritmo"] * .8 + out["metal"] * .85 + out["perc"] + out["arpa"] * .8)
    return hp(mez, 32)


@lru_cache(None)
def timbal(m):
    """Timbal real (VSCO); se elige el de altura más cercana a la raíz, una o dos octavas abajo."""
    golpes = sorted((VSCO / "Percussion/Timpani").glob("Timpani*_Hit_v4_rr1_Sum.wav")) or sorted((VSCO / "Percussion/Timpani").glob("*Hit*.wav"))
    return leer(golpes[min(len(golpes) - 1, (m % 12) * len(golpes) // 12)])[: int(2.5 * SR)]
