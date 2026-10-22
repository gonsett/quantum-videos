// Ep. 5 «Ya pagó»: Tomi jura que el prospecto pagó; Rocco le hace volver a mirar la llamada hasta que ve lo que no quiso ver.
// Se monta sobre la oficina real (oficina-piso.html?ep5): la noche en la oficina (el presente) y la casa del prospecto (el recuerdo, x≈40).
// Cortes, voces, recuerdo (tr de la frase del prospecto) y reloj salen de ep5.json (ep5.py). window.renderAt(t) · renderAccum · DURATION · LOOK
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { cargarElenco } from '../rocco/elenco-psx.js';
import { crearGraficos } from './graficos.js';
import { crearPost } from './post-ep5.js';
import { expo, suave, pulso, hash, wrap, lin, ease } from './curvas.js';

export async function montar(ctx) {
  const { THREE, scene, camera, renderer, composer, tagScene, setLights, cityM, DESKS, mineScreen, ui, uiTex, W, H } = ctx;
  document.getElementById('carga').style.display = 'none';
  tagScene.visible = false;
  const MU = await (await fetch('ep5-ya-pago/ep5.json?' + Date.now())).json();
  const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), Y = v3(0, 1, 0);
  const L = (o) => new THREE.MeshLambertMaterial(o), S = (o) => new THREE.MeshStandardMaterial(o);
  const add = (geo, m, x, y, z, p = scene) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
  const box = (w, h, d, m, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, p);
  const vivo = (o) => { o.traverse((x) => (x.userData.vivo = true)); return o; };
  const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return [c, c.getContext('2d'), t]; };

  // ---- personajes ----
  const fl = new FBXLoader(), tl = new THREE.TextureLoader();
  const _qa = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _qw = new THREE.Quaternion();
  const rotW = (b, eje, ang) => { if (!b || !ang) return; b.getWorldQuaternion(_qw); b.parent.getWorldQuaternion(_qp); _qa.setFromAxisAngle(eje, ang).multiply(_qw); b.quaternion.copy(_qp.invert().multiply(_qa)); b.updateMatrixWorld(true); };
  const apuntar = (hueso, hijo, dir) => { if (!hueso || !hijo) return; hueso.updateMatrixWorld(true); const a = hueso.getWorldPosition(v3()), b = hijo.getWorldPosition(v3());
    const q = new THREE.Quaternion().setFromUnitVectors(b.sub(a).normalize(), dir.clone().normalize());
    hueso.getWorldQuaternion(_qw); hueso.parent.getWorldQuaternion(_qp); hueso.quaternion.copy(_qp.invert().multiply(q.multiply(_qw))); hueso.updateMatrixWorld(true); };
  const aAltura = (o, alto) => { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.scale.multiplyScalar(alto / b.getSize(v3()).y); o.updateMatrixWorld(true);
    const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(v3()); o.position.x -= c.x; o.position.z -= c.z; o.position.y -= b2.min.y; };
  const piel = async (n) => { const t = await tl.loadAsync(`assets/psx-bolillo/Textures/${n}_pad.png`); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };
  const vestir = (o, t) => o.traverse(m => { if (m.isMesh) { m.material = L({ map: t, color: 0x9a9a9a, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.3 }); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; } });
  const bolillo = async (ruta, alto) => { const n = ruta.split('/')[1];
    const [o, t] = await Promise.all([fl.loadAsync(`assets/psx-bolillo/${ruta}.fbx`), piel(n)]); vestir(o, t);
    aAltura(o, alto); const g = new THREE.Group(); g.add(o); return g; };
  const [{ tomi, rocco, mezclador }, prospecto] = await Promise.all([cargarElenco({ base: '' }), bolillo('Male/Character_Male_40', 1.78)]);
  vestir(tomi, await piel('Character_Male_36'));
  rocco.traverse(m => { if (m.isMesh) { const t = m.material.map; m.material = L({ map: t, color: 0x9a9a9a, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.3 }); m.castShadow = true; } });
  const huesos = (o) => { const r = {}; o.traverse(x => { if (x.isBone) r[x.name.replace(/^mixamorig:?/, '')] = x; }); return r; };
  const reposo = (o) => { const r = []; o.traverse(x => { if (x.isBone) r.push([x, x.quaternion.clone()]); }); return r; };
  const DT = DESKS.find((d) => d.mine);
  vivo(DT.seat);
  const actores = {};
  for (const [k, o] of Object.entries({ tomi, prospecto })) { o.rotation.order = 'YXZ'; scene.add(vivo(o)); o.updateMatrixWorld(true);
    const B = huesos(o); actores[k] = { k, o, B, rest: reposo(o), hips0: B.Hips.position.clone(), hipsY: B.Hips.getWorldPosition(v3()).y }; }
  const RB = {}; rocco.traverse(o => { if (o.isBone) RB[o.name] = o; }); scene.add(vivo(rocco));
  const restR = reposo(rocco);

  // ---- tiempo ----
  const E = MU.ev, C = MU.cortes, ED = Object.fromEntries(MU.edl.map(e => [e.plano, e])), V = {};
  for (const v of MU.voces) (V[v.id] ||= []).push(v);
  const muestra = (a, i) => { const k = Math.floor(i); return !a || k < 0 || k + 1 >= a.length ? 0 : a[k] + (a[k + 1] - a[k]) * (i - k); };
  const boca = (q, t) => muestra(MU.boca[q], t * MU.hz);
  const plano = (t) => MU.edl.find((e) => t < e.t1) || MU.edl[MU.edl.length - 1];
  const RECUERDO = [1, 2, 7, 10];
  // el instante de la llamada (segundos dentro de la frase del prospecto) que se ve en t; antes de la primera pieza del plano queda congelado
  const REB = { 7: MU.recuerdo.find((r) => r.plano === 7 && r.tr1 < r.tr0), 10: MU.recuerdo.find((r) => r.plano === 10) };
  function tr(t, P) {
    const ps = MU.recuerdo.filter((r) => r.plano === P); if (!ps.length) return 0;
    if (t < ps[0].t0) return ps[0].tr0;
    for (const r of ps) if (t < r.t1) { const k = lin(t, r.t0, r.t1);
      // el rebobinado 2 viene de más adelante: corre hacia atrás y vuelve a avanzar barriendo, como una cinta que se busca
      if (P === 10 && r === REB[10]) return k < 0.6 ? r.tr0 - 1.6 * suave(k / 0.6) : r.tr0 - 1.6 + (r.tr1 - r.tr0 + 1.6) * suave((k - 0.6) / 0.4);
      return r.tr0 + (r.tr1 - r.tr0) * k; }
    return ps[ps.length - 1].tr1;
  }
  const rebobinando = (t) => { for (const r of Object.values(REB)) if (r && t >= r.t0 && t < r.t1) return Math.sin(Math.PI * lin(t, r.t0, r.t1)) ** 0.6; return 0; };
  const reloj = (t) => { let s = 0; for (const r of MU.reloj) if (r.t0 <= t) s = r.s0 + (t - r.t0); return s; };
  const hm = (s) => { s = Math.floor(s) % 86400; return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}`; };

  // ---- poses (x a su izquierda, y arriba, z adelante) ----
  function pose(a, p, t) {
    const { o, B, rest, hips0, hipsY } = a; for (const [b, q] of rest) b.quaternion.copy(q); B.Hips.position.copy(hips0);
    const yaw = p.yaw, f = v3(Math.sin(yaw), 0, Math.cos(yaw)), izq = v3(Math.cos(yaw), 0, -Math.sin(yaw));
    const loc = (x, y, z) => izq.clone().multiplyScalar(x).addScaledVector(Y, y).addScaledVector(f, z).normalize();
    const resp = 0.006 * Math.sin(t * 2.1 + hash(a.k.length) * 6);
    o.visible = true; o.rotation.set(0, yaw, 0); o.position.set(p.x, (p.asiento ?? 0.5) - (hipsY - 0.08) + resp, p.z); o.updateMatrixWorld(true);
    for (const [s, k] of [['Left', 1], ['Right', -1]]) { apuntar(B[s + 'UpLeg'], B[s + 'Leg'], loc(k * 0.1, -0.12, 1)); apuntar(B[s + 'Leg'], B[s + 'Foot'], loc(k * 0.04, -1, 0.12)); }
    rotW(B.Spine, izq, (p.lean || 0) * 0.5); rotW(B.Spine1, izq, (p.lean || 0) * 0.5);
    if (p.twist) { rotW(B.Spine1, Y, p.twist * 0.5); rotW(B.Spine2, Y, p.twist * 0.5); }
    const vz = p.voz ? (p.vozV ?? boca(p.voz, t)) : 0;
    if (p.mira) { const hp = B.Head.getWorldPosition(v3()), d = p.mira.clone().sub(hp), yh = Math.atan2(d.x, d.z), dy = Math.max(-1.1, Math.min(1.1, wrap(yh - yaw - (p.twist || 0))));
      rotW(B.Neck, Y, dy * 0.4); rotW(B.Head, Y, dy * 0.6);
      const ih = v3(Math.cos(yh), 0, -Math.sin(yh)), pit = Math.max(-0.6, Math.min(0.7, -Math.atan2(d.y, Math.hypot(d.x, d.z)) * 0.8 + vz * 0.1 + (p.pitch || 0)));
      rotW(B.Neck, ih, pit * 0.4); rotW(B.Head, ih, pit * 0.6);
      if (p.ladeo) rotW(B.Head, v3(Math.sin(yh), 0, Math.cos(yh)), p.ladeo); }
    for (const [s, k] of [['Left', 1], ['Right', -1]]) { const [aa, ff] = p.brazos[s];
      apuntar(B[s + 'Arm'], B[s + 'ForeArm'], loc(aa[0] * k, aa[1], aa[2])); apuntar(B[s + 'ForeArm'], B[s + 'Hand'], loc(ff[0] * k, ff[1], ff[2])); }
    o.updateMatrixWorld(true);
  }
  const DEDOS = ['Index', 'Middle', 'Ring', 'Pinky'];
  // las manos mitón (Male_40) solo traen el índice: el eje de lado a lado sale entonces de la matriz del hueso de la mano
  const marco = (a, s) => { const B = a.B, P = (n) => (B[s + 'Hand' + n] || B[s + 'HandIndex1']).getWorldPosition(v3()), h = B[s + 'Hand'].getWorldPosition(v3());
    const d = P('Middle1').sub(h).normalize(), ac = B[s + 'HandPinky1'] ? P('Index1').sub(P('Pinky1')) : v3().setFromMatrixColumn(B[s + 'Hand'].matrixWorld, 2).multiplyScalar(s === 'Right' ? 1 : -1);
    ac.addScaledVector(d, -ac.dot(d)).normalize();
    return { h, d, ac, n: (s === 'Right' ? d.clone().cross(ac) : ac.clone().cross(d)).normalize() }; };
  // gira la muñeca hasta que la palma mire a «hacia» y cierra los dedos «cierre» (0 abierta, 1 puño)
  function mano(a, s, hacia, cierre, pulgar = 0) {
    const B = a.B; let { d, n } = marco(a, s); const q = hacia.clone().addScaledVector(d, -hacia.dot(d)).normalize();
    let ang = Math.acos(Math.min(1, Math.max(-1, n.dot(q)))); if (n.clone().cross(q).dot(d) < 0) ang = -ang; rotW(B[s + 'Hand'], d, ang);
    const m = marco(a, s), eje = m.d.clone().cross(m.n).normalize().multiplyScalar(s === 'Right' ? 1 : -1);
    for (const f of DEDOS) for (const [j, k] of [[1, 0.75], [2, 0.85], [3, 0.6]]) rotW(B[s + 'Hand' + f + j], eje, k * cierre * 1.4);
    rotW(B[s + 'HandThumb1'], eje, 0.25 * cierre + pulgar * 0.3); rotW(B[s + 'HandThumb2'], eje, 0.35 * cierre + pulgar * 0.5);
    a.o.updateMatrixWorld(true); return marco(a, s); }
  const cabeza = (a) => a.B.Head.getWorldPosition(v3()).add(v3(0, 0.06, 0));
  function poseRocco(x, y, z, yaw, mira, t, ladeo = 0) {
    for (const [o, q] of restR) o.quaternion.copy(q); rocco.visible = true; rocco.position.set(x, y, z); rocco.rotation.y = yaw;
    mezclador.setTime(t % 1.25); rocco.updateMatrixWorld(true);
    const izq = v3(Math.cos(yaw), 0, -Math.sin(yaw)), fr = v3(Math.sin(yaw), 0, Math.cos(yaw)), hp = RB.spine011.getWorldPosition(v3()), d = mira.clone().sub(hp);
    const yh = Math.min(0.35, Math.max(-0.35, wrap(Math.atan2(d.x, d.z) - yaw))), pit = -Math.atan2(d.y, Math.hypot(d.x, d.z)) * 0.7, b = boca('rocco', t);
    rotW(RB.spine010, Y, -yh * 0.4); rotW(RB.spine011, Y, -yh * 0.6);
    rotW(RB.spine010, izq, pit * 0.4 + b * 0.05); rotW(RB.spine011, izq, pit * 0.6 + b * 0.09);
    if (ladeo) rotW(RB.spine011, fr, ladeo);
    if (RB.Bone) rotW(RB.Bone, izq, b * 0.35);   // la mandíbula
    for (const [n, sem] of [['earL', 3.1], ['earR', 5.7]]) { const tic = Math.max(...[0, 1, 2, 3, 4, 5].map(k => pulso(t, sem + k * 5.3 + hash(k + sem) * 2, sem + k * 5.3 + hash(k + sem) * 2 + 0.12, 0.05))); if (RB[n]) rotW(RB[n], izq, -tic * 0.25); }
  }
  const cabR = () => RB.spine011.getWorldPosition(v3()).add(v3(0, 0.03, 0));

  // ---- celulares (el titanio del ep. 1) ----
  const CW = 0.0716, CH = 0.1466, CR = 0.0108, CE = 0.0082;
  const rrect = (w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const titanio = S({ color: 0x8a8d93, metalness: 0.55, roughness: 0.32 });
  function celular(pantalla) {   // pantalla hacia +z, largo en +y
    const g = vivo(new THREE.Group());
    const cu = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(CW - 0.002, CH - 0.002, CR - 0.001), { depth: CE - 0.002, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 5, curveSegments: 16 }), titanio);
    cu.position.z = 0.001; cu.castShadow = true; g.add(cu);
    const vi = new THREE.Mesh(new THREE.ShapeGeometry(rrect(CW - 0.0016, CH - 0.0016, CR - 0.0008), 16), S({ color: 0x020203, roughness: 0.06, metalness: 0.1 })); vi.position.z = CE + 0.00005; g.add(vi);
    const pa = new THREE.Mesh(new THREE.ShapeGeometry(rrect(CW - 0.0048, CH - 0.0048, CR - 0.0024), 16), pantalla); pa.position.z = CE + 0.0001; g.add(pa);
    const pg = pa.geometry.attributes.position, uv = pa.geometry.attributes.uv; for (let i = 0; i < pg.count; i++) uv.setXY(i, pg.getX(i) / (CW - 0.0048) + 0.5, pg.getY(i) / (CH - 0.0048) + 0.5);
    for (const [sx, y, h] of [[-1, 0.040, 0.007], [-1, 0.024, 0.011], [-1, 0.010, 0.011], [1, 0.018, 0.018]]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.0007, h, 4, 8), titanio); b.position.set(sx * CW / 2, y, CE / 2); g.add(b); }
    scene.add(g); return { g, pa };
  }
  // el de Tomi: boca arriba en su escritorio; la pantalla negra refleja lo que tiene encima (su cara)
  const rt = new THREE.WebGLRenderTarget(256, 512, { colorSpace: THREE.SRGBColorSpace }); rt.texture.wrapS = THREE.RepeatWrapping; rt.texture.repeat.x = -1; rt.texture.offset.x = 1;
  const reflejoM = new THREE.MeshBasicMaterial({ map: rt.texture, color: new THREE.Color(0.34, 0.35, 0.38) }), negroM = new THREE.MeshBasicMaterial({ color: 0x030304 });
  const GIRO = 0.08, celT = celular(negroM), CELT = v3(2.88, 0.79, 1.12); celT.g.position.copy(CELT); celT.g.rotation.set(-Math.PI / 2, 0, GIRO);
  const rtCam = new THREE.PerspectiveCamera(52, 0.5, 0.05, 30);
  { const sombra = (() => { const [c, g, t] = lienzo(256, 512); g.filter = 'blur(14px)'; g.fillStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.roundRect(40, 40, 176, 432, 30); g.fill(); t.colorSpace = THREE.NoColorSpace; return t; })();
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(CW * 1.45, CH * 1.2), new THREE.MeshBasicMaterial({ map: sombra, transparent: true, depthWrite: false }));
    sm.rotation.set(-Math.PI / 2, 0, GIRO); sm.position.copy(CELT).add(v3(0, 0.0006, 0)); scene.add(vivo(sm)); }
  // el del prospecto: un chat abierto (escribe mientras dice que sí)
  const [chC, chG, chT] = lienzo(360, 740);
  const celP = celular(new THREE.MeshBasicMaterial({ map: chT, toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) }));

  // ---- la casa del prospecto (x≈40): oficina chica con la ventana del atardecer ----
  const CX = 40, casa = vivo(new THREE.Group()); scene.add(casa);
  { const pared = S({ color: 0x8a7a68, roughness: 0.92 }), piso = S({ color: 0x4a3222, roughness: 0.6 }), madera = S({ color: 0x3b2618, roughness: 0.45 }), negro = S({ color: 0x141416, roughness: 0.4, metalness: 0.4 });
    box(5, 0.02, 5, piso, CX, -0.01, 0.6, casa); box(5, 0.02, 5, pared, CX, 2.7, 0.6, casa);
    box(5, 2.7, 0.06, pared, CX, 1.35, -1.45, casa); box(0.06, 2.7, 5, pared, CX - 1.6, 1.35, 0.6, casa); box(0.06, 2.7, 5, pared, CX + 1.7, 1.35, 0.6, casa);
    // ventana en la pared izquierda: el atardecer en un lienzo, con parantes
    const [wc, wg, wt] = lienzo(512, 640), gr = wg.createLinearGradient(0, 0, 0, 640);
    gr.addColorStop(0, '#5b4a7a'); gr.addColorStop(0.45, '#f08a4b'); gr.addColorStop(0.62, '#ffd08a'); gr.addColorStop(0.7, '#e2774a'); gr.addColorStop(1, '#3a2a30'); wg.fillStyle = gr; wg.fillRect(0, 0, 512, 640);
    wg.fillStyle = '#2a1d24'; for (let i = 0; i < 14; i++) { const x = i * 40 - 10, h = 60 + hash(i * 3.1) * 160; wg.fillRect(x, 640 - 200 - h * 0.5, 34, 200 + h); }
    const ven = add(new THREE.PlaneGeometry(1.2, 1.5), new THREE.MeshBasicMaterial({ map: wt, toneMapped: false, color: new THREE.Color(1.6, 1.45, 1.3) }), CX - 1.56, 1.45, 0.25, casa); ven.rotation.y = Math.PI / 2;
    for (const [w, h, y, z] of [[0.05, 1.6, 1.45, 0.25], [0.05, 0.06, 0.7, 0.25], [0.05, 0.06, 2.2, 0.25], [0.05, 1.6, 1.45, -0.35], [0.05, 1.6, 1.45, 0.85]]) box(0.04, h, w === 0.05 && h > 1 ? 0.05 : 1.25, madera, CX - 1.55, y, z, casa);
    box(0.04, 0.05, 1.25, madera, CX - 1.55, 1.45, 0.25, casa);
    // estantería detrás, a su derecha, con libros y una planta
    for (const y of [0.35, 0.8, 1.25, 1.7, 2.1]) box(1.3, 0.03, 0.3, madera, CX + 0.85, y, -1.27, casa);
    for (const x of [0.2, 1.5]) box(0.03, 1.8, 0.3, madera, CX + x, 1.22, -1.27, casa);
    const cols = [0x6b2a22, 0x2d4a5a, 0xc9b48a, 0x3e5a3a, 0x8a5a2a, 0x222428, 0xa8442c, 0x506070];
    for (const [i, y] of [0.365, 0.815, 1.265, 1.715].entries()) { let x = CX + 0.27; while (x < CX + 1.4) { const w = 0.025 + hash(x * 9 + i) * 0.03, h = 0.2 + hash(x * 7 + i) * 0.12; if (hash(x * 13 + i) > 0.2) box(w, h, 0.2, S({ color: cols[Math.floor(hash(x * 5 + i) * 8)], roughness: 0.7 }), x + w / 2, y + h / 2, -1.25, casa); x += w + 0.004; } }
    // un cuadro y una lámpara colgante detrás (la fuente que dibuja el destello del anamórfico)
    box(0.7, 0.5, 0.03, negro, CX - 0.55, 1.75, -1.4, casa); add(new THREE.PlaneGeometry(0.62, 0.42), S({ color: 0xc8b8a0, roughness: 0.9 }), CX - 0.55, 1.75, -1.38, casa);
    add(new THREE.CylinderGeometry(0.004, 0.004, 0.75, 6), negro, CX + 0.35, 2.33, -0.85, casa);
    add(new THREE.SphereGeometry(0.06, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 3.6, 1.8), toneMapped: false }), CX + 0.35, 1.92, -0.85, casa);
    // escritorio, silla y laptop
    box(1.5, 0.04, 0.68, madera, CX, 0.72, 0.66, casa); for (const [x, z] of [[-0.7, 0.36], [0.7, 0.36], [-0.7, 0.96], [0.7, 0.96]]) box(0.04, 0.7, 0.04, negro, CX + x, 0.35, z, casa);
    box(0.5, 0.06, 0.48, S({ color: 0x2a2a2e, roughness: 0.6 }), CX, 0.45, -0.02, casa); box(0.5, 0.6, 0.06, S({ color: 0x2a2a2e, roughness: 0.6 }), CX, 0.8, -0.27, casa); box(0.06, 0.42, 0.06, negro, CX, 0.21, -0.02, casa);
    const alu = S({ color: 0xb8bcc2, metalness: 0.7, roughness: 0.3 }); box(0.34, 0.012, 0.23, alu, CX, 0.746, 0.6, casa);
    const tapa = new THREE.Group(); tapa.position.set(CX, 0.752, 0.715); tapa.rotation.x = 0.22; casa.add(tapa); box(0.34, 0.225, 0.008, alu, 0, 0.1125, 0, tapa);
    add(new THREE.PlaneGeometry(0.32, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.6, 0.7), toneMapped: false }), 0, 0.113, -0.0045, tapa).rotation.y = Math.PI;
    add(new THREE.SphereGeometry(0.003, 8, 6), new THREE.MeshBasicMaterial({ color: 0x0c0c0c }), 0, 0.216, -0.005, tapa);
    // lámpara de escritorio y una taza
    add(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 20), negro, CX + 0.6, 0.75, 0.85, casa); add(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 8), negro, CX + 0.6, 0.93, 0.85, casa);
    add(new THREE.ConeGeometry(0.1, 0.12, 20, 1, true), S({ color: 0x1d3a2e, roughness: 0.5, side: THREE.DoubleSide }), CX + 0.6, 1.12, 0.82, casa);
    add(new THREE.SphereGeometry(0.025, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.4, 1.8), toneMapped: false }), CX + 0.6, 1.09, 0.82, casa);
    add(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 18), S({ color: 0xece6da, roughness: 0.35 }), CX - 0.55, 0.79, 0.75, casa);
    // luces propias, todas con alcance: no llegan a la oficina
    const sol = new THREE.SpotLight(0xffa860, 40, 9, 0.55, 0.7, 1.6); sol.position.set(CX - 2.4, 1.9, 0.3); sol.target.position.set(CX, 1.15, 0.0); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0015; casa.add(sol, sol.target);
    const lam = new THREE.PointLight(0xffb36a, 1.6, 3, 2); lam.position.set(CX + 0.6, 1.02, 0.8); casa.add(lam);
    const pen = new THREE.PointLight(0xffc48a, 1.2, 3.5, 2); pen.position.set(CX + 0.35, 1.85, -0.85); casa.add(pen);
    const lap = new THREE.PointLight(0xcfe0ff, 0.5, 1.4, 2); lap.position.set(CX, 0.95, 0.5); casa.add(lap);
    const rel = new THREE.PointLight(0xffd6b0, 0.6, 6, 2); rel.position.set(CX + 0.8, 1.9, 2.2); casa.add(rel); }

  // ---- luces de la oficina: la noche apaga los puestos ajenos; el recuerdo trae el sol de la tarde ----
  const apagables = [], lamparas = []; let winL = null;
  scene.traverse((o) => { if (o.isRectAreaLight && o.color.getHex() === 0xd6e6ff && Math.abs(o.position.x - DT.x) + Math.abs(o.position.z - (DT.z - 0.98)) > 0.1) apagables.push([o, o.intensity]);
    if (o.isPointLight && o.color.getHex() === 0xffb36a && Math.abs(o.position.z - (DT.z - 0.63)) > 0.1) lamparas.push([o, o.intensity]);
    if (o.isRectAreaLight && o.color.getHex() === 0x4a5cc8) winL = o; });
  const winC = winL.color.clone(), winI = winL.intensity, cityC = cityM.color.clone();
  const apagadoM = S({ color: 0x050506, roughness: 0.12, metalness: 0.2 }), ajenas = DESKS.filter((d) => d.on && !d.mine).map((d) => [d.screen, d.screen.material]);
  for (const [s] of ajenas) vivo(s);
  const sol = new THREE.SpotLight(0xffb468, 0, 9, 0.5, 0.75, 1.5); sol.position.set(DT.x + 2.3, 2.7, DT.z - 2.2); sol.target.position.set(DT.x, 1.1, DT.z + 0.1);
  sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0015; scene.add(sol, sol.target);
  function noche() { setLights(-1); for (const [o] of apagables) o.intensity = 0; for (const [o] of lamparas) o.intensity = 0; for (const [s] of ajenas) s.material = apagadoM;
    winL.color.copy(winC); winL.intensity = winI; sol.intensity = 0; }
  function luzRecuerdo() { setLights(99); for (const [o, i] of apagables) o.intensity = i; for (const [o, i] of lamparas) o.intensity = i; for (const [s, m] of ajenas) s.material = m;
    winL.color.set(0xffb070); winL.intensity = 3.2; cityM.color.setRGB(1.05, 0.82, 0.6); sol.intensity = 26; }

  // ---- el monitor de Tomi (canvas ui, 1880×1080) ----
  const ug = ui.getContext('2d'), FU = '"Inter Tight",sans-serif', FS = '"Instrument Serif",serif', EM = '#10b981';
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  const NOMBRE = 'Federico Ibarra';
  function monitor(t, dia) {
    const g = ug, w = 1880, h = 1080;
    if (dia) {   // la videollamada de la tarde
      g.fillStyle = '#0d0f12'; g.fillRect(0, 0, w, h); rr(g, 60, 60, w - 120, h - 200, 26); const bg = g.createLinearGradient(0, 60, 0, h - 140); bg.addColorStop(0, '#6d5440'); bg.addColorStop(1, '#2a1f18'); g.fillStyle = bg; g.fill();
      g.fillStyle = '#c99a72'; g.beginPath(); g.arc(940, 470, 130, 0, 7); g.fill(); g.fillStyle = '#3a4250'; g.beginPath(); g.ellipse(940, 900, 330, 260, 0, Math.PI, 0); g.fill();
      g.font = `600 36px ${FU}`; g.fillStyle = '#f1f1f1'; g.fillText(NOMBRE, 110, h - 190);
      for (const [i, c] of [[-1, '#2b2f36'], [0, '#e11d48'], [1, '#2b2f36']]) { g.fillStyle = c; g.beginPath(); g.arc(940 + i * 110, h - 70, 36, 0, 7); g.fill(); }
      uiTex.needsUpdate = true; return; }
    // la noche: el pipeline a la izquierda, el chat con el prospecto a la derecha, el reloj del sistema abajo
    g.fillStyle = '#0b0d10'; g.fillRect(0, 0, w, h);
    g.fillStyle = EM; g.beginPath(); g.arc(70, 64, 8, 0, 7); g.fill(); g.font = `700 26px ${FU}`; g.letterSpacing = '6px'; g.fillStyle = '#e8e6e1'; g.fillText('RING CLOSERS · PIPELINE', 92, 73); g.letterSpacing = '0px';
    ['CONTACTADO', 'LLAMADA', 'CERRADO', 'PAGADO'].forEach((c, i) => { const x = 50 + i * 270; g.font = `600 20px ${FU}`; g.letterSpacing = '4px'; g.fillStyle = '#6b7079'; g.fillText(c, x, 150); g.letterSpacing = '0px';
      const n = [4, 3, 1, 0][i]; for (let k = 0; k < n; k++) { const y = 180 + k * 150, yo = i === 2; rr(g, x, y, 250, 130, 14); g.fillStyle = yo ? 'rgba(16,185,129,0.14)' : '#14171c'; g.fill();
        if (yo) { g.strokeStyle = 'rgba(16,185,129,0.6)'; g.lineWidth = 2; g.stroke(); g.font = `600 26px ${FU}`; g.fillStyle = '#f3f4f6'; g.fillText('Federico I.', x + 20, y + 46); g.font = `600 20px ${FU}`; g.fillStyle = '#fbbf24'; g.fillText('seña pendiente', x + 20, y + 84); }
        else { g.fillStyle = '#2a2f37'; g.fillRect(x + 20, y + 34, 130 + hash(i * 7 + k) * 80, 16); g.fillRect(x + 20, y + 70, 80 + hash(i * 3 + k) * 60, 12); } }
      if (i === 3) { g.font = `600 22px ${FU}`; g.fillStyle = '#4b5059'; g.fillText('vacío', x, 210); } });
    // chat
    const X = 1170, CWW = 650; rr(g, X, 30, CWW, h - 110, 18); g.fillStyle = '#0f1a17'; g.fill();
    g.fillStyle = '#1d2a26'; rr(g, X, 30, CWW, 110, 18); g.fill();
    g.fillStyle = '#4b5a55'; g.beginPath(); g.arc(X + 60, 85, 30, 0, 7); g.fill();
    g.font = `600 30px ${FU}`; g.fillStyle = '#e9edef'; g.fillText(NOMBRE, X + 108, 80); g.font = `500 21px ${FU}`; g.fillStyle = '#8696a0'; g.fillText('últ. vez hoy a las 15:32', X + 108, 112);
    g.font = `600 18px ${FU}`; g.fillStyle = '#8696a0'; g.textAlign = 'center'; rr(g, X + CWW / 2 - 50, 180, 100, 34, 10); g.fillStyle = '#1d2a26'; g.fill(); g.fillStyle = '#8696a0'; g.fillText('HOY', X + CWW / 2, 203); g.textAlign = 'left';
    // lo que mandó Tomi a las 15:31: el link de la seña
    const bx = X + 150, by = 250, bw = 470; rr(g, bx, by, bw, 300, 16); g.fillStyle = '#005c4b'; g.fill();
    rr(g, bx + 12, by + 12, bw - 24, 150, 10); g.fillStyle = '#0a4a3d'; g.fill(); g.fillStyle = EM; g.fillRect(bx + 12, by + 12, 8, 150);
    g.font = `700 26px ${FU}`; g.fillStyle = '#e9edef'; g.fillText('Seña · Programa Closer', bx + 38, by + 60); g.font = `500 21px ${FU}`; g.fillStyle = '#a8c7bf'; g.fillText('pagos.ringclosers.io/f-ibarra', bx + 38, by + 98);
    g.font = `700 24px ${FU}`; g.fillStyle = '#6ee7b7'; g.fillText('USD 500', bx + 38, by + 138);
    g.font = `500 25px ${FU}`; g.fillStyle = '#e9edef'; g.fillText('Federico, te paso el link para la', bx + 20, by + 205); g.fillText('seña como hablamos 👇', bx + 20, by + 240);
    g.font = `500 19px ${FU}`; g.fillStyle = '#9fc3ba'; g.textAlign = 'right'; g.fillText('15:31', bx + bw - 52, by + 282); g.fillStyle = '#53bdeb'; g.fillText('✓✓', bx + bw - 16, by + 282); g.textAlign = 'left';
    // y lo que contestó a las 15:32. Nada más.
    rr(g, X + 30, 590, 200, 84, 16); g.fillStyle = '#1f2c34'; g.fill(); g.font = `500 30px ${FU}`; g.fillStyle = '#e9edef'; g.fillText('dale 👍', X + 52, 640);
    g.font = `500 19px ${FU}`; g.fillStyle = '#8696a0'; g.fillText('15:32', X + 164, 662);
    rr(g, X + 24, h - 170, CWW - 48, 64, 32); g.fillStyle = '#1d2a26'; g.fill(); g.font = `500 24px ${FU}`; g.fillStyle = '#6b7a75'; g.fillText('Escribí un mensaje', X + 56, h - 130);
    // barra del sistema y el reloj
    g.fillStyle = '#16181c'; g.fillRect(0, h - 64, w, 64);
    const s = reloj(t + (plano(t).plano === 16 ? 0.12 : 0));   // el minuto cambia a la vista, siete cuadros antes del negro
    g.font = `600 30px ${FU}`; g.fillStyle = '#e8e8ea'; g.textAlign = 'right'; g.fillText(hm(s), w - 40, h - 26); g.font = `500 17px ${FU}`; g.fillStyle = '#8b8e95'; g.fillText(s >= 86400 ? '23/10/2026' : '22/10/2026', w - 150, h - 26); g.textAlign = 'left';
    uiTex.needsUpdate = true;
  }
  // el chat del celular del prospecto: escribe mientras dice que sí
  function chat(r) {
    const g = chG, w = 360, h = 740; g.fillStyle = '#0b141a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f2c34'; g.fillRect(0, 0, w, 90);
    g.font = `600 26px ${FU}`; g.fillStyle = '#e9edef'; g.fillText('Caro 💼', 80, 58); g.fillStyle = '#4b5a55'; g.beginPath(); g.arc(44, 50, 22, 0, 7); g.fill();
    rr(g, 20, 130, 250, 70, 14); g.fillStyle = '#1f2c34'; g.fill(); g.font = `500 22px ${FU}`; g.fillStyle = '#e9edef'; g.fillText('¿cómo va la llamada?', 36, 172);
    const msg = 'otro vendedor jaja', n = Math.max(0, Math.min(msg.length, Math.floor((r - 0.3) * 2.2)));
    if (r > 6.6) { rr(g, 90, 230, 250, 70, 14); g.fillStyle = '#005c4b'; g.fill(); g.fillStyle = '#e9edef'; g.fillText(msg, 106, 272); }
    rr(g, 16, h - 90, w - 32, 60, 30); g.fillStyle = '#1f2c34'; g.fill(); g.font = `500 22px ${FU}`; g.fillStyle = '#e9edef';
    g.fillText(r > 6.6 ? '' : msg.slice(0, n) + (Math.floor(r * 3) % 2 ? '|' : ''), 40, h - 52); chT.needsUpdate = true;
  }

  // ---- cámaras ----
  const fijo = (x, y, z, lx, ly, lz, fov) => ({ p: v3(x, y, z), l: v3(lx, ly, lz), fov });
  const viaje = (a, b, k) => ({ p: a.p.clone().lerp(b.p, k), l: a.l.clone().lerp(b.l, k), fov: a.fov + (b.fov - a.fov) * k });
  const viva = (c, t, amp = 1) => { const n = (f, s) => Math.sin(t * f + s) * 0.5 + Math.sin(t * f * 2.3 + s * 1.7) * 0.25;
    c.p.add(v3(n(0.7, 1) * 0.012 * amp, n(0.9, 2) * 0.008 * amp, n(0.6, 3) * 0.01 * amp)); c.l.add(v3(n(0.5, 4) * 0.01 * amp, n(0.8, 5) * 0.006 * amp, 0)); return c; };
  const MM = { 24: 54.8, 35: 39.2, 50: 28.0, 85: 16.6, 135: 10.5 };
  const ponerCam = (c) => { camera.position.copy(c.p); camera.lookAt(c.l); camera.fov = c.fov; camera.aspect = W / H; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); };
  // geografía de la noche: Tomi echado en su silla mirando a Rocco, sentado en la tapa del escritorio vecino
  const TOMI_N = { x: 2.8, z: 1.75 }, ROCCO_N = v3(5.45, 0.79, 1.2), TOMI_D = { x: DT.x, z: DT.z + 0.07 };
  const yawT = Math.atan2(ROCCO_N.x - TOMI_N.x, ROCCO_N.z - TOMI_N.z), yawR = Math.atan2(TOMI_N.x - ROCCO_N.x, TOMI_N.z - ROCCO_N.z);
  const silla = (dia) => { const s = DT.seat; if (dia) { s.position.set(0, 0, 0.05); s.rotation.y = 0; } else { s.position.set(TOMI_N.x - 0.02 * Math.sin(yawT) - DT.x, 0, TOMI_N.z - 0.02 * Math.cos(yawT) - DT.z); s.rotation.y = yawT - Math.PI; } s.updateMatrixWorld(true); };
  const cel = (s) => mineScreen.localToWorld(v3((s[0] / 1880 - 0.5) * 0.94, (0.5 - s[1] / 1080) * 0.54, 0));   // de píxel del monitor al mundo
  let HT0, HR0, HD0, HP0;   // cabezas en reposo (las cámaras de trípode no siguen el respiro)
  const lado = (h, hacia, dist, k = 0.45) => { const u = hacia.clone().sub(h).setY(0).normalize(), pe = v3(-u.z, 0, u.x); if (pe.z < 0) pe.negate(); return h.clone().addScaledVector(u, k * dist).addScaledVector(pe, dist * Math.sqrt(1 - k * k)); };
  const camT = (dist, fov, k = 0.78) => fijo(...lado(HT0, HR0, dist, k).toArray(), HT0.x, HT0.y - 0.02, HT0.z, fov);
  const camR = (dist, fov) => fijo(...lado(HR0, HT0, dist).toArray(), HR0.x, HR0.y - 0.02, HR0.z, fov);
  const WEBCAM = () => fijo(CX + 0.02, 1.25, 0.98, CX, 1.19, 0.02, MM[50]);
  const PLANOS = {
    1: (t, u, D) => viaje(fijo(CX + 0.03, 1.24, 1.85, CX, 1.12, 0.02, MM[85]), fijo(CX + 0.02, 1.23, 1.7, CX, 1.13, 0.02, MM[85] - 0.8), ease(u / D)),
    2: (t, u, D) => viva(viaje(fijo(DT.x + 0.72, 1.3, DT.z - 0.95, HD0.x, HD0.y - 0.04, HD0.z, MM[35]), fijo(DT.x + 0.52, 1.27, DT.z - 0.66, HD0.x, HD0.y - 0.03, HD0.z, MM[50]), expo(u / D)), t, 0.5),
    3: (t) => viva(fijo(2.35, 1.62, 4.55, 4.3, 1.0, 1.3, MM[24]), t, 0.3),
    4: (t) => viva(camR(1.9, MM[85]), t, 0.15),
    5: (t) => viva(camT(1.15, MM[50]), t, 0.35),
    6: (t) => viva(camR(2.7, MM[50]), t, 0.2),
    7: (t, u, D) => { return viaje(fijo(CX + 0.02, 1.26, 1.4, CX, 1.12, 0.02, MM[50]), fijo(CX + 0.02, 1.25, 1.22, CX, 1.13, 0.02, MM[50] - 1.5), lin(t, ED[7].t0 + 0.9, ED[7].t1)); },
    8: (t) => viva(camR(1.45, MM[85]), t, 0.12),
    9: (t) => viva(camT(1.05, 22, 0.85), t, 0.6),
    10: (t, u, D) => { const k = suave(lin(t, REB[10].t1, ED[10].t1)); return viaje(WEBCAM(), fijo(CX + 0.1, 1.32, 2.15, CX + 0.05, 0.98, 0.1, MM[35]), k); },
    11: (t, u, D) => { const a = cel([1420, 400]), b = cel([1420, 430]); return viva(viaje(fijo(a.x + 0.04, a.y + 0.01, a.z + 0.62, a.x, a.y, a.z, MM[35]), fijo(b.x + 0.03, b.y, b.z + 0.56, b.x, b.y, b.z, MM[35]), u / D), t, 0.2); },
    12: (t) => viva(camT(1.0, 22, 0.85), t, 1.3),
    13: (t, u, D) => { const k = suave(lin(u, 0, D)); return viva(viaje(camR(1.9, MM[85]), camR(1.75, MM[135]), k), t, 0.12); },
    14: (t) => viva(camT(1.1, 12.5, 0.9), t, 0.25),
    15: (t, u, D) => { const k = suave(u / D); return fijo(CELT.x + 0.005, CELT.y + 0.33 - 0.03 * k, CELT.z + 0.06, CELT.x, CELT.y, CELT.z - 0.004, MM[50]); },
    16: (t, u, D) => { const a = cel([1800, 1045]); return viaje(fijo(a.x + 0.02, a.y + 0.015, a.z + 0.24, a.x, a.y, a.z, MM[50]), fijo(a.x + 0.015, a.y + 0.012, a.z + 0.2, a.x, a.y, a.z, MM[50]), u / D); },
  };
  PLANOS[17] = PLANOS[18] = (t) => PLANOS[16](ED[16].t1, ED[16].t1 - ED[16].t0, ED[16].t1 - ED[16].t0);

  // ---- la escena de cada instante ----
  const esconder = () => { for (const a of Object.values(actores)) a.o.visible = false; rocco.visible = false; celP.g.visible = false; };
  const M = (x, y, z) => v3(x, y, z);
  // el prospecto según tr: mira a la cámara, se le van los ojos en «socia», el pulgar escribe todo el tiempo, la derecha acompaña
  function prospectoEn(r, t) {
    const a = actores.prospecto, cam = v3(CX, 0.98, 0.68), celPos = v3(CX + 0.3, 0.86, 0.36);
    const g = suave(lin(r, C.socia - 0.22, C.socia + 0.05)) * (1 - suave(lin(r, C.socia + 0.55, C.socia + 0.9)));
    const g2 = suave(lin(r, C.dale + 0.9, C.dale + 1.2)) * (1 - suave(lin(r, C.dale + 1.7, C.dale + 2.0)));
    const mira = cam.clone().lerp(celPos, Math.max(g * 0.8, g2 * 0.6));
    const vb = muestra(MU.boca_tr, r * MU.hz), si = pulso(r, C.si, C.si + 0.45, 0.12), ges = Math.max(pulso(r, C.ahora - 0.7, C.ahora + 0.1, 0.25), pulso(r, 4.1, 5.0, 0.25) * 0.7, pulso(r, C.dale - 0.1, C.dale + 0.6, 0.2) * 0.6);
    pose(a, { x: CX, z: 0.02, yaw: 0, asiento: 0.48, voz: 'p', vozV: vb, mira, pitch: 0.12 * si, lean: 0.1 + 0.02 * vb,
      brazos: { Left: [[0.3, -0.85, 0.35], [-0.15, 0.3, 1]], Right: [[0.2, -0.8, 0.5], [0.12 - 0.05 * ges, -0.05 + 0.5 * ges, 1]] } }, t);
    const tecla = Math.abs(Math.sin(r * 9.5)) * (1 - g * 0.7);
    const m = mano(a, 'Left', cabeza(a).sub(a.B.LeftHand.getWorldPosition(v3())), 0.45, tecla);
    mano(a, 'Right', v3(0, 0.3, 1).lerp(v3(0, -1, 0.1), 1 - ges), 0.3 - 0.2 * ges);
    const n = m.n.clone().addScaledVector(m.d, -m.n.dot(m.d)).normalize(), X = m.d.clone().cross(n);
    celP.g.visible = true; celP.g.position.copy(m.h).addScaledVector(m.d, 0.07).addScaledVector(n, 0.014); celP.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, m.d, n)); celP.g.updateMatrixWorld(true);
    chat(r);
  }
  function tomiNoche(t, extra = {}) {
    pose(actores.tomi, { x: TOMI_N.x, z: TOMI_N.z, yaw: yawT, lean: -0.16, voz: 'tomi', mira: HR0 || v3(ROCCO_N.x, 1.25, ROCCO_N.z),
      brazos: { Left: [[0.75, -0.6, 0.05], [0.55, 0.02, 1]], Right: [[-0.15, -0.9, 0.35], [0.12, -0.35, 1]] }, ...extra }, t);
  }
  let LOOKV = { recuerdo: 0, frio: 0 }, CAB = [];
  function escena(t) {
    const s = plano(t), u = t - s.t0, D = s.t1 - s.t0, P = s.plano, rec = RECUERDO.includes(P);
    esconder(); CAB = [];
    if (rec || P === 2) luzRecuerdo(); else noche();
    if (rec && P !== 2) { const r = tr(t, P); prospectoEn(r, t); CAB.push(cabeza(actores.prospecto)); }
    if (P === 2) { silla(true); pose(actores.tomi, { x: TOMI_D.x, z: TOMI_D.z, yaw: Math.PI, voz: 'none', mira: v3(DT.x, 1.28, DT.z - 1), lean: 0.08 + 0.05 * suave(u / D),
      brazos: { Left: [[0.15, -0.75, 0.6], [-0.1, -0.05, 1]], Right: [[-0.1, -0.95, 0.3], [0.1, -0.4, 1]] } }, t);
      mano(actores.tomi, 'Right', v3(-1, 0, 0), suave(lin(u, 0.2, 0.7))); monitor(t, true); CAB.push(cabeza(actores.tomi)); }
    if (!rec && P !== 2 && P < 17) {
      silla(false);
      const ladeo = P === 4 ? 0.13 * suave(lin(u, 0.3, 0.9)) : P === 13 ? 0.06 : 0;
      poseRocco(ROCCO_N.x, ROCCO_N.y, ROCCO_N.z, yawR, HT0 || v3(TOMI_N.x, 1.15, TOMI_N.z), t, ladeo); CAB.push(cabR());
      const baja = P === 14 || P === 15 ? suave(lin(t, ED[14].t0 - 0.2, ED[14].t0 + 1.0)) : 0;
      tomiNoche(t, { lean: -0.16 + 0.1 * baja + (P === 12 ? 0.05 : 0), mira: baja > 0 ? (HR0 || v3()).clone().lerp(v3(TOMI_N.x + 1.1, 0.55, TOMI_N.z + 0.25), baja * 0.85) : HR0, pitch: P === 9 ? 0.06 : 0 });
      CAB.push(cabeza(actores.tomi)); monitor(t, false);
      celT.pa.material = P === 15 ? reflejoM : negroM; }
    if (P >= 17) { noche(); monitor(t, false); }
    mezclador.setTime(t % 1.25);
    const c = window.CAMS ? fijo(...window.CAMS) : PLANOS[P](t, u, D); ponerCam(c);
    if (P === 15) { rtCam.position.copy(CELT).add(v3(0, 0.01, 0)); rtCam.up.set(Math.sin(GIRO), 0, -Math.cos(GIRO)).negate(); rtCam.lookAt(cabeza(actores.tomi)); rtCam.updateMatrixWorld();
      renderer.setRenderTarget(rt); renderer.render(scene, rtCam); renderer.setRenderTarget(null); }
    // el look: el recuerdo es anamórfico y se enfría pasada a pasada; el rebobinado tira la imagen; «ahora» cruza el cuadro
    LOOKV = { recuerdo: rec || P === 2 ? 1 : 0, frio: MU.frio[P] || 0 };
    POST.fijar({ ...LOOKV, rebob: rebobinando(t), flare: t >= E.ahora - 0.06 && P === 1 ? Math.exp(-(t - E.ahora + 0.06) * 3.2) * suave(lin(t, E.ahora - 0.06, E.ahora + 0.02)) : 0, t });
    renderer.shadowMap.needsUpdate = true;
    composer.render();
    return s;
  }
  const POST = crearPost({ THREE, composer, W, H });
  Object.defineProperty(window, 'LOOK', { get: () => LOOKV, configurable: true });

  // reposo de las cabezas para las cámaras de trípode
  silla(false); poseRocco(ROCCO_N.x, ROCCO_N.y, ROCCO_N.z, yawR, v3(TOMI_N.x, 1.15, TOMI_N.z), 0); HR0 = cabR();
  tomiNoche(0, { mira: HR0 }); HT0 = cabeza(actores.tomi);
  silla(true); pose(actores.tomi, { x: TOMI_D.x, z: TOMI_D.z, yaw: Math.PI, mira: v3(DT.x, 1.28, DT.z - 1), brazos: { Left: [[0.15, -0.75, 0.6], [-0.1, -0.05, 1]], Right: [[0.15, -0.75, 0.6], [-0.1, -0.05, 1]] } }, 0); HD0 = cabeza(actores.tomi);
  prospectoEn(0.5, 0); HP0 = cabeza(actores.prospecto);

  // ---- gráficos: la frase arriba, la marca de tiempo y el marco fino de la videollamada ----
  const CLAVE = { t51: 'pagó.', t52: 'juro,', t53: 'transfiere.', r53: 'socia?', t54: 'final.', t55: 'bien.', r54: 'mintió,', r55: 'escuchar.' };
  const ZOC = { 1: ['HOY · 15:24', 'LA LLAMADA'], 3: ['23:58', 'LA OFICINA, VACÍA'] };
  // el marco es lo que veía la webcam: sus esquinas viven en el mundo, así que al retroceder la cámara el marco se achica y deja ver la mano
  const MARCO = (() => { const w = WEBCAM(), c = new THREE.PerspectiveCamera(w.fov, W / H, 0.05, 50); c.position.copy(w.p); c.lookAt(w.l); c.updateMatrixWorld(); c.updateProjectionMatrix();
    const dist = w.p.distanceTo(w.l); return [[-0.93, 0.93], [0.93, 0.93], [0.93, -0.95], [-0.93, -0.95]].map(([x, y]) => { const p = v3(x, y, 0.5).unproject(c).sub(c.position).normalize(); return c.position.clone().addScaledVector(p, dist); }); })();
  function letreros(g, t, s, api) {
    const { tx, MO, Rr, W: w, H: h } = api; api.zocalo(g, t, s); const P = s.plano;
    if (![1, 7, 10].includes(P)) return;
    const q = MARCO.map((p) => { const v = p.clone().project(camera); return [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h]; });
    const x0 = q[0][0], y0 = q[0][1], x1 = q[2][0], y1 = q[2][1], a = P === 10 ? 1 - suave(lin(t, ED[10].t1 - 0.9, ED[10].t1 - 0.2)) : 1;
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = Rr(2); g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, Rr(26)); g.stroke();
    const px = Math.min(x1, w) - Rr(30), py = Math.min(y1, h * 0.69) - Rr(34); g.fillStyle = 'rgba(8,10,14,0.55)'; const tw = Rr(250); g.beginPath(); g.roundRect(px - tw, py - Rr(46), tw, Rr(58), Rr(29)); g.fill();   // el subtítulo de abajo arranca en 0,71: el cartel nunca lo pisa
    g.fillStyle = '#e11d48'; g.beginPath(); g.arc(px - tw + Rr(30), py - Rr(17), Rr(7), 0, 7); g.fill(); g.restore();
    tx(g, [[NOMBRE.toUpperCase(), MO(Rr(17)), '#f3f4f6']], px - tw + Rr(48), py - Rr(10), { a, track: Rr(3) });
  }
  const api = await crearGraficos({ THREE, W, H, MU, renderer, camera, plano, CLAVE, ZOC, cabezas: () => CAB.map((c) => [c, 0.16, 0.18]), golpes: [], letreros, cortesFlash: {} });

  window.renderAt = (t) => { const s = escena(t); api.ac.clearRect(0, 0, W, H); api.pintar3D(1, api.post(t)); api.textos(t, s); };
  window.renderAccum = (t, n, sh) => { const s = plano(t); api.ac.clearRect(0, 0, W, H);
    for (let k = 0; k < n; k++) { const tk = Math.max(s.t0, t - sh * k / Math.max(1, n - 1)); escena(tk); api.pintar3D(1 / (k + 1), api.post(tk)); }
    escena(t); api.textos(t, s); };
  window.DURATION = MU.dur;
}
