import { supabase } from '@/lib/supabase'
import {
  guardarDatoUsuarioScoped,
  leerDatoUsuarioScoped,
  registrarSincronizacion,
} from '@/lib/offlineCache'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import type { NotaMateria, PeriodoNota } from '@/features/notas/notas.types'
import {
  calcularResumenNotas,
  guardarNotaEstudiante,
  obtenerNotasDemoCombinadas,
  type GuardarNotaPayload,
} from '@/features/notas/notas.service'
import type {
  EstadoAsistencia,
  PeriodoAsistencia,
  RegistroAsistencia,
} from '@/features/asistencias/asistencias.types'
import {
  calcularResumenAsistencias,
  guardarRegistrosAsistencia,
  obtenerAsistenciasDemoCombinadas,
  type GuardarAsistenciaInput,
} from '@/features/asistencias/asistencias.service'
import type { EventoAgenda } from '@/features/agenda/agenda.types'
import {
  guardarEventosDocenteLocales,
  obtenerEventosDocenteLocales,
} from '@/features/agenda/agenda.service'
import {
  DOCENTE_DANGELO_DEMO,
  ESTUDIANTES_MASTER_DEMO,
  OBSERVACIONES_DOCENTE_DEMO_SEED,
} from './docente.fixture'
import type {
  CategoriaObservacion,
  DocenteProfile,
  EstudianteConMetricasDocente,
  ObservacionDocente,
  ResumenGrupoDocente,
} from './docente.types'

export const CLAVE_DEMO_OBSERVACIONES_DOCENTE = 'studenthub_demo_observaciones_docente_v1'

export function normalizarEspecialidad(valor: string | null | undefined): string {
  return (valor ?? '').trim().toLowerCase()
}

/**
 * Verifica estrictamente que un estudiante pertenece a la especialidad asignada al docente.
 */
export function esEstudianteDeEspecialidadDocente(
  estudiante: Pick<Estudiante, 'especialidad'> | null | undefined,
  docente: Pick<DocenteProfile, 'especialidadAsignada' | 'activo'> | null | undefined,
): boolean {
  if (!estudiante || !docente || !docente.activo) return false
  const espEstudiante = normalizarEspecialidad(estudiante.especialidad)
  const espDocente = normalizarEspecialidad(docente.especialidadAsignada)
  if (!espEstudiante || !espDocente) return false
  return espEstudiante === espDocente
}

/**
 * Filtra una lista de estudiantes manteniendo ÚNICAMENTE aquellos cuya especialidad
 * coincide exactamente con la especialidad asignada al docente.
 */
export function filtrarEstudiantesPorDocente(
  estudiantes: Estudiante[],
  docente: DocenteProfile | null | undefined,
): Estudiante[] {
  if (!docente || !docente.activo) return []
  return estudiantes.filter((est) => esEstudianteDeEspecialidadDocente(est, docente))
}

function esModoDemoActivo(): boolean {
  return (
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('studenthub_demo_sesion') === 'true'
  )
}

function estaDispositivoOffline(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean' &&
    !navigator.onLine
  )
}

function scopeDeDocente(docente: Pick<DocenteProfile, 'id' | 'authUserId'>): string {
  return docente.authUserId ?? docente.id
}

type FilaDocenteRaw = {
  id: string
  auth_user_id?: string | null
  correo_institucional: string
  nombre_completo: string
  especialidad_asignada: string
  secciones_asignadas?: string[] | null
  activo: boolean
}

export function mapearFilaADocente(fila: FilaDocenteRaw): DocenteProfile {
  return {
    id: fila.id,
    authUserId: fila.auth_user_id ?? undefined,
    correoInstitucional: fila.correo_institucional,
    nombreCompleto: fila.nombre_completo,
    especialidadAsignada: fila.especialidad_asignada,
    seccionesAsignadas: Array.isArray(fila.secciones_asignadas) ? fila.secciones_asignadas : [],
    activo: Boolean(fila.activo),
  }
}

/**
 * Resuelve el perfil docente en Supabase cuando el usuario autenticado corresponde a un profesor activo.
 */
