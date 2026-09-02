import { IconoComedor } from '@/components/icons'
import { etiquetaCortaDeFecha, nombreDelDia } from '../menu.service'
import type { DiaDeLaSemana } from '../menu.types'
import { MenuDiaCard } from './MenuDiaCard'

const GRID = 'grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4.5 xl:grid-cols-3'

/**
 * Esqueleto de carga. Conserva el encabezado real del día — la fecha ya se
 * conoce sin pedirle nada a la hoja — para que la parrilla no salte cuando
 * llegan los datos.
 */
function MenuDiaSkeleton({ dia, indice }: { dia: DiaDeLaSemana; indice: number }) {
  return (
    <article
      style={{ animationDelay: `${indice * 0.08}s` }}
      className="animate-fade-in flex flex-col overflow-hidden rounded-lg border border-border bg-surface elev-md"
    >
      <header className="flex items-center justify-between border-b border-border bg-primary-tint px-5 py-3">
        <div>
          <h4 className="text-base leading-tight font-bold text-primary">
            {nombreDelDia(dia.fecha)}
          </h4>
          <p className="text-etiqueta text-text-muted">{etiquetaCortaDeFecha(dia.fecha)}</p>
        </div>
        <IconoComedor className="size-5 text-primary opacity-40" />
      </header>

      {/* Mismo esqueleto que la tarjeta cerrada: encabezado, plato y la fila
          del desplegable. Así nada se mueve cuando llegan los datos. */}
      <div className="animate-pulse px-5 pt-4 pb-3">
        <div className="mb-1.5 h-2 w-20 rounded-full bg-surface-alt" />
        <div className="h-3 w-[85%] rounded-full bg-surface-alt" />
      </div>
      <div className="mt-auto border-t border-border px-5 py-3.5">
        <div className="h-2.5 w-40 animate-pulse rounded-full bg-surface-alt" />
      </div>
    </article>
  )
}

type Props = {
  dias: DiaDeLaSemana[]
  subtitulo: string
  claveDeHoy: string
  cargando: boolean
  error: string | null
  onReintentar: () => void
}

export function MenuSemanaGrid({
  dias,
  subtitulo,
  claveDeHoy,
  cargando,
  error,
  onReintentar,
}: Props) {
  return (
    <section aria-busy={cargando}>
      <h3 className="mb-1 text-subtitulo font-bold tracking-[-0.01em]">Menú Semanal de Almuerzos</h3>
      <p className="mb-4.5 text-menor text-text-muted">{subtitulo}</p>

      {error ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center elev-md">
          <p className="text-cuerpo font-semibold text-text">No se pudo leer el menú semanal</p>
          <p className="mt-2 text-menor text-text-muted">{error}</p>
          <button
            type="button"
            onClick={onReintentar}
            className={
              'mt-4 cursor-pointer rounded-full bg-primary-solid px-5 py-2.5 text-menor ' +
              'font-semibold text-white transition-transform duration-250 active:scale-95'
            }
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className={GRID}>
          {dias.map((dia, indice) =>
            cargando ? (
              <MenuDiaSkeleton key={dia.clave} dia={dia} indice={indice} />
            ) : (
              <MenuDiaCard
                key={dia.clave}
                dia={dia}
                indice={indice}
                esHoy={dia.clave === claveDeHoy}
              />
            ),
          )}
        </div>
      )}
    </section>
  )
}
