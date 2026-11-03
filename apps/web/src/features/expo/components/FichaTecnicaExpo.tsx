import { IconoEscudo, IconoEngranaje, IconoCandado, IconoDispositivo } from '@/components/icons'
import {
  LogoReact,
  LogoTypeScript,
  LogoVite,
  LogoTailwind,
  LogoSupabase,
  LogoPostgres,
  LogoCloudflare,
  LogoPwa,
} from './TechLogos'

export function FichaTecnicaExpo() {
  const pilares = [
    {
      titulo: 'Frontend Moderno & Reactivo',
      icono: <IconoDispositivo className="size-5 text-blue-500" />,
      logos: [
        <LogoReact key="react" className="size-5" />,
        <LogoTypeScript key="ts" className="size-5" />,
        <LogoVite key="vite" className="size-5" />,
        <LogoTailwind key="tw" className="size-5" />,
      ],
      items: [
        { label: 'Framework', valor: 'React 19 (SPA) + TypeScript 5.9' },
        { label: 'Empaquetador', valor: 'Vite 7 (Fast HMR & Tree-shaking)' },
        { label: 'Motor de Estilos', valor: 'Tailwind CSS v4 con @theme nativo' },
        { label: 'Estrategia PWA', valor: 'Service Workers con Stale-While-Revalidate' },
      ],
    },
    {
      titulo: 'Backend & Base de Datos Segura',
      icono: <IconoEngranaje className="size-5 text-emerald-500" />,
      logos: [
        <LogoPostgres key="pg" className="size-5" />,
        <LogoSupabase key="sb" className="size-5" />,
      ],
      items: [
        { label: 'Base de Datos', valor: 'PostgreSQL administrado vía Supabase' },
        { label: 'Control de Acceso', valor: 'Row Level Security (RLS) a nivel de fila' },
        { label: 'Aislamiento', valor: 'Esquema multi-institución (multi-tenant)' },
        { label: 'Caché & Estado', valor: 'TanStack React Query v5' },
      ],
    },
    {
      titulo: 'Seguridad & Protección MEP (Ley 8968)',
      icono: <IconoEscudo className="size-5 text-purple-500" />,
      logos: [
        <IconoEscudo key="escudo" className="size-5 text-purple-500" />,
        <IconoCandado key="candado" className="size-5 text-purple-500" />,
      ],
      items: [
        { label: 'Cumplimiento Legal', valor: 'Ley 8968 (Protección de datos de menores)' },
        { label: 'Identidad Segura', valor: 'Validación por código OTP al correo MEP' },
        { label: 'Cero Contraseñas', valor: 'Sin contraseñas guardadas ni filtrables' },
        { label: 'Rol Jurídico', valor: 'Encargado del tratamiento de datos' },
      ],
    },
    {
      titulo: 'Sostenibilidad & Presupuesto ¢0',
      icono: <IconoCandado className="size-5 text-amber-500" />,
      logos: [
        <LogoCloudflare key="cf" className="size-5" />,
        <LogoPwa key="pwa" className="size-5" />,
      ],
      items: [
        { label: 'Infraestructura', valor: 'Cloudflare Pages en Edge Network global' },
        { label: 'Costo Operativo', valor: '¢0 mensuales para la institución pública' },
        { label: 'Optimización', valor: 'Assets WebP de alto rendimiento (< 500 KB)' },
        { label: 'Impacto Verde', valor: 'Eliminación del 100% del plástico en carnets' },
      ],
    },
  ]

  return (
    <section id="ficha-tecnica" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-purple-600">
            <span>Para Jueces y Docentes Evaluadores</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Ficha Técnica y Arquitectura del Proyecto
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Un diseño de ingeniería de software robusto, escalable y con estricto apego a estándares de seguridad y privacidad educativa.
          </p>
        </div>

        {/* Grid de Pilares Técnicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pilares.map((pilar, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-xs hover:border-primary/30 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-surface-alt border border-border">
                    {pilar.icono}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text">{pilar.titulo}</h3>
                </div>

                {/* Logos de las herramientas */}
                <div className="flex items-center gap-1.5 bg-surface-alt/70 px-2.5 py-1.5 rounded-xl border border-border/60">
                  {pilar.logos.map((logo, lIdx) => (
                    <span key={lIdx} className="transition-transform hover:scale-110">
                      {logo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {pilar.items.map((it, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between text-nota py-1.5 border-b border-border/40 last:border-0"
                  >
                    <span className="font-medium text-text-muted">{it.label}</span>
                    <span className="font-semibold text-text font-mono text-menuda sm:text-nota mt-0.5 sm:mt-0">
                      {it.valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Nota especial para los jueces sobre el Plan de Modernización */}
        <div className="mt-8 rounded-3xl border border-primary/20 bg-primary-tint/40 p-6 text-text">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-white text-micro font-bold uppercase tracking-wider mb-2">
                Evaluación Expotécnica 2026
              </span>
              <h4 className="text-lg font-bold text-text">
                Auditoría Técnica, Calidad de Código y Pruebas
              </h4>
              <p className="text-nota text-text-muted mt-1 max-w-2xl">
                El proyecto incluye suite de pruebas unitarias con Vitest, tipado estricto con TypeScript,
                estrategia de migración sin interrupción del servicio (Strangler Pattern) y zero-compromise
                en accesibilidad y contraste WCAG AA.
              </p>
            </div>
            <a
              href="#stand-qr"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-nota font-bold text-white hover:bg-primary-dark shadow-xs transition-colors"
            >
              <span>Ver en Vivo</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
