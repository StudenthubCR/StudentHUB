import { supabase } from '@/lib/supabase'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import type { InstitutionAlert, NuevoAvisoPayload } from './avisos.types'

const CLAVE_STORAGE = 'studenthub_avisos_institucionales_v1'
const CLAVE_DESCARTADOS = 'studenthub_avisos_descartados_v1'

export const ESPECIALIDADES_CTP = [
  'Desarrollo Web',
  'Contabilidad',
  'Electromecánica',
  'Secretariado Ejecutivo',
  'Ciberseguridad',
  'Administración Logística',
  'Diseño Publicitario',
] as const

export const SECCIONES_CTP = [
  '10-1',
  '10-2',
  '10-3',
  '11-1',
  '11-2',
  '11-3',
  '12-1',
  '12-2',
  '12-3',
] as const

export const AVISOS_SEMILLAS: InstitutionAlert[] = [
  {
    id: 'aviso-urgente-salida',
    title: 'Salida anticipada este viernes a las 2:00 PM',
    message:
      'Por motivo de Consejo General de Profesores y capacitación técnica, la jornada diurna finalizará a las 2:00 PM para todas las especialidades.',
    category: 'early_departure',
    priority: 'warning',
    target_type: 'all',
    target_values: [],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    expires_at: null,
    active: true,
  },
  {
    id: 'aviso-ausencia-web',
    title: 'Ausencia docente: Programación Web (Sección 11-1)',
    message:
      'El docente a cargo se encuentra en comisión oficial. La sección 11-1 tendrá horas de estudio y práctica libre en biblioteca y laboratorios.',
    category: 'absence',
    priority: 'urgent',
    target_type: 'section',
    target_values: ['11-1'],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    expires_at: null,
    active: true,
  },
  {
    id: 'aviso-comedor-menu',
    title: 'Menú especial: Picadillo de papa con carne mechada',
    message:
      'Por recepción de ingredientes frescos en cocina estudiantil, hoy se servirá picadillo de papa con carne mechada y fresco natural de cas.',
    category: 'menu_change',
    priority: 'info',
    target_type: 'all',
    target_values: [],
    created_by: 'cocina@mep.go.cr',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    expires_at: null,
    active: true,
  },
]

export async function obtenerAvisos(): Promise<InstitutionAlert[]> {
  try {
    const { data, error } = await supabase
      .from('institution_alerts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(data))
      }
      return data as InstitutionAlert[]
    }
  } catch {
    // Si la tabla no está creada aún o falla la red, usar almacenamiento local
  }

  return cargarAvisosLocales()
}

export function cargarAvisosLocales(): InstitutionAlert[] {
  if (typeof window === 'undefined') return AVISOS_SEMILLAS
  try {
    const guardados = localStorage.getItem(CLAVE_STORAGE)
    if (!guardados) {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(AVISOS_SEMILLAS))
      return AVISOS_SEMILLAS
    }
    return JSON.parse(guardados) as InstitutionAlert[]
  } catch {
    return AVISOS_SEMILLAS
  }
}

export async function crearAviso(
  payload: NuevoAvisoPayload,
  creadoPor: string,
): Promise<{ ok: boolean; aviso: InstitutionAlert }> {
  const nuevoAviso: InstitutionAlert = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `aviso-${Date.now()}`,
    title: payload.title.trim(),
    message: payload.message.trim(),
    category: payload.category,
    priority: payload.priority,
    target_type: payload.target_type,
    target_values: payload.target_type === 'all' ? [] : payload.target_values,
    created_by: creadoPor || 'studenthub.cr@gmail.com',
    created_at: new Date().toISOString(),
    expires_at: payload.expires_at || null,
    active: true,
  }

  try {
    const { data, error } = await supabase
      .from('institution_alerts')
      .insert([nuevoAviso])
      .select()
      .maybeSingle()

    if (!error && data) {
      nuevoAviso.id = data.id
    }
  } catch {
    // Respaldo
  }

  if (typeof window !== 'undefined') {
    const actuales = cargarAvisosLocales()
    const actualizados = [nuevoAviso, ...actuales]
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(actualizados))
    window.dispatchEvent(new CustomEvent('studenthub:avisos-actualizados'))
  }

  return { ok: true, aviso: nuevoAviso }
}

export function descartarAvisoLocal(id: string) {
  if (typeof window === 'undefined') return
  try {
    const descartados = obtenerAvisosDescartados()
    if (!descartados.includes(id)) {
      descartados.push(id)
      localStorage.setItem(CLAVE_DESCARTADOS, JSON.stringify(descartados))
      window.dispatchEvent(new CustomEvent('studenthub:avisos-actualizados'))
    }
  } catch {
    // Silencioso
  }
}

export function obtenerAvisosDescartados(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE_DESCARTADOS)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export async function eliminarAviso(id: string): Promise<boolean> {
  try {
    await supabase.from('institution_alerts').delete().eq('id', id)
  } catch {
    // Silencioso
  }

  if (typeof window !== 'undefined') {
    const actuales = cargarAvisosLocales().filter((a) => a.id !== id)
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(actuales))
    window.dispatchEvent(new CustomEvent('studenthub:avisos-actualizados'))
  }

  return true
}

export function filtrarAvisosParaEstudiante(
  avisos: InstitutionAlert[],
  estudiante: Estudiante | null,
  descartadosIds: string[],
  esAdmin = false,
): InstitutionAlert[] {
  const ahora = new Date()

  return avisos.filter((aviso) => {
    if (!aviso.active) return false

    if (aviso.expires_at && new Date(aviso.expires_at) < ahora) {
      return false
    }

    if (esAdmin) return true

    if (descartadosIds.includes(aviso.id)) {
      return false
    }

    if (aviso.target_type === 'all') {
      return true
    }

    if (aviso.target_type === 'specialty') {
      if (!estudiante?.especialidad) return false
      const esp = estudiante.especialidad.trim().toLowerCase()
      return aviso.target_values.some((val) => val.trim().toLowerCase() === esp)
    }

    if (aviso.target_type === 'section') {
      if (!estudiante?.grupo) return false
      const sec = estudiante.grupo.trim().toLowerCase()
      return aviso.target_values.some((val) => val.trim().toLowerCase() === sec)
    }

    return false
  })
}

export function formatearTiempoAviso(isoString: string): string {
  try {
    const fecha = new Date(isoString)
    const diffMs = Date.now() - fecha.getTime()
    const diffMin = Math.floor(diffMs / (1000 * 60))

    if (diffMin < 1) return 'Justo ahora'
    if (diffMin < 60) return `Hace ${diffMin} min`
    const diffHoras = Math.floor(diffMin / 60)
    if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`
    const diffDias = Math.floor(diffHoras / 24)
    if (diffDias === 1) return 'Ayer'
    return `Hace ${diffDias} días`
  } catch {
    return 'Reciente'
  }
}
