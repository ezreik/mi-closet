# Lizyblue

Aplicación para llevar el control de la ropa que se compra en España y se vende en México:
qué prenda es, cuánto costó, a cuánto se vende y **cuánto queda limpio de verdad**.

Hecha para Liz. Funciona en el móvil, sin internet y sin cuentas ni contraseñas.

En uso: **https://ezreik.github.io/mi-closet/**

## Cómo funciona

- **Todo se guarda en el propio teléfono** (IndexedDB). No hay servidor, ni login, ni coste.
- Es una PWA: se instala en la pantalla de inicio y a partir de ahí funciona sin conexión.
- Las fotos se comprimen antes de guardarse (una foto de 4 MB queda en ~20 KB).
- Como no hay nube, **la copia de seguridad es la única red**: desde Ajustes se exporta un
  fichero con todo (incluidas las fotos) para mandarlo por WhatsApp o guardarlo en Drive.

## Qué hace

- Ficha de prenda: tipo, marca, talla, color, condición, medidas en cm y varias fotos.
- Precios en dos monedas: **compra en euros, venta en pesos**, con el tipo de cambio
  guardado en cada prenda para que la ganancia sea real y no una estimación.
- Ganancia **neta**: descuenta coste, envío y comisión de la plataforma.
- Precio de venta sugerido según el multiplicador objetivo, ya contando la comisión.
- Estados: en stock, apartada, vendida, devuelta.
- Anuncio listo para pegar en WhatsApp, Marketplace o Instagram (texto + fotos).
- Panel de números: invertido, cobrado, ganancia, margen medio, días medios en vender y
  qué marcas, tipos y plataformas dan más dinero.
- Agrupación por viaje o compra, con los gastos generales del viaje.
- Exportación a Excel (CSV) y copia de seguridad completa en JSON.
- Manual de uso dentro de la propia app (Ajustes → ¿Cómo se usa?), legible sin conexión.

## Manual

El manual vive en dos sitios: dentro de la app (`src/pantallas/Ayuda.tsx`) y como PDF de dos páginas
en [`manual/Lizyblue-manual.pdf`](manual/Lizyblue-manual.pdf), para mandarlo por WhatsApp.

```bash
python3 herramientas/manual.py   # regenera el PDF (necesita Google Chrome)
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/ con el service worker
```

Vite + React + TypeScript + Tailwind 4 + Dexie (IndexedDB) + vite-plugin-pwa.

### Estructura

| Fichero | Qué contiene |
| --- | --- |
| `src/db.ts` | Modelo de datos y acceso a IndexedDB |
| `src/calculos.ts` | Coste, ganancia neta, margen, precio sugerido y texto del anuncio |
| `src/constantes.ts` | Tipos de prenda, tallas, plataformas y qué medidas pide cada prenda |
| `src/fotos.ts` | Compresión de fotos y miniaturas |
| `src/respaldo.ts` | Copia de seguridad, restauración y exportación a CSV |
| `src/pantallas/` | Inventario, Ficha, Anuncio, Panel, Ajustes y Ayuda |

### Marca

Montserrat (servida en local desde `src/fuentes/`, para que funcione sin internet), magenta
`#FF007F` y negro `#0A0A0A`, según la biblioteca de marca de epoint, más el azul `#00A3FF` del
apodo de Liz. El degradado magenta → azul es la firma personal: se usa en el nombre y en el icono,
nunca en los botones. El icono se genera con `herramientas/icono.py`.

Los tipos de prenda van nombrados en mexicano: playera, mezclilla, bolsa, tenis, chamarra.

## Aviso sobre las comisiones

Los porcentajes de comisión que trae por defecto cada plataforma son **orientativos** y
editables en cada prenda. Conviene confirmar el porcentaje real de la categoría antes de
fiarse de la ganancia calculada.
