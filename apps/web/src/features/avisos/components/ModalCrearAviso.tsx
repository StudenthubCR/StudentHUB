import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconoCerrar } from '@/components/icons'
import { cn } from '@/lib/cn'
import { ESPECIALIDADES_CTP, SECCIONES_CTP } from '../avisos.service'
import type { CategoriaAviso, NuevoAvisoPayload, PrioridadAviso, TipoAlcance } from '../avisos.types'

type Props = {
  abierto: boolean
  alCerrar: () => void
  alGuardar: (payload: NuevoAvisoPayload) => Promise<{ ok: boolean }>
}

const CATEGORIAS = [
  { id: 'early_departure', etiqueta: 'Salida Anticipada', icono: '⏰' },
  { id: 'absence', etiqueta: 'Ausencia Docente', icono: '👨‍🏫' },
  { id: 'menu_change', etiqueta: 'Cambio de Menú', icono: '🍽️' },
  { id: 'event', etiqueta: 'Evento / Actividad', icono: '📅' },
  { id: 'general', etiqueta: 'Comunicado General', icono: '📢' },
] as const

const PRIORIDADES = [
  { id: 'info', etiqueta: 'Informativa', badge: 'Normal', color: 'border-blue-500/40 text-blue-600 bg-blue-500/10' },
  { id: 'warning', etiqueta: 'Importante', badge: 'Precaución', color: 'border-amber-500/40 text-amber-600 bg-amber-500/10' },
  { id: 'urgent', etiqueta: 'Urgente', badge: 'Inmediata', color: 'border-rose-500/40 text-rose-600 bg-rose-500/10' },
] as const

