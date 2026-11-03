import { useEffect, useState, useMemo } from 'react'
import { obtenerLogsAuditoria } from '../services/admin.service'
import { formatearTiempoAviso } from '@/features/avisos/avisos.service'
import {
  IconoEscudo,
  IconoMegafono,
  IconoPeriodico,
  IconoBirrete,
  IconoBuscar,
} from '@/components/icons'
import type { ActivityLogItem, ModuloAuditoria } from '../services/admin.types'

export function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [filtroModulo, setFiltroModulo] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')

  const cargarLogs = () => {
    setLogs(obtenerLogsAuditoria())
  }

  useEffect(() => {
    cargarLogs()
    const alActualizar = () => cargarLogs()
    window.addEventListener('studenthub:admin-activity-updated', alActualizar)
    return () => window.removeEventListener('studenthub:admin-activity-updated', alActualizar)
  }, [])

  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      if (filtroModulo !== 'todos' && log.modulo !== filtroModulo) return false
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const coincideDesc = log.descripcion.toLowerCase().includes(q)
        const coincideDet = (log.detalles || '').toLowerCase().includes(q)
        const coincideAutor = log.autor.toLowerCase().includes(q)
        if (!coincideDesc && !coincideDet && !coincideAutor) return false
      }
      return true
    })
  }, [logs, filtroModulo, busqueda])

  const renderBadgeModulo = (modulo: ModuloAuditoria) => {
    switch (modulo) {
      case 'avisos':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-micro font-bold text-blue-600 dark:text-blue-400">
            <IconoMegafono className="size-3" />
            <span>Avisos Oficiales</span>
          </span>
        )
      case 'noticias':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-micro font-bold text-emerald-600 dark:text-emerald-400">
            <IconoPeriodico className="size-3" />
            <span>Noticias / Eventos</span>
          </span>
        )
      case 'estudiantes':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-micro font-bold text-indigo-600 dark:text-indigo-400">
            <IconoBirrete className="size-3" />
            <span>Directorio Estudiantes</span>
          </span>
        )
      case 'sistema':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-micro font-bold text-amber-600 dark:text-amber-400">
            <IconoEscudo className="size-3" />
            <span>Seguridad / Sistema</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-micro font-black uppercase tracking-wider text-primary">
            Trazabilidad y Seguridad
          </span>
          <h1 className="text-titulo font-black text-text md:text-hero">
            Registro de Auditoría (Activity Logs)
          </h1>
          <p className="text-menor text-text-muted">
            Historial inmutable de operaciones administrativas, cambios de estado y emisiones oficiales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-menuda font-semibold text-text-muted">
            <IconoEscudo className="size-4 text-primary" />
            Auditoría activa en tiempo real
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Buscar en el registro
          </label>
          <div className="relative">
            <IconoBuscar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar por descripción, detalle o autor..."
              className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Filtrar por Módulo
          </label>
          <select
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
          >
            <option value="todos">Todos los módulos</option>
            <option value="avisos">Avisos y Alertas</option>
            <option value="noticias">Noticias y Eventos</option>
            <option value="estudiantes">Directorio Estudiantil</option>
            <option value="sistema">Seguridad / Sistema</option>
          </select>
        </div>
      </div>

      {/* Feed Cronológico de Actividad */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        {logsFiltrados.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <div className="flex flex-col items-center gap-2">
              <IconoEscudo className="size-10 text-text-muted/60" />
              <p className="font-bold text-text">No hay registros de auditoría</p>
              <p className="text-menuda">
                No hay actividades recientes que coincidan con la búsqueda actual.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-border">
            {logsFiltrados.map((log) => {
              const fechaIso = new Date(log.timestamp).toLocaleString('es-CR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })

              return (
                <div key={log.id} className="relative group">
                  {/* Punto en la línea de tiempo */}
                  <div className="absolute -left-6 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary ring-4 ring-surface" />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderBadgeModulo(log.modulo)}
                      <span className="text-dato font-bold text-text">
                        {log.descripcion}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-menuda text-text-muted">
                      <span>{fechaIso}</span>
                      <span>·</span>
                      <span className="font-semibold text-text">{formatearTiempoAviso(log.timestamp)}</span>
                    </div>
                  </div>

                  {log.detalles && (
                    <p className="text-menuda text-text-muted bg-surface-alt/40 p-2.5 rounded-xl border border-border/60 mt-2 font-mono">
                      {log.detalles}
                    </p>
                  )}

                  <div className="mt-1 text-micro text-text-muted">
                    <span>Ejecutado por: </span>
                    <strong className="text-text">{log.autor}</strong>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
