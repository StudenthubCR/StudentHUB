import { cn } from '@/lib/cn'
import type { DiaDeClases } from '../horario.types'

export const TODA_LA_SEMANA = '__semana__'

type Props = {
  dias: DiaDeClases[]
  seleccion: string
  onSeleccionar: (dia: string) => void
}

/**
 * Pestañas de día estilizadas tipo segmented control moderno y fluido.
 */
export function SelectorDeDia({ dias, seleccion, onSeleccionar }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Día de la semana"
      className="sin-barra mb-5 flex w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-border/80 bg-surface-alt/70 p-1.5 shadow-xs"
    >
      {dias.map((dia) => {
        const activo = seleccion === dia.dia
        return (
          <button
            key={dia.dia}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onSeleccionar(dia.dia)}
            className={cn(
              'flex flex-1 min-w-[56px] cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-nota font-bold',
              'transition-all duration-200 ease-ui active:scale-95',
              activo
                ? 'bg-primary-solid text-white shadow-md shadow-primary/20 scale-[1.01]'
                : 'text-text-muted hover:bg-surface/80 hover:text-text',
            )}
          >
            <span>{dia.abreviatura}</span>
            {dia.esHoy && (
              <span
                className={cn(
                  'flex size-1.5 rounded-full',
                  activo ? 'bg-white' : 'bg-primary animate-pulse',
                )}
                aria-label="Hoy"
                title="Hoy"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
