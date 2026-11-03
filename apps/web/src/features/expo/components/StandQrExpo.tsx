import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { IconoCodigoQR, IconoDescargar, IconoCompartir } from '@/components/icons'

type Props = {
  onAbrirInstalar?: () => void
}

export function StandQrExpo({ onAbrirInstalar }: Props) {
  const [urlActual, setUrlActual] = useState('https://studenthub.cr/expo')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrlActual(window.location.href)
    }
  }, [])

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlActual)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    }
  }

  return (
    <section id="stand-qr" className="py-16 sm:py-24 bg-surface-alt/40 border-y border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-primary/20 bg-surface p-6 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Decoración luminosa */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Lado izquierdo: Instrucciones y botones */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-tint border border-primary/20 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-primary">
                <IconoCodigoQR className="size-3.5" />
                <span>Interactúa en Vivo</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-text leading-tight">
                Pruébalo en tu Propio Teléfono
              </h2>

              <p className="text-base text-text-muted leading-relaxed">
                Apunta con la cámara de tu celular al código QR de la derecha. Podrás navegar por el simulador,
                probar el giro 3D de la tarjeta y guardarla en tu pantalla de inicio como una aplicación nativa.
              </p>

              {/* 3 pasos */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-white text-nota font-bold shrink-0">
                    1
                  </span>
                  <span className="text-nota font-medium text-text">
                    Abre la cámara de tu celular (iOS o Android).
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-white text-nota font-bold shrink-0">
                    2
                  </span>
                  <span className="text-nota font-medium text-text">
                    Escanea el código QR que se muestra aquí al lado.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-white text-nota font-bold shrink-0">
                    3
                  </span>
                  <span className="text-nota font-medium text-text">
                    ¡Listo! Navega el portal o instálalo como PWA con un solo toque.
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface-alt px-5 py-2.5 text-nota font-bold text-text hover:border-primary/40 hover:bg-surface shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <IconoCompartir className="size-4 text-primary" />
                  <span>{copiado ? '✓ Enlace Copiado' : 'Copiar Enlace'}</span>
                </button>

                {onAbrirInstalar && (
                  <button
                    type="button"
                    onClick={onAbrirInstalar}
                    className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-nota font-bold text-white hover:bg-primary-dark shadow-md shadow-primary/25 transition-all active:scale-98 cursor-pointer"
                  >
                    <IconoDescargar className="size-4" />
                    <span>Instalar en este Dispositivo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Lado derecho: Tarjeta de QR interactiva grande */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="rounded-3xl border-2 border-primary/20 bg-white p-6 shadow-2xl flex flex-col items-center justify-center">
                <div className="p-2 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <QRCodeSVG
                    value={urlActual}
                    size={200}
                    level="H"
                    includeMargin
                    className="rounded-xl"
                  />
                </div>
                <div className="mt-4 text-center">
                  <span className="text-etiqueta font-bold uppercase tracking-wider text-slate-900 block">
                    Escanea con tu Cámara
                  </span>
                  <span className="text-micro font-mono text-slate-500 mt-0.5 block max-w-[200px] truncate">
                    {urlActual}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
