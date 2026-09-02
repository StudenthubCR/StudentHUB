import { describe, expect, it } from 'vitest'
import {
  abreviarDia,
  aClases,
  agruparPorDia,
  ahoraEnMinutos,
  aMinutos,
  diaPorDefecto,
  jornadaDelDia,
  progresoDelDia,
  unirConsecutivas,
} from './horario.service'
import type { FilaHorario } from './horario.types'

const fecha = (anio: number, mes: number, dia: number, hora = 0, minuto = 0) =>
  new Date(anio, mes - 1, dia, hora, minuto)

const LUNES = fecha(2026, 8, 31)
const SABADO = fecha(2026, 9, 5)

/** El lunes real del grupo 11-2: tres bloques de la misma materia con la cena en medio. */
const LUNES_11_2: FilaHorario[] = [
  { grupo: '11-2', dia: 'Lunes', hora: '5:50pm-6:35pm', materia: 'Diseño software' },
  { grupo: '11-2', dia: 'Lunes', hora: '6:35pm-7:20pm', materia: 'Diseño software' },
  { grupo: '11-2', dia: 'Lunes', hora: '7:20pm-7:40pm', materia: 'Cena' },
  { grupo: '11-2', dia: 'Lunes', hora: '7:40pm-8:25pm', materia: 'Diseño software' },
  { grupo: '11-2', dia: 'Lunes', hora: '8:25pm-9:05pm', materia: 'Inglés' },
  { grupo: '11-2', dia: 'Lunes', hora: '9:05pm-9:50pm', materia: 'Inglés' },
]

const bloquesDelLunes = () => unirConsecutivas(aClases(LUNES_11_2))

describe('aMinutos', () => {
  it('interpreta el formato de 12 horas de la hoja', () => {
    expect(aMinutos('5:50pm')).toBe(17 * 60 + 50)
    expect(aMinutos('9:50pm')).toBe(21 * 60 + 50)
    expect(aMinutos('7:20am')).toBe(7 * 60 + 20)
  })

  it('resuelve bien las doce, que es donde siempre se falla', () => {
    expect(aMinutos('12:00am')).toBe(0)
    expect(aMinutos('12:30am')).toBe(30)
    expect(aMinutos('12:00pm')).toBe(12 * 60)
    expect(aMinutos('12:15pm')).toBe(12 * 60 + 15)
  })

  it('acepta también el formato de 24 horas', () => {
    expect(aMinutos('17:50')).toBe(17 * 60 + 50)
    expect(aMinutos('07:05')).toBe(7 * 60 + 5)
  })

  it('tolera espacios y mayúsculas', () => {
    expect(aMinutos('  5:50 PM ')).toBe(17 * 60 + 50)
  })

  it('devuelve null en vez de inventarse una hora', () => {
    for (const basura of ['', '—', 'mañana', '25:00', '5:70pm', '13:00pm', '0:30pm']) {
      expect(aMinutos(basura)).toBeNull()
    }
  })
})

describe('ahoraEnMinutos', () => {
  it('cuenta los minutos transcurridos del día', () => {
    expect(ahoraEnMinutos(fecha(2026, 9, 2, 18, 30))).toBe(18 * 60 + 30)
    expect(ahoraEnMinutos(fecha(2026, 9, 2, 0, 0))).toBe(0)
  })
})

describe('unirConsecutivas', () => {
  it('une las lecciones seguidas de la misma materia', () => {
    const bloques = bloquesDelLunes()
    expect(bloques.map((bloque) => bloque.materia)).toEqual([
      'Diseño software',
      'Cena',
      'Diseño software',
      'Inglés',
    ])
  })

  it('el bloque unido abarca de la primera hora a la última', () => {
    const primero = bloquesDelLunes()[0]!
    expect(primero).toMatchObject({ inicio: '5:50pm', fin: '7:20pm', lecciones: 2 })
  })

  it('NO une dos tandas de la misma materia separadas por la cena', () => {
    // Es el punto del asunto: son dos momentos distintos del día.
    const bloques = bloquesDelLunes()
    const disenio = bloques.filter((bloque) => bloque.materia === 'Diseño software')
    expect(disenio).toHaveLength(2)
    expect(disenio[1]).toMatchObject({ inicio: '7:40pm', fin: '8:25pm', lecciones: 1 })
  })

  it('cuenta cuántas lecciones entraron en cada bloque', () => {
    expect(bloquesDelLunes().map((bloque) => bloque.lecciones)).toEqual([2, 1, 1, 2])
  })

  it('tampoco une si hay un hueco de tiempo entre las dos lecciones', () => {
    const conHueco = aClases([
      { grupo: '11-2', dia: 'Lunes', hora: '5:50pm-6:35pm', materia: 'Inglés' },
      { grupo: '11-2', dia: 'Lunes', hora: '8:00pm-8:45pm', materia: 'Inglés' },
    ])
    expect(unirConsecutivas(conHueco)).toHaveLength(2)
  })

  it('no se cae con una lista vacía', () => {
    expect(unirConsecutivas([])).toEqual([])
  })

  it('conserva la marca de receso', () => {
    expect(bloquesDelLunes()[1]).toMatchObject({ materia: 'Cena', esReceso: true })
  })
})

