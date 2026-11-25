import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import type { PeriodoNota } from '@/features/notas/notas.types'
import type { GuardarNotaPayload } from '@/features/notas/notas.service'
import type { PeriodoAsistencia } from '@/features/asistencias/asistencias.types'
import type { GuardarAsistenciaInput } from '@/features/asistencias/asistencias.service'
import type { EventoAgenda } from '@/features/agenda/agenda.types'
import {
  construirMetricasEstudiantesDocente,
  crearObservacionDocente,
  desactivarItemAgendaDocente,
  guardarAsistenciaDocente,
  guardarItemAgendaDocente,
  guardarNotaDocente,
  obtenerAgendaDocente,
  obtenerAsistenciasGrupoDocente,
  obtenerEstudiantesDocente,
  obtenerNotasGrupoDocente,
  obtenerObservacionesDocente,
} from './docente.service'
import type { CategoriaObservacion, DocenteProfile, ObservacionDocente } from './docente.types'

export function useEstudiantesDocente(docente: DocenteProfile | null) {
  return useQuery({
    queryKey: ['docente-estudiantes', docente?.id ?? null],
    queryFn: () => obtenerEstudiantesDocente(docente!),
    enabled: Boolean(docente?.activo),
    staleTime: 1000 * 60 * 5,
  })
}

export function useNotasDocente(
  docente: DocenteProfile | null,
  estudiantes: Estudiante[],
  periodo: PeriodoNota = 'I Periodo',
) {
  return useQuery({
    queryKey: ['docente-notas', docente?.id ?? null, periodo, estudiantes.map((e) => e.id).join(',')],
    queryFn: () => obtenerNotasGrupoDocente(docente!, estudiantes, periodo),
    enabled: Boolean(docente?.activo) && estudiantes.length > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAsistenciasDocente(
  docente: DocenteProfile | null,
  estudiantes: Estudiante[],
  periodo?: PeriodoAsistencia,
) {
  return useQuery({
    queryKey: ['docente-asistencias', docente?.id ?? null, periodo ?? 'todas', estudiantes.map((e) => e.id).join(',')],
    queryFn: () => obtenerAsistenciasGrupoDocente(docente!, estudiantes, periodo),
    enabled: Boolean(docente?.activo) && estudiantes.length > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useObservacionesDocente(
  docente: DocenteProfile | null,
  estudiantes: Estudiante[],
  estudianteId?: string,
) {
  return useQuery({
    queryKey: ['docente-observaciones', docente?.id ?? null, estudianteId ?? 'todos'],
    queryFn: () => obtenerObservacionesDocente(docente!, estudiantes, estudianteId),
    enabled: Boolean(docente?.activo) && estudiantes.length > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAgendaDocente(docente: DocenteProfile | null) {
  return useQuery({
    queryKey: ['docente-agenda', docente?.id ?? null],
    queryFn: () => obtenerAgendaDocente(docente!),
    enabled: Boolean(docente?.activo),
    staleTime: 1000 * 60 * 2,
  })
}

export function useMutacionesDocente(docente: DocenteProfile | null) {
  const queryClient = useQueryClient()

  const invalidarAcademico = () => {
    void queryClient.invalidateQueries({ queryKey: ['docente-notas'] })
    void queryClient.invalidateQueries({ queryKey: ['docente-asistencias'] })
    void queryClient.invalidateQueries({ queryKey: ['estudiante-notas'] })
    void queryClient.invalidateQueries({ queryKey: ['estudiante-asistencias'] })
  }

  const guardarNotaMutation = useMutation({
    mutationFn: async (args: { estudiante: Estudiante; payload: GuardarNotaPayload }) => {
      if (!docente) {
        return { ok: false, error: 'Sesión docente no disponible.' }
      }
      const res = await guardarNotaDocente(docente, args.estudiante, args.payload)
      if (!res.ok) {
        throw new Error(res.error || 'No se pudo guardar la calificación.')
      }
      return res
    },
    onSuccess: invalidarAcademico,
  })

  const guardarAsistenciasMutation = useMutation({
    mutationFn: async (args: { estudiantes: Estudiante[]; entradas: GuardarAsistenciaInput[] }) => {
      if (!docente) {
        return { ok: false, guardados: [], error: 'Sesión docente no disponible.' }
      }
      const res = await guardarAsistenciaDocente(docente, args.estudiantes, args.entradas)
      if (!res.ok) {
        throw new Error(res.error || 'No se pudo guardar el pase de lista.')
      }
      return res
    },
    onSuccess: invalidarAcademico,
  })

  const crearObservacionMutation = useMutation({
    mutationFn: async (args: {
      estudiante: Estudiante
      periodo: ObservacionDocente['periodo']
      materia?: string
      categoria: CategoriaObservacion
      observacion: string
      visibleFamilia?: boolean
    }) => {
      if (!docente) {
        return { ok: false, error: 'Sesión docente no disponible.' }
      }
      const res = await crearObservacionDocente(docente, args.estudiante, args)
      if (!res.ok) {
        throw new Error(res.error || 'No se pudo registrar la observación.')
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['docente-observaciones'] })
    },
  })

  const guardarAgendaMutation = useMutation({
    mutationFn: async (
      payload: Omit<EventoAgenda, 'id' | 'creadoEn' | 'especialidad' | 'docenteId' | 'origen'> & {
        id?: string
        seccionObjetivo?: string | null
      },
    ) => {
      if (!docente) {
        return { ok: false, error: 'Sesión docente no disponible.' }
      }
      const res = await guardarItemAgendaDocente(docente, payload)
      if (!res.ok) {
        throw new Error(res.error || 'No se pudo guardar la actividad docente.')
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['docente-agenda'] })
    },
  })

  const desactivarAgendaMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!docente) {
        return { ok: false, error: 'Sesión docente no disponible.' }
      }
      const res = await desactivarItemAgendaDocente(docente, id)
      if (!res.ok) {
        throw new Error(res.error || 'No se pudo archivar la actividad.')
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['docente-agenda'] })
    },
  })

  return {
    guardarNotaMutation,
    guardarAsistenciasMutation,
    crearObservacionMutation,
    guardarAgendaMutation,
    desactivarAgendaMutation,
  }
}

export function usePanelResumenDocente(
  docente: DocenteProfile | null,
  periodo: PeriodoNota = 'I Periodo',
) {
  const estudiantesQ = useEstudiantesDocente(docente)
  const estudiantes = estudiantesQ.data ?? []
  const periodoAsist: PeriodoAsistencia =
    periodo === 'Anual' ? 'I Periodo' : (periodo as PeriodoAsistencia)

  const notasQ = useNotasDocente(docente, estudiantes, periodo)
  const asistenciasQ = useAsistenciasDocente(docente, estudiantes, periodoAsist)

  const { listado, resumen } = construirMetricasEstudiantesDocente(
    estudiantes,
    notasQ.data ?? [],
    asistenciasQ.data ?? [],
  )

  return {
    estudiantes,
    listado,
    resumen,
    notas: notasQ.data ?? [],
    asistencias: asistenciasQ.data ?? [],
    cargando: estudiantesQ.isLoading || (estudiantes.length > 0 && (notasQ.isLoading || asistenciasQ.isLoading)),
    error: estudiantesQ.error || notasQ.error || asistenciasQ.error,
    reintentar: async () => {
      await Promise.all([estudiantesQ.refetch(), notasQ.refetch(), asistenciasQ.refetch()])
    },
  }
}
