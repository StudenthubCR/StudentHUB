import { IconoBirrete, IconoDocente, IconoUsuarios, IconoEscudo } from '@/components/icons'
import type { ModoPerspectiva, RolUsuario } from '@/features/estudiante/estudiante.fixture'
import { cn } from '@/lib/cn'

type Props = {
  rol?: RolUsuario | 'docente'
  perspectiva?: ModoPerspectiva
  especialidad?: string
  compacto?: boolean
  className?: string
}

export function BadgeRol({ rol, perspectiva, especialidad, compacto = false, className }: Props) {
  if (rol === 'docente') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold shadow-2xs transition-all',
          'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/35',
          className,
        )}
        title={`Modo Docente${especialidad ? ` · ${especialidad}` : ''}`}
      >
        <IconoDocente className="size-3.5 shrink-0" aria-hidden="true" />
        <span className={compacto ? 'hidden sm:inline' : 'inline'}>
          {especialidad && !compacto ? `Docente · ${especialidad}` : 'Docente'}
        </span>
      </span>
    )
  }

  // Si viene perspectiva explícita, usarla; si viene rol, mapearlo.
  const modo: ModoPerspectiva = perspectiva ?? (rol === 'encargado' ? 'encargado' : 'ambos')

  if (modo === 'ambos') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold shadow-2xs transition-all',
          'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30',
          className,
        )}
        title="Acceso Familiar Unificado (Estudiante y Encargado)"
      >
        <IconoUsuarios className="size-3.5 shrink-0" aria-hidden="true" />
        <span className={compacto ? 'hidden sm:inline' : 'inline'}>Familia</span>
      </span>
    )
  }

  if (modo === 'encargado') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold shadow-2xs transition-all',
          'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
          className,
        )}
        title="Perspectiva de Encargado Legal / Acompañamiento Familiar"
      >
        <IconoEscudo className="size-3.5 shrink-0" aria-hidden="true" />
        <span className={compacto ? 'hidden sm:inline' : 'inline'}>Encargado</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-bold shadow-2xs transition-all',
        'bg-primary-tint text-primary border border-primary/25',
        className,
      )}
      title="Perspectiva de Estudiante Oficial"
    >
      <IconoBirrete className="size-3.5 shrink-0" aria-hidden="true" />
      <span className={compacto ? 'hidden sm:inline' : 'inline'}>Estudiante</span>
    </span>
  )
}
