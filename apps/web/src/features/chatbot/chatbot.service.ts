/**
 * Servicio del Chatbot de Student HUB.
 *
 * Procesa mensajes del estudiante mediante reconocimiento de intenciones
 * y genera respuestas en tiempo real conectándose a los datos vivos de la app:
 * - Eventos y Noticias dinámicas (directamente del fixture o BD)
 * - Menú del Comedor (según la fecha y ciclo activo)
 * - Horarios de Clases (por grupo y día)
 * - Carnet Digital y funciones de la app
 *
 * Resuelve referencias temporales relativas:
 * - "mañana" / "pasado mañana" -> calcula el día siguiente o subsiguiente
 * - "ayer" / "antier" -> calcula el día anterior
 * - nombres de días (lunes, martes, etc.) -> horario o menú del día solicitado
 *
 * Funciona de manera autónoma en el cliente, permitiendo funcionamiento 100%
 * offline y sin costos de API externas.
 */

import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { NOTICIAS, type Noticia } from '@/features/dashboard/noticias.fixture'
import type { MenuDia } from '@/features/comedor/menu.types'
import type { DiaDeClases, Clase } from '@/features/horarios/horario.types'

export type MensajeChat = {
  id: string
  emisor: 'usuario' | 'bot'
  texto: string
  imagen?: string
  fecha: Date
}

/**
 * Normaliza texto eliminando acentos, espacios extra y convirtiendo a minúsculas.
 */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Información de un día objetivo resuelto a partir del texto del usuario.
 */
export type DiaObjetivo = {
  fecha: Date
  etiqueta: string
  nombreDia: string
  esFinDeSemana: boolean
  esExplicito: boolean
}

/**
 * Resuelve a qué día se refiere el estudiante:
 * - "mañana" -> día siguiente
 * - "ayer" -> día anterior
 * - "pasado mañana" -> en dos días
 * - "antier" / "anteayer" -> hace dos días
 * - "lunes", "martes", etc. -> día indicado por nombre
 * - por defecto -> hoy
 */
export function resolverDiaObjetivo(texto: string, ahora: Date): DiaObjetivo {
  const t = normalizar(texto)
  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

  if (t.includes('pasado manana')) {
    const fecha = addDays(ahora, 2)
    const nombreDia = normalizar(format(fecha, 'EEEE', { locale: es }))
    const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6
    return { fecha, etiqueta: 'pasado mañana', nombreDia, esFinDeSemana, esExplicito: true }
  }

  if (t.includes('manana')) {
    const fecha = addDays(ahora, 1)
    const nombreDia = normalizar(format(fecha, 'EEEE', { locale: es }))
    const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6
    return { fecha, etiqueta: 'mañana', nombreDia, esFinDeSemana, esExplicito: true }
  }

  if (t.includes('antier') || t.includes('anteayer')) {
    const fecha = addDays(ahora, -2)
    const nombreDia = normalizar(format(fecha, 'EEEE', { locale: es }))
    const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6
    return { fecha, etiqueta: 'antier', nombreDia, esFinDeSemana, esExplicito: true }
  }

  if (t.includes('ayer')) {
    const fecha = addDays(ahora, -1)
    const nombreDia = normalizar(format(fecha, 'EEEE', { locale: es }))
    const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6
    return { fecha, etiqueta: 'ayer', nombreDia, esFinDeSemana, esExplicito: true }
  }

  // Detectar si menciona un día de la semana específico
  const diaMencionado = diasSemana.find((dia) => t.includes(dia))
  if (diaMencionado) {
    const diaIndex = diasSemana.indexOf(diaMencionado) // 0=lunes ... 6=domingo
    const lunesEstaSemana = startOfWeek(ahora, { weekStartsOn: 1 })
    const fecha = addDays(lunesEstaSemana, diaIndex)
    const esFinDeSemana = diaMencionado === 'sabado' || diaMencionado === 'domingo'
    return { fecha, etiqueta: diaMencionado, nombreDia: diaMencionado, esFinDeSemana, esExplicito: true }
  }

  // Por defecto: hoy
  const nombreDia = normalizar(format(ahora, 'EEEE', { locale: es }))
  const esFinDeSemana = ahora.getDay() === 0 || ahora.getDay() === 6
  return { fecha: ahora, etiqueta: 'hoy', nombreDia, esFinDeSemana, esExplicito: false }
}

/**
 * Detecta la intención principal de la consulta del estudiante.
 */
export type Intencion = 'comedor' | 'horarios' | 'eventos' | 'carnet' | 'ayuda' | 'saludo' | 'desconocido'

