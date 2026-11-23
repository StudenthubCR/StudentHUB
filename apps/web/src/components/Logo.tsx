import { cn } from '@/lib/cn'

type Props = {
  className?: string
  soloIcono?: boolean
  tamano?: 'compacto' | 'normal' | 'grande'
}

/**
 * Componente oficial de marca StudentHUB:
 * Combina el isotipo nítido (libro + birrete) sobre fondo transparente
 * con el wordmark tipográfico StudentHUB adaptable a modo claro y oscuro sin artefactos.
 */
export function Logo({ className, soloIcono = false, tamano = 'normal' }: Props) {
  const dimensionesIcono = {
    compacto: 'size-7 sm:size-7.5',
    normal: 'size-7 sm:size-8 xl:size-8.5',
    grande: 'size-9 sm:size-10 xl:size-12',
  }[tamano]

  const tamanoTexto = {
    compacto: 'text-[15px] sm:text-base',
    normal: 'text-[15px] sm:text-base xl:text-[18px]',
    grande: 'text-xl sm:text-2xl',
  }[tamano]

  return (
    <div className={cn('flex items-center gap-2 select-none shrink-0 min-w-0', className)}>
      <img
        src="/studenthub-icon.webp"
        alt="Isotipo StudentHUB"
        width={34}
        height={34}
        className={cn(
          'shrink-0 object-contain drop-shadow-2xs transition-transform duration-200',
          dimensionesIcono,
        )}
      />
      {!soloIcono && (
        <span
          className={cn(
            'font-black tracking-tight leading-none whitespace-nowrap text-text transition-colors duration-200',
            tamanoTexto,
          )}
        >
          Student<span className="text-primary font-black">HUB</span>
        </span>
      )}
    </div>
  )
}
