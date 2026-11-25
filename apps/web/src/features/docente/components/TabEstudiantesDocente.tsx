import { useMemo, useState } from 'react'
import {
  IconoAlertaTriangulo,
  IconoBuscar,
  IconoCheck,
  IconoUsuarios,
} from '@/components/icons'
import { obtenerIniciales } from '@/lib/texto'
import type {
  EstudianteConMetricasDocente,
  FiltroRiesgoDocente,
} from '../docente.types'

type Props = {
  listado: EstudianteConMetricasDocente[]
  especialidad: string
  alSeleccionarEstudiante: (item: EstudianteConMetricasDocente) => void
}

export function TabEstudiantesDocente({
  listado,
  especialidad,
  alSeleccionarEstudiante,
}: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [seccionFiltro, setSeccionFiltro] = useState('todas')
  const [riesgoFiltro, setRiesgoFiltro] = useState<FiltroRiesgoDocente>('todos')

  const seccionesDisponibles = useMemo(() => {
    const set = new Set(listado.map((i) => i.estudiante.grupo).filter(Boolean))
    return Array.from(set).sort()
  }, [listado])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return listado.filter((item) => {
      if (q) {
        const coincideNombre = item.estudiante.nombre.toLowerCase().includes(q)
        const coincideCodigo = item.estudiante.codigo.toLowerCase().includes(q)
        if (!coincideNombre && !coincideCodigo) return false
      }
      if (seccionFiltro !== 'todas' && item.estudiante.grupo !== seccionFiltro) {
        return false
      }
      if (riesgoFiltro === 'alerta' && !item.enAlerta) return false
      if (riesgoFiltro === 'regular' && item.enAlerta) return false
      return true
    })
  }, [listado, busqueda, seccionFiltro, riesgoFiltro])

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Barra de búsqueda y filtros */}
      <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 relative">
            <IconoBuscar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar estudiante de Desarrollo Web por nombre o carnet"
              placeholder="Buscar por nombre o código de carnet..."
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt pl-10 pr-3.5 py-2 text-menor text-text placeholder:text-text-muted/70 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <select
              aria-label="Filtrar por sección"
              value={seccionFiltro}
              onChange={(e) => setSeccionFiltro(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor font-semibold text-text focus:border-primary focus:outline-none"
            >
              <option value="todas">Todas las secciones ({listado.length})</option>
              {seccionesDisponibles.map((sec) => (
                <option key={sec} value={sec}>
                  Sección {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'todos', label: `Todos (${listado.length})` },
                {
                  id: 'alerta',
                  label: `En alerta (${listado.filter((i) => i.enAlerta).length})`,
                },
                {
                  id: 'regular',
                  label: `Al día (${listado.filter((i) => !i.enAlerta).length})`,
                },
              ] as const
            ).map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setRiesgoFiltro(op.id)}
                className={`min-h-[36px] cursor-pointer rounded-xl border px-3 py-1 text-micro font-bold transition-all ${
                  riesgoFiltro === op.id
                    ? 'border-primary bg-primary-solid text-white shadow-2xs'
                    : 'border-border bg-surface text-text-muted hover:text-text'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          <span className="text-micro font-semibold text-text-muted">
            Mostrando {filtrados.length} de {listado.length} en {especialidad}
          </span>
        </div>
      </div>

      {/* Lista de Estudiantes */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <IconoUsuarios className="size-9 text-text-muted mb-2.5" />
          <p className="text-dato font-bold text-text">
            No se encontraron estudiantes en {especialidad}
          </p>
          <p className="mt-1 text-menor text-text-muted max-w-md">
            Probá ajustando la búsqueda o limpiando los filtros de sección y estado.
          </p>
          {(busqueda || seccionFiltro !== 'todas' || riesgoFiltro !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                setSeccionFiltro('todas')
                setRiesgoFiltro('todos')
              }}
              className="mt-4 min-h-[44px] cursor-pointer rounded-xl bg-primary-tint border border-primary/25 px-4 py-2 text-micro font-bold text-primary hover:bg-primary-tint-strong"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filtrados.map((item) => {
            const est = item.estudiante
            const promedioTexto =
              item.materiasEvaluadas > 0 ? item.promedioGeneral.toFixed(1) : 'S/N'

            return (
              <article
                key={est.id || est.codigo}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xs transition-all hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-solid text-menor font-black text-white">
                      {obtenerIniciales(est.nombre)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-dato font-bold text-text truncate">{est.nombre}</h3>
                      <p className="text-micro text-text-muted font-mono truncate">
                        {est.codigo} · Sección {est.grupo} · {est.nivel}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                      item.enAlerta
                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {item.enAlerta ? (
                      <>
                        <IconoAlertaTriangulo className="size-3" />
                        <span>Alerta</span>
                      </>
                    ) : (
                      <>
                        <IconoCheck className="size-3" />
                        <span>Al día</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Status pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-border bg-surface-alt/60 px-2.5 py-1 text-micro font-bold text-text">
                    Promedio: {promedioTexto}
                  </span>
                  <span className="rounded-lg border border-border bg-surface-alt/60 px-2.5 py-1 text-micro font-bold text-text">
                    Asistencia: {item.porcentajeAsistencia.toFixed(0)}%
                  </span>
                  <span className="rounded-lg border border-primary/25 bg-primary-tint px-2.5 py-1 text-micro font-bold text-primary">
                    {est.especialidad}
                  </span>
                </div>

                {item.enAlerta && (
                  <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-micro font-medium text-amber-900 dark:text-amber-200">
                    {item.motivosAlerta.join(' · ')}
                  </p>
                )}

                <div className="flex items-center justify-end border-t border-border/70 pt-2.5">
                  <button
                    type="button"
                    onClick={() => alSeleccionarEstudiante(item)}
                    className="min-h-[44px] w-full sm:w-auto cursor-pointer rounded-xl bg-primary-tint border border-primary/30 px-4 py-2 text-micro font-bold text-primary transition-all hover:bg-primary-tint-strong active:scale-98"
                  >
                    Ver expediente y observaciones
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
