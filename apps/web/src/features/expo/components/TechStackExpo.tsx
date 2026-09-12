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

export function TechStackExpo() {
  const tecnologias = [
    {
      nombre: 'React 19',
      version: 'v19.2',
      rol: 'Frontend & UI',
      descripcion: 'Arquitectura por componentes reactivos, Hooks y alto rendimiento en renderizado.',
      logo: <LogoReact className="size-8" />,
      bordeHover: 'hover:border-[#61DAFB]/50 hover:shadow-[#61DAFB]/10',
      badgeColor: 'bg-[#61DAFB]/10 text-[#0284c7] border-[#61DAFB]/30',
    },
    {
      nombre: 'TypeScript',
      version: 'v5.9',
      rol: 'Tipado Estricto',
      descripcion: 'Cero errores de ejecución mediante tipado estricto en el 100% del código fuente.',
      logo: <LogoTypeScript className="size-8" />,
      bordeHover: 'hover:border-[#3178C6]/50 hover:shadow-[#3178C6]/10',
      badgeColor: 'bg-[#3178C6]/10 text-[#3178C6] border-[#3178C6]/30',
    },
    {
      nombre: 'Vite 7',
      version: 'v7.3',
      rol: 'Bundler & HMR',
      descripcion: 'Compilación ultrarrápida, recarga instantánea (HMR) y empaquetado optimizado en producción.',
      logo: <LogoVite className="size-8" />,
      bordeHover: 'hover:border-[#BD34FE]/50 hover:shadow-[#BD34FE]/10',
      badgeColor: 'bg-[#BD34FE]/10 text-[#9333ea] border-[#BD34FE]/30',
    },
    {
      nombre: 'Tailwind CSS',
      version: 'v4.3',
      rol: 'Design System',
      descripcion: 'Sistema de tokens `@theme` nativo, soporte de modo oscuro y micro-animaciones fluidas.',
      logo: <LogoTailwind className="size-8" />,
      bordeHover: 'hover:border-[#06B6D4]/50 hover:shadow-[#06B6D4]/10',
      badgeColor: 'bg-[#06B6D4]/10 text-[#0891b2] border-[#06B6D4]/30',
    },
    {
      nombre: 'Supabase',
      version: 'BaaS Oficial',
      rol: 'Auth & API',
      descripcion: 'Autenticación segura sin contraseñas al correo institucional y sincronización en tiempo real.',
      logo: <LogoSupabase className="size-8" />,
      bordeHover: 'hover:border-[#3ECF8E]/50 hover:shadow-[#3ECF8E]/10',
      badgeColor: 'bg-[#3ECF8E]/10 text-[#059669] border-[#3ECF8E]/30',
    },
    {
      nombre: 'PostgreSQL',
      version: 'Engine SQL',
      rol: 'Base de Datos',
      descripcion: 'Seguridad a nivel de fila (Row Level Security) garantizando privacidad estricta para cada estudiante.',
      logo: <LogoPostgres className="size-8" />,
      bordeHover: 'hover:border-[#336791]/50 hover:shadow-[#336791]/10',
      badgeColor: 'bg-[#336791]/10 text-[#2563eb] border-[#336791]/30',
    },
    {
      nombre: 'Cloudflare',
      version: 'Edge Network',
      rol: 'Infraestructura ¢0',
      descripcion: 'Alojamiento en red de borde mundial con latencia mínima, protección DDoS y costo cero.',
      logo: <LogoCloudflare className="size-8" />,
      bordeHover: 'hover:border-[#F38020]/50 hover:shadow-[#F38020]/10',
      badgeColor: 'bg-[#F38020]/10 text-[#d97706] border-[#F38020]/30',
    },
    {
      nombre: 'PWA Web App',
      version: 'Offline-First',
      rol: 'Estándar Web',
      descripcion: 'Service Workers con caché inteligente: la app abre y valida carnets sin consumir datos móviles.',
      logo: <LogoPwa className="size-8" />,
      bordeHover: 'hover:border-[#5A0FC8]/50 hover:shadow-[#5A0FC8]/10',
      badgeColor: 'bg-[#5A0FC8]/10 text-[#7c3aed] border-[#5A0FC8]/30',
    },
  ]

  return (
    <section id="tecnologias" className="py-14 sm:py-20 border-t border-border bg-surface/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/20 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-primary">
            <span>Stack de Grado Profesional</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Tecnologías y Estándares de la Industria
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Desarrollado con las mismas herramientas y estándares utilizados por las principales empresas de tecnología del mundo.
          </p>
        </div>

        {/* Grid de 8 Tecnologías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {tecnologias.map((tec) => (
            <div
              key={tec.nombre}
              className={`group relative rounded-3xl border border-border bg-surface p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${tec.bordeHover} flex flex-col justify-between`}
            >
              <div>
                {/* Cabecera de la tarjeta: Logo + Versión */}
                <div className="flex items-center justify-between gap-3">
                  <div className="p-2.5 rounded-2xl bg-surface-alt border border-border/80 group-hover:scale-105 transition-transform">
                    {tec.logo}
                  </div>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-micro font-mono font-bold ${tec.badgeColor}`}
                  >
                    {tec.version}
                  </span>
                </div>

                {/* Nombre y Rol */}
                <div className="mt-4">
                  <span className="text-micro font-bold uppercase tracking-wider text-text-muted">
                    {tec.rol}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {tec.nombre}
                  </h3>
                </div>

                {/* Descripción */}
                <p className="mt-2 text-menuda text-text-muted leading-relaxed">
                  {tec.descripcion}
                </p>
              </div>

              {/* Indicador sutil al pie */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-micro font-semibold text-text-muted/80">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                  Producción
                </span>
                <span className="group-hover:translate-x-0.5 transition-transform text-primary">
                  100% Nativo →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
