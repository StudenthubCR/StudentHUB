import { Link } from 'react-router-dom'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { ThemeToggle } from './ThemeToggle'

export function AppHeader() {
  const estudiante = useEstudiante()

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
        {/* Alto sobredimensionado y desplazamiento lateral: el SVG del logo
            trae mucho margen transparente y así se recorta, igual que hoy. */}
        <img
          src="/SHlarge.svg"
          alt="Student HUB"
          className={
            'absolute top-1/2 left-[-45px] h-40 w-auto -translate-y-1/2 object-contain ' +
            'transition-all duration-250 ease-ui dark:brightness-0 dark:invert'
          }
        />
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {/* La foto era decorativa y no llevaba a ningún lado; un avatar en la
            cabecera es justo lo que la gente toca buscando su ficha. */}
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
      </div>
    </header>
  )
}
