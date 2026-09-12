import type { SVGProps } from 'react'

/**
 * Los iconos de la app y la landing page con micro-animaciones en hover
 * inspiradas en Its Hover (https://www.itshover.com/icons).
 *
 * Mismo trazo que los originales: cuadrícula de 24, trazo de 2 y puntas
 * redondeadas, pero ahora con elementos reactivos que cobran vida
 * de forma fluida con CSS transforms de alto rendimiento.
 *
 * Reaccionan tanto al pasar el cursor sobre el ícono como sobre su botón/enlace
 * contenedor (`group-hover:*`).
 */
type Props = SVGProps<SVGSVGElement>

function Base({ children, className = '', ...props }: Props) {
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
      className={`overflow-visible shrink-0 transition-transform duration-300 ease-out ${className}`}
      {...props}
    >
      {children}
    </svg>
  )
}

/** Inicio / Home: el techo se eleva suavemente y la puerta se ajusta */
export function IconoInicio(props: Props) {
  return (
    <Base {...props}>
      <path
        d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 hover:-translate-y-0.5"
      />
      <polyline
        points="9 22 9 12 15 12 15 22"
        className="origin-bottom transition-transform duration-300 ease-out group-hover:scale-y-110 hover:scale-y-110"
      />
    </Base>
  )
}

/** Carnet: la tarjeta se inclina y el avatar se destaca */
export function IconoCarnet(props: Props) {
  return (
    <Base {...props}>
      <rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="2"
        className="origin-center transition-transform duration-300 ease-out group-hover:rotate-3 hover:rotate-3"
      />
      <g className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 hover:-translate-y-0.5">
        <circle cx="12" cy="11" r="3" className="transition-transform duration-200 group-hover:scale-110 hover:scale-110 origin-center" />
        <path d="M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      </g>
    </Base>
  )
}

/** Calendario: las clavijas superiores rebotan */
export function IconoCalendario(props: Props) {
  return (
    <Base {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line
        x1="16"
        x2="16"
        y1="2"
        y2="6"
        className="transition-transform duration-300 ease-out group-hover:-translate-y-1 hover:-translate-y-1"
      />
      <line
        x1="8"
        x2="8"
        y1="2"
        y2="6"
        className="transition-transform duration-300 ease-out group-hover:-translate-y-1 hover:-translate-y-1"
      />
      <line
        x1="3"
        x2="21"
        y1="10"
        y2="10"
        className="origin-center transition-transform duration-300 group-hover:scale-x-105 hover:scale-x-105"
      />
    </Base>
  )
}

/** Comedor: tenedor y cuchillo chocan en un sutil brindis */
export function IconoComedor(props: Props) {
  return (
    <Base {...props}>
      {/* Tenedor */}
      <g className="origin-bottom transition-transform duration-300 ease-out group-hover:-rotate-12 hover:-rotate-12">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
      </g>
      {/* Cuchillo */}
      <g className="origin-bottom transition-transform duration-300 ease-out group-hover:rotate-12 hover:rotate-12">
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </g>
    </Base>
  )
}

/** Sol: los rayos giran 45 grados y el centro crece */
export function IconoSol(props: Props) {
  return (
    <Base {...props}>
      <circle
        cx="12"
        cy="12"
        r="4"
        className="origin-center transition-transform duration-300 ease-out group-hover:scale-115 hover:scale-115"
      />
      <g className="origin-center transition-transform duration-500 ease-out group-hover:rotate-45 hover:rotate-45">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </g>
    </Base>
  )
}

/** Luna: se inclina y aumenta levemente su tamaño */
export function IconoLuna(props: Props) {
  return (
    <Base {...props}>
      <path
        d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
        className="origin-center transition-transform duration-400 ease-out group-hover:-rotate-15 group-hover:scale-110 hover:-rotate-15 hover:scale-110"
      />
    </Base>
  )
}

/** Sin servicio: la barra gira 90 grados */
export function IconoSinServicio(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <path
        d="m4.9 4.9 14.2 14.2"
        className="origin-center transition-transform duration-500 ease-out group-hover:rotate-90 hover:rotate-90"
      />
    </Base>
  )
}

/** Reloj: las manecillas giran suavemente */
export function IconoReloj(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline
        points="12 6 12 12 16 14"
        className="origin-[12px_12px] transition-transform duration-500 ease-out group-hover:rotate-90 hover:rotate-90"
      />
    </Base>
  )
}

/** Imprimir: la hoja de papel emerge de la impresora */
export function IconoImprimir(props: Props) {
  return (
    <Base {...props}>
      <path
        d="M6 9V2h12v7"
        className="transition-transform duration-300 ease-out group-hover:-translate-y-1 hover:-translate-y-1"
      />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect
        width="12"
        height="8"
        x="6"
        y="14"
        className="transition-transform duration-300 ease-out group-hover:translate-y-0.5 hover:translate-y-0.5"
      />
    </Base>
  )
}

