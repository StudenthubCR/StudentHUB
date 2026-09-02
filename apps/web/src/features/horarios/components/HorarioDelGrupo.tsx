import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { diaPorDefecto } from '../horario.service'
import type { DiaDeClases } from '../horario.types'
import { DiaDeClasesLista, minutosSiEsHoy } from './DiaDeClasesLista'
import { SelectorDeDia, TODA_LA_SEMANA } from './SelectorDeDia'

function Mensaje({ children, esError }: { children: string; esError?: boolean }) {
  return (
    <p
      className={cn(
        'rounded-lg border border-dashed px-4 py-7 text-center text-dato',
        esError
          ? 'border-[#c0392b]/35 text-[#c0392b] dark:text-[#ff8a80]'
          : 'border-border-strong text-text-muted',
      )}
    >
      {children}
    </p>
  )
}

function Esqueleto() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="mb-5 flex gap-2">
        {[0, 1, 2, 3, 4].map((pildora) => (
          <div key={pildora} className="h-8 w-14 rounded-full bg-surface-alt" />
        ))}
      </div>
      <div className="mb-3.5 h-3 w-52 rounded-full bg-surface-alt" />
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2, 3].map((fila) => (
          <div
            key={fila}
            className="flex items-center gap-4 rounded-md border border-border border-l-4 border-l-surface-alt bg-surface px-4 py-3.5 elev-sm"
          >
            <div className="min-w-[58px] shrink-0 border-r border-border pr-3">
              <div className="mx-auto h-3 w-12 rounded-full bg-surface-alt" />
            </div>
            <div className="h-3.5 w-32 rounded-full bg-surface-alt" />
          </div>
        ))}
      </div>
    </div>
  )
}

type Props = {
  titulo: string
  lecciones: number
  dias: DiaDeClases[]
  ahora: Date
  cargando: boolean
  error: string | null
  onReintentar: () => void
}

export function HorarioDelGrupo({
  titulo,
  lecciones,
  dias,
  ahora,
  cargando,
  error,
  onReintentar,
}: Props) {
  const [seleccion, setSeleccion] = useState<string | null>(null)

  // Los días llegan después del fetch: en cuanto llegan se abre el de hoy.
  useEffect(() => {
    if (dias.length > 0) setSeleccion((actual) => actual ?? diaPorDefecto(dias))
  }, [dias])

  const verSemana = seleccion === TODA_LA_SEMANA
  const diaVisible = dias.find((dia) => dia.dia === seleccion) ?? null

  return (
    <div
      className={cn(
        'mt-2.5',
        // En escritorio el horario vive dentro de una tarjeta, como hoy.
        'lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:p-7 lg:elev-md',
      )}
      aria-busy={cargando}
    >
      {/* En móvil se apila: si el título comparte fila con el botón, "11°
          Undécimo — Grupo 11-2" no cabe y se corta justo en el dato útil. */}
      <div
        className={cn(
          'mb-5 flex flex-col items-start gap-3 border-b border-border pb-3',
          'xs:flex-row xs:items-center xs:justify-between',
        )}
      >
        <div className="min-w-0">
          <h3 className="text-subtitulo font-bold">{titulo}</h3>
          {!cargando && !error && lecciones > 0 && (
            <p className="text-nota text-text-muted">
              {lecciones} lecciones por semana
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!cargando && !error && dias.length > 0 && (
            <button
              type="button"
              aria-pressed={verSemana}
              onClick={() => setSeleccion(verSemana ? diaPorDefecto(dias) : TODA_LA_SEMANA)}
              className={cn(
                'cursor-pointer rounded-full px-3.5 py-[7px] text-nota font-semibold',
                'whitespace-nowrap transition-all duration-250 ease-ui active:scale-95',
                verSemana
                  ? 'bg-primary-solid text-white'
                  : 'bg-primary-tint text-primary hover:bg-primary-tint-strong',
              )}
            >
              Semana
            </button>
          )}
          <Link
            to="/horarios"
            className={cn(
              'rounded-full bg-primary-tint px-3.5 py-[7px] text-nota font-semibold',
              'whitespace-nowrap text-primary transition-all duration-250 ease-ui',
              'hover:bg-primary-tint-strong active:scale-95',
            )}
          >
            Cambiar grado
          </Link>
        </div>
      </div>

      {cargando && <Esqueleto />}

      {!cargando && error && (
        <div className="flex flex-col items-center gap-4">
          <Mensaje esError>{error}</Mensaje>
          <button
            type="button"
            onClick={onReintentar}
            className={cn(
              'cursor-pointer rounded-full bg-primary-solid px-5 py-2.5 text-menor',
              'font-semibold text-white transition-transform duration-250 active:scale-95',
            )}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && dias.length === 0 && (
        <Mensaje esError>No hay horario registrado para este grupo.</Mensaje>
      )}

      {!cargando && !error && dias.length > 0 && (
        <>
          <SelectorDeDia
            dias={dias}
            seleccion={seleccion ?? ''}
            onSeleccionar={setSeleccion}
          />

          {verSemana ? (
            <div className="flex flex-col gap-6">
              {dias.map((dia) => (
                <DiaDeClasesLista
                  key={dia.dia}
                  dia={dia}
                  ahora={minutosSiEsHoy(dia, ahora)}
                  conTitulo
                />
              ))}
            </div>
          ) : (
            diaVisible && (
              <DiaDeClasesLista
                key={diaVisible.dia}
                dia={diaVisible}
                ahora={minutosSiEsHoy(diaVisible, ahora)}
              />
            )
          )}
        </>
      )}
    </div>
  )
}
