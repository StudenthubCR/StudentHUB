import { supabase } from '@/lib/supabase'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import type { CategoriaAviso, InstitutionAlert, NuevoAvisoPayload } from './avisos.types'
import {
  agregarNotificacion,
  obtenerNotificaciones,
  guardarNotificaciones,
  type CategoriaNotificacion,
  type NotificacionItem,
} from '@/features/notificaciones/notificaciones.service'

const CLAVE_STORAGE = 'studenthub_avisos_institucionales_v1'
const CLAVE_DESCARTADOS = 'studenthub_avisos_descartados_v1'

/**
 * REGLA DE SEGURIDAD FUNDAMENTAL:
 * Ningún estudiante puede publicar avisos en la aplicación.
 * ÚNICAMENTE la cuenta institucional studenthub.cr@gmail.com tiene permisos de administración.
 */
export const CORREO_ADMIN_UNICO = 'studenthub.cr@gmail.com'

export function esUsuarioAdmin(correo: string | null | undefined): boolean {
  if (!correo) return false
  return correo.trim().toLowerCase() === CORREO_ADMIN_UNICO
}

export const ESPECIALIDADES_CTP = [
  'Desarrollo Web',
  'Contabilidad',
  'Electromecánica',
  'Secretariado Ejecutivo',
  'Ciberseguridad',
  'Administración Logística',
  'Diseño Publicitario',
] as const

export const SECCIONES_CTP = [
  '10-1',
  '10-2',
  '10-3',
  '11-1',
  '11-2',
  '11-3',
  '12-1',
  '12-2',
  '12-3',
] as const
export async function obtenerAvisos(): Promise<InstitutionAlert[]> {
  try {
    const { data, error } = await supabase
      .from('institution_alerts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(data))
      }
      return data as InstitutionAlert[]
    }
  } catch {
    // Si la tabla no está creada aún o falla la red, usar almacenamiento local
  }

  return cargarAvisosLocales()
}

function cargarAvisosLocales(): InstitutionAlert[] {
  if (typeof window === 'undefined') return []
  try {
    const guardados = localStorage.getItem(CLAVE_STORAGE)
    if (!guardados) return []
    return JSON.parse(guardados) as InstitutionAlert[]
  } catch {
    return []
  }
}

/**
 * Publicar aviso en Supabase.
 * SEGURIDAD: Solo se procesa si el creador es exactamente studenthub.cr@gmail.com
 * y la base de datos de Supabase confirma la inserción bajo RLS.
 */
export async function crearAviso(
  payload: NuevoAvisoPayload,
  correoCreador: string,
): Promise<{ ok: boolean; aviso?: InstitutionAlert; error?: string }> {
  // 1. Barrera estricta en frontend
  if (!esUsuarioAdmin(correoCreador)) {
    console.error(`[Seguridad] Bloqueado intento no autorizado de publicación por: ${correoCreador}`)
    return {
      ok: false,
      error: 'Operación denegada: Ningún estudiante tiene permisos para publicar comunicados.',
    }
  }

  const nuevoAviso: InstitutionAlert = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `aviso-${Date.now()}`,
    title: payload.title.trim(),
    message: payload.message.trim(),
    category: payload.category,
    priority: payload.priority,
    target_type: payload.target_type,
    target_values: payload.target_type === 'all' ? [] : payload.target_values,
    created_by: correoCreador.trim().toLowerCase(),
    created_at: new Date().toISOString(),
    expires_at: payload.expires_at || null,
    active: true,
  }

  // 2. Persistir en Supabase (validado por RLS en PostgreSQL)
  const { data, error } = await supabase
    .from('institution_alerts')
    .insert([nuevoAviso])
    .select()
    .maybeSingle()

  if (error) {
    console.error('[Seguridad] Supabase rechazó la inserción:', error.message)
    return { ok: false, error: `Error en base de datos: ${error.message}` }
  }

  if (data) {
    nuevoAviso.id = data.id
  }

  // 3. Sincronizar copia local SOLO si Supabase aprobó la transacción
  if (typeof window !== 'undefined') {
    const actuales = cargarAvisosLocales().filter((a) => a.id !== nuevoAviso.id)
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify([nuevoAviso, ...actuales]))
    window.dispatchEvent(new CustomEvent('studenthub:avisos-actualizados'))

    // 4. Disparar notificación estudiantil local inmediata
    try {
      const notificacion = convertirAvisoANotificacion(nuevoAviso)
      agregarNotificacion(notificacion, true)
      window.dispatchEvent(new Event('studenthub:notificaciones-actualizadas'))
    } catch (e) {
      console.warn('Error al despachar notificación local de aviso:', e)
    }
  }

  return { ok: true, aviso: nuevoAviso }
}

