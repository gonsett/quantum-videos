# Reel 01 de Caudal: una sola toma en Cycles. Miel real por cuadro, cifras de oro, celular aprobado y moneda.
# blender -b -P escena.py -- <cuadros a,b,c> <porcentaje> <muestras> <carpeta mallas> <carpeta salida>
import json, math, os, sys
import bmesh, bpy
import numpy as np
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import linea as ln

a = sys.argv[sys.argv.index('--') + 1:]
CUADROS = [int(x) for x in a[0].split(',')]
PCT, MUESTRAS, MALLAS, SAL = int(a[1]), int(a[2]), os.path.abspath(a[3]), os.path.abspath(a[4])
os.makedirs(SAL, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene
DATA = os.path.join(AQUI, 'data')
ASSETS = os.path.join(AQUI, 'assets')
GLIFOS = json.load(open(os.path.join(DATA, 'glifos.json'), encoding='utf8'))


# ------------------------------------------------------------- materiales
def material(nombre, color, metal=0.0, rugosidad=0.4, capa=0.0):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rugosidad
    b.inputs['Coat Weight'].default_value = capa
    b.inputs['Coat Roughness'].default_value = .08
    return m


def aluminio(nombre, color, rugosidad):
    m = material(nombre, color, 1.0, rugosidad)
    n, l = m.node_tree.nodes, m.node_tree.links
    ruido = n.new('ShaderNodeTexNoise')
    ruido.inputs['Scale'].default_value = 5200
    ruido.inputs['Detail'].default_value = 2
    l.new(n.new('ShaderNodeTexCoord').outputs['Object'], ruido.inputs['Vector'])
    r = n.new('ShaderNodeMapRange')
    r.inputs['From Min'].default_value, r.inputs['From Max'].default_value = .3, .7
    r.inputs['To Min'].default_value, r.inputs['To Max'].default_value = rugosidad - .035, rugosidad + .035
    l.new(ruido.outputs['Fac'], r.inputs['Value'])
    l.new(r.outputs['Result'], n['Principled BSDF'].inputs['Roughness'])
    return m


def miel():
    m = bpy.data.materials.new('miel')
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    b = n['Principled BSDF']
    b.inputs['Base Color'].default_value = (1, .97, .9, 1)
    b.inputs['Transmission Weight'].default_value = 1
    b.inputs['IOR'].default_value = 1.49
    b.inputs['Roughness'].default_value = .02
    v = n.new('ShaderNodeVolumeAbsorption')
    v.inputs['Color'].default_value = (.96, .90, .60, 1)
    v.inputs['Density'].default_value = 3.6
    l.new(v.outputs[0], n['Material Output'].inputs['Volume'])
    return m


def con_alfa(m):
    """El objeto se desvanece por ob.color[3]; así cada palabra entra con su propio tiempo."""
    n, l = m.node_tree.nodes, m.node_tree.links
    sal = n['Material Output']
    b = n['Principled BSDF']
    t = n.new('ShaderNodeBsdfTransparent')
    mz = n.new('ShaderNodeMixShader')
    l.new(n.new('ShaderNodeObjectInfo').outputs['Alpha'], mz.inputs[0])
    l.new(t.outputs[0], mz.inputs[1])
    l.new(b.outputs[0], mz.inputs[2])
    l.new(mz.outputs[0], sal.inputs['Surface'])
    return m


def emisor(nombre, color, fuerza, radial=None):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    n.clear()
    e = n.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = (*color, 1)
    e.inputs['Strength'].default_value = fuerza
    l.new(e.outputs[0], n.new('ShaderNodeOutputMaterial').inputs['Surface'])
    if radial:
        # caída suave desde el centro del objeto: la luz se apaga antes de mostrar un borde
        d = n.new('ShaderNodeVectorMath')
        d.operation = 'LENGTH'
        l.new(n.new('ShaderNodeTexCoord').outputs['Object'], d.inputs[0])
        r = n.new('ShaderNodeMapRange')
        r.interpolation_type = 'SMOOTHERSTEP'
        r.inputs['From Min'].default_value, r.inputs['From Max'].default_value = 0, radial
        r.inputs['To Min'].default_value, r.inputs['To Max'].default_value = 1, 0
        l.new(d.outputs['Value'], r.inputs['Value'])
        mt = n.new('ShaderNodeMath')
        mt.operation = 'MULTIPLY'
        mt.inputs[1].default_value = fuerza
        mt.name = 'fuerza'
        l.new(r.outputs[0], mt.inputs[0])
        l.new(mt.outputs[0], e.inputs['Strength'])
    return m


def fuerza(m, v):
    n = m.node_tree.nodes
    if 'fuerza' in n:
        n['fuerza'].inputs[1].default_value = v
    else:
        n['Emission'].inputs['Strength'].default_value = v


MIEL = miel()
ORO = material('oro', (.86, .60, .22), 1.0, .2)
ORO_T = con_alfa(material('oro-t', (.86, .62, .26), 1.0, .24))
MARFIL = con_alfa(material('marfil', (.93, .885, .79), 0, .34, .4))
_b = MARFIL.node_tree.nodes['Principled BSDF']
_b.inputs['Emission Color'].default_value = (.93, .885, .79, 1)
_b.inputs['Emission Strength'].default_value = .42
CHAMPAN = aluminio('champan', (.63, .50, .35), .17)
CHAMPAN_M = aluminio('champan-mate', (.57, .455, .32), .33)
BRONCE = aluminio('bronce', (.20, .145, .095), .36)
VIDRIO = material('vidrio', (.006, .005, .004), 0, .045, 1.0)
NEGRO = material('negro', (.002, .002, .002), 0, .7)
LENTE = material('lente', (.012, .012, .012), 0, .06, 1.0)
FONDO = emisor('fondo', (.26, .14, .03), 1.0, radial=.42)


# ------------------------------------------------------------- geometría
def rr(w, h, r, cx=0.0, cy=0.0, seg=10):
    r = max(min(r, w / 2 - 1e-5, h / 2 - 1e-5), 1e-5)
    pts = []
    for sx, sy, a0 in ((1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)):
        ox, oy = sx * (w / 2 - r), sy * (h / 2 - r)
        for k in range(seg + 1):
            an = math.radians(a0 + 90 * k / seg)
            pts.append((cx + ox + r * math.cos(an), cy + oy + r * math.sin(an)))
    return pts


def losa(bm, w, h, r, perfil, cx=0.0, cy=0.0, seg=10, tapas=True):
    anillos = []
    for metido, z in perfil:
        anillos.append([bm.verts.new((x, y, z)) for x, y in rr(w - 2 * metido, h - 2 * metido, r - metido, cx, cy, seg)])
    for p, q in zip(anillos, anillos[1:]):
        for i in range(len(p)):
            j = (i + 1) % len(p)
            bm.faces.new((p[i], p[j], q[j], q[i])).smooth = True
    if tapas:
        bm.faces.new(anillos[-1])
        bm.faces.new(list(reversed(anillos[0])))


def canto(b, z0, z1, pasos=6):
    salida = [(0, z0)]
    for k in range(pasos + 1):
        an = math.radians(90 * k / pasos)
        salida.append((b * (1 - math.cos(an)), z1 - b + b * math.sin(an)))
    return salida


def objeto(nombre, materiales, fabricar, rot=None, pos=(0, 0, 0), padre=None):
    m = bpy.data.meshes.new(nombre)
    bm = bmesh.new()
    fabricar(bm)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(m)
    bm.free()
    for mat in materiales:
        m.materials.append(mat)
    o = bpy.data.objects.new(nombre, m)
    if rot is not None:
        o.rotation_euler = rot
    o.location = pos
    esc.collection.objects.link(o)
    if padre:
        o.parent = padre
    return o


FRENTE = (math.pi / 2, 0, 0)  # el +z local mira a la cámara (-y)


# ------------------------------------------------------------- pantalla real del celular
def pantalla_material():
    """Captura real de Caudal; la cifra y la barra se llenan de izquierda a derecha (valores 'cifra' y 'barra')."""
    m = bpy.data.materials.new('pantalla')
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    b = n['Principled BSDF']
    b.inputs['Base Color'].default_value = (0, 0, 0, 1)
    b.inputs['Roughness'].default_value = .05
    b.inputs['Emission Strength'].default_value = 1.0
    b.name = 'bsdf'
    uv = n.new('ShaderNodeUVMap')
    sep = n.new('ShaderNodeSeparateXYZ')
    l.new(uv.outputs['UV'], sep.inputs[0])

    def img(nombre):
        t = n.new('ShaderNodeTexImage')
        t.image = bpy.data.images.load(os.path.join(ASSETS, 'pantalla', nombre))
        t.extension = 'CLIP'
        t.interpolation = 'Cubic'
        return t

    base = img('base.png')
    l.new(uv.outputs['UV'], base.inputs['Vector'])
    color = base.outputs['Color']
    W, H = 780, 1688
    for nombre, (x0, y0, x1, y1), valor in (('num.png', (30, 425, 580, 550), 'cifra'), ('bar.png', (40, 603, 740, 632), 'barra')):
        u0, u1 = x0 / W, x1 / W
        v0, v1 = 1 - y1 / H, 1 - y0 / H
        mp = n.new('ShaderNodeMapping')
        mp.inputs['Location'].default_value = (-u0 / (u1 - u0), -v0 / (v1 - v0), 0)
        mp.inputs['Scale'].default_value = (1 / (u1 - u0), 1 / (v1 - v0), 1)
        l.new(uv.outputs['UV'], mp.inputs['Vector'])
        t = img(nombre)
        l.new(mp.outputs['Vector'], t.inputs['Vector'])
        lx = n.new('ShaderNodeSeparateXYZ')
        l.new(mp.outputs['Vector'], lx.inputs[0])
        p = n.new('ShaderNodeValue')
        p.name = valor
        p.outputs[0].default_value = 0
        # borde del llenado suave: (p*1.05 - x) / 0.05, recortado a 0..1
        resta = n.new('ShaderNodeMath')
        resta.operation = 'MULTIPLY_ADD'
        resta.inputs[1].default_value = 1.05
        l.new(p.outputs[0], resta.inputs[0])
        neg = n.new('ShaderNodeMath')
        neg.operation = 'MULTIPLY'
        neg.inputs[1].default_value = -1
        l.new(lx.outputs['X'], neg.inputs[0])
        l.new(neg.outputs[0], resta.inputs[2])
        div = n.new('ShaderNodeMath')
        div.operation = 'DIVIDE'
        div.use_clamp = True
        div.inputs[1].default_value = .05
        l.new(resta.outputs[0], div.inputs[0])
        mk = n.new('ShaderNodeMath')
        mk.operation = 'MULTIPLY'
        l.new(div.outputs[0], mk.inputs[0])
        l.new(t.outputs['Alpha'], mk.inputs[1])
        mx = n.new('ShaderNodeMix')
        mx.data_type = 'RGBA'
        l.new(mk.outputs[0], mx.inputs['Factor'])
        l.new(color, mx.inputs[6])
        l.new(t.outputs['Color'], mx.inputs[7])
        color = mx.outputs[2]
    l.new(color, b.inputs['Emission Color'])
    return m


PANTALLA = pantalla_material()

# ------------------------------------------------------------- celular (el de la landing, aprobado)
A_P = .0682
H_P = A_P * 844 / 390
MARCO = .0030
A_CEL = A_P + 2 * MARCO
H_CEL = H_P + 2 * MARCO
E_CEL = .0080
R_CEL = .0118
ESCALA_CEL = 2.75 / H_CEL


def celular():
    piv = bpy.data.objects.new('celu', None)
    esc.collection.objects.link(piv)
    pos = (0, E_CEL, 0)
    perfil = [(.0007, 0)]
    for k in range(1, 7):
        an = math.radians(90 * k / 6)
        perfil.append((.0007 * (1 - math.sin(an)), .0007 * (1 - math.cos(an))))
    perfil += canto(.00075, .0007, E_CEL)[1:]
    objeto('celu-cuerpo', [CHAMPAN], lambda bm: losa(bm, A_CEL, H_CEL, R_CEL, perfil, 0, H_CEL / 2, seg=16), FRENTE, pos, piv)
    objeto('celu-vidrio', [VIDRIO], lambda bm: losa(bm, A_CEL - .0012, H_CEL - .0012, R_CEL - .0006,
           [(0, 0), (0, .00014), (.00014, .00022)], 0, H_CEL / 2, seg=16), FRENTE, (0, .00003, 0), piv)

    def pant(bm):
        losa(bm, A_P, H_P, R_CEL - MARCO, [(0, 0), (0, .00002)], 0, H_CEL / 2, seg=16)
        uvl = bm.loops.layers.uv.new('UVMap')
        for f in bm.faces:
            for lp in f.loops:
                x, y, _ = lp.vert.co
                lp[uvl].uv = ((x + A_P / 2) / A_P, (y - (H_CEL / 2 - H_P / 2)) / H_P)
    objeto('celu-pantalla', [PANTALLA], pant, FRENTE, (0, -.00021, 0), piv)
    y_isla = H_CEL / 2 + H_P / 2 - .0034 - .0032
    objeto('celu-isla', [NEGRO], lambda bm: losa(bm, .0198, .0058, .0029, [(0, 0), (0, .00002)], 0, y_isla, seg=12),
           FRENTE, (0, -.00025, 0), piv)
    objeto('celu-lente', [LENTE], lambda bm: losa(bm, .0026, .0026, .00129, [(0, 0), (.00006, .00006)], .0058, y_isla, seg=10),
           FRENTE, (0, -.00029, 0), piv)

    def botones(bm):
        for lado, z_c, largo in ((-1, H_CEL * .735, .0052), (-1, H_CEL * .655, .0096), (-1, H_CEL * .57, .0096), (1, H_CEL * .67, .0150)):
            losa(bm, .00052, largo, .00024, [(0, -.0052), (0, -.0018)], lado * (A_CEL / 2 + .00016), z_c, seg=4)
    objeto('celu-botones', [CHAMPAN_M], botones, FRENTE, (0, 0, 0), piv)

    def bandas(bm):
        for lado in (-1, 1):
            for z_c in (H_CEL * .90, H_CEL * .10):
                losa(bm, .00012, .00085, .00005, [(0, -E_CEL + .0005), (0, -.0005)], lado * (A_CEL / 2 + .00002), z_c, seg=2)
    objeto('celu-bandas', [BRONCE], bandas, FRENTE, (0, 0, 0), piv)
    piv.scale = (ESCALA_CEL,) * 3
    return piv


CELU = celular()


# ------------------------------------------------------------- palabras y cifras en 3D
def limpio(c):
    out = []
    for p in c:
        if not out or abs(p[0] - out[-1][0]) + abs(p[1] - out[-1][1]) > 1e-5:
            out.append(p)
    if len(out) > 2 and abs(out[0][0] - out[-1][0]) + abs(out[0][1] - out[-1][1]) < 1e-5:
        out.pop()
    return out


def palabra(clave, mat, tam, prof, bisel):
    cu = bpy.data.curves.new(clave, 'CURVE')
    cu.dimensions = '2D'
    cu.fill_mode = 'BOTH'
    for c in GLIFOS[clave]['c']:
        c = limpio(c)
        if len(c) < 3:
            continue
        sp = cu.splines.new('POLY')
        sp.points.add(len(c) - 1)
        for p, (x, y) in zip(sp.points, c):
            p.co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    cu.extrude = prof
    cu.bevel_depth = bisel
    cu.bevel_resolution = 3
    cu.materials.append(mat)
    o = bpy.data.objects.new('t-' + clave, cu)
    o.scale = (tam,) * 3
    o.rotation_euler = FRENTE
    esc.collection.objects.link(o)
    return o


ORO_CLAVES = {'m1', 'm2', 'm3'}
TEXTOS = {}
for clave, tam, x, y, z, t0, t1 in ln.TEXTOS:
    if clave == 'caudal':
        o = palabra(clave, MARFIL, tam, .07, .008)
    elif clave in ORO_CLAVES:
        o = palabra(clave, ORO_T, tam, .05, .008)
    else:
        o = palabra(clave, MARFIL, tam, .045, .006)
    TEXTOS[clave] = (o, (x, y, z), t0, t1)

N1 = palabra('n1', ORO, ln.TAM_CIFRA, .16, .014)
N4 = palabra('n4', ORO, ln.TAM_CIFRA, .16, .014)
N30 = palabra('n30', ORO, ln.TAM_30, .16, .014)


# ------------------------------------------------------------- moneda del logo
def moneda():
    img = bpy.data.images.load(os.path.join(ASSETS, 'ondas.png'))
    img.colorspace_settings.name = 'Non-Color'
    m = bpy.data.materials.new('moneda')
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    b = n['Principled BSDF']
    mp = n.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (.5, .5, .5)
    mp.inputs['Location'].default_value = (.5, .5, 0)
    l.new(n.new('ShaderNodeTexCoord').outputs['Object'], mp.inputs['Vector'])
    t = n.new('ShaderNodeTexImage')
    t.image = img
    t.extension = 'CLIP'
    l.new(mp.outputs['Vector'], t.inputs['Vector'])
    mx = n.new('ShaderNodeMix')
    mx.data_type = 'RGBA'
    mx.inputs[6].default_value = (.93, .885, .79, 1)
    mx.inputs[7].default_value = (.60, .36, .075, 1)
    l.new(t.outputs['Color'], mx.inputs['Factor'])
    l.new(mx.outputs[2], b.inputs['Base Color'])
    l.new(t.outputs['Color'], b.inputs['Metallic'])
    rg = n.new('ShaderNodeMapRange')
    rg.inputs[3].default_value, rg.inputs[4].default_value = .2, .27
    l.new(t.outputs['Color'], rg.inputs['Value'])
    l.new(rg.outputs[0], b.inputs['Roughness'])
    b.inputs['Coat Weight'].default_value = .55
    b.inputs['Coat Roughness'].default_value = .07
    bu = n.new('ShaderNodeBump')
    bu.inputs['Strength'].default_value = 1
    bu.inputs['Distance'].default_value = .035
    bu.invert = True
    l.new(t.outputs['Color'], bu.inputs['Height'])
    l.new(bu.outputs[0], b.inputs['Normal'])
    piv = bpy.data.objects.new('moneda', None)
    esc.collection.objects.link(piv)
    bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=1, depth=.15)
    c = bpy.context.object
    md = c.modifiers.new('b', 'BEVEL')
    md.width, md.segments, md.limit_method = .03, 6, 'ANGLE'
    bpy.ops.object.shade_smooth()
    c.data.materials.append(m)
    for zz in (.075, -.075):
        bpy.ops.mesh.primitive_torus_add(major_radius=.955, minor_radius=.045, major_segments=256, minor_segments=24, location=(0, 0, zz))
        r = bpy.context.object
        bpy.ops.object.shade_smooth()
        r.data.materials.append(m)
        r.parent = c
    c.parent = piv
    c.rotation_euler = (math.pi / 2, 0, 0)
    piv.scale = (ln.RADIO_MONEDA,) * 3
    return piv


