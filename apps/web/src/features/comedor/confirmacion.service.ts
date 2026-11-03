import { supabase } from '@/lib/supabase'

export interface ConfirmacionComedor {
  id: string
  estudiante_id: string
  fecha: string
  asistencia: boolean
  actualizado_el: string
}

export interface MetricasComedor {
  fecha: string
  totalConfirmadosComeran: number
  totalConfirmadosNoComeran: number
  totalRespuestas: number
  porcentajeAsistencia: number
  porEspecialidad: Record<string, { comeran: number; noComeran: number }>
  porSeccion: Record<string, { comeran: number; noComeran: number }>
}

export interface EstadoVentanaConfirmacion {
  abierto: boolean
  motivo?: string
  fechaServicio: Date
  fechaServicioStr: string
  esParaManana: boolean
}

const CLAVE_STORAGE_PREFIX = 'studenthub_confirmacion_comedor_'

// Configuración de la Ventana Horaria de la Sección Nocturna
export const HORA_APERTURA_PREVIA = 20 // 8:00 PM del día previo
export const HORA_CIERRE = 17          // 5:00 PM del mismo día
export const MINUTO_CIERRE = 30        // :30 PM (5:30 PM)

/**
 * Obtiene la fecha en formato local YYYY-MM-DD.
 */