export function descartarAvisoLocal(id: string) {
  if (typeof window === 'undefined') return
  try {
    const descartados = obtenerAvisosDescartados()
    if (!descartados.includes(id)) {
      descartados.push(id)
      localStorage.setItem(CLAVE_DESCARTADOS, JSON.stringify(descartados))
      window.dispatchEvent(new CustomEvent('studenthub:avisos-actualizados'))
    }
  } catch {
    // Silencioso
  }
}

export function obtenerAvisosDescartados(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE_DESCARTADOS)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export async function eliminarAviso(id: string, correoUsuario: string): Promise<boolean> {
  if (!esUsuarioAdmin(correoUsuario)) {
    console.error(`[Seguridad] Intento no autorizado de eliminación por: ${correoUsuario}`)
    return false
  }

  try {
    await supabase.from('institution_alerts').delete().eq('id', id)
  } catch {
    // Silencioso
  }

  if (typeof window !== 'undefined') {
    const actuales = cargarAvisosLocales().filter((a) => a.id !== id)
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(actuales))
    window.dispatchEvent(new CustomEvent('studenthub:avisos-actualizados'))
  }

  return true
}

export async function actualizarAviso(
  id: string,
  payload: Partial<NuevoAvisoPayload> & { active?: boolean; expires_at?: string | null },
  correoUsuario: string,
): Promise<{ ok: boolean; aviso?: InstitutionAlert; error?: string }> {
  if (!esUsuarioAdmin(correoUsuario)) {
    return { ok: false, error: 'Operación denegada: Solo el administrador puede modificar comunicados.' }
  }

  const actuales = cargarAvisosLocales()
  const indice = actuales.findIndex((a) => a.id === id)
  if (indice === -1) {
    return { ok: false, error: 'Aviso no encontrado.' }
  }

  const avisoActualizado: InstitutionAlert = {
    ...actuales[indice]!,
    ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
    ...(payload.message !== undefined ? { message: payload.message.trim() } : {}),
    ...(payload.category !== undefined ? { category: payload.category } : {}),
    ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
    ...(payload.target_type !== undefined ? { target_type: payload.target_type } : {}),
    ...(payload.target_values !== undefined
      ? { target_values: payload.target_type === 'all' ? [] : payload.target_values }
      : {}),
    ...(payload.expires_at !== undefined ? { expires_at: payload.expires_at } : {}),
    ...(payload.active !== undefined ? { active: payload.active } : {}),
  }

  try {
    await supabase
      .from('institution_alerts')
      .update({
        title: avisoActualizado.title,
        message: avisoActualizado.message,
        category: avisoActualizado.category,
        priority: avisoActualizado.priority,
        target_type: avisoActualizado.target_type,
        target_values: avisoActualizado.target_values,
        expires_at: avisoActualizado.expires_at,
        active: avisoActualizado.active,
      })
      .eq('id', id)
  } catch {
    // Si Supabase falla por red o modo local, continúa persistiendo en storage
  }

  if (typeof window !== 'undefined') {
    actuales[indice] = avisoActualizado
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(actuales))
    window.dispatchEvent(new CustomEvent('studenthub:avisos-actualizados'))
  }

  return { ok: true, aviso: avisoActualizado }
}

export async function desactivarAviso(id: string, correoUsuario: string): Promise<boolean> {
  if (!esUsuarioAdmin(correoUsuario)) return false
  const res = await actualizarAviso(
    id,
    { active: false, expires_at: new Date().toISOString() },
    correoUsuario,
  )
  return res.ok
}

export async function duplicarAviso(
  id: string,
  correoUsuario: string,
): Promise<{ ok: boolean; aviso?: InstitutionAlert; error?: string }> {
  if (!esUsuarioAdmin(correoUsuario)) {
    return { ok: false, error: 'Operación denegada.' }
  }
  const actuales = cargarAvisosLocales()
  const original = actuales.find((a) => a.id === id)
  if (!original) return { ok: false, error: 'Aviso original no encontrado.' }

  const payload: NuevoAvisoPayload = {
    title: `${original.title} (Copia)`,
    message: original.message,
    category: original.category,
    priority: original.priority,
    target_type: original.target_type,
    target_values: [...original.target_values],
    expires_at: null,
  }

  return crearAviso(payload, correoUsuario)
}

export async function obtenerTodosLosAvisosAdmin(): Promise<InstitutionAlert[]> {
  try {
    const { data, error } = await supabase
      .from('institution_alerts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(data))
      }
      return data as InstitutionAlert[]
    }
  } catch {
    // Fallback a almacenamiento local
  }

  return cargarAvisosLocales()
}

