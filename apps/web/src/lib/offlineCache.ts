import type { QueryClient } from '@tanstack/react-query'

const VERSION_CACHE = 'v1'
const CLAVE_PROPIETARIO = 'studenthub:cache:owner_id'
const CLAVE_META_SYNC = `studenthub:sync:meta:${VERSION_CACHE}`

const CLAVE_CARNET_LEGACY = 'studenthub:carnet:personalizacion'
const PREFIJO_CONFIRMACION_COMEDOR = 'studenthub_confirmacion_comedor_'
const CLAVE_COLA_OFFLINE = 'studenthub_offline_queue_v1'

const CLAVES_SENSIBLES_GLOBALES_LEGACY = [
  CLAVE_CARNET_LEGACY,
  'studenthub_agenda_eventos',
  'studenthub_agenda_docente_v1',
  'studenthub_demo_notas_v1',
  'studenthub_demo_asistencias_v1',
  'studenthub_demo_observaciones_docente_v1',
  'studenthub_demo_admin',
  'studenthub_notif_inbox',
  'studenthub_avisos_descartados_v1',
  'studenthub_estudiante_activo_id',
  'studenthub_perspectiva_vista',
  CLAVE_COLA_OFFLINE,
]

type SobreCache<T> = {
  version: number
  ownerId: string
  updatedAt: number
  data: T
}

export type EntradaQueryPersistida = {
  queryKey: readonly unknown[]
  data: unknown
  dataUpdatedAt: number
}

const PREFIJOS_PUBLICOS_RQ = new Set(['horarios', 'comedor', 'avisos'])
const PREFIJOS_PRIVADOS_RQ = new Set([
  'perfil-estudiante-o-encargado',
  'estudiante-notas',
  'estudiante-asistencias',
  'confirmacion-comedor',
  'docente-estudiantes',
  'docente-notas',
  'docente-asistencias',
  'docente-observaciones',
  'docente-agenda',
])

function storageDisponible(): Storage | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    // Entorno restringido sin acceso a almacenamiento
  }
  return null
}

function emitirEventoSync(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('studenthub:sync-actualizado'))
  }
}

function esErrorDeCuota(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const nombre = (error as { name?: string }).name ?? ''
  return nombre === 'QuotaExceededError' || nombre === 'NS_ERROR_DOM_QUOTA_REACHED'
}

/**
 * Libera espacio eliminando primero cachés públicos antiguos antes de reintentar guardar datos esenciales.
 */
function liberarEspacioCachePublico(storage: Storage): void {
  const clavesBorrables: string[] = []
  if (typeof storage.length === 'number' && typeof storage.key === 'function') {
    for (let i = 0; i < storage.length; i++) {
      const clave = storage.key(i)
      if (!clave) continue
      if (
        clave.startsWith('studenthub_cache_horario_') ||
        clave.startsWith('studenthub_cache_comedor_semana_') ||
        clave.startsWith('studenthub:pub:')
      ) {
        clavesBorrables.push(clave)
      }
    }
  }
  for (const clave of clavesBorrables) {
    try {
      storage.removeItem(clave)
    } catch {
      // Silencioso
    }
  }
}

