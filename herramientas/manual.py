"""Genera el PDF del manual de Lizyblue a partir de un HTML autocontenido.

    python3 herramientas/manual.py

La fuente y el icono van incrustados en base64 para que el HTML se pueda
abrir suelto. El PDF lo imprime Chrome en modo headless.
"""

import base64
import pathlib
import subprocess

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "manual"


def b64(ruta):
    return base64.b64encode(pathlib.Path(ruta).read_bytes()).decode()


FUENTE = b64(RAIZ / "src/fuentes/montserrat.woff2")
ICONO = b64(RAIZ / "public/icono-512.png")

PASOS = [
    (
        "1",
        "Instálala en tu teléfono",
        [
            "Antes que nada, guárdala en la pantalla de inicio para que se abra como cualquier otra app "
            "y funcione sin señal.",
            "<b>En iPhone:</b> pulsa el botón de Compartir (el cuadrito con la flecha hacia arriba) y "
            "luego «Añadir a pantalla de inicio».",
            "<b>En Android:</b> abre el menú de los tres puntitos y pulsa «Instalar aplicación».",
        ],
        "Esto no es un capricho: instalada, el teléfono no borra tus datos. Sin instalar, con el tiempo "
        "podría hacerlo.",
    ),
    (
        "2",
        "Da de alta una prenda",
        [
            "Pulsa el botón rosa <b>+</b> abajo a la derecha. Cada prenda recibe su código (A-001, "
            "A-002…) para que sepas cuál es sin abrirla.",
            "<b>Fotos:</b> saca varias — de frente, de espalda, la etiqueta y cualquier detallito o "
            "defecto. Se guardan ligeras para no llenarte el teléfono.",
            "<b>Medidas:</b> pon la prenda estirada sobre la mesa y mide en centímetros. Salen solas en "
            "el anuncio y te ahorran la mitad de las preguntas.",
        ],
        None,
    ),
    (
        "3",
        "Lo que te costó",
        [
            "Apunta el <b>precio de compra en euros</b> y, aparte, lo que pagaste de <b>envío o "
            "traslado</b>. La app suma las dos cosas: ese es el costo real.",
            "<b>Tipo de cambio:</b> cuántos pesos vale un euro el día que la compraste. Se queda guardado "
            "en cada prenda, así que aunque el cambio se mueva, tus cuentas viejas siguen bien.",
        ],
        None,
    ),
    (
        "4",
        "A cuánto la vendes",
        [
            "Verás un recuadro rosa con un <b>precio sugerido</b>: sale de recuperar varias veces lo que "
            "pusiste, ya contando lo que se queda la plataforma. Púlsalo y se pone solo.",
            "<b>Dónde la vendes:</b> si la plataforma cobra comisión, la app la descuenta sola. Si te toca "
            "pagar el envío, ponlo también.",
        ],
        "Los porcentajes de comisión vienen puestos a ojo. Cuando sepas el tuyo de verdad, cámbialo: la "
        "ganancia solo es fiable si ese número es el bueno.",
    ),
    (
        "5",
        "Mira el recuadro negro",
        [
            "Es lo que <b>te queda limpio</b>: el precio de venta menos la comisión, menos el envío, menos "
            "lo que te costó la prenda.",
            "Si sale en rojo, a ese precio estás perdiendo dinero. Súbelo o busca dónde vender sin "
            "comisión.",
        ],
        None,
    ),
    (
        "6",
        "Publica en dos toques",
        [
            "Abajo de la ficha tienes <b>«Ver anuncio para publicar»</b>. La app escribe el anuncio con la "
            "marca, la talla, las medidas y el precio.",
            "<b>Copiar</b> lo deja listo para pegar. <b>Compartir</b> lo manda con las fotos directo a "
            "WhatsApp, Marketplace o Instagram.",
        ],
        None,
    ),
    (
        "7",
        "Cuando la vendas",
        [
            "Abre la prenda y en <b>Estado</b> pulsa «Vendida». Apunta la fecha y quién te la compró.",
            "Si alguien te la apartó pero aún no paga, ponla en «Apartada».",
        ],
        None,
    ),
    (
        "8",
        "Tus números",
        [
            "En la pestaña <b>Números</b> ves cuánto llevas invertido, cuánto has cobrado, cuánto te queda "
            "limpio y cuánto ganarías si vendieras todo.",
            "Abajo te dice <b>qué marcas y qué tipo de prenda te dan más dinero</b> y cuánto tardas de "
            "media en vender. Eso es lo que te dirá qué comprar en el siguiente viaje.",
        ],
        None,
    ),
    (
        "10",
        "Cosas que te van a servir",
        [
            "<b>Buscar:</b> escribe una marca, una talla o un color y filtra al momento.",
            "<b>Viajes:</b> en Ajustes puedes agrupar las prendas de una compra, con los gastos del viaje "
            "aparte, y ver si salió rentable.",
            "<b>Excel:</b> si quieres las cuentas en una hoja de cálculo, en Ajustes lo exportas.",
        ],
        None,
    ),
]

