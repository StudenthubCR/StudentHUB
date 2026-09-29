import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { DashboardPage } from './DashboardPage'
import { ConfirmacionAsistenciaComedor } from '@/features/comedor/components/ConfirmacionAsistenciaComedor'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import type { InstitutionAlert } from '@/features/avisos/avisos.types'

// Estado mutable de useEstudiante para conmutar entre casos de prueba
let mockEstudianteState = {
  estudiante: null as Estudiante | null,
  cargando: false,
  error: null as string | null,
  fueraDelPadron: false,
  reintentar: vi.fn(),
}

vi.mock('@/features/estudiante/useEstudiante', () => ({
  useEstudiante: () => mockEstudianteState,
}))

// Estado mutable de useSesion
let mockSesionState = {
  sesion: {
    user: {
      id: 'usr-estudiante-nocturno-uuid',
      email: 'estudiante.nocturna@ctp.ed.cr',
      role: 'authenticated',
      app_metadata: { role: 'authenticated' },
      user_metadata: { role: 'authenticated' },
    },
  } as any,
  cargando: false,
  cerrarSesion: vi.fn(),
}

vi.mock('@/features/auth/useSesion', () => ({
  useSesion: () => mockSesionState,
}))

// Estado mutable de useAvisos
let mockAvisosState: {
  avisos: InstitutionAlert[]
  esAdmin: boolean
  cargando: boolean
  descartarAviso: ReturnType<typeof vi.fn>
  publicarAviso: ReturnType<typeof vi.fn>
  borrarAviso: ReturnType<typeof vi.fn>
} = {
  avisos: [],
  esAdmin: false,
  cargando: false,
  descartarAviso: vi.fn(),
  publicarAviso: vi.fn(),
  borrarAviso: vi.fn(),
}

vi.mock('@/features/avisos/useAvisos', () => ({
  useAvisos: () => mockAvisosState,
}))

// Mock de notificaciones
vi.mock('@/features/notificaciones/useNotificaciones', () => ({
  useNotificaciones: () => ({
    soportado: true,
    permiso: 'granted',
    canales: { comedor: true, horarios: true, agenda: true, ausencias: true, noticias: true },
    notificaciones: [],
    noLeidas: 0,
    cargando: false,
    notificacionesActivas: true,
    solicitarPermiso: vi.fn(),
    alternarCanal: vi.fn(),
    marcarComoLeida: vi.fn(),
    marcarTodasComoLeidas: vi.fn(),
    eliminarNotificacion: vi.fn(),
    limpiarTodo: vi.fn(),
    probarNotificacion: vi.fn(),
  }),
}))

// Mock de horarios
vi.mock('@/features/horarios/useHorario', () => ({
  useHorario: () => ({
    dias: [
      {
        nombre: 'Lunes',
        esHoy: true,
        bloques: [
          {
            materia: 'Desarrollo Web y Apps',
            docente: 'Ing. Carlos Brenes',
            inicio: '18:00',
            fin: '19:30',
            lecciones: 2,
            esReceso: false,
          },
        ],
        resumen: 'Sección Nocturna',
      },
    ],
    lecciones: 4,
    cargando: false,
    error: null,
    reintentar: vi.fn(),
  }),
}))

// Mock de menú de comedor
vi.mock('@/features/comedor/useMenuSemanal', () => ({
  useMenuSemanal: () => ({
    dias: [new Date(2026, 8, 29)],
    menus: [],
    numeroDeSemana: 1,
    cargando: false,
    recargando: false,
    error: null,
    reintentar: vi.fn(),
  }),
}))

// Mock de useReloj a hora fija
vi.mock('@/lib/useReloj', () => ({
  useReloj: () => new Date(2026, 8, 29, 18, 30, 0),
}))

// Mock del servicio de confirmación para evitar llamadas a Supabase en pruebas
vi.mock('@/features/comedor/confirmacion.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/comedor/confirmacion.service')>()
  return {
    ...actual,
    obtenerConfirmacionEstudiante: vi.fn().mockResolvedValue(null),
    guardarConfirmacionEstudiante: vi.fn().mockResolvedValue({ ok: true }),
  }
})

