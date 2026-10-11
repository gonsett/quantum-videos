/**
 * Diseño sonoro de "Secreto de closer #1" (versión con locutor).
 *
 * Dos capas, ambas sintetizadas (sin samples de terceros):
 *
 *   cama-secreto1.wav   lo que sostiene la escena: pad grave, latido y aire.
 *                       Se agacha solo cuando habla el locutor (sidechain).
 *   sfx-secreto1.wav    lo que puntúa: impactos, brillos, caída, subida y
 *                       campanadas. No se agacha: cae sobre la palabra.
 *
 * La emoción sale del contraste, no del volumen:
 *
 *   "Se defiende…"      sube la tensión (subida corta)
 *   "cada semana."      impacto: entra el cinturón
 *   "sumás."            destello agudo, recompensa
 *   "perdés puntos."    golpe sordo y glissando hacia abajo
 *   "se va el rango."   caída grave, el pad se tapa, el latido se frena y se apaga
 *   (silencio)          un latido, nada, la respiración antes del golpe
 *   "Defendelo."        latido que se acelera, subida y golpe grande
 *   "Subite al ring."   tres campanadas de ring, cola larga
 *
 * Todos los tiempos salen de timeline-secreto1.json: si se regenera una toma
 * de voz y se vuelve a correr montaje.mjs, el sonido se reacomoda solo.
 */
import fs from "fs";
import { SR, Pista, PasaBajos, escribirWav, sino, sierra, suave } from "./sintetizador.mjs";

const tl = JSON.parse(fs.readFileSync("timeline-secreto1.json", "utf8"));
const FPS = tl.fps;
const seg = (c) => c / FPS;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const escena = (id) => tl.escenas.find((e) => e.id === id);
const A = (id, p, vez = 1) => {
  const e = escena(id);
  let n = 0;
  for (const c of e.clips) for (const w of c.palabras) if (norm(w.palabra) === norm(p) && ++n === vez) return seg(e.from + w.cuadro);
  throw new Error(`"${p}" (vez ${vez}) no está en ${id}`);
};
const finClip = (id) => {
  const e = escena(id);
  const c = e.clips[e.clips.length - 1];
  return seg(e.from + c.enEscena + c.cuadros);
};

const FIN = seg(tl.total);
const DUR = FIN + 1.0;

// Un poco antes de la palabra: el golpe tiene que llegar antes que la voz
const ADEL = 0.13;
const T = {
  etiqueta: A("s1-apertura", "Secreto") - 0.25,
  linea1: A("s1-apertura", "El") - ADEL,
  defiende: A("s1-apertura", "Se", 2) - ADEL,
  cada: A("s1-apertura", "cada") - 0.06,
  cumplis: A("s2-cumplis", "Cumplís") - ADEL,
  sumas: A("s2-cumplis", "sumás") - 0.03,
  te: A("s2-cumplis", "Te") - ADEL,
  perdes: A("s2-cumplis", "perdés") - 0.03,
  y: A("s3-rango", "Y") - ADEL,
  seva: A("s3-rango", "se") - ADEL,
  va: A("s3-rango", "va"),
  rango: A("s3-rango", "rango"),
  defendelo: A("s4-cierre", "Defendelo") - 0.1,
  subite: A("s4-cierre", "Subite") - ADEL,
  finVoz: finClip("s4-cierre"),
};
// Cuadro exacto en que la imagen dispara la luz (escenas-voz.tsx)
const F = {
  brillo1: A("s1-apertura", "cada") + 32 / FPS - 0.06,
  brillo2: A("s4-cierre", "Defendelo") + 4 / FPS,
};

// ── Utilidades ───────────────────────────────────────────────────────────

let semilla = 20260918;
const ruido = () => {
  semilla |= 0;
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
};

const cama = new Pista(DUR);
const camaEnvio = new Pista(DUR);
const seco = new Pista(DUR);
const envio = new Pista(DUR);

const idx = (t) => Math.max(0, Math.floor(t * SR));
const emitir = (dest, i, v, pan = 0) => {
  for (const [p, g] of dest) p.add(i, v * g, pan);
};
// Cuánto de cada sonido va seco y cuánto a la sala
const SECO = [[seco, 1]];
const MEDIO = [[seco, 0.9], [envio, 0.4]];
const SALA = [[seco, 0.5], [envio, 1]];
const LATIDO = [[cama, 1], [camaEnvio, 0.45]];

