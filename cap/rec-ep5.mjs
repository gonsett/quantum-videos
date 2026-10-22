// Capturador para Linux (GitHub Actions), adaptado de muestras/oficina-3d/rec-piso.mjs.
// node rec-ep5.mjs <carpeta-escena> <W> <H> <carpeta-cuadros>
// env: F (página, por defecto oficina-piso.html) · Q (consulta, por defecto ?ep5) · SUB · FPS · DESDE · HASTA (índices de cuadro, inclusive)
// Sin placa de video: WebGL por software (SwiftShader a través de ANGLE).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(process.argv[2] || '../escena'), W = +(process.argv[3] || 1080), H = +(process.argv[4] || 1920);
const fr = path.resolve(process.argv[5] || 'frames');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const pedidos = [], faltan = [];
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(root, u); pedidos.push(u);
  fs.readFile(f, (e, d) => { if (e) { faltan.push(u); r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-gpu-sandbox'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()));
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('requestfailed', (q) => console.log('requestfailed:', q.url(), q.failure()?.errorText));
const t0 = Date.now(), seg = () => ((Date.now() - t0) / 1000).toFixed(0) + ' s';
await page.goto(`http://localhost:${srv.address().port}/${process.env.F || 'oficina-piso.html'}${process.env.Q ?? '?ep5'}`, { timeout: 600000 });
console.log('gl:', await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const x = g && g.getExtension('WEBGL_debug_renderer_info'); return g ? (x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'webgl2') : 'SIN WEBGL2'; }));
await page.waitForFunction(() => window.READY === true, null, { timeout: 3000000, polling: 1000 });
console.log('READY en', seg());
console.log('404:', [...new Set(faltan)].join(' | ') || 'ninguno');
console.log('fuentes:', await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`).join(', ')));

fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr, { recursive: true });
const SUB = +(process.env.SUB || 1), fps = +(process.env.FPS || 60);
const draw = (t) => SUB > 1 ? page.evaluate(([t, n, sh]) => window.renderAccum(t, n, sh), [t, SUB, .5 / fps]) : page.evaluate((t) => window.renderAt(t), t);
const dur = await page.evaluate(() => window.DURATION), n = Math.round(dur * fps);
const desde = +(process.env.DESDE || 0), hasta = Math.min(n, process.env.HASTA ? +process.env.HASTA : n);
console.log(`DURATION ${dur} · ${n + 1} cuadros en total · tramo ${desde}-${hasta}`);
let chicos = 0;
for (let i = desde; i <= hasta; i++) {
  await draw(Math.min(dur, i / fps));
  const fp = path.join(fr, `f${String(i).padStart(4, '0')}.jpg`);
  await page.screenshot({ path: fp, quality: 95 });
  const kb = fs.statSync(fp).size / 1024; if (kb < 60) { chicos++; console.log('cuadro sospechoso (muy liviano, ¿negro?)', i, kb.toFixed(0), 'KB'); }
  if ((i - desde) % 10 === 0 || i === hasta) console.log(i, '/', hasta, '·', kb.toFixed(0), 'KB ·', seg());
}
console.log('ok ·', hasta - desde + 1, 'cuadros ·', chicos, 'sospechosos ·', seg());
await browser.close(); srv.close();
