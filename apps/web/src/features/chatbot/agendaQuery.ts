/**
 * Analizador Temporal y Resolutor de Consultas de Agenda Estudiantil en Español.
 *
 * Determina el rango de fechas objetivo y filtros semánticos (tareas, exámenes,
 * ausencias de docentes, recordatorios) a partir de mensajes en lenguaje natural,
 * y genera respuestas estructuradas que confirman o niegan explícitamente la
 * existencia de actividades según la zona horaria 'America/Costa_Rica'.
 *
 * Regla de Oro: Cero caracteres emojis o pictogramas Unicode en todo el módulo.
 */

import { addDays, format, startOfWeek } from 'date-fns'
import type { EventoAgenda, TipoEventoAgenda } from '@/features/agenda/agenda.types'
import { obtenerEtiquetaTipo } from '@/features/agenda/agenda.service'
import type { RespuestaChat } from './chatbot.types'

export type AmbitoTemporalAgenda =
  | 'dia_especifico'
  | 'mes'
  | 'ano'
  | 'general'

export interface RangoConsultaAgenda {
  ambito: AmbitoTemporalAgenda
  fechaInicioIso: string
  fechaFinIso: string
  etiquetaPeriodo: string
  filtroTipo?: TipoEventoAgenda
}

const MESES_MAP: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  setiembre: 8,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
}

const NOMBRES_MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'setiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const DIAS_SEMANA_MAP: Record<string, number> = {
  lunes: 0,
  martes: 1,
  miercoles: 2,
  jueves: 3,
  viernes: 4,
  sabado: 5,
  domingo: 6,
}

const NOMBRES_DIAS_SEMANA = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
]

/**
 * Normaliza una cadena de texto eliminando diacríticos, convirtiendo a minúsculas
 * y comprimiendo espacios consecutivos.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) en lenguaje natural en español (Costa Rica).
 * Ej: "lunes 16 de noviembre de 2026".
 */
export function formatearFechaEspanol(
  fechaIso: string,
  incluirDiaSemana: boolean = true,
): string {
  try {
    const partes = fechaIso.split('-').map(Number)
    if (partes.length !== 3 || partes.some(isNaN)) {
      return fechaIso
    }
    const [ano, mes, dia] = partes
    // Instanciar en mediodía local para evitar desfases de huso horario
    const fecha = new Date(ano, mes - 1, dia, 12, 0, 0)
    const nombreMes = NOMBRES_MESES[mes - 1] ?? ''

    if (!incluirDiaSemana) {
      return `${dia} de ${nombreMes} de ${ano}`
    }

    // Día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
    const diaIndexJs = fecha.getDay()
    const diaSemanaNombre = diaIndexJs === 0 ? 'domingo' : NOMBRES_DIAS_SEMANA[diaIndexJs - 1]

    return `${diaSemanaNombre} ${dia} de ${nombreMes} de ${ano}`
  } catch {
    return fechaIso
  }
}

/**
 * Construye una cadena YYYY-MM-DD a partir de año, mes (0-11) y día (1-31).
 */