export async function obtenerPerfilDocenteActual(
  userId?: string | null,
  email?: string | null,
): Promise<DocenteProfile | null> {
  if (esModoDemoActivo()) {
    const rolDemo =
      typeof localStorage !== 'undefined' ? localStorage.getItem('studenthub_demo_rol') : null
    if (rolDemo === 'docente' || userId === DOCENTE_DANGELO_DEMO.authUserId) {
      return DOCENTE_DANGELO_DEMO
    }
    return null
  }

  const emailLimpio = (email ?? '').trim().toLowerCase()
  if (!userId && !emailLimpio) return null

  const scopeCache = userId || emailLimpio
  const enCache = scopeCache
    ? leerDatoUsuarioScoped<DocenteProfile | null>(scopeCache, 'perfil_docente')?.data
    : undefined

  if (estaDispositivoOffline() && enCache !== undefined) {
    return enCache
  }

  try {
    if (userId) {
      const { data, error } = await supabase
        .from('docentes')
        .select('id, auth_user_id, correo_institucional, nombre_completo, especialidad_asignada, secciones_asignadas, activo')
        .eq('auth_user_id', userId)
        .eq('activo', true)
        .maybeSingle<FilaDocenteRaw>()

      if (!error && data) {
        const perfil = mapearFilaADocente(data)
        if (scopeCache) guardarDatoUsuarioScoped(scopeCache, 'perfil_docente', perfil)
        return perfil
      }
      if (error && enCache !== undefined) {
        return enCache
      }
    }

    if (emailLimpio) {
      const { data, error } = await supabase
        .from('docentes')
        .select('id, auth_user_id, correo_institucional, nombre_completo, especialidad_asignada, secciones_asignadas, activo')
        .ilike('correo_institucional', emailLimpio)
        .eq('activo', true)
        .maybeSingle<FilaDocenteRaw>()

      if (!error && data) {
        const perfil = mapearFilaADocente(data)
        if (scopeCache) guardarDatoUsuarioScoped(scopeCache, 'perfil_docente', perfil)
        return perfil
      }
      if (error && enCache !== undefined) {
        return enCache
      }
      if (!error && !data && scopeCache) {
        guardarDatoUsuarioScoped(scopeCache, 'perfil_docente', null)
      }
    }
  } catch (err) {
    console.warn('No se pudo resolver perfil docente en Supabase:', err)
    if (enCache !== undefined) {
      return enCache
    }
  }

  return null
}

type FilaEstudianteDocenteRaw = {
  id: string
  user_id?: string | null
  codigo: string
  correo?: string | null
  nombre: string
  especialidad: string
  estado?: string | null
  foto_url?: string | null
  grupos?:
    | { codigo?: string; nivel?: string; jornada?: string }
    | Array<{ codigo?: string; nivel?: string; jornada?: string }>
    | null
  instituciones?:
    | { nombre?: string; slug?: string }
    | Array<{ nombre?: string; slug?: string }>
    | null
}

function mapearEstudianteDocente(f: FilaEstudianteDocenteRaw): Estudiante {
  const grupo = Array.isArray(f.grupos) ? f.grupos[0] : f.grupos
  const inst = Array.isArray(f.instituciones) ? f.instituciones[0] : f.instituciones

  return {
    id: f.id,
    user_id: f.user_id ?? undefined,
    correo: f.correo ?? undefined,
    nombre: f.nombre,
    codigo: f.codigo,
    especialidad: f.especialidad,
    institucion: inst?.nombre ?? 'CTP Rosario de Naranjo',
    siglaInstitucion: (inst?.slug ?? 'CTP').toUpperCase(),
    grupo: grupo?.codigo ?? '11-1',
    seccion: grupo?.codigo ?? '11-1',
    nivel: grupo?.nivel ?? '11mo',
    jornada: grupo?.jornada ?? 'Diurna',
    vigencia: `Ciclo Lectivo ${new Date().getFullYear()}`,
    fotoUrl: f.foto_url ?? '',
    activo: f.estado === 'activo' || !f.estado,
  }
}

/**
 * Obtiene el padrón estudiantil autorizado exclusivamente para la especialidad del docente.
 */
