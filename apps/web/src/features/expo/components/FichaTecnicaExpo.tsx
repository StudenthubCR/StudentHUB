import { useRef } from 'react'
import {
  IconoCheck,
  IconoDispositivo,
  IconoDocente,
  IconoEscudo,
  IconoRayo,
} from '@/components/icons'
import { useScrollRevealExpoAnime } from '../useExpoAnime'

export function FichaTecnicaExpo() {
  const seccionRef = useRef<HTMLElement>(null)
  useScrollRevealExpoAnime(seccionRef, '[data-ficha-reveal]')

  const pilares = [
    {
      titulo: 'Privacidad por Diseño (Ley N° 8968)',
      icono: <IconoEscudo className="size-6 text-primary dark:text-sky-300" />,
      detalle:
        'Separación estricta entre feeds públicos de horarios/menú y datos sensibles en PostgreSQL.',
      puntos: [
        'Tablas estudiantes, notas, asistencias, docentes y agenda_docente protegidas con RLS',
        'El estudiante y encargado solo leen sus registros autorizados en solo-lectura',
        'Cero almacenamiento de datos personales en hojas públicas de cálculo',
      ],
    },
    {
      titulo: 'Modo Docente con Privilegio Mínimo',
      icono: <IconoDocente className="size-6 text-amber-600 dark:text-amber-300" />,
      detalle:
        'Cada docente se autentica sobre su tabla asignada y especialidad sin acceso cruzado.',
      puntos: [
        'Prof. Dangelo accesa exclusivamente al padrón de Desarrollo Web (10-1, 11-1, 12-1)',
        'Edición de calificaciones MEP 40/10/35/10/5 y pase de lista por bloque horario',
        'Exclusión verificada de Contabilidad, Ciberseguridad, Redes y Electromecánica',
      ],
    },
    {
      titulo: 'Arquitectura PWA Offline-First',
      icono: <IconoDispositivo className="size-6 text-emerald-600 dark:text-emerald-300" />,
      detalle:
        'Service Worker pre-cacheado con estrategias específicas y respaldo local en navegador.',
      puntos: [
        'Lectura de carnet 3D, horario del grupo, agenda y chatbot sin conexión celular',
        'Indicador claro cuando se navega sin red para evitar falsas expectativas',
        'Animaciones Anime.js aisladas en el chunk diferido de /expo para arranque veloz',
      ],
    },
    {
      titulo: 'Experiencia Responsiva & Accesible',
      icono: <IconoRayo className="size-6 text-sky-600 dark:text-sky-300" />,
      detalle:
        'Interfaz diseñada mobile-first para teléfonos (<1280px) y panel amplio en escritorio (>=1280px).',
      puntos: [
        'Soporte nativo de tema claro y oscuro con alto contraste WCAG',
        'Iconografía SVG limpia accesible sin dependencias frágiles ni emojis',
        'Respeto automático a preferencias del sistema prefers-reduced-motion',
      ],
    },
  ]

  return (
    <section
      ref={seccionRef}
      id="arquitectura"
      className="border-t border-border bg-surface-alt/35 dark:bg-[#0B1224]/70 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div data-ficha-reveal className="mx-auto max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3.5 py-1 text-micro font-extrabold uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
            <span>Ficha Técnica de Ingeniería</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Seguridad, Escalabilidad y Resiliencia Escolar
          </h2>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            Cuatro pilares que garantizan que StudentHUB opere de forma segura para menores de
            edad y estable frente a red escolar intermitente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pilares.map((pilar) => (
            <article
              key={pilar.titulo}
              data-ficha-reveal
              className="rounded-3xl border border-border bg-surface dark:bg-[#0F172A]/85 p-6 shadow-xs transition-all hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-surface-alt dark:bg-slate-900">
                  {pilar.icono}
                </span>
                <div>
                  <h3 className="text-lg font-black text-text">{pilar.titulo}</h3>
                </div>
              </div>
              <p className="mt-3 text-menor text-text-muted leading-relaxed">{pilar.detalle}</p>
              <ul className="mt-4 space-y-2 border-t border-border/70 pt-3.5 text-menuda text-text">
                {pilar.puntos.map((punto) => (
                  <li key={punto} className="flex items-start gap-2">
                    <IconoCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                    <span>{punto}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