MONEDA = moneda()

# ------------------------------------------------------------- la miel
MIEL_ME = bpy.data.meshes.new('miel')
MIEL_ME.materials.append(MIEL)
MIEL_OB = bpy.data.objects.new('miel', MIEL_ME)
esc.collection.objects.link(MIEL_OB)
_sm = MIEL_OB.modifiers.new('suave', 'SMOOTH')  # quita el facetado de los cubos: reflejos limpios
_sm.factor, _sm.iterations = .6, 3


def cargar_miel(f):
    d = np.load(os.path.join(MALLAS, 'm%04d.npz' % f))
    v, c = d['v'], d['c']
    me = bpy.data.meshes.new('miel-%d' % f)
    if len(c):
        me.vertices.add(len(v))
        me.vertices.foreach_set('co', v.ravel())
        me.loops.add(len(c) * 3)
        me.loops.foreach_set('vertex_index', c.ravel().astype(np.int32))
        me.polygons.add(len(c))
        me.polygons.foreach_set('loop_start', np.arange(0, len(c) * 3, 3, dtype=np.int32))
        me.polygons.foreach_set('use_smooth', np.ones(len(c), dtype=bool))
        me.update(calc_edges=True)
        me.validate(clean_customdata=False)
    me.materials.append(MIEL)
    viejo = MIEL_OB.data
    MIEL_OB.data = me
    if viejo.users == 0:
        bpy.data.meshes.remove(viejo)
    MIEL_OB.hide_render = len(c) == 0


