import { useEffect } from 'react'
import { useMatches } from 'react-router-dom'

type Handle = { titulo?: string }

/**
 * Pone el título del documento según la ruta. Importa más de lo que parece en
 * una PWA: es lo que se ve en el conmutador de aplicaciones del celular y en
 * la lista de pestañas, donde hasta ahora las cuatro secciones se veían igual.
 */
export function useTituloDeRuta() {
  const rutas = useMatches()

  useEffect(() => {
    const titulo = [...rutas].reverse().find((ruta) => (ruta.handle as Handle | undefined)?.titulo)
    const nombre = (titulo?.handle as Handle | undefined)?.titulo
    document.title = nombre ? `${nombre} · Student HUB` : 'Student HUB'
  }, [rutas])
}
