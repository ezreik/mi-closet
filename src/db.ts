import Dexie, { type Table } from 'dexie'

export type Estado = 'stock' | 'reservada' | 'vendida' | 'devuelta'

/** Medidas en centímetros. Todas opcionales: cada tipo de prenda usa las suyas. */
export interface Medidas {
  pecho?: number
  cintura?: number
  cadera?: number
  largo?: number
  hombros?: number
  manga?: number
  tiro?: number
  pierna?: number
}

export interface Prenda {
  id?: number
  sku: string
  tipo: string
  marca: string
  talla: string
  color: string
  condicion: string
  medidas: Medidas
  estado: Estado

  /** Compra en España, en euros. */
  precioCompraEur: number
  envioCompraEur: number

  /** Venta en México, en pesos. */
  pvpMxn: number
  plataforma: string
  comisionPct: number
  envioVentaMxn: number
  /** Pesos por cada euro, congelado en la prenda para que la ganancia sea real. */
  tipoCambio: number

  loteId?: number
  comprador: string
  notas: string
  fechaAlta: string
  fechaVenta?: string
  /** Miniatura en dataURL para que la lista cargue rápido sin tocar las fotos grandes. */
  thumb?: string
}

export interface Foto {
  id?: number
  prendaId: number
  blob: Blob
  orden: number
}

export interface Lote {
  id?: number
  nombre: string
  fecha: string
  /** Gastos del viaje que no son de una prenda concreta (maleta extra, transporte…). */
  gastosEur: number
  notas: string
}

export interface Ajustes {
  clave: string
  tipoCambio: number
  multiplicador: number
  contadorSku: number
}

class ClosetDB extends Dexie {
  prendas!: Table<Prenda, number>
  fotos!: Table<Foto, number>
  lotes!: Table<Lote, number>
  ajustes!: Table<Ajustes, string>

  constructor() {
    super('mi-closet')
    this.version(1).stores({
      prendas: '++id, sku, tipo, marca, talla, estado, plataforma, loteId, fechaAlta, fechaVenta',
      fotos: '++id, prendaId',
      lotes: '++id, fecha',
      ajustes: 'clave',
    })
  }
}

export const db = new ClosetDB()

export const AJUSTES_POR_DEFECTO: Ajustes = {
  clave: 'general',
  tipoCambio: 20,
  multiplicador: 2.5,
  contadorSku: 0,
}

export async function leerAjustes(): Promise<Ajustes> {
  const guardados = await db.ajustes.get('general')
  return guardados ?? AJUSTES_POR_DEFECTO
}

export async function guardarAjustes(cambios: Partial<Ajustes>): Promise<void> {
  const actuales = await leerAjustes()
  await db.ajustes.put({ ...actuales, ...cambios, clave: 'general' })
}

/** Devuelve el siguiente código de prenda (A-001, A-002…) y avanza el contador. */
export async function siguienteSku(): Promise<string> {
  const actuales = await leerAjustes()
  const n = actuales.contadorSku + 1
  await db.ajustes.put({ ...actuales, contadorSku: n, clave: 'general' })
  return `A-${String(n).padStart(3, '0')}`
}

export async function borrarPrenda(id: number): Promise<void> {
  await db.transaction('rw', db.prendas, db.fotos, async () => {
    await db.fotos.where('prendaId').equals(id).delete()
    await db.prendas.delete(id)
  })
}
