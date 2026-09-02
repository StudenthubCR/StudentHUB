import { useQuery } from '@tanstack/react-query'
import { obtenerSemana } from './comedor.api'
import { filasAMenus, semanaAMostrar, semanaDelCiclo } from './menu.service'
import type { MenuDia } from './menu.types'

/**
 * Trae de la hoja de cálculo la semana que toca mostrar y la devuelve ya
 * convertida a menús con fecha real.
 *
 * La hoja tarda unos tres segundos en responder, así que la caché no es un
 * lujo: `staleTime` evita volver a pedirla al entrar y salir de la sección, y
 * el service worker guarda la última respuesta buena para el modo sin red.
 */
export function useMenuSemanal(hoy: Date) {
  const dias = semanaAMostrar(hoy)
  const lunes = dias[0]!
  const numeroDeSemana = semanaDelCiclo(lunes)

  const consulta = useQuery({
    queryKey: ['comedor', 'semana', numeroDeSemana],
    queryFn: ({ signal }) => obtenerSemana(numeroDeSemana, signal),
    staleTime: 1000 * 60 * 30, // media hora: el menú de la semana no cambia sola
    gcTime: 1000 * 60 * 60 * 24,
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
