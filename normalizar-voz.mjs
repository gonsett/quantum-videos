/**
 * Lleva todos los segmentos de locución a la MISMA velocidad de habla.
 *
 * Reemplaza a acelerar-voz.sh, que aplicaba un factor único a todos. Ese
 * enfoque tiene un defecto que sólo se oye montado: el TTS no devuelve una
 * velocidad pareja. Medido sobre este guion, la dispersión entre el
 * segmento más lento y el más rápido era del 42%. Multiplicar todo por 1.5
 * no la corrige, la arrastra — y como el oyente calibra su expectativa con
 * la primera frase, si justo esa era la más rápida el video entero arranca
 * sonando atropellado.
 *
 * Acá se mide cuánto habla cada segmento (descontando el silencio de las
 * puntas), se calcula su velocidad real en palabras por segundo, y se le
 * pone a cada uno el `atempo` que lo lleva al objetivo. `atempo` estira el
 * tiempo sin tocar la altura, así que la voz suena más ágil y no más aguda.
 *
 * Las palabras son una aproximación cruda de la carga fonética —lo correcto
 * serían sílabas— pero alcanza de sobra para emparejar segmentos del mismo
 * idioma y del mismo locutor.
 *
 * Corre sobre la toma SECA (lo que devuelve el TTS), antes de procesar-voz.sh.
 * La cadena de broadcast agrega eco y compresion que levantan el piso de
 * ruido: sobre audio ya procesado el silencio deja de ser silencio y el
 * recorte de pausas no lo agarra. Primero se edita, despues se procesa.
 *
 * Uso:
 *   node normalizar-voz.mjs guion.json public/voz-X public/voz-X-edit 3.4
 *   bash procesar-voz.sh public/voz-X-edit public/voz-X-final
 */
import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const [, , archivoGuion, origen, destino, objetivoArg] = process.argv;
if (!archivoGuion || !origen || !destino) {
  console.error(
    "Uso: node normalizar-voz.mjs <guion.json> <origen> <destino> [palabras/seg]",
  );
  process.exit(1);
}

/** Palabras por segundo de ARTICULACION (sin contar pausas) al que queda todo. */
const OBJETIVO = Number(objetivoArg || 3.1);

/** Pausa interna maxima, en segundos (6to argumento). Las mas largas se recortan a esto. */
const PAUSA = Number(process.argv[6] ?? 0.42);

/** Límites del estiramiento. Más allá de 1.8 atempo empieza a sonar raro. */
const MIN = 1.0;
const MAX = 1.75;

const guion = JSON.parse(fs.readFileSync(archivoGuion, "utf8"));
fs.mkdirSync(destino, { recursive: true });

const duracion = (archivo) =>
  parseFloat(
    execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=nw=1:nk=1",
      archivo,
    ]).toString().trim(),
  );

/**
 * Segundos de ARTICULACION: la duracion menos todo el silencio, incluido el
 * de adentro de la frase.
 *
 * Descontar solo las puntas no alcanza. Una frase como "Gratis. Sin tarjeta.
 * Sin vueltas." tiene pausas deliberadas entre puntos, y si se cuentan como
 * habla el segmento parece lento y se lo acelera al maximo — justo los
 * remates, que son los que mas necesitan aire. Midiendo solo articulacion,
 * las pausas se respetan y lo que se empareja es la velocidad real de decir.
 */
