# -*- coding: utf-8 -*-
"""
Control de calidad de un video sin poder escucharlo ni verlo en movimiento.

Codifica lo que se hizo a mano con "Secreto de closer #1". Ver la habilidad
`video-cinematico-ring-closers`.

Uso:
    python qa-video.py out/secreto-rc/Secreto1-RingClosers-9x16-Voz.mp4
    python qa-video.py video.mp4 --frames 12,100,252,433,606 --marcas cada=8.1,defendelo=23.6
    python qa-video.py video.mp4 --out out/qa/secreto1

Genera en la carpeta de salida (por defecto out/qa/<nombre>):
  hoja-1.png, hoja-2.png   cuadros EXACTOS (por número de cuadro) en hojas de contacto
  espectro.png             onda + espectrograma con una línea cada 2 s y las marcas dadas
y imprime LUFS, pico, saturación y silencios, con avisos.

Por qué cuadros por número y no por segundo: `ffmpeg -ss` sobre un mp4 armado con
`-c copy` a veces devuelve un cuadro en negro que no existe en el video (falsa alarma).
`select=eq(n,N)` no tiene ese problema.
"""
import argparse
import glob
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw


def correr(args, **kw):
    return subprocess.run(args, capture_output=True, text=True, errors="ignore", **kw)


def sonda(video):
    d = correr(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                "stream=width,height,r_frame_rate,nb_frames:format=duration", "-of", "default=nw=1", video]).stdout
    v = dict(l.split("=", 1) for l in d.strip().splitlines() if "=" in l)
    num, den = v["r_frame_rate"].split("/")
    return int(v["width"]), int(v["height"]), float(num) / float(den), float(v["duration"])


def hojas(video, frames, salida, w, h):
    tmp = os.path.join(salida, "_cuadros")
    os.makedirs(tmp, exist_ok=True)
    for f in glob.glob(os.path.join(tmp, "*.png")):
        os.remove(f)
    sel = "+".join("eq(n\\,%d)" % i for i in frames)
    r = correr(["ffmpeg", "-y", "-v", "error", "-i", video, "-vf", "select='%s'" % sel, "-vsync", "0",
                os.path.join(tmp, "f_%03d.png")])
    if r.returncode:
        print("ffmpeg no pudo extraer los cuadros:", r.stderr[:200])
        return
    archivos = sorted(glob.glob(os.path.join(tmp, "f_*.png")))
    tw = 300
    th = int(tw * h / w)
    cols, por_hoja = 5, 10
    for k in range(0, len(archivos), por_hoja):
        sub = archivos[k:k + por_hoja]
        filas = (len(sub) + cols - 1) // cols
        hoja = Image.new("RGB", (tw * cols, th * filas))
        d = ImageDraw.Draw(hoja)
        for j, f in enumerate(sub):
            x, y = (j % cols) * tw, (j // cols) * th
            hoja.paste(Image.open(f).resize((tw, th)), (x, y))
            d.text((x + 6, y + 6), "n=%d" % frames[k + j], fill=(52, 211, 153))
        nombre = os.path.join(salida, "hoja-%d.png" % (k // por_hoja + 1))
        hoja.save(nombre)
        print("hoja de contacto:", nombre)


def espectro(video, salida, duracion, marcas):
    ondan, espn = os.path.join(salida, "_onda.png"), os.path.join(salida, "_esp.png")
    correr(["ffmpeg", "-y", "-v", "error", "-i", video, "-lavfi",
            "showwavespic=s=1800x220:split_channels=0:colors=0x34d399", ondan])
    correr(["ffmpeg", "-y", "-v", "error", "-i", video, "-lavfi",
            "showspectrumpic=s=1800x640:scale=log:fscale=log:legend=0:color=intensity:gain=2", espn])
    onda, esp = Image.open(ondan), Image.open(espn)
    W = onda.width
    im = Image.new("RGB", (W, onda.height + esp.height + 60), (11, 11, 13))
    im.paste(onda, (0, 30))
    im.paste(esp, (0, onda.height + 50))
    d = ImageDraw.Draw(im)
    for s in range(0, int(duracion) + 1, 2):
        x = int(s / duracion * W)
        d.line([(x, 0), (x, im.height)], fill=(60, 60, 66))
        d.text((x + 3, 4), "%ds" % s, fill=(200, 200, 205))
    for nombre, t in marcas.items():
        x = int(t / duracion * W)
        d.line([(x, 0), (x, im.height)], fill=(16, 185, 129), width=2)
        d.text((x + 4, im.height - 18), nombre, fill=(52, 211, 153))
    destino = os.path.join(salida, "espectro.png")
    im.save(destino)
    for f in (ondan, espn):
        os.remove(f)
    print("espectrograma:", destino)


def medir(video):
    e = correr(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    integ = re.findall(r"I:\s+(-?[\d.]+) LUFS", e)
    lra = re.findall(r"LRA:\s+(-?[\d.]+) LU", e)
    pico = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)
    a = correr(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-af", "astats=metadata=0", "-f", "null", "-"]).stderr
    plano = [float(x) for x in re.findall(r"Flat factor: ([\d.]+)", a)]
    s = correr(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-af", "silencedetect=n=-50dB:d=0.25",
                "-f", "null", "-"]).stderr
    silencios = re.findall(r"silence_start: ([\d.]+)", s)
    print("\nAUDIO")
    avisos = []
    if integ:
        L = float(integ[-1])
        print("  volumen integrado : %.1f LUFS (objetivo -14; aceptable -16 a -13)" % L)
        if not -16.5 <= L <= -12.5:
            avisos.append("volumen fuera de rango")
    if lra:
        print("  rango dinámico    : %s LU" % lra[-1])
    if pico:
        p = float(pico[-1])
        print("  pico              : %.1f dBFS (Instagram recomprime: dejar <= -1.0)" % p)
        if p > -0.9:
            avisos.append("pico sin margen: usar --limiter en mezclar-audio.mjs")
    if plano:
        print("  saturación (flat) : %s" % max(plano))
        if max(plano) > 0:
            avisos.append("hay saturación")
    print("  silencios > 0,25 s: %s" % (", ".join(silencios) + " s" if silencios else "ninguno"))
    for a_ in avisos:
        print("  AVISO:", a_)


def main():
    ap = argparse.ArgumentParser(description="QA de un video sin escucharlo")
    ap.add_argument("video")
    ap.add_argument("--frames", help="cuadros a mirar, separados por coma (por defecto 20 repartidos)")
    ap.add_argument("--marcas", default="", help="eventos para el espectrograma: nombre=segundo,nombre=segundo")
    ap.add_argument("--out", help="carpeta de salida")
    a = ap.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    w, h, fps, dur = sonda(a.video)
    total = int(round(dur * fps))
    frames = [int(x) for x in a.frames.split(",")] if a.frames else \
        [int(total * (i + 0.5) / 20) for i in range(20)]
    marcas = {}
    for par in filter(None, a.marcas.split(",")):
        n, t = par.split("=")
        marcas[n] = float(t)
    salida = a.out or os.path.join("out", "qa", os.path.splitext(os.path.basename(a.video))[0])
    os.makedirs(salida, exist_ok=True)
    print("%s: %dx%d, %.2f fps, %.2f s (%d cuadros)" % (a.video, w, h, fps, dur, total))

    hojas(a.video, frames, salida, w, h)
    espectro(a.video, salida, dur, marcas)
    medir(a.video)
    print("\nRecordá: esto no reemplaza escuchar el timbre. Ver la lista de control en la habilidad.")


if __name__ == "__main__":
    main()
