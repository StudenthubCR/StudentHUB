import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSesion } from '@/features/auth/useSesion'
import { ESTUDIANTE_DEMO, type Estudiante } from './estudiante.fixture'

type GrupoFila = {
  codigo?: string
  nivel?: string
  jornada?: string
}

type InstitucionFila = {
  nombre?: string
  slug?: string
}

type FilaEstudiante = {
  id?: string
  codigo?: string
  correo?: string
  nombre?: string
  especialidad?: string | null
  estado?: string | null
  seccion?: string | null
  foto_url?: string | null
  grupos?: GrupoFila | GrupoFila[] | null
  instituciones?: InstitucionFila | InstitucionFila[] | null
}

function extraerGrupo(grupos: FilaEstudiante['grupos']): GrupoFila | null {
  if (!grupos) return null
  if (Array.isArray(grupos)) {
    return grupos[0] ?? null
  }
  return grupos
}

function extraerInstitucion(inst: FilaEstudiante['instituciones']): InstitucionFila | null {
  if (!inst) return null
  if (Array.isArray(inst)) {
    return inst[0] ?? null
  }
  return inst
}

function aEstudiante(
  fila: FilaEstudiante,
  sesionNombre?: string,
): Estudiante {
  const grupo = extraerGrupo(fila.grupos)
  const inst = extraerInstitucion(fila.instituciones)

  const nombreFinal = (fila.nombre || sesionNombre || 'Estudiante').trim()

  return {
    id: fila.id || fila.codigo || 'estudiante-id',
    nombre: nombreFinal,
    codigo: fila.codigo || '0000',
    especialidad: fila.especialidad ?? '',
    institucion: inst?.nombre ?? 'Colegio Técnico Profesional',
    siglaInstitucion: (inst?.slug ?? 'CTP').toUpperCase(),
    grupo: grupo?.codigo || fila.seccion || '12-1',
    nivel: grupo?.nivel ?? '12',
    jornada: grupo?.jornada ?? 'Nocturna',
    vigencia: `Ciclo Lectivo ${new Date().getFullYear()}`,
    fotoUrl: fila.foto_url || '',
    activo: fila.estado === 'activo' || !fila.estado,
  }
}

/**
 * Consulta la ficha del estudiante con sesión abierta de forma altamente resiliente.
 * Captura posibles bloqueos de RLS o ausencia de registro en el padrón sin quebrar el render.
 */
export function useEstudiante() {
  const { sesion } = useSesion()

  const consulta = useQuery({
    queryKey: ['estudiante', sesion?.user.id ?? null, sesion?.user.email ?? null],
    enabled: Boolean(sesion),
    staleTime: 1000 * 60 * 30,
    retry: 1,
    queryFn: async (): Promise<Estudiante | null> => {
      if (!sesion?.user) return null

      // Cuenta demo para jurado y evaluación
      if (sesion.user.id === '00000000-0000-0000-0000-000000000001') {
        return ESTUDIANTE_DEMO
      }

      // Cuenta oficial del Administrador
      if (sesion.user.email === 'studenthub.cr@gmail.com') {
        return {
          id: '00000000-0000-0000-0000-000000000099',
          nombre: 'Administración StudentHUB',
          codigo: 'ADMIN-01',
          especialidad: 'Administración General',
          institucion: 'Colegio Técnico Profesional',
          siglaInstitucion: 'CTP',
          grupo: 'ADMIN',
          nivel: 'Personal Administrativo',
          jornada: 'Nocturna',
          vigencia: `Ciclo Lectivo ${new Date().getFullYear()}`,
          fotoUrl: '',
          activo: true,
        }
      }

      const email = (sesion.user.email ?? '').trim().toLowerCase()
      const userId = sesion.user.id

      try {
        // Consulta prioritaria con joins
        let query = supabase
          .from('estudiantes')
          .select('id, codigo, correo, nombre, especialidad, estado, grupos(codigo, nivel, jornada), instituciones(nombre, slug)')

        if (userId && email) {
          query = query.or(`user_id.eq.${userId},correo.ilike.${email}`)
        } else if (userId) {
          query = query.eq('user_id', userId)
        } else if (email) {
          query = query.ilike('correo', email)
        }

        const { data, error } = await query.limit(1).maybeSingle<FilaEstudiante>()

        if (error) {
          console.warn('Aviso al consultar perfil en estudiantes con joins:', error.message)
          // Fallback a consulta simple sobre tabla estudiantes si el join fallase
          let querySimple = supabase
            .from('estudiantes')
            .select('id, codigo, correo, nombre, especialidad, estado')

          if (userId && email) {
            querySimple = querySimple.or(`user_id.eq.${userId},correo.ilike.${email}`)
          } else if (email) {
            querySimple = querySimple.ilike('correo', email)
          }

          const { data: dataSimple, error: errorSimple } = await querySimple.limit(1).maybeSingle<FilaEstudiante>()
          if (!errorSimple && dataSimple) {
            return aEstudiante(dataSimple, sesion.user.user_metadata?.full_name)
          }
          return null
        }

        return data ? aEstudiante(data, sesion.user.user_metadata?.full_name) : null
      } catch (err) {
        console.warn('Excepción controlada en useEstudiante:', err)
        return null
      }
    },
  })

  const estaCargando = Boolean(sesion) && (consulta.isPending || consulta.isLoading)
  const fueraDelPadron = Boolean(sesion) && !estaCargando && !consulta.data

  return {
    estudiante: consulta.data ?? null,
    cargando: estaCargando,
    fueraDelPadron,
    error: consulta.error,
  }
}
