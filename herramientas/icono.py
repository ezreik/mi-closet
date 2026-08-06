"""Genera los iconos de la app: percha blanca sobre el magenta de epoint.

    python3 herramientas/icono.py

Dibuja en 4096 px y reduce con LANCZOS, que es lo que da los bordes suaves.
Los arcos van como polilínea y no con ImageDraw.arc: arc reparte el grosor
hacia dentro del bbox y deja un escalón donde el gancho se une al cuello.
"""

import math

from PIL import Image, ImageDraw

MAGENTA = (255, 0, 127)
BLANCO = (255, 255, 255)
LIENZO = 4096
K = LIENZO / 1024.0  # el diseño está pensado sobre una rejilla de 1024
TAMANOS = (512, 192, 180)


def escalar(v):
    return v * K


def generar():
    img = Image.new("RGB", (LIENZO, LIENZO), MAGENTA)
    d = ImageDraw.Draw(img)
    grosor = int(escalar(62))
    r = grosor / 2

    def punta(x, y):
        d.ellipse([escalar(x) - r, escalar(y) - r, escalar(x) + r, escalar(y) + r], fill=BLANCO)

    def trazo(puntos):
        d.line([(escalar(x), escalar(y)) for x, y in puntos], fill=BLANCO, width=grosor, joint="curve")
        punta(*puntos[0])
        punta(*puntos[-1])

    apex = (512, 470)
    trazo([apex, (232, 716)])
    trazo([apex, (792, 716)])
    trazo([(232, 716), (792, 716)])

    # Cuello y gancho en una sola polilínea para que la unión no tenga escalón
    cuello_y, radio = 366, 76
    cx, cy = apex[0] - radio, cuello_y
    arco = [
        (cx + radio * math.cos(math.radians(a)), cy + radio * math.sin(math.radians(a)))
        for a in range(0, -196, -5)
    ]
    trazo([apex, (apex[0], cuello_y)] + arco)

    for tam in TAMANOS:
        destino = f"public/icono-{tam}.png"
        img.resize((tam, tam), Image.LANCZOS).save(destino, optimize=True)
        print(destino)


if __name__ == "__main__":
    generar()