function construirIso(ano: number, mesIndex: number, dia: number): string {
  const y = String(ano).padStart(4, '0')
  const m = String(mesIndex + 1).padStart(2, '0')
  const d = String(dia).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Obtiene el último día del mes dado (1..31).
 */
function ultimoDiaDelMes(ano: number, mesIndex: number): number {
  return new Date(ano, mesIndex + 1, 0).getDate()
}

/**
 * Detecta si la consulta del usuario apunta a una categoría específica de la agenda.
 */
export function detectarFiltroTipo(textoNorm: string): TipoEventoAgenda | undefined {
  const pideTareas = /\b(tarea|tareas|deber|deberes|practica|practicas|proyecto|proyectos)\b/.test(textoNorm)
  const pideExamenes = /\b(examen|examenes|prueba|pruebas|parcial|parciales|quiz|quices)\b/.test(textoNorm)
  const pideAusencias = /\b(ausencia|ausencias|profesor ausente|docente ausente)\b/.test(textoNorm)
  const pideRecordatorios = /\b(recordatorio|recordatorios)\b/.test(textoNorm)

  // Si pide tanto tareas como exámenes u otra combinación, no filtrar por un solo tipo
  const conteoFiltros = [pideTareas, pideExamenes, pideAusencias, pideRecordatorios].filter(Boolean).length
  if (conteoFiltros !== 1) {
    return undefined
  }

  if (pideTareas) return 'tarea'
  if (pideExamenes) return 'examen'
  if (pideAusencias) return 'ausencia_profesor'
  if (pideRecordatorios) return 'recordatorio'
  return undefined
}

/**
 * Analiza el mensaje del usuario y determina el rango temporal aplicable a la consulta.
 */
export function resolverRangoAgenda(
  mensaje: string,
  fechaReferencia: Date = new Date(),
): RangoConsultaAgenda {
  const t = normalizarTexto(mensaje)
  const filtroTipo = detectarFiltroTipo(t)
  const refAno = fechaReferencia.getFullYear()
  const refMes = fechaReferencia.getMonth()

  // 1. Días relativos específicos: "pasado mañana", "mañana", "antier", "anteayer", "ayer", "hoy"
  if (t.includes('pasado manana')) {
    const f = addDays(fechaReferencia, 2)
    const iso = format(f, 'yyyy-MM-dd')
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `pasado mañana (${formatearFechaEspanol(iso)})`,
      filtroTipo,
    }
  }

  if (t.includes('manana')) {
    const f = addDays(fechaReferencia, 1)
    const iso = format(f, 'yyyy-MM-dd')
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `mañana (${formatearFechaEspanol(iso)})`,
      filtroTipo,
    }
  }

  if (t.includes('antier') || t.includes('anteayer')) {
    const f = addDays(fechaReferencia, -2)
    const iso = format(f, 'yyyy-MM-dd')
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `antier (${formatearFechaEspanol(iso)})`,
      filtroTipo,
    }
  }

  if (t.includes('ayer')) {
    const f = addDays(fechaReferencia, -1)
    const iso = format(f, 'yyyy-MM-dd')
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `ayer (${formatearFechaEspanol(iso)})`,
      filtroTipo,
    }
  }

  if (/\b(hoy|el dia de hoy)\b/.test(t)) {
    const iso = format(fechaReferencia, 'yyyy-MM-dd')
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `hoy (${formatearFechaEspanol(iso)})`,
      filtroTipo,
    }
  }

  // 2. Fecha numérica explícita: YYYY-MM-DD
  const matchIso = t.match(/\b(20\d\d)-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])\b/)
  if (matchIso) {
    const y = parseInt(matchIso[1], 10)
    const m = parseInt(matchIso[2], 10) - 1
    const d = parseInt(matchIso[3], 10)
    const iso = construirIso(y, m, d)
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `el ${formatearFechaEspanol(iso)}`,
      filtroTipo,
    }
  }

  // 3. Fecha numérica en formato DD/MM/YYYY o DD-MM-YYYY
  const matchDdMmYyyy = t.match(/\b(0?[1-9]|[12]\d|3[01])[/-](0?[1-9]|1[0-2])[/-](20\d\d)\b/)
  if (matchDdMmYyyy) {
    const d = parseInt(matchDdMmYyyy[1], 10)
    const m = parseInt(matchDdMmYyyy[2], 10) - 1
    const y = parseInt(matchDdMmYyyy[3], 10)
    const iso = construirIso(y, m, d)
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `el ${formatearFechaEspanol(iso)}`,
      filtroTipo,
    }
  }

  // 4. Fecha textual: "el 15 de noviembre [de 2026]"
  const matchTextoFecha = t.match(
    /\b(?:el\s+)?(0?[1-9]|[12]\d|3[01])\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|setiembre|septiembre|octubre|noviembre|diciembre)(?:\s+de(?:l)?\s+(20\d\d))?\b/,
  )
  if (matchTextoFecha) {
    const d = parseInt(matchTextoFecha[1], 10)
    const mesNombre = matchTextoFecha[2]
    const m = MESES_MAP[mesNombre] ?? refMes
    const y = matchTextoFecha[3] ? parseInt(matchTextoFecha[3], 10) : refAno
    const iso = construirIso(y, m, d)
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `el ${formatearFechaEspanol(iso)}`,
      filtroTipo,
    }
  }

  // 5. Fecha contextual: "el 20 de este mes"
  const matchDiaEsteMes = t.match(/\b(?:el\s+)?(0?[1-9]|[12]\d|3[01])\s+de\s+este\s+mes\b/)
  if (matchDiaEsteMes) {
    const d = parseInt(matchDiaEsteMes[1], 10)
    const iso = construirIso(refAno, refMes, d)
    return {
      ambito: 'dia_especifico',
      fechaInicioIso: iso,
      fechaFinIso: iso,
      etiquetaPeriodo: `el ${formatearFechaEspanol(iso)}`,
      filtroTipo,
    }
  }

  // 6. Días nombrados de la semana: "el lunes", "este viernes", "para el miercoles"
  const nombresSemana = Object.keys(DIAS_SEMANA_MAP)
  for (const diaNom of nombresSemana) {
    const regexDia = new RegExp(`\\b(?:el\\s+|este\\s+|para\\s+el\\s+)?${diaNom}\\b`)
    if (regexDia.test(t)) {
      const targetDiaIndex = DIAS_SEMANA_MAP[diaNom]
      const lunesSemana = startOfWeek(fechaReferencia, { weekStartsOn: 1 })
      const fechaCalculada = addDays(lunesSemana, targetDiaIndex)
      const iso = format(fechaCalculada, 'yyyy-MM-dd')
      return {
        ambito: 'dia_especifico',
        fechaInicioIso: iso,
        fechaFinIso: iso,
        etiquetaPeriodo: `el ${diaNom} (${formatearFechaEspanol(iso)})`,
        filtroTipo,
      }
    }
  }

  // 7. Mes textual explícito: "en noviembre [de 2026]", "actividades de octubre", "para el mes de diciembre"
  const matchMes = t.match(
    /\b(?:en|para|de|mes\s+de)\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|setiembre|septiembre|octubre|noviembre|diciembre)(?:\s+de(?:l)?\s+(20\d\d))?\b/,
  )
  if (matchMes) {
    const mesNombre = matchMes[1]
    const m = MESES_MAP[mesNombre] ?? refMes
    const y = matchMes[2] ? parseInt(matchMes[2], 10) : refAno
    const ultimoDia = ultimoDiaDelMes(y, m)
    const inicio = construirIso(y, m, 1)
    const fin = construirIso(y, m, ultimoDia)
    return {
      ambito: 'mes',
      fechaInicioIso: inicio,
      fechaFinIso: fin,
      etiquetaPeriodo: `${mesNombre} de ${y}`,
      filtroTipo,
    }
  }

  // 8. Mes relativo: "este mes", "el proximo mes", "mes que viene", "el mes pasado"
  if (t.includes('este mes')) {
    const ultimoDia = ultimoDiaDelMes(refAno, refMes)
    return {
      ambito: 'mes',
      fechaInicioIso: construirIso(refAno, refMes, 1),
      fechaFinIso: construirIso(refAno, refMes, ultimoDia),
      etiquetaPeriodo: `este mes (${NOMBRES_MESES[refMes]} de ${refAno})`,
      filtroTipo,
    }
  }

  if (t.includes('proximo mes') || t.includes('mes que viene') || t.includes('mes siguiente')) {
    const sigFecha = new Date(refAno, refMes + 1, 1)
    const y = sigFecha.getFullYear()
    const m = sigFecha.getMonth()
    const ultimoDia = ultimoDiaDelMes(y, m)
    return {
      ambito: 'mes',
      fechaInicioIso: construirIso(y, m, 1),
      fechaFinIso: construirIso(y, m, ultimoDia),
      etiquetaPeriodo: `el próximo mes (${NOMBRES_MESES[m]} de ${y})`,
      filtroTipo,
    }
  }

  // 9. Año explícito o relativo: "en 2026", "para el 2027", "este ano", "proximo ano"
  const matchAno = t.match(/\b(?:en|para\s+el|del?|ano)\s+(20\d\d)\b/)
  if (matchAno) {
    const y = parseInt(matchAno[1], 10)
    return {
      ambito: 'ano',
      fechaInicioIso: `${y}-01-01`,
      fechaFinIso: `${y}-12-31`,
      etiquetaPeriodo: `el año ${y}`,
      filtroTipo,
    }
  }

  if (t.includes('este ano') || t.includes('este anio')) {
    return {
      ambito: 'ano',
      fechaInicioIso: `${refAno}-01-01`,
      fechaFinIso: `${refAno}-12-31`,
      etiquetaPeriodo: `este año (${refAno})`,
      filtroTipo,
    }
  }

  if (t.includes('proximo ano') || t.includes('proximo anio') || t.includes('ano que viene')) {
    const y = refAno + 1
    return {
      ambito: 'ano',
      fechaInicioIso: `${y}-01-01`,
      fechaFinIso: `${y}-12-31`,
      etiquetaPeriodo: `el próximo año (${y})`,
      filtroTipo,
    }
  }

  // 10. Por defecto: consulta general (actividades desde hoy en adelante)
  const hoyIso = format(fechaReferencia, 'yyyy-MM-dd')
  return {
    ambito: 'general',
    fechaInicioIso: hoyIso,
    fechaFinIso: '9999-12-31',
    etiquetaPeriodo: 'las próximas actividades en tu agenda',
    filtroTipo,
  }
}

