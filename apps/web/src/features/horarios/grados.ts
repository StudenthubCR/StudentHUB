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

/** El grado al que pertenece un grupo ('11-1' o '11-2' → 11vo), para enlazar al horario. */
export function buscarGradoPorGrupo(grupo: string | null): Grado | null {
  if (!grupo) return null
  const directo = GRADOS.find((grado) => grado.grupo === grupo)
  if (directo) return directo

  if (grupo.startsWith('10-') || grupo === '10mo') {
    return GRADOS.find((g) => g.id === '10mo') ?? null
  }
  if (grupo.startsWith('11-') || grupo === '11vo') {
    return GRADOS.find((g) => g.id === '11vo') ?? null
  }
  if (grupo.startsWith('12-') || grupo === '12vo') {
    return GRADOS.find((g) => g.id === '12vo') ?? null
  }
  if (grupo.startsWith('7-') || grupo === '7mo') {
    return GRADOS.find((g) => g.id === '7mo') ?? null
  }
  if (grupo.startsWith('8-') || grupo === '8vo') {
    return GRADOS.find((g) => g.id === '8vo') ?? null
  }
  if (grupo.startsWith('9-') || grupo === '9no') {
    return GRADOS.find((g) => g.id === '9no') ?? null
  }
  return null
}
