import { describe, expect, it } from 'vitest'
import {
  aClases,
  agruparPorDia,
  contarLecciones,
  esGrupoValido,
  esReceso,
  filtrarPorGrupo,
  indiceDia,
  nombreDelDia,
  partirHora,
} from './horario.service'
import type { FilaHorario } from './horario.types'

const fecha = (anio: number, mes: number, dia: number) => new Date(anio, mes - 1, dia)

const LUNES = fecha(2026, 8, 31)
const MIERCOLES = fecha(2026, 9, 2)
const SABADO = fecha(2026, 9, 5)

/** Filas reales de la hoja para el grupo 11-2. Ojo: "Miercoles" sin tilde. */
const FILAS: FilaHorario[] = [
  { grupo: '11-2', dia: 'Lunes', hora: '5:50pm-6:35pm', materia: 'Diseño software' },
  { grupo: '11-2', dia: 'Lunes', hora: '6:35pm-7:20pm', materia: 'Diseño software' },
  { grupo: '11-2', dia: 'Lunes', hora: '7:20pm-7:40pm', materia: 'Cena' },
  { grupo: '11-2', dia: 'Lunes', hora: '7:40pm-8:25pm', materia: 'Inglés' },
  { grupo: '11-2', dia: 'Miercoles', hora: '5:50pm-6:35pm', materia: 'Programación web' },
  { grupo: '11-2', dia: 'Miercoles', hora: '6:35pm-7:20pm', materia: 'Soporte TI' },
  { grupo: '11-2', dia: 'Martes', hora: '5:50pm-6:35pm', materia: 'Emprendimiento' },
]

describe('indiceDia', () => {
  it('ordena de lunes a domingo', () => {
    expect(indiceDia('Lunes')).toBeLessThan(indiceDia('Viernes'))
    expect(indiceDia('Viernes')).toBeLessThan(indiceDia('Domingo'))
  })

  it('trata igual "Miercoles" y "Miércoles"', () => {
    expect(indiceDia('Miercoles')).toBe(indiceDia('Miércoles'))
    expect(indiceDia('  MIÉRCOLES ')).toBe(indiceDia('miercoles'))
  })

  it('manda al final lo que no reconoce', () => {
    expect(indiceDia('Sin día')).toBeGreaterThan(indiceDia('Domingo'))
  })
})

describe('partirHora', () => {
  it('separa inicio y fin', () => {
    expect(partirHora('5:50pm-6:35pm')).toEqual({ inicio: '5:50pm', fin: '6:35pm' })
  })

  it('aguanta espacios alrededor del guion', () => {
    expect(partirHora(' 5:50pm - 6:35pm ')).toEqual({ inicio: '5:50pm', fin: '6:35pm' })
  })

  it('deja el fin vacío cuando la celda trae una sola hora', () => {
    expect(partirHora('5:50pm')).toEqual({ inicio: '5:50pm', fin: '' })
  })

  it('no revienta con la celda vacía', () => {
    expect(partirHora('')).toEqual({ inicio: '—', fin: '' })
  })
})

describe('esReceso', () => {
  it('reconoce la cena del horario nocturno', () => {
    expect(esReceso('Cena')).toBe(true)
    expect(esReceso('CENA')).toBe(true)
  })

  it('reconoce los otros bloques que no son lección', () => {
    for (const bloque of ['Receso', 'Almuerzo', 'Descanso', 'Refrigerio']) {
      expect(esReceso(bloque)).toBe(true)
    }
  })

  it('no marca una materia como receso', () => {
    expect(esReceso('Diseño software')).toBe(false)
    expect(esReceso('Inglés')).toBe(false)
  })
})

