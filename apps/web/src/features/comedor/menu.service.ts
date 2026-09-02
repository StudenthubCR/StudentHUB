import {
  addDays,
  differenceInCalendarWeeks,
  format,
  isWeekend,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { sinAcentos } from '@/lib/texto'
import type { FilaComedor } from './comedor.api'
import type { DiaDeLaSemana, EstadoDelDia, MenuDia } from './menu.types'

/**
 * Toda la lógica del comedor vive aquí y es pura: ninguna función llama a
 * `new Date()` por su cuenta, la fecha siempre entra por parámetro. Así las
 * pruebas del fin de semana son deterministas sin falsear el reloj, y el día
 * que los menús vengan de Postgres nada de esto cambia.
 */

/* -------------------------------------------------------------------------
   El ciclo de menús de la hoja de cálculo
   -------------------------------------------------------------------------
   La hoja no guarda fechas: guarda "semana 1..5" y el nombre del día. El menú
   es un ciclo rotativo de cinco semanas que se repite. Para no volver a la
   `comedorSemanaActiva` que había que subir a mano cada lunes, la semana del
   ciclo se calcula a partir de una sola ancla real.

   INICIO_DEL_CICLO lo confirmó el equipo: la semana del lunes 31 de agosto de
   2026 es la semana 1 del ciclo. Ojo con `comedorSemanaActiva: 4` en
   `js/config.js`: esa constante quedó vieja, y es exactamente el motivo por el
   que la semana ya no se escribe a mano. Si algún día el ciclo se reinicia en
   otra fecha, se corrige aquí y sólo aquí.
   ------------------------------------------------------------------------- */

/** Lunes en que arrancó la semana 1 del ciclo. */
export const INICIO_DEL_CICLO = '2026-08-31'

/** Cuántas semanas tiene el ciclo antes de repetirse (la hoja trae 5). */
export const SEMANAS_DEL_CICLO = 5

/** Qué semana del ciclo (1..5) le toca a la semana que contiene `fecha`. */
export function semanaDelCiclo(fecha: Date): number {
  const lunes = startOfWeek(fecha, { weekStartsOn: 1 })
  const inicio = startOfWeek(parseISO(INICIO_DEL_CICLO), { weekStartsOn: 1 })
  const transcurridas = differenceInCalendarWeeks(lunes, inicio, { weekStartsOn: 1 })
  // El módulo de JavaScript conserva el signo: esto lo normaliza para que las
  // fechas anteriores al inicio del ciclo también caigan en 1..5.
  const indice =
    ((transcurridas % SEMANAS_DEL_CICLO) + SEMANAS_DEL_CICLO) % SEMANAS_DEL_CICLO
  return indice + 1
}

const DIAS_HABILES = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']

/** 'Miércoles' → 'miercoles'. La hoja no siempre escribe igual los acentos. */
export function normalizarDia(texto: string): string {
  return sinAcentos(texto)
}

/** La fecha real de un nombre de día dentro de la semana que empieza en `lunes`. */
export function fechaDelDia(lunes: Date, nombreDia: string): Date | null {
  const indice = DIAS_HABILES.indexOf(normalizarDia(nombreDia))
  return indice === -1 ? null : addDays(lunes, indice)
}

function textoDe(valor: unknown, porDefecto: string): string {
  const texto = typeof valor === 'string' ? valor.trim() : ''
  return texto || porDefecto
}

/**
 * Convierte las filas de la hoja en menús con fecha real. Es el único punto
 * donde el modelo "semana + día" de la hoja se traduce al modelo por fecha del
 * plan (§4.3): cuando la fuente sea Postgres, esta función desaparece y el
 * resto del código sigue igual.
 */
export function filasAMenus(filas: FilaComedor[], lunes: Date): MenuDia[] {
  const menus: MenuDia[] = []

  for (const fila of filas) {
    const fecha = fechaDelDia(lunes, textoDe(fila.dia, ''))
    if (!fecha) continue // fila con un día que no reconocemos: se ignora

    menus.push({
      fecha: claveDeFecha(fecha),
      plato: textoDe(fila.plato, 'No programado'),
      acompanamiento: textoDe(fila.acompanamiento, 'No programado'),
      bebida: textoDe(fila.bebida, 'Agua pura'),
      fruta: textoDe(fila.postre, 'Fruta de temporada'),
    })
  }

  return menus
}

/** Llave de un día en el mismo formato que la columna `fecha` de la tabla. */
export function claveDeFecha(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd')
}

/**
 * Convierte una llave `yyyy-MM-dd` en fecha local. Importa que sea local y no
 * UTC: `new Date('2026-08-31')` da el 30 de agosto a las 18:00 en Costa Rica,
 * lo que correría todo el menú un día.
 */
export function fechaDeClave(clave: string): Date {
  return parseISO(clave)
}

/** El comedor no da servicio sábados ni domingos. */
export function esFinDeSemana(fecha: Date): boolean {
  return isWeekend(fecha)
}

/** Índice de los menús por fecha, para no recorrer el arreglo en cada día. */
export function indexarMenus(menus: MenuDia[]): Map<string, MenuDia> {
  return new Map(menus.map((menu) => [menu.fecha, menu]))
}

/** Los cinco días hábiles (lunes a viernes) de la semana que contiene `fecha`. */
export function semanaHabilDe(fecha: Date): Date[] {
  const lunes = startOfWeek(fecha, { weekStartsOn: 1 })
  return Array.from({ length: 5 }, (_, i) => addDays(lunes, i))
}

/**
 * Qué semana toca mostrar en la parrilla. Entre semana, la actual; el fin de
 * semana, la siguiente — igual que hace la app hoy, porque el sábado ya no
 * queda nada que consultar de la semana que terminó.
 */
export function semanaAMostrar(fecha: Date): Date[] {
  const base = esFinDeSemana(fecha) ? addDays(fecha, 3) : fecha
  return semanaHabilDe(base)
}

/** Los días de una semana con su menú, o `null` si ese día no tiene publicado. */
export function menusDeSemana(menus: MenuDia[], dias: Date[]): DiaDeLaSemana[] {
  const indice = indexarMenus(menus)
  return dias.map((fecha) => {
    const clave = claveDeFecha(fecha)
    return { fecha, clave, menu: indice.get(clave) ?? null }
  })
}

/** El menú publicado para una fecha exacta, si existe. */
export function menuDeFecha(menus: MenuDia[], fecha: Date): MenuDia | null {
  return menus.find((menu) => menu.fecha === claveDeFecha(fecha)) ?? null
}

/**
 * El "menú de hoy": cerrado el fin de semana, el plato si está publicado, y
 * un estado honesto de "sin menú" cuando no lo está — en vez de inventar uno.
 */
export function estadoDelDia(menus: MenuDia[], fecha: Date): EstadoDelDia {
  if (esFinDeSemana(fecha)) return { tipo: 'cerrado' }
  const menu = menuDeFecha(menus, fecha)
  return menu ? { tipo: 'servido', menu } : { tipo: 'sin-menu' }
}

/** 'lunes 31 de agosto' */
export function nombreLargoDeFecha(fecha: Date): string {
  return format(fecha, "EEEE d 'de' MMMM", { locale: es })
}

/** 'Lunes' — el encabezado de cada tarjeta de la parrilla semanal. */
export function nombreDelDia(fecha: Date): string {
  const dia = format(fecha, 'EEEE', { locale: es })
  return dia.charAt(0).toUpperCase() + dia.slice(1)
}

/** '31 ago' — la etiqueta de fecha bajo el nombre del día. */
export function etiquetaCortaDeFecha(fecha: Date): string {
  return format(fecha, "d 'de' MMM", { locale: es })
}

/** 'Del 31 de agosto al 4 de setiembre' */
export function rangoDeSemana(dias: Date[]): string {
  const primero = dias[0]
  const ultimo = dias[dias.length - 1]
  if (!primero || !ultimo) return ''
  return `Del ${format(primero, "d 'de' MMMM", { locale: es })} al ${format(ultimo, "d 'de' MMMM", { locale: es })}`
}

/**
 * El Apps Script arma el acompañamiento pegando las columnas de la hoja y
 * añade el aderezo al final con el prefijo literal "Aderezo: "
 * (ver `apps-script/comedor.gs`). Eso permite volver a separarlo de forma
 * determinista para mostrarlo como un dato propio en vez de dejarlo colgando
 * al final de un párrafo largo.
 */
export function separarAderezo(acompanamiento: string): {
  acompanamiento: string
  aderezo: string | null
} {
  const texto = acompanamiento.trim()

  const soloAderezo = /^Aderezo:\s*(.+)$/i.exec(texto)
  if (soloAderezo) return { acompanamiento: '', aderezo: soloAderezo[1]!.trim() }

  const conAderezo = /^(.*?),\s*Aderezo:\s*(.+)$/i.exec(texto)
  if (conAderezo) {
    return { acompanamiento: conAderezo[1]!.trim(), aderezo: conAderezo[2]!.trim() }
  }

  return { acompanamiento: texto, aderezo: null }
}
