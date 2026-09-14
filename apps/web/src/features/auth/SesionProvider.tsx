import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { SesionContext } from './sesion-context'

export const SESION_DEMO: Session = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    app_metadata: {},
    user_metadata: { nombre: 'Erick García Burgos' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'estudiante.demo@mep.go.cr',
  },
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true') {
      return SESION_DEMO
    }
    return null
  })
  const [cargando, setCargando] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    let vigente = true

    if (localStorage.getItem('studenthub_demo_sesion') === 'true') {
      setSesion(SESION_DEMO)
      setCargando(false)
      return
    }

    // La sesión vive en localStorage, así que al abrir la PWA hay que leerla
    // antes de decidir si mostrar la app o el login.
    supabase.auth.getSession().then(({ data }) => {
      if (!vigente) return
      setSesion(data.session)
      setCargando(false)
    })

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      if (localStorage.getItem('studenthub_demo_sesion') === 'true') return
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
    localStorage.removeItem('studenthub_demo_sesion')
    await supabase.auth.signOut()
    setSesion(null)
    queryClient.clear()
  }, [queryClient])

  const valor = useMemo(
    () => ({ cargando, sesion, cerrarSesion }),
    [cargando, sesion, cerrarSesion],
  )

  return <SesionContext value={valor}>{children}</SesionContext>
}

