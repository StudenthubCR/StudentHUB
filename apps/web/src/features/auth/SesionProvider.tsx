import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { DOCENTE_DANGELO_DEMO } from '@/features/docente/docente.fixture'
import { obtenerPerfilDocenteActual } from '@/features/docente/docente.service'
import type { DocenteProfile } from '@/features/docente/docente.types'
import type { RolSistema } from './auth.service'
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

export const SESION_DEMO_DOCENTE: Session = {
  access_token: 'demo-token-docente',
  refresh_token: 'demo-refresh-token-docente',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: DOCENTE_DANGELO_DEMO.authUserId ?? '00000000-0000-0000-0000-000000000010',
    app_metadata: {},
    user_metadata: {
      nombre: DOCENTE_DANGELO_DEMO.nombreCompleto,
      role: 'docente',
      especialidad: DOCENTE_DANGELO_DEMO.especialidadAsignada,
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: DOCENTE_DANGELO_DEMO.correoInstitucional,
  },
}

export function obtenerSesionDemo(): Session {
  if (typeof window !== 'undefined') {
    const rolDemo = localStorage.getItem('studenthub_demo_rol')
    if (rolDemo === 'docente') return SESION_DEMO_DOCENTE
    if (rolDemo === 'encargado') return SESION_DEMO_ENCARGADO
  }
  return SESION_DEMO_ESTUDIANTE
}

function esDemoDocente(sesionActual: Session | null): boolean {
  if (typeof window === 'undefined') return false
  if (localStorage.getItem('studenthub_demo_sesion') !== 'true') return false
  return (
    localStorage.getItem('studenthub_demo_rol') === 'docente' ||
    sesionActual?.user?.id === SESION_DEMO_DOCENTE.user.id
  )
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true') {
      return obtenerSesionDemo()
    }
    return null
  })
  const [cargando, setCargando] = useState(true)
  const [rol, setRol] = useState<RolSistema>(() =>
    esDemoDocente(sesion) ? 'docente' : 'estudiante',
  )
  const [docente, setDocente] = useState<DocenteProfile | null>(() =>
    esDemoDocente(sesion) ? DOCENTE_DANGELO_DEMO : null,
  )
  const [cargandoRol, setCargandoRol] = useState<boolean>(() =>
    Boolean(sesion) && !esDemoDocente(sesion),
  )

  const queryClient = useQueryClient()

  useEffect(() => {
    let vigente = true

    if (localStorage.getItem('studenthub_demo_sesion') === 'true') {
      const demo = obtenerSesionDemo()
      setSesion(demo)
      setCargando(false)
      if (esDemoDocente(demo)) {
        setRol('docente')
        setDocente(DOCENTE_DANGELO_DEMO)
      } else {
        setRol('estudiante')
        setDocente(null)
      }
      setCargandoRol(false)
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
      queryClient.invalidateQueries({ queryKey: ['docente'] })
    })

    return () => {
      vigente = false
      suscripcion.subscription.unsubscribe()
    }
  }, [queryClient])

  useEffect(() => {
    let vigente = true

    if (cargando) return

    if (!sesion) {
      setRol('estudiante')
      setDocente(null)
      setCargandoRol(false)
      return
    }

    if (esDemoDocente(sesion)) {
      setRol('docente')
      setDocente(DOCENTE_DANGELO_DEMO)
      setCargandoRol(false)
      return
    }

    if (typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true') {
      setRol('estudiante')
      setDocente(null)
      setCargandoRol(false)
      return
    }

    setCargandoRol(true)
    obtenerPerfilDocenteActual(sesion.user.id, sesion.user.email)
      .then((perfil) => {
        if (!vigente) return
        if (perfil) {
          setRol('docente')
          setDocente(perfil)
        } else {
          setRol('estudiante')
          setDocente(null)
        }
        setCargandoRol(false)
      })
      .catch(() => {
        if (!vigente) return
        setRol('estudiante')
        setDocente(null)
        setCargandoRol(false)
      })

    return () => {
      vigente = false
    }
  }, [sesion, cargando])

  const cerrarSesion = useCallback(async () => {
    localStorage.removeItem('studenthub_demo_sesion')
    localStorage.removeItem('studenthub_demo_rol')
    localStorage.removeItem('studenthub_demo_estudiante_id')
    localStorage.removeItem('studenthub_estudiante_activo_id')
    await supabase.auth.signOut()
    setSesion(null)
    setRol('estudiante')
    setDocente(null)
    setCargandoRol(false)
    queryClient.clear()
  }, [queryClient])

  const establecerSesion = useCallback((nueva: Session | null) => {
    setSesion(nueva)
    setCargando(false)
    if (!nueva) {
      setRol('estudiante')
      setDocente(null)
      setCargandoRol(false)
    }
  }, [])

  const valor = useMemo(
    () => ({ cargando, sesion, rol, cargandoRol, docente, cerrarSesion, establecerSesion }),
    [cargando, sesion, rol, cargandoRol, docente, cerrarSesion, establecerSesion],
  )

  return <SesionContext value={valor}>{children}</SesionContext>
}
