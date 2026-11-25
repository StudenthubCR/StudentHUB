import { useQuery } from '@tanstack/react-query'
import { agruparPorDia, aClases, contarLecciones } from './horario.service'
import { obtenerHorario, recuperarCacheHorario } from './horarios.api'

/**
 * Trae el horario de un grupo desde la hoja y lo devuelve ya agrupado por día.
 * Hidrata al instante desde caché local cuando el usuario abre la app sin conexión.
 */
export function useHorario(grupo: string | null, hoy: Date) {
  const enCache = grupo ? recuperarCacheHorario(grupo) ?? undefined : undefined

  const consulta = useQuery({
    queryKey: ['horarios', 'grupo', grupo],
    queryFn: ({ signal }) => obtenerHorario(grupo!, signal),
    enabled: grupo !== null,
    initialData: enCache,
    initialDataUpdatedAt: enCache ? 0 : undefined,
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24 * 14,
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
