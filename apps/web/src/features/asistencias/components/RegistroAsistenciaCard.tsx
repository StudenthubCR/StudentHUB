import { formatearFechaAsistencia } from '../asistencias.service'
import { obtenerBadgeEstadoAsistencia, type RegistroAsistencia } from '../asistencias.types'
import { IconoCalendario, IconoInfo } from '@/components/icons'

type Props = {
  registro: RegistroAsistencia
}

export function RegistroAsistenciaCard({ registro }: Props) {
  const badge = obtenerBadgeEstadoAsistencia(registro.estado)
  const fechaTexto = formatearFechaAsistencia(registro.fecha)

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 sm:p-4.5 transition-all duration-200 hover:border-border-strong shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-bold border ${badge.claseColor}`}
            >
              <span>{badge.etiqueta}</span>
            </span>
            <span className="text-micro font-semibold text-text-muted capitalize">
              {fechaTexto}
            </span>
          </div>

          <h4 className="text-dato font-bold text-text truncate mt-0.5">
            {registro.materia}
          </h4>
          <p className="text-micro text-text-muted mt-0.5 flex items-center gap-1.5">
            <IconoCalendario className="size-3.5 shrink-0 text-primary" />
            <span>{registro.bloque}</span>
          </p>
        </div>
      </div>

      {registro.justificacion && (
        <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-border/70 bg-surface-alt/50 p-2.5 text-micro text-text-muted">
          <IconoInfo className="size-3.5 shrink-0 text-primary mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-text">Justificación: </strong>
            <span>{registro.justificacion}</span>
          </p>
        </div>
      )}
    </article>
  )
}