# ------------------------------------------------------------- estudio y luz
def area(nombre, ancho, alto, color):
    d = bpy.data.lights.new(nombre, 'AREA')
    d.shape = 'RECTANGLE'
    d.size, d.size_y = ancho, alto
    d.color = color
    o = bpy.data.objects.new(nombre, d)
    esc.collection.objects.link(o)
    return o


def apuntar(o, pos, mira):
    o.location = pos
    o.rotation_euler = (Vector(pos) - Vector(mira)).to_track_quat('Z', 'Y').to_euler()


LUCES = {
    'clave': (area('clave', 6, 3.2, (1, .93, .82)), 1700),
    'relleno': (area('relleno', 8, 1.2, (1, .9, .76)), 160),
    'contra-i': (area('contra-i', .5, 6, (1, .90, .74)), 820),
    'contra-d': (area('contra-d', .5, 6, (1, .92, .80)), 700),
    'tras': (area('tras', 9, 2.4, (1, .80, .46)), 260),
}
for o, _ in LUCES.values():
    o.data.cycles.max_bounces = 8
LUCES['tras'][0].visible_glossy = False
LUCES['relleno'][0].visible_glossy = False

fondo = objeto('fondo', [FONDO], lambda bm: losa(bm, 2, 2, .01, [(0, 0), (0, .001)], seg=2), (math.pi / 2, 0, 0), (0, 60, 3))
fondo.scale = (80, 70, 1)
fondo.visible_shadow = False

