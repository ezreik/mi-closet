import type { Prenda } from './db'
import { NOMBRE_MEDIDA } from './constantes'

export interface Numeros {
  /** Lo que le costó la prenda puesta en su mano: precio + envío. */
  costeEur: number
  costeMxn: number
  comisionMxn: number
  envioVentaMxn: number
  /** Lo que le queda limpio después de comisión, envío y coste. */
  gananciaMxn: number
  gananciaEur: number
  /** Ganancia sobre el precio de venta, en porcentaje. */
  margenPct: number
  /** Cuántas veces recupera lo que puso, ya sin comisión ni envío. */
  multiplicador: number
}

export function calcular(p: Prenda): Numeros {
  const tipoCambio = p.tipoCambio > 0 ? p.tipoCambio : 1
  const costeEur = (p.precioCompraEur || 0) + (p.envioCompraEur || 0)
  const costeMxn = costeEur * tipoCambio
  const pvp = p.pvpMxn || 0
  const comisionMxn = pvp * ((p.comisionPct || 0) / 100)
  const envioVentaMxn = p.envioVentaMxn || 0
  const gananciaMxn = pvp - comisionMxn - envioVentaMxn - costeMxn

  return {
    costeEur,
    costeMxn,
    comisionMxn,
    envioVentaMxn,
    gananciaMxn,
    gananciaEur: gananciaMxn / tipoCambio,
    margenPct: pvp > 0 ? (gananciaMxn / pvp) * 100 : 0,
    // Neto, no bruto: si no, no cuadraría con el precio sugerido.
    multiplicador: costeMxn > 0 ? (pvp - comisionMxn - envioVentaMxn) / costeMxn : 0,
  }
}

/**
 * Precio de venta que hace falta para ganar el multiplicador objetivo,
 * ya contando la comisión de la plataforma y el envío que paga ella.
 */
export function pvpSugerido(
  costeEur: number,
  tipoCambio: number,
  multiplicador: number,
  comisionPct: number,
  envioVentaMxn: number,
): number {
  const costeMxn = costeEur * (tipoCambio || 1)
  const objetivo = costeMxn * multiplicador + envioVentaMxn
  const factor = 1 - (comisionPct || 0) / 100
  const bruto = factor > 0 ? objetivo / factor : objetivo
  // Redondeo a decenas de peso: los precios redondos venden mejor.
  return Math.round(bruto / 10) * 10
}

export function pesos(n: number): string {
  return (
    '$' +
    Math.round(n).toLocaleString('es-MX') +
    ''
  )
}

/** Un decimal con coma, como se escriben los números en español. */
export function decimal(n: number, dec = 1): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export function euros(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export function diasEnStock(p: Prenda): number {
  const desde = new Date(p.fechaAlta).getTime()
  const hasta = p.fechaVenta ? new Date(p.fechaVenta).getTime() : Date.now()
  return Math.max(0, Math.round((hasta - desde) / 86400000))
}

export function medidasEnTexto(p: Prenda): string {
  return (Object.keys(p.medidas) as (keyof typeof p.medidas)[])
    .filter((k) => typeof p.medidas[k] === 'number' && !Number.isNaN(p.medidas[k]))
    .map((k) => `${NOMBRE_MEDIDA[k]} ${p.medidas[k]} cm`)
    .join(' · ')
}

/** Texto listo para pegar en WhatsApp, Marketplace o Instagram. */
export function textoAnuncio(p: Prenda): string {
  const lineas: string[] = []
  lineas.push(`${p.tipo}${p.marca ? ' ' + p.marca : ''}${p.talla ? ' · Talla ' + p.talla : ''}`)
  if (p.color) lineas.push(`Color: ${p.color}`)
  if (p.condicion) lineas.push(`Estado: ${p.condicion.toLowerCase()}`)
  const medidas = medidasEnTexto(p)
  if (medidas) lineas.push(`Medidas: ${medidas}`)
  if (p.notas) lineas.push(p.notas)
  lineas.push('')
  lineas.push(`${pesos(p.pvpMxn)} MXN`)
  return lineas.join('\n')
}
