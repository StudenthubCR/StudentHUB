import { useState } from 'react'
import {
  IconoAgenda,
  IconoCalendario,
  IconoCheck,
  IconoEditar,
  IconoEliminar,
  IconoExamen,
  IconoMas,
  IconoProfesorAusente,
  IconoTarea,
} from '@/components/icons'
import { obtenerFechaHoyCostaRica } from '@/features/asistencias/asistencias.service'
import type {
  EventoAgenda,
  PrioridadEvento,
  TipoEventoAgenda,
} from '@/features/agenda/agenda.types'
import {
  formatearFechaRelativa,
  obtenerColoresTipo,
  obtenerEtiquetaTipo,
} from '@/features/agenda/agenda.service'
import { BLOQUES_DOCENTE_DEMO, MATERIAS_DESARROLLO_WEB } from '../docente.fixture'
import type { DocenteProfile } from '../docente.types'
import { useAgendaDocente, useMutacionesDocente } from '../useDocente'

type Props = {
  docente: DocenteProfile
  secciones: string[]
}

export function TabAgendaDocente({ docente, secciones }: Props) {
  const agendaQ = useAgendaDocente(docente)
  const { guardarAgendaMutation, desactivarAgendaMutation } = useMutacionesDocente(docente)

  const [editandoId, setEditandoId] = useState<string | undefined>(undefined)
  const [tipo, setTipo] = useState<TipoEventoAgenda>('tarea')
  const [titulo, setTitulo] = useState('')
  const [materia, setMateria] = useState<string>(MATERIAS_DESARROLLO_WEB[0])
  const [fecha, setFecha] = useState(() => obtenerFechaHoyCostaRica())
  const [hora, setHora] = useState('10:00')
  const [seccionObjetivo, setSeccionObjetivo] = useState<string>('')
  const [prioridad, setPrioridad] = useState<PrioridadEvento>('alta')
  const [porcentaje, setPorcentaje] = useState('20')
  const [aula, setAula] = useState('Laboratorio Desarrollo Web 1')
  const [bloqueAfectado, setBloqueAfectado] = useState<string>(BLOQUES_DOCENTE_DEMO[0])
  const [indicacion, setIndicacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; mensaje: string } | null>(null)

  const limpiarFormulario = () => {
    setEditandoId(undefined)
    setTipo('tarea')
    setTitulo('')
    setMateria(MATERIAS_DESARROLLO_WEB[0])
    setFecha(obtenerFechaHoyCostaRica())
    setHora('10:00')
    setSeccionObjetivo('')
    setPrioridad('alta')
    setPorcentaje('20')
    setAula('Laboratorio Desarrollo Web 1')
    setBloqueAfectado(BLOQUES_DOCENTE_DEMO[0])
    setIndicacion('')
    setDescripcion('')
  }

  const cargarParaEditar = (ev: EventoAgenda) => {
    setEditandoId(ev.id)
    setTipo(ev.tipo)
    setTitulo(ev.titulo)
    setMateria(ev.materia)
    setFecha(ev.fecha)
    setHora(ev.hora || '')
    setSeccionObjetivo(ev.seccionObjetivo || '')
    setPrioridad(ev.prioridad || 'media')
    setPorcentaje(typeof ev.porcentaje === 'number' ? String(ev.porcentaje) : '')
    setAula(ev.aula || '')
    setBloqueAfectado(ev.bloqueAfectado || '')
    setIndicacion(ev.indicacion || '')
    setDescripcion(ev.descripcion || '')
    setFeedback(null)
  }

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    if (!titulo.trim()) {
      setFeedback({ tipo: 'error', mensaje: 'Ingresá el título de la actividad o aviso.' })
      return
    }
    if (!materia.trim() || !fecha) {
      setFeedback({ tipo: 'error', mensaje: 'Completá la subárea y la fecha.' })
      return
    }

    const payload: Parameters<typeof guardarAgendaMutation.mutateAsync>[0] = {
      id: editandoId,
      tipo,
      titulo: titulo.trim(),
      materia: materia.trim(),
      fecha,
      hora: hora || undefined,
      descripcion: descripcion.trim() || undefined,
      seccionObjetivo: seccionObjetivo || null,
      profesor: docente.nombreCompleto,
      ...(tipo === 'tarea' ? { prioridad, completada: false } : {}),
      ...(tipo === 'examen'
        ? {
            porcentaje: porcentaje ? Number(porcentaje) : undefined,
            aula: aula.trim() || undefined,
          }
        : {}),
      ...(tipo === 'ausencia_profesor'
        ? {
            bloqueAfectado: bloqueAfectado.trim() || undefined,
            indicacion: indicacion.trim() || undefined,
          }
        : {}),
    }

    try {
      await guardarAgendaMutation.mutateAsync(payload)
      const alcanceTexto = seccionObjetivo
        ? `Sección ${seccionObjetivo} de ${docente.especialidadAsignada}`
        : `Todas las secciones de ${docente.especialidadAsignada}`
      setFeedback({
        tipo: 'ok',
        mensaje: `${editandoId ? 'Registro actualizado' : 'Publicado'} para ${alcanceTexto}.`,
      })
      limpiarFormulario()
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'No se pudo guardar la actividad.',
      })
    }
  }

  const manejarEliminar = async (id: string) => {
    setFeedback(null)
    try {
      await desactivarAgendaMutation.mutateAsync(id)
      setFeedback({ tipo: 'ok', mensaje: 'Actividad retirada de la agenda de Desarrollo Web.' })
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'No se pudo archivar el registro.',
      })
    }
  }

  const items = agendaQ.data ?? []

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start animate-fade-in">
      {/* Formulario de Gestión Docente */}
      <form
        onSubmit={manejarSubmit}
        className="xl:col-span-5 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-3.5"
      >
        <div className="border-b border-border pb-3">
          <h3 className="text-dato font-black text-text">
            {editandoId ? 'Editar Actividad Docente' : 'Publicar Tarea, Examen o Aviso'}
          </h3>
          <p className="text-micro text-text-muted mt-0.5">
            Alcance exclusivo: estudiantes de {docente.especialidadAsignada}.
          </p>
        </div>

        {/* Selector de Tipo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-1.5">
          {(
            [
              { id: 'tarea', label: 'Tarea / Proyecto', Icono: IconoTarea },
              { id: 'examen', label: 'Examen', Icono: IconoExamen },
              { id: 'recordatorio', label: 'Aviso de Clase', Icono: IconoAgenda },
              { id: 'ausencia_profesor', label: 'Ausencia', Icono: IconoProfesorAusente },
            ] as const
          ).map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setTipo(op.id)}
              className={`flex min-h-[42px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-micro font-bold transition-all ${
                tipo === op.id
                  ? 'border-primary bg-primary-tint text-primary shadow-2xs'
                  : 'border-border bg-surface-alt/50 text-text-muted hover:text-text'
              }`}
            >
              <op.Icono className="size-3.5 shrink-0" />
              <span className="truncate">{op.label}</span>
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="agenda-doc-titulo"
            className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
          >
            Título *
          </label>
          <input
            id="agenda-doc-titulo"
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Entrega Sprint 2 · Proyecto Web"
            className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-menor text-text focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label
              htmlFor="agenda-doc-materia"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Subárea *
            </label>
            <select
              id="agenda-doc-materia"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text"
            >
              {MATERIAS_DESARROLLO_WEB.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="agenda-doc-seccion"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Sección Destino ({docente.especialidadAsignada})
            </label>
            <select
              id="agenda-doc-seccion"
              value={seccionObjetivo}
              onChange={(e) => setSeccionObjetivo(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text"
            >
              <option value="">Todas las secciones de Desarrollo Web</option>
              {secciones.map((s) => (
                <option key={s} value={s}>
                  Solo Sección {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label
              htmlFor="agenda-doc-fecha"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Fecha *
            </label>
            <input
              id="agenda-doc-fecha"
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text"
            />
          </div>
          <div>
            <label
              htmlFor="agenda-doc-hora"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Hora (Opcional)
            </label>
            <input
              id="agenda-doc-hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text"
            />
          </div>
        </div>

        {tipo === 'tarea' && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Prioridad
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['baja', 'media', 'alta'] as PrioridadEvento[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`min-h-[38px] cursor-pointer rounded-xl border text-micro font-bold uppercase ${
                    prioridad === p
                      ? 'border-primary bg-primary-tint text-primary'
                      : 'border-border bg-surface-alt/40 text-text-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {tipo === 'examen' && (
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Porcentaje (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                className="w-full min-h-[40px] rounded-xl border border-border bg-surface-alt px-3 py-1.5 text-menor text-text"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Laboratorio / Aula
              </label>
              <input
                type="text"
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                className="w-full min-h-[40px] rounded-xl border border-border bg-surface-alt px-3 py-1.5 text-menor text-text"
              />
            </div>
          </div>
        )}

        {tipo === 'ausencia_profesor' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Bloque afectado
              </label>
              <input
                type="text"
                value={bloqueAfectado}
                onChange={(e) => setBloqueAfectado(e.target.value)}
                className="w-full min-h-[40px] rounded-xl border border-border bg-surface-alt px-3 py-1.5 text-menor text-text"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Indicación para el grupo
              </label>
              <input
                type="text"
                value={indicacion}
                onChange={(e) => setIndicacion(e.target.value)}
                placeholder="Ej. Realizar práctica guiada en repositorio..."
                className="w-full min-h-[40px] rounded-xl border border-border bg-surface-alt px-3 py-1.5 text-menor text-text"
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="agenda-doc-desc"
            className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
          >
            Indicaciones / Detalles
          </label>
          <textarea
            id="agenda-doc-desc"
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Criterios de entrega, materiales o enlaces de clase..."
            className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-menor text-text focus:border-primary focus:outline-none"
          />
        </div>

        {feedback && (
          <div
            role="status"
            className={`flex items-center gap-2 rounded-xl border p-3 text-micro font-semibold ${
              feedback.tipo === 'ok'
                ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                : 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300'
            }`}
          >
            {feedback.tipo === 'ok' && <IconoCheck className="size-4 shrink-0" />}
            <span>{feedback.mensaje}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="min-h-[44px] cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-micro font-bold text-text-muted hover:bg-surface-alt"
            >
              Cancelar edición
            </button>
          )}
          <button
            type="submit"
            disabled={guardarAgendaMutation.isPending}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary-solid px-5 py-2 text-micro font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-50"
          >
            <IconoMas className="size-4" />
            <span>
              {guardarAgendaMutation.isPending
                ? 'Publicando...'
                : editandoId
                  ? 'Guardar Cambios'
                  : 'Publicar en Desarrollo Web'}
            </span>
          </button>
        </div>
      </form>

      {/* Lista de Actividades Publicadas */}
      <div className="xl:col-span-7 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-dato font-black text-text">
            Agenda Activa · {docente.especialidadAsignada} ({items.length})
          </h3>
        </div>

        {agendaQ.isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-24 rounded-2xl bg-surface-alt border border-border" />
            <div className="h-24 rounded-2xl bg-surface-alt border border-border" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <IconoAgenda className="size-9 text-text-muted mx-auto mb-2" />
            <p className="text-dato font-bold text-text">
              Aún no hay actividades publicadas para {docente.especialidadAsignada}
            </p>
            <p className="mt-1 text-menor text-text-muted">
              Usá el formulario para programar tareas, exámenes o avisos de clase.
            </p>
          </div>
        ) : (
          items.map((ev) => {
            const colores = obtenerColoresTipo(ev.tipo)
            return (
              <article
                key={ev.id}
                className={`rounded-2xl border border-l-4 border-border bg-surface p-4 shadow-xs space-y-2 ${colores.borde}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase ${colores.badge}`}>
                      {obtenerEtiquetaTipo(ev.tipo)}
                    </span>
                    <span className="rounded-lg bg-primary-tint border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {ev.seccionObjetivo ? `Sección ${ev.seccionObjetivo}` : 'Todo Desarrollo Web'}
                    </span>
                    <span className="rounded-lg bg-surface-alt px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                      {ev.materia}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => cargarParaEditar(ev)}
                      aria-label={`Editar ${ev.titulo}`}
                      className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:text-primary"
                    >
                      <IconoEditar className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void manejarEliminar(ev.id)}
                      aria-label={`Eliminar ${ev.titulo}`}
                      className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:text-rose-600"
                    >
                      <IconoEliminar className="size-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-dato font-bold text-text">{ev.titulo}</h4>
                {ev.descripcion && (
                  <p className="text-menor text-text-muted leading-relaxed">{ev.descripcion}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1 text-micro text-text-muted border-t border-border/60">
                  <span className="inline-flex items-center gap-1 font-semibold text-text">
                    <IconoCalendario className="size-3.5 text-primary" />
                    {formatearFechaRelativa(ev.fecha)} ({ev.fecha})
                  </span>
                  {ev.hora && <span>Hora: {ev.hora}</span>}
                  {typeof ev.porcentaje === 'number' && (
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      Valor: {ev.porcentaje}%
                    </span>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
