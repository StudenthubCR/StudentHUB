import { useState } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { PantallaDeAviso } from '@/components/PantallaDeAviso'
import { IconoAlertaTriangulo, IconoRecargar } from '@/components/icons'

/**
 * PaginaDeError: Error Boundary oficial de React Router.
 * Expone inmediatamente el error real en pantalla (sin esconder detalles en consola),
 * permite copiar el reporte técnico al portapapeles y ofrece forzar un reseteo total
 * de credenciales corruptas en localStorage/sessionStorage.
 */
export function PaginaDeError() {
  const error = useRouteError()
  const [copiado, setCopiado] = useState(false)
  const esNoEncontrada = isRouteErrorResponse(error) && error.status === 404

  const nombreError =
    error instanceof Error
      ? error.name
      : isRouteErrorResponse(error)
        ? `HTTP ${error.status} ${error.statusText}`
        : 'Error en Ruta'

  const mensajeError =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? String(error.data || 'Ruta no encontrada')
        : typeof error === 'string'
          ? error
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : 'Error desconocido en tiempo de ejecución'

  const stackError = error instanceof Error ? error.stack : undefined

  // Registro forense incondicional en consola
  console.error('[StudentHUB Error Boundary Captured]:', {
    nombre: nombreError,
    mensaje: mensajeError,
    stack: stackError,
    error,
    ruta: typeof window !== 'undefined' ? window.location.pathname : '',
  })

  const copiarAlPortapapeles = async () => {
    const reporte = [
      `=== REPORTE DE ERROR STUDENT HUB ===`,
      `Fecha: ${new Date().toISOString()}`,
      `Ruta: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
      `Tipo: ${nombreError}`,
      `Mensaje: ${mensajeError}`,
      `\n--- PILA DE LLAMADAS (STACK) ---`,
      stackError ?? 'No disponible',
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
      setCopiado(true)
      setTimeout(() => setCopiado(false), 3000)
    } catch {
      alert('Por favor selecciona el texto del error manualmente para copiarlo.')
    }
  }

  const forzarReseteoTotal = () => {
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

  // 1. Manejo amigable de rutas 404
  if (esNoEncontrada) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-bg text-text">
        <PantallaDeAviso
          titulo="Esta página no existe"
          descripcion="Puede que la dirección esté mal escrita o que la sección todavía no exista."
          accion={{ texto: 'Ir al inicio', a: '/' }}
        />
      </main>
    )
  }

  // 2. Despliegue forense en pantalla para errores en runtime (Sin ocultar el fallo)
  return (
    <main className="min-h-screen bg-bg text-text p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center font-sans antialiased">
      <div className="w-full max-w-3xl rounded-3xl border border-rose-500/40 bg-surface p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Cabecera de Alerta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5 mb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <IconoAlertaTriangulo className="size-6" />
            </span>
            <div>
              <span className="text-micro font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Diagnóstico Forense de Excepción
              </span>
              <h1 className="text-titulo font-black text-text leading-tight sm:text-hero">
                Se detectó un fallo en la sesión
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
              onClick={forzarReseteoTotal}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-micro font-bold text-white shadow-xs hover:bg-rose-700 transition-all active:scale-95"
              title="Borra la sesión local y redirige a la pantalla de ingreso"
            >
              <span>Forzar Reseteo Total</span>
            </button>
          </div>
        </div>

        {/* Explicación institucional */}
        <p className="text-menor text-text-muted mb-4">
          Ocurrió una excepción durante el procesamiento de la vista. A continuación se presentan los detalles técnicos crudos de la excepción:
        </p>

        {/* Tarjeta con los detalles del error */}
        <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-mono text-micro font-black uppercase text-rose-700 dark:text-rose-300">
              {nombreError}
            </span>
            <button
              type="button"
              onClick={copiarAlPortapapeles}
              className="cursor-pointer rounded-lg bg-surface border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-text hover:bg-surface-alt transition-colors"
            >
              {copiado ? '✓ Copiado al portapapeles' : '📋 Copiar Error al Portapapeles'}
            </button>
          </div>
          <p className="font-mono text-menuda font-bold text-rose-950 dark:text-rose-100 break-words leading-relaxed">
            {mensajeError}
          </p>
        </div>

        {/* Pila de Llamadas Completa (Call Stack) */}
        {stackError && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Pila de llamadas de JavaScript (Call Stack):
            </span>
            <pre className="max-h-60 overflow-auto rounded-xl bg-black/90 p-3 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-tight border border-border">
              {stackError}
            </pre>
          </div>
        )}

        {/* Botones de Navegación de Emergencia */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-micro text-text-muted">
            Si el error persiste, presiona "Forzar Reseteo Total" para iniciar una sesión limpia.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/'
              }}
              className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-micro font-bold text-white shadow-xs hover:bg-primary-dark transition-all active:scale-95"
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
