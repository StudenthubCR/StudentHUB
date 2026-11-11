import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function BaseIcon({ children, className = '', strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {children}
    </svg>
  )
}

/** Avatar del bot asistente inteligente */
export function IconoAsistenteBot(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="11" width="18" height="10" rx="4" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth={2.5} />
      <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth={2.5} />
      <path d="M9 19h6" />
    </BaseIcon>
  )
}

/** Avatar del estudiante/usuario */
export function IconoUsuarioChat(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </BaseIcon>
  )
}

/** Ícono para categoría de Comedor */
export function IconoComedorChip(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 2v8a3 3 0 0 1-3 3h-1" />
      <path d="M18 13v9" />
      <path d="M6 2v6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2" />
      <path d="M9 11v11" />
    </BaseIcon>
  )
}

/** Ícono para categoría de Horarios */
export function IconoHorarioChip(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </BaseIcon>
  )
}

/** Ícono para categoría de Eventos y Noticias */
export function IconoEventosChip(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </BaseIcon>
  )
}

/** Ícono para categoría de Agenda y Tareas */
export function IconoAgendaChip(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </BaseIcon>
  )
}

/** Ícono para categoría de Carnet Digital */
export function IconoCarnetChip(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <path d="M7 15h4" />
      <circle cx="9" cy="10" r="2" />
      <line x1="15" y1="9" x2="17" y2="9" />
      <line x1="15" y1="13" x2="17" y2="13" />
    </BaseIcon>
  )
}

/** Botón flotante para desplazar al fondo del chat */
export function IconoBajarFinal(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </BaseIcon>
  )
}

/** Botón para limpiar/reiniciar la conversación */
export function IconoLimpiarChat(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </BaseIcon>
  )
}

/** Botón para reintentar mensaje */
export function IconoReintentarChat(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </BaseIcon>
  )
}

/** Indicador de alerta o error en chat */
export function IconoErrorAlerta(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </BaseIcon>
  )
}

/** Ícono de ayuda / orientación */
export function IconoAyudaChat(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </BaseIcon>
  )
}