export function escribirJsonSeguro(clave: string, valor: unknown): boolean {
  const storage = storageDisponible()
  if (!storage) return false

  const serializado = JSON.stringify(valor)
  try {
    storage.setItem(clave, serializado)
    return true
  } catch (err) {
    if (esErrorDeCuota(err)) {
      liberarEspacioCachePublico(storage)
      try {
        storage.setItem(clave, serializado)
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

export function leerJsonSeguro<T>(clave: string): T | null {
  const storage = storageDisponible()
  if (!storage) return null
  try {
    const raw = storage.getItem(clave)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * Determina el identificador lógico del usuario dueño de la sesión actual para aislar datos PII.
 */
export function resolverScopeUsuarioActivo(userIdExplicito?: string | null): string | null {
  if (userIdExplicito && userIdExplicito.trim()) {
    return userIdExplicito.trim()
  }

  const storage = storageDisponible()
  if (!storage) return null

  if (storage.getItem('studenthub_demo_sesion') === 'true') {
    const rolDemo = storage.getItem('studenthub_demo_rol') || 'estudiante'
    if (rolDemo === 'docente') return 'demo-docente'
    if (rolDemo === 'encargado') return 'demo-encargado'
    const estId = storage.getItem('studenthub_demo_estudiante_id') || 'default'
    return `demo-est-${estId}`
  }

  return storage.getItem(CLAVE_PROPIETARIO)
}

export function obtenerClaveUsuarioScoped(userId: string, segmento: string): string {
  return `studenthub:u:${userId}:${VERSION_CACHE}:${segmento}`
}

export function guardarDatoUsuarioScoped<T>(
  userId: string | null | undefined,
  segmento: string,
  data: T,
): void {
  const scope = resolverScopeUsuarioActivo(userId)
  if (!scope) return

  const payload: SobreCache<T> = {
    version: 1,
    ownerId: scope,
    updatedAt: Date.now(),
    data,
  }
  if (escribirJsonSeguro(obtenerClaveUsuarioScoped(scope, segmento), payload)) {
    registrarSincronizacion(`u:${segmento}`, payload.updatedAt)
  }
}

export function leerDatoUsuarioScoped<T>(
  userId: string | null | undefined,
  segmento: string,
): { data: T; updatedAt: number } | null {
  const scope = resolverScopeUsuarioActivo(userId)
  if (!scope) return null

  const sobre = leerJsonSeguro<SobreCache<T>>(obtenerClaveUsuarioScoped(scope, segmento))
  if (!sobre || sobre.version !== 1 || sobre.ownerId !== scope) {
    return null
  }
  return { data: sobre.data, updatedAt: sobre.updatedAt }
}

export function obtenerClavePublica(segmento: string): string {
  return `studenthub:pub:${VERSION_CACHE}:${segmento}`
}

export function guardarDatoPublico<T>(segmento: string, data: T): void {
  const payload: SobreCache<T> = {
    version: 1,
    ownerId: 'public',
    updatedAt: Date.now(),
    data,
  }
  if (escribirJsonSeguro(obtenerClavePublica(segmento), payload)) {
    registrarSincronizacion(`pub:${segmento}`, payload.updatedAt)
  }
}

export function leerDatoPublico<T>(segmento: string): { data: T; updatedAt: number } | null {
  const sobre = leerJsonSeguro<SobreCache<T>>(obtenerClavePublica(segmento))
  if (!sobre || sobre.version !== 1) return null
  return { data: sobre.data, updatedAt: sobre.updatedAt }
}

export function registrarSincronizacion(dataset: string, timestamp = Date.now()): void {
  const meta = leerJsonSeguro<Record<string, number>>(CLAVE_META_SYNC) ?? {}
  meta[dataset] = timestamp
  meta.__global = timestamp
  if (escribirJsonSeguro(CLAVE_META_SYNC, meta)) {
    emitirEventoSync()
  }
}

export function obtenerUltimaSincronizacion(dataset?: string): number | null {
  const meta = leerJsonSeguro<Record<string, number>>(CLAVE_META_SYNC)
  if (!meta) return null
  if (dataset) {
    return typeof meta[dataset] === 'number' ? meta[dataset] : null
  }
  const valores = Object.values(meta).filter((v) => typeof v === 'number' && Number.isFinite(v))
  if (valores.length === 0) return null
  return Math.max(...valores)
}

export function formatearUltimaSincronizacion(ts?: number | null): string {
  if (!ts || !Number.isFinite(ts)) return 'Sin sincronización previa'
  const diffMin = Math.max(0, Math.round((Date.now() - ts) / 60000))
  if (diffMin < 1) return 'Hace menos de 1 min'
  if (diffMin < 60) return `Hace ${diffMin} min`
  try {
    return new Intl.DateTimeFormat('es-CR', {
      timeZone: 'America/Costa_Rica',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(ts))
  } catch {
    return new Date(ts).toLocaleTimeString()
  }
}

/**
 * Purga obligatoria de datos personales sensibles (Ley N° 8968 / PRODHAB):
 * Se ejecuta al cerrar sesión o cambiar de usuario para evitar fugas en dispositivos compartidos.
 * Conserva preferencias públicas (tema, horarios y menús públicos).
 */
export function purgarCacheSensibleUsuario(queryClient?: QueryClient): void {
  const storage = storageDisponible()
  if (storage) {
    const clavesParaEliminar: string[] = [...CLAVES_SENSIBLES_GLOBALES_LEGACY, CLAVE_PROPIETARIO]
    if (typeof storage.length === 'number' && typeof storage.key === 'function') {
      for (let i = 0; i < storage.length; i++) {
        const clave = storage.key(i)
        if (!clave) continue
        if (
          clave.startsWith('studenthub:u:') ||
          clave.startsWith('studenthub:rq:') ||
          clave.startsWith(PREFIJO_CONFIRMACION_COMEDOR)
        ) {
          clavesParaEliminar.push(clave)
        }
      }
    }
    for (const clave of clavesParaEliminar) {
      try {
        storage.removeItem(clave)
      } catch {
        // Ignorar
      }
    }
  }

  if (queryClient) {
    for (const prefijo of PREFIJOS_PRIVADOS_RQ) {
      queryClient.removeQueries({ queryKey: [prefijo] })
    }
  }
}

/**
 * Garantiza aislamiento estricto de usuario activo: si cambia de propietario real, purga primero.
 * En evaluaciones /expo (demo-* -> demo-*), conserva únicamente la simulación compartida de docente-estudiante.
 */
export function asegurarPropietarioCache(
  nuevoScope: string | null | undefined,
  queryClient?: QueryClient,
): void {
  const storage = storageDisponible()
  if (!storage || !nuevoScope) return

  const anterior = storage.getItem(CLAVE_PROPIETARIO)
  const cambioEntreDemos = Boolean(
    anterior && anterior.startsWith('demo-') && nuevoScope.startsWith('demo-'),
  )
  if (anterior && anterior !== nuevoScope && !cambioEntreDemos) {
    purgarCacheSensibleUsuario(queryClient)
  }
  try {
    storage.setItem(CLAVE_PROPIETARIO, nuevoScope)
  } catch {
    // Silencioso
  }
}

function claveSnapshotRq(scope: string | null): string {
  return scope ? `studenthub:rq:${VERSION_CACHE}:${scope}` : `studenthub:rq:${VERSION_CACHE}:public`
}

function esQueryPersistible(queryKey: readonly unknown[]): 'public' | 'private' | null {
  const raiz = typeof queryKey[0] === 'string' ? queryKey[0] : ''
  if (PREFIJOS_PUBLICOS_RQ.has(raiz)) return 'public'
  if (PREFIJOS_PRIVADOS_RQ.has(raiz)) return 'private'
  return null
}

/**
 * Hidrata React Query en memoria desde almacenamiento local al iniciar offline o recargar.
 */
export function hidratarQueryClientDesdeCache(
  queryClient: QueryClient,
  scopeUsuario?: string | null,
): void {
  const pubEntries = leerJsonSeguro<EntradaQueryPersistida[]>(claveSnapshotRq(null)) ?? []
  const scopeEfectivo = resolverScopeUsuarioActivo(scopeUsuario)
  const privEntries = scopeEfectivo
    ? leerJsonSeguro<EntradaQueryPersistida[]>(claveSnapshotRq(scopeEfectivo)) ?? []
    : []

  for (const entrada of [...pubEntries, ...privEntries]) {
    if (!entrada || !Array.isArray(entrada.queryKey) || entrada.data === undefined) continue
    try {
      const actual = queryClient.getQueryData(entrada.queryKey)
      if (actual === undefined) {
        queryClient.setQueryData(entrada.queryKey, entrada.data, {
          updatedAt: entrada.dataUpdatedAt || Date.now(),
        })
      }
    } catch {
      // Ignorar entradas corruptas
    }
  }
}

/**
 * Guarda de forma segura los resultados exitosos de React Query divididos por ámbito público y privado.
 */
export function persistirQueryClientEnCache(
  queryClient: QueryClient,
  scopeUsuario?: string | null,
): void {
  const queries = queryClient.getQueryCache().getAll()
  const pubEntries: EntradaQueryPersistida[] = []
  const privEntries: EntradaQueryPersistida[] = []

  for (const q of queries) {
    if (q.state.status !== 'success' || q.state.data === undefined) continue
    const tipo = esQueryPersistible(q.queryKey)
    if (!tipo) continue

    const entrada: EntradaQueryPersistida = {
      queryKey: q.queryKey,
      data: q.state.data,
      dataUpdatedAt: q.state.dataUpdatedAt || Date.now(),
    }
    if (tipo === 'public') {
      pubEntries.push(entrada)
    } else {
      privEntries.push(entrada)
    }
  }

  escribirJsonSeguro(claveSnapshotRq(null), pubEntries)
  const scopeEfectivo = resolverScopeUsuarioActivo(scopeUsuario)
  if (scopeEfectivo && privEntries.length > 0) {
    escribirJsonSeguro(claveSnapshotRq(scopeEfectivo), privEntries)
  }
}
