import type { ComponentType, SVGProps } from 'react'
import { IconoAgenda, IconoCalendario, IconoCarnet, IconoComedor, IconoInicio } from '@/components/icons'

export type NavItem = {
  to: string
  label: string
  Icono: ComponentType<SVGProps<SVGSVGElement>>
}

/** Ítems de navegación principal de StudentHUB. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', Icono: IconoInicio },
  { to: '/agenda', label: 'Agenda', Icono: IconoAgenda },
  { to: '/horarios', label: 'Horarios', Icono: IconoCalendario },
  { to: '/comedor', label: 'Comedor', Icono: IconoComedor },
  { to: '/carnet', label: 'Carnet', Icono: IconoCarnet },
]

