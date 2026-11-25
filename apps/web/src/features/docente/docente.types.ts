import type { Estudiante } from '@/features/estudiante/estudiante.fixture'

export type DocenteProfile = {
  id: string
  authUserId?: string
  correoInstitucional: string
  nombreCompleto: string
  especialidadAsignada: string
  seccionesAsignadas: string[]
  activo: boolean
}

export type CategoriaObservacion =
  | 'academica'
  | 'asistencia'
  | 'convivencia'
  | 'felicitacion'

export type ObservacionDocente = {
  id: string
  estudianteId: string
  docenteId: string
  docenteNombre: string
  periodo: 'I Periodo' | 'II Periodo' | 'III Periodo' | 'Anual'
  materia?: string
  categoria: CategoriaObservacion
  observacion: string
  visibleFamilia: boolean
  creadoEl: string
}

export type FiltroRiesgoDocente = 'todos' | 'alerta' | 'regular'

export type EstudianteConMetricasDocente = {
  estudiante: Estudiante
  promedioGeneral: number
  materiasEvaluadas: number
  materiasEnRiesgo: number
  porcentajeAsistencia: number
  ausenciasInjustificadas: number
  totalSesiones: number
  enAlerta: boolean
  motivosAlerta: string[]
}

export type ResumenGrupoDocente = {
  totalEstudiantes: number
  promedioGrupo: number
  asistenciaPromedio: number
  estudiantesEnAlerta: number
}
