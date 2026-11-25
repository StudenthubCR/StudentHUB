import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { DocenteProfile } from '@/features/docente/docente.types'
import type { RolSistema } from './auth.service'

export type EstadoSesion = {
  /** Mientras Supabase lee la sesión guardada. Evita el parpadeo de "fuera". */
  cargando: boolean
  sesion: Session | null
  rol: RolSistema
  cargandoRol: boolean
  docente: DocenteProfile | null
  cerrarSesion: () => Promise<void>
  establecerSesion?: (nueva: Session | null) => void
}

export const SesionContext = createContext<EstadoSesion | null>(null)
