import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconoCampana,
  IconoComedor,
  IconoAlertaTriangulo,
  IconoCalendario,
  IconoReloj,
  IconoMegafono,
  IconoCerrar,
} from '@/components/icons'
import type { CategoriaNotificacion } from '../notificaciones.service'

export interface DetalleToastAlerta {
  id: string
  titulo: string
  mensaje: string
  categoria: CategoriaNotificacion
  enlace?: string
}

export function ToastNotificacionFlotante() {
  const [toast, setToast] = useState<DetalleToastAlerta | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const manejarToast = (e: Event) => {
      const detalle = (e as CustomEvent<DetalleToastAlerta>).detail
      if (detalle && detalle.titulo) {
        setToast(detalle)
      }
    }

    window.addEventListener('studenthub:toast-alerta-in-app', manejarToast)
    return () => {
      window.removeEventListener('studenthub:toast-alerta-in-app', manejarToast)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 6500)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  const IconoComponente = (() => {
    switch (toast.categoria) {
      case 'comedor':
        return IconoComedor
      case 'ausencias':
        return IconoAlertaTriangulo
      case 'horarios':
        return IconoCalendario
      case 'agenda':
        return IconoReloj
      case 'noticias':
        return IconoMegafono
      default:
        return IconoCampana
    }
  })()

  const colorClase = (() => {
    switch (toast.categoria) {
      case 'comedor':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
      case 'ausencias':
        return 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
      case 'horarios':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
      case 'agenda':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
      default:
        return 'border-primary/30 bg-primary-tint text-primary'
    }
  })()

  const irAEnlace = () => {
    const destino = toast.enlace || '/'
    setToast(null)
    navigate(destino)
  }

  return (
    <aside
      aria-label="Aviso nuevo"
      className="fixed top-4 right-4 left-4 z-[9999] mx-auto max-w-md sm:left-auto sm:right-6 animate-slide-down"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xl backdrop-blur-md ring-1 ring-black/5">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${colorClase}`}
        >
          <IconoComponente className="size-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-micro font-black uppercase tracking-wider text-primary">
              Nuevo Aviso · {toast.categoria}
            </span>
          </div>
          <p className="mt-0.5 truncate text-menor font-bold text-text">
            {toast.titulo}
          </p>
          <p className="line-clamp-2 text-micro text-text-muted mt-0.5">
            {toast.mensaje}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            {toast.enlace && (
              <button
                type="button"
                onClick={irAEnlace}
                className="cursor-pointer rounded-lg bg-primary px-3 py-1 text-micro font-bold text-white transition-all hover:bg-primary-dark active:scale-95"
              >
                Ver detalle
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              className="cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1 text-micro font-bold text-text-muted hover:text-text transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label="Cerrar notificación flotante"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
        >
          <IconoCerrar className="size-3.5" />
        </button>
      </div>
    </aside>
  )
}
