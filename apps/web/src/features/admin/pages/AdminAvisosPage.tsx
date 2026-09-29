import { useEffect, useState, useMemo } from 'react'
import { ModalEditarCrearAviso } from '../components/ModalEditarCrearAviso'
import { ModalConfirmacion } from '../components/ModalConfirmacion'
import { SkeletonTableRow, SkeletonCard } from '../components/Skeletons'
import {
  IconoMas,
  IconoBuscar,
  IconoEditar,
  IconoDuplicar,
  IconoDetener,
  IconoEliminar,
  IconoColegio,
  IconoBirrete,
  IconoUsuarios,
  IconoReloj,
  IconoComedor,
  IconoCalendario,
  IconoMegafono,
} from '@/components/icons'
import {
  obtenerTodosLosAvisosAdmin,
  crearAviso,
  actualizarAviso,
  eliminarAviso,
  desactivarAviso,
  duplicarAviso,
  formatearTiempoAviso,
  ESPECIALIDADES_CTP,
  SECCIONES_CTP,
} from '@/features/avisos/avisos.service'
import { useAdminAuth } from '../hooks/useAdminAuth'
import type { InstitutionAlert, NuevoAvisoPayload } from '@/features/avisos/avisos.types'

export function AdminAvisosPage() {
  const { email } = useAdminAuth()
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
      res = await actualizarAviso(payload.id, payload, email)
    } else {
      res = await crearAviso(payload, email)
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
      await eliminarAviso(confirmacionBorrar.id, email)
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
      await desactivarAviso(confirmacionDesactivar.id, email)
      setConfirmacionDesactivar(null)
      await cargarAvisos()
    } finally {
      setProcesandoAccion(false)
    }
  }

  // Duplicar
  const manejarDuplicar = async (id: string) => {
    await duplicarAviso(id, email)
    await cargarAvisos()
  }

  // Helper para renderizar categoría con SVG
  const renderCategoriaIcono = (cat: string) => {
    switch (cat) {
      case 'early_departure':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-menuda font-medium text-amber-600 dark:text-amber-400">
            <IconoReloj className="size-3.5" />
            Salida Anticipada
          </span>
        )
      case 'absence':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-menuda font-medium text-blue-600 dark:text-blue-400">
            <IconoBirrete className="size-3.5" />
            Ausencia Docente
          </span>
        )
      case 'menu_change':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-menuda font-medium text-rose-600 dark:text-rose-400">
            <IconoComedor className="size-3.5" />
            Cambio de Menú
          </span>
        )
      case 'event':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-menuda font-medium text-emerald-600 dark:text-emerald-400">
            <IconoCalendario className="size-3.5" />
            Evento
          </span>
        )
      case 'general':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-menuda font-medium text-indigo-600 dark:text-indigo-400">
            <IconoMegafono className="size-3.5" />
            General
          </span>
        )
    }
  }

  // Helper para renderizar destino con SVG
  const renderDestinoBadge = (tipo: string, valores: string[]) => {
    if (tipo === 'all') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-alt/50 px-2 py-1 text-micro font-bold text-text">
          <IconoColegio className="size-3 text-primary" />
          Toda la Institución
        </span>
      )
    }
    if (tipo === 'specialty') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-alt/50 px-2 py-1 text-micro font-bold text-text">
          <IconoBirrete className="size-3 text-primary" />
          {valores.join(', ')}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-alt/50 px-2 py-1 text-micro font-bold text-text">
        <IconoUsuarios className="size-3 text-primary" />
        Sec: {valores.join(', ')}
      </span>
    )
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
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95"
        >
          <IconoMas className="size-4" />
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
          <div className="relative">
            <IconoBuscar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar por título o contenido..."
              className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Categoría
          </label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
          >
            <option value="todas">Todas las categorías</option>
            <option value="early_departure">Salida Anticipada</option>
            <option value="absence">Ausencia Docente</option>
            <option value="menu_change">Cambio de Menú</option>
            <option value="event">Evento / Actividad</option>
            <option value="general">Comunicado General</option>
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
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo Activos / Vigentes</option>
            <option value="expirados">Solo Expirados / Inactivos</option>
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
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
          >
            <option value="todos">Cualquier destino</option>
            <option value="all">Toda la Institución</option>
            <optgroup label="Especialidades">
              {ESPECIALIDADES_CTP.map((esp) => (
                <option key={esp} value={`esp:${esp}`}>
                  {esp}
                </option>
              ))}
            </optgroup>
            <optgroup label="Secciones">
              {SECCIONES_CTP.map((sec) => (
                <option key={sec} value={`sec:${sec}`}>
                  Sección {sec}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Vista Móvil: Tarjetas compactas (< md) */}
      <div className="md:hidden space-y-3">
        {cargando ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : avisosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-muted">
            <div className="flex flex-col items-center gap-2">
              <IconoBuscar className="size-10 text-text-muted/60" />
              <p className="font-bold text-text">No se encontraron avisos</p>
              <p className="text-menuda">
                {busqueda || filtroCategoria !== 'todas' || filtroEstado !== 'todos'
                  ? 'Probá ajustando los filtros de búsqueda rápida.'
                  : 'Aún no se ha emitido ningún aviso institucional.'}
              </p>
            </div>
          </div>
        ) : (
          avisosFiltrados.map((aviso) => {
            const estaActivo =
              aviso.active && (!aviso.expires_at || new Date(aviso.expires_at) > new Date())

            return (
              <div
                key={aviso.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-xs space-y-3"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {renderCategoriaIcono(aviso.category)}
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
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold ${
                      estaActivo
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${estaActivo ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}
                    />
                    {estaActivo ? 'Activo' : 'Expirado'}
                  </span>
                </div>

                {/* Contenido */}
                <div>
                  <h3 className="font-bold text-text text-base leading-snug">{aviso.title}</h3>
                  <p className="mt-1 text-menuda text-text-muted line-clamp-3">{aviso.message}</p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-menuda">
                  <div>{renderDestinoBadge(aviso.target_type, aviso.target_values)}</div>
                  <span className="text-micro text-text-muted">
                    {formatearTiempoAviso(aviso.created_at)}
                  </span>
                </div>

                {/* Acciones Táctiles Accesibles (44px) */}
                <div className="grid grid-cols-4 gap-2 border-t border-border/50 pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAvisoAEditar(aviso)
                      setModalAbierto(true)
                    }}
                    className="flex min-h-[44px] items-center justify-center rounded-xl bg-surface-alt hover:bg-surface-alt/80 text-text transition-colors"
                    title="Editar comunicado"
                  >
                    <IconoEditar className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => manejarDuplicar(aviso.id)}
                    className="flex min-h-[44px] items-center justify-center rounded-xl bg-surface-alt hover:bg-surface-alt/80 text-indigo-600 transition-colors"
                    title="Duplicar comunicado"
                  >
                    <IconoDuplicar className="size-4" />
                  </button>
                  {estaActivo ? (
                    <button
                      type="button"
                      onClick={() => setConfirmacionDesactivar(aviso)}
                      className="flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 transition-colors"
                      title="Desactivar / Forzar expiración"
                    >
                      <IconoDetener className="size-4" />
                    </button>
                  ) : (
                    <div className="flex min-h-[44px] items-center justify-center opacity-30 text-text-muted">
                      <IconoDetener className="size-4" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmacionBorrar(aviso)}
                    className="flex min-h-[44px] items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-colors"
                    title="Eliminar aviso"
                  >
                    <IconoEliminar className="size-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Vista Escritorio: Tabla Interactiva de Avisos (md: en adelante) */}
      <div className="hidden md:block rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
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
                      <IconoBuscar className="size-10 text-text-muted/60" />
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
                        {renderCategoriaIcono(aviso.category)}
                      </td>

                      <td className="px-4 py-3.5 text-menuda whitespace-nowrap">
                        {renderDestinoBadge(aviso.target_type, aviso.target_values)}
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
                          <span
                            className={`size-1.5 rounded-full ${estaActivo ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}
                          />
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
                          <IconoEditar className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => manejarDuplicar(aviso.id)}
                          className="cursor-pointer rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-indigo-600 transition-colors"
                          title="Duplicar comunicado"
                        >
                          <IconoDuplicar className="size-4" />
                        </button>
                        {estaActivo && (
                          <button
                            type="button"
                            onClick={() => setConfirmacionDesactivar(aviso)}
                            className="cursor-pointer rounded-lg p-1.5 text-text-muted hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                            title="Desactivar / Forzar expiración"
                          >
                            <IconoDetener className="size-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmacionBorrar(aviso)}
                          className="cursor-pointer rounded-lg p-1.5 text-text-muted hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                          title="Eliminar aviso"
                        >
                          <IconoEliminar className="size-4" />
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
          <span>
            Mostrando {avisosFiltrados.length} de {avisos.length} avisos
          </span>
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
