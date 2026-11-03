import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/app/use-theme'
import { IconoSol, IconoLuna, IconoDescargar } from '@/components/icons'

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
    { href: '#simulador', label: 'Simulador 3D' },
    { href: '#modulos', label: 'Módulos' },
    { href: '#problema', label: 'Problema vs Solución' },
    { href: '#ficha-tecnica', label: 'Ficha Técnica' },
    { href: '#rubrica', label: 'Rúbrica Jueces' },
    { href: '#stand-qr', label: 'Escanear QR' },
  ]

  const entrarModoDemo = () => {
    localStorage.setItem('studenthub_demo_sesion', 'true')
    window.location.href = '/'
  }

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        hizoScroll
          ? 'border-b border-border/60 bg-surface/85 shadow-md backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo con espaciado balanceado */}
        <div className="flex items-center gap-3">
          <a href="#hero" className="flex items-center group">
            <div className="relative flex h-10 w-28 sm:w-32 items-center overflow-hidden">
              <img
                src="/SHlarge.webp"
                alt="Student HUB"
                className="absolute top-1/2 left-[-30px] h-32 w-auto -translate-y-1/2 object-contain transition-transform duration-300 group-hover:scale-105 dark:brightness-0 dark:invert"
              />
            </div>
          </a>
          <span className="inline-flex items-center gap-1 rounded-md bg-primary-tint border border-primary/25 px-2 py-0.5 text-[10px] font-black tracking-widest text-primary uppercase shadow-2xs">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Expo 2026
          </span>
        </div>

        {/* Links de navegación en escritorio con hover tipo píldora */}
        <nav className="hidden xl:flex items-center gap-1 text-nota font-semibold text-text-muted">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-full transition-all duration-150 hover:text-primary hover:bg-surface-alt/80 active:scale-95 ${
                link.href === '#rubrica'
                  ? 'text-primary font-bold bg-primary-tint/30'
                  : ''
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Acciones: Modo Oscuro, Instalar, Botón Juez y Entrar */}
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
              className="hidden lg:flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint px-3 py-1.5 text-etiqueta font-semibold text-primary transition-all duration-200 hover:bg-primary-tint-strong active:scale-95"
            >
              <IconoDescargar className="size-3.5" />
              <span>Instalar</span>
            </button>
          )}

          {/* Botón directo de Modo Juez (1 Clic) con brillo visual */}
          <button
            type="button"
            onClick={entrarModoDemo}
            className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-light px-4 py-1.5 text-etiqueta sm:text-nota font-black text-white shadow-md shadow-primary/30 ring-1 ring-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Entrar a la app real en modo demostración para evaluadores"
          >
            <span>⚡ Modo Juez</span>
          </button>

          <Link
            to="/entrar"
            className="hidden sm:flex cursor-pointer items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-etiqueta text-text-muted hover:text-text hover:border-primary/40 transition-colors"
          >
            <span>Login MEP</span>
          </Link>

          {/* Botón hamburguesa móvil */}
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-text-muted xl:hidden active:scale-95"
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
        <div className="border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-xl xl:hidden animate-fade-in shadow-xl">
          <nav className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMenuMovilAbierto(false)
                entrarModoDemo()
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light px-3 py-2.5 text-nota font-bold text-white shadow-md cursor-pointer"
            >
              <span>⚡ Probar App Real (Modo Juez)</span>
            </button>

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

            <Link
              to="/entrar"
              onClick={() => setMenuMovilAbierto(false)}
              className="rounded-lg px-3 py-2 text-nota font-medium text-text-muted hover:bg-surface-alt"
            >
              Acceso Institucional MEP (@est.mep.go.cr)
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
