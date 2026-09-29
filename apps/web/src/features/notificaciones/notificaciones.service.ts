/**
 * Servicio central de Notificaciones para Student HUB.
 *
 * Administra:
 *  - El ciclo de vida de los permisos nativos (Web Notification API).
 *  - La persistencia de preferencias de canales temáticos en localStorage.
 *  - El buzón de notificaciones in-app (historial, leídas/no leídas).
 *  - La emisión de alertas visuales mediante Service Worker o fallback del navegador.
 */

/** Estados posibles de los permisos de notificación en el navegador */
export type EstadoPermisoNotificacion = 'default' | 'granted' | 'denied' | 'unsupported'

/** Categorías temáticas para clasificación de alertas */
export type CategoriaNotificacion =
  | 'comedor'
  | 'horarios'
  | 'agenda'
  | 'ausencias'
  | 'noticias'

/** Canales temáticos configurables por el estudiante */
export interface CanalesNotificacion {
  comedor: boolean
  horarios: boolean
  agenda: boolean
  ausencias: boolean
  noticias: boolean
}

/** Estructura de una notificación en la bandeja estudiantil */
export interface NotificacionItem {
  id: string
  titulo: string
  mensaje: string
  categoria: CategoriaNotificacion
  fechaIso: string
  leida: boolean
  enlace?: string
  importante?: boolean
}

import { supabase } from '@/lib/supabase'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import type { InstitutionAlert } from '@/features/avisos/avisos.types'
import {
  aplicaAvisoAEstudiante,
  convertirAvisoANotificacion,
} from '@/features/avisos/avisos.service'

/** Claves de almacenamiento en localStorage */
export const CLAVE_STORAGE_CANALES = 'studenthub_notif_canales'
export const CLAVE_STORAGE_INBOX = 'studenthub_notif_inbox'
export const CLAVE_STORAGE_ULTIMO_ACCESO = 'studenthub_notif_ultimo_acceso'
export const CLAVE_PUSH_SUBSCRIPTION = 'studenthub_push_subscription'

/** Configuración por defecto: todos los canales activos al otorgar permiso */
export const CANALES_POR_DEFECTO: CanalesNotificacion = {
  comedor: true,
  horarios: true,
  agenda: true,
  ausencias: true,
  noticias: true,
}

/** Notificaciones iniciales de bienvenida y contexto para nuevos usuarios */
const NOTIFICACIONES_SEMILLA: NotificacionItem[] = [
  {
    id: 'notif-comedor-hoy',
    titulo: 'Menú del Comedor de Hoy',
    mensaje: 'Casado tradicional con pollo en salsa criolla, frijoles y ensalada rusa. ¡Almuerzo a las 11:30 AM!',
    categoria: 'comedor',
    fechaIso: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // hace 35 min
    leida: false,
    enlace: '/comedor',
  },
  {
    id: 'notif-ausencia-hoy',
    titulo: 'Ausencia Docente Reportada',
    mensaje: 'El profesor de Redes y Telecomunicaciones no asiste hoy por capacitación institucional del MEP.',
    categoria: 'ausencias',
    fechaIso: new Date(Date.now() - 1000 * 60 * 95).toISOString(), // hace 1.5 horas
    leida: false,
    enlace: '/agenda',
    importante: true,
  },
  {
    id: 'notif-agenda-proxima',
    titulo: 'Examen Próximo en Agenda',
    mensaje: 'Recordatorio: Tienes programada la entrega y evaluación de Programación Web para esta semana.',
    categoria: 'agenda',
    fechaIso: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // hace 5 horas
    leida: true,
    enlace: '/agenda',
  },
  {
    id: 'notif-expo-2026',
    titulo: 'Portal ExpoTÉCNICA 2026',
    mensaje: 'Conoce los proyectos estudiantiles y la guía de evaluación para jurados en el módulo especial.',
    categoria: 'noticias',
    fechaIso: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // ayer
    leida: true,
    enlace: '/expo',
  },
]

/**
 * Comprueba si la API de Notificaciones está soportada en el navegador actual.
 */
export function notificacionesSoportadas(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * Obtiene el estado actual del permiso en el navegador:
 * - 'granted': El estudiante ya autorizó notificaciones.
 * - 'denied': El estudiante bloqueó las notificaciones en el navegador.
 * - 'default': Aún no se ha solicitado el permiso (estado pendiente).
 * - 'unsupported': El navegador o dispositivo no soporta la API.
 */
export function obtenerEstadoPermiso(): EstadoPermisoNotificacion {
  if (!notificacionesSoportadas()) {
    return 'unsupported'
  }
  return Notification.permission as EstadoPermisoNotificacion
}

/**
 * Lee la configuración de canales guardada por el estudiante en localStorage.
 */
export function obtenerCanalesGuardados(): CanalesNotificacion {
  if (typeof window === 'undefined') return CANALES_POR_DEFECTO
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE_CANALES)
    if (!raw) return CANALES_POR_DEFECTO
    const parsed = JSON.parse(raw) as Partial<CanalesNotificacion>
    return {
      comedor: parsed.comedor ?? true,
      horarios: parsed.horarios ?? true,
      agenda: parsed.agenda ?? true,
      ausencias: parsed.ausencias ?? true,
      noticias: parsed.noticias ?? true,
    }
  } catch {
    return CANALES_POR_DEFECTO
  }
}

