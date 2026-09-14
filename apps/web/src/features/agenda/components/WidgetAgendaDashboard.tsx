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

        {/* ALERTA CRÍTICA: Ausencia de profesor hoy */}
        {ausenciasHoy.length > 0 && (
          <div className="mb-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white mt-0.5">
                <IconoProfesorAusente className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-menor font-bold text-amber-900 dark:text-amber-200">
                  Aviso: {ausenciasHoy[0].profesor || 'Docente ausente'} hoy
                </p>
                <p className="text-micro font-medium text-amber-800/80 dark:text-amber-300">
                  {ausenciasHoy[0].materia} · {ausenciasHoy[0].bloqueAfectado || 'Lecciones libres'}
                </p>
                {ausenciasHoy[0].indicacion && (
                  <p className="mt-1 text-micro text-amber-900 dark:text-amber-200/90 font-medium">
                    📌 {ausenciasHoy[0].indicacion}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumen rápido de pendientes */}
        <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-surface-alt/70 p-2 text-center">
          <div className="p-1">
            <p className="text-titulo font-bold text-primary leading-tight">
              {resumenHoy.tareasPendientes.length}
            </p>
            <p className="text-micro font-semibold text-text-muted">Para hoy</p>
          </div>
          <div className="border-x border-border p-1">
            <p className="text-titulo font-bold text-rose-600 dark:text-rose-400 leading-tight">
              {proximos.filter((e) => e.tipo === 'examen').length}
            </p>
            <p className="text-micro font-semibold text-text-muted">Exámenes</p>
          </div>
          <div className="p-1">
            <p className="text-titulo font-bold text-amber-600 dark:text-amber-400 leading-tight">
              {proximos.filter((e) => e.tipo === 'ausencia_profesor').length}
            </p>
            <p className="text-micro font-semibold text-text-muted">Ausencias</p>
          </div>
        </div>

        {/* Lista corta de los próximos eventos */}
        <div className="space-y-2">
          {eventosInminentes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-4 text-center">
              <p className="text-menor text-text-muted">No tenés eventos próximos anotados.</p>
              <button
                type="button"
                onClick={() => setModalAbierto(true)}
                className="mt-1 text-micro font-bold text-primary hover:underline"
              >
                + Anotar una tarea o examen
              </button>
            </div>
          ) : (
            eventosInminentes.map((ev) => {
              const colores = obtenerColoresTipo(ev.tipo)
              const fechaRel = formatearFechaRelativa(ev.fecha)
              const esTarea = ev.tipo === 'tarea'
              const esCompletada = esTarea && Boolean(ev.completada)

              return (
                <div
                  key={ev.id}
                  className={cn(
                    'flex items-center justify-between gap-2.5 rounded-xl border border-border p-2.5 transition-all',
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
                          'flex size-5 shrink-0 items-center justify-center rounded-md border transition-all',
                          esCompletada
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-border-strong hover:border-primary',
                        )}
                        aria-label="Alternar tarea"
                      >
                        {esCompletada && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ) : ev.tipo === 'examen' ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-rose-500/10 text-rose-600">
                        <IconoExamen className="size-3.5" />
                      </span>
                    ) : ev.tipo === 'ausencia_profesor' ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600">
                        <IconoProfesorAusente className="size-3.5" />
                      </span>
                    ) : (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                        <IconoAgenda className="size-3.5" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="text-dato font-bold text-text truncate leading-snug">
                        {ev.titulo}
                      </p>
                      <p className="text-micro text-text-muted truncate">
                        {ev.materia} {ev.hora ? `· ${ev.hora}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg bg-surface-alt px-2 py-0.5 text-micro font-bold text-text">
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
