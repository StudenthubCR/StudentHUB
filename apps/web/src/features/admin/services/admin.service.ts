import { supabase } from '@/lib/supabase'
import {
  obtenerTodosLosAvisosAdmin,
  CORREO_ADMIN_UNICO,
  esUsuarioAdmin,
} from '@/features/avisos/avisos.service'
import type { InstitutionAlert } from '@/features/avisos/avisos.types'
import { NOTICIAS } from '@/features/dashboard/noticias.fixture'
import type {
  ActivityLogItem,
  AdminKpis,
  AlcanceAvisoStat,
  EstudianteDirectorio,
  ModuloAuditoria,
  NoticiaAdmin,
  TipoAccionAuditoria,
} from './admin.types'

const CLAVE_AUDITORIA = 'studenthub_audit_logs_v1'
const CLAVE_ESTUDIANTES = 'studenthub_estudiantes_admin_v1'
const CLAVE_NOTICIAS = 'studenthub_noticias_admin_v1'

const LOGS_INICIALES: ActivityLogItem[] = [
  {
    id: 'log-1',
    accion: 'inicio_sesion_admin',
    modulo: 'sistema',
    descripcion: 'Sesión iniciada con credenciales maestras',
    detalles: 'Acceso seguro verificado desde consola institucional',
    autor: CORREO_ADMIN_UNICO,
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'log-2',
    accion: 'crear_aviso',
    modulo: 'avisos',
    descripcion: 'Publicación de aviso de salida anticipada',
    detalles: 'Alcance: Toda la institución (Consejo de Profesores)',
    autor: CORREO_ADMIN_UNICO,
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'log-3',
    accion: 'alerta_urgente',
    modulo: 'avisos',
    descripcion: 'Emisión de ausencia docente en Sección 11-1',
    detalles: 'Programación Web - Comisión oficial docente',
    autor: CORREO_ADMIN_UNICO,
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
  },
  {
    id: 'log-4',
    accion: 'editar_noticia',
    modulo: 'noticias',
    descripcion: 'Actualización de afiche de Matrícula 2027',
    detalles: 'Se habilitó la opción destacada para carrusel principal',
    autor: CORREO_ADMIN_UNICO,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'log-5',
    accion: 'reasignar_estudiante',
    modulo: 'estudiantes',
    descripcion: 'Reubicación de estudiante Sofía Navarro a sección 12-1',
    detalles: 'Cambio de especialidad: Ciberseguridad a Desarrollo Web',
    autor: CORREO_ADMIN_UNICO,
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
]

const ESTUDIANTES_SEMILLA: EstudianteDirectorio[] = [
  {
    id: 'est-1',
    codigo: '208520530',
    cedula: '1-1892-0431',
    nombre: 'Erick García Burgos',
    correo: 'erickgarciab2134@gmail.com',
    especialidad: 'Desarrollo Web',
    seccion: '11-1',
    estado: 'activo',
    fechaIngreso: '2024-02-05',
  },
  {
    id: 'est-2',
    codigo: '208520531',
    cedula: '1-1904-0822',
    nombre: 'Sofía Navarro Arias',
    correo: 'sofia.navarro@mep.go.cr',
    especialidad: 'Desarrollo Web',
    seccion: '12-1',
    estado: 'activo',
    fechaIngreso: '2023-02-06',
  },
  {
    id: 'est-3',
    codigo: '208520532',
    cedula: '1-1823-0119',
    nombre: 'Mateo Calderón Solano',
    correo: 'mateo.calderon@mep.go.cr',
    especialidad: 'Contabilidad',
    seccion: '10-2',
    estado: 'activo',
    fechaIngreso: '2025-02-03',
  },
  {
    id: 'est-4',
    codigo: '208520533',
    cedula: '2-0811-0492',
    nombre: 'Valeria Vargas Rojas',
    correo: 'valeria.vargas@mep.go.cr',
    especialidad: 'Ciberseguridad',
    seccion: '11-2',
    estado: 'activo',
    fechaIngreso: '2024-02-05',
  },
  {
    id: 'est-5',
    codigo: '208520534',
    cedula: '1-1944-0312',
    nombre: 'Gabriel Jiménez Chacón',
    correo: 'gabriel.jimenez@mep.go.cr',
    especialidad: 'Electromecánica',
    seccion: '12-2',
    estado: 'activo',
    fechaIngreso: '2023-02-06',
  },
  {
    id: 'est-6',
    codigo: '208520535',
    cedula: '1-1899-0744',
    nombre: 'Jimena Castro Morales',
    correo: 'jimena.castro@mep.go.cr',
    especialidad: 'Diseño Publicitario',
    seccion: '10-1',
    estado: 'activo',
    fechaIngreso: '2025-02-03',
  },
  {
    id: 'est-7',
    codigo: '208520536',
    cedula: '3-0512-0981',
    nombre: 'Kevin Monge Alvarado',
    correo: 'kevin.monge@mep.go.cr',
    especialidad: 'Administración Logística',
    seccion: '11-3',
    estado: 'inactivo',
    fechaIngreso: '2024-02-05',
  },
  {
    id: 'est-8',
    codigo: '208520537',
    cedula: '1-1772-0321',
    nombre: 'Daniela Salazar Quirós',
    correo: 'daniela.salazar@mep.go.cr',
    especialidad: 'Secretariado Ejecutivo',
    seccion: '10-3',
    estado: 'activo',
    fechaIngreso: '2025-02-03',
  },
]

// ==============================================================================
// 1. REGISTRO DE AUDITORÍA (ACTIVITY LOGS)
// ==============================================================================

let memoriaLogs: ActivityLogItem[] = [...LOGS_INICIALES]

export function obtenerLogsAuditoria(): ActivityLogItem[] {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(CLAVE_AUDITORIA)
      if (raw) return JSON.parse(raw) as ActivityLogItem[]
      localStorage.setItem(CLAVE_AUDITORIA, JSON.stringify(memoriaLogs))
    } catch {
      // Ignorar
    }
  }
  return memoriaLogs
}