export function aplicaAvisoAEstudiante(
  aviso: InstitutionAlert | null | undefined,
  estudiante: Estudiante | null | undefined,
  esAdmin = false,
): boolean {
  if (!aviso || !aviso.active) return false

  const ahora = new Date()
  if (aviso.expires_at && new Date(aviso.expires_at) < ahora) {
    return false
  }

  // Los administradores visualizan la totalidad de los avisos
  if (esAdmin) return true

  // Avisos de alcance institucional general aplican a todos los estudiantes
  if (aviso.target_type === 'all') {
    return true
  }

  // Si el aviso es específico (sección o especialidad) y el estudiante aún no está resuelto, no aplica
  if (!estudiante) {
    return false
  }

  const valoresDestino = Array.isArray(aviso.target_values)
    ? aviso.target_values
    : []

  if (aviso.target_type === 'specialty') {
    const espEstudiante = (estudiante.especialidad ?? '').trim().toLowerCase()
    if (!espEstudiante) return false
    return valoresDestino.some((val) => typeof val === 'string' && val.trim().toLowerCase() === espEstudiante)
  }

  if (aviso.target_type === 'section') {
    const seccionEstudiante = (
      estudiante.grupo ||
      (estudiante as unknown as { seccion?: string })?.seccion ||
      ''
    )
      .trim()
      .toLowerCase()
    if (!seccionEstudiante) return false
    return valoresDestino.some((val) => typeof val === 'string' && val.trim().toLowerCase() === seccionEstudiante)
  }

  return false
}

export function filtrarAvisosParaEstudiante(
  avisos: InstitutionAlert[],
  estudiante: Estudiante | null,
  descartadosIds: string[],
  esAdmin = false,
): InstitutionAlert[] {
  return avisos.filter((aviso) => {
    if (descartadosIds.includes(aviso.id)) return false
    return aplicaAvisoAEstudiante(aviso, estudiante, esAdmin)
  })
}

/**
 * Mapea la categoría de un aviso institucional a una categoría del sistema de notificaciones.
 */
function mapearCategoriaAvisoANotificacion(categoria: CategoriaAviso): CategoriaNotificacion {
  switch (categoria) {
    case 'absence':
      return 'ausencias'
    case 'menu_change':
      return 'comedor'
    case 'early_departure':
      return 'horarios'
    case 'event':
    case 'general':
    default:
      return 'noticias'
  }
}

/**
 * Convierte un aviso institucional en una notificación lista para el buzón del estudiante.
 */
export function convertirAvisoANotificacion(aviso: InstitutionAlert): NotificacionItem {
  return {
    id: `notif-aviso-${aviso.id}`,
    titulo: aviso.title,
    mensaje: aviso.message,
    categoria: mapearCategoriaAvisoANotificacion(aviso.category),
    fechaIso: aviso.created_at,
    leida: false,
    enlace: '/',
    importante: aviso.priority === 'urgent' || aviso.priority === 'warning',
  }
}

/**
 * Sincroniza los avisos vigentes pertinentes al estudiante con su buzón de notificaciones.
 * Asegura que cuando un estudiante abra la app, cualquier aviso nuevo aparezca en su bandeja.
 */
export function sincronizarAvisosConBandeja(
  avisos: InstitutionAlert[],
  estudiante: Estudiante | null,
  esAdmin = false,
): void {
  if (typeof window === 'undefined') return
  try {
    const notificacionesActuales = obtenerNotificaciones()
    const idsExistentes = new Set(notificacionesActuales.map((n) => n.id))

    let huboNuevas = false
    const nuevasNotificaciones: NotificacionItem[] = []

    for (const aviso of avisos) {
      if (!aplicaAvisoAEstudiante(aviso, estudiante, esAdmin)) continue

      const notifId = `notif-aviso-${aviso.id}`
      if (!idsExistentes.has(notifId)) {
        nuevasNotificaciones.push(convertirAvisoANotificacion(aviso))
        huboNuevas = true
      }
    }

    if (huboNuevas) {
      const combinadas = [...nuevasNotificaciones, ...notificacionesActuales]
      guardarNotificaciones(combinadas)
    }
  } catch (err) {
    console.warn('Error al sincronizar avisos con bandeja de notificaciones:', err)
  }
}

export function formatearTiempoAviso(isoString: string): string {
  try {
    const fecha = new Date(isoString)
    const diffMs = Date.now() - fecha.getTime()
    const diffMin = Math.floor(diffMs / (1000 * 60))

    if (diffMin < 1) return 'Justo ahora'
    if (diffMin < 60) return `Hace ${diffMin} min`
    const diffHoras = Math.floor(diffMin / 60)
    if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`
    const diffDias = Math.floor(diffHoras / 24)
    if (diffDias === 1) return 'Ayer'
    return `Hace ${diffDias} días`
  } catch {
    return 'Reciente'
  }
}
