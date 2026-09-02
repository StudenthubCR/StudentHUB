import { PantallaDeAviso } from '@/components/PantallaDeAviso'

/**
 * Ruta que no existe. Va dentro del layout, así que la barra de navegación
 * sigue ahí y se sale del callejón con un toque.
 */
export function PaginaNoEncontrada() {
  return (
    <PantallaDeAviso
      titulo="Esta página no existe"
      descripcion="Puede que la dirección esté mal escrita o que la sección todavía no exista."
      accion={{ texto: 'Ir al inicio', a: '/' }}
    />
  )
}
