import bpy, numpy as np, math
C=np.array([-0.08,-0.15,1.6])
rng=np.random.default_rng(7)
def linea(phi, x, z):
    a=np.abs(phi)
    zl=np.interp(a,[0,.8,1.15,1.5,1.95,2.35,3.15],[0.5,0.62,1.2,1.95,2.0,2.75,3.0])
    ok=z>zl+rng.normal(0,.04,len(z))
    oreja=(np.abs(x)>1.55)&(z<2.0)&(a>1.0)&(a<2.2)
    return ok&~oreja
def crecer(h, n=160000, largo_arriba=.62, largo_lados=.34, cortar=None):
    """cortar(pos_raiz)->factor 0..1 de largo (para el degradé)"""
    me=h.data; me.calc_loop_triangles(); M=np.array(h.matrix_world)
    V=np.array([v.co for v in me.vertices]); V=(np.c_[V,np.ones(len(V))]@M.T)[:,:3]
    T=np.array([t.vertices[:] for t in me.loop_triangles])
    a,b,c=V[T[:,0]],V[T[:,1]],V[T[:,2]]; ar=np.linalg.norm(np.cross(b-a,c-a),axis=1)/2
    cen=(a+b+c)/3; rel=cen-C; phi=np.arctan2(rel[:,0],rel[:,1])
    sel=linea(phi,cen[:,0],cen[:,2]); p=ar*sel; p/=p.sum()
    tri=rng.choice(len(T),n,p=p); u=rng.random(n); v=rng.random(n); f=u+v>1; u[f]=1-u[f]; v[f]=1-v[f]
    R=a[tri]+(b[tri]-a[tri])*u[:,None]+(c[tri]-a[tri])*v[:,None]
    N=np.cross(b-a,c-a)[tri]; N/=np.linalg.norm(N,axis=1)[:,None]
    rel=R-C; ph=np.arctan2(rel[:,0],rel[:,1]); alto=np.clip((R[:,2]-0.5)/3.4,0,1)
    # flujo: radial desde el remolino de la coronilla, con giro, y gravedad en los costados
    corona=np.array([0.15,1.05,3.7])
    rad_=R-corona; rad_-=N*(rad_*N).sum(1)[:,None]; rad_/=np.linalg.norm(rad_,axis=1)[:,None]+1e-9
    giro=np.cross(N,rad_)
    grav=np.tile([0,0,-1.0],(n,1)); grav-=N*(grav*N).sum(1)[:,None]; grav/=np.linalg.norm(grav,axis=1)[:,None]+1e-9
    wg=np.clip((3.0-R[:,2])/1.6,0,1)[:,None]
    flow=rad_*(1-wg)+giro*.35*(1-wg)+grav*wg
    flow/=np.linalg.norm(flow,axis=1)[:,None]+1e-9
    L=(largo_lados+(largo_arriba-largo_lados)*np.clip((R[:,2]-1.9)/1.5,0,1)**1.2)*rng.uniform(.75,1.2,n)
    if cortar is not None: L=L*cortar(R)
    # mechones: cada hebra se inclina hacia el centro de su mechón
    K=4000; kc=rng.choice(n,K); lab=np.argmin(((R[:,None,:2]-R[kc][None,:,:2])**2).sum(-1) if False else 0,axis=0) if False else None
    S=6; t=np.linspace(0,1,S)
    lev=np.clip(.55-.35*(1-alto),.12,.55)  # cuánto se levanta del cuero
    P=np.zeros((n,S,3))
    ruido=rng.normal(0,1,(n,3)); ruido-=N*(ruido*N).sum(1)[:,None]
    for i,k in enumerate(t):
        d=N*lev[:,None]*np.sin(k*math.pi/2)*(1-.5*k) + flow*k + ruido*.12*k*k
        P[:,i]=R-N*.01+d*L[:,None]*1.0
    return P, R, N, L
def objeto_pelo(P, nombre='pelo', r0=.0055, r1=.0016):
    n,S,_=P.shape
    cv=bpy.data.hair_curves.new(nombre); cv.add_curves([S]*n)
    cv.attributes['position'].data.foreach_set('vector',P.reshape(-1).astype(np.float32))
    rad=cv.attributes.get('radius') or cv.attributes.new('radius','FLOAT','POINT')
    rad.data.foreach_set('value',np.tile(np.linspace(r0,r1,S),n).astype(np.float32))
    o=bpy.data.objects.new(nombre,cv); bpy.context.scene.collection.objects.link(o)
    m=bpy.data.materials.new('pelo'); m.use_nodes=True; nt=m.node_tree
    for nd in list(nt.nodes):
        if nd.type!='OUTPUT_MATERIAL': nt.nodes.remove(nd)
    hb=nt.nodes.new('ShaderNodeBsdfHairPrincipled')
    hb.parametrization='MELANIN'
    hb.inputs['Melanin'].default_value=.88; hb.inputs['Melanin Redness'].default_value=.45
    hb.inputs['Roughness'].default_value=.32; hb.inputs['Radial Roughness'].default_value=.4
    hb.inputs['Coat'].default_value=.15; hb.inputs['Random Color'].default_value=.12; hb.inputs['Random Roughness'].default_value=.2
    nt.links.new(hb.outputs[0],nt.nodes['Material Output'].inputs[0])
    cv.materials.append(m); return o