/**
 * Guarda las preferencias de canales activos en localStorage.
 */
export function guardarCanales(canales: CanalesNotificacion): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE_STORAGE_CANALES, JSON.stringify(canales))
    window.dispatchEvent(new Event('studenthub:notificaciones-actualizadas'))
  } catch (err) {
    console.error('Error al guardar canales de notificación:', err)
  }
}

/**
 * Obtiene la lista completa de notificaciones guardadas en la bandeja local.
 */
export function obtenerNotificaciones(): NotificacionItem[] {
  if (typeof window === 'undefined') return NOTIFICACIONES_SEMILLA
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE_INBOX)
    if (!raw) {
      localStorage.setItem(CLAVE_STORAGE_INBOX, JSON.stringify(NOTIFICACIONES_SEMILLA))
      return NOTIFICACIONES_SEMILLA
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : NOTIFICACIONES_SEMILLA
  } catch {
    return NOTIFICACIONES_SEMILLA
  }
}

/**
 * Guarda las notificaciones en localStorage y despacha un evento para reactividad global.
 */
export function guardarNotificaciones(items: NotificacionItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE_STORAGE_INBOX, JSON.stringify(items))
    window.dispatchEvent(new Event('studenthub:notificaciones-actualizadas'))
  } catch (err) {
    console.error('Error al guardar notificaciones:', err)
  }
}

/**
 * Marca una notificación específica como leída.
 */
export function marcarComoLeida(id: string): void {
  const actual = obtenerNotificaciones()
  const actualizado = actual.map((n) => (n.id === id ? { ...n, leida: true } : n))
  guardarNotificaciones(actualizado)
}

/**
 * Marca todas las notificaciones de la bandeja como leídas.
 */
export function marcarTodasComoLeidas(): void {
  const actual = obtenerNotificaciones()
  const actualizado = actual.map((n) => ({ ...n, leida: true }))
  guardarNotificaciones(actualizado)
}

/**
 * Elimina una notificación individual de la bandeja.
 */
export function eliminarNotificacion(id: string): void {
  const actual = obtenerNotificaciones()
  const actualizado = actual.filter((n) => n.id !== id)
  guardarNotificaciones(actualizado)
}

/**
 * Limpia todo el historial de la bandeja.
 */
export function limpiarTodasNotificaciones(): void {
  guardarNotificaciones([])
}

/**
 * Agrega una nueva notificación al buzón y opcionalmente emite la notificación nativa del SO.
 */
export function agregarNotificacion(
  nueva: Omit<NotificacionItem, 'id' | 'fechaIso' | 'leida'> & {
    id?: string
    leida?: boolean
    fechaIso?: string
  },
  emitirNativa = true,
): NotificacionItem {
  const itemCompleto: NotificacionItem = {
    id: nueva.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fechaIso: nueva.fechaIso || new Date().toISOString(),
    leida: nueva.leida ?? false,
    ...nueva,
  }

  const actual = obtenerNotificaciones()
  const actualizado = [itemCompleto, ...actual.filter((n) => n.id !== itemCompleto.id)]
  guardarNotificaciones(actualizado)

  if (emitirNativa) {
    const canales = obtenerCanalesGuardados()
    if (canales[itemCompleto.categoria]) {
      void emitirNotificacion(itemCompleto.titulo, {
        body: itemCompleto.mensaje,
        icon: '/SHlogo.svg',
      })
    }
  }

  return itemCompleto
}

/**
 * Cuenta la cantidad de notificaciones que no han sido leídas por el estudiante.
 */
export function contarNoLeidas(lista?: NotificacionItem[]): number {
  const notifs = lista ?? obtenerNotificaciones()
  return notifs.filter((n) => !n.leida).length
}

/**
 * Formatea una fecha ISO a un formato relativo legible (ej: 'Hace 15 min', 'Ayer').
 */
export function formatearTiempoRelativo(fechaIso: string): string {
  try {
    const fecha = new Date(fechaIso)
    const diffMs = Date.now() - fecha.getTime()
    const diffSeg = Math.max(0, Math.floor(diffMs / 1000))
    const diffMin = Math.floor(diffSeg / 60)
    const diffHoras = Math.floor(diffMin / 60)
    const diffDias = Math.floor(diffHoras / 24)

    if (diffMin < 1) return 'Ahora mismo'
    if (diffMin < 60) return `Hace ${diffMin} min`
    if (diffHoras < 24) return `Hace ${diffHoras} h`
    if (diffDias === 1) return 'Ayer'
    if (diffDias < 7) return `Hace ${diffDias} días`
    return fecha.toLocaleDateString('es-CR', { month: 'short', day: 'numeric' })
  } catch {
    return 'Reciente'
  }
}

