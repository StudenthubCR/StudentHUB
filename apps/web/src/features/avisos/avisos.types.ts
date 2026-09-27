/**
 * Tipos y definiciones para el sistema de Avisos Rápidos y Comunicados Oficiales
 */

export type CategoriaAviso =
  | 'absence'
  | 'menu_change'
  | 'event'
  | 'early_departure'
  | 'general'

export type PrioridadAviso = 'info' | 'warning' | 'urgent'

export type TipoAlcance = 'all' | 'specialty' | 'section'

export type InstitutionAlert = {
  id: string
  title: string
  message: string
  category: CategoriaAviso
  priority: PrioridadAviso
  target_type: TipoAlcance
  target_values: string[]
  created_by: string
  created_at: string
  expires_at: string | null
  active: boolean
}

export type NuevoAvisoPayload = {
  title: string
  message: string
  category: CategoriaAviso
  priority: PrioridadAviso
  target_type: TipoAlcance
  target_values: string[]
  expires_at?: string | null
}
