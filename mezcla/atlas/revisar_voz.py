"""Control de la voz: transcribe cada s###.wav con Whisper local y marca las frases que no dicen lo que dice el guion.

Uso: python revisar_voz.py <carpeta-del-video> [umbral]   (umbral de parecido, 0-1; por defecto 0.85)
Escribe <carpeta>/voz/revision.json y lista en pantalla las frases a regenerar o reescribir.
"""
import json, re, sys
from difflib import SequenceMatcher
from pathlib import Path
from faster_whisper import WhisperModel
import soundfile as sf
from math import gcd
from scipy.signal import resample_poly

carpeta = Path(sys.argv[1]).resolve() / "voz"
umbral = float(sys.argv[2]) if len(sys.argv) > 2 else 0.85
frases = json.loads((carpeta / "voz.json").read_text(encoding="utf-8"))
modelo = WhisperModel("small.en", device="cpu", compute_type="int8")

def audio16k(ruta):  # se carga a mano: la versión instalada de av no acepta metadata_errors de faster_whisper
    a, sr = sf.read(str(ruta), dtype="float32")
    a = a.mean(axis=1) if a.ndim > 1 else a
    g = gcd(16000, sr)
    return resample_poly(a, 16000 // g, sr // g).astype("float32")


def limpio(t):
    return re.sub(r"[^a-z0-9 ]", "", t.lower().replace("-", " "))

malas, rev = [], []
for i, f in enumerate(frases):
    if f.get("idioma", "en-us") != "en-us":
        continue  # Whisper inglés no juzga otras lenguas
    segs, _ = modelo.transcribe(audio16k(carpeta / f"s{i:03d}.flac"), language="en", beam_size=1)
    oido = " ".join(s.text for s in segs).strip()
    p = SequenceMatcher(None, limpio(f["texto"]), limpio(oido)).ratio()
    rev.append({"i": i, "parecido": round(p, 3), "guion": f["texto"], "oido": oido})
    if p < umbral:
        malas.append(i)
        print(f"{i:3} {p:.2f}\n   guion: {f['texto']}\n   oído:  {oido}", flush=True)
(carpeta / "revision.json").write_text(json.dumps(rev, indent=1, ensure_ascii=False), encoding="utf-8")
print("frases a revisar:", malas)
