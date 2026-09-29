import { NavLink } from 'react-router-dom'
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
    icono: '📊',
    descripcion: 'Métricas y resumen operativo',
  },
  {
    to: '/admin/avisos',
    etiqueta: 'Avisos y Alertas',
    icono: '📢',
    descripcion: 'Gestor y difusión oficial',
  },
  {
    to: '/admin/noticias',
    etiqueta: 'Noticias y Eventos',
    icono: '📰',
    descripcion: 'Publicación institucional',
  },
  {
    to: '/admin/estudiantes',
    etiqueta: 'Directorio Estudiantil',
    icono: '🎓',
    descripcion: 'Estudiantes y secciones',
  },
  {
    to: '/admin/auditoria',
    etiqueta: 'Registro de Auditoría',
    icono: '🛡️',
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
      {/* Fondo oscuro móvil */}
      {abiertoEnMovil && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={alCerrarMovil}
        />
      )}

      {/* Contenedor Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-300 ease-ui',
          'lg:static lg:z-30',
          colapsadoEscritorio ? 'lg:w-[76px]' : 'lg:w-[270px]',
          abiertoEnMovil ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Cabecera del Sidebar */}
        <div className="flex h-[70px] items-center justify-between border-b border-border px-4.5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm font-black">
              SH
              <span className="absolute -top-1 -right-1 flex size-3 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </div>

            {!colapsadoEscritorio && (
              <div className="min-w-0">
                <span className="block truncate text-dato font-black text-text">
                  StudentHUB
                </span>
                <span className="inline-block rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-black uppercase tracking-wider text-primary">
                  Admin Central
                </span>
              </div>
            )}
          </div>

          {/* Botón cerrar en móvil */}
          <button
            type="button"
            onClick={alCerrarMovil}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-text lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Lista de Navegación */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          <div className={cn('px-3 py-1.5', colapsadoEscritorio && 'lg:hidden')}>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
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
                  'group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-menor font-semibold transition-all duration-200',
                  colapsadoEscritorio && 'lg:justify-center lg:px-2.5',
                  isActive
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-text-muted hover:bg-surface-alt hover:text-text',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'text-xl transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'brightness-110' : '',
                    )}
                  >
                    {item.icono}
                  </span>
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
              'hidden w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-menuda font-semibold text-text-muted transition-all hover:bg-surface-alt hover:text-text lg:flex',
              colapsadoEscritorio && 'justify-center px-1',
            )}
            title={colapsadoEscritorio ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            <span>{colapsadoEscritorio ? '⇥' : '⇤'}</span>
            {!colapsadoEscritorio && <span>Colapsar menú</span>}
          </button>

          {/* Enlace de regreso al portal de estudiantes */}
          <NavLink
            to="/"
            className={cn(
              'flex items-center gap-3 rounded-xl border border-primary/25 bg-primary-tint px-3.5 py-2.5 text-menor font-bold text-primary transition-all duration-200 hover:bg-primary-tint-strong active:scale-98',
              colapsadoEscritorio && 'lg:justify-center lg:px-2',
            )}
            title={colapsadoEscritorio ? 'Ir a la App Estudiantil' : undefined}
          >
            <span className="text-base">🎒</span>
            {!colapsadoEscritorio && <span className="truncate">Vista Estudiante</span>}
          </NavLink>
        </div>
      </aside>
    </>
  )
}
