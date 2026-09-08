import { useState } from 'react'
import { ThemeToggle } from '@/app/layout/ThemeToggle'
import { useSesion } from '@/features/auth/useSesion'
import { usePwaInstall } from './usePwaInstall'
import {
  IconoDescargar,
  IconoCompartir,
  IconoCarnet,
  IconoComedor,
  IconoCalendario,
  IconoSalir,
} from '@/components/icons'

export function PantallaInstalacionObligatoria() {
  const { cerrarSesion } = useSesion()
  const {
    plataforma,
    esInApp,
    puedeInstalarDirecto,
    instalando,
    instalar,
    esDev,
    permitirEnDesarrollo,
  } = usePwaInstall()

  const [saliendo, setSaliendo] = useState(false)
  const [mensajeInstalacion, setMensajeInstalacion] = useState<string | null>(null)

  const manejarInstalacion = async () => {
    setMensajeInstalacion(null)
    const exito = await instalar()
    if (!exito) {
      setMensajeInstalacion(
        'Si la ventana del instalador no apareció, podés instalarla desde el menú (⋮) de tu navegador.',
      )
    }
  }

  const manejarCierre = async () => {
    try {
      setSaliendo(true)
      await cerrarSesion()
      window.location.href = '/entrar'
    } catch (e) {
      console.error('Error al cerrar sesión:', e)
      setSaliendo(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-bg text-text antialiased">
      {/* Cabecera superior */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/SHlarge.webp"
            alt="Student HUB"
            className="h-9 w-auto object-contain transition-all duration-250 dark:brightness-0 dark:invert"
          />
        </div>
        <ThemeToggle />
      </header>

      {/* Tarjeta central */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-xl transition-all sm:p-8">
          {/* Brillo de acento de fondo */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

          {/* Ícono de la aplicación */}
          <div className="mx-auto mb-5 flex flex-col items-center">
            <div className="relative flex size-20 items-center justify-center rounded-2xl border border-border bg-surface shadow-md">
              <img
                src="/icon-192.png"
                alt="Student HUB"
                className="size-16 rounded-xl object-contain shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-white ring-2 ring-surface">
                <IconoDescargar className="size-3" />
              </span>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3 py-1 text-etiqueta font-semibold tracking-wider text-primary uppercase">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Instalación Obligatoria
            </div>
          </div>

          {/* Títulos informativos */}
          <div className="text-center">
            <h1 className="text-titulo font-bold tracking-tight text-text sm:text-hero">
              Instalá Student HUB
            </h1>
            <p className="mt-2 text-menor leading-relaxed text-text-muted">
              Por seguridad de tu carnet digital estudiantil y para garantizar el funcionamiento
              sin internet, el acceso a Student HUB requiere que la aplicación esté instalada en tu
              dispositivo.
            </p>
          </div>

          {/* Beneficios de instalar */}
          <div className="mt-5 grid grid-cols-1 gap-2.5 rounded-2xl border border-border/80 bg-surface-alt/60 p-3.5 text-left sm:grid-cols-3">
            <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary-tint text-primary">
                <IconoCarnet className="size-4" />
              </div>
              <div>
                <p className="text-menuda font-semibold text-text">Carnet Offline</p>
                <p className="text-micro text-text-muted">Funciona sin gastar datos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary-tint text-primary">
                <IconoCalendario className="size-4" />
              </div>
              <div>
                <p className="text-menuda font-semibold text-text">Horarios</p>
                <p className="text-micro text-text-muted">Consultas al instante</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary-tint text-primary">
                <IconoComedor className="size-4" />
              </div>
              <div>
                <p className="text-menuda font-semibold text-text">Comedor</p>
                <p className="text-micro text-text-muted">Menú actualizado</p>
              </div>
            </div>
          </div>

          {/* Instrucciones personalizadas según la plataforma */}
          <div className="mt-6">
            {esInApp ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
                <p className="text-menor font-bold text-amber-700 dark:text-amber-400">
                  Estás en un navegador interno
                </p>
                <p className="mt-1 text-menuda text-text-muted">
                  Para instalar la aplicación, tocá el menú de tres puntos (⋮ o ···) en la esquina y
                  seleccioná <strong className="text-text">"Abrir en el navegador"</strong> (Chrome
                  o Safari).
                </p>
              </div>
            ) : plataforma === 'ios' ? (
              /* Guía para iOS Safari */
              <div className="rounded-2xl border border-border bg-surface-alt/70 p-4 text-left">
                <p className="mb-3 text-menor font-bold text-text">
                  Cómo instalar en tu iPhone / iPad (Safari):
                </p>
                <ol className="space-y-2.5 text-menuda text-text">
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                      1
                    </span>
                    <span>
                      Tocá el botón <strong className="font-semibold">Compartir</strong>{' '}
                      <IconoCompartir className="inline size-4 text-primary align-text-bottom" /> en
                      la barra inferior de Safari.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                      2
                    </span>
                    <span>
                      Deslizá hacia abajo y seleccioná{' '}
                      <strong className="font-semibold">"Agregar a pantalla de inicio"</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                      3
                    </span>
                    <span>
                      Tocá <strong className="font-semibold">"Agregar"</strong> en la esquina
                      superior derecha.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                      4
                    </span>
                    <span>
                      ¡Listo! Cerrá esta pestaña y abrí{' '}
                      <strong className="font-semibold text-primary">Student HUB</strong> desde tu
                      pantalla de inicio.
                    </span>
                  </li>
                </ol>
              </div>
            ) : (
              /* Guía para Android y Escritorio */
              <div className="space-y-4">
                {puedeInstalarDirecto ? (
                  <button
                    type="button"
                    onClick={manejarInstalacion}
                    disabled={instalando}
                    className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-primary-solid px-5 py-4 text-cuerpo font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconoDescargar className="size-5" />
                    {instalando ? 'Abriendo instalador…' : 'Instalar Student HUB ahora'}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-border bg-surface-alt/70 p-4 text-left">
                    <p className="mb-2 text-menor font-bold text-text">
                      Instalación manual desde el navegador:
                    </p>
                    <ol className="space-y-2 text-menuda text-text">
                      <li className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                          1
                        </span>
                        <span>
                          Tocá el menú <strong className="font-semibold">(⋮)</strong> en la esquina
                          superior derecha de tu navegador.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                          2
                        </span>
                        <span>
                          Seleccioná{' '}
                          <strong className="font-semibold">
                            "Instalar aplicación"
                          </strong> o <strong className="font-semibold">"Agregar a la pantalla principal"</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-micro font-bold text-white">
                          3
                        </span>
                        <span>
                          Abrí <strong className="font-semibold text-primary">Student HUB</strong>{' '}
                          desde tu pantalla de inicio para ingresar.
                        </span>
                      </li>
                    </ol>
                  </div>
                )}

                {mensajeInstalacion && (
                  <p className="text-menuda text-amber-600 dark:text-amber-400">
                    {mensajeInstalacion}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Acciones secundarias */}
          <div className="mt-6 flex flex-col gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={manejarCierre}
              disabled={saliendo}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-menor font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
            >
              <IconoSalir className="size-4" />
              {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>

            {esDev && (
              <button
                type="button"
                onClick={permitirEnDesarrollo}
                className="cursor-pointer text-center text-micro text-text-muted/70 underline underline-offset-2 transition-colors hover:text-primary"
              >
                🔧 Modo desarrollador: Continuar en navegador para pruebas locales
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Pie institucional */}
      <footer className="py-4 text-center text-menuda text-text-muted">
        Student HUB &bull; Aplicación Web Progresiva Oficial
      </footer>
    </div>
  )
}
