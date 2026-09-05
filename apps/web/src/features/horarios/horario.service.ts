import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { sinAcentos } from '@/lib/texto'
import type { Bloque, Clase, DiaDeClases, FilaHorario, ProgresoDelDia } from './horario.types'

/**
 * Lógica del horario, pura: la fecha entra por parámetro y nada aquí toca la
 * red. Es lo mismo que se hizo en el comedor, y por el mismo motivo — así se
 * puede probar el "hoy" sin falsear el reloj.
 */

const ORDEN_DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

/** Posición del día en la semana; los que no reconocemos van al final. */
export function indiceDia(dia: string): number {
  const indice = ORDEN_DIAS.indexOf(sinAcentos(dia))
  return indice === -1 ? ORDEN_DIAS.length : indice
}

/** '5:50pm-6:35pm' → { inicio: '5:50pm', fin: '6:35pm' } */
export function partirHora(hora: string): { inicio: string; fin: string } {
  const partes = hora.split('-').map((parte) => parte.trim())
  let inicio = partes[0] || '—'
  const fin = partes[1] ?? ''

  // Si el fin especifica am/pm (ej: "6:35 PM" o "6:35pm") y el inicio no (ej: "5:50"),
  // propagar am/pm al inicio para que ambos tengan contexto horario completo.
  const coincidenciaFin = /\s*(am|pm)$/i.exec(fin)
  const tieneInicio = /(am|pm)$/i.test(inicio)
  if (coincidenciaFin && !tieneInicio && inicio !== '—') {
    const separador = fin.includes(' ') ? ' ' : ''
    const sufijo = coincidenciaFin[1]
    const sufijoFormateado =
      fin.slice(-2) === fin.slice(-2).toUpperCase() ? sufijo.toUpperCase() : sufijo.toLowerCase()
    inicio = `${inicio}${separador}${sufijoFormateado}`
  }

  return { inicio, fin }
}

const RECESOS = ['cena', 'receso', 'almuerzo', 'descanso', 'refrigerio']

/** Los bloques que no son lección se pintan distinto. */
export function esReceso(materia: string): boolean {
  return RECESOS.includes(sinAcentos(materia))
}

/**
 * La columna del grupo en la hoja está en texto plano, pero si alguien la
 * formatea como fecha, Sheets devuelve cosas como
 * "Sat Feb 11 2023 00:00:00 GMT-0600 (Central Standard Time)" en vez de "11-2".
 * Cuando eso pasa no se puede filtrar por grupo y hay que mostrarlo todo.
 */
export function esGrupoValido(grupo: string): boolean {
  return Boolean(grupo) && !/gmt|standard time/i.test(grupo)
}

/** Filtra por grupo, salvo que la hoja haya arruinado esa columna. */
export function filtrarPorGrupo(filas: FilaHorario[], grupo: string): FilaHorario[] {
  if (!filas.some((fila) => esGrupoValido(fila.grupo))) return filas
  const buscado = grupo.trim().toLowerCase()
  return filas.filter((fila) => fila.grupo.trim().toLowerCase() === buscado)
}

function textoDe(valor: unknown, porDefecto: string): string {
  const texto = typeof valor === 'string' ? valor.trim() : ''
  return texto || porDefecto
}

/** Convierte las filas de la hoja en lecciones. */
export function aClases(filas: FilaHorario[]): Clase[] {
  return filas.map((fila) => {
    const hora = textoDe(fila.hora, '')
    const materia = textoDe(fila.materia, '—')
    const docente = textoDe(fila.docente, '')
    return {
      dia: textoDe(fila.dia, 'Sin día'),
      hora,
      ...partirHora(hora),
      materia,
      docente: docente || undefined,
      esReceso: esReceso(materia),
    }
  })
}

/** 'Lunes' — el día de la semana de una fecha, con mayúscula inicial. */
export function nombreDelDia(fecha: Date): string {
  const dia = format(fecha, 'EEEE', { locale: es })
  return dia.charAt(0).toUpperCase() + dia.slice(1)
}

const ABREVIATURAS: Record<string, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
  domingo: 'Dom',
}

/** 'Miercoles' → 'Mié', para las pestañas. */
export function abreviarDia(dia: string): string {
  const clave = sinAcentos(dia)
  return ABREVIATURAS[clave] ?? dia.slice(0, 3)
}

/**
 * Convierte '5:50pm' en minutos desde medianoche (1070). Devuelve null si la
 * celda no tiene un formato que se pueda interpretar: en ese caso la interfaz
 * se limita a no marcar la hora, en vez de inventarse una.
 */
