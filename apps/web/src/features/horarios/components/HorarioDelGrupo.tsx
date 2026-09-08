import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { IconoCalendario } from '@/components/icons'
import { diaPorDefecto } from '../horario.service'
import type { DiaDeClases } from '../horario.types'
import { DiaDeClasesLista, minutosSiEsHoy } from './DiaDeClasesLista'
import { SelectorDeDia, TODA_LA_SEMANA } from './SelectorDeDia'

function Mensaje({ children, esError }: { children: string; esError?: boolean }) {
  return (
    <p
      className={cn(
        'rounded-2xl border border-dashed px-4 py-8 text-center text-dato',
        esError
          ? 'border-[#c0392b]/35 bg-[#c0392b]/5 text-[#c0392b] dark:text-[#ff8a80]'
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
          <div key={pildora} className="h-10 flex-1 rounded-2xl bg-surface-alt" />
        ))}
      </div>
      <div className="mb-4 h-9 w-full rounded-2xl bg-surface-alt/70" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((fila) => (
          <div
            key={fila}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
          >
            <div className="h-12 w-16 rounded-xl bg-surface-alt" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded-full bg-surface-alt" />
              <div className="h-3 w-28 rounded-full bg-surface-alt/60" />
            </div>
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
    <div className="mt-1" aria-busy={cargando}>
      {/* Tarjeta resumen superior de la sección y selector de vista */}
      <div className="mb-5 overflow-hidden rounded-3xl border border-border bg-surface p-4.5 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-tint text-primary shadow-2xs">
              <IconoCalendario className="size-5.5" />
            </div>
            <div>
              <h3 className="text-subtitulo font-bold tracking-tight text-text">
                {titulo}
              </h3>
              {!cargando && !error && lecciones > 0 && (
                <p className="mt-0.5 text-menuda text-text-muted">
                  <span className="font-bold text-primary">{lecciones}</span> lecciones por semana
                </p>
              )}
            </div>
          </div>

          {!cargando && !error && dias.length > 0 && (
            <div className="flex items-center rounded-2xl border border-border/80 bg-surface-alt/70 p-1 self-start sm:self-auto shadow-2xs">
              <button
                type="button"
                onClick={() => setSeleccion(diaPorDefecto(dias))}
                className={cn(
                  'cursor-pointer rounded-xl px-3 py-1.5 text-micro font-bold transition-all',
                  !verSemana
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-muted hover:text-text',
                )}
              >
                📅 Por Día
              </button>
              <button
                type="button"
                onClick={() => setSeleccion(TODA_LA_SEMANA)}
                className={cn(
                  'cursor-pointer rounded-xl px-3 py-1.5 text-micro font-bold transition-all',
                  verSemana
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-muted hover:text-text',
                )}
              >
                🗓️ Semana
              </button>
            </div>
          )}
        </div>
      </div>

      {cargando && <Esqueleto />}

      {!cargando && error && (
        <div className="flex flex-col items-center gap-4 py-4">
          <Mensaje esError>{error}</Mensaje>
          <button
            type="button"
            onClick={onReintentar}
            className={cn(
              'cursor-pointer rounded-xl bg-primary-solid px-5 py-2.5 text-menor',
              'font-semibold text-white transition-all hover:bg-primary-dark active:scale-95 shadow-sm',
            )}
          >
            Reintentar carga
          </button>
        </div>
      )}

      {!cargando && !error && dias.length === 0 && (
        <Mensaje esError>No hay horario registrado para este grupo.</Mensaje>
      )}

      {!cargando && !error && dias.length > 0 && (
        <>
          {!verSemana && (
            <SelectorDeDia
              dias={dias}
              seleccion={seleccion ?? ''}
              onSeleccionar={setSeleccion}
            />
          )}

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
