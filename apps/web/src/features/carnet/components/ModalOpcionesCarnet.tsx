import { useEffect } from 'react'
import { ThemeToggle } from '@/app/layout/ThemeToggle'
import { IconoCerrar, IconoEngranaje, IconoSalir, IconoEscudo } from '@/components/icons'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'

type Props = {
  abierto: boolean
  alCerrar: () => void
  estudiante: Estudiante
  onCerrarSesion: () => void
}

export function ModalOpcionesCarnet({ abierto, alCerrar, estudiante, onCerrarSesion }: Props) {
  // Cerrar modal al presionar Escape
  useEffect(() => {
    if (!abierto) return
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [abierto, alCerrar])

  if (!abierto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-opciones"
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
    >
      {/* Fondo difuminado con clic para cerrar */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
        onClick={alCerrar}
      />

      {/* Contenedor de la ventana modal */}
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-border bg-surface p-6 shadow-2xl elev-lg sm:p-7">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary-tint text-primary">
              <IconoEngranaje className="size-5" />
            </div>
            <div>
              <h3 id="titulo-modal-opciones" className="text-subtitulo font-bold text-text">
                Opciones y Configuración
              </h3>
              <p className="text-menuda text-text-muted">Ajustes de tu carnet y cuenta</p>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar ventana de opciones"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
          >
            <IconoCerrar className="size-4" />
          </button>
        </div>

        {/* Cuerpo con secciones */}
        <div className="my-5 flex flex-col gap-4.5">
          {/* Apariencia */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/50 p-3.5">
            <div>
              <span className="block text-dato font-semibold text-text">Tema visual</span>
              <span className="block text-menuda text-text-muted">Cambia entre modo claro y oscuro</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Información de la cuenta */}
          <div className="rounded-xl border border-border bg-surface-alt/50 p-4">
            <h4 className="mb-2.5 text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
              Datos del estudiante
            </h4>
            <div className="flex flex-col gap-2 text-menor">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-text-muted">Nombre:</span>
                <span className="font-semibold text-text text-right">{estudiante.nombre}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-text-muted">Sección activa:</span>
                <span className="font-semibold text-primary">{estudiante.grupo}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-text-muted">ID Estudiantil:</span>
                <span className="font-semibold text-text">{estudiante.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Especialidad:</span>
                <span className="font-semibold text-text text-right">{estudiante.especialidad}</span>
              </div>
            </div>
          </div>

          {/* Validación QR */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-primary-tint/30 p-3 text-menuda text-text">
            <IconoEscudo className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              El código QR en tu carnet codifica tu nombre completo y tu sección para validación en
              el colegio.
            </p>
          </div>
        </div>

        {/* Botón de cerrar sesión */}
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => {
              alCerrar()
              onCerrarSesion()
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#c0392b]/30 bg-[#c0392b]/10 py-3 text-menor font-bold text-[#c0392b] transition-all duration-200 hover:bg-[#c0392b]/20 active:scale-[0.98] dark:border-[#ff8a80]/30 dark:bg-[#ff8a80]/10 dark:text-[#ff8a80]"
          >
            <IconoSalir className="size-4" />
            <span>Cerrar sesión en este dispositivo</span>
          </button>
        </div>
      </div>
    </div>
  )
}
