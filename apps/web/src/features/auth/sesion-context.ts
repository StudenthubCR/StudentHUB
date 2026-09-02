import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type EstadoSesion = {
  /** Mientras Supabase lee la sesión guardada. Evita el parpadeo de "fuera". */
  cargando: boolean
  sesion: Session | null
  cerrarSesion: () => Promise<void>
}

export const SesionContext = createContext<EstadoSesion | null>(null)
