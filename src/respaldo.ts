import { db, leerAjustes, type Foto, type Prenda } from './db'
import { calcular, medidasEnTexto } from './calculos'
import { ESTADOS } from './constantes'

/**
 * Todo vive en el teléfono, así que la copia de seguridad es la única red.
 * El fichero incluye las fotos en base64 para poder restaurar el inventario entero.
 */

function blobABase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const lector = new FileReader()
    lector.onload = () => resolve(String(lector.result))
    lector.readAsDataURL(blob)
  })
}

async function base64ABlob(dato: string): Promise<Blob> {
  const res = await fetch(dato)
  return res.blob()
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

function descargar(contenido: Blob, nombre: string) {
  const url = URL.createObjectURL(contenido)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function exportarCopia(): Promise<{ nombre: string; blob: Blob }> {
  const [prendas, lotes, ajustes, fotos] = await Promise.all([
    db.prendas.toArray(),
    db.lotes.toArray(),
    leerAjustes(),
    db.fotos.toArray(),
  ])

  const fotosSerializadas = await Promise.all(
    fotos.map(async (f) => ({ prendaId: f.prendaId, orden: f.orden, dato: await blobABase64(f.blob) })),
  )

  const copia = {
    formato: 'mi-closet',
    version: 1,
    fecha: new Date().toISOString(),
    prendas,
    lotes,
    ajustes,
    fotos: fotosSerializadas,
  }

  const blob = new Blob([JSON.stringify(copia)], { type: 'application/json' })
  const nombre = `mi-closet-${hoy()}.json`
  return { nombre, blob }
}

export async function descargarCopia(): Promise<void> {
  const { nombre, blob } = await exportarCopia()
  descargar(blob, nombre)
}

/** En el móvil lo cómodo es mandarse la copia por WhatsApp o guardarla en Drive. */
export async function compartirCopia(): Promise<boolean> {
  const { nombre, blob } = await exportarCopia()
  const archivo = new File([blob], nombre, { type: 'application/json' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: [archivo] })) {
    await nav.share({ files: [archivo], title: 'Copia de Mi Clóset' })
    return true
  }
  descargar(blob, nombre)
  return false
}

export async function restaurarCopia(archivo: File): Promise<number> {
  const texto = await archivo.text()
  const copia = JSON.parse(texto)
  if (copia?.formato !== 'mi-closet') throw new Error('Ese fichero no es una copia de Mi Clóset.')

  // Los ids cambian al reinsertar, así que reasignamos las fotos a su prenda nueva.
  await db.transaction('rw', db.prendas, db.fotos, db.lotes, db.ajustes, async () => {
    await Promise.all([db.prendas.clear(), db.fotos.clear(), db.lotes.clear()])

    const mapaLotes = new Map<number, number>()
    for (const lote of copia.lotes ?? []) {
      const viejo = lote.id
      delete lote.id
      const nuevo = await db.lotes.add(lote)
      if (viejo != null) mapaLotes.set(viejo, nuevo)
    }

    const mapaPrendas = new Map<number, number>()
    for (const prenda of copia.prendas ?? []) {
      const viejo = prenda.id
      delete prenda.id
      if (prenda.loteId != null) prenda.loteId = mapaLotes.get(prenda.loteId)
      const nuevo = await db.prendas.add(prenda as Prenda)
      if (viejo != null) mapaPrendas.set(viejo, nuevo)
    }

    for (const foto of copia.fotos ?? []) {
      const prendaId = mapaPrendas.get(foto.prendaId)
      if (prendaId == null) continue
      const blob = await base64ABlob(foto.dato)
      await db.fotos.add({ prendaId, orden: foto.orden, blob } as Foto)
    }

    if (copia.ajustes) await db.ajustes.put({ ...copia.ajustes, clave: 'general' })
  })

  return (copia.prendas ?? []).length
}

export async function descargarExcel(): Promise<void> {
  const prendas = await db.prendas.toArray()
  const cabecera = [
    'Código', 'Tipo', 'Marca', 'Talla', 'Color', 'Condición', 'Medidas (cm)', 'Estado',
    'Compra €', 'Envío compra €', 'Coste €', 'Tipo de cambio', 'PVP $', 'Plataforma',
    'Comisión %', 'Envío venta $', 'Ganancia $', 'Ganancia €', 'Margen %',
    'Alta', 'Venta', 'Días', 'Comprador', 'Notas',
  ]

  // Excel en español espera la coma como separador decimal; con punto lo lee como texto.
  const num = (n: number, dec = 2) => n.toFixed(dec).replace('.', ',')

  const filas = prendas.map((p) => {
    const n = calcular(p)
    return [
      p.sku, p.tipo, p.marca, p.talla, p.color, p.condicion, medidasEnTexto(p),
      ESTADOS.find((e) => e.valor === p.estado)?.etiqueta ?? p.estado,
      num(p.precioCompraEur), num(p.envioCompraEur), num(n.costeEur), num(p.tipoCambio), num(p.pvpMxn), p.plataforma,
      num(p.comisionPct, 1), num(p.envioVentaMxn), num(n.gananciaMxn), num(n.gananciaEur), num(n.margenPct, 1),
      p.fechaAlta?.slice(0, 10) ?? '', p.fechaVenta?.slice(0, 10) ?? '',
      p.fechaVenta ? Math.round((+new Date(p.fechaVenta) - +new Date(p.fechaAlta)) / 86400000) : '',
      p.comprador, (p.notas ?? '').replace(/\n/g, ' '),
    ]
  })

  const escapar = (v: unknown) => {
    const s = String(v ?? '')
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  // Punto y coma + BOM: así Excel en español lo abre en columnas sin preguntar nada.
  const csv = '﻿' + [cabecera, ...filas].map((f) => f.map(escapar).join(';')).join('\n')
  descargar(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `mi-closet-${hoy()}.csv`)
}
