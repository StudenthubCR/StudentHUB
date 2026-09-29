import { HORARIOS_API_URL } from '@/lib/config'
import { esGrupoValido, filtrarPorGrupo } from './horario.service'
import type { FilaHorario } from './horario.types'

export class ErrorHorarios extends Error {}

function esFila(valor: unknown): valor is FilaHorario {
  if (typeof valor !== 'object' || valor === null) return false
  const fila = valor as Record<string, unknown>
  return typeof fila.dia === 'string' && typeof fila.materia === 'string'
}

async function pedir(consulta: string, signal?: AbortSignal): Promise<FilaHorario[]> {
  let respuesta: Response
  try {
    respuesta = await fetch(`${HORARIOS_API_URL}${consulta}`, { signal })
  } catch (causa) {
    if (causa instanceof DOMException && causa.name === 'AbortError') throw causa
    throw new ErrorHorarios('No se pudo contactar el servicio de horarios.')
  }

  if (!respuesta.ok) {
    throw new ErrorHorarios(`El servicio de horarios respondió ${respuesta.status}.`)
  }

  let datos: unknown
  try {
    datos = await respuesta.json()
  } catch {
    throw new ErrorHorarios('El servicio de horarios devolvió una respuesta ilegible.')
  }

  if (datos && typeof datos === 'object' && 'error' in datos) {
    throw new ErrorHorarios(String((datos as { error: unknown }).error))
  }

  if (!Array.isArray(datos)) {
    throw new ErrorHorarios('El servicio de horarios devolvió un formato inesperado.')
  }

  return datos.filter(esFila).map((fila) => {
    const item: FilaHorario = {
      grupo: typeof fila.grupo === 'string' ? fila.grupo : '',
      dia: fila.dia,
      hora: typeof fila.hora === 'string' ? fila.hora : '',
      materia: fila.materia,
    }
    if (typeof fila.docente === 'string' && fila.docente.trim()) {
      item.docente = fila.docente.trim()
    }
    return item
  })
}

const CLAVE_CACHE_HORARIO_PREFIJO = 'studenthub_cache_horario_'

function recuperarCacheHorario(grupo: string): FilaHorario[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${CLAVE_CACHE_HORARIO_PREFIJO}${grupo.trim().toLowerCase()}`)
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

function guardarCacheHorario(grupo: string, filas: FilaHorario[]): void {
  if (typeof window === 'undefined' || filas.length === 0) return
  try {
    localStorage.setItem(
      `${CLAVE_CACHE_HORARIO_PREFIJO}${grupo.trim().toLowerCase()}`,
      JSON.stringify(filas),
    )
  } catch {
    // ignorar error de cuota
  }
}

/**
 * Trae el horario de un grupo.
 *
 * Si la consulta por grupo no devuelve nada útil, se pide la hoja completa y
 * se filtra aquí. Suena redundante, pero cubre el caso real de que la columna
 * del grupo esté formateada como fecha en Sheets: ahí el filtro del Apps
 * Script no encuentra nada y sin este respaldo la pantalla queda vacía.
 */
export async function obtenerHorario(grupo: string, signal?: AbortSignal): Promise<FilaHorario[]> {
  try {
    const filas = await pedir(`?grupo=${encodeURIComponent(grupo)}`, signal)

    const sirve = filas.length > 0 && filas.some((fila) => esGrupoValido(fila.grupo))
    if (sirve) {
      guardarCacheHorario(grupo, filas)
      return filas
    }

    const todas = await pedir('', signal)
    const filtradas = filtrarPorGrupo(todas, grupo)
    if (filtradas.length > 0) {
      guardarCacheHorario(grupo, filtradas)
    }
    return filtradas
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    const enCache = recuperarCacheHorario(grupo)
    if (enCache && enCache.length > 0) {
      return enCache
    }
    throw error
  }
}
