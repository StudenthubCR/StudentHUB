import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { PantallaDeAviso } from '@/components/PantallaDeAviso'
import { AppLayout } from './layout/AppLayout'

/**
 * Lo que se ve cuando una ruta no existe o algo revienta.
 * Captura e instrumenta los detalles forenses del crash en consola y pantalla (modo desarrollo).
 */
export function PaginaDeError() {
  const error = useRouteError()
  const esNoEncontrada = isRouteErrorResponse(error) && error.status === 404

  const mensajeError =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}: ${error.data || 'Ruta no encontrada'}`
        : typeof error === 'string'
          ? error
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : 'Error desconocido'

  const stackError = error instanceof Error ? error.stack : undefined
  const esModoDebug =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'))

  // Registro forense incondicional en consola para trazabilidad técnica
  console.error('[StudentHUB Error Boundary Captured]:', {
    mensaje: mensajeError,
    stack: stackError,
    error,
    ruta: typeof window !== 'undefined' ? window.location.pathname : '',
  })

  const contenido = (
    <div className="flex flex-col items-center">
      <PantallaDeAviso
        titulo={esNoEncontrada ? 'Esta página no existe' : 'Algo se rompió'}
        descripcion={
          esNoEncontrada
            ? 'Puede que la dirección esté mal escrita o que la sección todavía no exista.'
            : 'Tuvimos un problema inesperado. Volvé al inicio e intentá de nuevo.'
        }
        accion={{ texto: 'Ir al inicio', a: '/' }}
      />

      {/* Panel Forense de Depuración (Activo en desarrollo o con ?debug=true) */}
      {!esNoEncontrada && esModoDebug && (
        <div className="mt-6 w-full max-w-2xl rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-left shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2 mb-2">
            <span className="text-micro font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Detalles Forenses del Error (Debug)
            </span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-rose-600 px-2 py-0.5 text-micro font-bold text-white hover:bg-rose-700 transition-colors"
            >
              Recargar aplicación
            </button>
          </div>
          <p className="font-mono text-menuda font-bold text-rose-900 dark:text-rose-200 break-words">
            {mensajeError}
          </p>
          {stackError && (
            <pre className="mt-2.5 max-h-56 overflow-auto rounded-xl bg-black/60 p-3 font-mono text-[11px] text-rose-200/90 leading-relaxed whitespace-pre-wrap">
              {stackError}
            </pre>
          )}
        </div>
      )}
    </div>
  )

  try {
    return <AppLayout>{contenido}</AppLayout>
  } catch {
    // Fallback de emergencia si el propio AppLayout colapsara
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-bg text-text">
        {contenido}
      </main>
    )
  }
}
