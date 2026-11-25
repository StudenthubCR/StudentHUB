/**
 * Servicio del Asistente Virtual Offline-First de Student HUB (CTP Rosario de Naranjo).
 *
 * Opera 100% en el cliente leyendo exclusivamente de memoria y cachés locales persistentes:
 * - Agenda personal y sincronizada con docentes (resolución temporal en español)
 * - Horarios de clases por sección (incluyendo lección actual, siguiente y recesos + respaldo local)
 * - Menú del comedor institucional (diario y semanal + respaldo ciclo 1..5)
 * - Calificaciones y resumen académico del estudiante activo (scoped por usuario)
 * - Asistencias, tardías y alerta temprana REA del estudiante activo (scoped por usuario)
 * - Carnet Digital 3D y preguntas frecuentes del CTP Rosario de Naranjo
 *
 * Regla de Oro: Cero caracteres emojis o pictogramas Unicode en todo el módulo.
 */

import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { NOTICIAS, type Noticia } from '@/features/dashboard/noticias.fixture'
import type { MenuDia } from '@/features/comedor/menu.types'
import { recuperarCacheComedor } from '@/features/comedor/comedor.api'
import { filasAMenus, semanaAMostrar, semanaDelCiclo } from '@/features/comedor/menu.service'
import type { DiaDeClases, Clase } from '@/features/horarios/horario.types'
import {
  aClases,
  agruparPorDia,
  ahoraEnMinutos,
  progresoDelDia,
  unirConsecutivas,
} from '@/features/horarios/horario.service'
import { recuperarCacheHorario } from '@/features/horarios/horarios.api'
import type { EventoAgenda } from '@/features/agenda/agenda.types'
import { obtenerEventos } from '@/features/agenda/agenda.service'
import type { NotaMateria } from '@/features/notas/notas.types'
import { calcularResumenNotas } from '@/features/notas/notas.service'
import type { RegistroAsistencia } from '@/features/asistencias/asistencias.types'
import { calcularResumenAsistencias } from '@/features/asistencias/asistencias.service'
import { responderConsultaAgenda } from './agendaQuery'
import type {
  DiaObjetivo,
  Intencion,
  RespuestaChat,
  SugerenciaRapida,
} from './chatbot.types'

export type { MensajeChat } from './chatbot.types'

export interface FaqInstitucional {
  id: string
  palabrasClave: string[]
  titulo: string
  respuesta: string
}

