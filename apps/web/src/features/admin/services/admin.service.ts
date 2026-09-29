import { supabase } from '@/lib/supabase'
import {
  obtenerTodosLosAvisosAdmin,
  esUsuarioAdmin,
} from '@/features/avisos/avisos.service'
import type { InstitutionAlert } from '@/features/avisos/avisos.types'
import type {
  ActivityLogItem,
  AdminKpis,
  AlcanceAvisoStat,
  EstudianteDirectorio,
  ModuloAuditoria,
  NoticiaAdmin,
  TipoAccionAuditoria,
} from './admin.types'

const CLAVE_AUDITORIA = 'studenthub_audit_logs_v1'
const CLAVE_NOTICIAS = 'studenthub_noticias_admin_v1'

// ==============================================================================
// 1. REGISTRO DE AUDITORÍA (ACTIVITY LOGS REALES)
// ==============================================================================

let memoriaLogs: ActivityLogItem[] = []

export function obtenerLogsAuditoria(): ActivityLogItem[] {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(CLAVE_AUDITORIA)
      if (raw) {
        const parsed = JSON.parse(raw) as ActivityLogItem[]
        memoriaLogs = Array.isArray(parsed) ? parsed : []
        return memoriaLogs
      }
    } catch {
      // Ignorar errores de parseo
    }
  }
  return memoriaLogs
}

export function registrarActividad(
  accion: TipoAccionAuditoria,
  modulo: ModuloAuditoria,
  descripcion: string,
  autor: string,
  detalles?: string,
): ActivityLogItem {
  const nuevoLog: ActivityLogItem = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
    accion,
    modulo,
    descripcion,
    detalles,
    autor,
    timestamp: new Date().toISOString(),
  }

  const actuales = obtenerLogsAuditoria()
  const actualizados = [nuevoLog, ...actuales].slice(0, 50)
  memoriaLogs = actualizados

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_AUDITORIA, JSON.stringify(actualizados))
    } catch {
      // Ignorar
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studenthub:admin-activity-updated'))
  }

  return nuevoLog
}

// ==============================================================================
// 2. MÉTRICAS GENERALES (KPIS REALES DESDE BASE DE DATOS)
// ==============================================================================

export async function obtenerMetricasAdmin(): Promise<AdminKpis> {
  let totalEstudiantes = 0
  let estudiantesActivos = 0
  let avisosVigentes = 0
  let avisosTotales = 0
  let reportesPendientes = 0
  let accionesHoy = 0

  // 1. Consultar conteo exacto de estudiantes en Supabase
  try {
    const { count: total, error: errTotal } = await supabase
      .from('estudiantes')
      .select('*', { count: 'exact', head: true })

    if (!errTotal && total !== null) {
      totalEstudiantes = total
    }

    const { count: activos, error: errActivos } = await supabase
      .from('estudiantes')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activo')

    if (!errActivos && activos !== null) {
      estudiantesActivos = activos
    }
  } catch (err) {
    console.warn('Error al consultar estadísticas de estudiantes:', err)
  }

  // 2. Consultar conteo exacto de avisos en Supabase
  try {
    const avisos = await obtenerTodosLosAvisosAdmin()
    avisosTotales = avisos.length

    const ahora = new Date()
    avisosVigentes = avisos.filter(
      (a) => a.active && (!a.expires_at || new Date(a.expires_at) > ahora),
    ).length

    // Reportes / incidencias urgentes vigentes
    reportesPendientes = avisos.filter(
      (a) =>
        a.active &&
        a.priority === 'urgent' &&
        (!a.expires_at || new Date(a.expires_at) > ahora),
    ).length
  } catch (err) {
    console.warn('Error al consultar estadísticas de avisos:', err)
  }

  // 3. Conteo de actividad real registrada en las últimas 24 horas
  try {
    const logs = obtenerLogsAuditoria()
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    accionesHoy = logs.filter((l) => new Date(l.timestamp) >= hace24h).length
  } catch {
    accionesHoy = 0
  }

  return {
    totalEstudiantes,
    estudiantesActivos,
    avisosVigentes,
    avisosTotales,
    reportesPendientes,
    accionesHoy,
  }
}

