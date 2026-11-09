import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PageSection } from '@/components/PageSection'
import {
  IconoMegafono,
  IconoAlertaTriangulo,
  IconoInfo,
  IconoProfesorAusente,
  IconoComedor,
  IconoCalendario,
  IconoRecargar,
  IconoEscudo,
} from '@/components/icons'
import { useAvisos } from './useAvisos'
import type { CategoriaAviso, PrioridadAviso } from './avisos.types'

type FiltroCategoria = 'todas' | CategoriaAviso

function formatearFecha(isoString: string): string {
  try {
    return format(new Date(isoString), "d 'de' MMMM, yyyy · p", { locale: es })
  } catch {
    return isoString
  }
}

function IconoParaCategoria({ categoria, className = 'size-5' }: { categoria: CategoriaAviso; className?: string }) {
  switch (categoria) {
    case 'absence':
      return <IconoProfesorAusente className={className} />
    case 'menu_change':
      return <IconoComedor className={className} />
    case 'event':
      return <IconoCalendario className={className} />
    case 'early_departure':
      return <IconoAlertaTriangulo className={className} />
    case 'general':
    default:
      return <IconoMegafono className={className} />
  }
}

function etiquetaCategoria(categoria: CategoriaAviso): string {
  switch (categoria) {
    case 'absence':
      return 'Ausencia Docente'
    case 'menu_change':
      return 'Cambio de Menú'
    case 'event':
      return 'Actividad / Evento'
    case 'early_departure':
      return 'Salida Temprana'
    case 'general':
    default:
      return 'Comunicado General'
  }
}

function estiloPrioridad(prioridad: PrioridadAviso) {
  switch (prioridad) {
    case 'urgent':
      return {
        badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
        borde: 'border-rose-500/30 bg-rose-500/5',
        label: 'Urgente',
      }
    case 'warning':
      return {
        badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
        borde: 'border-amber-500/30 bg-amber-500/5',
        label: 'Importante',
      }
    case 'info':
    default:
      return {
        badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
        borde: 'border-border/80 bg-surface',
        label: 'Informativo',
      }
  }
}

export function AvisosPage() {
  const { avisos, cargando, refrescar, esAdmin } = useAvisos()
  const [filtro, setFiltro] = useState<FiltroCategoria>('todas')

  const avisosFiltrados = useMemo(() => {
    if (filtro === 'todas') return avisos
    return avisos.filter((aviso) => aviso.category === filtro)
  }, [avisos, filtro])

  const categoriasDisponibles: { id: FiltroCategoria; label: string }[] = [
    { id: 'todas', label: 'Todos' },
    { id: 'general', label: 'Generales' },
    { id: 'absence', label: 'Ausencias' },
    { id: 'menu_change', label: 'Comedor' },
    { id: 'event', label: 'Eventos' },
    { id: 'early_departure', label: 'Salidas' },
  ]

  return (
    <PageSection
      titulo="Avisos Oficiales"
      
      acciones={
        <div className="flex items-center gap-2">
          {esAdmin && (
            <Link
              to="/admin/avisos"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint px-3 py-1.5 text-menor font-bold text-primary transition-all hover:bg-primary-tint-strong active:scale-95"
            >
              <IconoEscudo className="size-3.5" />
              <span className="hidden sm:inline">Gestionar Avisos</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => void refrescar()}
            disabled={cargando}
            aria-label="Actualizar avisos"
            title="Refrescar avisos"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:border-primary hover:text-primary active:scale-95 disabled:opacity-50"
          >
            <IconoRecargar className={`size-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Selector de Categorías (Píldoras) */}
      <div
        className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Filtro de avisos por categoría"
      >
        {categoriasDisponibles.map((cat) => {
          const activa = filtro === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setFiltro(cat.id)}
              className={
                'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-menor font-semibold transition-all active:scale-95 ' +
                (activa
                  ? 'bg-primary text-white shadow-xs'
                  : 'border border-border bg-surface text-text-muted hover:border-border-strong hover:bg-surface-alt hover:text-text')
              }
            >
              <span>{cat.label}</span>
              {cat.id === 'todas' && (
                <span className="ml-0.5 rounded-full bg-white/20 px-1.5 py-0.2 text-micro font-bold">
                  {avisos.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Listado de Avisos */}
      {cargando && avisos.length === 0 ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando comunicados oficiales">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-surface-alt" />
          ))}
        </div>
      ) : avisosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-10 text-center bg-surface-alt/30">
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconoInfo className="size-7" />
          </div>
          <h3 className="text-cuerpo font-bold text-text">No hay comunicados en esta categoría</h3>
          <p className="mt-1 max-w-sm text-menor text-text-muted">
            Los comunicados institucionales y reportes de ausencia docente publicados por la institución se mostrarán aquí en tiempo real.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {avisosFiltrados.map((aviso) => {
            const estilo = estiloPrioridad(aviso.priority)
            const esExpirado = aviso.expires_at ? new Date(aviso.expires_at) < new Date() : false

            return (
              <article
                key={aviso.id}
                className={
                  'relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ' +
                  estilo.borde
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <IconoParaCategoria categoria={aviso.category} className="size-4" />
                    </span>
                    <span className="text-menor font-bold text-text">
                      {etiquetaCategoria(aviso.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-micro font-black uppercase tracking-wider ' +
                        estilo.badge
                      }
                    >
                      {estilo.label}
                    </span>
                    {aviso.target_type !== 'all' && (
                      <span className="rounded-full border border-border bg-surface-alt px-2 py-0.5 text-micro font-medium text-text-muted">
                        {aviso.target_type === 'specialty' ? 'Especialidad' : 'Sección'}:{' '}
                        {aviso.target_values.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-3 text-cuerpo font-bold text-text">{aviso.title}</h3>
                <p className="mt-1.5 whitespace-pre-line text-menor text-text/85 leading-relaxed">
                  {aviso.message}
                </p>

                <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-micro text-text-muted">
                  <span>Publicado: {formatearFecha(aviso.created_at)}</span>
                  {aviso.expires_at && (
                    <span className={esExpirado ? 'text-rose-500 font-semibold' : ''}>
                      {esExpirado ? 'Expirado' : `Vigente hasta: ${formatearFecha(aviso.expires_at)}`}
                    </span>
                  )}
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </PageSection>
  )
}
