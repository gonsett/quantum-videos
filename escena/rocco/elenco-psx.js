// Elenco PSX: Tomi (Elbolilloduro, Character_Male_36) y Rocco (PSX Dog de MCSTEEG teñido de boxer).
// Rutas relativas a muestras/oficina-3d. Devuelve { tomi, rocco } ya escalados (Tomi 1,76 m; Rocco sentado 0,5 m), pies en y = 0.
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const fl = new FBXLoader(), tl = new THREE.TextureLoader();
const textura = async (u) => { const t = await tl.loadAsync(u); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
const vestir = (o, tex) => o.traverse(m => { if (m.isMesh) { m.material = new THREE.MeshLambertMaterial({ map: tex }); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; } });
const aAltura = (o, alto) => { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.scale.multiplyScalar(alto / b.getSize(new THREE.Vector3()).y); o.updateMatrixWorld(true); o.position.y -= new THREE.Box3().setFromObject(o).min.y; };
// Gira un hueso (en mundo) para que apunte hacia dir
const apuntar = (hueso, hijo, dir) => { hueso.updateMatrixWorld(true); const a = hueso.getWorldPosition(new THREE.Vector3()), b = hijo.getWorldPosition(new THREE.Vector3());
  const q = new THREE.Quaternion().setFromUnitVectors(b.sub(a).normalize(), dir.clone().normalize());
  const qw = hueso.getWorldQuaternion(new THREE.Quaternion()), qp = hueso.parent.getWorldQuaternion(new THREE.Quaternion());
  hueso.quaternion.copy(qp.invert().multiply(q.multiply(qw))); hueso.updateMatrixWorld(true); };

export async function cargarElenco({ base = '', tomi: nt = 'Character_Male_36', clipRocco = 'sit', tRocco = 1 } = {}) {
  const [tomiObj, texT, perro, texP] = await Promise.all([fl.loadAsync(`${base}assets/psx-bolillo/Male/${nt}.fbx`), textura(`${base}assets/psx-bolillo/Textures/${nt}.png`), fl.loadAsync(`${base}assets/psx-perro/DogFBX.fbx`), textura(`${base}assets/psx-perro/BoxerAtigrado.png`)]);
  vestir(tomiObj, texT); vestir(perro, texP);
  const hueso = (n) => { let r; tomiObj.traverse(o => { if (o.isBone && o.name.replace(/^mixamorig:?/, '') === n) r = o; }); return r; };
  // Brazos abajo, relajados, codo apenas doblado (el modelo viene en cruz)
  for (const [s, x] of [['Left', 1], ['Right', -1]]) { const arm = hueso(s + 'Arm'), fore = hueso(s + 'ForeArm'), hand = hueso(s + 'Hand');
    if (arm && fore) apuntar(arm, fore, new THREE.Vector3(0.12 * x, -1, 0.02)); if (fore && hand) apuntar(fore, hand, new THREE.Vector3(0.06 * x, -1, 0.18)); }
  aAltura(tomiObj, 1.76);
  const mix = new THREE.AnimationMixer(perro), clip = perro.animations.find(a => new RegExp(clipRocco, 'i').test(a.name)); if (clip) { mix.clipAction(clip).play(); mix.update(tRocco); }
  aAltura(perro, 0.5);
  // Envolturas: rotation.y = 0 mira a +Z en las dos
  const env = (o, ry) => { const g = new THREE.Group(); o.rotation.y = ry; g.add(o); return g; };
  return { tomi: env(tomiObj, 0), rocco: env(perro, Math.PI), hueso, mezclador: mix };
}
