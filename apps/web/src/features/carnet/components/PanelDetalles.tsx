import { IconoImprimir, IconoSalir } from '@/components/icons'
import { cn } from '@/lib/cn'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="border-b border-border pb-2 last:border-b-0 last:pb-0">
      <span className="mb-0.5 block text-etiqueta tracking-[0.06em] text-text-muted uppercase">
        {etiqueta}
      </span>
      <span className="text-dato font-semibold text-text">{valor}</span>
    </div>
  )
}

function InsigniaEstado({ activo }: { activo: boolean }) {
  if (!activo) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-surface-alt px-3 py-1.5 text-menuda font-semibold text-text-muted">
        Estudiante inactivo
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-menuda font-semibold',
        'bg-[#10b981]/12 text-[#0f9b74] dark:bg-[#10b981]/20 dark:text-[#34d399]',
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-current" />
      </span>
      Estudiante Activo
    </span>
  )
}

type Props = {
  estudiante: Estudiante
  onImprimir: () => void
  onCerrarSesion?: () => void
}

export function PanelDetalles({ estudiante, onImprimir, onCerrarSesion }: Props) {
  return (
    <div
      data-print="ocultar"
      className={cn(
        'w-full max-w-[350px] rounded-lg border border-border bg-surface p-6 elev-md',
        'lg:max-w-none lg:flex-[1.2] lg:p-7',
      )}
    >
      <h3 className="mb-1.5 text-subtitulo font-bold tracking-[-0.01em]">
        Credencial Digital Oficial
      </h3>

      <div className="mb-4.5">
        <InsigniaEstado activo={estudiante.activo} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3">
        <Dato etiqueta="Institución" valor={`${estudiante.institucion} (${estudiante.siglaInstitucion})`} />
        <Dato etiqueta="Especialidad" valor={estudiante.especialidad} />
        <Dato
          etiqueta="Sección / Nivel"
          valor={`${estudiante.grupo} (${estudiante.nivel} — ${estudiante.jornada})`}
        />
        <Dato etiqueta="Vigencia" valor={estudiante.vigencia} />
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onImprimir}
          className={cn(
            'flex w-full cursor-pointer items-center justify-center gap-2 rounded-md',
            'bg-primary-solid px-4 py-3 text-nota font-semibold text-white',
            'shadow-[0_6px_16px_var(--color-primary-tint-strong)]',
            'transition-all duration-250 ease-ui hover:bg-primary-dark active:scale-97',
          )}
        >
          <IconoImprimir className="size-[18px]" />
          Imprimir credencial
        </button>

        {onCerrarSesion && (
          <button
            type="button"
            onClick={onCerrarSesion}
            className={cn(
              'flex w-full cursor-pointer items-center justify-center gap-2 rounded-md',
              'border border-border bg-surface px-4 py-2.5 text-nota font-semibold text-text-muted',
              'transition-all duration-200 hover:border-[#c0392b]/30 hover:bg-[#c0392b]/5 hover:text-[#c0392b] active:scale-98',
            )}
          >
            <IconoSalir className="size-4" />
            Cerrar sesión
          </button>
        )}
      </div>

      <p className="mt-4 text-menuda leading-relaxed text-text-muted">
        Credencial oficial del estudiante. El código QR codifica tu nombre y tu
        sección para validaciones y trámites dentro de la institución.
      </p>
    </div>
  )
}
