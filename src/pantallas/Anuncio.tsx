import { useState } from 'react'
import type { Prenda } from '../db'
import { textoAnuncio } from '../calculos'
import { Boton } from '../ui'
import { IconoCerrar, IconoCompartir, IconoCopiar } from '../iconos'

/**
 * Escribir cada anuncio a mano es lo que más tiempo come al vender.
 * Aquí sale hecho con marca, talla, medidas y precio, listo para pegar.
 */
export default function Anuncio({
  prenda,
  fotos,
  blobs,
  alCerrar,
}: {
  prenda: Prenda
  fotos: string[]
  blobs: Blob[]
  alCerrar: () => void
}) {
  const [texto, setTexto] = useState(textoAnuncio(prenda))
  const [aviso, setAviso] = useState('')

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setAviso('Copiado. Ya puedes pegarlo.')
    } catch {
      setAviso('Selecciona el texto y cópialo a mano.')
    }
    setTimeout(() => setAviso(''), 2500)
  }

  const compartir = async () => {
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
    const archivos = blobs.map((b, i) => new File([b], `${prenda.sku}-${i + 1}.jpg`, { type: 'image/jpeg' }))
    try {
      if (archivos.length && nav.share && nav.canShare?.({ files: archivos })) {
        await nav.share({ text: texto, files: archivos })
      } else if (nav.share) {
        await nav.share({ text: texto })
      } else {
        await copiar()
      }
    } catch {
      /* Si cancela el menú de compartir no hay nada que hacer. */
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={alCerrar}>
      <div
        className="max-h-[92%] overflow-y-auto rounded-t-3xl bg-white pb-[calc(1rem+var(--safe-b))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <p className="text-[15px] font-extrabold">Anuncio</p>
          <button onClick={alCerrar} className="rounded-lg p-1.5 text-slate-400 active:bg-slate-100" aria-label="Cerrar">
            <IconoCerrar className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          {fotos.length > 0 && (
            <div className="sin-barra flex gap-2 overflow-x-auto">
              {fotos.map((f, i) => (
                <img key={i} src={f} alt="" className="h-32 w-24 shrink-0 rounded-xl object-cover" />
              ))}
            </div>
          )}

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={9}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-[15px] leading-relaxed outline-none focus:border-magenta"
          />

          <p className="text-[11px] text-slate-400">
            Puedes cambiar el texto aquí antes de copiarlo. No se guarda: la ficha no se toca.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copiar}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-[15px] font-bold text-slate-700 active:bg-slate-50"
            >
              <IconoCopiar className="h-4 w-4" /> Copiar
            </button>
            <button
              onClick={compartir}
              className="flex items-center justify-center gap-2 rounded-xl bg-magenta py-3.5 text-[15px] font-bold text-white active:bg-[#d80069]"
            >
              <IconoCompartir className="h-4 w-4" /> Compartir
            </button>
          </div>

          {aviso && <p className="text-center text-[12px] font-semibold text-emerald-600">{aviso}</p>}

          <Boton variante="suave" onClick={alCerrar}>
            Cerrar
          </Boton>
        </div>
      </div>
    </div>
  )
}
