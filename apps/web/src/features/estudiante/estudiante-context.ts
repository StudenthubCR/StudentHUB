import { createContext } from 'react'
import type { Estudiante, Encargado, RolUsuario } from './estudiante.fixture'

export type EstadoEstudianteContexto = {
  rolActivo: RolUsuario
  encargado: Encargado | null
  estudiantesVinculados: Estudiante[]
  estudianteActivo: Estudiante | null
  /**
   * Alias directo hacia estudianteActivo para retrocompatibilidad 100% con
   * todos los módulos existentes (Carnet, Horarios, Comedor, Dashboard, etc.).
   */
  estudiante: Estudiante | null
  seleccionarEstudiante: (id: string) => void
  cargando: boolean
  fueraDelPadron: boolean
  error: unknown
  esModoDemoEncargado: boolean
  alternarRolDemo: (nuevoRol: RolUsuario) => void
}

export const EstudianteContext = createContext<EstadoEstudianteContexto | null>(null)
