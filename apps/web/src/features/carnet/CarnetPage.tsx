import { useCallback } from 'react'
import { PageSection } from '@/components/PageSection'
import { PantallaDeAviso } from '@/components/PantallaDeAviso'
import { useSesion } from '@/features/auth/useSesion'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { TarjetaCarnet } from './components/TarjetaCarnet'
import { PanelDetalles } from './components/PanelDetalles'

export function CarnetPage() {
  const { sesion, cargando: cargandoSesion } = useSesion()
  const { estudiante, cargando, fueraDelPadron } = useEstudiante()
  const imprimir = useCallback(() => window.print(), [])

  if (cargandoSesion || cargando) return null

  // El carnet es la única sección que muestra datos personales: sin sesión no
  // hay nada que mostrar, y no se inventa una ficha de relleno.
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
    <PageSection titulo="Mi Carnet Digital">
      <div
        className={
          'mt-2.5 flex flex-col items-center gap-5.5 ' +
          'lg:mx-auto lg:max-w-[860px] lg:flex-row lg:items-stretch lg:gap-9'
        }
      >
        <div className="flex w-full justify-center lg:max-w-[360px] lg:flex-1">
          <TarjetaCarnet estudiante={estudiante} />
        </div>
        <PanelDetalles estudiante={estudiante} onImprimir={imprimir} />
      </div>
    </PageSection>
  )
}
