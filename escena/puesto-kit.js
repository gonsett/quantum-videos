// Kit del puesto personalizable (muestra). Se porta a components/office/desk-kit.ts.
// Todo se arma con geometría simple + texturas de canvas chicas: liviano en celular.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CATALOG = {
  desk: {
    roble: { label: 'Roble natural', base: [28, 45, 58], grain: '#6b3f1f' },
    nogal: { label: 'Nogal', base: [22, 38, 30], grain: '#1e1008' },
    fresno: { label: 'Fresno claro', base: [36, 30, 76], grain: '#8a6a48' },
    ebano: { label: 'Roble ebonizado', base: [30, 6, 14], grain: '#000000' },
    marmol: { label: 'Mármol Carrara', marble: true },
  },
  chair: {
    grafito: { label: 'Tela grafito', color: 0x4a4f58, rough: 0.9 },
    negro: { label: 'Cuero negro', color: 0x17171a, rough: 0.38 },
    conac: { label: 'Cuero coñac', color: 0x7a3f1d, rough: 0.42 },
    arena: { label: 'Tela arena', color: 0xc6b79c, rough: 0.92 },
    bosque: { label: 'Pana verde bosque', color: 0x26402f, rough: 0.82 },
    noche: { label: 'Pana azul noche', color: 0x1f2a40, rough: 0.82 },
  },
  plant: {
    ninguna: { label: 'Sin planta' },
    monstera: { label: 'Monstera' },
    sansevieria: { label: 'Sansevieria' },
    olivo: { label: 'Olivo en maceta' },
    ficus: { label: 'Ficus lyrata' },
  },
  object: {
    taza: { label: 'Taza de café' },
    lampara: { label: 'Lámpara de escritorio' },
    auriculares: { label: 'Auriculares' },
    libreta: { label: 'Libreta y lapicera' },
    campana: { label: 'Campana de ring' },
    reloj: { label: 'Reloj de arena' },
    libros: { label: 'Pila de libros' },
    bonsai: { label: 'Bonsái' },
  },
  wallpaper: {
    panel: { label: 'Panel (métricas)' },
    aurora: { label: 'Aurora esmeralda' },
    dunas: { label: 'Dunas al atardecer' },
    ring: { label: 'Ring de noche' },
    ciudad: { label: 'Ciudad de noche' },
    marea: { label: 'Marea' },
  },
};

const rnd0 = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

// ---------- texturas ----------
const texCache = new Map();
function canvasTex(key, w, h, draw) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
}

