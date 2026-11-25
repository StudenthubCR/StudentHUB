import { useMemo, useState } from 'react'
import {
  IconoBirrete,
  IconoBuscar,
  IconoCheck,
  IconoEditar,
  IconoMas,
} from '@/components/icons'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import {
  obtenerEstadoCalificacion,
  type NotaMateria,
  type PeriodoNota,
} from '@/features/notas/notas.types'
import { MATERIAS_DESARROLLO_WEB } from '../docente.fixture'

type Props = {
  estudiantes: Estudiante[]
  notas: NotaMateria[]
  periodoActivo: PeriodoNota
  alCambiarPeriodo: (periodo: PeriodoNota) => void
  alAbrirEditorNota: (nota?: NotaMateria, estudianteId?: string) => void
  mensajeExito: string | null
}

const PERIODOS: PeriodoNota[] = ['I Periodo', 'II Periodo', 'III Periodo']

export function TabNotasDocente({
  estudiantes,
  notas,
  periodoActivo,
  alCambiarPeriodo,
  alAbrirEditorNota,
  mensajeExito,
}: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [seccionFiltro, setSeccionFiltro] = useState('todas')
  const [materiaFiltro, setMateriaFiltro] = useState('todas')

  const mapaEstudiantes = useMemo(
    () => new Map(estudiantes.map((e) => [e.id, e])),
    [estudiantes],
  )

  const secciones = useMemo(
    () => Array.from(new Set(estudiantes.map((e) => e.grupo).filter(Boolean))).sort(),
    [estudiantes],
  )

  const materiasDisponibles = useMemo(() => {
    const set = new Set<string>(MATERIAS_DESARROLLO_WEB)
    for (const n of notas) {
      if (n.materia) set.add(n.materia)
    }
    return Array.from(set)
  }, [notas])

  const notasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return notas.filter((n) => {
      const est = mapaEstudiantes.get(n.estudianteId)
      if (!est) return false
      if (seccionFiltro !== 'todas' && est.grupo !== seccionFiltro) return false
      if (materiaFiltro !== 'todas' && n.materia !== materiaFiltro) return false
      if (q) {
        const coincideEst = est.nombre.toLowerCase().includes(q) || est.codigo.toLowerCase().includes(q)
        const coincideMat = n.materia.toLowerCase().includes(q)
        if (!coincideEst && !coincideMat) return false
      }
      return true
    })
  }, [notas, mapaEstudiantes, seccionFiltro, materiaFiltro, busqueda])

  return (
    <div className="space-y-4 animate-fade-in">
      {mensajeExito && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-3.5 text-menor font-semibold text-emerald-800 dark:text-emerald-300"
        >
          <IconoCheck className="size-4 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Controles y filtros */}
      <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Periodo lectivo"
            className="inline-flex w-full sm:w-auto gap-1 rounded-2xl border border-border bg-surface-alt/70 p-1"
          >
            {PERIODOS.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={periodoActivo === p}
                onClick={() => alCambiarPeriodo(p)}
                className={`flex-1 sm:flex-initial min-h-[38px] cursor-pointer rounded-xl px-3 py-1.5 text-micro font-bold transition-all whitespace-nowrap ${
                  periodoActivo === p
                    ? 'bg-surface text-text shadow-xs ring-1 ring-border'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => alAbrirEditorNota()}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary-solid px-4 py-2 text-micro font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-98"
          >
            <IconoMas className="size-4" />
            <span>Nueva Calificación</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <IconoBuscar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar calificación por estudiante o materia"
              placeholder="Buscar estudiante o subárea..."
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt pl-10 pr-3 py-2 text-menor text-text focus:border-primary focus:outline-none"
            />
          </div>

          <select
            aria-label="Filtrar calificaciones por sección"
            value={seccionFiltro}
            onChange={(e) => setSeccionFiltro(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor font-semibold text-text focus:border-primary focus:outline-none"
          >
            <option value="todas">Todas las secciones</option>
            {secciones.map((s) => (
              <option key={s} value={s}>
                Sección {s}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar calificaciones por materia"
            value={materiaFiltro}
            onChange={(e) => setMateriaFiltro(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor font-semibold text-text focus:border-primary focus:outline-none"
          >
            <option value="todas">Todas las materias</option>
            {materiasDisponibles.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado de Calificaciones */}
      {notasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <IconoBirrete className="size-9 text-text-muted mb-2.5" />
          <p className="text-dato font-bold text-text">
            No hay calificaciones registradas en {periodoActivo}
          </p>
          <p className="mt-1 text-menor text-text-muted max-w-md">
            Registrá una nueva calificación bajo rúbrica MEP 0–100 para tus estudiantes de Desarrollo Web.
          </p>
          <button
            type="button"
            onClick={() => alAbrirEditorNota()}
            className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl bg-primary-solid px-4 py-2 text-micro font-bold text-white shadow-xs hover:bg-primary-dark"
          >
            <IconoMas className="size-4" />
            <span>Registrar Calificación</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notasFiltradas.map((nota) => {
            const est = mapaEstudiantes.get(nota.estudianteId)
            const estado = obtenerEstadoCalificacion(nota.notaFinal)
            if (!est) return null

            return (
              <article
                key={nota.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-xs space-y-3 transition-all hover:border-primary/35"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${estado.claseColor}`}>
                        {estado.etiqueta}
                      </span>
                      <span className="rounded-full bg-primary-tint border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Sección {est.grupo}
                      </span>
                      <span className="text-micro font-semibold text-text-muted">
                        {nota.periodo}
                      </span>
                    </div>
                    <h3 className="text-dato font-bold text-text truncate">{est.nombre}</h3>
                    <p className="text-menor font-semibold text-primary truncate">{nota.materia}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                    <div className="text-left sm:text-right">
                      <span className="block text-titulo font-black text-text leading-none">
                        {nota.notaFinal.toFixed(1)}
                      </span>
                      <span className="block text-[10px] font-semibold text-text-muted mt-0.5">
                        Escala MEP 100
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alAbrirEditorNota(nota, est.id)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-primary/30 bg-primary-tint px-3.5 py-2 text-micro font-bold text-primary transition-all hover:bg-primary-tint-strong active:scale-98"
                    >
                      <IconoEditar className="size-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>

                {/* Desglose compacto de rúbrica */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center">
                  <div className="rounded-lg border border-border bg-surface-alt/50 px-2 py-1.5">
                    <span className="block text-[10px] font-semibold text-text-muted">Cotidiano</span>
                    <span className="text-micro font-bold text-text">{nota.rubrica.trabajoCotidiano} pts</span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-alt/50 px-2 py-1.5">
                    <span className="block text-[10px] font-semibold text-text-muted">Tareas</span>
                    <span className="text-micro font-bold text-text">{nota.rubrica.tareas} pts</span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-alt/50 px-2 py-1.5">
                    <span className="block text-[10px] font-semibold text-text-muted">Pruebas</span>
                    <span className="text-micro font-bold text-text">{nota.rubrica.pruebas} pts</span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-alt/50 px-2 py-1.5">
                    <span className="block text-[10px] font-semibold text-text-muted">Proyecto</span>
                    <span className="text-micro font-bold text-text">{nota.rubrica.proyecto} pts</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-lg border border-border bg-surface-alt/50 px-2 py-1.5">
                    <span className="block text-[10px] font-semibold text-text-muted">Asistencia</span>
                    <span className="text-micro font-bold text-text">{nota.rubrica.asistencia} pts</span>
                  </div>
                </div>

                {nota.observaciones && (
                  <p className="rounded-xl border border-border/70 bg-surface-alt/35 px-3 py-2 text-micro text-text-muted">
                    <strong className="font-semibold text-text">Observación: </strong>
                    {nota.observaciones}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
