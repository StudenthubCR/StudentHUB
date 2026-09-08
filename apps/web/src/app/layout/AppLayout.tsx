import { useState, type ReactNode } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { useTituloDeRuta } from '../useTituloDeRuta'
import { AppHeader } from './AppHeader'
import { AppNav } from './AppNav'
import { AvisoSinConexion } from './AvisoSinConexion'
import { usePwaInstall } from '@/features/pwa/usePwaInstall'
import { ModalInstalarApp } from '@/features/pwa/ModalInstalarApp'
import { IconoDescargar } from '@/components/icons'

export function AppLayout({ children }: { children?: ReactNode }) {
  useTituloDeRuta()
  const { esModoInstalado } = usePwaInstall()
  const [modalInstalarAbierto, setModalInstalarAbierto] = useState(false)
  const [bannerDescartado, setBannerDescartado] = useState(false)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr] lg:grid-rows-[70px_1fr]">
      {/* Para quien navega con teclado: saltarse la barra y caer en el
          contenido. Sólo se ve al enfocarlo. */}
      <a
        href="#contenido"
        className={
          'sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[2000] ' +
          'focus:rounded-full focus:bg-primary-solid focus:px-4 focus:py-2 ' +
          'focus:text-menor focus:font-semibold focus:text-white'
        }
      >
        Saltar al contenido
      </a>

      <AppHeader
        onAbrirInstalar={() => setModalInstalarAbierto(true)}
        esModoInstalado={esModoInstalado}
      />
      <AppNav />

      <main
        id="contenido"
        tabIndex={-1}
        className={
          'mx-auto w-full px-4.5 pt-5 pb-[calc(100px_+_env(safe-area-inset-bottom))] ' +
          'md:max-w-[700px] md:px-6 md:pt-7 md:pb-[calc(110px_+_env(safe-area-inset-bottom))] ' +
          'lg:col-start-2 lg:row-start-2 lg:max-w-[1200px] lg:px-10 lg:py-9 lg:pb-9'
        }
      >
        {/* Banner para instalar fácilmente cuando entraron por el enlace */}
        {!esModoInstalado && !bannerDescartado && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary-tint/60 px-4 py-3 text-menuda shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                <IconoDescargar className="size-4" />
              </span>
              <div>
                <p className="font-bold text-text">Instalá la aplicación en tu celular</p>
                <p className="text-micro text-text-muted">Accedé a tu carnet y horarios sin gastar datos ni conexión.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalInstalarAbierto(true)}
                className="shrink-0 cursor-pointer rounded-xl bg-primary px-3 py-1.5 text-micro font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95"
              >
                Instalar
              </button>
              <button
                type="button"
                onClick={() => setBannerDescartado(true)}
                aria-label="Ocultar aviso de instalación"
                className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-border/40 hover:text-text"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <AvisoSinConexion />
        {children ?? <Outlet />}
      </main>

      <ModalInstalarApp
        abierto={modalInstalarAbierto}
        alCerrar={() => setModalInstalarAbierto(false)}
      />

      {/* Sin esto el scroll se queda donde estaba: al pasar de un Comedor
          scrolleado a otra sección se caía a media página. Además restaura la
          posición al volver con el botón de atrás. */}
      <ScrollRestoration />
    </div>
  )
}
