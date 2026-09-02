import { cn } from '@/lib/cn'
import { ahoraEnMinutos, jornadaDelDia, progresoDelDia } from '../horario.service'
import type { DiaDeClases } from '../horario.types'
import { BloqueClase, type Marca } from './BloqueClase'

/**
 * Una línea que responde la pregunta con la que uno abre la app: qué sigue,
 * o si ya se acabó. Sólo tiene sentido en el día de hoy.
 */
function EstadoDeHoy({ dia, ahora }: { dia: DiaDeClases; ahora: number }) {
  const { actual, siguiente } = progresoDelDia(dia.bloques, ahora)
  const jornada = jornadaDelDia(dia.bloques)
  if (!jornada) return null

  let texto: string
  if (actual !== null) {
    texto = `En curso: ${dia.bloques[actual]!.materia}`
  } else if (siguiente !== null) {
    const proximo = dia.bloques[siguiente]!
    texto =
      siguiente === 0
        ? `Las clases empiezan a las ${jornada.inicio}`
        : `Sigue ${proximo.materia} a las ${proximo.inicio}`
  } else {
    texto = 'Las clases de hoy ya terminaron'
  }

  return <span className="font-semibold text-primary">{texto}</span>
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
    <section>
      {conTitulo && (
        <h4 className="mb-1.5 flex items-center gap-2 pl-1 text-nota font-bold tracking-[0.08em] text-primary uppercase">
          {dia.dia}
          {dia.esHoy && (
            <span className="rounded-full bg-primary-solid px-2 py-[2px] text-micro tracking-[0.06em] text-white">
              Hoy
            </span>
          )}
        </h4>
      )}

      <p className={cn('mb-3.5 pl-1 text-nota text-text-muted', conTitulo && 'mb-2.5')}>
        {lecciones} {lecciones === 1 ? 'lección' : 'lecciones'}
        {jornada && ` · ${jornada.inicio} a ${jornada.fin}`}
        {ahora !== null && (
          <>
            {' · '}
            <EstadoDeHoy dia={dia} ahora={ahora} />
          </>
        )}
      </p>

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
