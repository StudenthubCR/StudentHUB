import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { guardarDatoUsuarioScoped, leerDatoUsuarioScoped } from '@/lib/offlineCache'
import { useSesion } from '@/features/auth/useSesion'
import {
  ESTUDIANTES_MASTER_DEMO,
  DOCENTE_DANGELO_DEMO,
} from '@/features/docente/docente.fixture'
import {
  ESTUDIANTE_DEMO,
  ESTUDIANTE_DEMO_2,
  ENCARGADO_DEMO,
  type Estudiante,
  type Encargado,
  type RolUsuario,
  type ModoPerspectiva,
} from './estudiante.fixture'
import { EstudianteContext, type EstadoEstudianteContexto } from './estudiante-context'

type GrupoFila = {
  codigo?: string
  nivel?: string
  jornada?: string
}

type InstitucionFila = {
  nombre?: string
  slug?: string
}

type FilaEstudianteRaw = {
  id?: string
  user_id?: string | null
  codigo?: string
  correo?: string
  nombre?: string
  especialidad?: string | null
  estado?: string | null
  seccion?: string | null
  foto_url?: string | null
  parentesco?: string | null
  grupos?: GrupoFila | GrupoFila[] | null
  instituciones?: InstitucionFila | InstitucionFila[] | null
}

type FilaEncargadoRaw = {
  id: string
  user_id?: string | null
  correo: string
  nombre_completo: string
  cedula?: string | null
  telefono?: string | null
  parentesco_por_defecto?: string | null
  activo: boolean
}

function extraerGrupo(grupos: FilaEstudianteRaw['grupos']): GrupoFila | null {
  if (!grupos) return null
  if (Array.isArray(grupos)) {
    return grupos[0] ?? null
  }
  return grupos
}

function extraerInstitucion(inst: FilaEstudianteRaw['instituciones']): InstitucionFila | null {
  if (!inst) return null
  if (Array.isArray(inst)) {
    return inst[0] ?? null
  }
  return inst
}

function formatearEstudiante(
  fila: FilaEstudianteRaw,
  nombreFallback?: string,
  parentesco?: string,
): Estudiante {
  const grupo = extraerGrupo(fila.grupos)
  const inst = extraerInstitucion(fila.instituciones)
  const nombreFinal = (fila.nombre || nombreFallback || 'Estudiante').trim()

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
    parentesco: parentesco || fila.parentesco || undefined,
  }
}

type ResultadoCargaPerfil = {
  rol: RolUsuario
  encargado: Encargado | null
  estudiantes: Estudiante[]
  esRespaldo: boolean
}

