import { describe, expect, it } from 'vitest'
import {
  INICIO_DEL_CICLO,
  SEMANAS_DEL_CICLO,
  claveDeFecha,
  estadoDelDia,
  fechaDelDia,
  filasAMenus,
  menusDeSemana,
  normalizarDia,
  semanaAMostrar,
  semanaDelCiclo,
} from './menu.service'
import type { FilaComedor } from './comedor.api'

const fecha = (anio: number, mes: number, dia: number) => new Date(anio, mes - 1, dia)

/** Filas tal como las devuelve hoy el Apps Script para la semana 4. */
const FILAS_SEMANA_4: FilaComedor[] = [
  {
    semana: '4',
    dia: 'Lunes',
    plato: 'Frijoles blancos con pollo desmechado, zanahoria o chayote',
    acompanamiento: 'Arroz blanco',
    bebida: 'Agua pura',
    postre: 'Banano',
  },
  {
    semana: '4',
    dia: 'Martes',
    plato: 'Pasta de cerdo en salsa criolla con papas',
    acompanamiento: 'Arroz blanco, Frijoles negros frescos, Aderezo: Naranja',
    bebida: 'Agua pura',
    postre: 'Papaya / Melón',
  },
  {
    semana: '4',
    dia: 'Miércoles',
    plato: 'Pescado empanizado (con limón en rodaja)',
    acompanamiento: 'Arroz blanco, Frijoles rojos frescos',
    bebida: 'Agua pura',
    postre: 'Sandía',
  },
  {
    semana: '4',
    dia: 'Jueves',
    plato: 'Arroz mixto de pollo, cerdo y huevo',
    acompanamiento: 'Frijoles molidos, Pepino en medias lunas',
    bebida: 'Agua pura',
    postre: 'Piña',
  },
  {
    semana: '4',
    dia: 'Viernes',
    plato: 'Olla de carne',
    acompanamiento: 'Verduras de olla',
    bebida: 'Agua pura',
    postre: 'Manzana',
  },
]

describe('semanaDelCiclo', () => {
  const inicio = fecha(2026, 8, 31) // lunes en que arranca la semana 1

  it('el ancla es la semana 1', () => {
    expect(claveDeFecha(inicio)).toBe(INICIO_DEL_CICLO)
    expect(semanaDelCiclo(inicio)).toBe(1)
  })

  it('la semana del 31 de agosto de 2026 es la 1, como confirmó el equipo', () => {
    expect(semanaDelCiclo(fecha(2026, 9, 1))).toBe(1)
  })

  it('avanza una semana del ciclo por cada semana del calendario', () => {
    expect(semanaDelCiclo(fecha(2026, 9, 7))).toBe(2)
    expect(semanaDelCiclo(fecha(2026, 9, 14))).toBe(3)
    expect(semanaDelCiclo(fecha(2026, 9, 21))).toBe(4)
    expect(semanaDelCiclo(fecha(2026, 9, 28))).toBe(5)
  })

  it('vuelve a la semana 1 después de cinco semanas', () => {
    expect(semanaDelCiclo(fecha(2026, 10, 5))).toBe(1)
    expect(semanaDelCiclo(fecha(2026, 10, 12))).toBe(2)
  })

  it('todos los días de una misma semana caen en el mismo número', () => {
    const numeros = [31, 1, 2, 3, 4].map((d, i) =>
      semanaDelCiclo(i === 0 ? fecha(2026, 8, d) : fecha(2026, 9, d)),
    )
    expect(new Set(numeros)).toEqual(new Set([1]))
  })

  it('el domingo cuenta como parte de la semana que termina', () => {
    expect(semanaDelCiclo(fecha(2026, 9, 6))).toBe(1) // domingo
    expect(semanaDelCiclo(fecha(2026, 9, 7))).toBe(2) // lunes siguiente
  })

  it('las fechas anteriores al inicio del ciclo también caen en 1..5', () => {
    for (const dia of [3, 10, 17, 24]) {
      const numero = semanaDelCiclo(fecha(2026, 8, dia))
      expect(numero).toBeGreaterThanOrEqual(1)
      expect(numero).toBeLessThanOrEqual(SEMANAS_DEL_CICLO)
    }
    expect(semanaDelCiclo(fecha(2026, 8, 24))).toBe(5) // la semana anterior al ancla
  })
})

describe('normalizarDia', () => {
  it('quita acentos, espacios y mayúsculas', () => {
    expect(normalizarDia('Miércoles')).toBe('miercoles')
    expect(normalizarDia('  MARTES ')).toBe('martes')
    expect(normalizarDia('Sábado')).toBe('sabado')
  })
})

