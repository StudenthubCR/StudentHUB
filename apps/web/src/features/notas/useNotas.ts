import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PeriodoNota } from './notas.types'
import { obtenerNotasEstudiante, calcularResumenNotas } from './notas.service'

export function useNotas(estudianteId?: string, periodo: PeriodoNota = 'I Periodo') {
  const queryClient = useQueryClient()
  const esDemo =
    typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true'

  useEffect(() => {
    if (typeof window === 'undefined') return
    const recargar = () => {
      void queryClient.invalidateQueries({ queryKey: ['estudiante-notas'] })
    }
    window.addEventListener('studenthub:notas-actualizadas', recargar)
    window.addEventListener('storage', recargar)
    return () => {
      window.removeEventListener('studenthub:notas-actualizadas', recargar)
      window.removeEventListener('storage', recargar)
    }
  }, [queryClient])

  const query = useQuery({
    queryKey: ['estudiante-notas', estudianteId, periodo],
    queryFn: () => obtenerNotasEstudiante(estudianteId || '', periodo),
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: Boolean(estudianteId) || esDemo,
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
