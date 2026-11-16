"""Corte animado. Uso: blender -b --python anim.py -- F0 F1 [CYCLES|EEVEE]  ->  render/####.png
Variables: SPP (muestras), PCT (resolución en %)."""
import bpy, sys, os, math
import numpy as np, mathutils
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from base import *
from pelo import *
from maquina import maquina_real
from mathutils.bvhtree import BVHTree

arg = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
F0 = int(arg[0]) if arg else 0
F1 = int(arg[1]) if len(arg) > 1 else F0
MOTOR = arg[2] if len(arg) > 2 else 'CYCLES'
FPS = 30
OUT = os.path.dirname(os.path.abspath(__file__)) + '/render/'

h = escena(); cuero(h)
P, R, N, L = crecer(h)
Rb = R - N * .01
pel = objeto_pelo(P)
capa()
dg = bpy.context.evaluated_depsgraph_get()
bvh = BVHTree.FromObject(h, dg)


def ez(u):
    u = min(1.0, max(0.0, u)); return u * u * (3 - 2 * u)


# pasadas de máquina por el lado x>0 de la nuca (izquierda del cuadro)
PAS = [(.45, 2.75, .62), (3.15, 5.55, 1.15)]   # (inicio, fin, x del centro de la cuchilla)
Z0, Z1, ANCHO = .35, 2.25, .80


def punto(x, z):
    loc, nor, _, _ = bvh.ray_cast(mathutils.Vector((x, 8, z)), mathutils.Vector((0, -1, 0)))
    return np.array(loc), np.array(nor)


def altura(u):
    return Z0 + (Z1 - Z0) * ez(u / .82)


def estado(t):
    """(x, z, cuánto está separada de la cabeza 0..1)"""
    a0 = PAS[0][0]
    if t < a0:
        return PAS[0][2], Z0, 1 - ez(t / a0)
    for i, (a, b, x) in enumerate(PAS):
        if a <= t <= b:
            u = (t - a) / (b - a)
            return x, altura(u), ez((u - .80) / .20)
        if i + 1 < len(PAS) and b < t < PAS[i + 1][0]:
            u = (t - b) / (PAS[i + 1][0] - b)
            x2 = PAS[i + 1][2]
            sal = 1 - ez((u - .55) / .45)
            return x + (x2 - x) * ez(u), Z1 + (Z0 - Z1) * ez(u / .8), max(sal, 0.0)
    a, b, x = PAS[-1]
    u = (t - b) / 1.4      # el celular vibra: la mano frena y saca la máquina del cuadro
    return x, Z1 + (Z0 + .5 - Z1) * ez(u), 1.0 + 3.5 * ez(u)


fac_hecho = degrade(R)
# tope de caída en la nuca: el pelo de arriba no cuelga como cortina sobre lo rebajado
_caida = R[:, 2] - P[:, -1, 2]
_tope = np.where((_caida > .2) & (R[:, 1] > .1) & (R[:, 2] < 3.4), np.clip(.2 / np.maximum(_caida, 1e-6), 0, 1), 1.0)
fac_hecho = np.minimum(fac_hecho, np.maximum(_tope, .15))
# nuca prolija de entrada: el pelo bajo se acorta de forma pareja (sin mechones que cuelguen del lado sin cortar)
fac_hecho = np.where(R[:, 1] > .3, np.minimum(fac_hecho, np.clip((R[:, 2] - .2) / 1.9, .3, 1) ** 1.2), fac_hecho)
fin = fin_de(R)
# ningún pelo de arriba termina por debajo de z 2.05 sobre la franja que se rebaja (sin mechones colgando)
_zmin = 2.05
_sobre = (R[:, 0] > -.3) & (R[:, 0] < 1.95) & (R[:, 1] > .3) & (R[:, 2] > _zmin) & (P[:, -1, 2] < _zmin)
_cap = np.ones(len(R))
_cap[_sobre] = np.clip((R[_sobre, 2] - _zmin) / np.maximum(R[_sobre, 2] - P[_sobre, -1, 2], 1e-6), .05, 1)
atras = np.clip((R[:, 1] - .2) / .6, 0, 1)


