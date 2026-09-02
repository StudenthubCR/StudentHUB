import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { aplicarTema, leerTemaGuardado, type Theme } from '@/lib/theme'
import { ThemeContext } from './theme-context'

/**
 * El cliente se crea fuera del componente: uno solo para toda la vida de la
 * app, de modo que la caché sobreviva a los cambios de ruta.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // La hoja de cálculo tarda segundos en responder y el menú de la semana
      // no cambia sola: no tiene sentido revalidar cada vez que la PWA vuelve
      // a primer plano.
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => leerTemaGuardado())

  useEffect(() => {
    aplicarTema(theme)
  }, [theme])

  const alternarTema = useCallback(() => {
    setTheme((actual) => (actual === 'dark' ? 'light' : 'dark'))
  }, [])

  const valor = useMemo(() => ({ theme, alternarTema }), [theme, alternarTema])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext value={valor}>{children}</ThemeContext>
    </QueryClientProvider>
  )
}
