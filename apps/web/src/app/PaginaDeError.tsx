import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { PantallaDeAviso } from '@/components/PantallaDeAviso'
import { AppLayout } from './layout/AppLayout'

/**
 * Lo que se ve cuando una ruta no existe o algo revienta.
 *
 * Sin esto React Router muestra su pantalla de desarrollador —
 * "Unexpected Application Error! 💿 Hey developer 👋"— que es lo último que un
 * estudiante debería encontrarse por escribir mal una dirección.
 *
 * Va envuelta en el layout para que la barra de navegación siga ahí y se pueda
 * salir del error sin recargar.
 */
export function PaginaDeError() {
  const error = useRouteError()
  const esNoEncontrada = isRouteErrorResponse(error) && error.status === 404

  if (import.meta.env.DEV) console.error('Student HUB:', error)

  return (
    <AppLayout>
      <PantallaDeAviso
        titulo={esNoEncontrada ? 'Esta página no existe' : 'Algo se rompió'}
        descripcion={
          esNoEncontrada
            ? 'Puede que la dirección esté mal escrita o que la sección todavía no exista.'
            : 'Tuvimos un problema inesperado. Volvé al inicio e intentá de nuevo.'
        }
        accion={{ texto: 'Ir al inicio', a: '/' }}
      />
    </AppLayout>
  )
}
