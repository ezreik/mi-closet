import { useEffect, useState } from 'react'
import Inventario from './pantallas/Inventario'
import Panel from './pantallas/Panel'
import Ajustes from './pantallas/Ajustes'
import Ficha from './pantallas/Ficha'
import Ayuda from './pantallas/Ayuda'
import { IconoAjustes, IconoCerrar, IconoGrafica, IconoMas, IconoPercha } from './iconos'

type Pestaña = 'ropa' | 'numeros' | 'ajustes'

export default function App() {
  const [pestaña, setPestaña] = useState<Pestaña>('ropa')
  const [ficha, setFicha] = useState<number | 'nueva' | null>(null)
  const [ayuda, setAyuda] = useState(false)
  const [avisoVisible, setAvisoVisible] = useState(false)

  // El botón físico de atrás del móvil debe cerrar lo que esté abierto, no salir de la app.
  const enPantallaCompleta = ficha !== null || ayuda
  useEffect(() => {
    if (!enPantallaCompleta) return
    history.pushState({ pantalla: true }, '')
    const cerrar = () => {
      setFicha(null)
      setAyuda(false)
    }
    addEventListener('popstate', cerrar)
    return () => removeEventListener('popstate', cerrar)
  }, [enPantallaCompleta])

  if (ayuda) return <Ayuda alSalir={() => setAyuda(false)} />

  if (ficha !== null) {
    return <Ficha id={ficha} alSalir={() => setFicha(null)} />
  }

  return (
    <div className="min-h-full">
      {pestaña === 'ropa' && <Inventario alAbrir={(id) => setFicha(id)} alAbrirAyuda={() => setAyuda(true)} />}
      {pestaña === 'numeros' && <Panel />}
      {pestaña === 'ajustes' && <Ajustes alAbrirAyuda={() => setAyuda(true)} />}

      <AvisoInstalar visible={avisoVisible} alCambiar={setAvisoVisible} />

      {pestaña === 'ropa' && (
        <button
          onClick={() => setFicha('nueva')}
          style={{ bottom: `calc(${avisoVisible ? '11.5rem' : '5.5rem'} + var(--safe-b))` }}
          className="fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-magenta text-white shadow-lg shadow-magenta/30 transition-[bottom] active:bg-[#d80069]"
          aria-label="Añadir prenda"
        >
          <IconoMas className="h-7 w-7" />
        </button>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 pb-[var(--safe-b)] backdrop-blur">
        <div className="mx-auto flex max-w-lg">
          <Pestaña activa={pestaña === 'ropa'} alPulsar={() => setPestaña('ropa')} etiqueta="Ropa">
            <IconoPercha className="h-[22px] w-[22px]" />
          </Pestaña>
          <Pestaña activa={pestaña === 'numeros'} alPulsar={() => setPestaña('numeros')} etiqueta="Números">
            <IconoGrafica className="h-[22px] w-[22px]" />
          </Pestaña>
          <Pestaña activa={pestaña === 'ajustes'} alPulsar={() => setPestaña('ajustes')} etiqueta="Ajustes">
            <IconoAjustes className="h-[22px] w-[22px]" />
          </Pestaña>
        </div>
      </nav>
    </div>
  )
}

function Pestaña({
  activa,
  alPulsar,
  etiqueta,
  children,
}: {
  activa: boolean
  alPulsar: () => void
  etiqueta: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={alPulsar}
      className={`flex flex-1 flex-col items-center gap-1 py-2.5 transition ${
        activa ? 'text-magenta' : 'text-slate-400'
      }`}
    >
      {children}
      <span className="text-[10px] font-bold">{etiqueta}</span>
    </button>
  )
}

/**
 * En iPhone los datos de una web sin instalar se pueden borrar solos.
 * Instalada en la pantalla de inicio, no. Por eso insistimos una vez.
 */
function AvisoInstalar({ visible, alCambiar }: { visible: boolean; alCambiar: (v: boolean) => void }) {
  useEffect(() => {
    const instalada =
      matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    alCambiar(!instalada && localStorage.getItem('aviso-instalar') !== 'visto')
  }, [alCambiar])

  if (!visible) return null

  const esApple = /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <div className="fixed inset-x-3 bottom-[calc(4.75rem+var(--safe-b))] z-40 rounded-2xl bg-tinta p-3.5 text-white shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-[13px] font-extrabold">Instálala en tu teléfono</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/70">
            {esApple
              ? 'Pulsa Compartir y luego "Añadir a pantalla de inicio". Así funciona sin internet y no se borran tus datos.'
              : 'Abre el menú del navegador y pulsa "Instalar aplicación". Así funciona sin internet y no se borran tus datos.'}
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.setItem('aviso-instalar', 'visto')
            alCambiar(false)
          }}
          className="-mr-1 -mt-1 rounded-lg p-1.5 text-white/50"
          aria-label="Cerrar aviso"
        >
          <IconoCerrar className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
