/**
 * Servicio del Asistente Virtual de Student HUB.
 *
 * Procesa consultas del estudiante mediante reconocimiento de intenciones
 * y genera respuestas estructuradas en tiempo real a partir de fuentes locales:
 * - Eventos y Noticias institucionales (calendario escolar)
 * - Menú del Comedor (con resolución por fecha y ciclo lectivo)
 * - Horarios de Clases (por grupo académico y día de la semana)
 * - Carnet Digital Estudiantil y persistencia sin conexión
 *
 * Resuelve referencias temporales relativas:
 * - "mañana" / "pasado mañana" -> calcula el día siguiente o subsiguiente
 * - "ayer" / "antier" -> calcula el día anterior o antepasado
 * - Nombres de días ("lunes", "martes", etc.) -> día específico de la semana en curso
 *
 * Funciona de manera 100% autónoma en el cliente, compatible con PWA offline.
 */

import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { NOTICIAS, type Noticia } from '@/features/dashboard/noticias.fixture'
import type { MenuDia } from '@/features/comedor/menu.types'
import type { DiaDeClases, Clase } from '@/features/horarios/horario.types'
import type {
  DiaObjetivo,
  Intencion,
  RespuestaChat,
  SugerenciaRapida,
} from './chatbot.types'

export type { MensajeChat } from './chatbot.types'

/**
 * Normaliza una cadena de texto eliminando tildes, signos diacríticos,
 * espacios redundantes y convirtiendo a minúsculas.
 */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Resuelve a qué fecha se refiere la consulta:
 * - "pasado manana" -> ahora + 2 días
 * - "manana" -> ahora + 1 día
 * - "antier" / "anteayer" -> ahora - 2 días
 * - "ayer" -> ahora - 1 día
 * - "lunes", "martes", etc. -> día de la semana en curso
 * - Por defecto -> hoy
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

  // Detectar día de la semana específico
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
 * Detecta la intención principal de la consulta.
 */
export function detectarIntencion(texto: string): Intencion {
  const t = normalizar(texto)

  const palabrasSaludo = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'hey', 'saludos']
  const palabrasComedor = ['comedor', 'comer', 'almuerzo', 'almorzar', 'menu', 'comida', 'plato', 'cena', 'cenar', 'desayuno']
  const palabrasHorarios = ['horario', 'clase', 'clases', 'materia', 'materias', 'leccion', 'lecciones', 'aula', 'profesor', 'tengo', 'toca']
  const palabrasEventos = ['evento', 'eventos', 'noticia', 'noticias', 'actividad', 'actividades', 'feria', 'expotecnica', 'graduacion', 'matricula', 'artes', 'civica', 'patrias']
  const palabrasCarnet = ['carnet', 'qr', 'credencial', 'offline', 'identificacion', 'foto', 'descargar carnet', 'guardar carnet']
  const palabrasAyuda = ['ayuda', 'que haces', 'que puedes hacer', 'comandos', 'funciones', 'opciones', 'capacidades']

  if (palabrasSaludo.some((p) => t === p || t.startsWith(`${p} `))) return 'saludo'
  if (palabrasEventos.some((p) => t.includes(p))) return 'eventos'
  if (palabrasComedor.some((p) => t.includes(p))) return 'comedor'
  if (palabrasHorarios.some((p) => t.includes(p))) return 'horarios'
  if (palabrasCarnet.some((p) => t.includes(p))) return 'carnet'
  if (palabrasAyuda.some((p) => t.includes(p))) return 'ayuda'

  return 'desconocido'
}

/**
 * Responde consultas sobre eventos y actividades institucionales.
 */
export function responderEventos(
  texto: string,
  eventosActuales: Noticia[] = NOTICIAS,
): RespuestaChat {
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
      texto: `**${eventoEncontrado.titulo}**${periodo}\n\n${eventoEncontrado.descripcion}`,
      imagen: eventoEncontrado.imagen,
    }
  }

  // Listar todos los eventos vigentes
  const lista = eventosActuales
    .map((ev, i) => {
      const periodo = ev.periodo ? ` — *${ev.periodo}*` : ''
      return `${i + 1}. **${ev.titulo}**${periodo}: ${ev.descripcion}`
    })
    .join('\n\n')

  return {
    texto: `**Eventos y Actividades Institucionales Vigentes:**\n\n${lista}\n\nPuedes consultar por algún evento específico para conocer más detalles.`,
  }
}