# El 9 va aparte porque es el que no se puede pasar por alto.
COPIA = (
    "9",
    "La copia de seguridad",
    [
        "Como todo vive en tu teléfono, <b>si lo pierdes o borras la app, se va contigo</b>. No hay dónde "
        "recuperarlo.",
        "En <b>Ajustes → Guardar copia</b> se crea un archivo con todo, fotos incluidas. Mándatelo por "
        "WhatsApp a ti misma o guárdalo en Drive.",
        "<b>Hazlo cada semana o cada vez que subas varias prendas.</b> Si algún día pasa algo, con "
        "«Restaurar desde una copia» lo recuperas todo.",
    ],
)


def bloque(numero, titulo, parrafos, nota=None, destacado=False):
    cuerpo = "".join(f"<p>{p}</p>" for p in parrafos)
    if nota:
        cuerpo += f'<p class="nota">{nota}</p>'
    clase = "paso destacado" if destacado else "paso"
    return f"""
    <section class="{clase}">
      <h3><span class="num">{numero}</span>{titulo}</h3>
      {cuerpo}
    </section>"""


HTML = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<style>
  @font-face {{
    font-family: 'Montserrat';
    font-weight: 400 800;
    src: url(data:font/woff2;base64,{FUENTE}) format('woff2');
  }}
  @page {{ size: A4; margin: 12mm 11mm; }}
  * {{ box-sizing: border-box; }}
  body {{
    font-family: 'Montserrat', sans-serif;
    color: #0A0A0A; margin: 0;
    font-size: 9.2pt; line-height: 1.5;
  }}
  .portada {{ display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }}
  .portada img {{ width: 46px; height: 46px; border-radius: 11px; }}
  h1 {{
    /* inline-block a propósito: como bloque, el degradado se sale del texto al imprimir. */
    display: inline-block;
    font-size: 27pt; margin: 0; letter-spacing: -.5px;
    background: linear-gradient(100deg, #FF007F 10%, #00A3FF 90%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }}
  .lema {{ font-size: 8.6pt; color: #64748b; font-weight: 600; margin: 2px 0 0; }}
  .intro {{
    border-left: 3px solid #FF007F; padding: 2px 0 2px 11px;
    margin-bottom: 13px; color: #475569; font-size: 9.4pt;
  }}
  .intro b {{ color: #0A0A0A; }}
  .cols {{ column-count: 2; column-gap: 9mm; }}
  .paso {{
    break-inside: avoid; margin-bottom: 11px;
    border: 1px solid #e8e8ec; border-radius: 9px; padding: 9px 11px 6px;
  }}
  .paso.destacado {{ border: 2px solid #FF007F; background: #FFF5FA; }}
  h3 {{ font-size: 10.4pt; margin: 0 0 5px; display: flex; align-items: center; gap: 7px; }}
  .num {{
    display: inline-flex; align-items: center; justify-content: center;
    width: 17px; height: 17px; border-radius: 50%;
    background: #E0F3FF; color: #0086d4; font-size: 7.6pt; flex: none;
  }}
  .destacado .num {{ background: #FF007F; color: #fff; }}
  p {{ margin: 0 0 5px; color: #475569; }}
  .paso p b {{ color: #0A0A0A; }}
  .nota {{
    background: #FFE5F1; color: #c1005f; border-radius: 7px;
    padding: 6px 8px; font-size: 8.4pt; margin-top: 6px;
  }}
  .pie {{
    margin-top: 6px; padding-top: 8px; border-top: 1px solid #e8e8ec;
    text-align: center; font-size: 8.4pt; color: #94a3b8;
  }}
  .firma {{
    font-weight: 800;
    background: linear-gradient(100deg, #FF007F, #00A3FF);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }}
  .salto {{ break-before: page; }}
  .enlace {{
    text-align: center; background: #0A0A0A; color: #fff; border-radius: 9px;
    padding: 9px; margin-bottom: 12px; font-size: 9pt;
  }}
  .enlace b {{ font-size: 11pt; letter-spacing: .2px; }}
</style></head>
<body>
  <div class="portada">
    <img src="data:image/png;base64,{ICONO}">
    <div><h1>Lizyblue</h1><p class="lema">Tu clóset, prenda por prenda · Manual de uso</p></div>
  </div>

  <div class="intro">
    Esta app lleva la cuenta de cada prenda que compras aquí y vendes allá: qué te costó, en cuánto la
    vendes y —lo importante— <b>cuánto te queda limpio de verdad</b>.
    No necesita internet ni contraseña: todo se guarda en tu teléfono.
  </div>

  <div class="enlace">
    Ábrela en tu teléfono: <b>ezreik.github.io/mi-closet</b>
  </div>

  <div class="cols">
    {"".join(bloque(*p) for p in PASOS[:6])}
  </div>

  <div class="salto"></div>
  <div class="cols">
    {"".join(bloque(*p) for p in PASOS[6:8])}
    {bloque(*COPIA, destacado=True)}
    {bloque(*PASOS[8])}
  </div>

  <p class="pie">
    Si algo no hace lo que necesitas o te falta algún dato, díselo a Elías y se cambia.<br>
    <span class="firma">Mucha suerte con las ventas.</span>
  </p>
</body></html>"""

html_path = SALIDA / "manual.html"
html_path.write_text(HTML, encoding="utf-8")

pdf_path = SALIDA / "Lizyblue-manual.pdf"
subprocess.run(
    [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path.as_uri(),
    ],
    check=True,
    capture_output=True,
)
print(pdf_path, pdf_path.stat().st_size // 1024, "KB")
