import { useState } from 'react'
import { IconoBirrete, IconoRecargar } from '@/components/icons'
import { useNotas } from '../useNotas'
import type { PeriodoNota } from '../notas.types'
import { ResumenKpisNotas } from './ResumenKpisNotas'
import { TarjetaMateriaNota } from './TarjetaMateriaNota'
import { cn } from '@/lib/cn'

type Props = {
  estudianteId?: string
}

const PERIODOS: PeriodoNota[] = ['I Periodo', 'II Periodo', 'III Periodo', 'Anual']

export function TabNotas({ estudianteId }: Props) {
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoNota>('I Periodo')
  const { notas, resumen, cargando, error, refrescar } = useNotas(estudianteId, periodoActivo)

  if (cargando) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Cargando calificaciones">
        <div className="h-10 w-full sm:w-80 rounded-2xl bg-surface-alt border border-border" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-24 rounded-2xl bg-surface-alt border border-border" />
          <div className="h-24 rounded-2xl bg-surface-alt border border-border" />
          <div className="h-24 rounded-2xl bg-surface-alt border border-border" />
        </div>
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
        <p className="text-dato font-bold text-text">No se pudieron cargar las calificaciones</p>
        <p className="mt-1 text-menor text-text-muted">
          Ocurrió un inconveniente de sincronización con la base de datos institucional.
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
      {/* Selector de Periodo Oficial MEP */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div
          role="tablist"
          aria-label="Selección de periodo lectivo oficial"
          className="inline-flex w-full sm:w-auto p-1 gap-1 rounded-2xl border border-border bg-surface-alt/70 overflow-x-auto"
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

        <span className="text-micro font-semibold text-text-muted sm:text-right">
          Normativa de Evaluación de los Aprendizajes · MEP Costa Rica
        </span>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <ResumenKpisNotas resumen={resumen} />

      {/* Lista de Calificaciones por Materia */}
      {notas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 rounded-2xl border border-border bg-surface text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-alt text-text-muted mb-3">
            <IconoBirrete className="size-6" />
          </div>
          <h4 className="text-dato font-bold text-text">No hay calificaciones reportadas</h4>
          <p className="mt-1 text-menor text-text-muted max-w-md">
            Las calificaciones para el {periodoActivo} aún no han sido cargadas en el sistema institucional por el cuerpo docente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notas.map((n) => (
            <TarjetaMateriaNota key={n.id} nota={n} />
          ))}
        </div>
      )}
    </div>
  )
}