describe('fechaDelDia', () => {
  const lunes = fecha(2026, 8, 31)

  it('ubica cada día hábil dentro de su semana', () => {
    expect(claveDeFecha(fechaDelDia(lunes, 'Lunes')!)).toBe('2026-08-31')
    expect(claveDeFecha(fechaDelDia(lunes, 'Miércoles')!)).toBe('2026-09-02')
    expect(claveDeFecha(fechaDelDia(lunes, 'Viernes')!)).toBe('2026-09-04')
  })

  it('no se deja engañar por acentos ni mayúsculas de la hoja', () => {
    expect(claveDeFecha(fechaDelDia(lunes, 'MIERCOLES')!)).toBe('2026-09-02')
  })

  it('devuelve null para un día que no reconoce', () => {
    expect(fechaDelDia(lunes, 'Sábado')).toBeNull()
    expect(fechaDelDia(lunes, '')).toBeNull()
    expect(fechaDelDia(lunes, 'Semana Santa')).toBeNull()
  })
})

describe('filasAMenus', () => {
  const lunes = fecha(2026, 8, 31)

  it('convierte las filas de la hoja en menús con fecha real', () => {
    const menus = filasAMenus(FILAS_SEMANA_4, lunes)
    expect(menus.map((m) => m.fecha)).toEqual([
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ])
  })

  it('mapea "postre" de la hoja al campo "fruta" del modelo', () => {
    expect(filasAMenus(FILAS_SEMANA_4, lunes)[0]!.fruta).toBe('Banano')
  })

  it('descarta filas con un día que no existe en la semana hábil', () => {
    const conBasura: FilaComedor[] = [
      ...FILAS_SEMANA_4,
      { semana: '4', dia: 'Sábado', plato: 'x', acompanamiento: '', bebida: '', postre: '' },
      { semana: '4', dia: '', plato: 'y', acompanamiento: '', bebida: '', postre: '' },
    ]
    expect(filasAMenus(conBasura, lunes)).toHaveLength(5)
  })

  it('rellena los campos vacíos en vez de mostrar huecos', () => {
    const incompleta: FilaComedor[] = [
      { semana: '4', dia: 'Lunes', plato: '  ', acompanamiento: '', bebida: '', postre: '' },
    ]
    expect(filasAMenus(incompleta, lunes)[0]).toEqual({
      fecha: '2026-08-31',
      plato: 'No programado',
      acompanamiento: 'No programado',
      bebida: 'Agua pura',
      fruta: 'Fruta de temporada',
    })
  })

  it('sobrevive a una fila con campos que no son texto', () => {
    const rara = [
      { semana: 4, dia: 'Lunes', plato: 42, acompanamiento: null, bebida: undefined, postre: {} },
    ] as unknown as FilaComedor[]
    expect(filasAMenus(rara, lunes)[0]!.plato).toBe('No programado')
  })
})

describe('la hoja conectada al modelo por fecha', () => {
  it('un miércoles muestra el plato del miércoles de esa semana', () => {
    const miercoles = fecha(2026, 9, 2)
    const menus = filasAMenus(FILAS_SEMANA_4, semanaAMostrar(miercoles)[0]!)
    const estado = estadoDelDia(menus, miercoles)
    expect(estado.tipo).toBe('servido')
    expect(estado.tipo === 'servido' && estado.menu.plato).toBe(
      'Pescado empanizado (con limón en rodaja)',
    )
  })

  it('el sábado pide la semana siguiente del ciclo y muestra el comedor cerrado', () => {
    const sabado = fecha(2026, 9, 5)
    const lunesQueSigue = semanaAMostrar(sabado)[0]!

    expect(claveDeFecha(lunesQueSigue)).toBe('2026-09-07')
    expect(semanaDelCiclo(lunesQueSigue)).toBe(2) // ya no es la 1
    expect(estadoDelDia(filasAMenus(FILAS_SEMANA_4, lunesQueSigue), sabado)).toEqual({
      tipo: 'cerrado',
    })
  })

  it('la parrilla queda con los cinco días de la semana correcta', () => {
    const dias = semanaAMostrar(fecha(2026, 9, 2))
    const semana = menusDeSemana(filasAMenus(FILAS_SEMANA_4, dias[0]!), dias)
    expect(semana.map((d) => d.menu?.plato ?? null)).toEqual([
      'Frijoles blancos con pollo desmechado, zanahoria o chayote',
      'Pasta de cerdo en salsa criolla con papas',
      'Pescado empanizado (con limón en rodaja)',
      'Arroz mixto de pollo, cerdo y huevo',
      'Olla de carne',
    ])
  })
})
