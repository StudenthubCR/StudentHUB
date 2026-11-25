import { supabase } from '@/lib/supabase'
import {
  guardarDatoUsuarioScoped,
  leerDatoUsuarioScoped,
  registrarSincronizacion,
} from '@/lib/offlineCache'
import type { NotaMateria, PeriodoNota, ResumenNotas } from './notas.types'
import { NOTAS_FIXTURE } from './notas.fixture'

export const CLAVE_DEMO_NOTAS_OVERLAY = 'studenthub_demo_notas_v1'

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

function leerNotasDemoOverlay(): NotaMateria[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE_DEMO_NOTAS_OVERLAY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as NotaMateria[]) : []
  } catch {
    return []
  }
}

function guardarNotasDemoOverlay(notas: NotaMateria[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CLAVE_DEMO_NOTAS_OVERLAY, JSON.stringify(notas))
  } catch (err) {
    console.warn('No se pudo persistir el overlay de notas demo:', err)
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('studenthub:notas-actualizadas'))
  }
}

function claveNaturalNota(n: Pick<NotaMateria, 'estudianteId' | 'periodo' | 'materia'>): string {
  return `${n.estudianteId}::${n.periodo}::${n.materia.trim().toLowerCase()}`
}

/**
 * Fusiona los fixtures base con cualquier calificación creada o editada en modo demo.
 */
export function obtenerNotasDemoCombinadas(): NotaMateria[] {
  const overlay = leerNotasDemoOverlay()
  if (overlay.length === 0) return NOTAS_FIXTURE

  const mapa = new Map<string, NotaMateria>()
  for (const base of NOTAS_FIXTURE) {
    mapa.set(claveNaturalNota(base), base)
  }
  for (const editada of overlay) {
    const porId = [...mapa.entries()].find(([, val]) => val.id === editada.id)
    if (porId) {
      mapa.delete(porId[0])
    }
    mapa.set(claveNaturalNota(editada), editada)
  }
  return Array.from(mapa.values())
}

/**
 * Consulta las calificaciones oficiales de un estudiante, filtradas opcionalmente por periodo.
 * Si no hay conexión o en modo demo/offline, utiliza los fixtures enriquecidos + ediciones locales.
 */
export async function obtenerNotasEstudiante(
  estudianteId: string,
  periodo?: PeriodoNota,
): Promise<NotaMateria[]> {
  const esDemo =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true'

  if (esDemo || !estudianteId) {
    const combinadas = obtenerNotasDemoCombinadas()
    const fixture = combinadas.filter(
      (n) =>
        (!estudianteId || n.estudianteId === estudianteId) &&
        (!periodo || periodo === 'Anual' || n.periodo === periodo),
    )
    if (fixture.length > 0 || estudianteId) {
      return fixture
    }
    return combinadas.filter((n) => !periodo || periodo === 'Anual' || n.periodo === periodo)
  }

  const segmentoCache = `notas:${estudianteId}:${periodo ?? 'Anual'}`
  const enCache = leerDatoUsuarioScoped<NotaMateria[]>(null, segmentoCache)?.data
  const estaOffline =
    typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean' &&
    !navigator.onLine

  if (estaOffline && enCache) {
    return enCache
  }

  try {
    let query = supabase.from('notas').select('*').eq('estudiante_id', estudianteId)

    if (periodo && periodo !== 'Anual') {
      query = query.eq('periodo', periodo)
    }

    const { data, error } = await query.order('materia', { ascending: true })

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapeadas = (data as FilaNotaRaw[]).map(mapearFilaANota)
      guardarDatoUsuarioScoped(null, segmentoCache, mapeadas)
      registrarSincronizacion(segmentoCache)
      return mapeadas
    }

    if (error && enCache) {
      return enCache
    }

    if (!error && data && data.length === 0) {
      guardarDatoUsuarioScoped(null, segmentoCache, [])
    }

    const combinadas = obtenerNotasDemoCombinadas()
    const delEstudiante = combinadas.filter(
      (n) =>
        n.estudianteId === estudianteId &&
        (!periodo || periodo === 'Anual' || n.periodo === periodo),
    )
    if (delEstudiante.length > 0) return delEstudiante
    return data && data.length === 0
      ? []
      : enCache ?? combinadas.filter((n) => !periodo || periodo === 'Anual' || n.periodo === periodo)
  } catch {
    if (enCache) return enCache
    return obtenerNotasDemoCombinadas().filter(
      (n) =>
        (!estudianteId || n.estudianteId === estudianteId) &&
        (!periodo || periodo === 'Anual' || n.periodo === periodo),
    )
  }
}

