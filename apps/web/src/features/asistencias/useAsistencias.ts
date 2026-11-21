import { useQuery } from '@tanstack/react-query'
import type { PeriodoAsistencia } from './asistencias.types'
import { obtenerAsistenciasEstudiante, calcularResumenAsistencias } from './asistencias.service'

export function useAsistencias(estudianteId?: string, periodo: PeriodoAsistencia = 'I Periodo') {
  const query = useQuery({
    queryKey: ['estudiante-asistencias', estudianteId, periodo],
    queryFn: () => obtenerAsistenciasEstudiante(estudianteId || '', periodo),
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: true,
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
