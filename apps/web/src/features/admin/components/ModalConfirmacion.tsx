import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { IconoEliminar, IconoAlertaTriangulo, IconoInfo } from '@/components/icons'

type Props = {
  abierto: boolean
  alCerrar: () => void
  alConfirmar: () => void | Promise<void>
  titulo: string
  mensaje: string
  textoConfirmar?: string
  textoCancelar?: string
  variante?: 'danger' | 'warning' | 'info'
  procesando?: boolean
}

export function ModalConfirmacion({
  abierto,
  alCerrar,
  alConfirmar,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'danger',
  procesando = false,
}: Props) {
  useEffect(() => {
    if (!abierto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const alEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !procesando) alCerrar()
    }
    window.addEventListener('keydown', alEsc)

    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', alEsc)
    }
  }, [abierto, procesando, alCerrar])

  if (!abierto) return null

  const colores = {
    danger: {
      iconoBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      boton: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      iconoBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      boton: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    info: {
      iconoBg: 'bg-primary-tint text-primary border-primary/20',
      boton: 'bg-primary hover:bg-primary-dark text-white',
    },
  }[variante]

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Fondo desenfocado */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !procesando && alCerrar()}
      />

      {/* Ventana Modal / Bottom Sheet en móvil */}
      <div className="relative w-full max-w-md animate-slide-up sm:animate-fade-in rounded-t-3xl sm:rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs',
              colores.iconoBg,
            )}
          >
            {variante === 'danger' && <IconoEliminar className="size-6" />}
            {variante === 'warning' && <IconoAlertaTriangulo className="size-6" />}
            {variante === 'info' && <IconoInfo className="size-6" />}
          </div>

          <div className="flex-1">
            <h3 className="text-subtitulo font-bold text-text">{titulo}</h3>
            <p className="mt-1.5 text-menor leading-relaxed text-text-muted">{mensaje}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={procesando}
            onClick={alCerrar}
            className="w-full sm:w-auto cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 text-menor font-semibold text-text-muted transition-all hover:bg-surface-alt hover:text-text active:scale-98 disabled:opacity-50 min-h-[44px]"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={() => void alConfirmar()}
            className={cn(
              'w-full sm:w-auto cursor-pointer rounded-xl px-4 py-2.5 text-menor font-bold shadow-xs transition-all active:scale-98 disabled:opacity-50 min-h-[44px]',
              colores.boton,
            )}
          >
            {procesando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