function deskTex(id) {
  const f = CATALOG.desk[id];
  return canvasTex('desk:' + id, 512, 256, (g, w, h) => {
    const r = rnd0(id.length * 977 + 3);
    if (f.marble) {
      g.fillStyle = '#eeece8'; g.fillRect(0, 0, w, h);
      // nubes grises suaves + vetas finas que cruzan en diagonal
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(150,150,155,${0.025 + r() * 0.03})`;
        g.beginPath(); g.ellipse(r() * w, r() * h, 40 + r() * 120, 10 + r() * 40, r() * 3, 0, 7); g.fill();
      }
      for (let v = 0; v < 7; v++) {
        g.strokeStyle = `rgba(110,110,118,${0.25 + r() * 0.35})`;
        g.lineWidth = 0.6 + r() * 1.4;
        g.beginPath();
        let x = r() * w, y = 0;
        g.moveTo(x, y);
        while (y < h) { x += (r() - 0.35) * 40; y += 10 + r() * 20; g.lineTo(x, y); }
        g.stroke();
      }
      return;
    }
    const [hu, sa, li] = f.base;
    g.fillStyle = `hsl(${hu} ${sa}% ${li}%)`; g.fillRect(0, 0, w, h);
    // vetas largas a lo ancho de la tapa
    for (let i = 0; i < 140; i++) {
      const y = r() * h;
      g.globalAlpha = 0.04 + r() * 0.08;
      g.strokeStyle = f.grain;
      g.lineWidth = 0.5 + r() * 2.2;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x / 90 + i) * 3 * r());
      g.stroke();
    }
    g.globalAlpha = 1;
  });
}

function wallpaperTex(id) {
  return canvasTex('wp:' + id, 512, 288, (g, w, h) => {
    const r = rnd0(41);
    const lin = (stops, x1 = 0, y1 = 0, x2 = 0, y2 = h) => {
      const gr = g.createLinearGradient(x1, y1, x2, y2);
      stops.forEach(([o, c]) => gr.addColorStop(o, c));
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    };
    if (id === 'panel') {
      g.fillStyle = '#0d1110'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#17211d'; g.fillRect(20, 18, w - 40, 30);
      g.fillStyle = '#10b981';
      [60, 88, 74, 120, 104, 150, 136].forEach((v, i) => g.fillRect(40 + i * 64, h - 20 - v, 34, v));
      g.strokeStyle = '#6ee7b7'; g.lineWidth = 4; g.beginPath();
      [170, 160, 166, 140, 146, 112, 96].forEach((v, i) => (i ? g.lineTo(57 + i * 64, v) : g.moveTo(57, v)));
      g.stroke();
      return;
    }
    if (id === 'aurora') {
      lin([[0, '#03110d'], [1, '#062a22']]);
      g.globalCompositeOperation = 'lighter';
      for (let b = 0; b < 3; b++) {
        g.strokeStyle = ['rgba(16,185,129,0.22)', 'rgba(52,211,153,0.16)', 'rgba(45,212,191,0.12)'][b];
        for (let k = 0; k < 26; k++) {
          g.lineWidth = 6 + r() * 10;
          g.beginPath();
          for (let x = -20; x <= w + 20; x += 16) g.lineTo(x, 90 + b * 40 + Math.sin(x / (70 + b * 20) + b) * 36 + k * 1.2);
          g.stroke();
        }
      }
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#020806';
      g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 24) g.lineTo(x, h - 40 - Math.abs(Math.sin(x / 60)) * 26 - r() * 6);
      g.lineTo(w, h); g.fill();
      return;
    }
    if (id === 'dunas') {
      lin([[0, '#f3c79a'], [0.55, '#e48a5d'], [1, '#8f4a3a']]);
      g.fillStyle = 'rgba(255,240,220,0.9)'; g.beginPath(); g.arc(w * 0.7, h * 0.42, 22, 0, 7); g.fill();
      const cols = ['#c26b47', '#a4553b', '#7e3f30', '#5a2d25'];
      cols.forEach((c, i) => {
        g.fillStyle = c; g.beginPath(); g.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (0.5 + i * 0.13) + Math.sin(x / (80 + i * 30) + i * 2) * (16 - i * 2));
        g.lineTo(w, h); g.fill();
      });
      return;
    }
    if (id === 'ring') {
      lin([[0, '#050507'], [1, '#121216']]);
      // foco cenital sobre la lona
      const sp = g.createRadialGradient(w / 2, h * 0.72, 4, w / 2, h * 0.72, 190);
      sp.addColorStop(0, 'rgba(255,248,235,0.55)'); sp.addColorStop(1, 'rgba(255,248,235,0)');
      g.fillStyle = sp; g.fillRect(0, 0, w, h);
      g.fillStyle = '#2b2b30';
      g.beginPath(); g.moveTo(w * 0.12, h); g.lineTo(w * 0.3, h * 0.6); g.lineTo(w * 0.7, h * 0.6); g.lineTo(w * 0.88, h); g.fill();
      // cuerdas
      for (let k = 0; k < 3; k++) {
        g.strokeStyle = k === 1 ? '#e7e2d6' : '#b8b2a6'; g.lineWidth = 3 - k * 0.6;
        const y = h * (0.42 + k * 0.08);
        g.beginPath(); g.moveTo(w * 0.04, y + 34); g.lineTo(w * 0.3, y); g.lineTo(w * 0.7, y); g.lineTo(w * 0.96, y + 34); g.stroke();
      }
      g.fillStyle = '#1c1c20'; g.fillRect(w * 0.29, h * 0.36, 6, h * 0.28); g.fillRect(w * 0.7, h * 0.36, 6, h * 0.28);
      return;
    }
    if (id === 'ciudad') {
      lin([[0, '#0b1020'], [0.7, '#1c2440'], [1, '#2a2a3a']]);
      for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.5})`; g.fillRect(r() * w, r() * h * 0.4, 1, 1); }
      let x = 0;
      while (x < w) {
        const bw = 18 + r() * 34, bh = 50 + r() * 140;
        g.fillStyle = '#0a0d18'; g.fillRect(x, h - bh, bw, bh);
        for (let wy = h - bh + 6; wy < h - 6; wy += 9)
          for (let wx = x + 4; wx < x + bw - 4; wx += 7)
            if (r() < 0.32) { g.fillStyle = r() < 0.8 ? 'rgba(255,214,150,0.85)' : 'rgba(170,200,255,0.8)'; g.fillRect(wx, wy, 3, 4); }
        x += bw + 2;
      }
      return;
    }
    if (id === 'marea') {
      lin([[0, '#dfe8ea'], [1, '#9db6bd']]);
      for (let k = 0; k < 9; k++) {
        g.fillStyle = `rgba(${30 + k * 6},${70 + k * 8},${90 + k * 6},${0.18 + k * 0.05})`;
        g.beginPath(); g.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) g.lineTo(x, h * 0.35 + k * 20 + Math.sin(x / 70 + k * 0.9) * 12);
        g.lineTo(w, h); g.fill();
      }
    }
  });
}

