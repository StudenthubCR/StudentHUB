import {
  IconoFlechaDerecha,
  IconoCodigoQR,
  IconoEscudo,
  IconoDispositivo,
  IconoReloj,
} from '@/components/icons'

type Props = {
  onAbrirInstalar?: () => void
}

export function HeroExpo({ onAbrirInstalar }: Props) {
  const entrarModoDemo = () => {
    localStorage.setItem('studenthub_demo_sesion', 'true')
    window.location.href = '/'
  }

  return (
    <section id="hero" className="relative pt-24 pb-14 sm:pt-32 sm:pb-20 overflow-hidden">
      {/* Luces de fondo sutiles y vibrantes */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-[480px] w-full max-w-6xl rounded-full bg-gradient-to-tr from-primary/20 via-blue-500/15 to-purple-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-48 -right-24 -z-10 size-96 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Badge Expotécnica */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-tint/80 backdrop-blur-md px-4 py-1.5 text-etiqueta sm:text-nota font-bold text-primary shadow-xs animate-fade-in">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
          <span>EXPOTÉCNICA 2026</span>
          <span className="text-text-muted">·</span>
          <span className="text-text-muted font-medium">Stand de Innovación Tecnológica</span>
        </div>

        {/* Título Principal con Gradiente Textual */}
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-text sm:text-5xl lg:text-6xl leading-[1.12]">
          El Ecosistema Digital para <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Colegios Técnicos Profesionales
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-text-muted leading-relaxed">
          Reemplazamos el carnet de papel por una credencial digital interactiva con QR dinámico,
          agenda escolar, filas de comedor y horarios en vivo. Diseñado para funcionar <strong>offline</strong> y
          con <strong>¢0 costo para el MEP</strong>.
        </p>

        {/* CENTRO RÁPIDO PARA JUECES (3 Pasos en 60 Segundos) - Estilo Glassmorphism Premium */}
        <div className="mt-8 mx-auto max-w-3xl rounded-3xl border border-primary/35 bg-surface/75 backdrop-blur-2xl p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)] relative text-left ring-1 ring-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white text-base font-black shadow-sm">
                🎓
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-text leading-tight">
                  Guía de Evaluación Rápida para Jueces
                </h2>
                <p className="text-menuda text-text-muted mt-0.5">
                  Evaluá las 3 dimensiones clave del proyecto en menos de 2 minutos:
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-tint text-primary text-micro font-black uppercase tracking-wider shrink-0 border border-primary/25 shadow-2xs">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>3 Pasos Rápidos</span>
            </span>
          </div>

          {/* 3 Pasos en Botones Interactivos */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Paso 1 */}
            <a
              href="#simulador"
              className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-surface-alt/70 hover:border-primary/50 hover:bg-primary-tint/25 transition-all duration-200 group cursor-pointer shadow-xs hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">🪪</span>
                  <span className="text-micro font-mono font-black text-primary px-2 py-0.5 rounded-md bg-primary-tint border border-primary/20">
                    PASO 1
                  </span>
                </div>
                <h3 className="text-nota font-bold text-text group-hover:text-primary transition-colors">
                  Simulador 3D
                </h3>
                <p className="text-menuda text-text-muted mt-1 leading-snug">
                  Probá los 4 casos guiados: Web, Neón, SOS médico y Comedor.
                </p>
              </div>
              <span className="mt-3.5 text-micro font-bold text-primary flex items-center gap-1">
                <span>Ir al simulador</span>
                <IconoFlechaDerecha className="size-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>

            {/* Paso 2 (CTA Principal Destacado con Gradiente Vibrante) */}
            <button
              type="button"
              onClick={entrarModoDemo}
              className="flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white text-left transition-all duration-200 group cursor-pointer shadow-lg shadow-primary/30 ring-2 ring-white/30 hover:scale-102 active:scale-98 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">⚡</span>
                  <span className="text-micro font-mono font-black text-white bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/30 uppercase tracking-wider">
                    PASO 2 · 1 CLIC
                  </span>
                </div>
                <h3 className="text-nota font-black text-white leading-tight">
                  App Real en Vivo
                </h3>
                <p className="text-menuda text-white/90 mt-1 leading-snug">
                  Abrí Student HUB como estudiante sin esperar ni digitar correos.
                </p>
              </div>
              <span className="mt-3.5 text-micro font-black text-white flex items-center gap-1 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full w-fit">
                <span>Probar ahora</span>
                <IconoFlechaDerecha className="size-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            {/* Paso 3 */}
            <a
              href="#rubrica"
              className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-surface-alt/70 hover:border-primary/50 hover:bg-primary-tint/25 transition-all duration-200 group cursor-pointer shadow-xs hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">📋</span>
                  <span className="text-micro font-mono font-black text-primary px-2 py-0.5 rounded-md bg-primary-tint border border-primary/20">
                    PASO 3
                  </span>
                </div>
                <h3 className="text-nota font-bold text-text group-hover:text-primary transition-colors">
                  Rúbrica & Ley 8968
                </h3>
                <p className="text-menuda text-text-muted mt-1 leading-snug">
                  Consultá el desglose técnico, privacidad de menores y FAQ.
                </p>
              </div>
              <span className="mt-3.5 text-micro font-bold text-primary flex items-center gap-1">
                <span>Ver rúbrica</span>
                <IconoFlechaDerecha className="size-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>
        </div>

        {/* Botones secundarios (Escaneo en Stand & PWA) */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#stand-qr"
            className="flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur-xs px-5 py-2.5 text-nota font-bold text-text shadow-xs transition-all hover:border-primary/50 hover:bg-surface-alt active:scale-98"
          >
            <IconoCodigoQR className="size-4 text-primary" />
            <span>Escanear en Stand con tu Celular</span>
          </a>

          {onAbrirInstalar && (
            <button
              type="button"
              onClick={onAbrirInstalar}
              className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary-tint/80 backdrop-blur-xs px-5 py-2.5 text-nota font-bold text-primary transition-all hover:bg-primary-tint-strong active:scale-98 cursor-pointer"
            >
              <IconoDispositivo className="size-4" />
              <span>Instalar PWA</span>
            </button>
          )}
        </div>

        {/* Tarjetas de Métricas de Impacto con Micro-animación y diseño refinado */}
        <div className="mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4.5 text-left">
          <div className="rounded-3xl border border-border/80 bg-surface/80 p-4.5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
            <div className="flex size-9.5 items-center justify-center rounded-2xl bg-primary-tint text-primary mb-2.5 shadow-2xs">
              <IconoDispositivo className="size-4.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-text tracking-tight">100%</div>
            <div className="text-etiqueta font-bold text-primary uppercase tracking-wider">Offline-First</div>
            <p className="text-menuda text-text-muted mt-0.5">Funciona sin saldo en el aula gracias a PWA</p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-surface/80 p-4.5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/40">
            <div className="flex size-9.5 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 mb-2.5 shadow-2xs">
              <IconoReloj className="size-4.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-text tracking-tight">&lt; 1 seg</div>
            <div className="text-etiqueta font-bold text-emerald-600 uppercase tracking-wider">Validación QR</div>
            <p className="text-menuda text-text-muted mt-0.5">Agiliza el paso al comedor y portón escolar</p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-surface/80 p-4.5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/40">
            <div className="flex size-9.5 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 mb-2.5 shadow-2xs">
              <span className="text-lg font-black leading-none">¢</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-text tracking-tight">¢0 Costo</div>
            <div className="text-etiqueta font-bold text-amber-600 uppercase tracking-wider">Presupuesto MEP</div>
            <p className="text-menuda text-text-muted mt-0.5">Ahorro anual en plástico y cartulinas de carnet</p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-surface/80 p-4.5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-500/40">
            <div className="flex size-9.5 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 mb-2.5 shadow-2xs">
              <IconoEscudo className="size-4.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-text tracking-tight">Ley 8968</div>
            <div className="text-etiqueta font-bold text-purple-600 uppercase tracking-wider">Privacidad Menores</div>
            <p className="text-menuda text-text-muted mt-0.5">Row Level Security y datos encriptados</p>
          </div>
        </div>
      </div>
    </section>
  )
}
