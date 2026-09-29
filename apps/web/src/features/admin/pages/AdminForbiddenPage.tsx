import { Link } from 'react-router-dom'
import { useSesion } from '@/features/auth/useSesion'

export function AdminForbiddenPage() {
  const { sesion, cerrarSesion } = useSesion()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {/* Badge de seguridad */}
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-3xl border border-rose-500/25 bg-rose-500/10 text-rose-600 shadow-md">
          <svg
            className="size-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
            !
          </span>
        </div>

        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-0.5 text-micro font-black uppercase tracking-wider text-rose-600">
          403 · Acceso Restringido
        </span>

        <h1 className="text-titulo font-black text-text md:text-hero">
          Privilegios de Administrador Requeridos
        </h1>

        <p className="mt-2.5 text-menor text-text-muted">
          El panel de control administrativo está estrictamente reservado para la Dirección y la cuenta oficial de administración del colegio.
        </p>

        {sesion?.user?.email && (
          <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-2.5 text-menuda text-text-muted">
            <span>Usuario autenticado actualmente: </span>
            <strong className="text-text">{sesion.user.email}</strong>
          </div>
        )}

        <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row">
          <Link
            to="/"
            className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-98"
          >
            ← Volver a la App Estudiantil
          </Link>
          <button
            type="button"
            onClick={() => void cerrarSesion()}
            className="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-menor font-semibold text-text-muted transition-all hover:border-border-strong hover:bg-surface-alt hover:text-text active:scale-98"
          >
            Cambiar de cuenta
          </button>
        </div>

        <p className="mt-6 text-micro text-text-muted">
          Si sos miembro del personal administrativo y necesitás acceso, comunicate con soporte técnico institucional.
        </p>
      </div>
    </div>
  )
}
