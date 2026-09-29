import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { SkeletonCard, SkeletonTableRow } from '../components/Skeletons'
import { ModalEditarCrearAviso } from '../components/ModalEditarCrearAviso'
import { ModalConfirmacion } from '../components/ModalConfirmacion'
import {
  obtenerMetricasAdmin,
  obtenerLogsAuditoria,
  calcularAlcanceAviso,
} from '../services/admin.service'
import {
  obtenerTodosLosAvisosAdmin,
  crearAviso,
  actualizarAviso,
  eliminarAviso,
  desactivarAviso,
  duplicarAviso,
  formatearTiempoAviso,
  CORREO_ADMIN_UNICO,
} from '@/features/avisos/avisos.service'
import type { InstitutionAlert, NuevoAvisoPayload } from '@/features/avisos/avisos.types'
import type { ActivityLogItem, AdminKpis, AlcanceAvisoStat } from '../services/admin.types'

export function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminKpis | null>(null)
  const [avisos, setAvisos] = useState<InstitutionAlert[]>([])
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [cargando, setCargando] = useState(true)

  // Estado para modales
  const [modalAvisoAbierto, setModalAvisoAbierto] = useState(false)
  const [avisoAEditar, setAvisoAEditar] = useState<InstitutionAlert | null>(null)
  const [confirmacionBorrar, setConfirmacionBorrar] = useState<InstitutionAlert | null>(null)
  const [confirmacionDesactivar, setConfirmacionDesactivar] = useState<InstitutionAlert | null>(null)
  const [procesandoAccion, setProcesandoAccion] = useState(false)

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [metricasData, avisosData] = await Promise.all([
        obtenerMetricasAdmin(),
        obtenerTodosLosAvisosAdmin(),
      ])
      setKpis(metricasData)
      setAvisos(avisosData)
      setLogs(obtenerLogsAuditoria().slice(0, 5))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarDatos()

    const alActualizar = () => {
      void cargarDatos()
    }
    window.addEventListener('studenthub:avisos-actualizados', alActualizar)
    window.addEventListener('studenthub:admin-activity-updated', alActualizar)

    return () => {
      window.removeEventListener('studenthub:avisos-actualizados', alActualizar)
      window.removeEventListener('studenthub:admin-activity-updated', alActualizar)
    }
  }, [])

  // Métricas de alcance para gráfico visual
  const statsAlcance: AlcanceAvisoStat[] = useMemo(() => {
    return avisos.slice(0, 4).map((aviso) => calcularAlcanceAviso(aviso, kpis?.totalEstudiantes || 480))
  }, [avisos, kpis])

  // Manejo de guardar aviso (creación o edición)
  const manejarGuardarAviso = async (
    payload: NuevoAvisoPayload & { active?: boolean; id?: string },
  ) => {
    let res
    if (payload.id) {
      res = await actualizarAviso(payload.id, payload, CORREO_ADMIN_UNICO)
    } else {
      res = await crearAviso(payload, CORREO_ADMIN_UNICO)
    }
    if (res.ok) {
      await cargarDatos()
    }
    return res
  }

  // Manejo de eliminación con confirmación
  const confirmarEliminacion = async () => {
    if (!confirmacionBorrar) return
    setProcesandoAccion(true)
    try {
      await eliminarAviso(confirmacionBorrar.id, CORREO_ADMIN_UNICO)
      setConfirmacionBorrar(null)
      await cargarDatos()
    } finally {
      setProcesandoAccion(false)
    }
  }

  // Manejo de forzar expiración / desactivación
  const confirmarDesactivacion = async () => {
    if (!confirmacionDesactivar) return
    setProcesandoAccion(true)
    try {
      await desactivarAviso(confirmacionDesactivar.id, CORREO_ADMIN_UNICO)
      setConfirmacionDesactivar(null)
      await cargarDatos()
    } finally {
      setProcesandoAccion(false)
    }
  }

  // Manejo de duplicar aviso
  const manejarDuplicar = async (id: string) => {
    await duplicarAviso(id, CORREO_ADMIN_UNICO)
    await cargarDatos()
  }

  return (
    <div className="space-y-6">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-micro font-black uppercase tracking-wider text-primary">
            Panel de Control Principal
          </span>
          <h1 className="text-titulo font-black text-text md:text-hero">
            Resumen General de Operaciones
          </h1>
          <p className="text-menor text-text-muted">
            Monitoreo en tiempo real del padrón estudiantil, comunicados activos e incidencias.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setAvisoAEditar(null)
              setModalAvisoAbierto(true)
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95"
          >
            <span>📢</span>
            <span>Nuevo Aviso</span>
          </button>
        </div>
      </div>

      {/* 1. Tarjetas de Resumen Estadístico (KPIs) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cargando || !kpis ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              titulo="Estudiantes Activos"
              valor={kpis.estudiantesActivos}
              descripcion={`De un total de ${kpis.totalEstudiantes} matriculados`}
              icono={<span className="text-xl">🎓</span>}
              cambio={{ valor: '98.2%', positivo: true }}
              colorVariante="primary"
            />
            <StatCard
              titulo="Avisos Vigentes"
              valor={kpis.avisosVigentes}
              descripcion={`${kpis.avisosTotales} emitidos en el ciclo actual`}
              icono={<span className="text-xl">📢</span>}
              cambio={{ valor: `${kpis.avisosVigentes} activos`, positivo: true }}
              colorVariante="emerald"
            />
            <StatCard
              titulo="Incidencias / Reportes"
              valor={kpis.reportesPendientes}
              descripcion="1 comedor, 1 mantenimiento de aulas"
              icono={<span className="text-xl">⚠️</span>}
              cambio={{ valor: 'Controlado', positivo: true }}
              colorVariante="amber"
            />
            <StatCard
              titulo="Acciones Hoy"
              valor={kpis.accionesHoy}
              descripcion="Actividad administrativa registrada"
              icono={<span className="text-xl">⚡</span>}
              cambio={{ valor: '+24h', positivo: true }}
              colorVariante="indigo"
            />
          </>
        )}
      </div>

      {/* 2. Visualización y Alcance de los Últimos Avisos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-dato font-bold text-text sm:text-cuerpo">
                Alcance Estimado de Avisos Recientes
              </h2>
              <p className="text-menuda text-text-muted">
                Porcentaje y volumen de estudiantes receptores según segmentación
              </p>
            </div>
            <Link
              to="/admin/avisos"
              className="text-menuda font-bold text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {statsAlcance.length === 0 ? (
            <div className="py-8 text-center text-menor text-text-muted">
              No hay avisos registrados recientemente.
            </div>
          ) : (
            <div className="space-y-4">
              {statsAlcance.map((stat) => (
                <div key={stat.id} className="rounded-xl border border-border/70 p-3.5 bg-surface-alt/30">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="text-menor font-bold text-text truncate max-w-[280px] sm:max-w-md">
                      {stat.titulo}
                    </span>
                    <span className="text-micro font-bold uppercase rounded-md px-2 py-0.5 border border-border bg-surface text-text-muted">
                      {stat.alcanceTexto}
                    </span>
                  </div>

                  {/* Barra de progreso de alcance */}
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 ease-ui"
                      style={{ width: `${stat.porcentaje}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-menuda text-text-muted">
                    <span>
                      Alcance: <strong className="text-text">{stat.porcentaje}%</strong>
                    </span>
                    <span>
                      ~<strong className="text-text">{stat.destinatariosAprox}</strong> estudiantes objetivo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Feed Rápido de Auditoría */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-dato font-bold text-text">Actividad Reciente</h2>
              <p className="text-menuda text-text-muted">Auditoría en tiempo real</p>
            </div>
            <Link to="/admin/auditoria" className="text-menuda font-bold text-primary hover:underline">
              Historial
            </Link>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-micro">
                  {log.modulo === 'avisos' && '📢'}
                  {log.modulo === 'noticias' && '📰'}
                  {log.modulo === 'estudiantes' && '🎓'}
                  {log.modulo === 'sistema' && '🛡️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-menuda font-semibold text-text line-clamp-1">
                    {log.descripcion}
                  </p>
                  <p className="text-micro text-text-muted">
                    {formatearTiempoAviso(log.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Tabla Interactiva de Gestión de Avisos */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex flex-col gap-2 p-5 border-b border-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-cuerpo font-bold text-text">Gestión Rápida de Avisos Oficiales</h2>
            <p className="text-menuda text-text-muted">
              Últimos comunicados institucionales emitidos en la plataforma
            </p>
          </div>
          <Link
            to="/admin/avisos"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-menuda font-bold text-primary hover:bg-primary-tint transition-all"
          >
            <span>Ver Gestor Completo ({avisos.length})</span>
            <span>→</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-menor border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-alt/40 text-etiqueta font-extrabold uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3">Título / Contenido</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {cargando ? (
                <>
                  <SkeletonTableRow columnas={6} />
                  <SkeletonTableRow columnas={6} />
                  <SkeletonTableRow columnas={6} />
                </>
              ) : avisos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                    No hay avisos registrados actualmente.
                  </td>
                </tr>
              ) : (
                avisos.slice(0, 5).map((aviso) => {
                  const estaActivo =
                    aviso.active && (!aviso.expires_at || new Date(aviso.expires_at) > new Date())

                  return (
                    <tr key={aviso.id} className="hover:bg-surface-alt/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="block font-bold text-text max-w-xs truncate">
                          {aviso.title}
                        </span>
                        <span className="block text-menuda text-text-muted max-w-xs truncate">
                          {aviso.message}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-menuda">
                        <span className="inline-flex items-center gap-1 rounded-md bg-surface-alt px-2 py-0.5 font-medium">
                          {aviso.category === 'early_departure' && '⏰ Salida'}
                          {aviso.category === 'absence' && '👨‍🏫 Ausencia'}
                          {aviso.category === 'menu_change' && '🍽️ Menú'}
                          {aviso.category === 'event' && '📅 Evento'}
                          {aviso.category === 'general' && '📢 General'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-menuda">
                        <span className="rounded-md border border-border px-2 py-0.5 text-micro font-bold">
                          {aviso.target_type === 'all'
                            ? 'Todo el Colegio'
                            : aviso.target_type === 'specialty'
                              ? `Esp: ${aviso.target_values.join(', ')}`
                              : `Sec: ${aviso.target_values.join(', ')}`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-menuda">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            aviso.priority === 'urgent'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                              : aviso.priority === 'warning'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                                : 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                          }`}
                        >
                          {aviso.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-menuda">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-bold ${
                            estaActivo
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-zinc-500/10 text-zinc-500'
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${estaActivo ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          {estaActivo ? 'Activo' : 'Expirado'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAvisoAEditar(aviso)
                            setModalAvisoAbierto(true)
                          }}
                          className="cursor-pointer rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-primary transition-colors"
                          title="Editar comunicado"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => manejarDuplicar(aviso.id)}
                          className="cursor-pointer rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-indigo-600 transition-colors"
                          title="Duplicar comunicado"
                        >
                          📋
                        </button>
                        {estaActivo && (
                          <button
                            type="button"
                            onClick={() => setConfirmacionDesactivar(aviso)}
                            className="cursor-pointer rounded-lg p-1.5 text-text-muted hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                            title="Desactivar / Forzar expiración"
                          >
                            ⏹️
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmacionBorrar(aviso)}
                          className="cursor-pointer rounded-lg p-1.5 text-text-muted hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                          title="Eliminar aviso"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales y Diálogos */}
      <ModalEditarCrearAviso
        abierto={modalAvisoAbierto}
        avisoAEditar={avisoAEditar}
        alCerrar={() => {
          setModalAvisoAbierto(false)
          setAvisoAEditar(null)
        }}
        alGuardar={manejarGuardarAviso}
      />

      <ModalConfirmacion
        abierto={Boolean(confirmacionBorrar)}
        titulo="¿Eliminar este comunicado?"
        mensaje={`Estás a punto de borrar definitivamente "${confirmacionBorrar?.title}". Esta acción es irreversible y dejará de mostrarse en la app de todos los estudiantes.`}
        textoConfirmar="Eliminar Definitivamente"
        variante="danger"
        procesando={procesandoAccion}
        alCerrar={() => setConfirmacionBorrar(null)}
        alConfirmar={confirmarEliminacion}
      />

      <ModalConfirmacion
        abierto={Boolean(confirmacionDesactivar)}
        titulo="¿Forzar expiración de este comunicado?"
        mensaje={`El aviso "${confirmacionDesactivar?.title}" pasará a estado Inactivo/Expirado inmediatamente, ocultándose de la vista de los estudiantes.`}
        textoConfirmar="Desactivar Aviso"
        variante="warning"
        procesando={procesandoAccion}
        alCerrar={() => setConfirmacionDesactivar(null)}
        alConfirmar={confirmarDesactivacion}
      />
    </div>
  )
}
