import { NavLink } from 'react-router-dom'
import { IconoSalir } from '@/components/icons'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { BadgeRol } from '@/components/BadgeRol'
import { cn } from '@/lib/cn'
import { obtenerIniciales } from '@/lib/texto'
import { DOCENTE_NAV_ITEMS, NAV_ITEMS } from './nav-items'

/**
 * Una sola pieza para las dos formas de navegación de la app actual:
 *   · < 1280px → píldora flotante fija al fondo (glass), indicador arriba
 *   · ≥ 1280px → barra lateral de 264px pegada bajo el header, indicador a la izquierda
 */
export function AppNav() {
  const { rol } = useSesion()
  const items = rol === 'docente' ? DOCENTE_NAV_ITEMS : NAV_ITEMS

  return (
    <nav
      aria-label="Navegación principal"
      data-print="ocultar"
      className={cn(
        // Píldora flotante (móvil y tablet)
        'fixed right-3.5 bottom-[calc(14px_+_env(safe-area-inset-bottom))] left-3.5 z-[1000]',
        'flex h-[66px] items-center justify-around px-1.5',
        'rounded-xl border border-border max-xl:glass max-xl:elev-nav',
        // Tablet: misma píldora, centrada y acotada
        'md:right-auto md:bottom-[calc(18px_+_env(safe-area-inset-bottom))] md:left-1/2',
        'md:h-[72px] md:w-[min(540px,calc(100%_-_48px))] md:-translate-x-1/2',
        // Escritorio: se convierte en barra lateral
        'xl:sticky xl:top-[70px] xl:right-auto xl:bottom-auto xl:left-0 xl:z-90',
        'xl:col-start-1 xl:row-start-2 xl:h-[calc(100vh_-_70px)] xl:w-[264px] xl:translate-x-0',
        'xl:flex-col xl:items-stretch xl:justify-start xl:gap-1.5 xl:px-4 xl:py-6',
        'xl:rounded-none xl:border-0 xl:border-r xl:border-border xl:bg-surface',
      )}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={Boolean(item.end)}
          className={({ isActive }) =>
            cn(
              'group relative flex flex-1 flex-col items-center justify-center gap-[3px] h-full',
              'transition-colors duration-250',
              // Indicador del ítem activo: barra superior en móvil…
              "before:absolute before:top-2 before:left-1/2 before:h-[3px] before:w-0",
              'before:-translate-x-1/2 before:rounded-full before:bg-primary',
              'before:transition-[width] before:duration-300 before:ease-soft before:content-[""]',
              // …y barra lateral izquierda en escritorio
              'xl:h-auto xl:w-full xl:flex-none xl:flex-row xl:items-center xl:justify-start',
              'xl:gap-3.5 xl:rounded-md xl:px-4 xl:py-3 xl:transition-all',
              'xl:before:top-1/2 xl:before:left-0 xl:before:h-0 xl:before:w-[3px]',
              'xl:before:translate-x-0 xl:before:-translate-y-1/2 xl:before:transition-[height]',
              isActive
                ? 'text-primary before:w-5 xl:bg-primary-tint xl:before:h-[22px] xl:before:w-[3px]'
                : 'text-text-muted xl:hover:bg-surface-alt xl:hover:text-text',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  '[&>svg]:size-[23px] [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-soft',
                  'md:[&>svg]:size-[25px] xl:[&>svg]:size-[22px]',
                  'group-active:[&>svg]:scale-88',
                  isActive && 'max-xl:[&>svg]:translate-y-px max-xl:[&>svg]:scale-106',
                )}
              >
                <item.Icono />
              </span>
              <span className="text-etiqueta font-semibold tracking-[0.01em] md:text-menuda xl:text-dato">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      {/* Ficha de identidad al pie de la barra lateral en escritorio */}
      <FichaLateral />
    </nav>
  )
}

