import { useEffect, useMemo, useState } from 'react'
import {
  IconoCheck,
  IconoListaAsistencia,
  IconoUsuarios,
} from '@/components/icons'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import {
  obtenerFechaHoyCostaRica,
  type GuardarAsistenciaInput,
} from '@/features/asistencias/asistencias.service'
import type {
  EstadoAsistencia,
  PeriodoAsistencia,
  RegistroAsistencia,
} from '@/features/asistencias/asistencias.types'
import { BLOQUES_DOCENTE_DEMO, MATERIAS_DESARROLLO_WEB } from '../docente.fixture'
import { marcarTodosPresentes } from '../docente.service'
import type { DocenteProfile } from '../docente.types'
import { useMutacionesDocente } from '../useDocente'

type Props = {
  docente: DocenteProfile
  estudiantes: Estudiante[]
  asistencias: RegistroAsistencia[]
}

type EstadoFilaPase = {
  estudiante: Estudiante
  estado: EstadoAsistencia
  justificacion: string
}

const OPCIONES_ESTADO: Array<{
  valor: EstadoAsistencia
  etiqueta: string
  claseActiva: string
}> = [
  {
    valor: 'presente',
    etiqueta: 'Presente',
    claseActiva:
      'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  },
  {
    valor: 'ausencia_injustificada',
    etiqueta: 'Ausente injustificada',
    claseActiva: 'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-300',
  },
  {
    valor: 'ausencia_justificada',
    etiqueta: 'Ausente justificada',
    claseActiva: 'border-blue-500 bg-blue-500/15 text-blue-800 dark:text-blue-300',
  },
  {
    valor: 'tardia',
    etiqueta: 'Tardía',
    claseActiva: 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300',
  },
]

export function TabAsistenciasDocente({ docente, estudiantes, asistencias }: Props) {
  const [fecha, setFecha] = useState(() => obtenerFechaHoyCostaRica())
  const [periodo, setPeriodo] = useState<PeriodoAsistencia>('I Periodo')
  const [seccionFiltro, setSeccionFiltro] = useState('todas')
  const [materia, setMateria] = useState<string>(MATERIAS_DESARROLLO_WEB[0])
  const [bloque, setBloque] = useState<string>(BLOQUES_DOCENTE_DEMO[0])
  const [filas, setFilas] = useState<EstadoFilaPase[]>([])
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; mensaje: string } | null>(null)

  const { guardarAsistenciasMutation } = useMutacionesDocente(docente)

  const secciones = useMemo(
    () => Array.from(new Set(estudiantes.map((e) => e.grupo).filter(Boolean))).sort(),
    [estudiantes],
  )

  const estudiantesFiltrados = useMemo(() => {
    if (seccionFiltro === 'todas') return estudiantes
    return estudiantes.filter((e) => e.grupo === seccionFiltro)
  }, [estudiantes, seccionFiltro])

  useEffect(() => {
    setFilas(
      estudiantesFiltrados.map((est) => {
        const previo = asistencias.find(
          (a) =>
            a.estudianteId === est.id &&
            a.fecha === fecha &&
            a.materia.trim().toLowerCase() === materia.trim().toLowerCase() &&
            a.bloque.trim().toLowerCase() === bloque.trim().toLowerCase(),
        )
        return {
          estudiante: est,
          estado: previo?.estado ?? 'presente',
          justificacion: previo?.justificacion ?? '',
        }
      }),
    )
  }, [estudiantesFiltrados, asistencias, fecha, materia, bloque])

  const resumenActual = useMemo(() => {
    let presentes = 0
    let injustificadas = 0
    let justificadas = 0
    let tardias = 0
    for (const f of filas) {
      if (f.estado === 'presente') presentes++
      else if (f.estado === 'ausencia_injustificada') injustificadas++
      else if (f.estado === 'ausencia_justificada') justificadas++
      else tardias++
    }
    return { presentes, injustificadas, justificadas, tardias }
  }, [filas])

  const cambiarEstadoEstudiante = (estudianteId: string | undefined, estado: EstadoAsistencia) => {
    setFilas((prev) =>
      prev.map((f) => (f.estudiante.id === estudianteId ? { ...f, estado } : f)),
    )
    if (feedback) setFeedback(null)
  }

  const cambiarJustificacion = (estudianteId: string | undefined, justificacion: string) => {
    setFilas((prev) =>
      prev.map((f) => (f.estudiante.id === estudianteId ? { ...f, justificacion } : f)),
    )
  }

  const aplicarTodosPresentes = () => {
    setFilas((prev) =>
      marcarTodosPresentes(
        prev.map((f) => ({
          ...f,
          estudianteId: f.estudiante.id || '',
        })),
      ).map(({ estudianteId: _ignored, ...rest }) => rest),
    )
    setFeedback({
      tipo: 'ok',
      mensaje: `Se marcaron ${filas.length} estudiantes de Desarrollo Web como presentes. Recordá guardar el pase de lista.`,
    })
  }

  const manejarGuardarPase = async () => {
    setFeedback(null)
    if (filas.length === 0) {
      setFeedback({ tipo: 'error', mensaje: 'No hay estudiantes visibles para registrar.' })
      return
    }

    const entradas: GuardarAsistenciaInput[] = filas.map((f) => ({
      estudianteId: f.estudiante.id || '',
      fecha,
      periodo,
      materia,
      bloque,
      estado: f.estado,
      justificacion: f.justificacion.trim() || undefined,
    }))

    try {
      await guardarAsistenciasMutation.mutateAsync({
        estudiantes: estudiantesFiltrados,
        entradas,
      })
      setFeedback({
        tipo: 'ok',
        mensaje: `Pase de lista guardado (${filas.length} registros · ${fecha} · ${materia}).`,
      })
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'No se pudo guardar el pase de lista.',
      })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Parámetros del Pase de Lista */}
      <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div>
            <label
              htmlFor="asist-fecha"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Fecha (Costa Rica)
            </label>
            <input
              id="asist-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="asist-periodo"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Periodo
            </label>
            <select
              id="asist-periodo"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as PeriodoAsistencia)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text focus:border-primary focus:outline-none"
            >
              <option value="I Periodo">I Periodo</option>
              <option value="II Periodo">II Periodo</option>
              <option value="III Periodo">III Periodo</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="asist-seccion"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Sección
            </label>
            <select
              id="asist-seccion"
              value={seccionFiltro}
              onChange={(e) => setSeccionFiltro(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text focus:border-primary focus:outline-none"
            >
              <option value="todas">Todas ({estudiantes.length})</option>
              {secciones.map((s) => (
                <option key={s} value={s}>
                  Sección {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="asist-materia"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Subárea / Materia
            </label>
            <select
              id="asist-materia"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text focus:border-primary focus:outline-none"
            >
              {MATERIAS_DESARROLLO_WEB.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 pt-1">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="asist-bloque"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Bloque Horario
            </label>
            <select
              id="asist-bloque"
              value={bloque}
              onChange={(e) => setBloque(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text focus:border-primary focus:outline-none"
            >
              {BLOQUES_DOCENTE_DEMO.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={aplicarTodosPresentes}
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-3.5 py-2 text-micro font-bold text-emerald-800 dark:text-emerald-300 transition-all hover:bg-emerald-500/25 active:scale-98"
            >
              <IconoCheck className="size-4" />
              <span>Marcar todos presentes</span>
            </button>

            <button
              type="button"
              onClick={() => void manejarGuardarPase()}
              disabled={guardarAsistenciasMutation.isPending}
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary-solid px-4 py-2 text-micro font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-98 disabled:opacity-50"
            >
              <IconoListaAsistencia className="size-4" />
              <span>
                {guardarAsistenciasMutation.isPending ? 'Guardando...' : 'Guardar Pase de Lista'}
              </span>
            </button>
          </div>
        </div>

        {/* Resumen del pase actual */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/70 text-center">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5">
            <span className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
              Presentes
            </span>
            <span className="text-dato font-black text-text">{resumenActual.presentes}</span>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5">
            <span className="block text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">
              Tardías
            </span>
            <span className="text-dato font-black text-text">{resumenActual.tardias}</span>
          </div>
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/25 px-2.5 py-1.5">
            <span className="block text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">
              Justificadas
            </span>
            <span className="text-dato font-black text-text">{resumenActual.justificadas}</span>
          </div>
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 px-2.5 py-1.5">
            <span className="block text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">
              Injustificadas
            </span>
            <span className="text-dato font-black text-text">{resumenActual.injustificadas}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-2xl border p-3.5 text-menor font-semibold ${
            feedback.tipo === 'ok'
              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
              : 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          }`}
        >
          <IconoCheck className="size-4 shrink-0" />
          <span>{feedback.mensaje}</span>
        </div>
      )}

      {/* Lista de estudiantes para pase de lista */}
      {filas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <IconoUsuarios className="size-9 text-text-muted mb-2" />
          <p className="text-dato font-bold text-text">No hay estudiantes en esta sección</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filas.map((fila) => (
            <article
              key={fila.estudiante.id || fila.estudiante.codigo}
              className="rounded-2xl border border-border bg-surface p-4 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-dato font-bold text-text truncate">
                    {fila.estudiante.nombre}
                  </h3>
                  <p className="text-micro font-mono text-text-muted">
                    {fila.estudiante.codigo} · Sección {fila.estudiante.grupo}
                  </p>
                </div>
                <span className="rounded-full bg-primary-tint border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  {fila.estudiante.especialidad}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OPCIONES_ESTADO.map((op) => {
                  const activo = fila.estado === op.valor
                  return (
                    <button
                      key={op.valor}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => cambiarEstadoEstudiante(fila.estudiante.id, op.valor)}
                      className={`min-h-[44px] cursor-pointer rounded-xl border px-2.5 py-2 text-micro font-bold transition-all active:scale-98 ${
                        activo
                          ? `${op.claseActiva} shadow-2xs`
                          : 'border-border bg-surface-alt/50 text-text-muted hover:text-text'
                      }`}
                    >
                      {op.etiqueta}
                    </button>
                  )
                })}
              </div>

              <input
                type="text"
                value={fila.justificacion}
                onChange={(e) => cambiarJustificacion(fila.estudiante.id, e.target.value)}
                aria-label={`Nota o justificación para ${fila.estudiante.nombre}`}
                placeholder="Nota o comprobante opcional (ej. boleta médica, tardía de bus)..."
                className="w-full min-h-[40px] rounded-xl border border-border bg-surface-alt/60 px-3 py-1.5 text-micro text-text placeholder:text-text-muted/70 focus:border-primary focus:outline-none"
              />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