export const FAQS_CTP_ROSARIO: FaqInstitucional[] = [
  {
    id: 'faq-horarios-colegio',
    palabrasClave: ['jornada', 'diurno', 'nocturna', 'abre', 'cierra', 'horario del colegio', 'horario general'],
    titulo: 'Horarios Generales · CTP Rosario de Naranjo',
    respuesta:
      'El CTP Rosario de Naranjo opera en jornada **Diurna** (desde las 7:00 a.m.) y **Sección Nocturna** (lecciones vespertinas/nocturnas con ventana de confirmación de cena hasta las 5:30 p.m.). Podés revisar el detalle exacto por sección en el módulo **Horarios**.',
  },
  {
    id: 'faq-especialidades',
    palabrasClave: ['especialidad', 'especialidades', 'tecnica', 'tecnicas', 'carreras'],
    titulo: 'Especialidades Técnicas del Colegio',
    respuesta:
      'Entre las especialidades del **CTP Rosario de Naranjo** destacan **Desarrollo Web**, **Contabilidad & Finanzas**, **Ciberseguridad**, **Electromecánica**, **Soporte y Configuración de Redes**, **Administración Logística**, **Diseño Publicitario** y **Secretariado Ejecutivo**.',
  },
  {
    id: 'faq-orientacion',
    palabrasClave: ['orientacion', 'coordinacion', 'secretaria', 'justificar', 'justificacion', 'boleta', 'comprobante'],
    titulo: 'Justificaciones, Orientación y Coordinación',
    respuesta:
      'Según el **Reglamento de Evaluación de los Aprendizajes (REA · MEP)**, las justificaciones formales de ausencias o tardías deben presentarse ante secretaría o coordinación en un plazo máximo de **3 días hábiles**. Para apoyo psicosocial o vocacional acudí al departamento de **Orientación** en horario lectivo.',
  },
  {
    id: 'faq-offline',
    palabrasClave: ['sin conexion', 'sin internet', 'como funciona offline', 'modo offline', 'sin red', 'cache'],
    titulo: 'Cómo Funciona el Modo Sin Conexión (PWA)',
    respuesta:
      'Student HUB almacena tu aplicación, horarios, menús del comedor, agenda y tus datos académicos recientes cifrados/aislados por sesión en tu dispositivo. Incluso sin Wi-Fi ni saldo podés consultar tus clases, menú, promedios, carnet QR y chatear conmigo sin interrupciones.',
  },
  {
    id: 'faq-privacidad',
    palabrasClave: ['privacidad', 'seguridad', '8968', 'prodhab', 'datos personales'],
    titulo: 'Privacidad y Ley N° 8968 (PRODHAB)',
    respuesta:
      'Los datos sensibles de estudiantes, encargados y docentes se resguardan exclusivamente con **Row Level Security (RLS)** en PostgreSQL y caché aislado por cuenta de usuario. Al cerrar sesión, toda información personal local se elimina de forma inmediata.',
  },
]

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
  if (palabrasSaludo.some((p) => t === p || t.startsWith(`${p} `))) return 'saludo'

  const palabrasAyuda = ['ayuda', 'que haces', 'que puedes hacer', 'comandos', 'funciones', 'opciones', 'capacidades']
  if (palabrasAyuda.some((p) => t.includes(p))) return 'ayuda'

  // Preguntas sobre ausencias de profesores o explícitas de agenda van primero a Agenda
  if (
    t.includes('profesor ausente') ||
    t.includes('docente ausente') ||
    t.includes('ausencias de profesor') ||
    t.includes('ausencia de profesor') ||
    t.includes('ausencias de docente')
  ) {
    return 'agenda'
  }

  // FAQs específicas cuando preguntan cómo funciona el modo offline / orientación / especialidades
  if (
    t.includes('sin conexion') ||
    t.includes('sin internet') ||
    t.includes('modo offline') ||
    t.includes('como funciona offline') ||
    t.includes('orientacion') ||
    t.includes('coordinacion') ||
    t.includes('especialidad') ||
    t.includes('rosario de naranjo') ||
    t.includes('8968') ||
    t.includes('prodhab')
  ) {
    return 'faq_ctp'
  }

  // Calificaciones y promedios
  const palabrasNotas = [
    'promedio',
    'nota',
    'notas',
    'calificacion',
    'calificaciones',
    'materia baja',
    'materias bajas',
    'reprobe',
    'reprobada',
    'reprobadas',
    'boletin',
    'rubrica',
  ]
  if (palabrasNotas.some((p) => t.includes(p))) return 'notas'

  // Carnet digital
  const palabrasCarnet = ['carnet', 'qr', 'credencial', 'offline', 'identificacion', 'foto', 'descargar carnet', 'guardar carnet']
  if (palabrasCarnet.some((p) => t.includes(p))) return 'carnet'

  // Asistencia estudiantil personal (si no menciona "agenda")
  const palabrasAsistencias = [
    'asistencia',
    'asistencias',
    'tardia',
    'tardias',
    'ausencias tengo',
    'ausencia tengo',
    'cuantas ausencias',
    'mis ausencias',
    'injustificada',
    'injustificadas',
    'alerta temprana',
  ]
  if (!t.includes('agenda') && palabrasAsistencias.some((p) => t.includes(p))) {
    return 'asistencias'
  }

  // Términos explícitos y directos de la Agenda Estudiantil personal
  const palabrasAgendaExplicitas = [
    'agenda',
    'tarea',
    'tareas',
    'examen',
    'examenes',
    'prueba',
    'pruebas',
    'parcial',
    'parciales',
    'quiz',
    'quices',
    'deber',
    'deberes',
    'proyecto',
    'proyectos',
    'ausencia',
    'ausencias',
    'recordatorio',
    'recordatorios',
    'evaluacion',
    'evaluaciones',
    'pendiente',
    'pendientes',
  ]
  if (palabrasAgendaExplicitas.some((p) => t.includes(p))) return 'agenda'

  // Comedor escolar
  const palabrasComedor = ['comedor', 'comer', 'almuerzo', 'almorzar', 'menu', 'comida', 'plato', 'cena', 'cenar', 'desayuno']
  if (palabrasComedor.some((p) => t.includes(p))) return 'comedor'

  // Noticias y eventos institucionales del colegio
  const palabrasEventosInst = ['noticia', 'noticias', 'feria', 'expotecnica', 'graduacion', 'matricula', 'artes', 'civica', 'patrias']
  if (palabrasEventosInst.some((p) => t.includes(p))) return 'eventos'

  // Actividades programadas (si no especifica contexto institucional externo, va a la agenda)
  if (t.includes('actividad') || t.includes('actividades')) {
    if (t.includes('colegio') || t.includes('institucional')) {
      return 'eventos'
    }
    return 'agenda'
  }

  // Eventos generales
  if (t.includes('evento') || t.includes('eventos')) {
    return 'eventos'
  }

  // Horario general del colegio -> FAQ
  if (t.includes('horario del colegio') || t.includes('horario general')) {
    return 'faq_ctp'
  }

  // Horario de lecciones y materias
  const palabrasHorarios = [
    'horario',
    'clase',
    'clases',
    'materia',
    'materias',
    'leccion',
    'lecciones',
    'aula',
    'profesor',
    'tengo',
    'toca',
    'receso',
    'descanso',
  ]
  if (palabrasHorarios.some((p) => t.includes(p))) return 'horarios'

  // Coincidencia final con palabras clave de FAQs
  if (FAQS_CTP_ROSARIO.some((faq) => faq.palabrasClave.some((p) => t.includes(p)))) {
    return 'faq_ctp'
  }

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
 * Responde consultas sobre la agenda personal del estudiante (tareas, exámenes, ausencias y recordatorios).
 */
