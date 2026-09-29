import { useEffect, useState, useMemo } from 'react'
import {
  obtenerEstudiantesDirectorio,
  actualizarEstudianteDirectorio,
} from '../services/admin.service'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { ESPECIALIDADES_CTP, SECCIONES_CTP } from '@/features/avisos/avisos.service'
import { SkeletonTableRow, SkeletonCard } from '../components/Skeletons'
import {
  IconoUsuarios,
  IconoBuscar,
  IconoBirrete,
  IconoEditar,
  IconoCerrar,
} from '@/components/icons'
import type { EstudianteDirectorio } from '../services/admin.types'

export function AdminEstudiantesPage() {
  const { email } = useAdminAuth()
  const [estudiantes, setEstudiantes] = useState<EstudianteDirectorio[]>([])
  const [cargando, setCargando] = useState(true)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas')
  const [filtroSeccion, setFiltroSeccion] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')

  // Modal de reasignación
  const [estudianteAEditar, setEstudianteAEditar] = useState<EstudianteDirectorio | null>(null)
  const [nuevaSeccion, setNuevaSeccion] = useState('')
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState<'activo' | 'inactivo'>('activo')
  const [guardando, setGuardando] = useState(false)

  const cargarEstudiantes = async () => {
    setCargando(true)
    try {
      const data = await obtenerEstudiantesDirectorio()
      setEstudiantes(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarEstudiantes()
  }, [])

  // Filtrado de estudiantes
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter((est) => {
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const coincideNombre = est.nombre.toLowerCase().includes(q)
        const coincideCodigo = est.codigo.toLowerCase().includes(q)
        const coincideCedula = est.cedula.toLowerCase().includes(q)
        const coincideCorreo = est.correo.toLowerCase().includes(q)
        if (!coincideNombre && !coincideCodigo && !coincideCedula && !coincideCorreo) {
          return false
        }
      }

      if (filtroEspecialidad !== 'todas' && est.especialidad !== filtroEspecialidad) {
        return false
      }

      if (filtroSeccion !== 'todas' && est.seccion !== filtroSeccion) {
        return false
      }

      if (filtroEstado !== 'todos' && est.estado !== filtroEstado) {
        return false
      }

      return true
    })
  }, [estudiantes, busqueda, filtroEspecialidad, filtroSeccion, filtroEstado])

  const abrirEdicion = (est: EstudianteDirectorio) => {
    setEstudianteAEditar(est)
    setNuevaSeccion(est.seccion)
    setNuevaEspecialidad(est.especialidad)
    setNuevoEstado(est.estado)
  }

  const manejarGuardarReasignacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estudianteAEditar) return

    setGuardando(true)
    try {
      const res = await actualizarEstudianteDirectorio(
        estudianteAEditar.id,
        {
          seccion: nuevaSeccion,
          especialidad: nuevaEspecialidad,
          estado: nuevoEstado,
        },
        email,
      )

      if (res.ok) {
        setEstudianteAEditar(null)
        await cargarEstudiantes()
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-micro font-black uppercase tracking-wider text-primary">
            Supervisión de la Comunidad Estudiantil
          </span>
          <h1 className="text-titulo font-black text-text md:text-hero">
            Directorio y Gestión de Secciones
          </h1>
          <p className="text-menor text-text-muted">
            Consulta del padrón, verificación de matrículas y reasignación ágil de grupos o especialidades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-tint px-3 py-2 text-menuda font-bold text-primary">
            <IconoUsuarios className="size-4" />
            {estudiantes.length} Estudiantes Registrados
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Buscar estudiante
          </label>
          <div className="relative">
            <IconoBuscar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Por nombre, cédula o código..."
              className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Especialidad
          </label>
          <select
            value={filtroEspecialidad}
            onChange={(e) => setFiltroEspecialidad(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
          >
            <option value="todas">Todas las especialidades</option>
            {ESPECIALIDADES_CTP.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Sección
          </label>
          <select
            value={filtroSeccion}
            onChange={(e) => setFiltroSeccion(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
          >
            <option value="todas">Todas las secciones</option>
            {SECCIONES_CTP.map((sec) => (
              <option key={sec} value={sec}>
                Sección {sec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Estado de Matrícula
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as 'todos' | 'activo' | 'inactivo')}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos / Trasladados</option>
          </select>
        </div>
      </div>

      {/* Vista Móvil: Tarjetas apiladas (< md) */}
      <div className="md:hidden space-y-3">
        {cargando ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : estudiantesFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-muted">
            <div className="flex flex-col items-center gap-2">
              <IconoUsuarios className="size-10 text-text-muted/60" />
              <p className="font-bold text-text">No se encontraron estudiantes</p>
              <p className="text-menuda">
                {busqueda || filtroEspecialidad !== 'todas' || filtroSeccion !== 'todas' || filtroEstado !== 'todos'
                  ? 'Probá ajustando los filtros de búsqueda.'
                  : 'No hay registros disponibles en la base de datos.'}
              </p>
            </div>
          </div>
        ) : (
          estudiantesFiltrados.map((est) => (
            <div
              key={est.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-text text-base">{est.nombre}</h3>
                  <p className="text-menuda text-text-muted">{est.correo}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold shrink-0 ${
                    est.estado === 'activo'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${est.estado === 'activo' ? 'bg-emerald-500' : 'bg-zinc-400'}`}
                  />
                  {est.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-menuda pt-1">
                <div className="rounded-xl border border-border bg-surface-alt/40 p-2">
                  <span className="block text-micro font-semibold uppercase text-text-muted">Cédula / Carnet</span>
                  <span className="font-mono font-bold text-text">{est.cedula || est.codigo}</span>
                </div>
                <div className="rounded-xl border border-border bg-surface-alt/40 p-2">
                  <span className="block text-micro font-semibold uppercase text-text-muted">Sección</span>
                  <span className="font-bold text-primary">{est.seccion}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-alt/20 p-2 text-menuda flex items-center gap-2">
                <IconoBirrete className="size-4 text-primary shrink-0" />
                <span className="font-medium text-text truncate">{est.especialidad}</span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => abrirEdicion(est)}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-menor font-bold text-primary hover:bg-primary hover:text-white transition-all active:scale-98"
                >
                  <IconoEditar className="size-4" />
                  <span>Reasignar Grupo / Estado</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista Escritorio: Tabla del Directorio (md: en adelante) */}
      <div className="hidden md:block rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-menor border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-alt/40 text-etiqueta font-extrabold uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3.5">Estudiante</th>
                <th className="px-4 py-3.5">Cédula / Carnet</th>
                <th className="px-4 py-3.5">Especialidad</th>
                <th className="px-4 py-3.5">Sección</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {cargando ? (
                <>
                  <SkeletonTableRow columnas={6} />
                  <SkeletonTableRow columnas={6} />
                  <SkeletonTableRow columnas={6} />
                  <SkeletonTableRow columnas={6} />
                </>
              ) : estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <IconoUsuarios className="size-10 text-text-muted/60" />
                      <p className="font-bold text-text">No se encontraron estudiantes</p>
                      <p className="text-menuda">
                        {busqueda || filtroEspecialidad !== 'todas' || filtroSeccion !== 'todas' || filtroEstado !== 'todos'
                          ? 'Probá ajustando los filtros de búsqueda.'
                          : 'No hay registros disponibles en la base de datos.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((est) => (
                  <tr key={est.id} className="hover:bg-surface-alt/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="block font-bold text-text">{est.nombre}</span>
                      <span className="block text-micro text-text-muted">{est.correo}</span>
                    </td>
                    <td className="px-4 py-3.5 text-menuda font-mono text-text-muted">
                      {est.cedula || est.codigo}
                    </td>
                    <td className="px-4 py-3.5 text-menuda">
                      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 font-medium text-text">
                        <IconoBirrete className="size-3 text-primary" />
                        {est.especialidad}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-menuda">
                      <span className="rounded-md bg-primary-tint px-2 py-0.5 font-bold text-primary">
                        {est.seccion}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-menuda">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold ${
                          est.estado === 'activo'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${est.estado === 'activo' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        {est.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => abrirEdicion(est)}
                        className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1 text-menuda font-bold text-primary hover:border-primary/40 hover:bg-primary-tint transition-all"
                      >
                        Reasignar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reasignar Estudiante (Mobile Bottom Sheet / Centered Desktop) */}
      {estudianteAEditar && (
        <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setEstudianteAEditar(null)}
          />
          <div className="relative w-full max-w-md animate-fade-in rounded-t-3xl sm:rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-dato font-bold text-text">Reubicación de Estudiante</h3>
                <p className="text-micro text-text-muted">{estudianteAEditar.nombre}</p>
              </div>
              <button
                type="button"
                onClick={() => setEstudianteAEditar(null)}
                className="flex size-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-text-muted hover:bg-surface-alt transition-colors"
                aria-label="Cerrar modal"
              >
                <IconoCerrar className="size-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardarReasignacion} className="space-y-4">
              <div>
                <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                  Sección Asignada
                </label>
                <select
                  value={nuevaSeccion}
                  onChange={(e) => setNuevaSeccion(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
                >
                  {SECCIONES_CTP.map((sec) => (
                    <option key={sec} value={sec}>
                      Sección {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                  Especialidad Técnica
                </label>
                <select
                  value={nuevaEspecialidad}
                  onChange={(e) => setNuevaEspecialidad(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
                >
                  {ESPECIALIDADES_CTP.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                  Estado del Estudiante
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNuevoEstado('activo')}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border p-2 text-menuda font-bold cursor-pointer transition-all ${
                      nuevoEstado === 'activo'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-border text-text-muted'
                    }`}
                  >
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Activo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNuevoEstado('inactivo')}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border p-2 text-menuda font-bold cursor-pointer transition-all ${
                      nuevoEstado === 'inactivo'
                        ? 'border-zinc-500 bg-zinc-500/10 text-zinc-600'
                        : 'border-border text-text-muted'
                    }`}
                  >
                    <span className="size-2 rounded-full bg-zinc-400" />
                    <span>Inactivo / Traslado</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setEstudianteAEditar(null)}
                  className="min-h-[44px] cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-menor font-semibold text-text-muted hover:bg-surface-alt transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="min-h-[44px] cursor-pointer rounded-xl bg-primary px-5 py-2 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-98 disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Aplicar Reubicación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
