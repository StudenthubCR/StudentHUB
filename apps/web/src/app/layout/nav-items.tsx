import type { ComponentType, SVGProps } from 'react'
import {
  IconoAgenda,
  IconoCalendario,
  IconoBirrete,
  IconoComedor,
  IconoInicio,
  IconoUsuarios,
  IconoListaAsistencia,
} from '@/components/icons'

export type NavItem = {
  to: string
  label: string
  Icono: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

/** Ítems de navegación principal de StudentHUB (Estudiantes y Encargados). */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', Icono: IconoInicio, end: true },
  { to: '/agenda', label: 'Agenda', Icono: IconoAgenda },
  { to: '/horarios', label: 'Horarios', Icono: IconoCalendario },
  { to: '/comedor', label: 'Comedor', Icono: IconoComedor },
  { to: '/estudiante', label: 'Estudiante', Icono: IconoBirrete },
]

/** Ítems de navegación principal del Modo Docente. */
export const DOCENTE_NAV_ITEMS: NavItem[] = [
  { to: '/docente', label: 'Estudiantes', Icono: IconoUsuarios, end: true },
  { to: '/docente/notas', label: 'Notas', Icono: IconoBirrete },
  { to: '/docente/asistencias', label: 'Asistencias', Icono: IconoListaAsistencia },
  { to: '/docente/agenda', label: 'Agenda', Icono: IconoAgenda },
]