/**
 * Filtra y ordena cronológicamente los eventos de la agenda según el rango especificado.
 */
export function filtrarEventosPorRango(
  eventos: EventoAgenda[],
  rango: RangoConsultaAgenda,
): EventoAgenda[] {
  return eventos
    .filter((e) => {
      // Filtro de rango de fechas
      if (e.fecha < rango.fechaInicioIso || e.fecha > rango.fechaFinIso) {
        return false
      }
      // Filtro de categoría si fue explícita en la consulta
      if (rango.filtroTipo && e.tipo !== rango.filtroTipo) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (a.fecha !== b.fecha) {
        return a.fecha.localeCompare(b.fecha)
      }
      return (a.hora || '23:59').localeCompare(b.hora || '23:59')
    })
}

/**
 * Formatea una línea detallada para una actividad de la agenda.
 * Incluye: Título, tipo, materia, fecha exacta formateada y detalles relevantes.
 */
function formatearDetalleEvento(ev: EventoAgenda): string {
  const etiquetaTipo = obtenerEtiquetaTipo(ev.tipo)
  const fechaTexto = formatearFechaEspanol(ev.fecha, true)
  const horaTexto = ev.hora ? ` | Hora: ${ev.hora}` : ''

  const extras: string[] = []

  if (ev.tipo === 'tarea') {
    const estado = ev.completada ? 'Completada' : 'Pendiente'
    extras.push(`Estado: ${estado}`)
    if (ev.prioridad) {
      extras.push(`Prioridad: ${ev.prioridad}`)
    }
  } else if (ev.tipo === 'examen') {
    if (ev.porcentaje) {
      extras.push(`Valor: ${ev.porcentaje}%`)
    }
    if (ev.aula) {
      extras.push(`Aula: ${ev.aula}`)
    }
  } else if (ev.tipo === 'ausencia_profesor') {
    if (ev.profesor) {
      extras.push(`Docente: ${ev.profesor}`)
    }
    if (ev.bloqueAfectado) {
      extras.push(`Bloque: ${ev.bloqueAfectado}`)
    }
    if (ev.indicacion) {
      extras.push(`Indicación: ${ev.indicacion}`)
    }
  }

  const detallesExtras = extras.length > 0 ? ` | ${extras.join(' | ')}` : ''
  const materiaTexto = ev.materia ? ` — Materia: ${ev.materia}` : ''

  return `• **${ev.titulo}** (${etiquetaTipo})${materiaTexto} | Fecha: ${fechaTexto}${horaTexto}${detallesExtras}`
}

