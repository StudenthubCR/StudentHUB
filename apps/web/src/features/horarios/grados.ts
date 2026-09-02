/**
 * Catálogo de grados. Equivale a `grupoPorGrado` / `gradoConHorario` de
 * `js/config.js`: un grado con `grupo` en null es un grado sin horario cargado
 * en la hoja todavía, y se muestra deshabilitado.
 *
 * Cuando los horarios vivan en Postgres esto sale de la tabla `grupos` y este
 * archivo desaparece.
 */
export type Grado = {
  /** El de la ruta: /horarios/11vo */
  id: string
  numero: string
  nombre: string
  /** Grupo con horario publicado, o null si todavía no hay. */
  grupo: string | null
}

export const GRADOS: Grado[] = [
  { id: '7mo', numero: '7°', nombre: 'Séptimo', grupo: null },
  { id: '8vo', numero: '8°', nombre: 'Octavo', grupo: null },
  { id: '9no', numero: '9°', nombre: 'Noveno', grupo: null },
  { id: '10mo', numero: '10°', nombre: 'Décimo', grupo: null },
  { id: '11vo', numero: '11°', nombre: 'Undécimo', grupo: '11-2' },
  { id: '12vo', numero: '12°', nombre: 'Duodécimo', grupo: null },
]

export function buscarGrado(id: string | undefined): Grado | null {
  return GRADOS.find((grado) => grado.id === id) ?? null
}

/** '11° Undécimo' */
export function etiquetaDeGrado(grado: Grado): string {
  return `${grado.numero} ${grado.nombre}`
}

/** El grado al que pertenece un grupo ('11-2' → 11vo), para enlazar al horario. */
export function buscarGradoPorGrupo(grupo: string | null): Grado | null {
  if (!grupo) return null
  return GRADOS.find((grado) => grado.grupo === grupo) ?? null
}
