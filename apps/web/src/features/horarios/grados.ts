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
  /** Grupo por defecto o principal para enlace */
  grupo: string | null
  /** Todos los grupos disponibles de este grado */
  grupos: string[]
}

export const GRADOS: Grado[] = [
  { id: '7mo', numero: '7°', nombre: 'Séptimo', grupo: null, grupos: [] },
  { id: '8vo', numero: '8°', nombre: 'Octavo', grupo: null, grupos: [] },
  { id: '9no', numero: '9°', nombre: 'Noveno', grupo: null, grupos: [] },
  {
    id: '10mo',
    numero: '10°',
    nombre: 'Décimo',
    grupo: '10-1',
    grupos: ['10-1', '10-2', '10-3'],
  },
  {
    id: '11vo',
    numero: '11°',
    nombre: 'Undécimo',
    grupo: '11-1',
    grupos: ['11-1', '11-2', '11-3'],
  },
  {
    id: '12vo',
    numero: '12°',
    nombre: 'Duodécimo',
    grupo: '12-1',
    grupos: ['12-1', '12-2', '12-3'],
  },
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
  const limpio = grupo.trim().replace('_', '-').replace(/\s+/g, '-')
  const directo = GRADOS.find(
    (grado) => grado.grupo === limpio || (Array.isArray(grado.grupos) && grado.grupos.includes(limpio)),
  )
  if (directo) return directo

  if (limpio.startsWith('10-') || limpio.startsWith('10') || limpio === '10mo') {
    return GRADOS.find((g) => g.id === '10mo') ?? null
  }
  if (limpio.startsWith('11-') || limpio.startsWith('11') || limpio === '11vo') {
    return GRADOS.find((g) => g.id === '11vo') ?? null
  }
  if (limpio.startsWith('12-') || limpio.startsWith('12') || limpio === '12vo') {
    return GRADOS.find((g) => g.id === '12vo') ?? null
  }
  if (limpio.startsWith('7-') || limpio === '7mo') {
    return GRADOS.find((g) => g.id === '7mo') ?? null
  }
  if (limpio.startsWith('8-') || limpio === '8vo') {
    return GRADOS.find((g) => g.id === '8vo') ?? null
  }
  if (limpio.startsWith('9-') || limpio === '9no') {
    return GRADOS.find((g) => g.id === '9no') ?? null
  }
  return null
}
