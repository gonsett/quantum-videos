// Adaptado de muestras/oficina-3d/cajas.mjs para Linux: recorre el episodio cada 1/15 s a 540×960
// y lista los textos que se tocan (window.CAJAS). DESDE/HASTA en segundos. Al final imprime «fin N».
import { abrir, seg } from './cargar.mjs';
const W = 540, H = 960;
const { page, cerrar } = await abrir(W, H);
const dur = await page.evaluate(() => window.DURATION), malos = new Map();
const desde = +(process.env.DESDE || 0), hasta = Math.min(dur, +(process.env.HASTA || 1e9));
console.log(`cajas ${desde}-${hasta} s`);
let k = 0;
for (let t = desde; t < hasta; t += 1 / 15) {
  const cs = await page.evaluate((t) => { window.renderAt(t); return window.CAJAS; }, t);
  if (!Array.isArray(cs)) { console.log('window.CAJAS no es una lista en t =', t.toFixed(2)); process.exit(5); }
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) { const a = cs[i], b = cs[j];
    if (a.s.startsWith('sub:') && b.s.startsWith('sub:')) continue;
    const m = 1; if (a.x < b.x + b.w - m && b.x < a.x + a.w - m && a.y < b.y + b.h - m && b.y < a.y + a.h - m) { const k = a.s + ' ⟂ ' + b.s; if (!malos.has(k)) malos.set(k, []); malos.get(k).push(t.toFixed(2)); } }
  if (++k % 15 === 0) console.log('· t =', t.toFixed(2), '·', seg());
}
for (const [k, v] of malos) console.log(k, '→', v[0], '…', v[v.length - 1], `(${v.length})`);
console.log('fin', malos.size, '·', seg()); await cerrar();
