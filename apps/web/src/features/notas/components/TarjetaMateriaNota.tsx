import { useState } from 'react'
import { IconoChevron, IconoInfo, IconoCheck } from '@/components/icons'
import { obtenerEstadoCalificacion, type NotaMateria } from '../notas.types'

type Props = {
  nota: NotaMateria
}

export function TarjetaMateriaNota({ nota }: Props) {
  const [desplegado, setDesplegado] = useState(false)
  const infoEstado = obtenerEstadoCalificacion(nota.notaFinal)

  return (
    <article className="rounded-2xl border border-border bg-surface overflow-hidden transition-all duration-200 hover:border-border-strong shadow-xs">
      {/* Encabezado de la Materia */}
      <div
        onClick={() => setDesplegado((prev) => !prev)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer select-none"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-bold border ${infoEstado.claseColor}`}
            >
              {nota.aprobada && <IconoCheck className="size-3" />}
              <span>{infoEstado.etiqueta}</span>
            </span>
            <span className="text-micro text-text-muted font-semibold">
              {nota.periodo}
            </span>
          </div>
          <h3 className="text-dato font-bold text-text sm:text-cuerpo truncate">
            {nota.materia}
          </h3>
          {nota.docente && (
            <p className="text-micro text-text-muted mt-0.5 truncate">
              {nota.docente}
            </p>
          )}
        </div>

        {/* Calificación y Botón Desplegable */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
          <div className="text-right">
            <span className="block text-dato sm:text-titulo font-black text-text tracking-tight">
              {nota.notaFinal.toFixed(1)}
            </span>
            <span className="block text-micro text-text-muted font-medium">
              Escala MEP 100
            </span>
          </div>

          <button
            type="button"
            aria-expanded={desplegado}
            aria-label={`${desplegado ? 'Ocultar' : 'Ver'} desglose de ${nota.materia}`}
            className="flex size-8.5 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-alt text-text-muted transition-colors hover:text-text hover:bg-border/40"
          >
            <IconoChevron
              hacia={desplegado ? 'arriba' : 'abajo'}
              className="size-4 transition-transform duration-200"
            />
          </button>
        </div>
      </div>

      {/* Barra de progreso de la nota */}
      <div className="w-full bg-surface-alt h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            nota.notaFinal >= 70
              ? 'bg-emerald-500'
              : nota.notaFinal >= 60
                ? 'bg-amber-500'
                : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, nota.notaFinal))}%` }}
        />
      </div>

      {/* Desglose Expandible de Rúbrica Oficial MEP */}
      {desplegado && (
        <div className="p-4 sm:p-5 border-t border-border/80 bg-surface-alt/40 animate-fade-in space-y-4">
          <div>
            <h4 className="text-micro font-bold text-text-muted uppercase tracking-wider mb-2.5">
              Desglose de Evaluación Oficial (Rúbrica MEP)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="rounded-xl border border-border bg-surface p-2.5">
                <span className="block text-micro text-text-muted font-semibold">Cotidiano</span>
                <span className="block text-dato font-bold text-text mt-0.5">
                  {nota.rubrica.trabajoCotidiano} pts
                </span>
              </div>
              <div className="rounded-xl border border-border bg-surface p-2.5">
                <span className="block text-micro text-text-muted font-semibold">Tareas</span>
                <span className="block text-dato font-bold text-text mt-0.5">
                  {nota.rubrica.tareas} pts
                </span>
              </div>
              <div className="rounded-xl border border-border bg-surface p-2.5">
                <span className="block text-micro text-text-muted font-semibold">Pruebas</span>
                <span className="block text-dato font-bold text-text mt-0.5">
                  {nota.rubrica.pruebas} pts
                </span>
              </div>
              <div className="rounded-xl border border-border bg-surface p-2.5">
                <span className="block text-micro text-text-muted font-semibold">Proyecto</span>
                <span className="block text-dato font-bold text-text mt-0.5">
                  {nota.rubrica.proyecto} pts
                </span>
              </div>
              <div className="rounded-xl border border-border bg-surface p-2.5 col-span-2 sm:col-span-1">
                <span className="block text-micro text-text-muted font-semibold">Asistencia</span>
                <span className="block text-dato font-bold text-text mt-0.5">
                  {nota.rubrica.asistencia} pts
                </span>
              </div>
            </div>
          </div>

          {/* Observaciones Formativas del Docente */}
          {nota.observaciones && (
            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3 text-menor text-text-muted">
              <IconoInfo className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <strong className="font-semibold text-text">Observación Pedagógica: </strong>
                <span>{nota.observaciones}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
