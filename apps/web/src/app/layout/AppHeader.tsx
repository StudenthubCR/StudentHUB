import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconoSalir, IconoDescargar, IconoCampana, IconoRayo, IconoEscudo } from '@/components/icons'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { useNotificaciones } from '@/features/notificaciones/useNotificaciones'
import { ModalNotificaciones } from '@/features/notificaciones/ModalNotificaciones'
import { obtenerIniciales } from '@/lib/texto'
import { esUsuarioAdmin } from '@/features/avisos/avisos.service'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  onAbrirInstalar?: () => void
  esModoInstalado?: boolean
}

export function AppHeader({ onAbrirInstalar, esModoInstalado = false }: Props) {
  const { estudiante, cargando: cargandoEstudiante } = useEstudiante()
  const { sesion, cerrarSesion } = useSesion()
  const { permiso, notificacionesActivas, noLeidas } = useNotificaciones()
  const [modalNotifAbierto, setModalNotifAbierto] = useState(false)

  const email = (sesion?.user?.email ?? '').trim().toLowerCase()
  const esAdmin =
    esUsuarioAdmin(email) ||
    sesion?.user?.app_metadata?.role === 'admin' ||
    sesion?.user?.user_metadata?.role === 'admin' ||
    (typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true')

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
        className="relative flex h-10 w-[130px] sm:w-[180px] lg:w-[220px] shrink-0 items-center overflow-hidden rounded-sm"
      >
        {/* Alto sobredimensionado y desplazamiento lateral: el logo
            trae mucho margen transparente y así se recorta proporcionalmente. */}
        <img
          src="/SHlarge.webp"
          alt="Student HUB"
          className={
            'absolute top-1/2 left-[-26px] sm:left-[-36px] lg:left-[-45px] h-32 sm:h-36 lg:h-40 w-auto -translate-y-1/2 object-contain ' +
            'transition-all duration-250 ease-ui dark:brightness-0 dark:invert'
          }
        />
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {!esModoInstalado && onAbrirInstalar && (
          <button
            type="button"
            onClick={onAbrirInstalar}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint px-3 py-1.5 text-etiqueta font-bold text-primary shadow-xs transition-all duration-200 hover:bg-primary-tint-strong active:scale-95"
            title="Instalar Student HUB en tu dispositivo"
          >
            <IconoDescargar className="size-3.5" />
            <span className="hidden sm:inline">Instalar App</span>
            <span className="sm:hidden">Instalar</span>
          </button>
        )}

        {/* Botón de Notificaciones:
            Muestra la cantidad de notificaciones sin leer o un pulso sutil si están inactivas. */}
        <button
          type="button"
          onClick={() => setModalNotifAbierto(true)}
          aria-label={noLeidas > 0 ? `${noLeidas} notificaciones sin leer` : 'Centro de notificaciones'}
          title={noLeidas > 0 ? `${noLeidas} alertas sin leer` : 'Notificaciones estudiantiles'}
          className={
            'relative flex size-10 cursor-pointer items-center justify-center rounded-full ' +
            'border border-border bg-surface text-text-muted transition-all duration-200 ' +
            'hover:border-border-strong hover:bg-surface-alt hover:text-text active:scale-95'
          }
        >
          <IconoCampana className="size-4.5" />
          {noLeidas > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-surface">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          ) : !notificacionesActivas && permiso !== 'denied' ? (
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-primary animate-pulse" />
          ) : null}
        </button>


        {typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true' && (
          <Link
            to="/expo"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/30 px-3 py-1 text-etiqueta font-bold text-primary hover:bg-primary-tint-strong transition-all shadow-2xs active:scale-95"
            title="Volver al portal interactivo de Expotécnica 2026"
          >
            <IconoRayo className="size-3.5" />
            <span>Portal Expo</span>
          </Link>
        )}

        {esAdmin && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/30 px-3 py-1 text-etiqueta font-bold text-primary hover:bg-primary-tint-strong transition-all shadow-2xs active:scale-95"
            title="Ingresar al Panel de Control Administrativo"
          >
            <IconoEscudo className="size-3.5" />
            <span>Panel Admin</span>
          </Link>
        )}

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
        {cargandoEstudiante ? (
          <div className="size-10 rounded-full bg-surface-alt border border-border animate-pulse md:size-11" />
        ) : estudiante ? (
          <Link
            to="/carnet"
            aria-label={`Ver el carnet de ${estudiante.nombre ?? 'estudiante'}`}
            className="rounded-full transition-transform duration-250 ease-ui active:scale-95"
          >
            {estudiante.fotoUrl && !estudiante.fotoUrl.includes('placeholder') ? (
              <img
                src={estudiante.fotoUrl}
                alt=""
                className={
                  'size-10 rounded-full border-2 border-primary object-cover ' +
                  'shadow-[0_0_0_3px_var(--color-primary-tint)] md:size-11'
                }
              />
            ) : (
              <span
                className={
                  'flex size-10 items-center justify-center rounded-full border-2 border-primary ' +
                  'bg-primary-solid text-nota font-bold text-white shadow-[0_0_0_3px_var(--color-primary-tint)] md:size-11'
                }
              >
                {obtenerIniciales(estudiante.nombre ?? '')}
              </span>
            )}
          </Link>
        ) : sesion ? (
          <Link
            to="/carnet"
            aria-label="Perfil de usuario"
            className="rounded-full transition-transform duration-250 ease-ui active:scale-95"
          >
            <span
              className={
                'flex size-10 items-center justify-center rounded-full border-2 border-primary ' +
                'bg-primary-solid text-nota font-bold text-white shadow-[0_0_0_3px_var(--color-primary-tint)] md:size-11'
              }
            >
              {obtenerIniciales(sesion.user.email ?? 'Estudiante')}
            </span>
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

      <ModalNotificaciones
        abierto={modalNotifAbierto}
        alCerrar={() => setModalNotifAbierto(false)}
      />
    </header>
  )
}

