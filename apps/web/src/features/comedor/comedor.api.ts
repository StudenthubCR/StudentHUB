import { COMEDOR_API_URL } from '@/lib/config'

/**
 * Una fila tal como la devuelve el Apps Script del comedor
 * (`apps-script/comedor.gs`). La hoja está organizada por semana del ciclo y
 * nombre de día, no por fecha: convertir eso a fechas reales es trabajo de
 * `menu.service.ts`, no de esta capa.
 */
export type FilaComedor = {
  semana: string
  dia: string
  plato: string
  acompanamiento: string
  bebida: string
  /** La hoja llama "postre" a la fruta del día. */
  postre: string
}

export class ErrorComedor extends Error {}

function esFila(valor: unknown): valor is FilaComedor {
  if (typeof valor !== 'object' || valor === null) return false
  const fila = valor as Record<string, unknown>
  return typeof fila.dia === 'string' && typeof fila.plato === 'string'
}

const CLAVE_CACHE_COMEDOR_PREFIJO = 'studenthub_cache_comedor_semana_'

function recuperarCacheComedor(numero: number): FilaComedor[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${CLAVE_CACHE_COMEDOR_PREFIJO}${numero}`)
    if (!raw) return null
    const parseado = JSON.parse(raw)
    if (Array.isArray(parseado) && parseado.length > 0) {
      return parseado.filter(esFila)
    }
  } catch {
    // ignorar error de lectura de cache
  }
  return null
}

function guardarCacheComedor(numero: number, filas: FilaComedor[]): void {
  if (typeof window === 'undefined' || filas.length === 0) return
  try {
    localStorage.setItem(`${CLAVE_CACHE_COMEDOR_PREFIJO}${numero}`, JSON.stringify(filas))
  } catch {
    // ignorar error de cuota
  }
}

/**
 * Pide una semana del ciclo a la hoja de cálculo.
 *
 * El Apps Script responde 200 con `{ error: "..." }` cuando algo sale mal, así
 * que no alcanza con mirar el código de estado.
 */
export async function obtenerSemana(numero: number, signal?: AbortSignal): Promise<FilaComedor[]> {
  const url = `${COMEDOR_API_URL}?semana=${encodeURIComponent(numero)}`

  let respuesta: Response
  try {
    respuesta = await fetch(url, { signal })
  } catch (causa) {
    if (causa instanceof DOMException && causa.name === 'AbortError') throw causa
    const enCache = recuperarCacheComedor(numero)
    if (enCache && enCache.length > 0) return enCache
    throw new ErrorComedor('No se pudo contactar el servicio del comedor.')
  }

  if (!respuesta.ok) {
    const enCache = recuperarCacheComedor(numero)
    if (enCache && enCache.length > 0) return enCache
    throw new ErrorComedor(`El servicio del comedor respondió ${respuesta.status}.`)
  }

  let datos: unknown
  try {
    datos = await respuesta.json()
  } catch {
    const enCache = recuperarCacheComedor(numero)
    if (enCache && enCache.length > 0) return enCache
    throw new ErrorComedor('El servicio del comedor devolvió una respuesta ilegible.')
  }

  if (datos && typeof datos === 'object' && 'error' in datos) {
    const enCache = recuperarCacheComedor(numero)
    if (enCache && enCache.length > 0) return enCache
    throw new ErrorComedor(String((datos as { error: unknown }).error))
  }

  if (!Array.isArray(datos)) {
    const enCache = recuperarCacheComedor(numero)
    if (enCache && enCache.length > 0) return enCache
    throw new ErrorComedor('El servicio del comedor devolvió un formato inesperado.')
  }

  const filas = datos.filter(esFila)
  if (filas.length > 0) {
    guardarCacheComedor(numero, filas)
  }
  return filas
}
