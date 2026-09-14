import { cn } from '@/lib/cn'
import { ahoraEnMinutos, progresoDelDia } from '@/features/horarios/horario.service'
import type { DiaDeClases } from '@/features/horarios/horario.types'

const MAXIMO = 3

/**
 * Lo que viene después de la clase actual, en corto.
 *
 * No repite la tarjeta de arriba: arranca en el bloque siguiente al que ya se
 * está mostrando ahí. Si no queda nada por delante, no se dibuja.
 */
export function RestoDelDia({ dia, ahora }: { dia: DiaDeClases | null; ahora: Date }) {
  if (!dia) return null

  const { actual, siguiente } = progresoDelDia(dia.bloques, ahoraEnMinutos(ahora))
  const yaMostrado = actual ?? siguiente
  if (yaMostrado === null) return null

  const pendientes = dia.bloques.slice(yaMostrado + 1, yaMostrado + 1 + MAXIMO)
  if (pendientes.length === 0) return null

  const restantes = dia.bloques.length - (yaMostrado + 1) - pendientes.length

  return (
    <section className="mt-2.5">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[11px] font-bold tracking-[0.08em] text-text-muted uppercase">
          Próximas lecciones
        </span>
      </div>

      <ul className="divide-y divide-border/60 rounded-xl border border-border/70 bg-surface-alt/40">
        {pendientes.map((bloque) => (
          <li
            key={`${bloque.inicio}-${bloque.materia}`}
            className="flex items-center justify-between gap-3 px-3.5 py-2 text-micro"
          >
            <span
              className={cn(
                'min-w-0 truncate font-medium',
                bloque.esReceso ? 'text-text-muted italic' : 'text-text',
              )}
            >
              {bloque.materia}
            </span>
            <span className="shrink-0 font-bold tabular-nums text-text-muted">
              {bloque.inicio}
            </span>
          </li>
        ))}

        {restantes > 0 && (
          <li className="px-3.5 py-1.5 text-center text-[11px] font-medium text-text-muted">
            + {restantes} {restantes === 1 ? 'lección más' : 'lecciones más'}
          </li>
        )}
      </ul>
    </section>
  )
}
