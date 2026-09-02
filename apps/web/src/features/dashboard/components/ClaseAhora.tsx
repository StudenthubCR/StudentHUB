import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { IconoCalendario, IconoFlechaDerecha, IconoReloj } from '@/components/icons'
import { ahoraEnMinutos, progresoDelDia } from '@/features/horarios/horario.service'
import type { Bloque, DiaDeClases } from '@/features/horarios/horario.types'

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'sin-clases' }
  | { tipo: 'termino' }
  | { tipo: 'bloque'; bloque: Bloque; enCurso: boolean }

function estadoDe(dia: DiaDeClases | null, ahora: Date, cargando: boolean, hayError: boolean): Estado {
  if (cargando) return { tipo: 'cargando' }
  if (hayError) return { tipo: 'error' }
  if (!dia) return { tipo: 'sin-clases' }

  const { actual, siguiente } = progresoDelDia(dia.bloques, ahoraEnMinutos(ahora))
  if (actual !== null) return { tipo: 'bloque', bloque: dia.bloques[actual]!, enCurso: true }
  if (siguiente !== null) return { tipo: 'bloque', bloque: dia.bloques[siguiente]!, enCurso: false }
  return { tipo: 'termino' }
}

function Etiqueta({ enCurso }: { enCurso: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        'text-micro font-bold tracking-[0.08em] uppercase',
        enCurso ? 'bg-primary-solid text-white' : 'bg-primary-tint text-primary',
      )}
    >
      {enCurso && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
      )}
      {enCurso ? 'En curso' : 'Sigue'}
    </span>
  )
}

type Props = {
  dia: DiaDeClases | null
  ahora: Date
  cargando: boolean
  hayError: boolean
  /** Ruta al horario del grupo del estudiante. */
  aHorario: string
}

/**
 * La tarjeta principal del inicio: qué clase hay ahora o cuál sigue.
 *
 * Es lo primero que un estudiante quiere saber al abrir la app, así que ocupa
 * el lugar más visible y con la tipografía más grande de la pantalla.
 */
export function ClaseAhora({ dia, ahora, cargando, hayError, aHorario }: Props) {
  const estado = estadoDe(dia, ahora, cargando, hayError)

  return (
    <Link
      to={aHorario}
      aria-busy={estado.tipo === 'cargando'}
      className={cn(
        'group block rounded-lg border border-l-4 border-border border-l-primary bg-surface',
        'px-5 py-5 elev-md transition-[transform,box-shadow,border-color] duration-250 ease-soft',
        'hover:-translate-y-[3px] hover:border-primary-tint-strong hover:border-l-primary hover:elev-lg',
        'md:px-6 md:py-6',
      )}
    >
      <span className="mb-2.5 flex items-center gap-2 text-etiqueta font-bold tracking-[0.09em] text-text-muted uppercase">
        <IconoCalendario className="size-3.5" />
        Clases de hoy
      </span>

      {estado.tipo === 'cargando' && (
        <span className="flex animate-pulse flex-col gap-2.5 py-1">
          <span className="block h-6 w-[70%] rounded-full bg-surface-alt" />
          <span className="block h-3 w-[45%] rounded-full bg-surface-alt" />
        </span>
      )}

      {estado.tipo === 'error' && (
        <p className="text-subtitulo font-bold text-text">No pudimos cargar el horario</p>
      )}

      {estado.tipo === 'sin-clases' && (
        <>
          <p className="text-titulo leading-tight font-bold tracking-[-0.02em] md:text-[1.5rem]">
            Sin clases hoy
          </p>
          <p className="mt-1.5 text-menor text-text-muted">Disfrutá el día libre.</p>
        </>
      )}

      {estado.tipo === 'termino' && (
        <>
          <p className="text-titulo leading-tight font-bold tracking-[-0.02em] md:text-[1.5rem]">
            Las clases ya terminaron
          </p>
          <p className="mt-1.5 text-menor text-text-muted">Nos vemos mañana.</p>
        </>
      )}

      {estado.tipo === 'bloque' && (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-titulo leading-tight font-bold tracking-[-0.02em] md:text-[1.5rem]">
              {estado.bloque.materia}
            </p>
            <Etiqueta enCurso={estado.enCurso} />
          </div>
          <p className="flex items-center gap-1.5 text-menor text-text-muted">
            <IconoReloj className="size-3.5 shrink-0" />
            {estado.bloque.inicio}
            {estado.bloque.fin && ` – ${estado.bloque.fin}`}
            {estado.bloque.lecciones > 1 && ` · ${estado.bloque.lecciones} lecciones`}
          </p>
        </>
      )}

      <span className="mt-4 flex items-center gap-1.5 text-nota font-semibold text-primary">
        Ver horario completo
        <IconoFlechaDerecha className="size-3.5 transition-transform duration-250 group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
