import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconoAgenda,
  IconoExamen,
  IconoFlechaDerecha,
  IconoProfesorAusente,
} from '@/components/icons'
import { useAgenda } from '../useAgenda'
import { ModalCrearEventoAgenda } from './ModalCrearEventoAgenda'
import { formatearFechaRelativa, obtenerColoresTipo } from '../agenda.service'
import { cn } from '@/lib/cn'

export function WidgetAgendaDashboard() {
  const { resumenHoy, proximos, ausenciasHoy, crearEvento, toggleCompletada } = useAgenda()
  const [modalAbierto, setModalAbierto] = useState(false)

  // Tomamos los 3 eventos más próximos
  const eventosInminentes = proximos.slice(0, 3)

  return (
    <>
      <section className="mb-6 rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
        {/* Cabecera del Widget */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8.5 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <IconoAgenda className="size-4.5" />
            </span>
            <div>
              <h3 className="text-menor font-bold text-text leading-tight">Mi Agenda Escolar</h3>
              <p className="text-micro text-text-muted">Tareas, exámenes y avisos docentes</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-1 rounded-xl bg-primary-tint hover:bg-primary-tint-strong px-2.5 py-1.5 text-micro font-bold text-primary transition-all active:scale-95"
            >
              <span>+</span>
              <span>Anotar</span>
            </button>
            <Link
              to="/agenda"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-micro font-bold text-text-muted hover:text-primary transition-colors"
            >
              <span>Ver todo</span>
              <IconoFlechaDerecha className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* ALERTA CRÍTICA: Ausencia de profesor hoy (compacta y directa) */}
        {ausenciasHoy.length > 0 && (
          <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-900 dark:text-amber-200">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
              <IconoProfesorAusente className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 truncate text-micro">
              <span className="font-bold">Docente ausente hoy: </span>
              <span>{ausenciasHoy[0].profesor || 'Profesor'} ({ausenciasHoy[0].materia})</span>
              {ausenciasHoy[0].indicacion && (
                <span className="ml-1 text-amber-800/80 dark:text-amber-300">· {ausenciasHoy[0].indicacion}</span>
              )}
            </div>
          </div>
        )}

        {/* Resumen en chips discretos: sólo visible si hay pendientes activos */}
        {(resumenHoy.tareasPendientes.length > 0 ||
          proximos.filter((e) => e.tipo === 'examen').length > 0 ||
          proximos.filter((e) => e.tipo === 'ausencia_profesor').length > 0) && (
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5 text-micro">
            {resumenHoy.tareasPendientes.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary-tint px-2.5 py-1 font-bold text-primary">
                <span>📝 {resumenHoy.tareasPendientes.length} para hoy</span>
              </span>
            )}

            {proximos.filter((e) => e.tipo === 'examen').length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1 font-bold text-rose-600 dark:text-rose-400">
                <span>🎯 {proximos.filter((e) => e.tipo === 'examen').length} {proximos.filter((e) => e.tipo === 'examen').length === 1 ? 'examen' : 'exámenes'}</span>
              </span>
            )}

            {proximos.filter((e) => e.tipo === 'ausencia_profesor').length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 font-bold text-amber-600 dark:text-amber-400">
                <span>⚠️ {proximos.filter((e) => e.tipo === 'ausencia_profesor').length} ausencias</span>
              </span>
            )}
          </div>
        )}

        {/* Lista compacta: sólo hasta 2 eventos más inmediatos */}
        <div className="space-y-1.5">
          {eventosInminentes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-2.5 px-3 text-center">
              <p className="text-micro text-text-muted">
                No tenés pendientes urgentes.{' '}
                <button
                  type="button"
                  onClick={() => setModalAbierto(true)}
                  className="font-bold text-primary hover:underline"
                >
                  + Anotar tarea o examen
                </button>
              </p>
            </div>
          ) : (
            eventosInminentes.slice(0, 2).map((ev) => {
              const colores = obtenerColoresTipo(ev.tipo)
              const fechaRel = formatearFechaRelativa(ev.fecha)
              const esTarea = ev.tipo === 'tarea'
              const esCompletada = esTarea && Boolean(ev.completada)

              return (
                <div
                  key={ev.id}
                  className={cn(
                    'flex items-center justify-between gap-2.5 rounded-xl border border-border px-3 py-2 transition-all',
                    colores.borde,
                    'border-l-3',
                    esCompletada && 'opacity-60 line-through bg-surface-alt/50',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {esTarea ? (
                      <button
                        type="button"
                        onClick={() => toggleCompletada(ev.id)}
                        className={cn(
                          'flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-all',
                          esCompletada
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-border-strong hover:border-primary',
                        )}
                        aria-label="Alternar tarea"
                      >
                        {esCompletada && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ) : ev.tipo === 'examen' ? (
                      <span className="flex size-4.5 shrink-0 items-center justify-center rounded-md bg-rose-500/10 text-rose-600">
                        <IconoExamen className="size-3" />
                      </span>
                    ) : ev.tipo === 'ausencia_profesor' ? (
                      <span className="flex size-4.5 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600">
                        <IconoProfesorAusente className="size-3" />
                      </span>
                    ) : (
                      <span className="flex size-4.5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                        <IconoAgenda className="size-3" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="text-micro sm:text-dato font-bold text-text truncate leading-tight">
                        {ev.titulo}
                      </p>
                      <p className="text-[11px] text-text-muted truncate">
                        {ev.materia} {ev.hora ? `· ${ev.hora}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-md bg-surface-alt px-1.5 py-0.5 text-[11px] font-bold text-text">
                    {fechaRel}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </section>

      <ModalCrearEventoAgenda
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alGuardar={crearEvento}
      />
    </>
  )
}