describe('esGrupoValido', () => {
  it('acepta el código de grupo normal', () => {
    expect(esGrupoValido('11-2')).toBe(true)
  })

  it('rechaza lo que devuelve Sheets cuando la columna quedó como fecha', () => {
    // Éste es el caso real que rompe el filtro por grupo del Apps Script.
    expect(esGrupoValido('Sat Feb 11 2023 00:00:00 GMT-0600 (Central Standard Time)')).toBe(false)
  })

  it('rechaza la celda vacía', () => {
    expect(esGrupoValido('')).toBe(false)
  })
})

describe('filtrarPorGrupo', () => {
  it('se queda sólo con las filas del grupo pedido', () => {
    const mezcladas: FilaHorario[] = [
      ...FILAS,
      { grupo: '10-1', dia: 'Lunes', hora: '1pm-2pm', materia: 'Otra cosa' },
    ]
    expect(filtrarPorGrupo(mezcladas, '11-2')).toHaveLength(FILAS.length)
  })

  it('no filtra cuando la hoja arruinó la columna del grupo', () => {
    // Sin columna utilizable es preferible mostrar todo que dejar la
    // pantalla vacía.
    const rotas = FILAS.map((fila) => ({
      ...fila,
      grupo: 'Sat Feb 11 2023 00:00:00 GMT-0600 (Central Standard Time)',
    }))
    expect(filtrarPorGrupo(rotas, '11-2')).toHaveLength(FILAS.length)
  })
})

describe('aClases', () => {
  it('parte la hora y marca los recesos', () => {
    const clases = aClases(FILAS)
    expect(clases[0]).toEqual({
      dia: 'Lunes',
      hora: '5:50pm-6:35pm',
      inicio: '5:50pm',
      fin: '6:35pm',
      materia: 'Diseño software',
      esReceso: false,
    })
    expect(clases[2]!.esReceso).toBe(true)
  })

  it('rellena los huecos en vez de mostrar celdas vacías', () => {
    const rara = [{ grupo: '11-2', dia: '', hora: '', materia: '' }]
    expect(aClases(rara)[0]).toMatchObject({ dia: 'Sin día', materia: '—', inicio: '—', fin: '' })
  })
})

describe('agruparPorDia', () => {
  it('ordena los días de lunes a viernes aunque la hoja los traiga revueltos', () => {
    const dias = agruparPorDia(aClases(FILAS), LUNES)
    expect(dias.map((dia) => dia.dia)).toEqual(['Lunes', 'Martes', 'Miercoles'])
  })

  it('conserva el orden de las lecciones dentro del día', () => {
    const lunes = agruparPorDia(aClases(FILAS), LUNES)[0]!
    expect(lunes.clases.map((clase) => clase.inicio)).toEqual([
      '5:50pm',
      '6:35pm',
      '7:20pm',
      '7:40pm',
    ])
  })

  it('marca el día de hoy', () => {
    const dias = agruparPorDia(aClases(FILAS), LUNES)
    expect(dias.map((dia) => dia.esHoy)).toEqual([true, false, false])
  })

  it('reconoce hoy aunque la hoja escriba el día sin tilde', () => {
    // La hoja dice "Miercoles"; date-fns dice "miércoles".
    const dias = agruparPorDia(aClases(FILAS), MIERCOLES)
    expect(dias.find((dia) => dia.esHoy)?.dia).toBe('Miercoles')
  })

  it('el fin de semana no marca ningún día', () => {
    const dias = agruparPorDia(aClases(FILAS), SABADO)
    expect(dias.some((dia) => dia.esHoy)).toBe(false)
  })

  it('devuelve una lista vacía cuando no hay clases', () => {
    expect(agruparPorDia([], LUNES)).toEqual([])
  })
})

describe('contarLecciones', () => {
  it('no cuenta la cena como lección', () => {
    expect(contarLecciones(aClases(FILAS))).toBe(FILAS.length - 1)
  })
})

describe('nombreDelDia', () => {
  it('escribe el día en español con mayúscula inicial', () => {
    expect(nombreDelDia(LUNES)).toBe('Lunes')
    expect(nombreDelDia(MIERCOLES)).toBe('Miércoles')
  })
})