/** Lo que muestra el monitor: el fondo elegido + un dock fino. En llamada, la app pisa esto. */
export function screenMaterial(id) {
  const base = wallpaperTex(id);
  return new THREE.MeshBasicMaterial({ map: base, toneMapped: false });
}

// ---------- materiales compartidos ----------
const matCache = new Map();
const mat = (key, make) => (matCache.has(key) ? matCache.get(key) : (matCache.set(key, make()), matCache.get(key)));
const std = (key, o) => mat(key, () => new THREE.MeshStandardMaterial(o));

function rbox(w, h, d, m, light) {
  const rr = Math.min(0.03, Math.min(w, h, d) * 0.3);
  return new THREE.Mesh(light || rr < 0.006 ? new THREE.BoxGeometry(w, h, d) : new RoundedBoxGeometry(w, h, d, 2, rr), m);
}
function at(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

// ---------- silla ----------
function chair(cfg, light) {
  const c = CATALOG.chair[cfg.chair] || CATALOG.chair.grafito;
  const up = std('chair:' + cfg.chair, { color: c.color, roughness: c.rough, metalness: 0 });
  const metal = std('chairMetal', { color: 0x2a2b2f, roughness: 0.35, metalness: 0.8 });
  const g = new THREE.Group();
  g.add(at(rbox(0.6, 0.11, 0.56, up, light), 0, 0.5, 0.02));
  const back = at(rbox(0.56, 0.68, 0.09, up, light), 0, 0.93, 0.29);
  back.rotation.x = -0.12;
  g.add(back);
  for (const s of [-1, 1]) {
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.04), metal), 0.31 * s, 0.6, 0.06));
    g.add(at(rbox(0.06, 0.03, 0.32, up, light), 0.31 * s, 0.71, 0.04));
  }
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.38, 12), metal), 0, 0.27, 0));
  // base de 5 rayos
  for (let i = 0; i < 5; i++) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.32), metal);
    leg.position.set(Math.sin((i / 5) * 6.283) * 0.16, 0.06, Math.cos((i / 5) * 6.283) * 0.16);
    leg.rotation.y = (i / 5) * 6.283;
    g.add(leg);
  }
  return g;
}

// ---------- plantas de piso ----------
function leafShapeMonstera() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.22, 0.05, 0.26, 0.32, 0.0, 0.5);
  s.bezierCurveTo(-0.26, 0.32, -0.22, 0.05, 0, 0);
  // agujeros característicos
  for (const [x, y] of [[0.09, 0.2], [-0.1, 0.24], [0.08, 0.33], [-0.07, 0.36]]) {
    const hole = new THREE.Path();
    hole.absellipse(x, y, 0.025, 0.04, 0, Math.PI * 2, false, x > 0 ? 0.5 : -0.5);
    s.holes.push(hole);
  }
  return s;
}

