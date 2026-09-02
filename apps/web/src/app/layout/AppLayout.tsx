import type { ReactNode } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { useTituloDeRuta } from '../useTituloDeRuta'
import { AppHeader } from './AppHeader'
import { AppNav } from './AppNav'
import { AvisoSinConexion } from './AvisoSinConexion'

/**
 * Réplica del armazón de la app actual:
 *   · < 1024px → una columna, nav flotante al fondo, espacio reservado abajo
 *   · ≥ 1024px → rejilla de 264px + contenido, header fijo de 70px arriba
 *
 * Acepta `children` para que la pantalla de error pueda usar el mismo armazón
 * y no dejar al estudiante sin barra de navegación cuando algo falla.
 */
export function AppLayout({ children }: { children?: ReactNode }) {
  useTituloDeRuta()

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

      <AppHeader />
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
        <AvisoSinConexion />
        {children ?? <Outlet />}
      </main>

      {/* Sin esto el scroll se queda donde estaba: al pasar de un Comedor
          scrolleado a otra sección se caía a media página. Además restaura la
          posición al volver con el botón de atrás. */}
      <ScrollRestoration />
    </div>
  )
}
