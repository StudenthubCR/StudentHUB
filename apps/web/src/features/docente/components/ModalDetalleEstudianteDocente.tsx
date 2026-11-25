import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  IconoAlertaTriangulo,
  IconoBirrete,
  IconoCerrar,
  IconoCheck,
  IconoEditar,
  IconoFlechaDerecha,
} from '@/components/icons'
import { obtenerEstadoCalificacion, type NotaMateria } from '@/features/notas/notas.types'
import {
  obtenerBadgeEstadoAsistencia,
  type RegistroAsistencia,
} from '@/features/asistencias/asistencias.types'
import { obtenerIniciales } from '@/lib/texto'
import { MATERIAS_DESARROLLO_WEB } from '../docente.fixture'
import type {
  CategoriaObservacion,
  DocenteProfile,
  EstudianteConMetricasDocente,
} from '../docente.types'
import { useMutacionesDocente, useObservacionesDocente } from '../useDocente'

type Props = {
  abierto: boolean
  alCerrar: () => void
  docente: DocenteProfile
  item: EstudianteConMetricasDocente | null
  notasEstudiante: NotaMateria[]
  asistenciasEstudiante: RegistroAsistencia[]
  alEditarNota: (nota?: NotaMateria) => void
}

const ETIQUETAS_CATEGORIA: Record<CategoriaObservacion, string> = {
  academica: 'Académica',
  asistencia: 'Asistencia',
  convivencia: 'Convivencia',
  felicitacion: 'Reconocimiento',
}

