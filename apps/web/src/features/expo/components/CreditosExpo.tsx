import { Link } from 'react-router-dom'
import { IconoFlechaDerecha } from '@/components/icons'

export function CreditosExpo() {
  return (
    <footer className="py-14 border-t border-border bg-surface text-text">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-border">
          {/* Logo y resumen */}
          <div className="md:col-span-6 space-y-3">
            <div className="relative flex h-10 w-36 items-center overflow-hidden">
              <img
                src="/SHlarge.webp"
                alt="Student HUB"
                className="absolute top-1/2 left-[-35px] h-32 w-auto -translate-y-1/2 object-contain dark:brightness-0 dark:invert"
              />
            </div>
            <p className="text-nota text-text-muted max-w-md leading-relaxed">
              Plataforma digital estudiantil diseñada para modernizar la gestión colegial, carnetización y servicios de comedor en los Colegios Técnicos Profesionales de Costa Rica.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-micro font-bold text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                Versión 2026 · Expotécnica Oficial
              </span>
            </div>
          </div>

          {/* Ficha Institucional */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-etiqueta font-bold uppercase tracking-wider text-text">
              Institución y Especialidad
            </h4>
            <ul className="space-y-1.5 text-nota text-text-muted">
              <li>Colegio Técnico Profesional (CTP)</li>
              <li>Especialidad en Desarrollo Web & Software</li>
              <li>Educación Técnica y Vocacional (MEP)</li>
              <li>Ciclo Lectivo 2026</li>
            </ul>
          </div>

          {/* Enlaces de Acceso */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-etiqueta font-bold uppercase tracking-wider text-text">
              Acceso al Sistema
            </h4>
            <p className="text-menuda text-text-muted">
              ¿Eres estudiante matriculado o docente?
            </p>
            <Link
              to="/entrar"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-nota font-bold text-white hover:bg-primary-dark shadow-xs transition-all"
            >
              <span>Ingresar a Student HUB</span>
              <IconoFlechaDerecha className="size-4" />
            </Link>
          </div>
        </div>

        {/* Barra inferior de derechos */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-menuda text-text-muted">
          <p>
            © 2026 Student HUB. Desarrollado con ❤️ para la educación técnica pública de Costa Rica.
          </p>
          <div className="flex items-center gap-4">
            <a href="#hero" className="hover:text-primary transition-colors">
              Volver arriba ↑
            </a>
            <span>·</span>
            <a href="#ficha-tecnica" className="hover:text-primary transition-colors">
              Ficha Técnica
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
