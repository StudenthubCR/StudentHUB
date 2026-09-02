import { PageSection } from '@/components/PageSection'
import { SelectorDeGrado } from './components/SelectorDeGrado'

export function HorariosPage() {
  return (
    <PageSection titulo="Horarios de Clases">
      <p className="text-menor text-text-muted">
        Elegí tu grado para ver el horario del grupo.
      </p>
      <SelectorDeGrado />
    </PageSection>
  )
}
