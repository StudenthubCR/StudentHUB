import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  IconoComedor,
  IconoCheck,
  IconoCerrar,
  IconoUsuarios,
  IconoReloj,
  IconoInfo,
} from '@/components/icons'
import { supabase } from '@/lib/supabase'
import {
  obtenerMetricasAsistenciaComedor,
  fechaAClaveLocal,
  calcularFechaServicio,
  type MetricasComedor,
} from '@/features/comedor/confirmacion.service'
import { ESPECIALIDADES_CTP, SECCIONES_CTP } from '@/features/avisos/avisos.service'

type Props = {
  totalEstudiantesPadrone?: number
}

export function WidgetMetricasComedor({ totalEstudiantesPadrone = 0 }: Props) {
  const [metricas, setMetricas] = useState<MetricasComedor | null>(null)
  const [cargando, setCargando] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'seccion' | 'especialidad'>('todos')
  const [filtroValor, setFiltroValor] = useState<string>('todos')
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date())

  const infoServicio = useMemo(() => calcularFechaServicio(), [])
  const fechaHoyStr = useMemo(() => fechaAClaveLocal(), [])
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(() => infoServicio.fechaServicioStr)

  const cargarMetricas = useCallback(async () => {
    setCargando(true)
    try {
      const data = await obtenerMetricasAsistenciaComedor(fechaSeleccionada)
      setMetricas(data)
      setUltimaActualizacion(new Date())
    } finally {
      setCargando(false)
    }
  }, [fechaSeleccionada])

  useEffect(() => {
    void cargarMetricas()

    // 1. Suscripción Supabase Realtime a cambios en confirmaciones_comedor
    const canal = supabase
      .channel('realtime:confirmaciones_comedor_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'confirmaciones_comedor' },
        () => {
          void cargarMetricas()
        },
      )
      .subscribe()

    // 2. Escuchar evento de actualización local
    const alActualizar = () => {
      void cargarMetricas()
    }
    window.addEventListener('studenthub:confirmacion-comedor-actualizada', alActualizar)

    return () => {
      window.removeEventListener('studenthub:confirmacion-comedor-actualizada', alActualizar)
      void supabase.removeChannel(canal)
    }
  }, [cargarMetricas])

  // Desglose según filtro seleccionado
  const desgloseFiltrado = useMemo(() => {
    if (!metricas) return { comeran: 0, noComeran: 0, total: 0 }

    if (filtroTipo === 'seccion' && filtroValor !== 'todos') {
      const datosSec = metricas.porSeccion[filtroValor] || { comeran: 0, noComeran: 0 }
      return {
        comeran: datosSec.comeran,
        noComeran: datosSec.noComeran,
        total: datosSec.comeran + datosSec.noComeran,
      }
    }

    if (filtroTipo === 'especialidad' && filtroValor !== 'todos') {
      const datosEsp = metricas.porEspecialidad[filtroValor] || { comeran: 0, noComeran: 0 }
      return {
        comeran: datosEsp.comeran,
        noComeran: datosEsp.noComeran,
        total: datosEsp.comeran + datosEsp.noComeran,
      }
    }

    return {
      comeran: metricas.totalConfirmadosComeran,
      noComeran: metricas.totalConfirmadosNoComeran,
      total: metricas.totalRespuestas,
    }
  }, [metricas, filtroTipo, filtroValor])

  const totalComeran = desgloseFiltrado.comeran
  const totalNoComeran = desgloseFiltrado.noComeran
  const totalRespuestas = desgloseFiltrado.total
  const porcentajeAsistencia =
    totalRespuestas > 0 ? Math.round((totalComeran / totalRespuestas) * 100) : 0

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm overflow-hidden">
      {/* Cabecera del Widget con indicador Realtime */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4.5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-tint text-primary shadow-xs">
              <IconoComedor className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-dato font-bold text-text sm:text-cuerpo">
                  Asistencia al Comedor · Cena Sección Nocturna
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-micro font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>En vivo · Realtime</span>
                </span>
              </div>
              <p className="text-menuda text-text-muted mt-0.5">
                Cierre de cocina a las 5:30 PM · Apertura 8:00 PM del día previo
              </p>
            </div>
          </div>
        </div>

        {/* Botón de recarga, selector de servicio y timestamp */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-alt p-1 text-menuda font-semibold">
            <button
              type="button"
              onClick={() => setFechaSeleccionada(fechaHoyStr)}
              className={`rounded-lg px-2.5 py-1 text-micro transition-all ${
                fechaSeleccionada === fechaHoyStr
                  ? 'bg-primary text-white shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Hoy ({fechaHoyStr})
            </button>
            {infoServicio.fechaServicioStr !== fechaHoyStr && (
              <button
                type="button"
                onClick={() => setFechaSeleccionada(infoServicio.fechaServicioStr)}
                className={`rounded-lg px-2.5 py-1 text-micro transition-all ${
                  fechaSeleccionada === infoServicio.fechaServicioStr
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Próximo ({infoServicio.fechaServicioStr})
              </button>
            )}
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => e.target.value && setFechaSeleccionada(e.target.value)}
              aria-label="Seleccionar fecha de servicio"
              className="rounded-lg border-0 bg-transparent px-2 py-0.5 text-micro text-text focus:outline-none"
            />
          </div>

          <span className="text-micro text-text-muted hidden sm:inline">
            Actualizado {ultimaActualizacion.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            type="button"
            onClick={() => void cargarMetricas()}
            disabled={cargando}
            aria-label="Refrescar métricas del comedor"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-alt px-3 py-1.5 text-menuda font-semibold text-text hover:bg-border/40 active:scale-95 transition-all min-h-[36px]"
          >
            <span className={cargando ? 'animate-spin' : ''}>↻</span>
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros Rápidos (Especialidad / Sección) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-micro font-bold uppercase tracking-wider text-text-muted">
            Filtrar por:
          </span>
          <div className="inline-flex rounded-xl border border-border bg-surface-alt p-0.5 text-menuda font-bold">
            <button
              type="button"
              onClick={() => {
                setFiltroTipo('todos')
                setFiltroValor('todos')
              }}
              className={`cursor-pointer rounded-lg px-3 py-1 text-micro transition-all ${
                filtroTipo === 'todos' ? 'bg-primary text-white shadow-2xs' : 'text-text-muted hover:text-text'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltroTipo('seccion')
                setFiltroValor(SECCIONES_CTP[0])
              }}
              className={`cursor-pointer rounded-lg px-3 py-1 text-micro transition-all ${
                filtroTipo === 'seccion' ? 'bg-primary text-white shadow-2xs' : 'text-text-muted hover:text-text'
              }`}
            >
              Sección
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltroTipo('especialidad')
                setFiltroValor(ESPECIALIDADES_CTP[0])
              }}
              className={`cursor-pointer rounded-lg px-3 py-1 text-micro transition-all ${
                filtroTipo === 'especialidad' ? 'bg-primary text-white shadow-2xs' : 'text-text-muted hover:text-text'
              }`}
            >
              Especialidad
            </button>
          </div>
        </div>

        {/* Selector específico cuando está activo filtro por sección o especialidad */}
        {filtroTipo === 'seccion' && (
          <select
            value={filtroValor}
            onChange={(e) => setFiltroValor(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-menuda font-bold text-text focus:border-primary focus:outline-none"
          >
            <option value="todos">Todas las secciones</option>
            {SECCIONES_CTP.map((sec) => (
              <option key={sec} value={sec}>
                Sección {sec}
              </option>
            ))}
          </select>
        )}

        {filtroTipo === 'especialidad' && (
          <select
            value={filtroValor}
            onChange={(e) => setFiltroValor(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-menuda font-bold text-text focus:border-primary focus:outline-none"
          >
            <option value="todos">Todas las especialidades</option>
            {ESPECIALIDADES_CTP.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grid de Métricas Principales */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tarjeta 1: Total Confirmados Comerán */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-micro font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Cenarán ({fechaSeleccionada})
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <IconoCheck className="size-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-hero font-black text-emerald-900 dark:text-emerald-100">
              {cargando ? '...' : totalComeran}
            </span>
            <span className="text-micro text-emerald-800 dark:text-emerald-300 font-medium">
              raciones requeridas
            </span>
          </div>
          <p className="mt-1 text-micro text-emerald-700/80 dark:text-emerald-300/80">
            Estudiantes con asistencia marcada para la cena
          </p>
        </div>

        {/* Tarjeta 2: Total Confirmados No Comerán */}
        <div className="rounded-xl border border-border bg-surface-alt/50 p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-micro font-bold uppercase tracking-wider text-text-muted">
              No cenarán
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-border/60 text-text-muted">
              <IconoCerrar className="size-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-hero font-black text-text">
              {cargando ? '...' : totalNoComeran}
            </span>
            <span className="text-micro text-text-muted font-medium">raciones liberadas</span>
          </div>
          <p className="mt-1 text-micro text-text-muted">
            Avisaron no hacer uso de la cena
          </p>
        </div>

        {/* Tarjeta 3: Total Respuestas Registradas */}
        <div className="rounded-xl border border-border bg-surface-alt/50 p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-micro font-bold uppercase tracking-wider text-text-muted">
              Total Registros
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary-tint text-primary">
              <IconoUsuarios className="size-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-hero font-black text-text">
              {cargando ? '...' : totalRespuestas}
            </span>
            {totalEstudiantesPadrone > 0 && (
              <span className="text-micro text-text-muted font-medium">
                de {totalEstudiantesPadrone} en padrón
              </span>
            )}
          </div>
          <p className="mt-1 text-micro text-text-muted">
            Respuestas recibidas para el servicio
          </p>
        </div>

        {/* Tarjeta 4: Asistencia Proyectada (%) */}
        <div className="rounded-xl border border-primary/25 bg-primary-tint/30 p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-micro font-bold uppercase tracking-wider text-primary">
              Proyección Asistencia
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white">
              <IconoReloj className="size-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-hero font-black text-primary">
              {cargando ? '...' : `${porcentajeAsistencia}%`}
            </span>
            <span className="text-micro text-text-muted font-medium">de confirmados</span>
          </div>
          {/* Barra de progreso */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-ui"
              style={{ width: `${porcentajeAsistencia}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nota logística para el personal de cocina */}
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-alt/40 border border-border/60 px-3.5 py-2.5 text-micro text-text-muted">
        <IconoInfo className="size-3.5 shrink-0 text-primary" />
        <span>
          Cierre oficial de confirmaciones para cocina a las 5:30 PM. La ventana abre a las 8:00 PM del día previo. Las métricas reflejan las reservas activas en Supabase para el servicio del {fechaSeleccionada}.
        </span>
      </div>
    </div>
  )
}