def capa():
    import bmesh
    bm=bmesh.new(); S=240; R=48
    prof=[(1.30+3.36*(1-math.exp(-(k/R)*6)) + (k/R)*.5, 0.12-(k/R)*7.3) for k in range(R+1)]
    vs=[]
    for j,(r,z) in enumerate(prof):
        fila=[]
        for i in range(S):
            a=2*math.pi*i/S; k=j/R
            g=min(1,max(0,(k-.12)*2.2)); f=1+.012*min(1,k*4)*math.sin(a*29)+g*(.11*math.sin(a*11+1.3+k*1.5)+.06*math.sin(a*19+.4+k)+.025*math.sin(a*37+k*2))
            fila.append(bm.verts.new((r*f*math.cos(a)*1.0, r*f*math.sin(a)*(.84-.2*min(1,j/8)) -.05, z)))
        vs.append(fila)
    for j in range(R):
        for i in range(S): bm.faces.new((vs[j][i],vs[j][(i+1)%S],vs[j+1][(i+1)%S],vs[j+1][i]))
    me=bpy.data.meshes.new('capa'); bm.to_mesh(me); o=bpy.data.objects.new('capa',me); bpy.context.scene.collection.objects.link(o)
    for p in me.polygons: p.use_smooth=True
    sd=o.modifiers.new('s','SUBSURF'); sd.levels=sd.render_levels=1
    m=bpy.data.materials.new('tela'); m.use_nodes=True; P=m.node_tree.nodes['Principled BSDF']
    P.inputs['Base Color'].default_value=(.004,.004,.0045,1); P.inputs['Roughness'].default_value=.34; P.inputs['Coat Weight'].default_value=.25; P.inputs['Coat Roughness'].default_value=.2
    P.inputs['Sheen Weight'].default_value=0; P.inputs['Sheen Roughness'].default_value=.35; P.inputs['Sheen Tint'].default_value=(.8,.75,.7,1)
    nt=m.node_tree; tx=nt.nodes.new('ShaderNodeTexWave'); tx.inputs['Scale'].default_value=1.4; tx.inputs['Distortion'].default_value=6; tx.inputs['Detail'].default_value=3
    tx.bands_direction='Z'
    bu=nt.nodes.new('ShaderNodeBump'); bu.inputs['Strength'].default_value=.22; bu.inputs['Distance'].default_value=.15
    nt.links.new(tx.outputs['Fac'],bu.inputs['Height']); nt.links.new(bu.outputs['Normal'],P.inputs['Normal'])
    # tela blanca con rayas rojas y azules (verticales, alrededor del cuerpo)
    tc=nt.nodes.new('ShaderNodeTexCoord'); gr=nt.nodes.new('ShaderNodeTexGradient'); gr.gradient_type='RADIAL'
    nt.links.new(tc.outputs['Object'],gr.inputs['Vector'])
    mu=nt.nodes.new('ShaderNodeMath'); mu.operation='MULTIPLY'; mu.inputs[1].default_value=40
    fr=nt.nodes.new('ShaderNodeMath'); fr.operation='FRACT'
    nt.links.new(gr.outputs['Fac'],mu.inputs[0]); nt.links.new(mu.outputs[0],fr.inputs[0])
    cr=nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.interpolation='CONSTANT'; e=cr.color_ramp.elements
    e[0].position=0; e[0].color=(.62,.025,.03,1)
    e[1].position=.16; e[1].color=(.78,.77,.74,1)
    x=e.new(.5); x.color=(.02,.07,.36,1)
    x=e.new(.66); x.color=(.78,.77,.74,1)
    nt.links.new(fr.outputs[0],cr.inputs['Fac']); nt.links.new(cr.outputs['Color'],P.inputs['Base Color'])
    P.inputs['Roughness'].default_value=.4; P.inputs['Coat Weight'].default_value=.15
    me.materials.append(m)
    # cuello de la capa
    return o

def cuero(h):
    me=h.data; M=np.array(h.matrix_world)
    V=np.array([v.co for v in me.vertices]); V=(np.c_[V,np.ones(len(V))]@M.T)[:,:3]
    rel=V-C; ph=np.arctan2(rel[:,0],rel[:,1])
    a=np.abs(ph); zl=np.interp(a,[0,.8,1.15,1.5,1.95,2.35,3.15],[0.5,0.62,1.2,1.95,2.0,2.75,3.0])
    w=np.clip((V[:,2]-zl+.12)/.35,0,1)
    oreja=(np.abs(V[:,0])>1.55)&(V[:,2]<2.0)&(a>1.0)&(a<2.2); w[oreja]=0
    at=me.attributes.new('cuero','FLOAT','POINT'); at.data.foreach_set('value',w.astype(np.float32))
    m=me.materials[0]; nt=m.node_tree; P=nt.nodes['Principled BSDF']
    col=[l for l in nt.links if l.to_socket==P.inputs['Base Color']][0].from_socket
    A=nt.nodes.new('ShaderNodeAttribute'); A.attribute_name='cuero'
    mx=nt.nodes.new('ShaderNodeMix'); mx.data_type='RGBA'; mx.blend_type='MULTIPLY'
    nt.links.new(A.outputs['Fac'],mx.inputs['Factor']); nt.links.new(col,mx.inputs[6]); mx.inputs[7].default_value=(.018,.013,.01,1)
    nt.links.new(mx.outputs[2],P.inputs['Base Color'])

def degrade(R):
    """mitad izquierda de la nuca ya pasada en degradé; la derecha todavía no"""
    atras=np.clip((R[:,1]-.2)/.6,0,1)
    hecho=np.clip((-R[:,0]+.25)/.35,0,1)   # x<0 = lado ya cortado
    f=fin_de(R)
    return 1-(1-f)*atras*hecho

def fin_de(R):
    """largo relativo tras el degradé: casi al ras abajo, sube de a poco hasta z 2.6"""
    return np.clip((R[:,2]-0.3)/2.6,0.06,1)**1.3
