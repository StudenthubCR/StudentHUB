import { ESTUDIANTES_MASTER_DEMO } from '@/features/docente/docente.fixture'

export type RolDemoExpo = 'estudiante' | 'encargado' | 'docente' | 'admin'

export type LanzarDemoOpciones = {
  rol: RolDemoExpo
  estudianteId?: string
  destino?: string
}

/**
 * Configura la sesión de demostración en localStorage y navega al módulo destino.
 * Mantiene 100% de compatibilidad con SesionProvider, EstudianteProvider y useDocente.
 */
export function lanzarPerfilDemo({
  rol,
  estudianteId,
  destino,
}: LanzarDemoOpciones): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('studenthub_demo_sesion', 'true')

  if (rol === 'admin') {
    localStorage.setItem('studenthub_demo_rol', 'estudiante')
    localStorage.setItem('studenthub_demo_admin', 'true')
    localStorage.removeItem('studenthub_demo_estudiante_id')
    localStorage.removeItem('studenthub_estudiante_activo_id')
    window.location.href = destino ?? '/admin'
    return
  }

  localStorage.removeItem('studenthub_demo_admin')
  localStorage.setItem('studenthub_demo_rol', rol)
  localStorage.removeItem('studenthub_estudiante_activo_id')

  if (rol === 'estudiante' && estudianteId) {
    localStorage.setItem('studenthub_demo_estudiante_id', estudianteId)
  } else {
    localStorage.removeItem('studenthub_demo_estudiante_id')
  }

  window.location.href = destino ?? (rol === 'docente' ? '/docente' : '/')
}

export type CategoriaModuloExpo =
  | 'todos'
  | 'docente'
  | 'estudiantil'
  | 'servicios'
  | 'arquitectura'

export type ModuloEcosistemaExpo = {
  id: string
  titulo: string
  subtitulo: string
  categoria: Exclude<CategoriaModuloExpo, 'todos'>
  rutaDemo: string
  rolDemo: RolDemoExpo
  estudianteIdDemo?: string
  resumen: string
  capacidadesReales: string[]
  acentoClase: string
  badgeClase: string
}

export const ESTUDIANTES_DESARROLLO_WEB_EXPO = ESTUDIANTES_MASTER_DEMO.filter(
  (e) => e.especialidad === 'Desarrollo Web',
)

export const ESTUDIANTES_OTRAS_ESPECIALIDADES_EXPO = ESTUDIANTES_MASTER_DEMO.filter(
  (e) => e.especialidad !== 'Desarrollo Web',
)

export type MetricaHeroExpo = {
  id: string
  valorNumerico?: number
  prefijo?: string
  sufijo?: string
  valorTextoEstatico?: string
  etiqueta: string
  detalle: string
  acento: 'blue' | 'emerald' | 'amber' | 'sky'
}

export const METRICAS_HERO_EXPO: MetricaHeroExpo[] = [
  {
    id: 'modulos',
    valorNumerico: 11,
    prefijo: '',
    sufijo: '+',
    etiqueta: 'Módulos Reales',
    detalle: 'Docente, Carnet 3D, Notas, Asistencias, Agenda, Chatbot y más',
    acento: 'blue',
  },
  {
    id: 'niveles',
    valorTextoEstatico: '7°–12°',
    etiqueta: 'Cobertura CTP',
    detalle: 'Arquitectura multi-especialidad Diurna y Sección Nocturna',
    acento: 'sky',
  },
  {
    id: 'offline',
    valorNumerico: 100,
    sufijo: '%',
    etiqueta: 'PWA Offline-First',
    detalle: 'Service Worker y caché local para usar en aulas sin señal',
    acento: 'emerald',
  },
  {
    id: 'roles',
    valorNumerico: 4,
    sufijo: ' Roles',
    etiqueta: 'Control RBAC + RLS',
    detalle: 'Estudiante, Encargado Legal, Docente y Administración',
    acento: 'amber',
  },
]