const rampa = (t, puntos) => {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [t0, v0] = puntos[i];
    const [t1, v1] = puntos[i + 1];
    if (t >= t0 && t <= t1) return v0 + (v1 - v0) * suave(t1 === t0 ? 1 : (t - t0) / (t1 - t0));
  }
  return t < puntos[0][0] ? puntos[0][1] : puntos[puntos.length - 1][1];
};

/** Reverb de sala (Schroeder/Freeverb): 8 peines en paralelo y 4 pasa-todo en serie. */
const reverb = (fuente, { sala, amort, ganancia }) => {
  const salida = new Pista(fuente.n / SR);
  for (const canal of ["L", "R"]) {
    const x = fuente[canal];
    const y = salida[canal];
    const desfase = canal === "R" ? 23 : 0;
    const peines = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({
      buf: new Float64Array(Math.round(((d + desfase) * SR) / 44100)),
      i: 0,
      almacen: 0,
    }));
    const pasos = [556, 441, 341, 225].map((d) => ({
      buf: new Float64Array(Math.round(((d + desfase) * SR) / 44100)),
      i: 0,
    }));
    for (let k = 0; k < fuente.n; k++) {
      const entrada = x[k] * 0.015;
      let suma = 0;
      for (const c of peines) {
        const s = c.buf[c.i];
        c.almacen = s * (1 - amort) + c.almacen * amort;
        c.buf[c.i] = entrada + c.almacen * sala;
        if (++c.i >= c.buf.length) c.i = 0;
        suma += s;
      }
      for (const a of pasos) {
        const b = a.buf[a.i];
        const out = -suma + b;
        a.buf[a.i] = suma + b * 0.5;
        if (++a.i >= a.buf.length) a.i = 0;
        suma = out;
      }
      y[k] = suma * ganancia;
    }
  }
  return salida;
};

// ── Sonidos de la capa de efectos ────────────────────────────────────────

/** Golpe de película: caída grave con saturación, cuerpo, ráfaga y un chasquido al inicio. */
const impacto = (dest, t0, niv) => {
  const lp = new PasaBajos(3500);
  const lpAlto = new PasaBajos(2200);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + 2.4)); i++) {
    const d = i / SR - t0;
    fase += (32 + 60 * Math.exp(-d * 7)) / SR;
    const sub = Math.tanh(sino(fase) * 1.7) * Math.exp(-d * 1.9) * 0.62;
    const cuerpo = sino(d * 135) * Math.exp(-d * 16) * 0.42;
    const r = ruido();
    const rafaga = lp.paso(r) * Math.exp(-d * 8) * 0.5;
    const grieta = (r - lpAlto.paso(r)) * Math.exp(-d * 55) * 0.42;
    emitir(dest, i, (sub + cuerpo + rafaga + grieta) * niv, 0);
  }
};

/** Piña de cuero: el golpe del guante. Mismo sonido que el resto de Ring Closers. */
const pina = (dest, t0, niv) => {
  const lp = new PasaBajos(1700);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + 0.3)); i++) {
    const d = i / SR - t0;
    fase += (60 + 110 * Math.exp(-d * 30)) / SR;
    const cuerpo = sino(fase) * Math.exp(-d * 14) * 0.5;
    const cuero = lp.paso(ruido()) * Math.exp(-d * 75) * 0.55;
    emitir(dest, i, (cuerpo + cuero) * niv, 0);
  }
};

/** Recompensa: dos notas agudas, la segunda una quinta arriba. Suma, no festeja. */
const recompensa = (dest, t0, niv) => {
  const nota = (ti, f, n2) => {
    for (let i = idx(ti); i < Math.min(seco.n, idx(ti + 1.4)); i++) {
      const d = i / SR - ti;
      const v =
        (sino(f * d) * Math.exp(-d * 3.4) +
          sino(f * 2.005 * d) * 0.38 * Math.exp(-d * 5) +
          sino(f * 3.01 * d) * 0.18 * Math.exp(-d * 7.5)) *
        Math.min(1, d / 0.003);
      emitir(dest, i, v * n2, 0.15);
    }
  };
  nota(t0, 1318.5, niv);
  nota(t0 + 0.12, 1975.5, niv * 0.8);
};

/** Pérdida: golpe sordo y un tono que se hunde. */
const perdida = (dest, t0, niv) => {
  const lp = new PasaBajos(500);
  let fase = 0;
  let fase2 = 0;
  for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + 1.0)); i++) {
    const d = i / SR - t0;
    fase += (40 + 45 * Math.exp(-d * 9)) / SR;
    const golpe = sino(fase) * Math.exp(-d * 7) * 0.7;
    fase2 += (120 + 330 * Math.exp(-d * 1.6)) / SR;
    const hunde = sino(fase2) * Math.exp(-d * 3) * 0.22 * (1 + 0.06 * Math.sin(2 * Math.PI * 6 * d));
    const sordo = lp.paso(ruido()) * Math.exp(-d * 25) * 0.25;
    emitir(dest, i, (golpe + hunde + sordo) * niv, 0);
  }
};

