import { useState, useRef, useEffect } from 'react'
import { IconoChevron, IconoCheck, IconoUsuario } from '@/components/icons'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { obtenerIniciales } from '@/lib/texto'
import { cn } from '@/lib/cn'

type Props = {
  className?: string
}

export function SelectorEstudianteActivo({ className }: Props) {
  const { rolActivo, estudiantesVinculados, estudianteActivo, seleccionarEstudiante } = useEstudiante()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera
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

  if (rolActivo !== 'encargado' || estudiantesVinculados.length <= 1) {
    return null
  }

  const nombreEstudiante = estudianteActivo?.nombre || 'Seleccionar estudiante'

  return (
    <div ref={contenedorRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`Estudiante activo: ${nombreEstudiante}. Presione para cambiar.`}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5',
          'text-menor font-bold text-text shadow-xs transition-all duration-200',
          'hover:border-primary/40 hover:bg-surface-alt active:scale-95',
          abierto && 'border-primary ring-2 ring-primary/20',
        )}
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[10px] font-black text-primary">
          {estudianteActivo ? obtenerIniciales(estudianteActivo.nombre) : <IconoUsuario className="size-3.5" />}
        </div>
        <span className="max-w-[120px] truncate sm:max-w-[180px] text-nota font-bold">
          {nombreEstudiante}
        </span>
        <IconoChevron
          hacia={abierto ? 'arriba' : 'abajo'}
          className="size-3 text-text-muted transition-transform duration-200"
        />
      </button>

      {abierto && (
        <div
          role="listbox"
          aria-label="Seleccionar estudiante activo"
          className={cn(
            'absolute right-0 mt-2 z-50 w-72 origin-top-right rounded-2xl border border-border',
            'bg-surface p-2 shadow-xl animate-fade-in backdrop-blur-md',
          )}
        >
          <div className="px-3 py-2 border-b border-border/80">
            <p className="text-micro font-bold text-text-muted uppercase tracking-wider">
              Estudiantes a Cargo ({estudiantesVinculados.length})
            </p>
            <p className="text-menuda text-text-muted mt-0.5">
              Seleccioná a quién deseas consultar:
            </p>
          </div>

          <div className="mt-1 flex flex-col gap-1 max-h-64 overflow-y-auto">
            {estudiantesVinculados.map((est) => {
              const esActivo = est.id === estudianteActivo?.id
              return (
                <button
                  key={est.id || est.codigo}
                  type="button"
                  role="option"
                  aria-selected={esActivo}
                  onClick={() => {
                    if (est.id) seleccionarEstudiante(est.id)
                    setAbierto(false)
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl p-2.5 text-left',
                    'transition-all duration-150',
                    esActivo
                      ? 'bg-primary-tint/70 text-primary font-bold'
                      : 'text-text hover:bg-surface-alt',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full text-micro font-black',
                        esActivo
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-surface-alt text-text-muted border border-border',
                      )}
                    >
                      {obtenerIniciales(est.nombre)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-nota font-bold leading-tight text-text">
                        {est.nombre}
                      </p>
                      <p className="truncate text-micro text-text-muted mt-0.5">
                        {est.grupo} • {est.especialidad}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {est.parentesco && (
                      <span className="rounded-md bg-surface-alt px-1.5 py-0.5 text-[10px] font-semibold text-text-muted border border-border/60">
                        {est.parentesco}
                      </span>
                    )}
                    {esActivo && (
                      <IconoCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
                    )}
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