export async function obtenerEstudiantesDocente(docente: DocenteProfile): Promise<Estudiante[]> {
  if (!docente.activo) return []

  if (esModoDemoActivo()) {
    return filtrarEstudiantesPorDocente(ESTUDIANTES_MASTER_DEMO, docente)
  }

  const scope = scopeDeDocente(docente)
  const enCache = leerDatoUsuarioScoped<Estudiante[]>(scope, 'docente_estudiantes')?.data
  if (estaDispositivoOffline() && enCache) {
    return filtrarEstudiantesPorDocente(enCache, docente)
  }

  try {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('id, user_id, codigo, correo, nombre, especialidad, estado, foto_url, grupos(codigo, nivel, jornada), instituciones(nombre, slug)')
      .eq('estado', 'activo')
      .ilike('especialidad', docente.especialidadAsignada.trim())
      .order('nombre', { ascending: true })

    if (error) {
      if (enCache) return filtrarEstudiantesPorDocente(enCache, docente)
      throw new Error(`No se pudo consultar el padrón de ${docente.especialidadAsignada}: ${error.message}`)
    }

    const mapeados = ((data ?? []) as FilaEstudianteDocenteRaw[]).map(mapearEstudianteDocente)
    const filtrados = filtrarEstudiantesPorDocente(mapeados, docente)
    guardarDatoUsuarioScoped(scope, 'docente_estudiantes', filtrados)
    registrarSincronizacion('docente:estudiantes')
    return filtrados
  } catch (err) {
    if (enCache) return filtrarEstudiantesPorDocente(enCache, docente)
    throw err
  }
}

/**
 * Obtiene las calificaciones de los estudiantes autorizados del docente para un periodo.
 */
export async function obtenerNotasGrupoDocente(
  docente: DocenteProfile,
  estudiantesAutorizados: Estudiante[],
  periodo: PeriodoNota = 'I Periodo',
): Promise<NotaMateria[]> {
  const filtrados = filtrarEstudiantesPorDocente(estudiantesAutorizados, docente)
  const idsPermitidos = new Set(filtrados.map((e) => e.id).filter(Boolean) as string[])
  if (idsPermitidos.size === 0) return []

  if (esModoDemoActivo()) {
    return obtenerNotasDemoCombinadas().filter(
      (n) =>
        idsPermitidos.has(n.estudianteId) &&
        (periodo === 'Anual' || n.periodo === periodo),
    )
  }

  const scope = scopeDeDocente(docente)
  const seg = `docente_notas_${periodo}`
  const enCache = leerDatoUsuarioScoped<NotaMateria[]>(scope, seg)?.data
  if (estaDispositivoOffline() && enCache) {
    return enCache.filter((n) => idsPermitidos.has(n.estudianteId))
  }

  try {
    let query = supabase
      .from('notas')
      .select('*')
      .in('estudiante_id', Array.from(idsPermitidos))

    if (periodo !== 'Anual') {
      query = query.eq('periodo', periodo)
    }

    const { data, error } = await query.order('materia', { ascending: true })
    if (error) {
      if (enCache) return enCache.filter((n) => idsPermitidos.has(n.estudianteId))
      throw new Error(`Error al consultar calificaciones: ${error.message}`)
    }

    const res: NotaMateria[] = (data ?? []).map((f: Record<string, unknown>) => {
      const notaFinal = Number(f.nota_final) || 0
      return {
        id: String(f.id),
        estudianteId: String(f.estudiante_id),
        periodo: String(f.periodo) as PeriodoNota,
        materia: String(f.materia),
        docente: f.docente ? String(f.docente) : undefined,
        notaFinal,
        rubrica: {
          trabajoCotidiano: Number(f.trabajo_cotidiano) || 0,
          tareas: Number(f.tareas) || 0,
          pruebas: Number(f.pruebas) || 0,
          proyecto: Number(f.proyecto) || 0,
          asistencia: Number(f.asistencia) || 0,
        },
        observaciones: f.observaciones ? String(f.observaciones) : undefined,
        aprobada: notaFinal >= 70,
      }
    })
    guardarDatoUsuarioScoped(scope, seg, res)
    return res
  } catch (err) {
    if (enCache) return enCache.filter((n) => idsPermitidos.has(n.estudianteId))
    throw err
  }
}

