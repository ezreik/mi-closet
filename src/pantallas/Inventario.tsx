import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Estado, type Prenda } from '../db'
import { ESTADOS } from '../constantes'
import { calcular, medidasEnTexto, pesos } from '../calculos'
import { Entrada, Vacio } from '../ui'
import { IconoBuscar, IconoPercha } from '../iconos'

type Filtro = 'todas' | Estado

export default function Inventario({ alAbrir }: { alAbrir: (id: number) => void }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const prendas = useLiveQuery(() => db.prendas.reverse().toArray(), [], [] as Prenda[])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return prendas.filter((p) => {
      if (filtro !== 'todas' && p.estado !== filtro) return false
      if (!texto) return true
      return [p.sku, p.tipo, p.marca, p.talla, p.color, p.plataforma, p.notas]
        .join(' ')
        .toLowerCase()
        .includes(texto)
    })
  }, [prendas, busqueda, filtro])

  const cuentas = useMemo(() => {
    const c: Record<string, number> = { todas: prendas.length }
    for (const e of ESTADOS) c[e.valor] = prendas.filter((p) => p.estado === e.valor).length
    return c
  }, [prendas])

  const enStock = prendas.filter((p) => p.estado === 'stock' || p.estado === 'reservada')
  const vendidas = prendas.filter((p) => p.estado === 'vendida')
  const gananciaTotal = vendidas.reduce((s, p) => s + calcular(p).gananciaMxn, 0)

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-10 bg-[#f6f6f7]/95 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
        <div className="mb-3 flex items-end justify-between">
          <h1 className="text-[26px] font-extrabold leading-none tracking-tight">Mi Clóset</h1>
          {vendidas.length > 0 && (
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-400">Ganado</p>
              <p className="text-[17px] font-extrabold leading-none text-emerald-600">{pesos(gananciaTotal)}</p>
            </div>
          )}
        </div>

        <div className="relative mb-2.5">
          <IconoBuscar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Entrada
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por marca, tipo, talla…"
            className="!pl-10"
          />
        </div>

        <div className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4">
          {([{ valor: 'todas', etiqueta: 'Todas' }, ...ESTADOS] as { valor: Filtro; etiqueta: string }[]).map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${
                filtro === f.valor ? 'bg-tinta text-white' : 'bg-white text-slate-500'
              }`}
            >
              {f.etiqueta} {cuentas[f.valor] > 0 && <span className="opacity-50">{cuentas[f.valor]}</span>}
            </button>
          ))}
        </div>
      </header>

      {prendas.length > 0 && (
        <p className="px-4 pb-2 pt-1 text-[12px] text-slate-400">
          {enStock.length} por vender · {vendidas.length} vendidas
        </p>
      )}

      {visibles.length === 0 ? (
        prendas.length === 0 ? (
          <Vacio
            titulo="Todavía no hay nada"
            texto="Pulsa el botón rosa para dar de alta tu primera prenda. Con una foto y el precio de compra ya vale."
          />
        ) : (
          <Vacio titulo="Nada por aquí" texto="Prueba con otra búsqueda o cambia el filtro." />
        )
      ) : (
        <ul className="space-y-2 px-3">
          {visibles.map((p) => (
            <Fila key={p.id} prenda={p} alAbrir={() => alAbrir(p.id!)} />
          ))}
        </ul>
      )}
    </div>
  )
}

function Fila({ prenda, alAbrir }: { prenda: Prenda; alAbrir: () => void }) {
  const n = calcular(prenda)
  const estado = ESTADOS.find((e) => e.valor === prenda.estado)!
  const medidas = medidasEnTexto(prenda)

  return (
    <li>
      <button
        onClick={alAbrir}
        className="flex w-full items-center gap-3 rounded-2xl bg-white p-2.5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:bg-slate-50"
      >
        {prenda.thumb ? (
          <img src={prenda.thumb} alt="" className="h-[68px] w-14 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-[68px] w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
            <IconoPercha className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[15px] font-bold leading-tight">
              {prenda.tipo}
              {prenda.marca && <span className="font-medium text-slate-500"> · {prenda.marca}</span>}
            </p>
          </div>
          <p className="mt-0.5 text-[12px] text-slate-400">
            {prenda.sku} · Talla {prenda.talla}
            {prenda.color && ` · ${prenda.color}`}
          </p>
          {medidas && <p className="mt-0.5 truncate text-[11px] text-slate-300">{medidas}</p>}
          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${estado.color}`}>
            {estado.etiqueta}
          </span>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[15px] font-extrabold leading-tight">{pesos(prenda.pvpMxn)}</p>
          <p
            className={`text-[12px] font-bold ${
              n.gananciaMxn > 0 ? 'text-emerald-600' : n.gananciaMxn < 0 ? 'text-rose-500' : 'text-slate-300'
            }`}
          >
            {n.gananciaMxn >= 0 ? '+' : ''}
            {pesos(n.gananciaMxn)}
          </p>
        </div>
      </button>
    </li>
  )
}