function FichaLateral() {
  const { estudiante, perspectiva, cargando } = useEstudiante()
  const { sesion, rol, cargandoRol, docente, cerrarSesion } = useSesion()

  if (cargando || cargandoRol) {
    return (
      <div className="mt-auto hidden animate-pulse items-center gap-3 rounded-md border border-border p-2.5 xl:flex">
        <div className="size-9 shrink-0 rounded-full bg-surface-alt" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3.5 w-24 rounded-sm bg-surface-alt" />
          <div className="h-2.5 w-16 rounded-sm bg-surface-alt" />
        </div>
      </div>
    )
  }

  if (rol === 'docente' && docente) {
    return (
      <div className="mt-auto hidden flex-col gap-2 border-t border-border pt-3 xl:flex">
        <div className="flex items-center justify-between px-1">
          <BadgeRol rol="docente" especialidad={docente.especialidadAsignada} />
        </div>

        <NavLink
          to="/docente"
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md border border-border p-2.5',
              'transition-colors duration-250',
              isActive ? 'bg-primary-tint' : 'hover:bg-surface-alt',
            )
          }
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-primary-solid text-micro font-bold text-white">
            {obtenerIniciales(docente.nombreCompleto)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-menor font-semibold text-text">
              {docente.nombreCompleto}
            </span>
            <span className="block truncate text-menuda text-text-muted">
              {docente.especialidadAsignada}
            </span>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={() => void cerrarSesion()}
          className={cn(
            'flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border',
            'bg-surface px-3 py-2 text-menuda font-semibold text-text-muted transition-all duration-200',
            'hover:border-border-strong hover:bg-surface-alt hover:text-text active:scale-98',
          )}
        >
          <IconoSalir className="size-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    )
  }

  if (!estudiante) {
    if (sesion) {
      return (
        <div className="mt-auto hidden flex-col gap-2 border-t border-border pt-3 xl:flex">
          <div className="rounded-md border border-border bg-surface-alt p-2.5 text-menuda text-text-muted">
            <span className="block font-semibold text-text truncate">
              {sesion.user.email}
            </span>
            <span className="block text-micro">Sin ficha en padrón</span>
          </div>
          <button
            type="button"
            onClick={() => void cerrarSesion()}
            className={cn(
              'flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border',
              'bg-surface px-3 py-2 text-menuda font-semibold text-text-muted transition-all duration-200',
              'hover:border-border-strong hover:bg-surface-alt hover:text-text active:scale-98',
            )}
          >
            <IconoSalir className="size-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )
    }

    return (
      <NavLink
        to="/entrar"
        className={cn(
          'mt-auto hidden items-center justify-center rounded-md border border-border',
          'bg-primary-tint p-2.5 text-menor font-semibold text-primary',
          'transition-colors duration-250 hover:bg-primary-tint-strong xl:flex',
        )}
      >
        Iniciar sesión
      </NavLink>
    )
  }

  return (
    <div className="mt-auto hidden flex-col gap-2 border-t border-border pt-3 xl:flex">
      <div className="flex items-center justify-between px-1">
        <BadgeRol perspectiva={perspectiva} />
      </div>

      <NavLink
        to="/estudiante"
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-md border border-border p-2.5',
            'transition-colors duration-250',
            isActive ? 'bg-primary-tint' : 'hover:bg-surface-alt',
          )
        }
      >
        {estudiante.fotoUrl && !estudiante.fotoUrl.includes('placeholder') ? (
          <img
            src={estudiante.fotoUrl}
            alt=""
            className="size-9 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-primary-solid text-micro font-bold text-white">
            {obtenerIniciales(estudiante.nombre ?? '')}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-menor font-semibold text-text">
            {estudiante.nombre ?? 'Estudiante'}
          </span>
          <span className="block text-menuda text-text-muted">Grupo {estudiante.grupo ?? '12-1'}</span>
        </span>
      </NavLink>

      <button
        type="button"
        onClick={() => void cerrarSesion()}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border',
          'bg-surface px-3 py-2 text-menuda font-semibold text-text-muted transition-all duration-200',
          'hover:border-border-strong hover:bg-surface-alt hover:text-text active:scale-98',
        )}
      >
        <IconoSalir className="size-3.5" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  )
}
