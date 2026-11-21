import { useState, useRef, useEffect } from 'react'
import { IconoBirrete, IconoUsuarios, IconoEscudo, IconoChevron } from '@/components/icons'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import type { ModoPerspectiva } from '@/features/estudiante/estudiante.fixture'
import { cn } from '@/lib/cn'

type Props = {
  className?: string
  variante?: 'dropdown' | 'tabs'
}

export function SelectorPerspectiva({ className, variante = 'dropdown' }: Props) {
  const { perspectiva, cambiarPerspectiva } = useEstudiante()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const handleClickFuera = (e: MouseEvent | TouchEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }

    document.addEventListener('mousedown', handleClickFuera)
    document.addEventListener('touchstart', handleClickFuera)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickFuera)
      document.removeEventListener('touchstart', handleClickFuera)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [abierto])

  const opciones: {
    modo: ModoPerspectiva
    etiqueta: string
    subtitulo: string
    Icono: typeof IconoUsuarios
    clase: string
  }[] = [
    {
      modo: 'ambos',
      etiqueta: 'Familia',
      subtitulo: 'Estudiante y encargado juntos',
      Icono: IconoUsuarios,
      clase: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    },
    {
      modo: 'estudiante',
      etiqueta: 'Estudiante',
      subtitulo: 'Vista para el alumno en el colegio',
      Icono: IconoBirrete,
      clase: 'text-primary bg-primary-tint border-primary/25',
    },
    {
      modo: 'encargado',
      etiqueta: 'Encargado',
      subtitulo: 'Supervisión y acompañamiento familiar',
      Icono: IconoEscudo,
      clase: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    },
  ]

  const activa = opciones.find((o) => o.modo === perspectiva) || opciones[0]

  if (variante === 'tabs') {
    return (
      <div
        role="tablist"
        aria-label="Seleccionar perspectiva de visualización familiar"
        className={cn(
          'inline-flex items-center gap-1 rounded-2xl border border-border bg-surface-alt/70 p-1 backdrop-blur-xs',
          className,
        )}
      >
        {opciones.map((op) => {
          const seleccionada = op.modo === perspectiva
          const Icono = op.Icono
          return (
            <button
              key={op.modo}
              type="button"
              role="tab"
              aria-selected={seleccionada}
              onClick={() => cambiarPerspectiva(op.modo)}
              title={op.subtitulo}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-menor font-bold transition-all duration-200 active:scale-95',
                seleccionada
                  ? 'bg-surface text-text shadow-xs ring-1 ring-border'
                  : 'text-text-muted hover:text-text hover:bg-surface/50',
              )}
            >
              <Icono className="size-4 shrink-0" aria-hidden="true" />
              <span>{op.etiqueta}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const IconoActiva = activa.Icono

  return (
    <div ref={contenedorRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`Perspectiva activa: ${activa.etiqueta}. Presione para cambiar.`}
        title="Cambiar perspectiva de visualización"
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-micro font-bold shadow-2xs transition-all duration-200',
          'hover:border-primary/40 hover:bg-surface-alt active:scale-95',
          abierto && 'ring-2 ring-primary/20 border-primary',
        )}
      >
        <span className={cn('flex size-5 items-center justify-center rounded-full border', activa.clase)}>
          <IconoActiva className="size-3" />
        </span>
        <span className="hidden sm:inline font-bold text-text">{activa.etiqueta}</span>
        <IconoChevron
          hacia={abierto ? 'arriba' : 'abajo'}
          className="size-2.5 text-text-muted transition-transform duration-200"
        />
      </button>

      {abierto && (
        <div
          role="listbox"
          aria-label="Perspectiva de la aplicación"
          className="absolute right-0 mt-2 z-50 w-64 origin-top-right rounded-2xl border border-border bg-surface p-1.5 shadow-xl animate-fade-in backdrop-blur-md"
        >
          <div className="px-3 py-2 border-b border-border/80">
            <p className="text-micro font-bold text-text-muted uppercase tracking-wider">
              Perspectiva de Visualización
            </p>
            <p className="text-menuda text-text-muted mt-0.5">
              Adapta la redacción manteniendo el 100% de la información:
            </p>
          </div>
          <div className="p-1 space-y-1">
            {opciones.map((op) => {
              const esActivo = op.modo === perspectiva
              const Icono = op.Icono
              return (
                <button
                  key={op.modo}
                  type="button"
                  role="option"
                  aria-selected={esActivo}
                  onClick={() => {
                    cambiarPerspectiva(op.modo)
                    setAbierto(false)
                  }}
                  className={cn(
                    'w-full flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer',
                    esActivo ? 'bg-primary-tint/60 text-text' : 'hover:bg-surface-alt text-text-muted hover:text-text',
                  )}
                >
                  <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-lg border mt-0.5', op.clase)}>
                    <Icono className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-menor font-bold text-text">{op.etiqueta}</p>
                    <p className="text-micro text-text-muted line-clamp-1">{op.subtitulo}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
