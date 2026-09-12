import { IconoFlechaDerecha, IconoCodigoQR, IconoEscudo, IconoDispositivo, IconoReloj } from '@/components/icons'

type Props = {
  onAbrirInstalar?: () => void
}

export function HeroExpo({ onAbrirInstalar }: Props) {
  return (
    <section id="hero" className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
      {/* Luces de fondo sutiles */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-96 w-full max-w-5xl rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -right-20 -z-10 size-80 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Badge Expotécnica */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-tint px-3.5 py-1 text-etiqueta sm:text-nota font-bold text-primary shadow-xs animate-fade-in">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>EXPOTÉCNICA 2026</span>
          <span className="text-text-muted">·</span>
          <span className="text-text-muted font-medium">Stand de Innovación Tecnológica</span>
        </div>

        {/* Título Principal */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-text sm:text-5xl lg:text-6xl leading-[1.15]">
          El Ecosistema Digital para <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Colegios Técnicos Profesionales
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-text-muted leading-relaxed">
          Reemplazamos el viejo carnet de papel por una credencial digital interactiva con QR dinámico,
          gestión de filas de comedor y horarios en vivo. Diseñado para funcionar <strong>offline</strong> y
          con <strong>¢0 costo de infraestructura</strong>.
        </p>

        {/* Botones de acción principales */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href="#simulador"
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-nota sm:text-dato font-semibold text-white shadow-md shadow-primary/25 transition-all duration-200 hover:bg-primary-dark hover:scale-[1.02] active:scale-98"
          >
            <span>Probar Simulador Interactivo</span>
            <IconoFlechaDerecha className="size-4" />
          </a>

          <a
            href="#stand-qr"
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-nota sm:text-dato font-semibold text-text shadow-xs transition-all duration-200 hover:border-primary/40 hover:bg-surface-alt active:scale-98"
          >
            <IconoCodigoQR className="size-4 text-primary" />
            <span>Escanear en el Stand</span>
          </a>

          {onAbrirInstalar && (
            <button
              type="button"
              onClick={onAbrirInstalar}
              className="flex sm:hidden items-center gap-2 rounded-full border border-primary/30 bg-primary-tint px-5 py-3 text-nota font-semibold text-primary"
            >
              <IconoDispositivo className="size-4" />
              <span>Instalar PWA</span>
            </button>
          )}
        </div>

        {/* Tarjetas de Métricas de Impacto */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-left">
          <div className="rounded-2xl border border-border/70 bg-surface/80 p-4 shadow-xs backdrop-blur-xs transition-transform hover:-translate-y-0.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary-tint text-primary mb-2">
              <IconoDispositivo className="size-4.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-text">100%</div>
            <div className="text-etiqueta font-bold text-primary uppercase tracking-wider">Offline-First</div>
            <p className="text-menuda text-text-muted mt-0.5">Funciona sin internet en el aula gracias a PWA</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-surface/80 p-4 shadow-xs backdrop-blur-xs transition-transform hover:-translate-y-0.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-2">
              <IconoReloj className="size-4.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-text">&lt; 1 seg</div>
            <div className="text-etiqueta font-bold text-emerald-600 uppercase tracking-wider">Validación QR</div>
            <p className="text-menuda text-text-muted mt-0.5">Agiliza el paso al comedor y portón escolar</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-surface/80 p-4 shadow-xs backdrop-blur-xs transition-transform hover:-translate-y-0.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-2">
              <span className="text-base font-black">¢</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-text">¢0 Costo</div>
            <div className="text-etiqueta font-bold text-amber-600 uppercase tracking-wider">Presupuesto MEP</div>
            <p className="text-menuda text-text-muted mt-0.5">Ahorro anual en plástico y cartulinas de carnet</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-surface/80 p-4 shadow-xs backdrop-blur-xs transition-transform hover:-translate-y-0.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 mb-2">
              <IconoEscudo className="size-4.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-text">Ley 8968</div>
            <div className="text-etiqueta font-bold text-purple-600 uppercase tracking-wider">Privacidad Menores</div>
            <p className="text-menuda text-text-muted mt-0.5">Row Level Security y datos protegidos</p>
          </div>
        </div>
      </div>
    </section>
  )
}