const habla = (archivo) => {
  const total = duracion(archivo);
  let log = "";
  try {
    execFileSync("ffmpeg", [
      "-v", "info", "-i", archivo,
      "-af", "silencedetect=n=-40dB:d=0.2",
      "-f", "null", "-",
    ], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (e) {
    log = (e.stderr || "").toString();
  }
  // ffmpeg escribe el log en stderr aun cuando termina bien
  if (!log) {
    const r = spawnSync("ffmpeg", [
      "-v", "info", "-i", archivo,
      "-af", "silencedetect=n=-40dB:d=0.2",
      "-f", "null", "-",
    ], { encoding: "utf8" });
    log = r.stderr || "";
  }
  const silencio = [...log.matchAll(/silence_duration: ([\d.]+)/g)]
    .reduce((acc, m) => acc + Number(m[1]), 0);
  return { total, habla: Math.max(total - silencio, 0.1) };
};

/**
 * Devuelve los tramos de audio a conservar, con cada silencio largo recortado.
 *
 * - Cabeza: se corta hasta 60 ms antes de la primera palabra.
 * - Pausas internas mas largas que `pausaMax`: quedan en `pausaMax`, mitad
 *   pegada a la palabra anterior y mitad a la siguiente, para no comerse ni
 *   la caida de una ni el ataque de la otra.
 * - Cola: se corta 150 ms despues de la ultima palabra. El aire despues del
 *   remate lo pone el montaje, no la toma.
 */
const tramosConPausasRecortadas = (archivo, pausaMax, umbral = -45) => {
  const total = duracion(archivo);
  const r = spawnSync("ffmpeg", [
    "-v", "info", "-i", archivo,
    "-af", `silencedetect=n=${umbral}dB:d=0.15`,
    "-f", "null", "-",
  ], { encoding: "utf8" });
  const log = r.stderr || "";

  const inicios = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const finales = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  // Un silencio que llega al final del archivo no trae silence_end
  const silencios = inicios.map((ini, k) => ({ ini, fin: finales[k] ?? total }));

  const tramos = [];
  let cursor = 0;

  for (const sil of silencios) {
    const esCabeza = sil.ini <= 0.02;
    const esCola = sil.fin >= total - 0.02;

    if (esCabeza) {
      cursor = Math.max(0, sil.fin - 0.06);
      continue;
    }
    if (esCola) {
      tramos.push([cursor, Math.min(total, sil.ini + 0.15)]);
      cursor = null;
      break;
    }
    if (sil.fin - sil.ini > pausaMax) {
      tramos.push([cursor, sil.ini + pausaMax / 2]);
      cursor = sil.fin - pausaMax / 2;
    }
  }
  if (cursor !== null) tramos.push([cursor, total]);

  return tramos.filter(([a, b]) => b - a > 0.01);
};

console.log(
  "%s %s %s %s %s",
  "id".padEnd(16), "pal/seg".padStart(8), "atempo".padStart(8),
  "antes".padStart(8), "queda".padStart(8),
);

let suma = 0;
for (const seg of guion.segmentos) {
  const entrada = path.join(origen, `${seg.id}.mp3`);
  if (!fs.existsSync(entrada)) {
    console.log(`${seg.id.padEnd(16)} FALTA`);
    continue;
  }

  const { habla: hab } = habla(entrada);
  const palabras = seg.texto.split(/\s+/).filter(Boolean).length;
  const velocidad = palabras / hab;

  // Un segmento puede pedir su propio ritmo en el guion (`ritmo`): el gancho
  // y los remates necesitan aire, la demostracion del producto necesita pulso.
  const objetivo = Number(seg.ritmo ?? OBJETIVO);
  const factor = Math.min(MAX, Math.max(MIN, objetivo / velocidad));
  const salida = path.join(destino, `${seg.id}.mp3`);

  // Primero se acortan las pausas largas, despues se ajusta la velocidad.
  // El TTS mete silencios de casi un segundo en cada coma y arranca cada
  // frase con 0.7 s de nada; un locutor real pausa 0.3-0.5 s. Recortarlas
  // saca el arrastre sin apurar el habla, que es lo que la hace sonar humana.
  //
  // Se hace cortando tramos exactos y no con `silenceremove`: en ffmpeg 8 ese
  // filtro se reescribio y ya no respeta el tope de silencio que se le pide.
  // Medir cada pausa y cortar a mano es determinista.
  const pausaMax = Number(seg.pausa ?? PAUSA);
  // `umbral` en el guion: algunas tomas rellenan la pausa con respiración que
  // queda por encima de -45 dB y el recorte no la ve como silencio.
  const tramos = tramosConPausasRecortadas(entrada, pausaMax, Number(seg.umbral ?? -45));

  const partes = tramos.map(
    ([a, b], k) => `[0:a]atrim=start=${a.toFixed(3)}:end=${b.toFixed(3)},asetpts=PTS-STARTPTS[p${k}]`,
  );
  const unir = `${tramos.map((_, k) => `[p${k}]`).join("")}concat=n=${tramos.length}:v=0:a=1[c]`;
  const grafo = [...partes, unir, `[c]atempo=${factor.toFixed(4)}[out]`].join(";");

  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", entrada,
    "-filter_complex", grafo,
    "-map", "[out]",
    "-c:a", "libmp3lame", "-b:a", "192k",
    salida,
  ]);

  const queda = duracion(salida);
  suma += queda;
  console.log(
    "%s %s %s %s %s",
    seg.id.padEnd(16),
    velocidad.toFixed(2).padStart(8),
    factor.toFixed(3).padStart(8),
    `${hab.toFixed(2)}s`.padStart(8),
    `${queda.toFixed(2)}s`.padStart(8),
  );
}

console.log(
  `\nObjetivo ${OBJETIVO} pal/seg para todos · locución total ${suma.toFixed(2)}s`,
);