export function registrarActividad(
  accion: TipoAccionAuditoria,
  modulo: ModuloAuditoria,
  descripcion: string,
  autor = CORREO_ADMIN_UNICO,
  detalles?: string,
): ActivityLogItem {
  const nuevoLog: ActivityLogItem = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
    accion,
    modulo,
    descripcion,
    detalles,
    autor,
    timestamp: new Date().toISOString(),
  }

  const actuales = obtenerLogsAuditoria()
  const actualizados = [nuevoLog, ...actuales].slice(0, 50)
  memoriaLogs = actualizados

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_AUDITORIA, JSON.stringify(actualizados))
    } catch {
      // Ignorar
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studenthub:admin-activity-updated'))
  }

  return nuevoLog
}

// ==============================================================================
// 2. MÉTRICAS GENERALES (KPIS) Y ESTADÍSTICAS DE ALCANCE
// ==============================================================================

export async function obtenerMetricasAdmin(): Promise<AdminKpis> {
  const avisos = await obtenerTodosLosAvisosAdmin()
  const estudiantes = await obtenerEstudiantesDirectorio()
  const logs = obtenerLogsAuditoria()

  const ahora = new Date()
  const avisosVigentes = avisos.filter((a) => {
    if (!a.active) return false
    if (a.expires_at && new Date(a.expires_at) <= ahora) return false
    return true
  }).length

  const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const accionesHoy = logs.filter((l) => new Date(l.timestamp) >= hace24h).length

  const activos = estudiantes.filter((e) => e.estado === 'activo').length

  return {
    totalEstudiantes: estudiantes.length > 0 ? estudiantes.length * 52 : 480, // Total estimado del colegio
    estudiantesActivos: activos > 0 ? activos * 50 : 465,
    avisosVigentes,
    avisosTotales: avisos.length,
    reportesPendientes: 2, // Incidencias de infraestructura / comedor
    accionesHoy: accionesHoy || 4,
  }
}

export function calcularAlcanceAviso(aviso: InstitutionAlert, totalEstudiantes = 480): AlcanceAvisoStat {
  let alcanceTexto = 'Toda la institución'
  let porcentaje = 100
  let destinatariosAprox = totalEstudiantes

  if (aviso.target_type === 'specialty') {
    const cant = aviso.target_values.length
    alcanceTexto = `Especialidad: ${aviso.target_values.join(', ')}`
    porcentaje = Math.min(100, Math.round((cant / 7) * 100))
    destinatariosAprox = Math.round((totalEstudiantes * porcentaje) / 100)
  } else if (aviso.target_type === 'section') {
    const cant = aviso.target_values.length
    alcanceTexto = `Sección: ${aviso.target_values.join(', ')}`
    porcentaje = Math.min(100, Math.round((cant / 9) * 100))
    destinatariosAprox = Math.round((totalEstudiantes * porcentaje) / 100)
  }

  const estaActivo = aviso.active && (!aviso.expires_at || new Date(aviso.expires_at) > new Date())

  return {
    id: aviso.id,
    titulo: aviso.title,
    categoria: aviso.category,
    prioridad: aviso.priority,
    alcanceTexto,
    porcentaje,
    destinatariosAprox,
    fecha: aviso.created_at,
    activa: estaActivo,
  }
}

