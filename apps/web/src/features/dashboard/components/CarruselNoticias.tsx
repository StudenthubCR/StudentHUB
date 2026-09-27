import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconoChevron, IconoCerrar } from '@/components/icons'
import { cn } from '@/lib/cn'
import type { Noticia } from '../noticias.fixture'

type Props = {
  noticias: Noticia[]
  className?: string
}

/**
 * Componente compacto de noticias y boletines del CTP.
 *
 * Características principales:
 * - Layout compacto tipo ticker/carrusel horizontal (altura acotada <= 110px).
 * - Scroll suave con soporte táctil, botones de navegación previa/siguiente y rueda.
 * - Tarjetas minimalistas con miniaturas proporcionales y badges discretos.
 * - Modo colapsable a 1 sola línea para usuarios que prefieren máxima discreción.
 * - Modal emergente de detalle accesible al hacer clic en cualquier noticia.
 */
export function CarruselNoticias({ noticias, className }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState<Noticia | null>(null)
  const [colapsado, setColapsado] = useState(false)
  const [puedeScrollIzq, setPuedeScrollIzq] = useState(false)
  const [puedeScrollDer, setPuedeScrollDer] = useState(true)
  const [indiceTicker, setIndiceTicker] = useState(0)

  const total = noticias.length

  // Verificar estado de scroll para habilitar/deshabilitar flechas
  const actualizarBotonesScroll = useCallback(() => {
    const el = contenedorRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setPuedeScrollIzq(scrollLeft > 4)
    setPuedeScrollDer(scrollLeft + clientWidth < scrollWidth - 6)
  }, [])

  useEffect(() => {
    const el = contenedorRef.current
    if (!el) return
    actualizarBotonesScroll()
    el.addEventListener('scroll', actualizarBotonesScroll, { passive: true })
    window.addEventListener('resize', actualizarBotonesScroll)
    return () => {
      el.removeEventListener('scroll', actualizarBotonesScroll)
      window.removeEventListener('resize', actualizarBotonesScroll)
    }
  }, [actualizarBotonesScroll, colapsado, total])

  // Desplazamiento horizontal suave
  const desplazar = (direccion: 'izq' | 'der') => {
    const el = contenedorRef.current
    if (!el) return
    const cantidad = direccion === 'izq' ? -310 : 310
    el.scrollBy({ left: cantidad, behavior: 'smooth' })
  }

  // Ticker automático cuando está colapsado a modo barra de una sola línea
  useEffect(() => {
    if (!colapsado || total <= 1) return
    const id = setInterval(() => {
      setIndiceTicker((prev) => (prev + 1) % total)
    }, 5500)
    return () => clearInterval(id)
  }, [colapsado, total])

  if (total === 0) return null

  const noticiaActivaTicker = noticias[indiceTicker] ?? noticias[0]

  return (
    <>
      <section
        aria-label="Noticias y avisos institucionales"
        className={cn(
          'w-full rounded-2xl border border-border bg-surface/95 transition-all duration-300',
          'shadow-2xs backdrop-blur-xs',
          colapsado ? 'p-2 sm:px-3 sm:py-2' : 'p-2.5 sm:p-3',
          className,
        )}
      >
        {/* Cabecera sutil de la sección */}
        <div className="flex items-center justify-between gap-2 mb-1.5 px-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-alt border border-border/60 text-text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3 text-primary"
                aria-hidden
              >
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8" />
                <path d="M15 18h-5" />
                <path d="M10 6h8v4h-8V6Z" />
              </svg>
            </span>
            <h2 className="text-[11px] font-bold tracking-wider uppercase text-text-muted truncate">
              Noticias del CTP
            </h2>
            <span className="hidden sm:inline-flex items-center rounded-full bg-surface-alt px-1.5 py-0.2 text-[10px] font-medium text-text-muted border border-border/40">
              {total} boletines
            </span>
          </div>

          {/* Controles de navegación y colapsar */}
          <div className="flex items-center gap-1 shrink-0">
            {!colapsado && (
              <>
                <button
                  type="button"
                  onClick={() => desplazar('izq')}
                  disabled={!puedeScrollIzq}
                  aria-label="Ver avisos anteriores"
                  title="Avisos anteriores"
                  className={cn(
                    'flex size-6 sm:size-6.5 cursor-pointer items-center justify-center rounded-lg border border-border',
                    'bg-surface-alt text-text-muted transition-all duration-150',
                    'hover:border-border-strong hover:text-text active:scale-90',
                    !puedeScrollIzq && 'opacity-35 cursor-not-allowed hover:border-border hover:text-text-muted',
                  )}
                >
                  <IconoChevron hacia="izquierda" className="size-3 sm:size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => desplazar('der')}
                  disabled={!puedeScrollDer}
                  aria-label="Ver siguientes avisos"
                  title="Siguientes avisos"
                  className={cn(
                    'flex size-6 sm:size-6.5 cursor-pointer items-center justify-center rounded-lg border border-border',
                    'bg-surface-alt text-text-muted transition-all duration-150',
                    'hover:border-border-strong hover:text-text active:scale-90',
                    !puedeScrollDer && 'opacity-35 cursor-not-allowed hover:border-border hover:text-text-muted',
                  )}
                >
                  <IconoChevron hacia="derecha" className="size-3 sm:size-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setColapsado((prev) => !prev)}
              aria-label={colapsado ? 'Expandir barra de noticias' : 'Minimizar barra de noticias'}
              title={colapsado ? 'Expandir noticias' : 'Minimizar a ticker'}
              className="flex size-6 sm:size-6.5 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-alt text-text-muted transition-all duration-150 hover:border-border-strong hover:text-text active:scale-90"
            >
              <IconoChevron hacia={colapsado ? 'abajo' : 'arriba'} className="size-3 sm:size-3.5" />
            </button>
          </div>
        </div>

        {/* VISTA 1: Modo Colapsado / Ticker de 1 sola línea */}
        {colapsado ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setNoticiaSeleccionada(noticiaActivaTicker)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setNoticiaSeleccionada(noticiaActivaTicker)
              }
            }}
            className="flex items-center justify-between gap-2.5 rounded-xl bg-surface-alt/70 border border-border/50 px-2.5 py-1.5 cursor-pointer hover:bg-surface-alt transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              {noticiaActivaTicker.periodo && (
                <span className="shrink-0 text-[10px] font-bold text-primary bg-primary-tint px-1.5 py-0.5 rounded border border-primary/20">
                  {noticiaActivaTicker.periodo}
                </span>
              )}
              <p className="text-micro font-bold text-text truncate group-hover:text-primary transition-colors">
                {noticiaActivaTicker.titulo}
              </p>
              <span className="hidden md:inline text-[11px] text-text-muted truncate">
                · {noticiaActivaTicker.descripcion}
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-text-muted group-hover:text-text flex items-center gap-0.5">
              <span>Ver detalle</span>
              <span>→</span>
            </span>
          </div>
        ) : (
          /* VISTA 2: Modo Compacto Normal (Carrusel horizontal acotado <= 110px de altura) */
          <div
            ref={contenedorRef}
            className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-0.5 pt-0.5 scroll-smooth snap-x snap-mandatory scrollbar-none"
            style={{ maxHeight: '110px' }}
          >
            {noticias.map((noticia) => (
              <article
                key={noticia.id}
                role="button"
                tabIndex={0}
                onClick={() => setNoticiaSeleccionada(noticia)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setNoticiaSeleccionada(noticia)
                  }
                }}
                className={cn(
                  'group relative flex h-[78px] sm:h-[84px] w-[260px] sm:w-[290px] shrink-0 snap-start cursor-pointer',
                  'items-center gap-2.5 rounded-xl border border-border bg-surface-alt/50 p-2 sm:p-2.5',
                  'transition-all duration-200 hover:border-border-strong hover:bg-surface-alt hover:shadow-2xs active:scale-[0.99]',
                )}
              >
                {/* Miniatura compacta */}
                <div className="relative size-14 sm:size-15 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-black/10">
                  <img
                    src={noticia.imagen}
                    alt={noticia.descripcion}
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-108"
                  />
                </div>

                {/* Textos y Badges */}
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    {noticia.periodo ? (
                      <span className="inline-block rounded bg-surface px-1.5 py-0.5 text-[9.5px] font-bold text-text-muted border border-border/50 truncate">
                        {noticia.periodo}
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-medium text-text-muted">Aviso</span>
                    )}
                    <span className="text-[10px] text-text-muted group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      Abrir ↗
                    </span>
                  </div>

                  <h3 className="text-micro font-bold text-text truncate group-hover:text-primary transition-colors">
                    {noticia.titulo}
                  </h3>
                  <p className="text-[10.5px] text-text-muted line-clamp-1 leading-tight">
                    {noticia.descripcion}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Detalle Completo de la Noticia */}
      {noticiaSeleccionada && (
        <ModalDetalleNoticia
          noticia={noticiaSeleccionada}
          alCerrar={() => setNoticiaSeleccionada(null)}
        />
      )}
    </>
  )
}

