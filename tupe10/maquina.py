import bpy


def mat(nombre, color, rough, metal=0, coat=0, aniso=0):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    P = m.node_tree.nodes['Principled BSDF']
    P.inputs['Base Color'].default_value = (*color, 1)
    P.inputs['Roughness'].default_value = rough
    P.inputs['Metallic'].default_value = metal
    P.inputs['Coat Weight'].default_value = coat
    if aniso:
        P.inputs['Anisotropic'].default_value = aniso
    return m


def caja(nombre, tam, loc, m, bisel=.1, sub=2, padre=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = nombre
    o.scale = tam
    bpy.ops.object.transform_apply(scale=True)
    if bisel:
        b = o.modifiers.new('b', 'BEVEL'); b.width = bisel; b.segments = 4
    if sub:
        s = o.modifiers.new('s', 'SUBSURF'); s.levels = s.render_levels = sub
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    if padre:
        o.parent = padre
    return o


def maquina():
    """Máquina de corte. Eje local +Z = hacia la cuchilla; la cara que apoya en la piel mira a +Y."""
    raiz = bpy.data.objects.new('maquina', None)
    bpy.context.scene.collection.objects.link(raiz)
    negro = mat('cuerpo', (.012, .011, .011), .38, coat=.6)
    goma = mat('goma', (.006, .006, .006), .75)
    oro = mat('oro', (.80, .55, .28), .28, metal=1, aniso=.6)
    acero = mat('acero', (.75, .74, .72), .22, metal=1, aniso=.5)
    def ovalo(nombre, rx, ry, largo, z, m, conico=0.0):
        bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=1, depth=1, location=(0, -.62, z))
        o = bpy.context.object; o.name = nombre; o.scale = (rx, ry, largo); bpy.ops.object.transform_apply(scale=True)
        b = o.modifiers.new('b', 'BEVEL'); b.width = min(rx, ry) * .45; b.segments = 6
        if conico:
            t = o.modifiers.new('t', 'SIMPLE_DEFORM'); t.deform_method = 'TAPER'; t.factor = conico; t.deform_axis = 'Z'
        s = o.modifiers.new('s', 'SUBSURF'); s.levels = s.render_levels = 1
        o.data.materials.append(m); bpy.ops.object.shade_smooth(); o.parent = raiz
        return o
    ovalo('cuerpo', .86, .58, 5.4, -3.05, negro, conico=-.18)
    ovalo('agarre', .875, .595, 1.9, -4.25, goma)
    ovalo('aro', .80, .54, .14, -.62, oro)
    caja('palanca', (.26, .32, .9), (.93, -.62, -1.3), oro, bisel=.08, sub=1, padre=raiz)
    caja('boton', (.5, .14, .5), (0, -1.22, -2.4), oro, bisel=.12, sub=2, padre=raiz)
    caja('fija', (1.62, .07, .55), (0, -.20, -.08), acero, bisel=.02, sub=0, padre=raiz)
    caja('movil', (1.42, .06, .42), (0, -.30, -.16), oro, bisel=.02, sub=0, padre=raiz)
    for i in range(30):
        x = -.77 + i * (1.54 / 29)
        caja('d%d' % i, (.032, .07, .2), (x, -.20, .26), acero, bisel=.008, sub=0, padre=raiz)
    raiz.scale = (.70, .70, .70)
    return raiz


def maquina_real():
    """Modelo 'Philips MG3710' de Mario Falasca (CC-BY 4.0), sin texturas ni marca, con materiales propios.
    Eje: +Z hacia la cuchilla. Escala: 1 u = ~4,2 cm."""
    import os, mathutils
    antes = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.dirname(os.path.abspath(__file__)) + '/maquina/scene.gltf')
    nombres = [o.name for o in bpy.data.objects if o not in antes]
    nuevos = [bpy.data.objects[n] for n in nombres if n in bpy.data.objects]
    negro = mat('cuerpo', (.010, .009, .009), .32, coat=.7)
    goma = mat('goma', (.005, .005, .005), .7)
    oro = mat('oro', (.80, .55, .28), .26, metal=1, aniso=.5)
    acero = mat('acero', (.78, .77, .75), .18, metal=1, aniso=.6)
    lacre = mat('lacre', (.72, .14, .03), .35)
    tabla = {'back': goma, 'zig': acero, 'red': lacre, 'mask': negro, 'button': oro, 'head': negro, 'bot': oro, 'body': negro}
    raiz = bpy.data.objects.new('maquina', None); bpy.context.scene.collection.objects.link(raiz)
    for o in nuevos:
        if o.type != 'MESH':
            continue
        clave = o.name.split('_')[0]
        o.data.materials.clear(); o.data.materials.append(tabla.get(clave, negro))
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
        o.parent = raiz
    for o in [o for o in nuevos if o.type == 'EMPTY']:
        bpy.data.objects.remove(o)
    # centrar: la cuchilla (zig) en el origen
    zig = [o for o in raiz.children if o.name.startswith('zig')][0]
    bb = [zig.matrix_world @ mathutils.Vector(c) for c in zig.bound_box]
    cen = sum(bb, mathutils.Vector()) / 8
    for o in raiz.children:
        o.matrix_parent_inverse = mathutils.Matrix.Scale(.003, 4) @ mathutils.Matrix.Rotation(3.14159265, 4, 'Z') @ mathutils.Matrix.Translation(-cen)
    return raiz