// ==============================================================================
// 3. DIRECTORIO Y GESTIÓN DE ESTUDIANTES / SECCIONES
// ==============================================================================

export async function obtenerEstudiantesDirectorio(): Promise<EstudianteDirectorio[]> {
  try {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('id, codigo, correo, nombre, especialidad, estado, created_at, grupos(codigo)')
      .limit(50)

    if (!error && data && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapeados: EstudianteDirectorio[] = data.map((item: any) => ({
        id: item.id || item.codigo,
        codigo: item.codigo,
        cedula: `1-${item.codigo.slice(0, 4)}-${item.codigo.slice(4)}`,
        nombre: item.nombre,
        correo: item.correo,
        especialidad: item.especialidad || 'Tronco Común',
        seccion: item.grupos?.codigo || '10-1',
        estado: item.estado === 'activo' ? 'activo' : 'inactivo',
        fechaIngreso: item.created_at ? item.created_at.split('T')[0] : '2024-02-05',
      }))

      if (typeof window !== 'undefined') {
        localStorage.setItem(CLAVE_ESTUDIANTES, JSON.stringify(mapeados))
      }
      return mapeados
    }
  } catch {
    // Modo local / Fallback
  }

  if (typeof window !== 'undefined') {
    const guardados = localStorage.getItem(CLAVE_ESTUDIANTES)
    if (guardados) {
      try {
        return JSON.parse(guardados) as EstudianteDirectorio[]
      } catch {
        // Ignorar
      }
    }
    localStorage.setItem(CLAVE_ESTUDIANTES, JSON.stringify(ESTUDIANTES_SEMILLA))
  }

  return ESTUDIANTES_SEMILLA
}

export async function actualizarEstudianteDirectorio(
  id: string,
  cambios: { seccion?: string; especialidad?: string; estado?: 'activo' | 'inactivo' },
  correoAdmin = CORREO_ADMIN_UNICO,
): Promise<{ ok: boolean; error?: string }> {
  if (!esUsuarioAdmin(correoAdmin)) {
    return { ok: false, error: 'Permisos insuficientes.' }
  }

  const estudiantes = await obtenerEstudiantesDirectorio()
  const indice = estudiantes.findIndex((e) => e.id === id || e.codigo === id)
  if (indice === -1) {
    return { ok: false, error: 'Estudiante no encontrado.' }
  }

  const estudiante = estudiantes[indice]!
  const anteriorSeccion = estudiante.seccion
  const anteriorEsp = estudiante.especialidad

  if (cambios.seccion !== undefined) estudiante.seccion = cambios.seccion
  if (cambios.especialidad !== undefined) estudiante.especialidad = cambios.especialidad
  if (cambios.estado !== undefined) estudiante.estado = cambios.estado

  // Intentar actualizar en Supabase si coincide con UUID
  try {
    const camposSupabase: Record<string, string> = {}
    if (cambios.especialidad) camposSupabase.especialidad = cambios.especialidad
    if (cambios.estado) camposSupabase.estado = cambios.estado

    if (Object.keys(camposSupabase).length > 0) {
      await supabase.from('estudiantes').update(camposSupabase).eq('codigo', estudiante.codigo)
    }
  } catch {
    // Silencioso
  }

  if (typeof window !== 'undefined') {
    estudiantes[indice] = estudiante
    localStorage.setItem(CLAVE_ESTUDIANTES, JSON.stringify(estudiantes))
  }

  // Registrar auditoría
  const detallesCambio = [
    cambios.seccion ? `Sección: ${anteriorSeccion} → ${cambios.seccion}` : null,
    cambios.especialidad ? `Especialidad: ${anteriorEsp} → ${cambios.especialidad}` : null,
    cambios.estado ? `Estado: ${cambios.estado}` : null,
  ]
    .filter(Boolean)
    .join(' | ')

  registrarActividad(
    'reasignar_estudiante',
    'estudiantes',
    `Reasignación de estudiante: ${estudiante.nombre}`,
    correoAdmin,
    detallesCambio,
  )

  return { ok: true }
}

// ==============================================================================
// 4. GESTOR DE NOTICIAS Y EVENTOS INSTITUCIONALES
// ==============================================================================

let memoriaNoticias: NoticiaAdmin[] | null = null