export function responderAgenda(
  texto: string,
  eventosAgenda: EventoAgenda[] = obtenerEventos(),
  ahora: Date = new Date(),
): RespuestaChat {
  return responderConsultaAgenda(texto, eventosAgenda, ahora)
}

function obtenerMenusConFallbackLocal(menus: MenuDia[], ahora: Date): MenuDia[] {
  if (menus && menus.length > 0) return menus
  const dias = semanaAMostrar(ahora)
  const lunes = dias[0]
  if (!lunes) return []
  const numero = semanaDelCiclo(lunes)
  const enCache = recuperarCacheComedor(numero)
  if (!enCache || enCache.length === 0) return []
  return filasAMenus(enCache, lunes)
}

/**
 * Responde consultas sobre el menú del comedor para hoy, mañana, ayer, día específico o semana completa.
 */
export function responderComedor(
  texto: string,
  menus: MenuDia[],
  ahora: Date,
): RespuestaChat {
  const menusEfectivos = obtenerMenusConFallbackLocal(menus, ahora)
  const t = normalizar(texto)

  // Consulta por menú semanal completo
  if (
    t.includes('esta semana') ||
    t.includes('semanal') ||
    t.includes('toda la semana') ||
    t.includes('menu de la semana')
  ) {
    if (menusEfectivos.length === 0) {
      return {
        texto:
          'No hay un menú semanal guardado en caché local todavía. Ingresá un momento al módulo **Comedor** con conexión para descargarlo.',
      }
    }
    const lineas = menusEfectivos.map((m) => {
      const nombreDia = format(parseISO(m.fecha), 'EEEE d', { locale: es })
      const diaCap = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)
      return `• **${diaCap}:** ${m.plato} *(Acomp.: ${m.acompanamiento}; Bebida: ${m.bebida})*`
    })
    return {
      texto: `**Menú Semanal del Comedor Institucional:**\n\n${lineas.join('\n')}`,
    }
  }

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
  let menuObjetivo = menusEfectivos.find((m) => isSameDay(parseISO(m.fecha), diaObj.fecha))

  // Si no coincide la fecha exacta, buscar por día de la semana
  if (!menuObjetivo) {
    menuObjetivo = menusEfectivos.find((m) => {
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

function obtenerHorariosConFallbackLocal(
  diasHorario: DiaDeClases[],
  grupo: string,
  ahora: Date,
): DiaDeClases[] {
  if (diasHorario && diasHorario.length > 0) return diasHorario
  if (!grupo) return []
  const enCache = recuperarCacheHorario(grupo)
  if (!enCache || enCache.length === 0) return []
  return agruparPorDia(aClases(enCache), ahora)
}

/**
 * Responde consultas sobre los horarios de clases:
 * - Lección actual / siguiente / hora de receso o cena
 * - Horario de hoy, mañana, ayer o un día específico de la semana
 */
export function responderHorarios(
  texto: string,
  diasHorario: DiaDeClases[],
  grupo: string,
  ahora: Date,
): RespuestaChat {
  const diasEfectivos = obtenerHorariosConFallbackLocal(diasHorario, grupo, ahora)

  if (!diasEfectivos || diasEfectivos.length === 0) {
    return {
      texto: `No hay horarios registrados actualmente para el grupo **${grupo}**. Puedes verificar la sección de **Horarios** en el menú principal.`,
    }
  }

  const t = normalizar(texto)
  const diaObj = resolverDiaObjetivo(texto, ahora)
  const diaNombreFormateado = diaObj.nombreDia.charAt(0).toUpperCase() + diaObj.nombreDia.slice(1)

  // Consulta en vivo sobre lección actual, próxima o receso (si no pidió otro día explícitamente)
  const preguntaEnVivo =
    !diaObj.esExplicito &&
    (t.includes('ahora') ||
      t.includes('en este momento') ||
      t.includes('siguiente') ||
      t.includes('proxima') ||
      t.includes('receso') ||
      t.includes('descanso'))

  if (preguntaEnVivo) {
    if (diaObj.esFinDeSemana) {
      return {
        texto: `Hoy es **${diaNombreFormateado}** (fin de semana), por lo que no hay lecciones ni recesos activos para el grupo **${grupo}**.`,
      }
    }
    const diaHoy = diasEfectivos.find((d) => normalizar(d.dia) === diaObj.nombreDia)
    if (!diaHoy || diaHoy.clases.length === 0) {
      return {
        texto: `No hay lecciones cargadas para hoy (${diaNombreFormateado}) en el grupo **${grupo}**.`,
      }
    }

    const bloques = diaHoy.bloques.length > 0 ? diaHoy.bloques : unirConsecutivas(diaHoy.clases)

    if (t.includes('receso') || t.includes('descanso')) {
      const recesos = bloques.filter((b) => b.esReceso || /receso|almuerzo|cena|descanso/i.test(b.materia))
      if (recesos.length === 0) {
        return {
          texto: `No figuran bloques marcados como receso o alimentación explícita en el horario de hoy del grupo **${grupo}**.`,
        }
      }
      const detalleRecesos = recesos
        .map((r) => `• **${r.materia}:** ${r.inicio}${r.fin ? ` - ${r.fin}` : ''}`)
        .join('\n')
      return {
        texto: `**Pausas y Recesos de Hoy (Grupo ${grupo}):**\n\n${detalleRecesos}`,
      }
    }

    const prog = progresoDelDia(bloques, ahoraEnMinutos(ahora))
    const actual = prog.actual !== null ? bloques[prog.actual] : null
    const siguiente = prog.siguiente !== null ? bloques[prog.siguiente] : null

    if (actual || siguiente) {
      const partes: string[] = [`**Estado Actual de Clases — Grupo ${grupo}:**`]
      if (actual) {
        partes.push(
          `• **Ahora en curso:** ${actual.materia} (${actual.inicio}${actual.fin ? ` - ${actual.fin}` : ''})${actual.docente ? ` *(Docente: ${actual.docente})*` : ''}`,
        )
      } else {
        partes.push('• **Ahora:** No estás dentro de un bloque lectivo en este instante.')
      }
      if (siguiente) {
        partes.push(
          `• **Siguiente bloque:** ${siguiente.materia} (${siguiente.inicio}${siguiente.fin ? ` - ${siguiente.fin}` : ''})${siguiente.docente ? ` *(Docente: ${siguiente.docente})*` : ''}`,
        )
      }
      return { texto: partes.join('\n\n') }
    }
  }

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
  const diaEncontrado = diasEfectivos.find(
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
 * Responde consultas sobre calificaciones y promedio MEP usando caché aislado del estudiante.
 */
export function responderNotas(
  texto: string,
  notas: NotaMateria[] = [],
  nombreEstudiante?: string,
  esDocente = false,
): RespuestaChat {
  if (esDocente) {
    return {
      texto:
        '**Gestión de Calificaciones (Modo Docente):**\n\nPodés consultar y editar las notas MEP (40/10/35/10/5) de todas las secciones de Desarrollo Web en la pestaña **Notas** (`/docente/notas`).',
    }
  }

  if (!notas || notas.length === 0) {
    return {
      texto:
        'Aún no hay calificaciones guardadas en caché local para tu cuenta. Abrí la pestaña **Notas** en **Hub Estudiantil** para consultar tu boletín por periodo.',
    }
  }

  const resumen = calcularResumenNotas(notas)
  const bajas = notas.filter((n) => n.notaFinal < 70)
  const t = normalizar(texto)
  const titular = nombreEstudiante ? ` de ${nombreEstudiante}` : ''

  if (t.includes('baja') || t.includes('riesgo') || t.includes('reprob')) {
    if (bajas.length === 0) {
      return {
        texto: `**Rendimiento Académico${titular}:**\n\nNo tenés materias por debajo de 70. Todas tus **${resumen.totalMaterias}** materias evaluadas están aprobadas con un promedio general de **${resumen.promedioGeneral.toFixed(1)}**.`,
      }
    }
    const listaBajas = bajas
      .map((b) => `• **${b.materia}:** ${b.notaFinal.toFixed(1)} *(Nota mínima MEP: 70)*`)
      .join('\n')
    return {
      texto: `**Materias en Seguimiento (< 70)${titular}:**\n\n${listaBajas}\n\nPromedio general actual: **${resumen.promedioGeneral.toFixed(1)}**.`,
    }
  }

  const detalleTop = notas
    .slice(0, 5)
    .map((n) => `• **${n.materia}:** ${n.notaFinal.toFixed(1)}`)
    .join('\n')

  return {
    texto:
      `**Resumen de Calificaciones (I Periodo)${titular}:**\n\n` +
      `• **Promedio general:** ${resumen.promedioGeneral.toFixed(1)} / 100\n` +
      `• **Materias aprobadas:** ${resumen.materiasAprobadas} de ${resumen.totalMaterias}\n` +
      (resumen.materiasEnRiesgo > 0
        ? `• **Materias < 70:** ${resumen.materiasEnRiesgo}\n\n`
        : '\n') +
      `**Detalle en caché:**\n${detalleTop}`,
  }
}

/**
 * Responde consultas sobre asistencias, tardías y alerta temprana REA usando caché aislado.
 */
export function responderAsistencias(
  asistencias: RegistroAsistencia[] = [],
  nombreEstudiante?: string,
  esDocente = false,
): RespuestaChat {
  if (esDocente) {
    return {
      texto:
        '**Pase de Lista (Modo Docente):**\n\nRegistrá presentes, tardías y ausencias por bloque horario desde la pestaña **Asistencias** (`/docente/asistencias`).',
    }
  }

  if (!asistencias || asistencias.length === 0) {
    return {
      texto:
        'Aún no hay registros de asistencia en caché local para tu cuenta. Ingresá a **Hub Estudiantil** en la pestaña **Asistencias** para sincronizar tu historial.',
    }
  }

  const res = calcularResumenAsistencias(asistencias)
  const titular = nombreEstudiante ? ` de ${nombreEstudiante}` : ''

  return {
    texto:
      `**Registro de Asistencia${titular}:**\n\n` +
      `• **Asistencia válida:** ${res.porcentajeAsistencia}% (${res.totalSesiones} lecciones registradas)\n` +
      `• **Presentes:** ${res.presentes} | **Tardías:** ${res.tardias}\n` +
      `• **Ausencias injustificadas:** ${res.ausenciasInjustificadas} | **Justificadas:** ${res.ausenciasJustificadas}\n\n` +
      (res.alertaTemprana
        ? `**Atención:** ${res.mensajeAlerta}`
        : '**Estado:** Regularidad académica al día conforme al Reglamento REA del MEP.'),
  }
}

/**
 * Responde preguntas frecuentes institucionales del CTP Rosario de Naranjo.
 */
export function responderFaqCtp(texto: string): RespuestaChat {
  const t = normalizar(texto)
  const encontrada = FAQS_CTP_ROSARIO.find((faq) =>
    faq.palabrasClave.some((p) => t.includes(p)),
  )

  if (encontrada) {
    return {
      texto: `**${encontrada.titulo}**\n\n${encontrada.respuesta}`,
    }
  }

  const listado = FAQS_CTP_ROSARIO.map((f) => `• **${f.titulo}:** ${f.respuesta}`).join('\n\n')
  return {
    texto: `**Preguntas Frecuentes · CTP Rosario de Naranjo:**\n\n${listado}`,
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
      `**Asistente Virtual de Student HUB (100% Offline)**\n\n` +
      `Puedo ayudarte sin necesidad de conexión sobre:\n` +
      `• **Agenda:** "¿Hay actividades hoy?", "¿Qué hay en la agenda para mañana?", "¿Tengo tareas o exámenes pendientes?"\n` +
      `• **Horarios:** "¿Qué clase tengo ahora?", "¿A qué hora es el receso?", "¿Horario del martes?"\n` +
      `• **Comedor:** "¿Qué hay de almuerzo mañana?", "¿Cuál es el menú de esta semana?"\n` +
      `• **Notas y Asistencias:** "¿Cuál es mi promedio?", "¿Tengo materias bajas?", "¿Cuántas ausencias tengo?"\n` +
      `• **Eventos, Carnet y CTP:** "¿Cuándo es la ExpoTécnica?", "¿Cómo contacto a Orientación?"\n\n` +
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
      `• "¿Hay actividades hoy en la agenda?"\n` +
      `• "¿Qué hay de almuerzo hoy?"\n` +
      `• "¿Cuáles son mis clases de hoy?"\n` +
      `• "¿Cuál es mi promedio?" o "¿Cuántas ausencias tengo?"\n` +
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
    `Estoy listo para ayudarte incluso sin internet con:\n` +
    `• Tareas, exámenes y actividades de tu agenda\n` +
    `• Menú diario y semanal del comedor estudiantil\n` +
    `• Horario de lecciones, clase actual y materias de tu grupo\n` +
    `• Resumen de tus notas, ausencias y carnet digital\n` +
    `• Información general del CTP Rosario de Naranjo\n\n` +
    `¿En qué puedo orientarte hoy?`
  )
}

/**
 * Sugerencias rápidas para el pie del chat.
 */
export const SUGERENCIAS_RAPIDAS: SugerenciaRapida[] = [
  {
    id: 'sug-agenda',
    etiqueta: 'Agenda de hoy',
    consulta: '¿Hay actividades hoy en la agenda?',
    categoria: 'agenda',
  },
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
    id: 'sug-promedio',
    etiqueta: 'Mi promedio',
    consulta: '¿Cuál es mi promedio?',
    categoria: 'notas',
  },
  {
    id: 'sug-asistencia',
    etiqueta: 'Mis ausencias',
    consulta: '¿Cuántas ausencias tengo?',
    categoria: 'asistencias',
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
