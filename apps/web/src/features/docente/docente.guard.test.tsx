import { describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BadgeRol } from '@/components/BadgeRol'
import { DocenteRutaProtegida } from '@/features/auth/DocenteRutaProtegida'
import * as useSesionModule from '@/features/auth/useSesion'
import { DOCENTE_DANGELO_DEMO } from './docente.fixture'
import { DocentePage } from './DocentePage'

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u

function crearWrapper(children: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/docente']}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('DocenteRutaProtegida y UI Docente', () => {
  it('bloquea a un estudiante autenticado de acceder a /docente', () => {
    vi.spyOn(useSesionModule, 'useSesion').mockReturnValue({
      cargando: false,
      cargandoRol: false,
      rol: 'estudiante',
      docente: null,
      sesion: {
        access_token: 't',
        refresh_token: 'r',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'est-1',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '',
          email: 'estudiante@mep.go.cr',
        },
      },
      cerrarSesion: vi.fn(),
    })

    const html = renderToString(
      crearWrapper(
        <DocenteRutaProtegida>
          <div>Panel Privado Docente</div>
        </DocenteRutaProtegida>,
      ),
    )

    expect(html).toContain('Acceso Restringido')
    expect(html).toContain('Área Exclusiva para Docentes')
    expect(html).not.toContain('Panel Privado Docente')
    expect(html).not.toMatch(EMOJI_REGEX)
  })

  it('permite el acceso al Prof. Dangelo cuando rol === docente', () => {
    vi.spyOn(useSesionModule, 'useSesion').mockReturnValue({
      cargando: false,
      cargandoRol: false,
      rol: 'docente',
      docente: DOCENTE_DANGELO_DEMO,
      sesion: {
        access_token: 't-doc',
        refresh_token: 'r-doc',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: DOCENTE_DANGELO_DEMO.authUserId || 'doc-1',
          app_metadata: {},
          user_metadata: { role: 'docente' },
          aud: 'authenticated',
          created_at: '',
          email: DOCENTE_DANGELO_DEMO.correoInstitucional,
        },
      },
      cerrarSesion: vi.fn(),
    })

    const html = renderToString(
      crearWrapper(
        <DocenteRutaProtegida>
          <DocentePage />
        </DocenteRutaProtegida>,
      ),
    )

    expect(html).toContain('Prof. Dangelo')
    expect(html).toContain('Desarrollo Web')
    expect(html).toContain('CTP Rosario de Naranjo')
    expect(html).not.toMatch(EMOJI_REGEX)
  })

  it('renderiza BadgeRol en modo docente con SVG accesible y sin emojis', () => {
    const html = renderToString(<BadgeRol rol="docente" especialidad="Desarrollo Web" />)
    expect(html).toContain('Docente · Desarrollo Web')
    expect(html).toContain('<svg')
    expect(html).not.toMatch(EMOJI_REGEX)
  })
})