/** Código QR: los 3 marcadores de esquina pulsan y la matriz reacciona */
export function IconoCodigoQR(props: Props) {
  return (
    <Base strokeWidth={1.8} {...props}>
      <rect
        width="5"
        height="5"
        x="3"
        y="3"
        rx="1"
        className="origin-[5.5px_5.5px] transition-transform duration-300 ease-out group-hover:scale-115 hover:scale-115"
      />
      <rect
        width="5"
        height="5"
        x="16"
        y="3"
        rx="1"
        className="origin-[18.5px_5.5px] transition-transform duration-300 ease-out group-hover:scale-115 hover:scale-115"
      />
      <rect
        width="5"
        height="5"
        x="3"
        y="16"
        rx="1"
        className="origin-[5.5px_18.5px] transition-transform duration-300 ease-out group-hover:scale-115 hover:scale-115"
      />
      <path
        d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1"
        className="transition-opacity duration-300 group-hover:opacity-70 hover:opacity-70"
      />
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

const DESPLAZAMIENTOS: Record<Direccion, string> = {
  arriba: 'group-hover:-translate-y-1 hover:-translate-y-1',
  abajo: 'group-hover:translate-y-1 hover:translate-y-1',
  izquierda: 'group-hover:-translate-x-1 hover:-translate-x-1',
  derecha: 'group-hover:translate-x-1 hover:translate-x-1',
}

export function IconoChevron({ hacia = 'abajo', ...props }: Props & { hacia?: Direccion }) {
  return (
    <Base {...props}>
      <path
        d={CHEVRONES[hacia]}
        className={`transition-transform duration-200 ease-out ${DESPLAZAMIENTOS[hacia]}`}
      />
    </Base>
  )
}

/** Flecha derecha: la punta avanza y estira */
export function IconoFlechaDerecha(props: Props) {
  return (
    <Base {...props}>
      <path
        d="M5 12h14"
        className="transition-all duration-200 group-hover:stroke-[2.4] hover:stroke-[2.4]"
      />
      <path
        d="m12 5 7 7-7 7"
        className="origin-center transition-transform duration-200 ease-out group-hover:translate-x-1.5 hover:translate-x-1.5"
      />
    </Base>
  )
}

/** Salir: la flecha se desplaza hacia afuera de la puerta */
export function IconoSalir(props: Props) {
  return (
    <Base {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <g className="transition-transform duration-200 ease-out group-hover:translate-x-1.5 hover:translate-x-1.5">
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </g>
    </Base>
  )
}

/** Correo: la solapa se estira */
export function IconoCorreo(props: Props) {
  return (
    <Base {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path
        d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
        className="origin-top transition-transform duration-200 ease-out group-hover:-translate-y-0.5 hover:-translate-y-0.5"
      />
    </Base>
  )
}

/** Candado: la aldaba se abre elevándose hacia arriba */
export function IconoCandado(props: Props) {
  return (
    <Base {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        className="transition-transform duration-300 ease-out group-hover:-translate-y-1.5 hover:-translate-y-1.5"
      />
    </Base>
  )
}

/** Escudo: late con un sutil pulso protector */
export function IconoEscudo(props: Props) {
  return (
    <Base {...props}>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        className="origin-center transition-transform duration-300 ease-out group-hover:scale-110 hover:scale-110"
      />
    </Base>
  )
}

/** Engranaje: gira 90 grados suavemente */
export function IconoEngranaje(props: Props) {
  return (
    <Base
      {...props}
      className={`origin-center transition-transform duration-500 ease-out group-hover:rotate-90 hover:rotate-90 ${props.className || ''}`}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Base>
  )
}

/** Cerrar: gira 90 grados y se escala */
export function IconoCerrar(props: Props) {
  return (
    <Base
      {...props}
      className={`origin-center transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110 hover:rotate-90 hover:scale-110 ${props.className || ''}`}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Base>
  )
}

/** Descargar: la flecha se desliza hacia la bandeja con un sutil rebote */
export function IconoDescargar(props: Props) {
  return (
    <Base {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <g className="transition-transform duration-300 ease-out group-hover:translate-y-1.5 hover:translate-y-1.5">
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </g>
    </Base>
  )
}

/** Compartir: la flecha se eleva */
export function IconoCompartir(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <g className="transition-transform duration-300 ease-out group-hover:-translate-y-1.5 hover:-translate-y-1.5">
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </g>
    </Base>
  )
}

/** Dispositivo móvil: se balancea sutilmente */
export function IconoDispositivo(props: Props) {
  return (
    <Base {...props}>
      <rect
        width="14"
        height="20"
        x="5"
        y="2"
        rx="2"
        ry="2"
        className="origin-center transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105 hover:-rotate-6 hover:scale-105"
      />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </Base>
  )
}

/** Campana: oscila como un péndulo al pasar el cursor */
export function IconoCampana(props: Props) {
  return (
    <Base {...props}>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        className="origin-top transition-transform duration-300 ease-out group-hover:rotate-12 hover:rotate-12"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        className="transition-transform duration-300 ease-out group-hover:-translate-x-0.5 hover:-translate-x-0.5"
      />
    </Base>
  )
}