/** Caída: el tono se desploma y el soplo se cierra. Es "se va el rango". */
const caida = (dest, t0, niv) => {
  const lp = new PasaBajos(5000);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + 2.2)); i++) {
    const d = i / SR - t0;
    fase += (26 + 180 * Math.exp(-d * 2.3)) / SR;
    const tono = sino(fase) * Math.exp(-d * 1.4) * 0.5 * Math.min(1, d / 0.02);
    lp.setCorte(120 + 5000 * Math.exp(-d * 3.2));
    const soplo = lp.paso(ruido()) * Math.exp(-d * 1.6) * 0.2 * Math.min(1, d / 0.05);
    emitir(dest, i, (tono + soplo) * niv, 0);
  }
};

/** Subida: ruido que se abre y un tono que trepa, hasta el instante del golpe. */
const subida = (dest, t0, t1, niv) => {
  const lp = new PasaBajos(400);
  let fase = 0;
  for (let i = idx(t0); i < Math.min(seco.n, idx(t1)); i++) {
    const x = (i / SR - t0) / (t1 - t0);
    if (i % 32 === 0) lp.setCorte(300 + 9000 * x * x * x);
    const soplo = lp.paso(ruido());
    fase += (160 * Math.pow(9, x)) / SR;
    const tono = sino(fase) * 0.16 * (0.7 + 0.3 * sino(x * x * 30));
    emitir(dest, i, (soplo * 0.55 + tono) * x * x * niv, 0);
  }
};

/** Luz que pasa por el metal: aire agudo que barre de izquierda a derecha y destellos. */
const brillo = (dest, t0, largo, niv) => {
  const lp = new PasaBajos(1400);
  for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + largo)); i++) {
    const d = i / SR - t0;
    const x = d / largo;
    const env = Math.sin(Math.PI * x) ** 2;
    const r = ruido();
    const alto = r - lp.paso(r);
    const centelleo =
      (sino(2600 * d) * 0.5 + sino(3900 * d) * 0.35 + sino(5200 * d) * 0.25) * (0.5 + 0.5 * sino(d * 9)) * env * 0.05;
    emitir(dest, i, (alto * 0.16 * env + centelleo) * niv, -0.5 + x);
  }
};

/** Un soplo corto para cada línea que entra: es lo que hace que el texto se sienta ligero. */
const susurro = (dest, t0, niv, pan = 0) => {
  const lp = new PasaBajos(1100);
  const lp2 = new PasaBajos(7000);
  for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + 0.34)); i++) {
    const d = i / SR - t0;
    const env = (1 - Math.exp(-d * 60)) * Math.exp(-d * 11);
    const r = ruido();
    emitir(dest, i, lp2.paso(r - lp.paso(r)) * env * 0.32 * niv, pan);
  }
};

/** Campana de ring: metal brillante, parciales inarmónicos y un golpe seco al inicio. */
const campanaRing = (dest, t0, niv) => {
  const parciales = [
    [1, 1.0, 2.2],
    [1.506, 0.55, 2.6],
    [2.0, 0.5, 3.0],
    [2.76, 0.35, 3.6],
    [4.07, 0.22, 4.6],
    [5.4, 0.12, 6.0],
  ];
  const lpAlto = new PasaBajos(3000);
  for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + 3.2)); i++) {
    const d = i / SR - t0;
    let v = 0;
    for (const [r, a, caidaP] of parciales) {
      const f = 1240 * r;
      v += (sino(f * d) + sino((f + 1.7) * d)) * 0.5 * a * Math.exp(-d * caidaP);
    }
    const r = ruido();
    v += (r - lpAlto.paso(r)) * 0.3 * Math.exp(-d * 180);
    emitir(dest, i, v * 0.3 * niv * Math.min(1, d / 0.0015), 0.05);
  }
};

// ── Capa de cama ─────────────────────────────────────────────────────────

