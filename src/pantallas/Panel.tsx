import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Lote, type Prenda } from '../db'
import { calcular, diasEnStock, euros, pesos } from '../calculos'
import { Tarjeta, Vacio } from '../ui'

export default function Panel() {
  const prendas = useLiveQuery(() => db.prendas.toArray(), [], [] as Prenda[])
  const lotes = useLiveQuery(() => db.lotes.toArray(), [], [] as Lote[])

  const r = useMemo(() => {
    const vendidas = prendas.filter((p) => p.estado === 'vendida')
    const enStock = prendas.filter((p) => p.estado === 'stock' || p.estado === 'reservada')

    const invertidoTotalEur = prendas.reduce((s, p) => s + calcular(p).costeEur, 0)
    const invertidoStockEur = enStock.reduce((s, p) => s + calcular(p).costeEur, 0)
    const cobradoMxn = vendidas.reduce((s, p) => s + p.pvpMxn, 0)
    const gananciaMxn = vendidas.reduce((s, p) => s + calcular(p).gananciaMxn, 0)
    const potencialMxn = enStock.reduce((s, p) => s + calcular(p).gananciaMxn, 0)
    const valorStockMxn = enStock.reduce((s, p) => s + p.pvpMxn, 0)

    const margenes = vendidas.map((p) => calcular(p).margenPct)
    const margenMedio = margenes.length ? margenes.reduce((a, b) => a + b, 0) / margenes.length : 0
    const dias = vendidas.map(diasEnStock)
    const diasMedios = dias.length ? Math.round(dias.reduce((a, b) => a + b, 0) / dias.length) : 0

    const agrupar = (clave: (p: Prenda) => string) => {
      const mapa = new Map<string, { ganancia: number; cuenta: number }>()
      for (const p of vendidas) {
        const k = clave(p) || '—'
        const actual = mapa.get(k) ?? { ganancia: 0, cuenta: 0 }
        mapa.set(k, { ganancia: actual.ganancia + calcular(p).gananciaMxn, cuenta: actual.cuenta + 1 })
      }
      return [...mapa.entries()].sort((a, b) => b[1].ganancia - a[1].ganancia).slice(0, 5)
    }

    return {
      total: prendas.length,
      vendidas,
      enStock,
      invertidoTotalEur,
      invertidoStockEur,
      cobradoMxn,
      gananciaMxn,
      potencialMxn,
      valorStockMxn,
      margenMedio,
      diasMedios,
      porMarca: agrupar((p) => p.marca),
      porTipo: agrupar((p) => p.tipo),
      porPlataforma: agrupar((p) => p.plataforma),
    }
  }, [prendas])

  if (prendas.length === 0) {
    return (
      <div className="pb-28">
        <Cabecera />
        <Vacio titulo="Aún no hay números" texto="Cuando des de alta y vendas prendas, aquí verás cuánto ganas de verdad y qué te conviene comprar." />
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-28">
      <Cabecera />

      <div className="px-3">
        <div className="rounded-2xl bg-tinta p-5 text-white">
          <p className="text-[13px] font-semibold text-white/60">Ganancia limpia hasta hoy</p>
          <p className="degradado-lizy mt-1 text-[36px] font-extrabold leading-none">{pesos(r.gananciaMxn)}</p>
          <p className="mt-1.5 text-[13px] text-white/50">
            {r.vendidas.length} {r.vendidas.length === 1 ? 'prenda vendida' : 'prendas vendidas'} · margen medio{' '}
            {r.margenMedio.toFixed(0)} %
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3">
        <Dato titulo="Invertido en total" valor={euros(r.invertidoTotalEur)} pie={`${r.total} prendas`} />
        <Dato titulo="Cobrado" valor={pesos(r.cobradoMxn)} pie="Ventas brutas" />
        <Dato titulo="Parado en stock" valor={euros(r.invertidoStockEur)} pie={`${r.enStock.length} sin vender`} />
        <Dato
          titulo="Si vendo todo"
          valor={pesos(r.potencialMxn)}
          pie={`Stock a ${pesos(r.valorStockMxn)}`}
          acento
        />
      </div>

      {r.vendidas.length > 0 && (
        <div className="px-3">
          <Tarjeta>
            <p className="text-[13px] font-semibold text-slate-500">
              Tarda de media <span className="font-extrabold text-tinta">{r.diasMedios} días</span> en vender una prenda.
            </p>
          </Tarjeta>
        </div>
      )}

      <Ranking titulo="Marcas que más te dan" filas={r.porMarca} />
      <Ranking titulo="Tipos de prenda que más te dan" filas={r.porTipo} />
      <Ranking titulo="Dónde ganas más" filas={r.porPlataforma} />

      {lotes.length > 0 && <PorLote lotes={lotes} prendas={prendas} />}

      <p className="px-6 pt-2 text-center text-[11px] leading-relaxed text-slate-400">
        La ganancia ya lleva descontado el coste, el envío y la comisión de cada plataforma.
      </p>
    </div>
  )
}

function Cabecera() {
  return (
    <header className="px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <h1 className="text-[26px] font-extrabold leading-none tracking-tight">Mis números</h1>
    </header>
  )
}

function Dato({ titulo, valor, pie, acento }: { titulo: string; valor: string; pie: string; acento?: boolean }) {
  return (
    <div className={`rounded-2xl p-3.5 ${acento ? 'bg-magenta-suave' : 'bg-white'} shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}>
      <p className="text-[11px] font-semibold text-slate-400">{titulo}</p>
      <p className={`mt-1 text-[19px] font-extrabold leading-tight ${acento ? 'text-magenta' : ''}`}>{valor}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">{pie}</p>
    </div>
  )
}

function Ranking({ titulo, filas }: { titulo: string; filas: [string, { ganancia: number; cuenta: number }][] }) {
  if (filas.length === 0) return null
  const tope = Math.max(...filas.map(([, v]) => Math.abs(v.ganancia)), 1)

  return (
    <div className="px-3">
      <Tarjeta>
        <p className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-magenta">{titulo}</p>
        <ul className="space-y-2.5">
          {filas.map(([nombre, v]) => (
            <li key={nombre}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="truncate text-[14px] font-semibold">{nombre}</span>
                <span className="shrink-0 text-[14px] font-extrabold text-emerald-600">{pesos(v.ganancia)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-magenta"
                    style={{ width: `${Math.max(3, (Math.abs(v.ganancia) / tope) * 100)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-[11px] text-slate-400">
                  {v.cuenta} {v.cuenta === 1 ? 'venta' : 'ventas'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Tarjeta>
    </div>
  )
}

function PorLote({ lotes, prendas }: { lotes: Lote[]; prendas: Prenda[] }) {
  return (
    <div className="px-3">
      <Tarjeta>
        <p className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-magenta">Por viaje o compra</p>
        <ul className="space-y-3">
          {lotes.map((l) => {
            const suyas = prendas.filter((p) => p.loteId === l.id)
            const vendidas = suyas.filter((p) => p.estado === 'vendida')
            const invertido = suyas.reduce((s, p) => s + calcular(p).costeEur, 0) + (l.gastosEur || 0)
            const ganado = vendidas.reduce((s, p) => s + calcular(p).gananciaMxn, 0)
            return (
              <li key={l.id} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-[14px] font-bold">{l.nombre}</span>
                  <span className="text-[14px] font-extrabold text-emerald-600">{pesos(ganado)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {vendidas.length} de {suyas.length} vendidas · invertido {euros(invertido)}
                  {l.gastosEur > 0 && ` (incluye ${euros(l.gastosEur)} de gastos)`}
                </p>
              </li>
            )
          })}
        </ul>
      </Tarjeta>
    </div>
  )
}
