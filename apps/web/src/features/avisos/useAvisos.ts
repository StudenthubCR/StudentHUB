import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import {
  CORREO_ADMIN_UNICO,
  crearAviso,
  descartarAvisoLocal,
  eliminarAviso,
  esUsuarioAdmin,
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

  // REGLA DE SEGURIDAD ABSOLUTA:
  // Ningún estudiante (incluyendo erickgarciab2134@gmail.com o cualquier correo @mep.go.cr) puede publicar ni administrar avisos.
  // ÚNICAMENTE el correo oficial studenthub.cr@gmail.com tiene permisos de administración.
  const emailActual = (sesion?.user?.email ?? '').trim().toLowerCase()
  const esAdmin = esUsuarioAdmin(emailActual)

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
        throw new Error('Operación denegada: Ningún estudiante tiene permisos para publicar comunicados.')
      }
      const res = await crearAviso(payload, CORREO_ADMIN_UNICO)
      if (res.ok && res.aviso) {
        setAvisos((prev) => [res.aviso!, ...prev])
      }
      return res
    },
    [esAdmin],
  )

  const borrarAviso = useCallback(
    async (id: string) => {
      if (!esAdmin) {
        throw new Error('Operación denegada: Ningún estudiante tiene permisos para eliminar comunicados.')
      }
      const ok = await eliminarAviso(id, CORREO_ADMIN_UNICO)
      if (ok) {
        setAvisos((prev) => prev.filter((a) => a.id !== id))
      }
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
