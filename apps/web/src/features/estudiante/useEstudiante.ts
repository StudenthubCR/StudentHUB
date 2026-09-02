import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSesion } from '@/features/auth/useSesion'
import type { Estudiante } from './estudiante.fixture'

type FilaEstudiante = {
  codigo: string
  correo: string
  nombre: string
  especialidad: string | null
  estado: string
  grupos: { codigo: string; nivel: string; jornada: string } | null
  instituciones: { nombre: string; slug: string } | null
}

function aEstudiante(fila: FilaEstudiante): Estudiante {
  return {
    nombre: fila.nombre,
    codigo: fila.codigo,
    especialidad: fila.especialidad ?? '',
    institucion: fila.instituciones?.nombre ?? '',
    siglaInstitucion: (fila.instituciones?.slug ?? '').toUpperCase(),
    grupo: fila.grupos?.codigo ?? '',
    nivel: fila.grupos?.nivel ?? '',
    jornada: fila.grupos?.jornada ?? '',
    vigencia: `Ciclo Lectivo ${new Date().getFullYear()}`,
    // La foto vive en un bucket privado y se sirve con URL firmada. Hasta que
    // eso exista, se usa el avatar genérico.
    fotoUrl: '/student.webp',
    activo: fila.estado === 'activo',
  }
}

/**
 * La ficha del estudiante con la sesión abierta.
 *
 * No hace falta filtrar por usuario en la consulta: la política de RLS ya sólo
 * deja ver la fila propia. Si alguien entra con un correo que no está en el
 * padrón, la consulta devuelve vacío y la app lo trata como no matriculado —
 * que es exactamente lo que es.
 */
export function useEstudiante() {
  const { sesion } = useSesion()

  const consulta = useQuery({
    queryKey: ['estudiante', sesion?.user.id ?? null],
    enabled: Boolean(sesion),
    staleTime: 1000 * 60 * 30,
    queryFn: async (): Promise<Estudiante | null> => {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('codigo, correo, nombre, especialidad, estado, grupos(codigo, nivel, jornada), instituciones(nombre, slug)')
        .maybeSingle<FilaEstudiante>()

      if (error) throw error
      return data ? aEstudiante(data) : null
    },
  })

  return {
    estudiante: consulta.data ?? null,
    cargando: Boolean(sesion) && consulta.isPending,
    /** Entró con una cuenta que no corresponde a ningún estudiante del padrón. */
    fueraDelPadron: Boolean(sesion) && !consulta.isPending && !consulta.error && !consulta.data,
    error: consulta.error,
  }
}