/**
 * Responde consultas sobre el menú del comedor para hoy, mañana, ayer o cualquier día de la semana.
 */
export function responderComedor(
  texto: string,
  menus: MenuDia[],
  ahora: Date,
): RespuestaChat {
  const diaObj = resolverDiaObjetivo(texto, ahora)
  const diaNombreFormateado = diaObj.nombreDia.charAt(0).toUpperCase() + diaObj.nombreDia.slice(1)

  // Si corresponde a fin de semana
  if (diaObj.esFinDeSemana) {
    let detalle: string
    if (diaObj.etiqueta === 'mañana') {
      detalle = `Mañana es **${diaNombreFormateado}** y el comedor estudiantil se encuentra cerrado los fines de semana.`
    } else if (diaObj.etiqueta === 'ayer') {
      detalle = `Ayer fue **${diaNombreFormateado}** y el comedor estudiantil estuvo cerrado por fin de semana.`
    } else {
      detalle = `Los fines de semana (**${diaNombreFormateado}**) el comedor estudiantil se encuentra cerrado.`
    }
    return {
      texto: `${detalle} El servicio de alimentación opera de lunes a viernes en horario lectivo regular.`,
    }
  }

  // Buscar menú por fecha exacta
  let menuObjetivo = menus.find((m) => isSameDay(parseISO(m.fecha), diaObj.fecha))

  // Si no coincide la fecha exacta, buscar por día de la semana
  if (!menuObjetivo) {
    menuObjetivo = menus.find((m) => {
      const nombre = normalizar(format(parseISO(m.fecha), 'EEEE', { locale: es }))
      return nombre === diaObj.nombreDia
    })
  }

  if (!menuObjetivo) {
    return {
      texto: `No hay información del menú registrada para **${diaObj.etiqueta} (${diaNombreFormateado})**. Puedes consultar la sección de **Comedor** en el menú principal para más información.`,
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
      `**Menú del Comedor Institucional — ${tituloEtiqueta}:**\n\n` +
      `• **Plato principal:** ${menuObjetivo.plato}\n` +
      `• **Acompañamiento:** ${menuObjetivo.acompanamiento}\n` +
      `• **Bebida:** ${menuObjetivo.bebida}\n` +
      `• **Fruta o postre:** ${menuObjetivo.fruta}`,
  }
}

/**
 * Responde consultas sobre los horarios de clases para hoy, mañana, ayer o un día específico.
 */
export function responderHorarios(
  texto: string,
  diasHorario: DiaDeClases[],
  grupo: string,
  ahora: Date,
): RespuestaChat {
  if (!diasHorario || diasHorario.length === 0) {
    return {
      texto: `No hay horarios registrados actualmente para el grupo **${grupo}**. Puedes verificar la sección de **Horarios** en el menú principal.`,
    }
  }

  const diaObj = resolverDiaObjetivo(texto, ahora)
  const diaNombreFormateado = diaObj.nombreDia.charAt(0).toUpperCase() + diaObj.nombreDia.slice(1)

  // Si cae en fin de semana
  if (diaObj.esFinDeSemana) {
    let detalle: string
    if (diaObj.etiqueta === 'mañana') {
      detalle = `Mañana es **${diaNombreFormateado}** y no hay lecciones programadas por ser fin de semana.`
    } else if (diaObj.etiqueta === 'ayer') {
      detalle = `Ayer fue **${diaNombreFormateado}** (fin de semana) y no se impartieron lecciones.`
    } else {
      detalle = `El día **${diaNombreFormateado}** corresponde a fin de semana y no hay clases.`
    }
    return {
      texto: `${detalle} Las lecciones se imparten regularmente de lunes a viernes.`,
    }
  }

  // Buscar el día en los horarios del grupo
  const diaEncontrado = diasHorario.find(
    (d) => normalizar(d.dia) === diaObj.nombreDia,
  )

  if (!diaEncontrado || diaEncontrado.clases.length === 0) {
    return {
      texto: `No hay lecciones registradas para **${diaObj.etiqueta} (${diaNombreFormateado})** en el grupo ${grupo}.`,
    }
  }

  const lecciones = diaEncontrado.clases
    .map((c: Clase) => `• **${c.hora}** — ${c.materia}${c.docente ? ` *(Docente: ${c.docente})*` : ''}`)
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
    texto: `**Horario de Clases — ${tituloEtiqueta} (Grupo ${grupo}):**\n\n${lecciones}`,
  }
}

