type Props = { className?: string }

const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const IconoPercha = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <path d="M12 9V7.5a2 2 0 1 1 2-2" />
    <path d="M12 9 3.5 15.2a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8L12 9Z" />
  </svg>
)

export const IconoGrafica = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const IconoAjustes = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 7 2.6h.1A1.7 1.7 0 0 0 8.3 1V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1.2Z" />
  </svg>
)

export const IconoMas = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconoAtras = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <path d="M15 19l-7-7 7-7" />
  </svg>
)

export const IconoCamara = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2a1 1 0 0 0 .8-.4l1-1.3a1 1 0 0 1 .8-.4h5.4a1 1 0 0 1 .8.4l1 1.3a1 1 0 0 0 .8.4h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9Z" />
    <circle cx="12" cy="13" r="3.4" />
  </svg>
)

export const IconoBuscar = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const IconoCopiar = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
)

export const IconoCompartir = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <path d="M12 3v13M12 3 8 7M12 3l4 4" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
)

export const IconoBasura = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

export const IconoCerrar = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" className={className} {...trazo} strokeWidth={2.2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