function crearWrapper(children: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('DashboardEstudiante - Suite de Resiliencia y Renderizado Estable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEstudianteState = {
      estudiante: null,
      cargando: false,
      error: null,
      fueraDelPadron: false,
      reintentar: vi.fn(),
    }
    mockAvisosState = {
      avisos: [],
      esAdmin: false,
      cargando: false,
      descartarAviso: vi.fn(),
      publicarAviso: vi.fn(),
      borrarAviso: vi.fn(),
    }
  })

  // Caso 1: Carga inicial
  it('Caso 1 (Carga inicial): renderiza el Skeleton accesible sin arrojar excepciones cuando cargando: true', () => {
    mockEstudianteState = {
      estudiante: null,
      cargando: true,
      error: null,
      fueraDelPadron: false,
      reintentar: vi.fn(),
    }

    let html = ''
    expect(() => {
      html = renderToString(crearWrapper(<DashboardPage />))
    }).not.toThrow()

    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('aria-label="Cargando panel de estudiante"')
    expect(html).toContain('animate-pulse')
    // No debe contener el contenido interactivo aún
    expect(html).not.toContain('CTP de Educación Técnica')
  })

  // Caso 2: Estudiante fuera del padrón / data null
  it('Caso 2 (Estudiante fuera del padrón / data null): renderiza con sesión activa y estudiante null mostrando el aviso institucional sin disparar el Error Boundary', () => {
    mockEstudianteState = {
      estudiante: null,
      cargando: false,
      error: null,
      fueraDelPadron: true,
      reintentar: vi.fn(),
    }

    let html = ''
    expect(() => {
      html = renderToString(crearWrapper(<DashboardPage />))
    }).not.toThrow()

    // Debe mostrar la advertencia pedagógica/administrativa controlada
    expect(html).toContain('Cuenta en proceso de vinculación al padrón estudiantil')
    expect(html).toContain('solicita a secretaría que agregue tu correo institucional')
    // No debe haber crash de acceso a propiedades nulas
    expect(html).toContain('CTP de Educación Técnica')
    expect(html).not.toContain('Algo se rompió')
  })

  // Caso 3: Estudiante nocturno activo con avisos que contienen campos null
  it('Caso 3 (Estudiante nocturno activo): renderiza con estudiante completo y avisos con target_values nulos sin lanzar TypeError', () => {
    const estudianteMock: Estudiante = {
      id: 'est-nocturno-777',
      user_id: 'usr-estudiante-nocturno-uuid',
      cedula: '1-1234-0567',
      codigo: 'CTP-2026-777',
      nombre: 'Kembly Mora Gómez',
      correo: 'estudiante.nocturna@ctp.ed.cr',
      seccion: '12-1',
      grupo: '12-1',
      especialidad: 'Desarrollo Web',
      institucion: 'Colegio Técnico Profesional',
      siglaInstitucion: 'CTP',
      nivel: '12',
      jornada: 'Nocturna',
      vigencia: 'Ciclo Lectivo 2026',
      fotoUrl: '',
      genero: 'F',
      rol: 'estudiante',
      activo: true,
    }

    const avisoConNulls: InstitutionAlert = {
      id: 'alerta-null-test',
      title: 'Aviso Urgente Sección Nocturna',
      message: 'Las lecciones de las 8:00 PM se impartirán en el Salón Multiusos.',
      category: 'general',
      priority: 'urgent',
      target_type: 'section',
      target_values: null as unknown as string[], // Simulando registro corrupto o nulo de PostgreSQL
      active: true,
      created_at: new Date().toISOString(),
      expires_at: null,
      created_by: 'admin-uuid',
    }

    mockEstudianteState = {
      estudiante: estudianteMock,
      cargando: false,
      error: null,
      fueraDelPadron: false,
      reintentar: vi.fn(),
    }

    mockAvisosState.avisos = [avisoConNulls]
    mockAvisosState.esAdmin = false

    let html = ''
    expect(() => {
      html = renderToString(crearWrapper(<DashboardPage />))
    }).not.toThrow()

    // Verificar que saluda con el primer nombre
    expect(html).toContain('Kembly')
    expect(html).toContain('Sección')
    expect(html).toContain('12-1')
    // Verificar que el aviso se renderiza a pesar del target_values null
    expect(html).toContain('Aviso Urgente Sección Nocturna')
    expect(html).toContain('Las lecciones de las 8:00 PM se impartirán en el Salón Multiusos.')
  })

  // Caso 4: Confirmación de Comedor nocturna a las 8:30 PM y a las 6:00 PM
  it('Caso 4 (Confirmación de Comedor nocturna): renderiza el componente a las 8:30 PM (abierto para día siguiente) y 6:00 PM (cerrado) sin Invalid Date ni excepciones', () => {
    const estudianteMock: Estudiante = {
      id: 'est-nocturno-888',
      user_id: 'usr-estudiante-nocturno-uuid',
      cedula: '1-1234-0567',
      codigo: 'CTP-2026-888',
      nombre: 'Marlon Chaves Vega',
      correo: 'marlon.chaves@ctp.ed.cr',
      seccion: '12-2',
      grupo: '12-2',
      especialidad: 'Electrotecnia',
      institucion: 'Colegio Técnico Profesional',
      siglaInstitucion: 'CTP',
      nivel: '12',
      jornada: 'Nocturna',
      vigencia: 'Ciclo Lectivo 2026',
      fotoUrl: '',
      genero: 'M',
      rol: 'estudiante',
      activo: true,
    }

    mockEstudianteState = {
      estudiante: estudianteMock,
      cargando: false,
      error: null,
      fueraDelPadron: false,
      reintentar: vi.fn(),
    }

    // Subcaso A: 8:30 PM (20:30) - Ventana nocturna abierta para el día siguiente
    const fecha830PM = new Date(2026, 8, 29, 20, 30, 0)
    let html830 = ''
    expect(() => {
      html830 = renderToString(crearWrapper(<ConfirmacionAsistenciaComedor fecha={fecha830PM} />))
    }).not.toThrow()

    expect(html830).not.toContain('Invalid Date')
    expect(html830).not.toContain('NaN')
    expect(html830).toContain('Confirmación de Asistencia · Sección Nocturna')
    expect(html830).toContain('Cenaré mañana')
    expect(html830).toContain('No cenaré mañana')
    expect(html830).toContain('Cierre: 5:30 PM (Abre 8:00 PM previo)')

    // Subcaso B: 6:00 PM (18:00) - Ventana cerrada para el servicio de hoy (límite 5:30 PM)
    const fecha600PM = new Date(2026, 8, 29, 18, 0, 0)
    let html600 = ''
    expect(() => {
      html600 = renderToString(crearWrapper(<ConfirmacionAsistenciaComedor fecha={fecha600PM} />))
    }).not.toThrow()

    expect(html600).not.toContain('Invalid Date')
    expect(html600).not.toContain('NaN')
    expect(html600).toContain('El registro para la cena de hoy cerró a las 5:30 PM')
    expect(html600).toContain('opacity-70 cursor-not-allowed')
  })
})
