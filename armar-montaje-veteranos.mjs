/**
 * Arma montaje-veteranos-rc.json para que CADA escena arranque en un beat.
 *
 * La música va a 120 BPM y a 30 fps un beat dura 15 cuadros exactos. Como cada escena es una toma
 * de voz, se le calcula la `cola` que falta para que su largo sea múltiplo de 15: así los cortes
 * caen en el compás. La última escena se estira además hasta completar un compás entero (60
 * cuadros) y deja un colchón para el golpe final.
 *
 * Uso: node armar-montaje-veteranos.mjs [carpeta-de-voz]   (por defecto public/voz-veteranos-rc-final)
 */
import fs from "fs";
import { execFileSync } from "child_process";

const BEAT = 15;
const COMPAS = 60;
const CPS = 15.5; // solo para el borrador cuando todavía no hay voz
const carpeta = process.argv[2] ?? "public/voz-veteranos-rc-final";
const guion = JSON.parse(fs.readFileSync("guion-veteranos-rc.json", "utf8"));

const duracion = (f) =>
  fs.existsSync(f)
    ? parseFloat(
        execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f]).toString().trim(),
      )
    : null;

const IDS = ["e1-gancho", "e2-hueso", "e3-ring", "e4-simple", "e5-trayectoria", "e6-cierre"];
let total = 0;
const estructura = guion.segmentos.map((s, i) => {
  const d = duracion(`${carpeta}/${s.id}.mp3`) ?? s.texto.length / CPS + 0.1;
  const entrada = i === 0 ? 3 : 4;
  const cuadros = Math.ceil(d * 30);
  const ultimo = i === guion.segmentos.length - 1;
  const minCola = ultimo ? 84 : 4;
  let largo = Math.ceil((entrada + cuadros + minCola) / BEAT) * BEAT;
  if (ultimo) largo = Math.ceil((total + largo) / COMPAS) * COMPAS - total;
  total += largo;
  return { id: IDS[i], voces: [s.id], entrada, cola: largo - entrada - cuadros };
});

const config = {
  _nota: "Video para closers de veteranos. Generado por armar-montaje-veteranos.mjs: cada escena arranca en un beat (múltiplos de 15 cuadros).",
  guion: "guion-veteranos-rc.json",
  voz: carpeta,
  salida: "timeline-veteranos-rc.json",
  fps: 30,
  estructura,
};
fs.writeFileSync("montaje-veteranos-rc.json", JSON.stringify(config, null, 2) + "\n");
console.log(estructura.map((e) => `${e.id.padEnd(12)} entrada ${e.entrada}  cola ${e.cola}`).join("\n"));
console.log(`total ${total} cuadros = ${(total / 30).toFixed(2)} s = ${total / COMPAS} compases`);
