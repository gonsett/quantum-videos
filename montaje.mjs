/**
 * Montaje del comercial de Ring Closers.
 *
 * A diferencia de los videos anteriores (una frase por escena), acá una
 * escena lleva varias frases y la imagen tiene que caer sobre palabras
 * puntuales: la fila "por encima" se ilumina cuando la voz dice "por
 * encima", el cinturón cambia cuando dice "subís de rango". Para eso este
 * script estima en qué cuadro empieza cada palabra.
 *
 * Cómo lo estima: mide los tramos de habla de cada toma (todo lo que no es
 * silencio), los pega en una línea continua y reparte las palabras sobre
 * esa línea en proporción a su largo en letras. Después devuelve cada
 * posición a tiempo real, así que una palabra que viene después de una
 * pausa cae después de la pausa. Letras es una aproximación de sílabas;
 * con un solo locutor y frases cortas, el error queda en uno o dos cuadros.
 *
 * Escribe el timeline que leen la composición, la música y el mezclador.
 * Una sola fuente de verdad para los tres.
 *
 * La estructura del corte (qué frases van en qué escena y cuánto aire lleva
 * cada una) vive en un JSON aparte, así el comercial y el Reel comparten
 * este mismo código.
 *
 * Uso:
 *   node montaje.mjs montaje-ringclosers.json
 *   node montaje.mjs montaje-reel-rc.json
 */
import { execFileSync, spawnSync } from "child_process";
import fs from "fs";

const archivoConfig = process.argv[2];
if (!archivoConfig) {
  console.error("Uso: node montaje.mjs <config.json> [--estimar]");
  process.exit(1);
}

/**
 * `--estimar`: arma el timeline SIN voz, calculando cuánto dura cada toma por
 * su largo en letras (calibrado con Charon: ~0,115 s por carácter + 0,35 s).
 * Sirve para armar y mostrar la imagen antes de gastar cuota de voz. El JSON
 * queda marcado con `_borrador: true` y hay que rehacerlo con las tomas reales.
 */
const ESTIMAR = process.argv.includes("--estimar");
const estimarToma = (texto) => {
  const total = 0.35 + texto.length * 0.115;
  return { total, tramos: [[0.12, total - 0.12]] };
};
const config = JSON.parse(fs.readFileSync(archivoConfig, "utf8"));
const FPS = config.fps ?? 30;
const CARPETA = config.voz;
const guion = JSON.parse(fs.readFileSync(config.guion, "utf8"));
const textos = Object.fromEntries(guion.segmentos.map((s) => [s.id, s.texto]));

/**
 * Estructura del corte, desde la config. `entrada`: aire antes de la primera
 * frase. `entre`: aire entre frases de la misma escena. `cola`: aire después
 * de la última — ahí viven las pausas dramáticas.
 */
const ESTRUCTURA = config.estructura;

const duracion = (archivo) =>
  parseFloat(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=nw=1:nk=1", archivo,
    ]).toString().trim(),
  );

/** Tramos de habla [inicio, fin] en segundos. */
const tramosDeHabla = (archivo) => {
  const total = duracion(archivo);
  const log = spawnSync("ffmpeg", [
    "-v", "info", "-i", archivo,
    "-af", "silencedetect=n=-38dB:d=0.16",
    "-f", "null", "-",
  ], { encoding: "utf8" }).stderr || "";
  const ini = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const fin = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);

  const tramos = [];
  let cursor = 0;
  ini.forEach((s, k) => {
    if (s - cursor > 0.04) tramos.push([cursor, s]);
    cursor = fin[k] ?? total;
  });
  if (total - cursor > 0.04) tramos.push([cursor, total]);
  return { total, tramos };
};

/** Segundo en que empieza cada palabra, repartiendo por letras sobre el habla. */
const tiemposDePalabras = (texto, tramos) => {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const pesos = palabras.map((p) => p.replace(/[^\p{L}\p{N}]/gu, "").length || 1);
  const totalPeso = pesos.reduce((a, b) => a + b, 0);
  const totalHabla = tramos.reduce((a, [s, e]) => a + (e - s), 0);

  // Posición sobre la línea de habla continua -> tiempo real
  const aReal = (x) => {
    let acum = 0;
    for (const [s, e] of tramos) {
      const largo = e - s;
      if (x <= acum + largo) return s + (x - acum);
      acum += largo;
    }
    return tramos.length ? tramos[tramos.length - 1][1] : 0;
  };

  let acum = 0;
  return palabras.map((p, k) => {
    const t = aReal((acum / totalPeso) * totalHabla);
    acum += pesos[k];
    return { palabra: p, t };
  });
};


