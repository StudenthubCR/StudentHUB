/**
 * Hook de React para gestionar las notificaciones estudiantiles.
 *
 * Expone el estado del permiso actual, la configuración de canales activos
 * y funciones para solicitar permisos, alternar canales y disparar pruebas.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  type EstadoPermisoNotificacion,
  type CanalesNotificacion,
  obtenerEstadoPermiso,
  obtenerCanalesGuardados,
  guardarCanales,
  solicitarPermisoNotificacion,
  emitirNotificacion,
  notificacionesSoportadas,
} from './notificaciones.service'

export function useNotificaciones() {
  /** Estado reactivo del permiso ('default', 'granted', 'denied', 'unsupported') */
  const [permiso, setPermiso] = useState<EstadoPermisoNotificacion>(obtenerEstadoPermiso)
  /** Estado reactivo de los canales seleccionados (comedor, horarios, noticias) */
  const [canales, setCanales] = useState<CanalesNotificacion>(obtenerCanalesGuardados)
  /** Indicador de carga mientras el usuario interactúa con el diálogo del navegador */
  const [cargando, setCargando] = useState(false)

  // Sincroniza el estado cuando la pestaña recobra foco (por si el usuario cambió permisos desde la barra del navegador)
  useEffect(() => {
    const sincronizar = () => {
      setPermiso(obtenerEstadoPermiso())
    }
    window.addEventListener('focus', sincronizar)
    return () => window.removeEventListener('focus', sincronizar)
  }, [])

  /**
   * Solicita el permiso nativo al navegador. Si es concedido,
   * emite automáticamente una notificación de bienvenida y confirmación.
   */
  const solicitarPermiso = useCallback(async () => {
    setCargando(true)
    const nuevoEstado = await solicitarPermisoNotificacion()
    setPermiso(nuevoEstado)
    setCargando(false)

    if (nuevoEstado === 'granted') {
      await emitirNotificacion('¡Notificaciones activadas! 🔔', {
        body: 'A partir de ahora recibirás alertas de comedor, horarios y noticias del colegio.',
        icon: '/SHlogo.svg',
      })
      return true
    }
    return false
  }, [])

  /**
   * Alterna el estado activo/inactivo de un canal específico y persiste el cambio en localStorage.
   */
  const alternarCanal = useCallback((canal: keyof CanalesNotificacion) => {
    setCanales((prev) => {
      const nuevo = { ...prev, [canal]: !prev[canal] }
      guardarCanales(nuevo)
      return nuevo
    })
  }, [])

  /**
   * Dispara una notificación de prueba realista para el canal indicado.
   * Si el permiso aún no ha sido concedido, lo solicita previamente.
   */
  const probarNotificacion = useCallback(
    async (tipo: 'comedor' | 'horarios' | 'noticias') => {
      if (permiso !== 'granted') {
        const concedido = await solicitarPermiso()
        if (!concedido) return false
      }

      switch (tipo) {
        case 'comedor':
          return emitirNotificacion('🍲 Menú del Comedor de Hoy', {
            body: 'Pollo en salsa criolla con arroz, frijoles y ensalada. ¡Buen provecho!',
            icon: '/SHlogo.svg',
          })
        case 'horarios':
          return emitirNotificacion('⏰ Recordatorio de Clases', {
            body: 'Tu próxima lección de Programación comienza en 10 minutos (Aula 12).',
            icon: '/SHlogo.svg',
          })
        case 'noticias':
          return emitirNotificacion('📰 Nueva Noticia del CTP', {
            body: 'Feria Científica 2026: Inscripciones abiertas para todos los niveles.',
            icon: '/SHlogo.svg',
          })
      }
    },
    [permiso, solicitarPermiso],
  )

  return {
    soportado: notificacionesSoportadas(),
    permiso,
    canales,
    cargando,
    notificacionesActivas: permiso === 'granted',
    solicitarPermiso,
    alternarCanal,
    probarNotificacion,
  }
}

