import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  titulo: string
  valor: string | number
  descripcion?: string
  icono: ReactNode
  cambio?: {
    valor: string
    positivo?: boolean
  }
  colorVariante?: 'primary' | 'emerald' | 'amber' | 'rose' | 'indigo'
}

export function StatCard({
  titulo,
  valor,
  descripcion,
  icono,
  cambio,
  colorVariante = 'primary',
}: Props) {
  const colores = {
    primary: {
      badge: 'bg-primary-tint text-primary border-primary/20',
      iconBox: 'bg-primary/10 text-primary border-primary/20',
    },
    emerald: {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconBox: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    amber: {
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      iconBox: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    rose: {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      iconBox: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    },
    indigo: {
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      iconBox: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
  }[colorVariante]

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-4.5 shadow-sm transition-all duration-200 hover:border-border-strong hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-micro font-bold uppercase tracking-wider text-text-muted">
            {titulo}
          </span>
          <p className="mt-1 text-2xl font-black tracking-tight text-text md:text-3xl">
            {valor}
          </p>
        </div>
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 hover:scale-105',
            colores.iconBox,
          )}
        >
          {icono}
        </span>
      </div>

      {(descripcion || cambio) && (
        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-menuda">
          {descripcion && (
            <span className="text-text-muted line-clamp-1">{descripcion}</span>
          )}
          {cambio && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-bold',
                cambio.positivo !== false
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
              )}
            >
              <span>{cambio.positivo !== false ? '↑' : '↓'}</span>
              <span>{cambio.valor}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