/** Un latido: dos golpes graves, el segundo más bajo y un poco más agudo. */
const latido = (t0, niv) => {
  const uno = (ti, base, n2) => {
    const lp = new PasaBajos(700);
    let fase = 0;
    for (let i = idx(ti); i < Math.min(cama.n, idx(ti + 0.3)); i++) {
      const d = i / SR - ti;
      fase += (base + 40 * Math.exp(-d * 30)) / SR;
      const grave = sino(fase) * Math.exp(-d * 13);
      const medio = sino(d * base * 2.3) * Math.exp(-d * 30) * 0.4;
      const cuerpo = lp.paso(ruido()) * Math.exp(-d * 70) * 0.14;
      emitir(LATIDO, i, (grave * 0.6 + medio + cuerpo) * n2 * niv, 0);
    }
  };
  uno(t0, 46, 1);
  uno(t0 + 0.17, 52, 0.7);
};

// Latido de fondo: arranca quieto, se acelera con la tensión y se apaga con el rango
const bpm = (t) =>
  rampa(t, [
    [0, 58],
    [T.sumas, 68],
    [T.perdes, 78],
    [T.va - 0.2, 74],
  ]);
const nivelLatido = (t) =>
  rampa(t, [
    [0, 0.12],
    [T.sumas, 0.22],
    [T.perdes, 0.3],
    [T.va, 0.28],
  ]);
for (let t = T.etiqueta + 0.4; t < T.va + 0.1; t += 60 / bpm(t)) latido(t, nivelLatido(t));
// Se frena y se apaga: tres latidos cada vez más lentos y más flojos
latido(T.va + 0.55, 0.22);
latido(T.va + 1.5, 0.14);
latido(T.va + 2.75, 0.07);

// Antes del golpe: el latido se acelera hasta que no se distinguen los golpes
{
  const desde = T.defendelo - 1.35;
  let t = desde;
  let paso = 0.55;
  while (t < T.defendelo - 0.2) {
    const x = (t - desde) / (T.defendelo - 0.2 - desde);
    latido(t, 0.16 + 0.32 * x);
    paso = Math.max(0.2, paso * 0.86);
    t += paso;
  }
}
// Después del golpe: firme y estable, ya no hay miedo
[0.95, 1.92, 2.89].forEach((dt, k) => latido(T.defendelo + dt, 0.3 - k * 0.04));

/** Pad grave en mi menor. Se tapa cuando se va el rango y se abre para el golpe final. */
{
  const nivelPad = (t) =>
    rampa(t, [
      [0, 0],
      [T.linea1, 0.4],
      [T.cada, 0.62],
      [T.perdes, 0.68],
      [T.va, 0.62],
      [T.va + 1.1, 0.16],
      [T.defendelo - 1.4, 0.16],
      [T.defendelo, 1.0],
      [T.subite + 0.5, 0.85],
      [FIN, 0.4],
      [DUR, 0],
    ]);
  const corte = (t) =>
    rampa(t, [
      [0, 380],
      [T.cada, 900],
      [T.perdes, 700],
      [T.va, 700],
      [T.va + 0.9, 110],
      [T.defendelo - 1.4, 110],
      [T.defendelo, 3200],
      [FIN, 1200],
    ]);
  // mi2, si2, mi3 siempre; sol3 entra con "perdés" para el color menor
  const voces = [
    [82.41, 1.0, 0],
    [123.47, 0.7, 0],
    [164.81, 0.5, 0],
    [196.0, 0.4, T.perdes - 1.0],
  ];
  const fasesA = voces.map(() => 0);
  const fasesB = voces.map(() => 0);
  const lpA = new PasaBajos(500);
  const lpB = new PasaBajos(500);
  let fase1 = 0;
  for (let i = 0; i < cama.n; i++) {
    const t = i / SR;
    if (i % 128 === 0) {
      const c = corte(t);
      lpA.setCorte(c);
      lpB.setCorte(c);
    }
    let a = 0;
    let b = 0;
    voces.forEach(([f, g, entra], k) => {
      const ent = entra ? suave((t - entra) / 1.5) : 1;
      fasesA[k] += (f * 0.9975) / SR;
      fasesB[k] += (f * 1.0025) / SR;
      a += sierra(fasesA[k], f, 10) * g * ent;
      b += sierra(fasesB[k], f, 10) * g * ent;
    });
    const n = nivelPad(t);
    const sonA = Math.tanh(lpA.paso(a) * 0.9) * 0.1 * n;
    const sonB = Math.tanh(lpB.paso(b) * 0.9) * 0.1 * n;
    fase1 += 41.2 / SR;
    const sub = (sino(fase1) + sino(fase1 * 2.003) * 0.25) * 0.13 * n;
    cama.add(i, sonA, -0.4);
    cama.add(i, sonB, 0.4);
    cama.add(i, sub, 0);
  }
}

