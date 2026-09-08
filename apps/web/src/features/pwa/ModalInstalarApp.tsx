import { useState } from 'react'
import {
  IconoCerrar,
  IconoCompartir,
  IconoDescargar,
  IconoCarnet,
  IconoCalendario,
} from '@/components/icons'
import { usePwaInstall } from './usePwaInstall'

type Props = {
  abierto: boolean
  alCerrar: () => void
}

export function ModalInstalarApp({ abierto, alCerrar }: Props) {
  const { plataforma, esInApp, puedeInstalarDirecto, instalando, instalar } = usePwaInstall()
  const [copiado, setCopiado] = useState(false)

  if (!abierto) return null

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 3000)
    } catch {
      // Fallback
      setCopiado(true)
      setTimeout(() => setCopiado(false), 3000)
    }
  }

  const manejarInstalarDirecto = async () => {
    const ok = await instalar()
    if (ok) {
      alCerrar()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Instalar Student HUB"
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/60 p-0 backdrop-blur-xs sm:items-center sm:p-4 animate-fade-in"
      onClick={alCerrar}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl border border-border bg-surface p-6 shadow-2xl transition-all sm:rounded-3xl sm:p-7 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar ventana de instalación"
          className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-alt text-text-muted transition-colors hover:bg-border/40 hover:text-text"
        >
          <IconoCerrar className="size-4" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-border">
          <div className="relative flex size-13 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
            <img src="/icon-192.png" alt="Student HUB" className="size-11 rounded-xl object-contain" />
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-white ring-2 ring-surface">
              <IconoDescargar className="size-3" />
            </span>
          </div>
          <div>
            <h2 className="text-subtitulo font-bold text-text">Instalar Student HUB</h2>
            <p className="text-menuda text-text-muted">Portal Estudiantil y Carnet Digital</p>
          </div>
        </div>

        {/* Ventajas breves */}
        <div className="my-4 flex items-center justify-around rounded-xl bg-surface-alt/70 p-2.5 text-center">
          <div className="flex flex-col items-center gap-1">
            <IconoCarnet className="size-4 text-primary" />
            <span className="text-micro font-semibold text-text">Carnet Offline</span>
          </div>
          <span className="h-6 w-px bg-border" />
          <div className="flex flex-col items-center gap-1">
            <IconoCalendario className="size-4 text-primary" />
            <span className="text-micro font-semibold text-text">Horarios Rápidos</span>
          </div>
          <span className="h-6 w-px bg-border" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs">⚡</span>
            <span className="text-micro font-semibold text-text">Sin Descargas</span>
          </div>
        </div>

        {/* Contenido según plataforma */}
        <div className="space-y-3.5">
          {esInApp ? (
            /* Alerta para navegadores integrados como WhatsApp o Instagram */
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
              <p className="text-menor font-bold text-amber-700 dark:text-amber-400">
                Estás dentro de WhatsApp o una red social
              </p>
              <p className="mt-1 text-menuda text-text-muted">
                Para poder instalar la app en tu pantalla de inicio, necesitás abrir el enlace en
                Safari (iPhone) o Chrome (Android).
              </p>
              <button
                type="button"
                onClick={copiarEnlace}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-solid px-4 py-2.5 text-menuda font-bold text-white transition-all hover:bg-primary-dark"
              >
                {copiado ? '✓ ¡Enlace copiado! Abrí Safari y pegalo' : '📋 Copiar enlace para Safari / Chrome'}
              </button>
            </div>
          ) : plataforma === 'ios' ? (
            /* Guía súper visual y sencilla para iPhone / iPad en Safari */
            <div className="rounded-2xl border border-primary/20 bg-primary-tint/50 p-4 text-left">
              <p className="mb-3 text-menor font-bold text-primary">
                Solo 2 pasos para instalar en tu iPhone:
              </p>
              <ol className="space-y-3 text-menor text-text">
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white shadow-xs">
                    1
                  </span>
                  <div>
                    <span>
                      Toca el botón <strong className="font-semibold text-primary">Compartir</strong>{' '}
                      <IconoCompartir className="inline size-4 text-primary align-text-bottom" /> abajo en la barra de Safari.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white shadow-xs">
                    2
                  </span>
                  <div>
                    <span>
                      Baja un poco y selecciona{' '}
                      <strong className="font-semibold">"Agregar a pantalla de inicio"</strong>.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white shadow-xs">
                    3
                  </span>
                  <div>
                    <span>
                      Pulsa <strong className="font-semibold">"Agregar"</strong> arriba a la derecha. ¡Listo!
                    </span>
                  </div>
                </li>
              </ol>

              {/* Indicador animado hacia la barra inferior */}
              <div className="mt-4 flex items-center justify-center gap-2 text-micro font-semibold text-primary animate-bounce">
                <span>⬇</span>
                <span>El botón de compartir está abajo en Safari</span>
                <span>⬇</span>
              </div>
            </div>
          ) : (
            /* Guía o botón directo para Android / PC */
            <div>
              {puedeInstalarDirecto ? (
                <button
                  type="button"
                  onClick={manejarInstalarDirecto}
                  disabled={instalando}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-solid px-5 py-3.5 text-menor font-bold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg active:scale-98 disabled:opacity-60"
                >
                  <IconoDescargar className="size-5" />
                  {instalando ? 'Instalando…' : 'Instalar Student HUB ahora'}
                </button>
              ) : (
                <div className="rounded-2xl border border-border bg-surface-alt/70 p-4 text-left">
                  <p className="mb-2 text-menor font-bold text-text">Cómo instalar en Android:</p>
                  <ol className="space-y-2 text-menuda text-text">
                    <li className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                        1
                      </span>
                      <span>
                        Toca los 3 puntos <strong className="font-semibold">(⋮)</strong> arriba a la derecha en Chrome.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                        2
                      </span>
                      <span>
                        Selecciona <strong className="font-semibold">"Instalar aplicación"</strong> o <strong className="font-semibold">"Agregar a la pantalla principal"</strong>.
                      </span>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón secundario */}
        <div className="mt-5 pt-3 border-t border-border text-center">
          <button
            type="button"
            onClick={alCerrar}
            className="cursor-pointer text-nota font-medium text-text-muted hover:text-text"
          >
            Continuar en el navegador por ahora
          </button>
        </div>
      </div>
    </div>
  )
}
