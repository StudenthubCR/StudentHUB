import { IconoEscudo } from '@/components/icons'

export function CreditosExpo() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface dark:bg-[#060B19] py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img
              src="/studenthub-logo.webp"
              alt="Logo StudentHUB"
              className="h-9 w-auto object-contain block dark:hidden"
            />
            <img
              src="/studenthub-logo-dark.webp"
              alt="Logo StudentHUB"
              className="h-9 w-auto object-contain hidden dark:block"
            />
            <p className="mt-2.5 text-menor text-text-muted max-w-md">
              Ecosistema Estudiantil, Familiar y Docente desarrollado para la{' '}
              <strong className="text-text">Expotécnica 2026</strong> del{' '}
              <strong className="text-text">CTP Rosario de Naranjo</strong>.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-micro font-bold text-emerald-700 dark:text-emerald-300">
              <IconoEscudo className="size-3.5" />
              <span>Cumplimiento Ley N° 8968 · PRODHAB CR</span>
            </div>
            <p className="text-micro text-text-muted">
              Especialidad Desarrollo Web · {year}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
