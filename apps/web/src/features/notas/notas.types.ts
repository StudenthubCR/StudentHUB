export type PeriodoNota = 'I Periodo' | 'II Periodo' | 'III Periodo' | 'Anual'

export type RubricaNota = {
  trabajoCotidiano: number
  tareas: number
  pruebas: number
  proyecto: number
  asistencia: number
}

export type NotaMateria = {
  id: string
  estudianteId: string
  periodo: PeriodoNota
  materia: string
  docente?: string
  notaFinal: number
  rubrica: RubricaNota
  observaciones?: string
  aprobada: boolean
}

export type ResumenNotas = {
  promedioGeneral: number
  materiasAprobadas: number
  materiasEnRiesgo: number
  totalMaterias: number
  progresoPeriodo: number
}

export type EstadoCalificacion = 'aprobada' | 'riesgo' | 'reprobada'

export function obtenerEstadoCalificacion(nota: number): {
  estado: EstadoCalificacion
  etiqueta: string
  claseColor: string
} {
  if (nota >= 70) {
    return {
      estado: 'aprobada',
      etiqueta: 'Aprobada',
      claseColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    }
  }
  if (nota >= 60) {
    return {
      estado: 'riesgo',
      etiqueta: 'Requiere Refuerzo',
      claseColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    }
  }
  return {
    estado: 'reprobada',
    etiqueta: 'En Riesgo',
    claseColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
  }
}
