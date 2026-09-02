import { ESTUDIANTE_DEMO, type Estudiante } from './estudiante.fixture'

/**
 * La ficha del estudiante que está usando la app.
 *
 * Hoy devuelve siempre la misma ficha de demostración. Existe como hook desde
 * ahora para que el día que haya sesión (login por correo MEP + RLS) sólo
 * cambie este archivo, y no las cuatro pantallas que muestran el nombre.
 */
export function useEstudiante(): Estudiante {
  return ESTUDIANTE_DEMO
}
