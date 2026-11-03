import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './hooks/useAdminAuth'

export function AdminRutaProtegida({ children }: { children?: ReactNode }) {
  const { esAdmin, cargando, sesion } = useAdminAuth()
  const location = useLocation()

  // 1. Estado de carga de sesión y roles
  if (cargando) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute size-24 animate-ping rounded-full bg-primary/15 opacity-75" />
            <div className="relative flex size-20 items-center justify-center rounded-2xl border border-border bg-surface shadow-md">
              <img
                src="/SHlarge.webp"
                alt="Student HUB Admin"
                className="h-9 w-auto object-contain transition-all duration-250 dark:brightness-0 dark:invert"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-cuerpo font-semibold text-text">
              Verificando Permisos Administrativos
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Si no hay sesión, al login
  if (!sesion) {
    return <Navigate to="/entrar" replace state={{ desde: location }} />
  }

  // 3. Si no es admin, a 403 Forbidden
  if (!esAdmin) {
    return <Navigate to="/admin/403" replace />
  }

  // 4. Usuario autorizado como administrador
  return children ?? <Outlet />
}
