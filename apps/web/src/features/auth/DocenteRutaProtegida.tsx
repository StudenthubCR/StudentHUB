import type { ReactNode } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { IconoCandado, IconoVolver } from '@/components/icons'
import { useSesion } from './useSesion'

export function DocenteRutaProtegida({ children }: { children?: ReactNode }) {
  const { sesion, cargando, rol, cargandoRol, docente } = useSesion()
  const location = useLocation()

  if (cargando || cargandoRol) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12"
        aria-busy="true"
        aria-label="Verificando perfil docente"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="size-11 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
          <p className="text-menor font-semibold text-text-muted">
            Verificando credenciales docentes...
          </p>
        </div>
      </div>
    )
  }

  if (!sesion) {
    return <Navigate to="/entrar" replace state={{ desde: location }} />
  }

  if (rol !== 'docente' || !docente) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-10 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <IconoCandado className="size-8" />
        </div>
        <span className="mb-2 inline-flex items-center rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          403 · Acceso Restringido
        </span>
        <h1 className="text-titulo font-black text-text">
          Área Exclusiva para Docentes
        </h1>
        <p className="mt-2 text-menor leading-relaxed text-text-muted">
          El Modo Docente está reservado únicamente para profesores autorizados del CTP Rosario de Naranjo. Tu cuenta actual corresponde al portal estudiantil.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary-solid px-5 py-2.5 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-98"
        >
          <IconoVolver className="size-4" />
          <span>Volver a Mi Portal</span>
        </Link>
      </section>
    )
  }

  return children ?? <Outlet />
}