/**
 * Obtiene las asistencias de los estudiantes autorizados del docente.
 */
export async function obtenerAsistenciasGrupoDocente(
  docente: DocenteProfile,
  estudiantesAutorizados: Estudiante[],
  periodo?: PeriodoAsistencia,
): Promise<RegistroAsistencia[]> {
  const filtrados = filtrarEstudiantesPorDocente(estudiantesAutorizados, docente)
  const idsPermitidos = new Set(filtrados.map((e) => e.id).filter(Boolean) as string[])
  if (idsPermitidos.size === 0) return []

  if (esModoDemoActivo()) {
    return obtenerAsistenciasDemoCombinadas().filter(
      (a) => idsPermitidos.has(a.estudianteId) && (!periodo || a.periodo === periodo),
    )
  }

  const scope = scopeDeDocente(docente)
  const seg = `docente_asistencias_${periodo ?? 'todas'}`
  const enCache = leerDatoUsuarioScoped<RegistroAsistencia[]>(scope, seg)?.data
  if (estaDispositivoOffline() && enCache) {
    return enCache.filter((a) => idsPermitidos.has(a.estudianteId))
  }

  try {
    let query = supabase
      .from('asistencias')
      .select('*')
      .in('estudiante_id', Array.from(idsPermitidos))

    if (periodo) {
      query = query.eq('periodo', periodo)
    }

    const { data, error } = await query.order('fecha', { ascending: false })
    if (error) {
      if (enCache) return enCache.filter((a) => idsPermitidos.has(a.estudianteId))
      throw new Error(`Error al consultar asistencias: ${error.message}`)
    }

    const res: RegistroAsistencia[] = (data ?? []).map((f: Record<string, unknown>) => ({
      id: String(f.id),
      estudianteId: String(f.estudiante_id),
      fecha: String(f.fecha),
      periodo: String(f.periodo) as PeriodoAsistencia,
      materia: String(f.materia),
      bloque: String(f.bloque),
      estado: String(f.estado) as EstadoAsistencia,
      justificacion: f.justificacion ? String(f.justificacion) : undefined,
    }))
    guardarDatoUsuarioScoped(scope, seg, res)
    return res
  } catch (err) {
    if (enCache) return enCache.filter((a) => idsPermitidos.has(a.estudianteId))
    throw err
  }
}

/**
 * Calcula las métricas y alertas tempranas para cada estudiante dentro del alcance del docente.
 */
export function construirMetricasEstudiantesDocente(
  estudiantes: Estudiante[],
  notas: NotaMateria[],
  asistencias: RegistroAsistencia[],
): {
  listado: EstudianteConMetricasDocente[]
  resumen: ResumenGrupoDocente
} {
  const listado: EstudianteConMetricasDocente[] = estudiantes.map((estudiante) => {
    const notasEst = notas.filter((n) => n.estudianteId === estudiante.id)
    const asistEst = asistencias.filter((a) => a.estudianteId === estudiante.id)

    const resNotas = calcularResumenNotas(notasEst)
    const resAsist = calcularResumenAsistencias(asistEst)

    const motivosAlerta: string[] = []
    if (resNotas.totalMaterias > 0 && resNotas.promedioGeneral < 70) {
      motivosAlerta.push(`Promedio bajo (${resNotas.promedioGeneral.toFixed(1)})`)
    } else if (resNotas.materiasEnRiesgo > 0) {
      motivosAlerta.push(
        `${resNotas.materiasEnRiesgo} ${resNotas.materiasEnRiesgo === 1 ? 'materia' : 'materias'} < 70`,
      )
    }

    if (resAsist.ausenciasInjustificadas >= 3) {
      motivosAlerta.push(`${resAsist.ausenciasInjustificadas} ausencias injustificadas`)
    } else if (resAsist.totalSesiones > 0 && resAsist.porcentajeAsistencia < 85) {
      motivosAlerta.push(`Asistencia baja (${resAsist.porcentajeAsistencia.toFixed(0)}%)`)
    }

    return {
      estudiante,
      promedioGeneral: resNotas.promedioGeneral,
      materiasEvaluadas: resNotas.totalMaterias,
      materiasEnRiesgo: resNotas.materiasEnRiesgo,
      porcentajeAsistencia: resAsist.porcentajeAsistencia,
      ausenciasInjustificadas: resAsist.ausenciasInjustificadas,
      totalSesiones: resAsist.totalSesiones,
      enAlerta: motivosAlerta.length > 0,
      motivosAlerta,
    }
  })

  const conNotas = listado.filter((item) => item.materiasEvaluadas > 0)
  const promedioGrupo =
    conNotas.length > 0
      ? Number(
          (conNotas.reduce((acc, item) => acc + item.promedioGeneral, 0) / conNotas.length).toFixed(1),
        )
      : 0

  const asistenciaPromedio =
    listado.length > 0
      ? Number(
          (listado.reduce((acc, item) => acc + item.porcentajeAsistencia, 0) / listado.length).toFixed(1),
        )
      : 100

  return {
    listado,
    resumen: {
      totalEstudiantes: listado.length,
      promedioGrupo,
      asistenciaPromedio,
      estudiantesEnAlerta: listado.filter((i) => i.enAlerta).length,
    },
  }
}

