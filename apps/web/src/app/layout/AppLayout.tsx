import { useState, type ReactNode } from 'react'
import { Link, Outlet, ScrollRestoration } from 'react-router-dom'
import { useTituloDeRuta } from '../useTituloDeRuta'
import { AppHeader } from './AppHeader'
import { AppNav } from './AppNav'
import { AvisoSinConexion } from './AvisoSinConexion'
import { usePwaInstall } from '@/features/pwa/usePwaInstall'
import { ModalInstalarApp } from '@/features/pwa/ModalInstalarApp'
import { Chatbot } from '@/features/chatbot/Chatbot'
import { ToastNotificacionFlotante } from '@/features/notificaciones/components/ToastNotificacionFlotante'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { asegurarPropietarioCache, resolverScopeUsuarioActivo } from '@/lib/offlineCache'
import { BadgeRol } from '@/components/BadgeRol'
import {
  IconoDescargar,
  IconoBirrete,
  IconoDocente,
  IconoVolver,
  IconoPeriodico,
  IconoCalendario,
  IconoComedor,
  IconoInicio,
  IconoCerrar,
  IconoRecargar,
  IconoUsuarios,
  IconoListaAsistencia,
  IconoAgenda,
} from '@/components/icons'

export function AppLayout({ children }: { children?: ReactNode }) {
  useTituloDeRuta()
  const { esModoInstalado } = usePwaInstall()
  const { rol: rolSistema, docente } = useSesion()
  const { rolActivo, perspectiva, alternarRolDemo } = useEstudiante()
  const [modalInstalarAbierto, setModalInstalarAbierto] = useState(false)
  const [bannerDescartado, setBannerDescartado] = useState(false)

  const esDemo =
    typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true'
  const esDocente = rolSistema === 'docente'

  const cambiarADemoDocente = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem('studenthub_demo_sesion', 'true')
    localStorage.setItem('studenthub_demo_rol', 'docente')
    asegurarPropietarioCache(resolverScopeUsuarioActivo())
    window.location.href = '/docente'
  }

  const cambiarADemoEstudiante = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem('studenthub_demo_sesion', 'true')
    localStorage.setItem('studenthub_demo_rol', 'estudiante')
    localStorage.removeItem('studenthub_estudiante_activo_id')
    asegurarPropietarioCache(resolverScopeUsuarioActivo())
    window.location.href = '/estudiante'
  }

  return (
    <div className="min-h-screen xl:grid xl:grid-cols-[264px_1fr] xl:grid-rows-[70px_1fr] overflow-x-clip">
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
          'mx-auto w-full max-w-[680px] min-w-0 px-4 pt-5 pb-[calc(100px_+_env(safe-area-inset-bottom))] ' +
          'md:px-6 md:pt-7 md:pb-[calc(110px_+_env(safe-area-inset-bottom))] ' +
          'xl:col-start-2 xl:row-start-2 xl:max-w-[1200px] xl:px-10 xl:py-9 xl:pb-9'
        }
      >
        {/* Barra de Evaluación Rápida para Jueces (Expotécnica 2026) */}
        {esDemo && (
          <div className="mb-5 rounded-2xl border-2 border-primary/40 bg-surface/90 backdrop-blur-md p-3 sm:p-3.5 shadow-md shadow-primary/10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white text-nota font-bold shadow-xs">
                  {esDocente ? (
                    <IconoDocente className="size-4 text-white" />
                  ) : (
                    <IconoBirrete className="size-4 text-white" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-text text-nota leading-tight">
                      Modo Juez · Expotécnica 2026
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase">
                      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>Sesión Demo Activa</span>
                    </span>
                    {esDocente ? (
                      <BadgeRol rol="docente" especialidad={docente?.especialidadAsignada} />
                    ) : (
                      <BadgeRol perspectiva={perspectiva} />
                    )}
                  </div>
                  <p className="text-micro text-text-muted mt-0.5">
                    {esDocente
                      ? `Evaluá el panel de ${docente?.nombreCompleto ?? 'Prof. Dangelo'} (${docente?.especialidadAsignada ?? 'Desarrollo Web'}):`
                      : `Evaluá la app como ${rolActivo === 'estudiante' ? 'estudiante regular' : 'encargado legal con estudiantes a cargo'}:`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {esDocente ? (
                  <button
                    type="button"
                    onClick={cambiarADemoEstudiante}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary-tint px-3 py-1.5 text-micro font-bold text-primary hover:bg-primary-tint-strong transition-all active:scale-95 shadow-2xs"
                    title="Cambiar a la vista del estudiante de Desarrollo Web para verificar actualizaciones"
                  >
                    <IconoBirrete className="size-3.5" />
                    <span>Ver como Estudiante</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => alternarRolDemo(rolActivo === 'estudiante' ? 'encargado' : 'estudiante')}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary-tint px-3 py-1.5 text-micro font-bold text-primary hover:bg-primary-tint-strong transition-all active:scale-95 shadow-2xs"
                      title="Alternar entre perfil demo de Estudiante y Encargado Legal"
                    >
                      <IconoRecargar className="size-3.5" />
                      <span>
                        {rolActivo === 'estudiante' ? 'Ver como Encargado (2 hijos)' : 'Ver como Estudiante'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={cambiarADemoDocente}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-micro font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition-all active:scale-95 shadow-2xs"
                      title="Evaluar Modo Docente como Prof. Dangelo (Desarrollo Web)"
                    >
                      <IconoDocente className="size-3.5" />
                      <span>Modo Docente</span>
                    </button>
                  </>
                )}
                <Link
                  to="/expo"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-micro font-bold text-white shadow-xs hover:bg-primary-dark transition-all active:scale-95"
                >
                  <IconoVolver className="size-3.5" />
                  <span>Portal Jueces</span>
                </Link>
              </div>
            </div>

            {/* Píldoras de Acceso Rápido para el Jurado */}
            {esDocente ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <Link
                  to="/docente"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoUsuarios className="size-3.5" />
                  <span>Padrón Desarrollo Web</span>
                </Link>
                <Link
                  to="/docente/notas"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoBirrete className="size-3.5" />
                  <span>Control de Notas</span>
                </Link>
                <Link
                  to="/docente/asistencias"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoListaAsistencia className="size-3.5" />
                  <span>Pase de Lista</span>
                </Link>
                <Link
                  to="/docente/agenda"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoAgenda className="size-3.5" />
                  <span>Agenda y Avisos</span>
                </Link>
              </div>
            ) : (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <Link
                  to="/estudiante"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoBirrete className="size-3.5" />
                  <span>Hub Estudiantil</span>
                </Link>
                <Link
                  to="/agenda"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoPeriodico className="size-3.5" />
                  <span>Agenda & Ausencias</span>
                </Link>
                <Link
                  to="/horarios"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoCalendario className="size-3.5" />
                  <span>Horarios por Sección</span>
                </Link>
                <Link
                  to="/comedor"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoComedor className="size-3.5" />
                  <span>Menú & Pase Comedor</span>
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-alt hover:bg-primary-tint hover:text-primary border border-border text-menuda font-bold text-text transition-all active:scale-95"
                >
                  <IconoInicio className="size-3.5" />
                  <span>Dashboard Inicio</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Banner para instalar fácilmente cuando entraron por el enlace (oculto en modo juez para evitar saturación) */}
        {!esModoInstalado && !bannerDescartado && !esDemo && (
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
                <IconoCerrar className="size-4" aria-hidden="true" />
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

      {/* Notificación Toast Flotante */}
      <ToastNotificacionFlotante />

      {/* Asistente Virtual Inteligente de Student HUB */}
      <Chatbot />

      <ScrollRestoration />
    </div>
  )
}
