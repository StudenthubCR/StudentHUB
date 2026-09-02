import { useQuery } from '@tanstack/react-query'
import { agruparPorDia, aClases, contarLecciones } from './horario.service'
import { obtenerHorario } from './horarios.api'

/**
 * Trae el horario de un grupo desde la hoja y lo devuelve ya agrupado por día.
 * El horario cambia una o dos veces al año, así que se cachea con generosidad.
 */
export function useHorario(grupo: string | null, hoy: Date) {
  const consulta = useQuery({
    queryKey: ['horarios', 'grupo', grupo],
    queryFn: ({ signal }) => obtenerHorario(grupo!, signal),
    enabled: grupo !== null,
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    retryDelay: 1500,
  })

  const clases = consulta.data ? aClases(consulta.data) : []

  return {
    dias: agruparPorDia(clases, hoy),
    lecciones: contarLecciones(clases),
    cargando: consulta.isPending && grupo !== null,
    error: consulta.error,
    reintentar: consulta.refetch,
  }
}
