import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import {
  CORREO_ADMIN_UNICO,
  aplicaAvisoAEstudiante,
  convertirAvisoANotificacion,
  crearAviso,
  descartarAvisoLocal,
  eliminarAviso,
  esUsuarioAdmin,
  filtrarAvisosParaEstudiante,
  obtenerAvisos,
  obtenerAvisosDescartados,
  sincronizarAvisosConBandeja,
} from './avisos.service'
import { agregarNotificacion } from '@/features/notificaciones/notificaciones.service'
import type { InstitutionAlert, NuevoAvisoPayload } from './avisos.types'

export function useAvisos() {
  const { sesion } = useSesion()
  const { estudiante } = useEstudiante()

  const [avisos, setAvisos] = useState<InstitutionAlert[]>([])
  const [descartados, setDescartados] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)

  // REGLA DE SEGURIDAD ABSOLUTA:
  // Ningún estudiante (incluyendo erickgarciab2134@gmail.com o cualquier correo @mep.go.cr) puede publicar ni administrar avisos.
  // ÚNICAMENTE el correo oficial studenthub.cr@gmail.com tiene permisos de administración.
  const emailActual = (sesion?.user?.email ?? '').trim().toLowerCase()
  const esAdmin = esUsuarioAdmin(emailActual)

  const refrescar = useCallback(async () => {
    setCargando(true)
    try {
      const datos = await obtenerAvisos()
      setAvisos(datos)
      setDescartados(obtenerAvisosDescartados())
      // Sincronizar avisos oficiales en la bandeja de notificaciones estudiantiles
      sincronizarAvisosConBandeja(datos, estudiante, esAdmin)
    } finally {
      setCargando(false)
    }
  }, [estudiante, esAdmin])

  useEffect(() => {
    void refrescar()

    const alActualizar = () => {
      void refrescar()
    }

    window.addEventListener('studenthub:avisos-actualizados', alActualizar)
    window.addEventListener('storage', alActualizar)

    // Suscripción en Tiempo Real (Supabase Realtime) a la tabla institution_alerts
    const canal = supabase
      .channel('realtime:institution_alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'institution_alerts' },
        (payload) => {
          const nuevoAviso = payload.new as InstitutionAlert
          if (!nuevoAviso || !nuevoAviso.active) return

          // Comprobar si el aviso corresponde a toda la institución o a la sección/especialidad del estudiante
          if (aplicaAvisoAEstudiante(nuevoAviso, estudiante, esAdmin)) {
            setAvisos((prev) => [nuevoAviso, ...prev.filter((a) => a.id !== nuevoAviso.id)])

            // Emitir notificación visual nativa y registrar en la bandeja
            try {
              const notif = convertirAvisoANotificacion(nuevoAviso)
              agregarNotificacion(notif, true)
              window.dispatchEvent(new Event('studenthub:notificaciones-actualizadas'))
            } catch (err) {
              console.warn('Error al despachar notificación en tiempo real:', err)
            }
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'institution_alerts' },
        (payload) => {
          const idBorrado = (payload.old as { id?: string })?.id
          if (idBorrado) {
            setAvisos((prev) => prev.filter((a) => a.id !== idBorrado))
          }
        },
      )
      .subscribe()

    return () => {
      window.removeEventListener('studenthub:avisos-actualizados', alActualizar)
      window.removeEventListener('storage', alActualizar)
      void supabase.removeChannel(canal)
    }
  }, [refrescar, estudiante, esAdmin])

  // Filtrado de avisos según si es Administrador o Estudiante
  const avisosFiltrados = useMemo(() => {
    return filtrarAvisosParaEstudiante(avisos, estudiante, descartados, esAdmin)
  }, [avisos, estudiante, descartados, esAdmin])

  const descartarAviso = useCallback((id: string) => {
    descartarAvisoLocal(id)
    setDescartados((prev) => [...prev, id])
  }, [])

  const publicarAviso = useCallback(
    async (payload: NuevoAvisoPayload) => {
      if (!esAdmin) {
        throw new Error('Operación denegada: Ningún estudiante tiene permisos para publicar comunicados.')
      }
      const res = await crearAviso(payload, CORREO_ADMIN_UNICO)
      if (res.ok && res.aviso) {
        setAvisos((prev) => [res.aviso!, ...prev])
      }
      return res
    },
    [esAdmin],
  )

  const borrarAviso = useCallback(
    async (id: string) => {
      if (!esAdmin) {
        throw new Error('Operación denegada: Ningún estudiante tiene permisos para eliminar comunicados.')
      }
      const ok = await eliminarAviso(id, CORREO_ADMIN_UNICO)
      if (ok) {
        setAvisos((prev) => prev.filter((a) => a.id !== id))
      }
    },
    [esAdmin],
  )

  return {
    avisos: avisosFiltrados,
    totalAvisosSinFiltrar: avisos.length,
    cargando,
    esAdmin,
    descartarAviso,
    publicarAviso,
    borrarAviso,
    refrescar,
  }
}
