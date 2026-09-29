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
  user_id?: string | null
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
    user_id: fila.user_id || undefined,
    correo: fila.correo || undefined,
    nombre: nombreFinal,
    codigo: fila.codigo || '0000',
    especialidad: fila.especialidad ?? '',
    institucion: inst?.nombre ?? 'Colegio Técnico Profesional',
    siglaInstitucion: (inst?.slug ?? 'CTP').toUpperCase(),
    grupo: grupo?.codigo || fila.seccion || '12-1',
    seccion: grupo?.codigo || fila.seccion || '12-1',
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
        let filaEncontrada: FilaEstudiante | null = null

        // 1. Prioridad: Consulta por user_id directo si existe
        if (userId) {
          const res = await supabase
            .from('estudiantes')
            .select('id, codigo, correo, nombre, especialidad, estado, grupos(codigo, nivel, jornada), instituciones(nombre, slug)')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle<FilaEstudiante>()

          if (!res.error && res.data) {
            filaEncontrada = res.data
          }
        }

        // 2. Alternativa: Consulta por correo institucional exacto
        if (!filaEncontrada && email) {
          const res = await supabase
            .from('estudiantes')
            .select('id, codigo, correo, nombre, especialidad, estado, grupos(codigo, nivel, jornada), instituciones(nombre, slug)')
            .ilike('correo', email)
            .limit(1)
            .maybeSingle<FilaEstudiante>()

          if (!res.error && res.data) {
            filaEncontrada = res.data
          }
        }

        // 3. Fallback defensivo sin joins (en caso de que grupos o instituciones tengan problemas de RLS o esquema)
        if (!filaEncontrada) {
          if (userId) {
            const resSimple = await supabase
              .from('estudiantes')
              .select('id, codigo, correo, nombre, especialidad, estado')
              .eq('user_id', userId)
              .limit(1)
              .maybeSingle<FilaEstudiante>()

            if (!resSimple.error && resSimple.data) {
              filaEncontrada = resSimple.data
            }
          }

          if (!filaEncontrada && email) {
            const resSimple = await supabase
              .from('estudiantes')
              .select('id, codigo, correo, nombre, especialidad, estado')
              .ilike('correo', email)
              .limit(1)
              .maybeSingle<FilaEstudiante>()

            if (!resSimple.error && resSimple.data) {
              filaEncontrada = resSimple.data
            }
          }
        }

        if (filaEncontrada) {
          return aEstudiante(filaEncontrada, sesion.user.user_metadata?.full_name)
        }

        // Respaldo resiliente automático con la información de la sesión
        // La aplicación debe abrir y funcionar con estos datos base mientras se conecta con la base de datos
        return {
          id: sesion.user.id,
          user_id: sesion.user.id,
          nombre: (sesion.user.user_metadata?.full_name || sesion.user.email?.split('@')[0] || 'Estudiante').trim(),
          correo: sesion.user.email || '',
          codigo: '2026-CTP',
          especialidad: 'Sección Nocturna',
          grupo: '12-1',
          seccion: '12-1',
          institucion: 'Colegio Técnico Profesional',
          siglaInstitucion: 'CTP',
          nivel: '12',
          jornada: 'Nocturna',
          vigencia: `Ciclo Lectivo ${new Date().getFullYear()}`,
          fotoUrl: '',
          activo: true,
          esRespaldo: true,
        }
      } catch (err) {
        console.warn('Excepción controlada en useEstudiante, usando respaldo:', err)
        return {
          id: sesion.user.id,
          user_id: sesion.user.id,
          nombre: (sesion.user.user_metadata?.full_name || sesion.user.email?.split('@')[0] || 'Estudiante').trim(),
          correo: sesion.user.email || '',
          codigo: '2026-CTP',
          especialidad: 'Sección Nocturna',
          grupo: '12-1',
          seccion: '12-1',
          institucion: 'Colegio Técnico Profesional',
          siglaInstitucion: 'CTP',
          nivel: '12',
          jornada: 'Nocturna',
          vigencia: `Ciclo Lectivo ${new Date().getFullYear()}`,
          fotoUrl: '',
          activo: true,
          esRespaldo: true,
        }
      }
    },
  })

  const estaCargando = Boolean(sesion) && (consulta.isPending || consulta.isLoading)
  const fueraDelPadron = Boolean(sesion) && !estaCargando && (Boolean(consulta.data?.esRespaldo) || !consulta.data)

  return {
    estudiante: consulta.data ?? null,
    cargando: estaCargando,
    fueraDelPadron,
    error: consulta.error,
  }
}
