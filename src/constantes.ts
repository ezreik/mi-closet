import type { Estado, Medidas } from './db'

export const TIPOS = [
  'Vestido',
  'Blusa',
  'Camisa',
  'Top',
  'Suéter',
  'Pantalón',
  'Jeans',
  'Falda',
  'Short',
  'Chamarra',
  'Abrigo',
  'Saco',
  'Conjunto',
  'Zapatos',
  'Bolso',
  'Accesorio',
  'Otro',
] as const

export const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única', '32', '34', '36', '38', '40', '42', '44', '46']

export const CONDICIONES = [
  'Nueva con etiqueta',
  'Nueva sin etiqueta',
  'Como nueva',
  'Buen estado',
  'Con detalle',
]

/**
 * Comisiones orientativas: son el punto de partida y se pueden cambiar en cada
 * prenda. Conviene que Liz confirme el porcentaje real de su categoría.
 */
export const PLATAFORMAS: { nombre: string; comision: number }[] = [
  { nombre: 'Mano a mano', comision: 0 },
  { nombre: 'WhatsApp', comision: 0 },
  { nombre: 'Facebook Marketplace', comision: 0 },
  { nombre: 'Instagram', comision: 0 },
  { nombre: 'Bazar / Tianguis', comision: 0 },
  { nombre: 'Mercado Libre', comision: 14 },
  { nombre: 'Vinted', comision: 0 },
  { nombre: 'Otra', comision: 0 },
]

export const ESTADOS: { valor: Estado; etiqueta: string; color: string }[] = [
  { valor: 'stock', etiqueta: 'En stock', color: 'bg-slate-100 text-slate-700' },
  { valor: 'reservada', etiqueta: 'Apartada', color: 'bg-amber-100 text-amber-800' },
  { valor: 'vendida', etiqueta: 'Vendida', color: 'bg-emerald-100 text-emerald-800' },
  { valor: 'devuelta', etiqueta: 'Devuelta', color: 'bg-rose-100 text-rose-700' },
]

export const NOMBRE_MEDIDA: Record<keyof Medidas, string> = {
  pecho: 'Pecho',
  cintura: 'Cintura',
  cadera: 'Cadera',
  largo: 'Largo',
  hombros: 'Hombros',
  manga: 'Manga',
  tiro: 'Tiro',
  pierna: 'Pierna',
}

const TODAS: (keyof Medidas)[] = ['pecho', 'cintura', 'cadera', 'largo', 'hombros', 'manga', 'tiro', 'pierna']

/** Qué medidas tiene sentido pedir según la prenda, para no llenar la pantalla de campos vacíos. */
export function medidasDe(tipo: string): (keyof Medidas)[] {
  switch (tipo) {
    case 'Vestido':
    case 'Conjunto':
      return ['pecho', 'cintura', 'cadera', 'largo', 'hombros', 'manga']
    case 'Blusa':
    case 'Camisa':
    case 'Top':
    case 'Suéter':
    case 'Chamarra':
    case 'Abrigo':
    case 'Saco':
      return ['pecho', 'largo', 'hombros', 'manga']
    case 'Pantalón':
    case 'Jeans':
      return ['cintura', 'cadera', 'tiro', 'largo', 'pierna']
    case 'Falda':
    case 'Short':
      return ['cintura', 'cadera', 'largo']
    case 'Zapatos':
    case 'Bolso':
    case 'Accesorio':
      return ['largo']
    default:
      return TODAS
  }
}
