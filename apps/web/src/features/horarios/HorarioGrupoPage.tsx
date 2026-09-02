import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageSection } from '@/components/PageSection'
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
  // Se actualiza cada minuto: el marcador de "ahora" tiene que seguir siendo
  // cierto si la app queda abierta durante la lección.
  const ahora = useReloj()

  const { dias, lecciones, cargando, error, reintentar } = useHorario(grado?.grupo ?? null, ahora)

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
            Por ahora la hoja sólo tiene cargado el grupo 11-2.
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
      <HorarioDelGrupo
        titulo={`${etiquetaDeGrado(grado)} — Grupo ${grado.grupo}`}
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
