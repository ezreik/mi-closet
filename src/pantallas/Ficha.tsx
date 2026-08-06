import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { borrarPrenda, db, leerAjustes, siguienteSku, type Foto, type Lote, type Medidas, type Prenda } from '../db'
import { CONDICIONES, ESTADOS, NOMBRE_MEDIDA, PLATAFORMAS, TALLAS, TIPOS, medidasDe } from '../constantes'
import { calcular, decimal, euros, pesos, pvpSugerido } from '../calculos'
import { comprimir, miniatura, urlDe } from '../fotos'
import { AreaTexto, Boton, Campo, Dinero, Entrada, Selector, Tarjeta } from '../ui'
import { IconoAtras, IconoBasura, IconoCamara, IconoCerrar } from '../iconos'
import Anuncio from './Anuncio'

function prendaVacia(tipoCambio: number): Prenda {
  return {
    sku: '',
    tipo: 'Vestido',
    marca: '',
    talla: 'M',
    color: '',
    condicion: 'Como nueva',
    medidas: {},
    estado: 'stock',
    precioCompraEur: 0,
    envioCompraEur: 0,
    pvpMxn: 0,
    plataforma: 'Mano a mano',
    comisionPct: 0,
    envioVentaMxn: 0,
    tipoCambio,
    comprador: '',
    notas: '',
    fechaAlta: new Date().toISOString(),
  }
}

