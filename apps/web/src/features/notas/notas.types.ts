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

export const PESOS_RUBRICA_MEP = {
  trabajoCotidiano: 0.4,
  tareas: 0.1,
  pruebas: 0.35,
  proyecto: 0.1,
  asistencia: 0.05,
} as const

function limitar0a100(valor: number): number {
  if (!Number.isFinite(valor)) return 0
  return Math.min(100, Math.max(0, valor))
}

function redondear1(valor: number): number {
  return Math.round(valor * 10) / 10
}

/**
 * Calcula la nota final MEP (0-100) a partir de calificaciones 0-100 en cada rubro.
 * Ponderación estándar técnica: Cotidiano 40%, Tareas 10%, Pruebas 35%, Proyecto 10%, Asistencia 5%.
 */
export function calcularNotaFinalMep(puntajes0a100: RubricaNota): {
  notaFinal: number
  rubricaPonderada: RubricaNota
  aprobada: boolean
} {
  const rubricaPonderada: RubricaNota = {
    trabajoCotidiano: redondear1(limitar0a100(puntajes0a100.trabajoCotidiano) * PESOS_RUBRICA_MEP.trabajoCotidiano),
    tareas: redondear1(limitar0a100(puntajes0a100.tareas) * PESOS_RUBRICA_MEP.tareas),
    pruebas: redondear1(limitar0a100(puntajes0a100.pruebas) * PESOS_RUBRICA_MEP.pruebas),
    proyecto: redondear1(limitar0a100(puntajes0a100.proyecto) * PESOS_RUBRICA_MEP.proyecto),
    asistencia: redondear1(limitar0a100(puntajes0a100.asistencia) * PESOS_RUBRICA_MEP.asistencia),
  }

  const suma =
    rubricaPonderada.trabajoCotidiano +
    rubricaPonderada.tareas +
    rubricaPonderada.pruebas +
    rubricaPonderada.proyecto +
    rubricaPonderada.asistencia

  const notaFinal = Math.min(100, redondear1(suma))
  return {
    notaFinal,
    rubricaPonderada,
    aprobada: notaFinal >= 70,
  }
}

/**
 * Convierte una rúbrica almacenada (puntos ganados sobre 100 totales o puntajes 0-100)
 * nuevamente a puntajes 0-100 para el formulario de edición docente.
 */
export function extraerPuntajes0a100DesdeRubrica(rubrica: RubricaNota): RubricaNota {
  const suma =
    rubrica.trabajoCotidiano +
    rubrica.tareas +
    rubrica.pruebas +
    rubrica.proyecto +
    rubrica.asistencia

  const parecePonderada =
    suma <= 100.5 &&
    rubrica.trabajoCotidiano <= 40.5 &&
    rubrica.tareas <= 10.5 &&
    rubrica.pruebas <= 35.5 &&
    rubrica.proyecto <= 10.5 &&
    rubrica.asistencia <= 5.5

  if (!parecePonderada) {
    return {
      trabajoCotidiano: redondear1(limitar0a100(rubrica.trabajoCotidiano)),
      tareas: redondear1(limitar0a100(rubrica.tareas)),
      pruebas: redondear1(limitar0a100(rubrica.pruebas)),
      proyecto: redondear1(limitar0a100(rubrica.proyecto)),
      asistencia: redondear1(limitar0a100(rubrica.asistencia)),
    }
  }

  return {
    trabajoCotidiano: redondear1(limitar0a100(rubrica.trabajoCotidiano / PESOS_RUBRICA_MEP.trabajoCotidiano)),
    tareas: redondear1(limitar0a100(rubrica.tareas / PESOS_RUBRICA_MEP.tareas)),
    pruebas: redondear1(limitar0a100(rubrica.pruebas / PESOS_RUBRICA_MEP.pruebas)),
    proyecto: redondear1(limitar0a100(rubrica.proyecto / PESOS_RUBRICA_MEP.proyecto)),
    asistencia: redondear1(limitar0a100(rubrica.asistencia / PESOS_RUBRICA_MEP.asistencia)),
  }
}

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
