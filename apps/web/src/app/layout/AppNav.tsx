import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { NAV_ITEMS } from './nav-items'

/**
 * Una sola pieza para las dos formas de navegación de la app actual:
 *   · < 1024px → píldora flotante fija al fondo (glass), indicador arriba
 *   · ≥ 1024px → barra lateral de 264px pegada bajo el header, indicador a la izquierda
 */
export function AppNav() {
  return (
    <nav
      aria-label="Navegación principal"
      data-print="ocultar"
      className={cn(
        // Píldora flotante (móvil y tablet)
        'fixed right-3.5 bottom-[calc(14px_+_env(safe-area-inset-bottom))] left-3.5 z-[1000]',
        'flex h-[66px] items-center justify-around px-1.5',
        'rounded-xl border border-border max-lg:glass max-lg:elev-nav',
        // Tablet: misma píldora, centrada y acotada
        'md:right-auto md:bottom-[calc(18px_+_env(safe-area-inset-bottom))] md:left-1/2',
        'md:h-[72px] md:w-[min(520px,calc(100%_-_48px))] md:-translate-x-1/2',
        // Escritorio: se convierte en barra lateral
        'lg:sticky lg:top-[70px] lg:right-auto lg:bottom-auto lg:left-0 lg:z-90',
        'lg:col-start-1 lg:row-start-2 lg:h-[calc(100vh_-_70px)] lg:w-[264px] lg:translate-x-0',
        'lg:flex-col lg:items-stretch lg:justify-start lg:gap-1.5 lg:px-4 lg:py-6',
        'lg:rounded-none lg:border-0 lg:border-r lg:border-border lg:bg-surface',
      )}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'group relative flex flex-1 flex-col items-center justify-center gap-[3px] h-full',
              'transition-colors duration-250',
              // Indicador del ítem activo: barra superior en móvil…
              "before:absolute before:top-2 before:left-1/2 before:h-[3px] before:w-0",
              'before:-translate-x-1/2 before:rounded-full before:bg-primary',
              'before:transition-[width] before:duration-300 before:ease-soft before:content-[""]',
              // …y barra lateral izquierda en escritorio
              'lg:h-auto lg:w-full lg:flex-none lg:flex-row lg:items-center lg:justify-start',
              'lg:gap-3.5 lg:rounded-md lg:px-4 lg:py-3 lg:transition-all',
              'lg:before:top-1/2 lg:before:left-0 lg:before:h-0 lg:before:w-[3px]',
              'lg:before:translate-x-0 lg:before:-translate-y-1/2 lg:before:transition-[height]',
              isActive
                ? 'text-primary before:w-5 lg:bg-primary-tint lg:before:h-[22px] lg:before:w-[3px]'
                : 'text-text-muted lg:hover:bg-surface-alt lg:hover:text-text',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  '[&>svg]:size-[23px] [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-soft',
                  'md:[&>svg]:size-[25px] lg:[&>svg]:size-[22px]',
                  'group-active:[&>svg]:scale-88',
                  isActive && 'max-lg:[&>svg]:translate-y-px max-lg:[&>svg]:scale-106',
                )}
              >
                <item.Icono />
              </span>
              <span className="text-etiqueta font-semibold tracking-[0.01em] md:text-menuda lg:text-dato">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      {/* Sólo en escritorio: la barra lateral mide toda la altura de la
          pantalla y con cuatro ítems quedaban 500px en blanco. La ficha del
          estudiante al pie la cierra y de paso dice quién está usando la app,
          que hasta ahora no se decía en ningún lado fuera del carnet. */}
      <FichaLateral />
    </nav>
  )
}

function FichaLateral() {
  const estudiante = useEstudiante()

  return (
    <NavLink
      to="/carnet"
      className={({ isActive }) =>
        cn(
          'mt-auto hidden items-center gap-3 rounded-md border border-border p-2.5',
          'transition-colors duration-250 lg:flex',
          isActive ? 'bg-primary-tint' : 'hover:bg-surface-alt',
        )
      }
    >
      <img
        src={estudiante.fotoUrl}
        alt=""
        className="size-9 shrink-0 rounded-full border border-border object-cover"
      />
      <span className="min-w-0">
        <span className="block truncate text-menor font-semibold text-text">
          {estudiante.nombre}
        </span>
        <span className="block text-menuda text-text-muted">Grupo {estudiante.grupo}</span>
      </span>
    </NavLink>
  )
}
