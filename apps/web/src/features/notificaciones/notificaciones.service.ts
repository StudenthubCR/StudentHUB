export type EstadoPermisoNotificacion = 'default' | 'granted' | 'denied' | 'unsupported'

export type CanalesNotificacion = {
  comedor: boolean
  horarios: boolean
  noticias: boolean
}

const CLAVE_STORAGE_CANALES = 'studenthub_notif_canales'

export const CANALES_POR_DEFECTO: CanalesNotificacion = {
  comedor: true,
  horarios: true,
  noticias: true,
}

/**
 * Comprueba si la API de Notificaciones está soportada en el navegador actual.
 */
export function notificacionesSoportadas(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * Obtiene el estado actual del permiso en el navegador.
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
      noticias: parsed.noticias ?? true,
    }
  } catch {
    return CANALES_POR_DEFECTO
  }
}

/**
 * Guarda las preferencias de canales en localStorage.
 */
export function guardarCanales(canales: CanalesNotificacion): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE_STORAGE_CANALES, JSON.stringify(canales))
  } catch (err) {
    console.error('Error al guardar canales de notificación:', err)
  }
}

/**
 * Solicita el permiso nativo de notificaciones al navegador.
 */
export async function solicitarPermisoNotificacion(): Promise<EstadoPermisoNotificacion> {
  if (!notificacionesSoportadas()) {
    return 'unsupported'
  }

  try {
    const res = await Notification.requestPermission()
    return res as EstadoPermisoNotificacion
  } catch (err) {
    console.error('Error al solicitar permiso de notificación:', err)
    return 'denied'
  }
}

/**
 * Envía una notificación nativa utilizando el Service Worker o el constructor Notification.
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
    // 1. Intentar mediante el Service Worker si está registrado (recomendado en PWA y móviles)
    if ('serviceWorker' in navigator) {
      const registro = await navigator.serviceWorker.getRegistration()
      if (registro && 'showNotification' in registro) {
        await registro.showNotification(titulo, configCompleta)
        return true
      }
    }

    // 2. Fallback mediante el constructor nativo de Notification
    new Notification(titulo, configCompleta)
    return true
  } catch (err) {
    console.warn('Fallo al emitir notificación, intentando fallback directo:', err)
    try {
      new Notification(titulo, configCompleta)
      return true
    } catch (fallbackErr) {
      console.error('No se pudo emitir la notificación:', fallbackErr)
      return false
    }
  }
}
