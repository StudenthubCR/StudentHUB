import { format, isSameDay, isToday, isTomorrow, isYesterday, parseISO, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EventoAgenda, ResumenAgendaDia, TipoEventoAgenda } from './agenda.types'

export const STORAGE_KEY_AGENDA = 'studenthub_agenda_eventos'

/**
 * Genera una lista inicial de eventos realistas para que el estudiante
 * pueda experimentar la agenda de inmediato sin empezar en blanco.
 */
export function generarEventosSemilla(fechaReferencia: Date = new Date()): EventoAgenda[] {
  const formatearFecha = (diasOffset: number) => {
    const fecha = new Date(fechaReferencia)
    fecha.setDate(fecha.getDate() + diasOffset)
    return format(fecha, 'yyyy-MM-dd')
  }

  return [
    {
      id: 'semilla-ausencia-1',
      tipo: 'ausencia_profesor',
      titulo: 'Profesor ausente',
      materia: 'Física Matemática',
      profesor: 'Prof. Alberto Vargas',
      fecha: formatearFecha(0), // Hoy
      hora: '07:00',
      bloqueAfectado: 'Lecciones 1 a 3 (7:00 am - 9:15 am)',
      indicacion: 'Dejó práctica en Teams. Estudiantes ingresan en la 4ta lección (9:30 am).',
      descripcion: 'Licencia médica justificada.',
      creadoEn: new Date().toISOString(),
    },
    {
      id: 'semilla-tarea-1',
      tipo: 'tarea',
      titulo: 'Guía de Circuitos Lógicos',
      materia: 'Electrónica Digital',
      fecha: formatearFecha(1), // Mañana
      hora: '11:40',
      prioridad: 'alta',
      completada: false,
      descripcion: 'Entregar en hojas de examen con diagrama de compuertas y tabla de verdad.',
      creadoEn: new Date().toISOString(),
    },
    {
      id: 'semilla-examen-1',
      tipo: 'examen',
      titulo: 'Examen Parcial I',
      materia: 'Desarrollo de Software',
      fecha: formatearFecha(3), // En 3 días
      hora: '08:40',
      porcentaje: 25,
      aula: 'Laboratorio de Cómputo 2',
      temario: [
        'React 19 y arquitectura de componentes',
        'TypeScript estricto y tipado de estados',
        'Diseño responsivo con Tailwind CSS',
      ],
      descripcion: 'Llevar carnet estudiantil y memoria USB personal.',
      creadoEn: new Date().toISOString(),
    },
    {
      id: 'semilla-tarea-2',
      tipo: 'tarea',
      titulo: 'Ensayo sobre Ética Profesional',
      materia: 'Español',
      fecha: formatearFecha(5),
      prioridad: 'media',
      completada: false,
      descripcion: 'Máximo 3 páginas, letra Arial 12, interlineado 1.5.',
      creadoEn: new Date().toISOString(),
    },
    {
      id: 'semilla-recordatorio-1',
      tipo: 'recordatorio',
      titulo: 'Entrega de Informes al Hogar',
      materia: 'Institucional',
      fecha: formatearFecha(7),
      hora: '14:00',
      descripcion: 'Reunión de padres de familia y entrega formal de notas del primer ciclo.',
      creadoEn: new Date().toISOString(),
    },
  ]
}

/**
 * Lee los eventos guardados en localStorage.
 * Si no existen, inicializa los datos semilla.
 */
export function obtenerEventos(): EventoAgenda[] {
  if (typeof window === 'undefined') {
    return generarEventosSemilla()
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY_AGENDA)
    if (!data) {
      const semillas = generarEventosSemilla()
      guardarEnStorage(semillas)
      return semillas
    }

    const parseados: EventoAgenda[] = JSON.parse(data)
    if (!Array.isArray(parseados)) {
      const semillas = generarEventosSemilla()
      guardarEnStorage(semillas)
      return semillas
    }

    return parseados
  } catch {
    return generarEventosSemilla()
  }
}

/** Guarda la colección completa en localStorage y despacha un evento para reactividad. */
function guardarEnStorage(eventos: EventoAgenda[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_AGENDA, JSON.stringify(eventos))
    window.dispatchEvent(new Event('studenthub:agenda-actualizada'))
  } catch (err) {
    console.error('Error al guardar eventos de agenda:', err)
  }
}

/** Agrega un nuevo evento a la agenda */
export function guardarEvento(nuevo: Omit<EventoAgenda, 'id' | 'creadoEn'>): EventoAgenda {
  const eventos = obtenerEventos()
  const eventoCompleto: EventoAgenda = {
    ...nuevo,
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    creadoEn: new Date().toISOString(),
  }

  const actualizados = [eventoCompleto, ...eventos]
  guardarEnStorage(actualizados)
  return eventoCompleto
}

/** Actualiza un evento existente */
export function actualizarEvento(id: string, cambios: Partial<EventoAgenda>): EventoAgenda | null {
  const eventos = obtenerEventos()
  const indice = eventos.findIndex((e) => e.id === id)
  if (indice === -1) return null

  const actualizado: EventoAgenda = {
    ...eventos[indice],
    ...cambios,
  }

  eventos[indice] = actualizado
  guardarEnStorage(eventos)
  return actualizado
}

/** Elimina un evento de la agenda */
export function eliminarEvento(id: string): boolean {
  const eventos = obtenerEventos()
  const filtrados = eventos.filter((e) => e.id !== id)
  if (filtrados.length === eventos.length) return false

  guardarEnStorage(filtrados)
  return true
}

