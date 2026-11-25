import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconoBirrete, IconoCerrar, IconoCheck, IconoAlertaTriangulo } from '@/components/icons'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import {
  calcularNotaFinalMep,
  extraerPuntajes0a100DesdeRubrica,
  obtenerEstadoCalificacion,
  type NotaMateria,
  type PeriodoNota,
  type RubricaNota,
} from '@/features/notas/notas.types'
import { MATERIAS_DESARROLLO_WEB } from '../docente.fixture'
import type { DocenteProfile } from '../docente.types'
import { useMutacionesDocente } from '../useDocente'

type Props = {
  abierto: boolean
  alCerrar: () => void
  docente: DocenteProfile
  estudiantes: Estudiante[]
  periodoInicial: PeriodoNota
  notaInicial?: NotaMateria | null
  estudianteIdPreseleccionado?: string
  alGuardarExito: (mensaje: string) => void
}

const RUBRICA_POR_DEFECTO: RubricaNota = {
  trabajoCotidiano: 85,
  tareas: 85,
  pruebas: 80,
  proyecto: 90,
  asistencia: 95,
}

export function ModalEditarNotaDocente({
  abierto,
  alCerrar,
  docente,
  estudiantes,
  periodoInicial,
  notaInicial,
  estudianteIdPreseleccionado,
  alGuardarExito,
}: Props) {
  const { guardarNotaMutation } = useMutacionesDocente(docente)

  const [estudianteId, setEstudianteId] = useState('')
  const [periodo, setPeriodo] = useState<PeriodoNota>(periodoInicial)
  const [materia, setMateria] = useState<string>(MATERIAS_DESARROLLO_WEB[0])
  const [puntajes, setPuntajes] = useState<RubricaNota>(RUBRICA_POR_DEFECTO)
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!abierto) return
    if (notaInicial) {
      setEstudianteId(notaInicial.estudianteId)
      setPeriodo(notaInicial.periodo)
      setMateria(notaInicial.materia)
      setPuntajes(extraerPuntajes0a100DesdeRubrica(notaInicial.rubrica))
      setObservaciones(notaInicial.observaciones || '')
    } else {
      setEstudianteId(estudianteIdPreseleccionado || estudiantes[0]?.id || '')
      setPeriodo(periodoInicial === 'Anual' ? 'I Periodo' : periodoInicial)
      setMateria(MATERIAS_DESARROLLO_WEB[0])
      setPuntajes(RUBRICA_POR_DEFECTO)
      setObservaciones('')
    }
    setError(null)
  }, [abierto, notaInicial, estudianteIdPreseleccionado, estudiantes, periodoInicial])

  useEffect(() => {
    if (!abierto) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [abierto, alCerrar])

  if (!abierto || typeof document === 'undefined') return null

  const calculo = calcularNotaFinalMep(puntajes)
  const estado = obtenerEstadoCalificacion(calculo.notaFinal)
  const estudianteSeleccionado = estudiantes.find((e) => e.id === estudianteId)

  const actualizarCampo = (campo: keyof RubricaNota, valorStr: string) => {
    const num = valorStr === '' ? 0 : Number(valorStr)
    if (!Number.isFinite(num)) return
    const clamped = Math.min(100, Math.max(0, num))
    setPuntajes((prev) => ({ ...prev, [campo]: clamped }))
    if (error) setError(null)
  }

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estudianteSeleccionado) {
      setError('Seleccioná un estudiante perteneciente a Desarrollo Web.')
      return
    }
    if (!materia.trim()) {
      setError('Indicá el nombre de la subárea o materia.')
      return
    }

    try {
      await guardarNotaMutation.mutateAsync({
        estudiante: estudianteSeleccionado,
        payload: {
          id: notaInicial?.id,
          estudianteId: estudianteSeleccionado.id || '',
          periodo,
          materia: materia.trim(),
          docente: docente.nombreCompleto,
          notaFinal: calculo.notaFinal,
          rubrica: calculo.rubricaPonderada,
          observaciones: observaciones.trim() || undefined,
        },
      })
      alGuardarExito(
        `Calificación guardada para ${estudianteSeleccionado.nombre} (${materia.trim()}: ${calculo.notaFinal.toFixed(1)}).`,
      )
      alCerrar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la calificación.')
    }
  }

  const camposRubrica: Array<{
    clave: keyof RubricaNota
    titulo: string
    peso: string
    ponderado: number
  }> = [
    {
      clave: 'trabajoCotidiano',
      titulo: 'Trabajo cotidiano',
      peso: '40%',
      ponderado: calculo.rubricaPonderada.trabajoCotidiano,
    },
    {
      clave: 'tareas',
      titulo: 'Tareas',
      peso: '10%',
      ponderado: calculo.rubricaPonderada.tareas,
    },
    {
      clave: 'pruebas',
      titulo: 'Pruebas',
      peso: '35%',
      ponderado: calculo.rubricaPonderada.pruebas,
    },
    {
      clave: 'proyecto',
      titulo: 'Proyecto',
      peso: '10%',
      ponderado: calculo.rubricaPonderada.proyecto,
    },
    {
      clave: 'asistencia',
      titulo: 'Asistencia',
      peso: '5%',
      ponderado: calculo.rubricaPonderada.asistencia,
    },
  ]

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={notaInicial ? 'Editar calificación MEP' : 'Registrar calificación MEP'}
      onClick={alCerrar}
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-solid text-white">
              <IconoBirrete className="size-4.5" />
            </span>
            <div>
              <h2 className="text-subtitulo font-black text-text">
                {notaInicial ? 'Editar Calificación' : 'Registrar Calificación'}
              </h2>
              <p className="text-micro text-text-muted">
                Escala oficial MEP 0–100 · Especialidad {docente.especialidadAsignada}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar ventana"
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-alt text-text-muted hover:text-text"
          >
            <IconoCerrar className="size-4" />
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="nota-estudiante"
                className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
              >
                Estudiante ({docente.especialidadAsignada})
              </label>
              <select
                id="nota-estudiante"
                value={estudianteId}
                disabled={Boolean(notaInicial)}
                onChange={(e) => setEstudianteId(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text disabled:opacity-75"
              >
                {estudiantes.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.nombre} ({est.grupo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="nota-periodo"
                className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
              >
                Periodo Lectivo
              </label>
              <select
                id="nota-periodo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as PeriodoNota)}
                className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3 py-2 text-menor text-text"
              >
                <option value="I Periodo">I Periodo</option>
                <option value="II Periodo">II Periodo</option>
                <option value="III Periodo">III Periodo</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="nota-materia"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Materia / Subárea Técnica *
            </label>
            <input
              id="nota-materia"
              type="text"
              required
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              placeholder="Ej. Programación y Desarrollo Web"
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-menor text-text focus:border-primary focus:outline-none"
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {MATERIAS_DESARROLLO_WEB.slice(0, 4).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMateria(m)}
                  className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold text-text-muted hover:border-primary/40 hover:text-primary"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Desglose Rúbrica MEP 0-100 */}
          <div className="rounded-2xl border border-border bg-surface-alt/40 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-micro font-bold uppercase tracking-wider text-text-muted">
                Desglose por Rubro (Calificación 0–100)
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-micro font-bold ${estado.claseColor}`}>
                {calculo.aprobada ? (
                  <IconoCheck className="size-3" />
                ) : (
                  <IconoAlertaTriangulo className="size-3" />
                )}
                <span>
                  Nota Final: {calculo.notaFinal.toFixed(1)} ·{' '}
                  {calculo.aprobada ? 'Aprobado' : 'Por reforzar'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {camposRubrica.map((c) => (
                <div key={c.clave} className="rounded-xl border border-border bg-surface p-2.5">
                  <div className="flex items-center justify-between text-micro mb-1">
                    <label htmlFor={`rubro-${c.clave}`} className="font-bold text-text">
                      {c.titulo} ({c.peso})
                    </label>
                    <span className="font-mono font-semibold text-primary">
                      {c.ponderado.toFixed(1)} pts
                    </span>
                  </div>
                  <input
                    id={`rubro-${c.clave}`}
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={puntajes[c.clave]}
                    onChange={(e) => actualizarCampo(c.clave, e.target.value)}
                    className="w-full min-h-[40px] rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-dato font-bold text-text focus:border-primary focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="nota-observaciones"
              className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Observaciones del Docente
            </label>
            <textarea
              id="nota-observaciones"
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Retroalimentación formativa sobre el desempeño en la subárea..."
              className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-menor text-text focus:border-primary focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-menor text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 border-t border-border pt-3">
            <button
              type="button"
              onClick={alCerrar}
              className="min-h-[44px] cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-menor font-bold text-text-muted hover:bg-surface-alt"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardarNotaMutation.isPending}
              className="min-h-[44px] cursor-pointer rounded-xl bg-primary-solid px-5 py-2 text-menor font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-50"
            >
              {guardarNotaMutation.isPending ? 'Guardando...' : 'Guardar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
