import { useState } from 'react'
import { BellIcon } from '@/components/icons'

import { estadoDelDia, nombreLargoDeFecha } from '@/features/comedor/menu.service'
import { useMenuSemanal } from '@/features/comedor/useMenuSemanal'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { useHorario } from '@/features/horarios/useHorario'
import { useNotificaciones } from '@/features/notificaciones/useNotificaciones'
import { ModalNotificaciones } from '@/features/notificaciones/ModalNotificaciones'
import { useReloj } from '@/lib/useReloj'
import { AlmuerzoDeHoy } from './components/AlmuerzoDeHoy'
import { CarruselNoticias } from './components/CarruselNoticias'
import { ClaseAhora } from './components/ClaseAhora'
import { RestoDelDia } from './components/RestoDelDia'
import { WidgetAgendaDashboard } from '@/features/agenda/components/WidgetAgendaDashboard'
import { NOTICIAS } from './noticias.fixture'

import { primerNombre, saludoSegunHora } from './saludo'

/**
 * El inicio responde, en este orden, lo que un estudiante viene a mirar:
 * qué clase tiene ahora, qué viene después, qué hay de almuerzo y, ya de
 * último, las noticias.
 *
 * No lleva accesos directos a las secciones: los cuatro destinos ya están en
 * la barra de navegación, que en móvil está fija abajo y en escritorio es la
 * barra lateral. Repetirlos aquí ocupaba media pantalla sin agregar nada.
 */
export function DashboardPage() {
  const { estudiante } = useEstudiante()
  const ahora = useReloj()

  const grupoActivo = estudiante?.grupo ?? '11-1'
  const horario = useHorario(grupoActivo, ahora)
  const comedor = useMenuSemanal(ahora)

  const diaDeHoy = horario.dias.find((dia) => dia.esHoy) ?? null
  const { permiso, notificacionesActivas } = useNotificaciones()
  const [modalNotifAbierto, setModalNotifAbierto] = useState(false)
  const [bannerOculto, setBannerOculto] = useState(false)

  return (
    <section className="animate-fade-in">
      <header className="mb-5.5 md:mb-6.5">
        <h1 className="text-hero leading-tight font-bold tracking-[-0.03em] md:text-[2rem]">
          {saludoSegunHora(ahora)}
          {estudiante ? `, ${primerNombre(estudiante.nombre)}` : ''}
        </h1>
        <p className="mt-1 text-dato text-text-muted first-letter:uppercase md:text-base">
          {nombreLargoDeFecha(ahora)}
        </p>
      </header>

      {/* Banner de bienvenida para Notificaciones:
          Barra compacta y discreta que no satura la pantalla en móvil. */}
      {!notificacionesActivas && permiso !== 'denied' && !bannerOculto && (
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

      {/* En móvil: primero la rutina diaria del estudiante (Clase, Agenda, Almuerzo)
          y al final las Noticias en formato banner panorámico.
          En pantallas de escritorio (xl): distribución en 2 columnas paralelas. */}
      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[1fr_1.35fr] xl:items-start xl:gap-7.5">
        {/* Columna de rutina escolar (orden 1 en móvil, columna derecha en xl) */}
        <div className="order-1 xl:order-2 flex flex-col gap-3.5">
          <ClaseAhora
            dia={diaDeHoy}
            ahora={ahora}
            cargando={horario.cargando}
            hayError={Boolean(horario.error)}
            aHorario="/horarios"
          />
          <RestoDelDia dia={diaDeHoy} ahora={ahora} />
          <WidgetAgendaDashboard />
          <AlmuerzoDeHoy
            estado={estadoDelDia(comedor.menus, ahora)}
            cargando={comedor.cargando}
            hayError={Boolean(comedor.error)}
          />
        </div>

        {/* Columna de Noticias (orden 2 en móvil, columna izquierda en xl) */}
        <section className="order-2 xl:order-1 mt-1 xl:mt-0">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-etiqueta font-bold tracking-[0.09em] text-text-muted uppercase">
              Noticias del CTP
            </h2>
            <span className="text-[11px] font-semibold text-text-muted">
              Actualizaciones
            </span>
          </div>
          <CarruselNoticias noticias={NOTICIAS} />
        </section>
      </div>

      <ModalNotificaciones
        abierto={modalNotifAbierto}
        alCerrar={() => setModalNotifAbierto(false)}
      />
    </section>
  )
}