export function ModalCrearAviso({ abierto, alCerrar, alGuardar }: Props) {
  const [titulo, setTitulo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [categoria, setCategoria] = useState<CategoriaAviso>('early_departure')
  const [prioridad, setPrioridad] = useState<PrioridadAviso>('warning')
  const [tipoAlcance, setTipoAlcance] = useState<TipoAlcance>('all')
  const [valoresSeleccionados, setValoresSeleccionados] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null)

  useEffect(() => {
    if (!abierto) return
    const scrollOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) alCerrar()
    }
    window.addEventListener('keydown', alPresionar)

    return () => {
      document.body.style.overflow = scrollOriginal
      window.removeEventListener('keydown', alPresionar)
    }
  }, [abierto, guardando, alCerrar])

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
      setErrorValidacion('Por favor completá el título y la descripción del aviso.')
      return
    }

    if (tipoAlcance !== 'all' && valoresSeleccionados.length === 0) {
      setErrorValidacion(
        tipoAlcance === 'specialty'
          ? 'Seleccioná al menos una especialidad técnica para segmentar.'
          : 'Seleccioná al menos una sección específica para segmentar.',
      )
      return
    }

    setGuardando(true)
    try {
      const res = await alGuardar({
        title: titulo.trim(),
        message: mensaje.trim(),
        category: categoria,
        priority: prioridad,
        target_type: tipoAlcance,
        target_values: tipoAlcance === 'all' ? [] : valoresSeleccionados,
      })

      if (res.ok) {
        setTitulo('')
        setMensaje('')
        setValoresSeleccionados([])
        setTipoAlcance('all')
        alCerrar()
      } else {
        setErrorValidacion('No se pudo guardar el aviso.')
      }
    } catch {
      setErrorValidacion('Error al conectar con la base de datos.')
    } finally {
      setGuardando(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-crear-aviso"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => !guardando && alCerrar()}
      />

      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-surface p-4 sm:p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-tint border border-primary/25 text-lg">
              📢
            </span>
            <div>
              <h2
                id="titulo-modal-crear-aviso"
                className="text-subtitulo font-black tracking-tight text-text"
              >
                Publicar Comunicado Oficial
              </h2>
              <p className="text-[11px] font-medium text-text-muted">
                Emisión de alertas operativas con privilegios de Administrador
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            disabled={guardando}
            aria-label="Cerrar formulario"
            className="flex size-8 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-alt text-text-muted hover:text-text disabled:opacity-50"
          >
            <IconoCerrar className="size-4" />
          </button>
        </div>

        {errorValidacion && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-micro font-bold text-rose-600 dark:text-rose-400">
            ⚠️ {errorValidacion}
          </div>
        )}

        <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
          {/* Categoría */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
              1. Categoría
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id)}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all',
                    categoria === cat.id
                      ? 'border-primary bg-primary-tint/60 text-primary font-bold shadow-2xs'
                      : 'border-border bg-surface-alt/60 text-text-muted hover:text-text',
                  )}
                >
                  <span className="text-base">{cat.icono}</span>
                  <span className="text-micro font-semibold truncate">{cat.etiqueta}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de Urgencia */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
              2. Nivel de Urgencia
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORIDADES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPrioridad(p.id)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-xl border text-center cursor-pointer transition-all',
                    prioridad === p.id
                      ? cn(p.color, 'font-bold ring-2 ring-primary/30')
                      : 'border-border bg-surface-alt/40 text-text-muted',
                  )}
                >
                  <span className="text-micro font-bold">{p.etiqueta}</span>
                  <span className="text-[10px] opacity-75">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Título y Mensaje */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
              3. Título del Aviso
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Salida anticipada a las 2:00 PM por capacitación docente"
              maxLength={120}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-dato text-text focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
              4. Contenido Descriptivo
            </label>
            <textarea
              rows={3}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Describí con claridad la indicación, horarios, justificaciones o detalles operativos..."
              maxLength={400}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-dato text-text focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Segmentación de Audiencia */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
              5. Audiencia Destinataria
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2.5">
              {(['all', 'specialty', 'section'] as const).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => {
                    setTipoAlcance(tipo)
                    setValoresSeleccionados([])
                  }}
                  className={cn(
                    'p-2 rounded-xl border text-center cursor-pointer transition-all text-micro font-bold',
                    tipoAlcance === tipo
                      ? 'border-primary bg-primary-tint text-primary'
                      : 'border-border bg-surface-alt/40 text-text-muted',
                  )}
                >
                  {tipo === 'all'
                    ? 'Toda la Institución'
                    : tipo === 'specialty'
                      ? 'Por Especialidad'
                      : 'Por Secciones'}
                </button>
              ))}
            </div>

            {tipoAlcance === 'all' && (
              <p className="rounded-xl bg-surface-alt/50 border border-border/60 p-2.5 text-[11px] text-text-muted flex items-center gap-2">
                <span>🌐</span>
                <span>Este aviso se mostrará a todos los estudiantes y docentes matriculados.</span>
              </p>
            )}

            {tipoAlcance === 'specialty' && (
              <div className="rounded-xl bg-surface-alt/40 border border-border/60 p-2.5 flex flex-wrap gap-1.5">
                {ESPECIALIDADES_CTP.map((esp) => (
                  <button
                    key={esp}
                    type="button"
                    onClick={() => alternarSeleccion(esp)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-all border',
                      valoresSeleccionados.includes(esp)
                        ? 'border-primary bg-primary text-white shadow-2xs'
                        : 'border-border bg-surface text-text-muted hover:text-text',
                    )}
                  >
                    {valoresSeleccionados.includes(esp) ? '✓ ' : '+ '}
                    {esp}
                  </button>
                ))}
              </div>
            )}

            {tipoAlcance === 'section' && (
              <div className="rounded-xl bg-surface-alt/40 border border-border/60 p-2.5 flex flex-wrap gap-1.5">
                {SECCIONES_CTP.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => alternarSeleccion(sec)}
                    className={cn(
                      'rounded-lg px-3 py-1 text-micro font-bold cursor-pointer transition-all border',
                      valoresSeleccionados.includes(sec)
                        ? 'border-primary bg-primary text-white shadow-2xs'
                        : 'border-border bg-surface text-text-muted hover:text-text',
                    )}
                  >
                    {valoresSeleccionados.includes(sec) ? '✓ ' : ''}
                    {sec}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notificación automática inmediata a estudiantes */}
          <div className="rounded-xl border border-primary/25 bg-primary-tint/50 p-3 text-menuda text-text">
            <div className="flex items-center gap-2 font-bold text-primary text-micro">
              <span>🔔</span>
              <span>Notificación automática estudiantil</span>
            </div>
            <p className="mt-0.5 text-[11px] text-text-muted leading-relaxed">
              Al publicar, se enviará una notificación al buzón estudiantil y al sistema operativo/celular de los alumnos destinatarios.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60 mt-1">
            <button
              type="button"
              onClick={alCerrar}
              disabled={guardando}
              className="cursor-pointer rounded-xl border border-border px-4 py-2 text-micro font-bold text-text-muted hover:bg-surface-alt"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="cursor-pointer rounded-xl bg-primary px-5 py-2 text-micro font-bold text-white shadow-xs hover:bg-primary-dark transition-all flex items-center gap-1.5"
            >
              {guardando ? <span>Publicando...</span> : <span>Publicar Comunicado</span>}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
