import { useContext } from 'react'
import { EstudianteContext, type EstadoEstudianteContexto } from './estudiante-context'
import { ESTUDIANTE_DEMO } from './estudiante.fixture'

const ESTADO_POR_DEFECTO: EstadoEstudianteContexto = {
  perspectiva: 'ambos',
  cambiarPerspectiva: () => {},
  rolActivo: 'estudiante',
  encargado: null,
  estudiantesVinculados: [ESTUDIANTE_DEMO],
  estudianteActivo: ESTUDIANTE_DEMO,
  estudiante: ESTUDIANTE_DEMO,
  seleccionarEstudiante: () => {},
  cargando: false,
  fueraDelPadron: false,
  error: null,
  esModoDemoEncargado: false,
  alternarRolDemo: () => {},
}

/**
 * Hook unificado para acceder al perfil del estudiante activo, rol ('estudiante' | 'encargado'),
 * y utilidades de cambio de estudiante para encargados legales.
 *
 * Expone `estudiante` (alias de `estudianteActivo`) garantizando 100% de compatibilidad hacia atrás
 * con todos los módulos de la aplicación.
 */
export function useEstudiante(): EstadoEstudianteContexto {
  const ctx = useContext(EstudianteContext)
  if (!ctx) {
    return ESTADO_POR_DEFECTO
  }
  return ctx
}
