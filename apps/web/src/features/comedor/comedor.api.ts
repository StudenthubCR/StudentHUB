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
    throw new ErrorComedor('No se pudo contactar el servicio del comedor.')
  }

  if (!respuesta.ok) {
    throw new ErrorComedor(`El servicio del comedor respondió ${respuesta.status}.`)
  }

  let datos: unknown
  try {
    datos = await respuesta.json()
  } catch {
    throw new ErrorComedor('El servicio del comedor devolvió una respuesta ilegible.')
  }

  if (datos && typeof datos === 'object' && 'error' in datos) {
    throw new ErrorComedor(String((datos as { error: unknown }).error))
  }

  if (!Array.isArray(datos)) {
    throw new ErrorComedor('El servicio del comedor devolvió un formato inesperado.')
  }

  return datos.filter(esFila)
}
