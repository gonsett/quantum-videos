# -*- coding: utf-8 -*-
"""Genera la locucion segmento por segmento con edge-tts y mide cada duracion."""
import asyncio
import io
import json
import os
import subprocess

import edge_tts

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "public", "voz")


def duracion(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        capture_output=True, text=True,
    )
    return float(r.stdout.strip())


async def main():
    with io.open(os.path.join(AQUI, "guion.json"), encoding="utf-8") as f:
        guion = json.load(f)

    os.makedirs(SALIDA, exist_ok=True)
    resultado = []

    for seg in guion["segmentos"]:
        destino = os.path.join(SALIDA, seg["id"] + ".mp3")
        comm = edge_tts.Communicate(
            seg["texto"],
            guion["voz"],
            rate=guion["rate"],
            pitch=guion["pitch"],
        )
        await comm.save(destino)
        d = duracion(destino)
        resultado.append({"id": seg["id"], "segundos": round(d, 3)})
        print("%-16s %6.2f s  %s" % (seg["id"], d, seg["texto"][:52]))

    total = sum(r["segundos"] for r in resultado)
    print("\nTOTAL LOCUCION: %.2f s" % total)

    with io.open(os.path.join(AQUI, "duraciones-voz.json"), "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)


asyncio.run(main())
