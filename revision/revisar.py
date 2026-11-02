"""Revisión de voz en la nube: transcribe revision/s###.flac (16 kHz mono) con Whisper y compara con voz.json."""
import json, re
from difflib import SequenceMatcher
from pathlib import Path
import soundfile as sf
from faster_whisper import WhisperModel

d = Path(__file__).parent
frases = json.loads((d / "voz.json").read_text(encoding="utf-8"))
modelo = WhisperModel("small.en", device="cpu", compute_type="int8")
limpio = lambda t: re.sub(r"[^a-z0-9 ]", "", t.lower().replace("-", " "))
rev, malas = [], []
for ruta in sorted(d.glob("s*.flac")):
    i = int(ruta.stem[1:])
    a, _ = sf.read(str(ruta), dtype="float32")
    oido = " ".join(s.text for s in modelo.transcribe(a, language="en", beam_size=1)[0]).strip()
    p = SequenceMatcher(None, limpio(frases[i]["texto"]), limpio(oido)).ratio()
    rev.append({"i": i, "parecido": round(p, 3), "guion": frases[i]["texto"], "oido": oido})
    if p < 0.85:
        malas.append(i)
        print(f"{i:3} {p:.2f}\n   guion: {frases[i]['texto']}\n   oido:  {oido}", flush=True)
(d / "revision.json").write_text(json.dumps(rev, indent=1, ensure_ascii=False), encoding="utf-8")
print("frases a revisar:", malas, "| revisadas:", len(rev))
