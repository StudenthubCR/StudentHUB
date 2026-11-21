import { supabase } from '@/lib/supabase'
import type {
  EstadoAsistencia,
  PeriodoAsistencia,
  RegistroAsistencia,
  ResumenAsistencias,
} from './asistencias.types'
import { ASISTENCIAS_FIXTURE } from './asistencias.fixture'

type FilaAsistenciaRaw = {
  id: string
  estudiante_id: string
  fecha: string
  periodo: string
  materia: string
  bloque: string
  estado: string
  justificacion?: string | null
}

function mapearFilaAAsistencia(f: FilaAsistenciaRaw): RegistroAsistencia {
  return {
    id: f.id,
    estudianteId: f.estudiante_id,
    fecha: f.fecha,
    periodo: f.periodo as PeriodoAsistencia,
    materia: f.materia,
    bloque: f.bloque,
    estado: f.estado as EstadoAsistencia,
    justificacion: f.justificacion ?? undefined,
  }
}

/**
 * Consulta el registro de asistencias de un estudiante, filtrado opcionalmente por periodo.
 * Soporta fallback automático a fixtures en modo demo o ante desconexión.
 */
export async function obtenerAsistenciasEstudiante(
  estudianteId: string,
  periodo?: PeriodoAsistencia,
): Promise<RegistroAsistencia[]> {
  const esDemo =
    typeof window !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true'

  if (esDemo || !estudianteId) {
    const fixture = ASISTENCIAS_FIXTURE.filter(
      (a) =>
        (!estudianteId || a.estudianteId === estudianteId) &&
        (!periodo || a.periodo === periodo),
    )
    return fixture.length > 0
      ? fixture
      : ASISTENCIAS_FIXTURE.filter((a) => !periodo || a.periodo === periodo)
  }

  try {
    let query = supabase.from('asistencias').select('*').eq('estudiante_id', estudianteId)

    if (periodo) {
      query = query.eq('periodo', periodo)
    }

    const { data, error } = await query.order('fecha', { ascending: false })

    if (error || !data || data.length === 0) {
      return ASISTENCIAS_FIXTURE.filter((a) => !periodo || a.periodo === periodo)
    }

    return (data as FilaAsistenciaRaw[]).map(mapearFilaAAsistencia)
  } catch {
    return ASISTENCIAS_FIXTURE.filter((a) => !periodo || a.periodo === periodo)
  }
}

/**
 * Calcula el resumen porcentual de asistencias y alerta temprana de ausencias.
 * Según el MEP: La asistencia regular considera presentes y ausencias con justificación formal.
 */
export function calcularResumenAsistencias(registros: RegistroAsistencia[]): ResumenAsistencias {
  if (!registros || registros.length === 0) {
    return {
      porcentajeAsistencia: 100,
      totalSesiones: 0,
      presentes: 0,
      ausenciasInjustificadas: 0,
      ausenciasJustificadas: 0,
      tardias: 0,
      alertaTemprana: false,
    }
  }

  const totalSesiones = registros.length
  let presentes = 0
  let ausenciasJustificadas = 0
  let ausenciasInjustificadas = 0
  let tardias = 0

  for (const r of registros) {
    switch (r.estado) {
      case 'presente':
        presentes++
        break
      case 'ausencia_justificada':
        ausenciasJustificadas++
        break
      case 'tardia':
        tardias++
        break
      case 'ausencia_injustificada':
      default:
        ausenciasInjustificadas++
        break
    }
  }

  // Las tardías se computan con presencialidad (el alumno estuvo en clase),
  // mientras que las ausencias justificadas no restan derecho según normativa MEP.
  const asistenciasValidas = presentes + tardias + ausenciasJustificadas
  const porcentajeAsistencia = Number(
    ((asistenciasValidas / totalSesiones) * 100).toFixed(1),
  )

  // Alerta temprana: más de 3 ausencias injustificadas o porcentaje < 85%
  const alertaTemprana = ausenciasInjustificadas >= 3 || porcentajeAsistencia < 85
  let mensajeAlerta: string | undefined

  if (alertaTemprana) {
    if (ausenciasInjustificadas >= 3) {
      mensajeAlerta = `Atención preventiva: Registra ${ausenciasInjustificadas} ausencias injustificadas. Conforme a la normativa del MEP, acumular ausencias sin justificar compromete la calificación de asistencia.`
    } else {
      mensajeAlerta = `Porcentaje de asistencia actual (${porcentajeAsistencia}%): Se recomienda dar seguimiento a las lecciones pendientes para mantener la regularidad académica.`
    }
  }

  return {
    porcentajeAsistencia,
    totalSesiones,
    presentes,
    ausenciasInjustificadas,
    ausenciasJustificadas,
    tardias,
    alertaTemprana,
    mensajeAlerta,
  }
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) al formato oficial y comprensible de Costa Rica (es-CR).
 * Ejemplo: "Viernes, 20 de marzo de 2026"
 */
export function formatearFechaAsistencia(fechaIso: string): string {
  if (!fechaIso) return ''
  try {
    const partes = fechaIso.split('-')
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10)
      const mes = parseInt(partes[1], 10) - 1
      const dia = parseInt(partes[2], 10)
      const fecha = new Date(anio, mes, dia, 12, 0, 0)
      return new Intl.DateTimeFormat('es-CR', {
        timeZone: 'America/Costa_Rica',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(fecha)
    }
  } catch {
    // Fallback silencioso
  }
  return fechaIso
}