/**
 * Guarda una calificación validando estrictamente que el estudiante pertenezca a la especialidad del docente.
 */
export async function guardarNotaDocente(
  docente: DocenteProfile,
  estudiante: Estudiante,
  payload: GuardarNotaPayload,
): Promise<{ ok: boolean; nota?: NotaMateria; error?: string }> {
  if (!esEstudianteDeEspecialidadDocente(estudiante, docente)) {
    return {
      ok: false,
      error: `Acceso denegado: este estudiante no pertenece a la especialidad ${docente.especialidadAsignada}.`,
    }
  }

  if (!esModoDemoActivo() && estaDispositivoOffline()) {
    return {
      ok: false,
      error:
        'Sin conexión a internet: necesitás red para guardar la calificación en Supabase. Los cambios del formulario permanecen en pantalla.',
    }
  }

  return guardarNotaEstudiante(
    {
      ...payload,
      estudianteId: estudiante.id || payload.estudianteId,
      docente: payload.docente?.trim() || docente.nombreCompleto,
    },
    docente.id,
  )
}

/**
 * Registra el pase de lista validando que cada estudiante pertenece a la especialidad del docente.
 */
export async function guardarAsistenciaDocente(
  docente: DocenteProfile,
  estudiantes: Estudiante[],
  entradas: GuardarAsistenciaInput[],
): Promise<{ ok: boolean; guardados: RegistroAsistencia[]; error?: string }> {
  const mapaEstudiantes = new Map(estudiantes.map((e) => [e.id, e]))
  for (const entrada of entradas) {
    const est = mapaEstudiantes.get(entrada.estudianteId)
    if (!esEstudianteDeEspecialidadDocente(est, docente)) {
      return {
        ok: false,
        guardados: [],
        error: `Acceso denegado: se detectó un estudiante fuera de ${docente.especialidadAsignada}.`,
      }
    }
  }

  if (!esModoDemoActivo() && estaDispositivoOffline()) {
    return {
      ok: false,
      guardados: [],
      error:
        'Sin conexión a internet: conectate a red para registrar el pase de lista oficial en Supabase.',
    }
  }

  return guardarRegistrosAsistencia(entradas, docente.id)
}

/**
 * Helper puro para aplicar "Marcar todos presentes" sobre el pase de lista actual.
 */
export function marcarTodosPresentes<
  T extends { estudianteId: string; estado: EstadoAsistencia; justificacion?: string },
>(lista: T[]): T[] {
  return lista.map((item) => ({
    ...item,
    estado: 'presente' as EstadoAsistencia,
  }))
}

// ==============================================================================
// OBSERVACIONES PEDAGÓGICAS DOCENTES
// ==============================================================================

