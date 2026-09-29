import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { ESPECIALIDADES_CTP, SECCIONES_CTP } from '@/features/avisos/avisos.service'
import type {
  CategoriaAviso,
  InstitutionAlert,
  NuevoAvisoPayload,
  PrioridadAviso,
  TipoAlcance,
} from '@/features/avisos/avisos.types'

type Props = {
  abierto: boolean
  avisoAEditar?: InstitutionAlert | null
  esAlertaUrgenteRapida?: boolean
  alCerrar: () => void
  alGuardar: (
    payload: NuevoAvisoPayload & { active?: boolean; id?: string },
  ) => Promise<{ ok: boolean; error?: string }>
}

const CATEGORIAS = [
  { id: 'early_departure', etiqueta: 'Salida Anticipada', icono: '⏰' },
  { id: 'absence', etiqueta: 'Ausencia Docente', icono: '👨‍🏫' },
  { id: 'menu_change', etiqueta: 'Cambio de Menú', icono: '🍽️' },
  { id: 'event', etiqueta: 'Evento / Actividad', icono: '📅' },
  { id: 'general', etiqueta: 'Comunicado General', icono: '📢' },
] as const

const PRIORIDADES = [
  { id: 'info', etiqueta: 'Informativa', badge: 'Normal', color: 'border-blue-500/30 text-blue-600 bg-blue-500/10' },
  { id: 'warning', etiqueta: 'Importante', badge: 'Precaución', color: 'border-amber-500/30 text-amber-600 bg-amber-500/10' },
  { id: 'urgent', etiqueta: 'Urgente', badge: 'Crítica / Inmediata', color: 'border-rose-500/30 text-rose-600 bg-rose-500/10' },
] as const

