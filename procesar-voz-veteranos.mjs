/**
 * Deja las tomas de voz listas para montar: sin silencio a los costados, con las pausas internas
 * largas acortadas y a una velocidad de conversación normal (objetivo 15,5 caracteres por segundo
 * de habla; Javier: "no puede ser lenta"). Escribe en public/voz-veteranos-rc-final/ y no toca las originales.
 *
 * Uso: node procesar-voz-elite.mjs
 */
import fs from "fs";
import { execFileSync, spawnSync } from "child_process";

const ORIGEN = "public/voz-veteranos-rc";
const DESTINO = "public/voz-veteranos-rc-final";
const OBJETIVO = 15.5; // caracteres por segundo
const MAX_TEMPO = 1.3;
const guion = JSON.parse(fs.readFileSync("guion-veteranos-rc.json", "utf8"));
fs.mkdirSync(DESTINO, { recursive: true });

const duracion = (f) =>
  parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f]).toString().trim());

// Sin silencio al principio; pausas de 0,22 s o más se dejan en 0,16 s; 0,06 s de aire al final
const LIMPIEZA =
  "silenceremove=start_periods=1:start_threshold=-44dB:start_silence=0.03:stop_periods=-1:stop_threshold=-44dB:stop_duration=0.22:stop_silence=0.16";

console.log("toma          chars  original(s)  limpia(s)  c/s antes  c/s limpia  tempo  c/s final");
for (const s of guion.segmentos) {
  const entrada = `${ORIGEN}/${s.id}.mp3`;
  const tmp = `${DESTINO}/_${s.id}.wav`;
  spawnSync("ffmpeg", ["-y", "-v", "error", "-i", entrada, "-af", LIMPIEZA, tmp]);
  const n = s.texto.length;
  const orig = duracion(entrada);
  const limpia = duracion(tmp);
  const cps = n / limpia;
  const tempo = cps < OBJETIVO - 0.4 ? Math.min(MAX_TEMPO, OBJETIVO / cps) : cps > 18.5 ? Math.max(0.88, 18 / cps) : 1;
  const filtro = Math.abs(tempo - 1) > 0.005 ? `atempo=${tempo.toFixed(4)},apad=pad_dur=0.06` : "apad=pad_dur=0.06";
  spawnSync("ffmpeg", ["-y", "-v", "error", "-i", tmp, "-af", filtro, "-c:a", "libmp3lame", "-q:a", "2", `${DESTINO}/${s.id}.mp3`]);
  fs.unlinkSync(tmp);
  const final = duracion(`${DESTINO}/${s.id}.mp3`);
  console.log(
    `${s.id.padEnd(12)} ${String(n).padStart(5)}  ${orig.toFixed(2).padStart(10)}  ${limpia.toFixed(2).padStart(9)}  ${(n / (orig - 0.35)).toFixed(1).padStart(9)}  ${cps.toFixed(1).padStart(10)}  ${tempo.toFixed(2).padStart(5)}  ${(n / final).toFixed(1).padStart(8)}`,
  );
}
