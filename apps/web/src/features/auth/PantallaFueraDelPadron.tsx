import { useState } from 'react'
import { ThemeToggle } from '@/app/layout/ThemeToggle'
import { useSesion } from './useSesion'
import { IconoEscudo } from '@/components/icons'

interface PantallaFueraDelPadronProps {
  correo?: string | null
}

export function PantallaFueraDelPadron({ correo }: PantallaFueraDelPadronProps) {
  const { cerrarSesion } = useSesion()
  const [saliendo, setSaliendo] = useState(false)

  const manejarCierre = async () => {
    try {
      setSaliendo(true)
      await cerrarSesion()
      window.location.href = '/entrar'
    } catch (e) {
      console.error('Error al cerrar sesión:', e)
      setSaliendo(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-bg text-text antialiased">
      {/* Cabecera flotante */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/SHlarge.webp"
            alt="Student HUB"
            className="h-9 w-auto object-contain transition-all duration-250 dark:brightness-0 dark:invert"
          />
        </div>
        <ThemeToggle />
      </header>

      {/* Contenido central */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-surface p-7 text-center shadow-lg transition-all sm:p-9">
          {/* Luz de fondo sutil */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-48 w-48 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />

          {/* Ícono de advertencia / restricción */}
          <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400">
            <IconoEscudo className="size-10" />
          </div>

          {/* Insignia de estado */}
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-etiqueta font-semibold tracking-wider text-red-600 uppercase dark:text-red-400">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            Acceso Restringido
          </div>

          {/* Título principal */}
          <h1 className="mb-2 text-titulo font-bold tracking-tight text-text sm:text-subtitulo">
            Correo fuera del padrón
          </h1>

          {/* Correo del usuario */}
          {correo && (
            <div className="mx-auto mb-4 inline-block max-w-full truncate rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-menuda font-mono text-text-muted">
              {correo}
            </div>
          )}

          {/* Explicación institucional */}
          <p className="mb-6 text-menor leading-relaxed text-text-muted">
            Este correo electrónico no figura registrado en el padrón de estudiantes matriculados en
            el ciclo lectivo actual. Por disposiciones de seguridad institucional, el acceso a
            Student HUB está reservado exclusivamente para la comunidad estudiantil activa.
          </p>

          <div className="mb-6 rounded-xl border border-border/80 bg-surface-alt/70 p-3.5 text-left text-menuda text-text-muted">
            <p className="font-semibold text-text">¿Considerás que es un error?</p>
            <p className="mt-1">
              Verificá haber ingresado con tu correo institucional o personal reportado en la
              matrícula. Si el problema persiste, comunicate con la administración académica de tu
              institución.
            </p>
          </div>

          {/* Botón de acción */}
          <button
            type="button"
            onClick={manejarCierre}
            disabled={saliendo}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-solid px-5 py-3.5 text-menor font-bold text-white transition-all duration-200 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión e intentar con otro correo'}
          </button>
        </div>
      </main>

      {/* Pie institucional */}
      <footer className="py-4 text-center text-menuda text-text-muted">
        Student HUB &bull; Sistema Institucional Protegido
      </footer>
    </div>
  )
}
