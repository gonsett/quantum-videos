/**
 * Arma la banda sonora completa de un video fuera de Remotion.
 *
 * Remotion mezcla el audio al final del render, y en esta maquina esa etapa
 * se cae con varias pistas. Hacerlo con ffmpeg directamente es equivalente
 * y ademas deja el render mudo, que es mas rapido: no hay que extraer
 * muestras de audio en cada cuadro.
 *
 * Cada segmento de voz entra retrasado los milisegundos que le corresponden
 * segun el timeline, la cama va por debajo, y el conjunto se normaliza a
 * -14 LUFS, que es lo que piden las plataformas.
 *
 * Acepta dos formatos de timeline:
 *   - `escenas` con `voz` y `vozDelay` (una frase por escena: AutomLead)
 *   - `clips` con `voz` y `desde` en cuadros (varias por escena: Ring Closers)
 *
 * Con --duck la cama se agacha sola cuando habla la voz (sidechain). Hace
 * falta cuando la musica tiene golpes fuertes que taparian una palabra; una
 * cama pareja a volumen fijo no lo necesita.
 *
 * Uso:
 *   node mezclar-audio.mjs timeline.json voz-carpeta cama.wav salida.m4a [--cama=0.42] [--duck]
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const posicionales = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const banderas = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.slice(2).split("=");
      return [k, v ?? true];
    }),
);

const [archivoTimeline, carpetaVoz, camaNombre, salida] = posicionales;
if (!archivoTimeline || !carpetaVoz || !camaNombre || !salida) {
  console.error(
    "Uso: node mezclar-audio.mjs <timeline.json> <carpeta-voz> <cama.wav> <salida> [--cama=0.42] [--duck]",
  );
  process.exit(1);
}

/** Volumen de la cama por debajo de la voz. */
const VOL_CAMA = Number(banderas.cama ?? 0.42);
const DUCK = Boolean(banderas.duck);

const timeline = JSON.parse(fs.readFileSync(archivoTimeline, "utf8"));
const FPS = timeline.fps;

// Normaliza los dos formatos a una lista de { voz, ms }
let clips;
let totalCuadros;
if (Array.isArray(timeline.clips)) {
  clips = timeline.clips.map((c) => ({ voz: c.voz, ms: Math.round((c.desde / FPS) * 1000) }));
  totalCuadros = timeline.total;
} else {
  clips = [];
  let acumulado = 0;
  for (const e of timeline.escenas) {
    clips.push({ voz: e.voz, ms: Math.round(((acumulado + e.vozDelay) / FPS) * 1000) });
    acumulado += e.durationInFrames;
  }
  totalCuadros = acumulado;
}
const DUR = totalCuadros / FPS;

const entradas = ["-i", path.join("public", "audio", camaNombre)];
const filtros = [`[0:a]aresample=48000,volume=${VOL_CAMA}[cama0]`];
const voces = [];

clips.forEach((c, i) => {
  entradas.push("-i", path.join("public", carpetaVoz, `${c.voz}.mp3`));
  // adelay necesita un valor por canal; `all=1` lo aplica a todos
  filtros.push(`[${i + 1}:a]aresample=48000,adelay=${c.ms}:all=1[v${i}]`);
  voces.push(`[v${i}]`);
});

// apad: la pista de voces termina con la ultima palabra, y sidechaincompress
// corta su salida cuando se acaba la mas corta de sus dos entradas. Sin
// rellenar hasta el final, la musica se cortaba justo en la cola del video.
filtros.push(`${voces.join("")}amix=inputs=${voces.length}:normalize=0:dropout_transition=0,apad=whole_dur=${(DUR + 2).toFixed(3)}[voces]`);

if (DUCK) {
  // La voz entra dos veces: una para escucharse y otra como llave del compresor
  filtros.push(
    "[voces]asplit=2[vmix][vllave]",
    "[cama0][vllave]sidechaincompress=threshold=0.025:ratio=5:attack=12:release=380:makeup=1[cama]",
    "[cama][vmix]amix=inputs=2:normalize=0:dropout_transition=0[mix]",
  );
} else {
  filtros.push("[cama0][voces]amix=inputs=2:normalize=0:dropout_transition=0[mix]");
}

// --sfx=archivo.wav (en public/audio): capa de efectos que NO se agacha con la voz.
// Los golpes de un video con locutor tienen que sonar sobre la palabra, no
// esconderse detrás de ella como la cama.
let mezcla = "[mix]";
if (banderas.sfx) {
  const VOL_SFX = Number(banderas.sfxvol ?? 1);
  entradas.push("-i", path.join("public", "audio", banderas.sfx));
  filtros.push(`[${clips.length + 1}:a]aresample=48000,volume=${VOL_SFX}[sfx0]`);
  filtros.push("[mix][sfx0]amix=inputs=2:normalize=0:dropout_transition=0[mixs]");
  mezcla = "[mixs]";
}

// --limiter: deja margen de pico antes del AAC (Instagram recomprime).
// --fade=S: fundido de salida de S segundos, para que la cola de una campana
// o de una reverb no se corte de golpe.
const LIM = banderas.limiter === true ? 0.84 : Number(banderas.limiter);
const LIMITADOR = banderas.limiter ? `,alimiter=limit=${LIM}:level=0` : "";
const FADE = banderas.fade ? `,afade=t=out:st=${(DUR - Number(banderas.fade)).toFixed(3)}:d=${Number(banderas.fade)}` : "";
filtros.push(`${mezcla}loudnorm=I=-14:TP=-1.5:LRA=11${LIMITADOR}${FADE},atrim=0:${DUR.toFixed(3)}[out]`);

// --stems: ademas de la mezcla, deja la cama ya agachada y la voz sola, para
// medir cuanto queda la musica por debajo de la voz sin tener que escucharla
const STEMS = Boolean(banderas.stems);
if (STEMS && DUCK) {
  filtros[filtros.findIndex((f) => f.startsWith("[voces]asplit"))] = "[voces]asplit=3[vmix][vllave][vstem]";
  filtros[filtros.findIndex((f) => f.includes("sidechaincompress"))] =
    "[cama0][vllave]sidechaincompress=threshold=0.025:ratio=5:attack=12:release=380:makeup=1,asplit=2[cama][camastem]";
}

execFileSync(
  "ffmpeg",
  [
    "-y", "-v", "error",
    ...entradas,
    "-filter_complex", filtros.join(";"),
    "-map", "[out]",
    "-c:a", "aac", "-b:a", "192k",
    salida,
    ...(STEMS && DUCK
      ? ["-map", "[camastem]", "-c:a", "pcm_s16le", salida.replace(/\.[^.]+$/, "-cama.wav"),
         "-map", "[vstem]", "-c:a", "pcm_s16le", salida.replace(/\.[^.]+$/, "-voz.wav")]
      : []),
  ],
  { stdio: "inherit" },
);

console.log(
  `${salida}: ${DUR.toFixed(2)}s · ${clips.length} voces + cama (vol ${VOL_CAMA}${DUCK ? ", con sidechain" : ""})`,
);
