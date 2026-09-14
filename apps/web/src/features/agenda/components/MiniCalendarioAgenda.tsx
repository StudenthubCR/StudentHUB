import { useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { IconoChevron } from '@/components/icons'
import type { EventoAgenda } from '../agenda.types'
import { cn } from '@/lib/cn'

interface MiniCalendarioAgendaProps {
  fechaSeleccionada: string | null
  alSeleccionarFecha: (fechaIso: string | null) => void
  eventos: EventoAgenda[]
}

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

export function MiniCalendarioAgenda({
  fechaSeleccionada,
  alSeleccionarFecha,
  eventos,
}: MiniCalendarioAgendaProps) {
  const [mesActual, setMesActual] = useState(new Date())

  // Días a mostrar en el mes (incluyendo días del mes anterior y siguiente para completar la cuadrícula)
  const inicioMes = startOfMonth(mesActual)
  const finMes = endOfMonth(mesActual)
  const inicioCuadricula = startOfWeek(inicioMes, { weekStartsOn: 1 }) // Lunes primer día
  const finCuadricula = endOfWeek(finMes, { weekStartsOn: 1 })

  const dias = eachDayOfInterval({ start: inicioCuadricula, end: finCuadricula })

  // Mapa de eventos por fecha ISO
  const eventosPorDia = dias.reduce<Record<string, EventoAgenda[]>>((acc, dia) => {
    const iso = format(dia, 'yyyy-MM-dd')
    const encontrados = eventos.filter((e) => e.fecha === iso)
    if (encontrados.length > 0) {
      acc[iso] = encontrados
    }
    return acc
  }, {})

  const mesAnterior = () => setMesActual((prev) => subMonths(prev, 1))
  const mesSiguiente = () => setMesActual((prev) => addMonths(prev, 1))
  const irAHoy = () => {
    setMesActual(new Date())
    alSeleccionarFecha(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      {/* Cabecera del calendario */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-dato font-bold text-text capitalize">
            {format(mesActual, 'MMMM yyyy', { locale: es })}
          </h3>
          <p className="text-micro text-text-muted">
            {eventos.length} {eventos.length === 1 ? 'registro' : 'registros'} agendados
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={irAHoy}
            className="rounded-lg px-2 py-1 text-micro font-bold text-primary hover:bg-primary-tint transition-colors"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={mesAnterior}
            aria-label="Mes anterior"
            className="flex size-7.5 items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
          >
            <IconoChevron hacia="izquierda" className="size-4" />
          </button>
          <button
            type="button"
            onClick={mesSiguiente}
            aria-label="Mes siguiente"
            className="flex size-7.5 items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
          >
            <IconoChevron hacia="derecha" className="size-4" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="text-micro font-semibold text-text-muted py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia) => {
          const iso = format(dia, 'yyyy-MM-dd')
          const esDelMes = isSameMonth(dia, mesActual)
          const hoy = isToday(dia)
          const seleccionado = fechaSeleccionada === iso
          const eventosDelDia = eventosPorDia[iso] || []

          const tieneExamen = eventosDelDia.some((e) => e.tipo === 'examen')
          const tieneAusencia = eventosDelDia.some((e) => e.tipo === 'ausencia_profesor')
          const tieneTarea = eventosDelDia.some((e) => e.tipo === 'tarea')

          return (
            <button
              key={iso}
              type="button"
              onClick={() => {
                // Alternar selección
                if (seleccionado) {
                  alSeleccionarFecha(null)
                } else {
                  alSeleccionarFecha(iso)
                }
              }}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-xl p-1.5 min-h-[38px] transition-all',
                !esDelMes && 'opacity-30',
                seleccionado
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : hoy
                    ? 'border border-primary text-primary font-bold hover:bg-primary-tint'
                    : 'text-text hover:bg-surface-alt',
              )}
            >
              <span className="text-dato leading-none">{format(dia, 'd')}</span>

              {/* Indicadores de eventos (puntos) */}
              {eventosDelDia.length > 0 && (
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {tieneExamen && (
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        seleccionado ? 'bg-white' : 'bg-rose-500',
                      )}
                      title="Examen programado"
                    />
                  )}
                  {tieneAusencia && (
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        seleccionado ? 'bg-amber-200' : 'bg-amber-500',
                      )}
                      title="Profesor ausente"
                    />
                  )}
                  {tieneTarea && (
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        seleccionado ? 'bg-sky-200' : 'bg-primary',
                      )}
                      title="Tarea pendiente"
                    />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda rápida y deselección */}
      <div className="mt-3.5 flex items-center justify-between border-t border-border pt-2.5 text-micro text-text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-rose-500" />
            Examen
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" />
            Prof. Ausente
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-primary" />
            Tarea
          </span>
        </div>

        {fechaSeleccionada && (
          <button
            type="button"
            onClick={() => alSeleccionarFecha(null)}
            className="font-bold text-primary hover:underline"
          >
            Ver todos los días
          </button>
        )}
      </div>
    </div>
  )
}
