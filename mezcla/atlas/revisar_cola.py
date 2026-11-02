"""Transcribe solo el final de s162 (Whisper se comió esa parte al oír la frase entera)."""
import soundfile as sf
from math import gcd
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
a, sr = sf.read("mezcla/video/voz/s162.flac", dtype="float32")
a = a.mean(axis=1) if a.ndim > 1 else a
g = gcd(16000, sr)
b = resample_poly(a, 16000 // g, sr // g).astype("float32")
m = WhisperModel("small.en", device="cpu", compute_type="int8")
for desde in (3.9, 4.2):
    segs, _ = m.transcribe(b[int(desde * 16000):], language="en", beam_size=5)
    print(desde, "=>", " ".join(s.text for s in segs).strip(), flush=True)
