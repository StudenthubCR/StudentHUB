/**
 * Normaliza texto que viene de las hojas de cálculo para poder compararlo:
 * la hoja escribe "Miércoles" o "Miercoles" según quién la haya llenado.
 */
export function sinAcentos(texto: string): string {
  return texto.toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}
