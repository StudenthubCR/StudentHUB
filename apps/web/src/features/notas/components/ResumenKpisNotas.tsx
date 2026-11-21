import { IconoBirrete, IconoCheck, IconoAlertaTriangulo } from '@/components/icons'
import type { ResumenNotas } from '../notas.types'

type Props = {
  resumen: ResumenNotas
}

export function ResumenKpisNotas({ resumen }: Props) {
  const esAprobadoGeneral = resumen.promedioGeneral >= 70

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      {/* KPI 1: Promedio General */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-xs">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
            esAprobadoGeneral
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          <IconoBirrete className="size-5.5" />
        </div>
        <div className="min-w-0">
          <p className="text-micro font-bold text-text-muted uppercase tracking-wider">
            Promedio Ponderado
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-titulo font-black text-text sm:text-[1.65rem] tracking-tight">
              {resumen.promedioGeneral.toFixed(1)}
            </span>
            <span className="text-micro text-text-muted font-semibold">/ 100</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Materias Aprobadas */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-xs">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          <IconoCheck className="size-5.5" />
        </div>
        <div className="min-w-0">
          <p className="text-micro font-bold text-text-muted uppercase tracking-wider">
            Materias Aprobadas
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-titulo font-black text-emerald-600 dark:text-emerald-400 sm:text-[1.65rem]">
              {resumen.materiasAprobadas}
            </span>
            <span className="text-micro text-text-muted font-semibold">
              de {resumen.totalMaterias}
            </span>
          </div>
        </div>
      </div>

      {/* KPI 3: Materias por Reforzar */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-xs">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
            resumen.materiasEnRiesgo > 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-surface-alt border-border text-text-muted'
          }`}
        >
          <IconoAlertaTriangulo className="size-5.5" />
        </div>
        <div className="min-w-0">
          <p className="text-micro font-bold text-text-muted uppercase tracking-wider">
            Por Reforzar (&lt; 70)
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={`text-titulo font-black sm:text-[1.65rem] ${
                resumen.materiasEnRiesgo > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text'
              }`}
            >
              {resumen.materiasEnRiesgo}
            </span>
            <span className="text-micro text-text-muted font-semibold">
              {resumen.materiasEnRiesgo === 1 ? 'materia' : 'materias'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
