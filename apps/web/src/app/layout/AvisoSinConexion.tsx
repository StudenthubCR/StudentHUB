import { useEnLinea } from '@/lib/useEnLinea'

/** Barra discreta que aparece sólo cuando el dispositivo se queda sin red. */
export function AvisoSinConexion() {
  const enLinea = useEnLinea()
  if (enLinea) return null

  return (
    <p
      role="status"
      data-print="ocultar"
      className={
        'mb-4 flex items-center gap-2.5 rounded-md border border-[#f39c12]/40 ' +
        'bg-[#f39c12]/12 px-4 py-2.5 text-menor font-medium text-text'
      }
    >
      <span className="size-2 shrink-0 rounded-full bg-[#f39c12]" aria-hidden />
      Sin conexión. Estás viendo la última información guardada.
    </p>
  )
}