export function fechaAClaveLocal(fecha: Date = new Date()): string {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

/**
 * Determina la fecha exacta del servicio de comedor (cena) según la hora de consulta:
 * - A partir de las 8:00 PM (>= 20:00), aplica para el día siguiente hábil.
 * - Antes de las 8:00 PM en días hábiles (Lunes a Viernes), aplica para el día actual.
 * - Fines de semana o viernes noche aplica para el lunes.
 */
export function calcularFechaServicio(ahora: Date = new Date()): {
  fechaServicio: Date
  fechaServicioStr: string
  esParaManana: boolean
} {
  const fechaRef = ahora instanceof Date && !isNaN(ahora.getTime()) ? ahora : new Date()
  const diaSemana = fechaRef.getDay() // 0 = Dom, 1 = Lun, ..., 5 = Vie, 6 = Sab
  const minutos = fechaRef.getHours() * 60 + fechaRef.getMinutes()
  const minutosApertura = HORA_APERTURA_PREVIA * 60 // 1200 (8:00 PM)

  const d = new Date(fechaRef.getFullYear(), fechaRef.getMonth(), fechaRef.getDate())

  if (minutos >= minutosApertura) {
    if (diaSemana === 5) {
      // Viernes después de las 8:00 PM -> próximo servicio es Lunes (+3 días)
      d.setDate(d.getDate() + 3)
    } else if (diaSemana === 6) {
      // Sábado después de las 8:00 PM -> próximo servicio es Lunes (+2 días)
      d.setDate(d.getDate() + 2)
    } else {
      // Domingo a Jueves noche -> siguiente día hábil (+1 día)
      d.setDate(d.getDate() + 1)
    }
    return {
      fechaServicio: d,
      fechaServicioStr: fechaAClaveLocal(d),
      esParaManana: true,
    }
  }

  // Antes de las 8:00 PM:
  if (diaSemana === 6) {
    // Sábado durante el día -> próximo servicio es Lunes (+2 días)
    d.setDate(d.getDate() + 2)
    return {
      fechaServicio: d,
      fechaServicioStr: fechaAClaveLocal(d),
      esParaManana: true,
    }
  }

  if (diaSemana === 0) {
    // Domingo durante el día -> próximo servicio es Lunes (+1 día)
    d.setDate(d.getDate() + 1)
    return {
      fechaServicio: d,
      fechaServicioStr: fechaAClaveLocal(d),
      esParaManana: true,
    }
  }

  // Lunes a Viernes antes de las 8:00 PM: servicio del mismo día
  return {
    fechaServicio: d,
    fechaServicioStr: fechaAClaveLocal(d),
    esParaManana: false,
  }
}

/**
 * Valida si la ventana de confirmación para la Sección Nocturna está abierta:
 * - Abre a las 8:00 PM (20:00) del día previo.
 * - Cierra a las 5:30 PM (17:30) del mismo día del servicio.
 * - Bloquea entre 5:31 PM y 7:59 PM (17:31 - 19:59) por preparación de cocina.
 * - Contempla dinámica de fines de semana (domingo 8:00 PM abre para el lunes).
 */
export function esHorarioConfirmacionAbierto(ahora: Date = new Date()): EstadoVentanaConfirmacion {
  const diaSemana = ahora.getDay()
  const minutos = ahora.getHours() * 60 + ahora.getMinutes()
  const minutosApertura = HORA_APERTURA_PREVIA * 60 // 1200 (8:00 PM)
  const minutosCierre = HORA_CIERRE * 60 + MINUTO_CIERRE // 1050 (5:30 PM)

  const infoServicio = calcularFechaServicio(ahora)

  // 1. Noche (>= 20:00 / 8:00 PM)
  if (minutos >= minutosApertura) {
    // Viernes o Sábado noche: cerrado para el fin de semana
    if (diaSemana === 5 || diaSemana === 6) {
      return {
        abierto: false,
        motivo: 'El servicio de comedor no está activo los fines de semana. La confirmación para el lunes abrirá el domingo a las 8:00 PM.',
        ...infoServicio,
      }
    }

    // Domingo a Jueves a partir de las 8:00 PM: ventana abierta para el día siguiente hábil
    return {
      abierto: true,
      ...infoServicio,
    }
  }

  // 2. Fines de semana durante el día (Sábado todo el día o Domingo antes de 20:00)
  if (diaSemana === 6) {
    return {
      abierto: false,
      motivo: 'El servicio de comedor no está activo los fines de semana. La confirmación para el lunes abrirá el domingo a las 8:00 PM.',
      ...infoServicio,
    }
  }

  if (diaSemana === 0) {
    return {
      abierto: false,
      motivo: 'El servicio de comedor no está activo los fines de semana. La confirmación para el lunes abrirá hoy a las 8:00 PM.',
      ...infoServicio,
    }
  }

  // 3. Días hábiles lectivos (Lunes a Viernes)
  // De 00:00 a 17:30 (5:30 PM): ABIERTO para el servicio de hoy
  if (minutos <= minutosCierre) {
    return {
      abierto: true,
      ...infoServicio,
    }
  }

  // De 17:31 a 19:59: CERRADO
  if (diaSemana === 5) {
    return {
      abierto: false,
      motivo: 'El registro para la cena de hoy cerró a las 5:30 PM. La confirmación para el lunes abrirá el domingo a las 8:00 PM.',
      ...infoServicio,
    }
  }

  return {
    abierto: false,
    motivo: 'El registro para la cena de hoy cerró a las 5:30 PM por preparación de cocina. La confirmación para el día de mañana abrirá a las 8:00 PM.',
    ...infoServicio,
  }
}

/**
 * Consulta la confirmación de un estudiante para una fecha determinada (por defecto la fecha del servicio activo).
 */
export async function obtenerConfirmacionEstudiante(
  estudianteId: string,
  fechaStr?: string,
): Promise<ConfirmacionComedor | null> {
  if (!estudianteId) return null
  const fechaDestino = fechaStr || calcularFechaServicio().fechaServicioStr

  // 1. Intentar consultar en Supabase
  try {
    const { data, error } = await supabase
      .from('confirmaciones_comedor')
      .select('id, estudiante_id, fecha, asistencia, actualizado_el')
      .eq('estudiante_id', estudianteId)
      .eq('fecha', fechaDestino)
      .maybeSingle()

    if (!error && data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${CLAVE_STORAGE_PREFIX}${estudianteId}_${fechaDestino}`, JSON.stringify(data))
      }
      return data as ConfirmacionComedor
    }
  } catch {
    // Si la tabla no existe aún o falla la red, usar fallback local
  }

  // 2. Fallback a almacenamiento local
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${CLAVE_STORAGE_PREFIX}${estudianteId}_${fechaDestino}`)
      if (raw) return JSON.parse(raw) as ConfirmacionComedor
    } catch {
      // Ignorar errores de parseo
    }
  }

  return null
}

/**
 * Registra o actualiza la confirmación de asistencia del estudiante para la fecha del servicio activo.
 */