export function ModalEditarCrearAviso({
  abierto,
  avisoAEditar,
  esAlertaUrgenteRapida = false,
  alCerrar,
  alGuardar,
}: Props) {
  const [titulo, setTitulo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [categoria, setCategoria] = useState<CategoriaAviso>('early_departure')
  const [prioridad, setPrioridad] = useState<PrioridadAviso>('warning')
  const [tipoAlcance, setTipoAlcance] = useState<TipoAlcance>('all')
  const [valoresSeleccionados, setValoresSeleccionados] = useState<string[]>([])
  const [fechaExpiracion, setFechaExpiracion] = useState('')
  const [activo, setActivo] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null)

  useEffect(() => {
    if (!abierto) return

    if (avisoAEditar) {
      setTitulo(avisoAEditar.title)
      setMensaje(avisoAEditar.message)
      setCategoria(avisoAEditar.category)
      setPrioridad(avisoAEditar.priority)
      setTipoAlcance(avisoAEditar.target_type)
      setValoresSeleccionados(avisoAEditar.target_values || [])
      setActivo(avisoAEditar.active)
      if (avisoAEditar.expires_at) {
        try {
          const d = new Date(avisoAEditar.expires_at)
          const iso = d.toISOString().slice(0, 16)
          setFechaExpiracion(iso)
        } catch {
          setFechaExpiracion('')
        }
      } else {
        setFechaExpiracion('')
      }
    } else {
      // Nuevo aviso
      setTitulo('')
      setMensaje('')
      setCategoria(esAlertaUrgenteRapida ? 'absence' : 'general')
      setPrioridad(esAlertaUrgenteRapida ? 'urgent' : 'warning')
      setTipoAlcance('all')
      setValoresSeleccionados([])
      setFechaExpiracion('')
      setActivo(true)
    }

    setErrorValidacion(null)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const alEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) alCerrar()
    }
    window.addEventListener('keydown', alEsc)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', alEsc)
    }
  }, [abierto, avisoAEditar, esAlertaUrgenteRapida, guardando, alCerrar])

  if (!abierto) return null

  const alternarSeleccion = (item: string) => {
    setValoresSeleccionados((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    )
  }

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorValidacion(null)

    if (!titulo.trim() || !mensaje.trim()) {
      setErrorValidacion('Por favor completá tanto el título como la descripción del aviso.')
      return
    }

    if (tipoAlcance !== 'all' && valoresSeleccionados.length === 0) {
      setErrorValidacion(
        tipoAlcance === 'specialty'
          ? 'Seleccioná al menos una especialidad técnica para orientar el comunicado.'
          : 'Seleccioná al menos una sección específica para orientar el comunicado.',
      )
      return
    }

    setGuardando(true)
    try {
      let expiresIso: string | null = null
      if (fechaExpiracion.trim()) {
        expiresIso = new Date(fechaExpiracion).toISOString()
      }

      const res = await alGuardar({
        id: avisoAEditar?.id,
        title: titulo.trim(),
        message: mensaje.trim(),
        category: categoria,
        priority: prioridad,
        target_type: tipoAlcance,
        target_values: tipoAlcance === 'all' ? [] : valoresSeleccionados,
        expires_at: expiresIso,
        active: activo,
      })

      if (res.ok) {
        alCerrar()
      } else {
        setErrorValidacion(res.error || 'No se pudo guardar el comunicado.')
      }
    } catch (err: unknown) {
      setErrorValidacion(err instanceof Error ? err.message : 'Error inesperado al guardar.')
    } finally {
      setGuardando(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center p-3.5 sm:p-5"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !guardando && alCerrar()}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col animate-fade-in rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-tint text-primary border border-primary/20 text-lg">
              {esAlertaUrgenteRapida ? '🚨' : avisoAEditar ? '✏️' : '📢'}
            </span>
            <div>
              <h2 className="text-dato font-bold text-text sm:text-cuerpo">
                {avisoAEditar
                  ? 'Editar Comunicado Oficial'
                  : esAlertaUrgenteRapida
                    ? 'Nueva Alerta Urgente Inmediata'
                    : 'Nuevo Aviso Institucional'}
              </h2>
              <p className="text-micro text-text-muted">
                {avisoAEditar
                  ? 'Modificá los detalles y el alcance de este aviso publicado'
                  : 'Difusión en tiempo real hacia los estudiantes'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            disabled={guardando}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorValidacion && (
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-menuda font-medium text-rose-600 dark:text-rose-400">
              ⚠️ {errorValidacion}
            </div>
          )}

          {/* Categoría */}
          <div>
            <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Categoría del Aviso
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIAS.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoria(cat.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-2 text-left text-menuda font-medium transition-all cursor-pointer',
                    categoria === cat.id
                      ? 'border-primary bg-primary-tint text-primary font-bold shadow-2xs'
                      : 'border-border bg-surface text-text hover:border-border-strong hover:bg-surface-alt',
                  )}
                >
                  <span className="text-base">{cat.icono}</span>
                  <span className="truncate">{cat.etiqueta}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Nivel de Prioridad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORIDADES.map((prio) => (
                <button
                  type="button"
                  key={prio.id}
                  onClick={() => setPrioridad(prio.id)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all cursor-pointer',
                    prioridad === prio.id
                      ? 'border-primary ring-2 ring-primary/20 font-bold bg-primary-tint/30 text-text'
                      : 'border-border bg-surface text-text-muted hover:border-border-strong hover:bg-surface-alt',
                  )}
                >
                  <span className="text-menuda font-semibold">{prio.etiqueta}</span>
                  <span className={cn('mt-0.5 rounded-full px-2 py-0.2 text-[10px] border font-bold', prio.color)}>
                    {prio.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label htmlFor="aviso-titulo" className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
              Título del Aviso
            </label>
            <input
              id="aviso-titulo"
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Salida anticipada a la 1:30 PM por reunión docente"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-cuerpo text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="aviso-mensaje" className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
              Descripción o Instrucciones
            </label>
            <textarea
              id="aviso-mensaje"
              rows={3}
              required
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribí los detalles completos que verán los estudiantes en el banner y en sus notificaciones..."
              className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-menor text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          {/* Alcance y Destinatarios */}
          <div>
            <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Destinatarios / Segmentación
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTipoAlcance('all')
                  setValoresSeleccionados([])
                }}
                className={cn(
                  'rounded-xl border p-2 text-center text-menuda font-semibold cursor-pointer transition-all',
                  tipoAlcance === 'all'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-border bg-surface text-text hover:bg-surface-alt',
                )}
              >
                🏫 Todo el Colegio
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoAlcance('specialty')
                  setValoresSeleccionados([])
                }}
                className={cn(
                  'rounded-xl border p-2 text-center text-menuda font-semibold cursor-pointer transition-all',
                  tipoAlcance === 'specialty'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-border bg-surface text-text hover:bg-surface-alt',
                )}
              >
                🎓 Especialidad
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoAlcance('section')
                  setValoresSeleccionados([])
                }}
                className={cn(
                  'rounded-xl border p-2 text-center text-menuda font-semibold cursor-pointer transition-all',
                  tipoAlcance === 'section'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-border bg-surface text-text hover:bg-surface-alt',
                )}
              >
                👥 Por Sección
              </button>
            </div>

            {/* Chips de selección según alcance */}
            {tipoAlcance === 'specialty' && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface-alt/50 p-2.5">
                {ESPECIALIDADES_CTP.map((esp) => {
                  const sel = valoresSeleccionados.includes(esp)
                  return (
                    <button
                      type="button"
                      key={esp}
                      onClick={() => alternarSeleccion(esp)}
                      className={cn(
                        'cursor-pointer rounded-lg px-2.5 py-1 text-micro font-bold transition-all border',
                        sel
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-surface text-text-muted hover:border-border-strong',
                      )}
                    >
                      {sel ? '✓ ' : '+ '}
                      {esp}
                    </button>
                  )
                })}
              </div>
            )}

            {tipoAlcance === 'section' && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface-alt/50 p-2.5">
                {SECCIONES_CTP.map((sec) => {
                  const sel = valoresSeleccionados.includes(sec)
                  return (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => alternarSeleccion(sec)}
                      className={cn(
                        'cursor-pointer rounded-lg px-2.5 py-1 text-micro font-bold transition-all border',
                        sel
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-surface text-text-muted hover:border-border-strong',
                      )}
                    >
                      {sel ? '✓ ' : '+ '}
                      {sec}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Opciones Avanzadas: Expiración y Estado Activo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="aviso-expiracion" className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                Fecha de Expiración (Opcional)
              </label>
              <input
                id="aviso-expiracion"
                type="datetime-local"
                value={fechaExpiracion}
                onChange={(e) => setFechaExpiracion(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menuda text-text outline-none focus:border-primary"
              />
            </div>

            {avisoAEditar && (
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-border bg-surface p-2 hover:bg-surface-alt">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="size-4 text-primary rounded"
                  />
                  <span className="text-menuda font-semibold text-text">
                    Comunicado Activo / Vigente
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Pie de acción */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <button
              type="button"
              disabled={guardando}
              onClick={alCerrar}
              className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-menor font-semibold text-text-muted hover:bg-surface-alt hover:text-text"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="cursor-pointer rounded-xl bg-primary px-5 py-2 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-98 disabled:opacity-50"
            >
              {guardando
                ? 'Guardando...'
                : avisoAEditar
                  ? 'Guardar Cambios'
                  : 'Publicar Inmediatamente'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
