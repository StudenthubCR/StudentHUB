import { useRef } from 'react'
import {
  IconoBirrete,
  IconoCarnet,
  IconoCodigoQR,
  IconoDispositivo,
  IconoDocente,
  IconoEscudo,
  IconoFlechaDerecha,
  IconoRayo,
} from '@/components/icons'
import {
  lanzarPerfilDemo,
  METRICAS_HERO_EXPO,
} from '../expoDemo.service'
import { useHeroExpoAnime } from '../useExpoAnime'

type Props = {
  onAbrirInstalar?: () => void
}

export function HeroExpo({ onAbrirInstalar }: Props) {
  const heroRef = useRef<HTMLElement>(null)
  useHeroExpoAnime(heroRef)

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative overflow-hidden pt-24 pb-14 sm:pt-30 sm:pb-20 dark:bg-[#060B19]"
    >
      {/* Fondo Ambiental y Malla Vectorial Animada por Anime.js */}
      <div
        data-hero-orb
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-[440px] w-full max-w-5xl -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#2563EB]/20 via-[#38BDF8]/15 to-indigo-500/10 blur-[96px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-32 -right-24 -z-10 size-80 rounded-full bg-emerald-500/10 blur-[110px]"
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 1200 320"
        fill="none"
        className="pointer-events-none absolute inset-x-0 top-14 -z-10 mx-auto w-full max-w-6xl opacity-35 dark:opacity-25"
      >
        <path
          d="M 40 240 Q 280 80 600 170 T 1160 70"
          stroke="url(#expoHeroLineA)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="expo-draw-line"
        />
        <path
          d="M 80 280 Q 410 170 720 220 T 1120 140"
          stroke="url(#expoHeroLineB)"
          strokeWidth="1.2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          className="expo-draw-line"
        />
        <defs>
          <linearGradient id="expoHeroLineA" x1="40" y1="240" x2="1160" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" stopOpacity="0" />
            <stop offset="0.5" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expoHeroLineB" x1="80" y1="280" x2="1120" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#10B981" stopOpacity="0.65" />
            <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge Institucional Oficial */}
        <div
          data-hero-stagger
          className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#2563EB]/30 bg-primary-tint/85 px-4 py-1.5 text-etiqueta sm:text-nota font-bold text-primary shadow-xs backdrop-blur-md dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300"
        >
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CTP Rosario de Naranjo</span>
          <span className="text-text-muted">·</span>
          <span>Expotécnica 2026</span>
        </div>

        {/* Marca Visual Hero */}
        <div data-hero-stagger className="mt-5 flex justify-center">
          <img
            src="/studenthub-logo.webp"
            alt="Logo oficial StudentHUB"
            className="h-12 sm:h-14 w-auto object-contain block dark:hidden"
          />
          <img
            src="/studenthub-logo-dark.webp"
            alt="Logo oficial StudentHUB"
            className="h-12 sm:h-14 w-auto object-contain hidden dark:block"
          />
        </div>

        {/* Titular Principal */}
        <h1
          data-hero-stagger
          className="mt-4 text-3xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-text leading-[1.1]"
        >
          Plataforma Integral Estudiantil,{' '}
          <span className="bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-indigo-500 bg-clip-text text-transparent">
            Familiar y Docente en un Toque
          </span>
        </h1>

        <p
          data-hero-stagger
          className="mx-auto mt-4 max-w-3xl text-base sm:text-lg text-text-muted leading-relaxed"
        >
          Carnet digital 3D con QR verificable, boletín de calificaciones MEP, alerta temprana de
          asistencias, <strong>Modo Docente para Prof. Dangelo</strong>, agenda sincronizada,
          asistente virtual offline, horarios Diurno/Nocturno y reserva de comedor. Todo listo para
          probar al instante sin registro ni fricción.
        </p>

        {/* CTAs Primarios de Demostración en 1 Clic */}
        <div
          data-hero-stagger
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() =>
              lanzarPerfilDemo({
                rol: 'estudiante',
                estudianteId: '00000000-0000-0000-0000-000000000001',
                destino: '/',
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#0284C7] px-6 py-3.5 text-nota sm:text-dato font-black text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <IconoBirrete className="size-5" />
            <span>Probar como Estudiante / Encargado</span>
            <IconoFlechaDerecha className="size-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              lanzarPerfilDemo({
                rol: 'docente',
                destino: '/docente',
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-500/60 bg-amber-400/20 px-6 py-3.5 text-nota sm:text-dato font-black text-amber-950 dark:border-amber-400/50 dark:bg-amber-400/15 dark:text-amber-200 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-400/30 active:scale-95 cursor-pointer"
          >
            <IconoDocente className="size-5" />
            <span>Probar Modo Docente — Prof. Dangelo</span>
            <IconoFlechaDerecha className="size-4" />
          </button>
        </div>

        {/* Enlaces Rápidos de Exploración */}
        <div
          data-hero-stagger
          className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-micro font-bold"
        >
          <a
            href="#perfiles-demo"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/85 dark:bg-[#0F172A]/85 px-4 py-2 text-text transition-all hover:border-primary/50 hover:text-primary"
          >
            <IconoRayo className="size-3.5 text-primary dark:text-sky-400" />
            <span>Ver todos los perfiles demo</span>
          </a>
          <a
            href="#simulador"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/85 dark:bg-[#0F172A]/85 px-4 py-2 text-text transition-all hover:border-primary/50 hover:text-primary"
          >
            <IconoCarnet className="size-3.5 text-primary dark:text-sky-400" />
            <span>Simulador Carnet 3D</span>
          </a>
          <a
            href="#stand-qr"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/85 dark:bg-[#0F172A]/85 px-4 py-2 text-text transition-all hover:border-primary/50 hover:text-primary"
          >
            <IconoCodigoQR className="size-3.5 text-primary dark:text-sky-400" />
            <span>Escanear QR en Stand</span>
          </a>
          {onAbrirInstalar && (
            <button
              type="button"
              onClick={onAbrirInstalar}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint/85 px-4 py-2 text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300 transition-all hover:bg-primary-tint-strong cursor-pointer"
            >
              <IconoDispositivo className="size-3.5" />
              <span>Instalar PWA</span>
            </button>
          )}
        </div>

        {/* Panel de Métricas Cinéticas Animadas con Anime.js */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 text-left">
          {METRICAS_HERO_EXPO.map((metrica) => {
            const estilosAcento = {
              blue: {
                caja: 'dark:border-blue-500/25 hover:border-blue-500/50',
                iconoBg: 'bg-blue-500/15 text-[#2563EB] dark:text-[#38BDF8]',
                etiqueta: 'text-[#2563EB] dark:text-[#38BDF8]',
                Icono: IconoRayo,
              },
              sky: {
                caja: 'dark:border-sky-400/25 hover:border-sky-400/50',
                iconoBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
                etiqueta: 'text-sky-600 dark:text-sky-300',
                Icono: IconoBirrete,
              },
              emerald: {
                caja: 'dark:border-emerald-500/25 hover:border-emerald-500/50',
                iconoBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                etiqueta: 'text-emerald-600 dark:text-emerald-400',
                Icono: IconoDispositivo,
              },
              amber: {
                caja: 'dark:border-amber-500/25 hover:border-amber-500/50',
                iconoBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
                etiqueta: 'text-amber-700 dark:text-amber-300',
                Icono: IconoEscudo,
              },
            }[metrica.acento]

            const IconoMetrica = estilosAcento.Icono

            return (
              <div
                key={metrica.id}
                data-hero-card
                className={`rounded-3xl border border-border/90 bg-surface/85 dark:bg-[#0F172A]/85 p-4 sm:p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${estilosAcento.caja}`}
              >
                <div className={`mb-2.5 flex size-9 items-center justify-center rounded-2xl ${estilosAcento.iconoBg}`}>
                  <IconoMetrica className="size-4.5" />
                </div>

                {typeof metrica.valorNumerico === 'number' ? (
                  <div
                    data-counter-target={metrica.valorNumerico}
                    data-counter-prefix={metrica.prefijo ?? ''}
                    data-counter-suffix={metrica.sufijo ?? ''}
                    className="text-2xl sm:text-3xl font-black tracking-tight text-text"
                  >
                    {`${metrica.prefijo ?? ''}${metrica.valorNumerico}${metrica.sufijo ?? ''}`}
                  </div>
                ) : (
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-text">
                    {metrica.valorTextoEstatico}
                  </div>
                )}

                <div className={`mt-0.5 text-micro font-extrabold uppercase tracking-wider ${estilosAcento.etiqueta}`}>
                  {metrica.etiqueta}
                </div>
                <p className="mt-1 text-menuda text-text-muted leading-snug">
                  {metrica.detalle}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
