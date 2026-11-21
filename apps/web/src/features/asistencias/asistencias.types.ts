export type EstadoAsistencia =
  | 'presente'
  | 'ausencia_injustificada'
  | 'ausencia_justificada'
  | 'tardia'

export type PeriodoAsistencia = 'I Periodo' | 'II Periodo' | 'III Periodo'

export type FiltroEstadoAsistencia = 'todos' | 'ausencias' | 'tardias'

export type RegistroAsistencia = {
  id: string
  estudianteId: string
  fecha: string // YYYY-MM-DD
  periodo: PeriodoAsistencia
  materia: string
  bloque: string
  estado: EstadoAsistencia
  justificacion?: string
}

export type ResumenAsistencias = {
  porcentajeAsistencia: number
  totalSesiones: number
  presentes: number
  ausenciasInjustificadas: number
  ausenciasJustificadas: number
  tardias: number
  alertaTemprana: boolean
  mensajeAlerta?: string
}

export function obtenerBadgeEstadoAsistencia(estado: EstadoAsistencia): {
  etiqueta: string
  claseColor: string
} {
  switch (estado) {
    case 'presente':
      return {
        etiqueta: 'Presente',
        claseColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      }
    case 'ausencia_justificada':
      return {
        etiqueta: 'Justificada',
        claseColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
      }
    case 'tardia':
      return {
        etiqueta: 'Tardía',
        claseColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      }
    case 'ausencia_injustificada':
    default:
      return {
        etiqueta: 'Injustificada',
        claseColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
      }
  }
}
