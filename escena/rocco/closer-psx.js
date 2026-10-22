// El closer elegido en eleccion-psx.html, para usarlo en cualquier muestra.
// Se guarda en localStorage ('rc-closer' = índice en CLOSERS); ?closer=i lo pisa. Rutas relativas a muestras/oficina-3d.
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { cargarElenco } from './elenco-psx.js';

// mismo orden que ELENCO en eleccion-psx.html
export const CLOSERS = [
  { m: 'tomi', alto: 1.76, nombre: 'Tomi', ap: 'El Nuevo' },
  { m: 'Female/Character_53_Female', alto: 1.68, nombre: 'Romina', ap: 'La Tiburona' },
  { m: 'Killer_M/Character_Killer_10', alto: 1.98, nombre: 'El Oso', ap: 'Abrazo de cierre' },
  { m: 'Female/Character_52_Female', alto: 1.60, nombre: 'Mei', ap: 'La Calculadora' },
  { m: 'Male/Character_15', alto: 1.78, nombre: 'Nico', ap: 'Rockstar' },
  { m: 'rocco', alto: 0.5, nombre: 'Rocco', ap: 'Gerente de Moral' },
  { m: 'Female/Character_23_Female_Doctor', alto: 1.67, nombre: 'Dra. Lucía', ap: 'La Diagnóstico' },
  { m: 'Male/Character_30', alto: 1.70, nombre: 'Don Ernesto', ap: 'El Abuelo' },
  { m: 'slime', alto: 0.55, nombre: 'Slimy', ap: 'Pegajoso' },
  { m: 'Female/Character_Female_03', alto: 1.64, nombre: 'Kira', ap: 'Fuego' },
  { m: 'Male/Character_28_HM', alto: 1.82, nombre: 'Tóxico', ap: 'Inmune' },
  { m: 'agente', alto: 1.72, nombre: 'Agente', ap: 'Clasificado' },
];

export function guardarCloser(i) { try { localStorage.setItem('rc-closer', String(i)); } catch (e) {} }
export function leerCloser() {
  const q = new URLSearchParams(location.search).get('closer');
  let v = q; if (v === null) { try { v = localStorage.getItem('rc-closer'); } catch (e) {} }
  const i = parseInt(v, 10); return i >= 0 && i < CLOSERS.length ? i : null;
}

const fl = new FBXLoader(), tl = new THREE.TextureLoader();
const textura = async (u) => { const t = await tl.loadAsync(u); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
const apuntar = (hueso, hijo, dir) => { hueso.updateMatrixWorld(true); const a = hueso.getWorldPosition(new THREE.Vector3()), b = hijo.getWorldPosition(new THREE.Vector3());
  const q = new THREE.Quaternion().setFromUnitVectors(b.sub(a).normalize(), dir.clone().normalize());
  const qw = hueso.getWorldQuaternion(new THREE.Quaternion()), qp = hueso.parent.getWorldQuaternion(new THREE.Quaternion());
  hueso.quaternion.copy(qp.invert().multiply(q.multiply(qw))); hueso.updateMatrixWorld(true); };
const aAltura = (o, alto) => { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.scale.multiplyScalar(alto / b.getSize(new THREE.Vector3()).y); o.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(new THREE.Vector3()); o.position.x -= c.x; o.position.z -= c.z; o.position.y -= b2.min.y; };
const sombras = (g) => { g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; } }); return g; };

// modelo de Elbolilloduro con los brazos bajados (vienen en cruz)
const bolillo = async (base, ruta, alto, silueta) => { const n = ruta.split('/')[1];
  const [o, t] = await Promise.all([fl.loadAsync(`${base}assets/psx-bolillo/${ruta}.fbx`), textura(`${base}assets/psx-bolillo/Textures/${n}.png`)]);
  o.traverse(m => { if (m.isMesh) m.material = new THREE.MeshLambertMaterial(silueta ? { color: 0x050506 } : { map: t }); });
  const hueso = (h) => { let r; o.traverse(x => { if (x.isBone && x.name.replace(/^mixamorig:?/, '') === h) r = x; }); return r; };
  for (const [s, x] of [['Left', 1], ['Right', -1]]) { const arm = hueso(s + 'Arm'), fore = hueso(s + 'ForeArm'), hand = hueso(s + 'Hand');
    if (arm && fore) apuntar(arm, fore, new THREE.Vector3(0.12 * x, -1, 0.02)); if (fore && hand) apuntar(fore, hand, new THREE.Vector3(0.06 * x, -1, 0.18)); }
  aAltura(o, alto); const g = new THREE.Group(); g.add(o); return g; };

// Slime provisorio (igual al de la elección): gota verde de pocas caras con ojos
const slime = () => { const g = new THREE.Group(), geo = new THREE.SphereGeometry(0.3, 10, 7), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { let y = p.getY(i); if (y < -0.12) y = -0.12 - (y + 0.12) * 0.15; p.setY(i, y * 1.15); p.setX(i, p.getX(i) * (1 + Math.max(0, -y) * 0.8)); p.setZ(i, p.getZ(i) * (1 + Math.max(0, -y) * 0.8)); }
  geo.computeVertexNormals();
  const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 16);
  gr.addColorStop(0, '#9cf06a'); gr.addColorStop(1, '#2f8f2a'); x.fillStyle = gr; x.fillRect(0, 0, 16, 16); x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(4, 3, 3, 2);
  const piel = new THREE.CanvasTexture(c); piel.colorSpace = THREE.SRGBColorSpace; piel.magFilter = piel.minFilter = THREE.NearestFilter; piel.generateMipmaps = false;
  const add = (geo, mat, px, py, pz) => { const o = new THREE.Mesh(geo, mat); o.position.set(px, py, pz); g.add(o); return o; };
  add(geo, new THREE.MeshLambertMaterial({ map: piel, emissive: 0x0d2a08, transparent: true, opacity: 0.93 }), 0, 0.16, 0);
  for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.055, 6, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }), s * 0.09, 0.26, 0.24); add(new THREE.SphereGeometry(0.028, 5, 3), new THREE.MeshLambertMaterial({ color: 0x050505 }), s * 0.09, 0.26, 0.29); }
  add(new THREE.BoxGeometry(0.08, 0.018, 0.02), new THREE.MeshLambertMaterial({ color: 0x0b2a08 }), 0, 0.17, 0.3); return g; };

// Devuelve un Group con los pies en y = 0, mirando a +Z
export async function cargarCloser(i, { base = '' } = {}) {
  const e = CLOSERS[i];
  if (e.m === 'tomi' || e.m === 'rocco') { const r = await cargarElenco({ base }); return sombras(e.m === 'tomi' ? r.tomi : r.rocco); }
  if (e.m === 'slime') return sombras(slime());
  if (e.m === 'agente') return sombras(await bolillo(base, 'Female/Character_38_Female', e.alto, true));   // silueta hasta tener a la agente
  return sombras(await bolillo(base, e.m, e.alto));
}