export function calcularAlcanceAviso(aviso: InstitutionAlert, totalEstudiantes: number): AlcanceAvisoStat {
  let alcanceTexto = 'Toda la institución'
  let porcentaje = 100
  let destinatariosAprox = totalEstudiantes

  if (totalEstudiantes <= 0) {
    return {
      id: aviso.id,
      titulo: aviso.title,
      categoria: aviso.category,
      prioridad: aviso.priority,
      alcanceTexto,
      porcentaje: 0,
      destinatariosAprox: 0,
      fecha: aviso.created_at,
      activa: Boolean(aviso.active),
    }
  }

  if (aviso.target_type === 'specialty') {
    const cant = aviso.target_values.length
    alcanceTexto = `Especialidad: ${aviso.target_values.join(', ')}`
    porcentaje = Math.min(100, Math.round((cant / 7) * 100))
    destinatariosAprox = Math.round((totalEstudiantes * porcentaje) / 100)
  } else if (aviso.target_type === 'section') {
    const cant = aviso.target_values.length
    alcanceTexto = `Sección: ${aviso.target_values.join(', ')}`
    porcentaje = Math.min(100, Math.round((cant / 9) * 100))
    destinatariosAprox = Math.round((totalEstudiantes * porcentaje) / 100)
  }

  const estaActivo = aviso.active && (!aviso.expires_at || new Date(aviso.expires_at) > new Date())

  return {
    id: aviso.id,
    titulo: aviso.title,
    categoria: aviso.category,
    prioridad: aviso.priority,
    alcanceTexto,
    porcentaje,
    destinatariosAprox,
    fecha: aviso.created_at,
    activa: estaActivo,
  }
}

// ==============================================================================
// 3. DIRECTORIO ESTUDIANTIL REAL (CONSULTA ACTIVA A SUPABASE)
// ==============================================================================

export async function obtenerEstudiantesDirectorio(): Promise<EstudianteDirectorio[]> {
  try {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('id, codigo, correo, nombre, especialidad, estado, created_at, grupos(codigo)')
      .order('nombre', { ascending: true })

    if (!error && data && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((item: any) => ({
        id: item.id || item.codigo,
        codigo: item.codigo,
        cedula: item.codigo,
        nombre: item.nombre,
        correo: item.correo,
        especialidad: item.especialidad || 'Tronco Común',
        seccion: item.grupos?.codigo || 'Sin sección',
        estado: item.estado === 'activo' ? 'activo' : 'inactivo',
        fechaIngreso: item.created_at ? item.created_at.split('T')[0] : '',
      }))
    }
  } catch (err) {
    console.error('Error al consultar directorio de estudiantes:', err)
  }

  // Cero datos inventados: devuelve lista vacía si no hay registros en la base de datos
  return []
}

export async function actualizarEstudianteDirectorio(
  id: string,
  cambios: { seccion?: string; especialidad?: string; estado?: 'activo' | 'inactivo' },
  correoAdmin: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!esUsuarioAdmin(correoAdmin)) {
    return { ok: false, error: 'Permisos insuficientes.' }
  }

  try {
    const camposActualizar: Record<string, string> = {}
    if (cambios.especialidad) camposActualizar.especialidad = cambios.especialidad
    if (cambios.estado) camposActualizar.estado = cambios.estado

    // Si hay cambio de sección, resolver el grupo_id correspondiente
    if (cambios.seccion) {
      const { data: grupoData } = await supabase
        .from('grupos')
        .select('id')
        .eq('codigo', cambios.seccion)
        .maybeSingle()

      if (grupoData?.id) {
        camposActualizar.grupo_id = grupoData.id
      }
    }

    if (Object.keys(camposActualizar).length > 0) {
      const { error } = await supabase
        .from('estudiantes')
        .update(camposActualizar)
        .or(`id.eq.${id},codigo.eq.${id}`)

      if (error) {
        return { ok: false, error: error.message }
      }
    }

    // Registrar auditoría de la reubicación
    const detallesCambio = [
      cambios.seccion ? `Sección: ${cambios.seccion}` : null,
      cambios.especialidad ? `Especialidad: ${cambios.especialidad}` : null,
      cambios.estado ? `Estado: ${cambios.estado}` : null,
    ]
      .filter(Boolean)
      .join(' | ')

    registrarActividad(
      'reasignar_estudiante',
      'estudiantes',
      `Reubicación de estudiante ID: ${id}`,
      correoAdmin,
      detallesCambio,
    )

    return { ok: true }
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error al actualizar estudiante' }
  }
}

