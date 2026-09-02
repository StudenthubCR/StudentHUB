import type { SVGProps } from 'react'

/**
 * Los iconos de la app, en un solo lugar.
 *
 * Mismo trazo que los que ya venían dibujados en `index.html` de la app
 * actual: cuadrícula de 24, sin relleno, trazo de 2 y puntas redondeadas. Se
 * escriben a mano en vez de traer una librería para no arriesgar que una
 * versión nueva cambie el dibujo del ícono de inicio y la barra deje de verse
 * igual que hoy.
 *
 * El tamaño se controla con clases (`size-5`), no con props.
 */
type Props = SVGProps<SVGSVGElement>

function Base({ children, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconoInicio(props: Props) {
  return (
    <Base {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Base>
  )
}

export function IconoCarnet(props: Props) {
  return (
    <Base {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      <circle cx="12" cy="11" r="3" />
    </Base>
  )
}

export function IconoCalendario(props: Props) {
  return (
    <Base {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </Base>
  )
}

export function IconoComedor(props: Props) {
  return (
    <Base {...props}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </Base>
  )
}

export function IconoSol(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </Base>
  )
}

export function IconoLuna(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Base>
  )
}

/** Sin servicio: el círculo tachado. */
export function IconoSinServicio(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m4.9 4.9 14.2 14.2" />
    </Base>
  )
}

export function IconoReloj(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Base>
  )
}

export function IconoImprimir(props: Props) {
  return (
    <Base {...props}>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </Base>
  )
}

export function IconoCodigoQR(props: Props) {
  return (
    <Base strokeWidth={1.8} {...props}>
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1" />
    </Base>
  )
}

type Direccion = 'arriba' | 'abajo' | 'izquierda' | 'derecha'

const CHEVRONES: Record<Direccion, string> = {
  arriba: 'm18 15-6-6-6 6',
  abajo: 'm6 9 6 6 6-6',
  izquierda: 'm15 18-6-6 6-6',
  derecha: 'm9 18 6-6-6-6',
}

export function IconoChevron({ hacia = 'abajo', ...props }: Props & { hacia?: Direccion }) {
  return (
    <Base {...props}>
      <path d={CHEVRONES[hacia]} />
    </Base>
  )
}

export function IconoFlechaDerecha(props: Props) {
  return (
    <Base {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Base>
  )
}