function leerObservacionesDemo(): ObservacionDocente[] {
  if (typeof localStorage === 'undefined') return OBSERVACIONES_DOCENTE_DEMO_SEED
  try {
    const raw = localStorage.getItem(CLAVE_DEMO_OBSERVACIONES_DOCENTE)
    if (!raw) return OBSERVACIONES_DOCENTE_DEMO_SEED
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ObservacionDocente[]) : OBSERVACIONES_DOCENTE_DEMO_SEED
  } catch {
    return OBSERVACIONES_DOCENTE_DEMO_SEED
  }
}

export async function obtenerObservacionesDocente(
  docente: DocenteProfile,
  estudiantesAutorizados: Estudiante[],
  estudianteId?: string,
): Promise<ObservacionDocente[]> {
  const idsPermitidos = new Set(
    filtrarEstudiantesPorDocente(estudiantesAutorizados, docente)
      .map((e) => e.id)
      .filter(Boolean) as string[],
  )
  if (idsPermitidos.size === 0) return []

  if (esModoDemoActivo()) {
    return leerObservacionesDemo().filter(
      (o) => idsPermitidos.has(o.estudianteId) && (!estudianteId || o.estudianteId === estudianteId),
    )
  }

  const scope = scopeDeDocente(docente)
  const seg = `docente_observaciones_${estudianteId ?? 'todos'}`
  const enCache = leerDatoUsuarioScoped<ObservacionDocente[]>(scope, seg)?.data
  if (estaDispositivoOffline() && enCache) {
    return enCache.filter((o) => idsPermitidos.has(o.estudianteId))
  }

  try {
    let query = supabase
      .from('observaciones_docentes')
      .select('*')
      .in('estudiante_id', Array.from(idsPermitidos))

    if (estudianteId) {
      query = query.eq('estudiante_id', estudianteId)
    }

    const { data, error } = await query.order('creado_el', { ascending: false })
    if (error) {
      if (enCache) return enCache.filter((o) => idsPermitidos.has(o.estudianteId))
      throw new Error(`No se pudieron cargar las observaciones: ${error.message}`)
    }

    const res: ObservacionDocente[] = (data ?? []).map((f: Record<string, unknown>) => ({
      id: String(f.id),
      estudianteId: String(f.estudiante_id),
      docenteId: String(f.docente_id),
      docenteNombre: docente.nombreCompleto,
      periodo: String(f.periodo) as ObservacionDocente['periodo'],
      materia: f.materia ? String(f.materia) : undefined,
      categoria: String(f.categoria) as CategoriaObservacion,
      observacion: String(f.observacion),
      visibleFamilia: Boolean(f.visible_familia),
      creadoEl: String(f.creado_el),
    }))
    guardarDatoUsuarioScoped(scope, seg, res)
    return res
  } catch (err) {
    if (enCache) return enCache.filter((o) => idsPermitidos.has(o.estudianteId))
    throw err
  }
}

export async function crearObservacionDocente(
  docente: DocenteProfile,
  estudiante: Estudiante,
  payload: {
    periodo: ObservacionDocente['periodo']
    materia?: string
    categoria: CategoriaObservacion
    observacion: string
    visibleFamilia?: boolean
  },
): Promise<{ ok: boolean; item?: ObservacionDocente; error?: string }> {
  if (!esEstudianteDeEspecialidadDocente(estudiante, docente)) {
    return {
      ok: false,
      error: `Acceso denegado: este estudiante no pertenece a ${docente.especialidadAsignada}.`,
    }
  }

  const texto = payload.observacion.trim()
  if (!texto) {
    return { ok: false, error: 'Escribí una observación pedagógica antes de guardar.' }
  }

  if (!esModoDemoActivo() && estaDispositivoOffline()) {
    return {
      ok: false,
      error:
        'Sin conexión a internet: conectate para guardar la observación pedagógica en Supabase.',
    }
  }

  if (esModoDemoActivo()) {
    const nueva: ObservacionDocente = {
      id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      estudianteId: estudiante.id || '',
      docenteId: docente.id,
      docenteNombre: docente.nombreCompleto,
      periodo: payload.periodo,
      materia: payload.materia?.trim() || undefined,
      categoria: payload.categoria,
      observacion: texto,
      visibleFamilia: payload.visibleFamilia ?? true,
      creadoEl: new Date().toISOString(),
    }

    const actual = leerObservacionesDemo()
    const actualizadas = [nueva, ...actual]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_DEMO_OBSERVACIONES_DOCENTE, JSON.stringify(actualizadas))
    }
    return { ok: true, item: nueva }
  }

  const { data, error } = await supabase
    .from('observaciones_docentes')
    .insert([
      {
        estudiante_id: estudiante.id,
        docente_id: docente.id,
        periodo: payload.periodo,
        materia: payload.materia?.trim() || null,
        categoria: payload.categoria,
        observacion: texto,
        visible_familia: payload.visibleFamilia ?? true,
      },
    ])
    .select('*')
    .single()

  if (error) {
    return { ok: false, error: error.message }
  }

  return {
    ok: true,
    item: {
      id: String(data.id),
      estudianteId: String(data.estudiante_id),
      docenteId: String(data.docente_id),
      docenteNombre: docente.nombreCompleto,
      periodo: data.periodo as ObservacionDocente['periodo'],
      materia: data.materia ?? undefined,
      categoria: data.categoria as CategoriaObservacion,
      observacion: String(data.observacion),
      visibleFamilia: Boolean(data.visible_familia),
      creadoEl: String(data.creado_el),
    },
  }
}

