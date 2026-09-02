import { describe, expect, it } from 'vitest'
import {
  claveDeFecha,
  esFinDeSemana,
  estadoDelDia,
  etiquetaCortaDeFecha,
  fechaDeClave,
  menuDeFecha,
  menusDeSemana,
  nombreDelDia,
  rangoDeSemana,
  separarAderezo,
  semanaAMostrar,
  semanaHabilDe,
} from './menu.service'
import { MENUS } from './menus.fixture'
import type { MenuDia } from './menu.types'

/** Fechas construidas en hora local, que es como las interpreta la app. */
const fecha = (anio: number, mes: number, dia: number) => new Date(anio, mes - 1, dia)

const LUNES = fecha(2026, 8, 31)
const MARTES = fecha(2026, 9, 1)
const VIERNES = fecha(2026, 9, 4)
const SABADO = fecha(2026, 9, 5)
const DOMINGO = fecha(2026, 9, 6)
const FERIADO = fecha(2026, 9, 15) // martes 15 de setiembre: sin menú publicado
const FUERA_DE_RANGO = fecha(2026, 12, 1)

describe('claves de fecha', () => {
  it('formatea en yyyy-MM-dd usando la hora local', () => {
    expect(claveDeFecha(LUNES)).toBe('2026-08-31')
    expect(claveDeFecha(MARTES)).toBe('2026-09-01')
  })

  it('lee una clave como medianoche local, no como UTC', () => {
    // Con `new Date('2026-08-31')` esto daría el día 30 en Costa Rica.
    const leida = fechaDeClave('2026-08-31')
    expect(leida.getFullYear()).toBe(2026)
    expect(leida.getMonth()).toBe(7)
    expect(leida.getDate()).toBe(31)
  })

  it('va y vuelve sin correrse de día', () => {
    expect(claveDeFecha(fechaDeClave('2026-10-02'))).toBe('2026-10-02')
  })
})

describe('esFinDeSemana', () => {
  it('reconoce sábado y domingo', () => {
    expect(esFinDeSemana(SABADO)).toBe(true)
    expect(esFinDeSemana(DOMINGO)).toBe(true)
  })

  it('no marca los días hábiles', () => {
    for (const dia of [LUNES, MARTES, VIERNES]) {
      expect(esFinDeSemana(dia)).toBe(false)
    }
  })
})

describe('semanaHabilDe', () => {
  it('devuelve lunes a viernes, con la semana empezando en lunes', () => {
    expect(semanaHabilDe(fecha(2026, 9, 2)).map(claveDeFecha)).toEqual([
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ])
  })

  it('el domingo pertenece a la semana que termina, no a la que empieza', () => {
    expect(claveDeFecha(semanaHabilDe(DOMINGO)[0]!)).toBe('2026-08-31')
  })
})

describe('semanaAMostrar', () => {
  it('entre semana muestra la semana en curso', () => {
    expect(semanaAMostrar(MARTES).map(claveDeFecha)).toEqual([
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ])
  })

  it('el sábado adelanta a la semana siguiente', () => {
    expect(semanaAMostrar(SABADO).map(claveDeFecha)).toEqual([
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
      '2026-09-11',
    ])
  })

  it('el domingo adelanta a la misma semana siguiente que el sábado', () => {
    expect(semanaAMostrar(DOMINGO).map(claveDeFecha)).toEqual(
      semanaAMostrar(SABADO).map(claveDeFecha),
    )
  })
})

describe('menuDeFecha', () => {
  it('encuentra el menú publicado para ese día', () => {
    expect(menuDeFecha(MENUS, MARTES)?.plato).toBe('Casado tradicional de carne en salsa')
  })

  it('devuelve null cuando la fecha no tiene menú', () => {
    expect(menuDeFecha(MENUS, FUERA_DE_RANGO)).toBeNull()
    expect(menuDeFecha(MENUS, FERIADO)).toBeNull()
  })
})