/**
 * Responde consultas sobre el carnet digital estudiantil.
 */
export function responderCarnet(): RespuestaChat {
  return {
    texto:
      `**Carnet Digital Estudiantil:**\n\n` +
      `• Acceso inmediato desde la sección **Carnet** en la barra de navegación.\n` +
      `• Cuenta con un **código QR dinámico** para validación en portón y comedor escolar.\n` +
      `• Puedes utilizar el botón **"Guardar Carnet Offline"** para conservarlo en tu dispositivo aunque no tengas conexión a internet.`,
  }
}

/**
 * Mensaje de orientación y capacidades institucionales del asistente.
 */
export function responderAyuda(): RespuestaChat {
  return {
    texto:
      `**Asistente Virtual de Student HUB**\n\n` +
      `Puedo ayudarte con información en tiempo real sobre:\n` +
      `• **Comedor:** "¿Qué hay de almuerzo mañana?", "¿Qué hubo ayer?", "¿Menú del viernes?"\n` +
      `• **Horarios:** "¿Qué clases tengo mañana?", "¿Qué tuve ayer?", "¿Horario del martes?"\n` +
      `• **Eventos:** "¿Qué noticias hay?", "¿Cuándo es la ExpoTécnica?"\n` +
      `• **Carnet:** "¿Cómo descargo mi carnet offline?"\n\n` +
      `Escribe tu consulta o presiona una de las opciones sugeridas.`,
  }
}

/**
 * Mensaje emitido ante consultas que no coinciden con intenciones conocidas.
 */
export function responderDesconocido(): RespuestaChat {
  return {
    texto:
      `No he podido identificar tu consulta con certeza.\n\n` +
      `Puedes probar preguntándome:\n` +
      `• "¿Qué hay de almuerzo hoy?"\n` +
      `• "¿Cuáles son mis clases de hoy?"\n` +
      `• "¿Qué eventos hay en el colegio?"\n` +
      `• "¿Cómo guardo mi carnet offline?"`,
  }
}

/**
 * Genera el texto del mensaje de bienvenida inicial.
 */
export function generarMensajeBienvenida(primerNombre?: string): string {
  const saludoNombre = primerNombre ? `, ${primerNombre}` : ''
  return (
    `**¡Hola${saludoNombre}! Soy el Asistente Virtual de Student HUB.**\n\n` +
    `Estoy listo para ayudarte con:\n` +
    `• Menú oficial del comedor estudiantil\n` +
    `• Horario de lecciones y materias de tu grupo\n` +
    `• Eventos oficiales y ferias institucionales\n` +
    `• Uso y descarga de tu carnet digital offline\n\n` +
    `¿En qué puedo orientarte hoy?`
  )
}

/**
 * Sugerencias rápidas para el pie del chat.
 */
export const SUGERENCIAS_RAPIDAS: SugerenciaRapida[] = [
  {
    id: 'sug-almuerzo',
    etiqueta: 'Almuerzo mañana',
    consulta: '¿Qué hay de almuerzo mañana?',
    categoria: 'comedor',
  },
  {
    id: 'sug-clases',
    etiqueta: 'Clases mañana',
    consulta: '¿Qué clases tengo mañana?',
    categoria: 'horarios',
  },
  {
    id: 'sug-eventos',
    etiqueta: 'Eventos del colegio',
    consulta: '¿Qué eventos hay en el colegio?',
    categoria: 'eventos',
  },
  {
    id: 'sug-carnet',
    etiqueta: 'Carnet offline',
    consulta: '¿Cómo guardo mi carnet offline?',
    categoria: 'carnet',
  },
]
