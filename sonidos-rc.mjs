/**
 * ⚠️ VARA DE CALIDAD SONORA (Javier, 19/09/2026): cada video nuevo debe sonar igual o MEJOR que el de élite
 * ("altísimo nivel"), nunca como música comercial de fondo. Golpes con peso (>= 0,5) en los cortes
 * importantes, risers, silencios de contraste, tema con identidad y desarrollo. Las mediciones de LUFS,
 * pico y enmascarado no miden el drama: no bajar los golpes para que pasen. Ver el skill.
 */
/**
 * Biblioteca de sonidos de la serie cinematográfica de Ring Closers.
 *
 * Es el diseño sonoro de "Secreto de closer #1" (generar-sonido-secreto1.mjs)
 * sacado a un módulo para reusarlo sin copiar 500 líneas por video: cada video
 * nuevo solo dice CUÁNDO cae cada sonido; acá está CÓMO suena.
 *
 * Dos capas, todas sintetizadas (sin samples de terceros):
 *   cama  lo que sostiene la escena: pad grave, latido y aire. Se agacha con la voz.
 *   sfx   lo que puntúa: impactos, brillos, caída, subida, campanas. NO se agacha.
 *
 * Uso:
 *   const s = crearEstudio(duracionSegundos);
 *   s.impacto(s.SALA, t, 0.55);          // efecto sobre una palabra
 *   s.padGrave({ nivel, corte, voces });   // cama
 *   s.cerrar({ gSfx: 0.35, gCama: 1.47, salidaSfx, salidaCama });
 *
 * Reglas aprendidas (ver la habilidad video-cinematico-ring-closers):
 *   - el golpe cae ~0,1 s ANTES de la palabra y en el mismo cuadro que la luz de la imagen;
 *   - lo que compite con la voz en 1–4 kHz se corre a la pausa que sigue a la palabra;
 *   - escalas fijas por capa (no normalizar por pico), para no mover el balance contra la voz.
 */
import { SR, Pista, PasaBajos, escribirWav, sino, sierra, suave } from "./sintetizador.mjs";

