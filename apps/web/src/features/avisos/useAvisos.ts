import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import {
  crearAviso,
  descartarAvisoLocal,
  eliminarAviso,
  filtrarAvisosParaEstudiante,
  obtenerAvisos,
  obtenerAvisosDescartados,
} from './avisos.service'
import type { InstitutionAlert, NuevoAvisoPayload } from './avisos.types'

export function useAvisos() {
  const { sesion } = useSesion()
  const { estudiante } = useEstudiante()

  const [avisos, setAvisos] = useState<InstitutionAlert[]>([])
  const [descartados, setDescartados] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)

  // Verificación estricta de Administrador:
  // ÚNICAMENTE el correo de administración: studenthub.cr@gmail.com
  // Los estudiantes regulares (incluyendo erickgarciab2134@gmail.com y @mep.go.cr) son solo estudiantes.
  const esAdmin = useMemo(() => {
    if (!sesion?.user) return false

    const email = (sesion.user.email ?? '').trim().toLowerCase()
    
    // Si es la cuenta del estudiante Erick García, NUNCA es admin
    if (email === 'erickgarciab2134@gmail.com') {
      return false
    }

    // Único correo con privilegio de administrador
    if (email === 'studenthub.cr@gmail.com') {
      return true
    }

    const rolApp = (sesion.user.app_metadata?.role as string | undefined)?.toLowerCase()
    return rolApp === 'admin'
  }, [sesion])

  const refrescar = useCallback(async () => {
    setCargando(true)
    try {
      const datos = await obtenerAvisos()
      setAvisos(datos)
      setDescartados(obtenerAvisosDescartados())
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void refrescar()

    const alActualizar = () => {
      void refrescar()
    }

    window.addEventListener('studenthub:avisos-actualizados', alActualizar)
    window.addEventListener('storage', alActualizar)

    return () => {
      window.removeEventListener('studenthub:avisos-actualizados', alActualizar)
      window.removeEventListener('storage', alActualizar)
    }
  }, [refrescar])

  // Filtrado de avisos según si es Administrador o Estudiante
  const avisosFiltrados = useMemo(() => {
    return filtrarAvisosParaEstudiante(avisos, estudiante, descartados, esAdmin)
  }, [avisos, estudiante, descartados, esAdmin])

  const descartarAviso = useCallback((id: string) => {
    descartarAvisoLocal(id)
    setDescartados((prev) => [...prev, id])
  }, [])

  const publicarAviso = useCallback(
    async (payload: NuevoAvisoPayload) => {
      if (!esAdmin) {
        throw new Error('Operación no autorizada: solo administradores pueden publicar avisos.')
      }
      const creador = sesion?.user?.email || 'studenthub.cr@gmail.com'
      const res = await crearAviso(payload, creador)
      if (res.ok) {
        setAvisos((prev) => [res.aviso, ...prev])
      }
      return res
    },
    [sesion, esAdmin],
  )

  const borrarAviso = useCallback(
    async (id: string) => {
      if (!esAdmin) {
        throw new Error('Operación no autorizada: solo administradores pueden eliminar avisos.')
      }
      await eliminarAviso(id)
      setAvisos((prev) => prev.filter((a) => a.id !== id))
    },
    [esAdmin],
  )

  return {
    avisos: avisosFiltrados,
    totalAvisosSinFiltrar: avisos.length,
    cargando,
    esAdmin,
    descartarAviso,
    publicarAviso,
    borrarAviso,
    refrescar,
  }
}