# Panel de estudio detrás de la cámara: solo lo ven los reflejos, así el oro de frente brilla con un barrido de luz.
REFLEJO = emisor('reflejo', (1, .86, .62), 6.0, radial=1.0)
panel = objeto('panel', [REFLEJO], lambda bm: losa(bm, 2, 2, .01, [(0, 0), (0, .001)], seg=2), (math.pi / 2, 0, 0), (0, -20, 3))
panel.scale = (3.2, 1.6, 1)
panel.visible_camera = False
panel.visible_diffuse = False
panel.visible_shadow = False
panel.visible_transmission = False
panel.visible_volume_scatter = False

mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs[0].default_value = (.010, .0065, .003, 1)
mundo.node_tree.nodes['Background'].inputs[1].default_value = 1.0
esc.world = mundo

cam_d = bpy.data.cameras.new('cam')
cam_d.sensor_fit = 'HORIZONTAL'
cam_d.sensor_width = 36
cam_d.lens = 70
cam_d.dof.use_dof = True
cam_d.clip_start = .05
cam_d.clip_end = 300
cam = bpy.data.objects.new('cam', cam_d)
cam.rotation_euler = (math.pi / 2, 0, 0)
esc.collection.objects.link(cam)
esc.camera = cam

esc.render.engine = 'CYCLES'
esc.cycles.device = 'CPU'
esc.cycles.samples = MUESTRAS
esc.cycles.use_adaptive_sampling = True
esc.cycles.adaptive_threshold = .015
esc.cycles.use_denoising = True
esc.cycles.denoiser = 'OPENIMAGEDENOISE'
esc.cycles.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
esc.cycles.max_bounces = 16
esc.cycles.transmission_bounces = 14
esc.cycles.transparent_max_bounces = 24
esc.cycles.glossy_bounces = 6
esc.cycles.diffuse_bounces = 3
esc.cycles.volume_bounces = 1
esc.cycles.caustics_reflective = False
esc.cycles.caustics_refractive = False
esc.cycles.blur_glossy = 1.0
esc.cycles.sample_clamp_indirect = 8
esc.render.resolution_x, esc.render.resolution_y = 1080, 1920
esc.render.resolution_percentage = PCT
esc.render.film_transparent = False
esc.render.image_settings.file_format = 'PNG'
esc.render.image_settings.color_mode = 'RGB'
esc.render.image_settings.color_depth = '16'
esc.view_settings.view_transform = 'AgX'
esc.view_settings.look = 'AgX - Medium High Contrast'
esc.view_settings.exposure = float(os.environ.get('EXPO', '0'))
esc.render.use_persistent_data = True


