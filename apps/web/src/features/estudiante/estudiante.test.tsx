import { describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { BadgeRol } from '@/components/BadgeRol'
import { SelectorPerspectiva } from '@/components/SelectorPerspectiva'
import { ESTUDIANTE_DEMO } from './estudiante.fixture'
import * as useEstudianteModule from './useEstudiante'

describe('BadgeRol Component', () => {
  it('renderiza badge de Familia (modo ambos) con icono correspondiente sin emojis', () => {
    const html = renderToString(<BadgeRol perspectiva="ambos" />)
    expect(html).toContain('Familia')
    expect(html).toContain('<svg')
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })

  it('renderiza badge de Estudiante con icono correspondiente sin emojis', () => {
    const html = renderToString(<BadgeRol perspectiva="estudiante" />)
    expect(html).toContain('Estudiante')
    expect(html).toContain('<svg')
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })

  it('renderiza badge de Encargado Legal con icono correspondiente sin emojis', () => {
    const html = renderToString(<BadgeRol perspectiva="encargado" />)
    expect(html).toContain('Encargado')
    expect(html).toContain('<svg')
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })
})

describe('SelectorPerspectiva Component', () => {
  it('renderiza en variante dropdown mostrando la perspectiva activa sin emojis', () => {
    vi.spyOn(useEstudianteModule, 'useEstudiante').mockReturnValue({
      perspectiva: 'ambos',
      cambiarPerspectiva: vi.fn(),
      rolActivo: 'estudiante',
      encargado: null,
      estudiantesVinculados: [ESTUDIANTE_DEMO],
      estudianteActivo: ESTUDIANTE_DEMO,
      estudiante: ESTUDIANTE_DEMO,
      seleccionarEstudiante: vi.fn(),
      cargando: false,
      fueraDelPadron: false,
      error: null,
      esModoDemoEncargado: false,
      alternarRolDemo: vi.fn(),
    })

    const html = renderToString(<SelectorPerspectiva variante="dropdown" />)
    expect(html).toContain('Familia')
    expect(html).toContain('aria-haspopup="listbox"')
    expect(html).toContain('<svg')
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })

  it('renderiza en variante tabs con las 3 opciones accesibles', () => {
    vi.spyOn(useEstudianteModule, 'useEstudiante').mockReturnValue({
      perspectiva: 'estudiante',
      cambiarPerspectiva: vi.fn(),
      rolActivo: 'estudiante',
      encargado: null,
      estudiantesVinculados: [ESTUDIANTE_DEMO],
      estudianteActivo: ESTUDIANTE_DEMO,
      estudiante: ESTUDIANTE_DEMO,
      seleccionarEstudiante: vi.fn(),
      cargando: false,
      fueraDelPadron: false,
      error: null,
      esModoDemoEncargado: false,
      alternarRolDemo: vi.fn(),
    })

    const html = renderToString(<SelectorPerspectiva variante="tabs" />)
    expect(html).toContain('Familia')
    expect(html).toContain('Estudiante')
    expect(html).toContain('Encargado')
    expect(html).toContain('role="tablist"')
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })
})
