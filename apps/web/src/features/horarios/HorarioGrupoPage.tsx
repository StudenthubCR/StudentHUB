import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageSection } from '@/components/PageSection'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { cn } from '@/lib/cn'
import { useReloj } from '@/lib/useReloj'
import { HorarioDelGrupo } from './components/HorarioDelGrupo'
import { buscarGrado, etiquetaDeGrado } from './grados'
import { ErrorHorarios } from './horarios.api'
import { useHorario } from './useHorario'

function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorHorarios) return error.message
  return 'Revisá tu conexión e intentá de nuevo.'
}

export function HorarioGrupoPage() {
  const { grado: idGrado } = useParams()
  const grado = buscarGrado(idGrado)
  const { estudiante } = useEstudiante()
  const ahora = useReloj()

  // Si el estudiante logueado pertenece a este grado, sugerir su grupo automáticamente
  const grupoPorDefecto =
    (grado && estudiante && grado.grupos.includes(estudiante.grupo) ? estudiante.grupo : null) ??
    grado?.grupo ??
    null

  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(grupoPorDefecto)

  useEffect(() => {
    if (grado) {
      const g =
        (estudiante && grado.grupos.includes(estudiante.grupo) ? estudiante.grupo : null) ??
        grado.grupo ??
        null
      setGrupoSeleccionado(g)
    }
  }, [grado, estudiante?.grupo])

  const grupoActivo = grupoSeleccionado ?? grado?.grupo ?? null
  const { dias, lecciones, cargando, error, reintentar } = useHorario(grupoActivo, ahora)

  const onReintentar = useCallback(() => {
    void reintentar()
  }, [reintentar])

  // Grado inexistente o todavía sin horario en la hoja: se dice, no se
  // disimula con una pantalla vacía.
  if (!grado || !grado.grupo) {
    return (
      <PageSection titulo="Horarios de Clases" volverA="/horarios">
        <div className="rounded-lg border border-border bg-surface p-8 text-center elev-md">
          <p className="text-cuerpo font-semibold text-text">
            {grado
              ? `El horario de ${etiquetaDeGrado(grado)} todavía no está publicado.`
              : 'Ese grado no existe.'}
          </p>
          <p className="mt-2 text-menor text-text-muted">
            Por ahora no hay horarios cargados para este grado.
          </p>
          <Link
            to="/horarios"
            className={
              'mt-4 inline-block rounded-full bg-primary-solid px-5 py-2.5 text-menor ' +
              'font-semibold text-white transition-transform duration-250 active:scale-95'
            }
          >
            Elegir otro grado
          </Link>
        </div>
      </PageSection>
    )
  }

  return (
    <PageSection titulo="Horarios de Clases" volverA="/horarios">
      {grado.grupos.length > 1 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-menor font-medium text-text-muted">Grupos:</span>
          {grado.grupos.map((g) => {
            const esActivo = grupoActivo === g
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGrupoSeleccionado(g)}
                className={cn(
                  'cursor-pointer rounded-full px-3.5 py-1 text-menor font-semibold transition-all duration-200',
                  esActivo
                    ? 'bg-primary-solid text-white shadow-sm'
                    : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-text',
                )}
              >
                Grupo {g}
              </button>
            )
          })}
        </div>
      )}

      <HorarioDelGrupo
        titulo={`${etiquetaDeGrado(grado)} — Grupo ${grupoActivo}`}
        lecciones={lecciones}
        dias={dias}
        ahora={ahora}
        cargando={cargando}
        error={error ? mensajeDeError(error) : null}
        onReintentar={onReintentar}
      />
    </PageSection>
  )
}