/**
 * Modal emergente de detalle para leer el afiche o boletín completo
 */
function ModalDetalleNoticia({
  noticia,
  alCerrar,
}: {
  noticia: Noticia
  alCerrar: () => void
}) {
  // Manejo de tecla Escape y bloqueo de scroll
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
    }
    const scrollOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', alPresionarTecla)

    return () => {
      document.body.style.overflow = scrollOriginal
      window.removeEventListener('keydown', alPresionarTecla)
    }
  }, [alCerrar])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-noticia"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      {/* Fondo difuminado */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={alCerrar}
      />

      {/* Contenedor del Diálogo */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-scale-in">
        {/* Imagen en grande del afiche */}
        <div className="relative aspect-[16/10] w-full bg-black/40 overflow-hidden border-b border-border">
          <img
            src={noticia.imagen}
            alt={noticia.descripcion}
            className="size-full object-cover"
          />
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar detalle de noticia"
            className="absolute top-2.5 right-2.5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-105 active:scale-95"
          >
            <IconoCerrar className="size-4" />
          </button>
        </div>

        {/* Contenido textual */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            {noticia.periodo && (
              <span className="inline-flex items-center rounded-md bg-primary-tint border border-primary/20 px-2 py-0.5 text-micro font-bold text-primary">
                {noticia.periodo}
              </span>
            )}
            <span className="text-micro font-medium text-text-muted">
              Comunicado Oficial CTP
            </span>
          </div>

          <h3
            id="titulo-modal-noticia"
            className="text-subtitulo font-black tracking-tight text-text mb-2 leading-snug"
          >
            {noticia.titulo}
          </h3>

          <p className="text-dato text-text-muted leading-relaxed mb-4">
            {noticia.descripcion}
          </p>

          <div className="flex justify-end pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={alCerrar}
              className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-micro sm:text-dato font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95"
            >
              Cerrar comunicado
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