def largos(t):
    f = fac_hecho.copy()
    for (a, b, x) in PAS:
        if t < a:
            continue
        u = min(1.0, (t - a) / (b - a))
        dx = np.abs(R[:, 0] - x)
        lado = np.clip((ANCHO * 1.05 - dx) / (ANCHO * .22), 0, 1)        # borde lateral corto: escalón limpio, sin mechón a medias
        alto = np.clip((altura(u) + .9 - R[:, 2]) / .9, 0, 1)           # salida de muñeca: se esfuma hacia arriba
        k = lado * alto * atras
        en = k > 0
        f[en] = np.minimum(f[en], 1 - (1 - fin[en]) * k[en])
    return f


def caer(t):
    """recortes que salen de la cuchilla y caen sobre la capa (deterministas)"""
    pts = []
    for (a, b, x) in PAS:
        for k in range(int((b - a) * FPS)):
            te = a + k / FPS
            if te > t:
                break
            xx, z, sal = estado(te)
            if sal > .3:
                continue
            p0, n0 = punto(xx, z + .05)
            r = np.random.default_rng(int(te * 1000))
            dt = t - te
            for j in range(16):
                v = n0 * r.uniform(.3, 1.2) + np.array([r.normal(0, .5), 0, r.uniform(-.1, .7)])
                p = p0 + np.array([r.uniform(-.4, .4), 0, 0]) + v * dt + np.array([0, 0, -6.5 * dt * dt])
                zc = -0.2 - 7 * max(0.0, (math.hypot(p[0], p[1]) - 1.36) / 4.0)
                if p[2] < zc + .03:
                    p[2] = zc + .03
                d = r.normal(size=3); d /= np.linalg.norm(d)
                pts.append((p, p + d * r.uniform(.05, .16)))
    return pts


from mathutils.kdtree import KDTree
_hv = np.array([v.co for v in h.data.vertices]); _M = np.array(h.matrix_world)
_hv = (np.c_[_hv, np.ones(len(_hv))] @ _M.T)[:, :3]
_kd = KDTree(len(R))
for i, r in enumerate(R):
    _kd.insert(r.tolist(), i)
_kd.balance()
_near = np.array([_kd.find(v.tolist())[1] for v in _hv])
_w0 = np.zeros(len(_hv), np.float32); h.data.attributes['cuero'].data.foreach_get('value', _w0)
_zona = np.array([_kd.find(v.tolist())[2] for v in _hv]) < .25


def cuero_frame(fac):
    w = _w0.copy()
    k = np.clip(fac[_near], 0, 1) ** .35
    k = np.maximum(k, np.clip((_hv[:, 2] - .25) / 1.7, 0, 1) * .92)   # sombra del rastrojo: sube pareja de abajo hacia arriba
    w[_zona] = np.clip(np.maximum(_w0[_zona], .55) * k[_zona], 0, 1) ** .6
    h.data.attributes['cuero'].data.foreach_set('value', w.astype(np.float32)); h.data.update()


cv = bpy.data.hair_curves.new('recortes')
rec = bpy.data.objects.new('recortes', cv)
bpy.context.scene.collection.objects.link(rec)
cv.materials.append(pel.data.materials[0])
maq = maquina_real()
cam = luces_y_camara((11.5, 10.5, 3.6), (.5, .7, 1.35), lente=55)
sc = bpy.context.scene
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 2.8
_L = bpy.data.lights.new('rim', 'AREA'); _L.energy = 900; _L.size = 2; _L.color = (1, .82, .62)
_o = bpy.data.objects.new('rim', _L); sc.collection.objects.link(_o); _o.location = (-2, 9, 5)
_o.rotation_euler = (mathutils.Vector((.7, 1.6, 1.5)) - _o.location).to_track_quat('-Z', 'Y').to_euler()
if MOTOR == 'EEVEE':
    ids = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in ids else 'BLENDER_EEVEE'
    sc.eevee.taa_render_samples = int(os.environ.get('SPP', '64'))