function pot(kind, h, r, light) {
  const m = {
    blanca: std('potW', { color: 0xf0ece4, roughness: 0.55 }),
    negra: std('potB', { color: 0x1c1c1f, roughness: 0.5 }),
    terracota: std('potT', { color: 0xb5643f, roughness: 0.85 }),
  }[kind];
  const seg = light ? 12 : 28;
  const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, h, seg), m);
  p.position.y = h / 2;
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r * 0.94, 0.02, seg), std('soil', { color: 0x2c2018, roughness: 1 }));
  soil.position.y = h - 0.03;
  const g = new THREE.Group();
  g.add(p, soil);
  return g;
}

function plant(id, light) {
  const g = new THREE.Group();
  const r = rnd0(id.length * 31 + 7);
  const leafMat = (k, c) => mat('leaf:' + k, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide }));
  if (id === 'monstera') {
    g.add(pot('blanca', 0.42, 0.22, light));
    const geo = new THREE.ShapeGeometry(leafShapeMonstera(), light ? 4 : 10);
    const n = light ? 8 : 13;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + r() * 0.4;
      const stemL = 0.3 + r() * 0.32;
      const tilt = 0.25 + r() * 0.55;
      const holder = new THREE.Group();
      holder.position.set(0, 0.4, 0);
      holder.rotation.y = a;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, stemL, 5), leafMat('stem', 0x4b7a3a));
      stem.position.set(0, (stemL / 2) * Math.cos(tilt), (stemL / 2) * Math.sin(tilt));
      stem.rotation.x = tilt;
      holder.add(stem);
      const leaf = new THREE.Mesh(geo, leafMat('mon', 0x2f6b3a));
      leaf.position.set(0, stemL * Math.cos(tilt), stemL * Math.sin(tilt));
      leaf.rotation.x = tilt + 0.55 + r() * 0.35;
      leaf.rotation.z = (r() - 0.5) * 0.5;
      leaf.scale.setScalar(0.6 + r() * 0.3);
      holder.add(leaf);
      g.add(holder);
    }
  } else if (id === 'sansevieria') {
    g.add(pot('negra', 0.36, 0.17, light));
    const n = light ? 9 : 16;
    for (let i = 0; i < n; i++) {
      const hgt = 0.5 + r() * 0.45;
      const s = new THREE.Shape();
      s.moveTo(-0.035, 0); s.quadraticCurveTo(-0.05, hgt * 0.6, 0, hgt); s.quadraticCurveTo(0.05, hgt * 0.6, 0.035, 0);
      const blade = new THREE.Mesh(new THREE.ShapeGeometry(s, 4), leafMat('san', 0x2d4d2c));
      blade.position.set((r() - 0.5) * 0.16, 0.34, (r() - 0.5) * 0.16);
      blade.rotation.set((r() - 0.5) * 0.25, r() * 3.14, (r() - 0.5) * 0.25);
      g.add(blade);
    }
  } else if (id === 'olivo' || id === 'ficus') {
    const olive = id === 'olivo';
    g.add(pot(olive ? 'terracota' : 'blanca', 0.4, 0.2, light));
    const trunkM = std('trunk:' + id, { color: olive ? 0x6f6253 : 0x5a4636, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.9, 6), trunkM);
    trunk.position.y = 0.4 + 0.45;
    g.add(trunk);
    const leafGeo = olive ? new THREE.SphereGeometry(0.026, 5, 3) : new THREE.SphereGeometry(0.075, 6, 4);
    const lm = leafMat(id, olive ? 0x7d8f6a : 0x2f5a2c);
    const n = light ? (olive ? 90 : 24) : olive ? 260 : 46;
    for (let i = 0; i < n; i++) {
      const l = new THREE.Mesh(leafGeo, lm);
      const a = r() * 6.283, rr = Math.sqrt(r()) * (olive ? 0.28 : 0.3);
      l.position.set(Math.cos(a) * rr, (olive ? 1.15 : 0.95) + (r() - 0.3) * (olive ? 0.3 : 0.55), Math.sin(a) * rr);
      l.scale.set(1, olive ? 0.35 : 0.25, olive ? 2.2 : 1.3);
      l.rotation.set(r() * 3, r() * 3, r() * 3);
      g.add(l);
    }
  }
  return g;
}

