import { IconoAlertaTriangulo } from '@/components/icons'

type Props = {
  mensaje?: string
}

export function AlertaAusenciasTemprana({ mensaje }: Props) {
  if (!mensaje) return null

  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-menor text-amber-950 dark:text-amber-200 animate-fade-in shadow-2xs">
      <IconoAlertaTriangulo className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
      <div className="min-w-0">
        <h4 className="font-bold tracking-tight">Alerta Preventiva de Asistencia Institucional</h4>
        <p className="mt-1 text-micro text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
          {mensaje}
        </p>
        <p className="mt-1.5 text-[11px] text-amber-800/80 dark:text-amber-400/80 font-medium">
          Reglamento de Evaluación de los Aprendizajes (REA · MEP) — Justificaciones formales deben entregarse en secretaría o coordinación con plazo máximo de 3 días hábiles.
        </p>
      </div>
    </div>
  )
}
