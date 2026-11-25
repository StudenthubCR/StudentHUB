import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { aplicarTema, leerTemaGuardado, type Theme } from '@/lib/theme'
import { ThemeContext } from './theme-context'
import { SesionProvider } from '@/features/auth/SesionProvider'
import { EstudianteProvider } from '@/features/estudiante/EstudianteProvider'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import {
  hidratarQueryClientDesdeCache,
  persistirQueryClientEnCache,
  resolverScopeUsuarioActivo,
} from '@/lib/offlineCache'
import { programarPrecargaOffline } from '@/lib/offlineWarmer'
import { sincronizarColaOffline } from '@/lib/offlineQueue'

/**
 * El cliente se crea fuera del componente: uno solo para toda la vida de la
 * app, con `networkMode: 'offlineFirst'` para que consultas con respaldo local
 * nunca queden pausadas sin red e hidrate datos cacheados al instante.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})

if (typeof window !== 'undefined') {
  hidratarQueryClientDesdeCache(queryClient)
}

function PuenteSincronizacionOffline({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const { sesion, rol, docente } = useSesion()
  const { estudiante } = useEstudiante()

  const userScope = useMemo(
    () => resolverScopeUsuarioActivo(sesion?.user?.id ?? null),
    [sesion?.user?.id],
  )

  // Hidratar caché del usuario apenas se resuelva sesión
  useEffect(() => {
    if (typeof window === 'undefined' || !userScope) return
    hidratarQueryClientDesdeCache(qc, userScope)
  }, [qc, userScope])

  // Persistir automáticamente cada consulta exitosa en segundo plano
  useEffect(() => {
    if (typeof window === 'undefined') return
    let timer: ReturnType<typeof setTimeout> | null = null

    const desuscribir = qc.getQueryCache().subscribe(() => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        persistirQueryClientEnCache(qc, resolverScopeUsuarioActivo(sesion?.user?.id ?? null))
      }, 350)
    })

    return () => {
      if (timer) clearTimeout(timer)
      desuscribir()
    }
  }, [qc, sesion?.user?.id])

  // Precargar en segundo plano el núcleo de datos del perfil activo
  useEffect(() => {
    if (!sesion) return
    return programarPrecargaOffline({
      queryClient: qc,
      userId: sesion.user.id,
      rol,
      estudiante,
      docente,
    })
  }, [qc, sesion, rol, estudiante, docente])

  // Al recuperar red: procesar cola offline pendiente y revalidar cachés
  useEffect(() => {
    if (typeof window === 'undefined') return

    const alReconectar = () => {
      const scope = resolverScopeUsuarioActivo(sesion?.user?.id ?? null)
      void sincronizarColaOffline(scope).then(() => {
        void qc.invalidateQueries()
      })
    }

    if (typeof navigator === 'undefined' || navigator.onLine !== false) {
      void sincronizarColaOffline(userScope)
    }

    window.addEventListener('online', alReconectar)
    return () => {
      window.removeEventListener('online', alReconectar)
    }
  }, [qc, sesion?.user?.id, userScope])

  return <>{children}</>
}

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
      <SesionProvider>
        <EstudianteProvider>
          <PuenteSincronizacionOffline>
            <ThemeContext value={valor}>{children}</ThemeContext>
          </PuenteSincronizacionOffline>
        </EstudianteProvider>
      </SesionProvider>
    </QueryClientProvider>
  )
}
