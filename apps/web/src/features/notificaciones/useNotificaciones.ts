/**
 * Hook de React para gestionar las notificaciones estudiantiles.
 *
 * Expone:
 *  - El estado del permiso actual ('granted', 'denied', 'default', 'unsupported')
 *  - La bandeja de notificaciones en tiempo real (con conteo de no leídas)
 *  - Configuración de canales temáticos activos
 *  - Funciones para marcar como leídas, eliminar y emitir pruebas
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { useSesion } from '@/features/auth/useSesion'
import {
  aplicaAvisoAEstudiante,
  convertirAvisoANotificacion,
  esUsuarioAdmin,
} from '@/features/avisos/avisos.service'
import type { InstitutionAlert } from '@/features/avisos/avisos.types'
import {
  type EstadoPermisoNotificacion,
  type CanalesNotificacion,
  type NotificacionItem,
  type CategoriaNotificacion,
  obtenerEstadoPermiso,
  obtenerCanalesGuardados,
  guardarCanales,
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  limpiarTodasNotificaciones,
  agregarNotificacion,
  contarNoLeidas,
  solicitarPermisoNotificacion,
  notificacionesSoportadas,
  sincronizarNotificacionesDesdeUltimoAcceso,
} from './notificaciones.service'

export function useNotificaciones() {
  const { estudiante } = useEstudiante()
  const { sesion } = useSesion()

  const email = (sesion?.user?.email ?? '').trim().toLowerCase()
  const esAdmin =
    esUsuarioAdmin(email) ||
    sesion?.user?.app_metadata?.role === 'admin' ||
    sesion?.user?.user_metadata?.role === 'admin'

  /** Estado reactivo del permiso ('default', 'granted', 'denied', 'unsupported') */
  const [permiso, setPermiso] = useState<EstadoPermisoNotificacion>(obtenerEstadoPermiso)
  /** Estado reactivo de los canales seleccionados (comedor, horarios, agenda, ausencias, noticias) */
  const [canales, setCanales] = useState<CanalesNotificacion>(obtenerCanalesGuardados)
  /** Lista completa de notificaciones en la bandeja */
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>(obtenerNotificaciones)
  /** Indicador de carga mientras el usuario interactúa con el diálogo del navegador */
  const [cargando, setCargando] = useState(false)

  // Sincroniza el estado cuando la pestaña recobra foco o cuando cambia el storage/evento
  const sincronizar = useCallback(() => {
    setPermiso(obtenerEstadoPermiso())
    setCanales(obtenerCanalesGuardados())
    setNotificaciones(obtenerNotificaciones())
  }, [])

  useEffect(() => {
    window.addEventListener('focus', sincronizar)
    window.addEventListener('storage', sincronizar)
    window.addEventListener('studenthub:notificaciones-actualizadas', sincronizar)
    return () => {
      window.removeEventListener('focus', sincronizar)
      window.removeEventListener('storage', sincronizar)
      window.removeEventListener('studenthub:notificaciones-actualizadas', sincronizar)
    }
  }, [sincronizar])

  // 1. Sincronización resiliente con Supabase tras reconexión o reapertura de app
  useEffect(() => {
    void sincronizarNotificacionesDesdeUltimoAcceso(estudiante, esAdmin)
  }, [estudiante?.id, estudiante?.especialidad, estudiante?.grupo, estudiante?.seccion, esAdmin])

  // 2. Escucha activa en tiempo real mediante canales Supabase Realtime (notificaciones-in-app)
  useEffect(() => {
    if (!sesion?.user) return

    // Generar un identificador de canal único por ciclo para evitar colisiones en Supabase SDK
    const canalId = `notif-in-app-${sesion.user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const canal = supabase
      .channel(canalId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'institution_alerts' },
        (payload) => {
          try {
            const nuevoAviso = payload.new as InstitutionAlert
            if (!nuevoAviso || !nuevoAviso.active) return

            // Comprobar si aplica al perfil del usuario
            if (aplicaAvisoAEstudiante(nuevoAviso, estudiante, esAdmin)) {
              const notif = convertirAvisoANotificacion(nuevoAviso)
              agregarNotificacion(notif, true)
              setNotificaciones(obtenerNotificaciones())

              // Desplegar toast flotante in-app no intrusivo
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('studenthub:toast-alerta-in-app', {
                    detail: {
                      id: notif.id,
                      titulo: notif.titulo,
                      mensaje: notif.mensaje,
                      categoria: notif.categoria,
                      enlace: notif.enlace,
                    },
                  }),
                )
              }
            }
          } catch (err) {
            console.warn('[Realtime Notification Error Captured]:', err)
          }
        },
      )
      .on('broadcast', { event: 'nueva-alerta' }, (payload) => {
        try {
          if (payload?.payload) {
            const item = payload.payload as NotificacionItem
            agregarNotificacion(item, true)
            setNotificaciones(obtenerNotificaciones())
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('studenthub:toast-alerta-in-app', { detail: item }),
              )
            }
          }
        } catch (err) {
          console.warn('[Realtime Broadcast Error Captured]:', err)
        }
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn(`Error al suscribir canal realtime ${canalId}`)
        }
      })

    return () => {
      void supabase.removeChannel(canal)
    }
  }, [sesion?.user?.id, estudiante?.id, estudiante?.especialidad, estudiante?.grupo, estudiante?.seccion, esAdmin])

  /**
   * Solicita el permiso nativo al navegador. Si es concedido,
   * agrega una notificación de bienvenida a la bandeja y emite la alerta del sistema.
   */
  const solicitarPermiso = useCallback(async () => {
    setCargando(true)
    const nuevoEstado = await solicitarPermisoNotificacion()
    setPermiso(nuevoEstado)
    setCargando(false)

    if (nuevoEstado === 'granted') {
      agregarNotificacion(
        {
          titulo: '¡Notificaciones activadas!',
          mensaje: 'A partir de ahora recibirás alertas del comedor, ausencias de profesores y horarios en tiempo real.',
          categoria: 'noticias',
          importante: true,
        },
        true,
      )
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
   * Marca una notificación individual como leída.
   */
  const marcarLeida = useCallback((id: string) => {
    marcarComoLeida(id)
    setNotificaciones(obtenerNotificaciones())
  }, [])

  /**
   * Marca todas las notificaciones de la bandeja como leídas.
   */
  const marcarTodas = useCallback(() => {
    marcarTodasComoLeidas()
    setNotificaciones(obtenerNotificaciones())
  }, [])

  /**
   * Elimina una notificación de la lista.
   */
  const eliminar = useCallback((id: string) => {
    eliminarNotificacion(id)
    setNotificaciones(obtenerNotificaciones())
  }, [])

  /**
   * Vacía toda la bandeja de notificaciones.
   */
  const limpiarTodo = useCallback(() => {
    limpiarTodasNotificaciones()
    setNotificaciones([])
  }, [])

  /**
   * Dispara una notificación de prueba realista para el canal indicado,
   * guardándola en la bandeja in-app y emitiendo la notificación nativa si hay permiso.
   */
  const probarNotificacion = useCallback(
    async (tipo: CategoriaNotificacion) => {
      if (permiso !== 'granted') {
        const concedido = await solicitarPermiso()
        if (!concedido) return false
      }

      const ejemplos: Record<
        CategoriaNotificacion,
        { titulo: string; mensaje: string; enlace?: string; importante?: boolean }
      > = {
        comedor: {
          titulo: 'Menú del Comedor de Hoy',
          mensaje: 'Pollo en salsa criolla con arroz, frijoles y ensalada rusa. ¡Almuerzo a las 11:30 AM!',
          enlace: '/comedor',
        },
        horarios: {
          titulo: 'Recordatorio de Clases',
          mensaje: 'Tu próxima lección de Programación comienza en 10 minutos (Aula 12).',
          enlace: '/horarios',
        },
        ausencias: {
          titulo: 'Ausencia Docente',
          mensaje: 'El profesor de Física Matemática se ausenta hoy. Se asignó trabajo independiente.',
          enlace: '/agenda',
          importante: true,
        },
        agenda: {
          titulo: 'Tarea Pendiente en Agenda',
          mensaje: 'Recordatorio: Recuerda entregar la práctica de Electrotecnia antes del receso.',
          enlace: '/agenda',
        },
        noticias: {
          titulo: 'Nueva Noticia del CTP',
          mensaje: 'Feria Científica 2026: Inscripciones abiertas para todos los niveles.',
          enlace: '/expo',
        },
      }

      const ej = ejemplos[tipo]
      agregarNotificacion(
        {
          titulo: ej.titulo,
          mensaje: ej.mensaje,
          categoria: tipo,
          enlace: ej.enlace,
          importante: ej.importante,
        },
        true,
      )

      setNotificaciones(obtenerNotificaciones())
      return true
    },
    [permiso, solicitarPermiso],
  )

  const noLeidas = contarNoLeidas(notificaciones)

  return {
    soportado: notificacionesSoportadas(),
    permiso,
    canales,
    notificaciones,
    noLeidas,
    cargando,
    notificacionesActivas: permiso === 'granted',
    solicitarPermiso,
    alternarCanal,
    marcarComoLeida: marcarLeida,
    marcarTodasComoLeidas: marcarTodas,
    eliminarNotificacion: eliminar,
    limpiarTodo,
    probarNotificacion,
  }
}