// ---------- objetos de escritorio ----------
function deskObject(id, light) {
  const g = new THREE.Group();
  const seg = light ? 10 : 24;
  const black = std('objBlack', { color: 0x1a1a1d, roughness: 0.4, metalness: 0.3 });
  const brass = std('brass', { color: 0xc9a253, roughness: 0.28, metalness: 1 });
  const ivory = std('ivory', { color: 0xf3efe7, roughness: 0.45 });
  if (id === 'taza') {
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, seg), ivory), 0, 0.05, 0));
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 12, Math.PI), ivory);
    h.position.set(0.045, 0.05, 0); h.rotation.z = -Math.PI / 2;
    g.add(h);
  } else if (id === 'lampara') {
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.02, seg), black), 0, 0.01, 0));
    const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 6), brass);
    a1.position.set(0, 0.17, 0.03); a1.rotation.x = -0.2; g.add(a1);
    const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), brass);
    a2.position.set(0, 0.36, 0.14); a2.rotation.x = 1.05; g.add(a2);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.11, seg, 1, true), mat('shade', () => new THREE.MeshStandardMaterial({ color: 0x1a1a1d, roughness: 0.4, side: THREE.DoubleSide })));
    shade.position.set(0, 0.31, 0.28); shade.rotation.x = 0.5; g.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), mat('bulb', () => new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff1d6).multiplyScalar(2.2), toneMapped: false })));
    bulb.position.set(0, 0.275, 0.3); g.add(bulb);
  } else if (id === 'auriculares') {
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.015, seg), black), 0, 0.008, 0));
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.24, 6), black), 0, 0.13, 0));
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 8, 20, Math.PI), black);
    band.position.y = 0.2; g.add(band);
    for (const s of [-1, 1]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, seg), black);
      cup.rotation.z = Math.PI / 2; cup.position.set(0.085 * s, 0.17, 0); g.add(cup);
    }
  } else if (id === 'libreta') {
    const nb = at(rbox(0.16, 0.014, 0.22, std('leather', { color: 0x2a2320, roughness: 0.6 }), light), 0, 0.007, 0);
    nb.rotation.y = 0.25; g.add(nb);
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.15, 8), brass);
    pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.5; pen.position.set(0.1, 0.008, 0.02); g.add(pen);
  } else if (id === 'campana') {
    const wood = std('bellWood', { color: 0x3b2618, roughness: 0.5 });
    g.add(at(rbox(0.16, 0.03, 0.16, wood, light), 0, 0.015, 0));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.065, seg, 12, 0, Math.PI * 2, 0, Math.PI / 2), brass);
    dome.position.y = 0.03; g.add(dome);
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), brass), 0, 0.11, 0));
  } else if (id === 'reloj') {
    const glass = mat('hgGlass', () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.25, depthWrite: false }));
    for (const y of [0.005, 0.2]) g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.012, seg), std('hgWood', { color: 0x2b1d14, roughness: 0.5 })), 0, y, 0));
    const pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(0.012 + Math.pow(Math.abs(t - 0.5) * 2, 1.3) * 0.035, 0.01 + t * 0.185)); }
    g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, seg), glass));
    const sand = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.05, seg), std('sand', { color: 0xd9c49a, roughness: 1 }));
    sand.position.y = 0.035; g.add(sand);
    for (const [x, z] of [[0.045, 0], [-0.045, 0], [0, 0.045]]) g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 5), brass), x, 0.1, z));
  } else if (id === 'libros') {
    const cols = [0x1d2b3a, 0x6b2b24, 0xd8d1c2, 0x2b3a2b];
    let y = 0;
    cols.forEach((c, i) => {
      const t = 0.025 + (i % 2) * 0.01;
      const b = at(rbox(0.2 - i * 0.012, t, 0.14 - i * 0.006, std('book' + i, { color: c, roughness: 0.7 }), light), 0, y + t / 2, 0);
      b.rotation.y = (i % 2 ? 0.12 : -0.08);
      g.add(b); y += t;
    });
  } else if (id === 'bonsai') {
    g.add(at(rbox(0.16, 0.04, 0.11, std('bonsaiPot', { color: 0x23242a, roughness: 0.45 }), light), 0, 0.02, 0));
    const tr = std('bonsaiTr', { color: 0x4a3626, roughness: 0.9 });
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.016, 0.12, 6), tr);
    t1.position.set(0, 0.09, 0); t1.rotation.z = 0.35; g.add(t1);
    const lm = std('bonsaiLeaf', { color: 0x3f6b35, roughness: 0.8, flatShading: true });
    for (const [x, y, z, s] of [[-0.03, 0.16, 0, 0.05], [0.03, 0.15, 0.02, 0.04], [-0.06, 0.13, -0.02, 0.035]]) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), lm);
      c.position.set(x, y, z); c.scale.y = 0.6; g.add(c);
    }
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = !light; });
  return g;
}

