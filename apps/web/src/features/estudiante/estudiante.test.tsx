import { describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { BadgeRol } from '@/components/BadgeRol'
import { SelectorEstudianteActivo } from '@/components/SelectorEstudianteActivo'
import { ESTUDIANTE_DEMO, ESTUDIANTE_DEMO_2, ENCARGADO_DEMO } from './estudiante.fixture'
import * as useEstudianteModule from './useEstudiante'

describe('BadgeRol Component', () => {
  it('renderiza badge de Estudiante con icono correspondiente sin emojis', () => {
    const html = renderToString(<BadgeRol rol="estudiante" />)
    expect(html).toContain('Estudiante')
    expect(html).toContain('<svg')
    // Cero emojis Unicode
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })

  it('renderiza badge de Encargado Legal con icono correspondiente sin emojis', () => {
    const html = renderToString(<BadgeRol rol="encargado" />)
    expect(html).toContain('Encargado')
    expect(html).toContain('<svg')
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })
})

describe('SelectorEstudianteActivo Component', () => {
  it('no se muestra si el rol es estudiante', () => {
    vi.spyOn(useEstudianteModule, 'useEstudiante').mockReturnValue({
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

    const html = renderToString(<SelectorEstudianteActivo />)
    expect(html).toBe('')
  })

  it('no se muestra si el encargado solo tiene 1 estudiante vinculado', () => {
    vi.spyOn(useEstudianteModule, 'useEstudiante').mockReturnValue({
      rolActivo: 'encargado',
      encargado: ENCARGADO_DEMO,
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

    const html = renderToString(<SelectorEstudianteActivo />)
    expect(html).toBe('')
  })

  it('renderiza el selector mostrando el estudiante activo cuando hay 2 o más vinculados', () => {
    vi.spyOn(useEstudianteModule, 'useEstudiante').mockReturnValue({
      rolActivo: 'encargado',
      encargado: ENCARGADO_DEMO,
      estudiantesVinculados: [ESTUDIANTE_DEMO, ESTUDIANTE_DEMO_2],
      estudianteActivo: ESTUDIANTE_DEMO,
      estudiante: ESTUDIANTE_DEMO,
      seleccionarEstudiante: vi.fn(),
      cargando: false,
      fueraDelPadron: false,
      error: null,
      esModoDemoEncargado: true,
      alternarRolDemo: vi.fn(),
    })

    const html = renderToString(<SelectorEstudianteActivo />)
    expect(html).toContain('Erick García Burgos')
    expect(html).toContain('aria-haspopup="listbox"')
    expect(html).toContain('<svg')
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })
})
