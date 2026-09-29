import { describe, expect, it } from 'vitest'
import {
  filtrarAvisosParaEstudiante,
  formatearTiempoAviso,
  esUsuarioAdmin,
} from './avisos.service'
import type { InstitutionAlert } from './avisos.types'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'

const ESTUDIANTE_TEST: Estudiante = {
  nombre: 'Erick García',
  codigo: '208520530',
  especialidad: 'Desarrollo Web',
  institucion: 'CTP',
  siglaInstitucion: 'CTP',
  grupo: '11-1',
  nivel: 'Undécimo',
  jornada: 'Diurna',
  vigencia: '2026',
  fotoUrl: '',
  activo: true,
}

const AVISOS_FIXTURE: InstitutionAlert[] = [
  {
    id: '1',
    title: 'Salida General',
    message: 'Salida para todos',
    category: 'early_departure',
    priority: 'warning',
    target_type: 'all',
    target_values: [],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date().toISOString(),
    expires_at: null,
    active: true,
  },
  {
    id: '2',
    title: 'Aviso para Desarrollo Web',
    message: 'Solo para informática y web',
    category: 'event',
    priority: 'info',
    target_type: 'specialty',
    target_values: ['Desarrollo Web'],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date().toISOString(),
    expires_at: null,
    active: true,
  },
  {
    id: '3',
    title: 'Aviso para Contabilidad',
    message: 'Solo contables',
    category: 'event',
    priority: 'info',
    target_type: 'specialty',
    target_values: ['Contabilidad'],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date().toISOString(),
    expires_at: null,
    active: true,
  },
  {
    id: '4',
    title: 'Aviso Sección 11-1',
    message: 'Ausencia en 11-1',
    category: 'absence',
    priority: 'urgent',
    target_type: 'section',
    target_values: ['11-1'],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date().toISOString(),
    expires_at: null,
    active: true,
  },
  {
    id: '5',
    title: 'Aviso Sección 12-2',
    message: 'Ausencia en 12-2',
    category: 'absence',
    priority: 'urgent',
    target_type: 'section',
    target_values: ['12-2'],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date().toISOString(),
    expires_at: null,
    active: true,
  },
]

describe('Seguridad de Roles: esUsuarioAdmin', () => {
  it('solo otorga rol administrador a studenthub.cr@gmail.com', () => {
    expect(esUsuarioAdmin('studenthub.cr@gmail.com')).toBe(true)
    expect(esUsuarioAdmin('STUDENTHUB.CR@GMAIL.COM')).toBe(true)
    expect(esUsuarioAdmin('  studenthub.cr@gmail.com  ')).toBe(true)
  })

  it('deniega rol administrador a cualquier cuenta de estudiante, incluyendo al desarrollador', () => {
    expect(esUsuarioAdmin('erickgarciab2134@gmail.com')).toBe(false)
    expect(esUsuarioAdmin('estudiante.demo@mep.go.cr')).toBe(false)
    expect(esUsuarioAdmin('juan.perez@mep.go.cr')).toBe(false)
    expect(esUsuarioAdmin(null)).toBe(false)
    expect(esUsuarioAdmin(undefined)).toBe(false)
    expect(esUsuarioAdmin('')).toBe(false)
  })
})

describe('filtrarAvisosParaEstudiante', () => {
  it('un estudiante solo ve avisos dirigidos a toda la institución o a su sección/especialidad', () => {
    const visibles = filtrarAvisosParaEstudiante(AVISOS_FIXTURE, ESTUDIANTE_TEST, [])
    const ids = visibles.map((a) => a.id)

    expect(ids).toContain('1') // all
    expect(ids).toContain('2') // Desarrollo Web
    expect(ids).toContain('4') // 11-1
    expect(ids).not.toContain('3') // Contabilidad (otro)
    expect(ids).not.toContain('5') // 12-2 (otro)
    expect(visibles).toHaveLength(3)
  })

  it('excluye avisos que el estudiante ya descartó en su sesión', () => {
    const visibles = filtrarAvisosParaEstudiante(AVISOS_FIXTURE, ESTUDIANTE_TEST, ['1'])
    const ids = visibles.map((a) => a.id)

    expect(ids).not.toContain('1')
    expect(ids).toContain('2')
    expect(ids).toContain('4')
    expect(visibles).toHaveLength(2)
  })

  it('un administrador puede auditar todos los avisos institucionales', () => {
    const visiblesAdmin = filtrarAvisosParaEstudiante(AVISOS_FIXTURE, null, [], true)
    expect(visiblesAdmin).toHaveLength(5)
  })
})