// ==============================================================================
// AGENDA Y AVISOS DOCENTES (ESPECIALIDAD ESTRICTA)
// ==============================================================================

export async function obtenerAgendaDocente(docente: DocenteProfile): Promise<EventoAgenda[]> {
  if (!docente.activo) return []

  if (esModoDemoActivo()) {
    return obtenerEventosDocenteLocales(docente.especialidadAsignada).sort((a, b) =>
      a.fecha.localeCompare(b.fecha),
    )
  }

  const scope = scopeDeDocente(docente)
  const enCache = leerDatoUsuarioScoped<EventoAgenda[]>(scope, 'docente_agenda')?.data
  if (estaDispositivoOffline() && enCache) {
    return enCache
  }

  try {
    const { data, error } = await supabase
      .from('agenda_docente')
      .select('*')
      .eq('docente_id', docente.id)
      .eq('activo', true)
      .ilike('especialidad', docente.especialidadAsignada.trim())
      .order('fecha', { ascending: true })

    if (error) {
      if (enCache) return enCache
      throw new Error(`No se pudo cargar la agenda docente: ${error.message}`)
    }

    const res: EventoAgenda[] = (data ?? []).map((f: Record<string, unknown>) => ({
      id: String(f.id),
      tipo: String(f.tipo) as EventoAgenda['tipo'],
      titulo: String(f.titulo),
      materia: String(f.materia),
      fecha: String(f.fecha),
      hora: f.hora ? String(f.hora) : undefined,
      descripcion: f.descripcion ? String(f.descripcion) : undefined,
      porcentaje: typeof f.porcentaje === 'number' ? f.porcentaje : f.porcentaje ? Number(f.porcentaje) : undefined,
      temario: Array.isArray(f.temario) ? (f.temario as string[]) : undefined,
      aula: f.aula ? String(f.aula) : undefined,
      prioridad: f.prioridad ? (String(f.prioridad) as EventoAgenda['prioridad']) : undefined,
      profesor: f.profesor ? String(f.profesor) : docente.nombreCompleto,
      bloqueAfectado: f.bloque_afectado ? String(f.bloque_afectado) : undefined,
      indicacion: f.indicacion ? String(f.indicacion) : undefined,
      especialidad: String(f.especialidad),
      seccionObjetivo: f.seccion_objetivo ? String(f.seccion_objetivo) : null,
      docenteId: String(f.docente_id),
      origen: 'docente',
      creadoEn: String(f.creado_el),
    }))
    guardarDatoUsuarioScoped(scope, 'docente_agenda', res)
    return res
  } catch (err) {
    if (enCache) return enCache
    throw err
  }
}

