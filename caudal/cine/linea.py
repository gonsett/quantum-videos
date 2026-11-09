# Línea de tiempo única: la usan la miel (liquido.py), la escena (escena.py) y la terminación (post.py).
# Todo es función del tiempo y está atado a la voz aprobada (sonido/voz/brio.json). El audio no se toca.
import math

FPS = 60
TOTAL = 918
Y_A = 0.0   # plano de los números del principio
Y_B = 7.0   # plano del celular, los hilos, el 30 y la moneda


def s(a, b, t):
    u = max(0.0, min(1.0, (t - a) / (b - a)))
    return u * u * (3 - 2 * u)


def s5(a, b, t):
    u = max(0.0, min(1.0, (t - a) / (b - a)))
    return u * u * u * (u * (u * 6 - 15) + 10)


def sale(a, b, t, p=3.0):
    u = max(0.0, min(1.0, (t - a) / (b - a)))
    return 1 - (1 - u) ** p


def entra(a, b, t, p=3.0):
    u = max(0.0, min(1.0, (t - a) / (b - a)))
    return u ** p


def curva(claves):
    """Interpolación suave por claves (t, v), con tangentes que no sobrepasan."""
    ts = [c[0] for c in claves]
    vs = [c[1] for c in claves]
    n = len(ts)
    d = [(vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]) for i in range(n - 1)]
    m = [0.0] * n
    for i in range(1, n - 1):
        m[i] = 0.0 if d[i - 1] * d[i] <= 0 else 2 * d[i - 1] * d[i] / (d[i - 1] + d[i])

    def f(t):
        if t <= ts[0]:
            return vs[0]
        if t >= ts[-1]:
            return vs[-1]
        i = 0
        while t > ts[i + 1]:
            i += 1
        h = ts[i + 1] - ts[i]
        u = (t - ts[i]) / h
        return ((2 * u ** 3 - 3 * u ** 2 + 1) * vs[i] + (u ** 3 - 2 * u ** 2 + u) * h * m[i]
                + (-2 * u ** 3 + 3 * u ** 2) * vs[i + 1] + (u ** 3 - u ** 2) * h * m[i + 1])
    return f


# ---------------------------------------------------------------- cámara: un solo plano continuo
CAM_Y = curva([(0, -4.3), (1.6, -4.75), (3.75, -5.0), (5.15, .95), (7.9, 1.32), (8.5, .92), (11.1, 1.05), (12.7, .55), (15.3, .72)])
CAM_Z = curva([(0, 1.72), (1.6, 1.62), (3.75, 1.5), (5.15, 1.62), (8.0, 1.62), (8.6, 1.95), (11.1, 2.0), (12.7, 2.75), (15.3, 2.75)])
CAM_X = curva([(0, .22), (1.0, .08), (1.8, 0), (15.3, 0)])
SHIFT = curva([(0, 0), (8.0, 0), (8.6, .06), (11.1, .06), (12.7, .17), (15.3, .17)])
FOCO_Y = curva([(0, 0), (3.9, 0), (4.9, Y_B), (15.3, Y_B)])
FSTOP = curva([(0, .55), (3.9, .7), (4.5, .32), (5.2, 1.6), (15.3, 1.6)])
BRILLO = curva([(0, .62), (.74, .62), (.95, 1.25), (1.7, 1.0), (2.5, .9), (3.3, .12), (4.05, .07), (4.45, .95), (8.0, 1.0), (11.2, 1.0), (12.0, 1.3), (15.3, 1.2)])
CONTRA = curva([(0, .25), (.74, .3), (1.0, 1.0), (2.5, .85), (3.3, .05), (4.05, .03), (4.6, .55), (8.0, .6), (9.0, 1.0), (11.2, 1.1), (12.4, 1.7), (15.3, 1.5)])


def camara(t):
    return dict(x=CAM_X(t), y=CAM_Y(t), z=CAM_Z(t), shift=SHIFT(t), foco=FOCO_Y(t), fstop=FSTOP(t), lente=70.0,
                brillo=BRILLO(t), contra=CONTRA(t))


