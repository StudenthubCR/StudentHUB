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
        {/* Barra de Evaluación Rápida para Jueces (Expotécnica 2026) */}
        {typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true' && (
          <div className="mb-5 rounded-2xl border-2 border-primary/40 bg-surface/90 backdrop-blur-md p-3 sm:p-3.5 shadow-md shadow-primary/10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white text-nota font-bold shadow-xs">
                  🎓
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-text text-nota leading-tight">
                      Modo Juez · Expotécnica 2026
                    </p>
                    <span className="inline-block rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase">
                      ● Sesión Demo Activa
                    </span>
                  </div>
                  <p className="text-micro text-text-muted mt-0.5">
                    Tocá los atajos para evaluar cada módulo o volver a la ficha técnica:
                  </p>
                </div>
              </div>
              <a
                href="/expo"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-micro font-bold text-white shadow-xs hover:bg-primary-dark transition-all active:scale-95 shrink-0"
              >
                <span>← Volver al Portal de Jueces</span>
              </a>
            </div>

            {/* Píldoras de Acceso Rápido para el Jurado */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <a
                href="/carnet"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
              >
                <span>🪪 Carnet 3D & SOS</span>
              </a>
              <a
                href="/agenda"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
              >
                <span>📝 Agenda & Ausencias</span>
              </a>
              <a
                href="/horarios"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
              >
                <span>📅 Horarios por Sección</span>
              </a>
              <a
                href="/comedor"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
              >
                <span>🍽️ Menú & Pase Comedor</span>
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
              >
                <span>🏠 Dashboard Inicio</span>
              </a>
            </div>
          </div>
        )}

        {/* Banner para instalar fácilmente cuando entraron por el enlace (oculto en modo juez para evitar saturación) */}
        {!esModoInstalado && !bannerDescartado && !(typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true') && (
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
