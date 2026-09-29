import { useEffect, useState, useMemo } from 'react'
import { ModalEditarCrearAviso } from '../components/ModalEditarCrearAviso'
import { ModalConfirmacion } from '../components/ModalConfirmacion'
import { SkeletonTableRow } from '../components/Skeletons'
import {
  obtenerTodosLosAvisosAdmin,
  crearAviso,
  actualizarAviso,
  eliminarAviso,
  desactivarAviso,
  duplicarAviso,
  formatearTiempoAviso,
  CORREO_ADMIN_UNICO,
  ESPECIALIDADES_CTP,
  SECCIONES_CTP,
} from '@/features/avisos/avisos.service'
import type { InstitutionAlert, NuevoAvisoPayload } from '@/features/avisos/avisos.types'

export function AdminAvisosPage() {
  const [avisos, setAvisos] = useState<InstitutionAlert[]>([])
  const [cargando, setCargando] = useState(true)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'expirados'>('todos')
  const [filtroDestino, setFiltroDestino] = useState<string>('todos')

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false)
  const [avisoAEditar, setAvisoAEditar] = useState<InstitutionAlert | null>(null)
  const [confirmacionBorrar, setConfirmacionBorrar] = useState<InstitutionAlert | null>(null)
  const [confirmacionDesactivar, setConfirmacionDesactivar] = useState<InstitutionAlert | null>(null)
  const [procesandoAccion, setProcesandoAccion] = useState(false)

  const cargarAvisos = async () => {
    setCargando(true)
    try {
      const data = await obtenerTodosLosAvisosAdmin()
      setAvisos(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarAvisos()

    const alActualizar = () => {
      void cargarAvisos()
    }
    window.addEventListener('studenthub:avisos-actualizados', alActualizar)
    return () => {
      window.removeEventListener('studenthub:avisos-actualizados', alActualizar)
    }
  }, [])

  // Filtrado reactivo completo
  const avisosFiltrados = useMemo(() => {
    return avisos.filter((aviso) => {
      const ahora = new Date()
      const estaActivo = aviso.active && (!aviso.expires_at || new Date(aviso.expires_at) > ahora)

      // 1. Filtro por búsqueda
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim()
        const coincideTitulo = aviso.title.toLowerCase().includes(query)
        const coincideMensaje = aviso.message.toLowerCase().includes(query)
        if (!coincideTitulo && !coincideMensaje) return false
      }

      // 2. Filtro por categoría
      if (filtroCategoria !== 'todas' && aviso.category !== filtroCategoria) {
        return false
      }

      // 3. Filtro por estado
      if (filtroEstado === 'activos' && !estaActivo) return false
      if (filtroEstado === 'expirados' && estaActivo) return false

      // 4. Filtro por destino (especialidad o sección)
      if (filtroDestino !== 'todos') {
        if (filtroDestino === 'all' && aviso.target_type !== 'all') return false
        if (filtroDestino.startsWith('esp:')) {
          const esp = filtroDestino.replace('esp:', '')
          if (aviso.target_type !== 'specialty' || !aviso.target_values.includes(esp)) {
            return false
          }
        }
        if (filtroDestino.startsWith('sec:')) {
          const sec = filtroDestino.replace('sec:', '')
          if (aviso.target_type !== 'section' || !aviso.target_values.includes(sec)) {
            return false
          }
        }
      }

      return true
    })
  }, [avisos, busqueda, filtroCategoria, filtroEstado, filtroDestino])

  // Guardar (crear / editar)
  const manejarGuardar = async (
    payload: NuevoAvisoPayload & { active?: boolean; id?: string },
  ) => {
    let res
    if (payload.id) {
      res = await actualizarAviso(payload.id, payload, CORREO_ADMIN_UNICO)
    } else {
      res = await crearAviso(payload, CORREO_ADMIN_UNICO)
    }
    if (res.ok) {
      await cargarAvisos()
    }
    return res
  }

  // Eliminar
  const confirmarEliminar = async () => {
    if (!confirmacionBorrar) return
    setProcesandoAccion(true)
    try {
      await eliminarAviso(confirmacionBorrar.id, CORREO_ADMIN_UNICO)
      setConfirmacionBorrar(null)
      await cargarAvisos()
    } finally {
      setProcesandoAccion(false)
    }
  }

  // Desactivar
  const confirmarDesactivar = async () => {
    if (!confirmacionDesactivar) return
    setProcesandoAccion(true)
    try {
      await desactivarAviso(confirmacionDesactivar.id, CORREO_ADMIN_UNICO)
      setConfirmacionDesactivar(null)
      await cargarAvisos()
    } finally {
      setProcesandoAccion(false)
    }
  }

  // Duplicar
  const manejarDuplicar = async (id: string) => {
    await duplicarAviso(id, CORREO_ADMIN_UNICO)
    await cargarAvisos()
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-micro font-black uppercase tracking-wider text-primary">
            Módulo de Difusión Oficial
          </span>
          <h1 className="text-titulo font-black text-text md:text-hero">
            Gestor de Avisos y Alertas Rápidas
          </h1>
          <p className="text-menor text-text-muted">
            Publicación, edición segmentada e historial de avisos para la comunidad estudiantil.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAvisoAEditar(null)
            setModalAbierto(true)
          }}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95"
        >
          <span>➕</span>
          <span>Nuevo Aviso Oficial</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm md:grid-cols-4">
        {/* Buscador */}
        <div className="md:col-span-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Buscar por palabra clave
          </label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar por título o contenido..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Categoría
          </label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary"
          >
            <option value="todas">Todas las categorías</option>
            <option value="early_departure">⏰ Salida Anticipada</option>
            <option value="absence">👨‍🏫 Ausencia Docente</option>
            <option value="menu_change">🍽️ Cambio de Menú</option>
            <option value="event">📅 Evento / Actividad</option>
            <option value="general">📢 Comunicado General</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as 'todos' | 'activos' | 'expirados')}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">🟢 Solo Activos / Vigentes</option>
            <option value="expirados">⚪ Solo Expirados / Inactivos</option>
          </select>
        </div>

        {/* Destino / Segmentación */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Segmentación / Destino
          </label>
          <select
            value={filtroDestino}
            onChange={(e) => setFiltroDestino(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary"
          >
            <option value="todos">Cualquier destino</option>
            <option value="all">🏫 Toda la Institución</option>
            <optgroup label="Especialidades">
              {ESPECIALIDADES_CTP.map((esp) => (
                <option key={esp} value={`esp:${esp}`}>
                  🎓 {esp}
                </option>
              ))}
            </optgroup>
            <optgroup label="Secciones">
              {SECCIONES_CTP.map((sec) => (
                <option key={sec} value={`sec:${sec}`}>
                  👥 Sección {sec}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Tabla Interactiva de Avisos */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-menor border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-alt/40 text-etiqueta font-extrabold uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3.5">Título y Mensaje</th>
                <th className="px-4 py-3.5">Categoría</th>
                <th className="px-4 py-3.5">Destino</th>
                <th className="px-4 py-3.5">Prioridad</th>
                <th className="px-4 py-3.5">Fecha</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {cargando ? (
                <>
                  <SkeletonTableRow columnas={7} />
                  <SkeletonTableRow columnas={7} />
                  <SkeletonTableRow columnas={7} />
                  <SkeletonTableRow columnas={7} />
                </>
              ) : avisosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">🔍</span>
                      <p className="font-bold text-text">No se encontraron avisos</p>
                      <p className="text-menuda">
                        {busqueda || filtroCategoria !== 'todas' || filtroEstado !== 'todos'
                          ? 'Probá ajustando los filtros de búsqueda rápida.'
                          : 'Aún no se ha emitido ningún aviso institucional.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                avisosFiltrados.map((aviso) => {
                  const estaActivo =
                    aviso.active && (!aviso.expires_at || new Date(aviso.expires_at) > new Date())

                  return (
                    <tr key={aviso.id} className="hover:bg-surface-alt/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="block font-bold text-text max-w-sm truncate">
                          {aviso.title}
                        </span>
                        <span className="block text-menuda text-text-muted max-w-sm truncate">
                          {aviso.message}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-menuda whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 font-medium">
                          {aviso.category === 'early_departure' && '⏰ Salida'}
                          {aviso.category === 'absence' && '👨‍🏫 Ausencia'}
                          {aviso.category === 'menu_change' && '🍽️ Menú'}
                          {aviso.category === 'event' && '📅 Evento'}
                          {aviso.category === 'general' && '📢 General'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-menuda whitespace-nowrap">
                        <span className="rounded-lg border border-border bg-surface-alt/50 px-2 py-1 text-micro font-bold text-text">
                          {aviso.target_type === 'all'
                            ? '🏫 Toda la Inst.'
                            : aviso.target_type === 'specialty'
                              ? `🎓 ${aviso.target_values.join(', ')}`
                              : `👥 Sec: ${aviso.target_values.join(', ')}`}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-menuda whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
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

                      <td className="px-4 py-3.5 text-menuda text-text-muted whitespace-nowrap">
                        {formatearTiempoAviso(aviso.created_at)}
                      </td>

                      <td className="px-4 py-3.5 text-menuda whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold ${
                            estaActivo
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${estaActivo ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                          {estaActivo ? 'Activo' : 'Expirado'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setAvisoAEditar(aviso)
                            setModalAbierto(true)
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

        {/* Pie de tabla con conteo */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-menuda text-text-muted">
          <span>Mostrando {avisosFiltrados.length} de {avisos.length} avisos</span>
          <span>Actualización en tiempo real activa</span>
        </div>
      </div>

      {/* Modal de Crear / Editar Aviso */}
      <ModalEditarCrearAviso
        abierto={modalAbierto}
        avisoAEditar={avisoAEditar}
        alCerrar={() => {
          setModalAbierto(false)
          setAvisoAEditar(null)
        }}
        alGuardar={manejarGuardar}
      />

      {/* Modales de Confirmación */}
      <ModalConfirmacion
        abierto={Boolean(confirmacionBorrar)}
        titulo="¿Eliminar definitivamente este aviso?"
        mensaje={`Se eliminará "${confirmacionBorrar?.title}". Esta operación no se puede deshacer y retirará el aviso de todas las pantallas estudiantiles.`}
        textoConfirmar="Eliminar Definitivamente"
        variante="danger"
        procesando={procesandoAccion}
        alCerrar={() => setConfirmacionBorrar(null)}
        alConfirmar={confirmarEliminar}
      />

      <ModalConfirmacion
        abierto={Boolean(confirmacionDesactivar)}
        titulo="¿Forzar expiración de este comunicado?"
        mensaje={`El aviso "${confirmacionDesactivar?.title}" pasará inmediatamente a estado inactivo y no se mostrará más a los estudiantes.`}
        textoConfirmar="Desactivar Aviso"
        variante="warning"
        procesando={procesandoAccion}
        alCerrar={() => setConfirmacionDesactivar(null)}
        alConfirmar={confirmarDesactivar}
      />
    </div>
  )
}
