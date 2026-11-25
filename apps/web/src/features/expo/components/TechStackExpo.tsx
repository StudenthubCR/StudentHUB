import { useRef } from 'react'
import {
  LogoCloudflare,
  LogoPostgres,
  LogoPwa,
  LogoReact,
  LogoSupabase,
  LogoTailwind,
  LogoTypeScript,
  LogoVite,
} from './TechLogos'
import { useScrollRevealExpoAnime } from '../useExpoAnime'

export function TechStackExpo() {
  const seccionRef = useRef<HTMLElement>(null)
  useScrollRevealExpoAnime(seccionRef, '[data-stack-reveal]')

  const tecnologias = [
    {
      nombre: 'React 19',
      version: 'v19.2',
      rol: 'Frontend & UI',
      descripcion: 'Arquitectura modular con Hooks, Lazy Routes y carga rápida por vistas.',
      logo: <LogoReact className="size-8" />,
      bordeHover: 'hover:border-[#61DAFB]/50 hover:shadow-[#61DAFB]/10',
      badgeColor: 'bg-[#61DAFB]/10 text-[#0284c7] dark:text-[#61DAFB] border-[#61DAFB]/30',
    },
    {
      nombre: 'TypeScript',
      version: 'v5.9',
      rol: 'Tipado Estricto',
      descripcion: 'Modelos compartidos entre Estudiante, Encargado, Docente y Administración.',
      logo: <LogoTypeScript className="size-8" />,
      bordeHover: 'hover:border-[#3178C6]/50 hover:shadow-[#3178C6]/10',
      badgeColor: 'bg-[#3178C6]/10 text-[#2563EB] dark:text-sky-300 border-[#3178C6]/30',
    },
    {
      nombre: 'Vite 7',
      version: 'v7.3',
      rol: 'Bundler & Split',
      descripcion: 'Code-splitting por ruta para mantener ligero el arranque móvil del estudiante.',
      logo: <LogoVite className="size-8" />,
      bordeHover: 'hover:border-[#BD34FE]/50 hover:shadow-[#BD34FE]/10',
      badgeColor: 'bg-[#BD34FE]/10 text-[#7c3aed] dark:text-purple-300 border-[#BD34FE]/30',
    },
    {
      nombre: 'Tailwind CSS',
      version: 'v4.3',
      rol: 'Design System',
      descripcion: 'Tokens semánticos `@theme`, modo claro/oscuro accesible y responsive móvil.',
      logo: <LogoTailwind className="size-8" />,
      bordeHover: 'hover:border-[#06B6D4]/50 hover:shadow-[#06B6D4]/10',
      badgeColor: 'bg-[#06B6D4]/10 text-[#0891b2] dark:text-cyan-300 border-[#06B6D4]/30',
    },
    {
      nombre: 'Supabase',
      version: 'BaaS + Auth',
      rol: 'Roles & Sync',
      descripcion: 'Sincronización de notas, asistencias, observaciones, agenda y comedor nocturno.',
      logo: <LogoSupabase className="size-8" />,
      bordeHover: 'hover:border-[#3ECF8E]/50 hover:shadow-[#3ECF8E]/10',
      badgeColor: 'bg-[#3ECF8E]/10 text-[#059669] dark:text-emerald-300 border-[#3ECF8E]/30',
    },
    {
      nombre: 'PostgreSQL',
      version: 'Strict RLS',
      rol: 'Privacidad 8968',
      descripcion: 'Row Level Security por especialidad y usuario para aislar registros sensibles.',
      logo: <LogoPostgres className="size-8" />,
      bordeHover: 'hover:border-[#336791]/50 hover:shadow-[#336791]/10',
      badgeColor: 'bg-[#336791]/10 text-[#2563EB] dark:text-sky-300 border-[#336791]/30',
    },
    {
      nombre: 'PWA + Anime.js',
      version: 'Offline + v4.5',
      rol: 'Experiencia Móvil',
      descripcion: 'Service Worker Stale-While-Revalidate más coreografía de movimiento bajo demanda.',
      logo: <LogoPwa className="size-8" />,
      bordeHover: 'hover:border-[#5A0FC8]/50 hover:shadow-[#5A0FC8]/10',
      badgeColor: 'bg-[#5A0FC8]/10 text-[#7c3aed] dark:text-violet-300 border-[#5A0FC8]/30',
    },
    {
      nombre: 'Cloudflare',
      version: 'Edge Network',
      rol: 'Infraestructura ¢0',
      descripcion: 'Despliegue global CDN con baja latencia y HTTPS automático para todo el colegio.',
      logo: <LogoCloudflare className="size-8" />,
      bordeHover: 'hover:border-[#F38020]/50 hover:shadow-[#F38020]/10',
      badgeColor: 'bg-[#F38020]/10 text-[#c2410c] dark:text-amber-300 border-[#F38020]/30',
    },
  ]

  return (
    <section
      ref={seccionRef}
      id="tecnologias"
      className="border-t border-border bg-surface/60 dark:bg-[#060B19] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div data-stack-reveal className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3.5 py-1 text-micro font-extrabold uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
            <span>Stack de Ingeniería</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Tecnologías Modernas y Estándares de Producción
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Construido con arquitectura modular, tipado estricto y pruebas automatizadas en Vitest.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {tecnologias.map((tec) => (
            <div
              key={tec.nombre}
              data-stack-reveal
              className={`group rounded-3xl border border-border bg-surface dark:bg-[#0F172A]/85 p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${tec.bordeHover}`}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-alt/80 dark:bg-slate-900">
                  {tec.logo}
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${tec.badgeColor}`}>
                  {tec.version}
                </span>
              </div>
              <div className="text-micro font-extrabold uppercase tracking-wider text-text-muted">
                {tec.rol}
              </div>
              <h3 className="mt-0.5 text-lg font-black text-text">{tec.nombre}</h3>
              <p className="mt-2 text-menuda text-text-muted leading-relaxed">
                {tec.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
