"""Paso 1 del largo: voz con Kokoro local, una pista por frase + voz.json (sección, texto, duración, voz).

Uso: python voz.py <carpeta-del-video> [n n n ...]   (los números regeneran solo esas frases)
Lee <carpeta>/voz/guion.txt: "## clave" abre capítulo; cada línea es una frase.
Una frase puede cambiar de voz con el prefijo [voz:idioma], p. ej. "[ff_siwis:fr-fr] Riche comme un Argentin."
"""
import json, os, re, sys, time
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

MOD = Path(os.environ.get("KOKORO_MOD", r"C:\Users\Javier\Desktop\VibeCode\Ring Closers\videos-remotion\modelos"))
# canal 4 (The Last Question): VOZ=bm_lewis IDIOMA=en-gb VEL=0.95 · PARTE=0/2 y 1/2 generan en paralelo (luego una corrida sin PARTE arma voz.json)
VOZ, IDIOMA, VEL = os.environ.get("VOZ", "am_michael"), os.environ.get("IDIOMA", "en-us"), float(os.environ.get("VEL", "1.0"))
PARTE = os.environ.get("PARTE")
LISTA = set(json.loads(os.environ["LISTA"])) if os.environ.get("LISTA") else None   # en la nube: solo estas frases
# pronunciación: solo cambia lo que se le pasa a Kokoro (el guion y la pantalla quedan con la grafía real); probado con Whisper
PRON = {"Uriburu": "Ooreebooroo", "Díaz Alejandro": "Dee-as Ah-leh-HAHN-dro", "Milei": "Mee-LAY",
        "Louverture": "Loo-vair-TOOR", "Dessalines": "Dess-ah-LEEN", "Vertières": "Vair-TYAIR", "Saint-Domingue": "San Doh-MANG",
        "Duvalier": "Doo-vahl-YAY", "Trujillo": "Troo-HEE-yo", "Taíno": "Tah-EE-no", "Péralte": "Pay-RALT", "Boyer": "Bwah-YAY",
        "Balaguer": "Bah-lah-GHERR", "Moïse": "Moh-EEZ", "Macoutes": "Mah-KOOTS", "Joaquín": "Hwah-KEEN", "Sancak": "SAHN-jahk",
        "Jaramillo": "Hah-rah-MEE-yo", "Pico Duarte": "PEE-ko DWAR-teh", "Española": "Es-pah-NYO-lah", "Port-au-Prince": "Port-oh-PRINSS",
        # largo 04 Panamá (las largas primero: el reemplazo va en orden)
        "Amador Guerrero": "Ah-mah-DOR Geh-RREH-ro", "María de la Ossa": "Mah-REE-ah deh lah OH-sah", "José Agustín": "Ho-SEH Ah-goos-TEEN",
        "José Raúl": "Ho-SEH Rah-OOL", "Bunau-Varilla": "Boo-NOH Vah-REE-yah", "Amador": "Ah-mah-DOR", "Colón": "Koh-LOHN", "Bogotá": "Boh-goh-TAH",
        "Gatún": "Gah-TOON", "Huertas": "WEHR-tahs", "Tiradores": "Tee-rah-DOH-res", "Amaya": "Ah-MY-ah", "Tovar": "Toh-VAR", "Herrán": "Eh-RRAHN",
        "Arango": "Ah-RAHN-go", "Chorrillo": "Cho-REE-yo", "Mulino": "Moo-LEE-no", "Moscoso": "Mos-KOH-so", "Cristóbal": "Krees-TOH-bal",
        "Porras": "POH-rrahs", "Darién": "Dah-ree-EN", "Chagres": "CHAH-gres", "Culebra": "Koo-LEH-brah", "Torrijos": "Toh-REE-hos",
        "Lesseps": "Leh-SEPS", "Pelée": "Peh-LAY", "Saint-Pierre": "San Pee-AIR", "Eliseo": "Eh-lee-SEH-oh", "Momotombo": "Moh-moh-TOHM-bo",
        # Gross Margin 01 diamantes
        "Debswana": "Deb-SWAH-nah", "Jwaneng": "JWAH-neng", "Orapa": "Oh-RAH-pah", "Surat": "SOO-rut", "Zhecheng": "Juh-CHENG",
        "Henan": "Huh-NAHN", "Gerety": "GAIR-uh-tee", "Lightbox": "Light-box", "kimberlite": "KIM-ber-lite",
        # Gross Margin 02 Mónaco
        "Société des Bains de Mer": "So-see-ay-TAY day BAN duh MAIR", "François Blanc": "Fran-SWAH BLAHN", "Monegasques": "Mon-uh-GASKS",
        "Roquebrune": "Rock-BROON", "Menton": "Mahn-TOHN", "Fontvieille": "Fon-vee-AY", "Mareterra": "Mah-reh-TEH-rah",
        "Rainier": "Reh-NEER", "Grimaldis": "Gree-MAHL-deez", "Grimaldi": "Gree-MAHL-dee", "Monte Carlo": "Mon-tee CAR-lo",
        # The Last Question 01
        "Super-Kamiokande": "Super Kah-mee-oh-KAHN-deh", "Kamionkowski": "Kah-mee-on-KOV-skee", "Schröder": "SHRUR-der",
        "Laughlin": "LOCK-lin", "Scherrer": "SHERR-er", "Clausius": "KLOW-zee-us", "Sawala": "Sah-VAH-lah",
        "Milkomeda": "Milk-oh-MEE-dah", "Stelliferous": "Stel-IF-er-us", "Tye": "Tie",
        # The Last Question 02 (antes del Big Bang)
        "Georges Lemaître": "Zhorzh Luh-MET-ruh", "Lemaître": "Luh-MET-ruh", "Penzias": "PEN-zee-us", "Vilenkin": "Vih-LEN-kin",
        "Pawlowski": "Pav-LOV-skee", "Parampreet": "Pa-RUM-preet", "Ashtekar": "ASH-teh-kar", "Leibniz": "LIBE-nits",
        "Hippo": "HIP-oh", "Arvind": "AR-vind", "Linde": "LIN-deh", "Borde": "BOR-day"}