export async function guardarConfirmacionEstudiante(
  estudianteId: string,
  asistencia: boolean,
  fechaStr?: string,
): Promise<{ ok: boolean; confirmacion?: ConfirmacionComedor; error?: string }> {
  if (!estudianteId) {
    return { ok: false, error: 'Identificador de estudiante requerido.' }
  }

  const fechaDestino = fechaStr || calcularFechaServicio().fechaServicioStr

  const nuevoRegistro: ConfirmacionComedor = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conf-${Date.now()}`,
    estudiante_id: estudianteId,
    fecha: fechaDestino,
    asistencia,
    actualizado_el: new Date().toISOString(),
  }

  // Guardar inmediatamente en localStorage (UI optimista)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `${CLAVE_STORAGE_PREFIX}${estudianteId}_${fechaDestino}`,
        JSON.stringify(nuevoRegistro),
      )
      window.dispatchEvent(new CustomEvent('studenthub:confirmacion-comedor-actualizada'))
    } catch {
      // Silencioso
    }
  }

  // Persistir en Supabase bajo RLS
  try {
    const { data, error } = await supabase
      .from('confirmaciones_comedor')
      .upsert(
        {
          estudiante_id: estudianteId,
          fecha: fechaDestino,
          asistencia,
          actualizado_el: new Date().toISOString(),
        },
        { onConflict: 'estudiante_id,fecha' },
      )
      .select()
      .maybeSingle()

    if (error) {
      console.warn('Fallo al persistir confirmación en Supabase:', error.message)
      // Aunque falle Supabase por red temporal, se conservó localmente
      return { ok: true, confirmacion: nuevoRegistro }
    }

    if (data) {
      const confirmado = data as ConfirmacionComedor
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `${CLAVE_STORAGE_PREFIX}${estudianteId}_${fechaDestino}`,
          JSON.stringify(confirmado),
        )
      }
      return { ok: true, confirmacion: confirmado }
    }
  } catch (err) {
    console.warn('Error de red al guardar confirmación en base de datos:', err)
  }

  return { ok: true, confirmacion: nuevoRegistro }
}

/**
 * Consulta métricas agregadas reales para una fecha dada (por defecto la fecha del servicio activo).
 */
export async function obtenerMetricasAsistenciaComedor(
  fechaStr?: string,
): Promise<MetricasComedor> {
  const fechaDestino = fechaStr || calcularFechaServicio().fechaServicioStr
  const porEspecialidad: Record<string, { comeran: number; noComeran: number }> = {}
  const porSeccion: Record<string, { comeran: number; noComeran: number }> = {}
  let totalComeran = 0
  let totalNoComeran = 0

  try {
    // Consulta con join a estudiantes para desglose por sección y especialidad
    const { data, error } = await supabase
      .from('confirmaciones_comedor')
      .select('id, estudiante_id, fecha, asistencia, estudiantes(id, especialidad, grupos(codigo))')
      .eq('fecha', fechaDestino)

    if (!error && data) {
      for (const item of data) {
        const asist = Boolean(item.asistencia)
        if (asist) {
          totalComeran++
        } else {
          totalNoComeran++
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const est = item.estudiantes as any
        const esp = est?.especialidad || 'General'
        const sec = est?.grupos?.codigo || 'Sin sección'

        if (!porEspecialidad[esp]) porEspecialidad[esp] = { comeran: 0, noComeran: 0 }
        if (asist) porEspecialidad[esp].comeran++
        else porEspecialidad[esp].noComeran++

        if (!porSeccion[sec]) porSeccion[sec] = { comeran: 0, noComeran: 0 }
        if (asist) porSeccion[sec].comeran++
        else porSeccion[sec].noComeran++
      }
    }
  } catch (err) {
    console.warn('Error al consultar métricas de comedor en Supabase:', err)
  }

  const totalRespuestas = totalComeran + totalNoComeran
  const porcentajeAsistencia =
    totalRespuestas > 0 ? Math.round((totalComeran / totalRespuestas) * 100) : 0

  return {
    fecha: fechaDestino,
    totalConfirmadosComeran: totalComeran,
    totalConfirmadosNoComeran: totalNoComeran,
    totalRespuestas,
    porcentajeAsistencia,
    porEspecialidad,
    porSeccion,
  }
}
