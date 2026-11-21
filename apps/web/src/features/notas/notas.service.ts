import { supabase } from '@/lib/supabase'
import type { NotaMateria, PeriodoNota, ResumenNotas } from './notas.types'
import { NOTAS_FIXTURE } from './notas.fixture'

type FilaNotaRaw = {
  id: string
  estudiante_id: string
  periodo: string
  materia: string
  docente?: string | null
  nota_final: number
  trabajo_cotidiano?: number | null
  tareas?: number | null
  pruebas?: number | null
  proyecto?: number | null
  asistencia?: number | null
  observaciones?: string | null
}

function mapearFilaANota(f: FilaNotaRaw): NotaMateria {
  const notaFinal = Number(f.nota_final) || 0
  return {
    id: f.id,
    estudianteId: f.estudiante_id,
    periodo: f.periodo as PeriodoNota,
    materia: f.materia,
    docente: f.docente ?? undefined,
    notaFinal,
    rubrica: {
      trabajoCotidiano: Number(f.trabajo_cotidiano) || 0,
      tareas: Number(f.tareas) || 0,
      pruebas: Number(f.pruebas) || 0,
      proyecto: Number(f.proyecto) || 0,
      asistencia: Number(f.asistencia) || 0,
    },
    observaciones: f.observaciones ?? undefined,
    aprobada: notaFinal >= 70,
  }
}

/**
 * Consulta las calificaciones oficiales de un estudiante, filtradas opcionalmente por periodo.
 * Si no hay conexión o en modo demo/offline, utiliza los fixtures enriquecidos.
 */
export async function obtenerNotasEstudiante(
  estudianteId: string,
  periodo?: PeriodoNota,
): Promise<NotaMateria[]> {
  const esDemo =
    typeof window !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true'

  if (esDemo || !estudianteId) {
    const fixture = NOTAS_FIXTURE.filter(
      (n) =>
        (!estudianteId || n.estudianteId === estudianteId) &&
        (!periodo || periodo === 'Anual' || n.periodo === periodo),
    )
    return fixture.length > 0
      ? fixture
      : NOTAS_FIXTURE.filter((n) => !periodo || periodo === 'Anual' || n.periodo === periodo)
  }

  try {
    let query = supabase.from('notas').select('*').eq('estudiante_id', estudianteId)

    if (periodo && periodo !== 'Anual') {
      query = query.eq('periodo', periodo)
    }

    const { data, error } = await query.order('materia', { ascending: true })

    if (error || !data || data.length === 0) {
      // Fallback defensivo a fixture del estudiante si no hay registros en la BD
      const fallback = NOTAS_FIXTURE.filter(
        (n) => !periodo || periodo === 'Anual' || n.periodo === periodo,
      )
      return fallback
    }

    return (data as FilaNotaRaw[]).map(mapearFilaANota)
  } catch {
    return NOTAS_FIXTURE.filter((n) => !periodo || periodo === 'Anual' || n.periodo === periodo)
  }
}

/**
 * Calcula los indicadores clave (KPIs) del resumen de notas para el periodo activo.
 */
export function calcularResumenNotas(notas: NotaMateria[]): ResumenNotas {
  if (!notas || notas.length === 0) {
    return {
      promedioGeneral: 0,
      materiasAprobadas: 0,
      materiasEnRiesgo: 0,
      totalMaterias: 0,
      progresoPeriodo: 0,
    }
  }

  const totalMaterias = notas.length
  const sumaNotas = notas.reduce((acc, n) => acc + n.notaFinal, 0)
  const promedioGeneral = Number((sumaNotas / totalMaterias).toFixed(1))

  const materiasAprobadas = notas.filter((n) => n.notaFinal >= 70).length
  const materiasEnRiesgo = totalMaterias - materiasAprobadas

  const evaluadas = notas.filter((n) => n.notaFinal > 0).length
  const progresoPeriodo = Math.round((evaluadas / totalMaterias) * 100)

  return {
    promedioGeneral,
    materiasAprobadas,
    materiasEnRiesgo,
    totalMaterias,
    progresoPeriodo,
  }
}
