import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/app/layout/ThemeToggle'
import { IconoSalir } from '@/components/icons'
import { useAdminAuth } from '../hooks/useAdminAuth'

type Props = {
  alAbrirMenuMovil: () => void
}

export function AdminHeader({ alAbrirMenuMovil }: Props) {
  const { email, cerrarSesion } = useAdminAuth()

  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6">
      {/* Lado izquierdo: Botón menú móvil y títulos */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={alAbrirMenuMovil}
          aria-label="Abrir menú de navegación"
          className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition-colors hover:bg-surface-alt hover:text-text lg:hidden"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-tint px-2.5 py-0.5 text-micro font-bold text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span>Sistema Operativo Institucional</span>
          </span>
          <span className="text-micro font-bold uppercase tracking-wider text-text-muted sm:hidden">
            Panel Admin
          </span>
        </div>
      </div>

      {/* Lado derecho: Regresar a vista pública, Tema, Perfil del Admin */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-menuda font-bold text-text-muted transition-all hover:border-border-strong hover:bg-surface-alt hover:text-text active:scale-95"
          title="Regresar a la interfaz estudiantil"
        >
          <span>🎒</span>
          <span className="hidden md:inline">Vista Estudiantil</span>
        </Link>

        <ThemeToggle />

        {/* Perfil del Administrador */}
        <div className="flex items-center gap-2.5 border-l border-border pl-2 sm:pl-3">
          <div className="hidden text-right sm:block">
            <span className="block truncate text-menuda font-bold text-text max-w-[180px]">
              {email || 'Administración CTP'}
            </span>
            <span className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              ● Super Admin Activo
            </span>
          </div>

          <div
            className="flex size-9 sm:size-10 items-center justify-center rounded-full border-2 border-primary bg-primary-solid text-micro font-black text-white shadow-sm"
            title={email || 'Administrador Central'}
          >
            AD
          </div>

          <button
            type="button"
            onClick={() => void cerrarSesion()}
            aria-label="Cerrar sesión administrativa"
            title="Cerrar sesión administrativa"
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 active:scale-95"
          >
            <IconoSalir className="size-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
