import { Link } from 'react-router-dom'
import { IconoSalir } from '@/components/icons'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { ThemeToggle } from './ThemeToggle'

export function AppHeader() {
  const { estudiante } = useEstudiante()
  const { sesion, cerrarSesion } = useSesion()

  return (
    <header
      data-print="ocultar"
      className={
        'glass sticky top-0 z-100 flex items-center justify-between ' +
        'border-b border-border px-4.5 py-2 ' +
        'md:px-6 md:py-2.5 lg:col-span-2 lg:row-start-1 lg:h-[70px] lg:px-8 lg:py-0'
      }
    >
      <Link
        to="/"
        aria-label="Ir al inicio"
        className="relative -ml-3 flex h-11 w-[220px] items-center overflow-hidden rounded-sm lg:ml-0"
      >
        {/* Alto sobredimensionado y desplazamiento lateral: el logo
            trae mucho margen transparente y así se recorta, igual que hoy. */}
        <img
          src="/SHlarge.webp"
          alt="Student HUB"
          className={
            'absolute top-1/2 left-[-45px] h-40 w-auto -translate-y-1/2 object-contain ' +
            'transition-all duration-250 ease-ui dark:brightness-0 dark:invert'
          }
        />
      </Link>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <ThemeToggle />

        {sesion && (
          <button
            type="button"
            onClick={() => void cerrarSesion()}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className={
              'flex size-10 cursor-pointer items-center justify-center rounded-full ' +
              'border border-border bg-surface text-text-muted transition-all duration-200 ' +
              'hover:border-border-strong hover:bg-surface-alt hover:text-text active:scale-95'
            }
          >
            <IconoSalir className="size-4" />
          </button>
        )}

        {/* La foto era decorativa y no llevaba a ningún lado; un avatar en la
            cabecera es justo lo que la gente toca buscando su ficha. Sin
            sesión no se muestra una cara ajena: se ofrece entrar. */}
        {estudiante ? (
          <Link
            to="/carnet"
            aria-label={`Ver el carnet de ${estudiante.nombre}`}
            className="rounded-full transition-transform duration-250 ease-ui active:scale-95"
          >
            <img
              src={estudiante.fotoUrl}
              alt=""
              className={
                'size-10 rounded-full border-2 border-primary object-cover ' +
                'shadow-[0_0_0_3px_var(--color-primary-tint)] md:size-11'
              }
            />
          </Link>
        ) : (
          <Link
            to="/entrar"
            className={
              'rounded-full bg-primary-tint px-3.5 py-2 text-nota font-semibold text-primary ' +
              'transition-all duration-250 ease-ui hover:bg-primary-tint-strong active:scale-95'
            }
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
