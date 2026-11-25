import { format, isSameDay, parseISO, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import type { EventoAgenda, ResumenAgendaDia, TipoEventoAgenda } from './agenda.types'
const STORAGE_KEY_AGENDA = 'studenthub_agenda_eventos'
export const STORAGE_KEY_AGENDA_DOCENTE = 'studenthub_agenda_docente_v1'
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
 * Por defecto la agenda inicia vacía (sin placeholders ficticios).
 * Además, purga cualquier evento semilla anterior para limpiar el estado del usuario.
 */
export function obtenerEventos(): EventoAgenda[] {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
    return []
  }

  const esModoDemo = localStorage.getItem('studenthub_demo_sesion') === 'true'

  try {
    const data = localStorage.getItem(STORAGE_KEY_AGENDA)
    if (!data) {
      // En modo demo de Expotécnica, proveer datos vivos para que el jurado evalúe la experiencia
      return esModoDemo ? generarEventosSemilla() : []
    }

    const parseados: EventoAgenda[] = JSON.parse(data)
    if (!Array.isArray(parseados)) {
      return esModoDemo ? generarEventosSemilla() : []
    }

    if (esModoDemo && parseados.length === 0) {
      return generarEventosSemilla()
    }

    // Purgar cualquier placeholder de prueba anterior ('semilla-*') únicamente si NO estamos en modo demo
    if (!esModoDemo) {
      const limpios = parseados.filter((e) => !e.id?.startsWith('semilla-'))
      if (limpios.length !== parseados.length) {
        guardarEnStorage(limpios)
      }
      return limpios
    }

    return parseados
  } catch {
    return esModoDemo ? generarEventosSemilla() : []
  }
}

export function generarAgendaDocenteSemilla(fechaReferencia: Date = new Date()): EventoAgenda[] {
  const formatearFecha = (diasOffset: number) => {
    const fecha = new Date(fechaReferencia)
    fecha.setDate(fecha.getDate() + diasOffset)
    return format(fecha, 'yyyy-MM-dd')
  }

  return [
    {
      id: 'docente-dw-tarea-1',
      tipo: 'tarea',
      titulo: 'Entrega de API REST y Esquema RLS',
      materia: 'Programación y Desarrollo Web',
      fecha: formatearFecha(2),
      hora: '16:00',
      prioridad: 'alta',
      completada: false,
      descripcion: 'Subir repositorio con políticas RLS por especialidad y pruebas unitarias en Vitest.',
      profesor: 'Prof. Dangelo',
      especialidad: 'Desarrollo Web',
      seccionObjetivo: '11-1',
      docenteId: '00000000-0000-0000-0000-000000000010',
      origen: 'docente',
      creadoEn: new Date().toISOString(),
    },
    {
      id: 'docente-dw-examen-1',
      tipo: 'examen',
      titulo: 'Evaluación Práctica de React 19 y TypeScript',
      materia: 'Programación y Desarrollo Web',
      fecha: formatearFecha(4),
      hora: '08:00',
      porcentaje: 20,
      aula: 'Laboratorio Desarrollo Web 1',
      temario: [
        'Hooks personalizados y TanStack Query v5',
        'Rutas protegidas por rol (RBAC)',
        'Diseño mobile-first con Tailwind CSS v4',
      ],
      descripcion: 'Evaluación práctica individual en laboratorio para todas las secciones de Desarrollo Web.',
      profesor: 'Prof. Dangelo',
      especialidad: 'Desarrollo Web',
      seccionObjetivo: null,
      docenteId: '00000000-0000-0000-0000-000000000010',
      origen: 'docente',
      creadoEn: new Date().toISOString(),
    },
    {
      id: 'docente-dw-aviso-1',
      tipo: 'recordatorio',
      titulo: 'Revisión de Anteproyecto Expotécnica',
      materia: 'Proyecto Integrador Web',
      fecha: formatearFecha(1),
      hora: '10:30',
      descripcion: 'Presentación de avances de arquitectura y maquetación móvil para estudiantes de 12-1.',
      profesor: 'Prof. Dangelo',
      especialidad: 'Desarrollo Web',
      seccionObjetivo: '12-1',
      docenteId: '00000000-0000-0000-0000-000000000010',
      origen: 'docente',
      creadoEn: new Date().toISOString(),
    },
  ]
}

export function obtenerEventosDocenteLocales(especialidad?: string): EventoAgenda[] {
  if (typeof localStorage === 'undefined') return []
  const esModoDemo = localStorage.getItem('studenthub_demo_sesion') === 'true'

  let lista: EventoAgenda[] = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AGENDA_DOCENTE)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        lista = parsed as EventoAgenda[]
      }
    } else if (esModoDemo) {
      lista = generarAgendaDocenteSemilla()
    }
  } catch {
    lista = esModoDemo ? generarAgendaDocenteSemilla() : []
  }

  if (!especialidad) return lista
  const espNorm = especialidad.trim().toLowerCase()
  return lista.filter((e) => (e.especialidad ?? '').trim().toLowerCase() === espNorm)
}

