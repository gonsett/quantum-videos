# Malla de miel por cuadro: charco e hilos en un solo campo de distancia, sin costuras ni interiores.
# python liquido.py <salida> <lista de cuadros> <detalle>
import os, sys
from multiprocessing import Pool
import numpy as np
from skimage.measure import marching_cubes
import linea as ln


def eje(c, medio, paso, lim0, lim1, crec=1.09):
    """Eje con celdas finas alrededor de lo que se ve y cada vez más grandes hacia afuera."""
    a = list(np.arange(c - medio, c + medio + paso / 2, paso))
    p = paso
    while a[-1] < lim1:
        p *= crec
        a.append(a[-1] + p)
    p = paso
    while a[0] > lim0:
        p *= crec
        a.insert(0, a[0] - p)
    return np.array(a, dtype=np.float32)


def alto(X, Y, t, L):
    h = np.full(X.shape, L, dtype=np.float32)
    # oleaje lento de un líquido pesado
    olas = [(.72, .31, .6, .018), (-.41, .63, -.47, .015), (1.37, -.52, .83, .009), (2.3, 1.7, -1.1, .0045), (-3.7, 2.9, 1.5, .0022), (6.1, -4.3, 1.9, .0011)]
    for i, (kx, ky, w, a) in enumerate(olas):
        h += a * np.sin(kx * X + ky * Y + w * t + i * 1.7)
    for t0, x0, y0, f, alc in ln.GOLPES:
        dt = t - t0
        if dt <= 0 or dt > 4.5:
            continue
        r = np.hypot(X - x0, Y - y0)
        frente = alc * (1 - np.exp(-dt * 1.9)) * 1.9
        env = f * np.exp(-dt * 1.35)
        h += env * (1.5 * np.exp(-(r / (.34 + .12 * dt)) ** 2) * np.cos(dt * 7.0))
        h += env * .62 * np.exp(-((r - frente) / (.2 + .14 * dt)) ** 2) * np.cos((r - frente) * 8.0)
    return h


def smin(a, b, k):
    h = np.clip(.5 + .5 * (b - a) / k, 0, 1)
    return b + (a - b) * h - k * h * (1 - h)


def perfil(z, H, t):
    """Radio del hilo en cada altura: cuello fino, cabeza redonda abajo, bultos que bajan."""
    bot, head, neck = H['bot'], H['head'], H['neck']
    zc = bot + head
    r = np.zeros_like(z)
    dentro = z >= bot
    if neck > 0:
        cuerpo = neck * (1 + .13 * np.sin(z * 5.7 + t * 9.0 + H['fase'] * 2.1) + .06 * np.sin(z * 13.0 + t * 15.0 + H['fase']))
        r[dentro] = cuerpo[dentro]
    w = np.clip((zc - z) / head, -1, 1)
    casquete = head * np.sqrt(np.clip(1 - w ** 2, 0, 1))
    r = np.where((z < zc) & dentro, casquete, r)
    arriba = z >= zc
    cola = neck + (head - neck) * np.exp(-((z - zc) / (head * 1.5)) ** 1.6)
    r = np.where(arriba, cola, r)
    r = np.where(z > H['top'], 0, r)
    return r


def cuadro(args):
    f, sal, detalle = args
    ruta = os.path.join(sal, 'm%04d.npz' % f)
    if os.path.exists(ruta):
        return f
    t = f / ln.FPS
    cam = ln.camara(t)
    L = ln.NIVEL(t)
    paso = .019 / detalle
    plano = ln.Y_A if t < 4.4 else ln.Y_B
    zmin = cam['z'] - 3.7
    zmax = cam['z'] + 3.9
    H = ln.hilos(t)
    x = eje(0, 1.95, paso, -11, 11)
    y0 = cam['y'] + 1.2
    y = eje(plano, .8, paso * 1.25, y0, plano + 34)
    y = y[y >= y0]
    z = np.arange(max(zmin, L - .55) if L > zmin else zmin, zmax, paso, dtype=np.float32)
    # malla solo si hay algo
    hay_charco = L > zmin - .2
    if not hay_charco and not H:
        np.savez_compressed(ruta, v=np.zeros((0, 3), np.float32), c=np.zeros((0, 3), np.int32))
        return f
    X, Y = np.meshgrid(x, y, indexing='ij')
    if hay_charco:
        h = alto(X, Y, t, L)
        vol = (z[None, None, :] - h[:, :, None]).astype(np.float32)
    else:
        vol = np.full((len(x), len(y), len(z)), 9, dtype=np.float32)
    for hi in H:
        marg = max(hi['head'], hi['neck']) * 3 + .35
        ix = np.where(np.abs(x - hi['x']) < marg)[0]
        iy = np.where(np.abs(y - hi['y']) < marg)[0]
        iz = np.where((z >= hi['bot'] - .25) & (z <= hi['top'] + .05))[0]
        if not len(ix) or not len(iy) or not len(iz):
            continue
        zz = z[iz]
        r = perfil(zz, hi, t)
        cx = hi['x'] + hi['bam'] * (np.sin(zz * 1.7 + t * 1.9 + hi['fase']) + .55 * np.sin(zz * 3.9 - t * 2.4 + hi['fase'] * 3))
        cy = hi['y'] + hi['bam'] * .7 * np.cos(zz * 2.1 + t * 1.5 + hi['fase'] * 1.5)
        # enrosque de la miel al llegar al charco
        if hay_charco and hi['bot'] <= L + .02:
            pegue = np.exp(-np.clip(zz - L, 0, None) / .32)
            cx = cx + .05 * pegue * np.cos(t * 8.5 + zz * 11 + hi['fase'])
            cy = cy + .05 * pegue * np.sin(t * 8.5 + zz * 11 + hi['fase'])
        xx = x[ix][:, None, None]
        yy = y[iy][None, :, None]
        d = np.sqrt((xx - cx[None, None, :]) ** 2 + (yy - cy[None, None, :]) ** 2) - r[None, None, :]
        d = np.where(r[None, None, :] > 0, d, 9.0).astype(np.float32)
        malla = np.ix_(ix, iy, iz)
        vol[malla] = smin(vol[malla], d, .13)
    for caja in (vol[0, :, :], vol[-1, :, :], vol[:, 0, :], vol[:, -1, :], vol[:, :, 0], vol[:, :, -1]):
        caja[...] = np.maximum(caja, .05)
    if vol.min() >= 0:
        np.savez_compressed(ruta, v=np.zeros((0, 3), np.float32), c=np.zeros((0, 3), np.int32))
        return f
    v, c, _, _ = marching_cubes(vol, 0.0, allow_degenerate=False)
    v2 = np.stack([np.interp(v[:, 0], np.arange(len(x)), x), np.interp(v[:, 1], np.arange(len(y)), y), np.interp(v[:, 2], np.arange(len(z)), z)], 1)
    np.savez(ruta, v=v2.astype(np.float32), c=c[:, ::-1].astype(np.int32))
    return f


if __name__ == '__main__':
    sal = sys.argv[1]
    os.makedirs(sal, exist_ok=True)
    cuadros = [int(a) for a in sys.argv[2].split(',')]
    detalle = float(sys.argv[3])
    with Pool(int(os.environ.get('HILOS', '2'))) as p:
        for f in p.imap_unordered(cuadro, [(q, sal, detalle) for q in cuadros]):
            print('malla', f, flush=True)
