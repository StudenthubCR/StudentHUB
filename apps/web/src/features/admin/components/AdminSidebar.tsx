import { NavLink } from 'react-router-dom'
import {
  IconoDashboard,
  IconoMegafono,
  IconoPeriodico,
  IconoBirrete,
  IconoEscudo,
  IconoVolver,
  IconoCerrar,
  IconoChevron,
} from '@/components/icons'
import { cn } from '@/lib/cn'

type Props = {
  abiertoEnMovil: boolean
  alCerrarMovil: () => void
  colapsadoEscritorio: boolean
  alAlternarColapso: () => void
}

const ITEMS_NAVEGACION = [
  {
    to: '/admin',
    etiqueta: 'Dashboard General',
    Icono: IconoDashboard,
    descripcion: 'Métricas y resumen operativo',
  },
  {
    to: '/admin/avisos',
    etiqueta: 'Avisos y Alertas',
    Icono: IconoMegafono,
    descripcion: 'Gestor y difusión oficial',
  },
  {
    to: '/admin/noticias',
    etiqueta: 'Noticias y Eventos',
    Icono: IconoPeriodico,
    descripcion: 'Publicación institucional',
  },
  {
    to: '/admin/estudiantes',
    etiqueta: 'Directorio Estudiantil',
    Icono: IconoBirrete,
    descripcion: 'Estudiantes y secciones',
  },
  {
    to: '/admin/auditoria',
    etiqueta: 'Registro de Auditoría',
    Icono: IconoEscudo,
    descripcion: 'Historial de actividad y logs',
  },
] as const

export function AdminSidebar({
  abiertoEnMovil,
  alCerrarMovil,
  colapsadoEscritorio,
  alAlternarColapso,
}: Props) {
  return (
    <>
      {/* Fondo oscuro móvil con backdrop blur */}
      {abiertoEnMovil && (
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={alCerrarMovil}
        />
      )}

      {/* Contenedor Sidebar Off-Canvas / Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-300 ease-ui overflow-hidden',
          'lg:static lg:z-30',
          colapsadoEscritorio ? 'lg:w-[76px]' : 'lg:w-[270px]',
          abiertoEnMovil ? 'translate-x-0 w-[290px] shadow-2xl' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Cabecera del Sidebar */}
        <div className="flex h-[70px] items-center justify-between border-b border-border px-4.5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm font-black">
              <span>SH</span>
              <span className="absolute -top-1 -right-1 flex size-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </div>

            {!colapsadoEscritorio && (
              <div className="min-w-0">
                <span className="block truncate text-dato font-black text-text">
                  StudentHUB
                </span>
                <span className="inline-block rounded-full bg-primary-tint px-2 py-0.5 text-micro font-bold uppercase tracking-wider text-primary border border-primary/20">
                  Panel Control
                </span>
              </div>
            )}
          </div>

          {/* Botón cerrar en móvil (mínimo 44px de toque) */}
          <button
            type="button"
            onClick={alCerrarMovil}
            aria-label="Cerrar menú de navegación"
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-text-muted hover:bg-surface-alt hover:text-text lg:hidden active:scale-95"
          >
            <IconoCerrar className="size-5" />
          </button>
        </div>

        {/* Lista de Navegación */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          <div className={cn('px-3 py-1.5', colapsadoEscritorio && 'lg:hidden')}>
            <span className="text-micro font-extrabold uppercase tracking-wider text-text-muted">
              Módulos de Gestión
            </span>
          </div>

          {ITEMS_NAVEGACION.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={alCerrarMovil}
              title={colapsadoEscritorio ? item.etiqueta : undefined}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-menor font-semibold transition-all duration-200 min-h-[44px]',
                  colapsadoEscritorio && 'lg:justify-center lg:px-2.5',
                  isActive
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-text-muted hover:bg-surface-alt hover:text-text',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.Icono
                    className={cn(
                      'size-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-white' : 'text-text-muted group-hover:text-text',
                    )}
                  />
                  {!colapsadoEscritorio && (
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{item.etiqueta}</span>
                      <span
                        className={cn(
                          'block truncate text-[11px] font-normal',
                          isActive ? 'text-white/80' : 'text-text-muted',
                        )}
                      >
                        {item.descripcion}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Pie de Sidebar: Colapso y Volver al portal */}
        <div className="border-t border-border p-3 space-y-2">
          {/* Botón para colapsar en pantallas grandes */}
          <button
            type="button"
            onClick={alAlternarColapso}
            className={cn(
              'hidden w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-menuda font-semibold text-text-muted transition-all hover:bg-surface-alt hover:text-text lg:flex min-h-[44px]',
              colapsadoEscritorio && 'justify-center px-1',
            )}
            title={colapsadoEscritorio ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            <IconoChevron
              hacia={colapsadoEscritorio ? 'derecha' : 'izquierda'}
              className="size-4 shrink-0"
            />
            {!colapsadoEscritorio && <span>Colapsar menú</span>}
          </button>

          {/* Enlace de regreso al portal de estudiantes */}
          <NavLink
            to="/"
            className={cn(
              'flex items-center gap-3 rounded-xl border border-primary/25 bg-primary-tint px-3.5 py-2.5 text-menor font-bold text-primary transition-all duration-200 hover:bg-primary-tint-strong active:scale-98 min-h-[44px]',
              colapsadoEscritorio && 'lg:justify-center lg:px-2',
            )}
            title={colapsadoEscritorio ? 'Ir a la App Estudiantil' : undefined}
          >
            <IconoVolver className="size-4 shrink-0" />
            {!colapsadoEscritorio && <span className="truncate">Vista Estudiante</span>}
          </NavLink>
        </div>
      </aside>
    </>
  )
}
