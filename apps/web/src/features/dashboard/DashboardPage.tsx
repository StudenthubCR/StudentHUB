import { useState } from 'react'
import { BellIcon, IconoAlertaTriangulo } from '@/components/icons'

import { estadoDelDia, nombreLargoDeFecha } from '@/features/comedor/menu.service'
import { useMenuSemanal } from '@/features/comedor/useMenuSemanal'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { useHorario } from '@/features/horarios/useHorario'
import { useNotificaciones } from '@/features/notificaciones/useNotificaciones'
import { ModalNotificaciones } from '@/features/notificaciones/ModalNotificaciones'
import { useReloj } from '@/lib/useReloj'
import { AlmuerzoDeHoy } from './components/AlmuerzoDeHoy'
import { CarruselNoticias } from './components/CarruselNoticias'
import { BannersAvisosRapidos } from '@/features/avisos'
import { ClaseAhora } from './components/ClaseAhora'
import { RestoDelDia } from './components/RestoDelDia'
import { WidgetAgendaDashboard } from '@/features/agenda/components/WidgetAgendaDashboard'
import { NOTICIAS } from './noticias.fixture'

import { primerNombre, saludoSegunHora } from './saludo'

/**
 * El inicio responde, en este orden, lo que un estudiante viene a mirar:
 * qué clase tiene ahora, qué viene después, qué hay de almuerzo y, ya de
 * último, las noticias.
 */
export function DashboardPage() {
  const { estudiante, cargando: cargandoEstudiante, fueraDelPadron } = useEstudiante()
  const ahora = useReloj()

  const grupoActivo = estudiante?.grupo || '12-1'
  const horario = useHorario(grupoActivo, ahora)
  const comedor = useMenuSemanal(ahora)

  const diaDeHoy = horario.dias.find((dia) => dia.esHoy) ?? null
  const { permiso, notificacionesActivas } = useNotificaciones()
  const [modalNotifAbierto, setModalNotifAbierto] = useState(false)
  const [bannerOculto, setBannerOculto] = useState(false)
  const esModoDemo = typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true'

  // Skeleton de carga responsivo mientras se valida la sesión y el perfil en Supabase
  if (cargandoEstudiante) {
    return (
      <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="Cargando panel de estudiante">
        <header className="flex flex-col gap-2.5">
          <div className="h-6 w-44 rounded-full bg-surface-alt border border-border" />
          <div className="h-10 w-72 rounded-2xl bg-surface-alt" />
          <div className="h-4 w-40 rounded-lg bg-surface-alt" />
        </header>

        <div className="h-20 w-full rounded-2xl bg-surface-alt border border-border" />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="h-44 rounded-2xl bg-surface-alt border border-border" />
            <div className="h-60 rounded-2xl bg-surface-alt border border-border" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-44 rounded-2xl bg-surface-alt border border-border" />
            <div className="h-60 rounded-2xl bg-surface-alt border border-border" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="animate-fade-in">
      <header className="mb-3.5 sm:mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/20 px-3 py-0.5 text-micro font-black uppercase tracking-wider text-primary shadow-2xs">
            <span>CTP de Educación Técnica</span>
            <span>·</span>
            <span>Sección {estudiante?.grupo ?? '12-1'}</span>
          </span>
          {esModoDemo && (
            <span className="inline-flex items-center gap-1.5 text-micro font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full shadow-2xs">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulación Expotécnica 2026</span>
            </span>
          )}
        </div>

        <h1 className="text-hero leading-tight font-black tracking-[-0.03em] text-text md:text-[2.2rem]">
          {saludoSegunHora(ahora)}
          {estudiante ? (
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              {`, ${primerNombre(estudiante.nombre)}`}
            </span>
          ) : (
            ''
          )}
        </h1>
        <p className="mt-1 text-dato text-text-muted first-letter:uppercase font-medium md:text-base">
          {nombreLargoDeFecha(ahora)}
        </p>
      </header>

      {/* Aviso institucional si el usuario no figura aún en el padrón oficial */}
      {fueraDelPadron && (
        <div className="mb-4 sm:mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-3.5 sm:p-4 text-menor text-amber-950 dark:text-amber-200">
          <IconoAlertaTriangulo className="size-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="min-w-0">
            <p className="font-bold">Cuenta en proceso de vinculación al padrón estudiantil</p>
            <p className="mt-0.5 text-micro text-amber-800 dark:text-amber-300">
              Iniciaste sesión con éxito. Si eres estudiante regular del CTP, solicita a secretaría que agregue tu correo institucional al padrón para visualizar tu carnet personalizado y horarios específicos.
            </p>
          </div>
        </div>
      )}

      {/* Banner de bienvenida para Notificaciones (oculto en modo demo para mantener el dashboard limpio) */}
      {!esModoDemo && !notificacionesActivas && permiso !== 'denied' && !bannerOculto && (
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2.5 rounded-2xl border border-primary/20 bg-primary-tint/40 px-3.5 py-2.5 sm:p-3.5 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-7.5 sm:size-8.5 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <BellIcon size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-micro sm:text-menor font-bold text-text">
                Activá notificaciones para avisos y almuerzo
              </p>
              <p className="hidden text-[11px] text-text-muted sm:block">
                Enterate del menú diario, recordatorios y ausencias docentes.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setModalNotifAbierto(true)}
              className="cursor-pointer rounded-xl bg-primary px-3 py-1 text-micro font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95"
            >
              Activar
            </button>
            <button
              type="button"
              onClick={() => setBannerOculto(true)}
              aria-label="Ocultar aviso de notificaciones"
              className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-border/40 hover:text-text"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Comunicados Oficiales y Avisos Rápidos (por encima de las noticias) */}
      <BannersAvisosRapidos />

      {/* Sección compacta de Noticias del CTP (justo antes del contenido central) */}
      <div className="mb-3.5 sm:mb-4.5">
        <CarruselNoticias noticias={NOTICIAS} />
      </div>

      {/* Contenido Central: rutina diaria del estudiante */}
      <div className="flex flex-col gap-3.5 xl:grid xl:grid-cols-2 xl:gap-4.5 xl:items-start">
        {/* Columna 1: Clases y Horario de hoy */}
        <div className="flex flex-col gap-3.5">
          <ClaseAhora
            dia={diaDeHoy}
            ahora={ahora}
            cargando={horario.cargando}
            hayError={Boolean(horario.error)}
            aHorario="/horarios"
          />
          <RestoDelDia dia={diaDeHoy} ahora={ahora} />
        </div>

        {/* Columna 2: Agenda de pendientes y Menú de almuerzo */}
        <div className="flex flex-col gap-3.5">
          <WidgetAgendaDashboard />
          <AlmuerzoDeHoy
            estado={estadoDelDia(comedor.menus, ahora)}
            cargando={comedor.cargando}
            hayError={Boolean(comedor.error)}
          />
        </div>
      </div>

      <ModalNotificaciones
        abierto={modalNotifAbierto}
        alCerrar={() => setModalNotifAbierto(false)}
      />
    </section>
  )
}

