import { IconoLuna, IconoSol } from '@/components/icons'
import { useTheme } from '../use-theme'

export function ThemeToggle() {
  const { theme, alternarTema } = useTheme()
  const esOscuro = theme === 'dark'

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-pressed={esOscuro}
      className={
        'flex size-10 cursor-pointer items-center justify-center rounded-full ' +
        'border border-border bg-surface-alt text-text transition-all duration-250 ease-ui ' +
        'hover:border-primary-tint-strong hover:bg-primary-tint hover:text-primary ' +
        'active:scale-90 md:size-11'
      }
    >
      {esOscuro ? <IconoLuna className="size-5" /> : <IconoSol className="size-5" />}
    </button>
  )
}
