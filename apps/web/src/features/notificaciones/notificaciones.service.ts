/**
 * Servicio central de Notificaciones para Student HUB.
 *
 * Administra el ciclo de vida de los permisos nativos de la Web Notification API,
 * la persistencia de preferencias de canales en localStorage y el despacho
 * de alertas visuales mediante Service Worker o fallback directo del navegador.
 */

/** Estados posibles de los permisos de notificación en el navegador */
export type EstadoPermisoNotificacion = 'default' | 'granted' | 'denied' | 'unsupported'

/** Canales temáticos configurables por el estudiante */
export type CanalesNotificacion = {
  comedor: boolean
  horarios: boolean
  noticias: boolean
}

/** Clave de almacenamiento en localStorage para persistir las preferencias */
const CLAVE_STORAGE_CANALES = 'studenthub_notif_canales'

/** Configuración por defecto: todos los canales activos al otorgar permiso */
export const CANALES_POR_DEFECTO: CanalesNotificacion = {
  comedor: true,
  horarios: true,
  noticias: true,
}

/**
 * Comprueba si la API de Notificaciones está soportada en el navegador actual.
 * Devuelve true si el objeto 'Notification' existe en el contexto global window.
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
 * Si no existen preferencias previas, retorna los valores por defecto.
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
 * Guarda las preferencias de canales activos en el almacenamiento local (localStorage).
 * Permite que las elecciones del estudiante persistan entre sesiones de la app.
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
 * Dispara la solicitud nativa de permiso de notificación del navegador.
 * Devuelve el nuevo estado asignado por el usuario ('granted' o 'denied').
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
 * Emite una notificación nativa visible en el sistema operativo o celular.
 *
 * Estrategia de emisión en 2 fases:
 *   1. Intenta mostrarla a través del Service Worker activo (`showNotification`),
 *      lo cual es obligatorio para PWAs en Android/iOS y segundo plano.
 *   2. Si no hay Service Worker disponible, utiliza el constructor estándar `new Notification()`.
 *
 * @param titulo Texto principal de la notificación.
 * @param opciones Configuración adicional (cuerpo, ícono, tag, vibración).
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

