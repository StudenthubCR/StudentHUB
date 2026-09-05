import { describe, expect, it } from 'vitest'
import { buscarTema, TEMAS_CARNET, PATRONES, PERSONALIZACION_POR_DEFECTO } from './carnet.estilos'

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
})
