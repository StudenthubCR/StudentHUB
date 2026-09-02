import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { SesionContext } from './sesion-context'

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    let vigente = true

    // La sesión vive en localStorage, así que al abrir la PWA hay que leerla
    // antes de decidir si mostrar la app o el login.
    supabase.auth.getSession().then(({ data }) => {
      if (!vigente) return
      setSesion(data.session)
      setCargando(false)
    })

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva)
      setCargando(false)
      // La ficha del estudiante depende de quién esté dentro: al cambiar de
      // sesión hay que soltar lo que quedó cacheado del anterior.
      queryClient.invalidateQueries({ queryKey: ['estudiante'] })
    })

    return () => {
      vigente = false
      suscripcion.subscription.unsubscribe()
    }
  }, [queryClient])

  const cerrarSesion = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }, [queryClient])

  const valor = useMemo(
    () => ({ cargando, sesion, cerrarSesion }),
    [cargando, sesion, cerrarSesion],
  )

  return <SesionContext value={valor}>{children}</SesionContext>
}