describe('estadoDelDia — el menú de hoy', () => {
  it('un día hábil con menú publicado devuelve el plato', () => {
    const estado = estadoDelDia(MENUS, LUNES)
    expect(estado.tipo).toBe('servido')
    expect(estado.tipo === 'servido' && estado.menu.plato).toBe('Arroz con pollo desmechado')
  })

  it('el sábado el comedor está cerrado', () => {
    expect(estadoDelDia(MENUS, SABADO)).toEqual({ tipo: 'cerrado' })
  })

  it('el domingo el comedor está cerrado', () => {
    expect(estadoDelDia(MENUS, DOMINGO)).toEqual({ tipo: 'cerrado' })
  })

  it('el fin de semana manda aunque hubiera un menú cargado con esa fecha', () => {
    const conMenuElSabado: MenuDia[] = [
      ...MENUS,
      {
        fecha: '2026-09-05',
        plato: 'Cargado por error',
        acompanamiento: '—',
        bebida: '—',
        fruta: '—',
      },
    ]
    expect(estadoDelDia(conMenuElSabado, SABADO)).toEqual({ tipo: 'cerrado' })
  })

  it('un día hábil sin menú publicado no inventa uno', () => {
    expect(estadoDelDia(MENUS, FERIADO)).toEqual({ tipo: 'sin-menu' })
    expect(estadoDelDia(MENUS, FUERA_DE_RANGO)).toEqual({ tipo: 'sin-menu' })
  })
})

describe('menusDeSemana', () => {
  it('empareja cada día hábil con su menú', () => {
    const semana = menusDeSemana(MENUS, semanaHabilDe(MARTES))
    expect(semana).toHaveLength(5)
    expect(semana.map((dia) => dia.menu?.plato ?? null)).toEqual([
      'Arroz con pollo desmechado',
      'Casado tradicional de carne en salsa',
      'Chuleta de cerdo frita',
      'Spaghettis a la boloñesa con carne de res',
      'Filet de pescado al ajillo',
    ])
  })

  it('deja en null el día sin menú y conserva los otros cuatro', () => {
    const semana = menusDeSemana(MENUS, semanaHabilDe(FERIADO))
    expect(semana.map((dia) => dia.menu === null)).toEqual([false, true, false, false, false])
  })
})

describe('formato en español', () => {
  it('nombra los días con mayúscula inicial', () => {
    expect(nombreDelDia(LUNES)).toBe('Lunes')
    expect(nombreDelDia(VIERNES)).toBe('Viernes')
  })

  it('escribe la fecha corta en español', () => {
    expect(etiquetaCortaDeFecha(LUNES)).toBe('31 de ago')
  })

  it('describe el rango de la semana', () => {
    expect(rangoDeSemana(semanaHabilDe(MARTES))).toBe('Del 31 de agosto al 4 de septiembre')
  })
})

describe('separarAderezo', () => {
  it('separa el aderezo que el Apps Script pega al final', () => {
    expect(
      separarAderezo(
        'Arroz blanco, Frijoles negros frescos, Aderezo: Vinagreta de vegetales',
      ),
    ).toEqual({
      acompanamiento: 'Arroz blanco, Frijoles negros frescos',
      aderezo: 'Vinagreta de vegetales',
    })
  })

  it('no se confunde con las comas que trae la ensalada', () => {
    // La columna de ensalada de la hoja tiene comas propias: el corte tiene
    // que hacerse en "Aderezo:", no en la última coma.
    expect(
      separarAderezo(
        'Arroz blanco, Repollo blanco, repollo morado y tomate, Aderezo: Vinagreta',
      ),
    ).toEqual({
      acompanamiento: 'Arroz blanco, Repollo blanco, repollo morado y tomate',
      aderezo: 'Vinagreta',
    })
  })

  it('deja el acompañamiento intacto cuando no hay aderezo', () => {
    expect(separarAderezo('Arroz blanco, Garbanzos')).toEqual({
      acompanamiento: 'Arroz blanco, Garbanzos',
      aderezo: null,
    })
  })

  it('aguanta que el aderezo sea lo único que trae la fila', () => {
    expect(separarAderezo('Aderezo: Naranja')).toEqual({
      acompanamiento: '',
      aderezo: 'Naranja',
    })
  })

  it('recorta los espacios sobrantes', () => {
    expect(separarAderezo('  Arroz blanco ,  Aderezo:   Limón  ')).toEqual({
      acompanamiento: 'Arroz blanco',
      aderezo: 'Limón',
    })
  })
})

describe('integridad del fixture', () => {
  it('no tiene fechas repetidas', () => {
    const claves = MENUS.map((menu) => menu.fecha)
    expect(new Set(claves).size).toBe(claves.length)
  })

  it('no publica menús en fin de semana', () => {
    const enFinDeSemana = MENUS.filter((menu) => esFinDeSemana(fechaDeClave(menu.fecha)))
    expect(enFinDeSemana).toEqual([])
  })

  it('todos los campos vienen llenos', () => {
    for (const menu of MENUS) {
      expect(menu.plato.length).toBeGreaterThan(0)
      expect(menu.acompanamiento.length).toBeGreaterThan(0)
      expect(menu.bebida.length).toBeGreaterThan(0)
      expect(menu.fruta.length).toBeGreaterThan(0)
    }
  })
})
