import { Component, type ErrorInfo, type ReactNode } from 'react'
import { IconoAlertaTriangulo, IconoRecargar } from '@/components/icons'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
  componentStack: string | null
  copiado: boolean
}

/**
 * ErrorBoundary Global con Diagnóstico Forense en Pantalla.
 * Expone claramente la causa raíz (nombre, mensaje, stack y componentStack)
 * sin ocultar el fallo al usuario, e incluye herramientas de recuperación.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      componentStack: null,
      copiado: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack ?? null })
    console.error('[StudentHUB ErrorBoundary Global Capturado]:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  copiarAlPortapapeles = async () => {
    const error = this.state.error
    const reporte = [
      `=== REPORTE FORENSE DE ERROR STUDENT HUB ===`,
      `Fecha: ${new Date().toISOString()}`,
      `Ruta: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
      `Tipo: ${error?.name ?? 'Desconocido'}`,
      `Mensaje: ${error?.message ?? 'Sin mensaje'}`,
      `\n--- PILA DE LLAMADAS (STACK) ---`,
      error?.stack ?? 'No disponible',
      `\n--- ÁRBOL DE COMPONENTES (COMPONENT STACK) ---`,
      this.state.componentStack ?? 'No disponible',
    ].join('\n')

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(reporte)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = reporte
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      this.setState({ copiado: true })
      setTimeout(() => this.setState({ copiado: false }), 3000)
    } catch {
      alert('No se pudo copiar automáticamente. Por favor seleccioná el texto manualmente.')
    }
  }

  forzarReseteoTotal = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/entrar'
      }
    } catch {
      window.location.href = '/entrar'
    }
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error
      const nombreError = error?.name ?? 'Error de Renderizado'
      const mensajeError = error?.message ?? 'Ocurrió un error inesperado al renderizar la aplicación.'
      const stack = error?.stack ?? ''
      const componentStack = this.state.componentStack ?? ''

      return (
        <main className="min-h-screen bg-bg text-text p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center font-sans">
          <div className="w-full max-w-3xl rounded-3xl border border-rose-500/40 bg-surface p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5 mb-5">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <IconoAlertaTriangulo className="size-6" />
                </span>
                <div>
                  <span className="text-micro font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Diagnóstico de Excepción en Runtime
                  </span>
                  <h1 className="text-titulo font-black text-text leading-tight sm:text-hero">
                    Se detectó un fallo de renderizado
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface-alt px-3.5 py-2 text-micro font-bold text-text hover:bg-border/40 transition-all active:scale-95"
                >
                  <IconoRecargar className="size-3.5 text-primary" />
                  <span>Recargar</span>
                </button>

                <button
                  type="button"
                  onClick={this.forzarReseteoTotal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-micro font-bold text-white shadow-xs hover:bg-rose-700 transition-all active:scale-95"
                >
                  <span>Forzar Reseteo Total</span>
                </button>
              </div>
            </div>

            {/* Mensaje descriptivo */}
            <p className="text-menor text-text-muted mb-4">
              La vista no pudo montarse de forma segura. A continuación se presentan los detalles técnicos exactos para resolverlo:
            </p>

            {/* Ficha Resumida del Error */}
            <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-micro font-black uppercase text-rose-700 dark:text-rose-300">
                  {nombreError}
                </span>
                <button
                  type="button"
                  onClick={this.copiarAlPortapapeles}
                  className="cursor-pointer rounded-lg bg-surface border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-text hover:bg-surface-alt transition-colors"
                >
                  {this.state.copiado ? '✓ Copiado al portapapeles' : '📋 Copiar Error al Portapapeles'}
                </button>
              </div>
              <p className="font-mono text-menuda font-bold text-rose-950 dark:text-rose-100 break-words leading-relaxed">
                {mensajeError}
              </p>
            </div>

            {/* Pila de Llamadas y Árbol de Componentes */}
            <div className="space-y-3">
              {componentStack && (
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Componente exacto donde ocurrió el fallo (Component Stack):
                  </span>
                  <pre className="max-h-40 overflow-auto rounded-xl bg-black/90 p-3 font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-tight border border-border">
                    {componentStack}
                  </pre>
                </div>
              )}

              {stack && (
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Pila de llamadas de JavaScript (Call Stack):
                  </span>
                  <pre className="max-h-52 overflow-auto rounded-xl bg-black/90 p-3 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-tight border border-border">
                    {stack}
                  </pre>
                </div>
              )}
            </div>

            {/* Barra Inferior con Acciones de Retorno */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-micro text-text-muted">
                Para regresar a un estado limpio sin caché residual, utiliza el botón de Reseteo Total.
              </span>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/'
                }}
                className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-micro font-bold text-white shadow-xs hover:bg-primary-dark transition-all active:scale-95"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
