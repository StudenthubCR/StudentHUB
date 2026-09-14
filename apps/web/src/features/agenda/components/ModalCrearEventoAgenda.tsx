import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import {
  IconoAgenda,
  IconoCerrar,
  IconoExamen,
  IconoProfesorAusente,
  IconoTarea,
} from '@/components/icons'
import type { EventoAgenda, PrioridadEvento, TipoEventoAgenda } from '../agenda.types'
import { cn } from '@/lib/cn'

interface ModalCrearEventoAgendaProps {
  abierto: boolean
  alCerrar: () => void
  alGuardar: (evento: Omit<EventoAgenda, 'id' | 'creadoEn'>) => void
  alActualizar?: (id: string, cambios: Partial<EventoAgenda>) => void
  eventoParaEditar?: EventoAgenda | null
  fechaInicial?: string | null
}

const MATERIAS_COMUNES = [
  'Matemática',
  'Español',
  'Estudios Sociales',
  'Ciencias / Física / Química',
  'Inglés',
  'Educación Cívica',
  'Especialidad Técnica',
  'Taller Tecnológico',
  'Educación Física',
]

const BLOQUES_COMUNES = [
  'Lecciones 1 a 3 (7:00 am - 9:15 am)',
  'Lecciones 4 a 6 (9:30 am - 11:40 am)',
  'Lecciones 7 a 9 (12:20 pm - 2:30 pm)',
  'Lecciones 10 a 12 (2:45 pm - 4:45 pm)',
  'Toda la jornada',
]

