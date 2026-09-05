import { cn } from '@/lib/cn'
import {
  TEMAS_CARNET,
  PATRONES,
  type PersonalizacionCarnet,
  type PatronFondo,
} from '../carnet.estilos'

type Props = {
  personalizacion: PersonalizacionCarnet
  onCambiarTema: (temaId: string) => void
  onCambiarPatron: (patron: PatronFondo) => void
  onToggleBrillo: () => void
  onRestablecer: () => void
}

export function SelectorPersonalizacionCarnet({
  personalizacion,
  onCambiarTema,
  onCambiarPatron,
  onToggleBrillo,
  onRestablecer,
}: Props) {
  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Selector de Color de Carnet */}
      <div>
        <label className="mb-2 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
          Color y Degradado
        </label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {TEMAS_CARNET.map((tema) => {
            const esActivo = personalizacion.temaId === tema.id
            return (
              <button
                key={tema.id}
                type="button"
                onClick={() => onCambiarTema(tema.id)}
                title={tema.nombre}
                aria-label={`Color ${tema.nombre}`}
                className={cn(
                  'group relative flex aspect-square size-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200',
                  esActivo
                    ? 'scale-110 ring-3 ring-primary ring-offset-2 ring-offset-surface'
                    : 'hover:scale-105 opacity-85 hover:opacity-100',
                )}
                style={{ background: tema.muestra }}
              >
                {esActivo && (
                  <span className="size-2 rounded-full bg-white shadow-sm" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selector de Textura / Patrón de Fondo */}
      <div>
        <label className="mb-2 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
          Textura de Fondo
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PATRONES.map((p) => {
            const esActivo = personalizacion.patron === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onCambiarPatron(p.id)}
                className={cn(
                  'cursor-pointer rounded-xl border px-3 py-2 text-menuda font-semibold transition-all duration-200',
                  esActivo
                    ? 'border-primary bg-primary-solid text-white shadow-sm'
                    : 'border-border bg-surface-alt/70 text-text hover:border-primary/40 hover:bg-surface-alt',
                )}
              >
                {p.nombre}
              </button>
            )
          })}
        </div>
      </div>

      {/* Efecto de Brillo / Holográfico */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/40 p-3">
        <div>
          <span className="block text-menor font-semibold text-text">Resplandor holográfico</span>
          <span className="block text-micro text-text-muted">Añade un halo luminoso alrededor del avatar</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={personalizacion.efectoBrillo}
          onClick={onToggleBrillo}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
            personalizacion.efectoBrillo ? 'bg-primary-solid' : 'bg-border-strong',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
              personalizacion.efectoBrillo ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </button>
      </div>

      {/* Botón de restablecer */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onRestablecer}
          className="cursor-pointer text-menuda font-medium text-text-muted transition-colors hover:text-primary underline underline-offset-4"
        >
          Restablecer a diseño oficial
        </button>
      </div>
    </div>
  )
}
