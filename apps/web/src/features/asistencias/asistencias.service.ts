import { supabase } from '@/lib/supabase'
import {
  guardarDatoUsuarioScoped,
  leerDatoUsuarioScoped,
  registrarSincronizacion,
} from '@/lib/offlineCache'
import type {
  EstadoAsistencia,
  PeriodoAsistencia,
  RegistroAsistencia,
  ResumenAsistencias,
} from './asistencias.types'
import { ASISTENCIAS_FIXTURE } from './asistencias.fixture'

export const CLAVE_DEMO_ASISTENCIAS_OVERLAY = 'studenthub_demo_asistencias_v1'

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
 * Retorna la fecha actual en zona horaria America/Costa_Rica en formato ISO YYYY-MM-DD.
 */
export function obtenerFechaHoyCostaRica(referencia: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Costa_Rica',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(referencia)
  } catch {
    return referencia.toISOString().slice(0, 10)
  }
}

function leerAsistenciasDemoOverlay(): RegistroAsistencia[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE_DEMO_ASISTENCIAS_OVERLAY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RegistroAsistencia[]) : []
  } catch {
    return []
  }
}

function guardarAsistenciasDemoOverlay(registros: RegistroAsistencia[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CLAVE_DEMO_ASISTENCIAS_OVERLAY, JSON.stringify(registros))
  } catch (err) {
    console.warn('No se pudo guardar el overlay de asistencias demo:', err)
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('studenthub:asistencias-actualizadas'))
  }
}

function claveNaturalAsistencia(
  r: Pick<RegistroAsistencia, 'estudianteId' | 'fecha' | 'materia' | 'bloque'>,
): string {
  return `${r.estudianteId}::${r.fecha}::${r.materia.trim().toLowerCase()}::${r.bloque.trim().toLowerCase()}`
}

/**
 * Fusiona el fixture base con el registro cronológico guardado en modo demo,
 * ordenado desde la fecha más reciente.
 */
export function obtenerAsistenciasDemoCombinadas(): RegistroAsistencia[] {
  const overlay = leerAsistenciasDemoOverlay()
  if (overlay.length === 0) return ASISTENCIAS_FIXTURE

  const mapa = new Map<string, RegistroAsistencia>()
  for (const base of ASISTENCIAS_FIXTURE) {
    mapa.set(claveNaturalAsistencia(base), base)
  }
  for (const nuevo of overlay) {
    const porId = [...mapa.entries()].find(([, val]) => val.id === nuevo.id)
    if (porId) {
      mapa.delete(porId[0])
    }
    mapa.set(claveNaturalAsistencia(nuevo), nuevo)
  }

  return Array.from(mapa.values()).sort((a, b) => b.fecha.localeCompare(a.fecha))
}

/**
 * Consulta el registro de asistencias de un estudiante, filtrado opcionalmente por periodo.
 * Soporta fallback automático a fixtures y ediciones locales en modo demo.
 */
export async function obtenerAsistenciasEstudiante(
  estudianteId: string,
  periodo?: PeriodoAsistencia,
): Promise<RegistroAsistencia[]> {
  const esDemo =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true'

  if (esDemo || !estudianteId) {
    const combinadas = obtenerAsistenciasDemoCombinadas()
    const fixture = combinadas.filter(
      (a) =>
        (!estudianteId || a.estudianteId === estudianteId) &&
        (!periodo || a.periodo === periodo),
    )
    if (fixture.length > 0 || estudianteId) {
      return fixture
    }
    return combinadas.filter((a) => !periodo || a.periodo === periodo)
  }

  const segmentoCache = `asistencias:${estudianteId}:${periodo ?? 'todas'}`
  const enCache = leerDatoUsuarioScoped<RegistroAsistencia[]>(null, segmentoCache)?.data
  const estaOffline =
    typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean' &&
    !navigator.onLine

  if (estaOffline && enCache) {
    return enCache
  }

  try {
    let query = supabase.from('asistencias').select('*').eq('estudiante_id', estudianteId)

    if (periodo) {
      query = query.eq('periodo', periodo)
    }

    const { data, error } = await query.order('fecha', { ascending: false })

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapeadas = (data as FilaAsistenciaRaw[]).map(mapearFilaAAsistencia)
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

    const combinadas = obtenerAsistenciasDemoCombinadas()
    const delEstudiante = combinadas.filter(
      (a) => a.estudianteId === estudianteId && (!periodo || a.periodo === periodo),
    )
    if (delEstudiante.length > 0) return delEstudiante
    return data && data.length === 0
      ? []
      : enCache ?? combinadas.filter((a) => !periodo || a.periodo === periodo)
  } catch {
    if (enCache) return enCache
    return obtenerAsistenciasDemoCombinadas().filter(
      (a) =>
        (!estudianteId || a.estudianteId === estudianteId) &&
        (!periodo || a.periodo === periodo),
    )
  }
}