export function guardarEventosDocenteLocales(eventos: EventoAgenda[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_AGENDA_DOCENTE, JSON.stringify(eventos))
  } catch (err) {
    console.error('Error al guardar agenda docente:', err)
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('studenthub:agenda-docente-actualizada'))
  }
}

export function aplicaEventoDocenteAEstudiante(
  evento: EventoAgenda,
  estudiante?: { especialidad?: string | null; grupo?: string | null; seccion?: string | null } | null,
): boolean {
  if (!estudiante) return false
  const espEst = (estudiante.especialidad ?? '').trim().toLowerCase()
  const espEv = (evento.especialidad ?? '').trim().toLowerCase()
  if (!espEst || !espEv || espEst !== espEv) return false

  if (!evento.seccionObjetivo || !evento.seccionObjetivo.trim()) return true
  const seccionEst = (estudiante.grupo || estudiante.seccion || '').trim().toLowerCase()
  return seccionEst === evento.seccionObjetivo.trim().toLowerCase()
}

export function obtenerEventosParaEstudiante(
  estudiante?: { especialidad?: string | null; grupo?: string | null; seccion?: string | null } | null,
): EventoAgenda[] {
  const personales = obtenerEventos()
  if (!estudiante) return personales

  const docentes = obtenerEventosDocenteLocales().filter((ev) =>
    aplicaEventoDocenteAEstudiante(ev, estudiante),
  )

  if (docentes.length === 0) return personales

  const ids = new Set(personales.map((p) => p.id))
  const combinados = [...personales]
  for (const ev of docentes) {
    if (!ids.has(ev.id)) {
      combinados.push(ev)
    }
  }
  return combinados
}

export async function obtenerEventosDocenteSupabaseParaEstudiante(
  estudiante?: { especialidad?: string | null; grupo?: string | null; seccion?: string | null } | null,
): Promise<EventoAgenda[]> {
  if (!estudiante?.especialidad) return []
  const esModoDemo =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true'
  if (esModoDemo) return []

  try {
    const { data, error } = await supabase
      .from('agenda_docente')
      .select('*')
      .eq('activo', true)
      .ilike('especialidad', estudiante.especialidad.trim())
      .order('fecha', { ascending: true })

    if (error || !data) return []

    return (data as Record<string, unknown>[])
      .map((f) => ({
        id: String(f.id),
        tipo: String(f.tipo) as EventoAgenda['tipo'],
        titulo: String(f.titulo),
        materia: String(f.materia),
        fecha: String(f.fecha),
        hora: f.hora ? String(f.hora) : undefined,
        descripcion: f.descripcion ? String(f.descripcion) : undefined,
        porcentaje: typeof f.porcentaje === 'number' ? f.porcentaje : f.porcentaje ? Number(f.porcentaje) : undefined,
        temario: Array.isArray(f.temario) ? (f.temario as string[]) : undefined,
        aula: f.aula ? String(f.aula) : undefined,
        prioridad: f.prioridad ? (String(f.prioridad) as EventoAgenda['prioridad']) : undefined,
        profesor: f.profesor ? String(f.profesor) : undefined,
        bloqueAfectado: f.bloque_afectado ? String(f.bloque_afectado) : undefined,
        indicacion: f.indicacion ? String(f.indicacion) : undefined,
        especialidad: String(f.especialidad),
        seccionObjetivo: f.seccion_objetivo ? String(f.seccion_objetivo) : null,
        docenteId: f.docente_id ? String(f.docente_id) : undefined,
        origen: 'docente' as const,
        creadoEn: String(f.creado_el ?? new Date().toISOString()),
      }))
      .filter((ev) => aplicaEventoDocenteAEstudiante(ev, estudiante))
  } catch {
    return []
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

/** Restablece los eventos para pruebas unitarias */
export function reiniciarEventosEjemplo(): EventoAgenda[] {
  const muestras: EventoAgenda[] = [
    {
      id: 'test-tarea-1',
      tipo: 'tarea',
      titulo: 'Práctica de clase',
      materia: 'Matemática',
      fecha: new Date().toISOString().slice(0, 10),
      completada: false,
      creadoEn: new Date().toISOString(),
    },
    {
      id: 'test-examen-1',
      tipo: 'examen',
      titulo: 'Examen de prueba',
      materia: 'Ciencias',
      fecha: new Date().toISOString().slice(0, 10),
      porcentaje: 20,
      creadoEn: new Date().toISOString(),
    },
  ]
  guardarEnStorage(muestras)
  return muestras
}

function obtenerEventosPorFecha(fechaIso: string, lista: EventoAgenda[] = obtenerEventos()): EventoAgenda[] {
  return lista.filter((e) => e.fecha === fechaIso)
}

function obtenerEventosDelDia(fecha: Date, lista: EventoAgenda[] = obtenerEventos()): EventoAgenda[] {
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
    const dias = differenceInCalendarDays(fecha, hoy)
    if (dias === 0) return 'Hoy'
    if (dias === 1) return 'Mañana'
    if (dias === -1) return 'Ayer'
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
