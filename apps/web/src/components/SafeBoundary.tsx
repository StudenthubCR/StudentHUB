import { Component, type ErrorInfo, type ReactNode } from 'react'
import { IconoAlertaTriangulo, IconoRecargar } from '@/components/icons'

type Props = {
  nombre?: string
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  mostrarDetalle: boolean
}

/**
 * SafeBoundary: Aislamiento defensivo de fallos a nivel de componente.
 * Si una tarjeta o widget colapsa durante el renderizado, este boundary
 * absorbe el fallo, mantiene el resto del dashboard 100% operativo y
 * ofrece un botón para reintentar el montaje.
 */
export class SafeBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      mostrarDetalle: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error(
      `[StudentHUB SafeBoundary]: Fallo en sección "${this.props.nombre || 'Componente'}":`,
      error,
      errorInfo.componentStack,
    )
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const nombreSeccion = this.props.nombre || 'esta sección'

      return (
        <div
          role="alert"
          aria-live="polite"
          className="my-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-text shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <IconoAlertaTriangulo className="size-4.5" />
              </span>
              <div>
                <p className="text-menor font-bold text-text">
                  No se pudo cargar {nombreSeccion}
                </p>
                <p className="text-micro text-text-muted">
                  El resto de la aplicación continúa funcionando normalmente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-micro font-bold text-white shadow-xs hover:bg-primary-dark transition-all active:scale-95"
              >
                <IconoRecargar className="size-3.5" />
                <span>Reintentar</span>
              </button>

              <button
                type="button"
                onClick={() => this.setState((prev) => ({ mostrarDetalle: !prev.mostrarDetalle }))}
                className="cursor-pointer rounded-xl border border-border bg-surface px-2.5 py-1.5 text-micro font-medium text-text-muted hover:text-text transition-colors"
              >
                {this.state.mostrarDetalle ? 'Ocultar error' : 'Detalles'}
              </button>
            </div>
          </div>

          {this.state.mostrarDetalle && this.state.error && (
            <div className="mt-3 rounded-xl border border-border/60 bg-black/60 p-3 font-mono text-[11px] text-rose-300 overflow-x-auto">
              <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
              {this.state.error.stack && (
                <pre className="mt-1 text-[10px] text-zinc-400 whitespace-pre-wrap leading-tight">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
