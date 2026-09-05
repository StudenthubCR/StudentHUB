import { cn } from '@/lib/cn'
import type { Bloque } from '../horario.types'

export type Marca = 'ahora' | 'siguiente' | null

function Etiqueta({ marca }: { marca: Exclude<Marca, null> }) {
  const esAhora = marca === 'ahora'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px]',
        'text-micro font-bold tracking-[0.08em] uppercase',
        esAhora ? 'bg-primary-solid text-white' : 'bg-primary-tint text-primary',
      )}
    >
      {esAhora && (
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
      )}
      {esAhora ? 'Ahora' : 'Sigue'}
    </span>
  )
}

type Props = {
  bloque: Bloque
  indice: number
  marca: Marca
  /** Los bloques ya terminados se atenúan para que la vista se lea sola. */
  pasado: boolean
}

export function BloqueClase({ bloque, indice, marca, pasado }: Props) {
  return (
    <li
      style={{ animationDelay: `${indice * 0.06}s` }}
      className={cn(
        'animate-slide-up flex items-center gap-4 rounded-md border border-l-4 px-4 py-3.5',
        'transition-[transform,box-shadow,opacity] duration-250 ease-ui hover:translate-x-[3px]',
        bloque.esReceso
          ? 'border-border border-l-[#f39c12] bg-surface-alt'
          : 'border-border border-l-primary bg-surface elev-sm hover:elev-md',
        marca === 'ahora' && 'border-l-primary ring-2 ring-primary-tint-strong',
        pasado && 'opacity-55',
      )}
    >
      <div className="min-w-[58px] shrink-0 border-r border-border pr-3 text-center">
        <span className="block text-dato font-bold">{bloque.inicio}</span>
        {bloque.fin && <span className="block text-menuda text-text-muted">{bloque.fin}</span>}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h4 className={cn('text-cuerpo font-semibold', bloque.esReceso && 'italic')}>
            {bloque.materia}
          </h4>
          {marca && <Etiqueta marca={marca} />}
        </div>
        {bloque.docente && !bloque.esReceso && (
          <p className="text-menuda text-text-muted">
            <span className="font-medium text-text-subtle">Prof.</span> {bloque.docente}
          </p>
        )}
        {bloque.lecciones > 1 && (
          <p className="text-menuda text-text-muted">{bloque.lecciones} lecciones seguidas</p>
        )}
      </div>
    </li>
  )
}
