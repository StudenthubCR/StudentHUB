import { cn } from '@/lib/cn'
import type { DiaDeClases } from '../horario.types'

export const TODA_LA_SEMANA = '__semana__'

const PILDORA =
  'shrink-0 cursor-pointer rounded-full px-3.5 py-2 text-nota font-semibold ' +
  'transition-all duration-250 ease-ui active:scale-95'

type Props = {
  dias: DiaDeClases[]
  seleccion: string
  onSeleccionar: (dia: string) => void
}

/**
 * Pestañas de día. Abrir el horario en el día de hoy en vez de en la semana
 * completa es la diferencia entre leer seis tarjetas y scrollear veintinueve.
 */
export function SelectorDeDia({ dias, seleccion, onSeleccionar }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Día de la semana"
      className="sin-barra -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1"
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
              PILDORA,
              activo
                ? 'bg-primary-solid text-white'
                : 'bg-surface-alt text-text-muted hover:bg-primary-tint hover:text-primary',
            )}
          >
            {dia.abreviatura}
            {dia.esHoy && (
              <span
                className={cn(
                  'ml-1.5 inline-block size-1.5 rounded-full align-middle',
                  activo ? 'bg-white' : 'bg-primary',
                )}
                aria-label="hoy"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
