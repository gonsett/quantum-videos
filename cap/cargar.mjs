// Carga común para Linux (GitHub Actions, sin placa: WebGL por SwiftShader a través de ANGLE).
// abrir(W, H) sirve ../escena por HTTP, abre oficina-piso.html?ep5 y espera window.READY informando cada 60 s en qué parte va.
// env: F (página) · Q (consulta, por defecto ?ep5) · MAX_CARGA_MIN (espera máxima a READY, por defecto 55)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'escena');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const t0 = Date.now();
export const seg = () => ((Date.now() - t0) / 1000).toFixed(0) + ' s';
const marcas = () => performance.getEntriesByType('mark').map((m) => m.name + '@' + (m.startTime / 1000).toFixed(0)).join(' ');

export async function abrir(W, H) {
  const faltan = []; let pedidos = 0;
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(raiz, u); pedidos++;
    fs.readFile(f, (e, d) => { if (e) { faltan.push(u); r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-gpu-sandbox'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()));
  page.on('pageerror', (e) => { console.log('pageerror:', e.stack || e.message); console.log('corto: error en la página a los', seg()); process.exit(6); });   // nunca colgarse en silencio
  page.on('requestfailed', (q) => console.log('requestfailed:', q.url(), q.failure()?.errorText));
  await page.goto(`http://localhost:${srv.address().port}/${process.env.F || 'oficina-piso.html'}${process.env.Q ?? '?ep5'}`, { timeout: 600000 });
  console.log('gl:', await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const x = g && g.getExtension('WEBGL_debug_renderer_info');
    return g ? (x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'webgl2') : 'SIN WEBGL2'; }));
  const MAXC = +(process.env.MAX_CARGA_MIN || 55) * 60000;
  for (;;) {
    const ok = await page.waitForFunction(() => window.READY === true, null, { timeout: 60000, polling: 1000 }).then(() => true, () => false);
    if (ok) break;
    console.log('cargando', seg(), '·', await page.evaluate((f) => eval(f)() + ' · ' + (document.getElementById('cargaP')?.textContent || ''), `(${marcas})`).catch((e) => 'eval: ' + e.message), '· pedidos', pedidos);
    if (Date.now() - t0 > MAXC) { console.log('READY NO LLEGÓ en', seg()); console.log('404:', [...new Set(faltan)].join(' | ')); process.exit(4); }
  }
  console.log('READY en', seg(), '·', await page.evaluate((f) => eval(f)(), `(${marcas})`));
  console.log('404:', [...new Set(faltan)].join(' | ') || 'ninguno');
  console.log('fuentes cargadas:', await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`).join(', ')));
  return { browser, page, cerrar: async () => { await browser.close(); srv.close(); } };
}
