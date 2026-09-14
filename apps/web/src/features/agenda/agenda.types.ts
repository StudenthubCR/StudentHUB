/**
 * Tipos principales para el módulo de Agenda Estudiantil en StudentHUB.
 */

export type TipoEventoAgenda = 'examen' | 'tarea' | 'ausencia_profesor' | 'recordatorio'

export type PrioridadEvento = 'alta' | 'media' | 'baja'

export type EventoAgenda = {
  id: string
  tipo: TipoEventoAgenda
  titulo: string
  materia: string
  /** Fecha en formato ISO 'YYYY-MM-DD' */
  fecha: string
  /** Hora opcional en formato 'HH:mm' */
  hora?: string
  descripcion?: string
  creadoEn: string

  // Específico para exámenes
  porcentaje?: number
  temario?: string[]
  aula?: string

  // Específico para tareas
  prioridad?: PrioridadEvento
  completada?: boolean
  fechaCompletada?: string

  // Específico para ausencias de docentes
  profesor?: string
  bloqueAfectado?: string
  indicacion?: string
  sustituto?: string
}

export type FiltroAgenda = 'todos' | 'examen' | 'tarea' | 'ausencia_profesor' | 'completadas'

export type ResumenAgendaDia = {
  fecha: string
  eventos: EventoAgenda[]
  ausencias: EventoAgenda[]
  examenes: EventoAgenda[]
  tareasPendientes: EventoAgenda[]
  tareasCompletadas: EventoAgenda[]
}
