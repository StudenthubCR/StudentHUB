import { useCallback } from 'react'
import { PageSection } from '@/components/PageSection'
import { TarjetaCarnet } from './components/TarjetaCarnet'
import { PanelDetalles } from './components/PanelDetalles'
import { useEstudiante } from '@/features/estudiante/useEstudiante'

export function CarnetPage() {
  const estudiante = useEstudiante()
  const imprimir = useCallback(() => window.print(), [])

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
