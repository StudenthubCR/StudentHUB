import { useState, useEffect, useCallback } from 'react'

export type TemaColorCarnet = {
  id: string
  nombre: string
  degradado: string
  sombra: string
  acento: string
  muestra: string
}

export type PatronFondo = 'liso' | 'puntos' | 'malla' | 'lineas'

export type PersonalizacionCarnet = {
  temaId: string
  patron: PatronFondo
  efectoBrillo: boolean
}

export const TEMAS_CARNET: TemaColorCarnet[] = [
  {
    id: 'azul-oficial',
    nombre: 'Azul Institucional',
    degradado: 'linear-gradient(140deg, #0130B2 0%, #0B2B80 55%, #071c56 100%)',
    sombra: 'rgba(11, 43, 128, 0.35)',
    acento: '#0130B2',
    muestra: '#0130B2',
  },
  {
    id: 'esmeralda',
    nombre: 'Verde Esmeralda',
    degradado: 'linear-gradient(140deg, #059669 0%, #047857 55%, #064e3b 100%)',
    sombra: 'rgba(4, 120, 87, 0.35)',
    acento: '#059669',
    muestra: '#059669',
  },
  {
    id: 'purpura',
    nombre: 'Púrpura Amatista',
    degradado: 'linear-gradient(140deg, #7c3aed 0%, #5b21b6 55%, #3b0764 100%)',
    sombra: 'rgba(91, 33, 182, 0.35)',
    acento: '#7c3aed',
    muestra: '#7c3aed',
  },
  {
    id: 'carmesi',
    nombre: 'Rojo Carmesí',
    degradado: 'linear-gradient(140deg, #e11d48 0%, #be123c 55%, #881337 100%)',
    sombra: 'rgba(190, 18, 60, 0.35)',
    acento: '#e11d48',
    muestra: '#e11d48',
  },
  {
    id: 'obsidiana',
    nombre: 'Obsidiana Cyber',
    degradado: 'linear-gradient(140deg, #334155 0%, #1e293b 55%, #0f172a 100%)',
    sombra: 'rgba(15, 23, 42, 0.45)',
    acento: '#475569',
    muestra: '#1e293b',
  },
  {
    id: 'turquesa',
    nombre: 'Océano Turquesa',
    degradado: 'linear-gradient(140deg, #0284c7 0%, #0369a1 55%, #082f49 100%)',
    sombra: 'rgba(3, 105, 161, 0.35)',
    acento: '#0284c7',
    muestra: '#0284c7',
  },
  {
    id: 'ambar',
    nombre: 'Ámbar Dorado',
    degradado: 'linear-gradient(140deg, #d97706 0%, #b45309 55%, #78350f 100%)',
    sombra: 'rgba(180, 83, 9, 0.35)',
    acento: '#d97706',
    muestra: '#d97706',
  },
  {
    id: 'rosa-aurora',
    nombre: 'Rosa Aurora',
    degradado: 'linear-gradient(140deg, #db2777 0%, #9d174d 55%, #700732 100%)',
    sombra: 'rgba(157, 23, 77, 0.35)',
    acento: '#db2777',
    muestra: '#db2777',
  },
]

export const PATRONES: { id: PatronFondo; nombre: string }[] = [
  { id: 'liso', nombre: 'Minimalista' },
  { id: 'puntos', nombre: 'Puntos' },
  { id: 'malla', nombre: 'Cuadrícula' },
  { id: 'lineas', nombre: 'Líneas 45°' },
]

const CLAVE_STORAGE = 'studenthub:carnet:personalizacion'

export const PERSONALIZACION_POR_DEFECTO: PersonalizacionCarnet = {
  temaId: 'azul-oficial',
  patron: 'liso',
  efectoBrillo: false,
}

export function buscarTema(id: string): TemaColorCarnet {
  return TEMAS_CARNET.find((t) => t.id === id) ?? TEMAS_CARNET[0]!
}

export function usePersonalizacionCarnet() {
  const [personalizacion, setPersonalizacion] = useState<PersonalizacionCarnet>(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE)
      if (guardado) return { ...PERSONALIZACION_POR_DEFECTO, ...JSON.parse(guardado) }
    } catch {
      // Ignorar fallo de parseo
    }
    return PERSONALIZACION_POR_DEFECTO
  })

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(personalizacion))
    } catch {
      // Ignorar si el almacenamiento local está deshabilitado
    }
  }, [personalizacion])

  const cambiarTema = useCallback((temaId: string) => {
    setPersonalizacion((prev) => ({ ...prev, temaId }))
  }, [])

  const cambiarPatron = useCallback((patron: PatronFondo) => {
    setPersonalizacion((prev) => ({ ...prev, patron }))
  }, [])

  const toggleBrillo = useCallback(() => {
    setPersonalizacion((prev) => ({ ...prev, efectoBrillo: !prev.efectoBrillo }))
  }, [])

  const restablecer = useCallback(() => {
    setPersonalizacion(PERSONALIZACION_POR_DEFECTO)
  }, [])

  const temaActual = buscarTema(personalizacion.temaId)

  return {
    personalizacion,
    temaActual,
    cambiarTema,
    cambiarPatron,
    toggleBrillo,
    restablecer,
  }
}
