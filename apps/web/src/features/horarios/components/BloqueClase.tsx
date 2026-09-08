import { cn } from '@/lib/cn'
import type { Bloque } from '../horario.types'

export type Marca = 'ahora' | 'siguiente' | null

function Etiqueta({ marca }: { marca: Exclude<Marca, null> }) {
  const esAhora = marca === 'ahora'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold tracking-wider uppercase shadow-2xs',
        esAhora
          ? 'bg-primary-solid text-white animate-pulse'
          : 'border border-primary/20 bg-primary-tint text-primary',
      )}
    >
      {esAhora && (
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-80" />
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
  const esReceso = bloque.esReceso
  const esAhora = marca === 'ahora'

  return (
    <li
      style={{ animationDelay: `${indice * 0.05}s` }}
      className={cn(
        'animate-slide-up relative flex items-center gap-3.5 rounded-2xl border p-3.5 sm:p-4',
        'transition-all duration-200 ease-ui hover:translate-x-1',
        esReceso
          ? 'border-amber-500/30 bg-amber-500/8 text-amber-950 dark:bg-amber-500/10 dark:text-amber-200 shadow-xs'
          : 'border-border bg-surface shadow-sm hover:border-primary/30 hover:shadow-md',
        esAhora &&
          'border-primary bg-primary-tint/20 ring-2 ring-primary/20 shadow-md shadow-primary/10',
        pasado && 'opacity-50 saturate-75',
      )}
    >
      {/* Cápsula horaria moderna */}
      <div
        className={cn(
          'flex min-w-[70px] shrink-0 flex-col items-center justify-center rounded-xl p-2 text-center shadow-2xs',
          esReceso
            ? 'border border-amber-500/25 bg-amber-500/15'
            : esAhora
              ? 'border border-primary/30 bg-primary-solid text-white'
              : 'border border-border/80 bg-surface-alt/70',
        )}
      >
        <span
          className={cn(
            'text-dato font-extrabold leading-tight',
            esReceso
              ? 'text-amber-800 dark:text-amber-300'
              : esAhora
                ? 'text-white'
                : 'text-primary dark:text-primary-light',
          )}
        >
          {bloque.inicio}
        </span>
        {bloque.fin && (
          <span
            className={cn(
              'mt-0.5 text-micro font-medium leading-none',
              esAhora ? 'text-white/80' : 'text-text-muted',
            )}
          >
            {bloque.fin}
          </span>
        )}
      </div>

      {/* Contenido principal de la lección */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h4
            className={cn(
              'text-cuerpo font-bold tracking-tight',
              esReceso ? 'text-amber-900 italic dark:text-amber-300' : 'text-text',
            )}
          >
            {esReceso && <span className="mr-1.5 not-italic">🍽️</span>}
            {bloque.materia}
          </h4>
          {marca && <Etiqueta marca={marca} />}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-menuda text-text-muted">
          {bloque.docente && !esReceso && (
            <span className="flex items-center gap-1">
              <span className="opacity-70">👨‍🏫</span>
              <span>
                <strong className="font-medium text-text">Prof.</strong> {bloque.docente}
              </span>
            </span>
          )}

          {bloque.lecciones > 1 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-alt px-1.5 py-0.5 text-micro font-semibold text-text-muted">
              {bloque.lecciones} lecciones seguidas
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
