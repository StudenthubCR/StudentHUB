import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ThemeToggle } from '@/app/layout/ThemeToggle'
import { IconoCerrar, IconoEngranaje, IconoSalir, IconoEscudo } from '@/components/icons'
import { cn } from '@/lib/cn'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import type { PersonalizacionCarnet, PatronFondo, TipoSangre } from '../carnet.estilos'
import { SelectorPersonalizacionCarnet } from './SelectorPersonalizacionCarnet'

type Props = {
  abierto: boolean
  alCerrar: () => void
  estudiante: Estudiante
  onCerrarSesion: () => void
  personalizacion: PersonalizacionCarnet
  onCambiarTema: (temaId: string) => void
  onCambiarPatron: (patron: PatronFondo) => void
  onToggleBrillo: () => void
  onToggleEfecto3d: () => void
  onCambiarInsignia: (insigniaId: string) => void
  onCambiarLema: (lema: string) => void
  onCambiarTipoSangre: (tipoSangre: TipoSangre) => void
  onCambiarContactoEmergencia: (nombre: string, telefono: string) => void
  onRestablecer: () => void
}

export function ModalOpcionesCarnet({
  abierto,
  alCerrar,
  estudiante,
  onCerrarSesion,
  personalizacion,
  onCambiarTema,
  onCambiarPatron,
  onToggleBrillo,
  onToggleEfecto3d,
  onCambiarInsignia,
  onCambiarLema,
  onCambiarTipoSangre,
  onCambiarContactoEmergencia,
  onRestablecer,
}: Props) {
  const [pestana, setPestana] = useState<'estilo' | 'cuenta'>('estilo')

  // Bloquear scroll de fondo y manejar Escape
  useEffect(() => {
    if (!abierto) return
    const scrollOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
    }
    window.addEventListener('keydown', manejarTecla)
    return () => {
      document.body.style.overflow = scrollOriginal
      window.removeEventListener('keydown', manejarTecla)
    }
  }, [abierto, alCerrar])

  if (!abierto) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-opciones"
      className="fixed inset-0 z-[10000] flex items-end justify-center p-0 sm:items-center sm:p-4 animate-fade-in"
    >
      {/* Fondo difuminado completo que cubre toda la pantalla incluyendo la barra inferior */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={alCerrar}
      />

      {/* Contenedor de la ventana modal / bottom sheet en móvil */}
      <div className="relative max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-surface p-5.5 shadow-2xl elev-lg sm:rounded-3xl sm:p-7 animate-slide-up pb-[calc(28px_+_env(safe-area-inset-bottom))] sm:pb-7">
        {/* Píldora táctil indicadora en móviles */}
        <div className="mx-auto -mt-1.5 mb-3 h-1.5 w-12 rounded-full bg-border-strong/70 sm:hidden" />

        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9.5 items-center justify-center rounded-xl bg-primary-tint text-primary">
              <IconoEngranaje className="size-5" />
            </div>
            <div>
              <h3 id="titulo-modal-opciones" className="text-subtitulo font-bold text-text">
                Opciones y Personalización
              </h3>
              <p className="text-menuda text-text-muted">Ajustes visuales y cuenta de estudiante</p>
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

        {/* Pestañas de Navegación */}
        <div className="mt-4 mb-5 flex rounded-xl border border-border bg-surface-alt/60 p-1">
          <button
            type="button"
            onClick={() => setPestana('estilo')}
            className={cn(
              'flex-1 cursor-pointer rounded-lg py-2 text-menor font-bold transition-all',
              pestana === 'estilo'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-muted hover:text-text',
            )}
          >
            🎨 Personalizar Carnet
          </button>
          <button
            type="button"
            onClick={() => setPestana('cuenta')}
            className={cn(
              'flex-1 cursor-pointer rounded-lg py-2 text-menor font-bold transition-all',
              pestana === 'cuenta'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-muted hover:text-text',
            )}
          >
            ⚙️ Cuenta y Ajustes
          </button>
        </div>

        {/* Contenido según pestaña activa */}
        {pestana === 'estilo' ? (
          <div className="animate-fade-in">
            <SelectorPersonalizacionCarnet
              personalizacion={personalizacion}
              onCambiarTema={onCambiarTema}
              onCambiarPatron={onCambiarPatron}
              onToggleBrillo={onToggleBrillo}
              onToggleEfecto3d={onToggleEfecto3d}
              onCambiarInsignia={onCambiarInsignia}
              onCambiarLema={onCambiarLema}
              onCambiarTipoSangre={onCambiarTipoSangre}
              onCambiarContactoEmergencia={onCambiarContactoEmergencia}
              onRestablecer={onRestablecer}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4.5 animate-fade-in">
            {/* Apariencia */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/50 p-3.5">
              <div>
                <span className="block text-dato font-semibold text-text">Tema de la app</span>
                <span className="block text-menuda text-text-muted">Alterna entre modo claro y oscuro</span>
              </div>
              <ThemeToggle />
            </div>

            {/* Información de la cuenta */}
            <div className="rounded-xl border border-border bg-surface-alt/50 p-4">
              <h4 className="mb-2.5 text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
                Ficha del estudiante
              </h4>
              <div className="flex flex-col gap-2 text-menor">
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-text-muted">Nombre:</span>
                  <span className="font-semibold text-text text-right">{estudiante.nombre}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-text-muted">Sección asignada:</span>
                  <span className="font-bold text-primary">{estudiante.grupo}</span>
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
                El código QR de tu carnet codifica tu nombre completo y sección oficial para
                validación dentro del colegio.
              </p>
            </div>

            {/* Botón de cerrar sesión */}
            <div className="border-t border-border pt-3">
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
        )}
      </div>
    </div>,
    document.body,
  )
}
