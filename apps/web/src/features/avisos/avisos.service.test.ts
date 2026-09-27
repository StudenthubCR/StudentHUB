import { describe, expect, it } from 'vitest'
import {
  filtrarAvisosParaEstudiante,
  formatearTiempoAviso,
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
  {
    id: '6',
    title: 'Aviso Inactivo',
    message: 'Ya no aplica',
    category: 'general',
    priority: 'info',
    target_type: 'all',
    target_values: [],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date().toISOString(),
    expires_at: null,
    active: false,
  },
  {
    id: '7',
    title: 'Aviso Expirado',
    message: 'Expiró ayer',
    category: 'general',
    priority: 'info',
    target_type: 'all',
    target_values: [],
    created_by: 'studenthub.cr@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    expires_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    active: true,
  },
]

describe('filtrarAvisosParaEstudiante', () => {
  it('filtra avisos para un estudiante según su sección y especialidad, impidiendo ver avisos de otros grupos', () => {
    const visibles = filtrarAvisosParaEstudiante(AVISOS_FIXTURE, ESTUDIANTE_TEST, [])
    const ids = visibles.map((a) => a.id)

    expect(ids).toContain('1') // all
    expect(ids).toContain('2') // specialty Desarrollo Web
    expect(ids).toContain('4') // section 11-1
    expect(ids).not.toContain('3') // Contabilidad (otro)
    expect(ids).not.toContain('5') // 12-2 (otro)
    expect(ids).not.toContain('6') // inactivo
    expect(ids).not.toContain('7') // expirado
    expect(visibles).toHaveLength(3)
  })

  it('excluye avisos descartados por el usuario en su sesión', () => {
    const visibles = filtrarAvisosParaEstudiante(AVISOS_FIXTURE, ESTUDIANTE_TEST, ['1', '4'])
    const ids = visibles.map((a) => a.id)

    expect(ids).not.toContain('1')
    expect(ids).not.toContain('4')
    expect(ids).toContain('2')
    expect(visibles).toHaveLength(1)
  })

  it('un administrador puede auditar y gestionar todos los avisos activos', () => {
    const visiblesAdmin = filtrarAvisosParaEstudiante(AVISOS_FIXTURE, null, [], true)
    const ids = visiblesAdmin.map((a) => a.id)

    expect(ids).toContain('1')
    expect(ids).toContain('2')
    expect(ids).toContain('3')
    expect(ids).toContain('4')
    expect(ids).toContain('5')
    expect(ids).not.toContain('6') // inactivo
  })
})

describe('formatearTiempoAviso', () => {
  it('retorna "Justo ahora" para publicaciones recientes', () => {
    expect(formatearTiempoAviso(new Date().toISOString())).toBe('Justo ahora')
  })

  it('retorna minutos para menos de una hora', () => {
    const hace10 = new Date(Date.now() - 1000 * 60 * 10).toISOString()
    expect(formatearTiempoAviso(hace10)).toBe('Hace 10 min')
  })
})
