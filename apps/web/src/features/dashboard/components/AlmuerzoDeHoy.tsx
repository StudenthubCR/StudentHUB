import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { IconoComedor, IconoFlechaDerecha } from '@/components/icons'
import { separarAderezo } from '@/features/comedor/menu.service'
import type { EstadoDelDia } from '@/features/comedor/menu.types'

type Props = {
  estado: EstadoDelDia
  cargando: boolean
  hayError: boolean
}

function Texto({ estado }: { estado: EstadoDelDia }) {
  if (estado.tipo === 'cerrado') {
    return (
      <>
        <p className="text-subtitulo leading-tight font-bold tracking-[-0.01em]">
          Comedor cerrado
        </p>
        <p className="mt-1.5 text-menor text-text-muted">
          No hay servicio los fines de semana.
        </p>
      </>
    )
  }

  if (estado.tipo === 'sin-menu') {
    return (
      <>
        <p className="text-subtitulo leading-tight font-bold tracking-[-0.01em]">
          Sin menú publicado
        </p>
        <p className="mt-1.5 text-menor text-text-muted">
          La cocina todavía no lo ha cargado.
        </p>
      </>
    )
  }

  const { acompanamiento } = separarAderezo(estado.menu.acompanamiento)

  return (
    <>
      <p className="text-subtitulo leading-snug font-bold tracking-[-0.01em]">
        {estado.menu.plato}
      </p>
      {acompanamiento && (
        <p className="mt-1.5 text-menor leading-snug text-text-muted">{acompanamiento}</p>
      )}
      <p className="mt-1 text-nota text-text-muted">
        {estado.menu.bebida} · {estado.menu.fruta}
      </p>
    </>
  )
}

export function AlmuerzoDeHoy({ estado, cargando, hayError }: Props) {
  return (
    <Link
      to="/comedor"
      aria-busy={cargando}
      className={cn(
        'group mt-3.5 block rounded-lg border border-border bg-surface px-5 py-5 elev-md',
        'transition-[transform,box-shadow,border-color] duration-250 ease-soft',
        'hover:-translate-y-[3px] hover:border-primary-tint-strong hover:elev-lg md:px-6',
      )}
    >
      <span className="mb-2.5 flex items-center gap-2 text-etiqueta font-bold tracking-[0.09em] text-text-muted uppercase">
        <IconoComedor className="size-3.5" />
        Almuerzo de hoy
      </span>

      {cargando ? (
        <span className="flex animate-pulse flex-col gap-2 py-1">
          <span className="block h-4 w-[75%] rounded-full bg-surface-alt" />
          <span className="block h-3 w-[55%] rounded-full bg-surface-alt" />
        </span>
      ) : hayError ? (
        <p className="text-subtitulo font-bold">No pudimos cargar el menú</p>
      ) : (
        <Texto estado={estado} />
      )}

      <span className="mt-4 flex items-center gap-1.5 text-nota font-semibold text-primary">
        Ver el menú de la semana
        <IconoFlechaDerecha className="size-3.5 transition-transform duration-250 group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
