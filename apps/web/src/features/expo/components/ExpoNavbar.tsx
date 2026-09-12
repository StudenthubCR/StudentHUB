import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/app/use-theme'
import { IconoSol, IconoLuna, IconoFlechaDerecha, IconoDescargar } from '@/components/icons'

type Props = {
  onAbrirInstalar?: () => void
}

export function ExpoNavbar({ onAbrirInstalar }: Props) {
  const { theme, alternarTema } = useTheme()
  const [hizoScroll, setHizoScroll] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  useEffect(() => {
    const alHacerScroll = () => {
      setHizoScroll(window.scrollY > 20)
    }
    window.addEventListener('scroll', alHacerScroll, { passive: true })
    return () => window.removeEventListener('scroll', alHacerScroll)
  }, [])

  const navLinks = [
    { href: '#tecnologias', label: 'Tecnologías' },
    { href: '#simulador', label: 'Simulador 3D' },
    { href: '#problema', label: 'Problema vs Solución' },
    { href: '#modulos', label: 'Módulos' },
    { href: '#ficha-tecnica', label: 'Ficha Técnica' },
    { href: '#stand-qr', label: 'Escanear QR' },
  ]

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        hizoScroll
          ? 'border-b border-border/40 bg-surface/85 shadow-sm backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-36 items-center overflow-hidden">
            <img
              src="/SHlarge.webp"
              alt="Student HUB"
              className="absolute top-1/2 left-[-35px] h-32 w-auto -translate-y-1/2 object-contain transition-transform duration-300 group-hover:scale-105 dark:brightness-0 dark:invert"
            />
          </div>
          <span className="hidden sm:inline-block rounded-full bg-primary-tint border border-primary/25 px-2.5 py-0.5 text-micro font-bold tracking-wider text-primary uppercase">
            Expo 2026
          </span>
        </a>

        {/* Links de escritorio */}
        <nav className="hidden md:flex items-center gap-6 text-nota font-medium text-text-muted">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-150 hover:text-primary active:scale-98"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Acciones: Modo Oscuro, Instalar y Entrar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={alternarTema}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-all duration-200 hover:border-primary/40 hover:text-primary hover:shadow-xs active:scale-95"
            aria-label={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <IconoSol className="size-4" /> : <IconoLuna className="size-4" />}
          </button>

          {onAbrirInstalar && (
            <button
              type="button"
              onClick={onAbrirInstalar}
              className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint px-3 py-1.5 text-etiqueta font-semibold text-primary transition-all duration-200 hover:bg-primary-tint-strong active:scale-95"
            >
              <IconoDescargar className="size-3.5" />
              <span>Instalar</span>
            </button>
          )}

          <Link
            to="/entrar"
            className="flex cursor-pointer items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-etiqueta sm:text-nota font-semibold text-white shadow-xs transition-all duration-200 hover:bg-primary-dark hover:shadow-md active:scale-95"
          >
            <span>Acceder</span>
            <IconoFlechaDerecha className="size-3.5" />
          </Link>

          {/* Botón hamburguesa móvil */}
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-text-muted md:hidden active:scale-95"
            aria-label="Abrir menú"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuMovilAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú desplegable en móviles */}
      {menuMovilAbierto && (
        <div className="border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md md:hidden animate-fade-in shadow-md">
          <nav className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuMovilAbierto(false)}
                className="rounded-lg px-3 py-2 text-nota font-medium text-text-muted hover:bg-surface-alt hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            {onAbrirInstalar && (
              <button
                type="button"
                onClick={() => {
                  setMenuMovilAbierto(false)
                  onAbrirInstalar()
                }}
                className="flex items-center gap-2 rounded-lg bg-primary-tint px-3 py-2 text-nota font-semibold text-primary"
              >
                <IconoDescargar className="size-4" />
                <span>Instalar App en este teléfono</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