// ==============================================================================
// 4. GESTOR DE NOTICIAS REAL
// ==============================================================================

let memoriaNoticias: NoticiaAdmin[] = []

export function obtenerNoticiasAdmin(): NoticiaAdmin[] {
  if (typeof localStorage !== 'undefined') {
    try {
      const guardadas = localStorage.getItem(CLAVE_NOTICIAS)
      if (guardadas) {
        const parsed = JSON.parse(guardadas)
        if (Array.isArray(parsed)) {
          memoriaNoticias = parsed as NoticiaAdmin[]
          return memoriaNoticias
        }
      }
    } catch {
      // Ignorar
    }
  }

  return memoriaNoticias
}

export function guardarNoticiaAdmin(
  noticia: Omit<NoticiaAdmin, 'id'> & { id?: string },
  correoAdmin: string,
): { ok: boolean; noticia: NoticiaAdmin; error?: string } {
  if (!esUsuarioAdmin(correoAdmin)) {
    return { ok: false, error: 'Permisos insuficientes.', noticia: noticia as NoticiaAdmin }
  }

  const noticias = obtenerNoticiasAdmin()
  const esEdicion = Boolean(noticia.id)

  const idFinal =
    noticia.id ||
    (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `noticia-${Date.now()}`)

  const noticiaGuardada: NoticiaAdmin = {
    id: idFinal,
    titulo: noticia.titulo.trim(),
    resumen: noticia.resumen.trim(),
    cuerpo: noticia.cuerpo.trim(),
    imagen: noticia.imagen.trim(),
    destacada: Boolean(noticia.destacada),
    publicada: Boolean(noticia.publicada),
    fechaPublicacion: noticia.fechaPublicacion || new Date().toISOString(),
    periodo: noticia.periodo || '2026',
    autor: correoAdmin,
  }

  let actualizadas: NoticiaAdmin[]
  if (esEdicion) {
    actualizadas = noticias.map((n) => (n.id === idFinal ? noticiaGuardada : n))
  } else {
    actualizadas = [noticiaGuardada, ...noticias]
  }

  memoriaNoticias = actualizadas

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(actualizadas))
    } catch {
      // Ignorar
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studenthub:admin-noticias-updated'))
  }

  registrarActividad(
    esEdicion ? 'editar_noticia' : 'crear_noticia',
    'noticias',
    `${esEdicion ? 'Edición' : 'Creación'} de noticia: "${noticiaGuardada.titulo}"`,
    correoAdmin,
    `Destacada: ${noticiaGuardada.destacada ? 'Sí' : 'No'} | Periodo: ${noticiaGuardada.periodo}`,
  )

  return { ok: true, noticia: noticiaGuardada }
}

export function eliminarNoticiaAdmin(id: string, correoAdmin: string): boolean {
  if (!esUsuarioAdmin(correoAdmin)) return false

  const noticias = obtenerNoticiasAdmin()
  const encontrada = noticias.find((n) => n.id === id)
  const filtradas = noticias.filter((n) => n.id !== id)

  memoriaNoticias = filtradas

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(filtradas))
    } catch {
      // Ignorar
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studenthub:admin-noticias-updated'))
  }

  if (encontrada) {
    registrarActividad(
      'eliminar_noticia',
      'noticias',
      `Eliminación de noticia: "${encontrada.titulo}"`,
      correoAdmin,
    )
  }

  return true
}

export function toggleDestacadaNoticia(id: string, correoAdmin: string): boolean {
  if (!esUsuarioAdmin(correoAdmin)) return false
  const noticias = [...obtenerNoticiasAdmin()]
  const indice = noticias.findIndex((n) => n.id === id)
  if (indice === -1) return false

  const noticia = { ...noticias[indice]!, destacada: !noticias[indice]!.destacada }
  noticias[indice] = noticia
  memoriaNoticias = noticias

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(noticias))
    } catch {
      // Ignorar
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studenthub:admin-noticias-updated'))
  }

  registrarActividad(
    'editar_noticia',
    'noticias',
    `Noticia "${noticia.titulo}" marcada como ${noticia.destacada ? 'Destacada' : 'Normal'}`,
    correoAdmin,
  )

  return true
}