// puntos libres de la tapa (x, z) en el sistema del puesto; el teclado va en (0, -0.55), el monitor atrás
const SLOTS = { izqAtras: [-0.65, -0.95], derAtras: [0.66, -0.95], derFrente: [0.62, -0.58], izqFrente: [-0.6, -0.58] };
const PREFER = { lampara: 'izqAtras', auriculares: 'derAtras', libros: 'derAtras', bonsai: 'izqAtras', reloj: 'derAtras', campana: 'derFrente', taza: 'derFrente', libreta: 'izqFrente' };

// ---------- vitrina ----------
/** Carga la pieza y la recorta a su contenido (las imágenes traen aire transparente): así apoya justo en el pedestal. */
function pieceSprite(src, maxSize, onReady) {
  const mat = new THREE.SpriteMaterial({ toneMapped: false, depthWrite: false, transparent: true, opacity: 0 });
  const sp = new THREE.Sprite(mat);
  sp.center.set(0.5, 0);
  sp.scale.set(maxSize, maxSize, 1);
  const img = new Image();
  img.onload = () => {
    const S = 256, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, S, S);
    const d = g.getImageData(0, 0, S, S).data;
    let x0 = S, y0 = S, x1 = 0, y1 = 0;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 24) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (x1 <= x0) return;
    const w = x1 - x0 + 1, h = y1 - y0 + 1, out = document.createElement('canvas');
    out.width = w * 2; out.height = h * 2;
    out.getContext('2d').drawImage(img, (x0 / S) * img.width, (y0 / S) * img.height, (w / S) * img.width, (h / S) * img.height, 0, 0, w * 2, h * 2);
    const t = new THREE.CanvasTexture(out);
    t.colorSpace = THREE.SRGBColorSpace;
    mat.map = t; mat.opacity = 1; mat.needsUpdate = true;
    const k = maxSize / Math.max(w, h);
    sp.scale.set(w * k, h * k, 1);
    onReady && onReady();
  };
  img.src = src;
  return sp;
}
function vitrina(pieces, light) {
  const g = new THREE.Group();
  const W = 0.82, D = 0.44, BH = 0.66, GH = 0.5;
  const plinth = std('vitBase', { color: 0x18181b, roughness: 0.35, metalness: 0.1 });
  const frame = std('vitFrame', { color: 0x111113, roughness: 0.3, metalness: 0.7 });
  g.add(at(rbox(W, BH, D, plinth, light), 0, BH / 2, 0));
  // tapa interior clara: el "piso" de museo donde se apoyan las piezas
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, 0.012, D - 0.04), std('vitFloor', { color: 0xf2efe9, roughness: 0.25 })), 0, BH + 0.006, 0));
  // perfiles finos
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.014, GH, 0.014), frame), (W / 2 - 0.007) * sx, BH + GH / 2, (D / 2 - 0.007) * sz));
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(W, 0.016, D), frame), 0, BH + GH + 0.008, 0));
  // foco: tira de luz blanca bajo la tapa
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, 0.006, 0.05), mat('vitLed', () => new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(3), toneMapped: false }))), 0, BH + GH - 0.004, 0));
  const glass = mat('vitGlass', () => new THREE.MeshStandardMaterial({ color: 0xe8f1f4, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false, envMapIntensity: 1.6 }));
  const panes = new THREE.Mesh(new THREE.BoxGeometry(W - 0.01, GH, D - 0.01), glass);
  panes.position.y = BH + GH / 2;
  panes.renderOrder = 2;
  g.add(panes);
  // piezas: la del medio más grande y un poco más alta, en pedestal
  const n = Math.min(3, pieces.length);
  const lay = n === 1 ? [[0, 0, 0.1, 0.32]] : n === 2 ? [[-0.17, 0, 0.07, 0.26], [0.17, 0, 0.07, 0.26]] : [[-0.26, 0.07, 0.05, 0.2], [0, -0.07, 0.1, 0.3], [0.26, 0.07, 0.05, 0.2]];
  pieces.slice(0, 3).forEach((src, i) => {
    const [x, z, ph, s] = lay[i];
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, ph, light ? 12 : 24), std('ped', { color: 0xfaf8f4, roughness: 0.3 }));
    ped.position.set(x, BH + ph / 2, z);
    ped.castShadow = !light;
    g.add(ped);
    const sp = pieceSprite(src, s);
    sp.position.set(x, BH + ph - 0.004, z);
    sp.renderOrder = 1;
    g.add(sp);
  });
  g.traverse((o) => { if (o.isMesh && o !== panes) o.castShadow = !light; });
  return g;
}

