import bpy, mathutils, math, os
D=os.path.dirname(os.path.abspath(__file__))+'/cabeza/'
def escena():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=D+'LeePerrySmith.glb')
    h=[o for o in bpy.context.scene.objects if o.type=='MESH'][0]; h.name='cabeza'
    bpy.context.view_layer.objects.active=h; bpy.ops.object.shade_smooth()
    m=bpy.data.materials.new('piel'); m.use_nodes=True; nt=m.node_tree; P=nt.nodes['Principled BSDF']
    t=nt.nodes.new('ShaderNodeTexImage'); t.image=bpy.data.images.load(D+'Map-COL.jpg')
    nm=nt.nodes.new('ShaderNodeTexImage'); nm.image=bpy.data.images.load(D+'Infinite-Level_02_Tangent_SmoothUV.jpg'); nm.image.colorspace_settings.name='Non-Color'
    nn=nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(nm.outputs[0],nn.inputs[1]); nt.links.new(nn.outputs[0],P.inputs['Normal'])
    nt.links.new(t.outputs[0],P.inputs['Base Color'])
    P.inputs['Roughness'].default_value=.48; P.inputs['Subsurface Weight'].default_value=.25
    P.inputs['Subsurface Radius'].default_value=(1,.35,.2); P.inputs['Subsurface Scale'].default_value=.08
    h.data.materials.clear(); h.data.materials.append(m)
    return h
def luces_y_camara(cam_loc, cam_mira, lente=50):
    sc=bpy.context.scene
    w=bpy.data.worlds.new('w'); w.use_nodes=True; w.node_tree.nodes['Background'].inputs[0].default_value=(.004,.003,.0025,1); sc.world=w
    def luz(tipo,loc,mira,energia,color,tam=1,spot=None):
        L=bpy.data.lights.new(tipo+str(loc),tipo); L.energy=energia; L.color=color
        if tipo=='AREA': L.size=tam
        if tipo=='SPOT': L.spot_size=spot or .8; L.spot_blend=.6; L.shadow_soft_size=tam
        o=bpy.data.objects.new(L.name,L); sc.collection.objects.link(o); o.location=loc
        d=mathutils.Vector(mira)-mathutils.Vector(loc); o.rotation_euler=d.to_track_quat('-Z','Y').to_euler(); return o
    luz('SPOT',(4,9,12),(0,0,2),9000,(1,.72,.45),tam=1.2,spot=.7)      # foco cálido de arriba atrás-derecha
    luz('AREA',(-9,6,3),(0,0,1.5),1600,(.95,.42,.2),tam=4)               # contraluz lacre
    luz('AREA',(0,-6,8),(0,0,2),600,(1,.8,.6),tam=6)                     # recorte por arriba
    c=bpy.data.cameras.new('cam'); c.lens=lente; co=bpy.data.objects.new('cam',c); sc.collection.objects.link(co); sc.camera=co
    co.location=cam_loc; d=mathutils.Vector(cam_mira)-mathutils.Vector(cam_loc); co.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
    sc.render.engine='CYCLES'; sc.cycles.device='CPU'
    sc.render.resolution_x=1080; sc.render.resolution_y=1920
    sc.view_settings.view_transform='AgX'; sc.view_settings.look='AgX - Punchy'
    return co
