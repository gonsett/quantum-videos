import numpy as np, sys
from PIL import Image, ImageFilter, ImageDraw
SP='out/historias/setters-gem/'
INSET=float(sys.argv[1]) if len(sys.argv)>1 else 1.5
SAT=float(sys.argv[2]) if len(sys.argv)>2 else 0.9
base=Image.open('out/historias/setters-gem/final/07-cierre.jpg').convert('RGB')
o=np.asarray(base).astype(float)
c=Image.open('out/historias/setters-gem/carnet-vertical.png').convert('RGBA')
W,H=c.size
q=np.array([(829.6,756.5),(968.1,787.2),(919.7,1003.2),(782.1,971.7)])  # borde exterior del filo, medido
cen=q.mean(0)
# achicar cada lado INSET px hacia adentro (offset de líneas)
def offset(p1,p2,d):
    v=p2-p1; n=np.array([v[1],-v[0]]); n/=np.linalg.norm(n)
    if np.dot(cen-p1,n)<0: n=-n
    return p1+n*d, v
def inter(a,va,b,vb):
    t=np.linalg.solve(np.array([va,-vb]).T,b-a); return a+va*t[0]
E=[offset(q[i],q[(i+1)%4],INSET) for i in range(4)]
dst=[inter(*E[(i-1)%4],*E[i]) for i in range(4)]
S=4
A=[];bb=[]
for (x,y),(u,v) in zip(dst,[(0,0),(W,0),(W,H),(0,H)]):
    x*=S;y*=S
    A.append([x,y,1,0,0,0,-u*x,-u*y]);bb.append(u)
    A.append([0,0,0,x,y,1,-v*x,-v*y]);bb.append(v)
cb=np.linalg.solve(np.array(A,float),np.array(bb,float))
w=c.transform((1080*S,1920*S),Image.PERSPECTIVE,tuple(cb),Image.BICUBIC).resize((1080,1920),Image.LANCZOS)
rgbw=Image.fromarray(np.asarray(w)[...,:3]).filter(ImageFilter.GaussianBlur(0.55))
arr=np.asarray(rgbw).astype(float); al=np.asarray(w)[...,3:4].astype(float)/255
m=Image.new('L',(1080,1920),0);ImageDraw.Draw(m).polygon([tuple(p) for p in dst],fill=255);inside=np.asarray(m)>0
yy,xx=np.mgrid[0:1920,0:1080]
L=0.3*o[...,0]+0.59*o[...,1]+0.11*o[...,2]
# luz de la foto (la tarjeta original: más clara arriba, sombra abajo)
lum=L.clip(0,85)
lumb=np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(12))).astype(float)
ref=lumb[inside].mean()
light=(np.maximum(lumb,12)/ref)**0.5
# gradación: menos saturación, negros levantados, tono cálido de la escena
g=arr.mean(-1,keepdims=True); arr=g+(arr-g)*SAT
arr=arr*0.97+2
arr=arr*np.array([1.03,1.0,0.97])
rgb=arr*light[...,None]
# brillo de plástico: banda diagonal suave desde arriba a la izquierda
u=((xx-832)*0.55+(yy-760)*0.83)
spec=np.exp(-((u-70)/38)**2)*0.11+np.exp(-((u-150)/90)**2)*0.05
rgb=rgb+(255-rgb)*spec[...,None]
# resplandor ámbar del filo hacia adentro
rim=((o[...,0]>225)&(o[...,1]>170)&(o[...,2]>110)&(o[...,0]-o[...,2]>35)).astype(np.uint8)*255
rg=np.asarray(Image.fromarray(rim).filter(ImageFilter.GaussianBlur(5))).astype(float)/255
rgb=rgb+np.array([255,170,60])*(rg[...,None]*0.45)
# grano como el de la foto
rng=np.random.default_rng(7); rgb=rgb+rng.normal(0,3.2,(1920,1080,1))
# pulgar: todo lo que NO es metal oscuro de la tarjeta original, abajo a la derecha
metal=(L<78)&(np.abs(o[...,0]-o[...,2])<26)
thumb=(~metal)&(xx>868)&(yy>935)&inside
tm=Image.fromarray((thumb*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
tma=np.asarray(tm).astype(float)/255
# sombra de contacto del pulgar sobre el carnet (corrida arriba-izquierda)
sh=np.asarray(Image.fromarray((tma*255).astype(np.uint8)).transform((1080,1920),Image.AFFINE,(1,0,3,0,1,4)).filter(ImageFilter.GaussianBlur(4))).astype(float)/255
rgb=rgb*(1-0.45*sh[...,None])
al=al*(1-tma[...,None])
out=(o*(1-al)+rgb*al).clip(0,255).astype(np.uint8)
im=Image.fromarray(out); im.save(SP+'07d.png')
im.crop((760,730,990,1030)).resize((690,900),Image.LANCZOS).save(SP+'z7d.jpg')
print([tuple(np.round(p,1)) for p in dst], round(ref,1))