/** Aire de arena: un soplo muy bajo que crece hacia el final. Casi no se nota, se extraña si falta. */
{
  const lpA = new PasaBajos(1800);
  const lpB = new PasaBajos(220);
  const nivelAire = (t) =>
    rampa(t, [
      [0, 0],
      [T.cada, 0.014],
      [T.va, 0.02],
      [T.va + 1.2, 0.006],
      [T.defendelo, 0.014],
      [T.defendelo + 0.4, 0.06],
      [FIN, 0.03],
      [DUR, 0],
    ]);
  for (let i = 0; i < cama.n; i++) {
    const t = i / SR;
    const r = ruido();
    const banda = lpA.paso(r) - lpB.paso(r);
    const lento = 0.65 + 0.35 * Math.sin(2 * Math.PI * 0.13 * t);
    cama.add(i, banda * lento * nivelAire(t) * 6, Math.sin(t * 0.7) * 0.5);
  }
}

// ── Capa de efectos: cada golpe sobre su palabra ─────────────────────────

// La etiqueta y cada línea que entra llevan su soplo
susurro(SECO, T.etiqueta, 0.7, 0);
susurro(SECO, T.linea1, 0.8, -0.2);
susurro(SECO, T.defiende, 0.9, 0.2);
susurro(SECO, T.cumplis, 0.8, -0.2);
susurro(SECO, T.te, 0.8, 0.2);
susurro(SECO, T.y, 0.8, -0.2);
susurro(SECO, T.seva, 0.8, 0.2);
susurro(SECO, T.subite, 0.9, 0);

// "Se defiende … cada semana": la tensión sube y cae el impacto que trae el cinturón
subida(MEDIO, T.defiende + 0.9, T.cada - 0.05, 0.3);
impacto(SALA, T.cada, 0.55);
pina(MEDIO, T.cada, 0.45);
brillo(MEDIO, F.brillo1, 1.4, 0.4);

// "sumás": destello agudo
recompensa(SALA, T.sumas + 0.7, 0.22);
pina(MEDIO, T.sumas, 0.2);

// "perdés puntos": golpe sordo y glissando hacia abajo
perdida(MEDIO, T.perdes, 0.85);

// "se va el rango": caída grave
caida(SALA, T.rango - 0.05, 0.85);

// Silencio dramático: entre la caída y "Defendelo" no suena nada más que el latido que se apaga.
// "Defendelo": subida, golpe grande, piña, luz que vuelve
subida(MEDIO, T.defendelo - 1.35, T.defendelo, 0.95);
impacto(SALA, T.defendelo, 1.0);
pina(MEDIO, T.defendelo, 0.7);
brillo(MEDIO, F.brillo2, 1.5, 0.6);

// "Subite al ring": tres campanadas de ring, en el silencio que deja la voz
[0, 0.36, 0.72].forEach((dt, k) => campanaRing(SALA, T.finVoz + 0.12 + dt, [1, 0.9, 1][k]));

// ── Reverb y salida ──────────────────────────────────────────────────────

const humedoSfx = reverb(envio, { sala: 0.92, amort: 0.25, ganancia: 3 });
for (let i = 0; i < seco.n; i++) {
  seco.L[i] += humedoSfx.L[i];
  seco.R[i] += humedoSfx.R[i];
}
const humedoCama = reverb(camaEnvio, { sala: 0.86, amort: 0.4, ganancia: 3 });
for (let i = 0; i < cama.n; i++) {
  cama.L[i] += humedoCama.L[i];
  cama.R[i] += humedoCama.R[i];
}

/**
 * Escala fija. No se normaliza por pico: si el golpe más grande cambia de nivel,
 * todo lo demás se movería con él y el balance contra la voz dejaría de ser el
 * que se midió.
 */
const escalar = (pista, g) => {
  for (let i = 0; i < pista.n; i++) {
    pista.L[i] *= g;
    pista.R[i] *= g;
  }
  return g;
};
const gSfx = escalar(seco, 0.35);
const gCama = escalar(cama, 1.47);
escribirWav(seco, "public/audio/sfx-secreto1.wav", 1);
escribirWav(cama, "public/audio/cama-secreto1.wav", 1);

const f2 = (x) => x.toFixed(2);
console.log(`sfx-secreto1.wav y cama-secreto1.wav: ${f2(DUR)}s (video ${f2(FIN)}s)`);
console.log(`ganancias fijas: sfx ${f2(gSfx)} · cama ${f2(gCama)}`);
console.log(
  "eventos (s): " +
    Object.entries({ ...T, brillo1: F.brillo1, brillo2: F.brillo2 })
      .map(([k, v]) => `${k} ${f2(v)}`)
      .join(" · "),
);
