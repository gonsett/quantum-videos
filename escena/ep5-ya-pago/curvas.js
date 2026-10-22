// Curvas y utilidades de tiempo del ep. 4 (las mismas del ep. 3).
export const cl = (x) => Math.min(1, Math.max(0, x)), tramo = (s, a, b) => cl((s - a) / (b - a)), sale = (x) => 1 - (1 - x) ** 4, expo = (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x));
export const resorte = (t, f = 16, am = 8) => (t <= 0 ? 0 : 1 - Math.exp(-am * t) * Math.cos(f * t));
export const azar = (n) => { let x = (Math.floor(n) * 9301 + 49297) % 2147483647 || 1; return () => ((x = (x * 16807) % 2147483647) / 2147483647); };
export const imp = (s, t0, k) => (s >= t0 ? Math.exp(-(s - t0) * k) : 0);
export const suave = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
export const pulso = (t, a, b, w) => suave((t - a) / w) * (1 - suave((t - b) / w));
export const hash = (x) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
export const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export const lin = (t, a, b) => cl((t - a) / (b - a));
export const rebote = (t, en, c = 11, k = 170) => { const d = t - en; if (d <= 0) return 0; const m = 0.7, w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
  if (z >= 1) return 1 - Math.exp(-w0 * d) * (1 + w0 * d); const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * d) * (Math.cos(wd * d) + z * w0 / wd * Math.sin(wd * d)); };
export const ease = (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, u = x;
  for (let i = 0; i < 30; i++) { u = (lo + hi) / 2; const bx = 3 * (1 - u) * (1 - u) * u * 0.16 + 3 * (1 - u) * u * u * 0.3 + u * u * u; if (bx < x) lo = u; else hi = u; }
  return 3 * (1 - u) * (1 - u) * u + 3 * (1 - u) * u * u + u * u * u; };
export const enOut = (x) => x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
export const mss = (r) => `${Math.floor(r / 60)}:${String(Math.floor(r % 60)).padStart(2, '0')}`;
export const plata = (n) => '$' + Math.round(n).toLocaleString('es-AR');
