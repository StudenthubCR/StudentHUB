import { IconoBirrete, IconoUsuarios } from '@/components/icons'
import type { RolUsuario } from '@/features/estudiante/estudiante.fixture'
import { cn } from '@/lib/cn'

type Props = {
  rol: RolUsuario
  compacto?: boolean
  className?: string
}

export function BadgeRol({ rol, compacto = false, className }: Props) {
  const esEstudiante = rol === 'estudiante'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold shadow-2xs transition-all',
        esEstudiante
          ? 'bg-primary-tint text-primary border border-primary/25'
          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
        className,
      )}
      title={esEstudiante ? 'Sesión de Estudiante Oficial' : 'Sesión de Encargado Legal / Tutor'}
    >
      {esEstudiante ? (
        <IconoBirrete className="size-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <IconoUsuarios className="size-3.5 shrink-0" aria-hidden="true" />
      )}
      <span className={compacto ? 'hidden sm:inline' : 'inline'}>
        {esEstudiante ? 'Estudiante' : 'Encargado'}
      </span>
    </span>
  )
}