export function detectarIntencion(texto: string): Intencion {
  const t = normalizar(texto)

  const palabrasSaludo = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'hey']
  const palabrasComedor = ['comedor', 'comer', 'almuerzo', 'almorzar', 'menu', 'comida', 'plato', 'cena', 'cenar', 'desayuno']
  const palabrasHorarios = ['horario', 'clase', 'clases', 'materia', 'materias', 'leccion', 'lecciones', 'aula', 'profesor', 'tengo', 'toca']
  const palabrasEventos = ['evento', 'eventos', 'noticia', 'noticias', 'actividad', 'actividades', 'feria', 'expotecnica', 'graduacion', 'matricula', 'artes', 'civica', 'patrias']
  const palabrasCarnet = ['carnet', 'qr', 'credencial', 'offline', 'identificacion', 'foto', 'descargar carnet']
  const palabrasAyuda = ['ayuda', 'que haces', 'que puedes hacer', 'comandos', 'funciones', 'opciones']

  if (palabrasSaludo.some((p) => t === p || t.startsWith(p + ' '))) return 'saludo'
  if (palabrasEventos.some((p) => t.includes(p))) return 'eventos'
  if (palabrasComedor.some((p) => t.includes(p))) return 'comedor'
  if (palabrasHorarios.some((p) => t.includes(p))) return 'horarios'
  if (palabrasCarnet.some((p) => t.includes(p))) return 'carnet'
  if (palabrasAyuda.some((p) => t.includes(p))) return 'ayuda'

  return 'desconocido'
}

/**
 * Responde preguntas sobre eventos y noticias escolares.
 */
export function responderEventos(
  texto: string,
  eventosActuales: Noticia[] = NOTICIAS,
): { texto: string; imagen?: string } {
  const t = normalizar(texto)

  if (!eventosActuales || eventosActuales.length === 0) {
    return {
      texto: 'Actualmente no hay eventos ni noticias escolares registrados en el calendario oficial.',
    }
  }

  // Buscar coincidencia con algún evento específico
  const eventoEncontrado = eventosActuales.find((ev) => {
    const tituloNorm = normalizar(ev.titulo)
    const palabrasTitulo = tituloNorm.split(' ').filter((p) => p.length > 3)
    return (
      t.includes(tituloNorm) ||
      palabrasTitulo.some((palabra) => t.includes(palabra)) ||
      (ev.periodo && t.includes(normalizar(ev.periodo)))
    )
  })

  if (eventoEncontrado) {
    const periodo = eventoEncontrado.periodo ? ` (${eventoEncontrado.periodo})` : ''
    return {
      texto: `📅 **${eventoEncontrado.titulo}**${periodo}\n\n${eventoEncontrado.descripcion}`,
      imagen: eventoEncontrado.imagen,
    }
  }

  // Lista todos los eventos vigentes
  const lista = eventosActuales
    .map((ev, i) => {
      const periodo = ev.periodo ? ` — *${ev.periodo}*` : ''
      return `${i + 1}. **${ev.titulo}**${periodo}: ${ev.descripcion}`
    })
    .join('\n\n')

  return {
    texto: `📰 **Eventos y Actividades Escolares Vigentes:**\n\n${lista}\n\n💡 *Pregúntame por alguno en específico para ver su afiche o más detalles.*`,
  }
}

/**
 * Responde preguntas sobre el menú del comedor para hoy, mañana, ayer o cualquier día de la semana.
 */
export function responderComedor(
  texto: string,
  menus: MenuDia[],
  ahora: Date,
): { texto: string } {
  const diaObj = resolverDiaObjetivo(texto, ahora)
  const diaNombreFormateado = diaObj.nombreDia.charAt(0).toUpperCase() + diaObj.nombreDia.slice(1)

  // Si cae en fin de semana
  if (diaObj.esFinDeSemana) {
    const prefijo =
      diaObj.etiqueta === 'mañana'
        ? `🔒 Mañana es **${diaNombreFormateado}** y el comedor estudiantil está **cerrado** los fines de semana.`
        : diaObj.etiqueta === 'ayer'
        ? `🔒 Ayer fue **${diaNombreFormateado}** y el comedor estudiantil estuvo **cerrado**.`
        : `🔒 Los fines de semana (**${diaNombreFormateado}**) el comedor estudiantil se encuentra **cerrado**.`
    return {
      texto: `${prefijo} ¡Buen descanso! 😊`,
    }
  }

  // Buscar menú por fecha exacta o por día de la semana
  let menuObjetivo = menus.find((m) => isSameDay(parseISO(m.fecha), diaObj.fecha))

  if (!menuObjetivo) {
    menuObjetivo = menus.find((m) => {
      const nombre = normalizar(format(parseISO(m.fecha), 'EEEE', { locale: es }))
      return nombre === diaObj.nombreDia
    })
  }

  if (!menuObjetivo) {
    return {
      texto: `😕 No encontré información del menú para **${diaObj.etiqueta} (${diaNombreFormateado})**. Podés revisar la sección de **Comedor** en la barra inferior.`,
    }
  }

  const tituloEtiqueta =
    diaObj.etiqueta === 'hoy'
      ? `HOY (${diaNombreFormateado})`
      : diaObj.etiqueta === 'mañana'
      ? `MAÑANA (${diaNombreFormateado})`
      : diaObj.etiqueta === 'ayer'
      ? `AYER (${diaNombreFormateado})`
      : diaNombreFormateado.toUpperCase()

  return {
    texto:
      `🍽️ **Menú del Comedor para ${tituloEtiqueta}:**\n\n` +
      `🥩 **Plato principal:** ${menuObjetivo.plato}\n` +
      `🥗 **Acompañamiento:** ${menuObjetivo.acompanamiento}\n` +
      `🥤 **Bebida:** ${menuObjetivo.bebida}\n` +
      `🍌 **Fruta/Postre:** ${menuObjetivo.fruta}`,
  }
}

