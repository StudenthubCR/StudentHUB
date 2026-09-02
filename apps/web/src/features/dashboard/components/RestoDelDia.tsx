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
    <section className="mt-3.5">
      <h3 className="mb-2 pl-1 text-etiqueta font-bold tracking-[0.09em] text-text-muted uppercase">
        Después
      </h3>

      <ul className="overflow-hidden rounded-md border border-border bg-surface elev-sm">
        {pendientes.map((bloque, indice) => (
          <li
            key={`${bloque.inicio}-${indice}`}
            className={cn(
              'flex items-center gap-3.5 px-4 py-2.5',
              indice > 0 && 'border-t border-border',
            )}
          >
            <span className="min-w-[54px] shrink-0 text-nota font-bold tabular-nums">
              {bloque.inicio}
            </span>
            <span
              className={cn(
                'min-w-0 truncate text-menor font-semibold',
                bloque.esReceso ? 'text-text-muted italic' : 'text-text',
              )}
            >
              {bloque.materia}
            </span>
          </li>
        ))}

        {restantes > 0 && (
          <li className="border-t border-border px-4 py-2 text-menuda text-text-muted">
            y {restantes} {restantes === 1 ? 'bloque más' : 'bloques más'}
          </li>
        )}
      </ul>
    </section>
  )
}