describe('jornadaDelDia', () => {
  it('va de la primera hora a la última', () => {
    expect(jornadaDelDia(bloquesDelLunes())).toEqual({ inicio: '5:50pm', fin: '9:50pm' })
  })

  it('devuelve null cuando no hay bloques', () => {
    expect(jornadaDelDia([])).toBeNull()
  })
})

describe('progresoDelDia', () => {
  const bloques = bloquesDelLunes()
  // Bloques: 0) 5:50–7:20  1) Cena 7:20–7:40  2) 7:40–8:25  3) 8:25–9:50

  it('antes de empezar no hay nada en curso y el próximo es el primero', () => {
    expect(progresoDelDia(bloques, aMinutos('3:00pm')!)).toEqual({ actual: null, siguiente: 0 })
  })

  it('en plena lección marca el bloque en curso', () => {
    expect(progresoDelDia(bloques, aMinutos('6:00pm')!)).toEqual({ actual: 0, siguiente: 1 })
  })

  it('durante la cena marca la cena', () => {
    expect(progresoDelDia(bloques, aMinutos('7:30pm')!)).toEqual({ actual: 1, siguiente: 2 })
  })

  it('el instante de arranque ya cuenta como en curso', () => {
    expect(progresoDelDia(bloques, aMinutos('5:50pm')!).actual).toBe(0)
  })

  it('el instante de cierre ya no cuenta: pertenece al siguiente', () => {
    expect(progresoDelDia(bloques, aMinutos('7:20pm')!).actual).toBe(1)
  })

  it('terminada la jornada no hay actual ni siguiente', () => {
    expect(progresoDelDia(bloques, aMinutos('10:30pm')!)).toEqual({
      actual: null,
      siguiente: null,
    })
  })

  it('ignora los bloques con hora ilegible en vez de romperse', () => {
    const conBasura = unirConsecutivas(
      aClases([
        { grupo: '11-2', dia: 'Lunes', hora: 'a convenir', materia: 'Tutoría' },
        { grupo: '11-2', dia: 'Lunes', hora: '5:50pm-6:35pm', materia: 'Inglés' },
      ]),
    )
    expect(progresoDelDia(conBasura, aMinutos('6:00pm')!)).toEqual({ actual: 1, siguiente: null })
  })
})

describe('abreviarDia', () => {
  it('abrevia los días de la semana', () => {
    expect(abreviarDia('Lunes')).toBe('Lun')
    expect(abreviarDia('Miercoles')).toBe('Mié')
    expect(abreviarDia('Miércoles')).toBe('Mié')
    expect(abreviarDia('Viernes')).toBe('Vie')
  })

  it('recorta lo que no reconoce en vez de dejarlo largo', () => {
    expect(abreviarDia('Sin día')).toBe('Sin')
  })
})

describe('diaPorDefecto', () => {
  const dias = agruparPorDia(aClases(LUNES_11_2), LUNES)

  it('abre el horario en el día de hoy', () => {
    expect(diaPorDefecto(dias)).toBe('Lunes')
  })

  it('el fin de semana abre en el primer día con clases', () => {
    const enSabado = agruparPorDia(aClases(LUNES_11_2), SABADO)
    expect(enSabado.some((dia) => dia.esHoy)).toBe(false)
    expect(diaPorDefecto(enSabado)).toBe('Lunes')
  })

  it('devuelve null cuando no hay ningún día', () => {
    expect(diaPorDefecto([])).toBeNull()
  })
})

describe('agruparPorDia con bloques', () => {
  it('cada día trae su abreviatura y sus bloques ya unidos', () => {
    const [lunes] = agruparPorDia(aClases(LUNES_11_2), LUNES)
    expect(lunes).toMatchObject({ dia: 'Lunes', abreviatura: 'Lun', esHoy: true })
    expect(lunes!.clases).toHaveLength(6)
    expect(lunes!.bloques).toHaveLength(4)
  })
})