# ---------------------------------------------------------------- nivel de la miel
NIVEL = curva([(0, -.72), (.76, -.72), (1.65, .42), (2.42, .42), (3.32, -3.4), (4.8, -3.4), (5.5, -1.1), (7.55, .12), (8.1, .14), (11.25, .3), (13.0, .34), (13.7, 1.62), (15.3, 1.66)])

# tamaños de las piezas de oro
TAM_CIFRA = 2.0     # el 1 y el 4 (alto de la cifra = .62 x tamaño)
TAM_30 = 2.4
BAJO_30 = 1.05      # la base del 30 queda 1,05 por debajo de tres_cero()['z']
RADIO_MONEDA = .62

# (t0, x, y, fuerza, alcance)
GOLPES = [(.76, .58, Y_A, .13, 1.5), (1.15, .58, Y_A, .05, 1.0), (7.98, 0, Y_B, .06, 1.6), (8.56, -1.05, Y_B, .05, 1.2),
          (9.72, -.02, Y_B, .05, 1.2), (10.3, .87, Y_B, .05, 1.2), (11.6, 0, Y_B, .045, 3.0), (13.38, 0, Y_B, .055, 3.0)]


def hilos(t):
    """Lista de hilos de miel: x, y, z arriba, z abajo, radio del cuello, radio de la cabeza, bamboleo."""
    L = NIVEL(t)
    H = []
    # La gota que abre el video
    if t < .80:
        zd = 3.95 + (L - 3.95) * entra(0, .76, t, 2.15)
        H.append(dict(x=.58, y=Y_A, top=8.0, bot=zd, neck=.024 + .012 * t, head=.17, bam=.012, fase=0))
    # El chorro del cobro y su corte
    if .74 <= t < 2.2:
        r = .05 + .055 * s(.76, 1.0, t) - .075 * s(1.25, 1.72, t)
        corte = L if t < 1.66 else L + (9 - L) * entra(1.66, 2.2, t, 2)
        H.append(dict(x=.58, y=Y_A, top=9.0, bot=corte, neck=max(r, .018), head=max(r, .018) * 1.12, bam=.025, fase=1))
    # Lo que queda colgando de las cifras cuando se va la plata
    if 2.45 <= t < 3.6:
        fin = -1.2 + .0 * t
        largo = 1.25 * s(2.5, 3.25, t)
        H.append(dict(x=-.58, y=Y_A + .02, top=.62, bot=.62 - largo, neck=.022 + .018 * (1 - s(2.6, 3.3, t)), head=.06, bam=.005, fase=2))
    if 2.45 <= t < 4.1:
        if t < 3.72:
            bot = .62 - .95 * s(2.5, 3.72, t)
            H.append(dict(x=.88, y=Y_A + .02, top=.62, bot=bot, neck=.022, head=.075, bam=.004, fase=3))
        else:
            zd = -.33 - 3.8 * entra(3.72, 4.1, t, 2)
            H.append(dict(x=.88, y=Y_A + .02, top=zd + .22, bot=zd, neck=.0, head=.085, bam=0, fase=3))
    # Los tres destinos
    for i, (x, t0) in enumerate(((-1.05, 8.26), (-.02, 9.44), (.87, 10.08))):
        if t0 <= t < 11.9:
            caida = t0 + .3
            bot = 6.5 + (L - 6.5) * entra(t0, caida, t, 2.1)
            r = .052 - .03 * s(11.2, 11.8, t)
            if t > 11.2:
                bot = L + (9 - L) * entra(11.2, 11.9, t, 2)
            H.append(dict(x=x, y=Y_B, top=9.0, bot=bot, neck=max(r, .016), head=max(r, .016) * 1.35 if t < caida else max(r, .016), bam=.03, fase=4 + i))
    # La miel que cae del 30 cuando emerge
    if 11.75 <= t < 13.4:
        z30 = tres_cero(t)['z'] - 1.05
        for i, (x, ret) in enumerate(((-.98, 0), (-.46, .09), (.2, .05), (.74, .14), (1.12, .03))):
            r = (.05 - .007 * i) * (1 - s(12.55 + ret, 13.25, t))
            if r > .012 and z30 > L + .02:
                H.append(dict(x=x, y=Y_B + .03, top=z30 + .1, bot=L, neck=r, head=r * 1.2, bam=.006, fase=8 + i))
    return H


