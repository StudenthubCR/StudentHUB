import {
  IconoEstrella,
  IconoDispositivo,
  IconoRayo,
  IconoAgenda,
  IconoEngranaje,
  IconoCarnet,
  IconoBirrete,
  IconoColegio,
} from '@/components/icons'

export function IconoDeInsignia({ id, className = 'size-4' }: { id: string; className?: string }) {
  switch (id) {
    case 'software':
      return <IconoDispositivo className={className} aria-hidden="true" />
    case 'electronica':
      return <IconoRayo className={className} aria-hidden="true" />
    case 'contabilidad':
      return <IconoAgenda className={className} aria-hidden="true" />
    case 'mecanica':
      return <IconoEngranaje className={className} aria-hidden="true" />
    case 'diseno':
      return <IconoCarnet className={className} aria-hidden="true" />
    case 'ejecutivo':
      return <IconoBirrete className={className} aria-hidden="true" />
    case 'ciencias':
      return <IconoColegio className={className} aria-hidden="true" />
    case 'auto':
    default:
      return <IconoEstrella className={className} aria-hidden="true" />
  }
}