export function ModalDetalleEstudianteDocente({
  abierto,
  alCerrar,
  docente,
  item,
  notasEstudiante,
  asistenciasEstudiante,
  alEditarNota,
}: Props) {
  const estudiante = item?.estudiante ?? null
  const [categoria, setCategoria] = useState<CategoriaObservacion>('academica')
  const [materia, setMateria] = useState<string>(MATERIAS_DESARROLLO_WEB[0])
  const [observacionTexto, setObservacionTexto] = useState('')
  const [visibleFamilia, setVisibleFamilia] = useState(true)
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; mensaje: string } | null>(null)

  const observacionesQ = useObservacionesDocente(
    docente,
    estudiante ? [estudiante] : [],
    estudiante?.id,
  )
  const { crearObservacionMutation } = useMutacionesDocente(docente)

  useEffect(() => {
    if (!abierto) return
    setObservacionTexto('')
    setFeedback(null)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [abierto, alCerrar])

  if (!abierto || !item || !estudiante || typeof document === 'undefined') {
    return null
  }

  const esDemo =
    typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true'

  const manejarGuardarObservacion = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    if (!observacionTexto.trim()) {
      setFeedback({ tipo: 'error', mensaje: 'Escribí el detalle de la observación.' })
      return
    }

    try {
      await crearObservacionMutation.mutateAsync({
        estudiante,
        periodo: 'I Periodo',
        materia,
        categoria,
        observacion: observacionTexto,
        visibleFamilia,
      })
      setObservacionTexto('')
      setFeedback({ tipo: 'ok', mensaje: 'Observación pedagógica registrada correctamente.' })
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'No se pudo guardar la observación.',
      })
    }
  }

  const abrirComoEstudianteDemo = () => {
    if (typeof window === 'undefined' || !estudiante.id) return
    localStorage.setItem('studenthub_demo_sesion', 'true')
    localStorage.setItem('studenthub_demo_rol', 'estudiante')
    localStorage.setItem('studenthub_demo_estudiante_id', estudiante.id)
    localStorage.removeItem('studenthub_estudiante_activo_id')
    window.location.href = '/estudiante?tab=notas'
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Expediente de ${estudiante.nombre}`}
      onClick={alCerrar}
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-2xl space-y-5"
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-solid text-dato font-black text-white shadow-xs">
              {obtenerIniciales(estudiante.nombre)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="rounded-full bg-primary-tint border border-primary/25 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                  Sección {estudiante.grupo}
                </span>
                <span className="rounded-full bg-surface-alt border border-border px-2.5 py-0.5 text-[10px] font-semibold text-text-muted">
                  {estudiante.especialidad}
                </span>
              </div>
              <h2 className="text-subtitulo font-black text-text truncate">{estudiante.nombre}</h2>
              <p className="text-micro text-text-muted font-mono">
                Carnet {estudiante.codigo}
                {estudiante.correo ? ` · ${estudiante.correo}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar expediente"
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-alt text-text-muted hover:text-text"
          >
            <IconoCerrar className="size-5" />
          </button>
        </div>

        {/* Alerta y métricas del estudiante */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-border bg-surface-alt/50 p-3">
            <span className="block text-micro font-bold uppercase text-text-muted">Promedio</span>
            <span className="mt-0.5 block text-titulo font-black text-text">
              {item.materiasEvaluadas > 0 ? item.promedioGeneral.toFixed(1) : '—'}
            </span>
          </div>
          <div className="rounded-2xl border border-border bg-surface-alt/50 p-3">
            <span className="block text-micro font-bold uppercase text-text-muted">Asistencia</span>
            <span className="mt-0.5 block text-titulo font-black text-text">
              {item.porcentajeAsistencia.toFixed(1)}%
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-surface-alt/50 p-3">
            <span className="block text-micro font-bold uppercase text-text-muted">Estado</span>
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-bold border ${
                item.enAlerta
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {item.enAlerta ? (
                <>
                  <IconoAlertaTriangulo className="size-3" />
                  <span>En alerta</span>
                </>
              ) : (
                <>
                  <IconoCheck className="size-3" />
                  <span>Regular</span>
                </>
              )}
            </span>
          </div>
        </div>

        {item.enAlerta && (
          <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-3.5 text-menor text-amber-900 dark:text-amber-200">
            <p className="font-bold flex items-center gap-1.5">
              <IconoAlertaTriangulo className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Indicadores de seguimiento preventivo</span>
            </p>
            <p className="mt-1 text-micro">{item.motivosAlerta.join(' · ')}</p>
          </div>
        )}

        {/* Calificaciones recientes */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-dato font-bold text-text flex items-center gap-1.5">
              <IconoBirrete className="size-4 text-primary" />
              <span>Calificaciones Registradas ({notasEstudiante.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => alEditarNota()}
              className="inline-flex min-h-[36px] cursor-pointer items-center gap-1 rounded-xl bg-primary-tint border border-primary/25 px-3 py-1 text-micro font-bold text-primary hover:bg-primary-tint-strong"
            >
              <IconoEditar className="size-3.5" />
              <span>Nueva calificación</span>
            </button>
          </div>

          {notasEstudiante.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-3 text-menuda text-text-muted">
              Aún no hay calificaciones cargadas en este periodo.
            </p>
          ) : (
            <div className="space-y-2">
              {notasEstudiante.map((n) => {
                const est = obtenerEstadoCalificacion(n.notaFinal)
                return (
                  <div
                    key={n.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border bg-surface-alt/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-menor font-bold text-text truncate">{n.materia}</p>
                      <p className="text-micro text-text-muted">
                        {n.periodo}
                        {n.observaciones ? ` · ${n.observaciones}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${est.claseColor}`}>
                        {n.notaFinal.toFixed(1)} · {est.etiqueta}
                      </span>
                      <button
                        type="button"
                        onClick={() => alEditarNota(n)}
                        className="cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1 text-micro font-bold text-primary hover:bg-primary-tint"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Últimas asistencias */}
        <div className="space-y-2">
          <h3 className="text-dato font-bold text-text">
            Historial Reciente de Asistencia ({asistenciasEstudiante.length})
          </h3>
          {asistenciasEstudiante.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-3 text-menuda text-text-muted">
              Sin registros recientes en este periodo.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {asistenciasEstudiante.slice(0, 4).map((a) => {
                const badge = obtenerBadgeEstadoAsistencia(a.estado)
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-alt/30 p-2.5 text-micro"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-text truncate">{a.materia}</p>
                      <p className="text-text-muted">{a.fecha}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.claseColor}`}>
                      {badge.etiqueta}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Observaciones Pedagógicas */}
        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="text-dato font-bold text-text">Observaciones Pedagógicas</h3>

          <form onSubmit={manejarGuardarObservacion} className="space-y-2.5 rounded-2xl border border-border bg-surface-alt/40 p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaObservacion)}
                  className="w-full min-h-[40px] rounded-xl border border-border bg-surface px-3 py-1.5 text-menor text-text"
                >
                  {Object.entries(ETIQUETAS_CATEGORIA).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  Subárea / Materia
                </label>
                <select
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full min-h-[40px] rounded-xl border border-border bg-surface px-3 py-1.5 text-menor text-text"
                >
                  {MATERIAS_DESARROLLO_WEB.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              rows={2}
              value={observacionTexto}
              onChange={(e) => setObservacionTexto(e.target.value)}
              placeholder="Anotación formativa o seguimiento académico para el estudiante..."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text placeholder:text-text-muted/70 focus:border-primary focus:outline-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-micro font-medium text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleFamilia}
                  onChange={(e) => setVisibleFamilia(e.target.checked)}
                  className="size-4 accent-primary"
                />
                <span>Visible para estudiante y encargado legal</span>
              </label>

              <button
                type="submit"
                disabled={crearObservacionMutation.isPending}
                className="min-h-[40px] cursor-pointer rounded-xl bg-primary-solid px-4 py-1.5 text-micro font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-50"
              >
                {crearObservacionMutation.isPending ? 'Guardando...' : 'Registrar Observación'}
              </button>
            </div>

            {feedback && (
              <p
                role="status"
                className={`rounded-xl border px-3 py-2 text-micro font-semibold ${
                  feedback.tipo === 'ok'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                }`}
              >
                {feedback.mensaje}
              </p>
            )}
          </form>

          <div className="space-y-2">
            {(observacionesQ.data ?? []).map((obs) => (
              <div key={obs.id} className="rounded-xl border border-border bg-surface p-3 text-menor">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="rounded-md bg-primary-tint px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                    {ETIQUETAS_CATEGORIA[obs.categoria]}
                  </span>
                  <span className="text-micro text-text-muted">
                    {obs.materia || 'General'} · {obs.creadoEl.slice(0, 10)}
                  </span>
                </div>
                <p className="text-text leading-relaxed">{obs.observacion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          {esDemo ? (
            <button
              type="button"
              onClick={abrirComoEstudianteDemo}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-primary/35 bg-primary-tint px-4 py-2 text-micro font-bold text-primary hover:bg-primary-tint-strong"
            >
              <span>Ver vista de este estudiante</span>
              <IconoFlechaDerecha className="size-3.5" />
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={alCerrar}
            className="min-h-[44px] cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-menor font-bold text-text hover:bg-surface-alt"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