# ------------------------------------------------------------- un cuadro
def colocar_texto(o, base, t, t0, t1):
    e = ln.estado_texto(t, t0, t1)
    al = e['alfa']
    o.hide_render = al < .004
    o.color = (1, 1, 1, al)
    x, y, z = base
    o.location = (x, y + e['dy'], z + e['dz'])
    o.rotation_euler = (math.pi / 2 + math.radians(e['rx']), 0, 0)


def cuadro(f):
    t = f / ln.FPS
    c = ln.camara(t)
    cam.location = (c['x'], c['y'], c['z'])
    cam_d.shift_y = c['shift']
    cam_d.dof.focus_distance = max(.3, c['foco'] - c['y'])
    cam_d.dof.aperture_fstop = c['fstop']
    P = c['foco']
    br, co = c['brillo'], c['contra']
    apuntar(LUCES['clave'][0], (-1.4, P - 1.6, 8.2), (0, P, 1.2))
    apuntar(LUCES['relleno'][0], (0, P - 7, .6), (0, P, 1.4))
    apuntar(LUCES['contra-i'][0], (-3.4, P + 3.2, 2.6), (0, P, 1.4))
    apuntar(LUCES['contra-d'][0], (3.6, P + 3.6, 2.2), (0, P, 1.4))
    apuntar(LUCES['tras'][0], (0, P + 4.5, .2), (0, P - 2, 1.6))
    for k, (o, w) in LUCES.items():
        o.data.energy = w * (br if k in ('clave', 'relleno') else co)
    fuerza(FONDO, 1.0 * max(br, .05) ** 1.2)
    # el panel acompaña a la cámara, un poco arriba y a la izquierda, y se desliza despacio: el brillo recorre el oro
    panel.location = (-1.2 + .5 * math.sin(t * .45), c['y'] - 3.5, c['z'] + 1.6)
    panel.rotation_euler = (math.pi / 2 - .3, 0, -.25)
    fuerza(REFLEJO, 6.0 * max(br, .05))
    mundo.node_tree.nodes['Background'].inputs[1].default_value = max(br, .05)

    cargar_miel(f)
    for clave, (o, base, t0, t1) in TEXTOS.items():
        colocar_texto(o, base, t, t0, t1)
    u, q, tc = ln.uno(t), ln.cuatro(t), ln.tres_cero(t)
    N1.location = (u['x'], u['y'], u['z'])
    N4.location = (q['x'], q['y'], q['z'])
    N30.location = (tc['x'], tc['y'], tc['z'] - ln.BAJO_30)
    N1.hide_render = t > 4.3 or u['z'] < -1.85
    N4.hide_render = t > 4.3 or q['z'] < -1.85
    N30.hide_render = t < 11.4 or t > 13.5
    tel = ln.telefono(t)
    CELU.location = (tel['x'], tel['y'], tel['z'])
    oculto = t < 4.1 or t > 8.4
    for ch in CELU.children:
        ch.hide_render = oculto
    pt = ln.pantalla(t)
    PANTALLA.node_tree.nodes['cifra'].outputs[0].default_value = pt['cifra']
    PANTALLA.node_tree.nodes['barra'].outputs[0].default_value = pt['barra']
    PANTALLA.node_tree.nodes['bsdf'].inputs['Emission Strength'].default_value = .82
    mo = ln.moneda(t)
    MONEDA.location = (mo['x'], mo['y'], mo['z'])
    MONEDA.rotation_euler = (math.radians(mo['cabeceo']), 0, math.radians(mo['giro']))
    for ch in MONEDA.children_recursive:
        ch.hide_render = t < 13.25

    esc.cycles.seed = f
    esc.render.filepath = os.path.join(SAL, 'c%04d.png' % f)
    bpy.ops.render.render(write_still=True)


for f in CUADROS:
    if os.path.exists(os.path.join(SAL, 'c%04d.png' % f)):
        continue
    cuadro(f)
    print('CUADRO', f, flush=True)