/**
 * Convierte una clave pública VAPID base64 en Uint8Array para Web Push.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Obtiene el registro activo del Service Worker o espera su inicialización.
 */
export async function obtenerRegistroServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    let reg = await navigator.serviceWorker.getRegistration()
    if (!reg && 'register' in navigator.serviceWorker) {
      try {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch {
        // En desarrollo o entornos locales sin sw.js compilado
      }
    }
    if (reg) return reg

    const timeout = new Promise<null>((res) => setTimeout(() => res(null), 1500))
    const listo = await Promise.race([navigator.serviceWorker.ready, timeout])
    return listo || null
  } catch (err) {
    console.warn('Error al verificar registro de Service Worker:', err)
    return null
  }
}

/**
 * Sincroniza la suscripción Web Push (PushSubscription) con el Service Worker si está soportado.
 */
export async function sincronizarSuscripcionWebPush(
  registroExistente?: ServiceWorkerRegistration | null,
): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
  if (!('PushManager' in window)) return null
  if (Notification.permission !== 'granted') return null

  try {
    const reg = registroExistente ?? (await obtenerRegistroServiceWorker())
    if (!reg || !('pushManager' in reg)) return null

    let sub = await reg.pushManager.getSubscription()
    const vapidKey = (import.meta.env as Record<string, string>).VITE_VAPID_PUBLIC_KEY

    if (!sub && vapidKey) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
      })
    }

    if (sub) {
      localStorage.setItem(CLAVE_PUSH_SUBSCRIPTION, JSON.stringify(sub))
    }
    return sub
  } catch (err) {
    console.warn('Advertencia al registrar suscripción Web Push:', err)
    return null
  }
}

/**
 * Sincroniza notificaciones emitidas desde la última conexión del usuario (resiliencia offline).
 */
export async function sincronizarNotificacionesDesdeUltimoAcceso(
  estudiante: Estudiante | null,
  esAdmin = false,
): Promise<NotificacionItem[]> {
  if (typeof window === 'undefined') return []

  const ahora = new Date().toISOString()
  const ultimoAcceso = localStorage.getItem(CLAVE_STORAGE_ULTIMO_ACCESO)
  const notificacionesActuales = obtenerNotificaciones()
  const idsExistentes = new Set(notificacionesActuales.map((n) => n.id))
  const nuevasNotificaciones: NotificacionItem[] = []

  try {
    let query = supabase.from('institution_alerts').select('*').eq('active', true)
    if (ultimoAcceso) {
      query = query.gt('created_at', ultimoAcceso)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      for (const aviso of data as InstitutionAlert[]) {
        if (!aplicaAvisoAEstudiante(aviso, estudiante, esAdmin)) continue
        const notifId = `notif-aviso-${aviso.id}`
        if (!idsExistentes.has(notifId)) {
          const item = convertirAvisoANotificacion(aviso)
          nuevasNotificaciones.push(item)
          idsExistentes.add(notifId)
        }
      }
    }

    if (nuevasNotificaciones.length > 0) {
      const combinadas = [...nuevasNotificaciones, ...notificacionesActuales]
      guardarNotificaciones(combinadas)
    }
  } catch (err) {
    console.warn('Fallo al sincronizar notificaciones offline desde Supabase:', err)
  } finally {
    localStorage.setItem(CLAVE_STORAGE_ULTIMO_ACCESO, ahora)
  }

  return nuevasNotificaciones
}

/**
 * Solicita el permiso nativo de notificación al navegador mediante acción explícita del usuario.
 */
export async function solicitarPermisoNotificacion(): Promise<EstadoPermisoNotificacion> {
  if (!notificacionesSoportadas()) {
    return 'unsupported'
  }

  try {
    const res = await Notification.requestPermission()
    if (res === 'granted') {
      const reg = await obtenerRegistroServiceWorker()
      if (reg) {
        void sincronizarSuscripcionWebPush(reg)
      }
    }
    return res as EstadoPermisoNotificacion
  } catch (err) {
    console.error('Error al solicitar permiso de notificación:', err)
    return 'denied'
  }
}

/**
 * Emite una notificación nativa visible en el sistema operativo o celular.
 */
export async function emitirNotificacion(
  titulo: string,
  opciones?: NotificationOptions,
): Promise<boolean> {
  if (!notificacionesSoportadas()) return false
  if (Notification.permission !== 'granted') return false

  const configCompleta: NotificationOptions = {
    icon: '/SHlogo.svg',
    badge: '/SHlogo.svg',
    tag: 'studenthub-aviso',
    ...opciones,
  }

  try {
    const registro = await obtenerRegistroServiceWorker()
    if (registro && 'showNotification' in registro) {
      await registro.showNotification(titulo, configCompleta)
      return true
    }

    new Notification(titulo, configCompleta)
    return true
  } catch (err) {
    console.warn('Fallo al emitir notificación con Service Worker, intentando fallback directo:', err)
    try {
      new Notification(titulo, configCompleta)
      return true
    } catch (fallbackErr) {
      console.error('No se pudo emitir la notificación:', fallbackErr)
      return false
    }
  }
}
