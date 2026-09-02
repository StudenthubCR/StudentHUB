import { describe, expect, it } from 'vitest'
import { primerNombre, saludoSegunHora } from './saludo'

const aLas = (hora: number, minuto = 0) => new Date(2026, 8, 2, hora, minuto)

describe('saludoSegunHora', () => {
  it('saluda de noche en la madrugada', () => {
    expect(saludoSegunHora(aLas(0))).toBe('Buenas noches')
    expect(saludoSegunHora(aLas(4, 59))).toBe('Buenas noches')
  })

  it('saluda de día por la mañana', () => {
    expect(saludoSegunHora(aLas(5))).toBe('Buenos días')
    expect(saludoSegunHora(aLas(11, 59))).toBe('Buenos días')
  })

  it('saluda de tarde después del mediodía', () => {
    expect(saludoSegunHora(aLas(12))).toBe('Buenas tardes')
    expect(saludoSegunHora(aLas(18, 59))).toBe('Buenas tardes')
  })

  it('saluda de noche a la hora en que entra la nocturna', () => {
    // El grupo 11-2 empieza a las 5:50pm y sale a las 9:50pm.
    expect(saludoSegunHora(aLas(19))).toBe('Buenas noches')
    expect(saludoSegunHora(aLas(21, 50))).toBe('Buenas noches')
    expect(saludoSegunHora(aLas(23, 59))).toBe('Buenas noches')
  })
})

describe('primerNombre', () => {
  it('se queda con el primer nombre', () => {
    expect(primerNombre('Erick Martínez')).toBe('Erick')
    expect(primerNombre('María José Rojas Vargas')).toBe('María')
  })

  it('aguanta espacios de sobra', () => {
    expect(primerNombre('  Erick   Martínez  ')).toBe('Erick')
  })

  it('devuelve el nombre tal cual si viene de una sola palabra', () => {
    expect(primerNombre('Erick')).toBe('Erick')
  })
})
