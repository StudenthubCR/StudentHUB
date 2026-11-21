import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { SesionContext } from './sesion-context'

export const SESION_DEMO_ESTUDIANTE: Session = {
  access_token: 'demo-token-estudiante',
  refresh_token: 'demo-refresh-token-estudiante',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    app_metadata: {},
    user_metadata: { nombre: 'Erick García Burgos', role: 'estudiante' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'estudiante.demo@mep.go.cr',
  },
}

export const SESION_DEMO_ENCARGADO: Session = {
  access_token: 'demo-token-encargado',
  refresh_token: 'demo-refresh-token-encargado',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: '00000000-0000-0000-0000-000000000002',
    app_metadata: {},
    user_metadata: { nombre: 'María Elena Burgos Soto', role: 'encargado' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'encargado.demo@gmail.com',
  },
}

export function obtenerSesionDemo(): Session {
  if (typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_rol') === 'encargado') {
    return SESION_DEMO_ENCARGADO
  }
  return SESION_DEMO_ESTUDIANTE
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true') {
      return obtenerSesionDemo()
    }
    return null
  })
  const [cargando, setCargando] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    let vigente = true

    if (localStorage.getItem('studenthub_demo_sesion') === 'true') {
      setSesion(obtenerSesionDemo())
      setCargando(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!vigente) return
      setSesion(data.session)
      setCargando(false)
    })

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      if (localStorage.getItem('studenthub_demo_sesion') === 'true') return
      setSesion(nueva)
      setCargando(false)
      queryClient.invalidateQueries({ queryKey: ['estudiante'] })
    })

    return () => {
      vigente = false
      suscripcion.subscription.unsubscribe()
    }
  }, [queryClient])

  const cerrarSesion = useCallback(async () => {
    localStorage.removeItem('studenthub_demo_sesion')
    localStorage.removeItem('studenthub_demo_rol')
    localStorage.removeItem('studenthub_estudiante_activo_id')
    await supabase.auth.signOut()
    setSesion(null)
    queryClient.clear()
  }, [queryClient])

  const establecerSesion = useCallback((nueva: Session | null) => {
    setSesion(nueva)
    setCargando(false)
  }, [])

  const valor = useMemo(
    () => ({ cargando, sesion, cerrarSesion, establecerSesion }),
    [cargando, sesion, cerrarSesion, establecerSesion],
  )

  return <SesionContext value={valor}>{children}</SesionContext>
}
