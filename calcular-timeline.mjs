/**
 * Recalcula las duraciones de un timeline a partir de la locución ya acelerada.
 *
 * Cada escena tiene que durar lo que dura su audio más el aire de entrada
 * (vozDelay) más una cola para que la última palabra no quede pegada al
 * corte. Hacerlo a ojo es lo que produce escenas que se sienten apuradas
 * o muertas; medirlo es gratis.
 *
 * Uso:
 *   node calcular-timeline.mjs timeline-demora.json public/voz-demora-14x
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const [, , archivoTimeline, carpetaVoz] = process.argv;
if (!archivoTimeline || !carpetaVoz) {
  console.error("Uso: node calcular-timeline.mjs <timeline.json> <carpeta-voz>");
  process.exit(1);
}

/** Cola después de la última palabra, en cuadros. Corta = mas nervio. */
const COLA = 12;

const timeline = JSON.parse(fs.readFileSync(archivoTimeline, "utf8"));
const FPS = timeline.fps;

const duracion = (archivo) =>
  parseFloat(
    execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=nw=1:nk=1",
      archivo,
    ]).toString().trim(),
  );

let total = 0;
for (const e of timeline.escenas) {
  const seg = duracion(path.join(carpetaVoz, `${e.voz}.mp3`));
  const cuadros = Math.ceil(seg * FPS) + e.vozDelay + COLA;
  e.durationInFrames = cuadros;
  e._voz_seg = Number(seg.toFixed(2));
  total += cuadros;
  console.log(`${e.id.padEnd(12)} ${seg.toFixed(2)}s → ${cuadros} cuadros`);
}

fs.writeFileSync(archivoTimeline, JSON.stringify(timeline, null, 2) + "\n");
console.log(`\nTotal: ${total} cuadros · ${(total / FPS).toFixed(2)}s`);
