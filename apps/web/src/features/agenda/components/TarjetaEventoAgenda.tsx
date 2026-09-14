import { useState } from 'react'
import {
  IconoCalendario,
  IconoCerrar,
  IconoExamen,
  IconoProfesorAusente,
  IconoReloj,
  IconoTarea,
} from '@/components/icons'
import type { EventoAgenda } from '../agenda.types'
import { formatearFechaRelativa, obtenerColoresTipo, obtenerEtiquetaTipo } from '../agenda.service'
import { cn } from '@/lib/cn'

interface TarjetaEventoAgendaProps {
  evento: EventoAgenda
  alAlternarTarea?: (id: string) => void
  alEditar?: (evento: EventoAgenda) => void
  alEliminar?: (id: string) => void
}

export function TarjetaEventoAgenda({
  evento,
  alAlternarTarea,
  alEditar,
  alEliminar,
}: TarjetaEventoAgendaProps) {
  const [mostrarTemario, setMostrarTemario] = useState(false)
  const colores = obtenerColoresTipo(evento.tipo)
  const fechaRelativa = formatearFechaRelativa(evento.fecha)
  const esTarea = evento.tipo === 'tarea'
  const esCompletada = esTarea && Boolean(evento.completada)
  const esAusencia = evento.tipo === 'ausencia_profesor'
  const esExamen = evento.tipo === 'examen'

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 transition-all duration-200',
        'hover:border-border-strong hover:shadow-sm',
        colores.borde,
        'border-l-4',
        esCompletada && 'opacity-70 bg-surface-alt/40 border-l-emerald-500',
      )}
    >
      {/* Cabecera de la tarjeta: Badges y acciones */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Badge del tipo de evento */}
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-micro font-bold uppercase tracking-wider',
              colores.badge,
              esCompletada && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            )}
          >
            {esAusencia ? (
              <IconoProfesorAusente className="size-3.5" />
            ) : esExamen ? (
              <IconoExamen className="size-3.5" />
            ) : esTarea ? (
              <IconoTarea className="size-3.5" />
            ) : (
              <IconoCalendario className="size-3.5" />
            )}
            {esCompletada ? 'Tarea Entregada' : obtenerEtiquetaTipo(evento.tipo)}
          </span>

          {/* Badge de Materia */}
          <span className="rounded-lg bg-surface-alt px-2 py-0.5 text-micro font-semibold text-text-muted">
            {evento.materia}
          </span>

          {/* Badge de Porcentaje si es Examen */}
          {esExamen && typeof evento.porcentaje === 'number' && (
            <span className="rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 text-micro">
              {evento.porcentaje}% de la nota
            </span>
          )}

          {/* Badge de Prioridad en Tareas */}
          {esTarea && evento.prioridad && !esCompletada && (
            <span
              className={cn(
                'rounded-lg px-2 py-0.5 text-micro font-semibold uppercase',
                evento.prioridad === 'alta' && 'bg-rose-500/10 text-rose-600',
                evento.prioridad === 'media' && 'bg-amber-500/10 text-amber-600',
                evento.prioridad === 'baja' && 'bg-surface-alt text-text-muted',
              )}
            >
              {evento.prioridad === 'alta' ? 'Urgente' : `Prioridad ${evento.prioridad}`}
            </span>
          )}
        </div>

        {/* Botones de acción (Editar y Eliminar) */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {alEditar && (
            <button
              type="button"
              onClick={() => alEditar(evento)}
              title="Editar registro"
              aria-label="Editar registro"
              className="flex size-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
          )}

          {alEliminar && (
            <button
              type="button"
              onClick={() => alEliminar(evento.id)}
              title="Eliminar de la agenda"
              aria-label="Eliminar de la agenda"
              className="flex size-7 items-center justify-center rounded-lg text-text-muted hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
            >
              <IconoCerrar className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal con Checkbox si es Tarea */}
      <div className="flex items-start gap-3">
        {esTarea && alAlternarTarea && (
          <button
            type="button"
            onClick={() => alAlternarTarea(evento.id)}
            aria-label={esCompletada ? 'Marcar como pendiente' : 'Marcar como completada'}
            className={cn(
              'mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-lg border transition-all',
              esCompletada
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-border-strong hover:border-primary hover:bg-primary-tint',
            )}
          >
            {esCompletada && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h4
            className={cn(
              'text-menor font-bold text-text leading-snug',
              esCompletada && 'line-through text-text-muted',
            )}
          >
            {evento.titulo}
          </h4>

          {/* Si es ausencia de profesor, destacar el nombre del docente */}
          {esAusencia && evento.profesor && (
            <div className="mt-1 flex items-center gap-1.5 text-menor font-bold text-amber-700 dark:text-amber-300">
              <span>Docente: {evento.profesor}</span>
            </div>
          )}

          {/* Bloque o lecciones afectadas por la ausencia */}
          {esAusencia && evento.bloqueAfectado && (
            <p className="mt-0.5 text-micro font-semibold text-text-muted">
              Lecciones libres: <span className="text-text">{evento.bloqueAfectado}</span>
            </p>
          )}

          {/* Indicaciones especiales del docente */}
          {esAusencia && evento.indicacion && (
            <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-micro text-text">
              <span className="font-bold text-amber-700 dark:text-amber-300">Indicación: </span>
              {evento.indicacion}
            </div>
          )}

          {/* Descripción general */}
          {evento.descripcion && !esAusencia && (
            <p className="mt-1 text-micro text-text-muted leading-relaxed line-clamp-2">
              {evento.descripcion}
            </p>
          )}

          {/* Temario desplegable para exámenes */}
          {esExamen && evento.temario && evento.temario.length > 0 && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setMostrarTemario((v) => !v)}
                className="inline-flex items-center gap-1 text-micro font-bold text-primary hover:underline"
              >
                <span>{mostrarTemario ? 'Ocultar temario' : `Ver temario (${evento.temario.length} temas)`}</span>
                <span className="text-[10px]">{mostrarTemario ? '▲' : '▼'}</span>
              </button>

              {mostrarTemario && (
                <ul className="mt-2 space-y-1 rounded-xl border border-border bg-surface-alt/60 p-2.5 text-micro text-text">
                  {evento.temario.map((tema, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary mt-1 shrink-0" />
                      <span>{tema}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pie de tarjeta: Fecha relativa, hora y aula */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2 text-micro text-text-muted">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-semibold text-text">
            <IconoCalendario className="size-3.5 text-primary" />
            {fechaRelativa}
          </span>

          {evento.hora && (
            <span className="inline-flex items-center gap-1">
              <IconoReloj className="size-3.5 text-text-muted" />
              {evento.hora}
            </span>
          )}
        </div>

        {esExamen && evento.aula && (
          <span className="text-micro font-semibold text-text-muted">
            Aula: <span className="text-text">{evento.aula}</span>
          </span>
        )}
      </div>
    </article>
  )
}
