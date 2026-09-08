import { ahoraEnMinutos, jornadaDelDia, progresoDelDia } from '../horario.service'
import type { DiaDeClases } from '../horario.types'
import { BloqueClase, type Marca } from './BloqueClase'

/**
 * Indicador de progreso dinámico para el día de hoy.
 */
function EstadoDeHoy({ dia, ahora }: { dia: DiaDeClases; ahora: number }) {
  const { actual, siguiente } = progresoDelDia(dia.bloques, ahora)
  const jornada = jornadaDelDia(dia.bloques)
  if (!jornada) return null

  if (actual !== null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-2.5 py-0.5 text-micro font-bold text-primary">
        <span className="size-1.5 rounded-full bg-primary animate-ping" />
        En curso: {dia.bloques[actual]!.materia}
      </span>
    )
  }

  if (siguiente !== null) {
    const proximo = dia.bloques[siguiente]!
    return (
      <span className="inline-flex items-center gap-1 text-micro font-semibold text-text-muted">
        <span>🕒</span>
        <span>
          {siguiente === 0
            ? `Inicio a las ${jornada.inicio}`
            : `Sigue ${proximo.materia} (${proximo.inicio})`}
        </span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-micro font-semibold text-emerald-600 dark:text-emerald-400">
      <span>✓</span>
      <span>Jornada finalizada</span>
    </span>
  )
}

type Props = {
  dia: DiaDeClases
  /** Minutos del día actual, o null si el día mostrado no es hoy. */
  ahora: number | null
  /** En la vista de semana cada día lleva su encabezado. */
  conTitulo?: boolean
}

export function DiaDeClasesLista({ dia, ahora, conTitulo }: Props) {
  const jornada = jornadaDelDia(dia.bloques)
  const lecciones = dia.clases.filter((clase) => !clase.esReceso).length
  const progreso = ahora === null ? { actual: null, siguiente: null } : progresoDelDia(dia.bloques, ahora)

  return (
    <section className="animate-fade-in">
      {conTitulo && (
        <div className="mb-3 flex items-center justify-between border-b border-border/80 pb-2">
          <h4 className="flex items-center gap-2 text-cuerpo font-bold tracking-tight text-text">
            <span>{dia.dia}</span>
            {dia.esHoy && (
              <span className="rounded-full bg-primary-solid px-2 py-0.5 text-micro font-bold tracking-wider text-white uppercase">
                Hoy
              </span>
            )}
          </h4>
          <span className="text-menuda text-text-muted">
            {lecciones} {lecciones === 1 ? 'lección' : 'lecciones'}
          </span>
        </div>
      )}

      {/* Franja de resumen del día */}
      {!conTitulo && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-surface-alt/60 px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-menuda">
            <span className="font-bold text-text">
              {lecciones} {lecciones === 1 ? 'lección' : 'lecciones'}
            </span>
            {jornada && (
              <span className="text-text-muted">
                • {jornada.inicio} a {jornada.fin}
              </span>
            )}
          </div>
          {ahora !== null && <EstadoDeHoy dia={dia} ahora={ahora} />}
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {dia.bloques.map((bloque, indice) => {
          let marca: Marca = null
          if (indice === progreso.actual) marca = 'ahora'
          else if (indice === progreso.siguiente) marca = 'siguiente'

          const pasado =
            ahora !== null &&
            progreso.actual !== null &&
            indice < progreso.actual

          return (
            <BloqueClase
              key={`${dia.dia}-${bloque.inicio}-${indice}`}
              bloque={bloque}
              indice={indice}
              marca={marca}
              pasado={pasado}
            />
          )
        })}
      </ul>
    </section>
  )
}

/** Los minutos de `fecha` si el día mostrado es hoy; si no, null. */
export function minutosSiEsHoy(dia: DiaDeClases, fecha: Date): number | null {
  return dia.esHoy ? ahoraEnMinutos(fecha) : null
}