function inicializarNoticias(): NoticiaAdmin[] {
  return NOTICIAS.map((n, i) => ({
    id: n.id,
    titulo: n.titulo,
    resumen: n.descripcion,
    cuerpo: `Detalles completos del evento institucional "${n.titulo}". Las actividades correspondientes se llevarán a cabo en las instalaciones centrales del CTP con participación de todas las especialidades técnicas.`,
    imagen: n.imagen,
    destacada: i < 2,
    publicada: true,
    fechaPublicacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 1) * 7).toISOString(),
    periodo: n.periodo || 'Periodo 2026',
    autor: CORREO_ADMIN_UNICO,
  }))
}

export function obtenerNoticiasAdmin(): NoticiaAdmin[] {
  if (typeof localStorage !== 'undefined') {
    try {
      const guardadas = localStorage.getItem(CLAVE_NOTICIAS)
      if (guardadas) {
        memoriaNoticias = JSON.parse(guardadas) as NoticiaAdmin[]
        return memoriaNoticias
      }
    } catch {
      // Ignorar
    }
  }

  if (!memoriaNoticias) {
    memoriaNoticias = inicializarNoticias()
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(memoriaNoticias))
      } catch {
        // Ignorar
      }
    }
  }

  return memoriaNoticias
}

export function guardarNoticiaAdmin(
  noticia: Omit<NoticiaAdmin, 'id'> & { id?: string },
  correoAdmin = CORREO_ADMIN_UNICO,
): { ok: boolean; noticia: NoticiaAdmin; error?: string } {
  if (!esUsuarioAdmin(correoAdmin)) {
    return { ok: false, error: 'Permisos insuficientes.', noticia: noticia as NoticiaAdmin }
  }

  const noticias = obtenerNoticiasAdmin()
  const esEdicion = Boolean(noticia.id)

  const idFinal =
    noticia.id ||
    (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `noticia-${Date.now()}`)

  const noticiaGuardada: NoticiaAdmin = {
    id: idFinal,
    titulo: noticia.titulo.trim(),
    resumen: noticia.resumen.trim(),
    cuerpo: noticia.cuerpo.trim(),
    imagen: noticia.imagen.trim() || '/news_fiestas_patrias.webp',
    destacada: Boolean(noticia.destacada),
    publicada: Boolean(noticia.publicada),
    fechaPublicacion: noticia.fechaPublicacion || new Date().toISOString(),
    periodo: noticia.periodo || '2026',
    autor: correoAdmin,
  }

  let actualizadas: NoticiaAdmin[]
  if (esEdicion) {
    actualizadas = noticias.map((n) => (n.id === idFinal ? noticiaGuardada : n))
  } else {
    actualizadas = [noticiaGuardada, ...noticias]
  }

  memoriaNoticias = actualizadas

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(actualizadas))
    } catch {
      // Ignorar
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studenthub:admin-noticias-updated'))
  }

  registrarActividad(
    esEdicion ? 'editar_noticia' : 'crear_noticia',
    'noticias',
    `${esEdicion ? 'Edición' : 'Creación'} de noticia: "${noticiaGuardada.titulo}"`,
    correoAdmin,
    `Destacada: ${noticiaGuardada.destacada ? 'Sí' : 'No'} | Periodo: ${noticiaGuardada.periodo}`,
  )

  return { ok: true, noticia: noticiaGuardada }
}

export function eliminarNoticiaAdmin(id: string, correoAdmin = CORREO_ADMIN_UNICO): boolean {
  if (!esUsuarioAdmin(correoAdmin)) return false

  const noticias = obtenerNoticiasAdmin()
  const encontrada = noticias.find((n) => n.id === id)
  const filtradas = noticias.filter((n) => n.id !== id)

  memoriaNoticias = filtradas

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(filtradas))
    } catch {
      // Ignorar
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studenthub:admin-noticias-updated'))
  }

  if (encontrada) {
    registrarActividad(
      'eliminar_noticia',
      'noticias',
      `Eliminación de noticia: "${encontrada.titulo}"`,
      correoAdmin,
    )
  }

  return true
}

export function toggleDestacadaNoticia(id: string, correoAdmin = CORREO_ADMIN_UNICO): boolean {
  if (!esUsuarioAdmin(correoAdmin)) return false
  const noticias = [...obtenerNoticiasAdmin()]
  const indice = noticias.findIndex((n) => n.id === id)
  if (indice === -1) return false

  const noticia = { ...noticias[indice]!, destacada: !noticias[indice]!.destacada }
  noticias[indice] = noticia
  memoriaNoticias = noticias

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(noticias))
    } catch {
      // Ignorar
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studenthub:admin-noticias-updated'))
  }

  registrarActividad(
    'editar_noticia',
    'noticias',
    `Noticia "${noticia.titulo}" marcada como ${noticia.destacada ? 'Destacada' : 'Normal'}`,
    correoAdmin,
  )

  return true
}
