import { useState, useMemo } from 'react'
import { IconoCalendario, IconoRecargar } from '@/components/icons'
import { useAsistencias } from '../useAsistencias'
import type { FiltroEstadoAsistencia, PeriodoAsistencia } from '../asistencias.types'
import { ResumenKpisAsistencias } from './ResumenKpisAsistencias'
import { AlertaAusenciasTemprana } from './AlertaAusenciasTemprana'
import { RegistroAsistenciaCard } from './RegistroAsistenciaCard'
import { cn } from '@/lib/cn'

type Props = {
  estudianteId?: string
}

const PERIODOS: PeriodoAsistencia[] = ['I Periodo', 'II Periodo', 'III Periodo']

export function TabAsistencias({ estudianteId }: Props) {
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoAsistencia>('I Periodo')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoAsistencia>('todos')
  const { asistencias, resumen, cargando, error, refrescar } = useAsistencias(estudianteId, periodoActivo)

  const asistenciasFiltradas = useMemo(() => {
    if (filtroEstado === 'todos') return asistencias
    if (filtroEstado === 'ausencias') {
      return asistencias.filter(
        (a) => a.estado === 'ausencia_injustificada' || a.estado === 'ausencia_justificada',
      )
    }
    if (filtroEstado === 'tardias') {
      return asistencias.filter((a) => a.estado === 'tardia')
    }
    return asistencias
  }, [asistencias, filtroEstado])

  if (cargando) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Cargando asistencias">
        <div className="h-10 w-full sm:w-72 rounded-2xl bg-surface-alt border border-border" />
        <div className="h-32 rounded-2xl bg-surface-alt border border-border" />
        <div className="space-y-3">
          <div className="h-20 rounded-2xl bg-surface-alt border border-border" />
          <div className="h-20 rounded-2xl bg-surface-alt border border-border" />
          <div className="h-20 rounded-2xl bg-surface-alt border border-border" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-surface text-center">
        <p className="text-dato font-bold text-text">No se pudo cargar el registro de asistencia</p>
        <p className="mt-1 text-menor text-text-muted">
          Ocurrió un error al consultar las lecciones registradas en el servidor.
        </p>
        <button
          type="button"
          onClick={() => void refrescar()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-menor font-bold text-white shadow-xs hover:bg-primary-dark transition-all cursor-pointer"
        >
          <IconoRecargar className="size-4" />
          <span>Reintentar</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Selector de Periodo y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div
          role="tablist"
          aria-label="Selección de periodo de asistencia"
          className="inline-flex w-full sm:w-auto p-1 gap-1 rounded-2xl border border-border bg-surface-alt/70"
        >
          {PERIODOS.map((p) => {
            const activo = p === periodoActivo
            return (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => setPeriodoActivo(p)}
                className={cn(
                  'flex-1 sm:flex-initial rounded-xl px-3.5 py-1.5 text-menor font-bold transition-all duration-200 cursor-pointer text-center whitespace-nowrap',
                  activo
                    ? 'bg-surface text-text shadow-xs ring-1 ring-border'
                    : 'text-text-muted hover:text-text hover:bg-surface/50',
                )}
              >
                {p}
              </button>
            )
          })}
        </div>

        {/* Filtro por Estado */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFiltroEstado('todos')}
            className={cn(
              'rounded-xl px-3 py-1 text-micro font-bold transition-all cursor-pointer border',
              filtroEstado === 'todos'
                ? 'bg-primary text-white border-primary shadow-2xs'
                : 'border-border bg-surface text-text-muted hover:text-text',
            )}
          >
            Todas ({asistencias.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('ausencias')}
            className={cn(
              'rounded-xl px-3 py-1 text-micro font-bold transition-all cursor-pointer border',
              filtroEstado === 'ausencias'
                ? 'bg-primary text-white border-primary shadow-2xs'
                : 'border-border bg-surface text-text-muted hover:text-text',
            )}
          >
            Solo Ausencias ({resumen.ausenciasInjustificadas + resumen.ausenciasJustificadas})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('tardias')}
            className={cn(
              'rounded-xl px-3 py-1 text-micro font-bold transition-all cursor-pointer border',
              filtroEstado === 'tardias'
                ? 'bg-primary text-white border-primary shadow-2xs'
                : 'border-border bg-surface text-text-muted hover:text-text',
            )}
          >
            Solo Tardías ({resumen.tardias})
          </button>
        </div>
      </div>

      {/* Alerta Temprana si aplica */}
      {resumen.alertaTemprana && (
        <AlertaAusenciasTemprana mensaje={resumen.mensajeAlerta} />
      )}

      {/* Resumen KPIs */}
      <ResumenKpisAsistencias resumen={resumen} />

      {/* Lista de Registros */}
      {asistenciasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 rounded-2xl border border-border bg-surface text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-alt text-text-muted mb-3">
            <IconoCalendario className="size-6" />
          </div>
          <h4 className="text-dato font-bold text-text">No hay lecciones que coincidan</h4>
          <p className="mt-1 text-menor text-text-muted max-w-md">
            No se encontraron asistencias registradas con el filtro seleccionado para el {periodoActivo}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {asistenciasFiltradas.map((r) => (
            <RegistroAsistenciaCard key={r.id} registro={r} />
          ))}
        </div>
      )}
    </div>
  )
}