else:
    sc.cycles.samples = int(os.environ.get('SPP', '32'))
    sc.cycles.use_denoising = True
sc.render.resolution_percentage = int(os.environ.get('PCT', '100'))
os.makedirs(OUT, exist_ok=True)

def cuadro(f, cam_override=None):
    t = f / FPS
    fac = largos(t)
    Pt = Rb[:, None] + (P - Rb[:, None]) * fac[:, None, None]
    pel.data.attributes['position'].data.foreach_set('vector', Pt.reshape(-1).astype(np.float32))
    pel.data.update_tag()
    cuero_frame(fac)
    # máquina apoyada en la nuca, cuchilla hacia arriba
    x, z, sal = estado(t)
    p, n = punto(x, z)
    up = np.array([0, 0, 1.0]); tg = up - n * (n @ up); tg /= np.linalg.norm(tg)
    ang = math.radians(30 + 25 * min(sal, 1.0))
    Z = tg * math.cos(ang) - n * math.sin(ang)     # cuchilla contra la piel, cuerpo hacia afuera
    Y = -(n * math.cos(ang) + tg * math.sin(ang))
    X = np.cross(Y, Z)
    M = mathutils.Matrix(np.c_[X, Y, Z].tolist()).to_4x4()
    maq.matrix_world = mathutils.Matrix.Translation(mathutils.Vector((p + n * (.05 + 1.4 * sal) - tg * (.8 * sal)).tolist())) @ M
    # recortes
    pts = caer(t)
    if pts:
        if len(cv.curves):
            cv.remove_curves()
        cv.add_curves([2] * len(pts))
        cv.attributes['position'].data.foreach_set('vector', np.array(pts).reshape(-1).astype(np.float32))
        rad = cv.attributes.get('radius') or cv.attributes.new('radius', 'FLOAT', 'POINT')
        rad.data.foreach_set('value', np.full(len(pts) * 2, .006, np.float32))
    cv.update_tag()
    # cámara: acercamiento lento
    u = ez(t / 12.4)
    cl = np.array([5.9, 9.0, 0.5]) * (1 - u) + np.array([4.9, 7.7, 0.8]) * u
    _mira = np.array([.45, 1.6, 1.75]); cl = _mira + (cl - _mira) * float(os.environ.get('LEJOS', '1.4'))   # 16/11: plano más abierto
    cam.location = cl.tolist()
    cam.rotation_euler = (mathutils.Vector((.45, 1.6, 1.75)) - mathutils.Vector(cl.tolist())).to_track_quat('-Z', 'Y').to_euler()
    cam.data.dof.focus_distance = float(np.linalg.norm(cl - np.array([.6, 1.75, 1.5])))
    if cam_override:
        cl, mira = np.array(cam_override[0]), cam_override[1]
        cam.location = cl.tolist()
        cam.rotation_euler = (mathutils.Vector(mira) - mathutils.Vector(cl.tolist())).to_track_quat('-Z', 'Y').to_euler()
        cam.data.dof.focus_distance = float(np.linalg.norm(cl - p))


if __name__ == '__main__' and not os.environ.get('SIN_LOOP'):
    LISTA = [int(x) for x in os.environ['CUADROS'].split(',')] if os.environ.get('CUADROS') else range(F0, F1 + 1)
    OUT = os.environ.get('SALIDA', OUT)
    os.makedirs(OUT, exist_ok=True)
    for f in LISTA:
        cuadro(f)
        sc.render.filepath = OUT + '%04d.png' % f
        bpy.ops.render.render(write_still=True)
        print('CUADRO', f, flush=True)