export function ModalCrearEventoAgenda({
  abierto,
  alCerrar,
  alGuardar,
  alActualizar,
  eventoParaEditar,
  fechaInicial,
}: ModalCrearEventoAgendaProps) {
  const [tipo, setTipo] = useState<TipoEventoAgenda>('tarea')
  const [titulo, setTitulo] = useState('')
  const [materia, setMateria] = useState('')
  const [fecha, setFecha] = useState(fechaInicial || format(new Date(), 'yyyy-MM-dd'))
  const [hora, setHora] = useState('')
  const [descripcion, setDescripcion] = useState('')

  // Campos específicos
  const [porcentaje, setPorcentaje] = useState<string>('')
  const [temarioTexto, setTemarioTexto] = useState('')
  const [aula, setAula] = useState('')
  const [prioridad, setPrioridad] = useState<PrioridadEvento>('media')
  const [profesor, setProfesor] = useState('')
  const [bloqueAfectado, setBloqueAfectado] = useState('')
  const [indicacion, setIndicacion] = useState('')

  const [error, setError] = useState<string | null>(null)

  // Cargar datos al abrir para edición o nuevo
  useEffect(() => {
    if (eventoParaEditar) {
      setTipo(eventoParaEditar.tipo)
      setTitulo(eventoParaEditar.titulo)
      setMateria(eventoParaEditar.materia)
      setFecha(eventoParaEditar.fecha)
      setHora(eventoParaEditar.hora || '')
      setDescripcion(eventoParaEditar.descripcion || '')
      setPorcentaje(eventoParaEditar.porcentaje ? String(eventoParaEditar.porcentaje) : '')
      setTemarioTexto(eventoParaEditar.temario ? eventoParaEditar.temario.join('\n') : '')
      setAula(eventoParaEditar.aula || '')
      setPrioridad(eventoParaEditar.prioridad || 'media')
      setProfesor(eventoParaEditar.profesor || '')
      setBloqueAfectado(eventoParaEditar.bloqueAfectado || '')
      setIndicacion(eventoParaEditar.indicacion || '')
    } else {
      setTipo('tarea')
      setTitulo('')
      setMateria('')
      setFecha(fechaInicial || format(new Date(), 'yyyy-MM-dd'))
      setHora('')
      setDescripcion('')
      setPorcentaje('')
      setTemarioTexto('')
      setAula('')
      setPrioridad('media')
      setProfesor('')
      setBloqueAfectado('')
      setIndicacion('')
    }
    setError(null)
  }, [eventoParaEditar, fechaInicial, abierto])

  // Bloquear scroll del fondo y escuchar tecla Escape
  useEffect(() => {
    if (!abierto) return
    const scrollOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
    }
    window.addEventListener('keydown', manejarTecla)

    return () => {
      document.body.style.overflow = scrollOriginal
      window.removeEventListener('keydown', manejarTecla)
    }
  }, [abierto, alCerrar])

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault()

    if (!materia.trim()) {
      setError('Por favor indica la materia o asignatura.')
      return
    }

    if (!fecha) {
      setError('Por favor selecciona la fecha del evento.')
      return
    }

    const tituloFinal =
      titulo.trim() ||
      (tipo === 'ausencia_profesor'
        ? `Profesor ausente: ${profesor || materia}`
        : tipo === 'examen'
          ? `Examen de ${materia}`
          : `Tarea de ${materia}`)

    const datosEvento: Omit<EventoAgenda, 'id' | 'creadoEn'> = {
      tipo,
      titulo: tituloFinal,
      materia: materia.trim(),
      fecha,
      hora: hora || undefined,
      descripcion: descripcion.trim() || undefined,
    }

    if (tipo === 'examen') {
      const p = parseFloat(porcentaje)
      if (!isNaN(p)) datosEvento.porcentaje = p
      if (temarioTexto.trim()) {
        datosEvento.temario = temarioTexto
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean)
      }
      if (aula.trim()) datosEvento.aula = aula.trim()
    } else if (tipo === 'tarea') {
      datosEvento.prioridad = prioridad
      datosEvento.completada = eventoParaEditar?.completada ?? false
    } else if (tipo === 'ausencia_profesor') {
      datosEvento.profesor = profesor.trim() || 'Docente'
      datosEvento.bloqueAfectado = bloqueAfectado.trim() || undefined
      datosEvento.indicacion = indicacion.trim() || undefined
    }

    if (eventoParaEditar && alActualizar) {
      alActualizar(eventoParaEditar.id, datosEvento)
    } else {
      alGuardar(datosEvento)
    }

    alCerrar()
  }

  if (!abierto) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={eventoParaEditar ? 'Editar Registro' : 'Nuevo en la Agenda'}
      onClick={alCerrar}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3.5 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[88vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-2xl animate-slide-up"
      >
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              {tipo === 'examen' ? (
                <IconoExamen className="size-4.5" />
              ) : tipo === 'ausencia_profesor' ? (
                <IconoProfesorAusente className="size-4.5" />
              ) : (
                <IconoTarea className="size-4.5" />
              )}
            </span>
            <div>
              <h3 className="text-titulo font-bold text-text leading-tight">
                {eventoParaEditar ? 'Editar Registro' : 'Nuevo en la Agenda'}
              </h3>
              <p className="text-micro text-text-muted">
                {eventoParaEditar ? 'Modificá los detalles del evento' : 'Agregá un examen, tarea o profesor ausente'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar ventana"
            className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
          >
            <IconoCerrar className="size-4" />
          </button>
        </div>

        {/* Pestañas para elegir el tipo de evento */}
        <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-surface-alt p-1">
          <button
            type="button"
            onClick={() => setTipo('tarea')}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 rounded-lg text-micro font-bold transition-all',
              tipo === 'tarea'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-muted hover:text-text',
            )}
          >
            <IconoTarea className="size-4 mb-0.5" />
            <span>Tarea</span>
          </button>

          <button
            type="button"
            onClick={() => setTipo('examen')}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 rounded-lg text-micro font-bold transition-all',
              tipo === 'examen'
                ? 'bg-surface text-rose-600 shadow-xs'
                : 'text-text-muted hover:text-text',
            )}
          >
            <IconoExamen className="size-4 mb-0.5" />
            <span>Examen</span>
          </button>

          <button
            type="button"
            onClick={() => setTipo('ausencia_profesor')}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 rounded-lg text-micro font-bold transition-all',
              tipo === 'ausencia_profesor'
                ? 'bg-surface text-amber-600 shadow-xs'
                : 'text-text-muted hover:text-text',
            )}
          >
            <IconoProfesorAusente className="size-4 mb-0.5" />
            <span>Prof. Ausente</span>
          </button>

          <button
            type="button"
            onClick={() => setTipo('recordatorio')}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 rounded-lg text-micro font-bold transition-all',
              tipo === 'recordatorio'
                ? 'bg-surface text-emerald-600 shadow-xs'
                : 'text-text-muted hover:text-text',
            )}
          >
            <IconoAgenda className="size-4 mb-0.5" />
            <span>Aviso</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-menor text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-3.5">
          {/* Materia y sugerencias rápidas */}
          <div>
            <label className="block text-micro font-bold text-text-muted uppercase tracking-wider mb-1">
              Materia / Asignatura *
            </label>
            <input
              type="text"
              required
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              placeholder="Ej. Matemática, Programación, Español..."
              className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-dato text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-none"
            />
            {/* Sugerencias rápidas */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {MATERIAS_COMUNES.slice(0, 5).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMateria(m)}
                  className="rounded-lg bg-surface-alt hover:bg-primary-tint hover:text-primary px-2 py-0.5 text-micro font-medium text-text-muted transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Título o Nombre */}
          <div>
            <label className="block text-micro font-bold text-text-muted uppercase tracking-wider mb-1">
              {tipo === 'ausencia_profesor'
                ? 'Nombre del profesor que falta *'
                : tipo === 'examen'
                  ? 'Título del examen (opcional)'
                  : 'Título o Descripción breve *'}
            </label>
            <input
              type="text"
              value={tipo === 'ausencia_profesor' ? profesor : titulo}
              onChange={(e) => {
                if (tipo === 'ausencia_profesor') {
                  setProfesor(e.target.value)
                  setTitulo(`Profesor ausente: ${e.target.value}`)
                } else {
                  setTitulo(e.target.value)
                }
              }}
              placeholder={
                tipo === 'ausencia_profesor'
                  ? 'Ej. Prof. Alberto Vargas'
                  : tipo === 'examen'
                    ? 'Ej. Examen Parcial I (o dejar vacío)'
                    : 'Ej. Guía de ejercicios página 45'
              }
              className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-dato text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Fecha y Hora en 2 columnas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-micro font-bold text-text-muted uppercase tracking-wider mb-1">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-dato text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-micro font-bold text-text-muted uppercase tracking-wider mb-1">
                Hora (opcional)
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-dato text-text focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* CAMPOS CONDICIONALES SEGÚN TIPO */}

          {/* 1. Ausencia de profesor: Bloque de lecciones y nota de indicación */}
          {tipo === 'ausencia_profesor' && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-3">
              <div>
                <label className="block text-micro font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">
                  Lecciones o bloque afectado
                </label>
                <input
                  type="text"
                  value={bloqueAfectado}
                  onChange={(e) => setBloqueAfectado(e.target.value)}
                  placeholder="Ej. Lecciones 1 a 3 (7:00 am - 9:15 am)"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-dato text-text focus:border-amber-500 focus:outline-none"
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {BLOQUES_COMUNES.slice(0, 3).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBloqueAfectado(b)}
                      className="rounded-lg bg-surface hover:bg-amber-500/10 px-2 py-0.5 text-micro font-medium text-amber-800 dark:text-amber-200 transition-colors"
                    >
                      {b.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-micro font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">
                  Indicación o instrucción especial
                </label>
                <input
                  type="text"
                  value={indicacion}
                  onChange={(e) => setIndicacion(e.target.value)}
                  placeholder="Ej. Dejó guía en Teams; entrada a las 9:30 am"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-dato text-text focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 2. Examen: Ponderación, Aula y Temario */}
          {tipo === 'examen' && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-micro font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-1">
                    Porcentaje (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(e.target.value)}
                    placeholder="Ej. 25"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-dato text-text focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-micro font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-1">
                    Aula / Lab
                  </label>
                  <input
                    type="text"
                    value={aula}
                    onChange={(e) => setAula(e.target.value)}
                    placeholder="Ej. Lab 2, Aula 14"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-dato text-text focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-micro font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-1">
                  Temario (un tema por línea)
                </label>
                <textarea
                  rows={2}
                  value={temarioTexto}
                  onChange={(e) => setTemarioTexto(e.target.value)}
                  placeholder="React Hooks&#10;TypeScript estricto&#10;Tailwind CSS"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-dato text-text focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* 3. Tarea: Prioridad */}
          {tipo === 'tarea' && (
            <div>
              <label className="block text-micro font-bold text-text-muted uppercase tracking-wider mb-1">
                Prioridad de entrega
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['baja', 'media', 'alta'] as PrioridadEvento[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrioridad(p)}
                    className={cn(
                      'rounded-xl border py-2 text-micro font-bold uppercase transition-all',
                      prioridad === p
                        ? p === 'alta'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                          : p === 'media'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                            : 'border-primary bg-primary-tint text-primary'
                        : 'border-border bg-surface-alt text-text-muted hover:border-border-strong',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Descripción / Notas adicionales */}
          <div>
            <label className="block text-micro font-bold text-text-muted uppercase tracking-wider mb-1">
              Notas adicionales (opcional)
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles sobre materiales requeridos, formato o enlaces..."
              className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-dato text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={alCerrar}
              className="rounded-xl px-4 py-2 text-menor font-bold text-text-muted hover:bg-surface-alt transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-menor font-bold text-white shadow-xs hover:bg-primary-dark active:scale-98 transition-all"
            >
              {eventoParaEditar ? 'Guardar Cambios' : 'Registrar en Agenda'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
