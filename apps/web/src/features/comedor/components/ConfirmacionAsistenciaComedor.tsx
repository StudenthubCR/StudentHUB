import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  IconoCheck,
  IconoCerrar,
  IconoComedor,
  IconoReloj,
  IconoAlertaTriangulo,
  IconoInfo,
} from '@/components/icons'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { useSesion } from '@/features/auth/useSesion'
import {
  esHorarioConfirmacionAbierto,
  guardarConfirmacionEstudiante,
  obtenerConfirmacionEstudiante,
  type ConfirmacionComedor,
} from '../confirmacion.service'
import { nombreLargoDeFecha } from '../menu.service'

type Props = {
  fecha?: Date
}

export function ConfirmacionAsistenciaComedor({ fecha }: Props) {
  const { sesion } = useSesion()
  const { estudiante } = useEstudiante()
  const [confirmacion, setConfirmacion] = useState<ConfirmacionComedor | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const fechaConsulta = useMemo(() => {
    if (fecha instanceof Date && !isNaN(fecha.getTime())) return fecha
    return new Date()
  }, [fecha])
  const estadoHorario = useMemo(() => esHorarioConfirmacionAbierto(fechaConsulta), [fechaConsulta])
  const fechaServicioStr = estadoHorario.fechaServicioStr
  const nombreFechaServicio = useMemo(
    () => nombreLargoDeFecha(estadoHorario.fechaServicio),
    [estadoHorario.fechaServicio],
  )

  // Obtener id efectivo del estudiante (o usuario autenticado)
  const idEstudiante = estudiante?.id || sesion?.user?.id || ''

  const cargarConfirmacion = useCallback(async () => {
    if (!idEstudiante) {
      setCargando(false)
      return
    }
    setCargando(true)
    try {
      const data = await obtenerConfirmacionEstudiante(idEstudiante, fechaServicioStr)
      setConfirmacion(data)
    } finally {
      setCargando(false)
    }
  }, [idEstudiante, fechaServicioStr])

  useEffect(() => {
    void cargarConfirmacion()

    const alActualizar = () => {
      void cargarConfirmacion()
    }
    window.addEventListener('studenthub:confirmacion-comedor-actualizada', alActualizar)
    return () => {
      window.removeEventListener('studenthub:confirmacion-comedor-actualizada', alActualizar)
    }
  }, [cargarConfirmacion])

  const manejarSeleccion = async (asistencia: boolean) => {
    if (!sesion) {
      setErrorMensaje('Debes iniciar sesión con tu cuenta estudiantil para confirmar asistencia.')
      return
    }

    if (!estadoHorario.abierto) {
      setErrorMensaje(estadoHorario.motivo || 'El plazo de confirmación está cerrado para esta fecha.')
      return
    }

    setErrorMensaje(null)
    setGuardando(true)

    // Actualización optimista inmediata
    const previo = confirmacion
    setConfirmacion({
      id: previo?.id || `conf-temp-${Date.now()}`,
      estudiante_id: idEstudiante,
      fecha: fechaServicioStr,
      asistencia,
      actualizado_el: new Date().toISOString(),
    })

    try {
      const res = await guardarConfirmacionEstudiante(idEstudiante, asistencia, fechaServicioStr)
      if (res.ok && res.confirmacion) {
        setConfirmacion(res.confirmacion)
        setMensajeExito(
          asistencia
            ? `¡Confirmado! Tu plato queda reservado para la cena del ${nombreFechaServicio}.`
            : `Entendido. Se notificó a cocina que no utilizarás el servicio de cena del ${nombreFechaServicio}.`,
        )
        setTimeout(() => setMensajeExito(null), 4500)
      } else {
        throw new Error(res.error || 'Error al guardar selección.')
      }
    } catch {
      setErrorMensaje('No se pudo sincronizar con el servidor. Se guardó copia local en tu dispositivo.')
    } finally {
      setGuardando(false)
    }
  }

  const seleccionActual = confirmacion?.asistencia

  return (
    <div
      aria-busy={cargando}
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6 elev-sm transition-all duration-200"
    >
      {/* Encabezado contextual para Sección Nocturna */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4.5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary shadow-xs">
            <IconoComedor className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-dato font-bold text-text sm:text-cuerpo">
                Confirmación de Asistencia · Sección Nocturna
              </h3>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-micro font-black uppercase tracking-wider text-primary">
                Cena
              </span>
              {seleccionActual !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-bold border ${
                    seleccionActual
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      seleccionActual ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`}
                  />
                  <span>{seleccionActual ? 'Cena confirmada' : 'No asistirá'}</span>
                </span>
              )}
            </div>
            <p className="text-menuda text-text-muted mt-0.5">
              Servicio destino: <strong className="text-text font-semibold capitalize">{nombreFechaServicio}</strong>
            </p>
          </div>
        </div>

        {/* Indicador de límites de la ventana de la sección nocturna */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-alt px-3 py-1.5 text-micro font-semibold text-text-muted shrink-0">
          <IconoReloj className="size-3.5 text-primary" />
          <span>Cierre: 5:30 PM (Abre 8:00 PM previo)</span>
        </div>
      </div>

      {/* Banner Informativo de la Ventana Horaria */}
      <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-border/80 bg-surface-alt/60 px-3.5 py-2.5 text-micro text-text-muted">
        <IconoInfo className="size-4 shrink-0 text-primary mt-0.5" />
        <p className="leading-relaxed">
          Ventana de confirmación activa: Puedes confirmar tu asistencia desde el día anterior a las 8:00 PM hasta hoy a las 5:30 PM.
        </p>
      </div>

      {/* Selector interactivo táctil */}
      <div className="mt-4.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Opción 1: Cenaré */}
          <button
            type="button"
            onClick={() => void manejarSeleccion(true)}
            disabled={guardando || cargando || !estadoHorario.abierto}
            className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 min-h-[58px] ${
              seleccionActual === true
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500/40'
                : 'border-border bg-surface hover:border-emerald-500/50 hover:bg-surface-alt text-text'
            } ${!estadoHorario.abierto || cargando ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  seleccionActual === true
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-border bg-surface-alt text-text-muted group-hover:text-emerald-600'
                }`}
              >
                <IconoCheck className="size-4.5" />
              </span>
              <div>
                <span className="block text-menor font-bold text-text">
                  {estadoHorario.esParaManana ? 'Cenaré mañana' : 'Cenaré hoy'}
                </span>
                <span className="block text-micro text-text-muted">
                  Reservar mi plato de cena para la sección nocturna
                </span>
              </div>
            </div>
            {seleccionActual === true && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-micro font-bold text-emerald-700 dark:text-emerald-300">
                Seleccionado
              </span>
            )}
          </button>

          {/* Opción 2: No cenaré */}
          <button
            type="button"
            onClick={() => void manejarSeleccion(false)}
            disabled={guardando || cargando || !estadoHorario.abierto}
            className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 min-h-[58px] ${
              seleccionActual === false
                ? 'border-zinc-400 bg-zinc-500/10 text-text shadow-sm ring-1 ring-zinc-400/40'
                : 'border-border bg-surface hover:border-zinc-400/50 hover:bg-surface-alt text-text'
            } ${!estadoHorario.abierto || cargando ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  seleccionActual === false
                    ? 'border-zinc-500 bg-zinc-600 text-white'
                    : 'border-border bg-surface-alt text-text-muted group-hover:text-zinc-600'
                }`}
              >
                <IconoCerrar className="size-4.5" />
              </span>
              <div>
                <span className="block text-menor font-bold text-text">
                  {estadoHorario.esParaManana ? 'No cenaré mañana' : 'No cenaré hoy'}
                </span>
                <span className="block text-micro text-text-muted">
                  Liberar ración para compañeros de la nocturna
                </span>
              </div>
            </div>
            {seleccionActual === false && (
              <span className="rounded-full bg-zinc-500/20 px-2 py-0.5 text-micro font-bold text-text-muted">
                Seleccionado
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Estados informativos, bloqueos y feedback */}
      <div className="mt-3.5 flex flex-col gap-2">
        {guardando && (
          <p className="flex items-center gap-2 text-micro text-primary font-medium animate-pulse">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Sincronizando tu confirmación con la cocina nocturna...</span>
          </p>
        )}

        {mensajeExito && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-menuda text-emerald-800 dark:text-emerald-300 animate-fade-in">
            <IconoCheck className="size-4 shrink-0 text-emerald-600" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {errorMensaje && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-menuda text-rose-800 dark:text-rose-300 animate-fade-in">
            <IconoAlertaTriangulo className="size-4 shrink-0 text-rose-600" />
            <span>{errorMensaje}</span>
          </div>
        )}

        {!estadoHorario.abierto && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-menuda text-amber-900 dark:text-amber-300">
            <IconoReloj className="size-4 shrink-0 text-amber-600 mt-0.5" />
            <span className="leading-relaxed">{estadoHorario.motivo}</span>
          </div>
        )}

        {!sesion && (
          <p className="text-micro text-text-muted">
            Nota: Para reservar tu cena de la sección nocturna debes identificarte con tu usuario institucional.
          </p>
        )}
      </div>
    </div>
  )
}
