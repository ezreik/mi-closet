import type { ReactNode } from 'react'

export function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string
  ayuda?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{etiqueta}</span>
      {children}
      {ayuda && <span className="mt-1 block text-[11px] leading-snug text-slate-400">{ayuda}</span>}
    </label>
  )
}

const baseEntrada =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] outline-none transition ' +
  'focus:border-magenta focus:ring-2 focus:ring-magenta/20 placeholder:text-slate-300'

export function Entrada(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseEntrada} ${props.className ?? ''}`} />
}

export function AreaTexto(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${baseEntrada} resize-none ${props.className ?? ''}`} />
}

export function Selector(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${baseEntrada} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"><path fill="%2394a3b8" d="M1 1l5 5 5-5"/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-9 ${props.className ?? ''}`}
    />
  )
}

/** Campo de dinero: teclado numérico en el móvil y el símbolo siempre a la vista. */
export function Dinero({
  valor,
  alCambiar,
  simbolo,
  ...props
}: {
  valor: number
  alCambiar: (n: number) => void
  simbolo: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-slate-400">
        {simbolo}
      </span>
      <input
        {...props}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        value={Number.isFinite(valor) && valor !== 0 ? valor : valor === 0 ? '' : ''}
        placeholder="0"
        onChange={(e) => alCambiar(e.target.value === '' ? 0 : Number(e.target.value))}
        className={`${baseEntrada} pl-9`}
      />
    </div>
  )
}

export function Boton({
  variante = 'principal',
  children,
  ...props
}: { variante?: 'principal' | 'suave' | 'peligro' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const estilos = {
    principal: 'bg-magenta text-white active:bg-[#d80069] disabled:bg-slate-200 disabled:text-slate-400',
    suave: 'bg-white text-slate-700 border border-slate-200 active:bg-slate-50',
    peligro: 'bg-white text-rose-600 border border-rose-200 active:bg-rose-50',
  }[variante]
  return (
    <button
      {...props}
      className={`w-full rounded-xl px-4 py-3.5 text-[15px] font-bold transition ${estilos} ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  )
}

export function Vacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="px-8 py-16 text-center">
      <p className="text-base font-bold text-slate-700">{titulo}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{texto}</p>
    </div>
  )
}
