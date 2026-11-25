import { useQuery } from '@tanstack/react-query'
import { obtenerSemana, recuperarCacheComedor } from './comedor.api'
import { filasAMenus, semanaAMostrar, semanaDelCiclo } from './menu.service'
import type { MenuDia } from './menu.types'

/**
 * Trae de la hoja de cálculo la semana que toca mostrar y la devuelve ya
 * convertida a menús con fecha real. Hidrata instantáneamente desde caché local offline.
 */
export function useMenuSemanal(hoy: Date) {
  const dias = semanaAMostrar(hoy)
  const lunes = dias[0]!
  const numeroDeSemana = semanaDelCiclo(lunes)
  const enCache = recuperarCacheComedor(numeroDeSemana) ?? undefined

  const consulta = useQuery({
    queryKey: ['comedor', 'semana', numeroDeSemana],
    queryFn: ({ signal }) => obtenerSemana(numeroDeSemana, signal),
    initialData: enCache,
    initialDataUpdatedAt: enCache ? 0 : undefined,
    staleTime: 1000 * 60 * 30, // media hora: el menú de la semana no cambia sola
    gcTime: 1000 * 60 * 60 * 24 * 14,
    // Un solo reintento. Con dos, y una hoja que tarda tres segundos por
    // intento, el estudiante se queda casi veinte segundos viendo el esqueleto
    // antes de enterarse de que falló; y para eso está el botón de reintentar.
    retry: 1,
    retryDelay: 1500,
  })

  const menus: MenuDia[] = consulta.data ? filasAMenus(consulta.data, lunes) : []

  return {
    dias,
    menus,
    numeroDeSemana,
    cargando: consulta.isPending,
    recargando: consulta.isFetching && !consulta.isPending,
    error: consulta.error,
    reintentar: consulta.refetch,
  }
}