// ── Tiempos reales por palabra: Whisper de Cloudflare Workers AI ───────────
//
// El reparto por letras de arriba anda con frases cortas, pero con tomas largas
// y pausas de locutor se corre hasta medio segundo (medido en "Qué es Ring
// Closers", 18/09/2026: "perdés" 0,57 s antes de lo real). Con `"tiempos":
// "whisper"` en la config (o --whisper) cada toma se transcribe con marcas de
// tiempo por palabra, se alinea contra el guion y las palabras que no se
// reconocen se reparten por letras entre sus vecinas. La respuesta se guarda en
// cache-palabras/ para no gastar cuota ni cambiar los tiempos al re-correr.
const WHISPER = config.tiempos === "whisper" || process.argv.includes("--whisper");
const leerEnv = (nombre) => {
  const linea = fs.readFileSync(".env", "utf8").split(/\r?\n/).find((l) => l.startsWith(nombre + "="));
  return linea ? linea.slice(nombre.length + 1).trim() : "";
};
const normal = (x) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

const palabrasWhisper = async (archivo, voz) => {
  const carpeta = `cache-palabras/${CARPETA.split("/").pop()}`;
  const cache = `${carpeta}/${voz}.json`;
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, "utf8"));
  const cuenta = leerEnv("CF_ACCOUNT_ID");
  const token = leerEnv("CF_API_TOKEN");
  if (!cuenta || !token) throw new Error("Faltan CF_ACCOUNT_ID / CF_API_TOKEN en .env");
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cuenta}/ai/run/@cf/openai/whisper-large-v3-turbo`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ audio: fs.readFileSync(archivo).toString("base64"), language: "es" }),
  });
  if (!r.ok) throw new Error(`Whisper HTTP ${r.status} para ${archivo}`);
  const j = await r.json();
  const palabras = (j.result?.segments ?? []).flatMap((sg) =>
    (sg.words ?? []).map((w) => ({ palabra: w.word.trim(), t: w.start, fin: w.end })),
  );
  if (!palabras.length) throw new Error(`Whisper no devolvió palabras para ${archivo}`);
  fs.mkdirSync(carpeta, { recursive: true });
  fs.writeFileSync(cache, JSON.stringify(palabras, null, 1) + "\n");
  return palabras;
};

/**
 * Whisper marca el inicio de una palabra donde termina la anterior, así que la
 * primera palabra después de una pausa sale ADELANTADA por lo que dura la pausa
 * (medido en "Qué es Ring Closers": "Un" 0,7 s antes de lo real, "perdés" 0,4 s).
 * Se corrige con la acústica: el habla se parte en segmentos por las pausas de
 * 150 ms o más, cada palabra se asigna al segmento con el que más se solapa, y la
 * PRIMERA palabra de cada segmento arranca en el instante real en que vuelve el
 * habla. Las demás (dentro de un tramo continuo) conservan la marca de Whisper.
 */
const segmentosDeHabla = (archivo) => {
  const total = duracion(archivo);
  const log = spawnSync("ffmpeg", ["-v", "info", "-i", archivo, "-af", "silencedetect=n=-35dB:d=0.15", "-f", "null", "-"], {
    encoding: "utf8",
  }).stderr || "";
  const ini = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const fin = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const segs = [];
  let cursor = 0;
  ini.forEach((si, k) => {
    if (si - cursor > 0.05) segs.push([cursor, si]);
    cursor = fin[k] ?? total;
  });
  if (total - cursor > 0.05) segs.push([cursor, total]);
  return segs;
};

const refinarInicios = (wh, segs) => {
  const solape = (w, [a, b]) => Math.max(0, Math.min(w.fin, b) - Math.max(w.t, a));
  const asignado = wh.map((w) => {
    let mejor = -1;
    let max = 0;
    segs.forEach((sg, j) => {
      const o = solape(w, sg);
      if (o > max) {
        max = o;
        mejor = j;
      }
    });
    return mejor;
  });
  return wh.map((w, k) => {
    const j = asignado[k];
    if (j < 0 || asignado.indexOf(j) !== k) return w; // sin segmento, o no es la primera del segmento
    const onset = segs[j][0];
    return w.t - onset > 0.25 ? w : { ...w, t: onset };
  });
};

const parecido = (a, b) => {
  // 1 - distancia de Levenshtein normalizada
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[a.length][b.length] / Math.max(a.length, b.length, 1);
};

/** Alinea las palabras del guion con las que oyó Whisper (Needleman-Wunsch). Devuelve, por palabra del guion, el índice en Whisper o -1. */
const alinear = (pg, pw) => {
  const n = pg.length;
  const m = pw.length;
  const puntaje = (i, j) => (!pg[i] || !pw[j] ? -1 : pg[i] === pw[j] ? 2 : parecido(pg[i], pw[j]) >= 0.75 ? 1 : -1);
  const F = Array.from({ length: n + 1 }, (_, i) => [-i, ...Array(m).fill(0)]);
  for (let j = 1; j <= m; j++) F[0][j] = -j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      F[i][j] = Math.max(F[i - 1][j - 1] + puntaje(i - 1, j - 1), F[i - 1][j] - 1, F[i][j - 1] - 1);
  const par = Array(n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (F[i][j] === F[i - 1][j - 1] + puntaje(i - 1, j - 1)) {
      if (puntaje(i - 1, j - 1) > 0) par[i - 1] = j - 1;
      i--;
      j--;
    } else if (F[i][j] === F[i - 1][j] - 1) i--;
    else j--;
  }
  return par;
};

/** Segundo en que empieza cada palabra del guion, según Whisper; los huecos se reparten por letras. */
const tiemposWhisper = (texto, wh, tramos) => {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const pg = palabras.map(normal);
  const par = alinear(pg, wh.map((w) => normal(w.palabra)));
  const pesos = palabras.map((p) => p.replace(/[^\p{L}\p{N}]/gu, "").length || 1);
  const t = par.map((j) => (j >= 0 ? wh[j].t : null));
  if (t[0] !== null && tramos.length) t[0] = Math.max(t[0], tramos[0][0]); // no antes de que suene algo

  const inicio = tramos.length ? tramos[0][0] : 0;
  const fin = tramos.length ? tramos[tramos.length - 1][1] : wh[wh.length - 1].fin;
  let k = 0;
  while (k < t.length) {
    if (t[k] !== null) {
      k++;
      continue;
    }
    let f = k;
    while (f < t.length && t[f] === null) f++;
    const ta = k > 0 ? t[k - 1] : inicio;
    const tb = f < t.length ? t[f] : fin;
    const total = pesos.slice(k, f).reduce((a, b) => a + b, 0) + (k > 0 ? pesos[k - 1] : 0);
    let acum = k > 0 ? pesos[k - 1] : 0;
    for (let q = k; q < f; q++) {
      t[q] = ta + ((tb - ta) * acum) / (total || 1);
      acum += pesos[q];
    }
    k = f;
  }
  for (let q = 1; q < t.length; q++) t[q] = Math.max(t[q], t[q - 1]);
  return palabras.map((p, q) => ({ palabra: p, t: t[q], oida: par[q] >= 0 }));
};

const escenas = [];
const clips = [];
let cursorGlobal = 0;

for (const e of ESTRUCTURA) {
  let local = e.entrada;
  const clipsEscena = [];

  for (const [k, voz] of e.voces.entries()) {
    if (k > 0) local += e.entre ?? 0;
    const archivo = `${CARPETA}/${voz}.mp3`;
    const { total, tramos } = ESTIMAR ? estimarToma(textos[voz]) : tramosDeHabla(archivo);
    const cuadros = Math.ceil(total * FPS);

    let tiempos;
    if (WHISPER && !ESTIMAR) {
      const porLetras = tiemposDePalabras(textos[voz], tramos);
      tiempos = tiemposWhisper(textos[voz], refinarInicios(await palabrasWhisper(archivo, voz), segmentosDeHabla(archivo)), tramos);
      const sinOir = tiempos.filter((w) => !w.oida).length;
      const maxDif = Math.max(...tiempos.map((w, q) => Math.abs(w.t - porLetras[q].t)));
      console.log(`   [${voz}] Whisper: ${tiempos.length - sinOir}/${tiempos.length} palabras oídas · diferencia máxima con el reparto por letras ${maxDif.toFixed(2)} s`);
    } else {
      tiempos = tiemposDePalabras(textos[voz], tramos);
    }
    const palabras = tiempos.map((w) => ({
      palabra: w.palabra,
      // Cuadro relativo al inicio de la ESCENA, que es lo que usan los componentes
      cuadro: local + Math.round(w.t * FPS),
    }));

    const clip = { voz, desde: cursorGlobal + local, enEscena: local, cuadros, palabras };
    clipsEscena.push(clip);
    clips.push(clip);
    local += cuadros;
  }

  const durationInFrames = local + e.cola;
  escenas.push({
    id: e.id,
    round: e.round,
    from: cursorGlobal,
    durationInFrames,
    clips: clipsEscena.map(({ voz, enEscena, cuadros, palabras }) => ({ voz, enEscena, cuadros, palabras })),
  });
  cursorGlobal += durationInFrames;
}

fs.writeFileSync(
  config.salida,
  JSON.stringify(
    {
      ...(ESTIMAR ? { _borrador: true } : {}),
      fps: FPS,
      total: cursorGlobal,
      escenas,
      clips: clips.map(({ voz, desde }) => ({ voz, desde })),
    },
    null,
    2,
  ) + "\n",
);
if (ESTIMAR) console.log("\n*** BORRADOR: tiempos estimados, sin voz. No renderizar ni mezclar con esto. ***");

for (const e of escenas) {
  console.log(`${e.id.padEnd(16)} ${e.round ? `R${e.round}` : "  "}  desde ${String(e.from).padStart(4)}  ${String(e.durationInFrames).padStart(4)} cuadros  (${(e.durationInFrames / FPS).toFixed(2)}s)`);
  for (const c of e.clips) {
    console.log(`   ${c.voz.padEnd(14)} ${c.palabras.map((w) => `${w.palabra}@${w.cuadro}`).join(" ")}`);
  }
}
console.log(`\nTotal ${cursorGlobal} cuadros · ${(cursorGlobal / FPS).toFixed(2)}s`);
