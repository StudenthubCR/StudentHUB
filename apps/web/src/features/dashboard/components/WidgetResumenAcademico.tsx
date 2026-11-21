import { Link } from 'react-router-dom'
import { IconoBirrete, IconoCalendario, IconoCarnet, IconoFlechaDerecha } from '@/components/icons'
import { useNotas } from '@/features/notas/useNotas'
import { useAsistencias } from '@/features/asistencias/useAsistencias'

type Props = {
  estudianteId?: string
}

export function WidgetResumenAcademico({ estudianteId }: Props) {
  const { resumen: resumenNotas, cargando: cargandoNotas } = useNotas(estudianteId, 'I Periodo')
  const { resumen: resumenAsistencias, cargando: cargandoAsist } = useAsistencias(estudianteId, 'I Periodo')

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
            <IconoBirrete className="size-4.5" />
          </div>
          <div>
            <h3 className="text-dato font-bold text-text">Progreso Académico</h3>
            <p className="text-micro text-text-muted">Ciclo Lectivo Oficial · MEP</p>
          </div>
        </div>

        <Link
          to="/estudiante"
          className="flex items-center gap-1 text-micro font-bold text-primary hover:underline"
        >
          <span>Hub Estudiantil</span>
          <IconoFlechaDerecha className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        {/* Acceso Notas */}
        <Link
          to="/estudiante?tab=notas"
          className="group flex flex-col justify-between rounded-xl border border-border bg-surface-alt/60 p-3 transition-all hover:border-primary/40 hover:bg-surface-alt active:scale-98"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-micro font-bold text-text-muted uppercase tracking-wider">
              Calificaciones
            </span>
            <IconoBirrete className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-dato sm:text-titulo font-black text-text">
              {cargandoNotas ? '...' : resumenNotas.promedioGeneral.toFixed(1)}
            </span>
            <span className="text-micro text-text-muted font-semibold">/ 100</span>
          </div>
          <span className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {cargandoNotas ? '' : `${resumenNotas.materiasAprobadas} aprobadas`}
          </span>
        </Link>

        {/* Acceso Asistencia */}
        <Link
          to="/estudiante?tab=asistencias"
          className="group flex flex-col justify-between rounded-xl border border-border bg-surface-alt/60 p-3 transition-all hover:border-primary/40 hover:bg-surface-alt active:scale-98"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-micro font-bold text-text-muted uppercase tracking-wider">
              Asistencia
            </span>
            <IconoCalendario className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-dato sm:text-titulo font-black text-text">
              {cargandoAsist ? '...' : `${resumenAsistencias.porcentajeAsistencia.toFixed(0)}%`}
            </span>
          </div>
          <span className="mt-1 text-[11px] font-semibold text-text-muted">
            {cargandoAsist ? '' : `${resumenAsistencias.totalSesiones} lecciones`}
          </span>
        </Link>
      </div>

      {/* Enlace al Carnet Digital */}
      <Link
        to="/estudiante?tab=carnet"
        className="flex items-center justify-between rounded-xl border border-border/80 bg-surface px-3 py-2 text-micro font-bold text-text transition-all hover:border-primary hover:bg-primary-tint/30"
      >
        <span className="flex items-center gap-2">
          <IconoCarnet className="size-3.5 text-primary" />
          <span>Abrir Carnet Digital con Código QR</span>
        </span>
        <IconoFlechaDerecha className="size-3 text-text-muted" />
      </Link>
    </article>
  )
}