/**
 * Responde preguntas sobre los horarios de clases para hoy, mañana, ayer o un día específico.
 */
export function responderHorarios(
  texto: string,
  diasHorario: DiaDeClases[],
  grupo: string,
  ahora: Date,
): { texto: string } {
  if (!diasHorario || diasHorario.length === 0) {
    return {
      texto: `📅 No hay horarios cargados actualmente para el grupo **${grupo}**. Podés consultar la sección de **Horarios**.`,
    }
  }

  const diaObj = resolverDiaObjetivo(texto, ahora)
  const diaNombreFormateado = diaObj.nombreDia.charAt(0).toUpperCase() + diaObj.nombreDia.slice(1)

  // Si cae en fin de semana
  if (diaObj.esFinDeSemana) {
    const prefijo =
      diaObj.etiqueta === 'mañana'
        ? `🎉 ¡Mañana es **${diaNombreFormateado}** y no hay lecciones!`
        : diaObj.etiqueta === 'ayer'
        ? `Ayer fue **${diaNombreFormateado}** (fin de semana), no hubo clases.`
        : `🎉 El **${diaNombreFormateado}** no hay clases por ser fin de semana.`
    return {
      texto: `${prefijo} ¡A disfrutar el descanso! 😊`,
    }
  }

  // Buscar el día en los horarios del grupo
  const diaEncontrado = diasHorario.find(
    (d) => normalizar(d.dia) === diaObj.nombreDia,
  )

  if (!diaEncontrado || diaEncontrado.clases.length === 0) {
    return {
      texto: `📅 No hay lecciones programadas para **${diaObj.etiqueta} (${diaNombreFormateado})** en el grupo ${grupo}.`,
    }
  }

  const lecciones = diaEncontrado.clases
    .map((c: Clase) => `⏰ **${c.hora}** — ${c.materia}${c.docente ? ` *(Docente: ${c.docente})*` : ''}`)
    .join('\n')

  const tituloEtiqueta =
    diaObj.etiqueta === 'hoy'
      ? `HOY (${diaNombreFormateado})`
      : diaObj.etiqueta === 'mañana'
      ? `MAÑANA (${diaNombreFormateado})`
      : diaObj.etiqueta === 'ayer'
      ? `AYER (${diaNombreFormateado})`
      : diaNombreFormateado.toUpperCase()

  return {
    texto: `📅 **Horario de clases para ${tituloEtiqueta} (Grupo ${grupo}):**\n\n${lecciones}`,
  }
}

/**
 * Responde preguntas sobre el carnet digital.
 */
export function responderCarnet(): { texto: string } {
  return {
    texto:
      `🪪 **Mi Carnet Digital:**\n\n` +
      `• Podés acceder a tu carnet desde la sección **Carnet** en la barra de navegación.\n` +
      `• Cuenta con un **código QR dinámico** para validación en el portón o comedor.\n` +
      `• Podés presionar el botón **"Guardar Carnet Offline"** para tenerlo siempre disponible aunque no tengas internet.`,
  }
}

/**
 * Mensaje de ayuda y capacidades del bot.
 */
export function responderAyuda(): { texto: string } {
  return {
    texto:
      `👋 ¡Hola! Soy el **Asistente Virtual de Student HUB**.\n\n` +
      `Puedo responderte con precisión sobre:\n` +
      `• 🍲 **Comedor:** "¿Qué hay de almuerzo mañana?", "¿Qué hubo ayer?", "¿Menú del viernes?"\n` +
      `• ⏰ **Horarios:** "¿Qué clases tengo mañana?", "¿Qué tuve ayer?", "¿Horario del martes?"\n` +
      `• 📰 **Eventos:** "¿Qué noticias hay?", "¿Cuándo es la ExpoTécnica?"\n` +
      `• 🪪 **Carnet:** "¿Cómo descargo mi carnet offline?"\n\n` +
      `¿En qué te puedo colaborar hoy?`,
  }
}