describe('formatearTiempoAviso', () => {
  it('retorna "Justo ahora" para publicaciones recientes', () => {
    expect(formatearTiempoAviso(new Date().toISOString())).toBe('Justo ahora')
  })

  it('retorna minutos para avisos de hace pocos minutos', () => {
    const hace15 = new Date(Date.now() - 1000 * 60 * 15).toISOString()
    expect(formatearTiempoAviso(hace15)).toBe('Hace 15 min')
  })
})

describe('Integración de Notificaciones para Avisos', () => {
  it('convierte un aviso institucional en una notificación con formato adecuado', async () => {
    const { convertirAvisoANotificacion } = await import('./avisos.service')
    const aviso = AVISOS_FIXTURE[0]
    const notif = convertirAvisoANotificacion(aviso)

    expect(notif.id).toBe(`notif-aviso-${aviso.id}`)
    expect(notif.titulo).toContain(aviso.title)
    expect(notif.mensaje).toBe(aviso.message)
    expect(notif.categoria).toBe('horarios') // early_departure -> horarios
    expect(notif.importante).toBe(true)
    expect(notif.leida).toBe(false)
  })

  it('evalúa correctamente si un aviso aplica al estudiante', async () => {
    const { aplicaAvisoAEstudiante } = await import('./avisos.service')

    // Aviso general: aplica a todos
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[0], ESTUDIANTE_TEST)).toBe(true)
    // Aviso Desarrollo Web: aplica al estudiante de Desarrollo Web
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[1], ESTUDIANTE_TEST)).toBe(true)
    // Aviso Contabilidad: NO aplica al estudiante de Desarrollo Web
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[2], ESTUDIANTE_TEST)).toBe(false)
    // Aviso 11-1: aplica a la sección 11-1
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[3], ESTUDIANTE_TEST)).toBe(true)
    // Aviso 12-2: NO aplica a la sección 11-1
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[4], ESTUDIANTE_TEST)).toBe(false)
  })

  it('maneja con seguridad perfiles nulos, target_values indefinidos y avisos malformados', async () => {
    const { aplicaAvisoAEstudiante } = await import('./avisos.service')

    // Aviso general con estudiante null: debe retornar true
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[0], null)).toBe(true)
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[0], undefined)).toBe(true)

    // Aviso segmentado con estudiante null: debe retornar false de forma segura
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[1], null)).toBe(false)
    expect(aplicaAvisoAEstudiante(AVISOS_FIXTURE[3], null)).toBe(false)

    // Aviso con target_values nulo o indefinido: no debe arrojar excepción
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avisoSinValores: any = {
      ...AVISOS_FIXTURE[1],
      target_values: null,
    }
    expect(aplicaAvisoAEstudiante(avisoSinValores, ESTUDIANTE_TEST)).toBe(false)

    // Aviso con target_values que contienen valores no-string o nulos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avisoValoresMixtos: any = {
      ...AVISOS_FIXTURE[1],
      target_values: [null, undefined, 123, 'Desarrollo Web'],
    }
    expect(aplicaAvisoAEstudiante(avisoValoresMixtos, ESTUDIANTE_TEST)).toBe(true)

    // Aviso completamente nulo o inactivo
    expect(aplicaAvisoAEstudiante(null, ESTUDIANTE_TEST)).toBe(false)
    expect(aplicaAvisoAEstudiante(undefined, ESTUDIANTE_TEST)).toBe(false)
  })
})
