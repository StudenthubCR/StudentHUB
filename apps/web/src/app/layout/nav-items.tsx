import type { ComponentType, SVGProps } from 'react'
import { IconoCalendario, IconoCarnet, IconoComedor, IconoInicio } from '@/components/icons'

export type NavItem = {
  to: string
  label: string
  Icono: ComponentType<SVGProps<SVGSVGElement>>
}

/** Los mismos cuatro iconos de la app actual, sin cambios de trazo. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', Icono: IconoInicio },
  { to: '/carnet', label: 'Carnet', Icono: IconoCarnet },
  { to: '/horarios', label: 'Horarios', Icono: IconoCalendario },
  { to: '/comedor', label: 'Comedor', Icono: IconoComedor },
]
