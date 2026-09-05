import { useCallback, useState } from 'react'
import { PageSection } from '@/components/PageSection'
import { PantallaDeAviso } from '@/components/PantallaDeAviso'
import { IconoEngranaje } from '@/components/icons'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { TarjetaCarnet } from './components/TarjetaCarnet'
import { PanelDetalles } from './components/PanelDetalles'
import { ModalOpcionesCarnet } from './components/ModalOpcionesCarnet'

export function CarnetPage() {
  const { sesion, cargando: cargandoSesion, cerrarSesion } = useSesion()
  const { estudiante, cargando, fueraDelPadron } = useEstudiante()
  const [modalAbierta, setModalAbierta] = useState(false)
  const imprimir = useCallback(() => window.print(), [])

  if (cargandoSesion || cargando) return null

  // Sin sesión no hay carnet para mostrar
  if (!sesion) {
    return (
      <PageSection titulo="Mi Carnet Digital">
        <PantallaDeAviso
          titulo="Necesitás iniciar sesión"
          descripcion="El carnet muestra tu ficha del colegio, así que hace falta entrar con tu correo institucional."
          accion={{ texto: 'Entrar', a: '/entrar' }}
        />
      </PageSection>
    )
  }

  if (fueraDelPadron || !estudiante) {
    return (
      <PageSection titulo="Mi Carnet Digital">
        <PantallaDeAviso
          titulo="Tu correo no está en el padrón"
          descripcion="Entraste bien, pero ese correo no corresponde a ningún estudiante matriculado. Avisale a la administración del colegio."
          accion={{ texto: 'Ir al inicio', a: '/' }}
        />
      </PageSection>
    )
  }

  return (
    <PageSection
      titulo="Mi Carnet Digital"
      acciones={
        <button
          type="button"
          onClick={() => setModalAbierta(true)}
          aria-label="Opciones y configuración del carnet"
          title="Opciones y configuración"
          className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-sm transition-all duration-200 hover:border-primary hover:bg-primary-tint hover:text-primary active:scale-95"
        >
          <IconoEngranaje className="size-5" />
        </button>
      }
    >
      <div
        className={
          'mt-2.5 flex flex-col items-center gap-5.5 ' +
          'lg:mx-auto lg:max-w-[860px] lg:flex-row lg:items-stretch lg:gap-9'
        }
      >
        <div className="flex w-full justify-center lg:max-w-[360px] lg:flex-1">
          <TarjetaCarnet estudiante={estudiante} />
        </div>
        <PanelDetalles
          estudiante={estudiante}
          onImprimir={imprimir}
          onCerrarSesion={() => void cerrarSesion()}
        />
      </div>

      <ModalOpcionesCarnet
        abierto={modalAbierta}
        alCerrar={() => setModalAbierta(false)}
        estudiante={estudiante}
        onCerrarSesion={() => void cerrarSesion()}
      />
    </PageSection>
  )
}
