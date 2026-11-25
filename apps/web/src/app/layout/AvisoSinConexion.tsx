import { useEstadoRedOffline } from '@/lib/useEnLinea'
import { formatearUltimaSincronizacion } from '@/lib/offlineCache'
import { IconoCheck } from '@/components/icons'

/** Ícono SVG de nube desconectada para estado sin internet (cero emojis Unicode). */
function IconoSinRed() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      <path d="M2 2l20 20" />
      <path d="M8.5 16.5a5 5 0 0 1 7-.5" />
      <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
      <path d="M10.71 5.058A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth={2.4} />
    </svg>
  )
}

/**
 * Barra discreta y no bloqueante que aparece únicamente cuando el dispositivo
 * pierde conectividad real (o brevemente al restablecer y resincronizar datos).
 */
export function AvisoSinConexion() {
  const { enLinea, ultimaSincronizacion, recienReconectado } = useEstadoRedOffline()

  if (enLinea && !recienReconectado) return null

  if (!enLinea) {
    const etiquetaSync = formatearUltimaSincronizacion(ultimaSincronizacion)

    return (
      <div
        role="status"
        aria-live="polite"
        data-print="ocultar"
        className={
          'mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/40 ' +
          'bg-amber-500/10 px-3.5 py-2.5 text-menor font-semibold text-amber-950 dark:text-amber-100 shadow-2xs'
        }
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <IconoSinRed />
          </span>
          <span className="leading-snug">
            Modo sin conexión · Mostrando información guardada en caché
          </span>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-surface/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-200">
          Actualizado: {etiquetaSync}
        </span>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      data-print="ocultar"
      className={
        'mb-4 flex items-center gap-2 rounded-2xl border border-emerald-500/35 ' +
        'bg-emerald-500/10 px-3.5 py-2 text-menor font-semibold text-emerald-800 dark:text-emerald-200 shadow-2xs'
      }
    >
      <IconoCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span>Conexión restablecida · Caché local sincronizado</span>
    </div>
  )
}
