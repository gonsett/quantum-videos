// Capturador para Linux, adaptado de muestras/oficina-3d/rec-piso.mjs.
// node rec-ep5.mjs video|stills <W> <H> <carpeta-salida>
// env: SUB · FPS · DESDE · HASTA (video: índices de cuadro, inclusive) · TIMES (stills: segundos separados por coma)
import fs from 'node:fs'; import path from 'node:path';
import { abrir, seg } from './cargar.mjs';

const modo = process.argv[2] || 'video', W = +(process.argv[3] || 1080), H = +(process.argv[4] || 1920), out = path.resolve(process.argv[5] || 'frames');
const { page, cerrar } = await abrir(W, H);
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const SUB = +(process.env.SUB || 1), fps = +(process.env.FPS || 60);
const draw = (t) => SUB > 1 ? page.evaluate(([t, n, sh]) => window.renderAccum(t, n, sh), [t, SUB, .5 / fps]) : page.evaluate((t) => window.renderAt(t), t);
const dur = await page.evaluate(() => window.DURATION);
let tc = Date.now(), chicos = 0;
const foto = async (fp, etiqueta) => { await page.screenshot({ path: fp, quality: 95, timeout: 0 }); const kb = fs.statSync(fp).size / 1024;
  if (kb < 60) { chicos++; console.log('SOSPECHOSO (muy liviano, ¿negro?)', etiqueta, kb.toFixed(0), 'KB'); }
  console.log(etiqueta, '·', kb.toFixed(0), 'KB ·', ((Date.now() - tc) / 1000).toFixed(1), 's ·', seg()); tc = Date.now(); };
if (modo === 'stills') {
  for (const t of (process.env.TIMES || '2,18,31,41').split(',').map(Number)) { await draw(t); await foto(path.join(out, `s_${W}x${H}_${t.toFixed(2)}.jpg`), 't=' + t); }
} else {
  const n = Math.round(dur * fps), desde = +(process.env.DESDE || 0), hasta = Math.min(n, process.env.HASTA ? +process.env.HASTA : n);
  console.log(`DURATION ${dur} · ${n + 1} cuadros en total · tramo ${desde}-${hasta}`);
  for (let i = desde; i <= hasta; i++) { await draw(Math.min(dur, i / fps)); await foto(path.join(out, `f${String(i).padStart(4, '0')}.jpg`), `cuadro ${i}/${hasta}`); }
}
console.log('ok ·', chicos, 'sospechosos ·', seg());
await cerrar();
