import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PeriodoAsistencia } from './asistencias.types'
import { obtenerAsistenciasEstudiante, calcularResumenAsistencias } from './asistencias.service'

export function useAsistencias(estudianteId?: string, periodo: PeriodoAsistencia = 'I Periodo') {
  const queryClient = useQueryClient()
  const esDemo =
    typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true'

  useEffect(() => {
    if (typeof window === 'undefined') return
    const recargar = () => {
      void queryClient.invalidateQueries({ queryKey: ['estudiante-asistencias'] })
    }
    window.addEventListener('studenthub:asistencias-actualizadas', recargar)
    window.addEventListener('storage', recargar)
    return () => {
      window.removeEventListener('studenthub:asistencias-actualizadas', recargar)
      window.removeEventListener('storage', recargar)
    }
  }, [queryClient])

  const query = useQuery({
    queryKey: ['estudiante-asistencias', estudianteId, periodo],
    queryFn: () => obtenerAsistenciasEstudiante(estudianteId || '', periodo),
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: Boolean(estudianteId) || esDemo,
  })

  const asistencias = query.data ?? []
  const resumen = calcularResumenAsistencias(asistencias)

  return {
    asistencias,
    resumen,
    cargando: query.isLoading,
    error: query.error,
    refrescar: query.refetch,
  }
}
