import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, guardarAjustes, leerAjustes, type Lote } from '../db'
import { decimal, euros } from '../calculos'
import { compartirCopia, descargarCopia, descargarExcel, restaurarCopia } from '../respaldo'
import { Boton, Campo, Dinero, Entrada, Tarjeta } from '../ui'
import { IconoBasura, IconoMas } from '../iconos'

export default function Ajustes({ alAbrirAyuda }: { alAbrirAyuda: () => void }) {
  const [tipoCambio, setTipoCambio] = useState(20)
  const [multiplicador, setMultiplicador] = useState(2.5)
  const [aviso, setAviso] = useState('')
  const entradaCopia = useRef<HTMLInputElement>(null)

  const lotes = useLiveQuery(() => db.lotes.reverse().toArray(), [], [] as Lote[])
  const cuantas = useLiveQuery(() => db.prendas.count(), [], 0)

  useEffect(() => {
    leerAjustes().then((a) => {
      setTipoCambio(a.tipoCambio)
      setMultiplicador(a.multiplicador)
    })
  }, [])

  const mostrar = (t: string) => {
    setAviso(t)
    setTimeout(() => setAviso(''), 3000)
  }

  const guardarCambio = async (cambios: { tipoCambio?: number; multiplicador?: number }) => {
    await guardarAjustes(cambios)
  }

  const nuevoLote = async () => {
    const nombre = prompt('¿Cómo llamamos a este viaje o compra?', `Viaje ${new Date().getFullYear()}`)
    if (!nombre) return
    await db.lotes.add({ nombre, fecha: new Date().toISOString(), gastosEur: 0, notas: '' })
  }

  const borrarLote = async (l: Lote) => {
    const usadas = await db.prendas.where('loteId').equals(l.id!).count()
    if (usadas > 0 && !confirm(`"${l.nombre}" tiene ${usadas} prendas. Se quedarán sin viaje asignado. ¿Sigo?`)) return
    await db.transaction('rw', db.prendas, db.lotes, async () => {
      const suyas = await db.prendas.where('loteId').equals(l.id!).toArray()
      await Promise.all(suyas.map((p) => db.prendas.update(p.id!, { loteId: undefined })))
      await db.lotes.delete(l.id!)
    })
  }

  const restaurar = async (archivo: File | undefined) => {
    if (!archivo) return
    if (!confirm('Esto sustituye TODO lo que tienes ahora por la copia. ¿Seguro?')) return
    try {
      const n = await restaurarCopia(archivo)
      mostrar(`Restauradas ${n} prendas.`)
    } catch (e) {
      mostrar(e instanceof Error ? e.message : 'No se pudo restaurar.')
    }
  }

  return (
    <div className="space-y-3 pb-28">
      <header className="px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <h1 className="text-[26px] font-extrabold leading-none tracking-tight">Ajustes</h1>
      </header>

      <div className="px-3">
        <button
          onClick={alAbrirAyuda}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:bg-slate-50"
        >
          <span>
            <span className="block text-[15px] font-bold">¿Cómo se usa?</span>
            <span className="mt-0.5 block text-[12px] text-slate-400">
              El manual, paso a paso. Se lee sin internet.
            </span>
          </span>
          <span className="text-[20px] text-magenta">›</span>
        </button>
      </div>

      <div className="px-3">
        <Tarjeta className="space-y-3">
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-magenta">Mis reglas</p>
          <Campo
            etiqueta="Tipo de cambio habitual"
            ayuda="Pesos por cada euro. Se pone solo en cada prenda nueva; ahí puedes cambiarlo."
          >
            <Entrada
              type="number"
              inputMode="decimal"
              step="any"
              value={tipoCambio || ''}
              onChange={(e) => {
                const n = Number(e.target.value)
                setTipoCambio(n)
                guardarCambio({ tipoCambio: n })
              }}
            />
          </Campo>
          <Campo
            etiqueta="Quiero recuperar por lo menos…"
            ayuda="Cuántas veces lo que me costó, ya sin comisiones. Con ×2,5 una prenda de 10 € se pone a la venta para dejarme 25 €."
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1.2"
                max="5"
                step="0.1"
                value={multiplicador}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  setMultiplicador(n)
                  guardarCambio({ multiplicador: n })
                }}
                className="h-2 flex-1 accent-[#FF007F]"
              />
              <span className="w-14 shrink-0 text-right text-[17px] font-extrabold text-magenta">
                ×{decimal(multiplicador)}
              </span>
            </div>
          </Campo>
        </Tarjeta>
      </div>

      <div className="px-3">
        <Tarjeta>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-magenta">Viajes y compras</p>
            <button
              onClick={nuevoLote}
              className="flex items-center gap-1 rounded-full bg-magenta-suave px-3 py-1.5 text-[12px] font-bold text-magenta"
            >
              <IconoMas className="h-3.5 w-3.5" /> Nuevo
            </button>
          </div>
          {lotes.length === 0 ? (
            <p className="text-[12px] leading-relaxed text-slate-400">
              Agrupa las prendas por viaje o por compra para saber cuál te salió rentable. Aquí también puedes anotar
              los gastos del viaje (maleta extra, transporte) para que no se te olviden al echar cuentas.
            </p>
          ) : (
            <ul className="space-y-2">
              {lotes.map((l) => (
                <LoteFila key={l.id} lote={l} alBorrar={() => borrarLote(l)} />
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      <div className="px-3">
        <Tarjeta className="space-y-2.5">
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-magenta">Copia de seguridad</p>
          <p className="text-[12px] leading-relaxed text-slate-500">
            Todo está guardado en este teléfono, así que si lo pierdes o borras la app, se va contigo. Haz una copia de
            vez en cuando y mándatela por WhatsApp o guárdala en Drive.
          </p>
          <Boton onClick={async () => (await compartirCopia()) || mostrar('Copia descargada.')}>
            Guardar copia ({cuantas} prendas)
          </Boton>
          <Boton variante="suave" onClick={() => descargarCopia().then(() => mostrar('Copia descargada.'))}>
            Descargar copia al teléfono
          </Boton>
          <Boton variante="suave" onClick={() => descargarExcel()}>
            Exportar a Excel (CSV)
          </Boton>
          <Boton variante="peligro" onClick={() => entradaCopia.current?.click()}>
            Restaurar desde una copia
          </Boton>
          <input
            ref={entradaCopia}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              restaurar(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </Tarjeta>
      </div>

      {aviso && (
        <p className="px-6 text-center text-[13px] font-bold text-emerald-600">{aviso}</p>
      )}

      <p className="px-8 pt-2 text-center text-[11px] leading-relaxed text-slate-400">
        Funciona sin internet. Tus datos no salen de este teléfono.
        <br />
        Hecho para <span className="degradado-lizy font-extrabold">Lizyblue</span>.
      </p>
    </div>
  )
}

function LoteFila({ lote, alBorrar }: { lote: Lote; alBorrar: () => void }) {
  const [gastos, setGastos] = useState(lote.gastosEur)

  return (
    <li className="rounded-xl bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[14px] font-bold">{lote.nombre}</span>
        <button onClick={alBorrar} className="p-1 text-slate-400 active:text-rose-500" aria-label="Borrar viaje">
          <IconoBasura className="h-4 w-4" />
        </button>
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-slate-500">Gastos del viaje (aparte de la ropa)</span>
        <Dinero
          simbolo="€"
          valor={gastos}
          alCambiar={(n) => {
            setGastos(n)
            db.lotes.update(lote.id!, { gastosEur: n })
          }}
        />
      </label>
      {gastos > 0 && (
        <p className="mt-1 text-[11px] text-slate-400">Se suman {euros(gastos)} al invertido de este viaje.</p>
      )}
    </li>
  )
}