export type GuardarAsistenciaInput = Omit<RegistroAsistencia, 'id'> & { id?: string }

/**
 * Guarda uno o varios registros de asistencia del pase de lista docente.
 * En modo demo actualiza localStorage para reflejarse de inmediato en /estudiante.
 */
export async function guardarRegistrosAsistencia(
  registros: GuardarAsistenciaInput[],
  docenteId?: string,
): Promise<{ ok: boolean; guardados: RegistroAsistencia[]; error?: string }> {
  if (!registros || registros.length === 0) {
    return { ok: false, guardados: [], error: 'No hay estudiantes en el pase de lista.' }
  }

  const esDemo =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true'

  if (esDemo) {
    const combinadas = obtenerAsistenciasDemoCombinadas()
    let overlayActual = leerAsistenciasDemoOverlay()
    const guardados: RegistroAsistencia[] = []

    for (const item of registros) {
      const claveItem = claveNaturalAsistencia(item)
      const existente = combinadas.find(
        (a) => (item.id && a.id === item.id) || claveNaturalAsistencia(a) === claveItem,
      )
      const idFinal =
        existente?.id ??
        item.id ??
        `asist-${item.estudianteId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      const registroCompleto: RegistroAsistencia = {
        id: idFinal,
        estudianteId: item.estudianteId,
        fecha: item.fecha,
        periodo: item.periodo,
        materia: item.materia.trim(),
        bloque: item.bloque.trim(),
        estado: item.estado,
        justificacion: item.justificacion?.trim() || undefined,
      }

      overlayActual = overlayActual.filter(
        (a) => a.id !== idFinal && claveNaturalAsistencia(a) !== claveItem,
      )
      overlayActual.unshift(registroCompleto)
      guardados.push(registroCompleto)
    }

    guardarAsistenciasDemoOverlay(overlayActual)
    return { ok: true, guardados }
  }

  try {
    const guardados: RegistroAsistencia[] = []

    for (const item of registros) {
      const filaSql = {
        estudiante_id: item.estudianteId,
        fecha: item.fecha,
        periodo: item.periodo,
        materia: item.materia.trim(),
        bloque: item.bloque.trim(),
        estado: item.estado,
        justificacion: item.justificacion?.trim() || null,
        ...(docenteId ? { docente_id: docenteId } : {}),
      }

      const { data: existente } = await supabase
        .from('asistencias')
        .select('id')
        .eq('estudiante_id', item.estudianteId)
        .eq('fecha', item.fecha)
        .eq('materia', item.materia.trim())
        .eq('bloque', item.bloque.trim())
        .maybeSingle()

      if (existente?.id) {
        const { data, error } = await supabase
          .from('asistencias')
          .update(filaSql)
          .eq('id', existente.id)
          .select('*')
          .single()

        if (error) return { ok: false, guardados, error: error.message }
        guardados.push(mapearFilaAAsistencia(data as FilaAsistenciaRaw))
      } else {
        const { data, error } = await supabase
          .from('asistencias')
          .insert([filaSql])
          .select('*')
          .single()

        if (error) return { ok: false, guardados, error: error.message }
        guardados.push(mapearFilaAAsistencia(data as FilaAsistenciaRaw))
      }
    }

    return { ok: true, guardados }
  } catch (err) {
    return {
      ok: false,
      guardados: [],
      error: err instanceof Error ? err.message : 'No se pudo guardar el pase de lista.',
    }
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

  // Alerta temprana: 3 o más ausencias injustificadas o porcentaje < 85%
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