carpeta = Path(sys.argv[1]).resolve() / "voz"
solo = set(int(x) for x in sys.argv[2:])
k = Kokoro(str(MOD / "kokoro-v1.0.onnx"), str(MOD / "voices-v1.0.bin"))

frases, seccion = [], None
for l in (carpeta / "guion.txt").read_text(encoding="utf-8").splitlines():
    l = l.strip()
    if l.startswith("##"):
        seccion = l[2:].strip()
    elif l:
        m = re.match(r"\[(\w+):([\w-]+)\]\s*(.*)", l)
        voz, idioma, texto = (m.groups() if m else (VOZ, IDIOMA, l))
        frases.append({"sec": seccion, "texto": texto, "voz": voz, "idioma": idioma})

t0 = time.time()
for i, f in enumerate(frases):
    if LISTA is not None and i not in LISTA:
        continue
    if PARTE and i % int(PARTE.split("/")[1]) != int(PARTE.split("/")[0]):
        continue
    wav = carpeta / f"s{i:03d}.wav"
    if i not in solo and wav.exists():  # retoma: lo ya generado no se rehace
        f["dur"] = round(sf.info(wav).duration, 6); continue
    dicho = f["texto"]
    for real, fon in PRON.items():
        dicho = dicho.replace(real, fon)
    audio, sr = k.create(dicho, voice=f["voz"], speed=VEL, lang=f["idioma"])
    sf.write(wav, audio, sr)
    f["dur"] = round(len(audio) / sr, 6)
    print(i, f["dur"], f["texto"][:50], flush=True)
if PARTE or LISTA is not None:
    sys.exit(print("parte", PARTE, "lista en", round(time.time() - t0), "s"))
(carpeta / "voz.json").write_text(json.dumps(frases, indent=1, ensure_ascii=False), encoding="utf-8")
print("total voz", round(sum(f["dur"] for f in frases), 1), "s en", round(time.time() - t0), "s")