export function EstudianteProvider({ children }: { children: ReactNode }) {
  const { sesion, rol: rolSistema } = useSesion()
  const queryClient = useQueryClient()

  const [idEstudianteSeleccionado, setIdEstudianteSeleccionado] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studenthub_estudiante_activo_id')
    }
    return null
  })

  const [perspectiva, setPerspectivaState] = useState<ModoPerspectiva>(() => {
    if (typeof window !== 'undefined') {
      const guardada = localStorage.getItem('studenthub_perspectiva_vista')
      if (guardada === 'ambos' || guardada === 'estudiante' || guardada === 'encargado') {
        return guardada
      }
    }
    return 'ambos'
  })

  const cambiarPerspectiva = useCallback((nueva: ModoPerspectiva) => {
    setPerspectivaState(nueva)
    if (typeof window !== 'undefined') {
      localStorage.setItem('studenthub_perspectiva_vista', nueva)
      window.dispatchEvent(new CustomEvent('studenthub:perspectiva-cambiada', { detail: nueva }))
    }
  }, [])

  // Consulta unificada de perfil y rol del usuario
  const consulta = useQuery<ResultadoCargaPerfil>({
    queryKey: ['perfil-estudiante-o-encargado', sesion?.user.id ?? null, sesion?.user.email ?? null, rolSistema],
    enabled: Boolean(sesion) && rolSistema !== 'docente',
    staleTime: 1000 * 60 * 15,
    retry: 1,
    queryFn: async (): Promise<ResultadoCargaPerfil> => {
      if (!sesion?.user || rolSistema === 'docente') {
        return { rol: 'estudiante', encargado: null, estudiantes: [], esRespaldo: false }
      }

      const email = (sesion.user.email ?? '').trim().toLowerCase()
      const userId = sesion.user.id
      const esModoDemo =
        typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true'
      const rolDemo =
        typeof window !== 'undefined' ? localStorage.getItem('studenthub_demo_rol') : null
      const estudianteDemoId =
        typeof window !== 'undefined' ? localStorage.getItem('studenthub_demo_estudiante_id') : null

      // CASO A: Sesión Demo (Jueces / Expotécnica)
      if (
        esModoDemo ||
        userId === '00000000-0000-0000-0000-000000000001' ||
        userId === '00000000-0000-0000-0000-000000000002' ||
        userId === DOCENTE_DANGELO_DEMO.authUserId
      ) {
        if (rolDemo === 'docente' || userId === DOCENTE_DANGELO_DEMO.authUserId) {
          return {
            rol: 'estudiante',
            encargado: null,
            estudiantes: [],
            esRespaldo: false,
          }
        }
        if (rolDemo === 'encargado' || userId === '00000000-0000-0000-0000-000000000002') {
          return {
            rol: 'encargado',
            encargado: ENCARGADO_DEMO,
            estudiantes: [ESTUDIANTE_DEMO, ESTUDIANTE_DEMO_2],
            esRespaldo: false,
          }
        }
        const seleccionado = estudianteDemoId
          ? ESTUDIANTES_MASTER_DEMO.find((e) => e.id === estudianteDemoId) ?? ESTUDIANTE_DEMO
          : ESTUDIANTE_DEMO
        return {
          rol: 'estudiante',
          encargado: null,
          estudiantes: [seleccionado],
          esRespaldo: false,
        }
      }

      // CASO B: Cuenta oficial de Administración
      if (email === 'studenthub.cr@gmail.com') {
        const adminEstudiante: Estudiante = {
          id: '00000000-0000-0000-0000-000000000099',
          nombre: 'Administración StudentHUB',
          codigo: 'ADMIN-01',
          especialidad: 'Administración General',
          institucion: 'Colegio Técnico Profesional',
          siglaInstitucion: 'CTP',
          grupo: 'ADMIN',
          seccion: 'ADMIN',
          nivel: 'Personal Administrativo',
          jornada: 'Nocturna',
          vigencia: `Ciclo Lectivo ${new Date().getFullYear()}`,
          fotoUrl: '',
          activo: true,
        }
        return {
          rol: 'estudiante',
          encargado: null,
          estudiantes: [adminEstudiante],
          esRespaldo: false,
        }
      }

      const estaOffline =
        typeof navigator !== 'undefined' &&
        typeof navigator.onLine === 'boolean' &&
        !navigator.onLine
      const perfilCacheado = leerDatoUsuarioScoped<ResultadoCargaPerfil>(
        userId,
        'perfil_estudiante',
      )?.data

      if (estaOffline && perfilCacheado && !perfilCacheado.esRespaldo) {
        return perfilCacheado
      }

      try {
        // 1. Verificar si el usuario autenticado es un Encargado Legal
        let filaEncargado: FilaEncargadoRaw | null = null

        if (userId) {
          const { data } = await supabase
            .from('encargados')
            .select('id, user_id, correo, nombre_completo, cedula, telefono, parentesco_por_defecto, activo')
            .eq('user_id', userId)
            .eq('activo', true)
            .maybeSingle<FilaEncargadoRaw>()
          if (data) filaEncargado = data
        }

        if (!filaEncargado && email) {
          const { data } = await supabase
            .from('encargados')
            .select('id, user_id, correo, nombre_completo, cedula, telefono, parentesco_por_defecto, activo')
            .ilike('correo', email)
            .eq('activo', true)
            .maybeSingle<FilaEncargadoRaw>()
          if (data) filaEncargado = data
        }

        // Si se encontró como encargado legal, cargar sus estudiantes vinculados
        if (filaEncargado) {
          const encargadoObj: Encargado = {
            id: filaEncargado.id,
            user_id: filaEncargado.user_id || undefined,
            correo: filaEncargado.correo,
            nombreCompleto: filaEncargado.nombre_completo,
            cedula: filaEncargado.cedula || undefined,
            telefono: filaEncargado.telefono || undefined,
            parentesco: filaEncargado.parentesco_por_defecto || 'Encargado Legal',
            activo: filaEncargado.activo,
          }

          // Consultar vínculos con estudiantes
          const { data: vinculos } = await supabase
            .from('encargado_estudiante')
            .select(`
              parentesco,
              estudiantes (
                id, codigo, correo, nombre, especialidad, estado,
                grupos (codigo, nivel, jornada),
                instituciones (nombre, slug)
              )
            `)
            .eq('encargado_id', filaEncargado.id)
            .eq('activo', true)

          const listaEstudiantes: Estudiante[] = []
          if (vinculos && Array.isArray(vinculos)) {
            for (const v of vinculos) {
              const estRaw = v.estudiantes as unknown as FilaEstudianteRaw | null
              if (estRaw) {
                listaEstudiantes.push(
                  formatearEstudiante(estRaw, undefined, (v.parentesco as string) || undefined),
                )
              }
            }
          }

          if (listaEstudiantes.length > 0) {
            const resultadoEncargado: ResultadoCargaPerfil = {
              rol: 'encargado',
              encargado: encargadoObj,
              estudiantes: listaEstudiantes,
              esRespaldo: false,
            }
            guardarDatoUsuarioScoped(userId, 'perfil_estudiante', resultadoEncargado)
            return resultadoEncargado
          }
        }

        // 2. Si no es encargado, consultar como Estudiante directo
        let filaEstudiante: FilaEstudianteRaw | null = null

        if (userId) {
          const { data } = await supabase
            .from('estudiantes')
            .select('id, codigo, correo, nombre, especialidad, estado, grupos(codigo, nivel, jornada), instituciones(nombre, slug)')
            .eq('user_id', userId)
            .maybeSingle<FilaEstudianteRaw>()
          if (data) filaEstudiante = data
        }

        if (!filaEstudiante && email) {
          const { data } = await supabase
            .from('estudiantes')
            .select('id, codigo, correo, nombre, especialidad, estado, grupos(codigo, nivel, jornada), instituciones(nombre, slug)')
            .ilike('correo', email)
            .maybeSingle<FilaEstudianteRaw>()
          if (data) filaEstudiante = data
        }

        if (filaEstudiante) {
          const est = formatearEstudiante(filaEstudiante, sesion.user.user_metadata?.full_name)
          const resultadoEst: ResultadoCargaPerfil = {
            rol: 'estudiante',
            encargado: null,
            estudiantes: [est],
            esRespaldo: false,
          }
          guardarDatoUsuarioScoped(userId, 'perfil_estudiante', resultadoEst)
          return resultadoEst
        }

        if (perfilCacheado && !perfilCacheado.esRespaldo) {
          return perfilCacheado
        }

        // 3. Respaldo defensivo con datos de sesión
        const respaldo: Estudiante = {
          id: sesion.user.id,
          user_id: sesion.user.id,
          nombre: (sesion.user.user_metadata?.full_name || email.split('@')[0] || 'Estudiante').trim(),
          correo: email,
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
        return {
          rol: 'estudiante',
          encargado: null,
          estudiantes: [respaldo],
          esRespaldo: true,
        }
      } catch (err) {
        if (perfilCacheado && !perfilCacheado.esRespaldo) {
          return perfilCacheado
        }
        console.warn('Excepción controlada en EstudianteProvider, usando respaldo:', err)
        const respaldo: Estudiante = {
          id: sesion.user.id,
          user_id: sesion.user.id,
          nombre: (sesion.user.user_metadata?.full_name || email.split('@')[0] || 'Estudiante').trim(),
          correo: email,
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
        return {
          rol: 'estudiante',
          encargado: null,
          estudiantes: [respaldo],
          esRespaldo: true,
        }
      }
    },
  })

  const datos = consulta.data
  const rolActivo: RolUsuario = datos?.rol ?? 'estudiante'
  const encargado = datos?.encargado ?? null
  const estudiantesVinculados = useMemo(() => datos?.estudiantes ?? [], [datos?.estudiantes])

  // Determinar el estudiante activo:
  // Si hay una selección previa guardada y válida en la lista, usarla; si no, el primero.
  const estudianteActivo = useMemo<Estudiante | null>(() => {
    if (estudiantesVinculados.length === 0) return null
    if (idEstudianteSeleccionado) {
      const encontrado = estudiantesVinculados.find((e) => e.id === idEstudianteSeleccionado)
      if (encontrado) return encontrado
    }
    return estudiantesVinculados[0] ?? null
  }, [estudiantesVinculados, idEstudianteSeleccionado])

  const seleccionarEstudiante = useCallback(
    (id: string) => {
      setIdEstudianteSeleccionado(id)
      if (typeof window !== 'undefined') {
        localStorage.setItem('studenthub_estudiante_activo_id', id)
      }
      // Invalidar consultas dependientes del estudiante
      void queryClient.invalidateQueries({ queryKey: ['horarios'] })
      void queryClient.invalidateQueries({ queryKey: ['comedor'] })
      void queryClient.invalidateQueries({ queryKey: ['confirmacion-comedor'] })
      void queryClient.invalidateQueries({ queryKey: ['avisos'] })
      void queryClient.invalidateQueries({ queryKey: ['estudiante-notas'] })
      void queryClient.invalidateQueries({ queryKey: ['estudiante-asistencias'] })
    },
    [queryClient],
  )

  const alternarRolDemo = useCallback(
    (nuevoRol: RolUsuario) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('studenthub_demo_sesion', 'true')
        localStorage.setItem('studenthub_demo_rol', nuevoRol)
        localStorage.removeItem('studenthub_estudiante_activo_id')
        window.location.reload()
      }
    },
    [],
  )

  const estaCargando = Boolean(sesion) && rolSistema !== 'docente' && (consulta.isPending || consulta.isLoading)
  const fueraDelPadron =
    Boolean(sesion) &&
    rolSistema !== 'docente' &&
    !estaCargando &&
    (Boolean(datos?.esRespaldo) || estudiantesVinculados.length === 0)

  const esModoDemoEncargado =
    typeof window !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true' &&
    localStorage.getItem('studenthub_demo_rol') === 'encargado'

  const valor = useMemo<EstadoEstudianteContexto>(
    () => ({
      perspectiva,
      cambiarPerspectiva,
      rolActivo,
      encargado,
      estudiantesVinculados,
      estudianteActivo,
      estudiante: estudianteActivo,
      seleccionarEstudiante,
      cargando: estaCargando,
      fueraDelPadron,
      error: consulta.error,
      esModoDemoEncargado,
      alternarRolDemo,
    }),
    [
      perspectiva,
      cambiarPerspectiva,
      rolActivo,
      encargado,
      estudiantesVinculados,
      estudianteActivo,
      seleccionarEstudiante,
      estaCargando,
      fueraDelPadron,
      consulta.error,
      esModoDemoEncargado,
      alternarRolDemo,
    ],
  )

  return <EstudianteContext value={valor}>{children}</EstudianteContext>
}
