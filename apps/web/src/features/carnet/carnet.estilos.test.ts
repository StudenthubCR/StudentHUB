import { describe, expect, it } from 'vitest'
import {
  buscarTema,
  TEMAS_CARNET,
  PATRONES,
  PERSONALIZACION_POR_DEFECTO,
  resolverInsignia,
  INSIGNIAS_ESPECIALIDAD,
  TIPOS_SANGRE,
} from './carnet.estilos'

describe('carnet.estilos', () => {
  it('contiene la lista de temas con sus degradados y colores válidos', () => {
    expect(TEMAS_CARNET.length).toBeGreaterThanOrEqual(6)
    for (const tema of TEMAS_CARNET) {
      expect(tema.id).toBeTruthy()
      expect(tema.degradado).toContain('linear-gradient')
      expect(tema.muestra).toBeTruthy()
    }
  })

  it('encuentra un tema existente por su identificador', () => {
    const tema = buscarTema('esmeralda')
    expect(tema.id).toBe('esmeralda')
    expect(tema.nombre).toContain('Esmeralda')
  })

  it('devuelve el tema por defecto si el id no existe', () => {
    const tema = buscarTema('inexistente-123')
    expect(tema.id).toBe(PERSONALIZACION_POR_DEFECTO.temaId)
  })

  it('define los cuatro patrones de fondo disponibles', () => {
    expect(PATRONES.map((p) => p.id)).toEqual(['liso', 'puntos', 'malla', 'lineas'])
  })

  it('resuelve insignia técnica automáticamente por coincidencia de texto', () => {
    const insigSoft = resolverInsignia('auto', 'Desarrollo Web y Software')
    expect(insigSoft.id).toBe('software')
    expect(insigSoft.icono).toBe('💻')

    const insigElec = resolverInsignia('auto', 'Electrónica en Telecomunicaciones')
    expect(insigElec.id).toBe('electronica')

    const insigConta = resolverInsignia('auto', 'Contabilidad y Finanzas')
    expect(insigConta.id).toBe('contabilidad')
  })

  it('respeta la insignia elegida manualmente', () => {
    const manual = resolverInsignia('mecanica', 'Desarrollo Web')
    expect(manual.id).toBe('mecanica')
    expect(manual.nombre).toContain('Mecatrónica')
  })

  it('contiene lista de tipos de sangre reconocidos', () => {
    expect(TIPOS_SANGRE).toContain('O+')
    expect(TIPOS_SANGRE).toContain('A+')
    expect(TIPOS_SANGRE).toContain('B-')
  })

  it('cuenta con el catálogo oficial de insignias de especialidad', () => {
    expect(INSIGNIAS_ESPECIALIDAD.length).toBeGreaterThanOrEqual(6)
    expect(INSIGNIAS_ESPECIALIDAD.some((i) => i.id === 'software')).toBe(true)
  })
})
