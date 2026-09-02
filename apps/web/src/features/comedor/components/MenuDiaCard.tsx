import { useId, useState } from 'react'
import { IconoChevron, IconoComedor, IconoSinServicio } from '@/components/icons'
import { cn } from '@/lib/cn'
import { etiquetaCortaDeFecha, nombreDelDia, separarAderezo } from '../menu.service'
import type { DiaDeLaSemana } from '../menu.types'

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col">
      <span className="mb-0.5 text-etiqueta tracking-[0.08em] text-text-muted uppercase">
        {etiqueta}
      </span>
      <p className="text-menor leading-[1.4] font-semibold text-text">{valor}</p>
    </div>
  )
}

function Encabezado({ dia, esHoy }: { dia: DiaDeLaSemana; esHoy: boolean }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-primary-tint px-5 py-3">
      <div>
        <h4 className="text-base leading-tight font-bold text-primary">
          {nombreDelDia(dia.fecha)}
        </h4>
        <p className="text-etiqueta text-text-muted">{etiquetaCortaDeFecha(dia.fecha)}</p>
      </div>
      {esHoy ? (
        <span className="rounded-full bg-primary-solid px-2.5 py-1 text-micro font-bold tracking-[0.06em] text-white uppercase">
          Hoy
        </span>
      ) : dia.menu ? (
        <IconoComedor className="size-5 text-primary opacity-70" />
      ) : (
        <IconoSinServicio className="size-5 text-text-muted opacity-70" />
      )}
    </header>
  )
}

const TARJETA =
  'flex flex-col overflow-hidden rounded-lg border bg-surface elev-md ' +
  'transition-[box-shadow,border-color] duration-250 ease-soft hover:elev-lg'

type Props = {
  dia: DiaDeLaSemana
  /** Sólo alimenta el retardo de la animación en cascada. */
  indice: number
  esHoy: boolean
}

/**
 * Tarjeta de un día de la parrilla semanal.
 *
 * El plato principal se ve siempre — es lo que uno viene a mirar — y el resto
 * del detalle se despliega. Así la semana entera se recorre de un vistazo en
 * el celular, en vez de scrollear cinco tarjetas completas.
 *
 * El día de hoy arranca abierto.
 */
export function MenuDiaCard({ dia, indice, esHoy }: Props) {
  const [abierto, setAbierto] = useState(esHoy)
  const idDetalle = useId()

  if (!dia.menu) {
    return (
      <article
        style={{ animationDelay: `${indice * 0.08}s` }}
        className={cn('animate-fade-in border-border', TARJETA)}
      >
        <Encabezado dia={dia} esHoy={esHoy} />
        <p className="my-auto px-5 py-8 text-center text-menor text-text-muted">
          Sin servicio programado para este día.
        </p>
      </article>
    )
  }

  const { acompanamiento, aderezo } = separarAderezo(dia.menu.acompanamiento)

  return (
    <article
      style={{ animationDelay: `${indice * 0.08}s` }}
      aria-current={esHoy ? 'date' : undefined}
      className={cn(
        'animate-fade-in',
        TARJETA,
        esHoy ? 'border-primary-tint-strong' : 'border-border',
      )}
    >
      <Encabezado dia={dia} esHoy={esHoy} />

      {/* Siempre visible: el plato del día */}
      <div className="px-5 pt-4 pb-3">
        <Campo etiqueta="Plato principal" valor={dia.menu.plato} />
      </div>

      <button
        type="button"
        onClick={() => setAbierto((estaba) => !estaba)}
        aria-expanded={abierto}
        aria-controls={idDetalle}
        className={cn(
          'mt-auto flex cursor-pointer items-center justify-between gap-2 px-5 py-2.5',
          'border-t border-border text-menuda font-semibold text-text-muted',
          'transition-colors duration-250 hover:bg-surface-alt hover:text-primary',
        )}
      >
        <span>
          {abierto ? 'Ocultar detalle' : 'Ver acompañamiento, bebida y fruta'}
          <span className="sr-only"> de {nombreDelDia(dia.fecha)}</span>
        </span>
        <IconoChevron
          className={cn(
            'size-4 shrink-0 transition-transform duration-300 ease-soft',
            abierto && 'rotate-180',
          )}
        />
      </button>

      {/* El truco de 0fr → 1fr anima la altura sin medirla desde JavaScript.
          La regla global de prefers-reduced-motion ya la desactiva. */}
      <div
        id={idDetalle}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-soft',
          abierto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3.5 border-t border-border px-5 py-4">
            {acompanamiento && <Campo etiqueta="Acompañamiento" valor={acompanamiento} />}
            {aderezo && <Campo etiqueta="Aderezo" valor={aderezo} />}
            <Campo etiqueta="Bebida" valor={dia.menu.bebida} />
            <Campo etiqueta="Fruta" valor={dia.menu.fruta} />
          </div>
        </div>
      </div>
    </article>
  )
}
