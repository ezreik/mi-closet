import type { ReactNode } from 'react'
import { IconoAtras } from '../iconos'

/**
 * El manual vive dentro de la app a propósito: un PDF suelto se pierde y,
 * sin conexión, cualquier enlace externo deja de servir.
 */
export default function Ayuda({ alSalir }: { alSalir: () => void }) {
  return (
    <div className="min-h-full bg-[#f6f6f7] pb-24">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 bg-white/95 px-2 py-2.5 backdrop-blur">
        <button onClick={alSalir} className="rounded-lg p-2 text-slate-500 active:bg-slate-100" aria-label="Volver">
          <IconoAtras className="h-5 w-5" />
        </button>
        <p className="flex-1 text-[15px] font-extrabold">¿Cómo se usa?</p>
      </header>

      <div className="px-4 pb-2 pt-5">
        <h2 className="degradado-lizy text-[24px] font-extrabold leading-tight">
          Bienvenida a tu clóset, Lizyblue
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
          Esta app lleva la cuenta de cada prenda que compras aquí y vendes allá: qué te costó, en cuánto
          la vendes y —lo importante— cuánto te queda limpio de verdad.
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
          No necesita internet ni contraseña. Todo se guarda en tu teléfono.
        </p>
      </div>

      <div className="space-y-2.5 px-3 pt-3">
        <Paso numero="1" titulo="Instálala en tu teléfono" abierto>
          <p>
            Antes que nada, guárdala en la pantalla de inicio para que se abra como cualquier otra app y
            funcione sin señal.
          </p>
          <p>
            <b>En iPhone:</b> pulsa el botón de Compartir (el cuadrito con la flecha hacia arriba) y luego
            «Añadir a pantalla de inicio».
          </p>
          <p>
            <b>En Android:</b> abre el menú de los tres puntitos y pulsa «Instalar aplicación».
          </p>
          <Nota>
            Esto no es un capricho: instalada, el teléfono no borra tus datos. Sin instalar, con el tiempo
            podría hacerlo.
          </Nota>
        </Paso>

        <Paso numero="2" titulo="Da de alta una prenda">
          <p>
            Pulsa el botón rosa <b>+</b> abajo a la derecha. Cada prenda recibe su código (A-001, A-002…)
            para que sepas cuál es sin abrirla.
          </p>
          <p>
            <b>Fotos:</b> pulsa «Añadir» y saca varias — de frente, de espalda, la etiqueta y cualquier
            detallito o defecto. Se guardan ligeras para no llenarte el teléfono.
          </p>
          <p>
            <b>Medidas:</b> pon la prenda estirada sobre la mesa y mide en centímetros. La app te pide solo
            las que tienen sentido para esa prenda. Luego salen solas en el anuncio y te ahorran la mitad de
            las preguntas de las compradoras.
          </p>
        </Paso>

        <Paso numero="3" titulo="Lo que te costó">
          <p>
            Apunta el <b>precio de compra en euros</b> y, aparte, lo que pagaste de <b>envío o traslado</b>.
            La app suma las dos cosas: ese es el costo real de la prenda, no solo la etiqueta.
          </p>
          <p>
            <b>Tipo de cambio:</b> cuántos pesos vale un euro el día que la compraste. La app lo pone solo,
            pero puedes cambiarlo prenda por prenda. Se queda guardado en cada una, así que aunque el cambio
            se mueva, tus cuentas viejas siguen siendo correctas.
          </p>
        </Paso>

        <Paso numero="4" titulo="A cuánto la vendes">
          <p>
            Verás un recuadro rosa con un <b>precio sugerido</b>. Sale de recuperar varias veces lo que
            pusiste, ya contando lo que se queda la plataforma. Púlsalo y se pone solo, o escribe el tuyo.
          </p>
          <p>
            <b>Dónde la vendes:</b> elige la plataforma. Si cobra comisión, la app la descuenta sola. Si te
            toca pagar el envío a la compradora, ponlo también.
          </p>
          <Nota>
            Los porcentajes de comisión vienen puestos a ojo. Cuando sepas el tuyo de verdad, cámbialo en la
            prenda: la ganancia solo es fiable si ese número es el bueno.
          </Nota>
        </Paso>

        <Paso numero="5" titulo="Mira el recuadro negro">
          <p>
            Es lo que <b>te queda limpio</b>: el precio de venta menos la comisión, menos el envío, menos lo
            que te costó la prenda. Sin sorpresas.
          </p>
          <p>
            Si te sale en rojo, a ese precio estás perdiendo dinero. Súbelo o busca otra plataforma que no
            te cobre comisión.
          </p>
        </Paso>

        <Paso numero="6" titulo="Publica en dos toques">
          <p>
            Abajo de la ficha tienes <b>«Ver anuncio para publicar»</b>. La app te escribe el anuncio con la
            marca, la talla, las medidas y el precio.
          </p>
          <p>
            <b>Copiar</b> lo deja listo para pegar donde quieras. <b>Compartir</b> lo manda con las fotos
            directo a WhatsApp, Marketplace o Instagram.
          </p>
          <p>Puedes retocar el texto antes de mandarlo: no cambia nada de la ficha.</p>
        </Paso>

        <Paso numero="7" titulo="Cuando la vendas">
          <p>
            Abre la prenda y en <b>Estado</b> pulsa «Vendida». Apunta la fecha y quién te la compró. Si
            alguien te la apartó pero aún no paga, ponla en «Apartada».
          </p>
          <p>Con eso la app ya sabe qué tienes por vender y cuánto llevas ganado.</p>
        </Paso>

        <Paso numero="8" titulo="Tus números">
          <p>
            En la pestaña <b>Números</b> ves cuánto llevas invertido, cuánto has cobrado, cuánto te queda
            limpio y cuánto ganarías si vendieras todo lo que tienes guardado.
          </p>
          <p>
            Abajo te dice <b>qué marcas y qué tipo de prenda te dan más dinero</b> y cuánto tardas de media
            en vender. Eso es lo que te va a decir qué comprar en el siguiente viaje.
          </p>
        </Paso>

        <Paso numero="9" titulo="La copia de seguridad" destacado>
          <p>
            Como todo vive en tu teléfono, <b>si lo pierdes o borras la app, se va contigo</b>. No hay dónde
            recuperarlo.
          </p>
          <p>
            En <b>Ajustes → Guardar copia</b> se crea un archivo con todo, fotos incluidas. Mándatelo por
            WhatsApp a ti misma o guárdalo en Drive.
          </p>
          <p>
            <b>Hazlo cada semana o cada vez que subas varias prendas.</b> Si algún día pasa algo, con
            «Restaurar desde una copia» lo recuperas todo.
          </p>
        </Paso>

        <Paso numero="10" titulo="Cosas que te van a servir">
          <p>
            <b>Buscar:</b> escribe una marca, una talla o un color y filtra al momento. Útil cuando una
            clienta te pregunta «¿tienes algo en M?».
          </p>
          <p>
            <b>Viajes:</b> en Ajustes puedes crear un viaje y meter ahí las prendas de esa compra, con los
            gastos del viaje aparte. Así sabes si ese viaje salió rentable.
          </p>
          <p>
            <b>Excel:</b> si algún día quieres las cuentas en una hoja de cálculo, en Ajustes lo exportas.
          </p>
        </Paso>
      </div>

      <p className="px-8 pt-6 text-center text-[12px] leading-relaxed text-slate-400">
        Si algo no hace lo que necesitas o te falta algún dato, díselo a Elías y se cambia.
        <br />
        <span className="degradado-lizy font-extrabold">Mucha suerte con las ventas.</span>
      </p>
    </div>
  )
}

function Paso({
  numero,
  titulo,
  children,
  abierto,
  destacado,
}: {
  numero: string
  titulo: string
  children: ReactNode
  abierto?: boolean
  destacado?: boolean
}) {
  return (
    <details
      open={abierto}
      className={`group overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
        destacado ? 'ring-2 ring-magenta' : ''
      }`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3.5 [&::-webkit-details-marker]:hidden">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold ${
            destacado ? 'bg-magenta text-white' : 'bg-azul-suave text-azul'
          }`}
        >
          {numero}
        </span>
        <span className="flex-1 text-[15px] font-bold leading-tight">{titulo}</span>
        <span className="text-slate-300 transition group-open:rotate-180">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="space-y-2.5 px-3.5 pb-4 pl-[3.4rem] text-[14px] leading-relaxed text-slate-600">
        {children}
      </div>
    </details>
  )
}

function Nota({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-magenta-suave px-3 py-2.5 text-[13px] leading-relaxed text-magenta">
      {children}
    </p>
  )
}
