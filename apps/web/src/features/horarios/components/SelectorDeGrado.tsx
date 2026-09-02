import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { GRADOS } from '../grados'

const TARJETA =
  'flex flex-col items-center gap-1 rounded-lg border-[1.5px] bg-surface px-4 py-6 text-center'

/**
 * Los seis grados. Sólo los que ya tienen horario en la hoja son navegables;
 * el resto se muestra apagado, igual que hoy, para que se vea que existen.
 */
export function SelectorDeGrado() {
  return (
    <div className="mt-2.5 grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
      {GRADOS.map((grado) =>
        grado.grupo ? (
          <Link
            key={grado.id}
            to={`/horarios/${grado.id}`}
            className={cn(
              TARJETA,
              'border-primary cursor-pointer shadow-[0_8px_24px_var(--color-primary-tint-strong)]',
              'transition-[transform,box-shadow,border-color] duration-250 ease-soft',
              'hover:-translate-y-1 hover:elev-lg active:scale-97',
            )}
          >
            <span className="text-[1.85rem] leading-tight font-bold text-primary">
              {grado.numero}
            </span>
            <span className="text-menor text-text-muted">{grado.nombre}</span>
            <span className="mt-1.5 rounded-full bg-primary-tint px-2.5 py-[3px] text-etiqueta font-semibold text-primary">
              Grupo {grado.grupo}
            </span>
          </Link>
        ) : (
          <div
            key={grado.id}
            aria-disabled
            title="Horario todavía no publicado"
            className={cn(TARJETA, 'border-border elev-sm pointer-events-none opacity-45')}
          >
            <span className="text-[1.85rem] leading-tight font-bold text-primary">
              {grado.numero}
            </span>
            <span className="text-menor text-text-muted">{grado.nombre}</span>
          </div>
        ),
      )}
    </div>
  )
}
