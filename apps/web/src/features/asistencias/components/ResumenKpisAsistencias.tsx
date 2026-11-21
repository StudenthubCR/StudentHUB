import { IconoCalendario, IconoCheck, IconoReloj, IconoCerrar } from '@/components/icons'
import type { ResumenAsistencias } from '../asistencias.types'

type Props = {
  resumen: ResumenAsistencias
}

export function ResumenKpisAsistencias({ resumen }: Props) {
  const porcentaje = resumen.porcentajeAsistencia
  const esPorcentajeOptimo = porcentaje >= 85

  return (
    <div className="space-y-3 mb-5">
      {/* Tarjeta Principal de Porcentaje */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${
              esPorcentajeOptimo
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}
          >
            <IconoCalendario className="size-6" />
          </div>
          <div>
            <p className="text-micro font-bold text-text-muted uppercase tracking-wider">
              Asistencia General Acumulada
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-titulo font-black text-text sm:text-[1.85rem] tracking-tight">
                {porcentaje.toFixed(1)}%
              </span>
              <span className="text-micro text-text-muted font-semibold">
                de presencialidad efectiva
              </span>
            </div>
          </div>
        </div>

        {/* Total de Lecciones */}
        <div className="flex items-center gap-2 sm:border-l sm:border-border/80 sm:pl-5">
          <div className="text-left sm:text-right">
            <span className="block text-micro font-bold text-text-muted uppercase tracking-wider">
              Lecciones Evaluadas
            </span>
            <span className="block text-dato sm:text-titulo font-bold text-text mt-0.5">
              {resumen.totalSesiones} sesiones
            </span>
          </div>
        </div>
      </div>

      {/* Grid de 4 Estados de Asistencia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Presentes */}
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
            <IconoCheck className="size-4" />
            <span className="text-micro font-bold uppercase tracking-wider">Presentes</span>
          </div>
          <span className="text-dato sm:text-titulo font-black text-text">{resumen.presentes}</span>
        </div>

        {/* Justificadas */}
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
            <IconoCheck className="size-4" />
            <span className="text-micro font-bold uppercase tracking-wider">Justificadas</span>
          </div>
          <span className="text-dato sm:text-titulo font-black text-text">{resumen.ausenciasJustificadas}</span>
        </div>

        {/* Tardías */}
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
            <IconoReloj className="size-4" />
            <span className="text-micro font-bold uppercase tracking-wider">Tardías</span>
          </div>
          <span className="text-dato sm:text-titulo font-black text-text">{resumen.tardias}</span>
        </div>

        {/* Injustificadas */}
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 mb-1">
            <IconoCerrar className="size-4" />
            <span className="text-micro font-bold uppercase tracking-wider">Injustificadas</span>
          </div>
          <span className="text-dato sm:text-titulo font-black text-rose-600 dark:text-rose-400">
            {resumen.ausenciasInjustificadas}
          </span>
        </div>
      </div>
    </div>
  )
}
