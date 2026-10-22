// Capas 2D del ep. 5 encima del 3D de la oficina (las mismas del ep. 4, sin golpes): el cuadro copiado a un lienzo (acc) con zoom y
// aberración de los golpes, efectos y carteles de transmisión (fxF), subtítulos de siempre arriba, destello y el logo final.
// crearGraficos(...) devuelve las herramientas de dibujo; ep5.js pone los carteles propios del episodio con `letreros`.
import { cl, tramo, expo, azar, imp, lin, rebote, ease } from './curvas.js';

const CSS = `
#ep5 canvas{position:fixed;left:0;top:0}
#velo{position:fixed;left:0;right:0;top:0;height:34%;background:linear-gradient(180deg,rgba(5,5,6,.78) 0%,rgba(5,5,6,.55) 45%,rgba(5,5,6,0) 100%);opacity:0;pointer-events:none}
#sub{position:fixed;left:5%;right:5%;top:15.5%;text-align:center;font-family:"Inter Tight",sans-serif;font-weight:600;color:#f4f4f5;letter-spacing:-.045em;line-height:1.05;text-wrap:balance;text-shadow:0 4px 24px rgba(0,0,0,.55)}
#sub span{display:inline-block;white-space:pre}
#sub .ac{font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;font-size:1.19em;letter-spacing:-.02em;color:#34d399}
#flash{position:fixed;inset:0;background:#effff8;opacity:0;pointer-events:none}
#cierre{position:fixed;left:0;right:0;display:none;flex-direction:column;align-items:center}
#cierre .marca{font-family:"Inter Tight",sans-serif;font-weight:600;letter-spacing:.4em;margin-left:.4em;color:#a7f3d0;text-shadow:0 2px 14px rgba(0,0,0,.7),0 0 22px rgba(16,185,129,.35);white-space:nowrap}
#cierre .tag{font-family:"Inter Tight",sans-serif;font-weight:600;color:#f4f4f5;letter-spacing:-.045em;line-height:1.1;text-align:center;white-space:nowrap}
#cierre .tag span{display:inline-block}`;
const HEX = 'points="50,10 85,32 85,68 50,90 15,68 15,32"', ESTR = 'd="M50,30 L54.7,43.53 L69.02,43.82 L57.61,52.47 L61.76,66.18 L50,58 L38.24,66.18 L42.39,52.47 L30.98,43.82 L45.3,43.53 Z"';
const HTML = `<div id="velo"></div><div id="sub"></div><div id="flash"></div>
<div id="cierre"><div id="logo"><svg viewBox="0 0 100 100" style="overflow:visible;width:100%;height:100%"><polygon id="hex" ${HEX} fill="none" stroke="#10b981" stroke-width="6" stroke-linejoin="miter" pathLength="1" stroke-dasharray="1"/><path id="estr" ${ESTR} fill="#10b981" style="transform-origin:50px 50px;transform-box:view-box"/></svg></div>
<div class="marca">RING CLOSERS</div><div class="tag"><div><span>Ep. 5 —</span></div><div><span>Ya pagó.</span></div></div></div>`;

