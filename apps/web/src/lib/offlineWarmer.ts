import type { QueryClient } from '@tanstack/react-query'
import type { RolSistema } from '@/features/auth/auth.service'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import type { DocenteProfile } from '@/features/docente/docente.types'
import { obtenerHorario } from '@/features/horarios/horarios.api'
import { obtenerSemana } from '@/features/comedor/comedor.api'
import { SEMANAS_DEL_CICLO, semanaDelCiclo } from '@/features/comedor/menu.service'
import { obtenerAvisos } from '@/features/avisos/avisos.service'
import { obtenerNotasEstudiante } from '@/features/notas/notas.service'
import { obtenerAsistenciasEstudiante } from '@/features/asistencias/asistencias.service'
import { obtenerEventosDocenteSupabaseParaEstudiante } from '@/features/agenda/agenda.service'
import {
  obtenerAgendaDocente,
  obtenerAsistenciasGrupoDocente,
  obtenerEstudiantesDocente,
  obtenerNotasGrupoDocente,
  obtenerObservacionesDocente,
} from '@/features/docente/docente.service'
import { persistirQueryClientEnCache, registrarSincronizacion, resolverScopeUsuarioActivo } from './offlineCache'

type ParametrosWarming = {
  queryClient: QueryClient
  userId?: string | null
  rol: RolSistema
  estudiante?: Estudiante | null
  docente?: DocenteProfile | null
}

const ejecucionesRecientes = new Set<string>()

function programarEnSegundoPlano(tarea: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    cancelIdleCallback?: (id: number) => void
  }

  if (typeof win.requestIdleCallback === 'function') {
    const id = win.requestIdleCallback(tarea, { timeout: 2000 })
    return () => win.cancelIdleCallback?.(id)
  }

  const timer = setTimeout(tarea, 350)
  return () => clearTimeout(timer)
}

/**
 * Calienta en segundo plano los conjuntos de datos clave del usuario autenticado o demo
 * mientras el dispositivo está en línea para garantizar funcionamiento instantáneo sin red.
 */
export function programarPrecargaOffline({
  queryClient,
  userId,
  rol,
  estudiante,
  docente,
}: ParametrosWarming): () => void {
  if (typeof window === 'undefined') return () => {}
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine) {
    return () => {}
  }

  const scope = resolverScopeUsuarioActivo(userId)
  if (!scope) return () => {}

  const claveFirma = `${scope}::${rol}::${estudiante?.id ?? 'none'}::${estudiante?.grupo ?? 'none'}::${docente?.id ?? 'none'}`
  if (ejecucionesRecientes.has(claveFirma)) {
    return () => {}
  }

  let cancelado = false

  const cancelarIdle = programarEnSegundoPlano(() => {
    if (cancelado) return
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine) {
      return
    }
    ejecucionesRecientes.add(claveFirma)

    void (async () => {
      const hoy = new Date()
      const semanaActual = semanaDelCiclo(hoy)
      const semanas = [
        semanaActual,
        ...Array.from({ length: SEMANAS_DEL_CICLO }, (_, idx) => idx + 1).filter(
          (s) => s !== semanaActual,
        ),
      ]

      const tareas: Array<Promise<unknown>> = [
        queryClient.prefetchQuery({
          queryKey: ['avisos'],
          queryFn: obtenerAvisos,
          staleTime: 1000 * 60 * 10,
        }),
      ]

      // Precargar semana actual del comedor con prioridad y resto del ciclo en baja prioridad
      for (const s of semanas) {
        tareas.push(
          queryClient.prefetchQuery({
            queryKey: ['comedor', 'semana', s],
            queryFn: ({ signal }) => obtenerSemana(s, signal),
            staleTime: 1000 * 60 * 30,
          }),
        )
      }

      if (rol === 'docente' && docente?.activo) {
        const alumnos = await queryClient
          .fetchQuery({
            queryKey: ['docente-estudiantes', docente.id],
            queryFn: () => obtenerEstudiantesDocente(docente),
            staleTime: 1000 * 60 * 5,
          })
          .catch(() => [] as Estudiante[])

        if (!cancelado && alumnos.length > 0) {
          const idsKey = alumnos.map((e) => e.id).join(',')
          tareas.push(
            queryClient.prefetchQuery({
              queryKey: ['docente-notas', docente.id, 'I Periodo', idsKey],
              queryFn: () => obtenerNotasGrupoDocente(docente, alumnos, 'I Periodo'),
              staleTime: 1000 * 60 * 2,
            }),
            queryClient.prefetchQuery({
              queryKey: ['docente-asistencias', docente.id, 'todas', idsKey],
              queryFn: () => obtenerAsistenciasGrupoDocente(docente, alumnos, undefined),
              staleTime: 1000 * 60 * 2,
            }),
            queryClient.prefetchQuery({
              queryKey: ['docente-observaciones', docente.id, 'todos'],
              queryFn: () => obtenerObservacionesDocente(docente, alumnos),
              staleTime: 1000 * 60 * 2,
            }),
          )
        }

        tareas.push(
          queryClient.prefetchQuery({
            queryKey: ['docente-agenda', docente.id],
            queryFn: () => obtenerAgendaDocente(docente),
            staleTime: 1000 * 60 * 2,
          }),
        )
      } else if (estudiante) {
        if (estudiante.grupo) {
          tareas.push(
            queryClient.prefetchQuery({
              queryKey: ['horarios', 'grupo', estudiante.grupo],
              queryFn: ({ signal }) => obtenerHorario(estudiante.grupo, signal),
              staleTime: 1000 * 60 * 60 * 6,
            }),
          )
        }
        if (estudiante.id) {
          tareas.push(
            queryClient.prefetchQuery({
              queryKey: ['estudiante-notas', estudiante.id, 'I Periodo'],
              queryFn: () => obtenerNotasEstudiante(estudiante.id!, 'I Periodo'),
              staleTime: 1000 * 60 * 10,
            }),
            queryClient.prefetchQuery({
              queryKey: ['estudiante-asistencias', estudiante.id, 'I Periodo'],
              queryFn: () => obtenerAsistenciasEstudiante(estudiante.id!, 'I Periodo'),
              staleTime: 1000 * 60 * 10,
            }),
          )
        }
        tareas.push(obtenerEventosDocenteSupabaseParaEstudiante(estudiante))
      }

      await Promise.allSettled(tareas)
      if (!cancelado) {
        persistirQueryClientEnCache(queryClient, scope)
        registrarSincronizacion('warmer')
      }
    })()
  })

  return () => {
    cancelado = true
    cancelarIdle()
  }
}

export function limpiarHistorialPrecargaOffline(): void {
  ejecucionesRecientes.clear()
}
