import { useCallback, useEffect, useRef, useState } from 'react'
import { IconoChevron } from '@/components/icons'
import { cn } from '@/lib/cn'
import type { Noticia } from '../noticias.fixture'

const INTERVALO = 8000
const UMBRAL_DESLIZAR = 40

const BOTON =
  'absolute top-1/2 z-10 flex size-[38px] -translate-y-1/2 cursor-pointer items-center ' +
  'justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-[6px] ' +
  'shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition-all duration-200 ' +
  'hover:scale-108 hover:bg-black/70 active:scale-92 md:size-[42px]'

export function CarruselNoticias({ noticias }: { noticias: Noticia[] }) {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const inicioDelDedo = useRef<number | null>(null)

  const total = noticias.length

  // Con la forma funcional de setState. Si `siguiente` leyera `actual` del
  // closure, dos clics seguidos en la flecha —o dos deslizadas rápidas—
  // partirían del mismo índice y sólo avanzaría uno.
  const ir = useCallback((indice: number) => setActual(((indice % total) + total) % total), [total])
  const siguiente = useCallback(() => setActual((indice) => (indice + 1) % total), [total])
  const anterior = useCallback(() => setActual((indice) => (indice - 1 + total) % total), [total])

  useEffect(() => {
    if (total <= 1 || pausado) return

    // Un carrusel que gira solo es justo lo que molesta a quien pidió menos
    // movimiento, así que con reduced-motion no arranca.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const temporizador = window.setInterval(
      () => setActual((indice) => (indice + 1) % total),
      INTERVALO,
    )
    return () => window.clearInterval(temporizador)
  }, [total, pausado, actual])

  // Con la pestaña oculta no hay nadie viendo: no tiene sentido seguir girando.
  useEffect(() => {
    const alCambiarVisibilidad = () => setPausado(document.hidden)
    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    return () => document.removeEventListener('visibilitychange', alCambiarVisibilidad)
  }, [])

  if (total === 0) return null

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Noticias destacadas"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onKeyDown={(evento) => {
        if (evento.key === 'ArrowRight') siguiente()
        if (evento.key === 'ArrowLeft') anterior()
      }}
      onPointerDown={(evento) => {
        inicioDelDedo.current = evento.clientX
      }}
      onPointerUp={(evento) => {
        const inicio = inicioDelDedo.current
        inicioDelDedo.current = null
        if (inicio === null) return
        const recorrido = evento.clientX - inicio
        if (Math.abs(recorrido) < UMBRAL_DESLIZAR) return
        if (recorrido < 0) siguiente()
        else anterior()
      }}
      className={
        'relative w-full overflow-hidden rounded-lg border border-border bg-surface elev-md ' +
        'md:mx-auto md:max-w-[440px] lg:max-w-[430px] xl:mx-0'
      }
    >
      {/* Las imágenes son cuadradas (1024×1024). Fijar la proporción evita que
          la página salte mientras cargan. */}
      <div className="relative aspect-square w-full touch-pan-y">
        {noticias.map((noticia, indice) => (
          <figure
            key={noticia.id}
            aria-hidden={indice !== actual}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              indice === actual ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {noticia.periodo && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/60 px-3 py-1 text-etiqueta font-semibold text-white backdrop-blur-md shadow-md">
                <span className="text-xs" aria-hidden>📅</span>
                <span>{noticia.periodo}</span>
              </div>
            )}
            <img
              src={noticia.imagen}
              alt={noticia.descripcion}
              width={900}
              height={900}
              draggable={false}
              loading={indice === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={indice === 0 ? 'high' : 'low'}
              className="size-full object-cover"
            />
            <figcaption
              className={
                'absolute right-3 bottom-10 left-3 flex items-center justify-center rounded-md ' +
                'border border-white/15 bg-[rgba(12,21,56,0.72)] px-4 py-2.5 text-center ' +
                'text-dato font-bold tracking-[0.2px] text-white backdrop-blur-[14px] ' +
                'shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:text-cuerpo'
              }
            >
              {noticia.titulo}
            </figcaption>
          </figure>
        ))}
      </div>

      {total > 1 && (
        <>
          <button type="button" onClick={anterior} aria-label="Noticia anterior" className={cn(BOTON, 'left-3')}>
            <IconoChevron hacia="izquierda" className="size-5" />
          </button>
          <button type="button" onClick={siguiente} aria-label="Noticia siguiente" className={cn(BOTON, 'right-3')}>
            <IconoChevron hacia="derecha" className="size-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-[7px]">
            {noticias.map((noticia, indice) => (
              <button
                key={noticia.id}
                type="button"
                onClick={() => ir(indice)}
                aria-label={`Ir a la noticia ${indice + 1} de ${total}`}
                aria-current={indice === actual}
                className={cn(
                  'h-[7px] cursor-pointer rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.45)]',
                  'transition-[width,background-color] duration-350 ease-soft',
                  indice === actual ? 'w-[22px] bg-white' : 'w-[7px] bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