/**
 * Responde de manera determinista y estructurada en español a consultas de la Agenda.
 * Confirma o niega explícitamente la presencia de actividades y detalla sus datos.
 */
export function responderConsultaAgenda(
  mensaje: string,
  eventos: EventoAgenda[],
  fechaReferencia: Date = new Date(),
): RespuestaChat {
  const rango = resolverRangoAgenda(mensaje, fechaReferencia)
  const eventosEncontrados = filtrarEventosPorRango(eventos, rango)
  const hoyIso = format(fechaReferencia, 'yyyy-MM-dd')

  // CASO 1: Sí se encontraron actividades para el periodo consultado
  if (eventosEncontrados.length > 0) {
    const cantidad = eventosEncontrados.length
    const plural = cantidad === 1 ? 'actividad' : 'actividades'

    let encabezado: string
    if (rango.ambito === 'dia_especifico') {
      encabezado = `Sí, tienes ${cantidad} ${plural} programada${cantidad === 1 ? '' : 's'} en tu agenda para ${rango.etiquetaPeriodo}:`
    } else {
      encabezado = `Sí, encontré ${cantidad} ${plural} programada${cantidad === 1 ? '' : 's'} en tu agenda para ${rango.etiquetaPeriodo}:`
    }

    const items = eventosEncontrados.map(formatearDetalleEvento).join('\n')

    return {
      texto: `${encabezado}\n\n${items}`,
    }
  }

  // CASO 2: NO se encontraron actividades para el periodo consultado
  let encabezadoNegativo = `No hay actividades registradas en tu agenda para ${rango.etiquetaPeriodo}.`
  if (rango.filtroTipo) {
    const etiquetaTipo = obtenerEtiquetaTipo(rango.filtroTipo).toLowerCase()
    encabezadoNegativo = `No tienes ${etiquetaTipo}s registradas en tu agenda para ${rango.etiquetaPeriodo}.`
  }

  // Buscar la próxima actividad futura registrada para orientar al estudiante
  const proximas = eventos
    .filter((e) => e.fecha >= hoyIso)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora || '23:59').localeCompare(b.hora || '23:59'))

  if (proximas.length > 0) {
    const proxima = proximas[0]
    const proximaFecha = formatearFechaEspanol(proxima.fecha, true)
    const tipo = obtenerEtiquetaTipo(proxima.tipo)
    const materia = proxima.materia ? ` de ${proxima.materia}` : ''
    const hora = proxima.hora ? ` a las ${proxima.hora}` : ''

    return {
      texto:
        `${encabezadoNegativo}\n\n` +
        `Tu próxima actividad programada es **${proxima.titulo}** (${tipo}${materia}) para el **${proximaFecha}**${hora}.`,
    }
  }

  return {
    texto:
      `${encabezadoNegativo}\n\n` +
      `Actualmente no tienes tareas, exámenes ni eventos pendientes registrados en tu agenda personal.`,
  }
}