export function aMinutos(hora: string): number | null {
  const texto = hora.trim().toLowerCase()

  const doceHoras = /^(\d{1,2}):(\d{2})\s*(am|pm)$/.exec(texto)
  if (doceHoras) {
    const horas = Number(doceHoras[1])
    const minutos = Number(doceHoras[2])
    if (horas < 1 || horas > 12 || minutos > 59) return null
    const base = horas === 12 ? 0 : horas * 60
    return base + minutos + (doceHoras[3] === 'pm' ? 12 * 60 : 0)
  }

  const veinticuatro = /^(\d{1,2}):(\d{2})$/.exec(texto)
  if (veinticuatro) {
    const horas = Number(veinticuatro[1])
    const minutos = Number(veinticuatro[2])
    if (horas > 23 || minutos > 59) return null
    return horas * 60 + minutos
  }

  return null
}

/** Los minutos transcurridos del día para una fecha. */
export function ahoraEnMinutos(fecha: Date): number {
  return fecha.getHours() * 60 + fecha.getMinutes()
}

/** ¿El fin de una lección coincide con el inicio de la siguiente? */
function seEncadenan(fin: string, inicio: string): boolean {
  const finEnMinutos = aMinutos(fin)
  const inicioEnMinutos = aMinutos(inicio)
  if (finEnMinutos !== null && inicioEnMinutos !== null) {
    return finEnMinutos === inicioEnMinutos
  }
  return fin.trim().toLowerCase() === inicio.trim().toLowerCase()
}

/**
 * Une lecciones seguidas de la misma materia en un solo bloque.
 *
 * Sólo se unen si además son contiguas en el tiempo: dos bloques de la misma
 * materia separados por la cena siguen siendo dos tarjetas, porque en la vida
 * real son dos momentos distintos.
 */
export function unirConsecutivas(clases: Clase[]): Bloque[] {
  const bloques: Bloque[] = []

  for (const clase of clases) {
    const anterior = bloques[bloques.length - 1]
    const continua =
      anterior !== undefined &&
      anterior.materia === clase.materia &&
      (anterior.docente || '') === (clase.docente || '') &&
      Boolean(anterior.fin) &&
      Boolean(clase.inicio) &&
      seEncadenan(anterior.fin, clase.inicio)

    if (continua) {
      anterior.fin = clase.fin || anterior.fin
      anterior.lecciones += 1
      continue
    }

    bloques.push({
      materia: clase.materia,
      inicio: clase.inicio,
      fin: clase.fin,
      lecciones: 1,
      esReceso: clase.esReceso,
      docente: clase.docente,
    })
  }

  return bloques
}

/**
 * Agrupa las lecciones por día y las ordena de lunes a domingo. El orden de
 * las filas dentro de un día se respeta tal cual viene de la hoja: ahí ya
 * están en orden de lección, y las horas son texto ('5:50pm'), no algo que
 * se pueda ordenar de forma confiable.
 */
export function agruparPorDia(clases: Clase[], hoy: Date): DiaDeClases[] {
  const porDia = new Map<string, Clase[]>()

  for (const clase of clases) {
    const existentes = porDia.get(clase.dia)
    if (existentes) existentes.push(clase)
    else porDia.set(clase.dia, [clase])
  }

  const diaDeHoy = sinAcentos(nombreDelDia(hoy))

  return [...porDia.entries()]
    .sort(([unDia], [otroDia]) => indiceDia(unDia) - indiceDia(otroDia))
    .map(([dia, clasesDelDia]) => ({
      dia,
      abreviatura: abreviarDia(dia),
      esHoy: sinAcentos(dia) === diaDeHoy,
      clases: clasesDelDia,
      bloques: unirConsecutivas(clasesDelDia),
    }))
}

/** A qué hora empieza y termina un día de clases. */
export function jornadaDelDia(bloques: Bloque[]): { inicio: string; fin: string } | null {
  const primero = bloques[0]
  const ultimo = bloques[bloques.length - 1]
  if (!primero || !ultimo || !primero.inicio || !ultimo.fin) return null
  return { inicio: primero.inicio, fin: ultimo.fin }
}

/**
 * Cuál bloque está en curso y cuál sigue. Los bloques con hora ilegible se
 * saltan en vez de romper el cálculo del resto.
 */
export function progresoDelDia(bloques: Bloque[], ahora: number): ProgresoDelDia {
  let actual: number | null = null
  let siguiente: number | null = null

  bloques.forEach((bloque, indice) => {
    const desde = aMinutos(bloque.inicio)
    const hasta = aMinutos(bloque.fin)
    if (desde === null || hasta === null) return

    if (ahora >= desde && ahora < hasta) actual = indice
    else if (desde > ahora && siguiente === null) siguiente = indice
  })

  return { actual, siguiente }
}

/**
 * Qué pestaña abrir: la de hoy si hoy hay clases; si no (fin de semana,
 * feriado, día sin lecciones), el primer día de la semana.
 */
export function diaPorDefecto(dias: DiaDeClases[]): string | null {
  return dias.find((dia) => dia.esHoy)?.dia ?? dias[0]?.dia ?? null
}

/** Cuántas lecciones reales tiene el horario, sin contar cenas ni recesos. */
export function contarLecciones(clases: Clase[]): number {
  return clases.filter((clase) => !clase.esReceso).length
}