export async function guardarItemAgendaDocente(
  docente: DocenteProfile,
  payload: Omit<EventoAgenda, 'id' | 'creadoEn' | 'especialidad' | 'docenteId' | 'origen'> & {
    id?: string
    seccionObjetivo?: string | null
  },
): Promise<{ ok: boolean; item?: EventoAgenda; error?: string }> {
  if (!docente.activo) {
    return { ok: false, error: 'Cuenta docente inactiva.' }
  }
  if (!payload.titulo.trim() || !payload.materia.trim() || !payload.fecha) {
    return { ok: false, error: 'Completá título, materia y fecha del registro.' }
  }

  const seccionLimpia = payload.seccionObjetivo?.trim() || null

  if (!esModoDemoActivo() && estaDispositivoOffline()) {
    return {
      ok: false,
      error:
        'Sin conexión a internet: conectate para publicar o actualizar actividades en Supabase.',
    }
  }

  if (esModoDemoActivo()) {
    const actual = obtenerEventosDocenteLocales()
    const idFinal =
      payload.id || `docente-ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const nuevo: EventoAgenda = {
      ...payload,
      id: idFinal,
      titulo: payload.titulo.trim(),
      materia: payload.materia.trim(),
      descripcion: payload.descripcion?.trim() || undefined,
      profesor: payload.profesor?.trim() || docente.nombreCompleto,
      especialidad: docente.especialidadAsignada,
      seccionObjetivo: seccionLimpia,
      docenteId: docente.id,
      origen: 'docente',
      creadoEn: new Date().toISOString(),
    }

    const actualizados = [nuevo, ...actual.filter((e) => e.id !== idFinal)]
    guardarEventosDocenteLocales(actualizados)
    return { ok: true, item: nuevo }
  }

  const filaSql = {
    docente_id: docente.id,
    especialidad: docente.especialidadAsignada,
    seccion_objetivo: seccionLimpia,
    tipo: payload.tipo,
    titulo: payload.titulo.trim(),
    materia: payload.materia.trim(),
    fecha: payload.fecha,
    hora: payload.hora || null,
    descripcion: payload.descripcion?.trim() || null,
    porcentaje: payload.porcentaje ?? null,
    temario: payload.temario ?? null,
    aula: payload.aula?.trim() || null,
    prioridad: payload.prioridad ?? null,
    profesor: payload.profesor?.trim() || docente.nombreCompleto,
    bloque_afectado: payload.bloqueAfectado?.trim() || null,
    indicacion: payload.indicacion?.trim() || null,
    activo: true,
  }

  const esUuid =
    Boolean(payload.id) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id!)

  const res =
    esUuid && payload.id
      ? await supabase.from('agenda_docente').update(filaSql).eq('id', payload.id).select('*').single()
      : await supabase.from('agenda_docente').insert([filaSql]).select('*').single()

  if (res.error) {
    return { ok: false, error: res.error.message }
  }

  const f = res.data as Record<string, unknown>
  return {
    ok: true,
    item: {
      id: String(f.id),
      tipo: String(f.tipo) as EventoAgenda['tipo'],
      titulo: String(f.titulo),
      materia: String(f.materia),
      fecha: String(f.fecha),
      hora: f.hora ? String(f.hora) : undefined,
      descripcion: f.descripcion ? String(f.descripcion) : undefined,
      profesor: f.profesor ? String(f.profesor) : docente.nombreCompleto,
      especialidad: String(f.especialidad),
      seccionObjetivo: f.seccion_objetivo ? String(f.seccion_objetivo) : null,
      docenteId: String(f.docente_id),
      origen: 'docente',
      creadoEn: String(f.creado_el),
    },
  }
}

export async function desactivarItemAgendaDocente(
  docente: DocenteProfile,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (esModoDemoActivo()) {
    const filtrados = obtenerEventosDocenteLocales().filter((e) => e.id !== id)
    guardarEventosDocenteLocales(filtrados)
    return { ok: true }
  }

  if (estaDispositivoOffline()) {
    return {
      ok: false,
      error: 'Sin conexión a internet: necesitás red para archivar este elemento en Supabase.',
    }
  }

  const { error } = await supabase
    .from('agenda_docente')
    .update({ activo: false })
    .eq('id', id)
    .eq('docente_id', docente.id)

  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
