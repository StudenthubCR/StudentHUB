import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from './useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { PantallaFueraDelPadron } from './PantallaFueraDelPadron'
import { usePwaInstall } from '@/features/pwa/usePwaInstall'
import { PantallaInstalacionObligatoria } from '@/features/pwa/PantallaInstalacionObligatoria'

export function RutaProtegida({ children }: { children?: ReactNode }) {
  const { sesion, cargando: cargandoSesion } = useSesion()
  const { estudiante, cargando: cargandoEstudiante, fueraDelPadron, error } = useEstudiante()
  const { esModoInstalado } = usePwaInstall()
  const location = useLocation()

  // 1. Estado de carga de sesión o verificación de matrícula
  if (cargandoSesion || (sesion && cargandoEstudiante)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex items-center justify-center">
            {/* Anillo de pulso sutil */}
            <div className="absolute size-24 animate-ping rounded-full bg-primary/15 opacity-75" />
            <div className="relative flex size-20 items-center justify-center rounded-2xl border border-border bg-surface shadow-md">
              <img
                src="/SHlarge.webp"
                alt="Student HUB"
                className="h-9 w-auto object-contain transition-all duration-250 dark:brightness-0 dark:invert"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-cuerpo font-semibold text-text">
              {cargandoSesion ? 'Iniciando Student HUB' : 'Comprobando matrícula estudiantil…'}
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

  // 2. Si no hay sesión activa, redirigir al login
  if (!sesion) {
    return <Navigate to="/entrar" replace state={{ desde: location }} />
  }

  // 3. Si hubo un error transitorio de red al consultar el estudiante
  if (error && !estudiante) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12 text-center">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-7 shadow-md">
          <h2 className="text-titulo font-bold text-text">Problema de conexión</h2>
          <p className="mt-2 text-menor text-text-muted">
            No se pudo sincronizar la información del estudiante. Por favor, verificá tu conexión a
            internet.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-primary-solid px-5 py-2.5 text-menor font-bold text-white shadow-sm hover:bg-primary-dark"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // 4. Bloqueo de seguridad: el usuario está fuera del padrón o no tiene ficha activa
  if (fueraDelPadron || !estudiante) {
    return <PantallaFueraDelPadron correo={sesion.user.email} />
  }

  // 5. Verificación de instalación obligatoria de la aplicación (PWA standalone)
  if (!esModoInstalado) {
    return <PantallaInstalacionObligatoria />
  }

  // 6. Si cumple todas las condiciones, dar paso a la aplicación
  return children ?? <Outlet />
}