/** Alterna el estado completado de una tarea */
export function alternarCompletadoTarea(id: string): EventoAgenda | null {
  const eventos = obtenerEventos()
  const evento = eventos.find((e) => e.id === id)
  if (!evento || evento.tipo !== 'tarea') return null

  const completada = !evento.completada
  return actualizarEvento(id, {
    completada,
    fechaCompletada: completada ? new Date().toISOString() : undefined,
  })
}

/** Restablece los eventos a las muestras predeterminadas */
export function reiniciarEventosEjemplo(): EventoAgenda[] {
  const semillas = generarEventosSemilla()
  guardarEnStorage(semillas)
  return semillas
}

/** Obtiene los eventos para una fecha específica (formato YYYY-MM-DD) */
export function obtenerEventosPorFecha(fechaIso: string, lista: EventoAgenda[] = obtenerEventos()): EventoAgenda[] {
  return lista.filter((e) => e.fecha === fechaIso)
}

/** Obtiene eventos que coincidan con un objeto Date */
export function obtenerEventosDelDia(fecha: Date, lista: EventoAgenda[] = obtenerEventos()): EventoAgenda[] {
  return lista.filter((e) => {
    try {
      const fechaEvento = parseISO(e.fecha)
      return isSameDay(fechaEvento, fecha)
    } catch {
      return false
    }
  })
}

/** Obtiene ausencias de profesores reportadas para el día de hoy */
export function obtenerAusenciasHoy(fecha: Date = new Date(), lista: EventoAgenda[] = obtenerEventos()): EventoAgenda[] {
  return obtenerEventosDelDia(fecha, lista).filter((e) => e.tipo === 'ausencia_profesor')
}

/** Obtiene los próximos eventos ordenados cronológicamente a partir de hoy */
export function obtenerEventosProximos(fechaRef: Date = new Date(), lista: EventoAgenda[] = obtenerEventos(), limite = 15): EventoAgenda[] {
  const hoyIso = format(fechaRef, 'yyyy-MM-dd')

  return lista
    .filter((e) => e.fecha >= hoyIso)
    .sort((a, b) => {
      if (a.fecha !== b.fecha) {
        return a.fecha.localeCompare(b.fecha)
      }
      return (a.hora || '23:59').localeCompare(b.hora || '23:59')
    })
    .slice(0, limite)
}

/** Calcula un resumen estadístico para la fecha indicada */
export function obtenerResumenAgenda(fecha: Date = new Date(), lista: EventoAgenda[] = obtenerEventos()): ResumenAgendaDia {
  const fechaIso = format(fecha, 'yyyy-MM-dd')
  const eventosHoy = obtenerEventosPorFecha(fechaIso, lista)

  return {
    fecha: fechaIso,
    eventos: eventosHoy,
    ausencias: eventosHoy.filter((e) => e.tipo === 'ausencia_profesor'),
    examenes: eventosHoy.filter((e) => e.tipo === 'examen'),
    tareasPendientes: eventosHoy.filter((e) => e.tipo === 'tarea' && !e.completada),
    tareasCompletadas: eventosHoy.filter((e) => e.tipo === 'tarea' && e.completada),
  }
}

/** Formatea una fecha de forma amigable (ej: 'Hoy', 'Mañana', 'En 3 días', '18 sep') */
export function formatearFechaRelativa(fechaIso: string, hoy: Date = new Date()): string {
  try {
    const fecha = parseISO(fechaIso)
    if (isToday(fecha)) return 'Hoy'
    if (isTomorrow(fecha)) return 'Mañana'
    if (isYesterday(fecha)) return 'Ayer'

    const dias = differenceInCalendarDays(fecha, hoy)
    if (dias > 1 && dias <= 7) return `En ${dias} días`
    if (dias < -1 && dias >= -7) return `Hace ${Math.abs(dias)} días`

    return format(fecha, "d 'de' MMMM", { locale: es })
  } catch {
    return fechaIso
  }
}

/** Nombre legible para la etiqueta del tipo de evento */
export function obtenerEtiquetaTipo(tipo: TipoEventoAgenda): string {
  switch (tipo) {
    case 'examen':
      return 'Examen'
    case 'tarea':
      return 'Tarea'
    case 'ausencia_profesor':
      return 'Profesor ausente'
    case 'recordatorio':
      return 'Recordatorio'
  }
}

/** Estilos semánticos acordes a la paleta del proyecto */
export function obtenerColoresTipo(tipo: TipoEventoAgenda): {
  badge: string
  borde: string
  punto: string
  acento: string
} {
  switch (tipo) {
    case 'examen':
      return {
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        borde: 'border-l-rose-500',
        punto: 'bg-rose-500',
        acento: 'text-rose-600 dark:text-rose-400',
      }
    case 'ausencia_profesor':
      return {
        badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        borde: 'border-l-amber-500',
        punto: 'bg-amber-500',
        acento: 'text-amber-600 dark:text-amber-400',
      }
    case 'tarea':
      return {
        badge: 'bg-primary/10 text-primary border-primary/20',
        borde: 'border-l-primary',
        punto: 'bg-primary',
        acento: 'text-primary',
      }
    case 'recordatorio':
      return {
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        borde: 'border-l-emerald-500',
        punto: 'bg-emerald-500',
        acento: 'text-emerald-600 dark:text-emerald-400',
      }
  }
}
