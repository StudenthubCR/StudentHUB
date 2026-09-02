import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconoChevron } from './icons'

type Props = {
  titulo: string
  /** Si se pasa, el título lleva a la izquierda un botón de retroceso. */
  volverA?: string
  children: ReactNode
}

/** Envoltura de sección: mismo título y misma entrada en cascada de hoy. */
export function PageSection({ titulo, volverA, children }: Props) {
  return (
    <section className="animate-fade-in">
      <div data-print="ocultar" className="mb-5 flex items-center gap-1">
        {volverA && (
          <Link
            to={volverA}
            aria-label="Volver"
            className={
              'mr-2.5 flex size-9 shrink-0 items-center justify-center rounded-full ' +
              'border border-border bg-surface-alt text-text transition-all duration-250 ease-ui ' +
              'hover:bg-primary-tint hover:text-primary active:scale-90'
            }
          >
            <IconoChevron hacia="izquierda" className="size-5" />
          </Link>
        )}
        <h2 className="text-[1.45rem] font-bold tracking-[-0.02em] md:text-[1.7rem]">{titulo}</h2>
      </div>
      {children}
    </section>
  )
}
