import { useQuery } from '@tanstack/react-query'
import type { PeriodoNota } from './notas.types'
import { obtenerNotasEstudiante, calcularResumenNotas } from './notas.service'

export function useNotas(estudianteId?: string, periodo: PeriodoNota = 'I Periodo') {
  const query = useQuery({
    queryKey: ['estudiante-notas', estudianteId, periodo],
    queryFn: () => obtenerNotasEstudiante(estudianteId || '', periodo),
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: true,
  })

  const notas = query.data ?? []
  const resumen = calcularResumenNotas(notas)

  return {
    notas,
    resumen,
    cargando: query.isLoading,
    error: query.error,
    refrescar: query.refetch,
  }
}
