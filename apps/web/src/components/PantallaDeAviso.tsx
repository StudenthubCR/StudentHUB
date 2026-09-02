import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type Props = {
  titulo: string
  descripcion: string
  /** Icono grande, opcional. */
  icono?: ReactNode
  accion?: { texto: string; a: string } | { texto: string; onClick: () => void }
}

const BOTON =
  'mt-5 inline-flex cursor-pointer items-center justify-center rounded-full bg-primary-solid ' +
  'px-5 py-2.5 text-menor font-semibold text-white transition-transform duration-250 active:scale-95'

/**
 * Pantalla para los callejones sin salida: ruta que no existe, error que no
 * supimos manejar. Se ve como el resto de la app en vez de como la página de
 * desarrollador que trae React Router por defecto.
 */
export function PantallaDeAviso({ titulo, descripcion, icono, accion }: Props) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-[420px] flex-col items-center rounded-lg border border-border',
        'bg-surface px-6 py-12 text-center elev-md',
      )}
    >
      {icono && <div className="mb-4 text-primary opacity-70">{icono}</div>}
      <h2 className="text-titulo leading-tight font-bold tracking-[-0.02em]">{titulo}</h2>
      <p className="mt-2 text-menor leading-relaxed text-text-muted">{descripcion}</p>

      {accion &&
        ('a' in accion ? (
          <Link to={accion.a} className={BOTON}>
            {accion.texto}
          </Link>
        ) : (
          <button type="button" onClick={accion.onClick} className={BOTON}>
            {accion.texto}
          </button>
        ))}
    </div>
  )
}
