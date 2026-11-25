import { useState } from 'react'
import { ThemeToggle } from '@/app/layout/ThemeToggle'
import {
  IconoCerrar,
  IconoDescargar,
  IconoDocente,
  IconoFlechaDerecha,
  IconoRayo,
} from '@/components/icons'
import { lanzarPerfilDemo } from '../expoDemo.service'

type Props = {
  onAbrirInstalar?: () => void
}

const ENLACES_SECCION = [
  { href: '#hero', label: 'Inicio' },
  { href: '#perfiles-demo', label: 'Perfiles Demo' },
  { href: '#ecosistema', label: 'Módulos' },
  { href: '#simulador', label: 'Simulador 3D' },
  { href: '#rubrica', label: 'Rúbrica & Ley 8968' },
] as const

export function ExpoNavbar({ onAbrirInstalar }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/80 bg-surface/85 backdrop-blur-xl dark:border-sky-400/15 dark:bg-[#060B19]/85 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Marca Oficial */}
        <a
          href="#hero"
          className="flex items-center gap-2.5 min-w-0 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          aria-label="StudentHUB CTP Rosario de Naranjo — Ir al inicio"
        >
          <img
            src="/studenthub-logo.webp"
            alt="StudentHUB"
            className="h-8 w-auto object-contain block dark:hidden"
          />
          <img
            src="/studenthub-logo-dark.webp"
            alt="StudentHUB"
            className="h-8 w-auto object-contain hidden dark:block"
          />
          <span className="hidden sm:inline-flex items-center rounded-full border border-primary/25 bg-primary-tint px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
            Expotécnica 2026
          </span>
        </a>

        {/* Navegación Desktop >= xl */}
        <nav
          aria-label="Secciones de Expotécnica"
          className="hidden xl:flex items-center gap-1"
        >
          {ENLACES_SECCION.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              className="rounded-xl px-3 py-1.5 text-menor font-semibold text-text-muted transition-colors hover:bg-surface-alt hover:text-text dark:hover:bg-slate-800/70"
            >
              {enlace.label}
            </a>
          ))}
        </nav>

        {/* Acciones Directas (Cero Fricción Demo) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onAbrirInstalar && (
            <button
              type="button"
              onClick={onAbrirInstalar}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-alt/90 px-3 py-1.5 text-micro font-bold text-text transition-all hover:border-primary/40 hover:text-primary cursor-pointer"
            >
              <IconoDescargar className="size-3.5 text-primary" />
              <span>Instalar PWA</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              lanzarPerfilDemo({
                rol: 'docente',
                destino: '/docente',
              })
            }
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-micro font-extrabold text-amber-900 dark:text-amber-200 transition-all hover:bg-amber-500/25 cursor-pointer"
          >
            <IconoDocente className="size-3.5" />
            <span>Prof. Dangelo</span>
          </button>

          <button
            type="button"
            onClick={() =>
              lanzarPerfilDemo({
                rol: 'estudiante',
                estudianteId: '00000000-0000-0000-0000-000000000001',
                destino: '/',
              })
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#0284C7] px-3 sm:px-4 py-1.5 sm:py-2 text-micro sm:text-menor font-extrabold text-white shadow-sm shadow-blue-600/25 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <IconoRayo className="size-3.5 text-amber-300" />
            <span>Probar Demo</span>
            <IconoFlechaDerecha className="size-3 hidden sm:inline" />
          </button>

          <ThemeToggle />

          {/* Menú Móvil / Tablet < xl */}
          <button
            type="button"
            onClick={() => setMenuAbierto((prev) => !prev)}
            aria-expanded={menuAbierto}
            aria-label={menuAbierto ? 'Cerrar menú de secciones' : 'Abrir menú de secciones'}
            className="flex size-9 xl:hidden items-center justify-center rounded-full border border-border bg-surface-alt text-text transition-colors hover:border-primary/40 cursor-pointer"
          >
            {menuAbierto ? (
              <IconoCerrar className="size-4" />
            ) : (
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Cajón Navegación Móvil */}
      {menuAbierto && (
        <div className="xl:hidden border-t border-border bg-surface/95 dark:bg-[#0B1224]/95 px-4 py-3 backdrop-blur-xl">
          <nav aria-label="Navegación móvil de Expotécnica" className="grid grid-cols-2 gap-2">
            {ENLACES_SECCION.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                onClick={() => setMenuAbierto(false)}
                className="rounded-xl border border-border/80 bg-surface-alt/70 px-3 py-2 text-menor font-bold text-text hover:border-primary/40 hover:text-primary"
              >
                {enlace.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuAbierto(false)
                lanzarPerfilDemo({ rol: 'docente', destino: '/docente' })
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-menor font-black text-amber-900 dark:text-amber-200 cursor-pointer"
            >
              <IconoDocente className="size-3.5" />
              <span>Modo Docente</span>
            </button>
            {onAbrirInstalar && (
              <button
                type="button"
                onClick={() => {
                  setMenuAbierto(false)
                  onAbrirInstalar()
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary-tint px-3 py-2 text-menor font-bold text-primary cursor-pointer"
              >
                <IconoDescargar className="size-3.5" />
                <span>Instalar PWA</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