export async function crearGraficos({ THREE, W, H, MU, renderer, camera, plano, CLAVE, ZOC, cabezas, golpes = [], letreros = () => {}, efectos3D = () => {}, cortesFlash = {} }) {
  const K = W / 1080, F = 1 / 60, Rr = (px) => px * K;
  document.documentElement.style.fontSize = K + 'px';
  const ln = document.createElement('link'); ln.rel = 'stylesheet';
  ln.href = 'https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,300..900;1,62..125,300..900&family=Inter+Tight:wght@500;600;700;800&family=Instrument+Serif:ital@0;1&display=block';
  document.head.append(ln, Object.assign(document.createElement('style'), { textContent: CSS }));
  const raiz = Object.assign(document.createElement('div'), { id: 'ep5' }); raiz.style.cssText = 'position:fixed;inset:0;z-index:5;pointer-events:none';
  const capa = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const acc = capa(), fxF = capa(); raiz.append(acc, fxF); raiz.insertAdjacentHTML('beforeend', HTML); document.body.append(raiz);
  renderer.domElement.style.visibility = 'hidden';   // el 3D se ve a través de acc (así el vidrio, el temblor y el desenfoque final lo tocan)
  const ac = acc.getContext('2d'), gF = fxF.getContext('2d');
  const $ = (id) => document.getElementById(id), sub = $('sub'), velo = $('velo'), cierre = $('cierre'), hex = $('hex'), estr = $('estr'), flash = $('flash');
  await new Promise((r) => (ln.sheet ? r() : ln.addEventListener('load', r, { once: true }) || setTimeout(r, 8000)));
  await document.fonts.ready; await Promise.all(['500 40px "Inter Tight"', '600 40px "Inter Tight"', '700 40px "Inter Tight"', '800 40px "Inter Tight"', 'italic 400 40px "Instrument Serif"'].map((f) => document.fonts.load(f, 'Ya pagó ¿— 23:59✔')));

  // ---- el 3D al lienzo: zoom de los golpes y aberración cromática (rojo un poco más grande, azul más chico) ----
  const t1 = capa(), t2 = capa(), t3 = capa(), g1 = t1.getContext('2d'), g2 = t2.getContext('2d'), g3 = t3.getContext('2d');
  const escala = (g, src, z, cx, cy) => { g.save(); g.translate(cx * W, cy * H); g.scale(z, z); g.translate(-cx * W, -cy * H); g.drawImage(src, 0, 0, W, H); g.restore(); };
  const canal = (g, src, z, cx, cy, col) => { g.globalCompositeOperation = 'source-over'; escala(g, src, z, cx, cy); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; };
  const pintar3D = (a, { zoom = 0, ca = 0, cx = 0.5, cy = 0.5 } = {}) => { const src = renderer.domElement, z = 1 + zoom;
    ac.save(); ac.globalAlpha = a;
    if (ca < 0.002) escala(ac, src, z, cx, cy);
    else { canal(g1, src, z * (1 + ca), cx, cy, '#ff0000'); canal(g2, src, z * (1 - ca), cx, cy, '#0000ff'); canal(g3, src, z, cx, cy, '#00ff00');
      g3.globalCompositeOperation = 'lighter'; g3.drawImage(t1, 0, 0); g3.drawImage(t2, 0, 0); g3.globalCompositeOperation = 'source-over'; ac.drawImage(t3, 0, 0); }
    ac.restore(); };

  // ---- dibujo: texto que deja su caja en window.CAJAS, vidrio esmerilado, paneles ----
  window.CAJAS = [];
  const tx = (g, partes, x, y, o = {}) => { const { al = 'left', a = 1, track = 0, clip = null } = o; if (a <= 0.003) return 0; g.save(); g.globalAlpha = Math.min(1, a); g.textBaseline = 'alphabetic'; g.letterSpacing = track + 'px';
    const ws = partes.map(([s, f]) => { g.font = f; return g.measureText(s).width; }), tot = ws.reduce((p, q) => p + q, 0); let cx = al === 'center' ? x - tot / 2 : al === 'right' ? x - tot : x;
    if (a > 0.05) { const px = Math.max(...partes.map(([, f]) => +/([\d.]+)px/.exec(f)[1])); let y0 = y - 0.78 * px, y1 = y0 + px; if (clip) { y0 = Math.max(y0, clip[0]); y1 = Math.min(y1, clip[1]); } if (y1 > y0) window.CAJAS.push({ x: cx, y: y0, w: tot, h: y1 - y0, s: partes.map(p => p[0]).join('') }); }
    partes.forEach(([s, f, c], i) => { g.font = f; g.fillStyle = c; g.fillText(s, cx, y); cx += ws[i]; }); g.restore(); return tot; };
  const IT = (px, w = 600) => `${w} ${px}px "Inter Tight"`, MO = (px) => `600 ${Math.round(px * 1.25)}px "Inter Tight"`, SE = (px) => `italic 400 ${px}px "Instrument Serif"`;
  const ancho = (g, s, f, track = 0) => { g.save(); g.font = f; g.letterSpacing = track + 'px'; const w = g.measureText(s).width; g.restore(); return w; };
  const vidrio = (g, x, y, w, h, a, tinte = 'rgba(8,11,16,0.58)') => { if (a <= 0.003 || w <= 1 || h <= 1) return; const R = Math.min(22 * K, h / 2, w / 2);
    g.save(); g.globalAlpha = a * 0.55; g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 50 * K; g.shadowOffsetY = 18 * K; g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.roundRect(x, y, w, h, R); g.fill(); g.restore();
    g.save(); g.globalAlpha = a; g.beginPath(); g.roundRect(x, y, w, h, R); g.clip();
    g.filter = `blur(${Math.round(22 * K)}px) saturate(0.7)`; g.drawImage(acc, 0, 0, W, H); g.filter = 'none'; g.fillStyle = tinte; g.fillRect(x, y, w, h);
    const lz = g.createLinearGradient(0, y, 0, y + h); lz.addColorStop(0, 'rgba(255,255,255,0.10)'); lz.addColorStop(0.4, 'rgba(255,255,255,0)'); g.fillStyle = lz; g.fillRect(x, y, w, h);
    g.restore(); g.save(); g.globalAlpha = a; g.lineWidth = Math.max(1, 1.2 * K); const bd = g.createLinearGradient(0, y, 0, y + h); bd.addColorStop(0, 'rgba(255,255,255,0.30)'); bd.addColorStop(1, 'rgba(255,255,255,0.08)');
    g.strokeStyle = bd; g.beginPath(); g.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, R); g.stroke(); g.restore(); };
  const panel = (g, x, y, w, h, e, a, acento, cont, tinte) => { const ww = w * e; if (ww <= 1 || a <= 0.003) return; vidrio(g, x, y, ww, h, a, tinte);
    g.save(); g.globalAlpha = a; g.fillStyle = acento; g.beginPath(); g.roundRect(x + 16 * K, y + h * 0.24, 3 * K, h * 0.52, 1.5 * K); g.fill(); g.restore();
    g.save(); g.beginPath(); g.roundRect(x, y, ww, h, Math.min(22 * K, h / 2, ww / 2)); g.clip(); cont(); g.restore(); };
  const sube = (k, px) => (1 - expo(k)) * px * K;
  const pantalla = (p) => { const v = p.clone().project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z < 1 && Math.abs(v.x) < 1.3 && Math.abs(v.y) < 1.3]; };

  // ---- golpes: onda, destello, chispas, líneas de velocidad, barrido anamórfico, temblor, zoom y aberración ----
  const rafaga = (nn, v0, v1, vida, cols, gr, sem) => { const r = azar(sem); return Array.from({ length: nn }, () => ({ an: r() * Math.PI * 2, v: (v0 + (v1 - v0) * r() ** 1.7) * K, vida: vida[0] + (vida[1] - vida[0]) * r(), c: cols[r() * cols.length | 0], w: (1 + r() * 2.4) * K, gr })); };
  let GOLPES = [];
  const recalcular = () => (GOLPES = golpes.map((g) => ({ ...g, plano: plano(g.t + 1e-4).plano })));
  let _ck = '';
  const donde = (g) => (g._pos ||= {})[_ck] ||= g.at();
  const enPlano = (t) => GOLPES.filter((g) => g.plano === plano(t).plano);
  const sacudir = (t) => enPlano(t).reduce((m, g) => m + g.sh * imp(t, g.t, 9), 0) * K;
  const post = (t) => { const gs = enPlano(t); return { zoom: gs.reduce((m, g) => m + g.zoom * imp(t, g.t, 9), 0), ca: gs.reduce((m, g) => m + g.ca * imp(t, g.t, 7), 0) }; };
  const granoC = document.createElement('canvas'); granoC.width = granoC.height = 256; { const g = granoC.getContext('2d'), im = g.createImageData(256, 256), a = azar(5);
    for (let i = 0; i < im.data.length; i += 4) { const v = a() * 255; im.data.set([v, v, v, 255 * 0.5 * a()], i); } g.putImageData(im, 0, 0); }

  function efectos(t, s) { const g = gF; g.clearRect(0, 0, W, H); _ck = s.plano + ':' + camera.position.toArray().map(x => x.toFixed(1)).join(',');
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (const gp of GOLPES) { if (!gp.lv || gp.plano !== s.plano) continue; const lv = gp.lv * imp(t, gp.t, 6); if (lv < 0.02) continue; const [cx, cy] = donde(gp), a = azar(Math.floor(t * 24) + 3);
      for (let i = 0; i < 110; i++) { const an = a() * Math.PI * 2, r0 = (0.3 + a() * 0.25) * W, r1 = r0 + (0.3 + a() * 0.8) * W, w = (0.8 + a() * 4) * K, c = Math.cos(an), sn = Math.sin(an);
        g.beginPath(); g.moveTo(cx + c * r0, cy + sn * r0); g.lineTo(cx + c * r1 - sn * w, cy + sn * r1 + c * w); g.lineTo(cx + c * r1 + sn * w, cy + sn * r1 - c * w); g.fillStyle = `rgba(${gp.col},${lv * (0.18 + a() * 0.4)})`; g.fill(); } }
    for (const gp of GOLPES) { const a = t - gp.t; if (a < 0 || a > 1.4 || gp.plano !== s.plano) continue; const [x, y] = donde(gp);
      if (a < 0.7) { const uu = a / 0.7, rr = gp.R * W * expo(uu * 1.2); g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.strokeStyle = `rgba(${gp.col},${0.25 * (1 - uu)})`; g.lineWidth = gp.lw * 3 * K * (1 - uu) ** 2 + 1; g.stroke();
        g.strokeStyle = `rgba(${gp.col},${0.9 * (1 - uu) ** 1.5})`; g.lineWidth = gp.lw * K * (1 - uu) ** 2 + 1; g.stroke();
        if (a < 0.16 && gp.sh) { const R = W * 0.22 * Math.max(0.35, gp.R), c = g.createRadialGradient(x, y, 0, x, y, R); c.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - a / 0.16)})`); c.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = c; g.fillRect(x - R, y - R, 2 * R, 2 * R); } }
      const kd = 3.2, pos = (p, tt) => { const d = (1 - Math.exp(-kd * tt)) / kd; return [x + Math.cos(p.an) * p.v * d, y + Math.sin(p.an) * p.v * d + 0.5 * p.gr * K * tt * tt]; };
      gp.p.forEach(p => { if (a > p.vida) return; const uu = a / p.vida, al = (1 - uu) ** 1.4, [x1, y1] = pos(p, a), [x0, y0] = pos(p, Math.max(0, a - 0.035));
        g.strokeStyle = p.c; g.globalAlpha = al * 0.22; g.lineWidth = p.w * 4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.globalAlpha = al; g.lineWidth = p.w; g.stroke(); }); g.globalAlpha = 1;
      const fl = (gp.ana || 0) * imp(t, gp.t, 3.2); if (fl > 0.02) { const gl = g.createLinearGradient(0, 0, W, 0), c0 = '16,185,129';
        gl.addColorStop(0, `rgba(${c0},0)`); gl.addColorStop(cl(x / W), `rgba(235,255,248,${fl})`); gl.addColorStop(1, `rgba(${c0},0)`); g.fillStyle = gl; g.fillRect(0, y - 1.5 * K, W, 3 * K); g.globalAlpha = 0.35; g.fillRect(0, y - 9 * K, W, 18 * K); g.globalAlpha = 1; } }
    efectos3D(g, t, s, api);   // lo propio del episodio que va con luz (la sombra, el aire que corta la piña)
    g.restore();
    letreros(g, t, s, api);
    const v = g.createRadialGradient(W * 0.5, H * 0.48, H * 0.34, W * 0.5, H * 0.48, W * 0.95); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.62)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    const ga = azar(Math.floor(t * 24) + 9); g.globalAlpha = 0.07; g.fillStyle = g.createPattern(granoC, 'repeat'); g.save(); g.translate(-ga() * 256, -ga() * 256); g.fillRect(0, 0, W + 256, H + 256); g.restore(); g.globalAlpha = 1;
  }

  // ---- subtítulos: la frase de la voz arriba, palabra por palabra, la clave en serif esmeralda; nunca encima de una cabeza ----
  let subAbajo = false;
  const peso = (w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 1.5;
  const reparto = (ws, a, b) => { const p = ws.map(peso), tot = p.reduce((x, y) => x + y, 0); let acu = 0; return ws.map((w, i) => { const en = a + (b - a) * acu / tot; acu += p[i]; return en; }); };
  const FRASES = MU.voces.map((v) => {
    if (!v.recorte) { const ws = v.texto.split(/\s+/), ens = reparto(ws, ...v.habla); return { v, palabras: ws.map((w, i) => ({ w, en: ens[i] - 2 * F, ac: w === CLAVE[v.id] })) }; }
    // p51 entera, con tiempos dentro de la toma (tr): «Sí… ahora.» | pausa | «Lo hago hoy… socia y te transfiero.» | «Dale… noche.»
    const C = MU.cortes, ws = v.texto.split(/\s+/), iA = ws.indexOf('ahora.') + 1, iT = ws.indexOf('transfiero.') + 1, iS = ws.indexOf('socia');
    const tA = reparto(ws.slice(0, iA), C.si + 0.03, C.ahora - 0.25), ritmo = (C.ahora - 0.25 - C.si) / ws.slice(0, iA).reduce((x, w) => x + peso(w), 0);
    const pre = ws.slice(iA, iS), tB0 = C.socia - 0.18 - ritmo * pre.reduce((x, w) => x + peso(w), 0);
    const trs = [...tA, ...reparto(pre, tB0, C.socia - 0.18), ...reparto(ws.slice(iS, iT), C.socia - 0.18, C.transfiero - 0.2), ...reparto(ws.slice(iT), C.dale + 0.03, C.noche - 0.3)];
    const palabras = ws.map((w, i) => ({ w, en: v.desde + trs[i] - 2 * F, ac: w === CLAVE[v.id] })).filter((p, i) => trs[i] >= v.recorte[0] - 0.05 && trs[i] < v.recorte[1]);
    return { v, palabras }; });
  sub.style.fontSize = 78 * K + 'px';
  let fraseActual = null, lugarClave = null;
  const ULT = MU.edl[MU.edl.length - 1], NEGRO = ULT.plano - 1;
  const caras = () => cabezas().map(([c, arriba, abajo]) => {
    const a = c.clone().add(new THREE.Vector3(0, arriba, 0)).project(camera), b = c.clone().add(new THREE.Vector3(0, -abajo, 0)).project(camera), m = c.clone().project(camera);
    return { y0: (1 - a.y) / 2, y1: (1 - b.y) / 2, ok: m.z < 1 && Math.abs(m.x) < 1.15 && c.distanceTo(camera.position) < 9 }; }).filter((h) => h.ok && h.y1 > 0 && h.y0 < 1);
  function ubicarSub() {
    const h = sub.offsetHeight / H, mg = 0.025, cs = caras(), libre = (a) => cs.every((c) => a + h + mg < c.y0 || a - mg > c.y1);
    let top = 0.155, abajo = false;
    if (!libre(top)) { const enc = Math.min(...cs.map((c) => c.y0)) - h - mg * 1.5;
      if (enc >= 0.15 && libre(enc)) top = enc; else { top = 0.71; abajo = true; } }
    subAbajo = abajo; sub.style.top = (top * 100).toFixed(2) + '%';
    Object.assign(velo.style, abajo ? { top: 'auto', bottom: '0', height: '42%', background: 'linear-gradient(0deg,rgba(5,5,6,.82) 0%,rgba(5,5,6,.6) 50%,rgba(5,5,6,0) 100%)' }
      : { top: '0', bottom: 'auto', height: Math.max(34, (top + h) * 100 + 14) + '%', background: '' });
  }
  function subtitulos(t, s) {
    const f = s.plano >= NEGRO ? null : FRASES.find(({ v }) => t >= v.habla[0] - 0.5 && t < v.habla[1] + 0.3 + 10 * F);
    if (f !== fraseActual) { fraseActual = f; sub.innerHTML = f ? f.palabras.map((p) => `<span${p.ac ? ' class="ac"' : ''}>${p.w}</span>`).join(' ') : ''; }
    if (!f) { velo.style.opacity = 0; subAbajo = false; sub.style.opacity = 0; return; }
    const clave = f.v.id + '/' + f.v.desde + '/' + s.plano; if (clave !== lugarClave) { lugarClave = clave; ubicarSub(); }
    const hasta = f.v.habla[1] + 0.3, op = 1 - lin(t, hasta - 2 * F, hasta + 8 * F);
    sub.style.opacity = op; sub.style.filter = op < 1 ? `blur(${(1 - op) * 18 * K}px)` : '';
    sub.style.transform = `translate(${Math.sin(t * 60 / 110) * 7 * K}px, ${Math.sin(t * 60 / 80) * 5 * K}px)`;
    velo.style.opacity = op * lin(t, f.palabras[0].en - 6 * F, f.palabras[0].en + 6 * F) * 0.85;
    sub.querySelectorAll('span').forEach((el, i) => { const p = f.palabras[i], r = rebote(t, p.en, 13, 160), vis = lin(t, p.en - F, p.en + 7 * F);
      el.style.opacity = vis; el.style.transform = `translateY(${(1 - r) * 40 * K}px) scale(${0.95 + 0.05 * r})`; el.style.filter = vis < 1 ? `blur(${(1 - vis) * 14 * K}px)` : '';
      if (p.ac) el.style.textShadow = `0 0 ${40 * K}px rgba(16,185,129,${0.45 * (1 - 0.6 * lin(t, p.en, p.en + 30 * F))})`; });
  }

  // ---- zócalo: vidrio, filete esmeralda, nombre y rol; nunca debajo de una frase que bajó ----
  function zocalo(g, t, s) { const z = ZOC[s.plano]; if (!z || subAbajo) return; const u = t - s.t0, D = s.t1 - s.t0;
    const e = expo(tramo(u, 0.15, 0.5)), f = 1 - tramo(u, D - 0.25, D - 0.05); if (e * f <= 0) return; const x = Rr(54), y = H * 0.8, h = Rr(118);
    const w = Math.max(ancho(g, z[0], IT(Rr(58)), -Rr(1.5)), ancho(g, z[1], MO(Rr(17)), Rr(4))) + Rr(76), r1 = tramo(u, 0.3, 0.6), r2 = tramo(u, 0.4, 0.7);
    panel(g, x, y, w, h, e, f, '#10b981', () => {
      tx(g, [[z[0], IT(Rr(58)), '#ffffff']], x + Rr(34), y + Rr(64) + sube(r1, 60), { a: f * r1, track: -Rr(1.5) });
      tx(g, [[z[1], MO(Rr(17)), '#6ee7b7']], x + Rr(36), y + Rr(98) + sube(r2, 40), { a: f * r2, track: Rr(4) }); }); }

  // ---- el logo de siempre ----
  const LOGO = ULT.t0 + 0.2, C1 = LOGO + 0.95, C2 = LOGO + 1.75;
  const logoEl = $('logo'), marca = cierre.querySelector('.marca'), tag = cierre.querySelector('.tag'), tagPal = [...tag.querySelectorAll('span')];
  Object.assign(logoEl.style, { width: 240 * K + 'px', height: 240 * K + 'px', filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.55))' });
  cierre.style.top = 470 * K + 'px'; Object.assign(marca.style, { marginTop: 30 * K + 'px', fontSize: 40 * K + 'px' }); Object.assign(tag.style, { marginTop: 56 * K + 'px', fontSize: 84 * K + 'px' });
  function final(t, s) {
    const en = s.plano === ULT.plano; cierre.style.display = en ? 'flex' : 'none';
    if (s.plano === NEGRO) { acc.style.filter = 'brightness(0)'; return; }
    acc.style.filter = en ? 'brightness(0)' : '';   // la placa va sobre negro puro: nada de la escena detrás del título
    if (false) acc.style.filter = en ? `blur(${(2 + 5 * lin(t, ULT.t0, ULT.t0 + 0.4)) * K}px) brightness(${1 - 0.68 * ease(lin(t, ULT.t0, ULT.t0 + 0.4))})` : '';
    if (!en) return;
    cierre.style.opacity = lin(t, ULT.t0, ULT.t0 + 24 * F);
    hex.setAttribute('stroke-dashoffset', 1 - ease(lin(t, LOGO, LOGO + 20 * F)));
    const e = ease(lin(t, LOGO + 14 * F, LOGO + 26 * F)); estr.style.opacity = e; estr.style.scale = String(0.7 + 0.3 * e);
    logoEl.style.transform = `scale(${0.85 + 0.15 * rebote(t, LOGO, 12, 170)})`;
    marca.style.opacity = lin(t, LOGO + 6 * F, LOGO + 22 * F); marca.style.transform = `translateY(${(1 - ease(lin(t, LOGO + 6 * F, LOGO + 26 * F))) * 16 * K}px)`;
    tagPal.forEach((el, i) => { const en2 = i === 0 ? C1 : C2, a = ease(lin(t, en2 - 4 * F, en2 + 14 * F));
      el.style.opacity = a; el.style.filter = a < 1 ? `blur(${(1 - a) * 8 * K}px)` : ''; el.style.transform = `translateY(${(1 - a) * 16 * K}px)`;
      if (i === 1) { const on = t >= en2 + 6 * F; el.style.color = on ? '#34d399' : '#f4f4f5'; el.style.fontFamily = on ? '"Instrument Serif",serif' : ''; el.style.fontStyle = on ? 'italic' : ''; el.style.fontWeight = on ? 400 : '';
        el.style.fontSize = on ? '1.19em' : ''; el.style.letterSpacing = on ? '-0.02em' : ''; el.style.textShadow = on ? `0 0 ${40 * K}px rgba(16,185,129,0.4)` : ''; } });
  }

  // ---- un cuadro entero de capas; las cajas del DOM se suman a las del lienzo para chequear que nada se pise ----
  const cajaDom = (el, s) => { const r = el.getBoundingClientRect(); if (r.width > 1 && r.height > 1) window.CAJAS.push({ x: r.left, y: r.top, w: r.width, h: r.height, s, dom: 1 }); };
  function textos(t, s) {
    window.CAJAS = [];
    subtitulos(t, s); efectos(t, s); final(t, s);
    const tb = sacudir(t), dx = Math.sin(t * 91) * tb, dy = Math.cos(t * 77) * tb;
    [acc, fxF].forEach(el => (el.style.transform = `translate(${dx}px,${dy}px)` + (s.plano === ULT.plano ? ' scale(1.08)' : '')));
    fxF.style.opacity = s.plano >= NEGRO ? 0 : 1;
    const cf = cortesFlash[s.plano], corte = cf && t - s.t0 < 0.1 ? cf * (1 - (t - s.t0) / 0.1) : 0;
    flash.style.opacity = Math.max(...enPlano(t).map(g => g.fl * imp(t, g.t, 12)), corte, 0);
    if (+sub.style.opacity > 0.05) sub.querySelectorAll('span').forEach((el) => { if (+el.style.opacity > 0.05) cajaDom(el, 'sub:' + el.textContent); });
  }
  const api = { recalcular, K, F, Rr, W, H, acc, ac, fxF, gF, tx, IT, MO, SE, ancho, vidrio, panel, sube, pantalla, rafaga, zocalo, pintar3D, post, textos, flash, get subAbajo() { return subAbajo; } };
  return api;
}