export type GuardarNotaPayload = {
  id?: string
  estudianteId: string
  periodo: PeriodoNota
  materia: string
  docente?: string
  notaFinal: number
  rubrica: NotaMateria['rubrica']
  observaciones?: string
}

/**
 * Crea o actualiza una calificación oficial de estudiante.
 * En modo demo persiste en localStorage para reflejarse de inmediato en /estudiante.
 */
export async function guardarNotaEstudiante(
  payload: GuardarNotaPayload,
  docenteId?: string,
): Promise<{ ok: boolean; nota?: NotaMateria; error?: string }> {
  const materiaLimpia = payload.materia.trim()
  if (!payload.estudianteId || !materiaLimpia) {
    return { ok: false, error: 'Indicá el estudiante y la materia.' }
  }
  if (!Number.isFinite(payload.notaFinal) || payload.notaFinal < 0 || payload.notaFinal > 100) {
    return { ok: false, error: 'La nota final debe ubicarse entre 0 y 100.' }
  }

  const notaFinalNormalizada = Math.round(payload.notaFinal * 10) / 10
  const aprobada = notaFinalNormalizada >= 70
  const esDemo =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true'

  if (esDemo) {
    const combinadas = obtenerNotasDemoCombinadas()
    const existente = combinadas.find(
      (n) =>
        (payload.id && n.id === payload.id) ||
        (n.estudianteId === payload.estudianteId &&
          n.periodo === payload.periodo &&
          n.materia.trim().toLowerCase() === materiaLimpia.toLowerCase()),
    )

    const idFinal =
      existente?.id ??
      payload.id ??
      `nota-${payload.estudianteId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    const notaGuardada: NotaMateria = {
      id: idFinal,
      estudianteId: payload.estudianteId,
      periodo: payload.periodo,
      materia: materiaLimpia,
      docente: payload.docente?.trim() || existente?.docente || 'Prof. Dangelo',
      notaFinal: notaFinalNormalizada,
      rubrica: {
        trabajoCotidiano: Math.round(payload.rubrica.trabajoCotidiano * 10) / 10,
        tareas: Math.round(payload.rubrica.tareas * 10) / 10,
        pruebas: Math.round(payload.rubrica.pruebas * 10) / 10,
        proyecto: Math.round(payload.rubrica.proyecto * 10) / 10,
        asistencia: Math.round(payload.rubrica.asistencia * 10) / 10,
      },
      observaciones: payload.observaciones?.trim() || undefined,
      aprobada,
    }

    const overlayActual = leerNotasDemoOverlay().filter(
      (n) =>
        n.id !== idFinal &&
        claveNaturalNota(n) !== claveNaturalNota(notaGuardada),
    )
    guardarNotasDemoOverlay([notaGuardada, ...overlayActual])

    return { ok: true, nota: notaGuardada }
  }

  try {
    const registroSql = {
      estudiante_id: payload.estudianteId,
      periodo: payload.periodo,
      materia: materiaLimpia,
      docente: payload.docente?.trim() || 'Prof. Dangelo',
      ...(docenteId ? { docente_id: docenteId } : {}),
      nota_final: notaFinalNormalizada,
      trabajo_cotidiano: payload.rubrica.trabajoCotidiano,
      tareas: payload.rubrica.tareas,
      pruebas: payload.rubrica.pruebas,
      proyecto: payload.rubrica.proyecto,
      asistencia: payload.rubrica.asistencia,
      observaciones: payload.observaciones?.trim() || null,
    }

    const esUuid =
      Boolean(payload.id) &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id!)

    if (esUuid && payload.id) {
      const { data, error } = await supabase
        .from('notas')
        .update(registroSql)
        .eq('id', payload.id)
        .select('*')
        .maybeSingle()

      if (error) {
        return { ok: false, error: error.message }
      }
      if (data) {
        return { ok: true, nota: mapearFilaANota(data as FilaNotaRaw) }
      }
    }

    const { data: existenteBd } = await supabase
      .from('notas')
      .select('id')
      .eq('estudiante_id', payload.estudianteId)
      .eq('periodo', payload.periodo)
      .ilike('materia', materiaLimpia)
      .maybeSingle()

    if (existenteBd?.id) {
      const { data, error } = await supabase
        .from('notas')
        .update(registroSql)
        .eq('id', existenteBd.id)
        .select('*')
        .single()

      if (error) return { ok: false, error: error.message }
      return { ok: true, nota: mapearFilaANota(data as FilaNotaRaw) }
    }

    const { data, error } = await supabase
      .from('notas')
      .insert([registroSql])
      .select('*')
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }
    return { ok: true, nota: mapearFilaANota(data as FilaNotaRaw) }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'No se pudo guardar la calificación.',
    }
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
