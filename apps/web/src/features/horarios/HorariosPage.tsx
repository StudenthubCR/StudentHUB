import { useCallback } from 'react'
import { PageSection } from '@/components/PageSection'
import { PantallaDeAviso } from '@/components/PantallaDeAviso'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { useReloj } from '@/lib/useReloj'
import { HorarioDelGrupo } from './components/HorarioDelGrupo'
import { buscarGradoPorGrupo, etiquetaDeGrado } from './grados'
import { ErrorHorarios } from './horarios.api'
import { useHorario } from './useHorario'

function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorHorarios) return error.message
  return 'Revisá tu conexión e intentá de nuevo.'
}

export function HorariosPage() {
  const { sesion, cargando: cargandoSesion } = useSesion()
  const { estudiante, cargando: cargandoEstudiante, fueraDelPadron } = useEstudiante()
  const ahora = useReloj()

  if (cargandoSesion || cargandoEstudiante) return null

  if (!sesion) {
    return (
      <PageSection titulo="Mi Horario de Clases">
        <PantallaDeAviso
          titulo="Necesitás iniciar sesión"
          descripcion="Tu horario de clases está vinculado a tu sección. Ingresá con tu correo estudiantil para ver tus materias y lecciones."
          accion={{ texto: 'Iniciar sesión', a: '/entrar' }}
        />
      </PageSection>
    )
  }

  if (fueraDelPadron || !estudiante || !estudiante.grupo) {
    return (
      <PageSection titulo="Mi Horario de Clases">
        <PantallaDeAviso
          titulo="Sin sección asignada"
          descripcion="Tu cuenta de estudiante no tiene una sección o grupo registrado en el padrón. Consultá con la secretaría o administración del colegio."
          accion={{ texto: 'Ir al inicio', a: '/' }}
        />
      </PageSection>
    )
  }

  return <HorarioEstudiante grupo={estudiante.grupo} ahora={ahora} />
}

function HorarioEstudiante({ grupo, ahora }: { grupo: string; ahora: Date }) {
  const grado = buscarGradoPorGrupo(grupo)
  const { dias, lecciones, cargando, error, reintentar } = useHorario(grupo, ahora)

  const onReintentar = useCallback(() => {
    void reintentar()
  }, [reintentar])

  const titulo = grado ? `${etiquetaDeGrado(grado)} — Grupo ${grupo}` : `Grupo ${grupo}`

  return (
    <PageSection titulo="Mi Horario de Clases">
      <HorarioDelGrupo
        titulo={titulo}
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