/**
 * Arma un puesto completo según la configuración.
 * cfg: { desk, chair, plant, objects: [], wallpaper, vitrina: [rutas de imagen] }
 * Devuelve { group, screen } — screen es el plano del monitor (la app le cambia el material según el estado).
 */
export function buildWorkstation(cfg, { light = false } = {}) {
  const ws = new THREE.Group();
  const finish = CATALOG.desk[cfg.desk] || CATALOG.desk.roble;
  const top = std('deskTop:' + cfg.desk, { map: deskTex(cfg.desk), roughness: finish.marble ? 0.18 : 0.5, metalness: 0 });
  const legM = std('deskLeg', { color: 0x2c2d31, roughness: 0.4, metalness: 0.6 });
  const darkM = std('monitor', { color: 0x15161a, roughness: 0.35, metalness: 0.4 });
  const t = at(rbox(1.8, 0.05, 0.85, top, light), 0, 0.765, -0.75);
  t.castShadow = t.receiveShadow = !light;
  ws.add(t);
  for (const sx of [-0.82, 0.82]) {
    for (const sz of [-0.42, -1.08]) {
      const l = at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.74, 0.04), legM), sx, 0.37, sz);
      l.castShadow = !light;
      ws.add(l);
    }
    ws.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.7), legM), sx, 0.72, -0.75));
    ws.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.74), legM), sx, 0.01, -0.75));
  }
  ws.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 0.03), legM), 0, 0.72, -1.08));
  ws.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.06), darkM), 0, 0.95, -1.0));
  ws.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.012, 0.18), darkM), 0, 0.795, -1.0));
  const mon = at(rbox(0.98, 0.58, 0.035, darkM, light), 0, 1.3, -1.02);
  mon.rotation.x = -0.06; mon.castShadow = !light;
  ws.add(mon);
  const screen = at(new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.54), screenMaterial(cfg.wallpaper || 'panel')), 0, 1.3, -1.0005);
  screen.rotation.x = -0.06;
  ws.add(screen);
  ws.add(at(rbox(0.46, 0.018, 0.15, std('kb', { color: 0x2a2b30, roughness: 0.55 }), light), 0, 0.8, -0.55));
  ws.add(at(rbox(0.07, 0.02, 0.11, std('kb', {}), light), 0.36, 0.8, -0.55));

  // objetos: cada uno busca su lugar preferido; si está ocupado, el siguiente libre
  const free = new Set(Object.keys(SLOTS));
  for (const id of (cfg.objects || []).slice(0, 3)) {
    let slot = PREFER[id];
    if (!free.has(slot)) slot = [...free][0];
    if (!slot) break;
    free.delete(slot);
    const o = deskObject(id, light);
    const [x, z] = SLOTS[slot];
    o.position.set(x, 0.79, z);
    if (id === 'lampara' && x > 0) o.rotation.y = Math.PI;
    ws.add(o);
  }

  const seat = new THREE.Group();
  seat.add(chair(cfg, light));
  ws.add(seat);
  if (cfg.plant && cfg.plant !== 'ninguna') {
    const p = plant(cfg.plant, light);
    p.position.set(-1.3, 0, -0.95);
    ws.add(p);
  }
  if (cfg.vitrina && cfg.vitrina.length) {
    const v = vitrina(cfg.vitrina, light);
    v.position.set(1.55, 0, -0.95);
    ws.add(v);
  }
  return { group: ws, seat, screen };
}
