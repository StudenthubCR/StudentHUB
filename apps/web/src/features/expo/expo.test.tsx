import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeContext } from '@/app/theme-context'
import { ExpoLandingPage } from './ExpoLandingPage'
import {
  ECOSISTEMA_CAPACIDADES_EXPO,
  ESTUDIANTES_DESARROLLO_WEB_EXPO,
  lanzarPerfilDemo,
  METRICAS_HERO_EXPO,
} from './expoDemo.service'
import { prefiereMovimientoReducido } from './useExpoAnime'

function crearMockStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => {
      store.set(key, val)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

function renderizarExpo(theme: 'light' | 'dark' = 'light'): string {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderToString(
    <QueryClientProvider client={qc}>
      <ThemeContext value={{ theme, alternarTema: () => {} }}>
        <MemoryRouter initialEntries={['/expo']}>
          <ExpoLandingPage />
        </MemoryRouter>
      </ThemeContext>
    </QueryClientProvider>,
  )
}

describe('/expo Expotécnica 2026 showcase', () => {
  const originalWindow = globalThis.window
  const originalLocalStorage = globalThis.localStorage

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.window = originalWindow
    globalThis.localStorage = originalLocalStorage
  })

  it('renderiza en modo claro y oscuro con marca CTP Rosario de Naranjo y sin fricción de correo institucional', () => {
    const htmlClaro = renderizarExpo('light')
    const htmlOscuro = renderizarExpo('dark')

    for (const html of [htmlClaro, htmlOscuro]) {
      expect(html).toContain('CTP Rosario de Naranjo')
      expect(html).toContain('Expotécnica 2026')
      expect(html).toContain('Prof. Dangelo')
      expect(html).toContain('Erick García Burgos')
      expect(html).toContain('María Elena Burgos')
      expect(html).toContain('Lucía Fernández Castro')
      expect(html).toContain('Andrés Porras Chacón')
      expect(html).toContain('Sofía García Burgos')
      expect(html).toContain('Ley N° 8968')
      expect(html).toContain('/studenthub-logo.webp')
      expect(html).toContain('/studenthub-logo-dark.webp')

      expect(html).not.toContain('CTP San Rafael')
      expect(html).not.toContain('mep.go.cr')
      expect(html).not.toContain('Login MEP')
    }
  })

  it('incluye todos los módulos reales implementados y métricas del hero', () => {
    const ids = ECOSISTEMA_CAPACIDADES_EXPO.map((m) => m.id)
    expect(ids).toEqual([
      'modo-docente',
      'hub-familiar',
      'carnet-3d',
      'alerta-asistencia',
      'agenda-escolar',
      'chatbot-offline',
      'comedor-nocturna',
      'horarios-dinamicos',
      'avisos-notificaciones',
      'panel-admin',
      'pwa-seguridad',
    ])
    expect(METRICAS_HERO_EXPO).toHaveLength(4)
    expect(ESTUDIANTES_DESARROLLO_WEB_EXPO.length).toBeGreaterThanOrEqual(6)
    for (const est of ESTUDIANTES_DESARROLLO_WEB_EXPO) {
      expect(est.especialidad).toBe('Desarrollo Web')
    }
  })

  it('configura localStorage y destino correctamente en lanzarPerfilDemo para docente, estudiante, encargado y admin', () => {
    const storage = crearMockStorage()
    storage.setItem('studenthub_estudiante_activo_id', 'anterior')
    const locationMock = { href: 'http://localhost:5173/expo' }
    globalThis.localStorage = storage as unknown as Storage
    globalThis.window = { location: locationMock } as unknown as Window & typeof globalThis

    lanzarPerfilDemo({ rol: 'docente' })
    expect(storage.getItem('studenthub_demo_sesion')).toBe('true')
    expect(storage.getItem('studenthub_demo_rol')).toBe('docente')
    expect(storage.getItem('studenthub_demo_estudiante_id')).toBeNull()
    expect(storage.getItem('studenthub_estudiante_activo_id')).toBeNull()
    expect(storage.getItem('studenthub_demo_admin')).toBeNull()
    expect(locationMock.href).toBe('/docente')

    lanzarPerfilDemo({
      rol: 'estudiante',
      estudianteId: 'dw-10-1-lucia',
      destino: '/estudiante?tab=asistencias',
    })
    expect(storage.getItem('studenthub_demo_rol')).toBe('estudiante')
    expect(storage.getItem('studenthub_demo_estudiante_id')).toBe('dw-10-1-lucia')
    expect(locationMock.href).toBe('/estudiante?tab=asistencias')

    lanzarPerfilDemo({ rol: 'encargado', destino: '/estudiante?tab=notas' })
    expect(storage.getItem('studenthub_demo_rol')).toBe('encargado')
    expect(storage.getItem('studenthub_demo_estudiante_id')).toBeNull()
    expect(locationMock.href).toBe('/estudiante?tab=notas')

    lanzarPerfilDemo({ rol: 'admin', destino: '/admin' })
    expect(storage.getItem('studenthub_demo_admin')).toBe('true')
    expect(locationMock.href).toBe('/admin')
  })

  it('respeta prefers-reduced-motion y funciona seguro fuera del navegador', () => {
    expect(prefiereMovimientoReducido()).toBe(true)

    globalThis.window = {
      matchMedia: () => ({ matches: true }),
    } as unknown as Window & typeof globalThis
    expect(prefiereMovimientoReducido()).toBe(true)

    globalThis.window = {
      matchMedia: () => ({ matches: false }),
    } as unknown as Window & typeof globalThis
    expect(prefiereMovimientoReducido()).toBe(false)
  })
})