export const ECOSISTEMA_CAPACIDADES_EXPO: ModuloEcosistemaExpo[] = [
  {
    id: 'modo-docente',
    titulo: 'Modo Docente · Prof. Dangelo',
    subtitulo: 'Desarrollo Web (10-1, 11-1 y 12-1)',
    categoria: 'docente',
    rutaDemo: '/docente',
    rolDemo: 'docente',
    resumen:
      'Portal exclusivo con alcance mínimo necesario: gestiona únicamente el padrón de Desarrollo Web en tiempo real.',
    capacidadesReales: [
      'Cálculo MEP automático (40% cotidiano, 10% tareas, 35% pruebas, 10% proyecto, 5% asistencia)',
      'Pase de lista por bloque horario con marcado masivo de presentes',
      'Publicación de tareas, exámenes y ausencias docentes sincronizadas con el estudiante',
    ],
    acentoClase: 'border-amber-500/35 hover:border-amber-500/70',
    badgeClase: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  },
  {
    id: 'hub-familiar',
    titulo: 'Hub Estudiantil & Familia',
    subtitulo: 'Cuenta única Estudiante + Encargado Legal',
    categoria: 'estudiantil',
    rutaDemo: '/estudiante?tab=notas',
    rolDemo: 'encargado',
    resumen:
      'Unifica carnet 3D, notas por periodo y asistencias en /estudiante con selector de perspectiva y multi-hijo.',
    capacidadesReales: [
      'Perspectiva conmutable entre modo Familia, Estudiante y Encargado Legal',
      'Cambio instantáneo entre hijos vinculados de distintas especialidades',
      'Sincronización inmediata de cambios registrados en Modo Docente',
    ],
    acentoClase: 'border-emerald-500/35 hover:border-emerald-500/70',
    badgeClase: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'carnet-3d',
    titulo: 'Carnet Digital 3D & QR Dinámico',
    subtitulo: 'Credencial interactiva anti-costo',
    categoria: 'estudiantil',
    rutaDemo: '/estudiante?tab=carnet',
    rolDemo: 'estudiante',
    estudianteIdDemo: '00000000-0000-0000-0000-000000000001',
    resumen:
      'Reemplaza el carnet de PVC o cartulina por una credencial interactiva con QR verificable y ficha médica al reverso.',
    capacidadesReales: [
      '7 temas visuales, 4 patrones geométricos, inclinación 3D y 8 insignias de especialidad',
      'Reverso con grupo sanguíneo, contacto de emergencia y lema estudiantil',
      'Validación en comedor y portón sin depender de conexión móvil',
    ],
    acentoClase: 'border-primary/35 hover:border-primary/70',
    badgeClase: 'bg-primary-tint text-primary border-primary/25',
  },
  {
    id: 'alerta-asistencia',
    titulo: 'Asistencia & Alerta Temprana REA',
    subtitulo: 'Seguimiento preventivo de regularidad',
    categoria: 'estudiantil',
    rutaDemo: '/estudiante?tab=asistencias',
    rolDemo: 'estudiante',
    estudianteIdDemo: 'dw-10-1-lucia',
    resumen:
      'Registra presentes, tardías y ausencias por periodo y dispara alerta preventiva según normativa oficial del MEP.',
    capacidadesReales: [
      'Detección automática al alcanzar 3 o más ausencias injustificadas o < 85%',
      'Registro de justificaciones formales y observaciones de docentes',
      'Prueba inmediata con el perfil demo de Lucía Fernández (10-1)',
    ],
    acentoClase: 'border-rose-500/35 hover:border-rose-500/70',
    badgeClase: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
  {
    id: 'agenda-escolar',
    titulo: 'Agenda Escolar Offline-First',
    subtitulo: 'Tareas, exámenes y avisos de ausencia',
    categoria: 'estudiantil',
    rutaDemo: '/agenda',
    rolDemo: 'estudiante',
    estudianteIdDemo: '00000000-0000-0000-0000-000000000001',
    resumen:
      'Calendario integrado con cuenta regresiva para evaluaciones, checklist interactivo y anuncios de docentes.',
    capacidadesReales: [
      'Mini-calendario mensual con marcadores visuales por tipo de evento',
      'Búsqueda por materia o docente y filtros rápidos por prioridad',
      'Recepción directa de actividades creadas desde Modo Docente',
    ],
    acentoClase: 'border-indigo-500/35 hover:border-indigo-500/70',
    badgeClase: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'chatbot-offline',
    titulo: 'Asistente Virtual Offline',
    subtitulo: 'Consultas en lenguaje natural sin internet',
    categoria: 'servicios',
    rutaDemo: '/',
    rolDemo: 'estudiante',
    estudianteIdDemo: '00000000-0000-0000-0000-000000000001',
    resumen:
      'Chatbot integrado que interpreta referencias temporales relativas y responde desde caché local en milisegundos.',
    capacidadesReales: [
      'Entiende "hoy", "mañana", "pasado mañana", "ayer", días de la semana y meses',
      'Responde dudas sobre Agenda, Horarios, Comedor, Noticias y Carnet',
      'Sugerencias rápidas en un toque para uso ágil en celular',
    ],
    acentoClase: 'border-sky-500/35 hover:border-sky-500/70',
    badgeClase: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  },
  {
    id: 'comedor-nocturna',
    titulo: 'Comedor & Confirmación Nocturna',
    subtitulo: 'Menú del ciclo y reserva anti-desperdicio',
    categoria: 'servicios',
    rutaDemo: '/comedor',
    rolDemo: 'estudiante',
    estudianteIdDemo: 'electro-11-2-andres',
    resumen:
      'Consulta del plato diario y semanal del comedor junto con confirmación de cena para la Sección Nocturna.',
    capacidadesReales: [
      'Ventana inteligente de confirmación desde las 8:00 PM previas hasta las 5:30 PM',
      'Aviso logístico claro sobre disponibilidad de insumos',
      'Conteo por especialidad y sección para planificación de cocina',
    ],
    acentoClase: 'border-teal-500/35 hover:border-teal-500/70',
    badgeClase: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
  },
  {
    id: 'horarios-dinamicos',
    titulo: 'Horarios Diurno y Nocturno',
    subtitulo: 'Clase en curso y siguiente aula 24/7',
    categoria: 'servicios',
    rutaDemo: '/horarios',
    rolDemo: 'estudiante',
    estudianteIdDemo: '00000000-0000-0000-0000-000000000001',
    resumen:
      'Detección automática de lección activa, recesos, almuerzo o cena según la hora oficial de Costa Rica.',
    capacidadesReales: [
      'Cobertura estructurada de 7° a 12° y cambio rápido entre secciones',
      'Soporte completo para jornada Diurna y Sección Nocturna',
      'Respaldo automático en almacenamiento local para consultas sin cobertura',
    ],
    acentoClase: 'border-blue-500/35 hover:border-blue-500/70',
    badgeClase: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  {
    id: 'avisos-notificaciones',
    titulo: 'Avisos Oficiales & Notificaciones',
    subtitulo: 'Alertas segmentadas por sección y nivel',
    categoria: 'servicios',
    rutaDemo: '/avisos',
    rolDemo: 'estudiante',
    estudianteIdDemo: '00000000-0000-0000-0000-000000000001',
    resumen:
      'Canal oficial para comunicados urgentes, ausencias docentes, cambios de menú y salidas tempranas.',
    capacidadesReales: [
      'Segmentación precisa por institución, nivel, especialidad o sección',
      'Bandeja in-app y notificaciones Web integradas con Service Worker',
      'Canales temáticos configurables por el usuario',
    ],
    acentoClase: 'border-orange-500/35 hover:border-orange-500/70',
    badgeClase: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  },
  {
    id: 'panel-admin',
    titulo: 'Panel Administrativo & Auditoría',
    subtitulo: 'Gobernanza institucional (/admin)',
    categoria: 'docente',
    rutaDemo: '/admin',
    rolDemo: 'admin',
    resumen:
      'Consola protegida por RBAC para publicar avisos, gestionar noticias, consultar directorio y auditar eventos.',
    capacidadesReales: [
      'Métricas en vivo de confirmación de cena en comedor nocturno',
      'Gestor completo de comunicados urgentes y noticias del Dashboard',
      'Bitácora de auditoría institucional separada de vistas estudiantiles',
    ],
    acentoClase: 'border-violet-500/35 hover:border-violet-500/70',
    badgeClase: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
  },
  {
    id: 'pwa-seguridad',
    titulo: 'PWA Instalable & Ley N° 8968',
    subtitulo: 'Privacidad estricta y costo cero',
    categoria: 'arquitectura',
    rutaDemo: '/expo#simulador',
    rolDemo: 'estudiante',
    resumen:
      'Instalación directa sin tiendas de aplicaciones y datos sensibles protegidos exclusivamente con RLS en PostgreSQL.',
    capacidadesReales: [
      'Datos personales, notas y docentes residen solo en Supabase PostgreSQL + RLS',
      'Asistente de instalación nativo para Android, iOS Safari y escritorio',
      'Arquitectura con code splitting por ruta y tema claro/oscuro accesible',
    ],
    acentoClase: 'border-cyan-500/35 hover:border-cyan-500/70',
    badgeClase: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  },
]
