/**
 * Normaliza texto que viene de las hojas de cálculo para poder compararlo:
 * la hoja escribe "Miércoles" o "Miercoles" según quién la haya llenado.
 */
export function sinAcentos(texto: string): string {
  return texto.toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

/**
 * Extrae hasta dos iniciales del nombre de una persona para avatares (ej. 'Erick García' → 'EG').
 */
export function obtenerIniciales(nombre: string): string {
  if (!nombre) return 'ST'
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return 'ST'
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase()
  return (partes[0]![0]! + partes[1]![0]!).toUpperCase()
}