# ---------------------------------------------------------------- objetos
def uno(t):
    z = -1.9 + (.58 + 1.9) * sale(.74, 1.32, t, 3.2)
    return dict(x=-.58 * s5(1.55, 1.9, t), y=Y_A, z=z)


def cuatro(t):
    z = -1.9 + (.58 + 1.9) * sale(1.68, 2.2, t, 3.2)
    return dict(x=.56, y=Y_A, z=z)


def telefono(t):
    sube = sale(4.15, 5.05, t, 3.6)
    baja = entra(7.86, 8.32, t, 2.6)
    return dict(x=0, y=Y_B + .1, z=-3.9 + (.08 + 3.9) * sube - 4.4 * baja)


def tres_cero(t):
    sube = sale(11.45, 12.25, t, 3.0)
    baja = entra(13.02, 13.45, t, 2.4)
    return dict(x=0, y=Y_B, z=-.6 + (3.32 + .6) * sube - 4.6 * baja)


def moneda(t):
    sube = sale(13.3, 13.98, t, 3.2)
    giro = 1 - sale(13.3, 14.55, t, 3.0)
    return dict(x=0, y=Y_B, z=-1.0 + (4.0 + 1.0) * sube, giro=-300 * giro, cabeceo=8 * giro)


def pantalla(t):
    """Revelado de la cifra y la barra reales: se llenan de izquierda a derecha."""
    return dict(cifra=s(5.45, 7.25, t), barra=s(5.9, 7.45, t))


# ---------------------------------------------------------------- textos: (clave, tamaño, x, y, z, entra, sale)
TEXTOS = [
    ('cobras', .32, -.3, Y_A, 3.08, .04, 1.58),
    ('el', .36, 0, Y_A, 3.08, 1.62, 3.42),
    ('nada', .265, 0, Y_A, .17, 2.5, 3.72),
    ('con', .32, 0, Y_B, 3.62, 4.12, 5.34),
    ('seis', .32, 0, Y_B, 3.62, 5.38, 6.2),
    ('cierra', .3, 0, Y_B, 3.62, 6.22, 7.92),
    ('casa', .24, -.74, Y_B - .3, 2.72, 8.34, 11.05),
    ('m1', .135, -.74, Y_B - .3, 2.5, 8.46, 11.05),
    ('comida', .24, .31, Y_B - .3, 2.72, 9.5, 11.05),
    ('m2', .135, .31, Y_B - .3, 2.5, 9.62, 11.05),
    ('cafe', .24, 1.14, Y_B - .3, 2.72, 10.12, 11.05),
    ('m3', .135, 1.14, Y_B - .3, 2.5, 10.24, 11.05),
    ('cada', .34, 0, Y_B - 2.4, 1.1, 8.26, 11.1),
    ('nombre', .21, 0, Y_B - 2.4, .78, 9.44, 11.1),
    ('que', .36, 0, Y_B - .4, 4.52, 11.3, 13.1),
    ('enc', .32, 0, Y_B - .9, 1.72, 11.98, 13.1),
    ('plata', .32, 0, Y_B - .9, 1.36, 12.28, 13.1),
    ('caudal', .58, 0, Y_B - .35, 2.42, 13.38, 99),
    ('probala', .38, 0, Y_B - .35, 1.86, 14.56, 99),
]


def estado_texto(t, a, b):
    """Las palabras nacen desde la profundidad, con luz, y se van hundiéndose hacia atrás."""
    e = s5(a, a + .36, t)
    f = 1 - s(b, b + .24, t)
    return dict(alfa=e * f, dz=-.11 * (1 - e) + .04 * (1 - f), dy=.5 * (1 - e) + .25 * (1 - f), rx=14 * (1 - e))


# rótulos chicos, en píxeles de 1080x1920
ROTULOS = [('datos', 540, 1585, 5.2, 7.86), ('montos', 540, 860, 8.7, 11.0), ('url', 540, 1600, 14.72, 99)]


def alfa_rotulo(t, a, b):
    return s(a, a + .3, t) * (1 - s(b, b + .2, t))
