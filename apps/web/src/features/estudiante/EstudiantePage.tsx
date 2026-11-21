import { useCallback, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageSection } from '@/components/PageSection'
import { PantallaDeAviso } from '@/components/PantallaDeAviso'
import { IconoCarnet, IconoBirrete, IconoCalendario, IconoEngranaje } from '@/components/icons'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { SelectorPerspectiva } from '@/components/SelectorPerspectiva'
import { BadgeRol } from '@/components/BadgeRol'
import { SafeBoundary } from '@/components/SafeBoundary'
import { usePersonalizacionCarnet } from '@/features/carnet/carnet.estilos'
import { TarjetaCarnet } from '@/features/carnet/components/TarjetaCarnet'
import { PanelDetalles } from '@/features/carnet/components/PanelDetalles'
import { ModalOpcionesCarnet } from '@/features/carnet/components/ModalOpcionesCarnet'
import { TabNotas } from '@/features/notas/components/TabNotas'
import { TabAsistencias } from '@/features/asistencias/components/TabAsistencias'
import { cn } from '@/lib/cn'

type TabId = 'carnet' | 'notas' | 'asistencias'

export function EstudiantePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { sesion, cargando: cargandoSesion, cerrarSesion } = useSesion()
  const { estudiante, cargando, fueraDelPadron, perspectiva } = useEstudiante()

  // Tab activo desde query param ?tab=... con fallback a 'carnet'
  const tabActivo: TabId = useMemo(() => {
    const t = searchParams.get('tab')
    if (t === 'notas' || t === 'asistencias' || t === 'carnet') return t
    return 'carnet'
  }, [searchParams])

  const cambiarTab = useCallback(
    (nuevoTab: TabId) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.set('tab', nuevoTab)
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Estado y personalización del carnet digital
  const [modalCarnetAbierta, setModalCarnetAbierta] = useState(false)
  const [carnetVolteado, setCarnetVolteado] = useState(false)
  const imprimir = useCallback(() => window.print(), [])

  const {
    personalizacion,
    cambiarTema,
    cambiarPatron,
    toggleBrillo,
    toggleEfecto3d,
    cambiarInsignia,
    cambiarLema,
    cambiarTipoSangre,
    cambiarContactoEmergencia,
    restablecer,
  } = usePersonalizacionCarnet()

  if (cargandoSesion || cargando) return null

  if (!sesion) {
    return (
      <PageSection titulo="Hub Estudiantil">
        <PantallaDeAviso
          titulo="Necesitás iniciar sesión"
          descripcion="Para consultar el carnet digital, notas y asistencias, ingresá con la cuenta institucional de estudiante."
          accion={{ texto: 'Entrar', a: '/entrar' }}
        />
      </PageSection>
    )
  }

  if (fueraDelPadron || !estudiante) {
    return (
      <PageSection titulo="Hub Estudiantil">
        <PantallaDeAviso
          titulo="Tu correo no está en el padrón"
          descripcion="Iniciaste sesión bien, pero este correo no figura en el padrón activo. Acudí a secretaría o coordinación para verificar tu matrícula."
          accion={{ texto: 'Ir al inicio', a: '/' }}
        />
      </PageSection>
    )
  }

  // Título contextual y descripción según la perspectiva familiar seleccionada
  const infoPerspectiva = {
    ambos: {
      titulo: 'Hub Estudiantil',
      subtitulo: 'Portal Familiar · Consulta integral de credencial, notas y asistencias oficiales.',
    },
    estudiante: {
      titulo: 'Mi Perfil Estudiantil',
      subtitulo: 'Tu carnet digital, calificaciones y asistencias registradas en el CTP.',
    },
    encargado: {
      titulo: 'Supervisión del Estudiante',
      subtitulo: `Acompañamiento académico, asistencias y credencial institucional para ${estudiante.nombre}.`,
    },
  }[perspectiva]

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Encabezado Principal del Hub */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/25 px-2.5 py-0.5 text-micro font-bold text-primary uppercase tracking-wider">
              <span>{estudiante.siglaInstitucion} San Rafael</span>
              <span>·</span>
              <span>Sección {estudiante.grupo}</span>
            </span>
            <BadgeRol perspectiva={perspectiva} />
          </div>
          <h1 className="text-titulo sm:text-hero font-black tracking-tight text-text">
            {infoPerspectiva.titulo}
          </h1>
          <p className="text-menor text-text-muted mt-0.5 max-w-2xl">
            {infoPerspectiva.subtitulo}
          </p>
        </div>

        {/* Selector de Perspectiva Adaptativa */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <SelectorPerspectiva />
        </div>
      </header>

      {/* Segmented Tab Bar Accesible */}
      <nav
        role="tablist"
        aria-label="Pestañas del Hub Estudiantil"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-surface-alt/70 p-1.5 shadow-2xs backdrop-blur-xs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tabActivo === 'carnet'}
          onClick={() => cambiarTab('carnet')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 px-2 text-menor font-bold transition-all duration-200 cursor-pointer',
            tabActivo === 'carnet'
              ? 'bg-surface text-text shadow-xs ring-1 ring-border'
              : 'text-text-muted hover:text-text hover:bg-surface/50',
          )}
        >
          <IconoCarnet className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Carnet Digital</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tabActivo === 'notas'}
          onClick={() => cambiarTab('notas')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 px-2 text-menor font-bold transition-all duration-200 cursor-pointer',
            tabActivo === 'notas'
              ? 'bg-surface text-text shadow-xs ring-1 ring-border'
              : 'text-text-muted hover:text-text hover:bg-surface/50',
          )}
        >
          <IconoBirrete className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Calificaciones</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tabActivo === 'asistencias'}
          onClick={() => cambiarTab('asistencias')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 px-2 text-menor font-bold transition-all duration-200 cursor-pointer',
            tabActivo === 'asistencias'
              ? 'bg-surface text-text shadow-xs ring-1 ring-border'
              : 'text-text-muted hover:text-text hover:bg-surface/50',
          )}
        >
          <IconoCalendario className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Asistencias</span>
        </button>
      </nav>

      {/* Contenido Dinámico de la Pestaña Activa */}
      <main className="mt-4">
        {/* PESTAÑA 1: CARNET DIGITAL */}
        {tabActivo === 'carnet' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-dato font-bold text-text">Credencial Digital Estudiantil</h2>
                <p className="text-micro text-text-muted">
                  Identificación oficial verificada con código QR institucional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalCarnetAbierta(true)}
                aria-label="Personalizar apariencia del carnet"
                title="Personalizar carnet"
                className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-text-muted shadow-2xs transition-colors hover:border-primary hover:bg-primary-tint hover:text-primary active:scale-95"
              >
                <IconoEngranaje className="size-4.5" />
              </button>
            </div>

            <div className="mt-2.5 flex flex-col items-center gap-5.5 lg:mx-auto lg:max-w-[860px] lg:flex-row lg:items-stretch lg:gap-9">
              <div className="flex w-full justify-center lg:max-w-[360px] lg:flex-1">
                <SafeBoundary nombre="Ficha del Carnet 3D">
                  <TarjetaCarnet
                    estudiante={estudiante}
                    personalizacion={personalizacion}
                    volteada={carnetVolteado}
                    onToggleVoltear={() => setCarnetVolteado((prev) => !prev)}
                  />
                </SafeBoundary>
              </div>
              <SafeBoundary nombre="Detalles y Opciones del Carnet">
                <PanelDetalles
                  estudiante={estudiante}
                  onImprimir={imprimir}
                  onPersonalizar={() => setModalCarnetAbierta(true)}
                  onCerrarSesion={() => void cerrarSesion()}
                  estaVolteada={carnetVolteado}
                  onToggleVoltear={() => setCarnetVolteado((prev) => !prev)}
                />
              </SafeBoundary>
            </div>

            <ModalOpcionesCarnet
              abierto={modalCarnetAbierta}
              alCerrar={() => setModalCarnetAbierta(false)}
              estudiante={estudiante}
              onCerrarSesion={() => void cerrarSesion()}
              personalizacion={personalizacion}
              onCambiarTema={cambiarTema}
              onCambiarPatron={cambiarPatron}
              onToggleBrillo={toggleBrillo}
              onToggleEfecto3d={toggleEfecto3d}
              onCambiarInsignia={cambiarInsignia}
              onCambiarLema={cambiarLema}
              onCambiarTipoSangre={cambiarTipoSangre}
              onCambiarContactoEmergencia={cambiarContactoEmergencia}
              onRestablecer={restablecer}
            />
          </div>
        )}

        {/* PESTAÑA 2: CALIFICACIONES (NOTAS) */}
        {tabActivo === 'notas' && (
          <SafeBoundary nombre="Módulo de Calificaciones">
            <TabNotas estudianteId={estudiante.id} />
          </SafeBoundary>
        )}

        {/* PESTAÑA 3: ASISTENCIAS */}
        {tabActivo === 'asistencias' && (
          <SafeBoundary nombre="Módulo de Asistencias">
            <TabAsistencias estudianteId={estudiante.id} />
          </SafeBoundary>
        )}
      </main>
    </div>
  )
}