export default function Ficha({ id, alSalir }: { id: number | 'nueva'; alSalir: () => void }) {
  const [prenda, setPrenda] = useState<Prenda | null>(null)
  const [multiplicador, setMultiplicador] = useState(2.5)
  const [verAnuncio, setVerAnuncio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const entradaFoto = useRef<HTMLInputElement>(null)

  const lotes = useLiveQuery(() => db.lotes.toArray(), [], [] as Lote[])
  const fotos = useLiveQuery(
    () =>
      typeof id === 'number'
        ? db.fotos.where('prendaId').equals(id).sortBy('orden')
        : Promise.resolve([] as Foto[]),
    [id],
    [] as Foto[],
  )
  /** Fotos recién elegidas en un alta nueva: aún no hay prendaId al que colgarlas. */
  const [pendientes, setPendientes] = useState<Blob[]>([])

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const ajustes = await leerAjustes()
      if (!vivo) return
      setMultiplicador(ajustes.multiplicador)
      if (id === 'nueva') {
        setPrenda({ ...prendaVacia(ajustes.tipoCambio), sku: await siguienteSku() })
      } else {
        const encontrada = await db.prendas.get(id)
        if (encontrada) setPrenda(encontrada)
      }
    })()
    return () => {
      vivo = false
    }
  }, [id])

  const numeros = useMemo(() => (prenda ? calcular(prenda) : null), [prenda])

  const sugerido = useMemo(() => {
    if (!prenda) return 0
    return pvpSugerido(
      prenda.precioCompraEur + prenda.envioCompraEur,
      prenda.tipoCambio,
      multiplicador,
      prenda.comisionPct,
      prenda.envioVentaMxn,
    )
  }, [prenda, multiplicador])

  if (!prenda || !numeros) return <div className="p-8 text-center text-slate-400">Cargando…</div>

  const cambiar = (parche: Partial<Prenda>) => setPrenda({ ...prenda, ...parche })

  const cambiarMedida = (clave: keyof Medidas, valor: string) => {
    const medidas = { ...prenda.medidas }
    if (valor === '') delete medidas[clave]
    else medidas[clave] = Number(valor)
    cambiar({ medidas })
  }

  const cambiarPlataforma = (nombre: string) => {
    const p = PLATAFORMAS.find((x) => x.nombre === nombre)
    cambiar({ plataforma: nombre, comisionPct: p ? p.comision : prenda.comisionPct })
  }

  const cambiarEstado = (estado: Prenda['estado']) => {
    // Al marcar vendida guardamos la fecha: es lo que permite medir días en stock.
    if (estado === 'vendida' && !prenda.fechaVenta) {
      cambiar({ estado, fechaVenta: new Date().toISOString() })
    } else if (estado !== 'vendida') {
      cambiar({ estado, fechaVenta: undefined })
    } else {
      cambiar({ estado })
    }
  }

  /** La miniatura siempre sale de la primera foto; si cambia, se regenera. */
  const refrescarThumb = async (primera: Blob | undefined) => {
    const thumb = primera ? await miniatura(primera) : undefined
    setPrenda((p) => (p ? { ...p, thumb } : p))
    if (typeof id === 'number') await db.prendas.update(id, { thumb })
  }

  const añadirFotos = async (archivos: FileList | null) => {
    if (!archivos?.length) return
    const comprimidas = await Promise.all(Array.from(archivos).map((a) => comprimir(a)))
    if (typeof id === 'number') {
      const previas = await db.fotos.where('prendaId').equals(id).sortBy('orden')
      await Promise.all(
        comprimidas.map((blob, i) => db.fotos.add({ prendaId: id, blob, orden: previas.length + i })),
      )
      if (previas.length === 0) await refrescarThumb(comprimidas[0])
    } else {
      const todas = [...pendientes, ...comprimidas]
      setPendientes(todas)
      if (pendientes.length === 0) await refrescarThumb(todas[0])
    }
  }

  const quitarFoto = async (indice: number, fotoId?: number) => {
    if (fotoId != null) {
      await db.fotos.delete(fotoId)
      const quedan = await db.fotos.where('prendaId').equals(id as number).sortBy('orden')
      await refrescarThumb(quedan[0]?.blob)
    } else {
      const quedan = pendientes.filter((_, i) => i !== indice)
      setPendientes(quedan)
      if (fotos.length === 0) await refrescarThumb(quedan[0])
    }
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      if (typeof id === 'number') {
        await db.prendas.update(id, prenda)
      } else {
        const nuevoId = await db.prendas.add(prenda)
        await Promise.all(
          pendientes.map((blob, i) => db.fotos.add({ prendaId: nuevoId, blob, orden: i })),
        )
      }
      alSalir()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (typeof id !== 'number') return alSalir()
    if (!confirm(`¿Borrar ${prenda.sku} ${prenda.tipo}? No se puede deshacer.`)) return
    await borrarPrenda(id)
    alSalir()
  }

  const galeria: { url: string; fotoId?: number }[] = [
    ...fotos.map((f) => ({ url: urlDe(f.blob), fotoId: f.id })),
    ...pendientes.map((b) => ({ url: urlDe(b) })),
  ]

  const ganancia = numeros.gananciaMxn
  const colorGanancia = ganancia > 0 ? 'text-emerald-600' : ganancia < 0 ? 'text-rose-600' : 'text-slate-400'

  return (
    <div className="min-h-full bg-[#f6f6f7] pb-32">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 bg-white/95 px-2 py-2.5 backdrop-blur">
        <button onClick={alSalir} className="rounded-lg p-2 text-slate-500 active:bg-slate-100" aria-label="Volver">
          <IconoAtras className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-[15px] font-extrabold leading-tight">
            {id === 'nueva' ? 'Nueva prenda' : prenda.sku}
          </p>
          {id !== 'nueva' && <p className="text-[11px] text-slate-400">{prenda.tipo} {prenda.marca}</p>}
        </div>
        <button
          onClick={guardar}
          disabled={guardando}
          className="rounded-lg bg-magenta px-4 py-2 text-[14px] font-bold text-white active:bg-[#d80069] disabled:opacity-50"
        >
          Guardar
        </button>
      </header>

      <div className="space-y-3 p-3">
        {/* Fotos */}
        <Tarjeta>
          <p className="mb-2.5 text-[13px] font-semibold text-slate-600">Fotos</p>
          <div className="sin-barra flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => entradaFoto.current?.click()}
              className="flex h-28 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 active:bg-slate-50"
            >
              <IconoCamara className="h-6 w-6" />
              <span className="text-[11px] font-semibold">Añadir</span>
            </button>
            {galeria.map((f, i) => (
              <div key={i} className="relative h-28 w-24 shrink-0">
                <img src={f.url} alt="" className="h-full w-full rounded-xl object-cover" />
                <button
                  onClick={() => quitarFoto(i - fotos.length, f.fotoId)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-1 text-slate-500 shadow"
                  aria-label="Quitar foto"
                >
                  <IconoCerrar className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <input
            ref={entradaFoto}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              añadirFotos(e.target.files)
              e.target.value = ''
            }}
          />
          <p className="mt-2 text-[11px] text-slate-400">
            Frente, espalda, etiqueta y cualquier detalle o defecto.
          </p>
        </Tarjeta>

        {/* La prenda */}
        <Tarjeta className="space-y-3">
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-magenta">La prenda</p>
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Tipo">
              <Selector value={prenda.tipo} onChange={(e) => cambiar({ tipo: e.target.value })}>
                {TIPOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Talla">
              <Selector value={prenda.talla} onChange={(e) => cambiar({ talla: e.target.value })}>
                {TALLAS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Marca">
              <Entrada
                value={prenda.marca}
                placeholder="Zara, Mango…"
                onChange={(e) => cambiar({ marca: e.target.value })}
              />
            </Campo>
            <Campo etiqueta="Color">
              <Entrada value={prenda.color} placeholder="Negro" onChange={(e) => cambiar({ color: e.target.value })} />
            </Campo>
          </div>
          <Campo etiqueta="Condición">
            <Selector value={prenda.condicion} onChange={(e) => cambiar({ condicion: e.target.value })}>
              {CONDICIONES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Selector>
          </Campo>
        </Tarjeta>

        {/* Medidas */}
        <Tarjeta>
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-magenta">Medidas en cm</p>
          <div className="grid grid-cols-3 gap-2.5">
            {medidasDe(prenda.tipo).map((clave) => (
              <Campo key={clave} etiqueta={NOMBRE_MEDIDA[clave]}>
                <Entrada
                  type="number"
                  inputMode="decimal"
                  placeholder="—"
                  value={prenda.medidas[clave] ?? ''}
                  onChange={(e) => cambiarMedida(clave, e.target.value)}
                />
              </Campo>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Prenda estirada sobre la mesa. Estas medidas salen solas en el anuncio.
          </p>
        </Tarjeta>

        {/* Compra */}
        <Tarjeta className="space-y-3">
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-magenta">Lo que me costó</p>
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Precio de compra">
              <Dinero simbolo="€" valor={prenda.precioCompraEur} alCambiar={(n) => cambiar({ precioCompraEur: n })} />
            </Campo>
            <Campo etiqueta="Envío / traslado">
              <Dinero simbolo="€" valor={prenda.envioCompraEur} alCambiar={(n) => cambiar({ envioCompraEur: n })} />
            </Campo>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
            <span className="text-[13px] font-semibold text-slate-500">Coste total</span>
            <span className="text-[15px] font-extrabold">
              {euros(numeros.costeEur)} <span className="text-slate-400">= {pesos(numeros.costeMxn)}</span>
            </span>
          </div>
          <Campo etiqueta="Tipo de cambio" ayuda="Pesos por cada euro el día que la compraste.">
            <Entrada
              type="number"
              inputMode="decimal"
              step="any"
              value={prenda.tipoCambio || ''}
              onChange={(e) => cambiar({ tipoCambio: Number(e.target.value) })}
            />
          </Campo>
          {lotes.length > 0 && (
            <Campo etiqueta="Viaje o compra">
              <Selector
                value={prenda.loteId ?? ''}
                onChange={(e) => cambiar({ loteId: e.target.value === '' ? undefined : Number(e.target.value) })}
              >
                <option value="">Sin asignar</option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </Selector>
            </Campo>
          )}
        </Tarjeta>

        {/* Venta */}
        <Tarjeta className="space-y-3">
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-magenta">A cuánto la vendo</p>
          <Campo etiqueta="Precio de venta (PVP)">
            <Dinero simbolo="$" valor={prenda.pvpMxn} alCambiar={(n) => cambiar({ pvpMxn: n })} />
          </Campo>
          {sugerido > 0 && (
            <button
              onClick={() => cambiar({ pvpMxn: sugerido })}
              className="flex w-full items-center justify-between rounded-xl bg-magenta-suave px-3.5 py-2.5 text-left active:opacity-80"
            >
              <span className="text-[12px] font-semibold text-magenta">
                Sugerido para recuperar ×{decimal(multiplicador)}
              </span>
              <span className="text-[15px] font-extrabold text-magenta">{pesos(sugerido)}</span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Dónde la vendo">
              <Selector value={prenda.plataforma} onChange={(e) => cambiarPlataforma(e.target.value)}>
                {PLATAFORMAS.map((p) => (
                  <option key={p.nombre}>{p.nombre}</option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Comisión %" ayuda="Lo que se queda la plataforma.">
              <Entrada
                type="number"
                inputMode="decimal"
                step="any"
                value={prenda.comisionPct || ''}
                placeholder="0"
                onChange={(e) => cambiar({ comisionPct: Number(e.target.value) })}
              />
            </Campo>
          </div>
          <Campo etiqueta="Envío que pago yo" ayuda="Déjalo en 0 si lo paga la compradora.">
            <Dinero simbolo="$" valor={prenda.envioVentaMxn} alCambiar={(n) => cambiar({ envioVentaMxn: n })} />
          </Campo>
        </Tarjeta>

        {/* Resultado */}
        <div className="rounded-2xl bg-tinta p-4 text-white">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-white/60">Me queda limpio</span>
            <span className={`text-[28px] font-extrabold ${ganancia >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {pesos(ganancia)}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-[12px] text-white/50">
            <span>{euros(numeros.gananciaEur)}</span>
            <span>
              Margen {numeros.margenPct.toFixed(0)} % · recuperas ×{decimal(numeros.multiplicador)}
            </span>
          </div>
          {(numeros.comisionMxn > 0 || numeros.envioVentaMxn > 0) && (
            <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] leading-relaxed text-white/50">
              Ya descontados {pesos(numeros.comisionMxn)} de comisión y {pesos(numeros.envioVentaMxn)} de envío.
            </p>
          )}
        </div>
        <p className={`px-1 text-center text-[11px] font-semibold ${colorGanancia}`}>
          {ganancia < 0 && prenda.pvpMxn > 0 && 'Ojo: a este precio pierdes dinero.'}
        </p>

        {/* Estado */}
        <Tarjeta className="space-y-3">
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-magenta">Estado</p>
          <div className="grid grid-cols-2 gap-2">
            {ESTADOS.map((e) => (
              <button
                key={e.valor}
                onClick={() => cambiarEstado(e.valor)}
                className={`rounded-xl border-2 px-3 py-2.5 text-[13px] font-bold transition ${
                  prenda.estado === e.valor
                    ? 'border-magenta bg-magenta-suave text-magenta'
                    : 'border-slate-100 bg-white text-slate-500'
                }`}
              >
                {e.etiqueta}
              </button>
            ))}
          </div>
          {prenda.estado === 'vendida' && (
            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="Fecha de venta">
                <Entrada
                  type="date"
                  value={prenda.fechaVenta?.slice(0, 10) ?? ''}
                  onChange={(e) => cambiar({ fechaVenta: new Date(e.target.value).toISOString() })}
                />
              </Campo>
              <Campo etiqueta="Compradora">
                <Entrada
                  value={prenda.comprador}
                  placeholder="Nombre"
                  onChange={(e) => cambiar({ comprador: e.target.value })}
                />
              </Campo>
            </div>
          )}
          <Campo etiqueta="Notas">
            <AreaTexto
              rows={2}
              value={prenda.notas}
              placeholder="Dónde la compré, detalles, a quién le puede gustar…"
              onChange={(e) => cambiar({ notas: e.target.value })}
            />
          </Campo>
        </Tarjeta>

        <Boton variante="suave" onClick={() => setVerAnuncio(true)}>
          Ver anuncio para publicar
        </Boton>

        {id !== 'nueva' && (
          <button
            onClick={eliminar}
            className="flex w-full items-center justify-center gap-2 py-3 text-[13px] font-semibold text-rose-500"
          >
            <IconoBasura className="h-4 w-4" /> Borrar prenda
          </button>
        )}
      </div>

      {verAnuncio && (
        <Anuncio
          prenda={prenda}
          fotos={galeria.map((g) => g.url)}
          blobs={[...fotos.map((f) => f.blob), ...pendientes]}
          alCerrar={() => setVerAnuncio(false)}
        />
      )}
    </div>
  )
}