export const crearEstudio = (DUR) => {
  // ── Utilidades ─────────────────────────────────────────────────────────
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

  /** Interpolación suave entre puntos [t, valor]. Los t tienen que ir en orden. */
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

  // ── Capa de efectos ────────────────────────────────────────────────────

  /** Golpe de película: caída grave con saturación, cuerpo, ráfaga y un chasquido al inicio. */
  const impacto = (dest, t0, niv, corte = 3500) => {
    // `corte` = hasta dónde llega la ráfaga: bajarlo saca energía de la banda de la voz (1-4 kHz)
    const lp = new PasaBajos(corte);
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

  /** Una nota de campanita: fundamental + dos parciales, ataque de 3 ms. */
  const nota = (dest, t0, f, niv, pan = 0.15) => {
    for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + 1.4)); i++) {
      const d = i / SR - t0;
      const v =
        (sino(f * d) * Math.exp(-d * 3.4) +
          sino(f * 2.005 * d) * 0.38 * Math.exp(-d * 5) +
          sino(f * 3.01 * d) * 0.18 * Math.exp(-d * 7.5)) *
        Math.min(1, d / 0.003);
      emitir(dest, i, v * niv, pan);
    }
  };

  /** Recompensa: dos notas agudas, la segunda una quinta arriba. Suma, no festeja. */
  const recompensa = (dest, t0, niv) => {
    nota(dest, t0, 1318.5, niv);
    nota(dest, t0 + 0.12, 1975.5, niv * 0.8);
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

  /** Caída: el tono se desploma y el soplo se cierra. */
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

  /** Clic corto de interfaz: ruido agudo y un cuerpo breve. Marca el cursor que salta de fila. */
  const tick = (dest, t0, niv, pan = 0) => {
    const lp = new PasaBajos(2500);
    for (let i = idx(t0); i < Math.min(seco.n, idx(t0 + 0.08)); i++) {
      const d = i / SR - t0;
      const r = ruido();
      const clic = (r - lp.paso(r)) * Math.exp(-d * 220) * 0.5;
      const cuerpo = sino(d * 820) * Math.exp(-d * 70) * 0.4;
      emitir(dest, i, (clic + cuerpo) * niv, pan);
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

  // ── Capa de cama ───────────────────────────────────────────────────────

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

  /** Latidos a ritmo y nivel variables entre dos instantes. */
  const latidos = (desde, hasta, bpm, nivel) => {
    for (let t = desde; t < hasta; t += 60 / bpm(t)) latido(t, nivel(t));
  };

  /** Pad grave en mi menor con pasabajos que se abre y se cierra. `voces`: [freq, ganancia, entraEn]. */
  const padGrave = ({ nivel, corte, voces }) => {
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
      const n = nivel(t);
      const sonA = Math.tanh(lpA.paso(a) * 0.9) * 0.1 * n;
      const sonB = Math.tanh(lpB.paso(b) * 0.9) * 0.1 * n;
      fase1 += 41.2 / SR;
      const sub = (sino(fase1) + sino(fase1 * 2.003) * 0.25) * 0.13 * n;
      cama.add(i, sonA, -0.4);
      cama.add(i, sonB, 0.4);
      cama.add(i, sub, 0);
    }
  };

  /** Aire de arena: un soplo muy bajo. Casi no se nota, se extraña si falta. */
  const aire = (nivel) => {
    const lpA = new PasaBajos(1800);
    const lpB = new PasaBajos(220);
    for (let i = 0; i < cama.n; i++) {
      const t = i / SR;
      const r = ruido();
      const banda = lpA.paso(r) - lpB.paso(r);
      const lento = 0.65 + 0.35 * Math.sin(2 * Math.PI * 0.13 * t);
      cama.add(i, banda * lento * nivel(t) * 6, Math.sin(t * 0.7) * 0.5);
    }
  };

  // ── Cierre: reverb, escala fija y escritura ────────────────────────────

  /**
   * Escala fija. No se normaliza por pico: si el golpe más grande cambia de nivel,
   * todo lo demás se movería con él y el balance contra la voz dejaría de ser el
   * que se midió.
   */
  const cerrar = ({ gSfx = 0.35, gCama = 1.47, salidaSfx, salidaCama }) => {
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
    const escalar = (pista, g) => {
      for (let i = 0; i < pista.n; i++) {
        pista.L[i] *= g;
        pista.R[i] *= g;
      }
    };
    escalar(seco, gSfx);
    escalar(cama, gCama);
    escribirWav(seco, salidaSfx, 1);
    escribirWav(cama, salidaCama, 1);
  };

  // ── Música con pulso (19/09/2026): bombo, palma, hi-hat, caja, bajo, arpegio ─
  // Van a la capa de cama: se agachan con la voz (sidechain) como todo lo musical.

  const MUSICA = [[cama, 1], [camaEnvio, 0.12]];

  /** Bombo: seno que cae de ~165 a 46 Hz con saturación y un clic de ataque. */
  const bombo = (t0, niv) => {
    const lp = new PasaBajos(4000);
    let fase = 0;
    for (let i = idx(t0); i < Math.min(cama.n, idx(t0 + 0.42)); i++) {
      const d = i / SR - t0;
      fase += (46 + 120 * Math.exp(-d * 28)) / SR;
      const cuerpo = Math.tanh(sino(fase) * 1.6) * Math.exp(-d * 9) * 0.9;
      const clic = lp.paso(ruido()) * Math.exp(-d * 220) * 0.35;
      emitir(MUSICA, i, (cuerpo + clic) * niv, 0);
    }
  };

  /** Palma: tres ráfagas seguidas de ruido en banda media y una cola corta. */
  const palma = (t0, niv) => {
    const techo = new PasaBajos(3200);
    const piso = new PasaBajos(900);
    for (let i = idx(t0); i < Math.min(cama.n, idx(t0 + 0.28)); i++) {
      const d = i / SR - t0;
      const r = ruido();
      const banda = techo.paso(r) - piso.paso(r);
      const rafagas = d < 0.012 ? 1 : d < 0.024 ? 0.85 : d < 0.036 ? 0.7 : 0;
      emitir(MUSICA, i, banda * (rafagas + Math.exp(-d * 18) * 0.45) * niv * 2.2, 0.1);
    }
  };

  /** Caja: ruido y un tono de ~190 Hz. Para los redobles. */
  const caja = (t0, niv) => {
    const lp = new PasaBajos(5200);
    let fase = 0;
    for (let i = idx(t0); i < Math.min(cama.n, idx(t0 + 0.2)); i++) {
      const d = i / SR - t0;
      fase += (190 - 60 * Math.min(1, d * 8)) / SR;
      emitir(MUSICA, i, (lp.paso(ruido()) * Math.exp(-d * 24) * 0.7 + sino(fase) * Math.exp(-d * 30) * 0.45) * niv, 0);
    }
  };

  /** Hi-hat: ruido pasa-altos; cerrado (seco) o abierto (cola larga). */
  const hat = (t0, niv, abierto = false) => {
    const lp = new PasaBajos(6500);
    const largo = abierto ? 0.22 : 0.05;
    const pan = Math.round(t0 * 1000) % 2 ? 0.25 : -0.25;
    for (let i = idx(t0); i < Math.min(cama.n, idx(t0 + largo + 0.02)); i++) {
      const d = i / SR - t0;
      const r = ruido();
      emitir(MUSICA, i, (r - lp.paso(r)) * Math.exp(-d * (abierto ? 14 : 75)) * niv * 0.9, pan);
    }
  };

  /** Bajo: sierra filtrada y seno grave; nota corta con el filtro cayendo. */
  const bajo = (t0, largo, freq, niv) => {
    const lp = new PasaBajos(500);
    let fase = 0;
    let fase2 = 0;
    for (let i = idx(t0); i < Math.min(cama.n, idx(t0 + largo + 0.06)); i++) {
      const d = i / SR - t0;
      const env = Math.min(1, d / 0.008) * Math.exp(-Math.max(0, d - largo * 0.6) * 12);
      lp.setCorte(180 + 900 * Math.exp(-d * 9));
      fase += freq / SR;
      fase2 += (freq * 2) / SR;
      const v = lp.paso(sierra(fase, freq, 8)) * 0.6 + sino(fase) * 0.7 + sino(fase2) * 0.15;
      emitir(MUSICA, i, v * env * niv * 0.5, 0);
    }
  };

  /** Nota de arpegio: dos sierras apenas desafinadas, filtro que se cierra rápido. */
  const pluck = (t0, freq, niv, largo = 0.22, pan = 0) => {
    const lp = new PasaBajos(3000);
    let f1 = 0;
    let f2 = 0;
    for (let i = idx(t0); i < Math.min(cama.n, idx(t0 + largo + 0.1)); i++) {
      const d = i / SR - t0;
      lp.setCorte(700 + 2600 * Math.exp(-d * 16));
      f1 += freq / SR;
      f2 += (freq * 1.004) / SR;
      const v = lp.paso(sierra(f1, freq, 10) + sierra(f2, freq * 1.004, 10)) * 0.5;
      emitir(MUSICA, i, v * Math.min(1, d / 0.004) * Math.exp(-d / (largo * 0.35)) * niv * 0.3, pan);
    }
  };

  /** Chisporroteo: muchos clics agudos repartidos en un instante corto. Es el ruido de las chispas. */
  const chisporroteo = (dest, t0, niv, largo = 0.3, n = 22) => {
    const lp = new PasaBajos(4500);
    for (let k = 0; k < n; k++) {
      const tk = t0 + ((ruido() + 1) / 2) * largo;
      const fuerza = (0.4 + (ruido() + 1) / 4) * (1 - (tk - t0) / (largo * 1.4));
      for (let i = idx(tk); i < Math.min(seco.n, idx(tk + 0.012)); i++) {
        const d = i / SR - tk;
        const r = ruido();
        emitir(dest, i, (r - lp.paso(r)) * Math.exp(-d * 400) * fuerza * niv, ruido() * 0.5);
      }
    }
  };

  return {
    SECO, MEDIO, SALA, MUSICA, rampa,
    impacto, pina, nota, recompensa, perdida, caida, subida, brillo, susurro, tick, campanaRing,
    latido, latidos, padGrave, aire, cerrar,
    bombo, palma, caja, hat, bajo, pluck, chisporroteo,
    emitir, idx, ruido, largo: () => seco.n, // para sonidos propios de cada video (02/10/2026)
  };
};
