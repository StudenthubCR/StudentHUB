import { useRef, type ReactNode } from 'react'
import {
  IconoAgenda,
  IconoCalendario,
  IconoCarnet,
  IconoCerrar,
  IconoCheck,
  IconoComedor,
  IconoDispositivo,
  IconoDocente,
} from '@/components/icons'
import { useScrollRevealExpoAnime } from '../useExpoAnime'

type Comparativa = {
  titulo: string
  icono: ReactNode
  problema: {
    etiqueta: string
    puntos: string[]
  }
  solucion: {
    etiqueta: string
    puntos: string[]
  }
}

export function ProblemaSolucionExpo() {
  const seccionRef = useRef<HTMLElement>(null)
  useScrollRevealExpoAnime(seccionRef, '[data-comparativa-reveal]')

  const comparativas: Comparativa[] = [
    {
      titulo: 'Carnet Estudiantil',
      icono: <IconoCarnet className="size-6 text-primary dark:text-sky-300" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Carnets de cartulina o PVC que se rompen o se pierden',
          'Costo de reposición de ¢2.500 a ¢5.000 para las familias',
          'Fácil de alterar o prestar entre estudiantes',
          'Semanas de espera para la entrega al inicio del año',
        ],
      },
      solucion: {
        etiqueta: 'Con StudentHUB',
        puntos: [
          'Credencial digital 3D interactiva siempre en el celular',
          'Costo ¢0 de reposición para el colegio y las familias',
          'Código QR verificable y datos de emergencia al reverso',
          'Activación inmediata desde el primer día lectivo',
        ],
      },
    },
    {
      titulo: 'Gestión Docente y Notas MEP',
      icono: <IconoDocente className="size-6 text-amber-600 dark:text-amber-300" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Hojas dispersas sin visibilidad continua para la familia',
          'Cálculo manual de rubros sujeto a errores aritméticos',
          'Detección tardía cuando el estudiante ya acumula ausencias',
          'Datos personales mezclados en listas sin control de acceso',
        ],
      },
      solucion: {
        etiqueta: 'Con StudentHUB',
        puntos: [
          'Modo Docente (Prof. Dangelo) estricto a Desarrollo Web',
          'Ponderación MEP automática 40 / 10 / 35 / 10 / 5 al instante',
          'Alerta Temprana automática desde 3 ausencias injustificadas',
          'Datos sensibles aislados en Supabase con políticas RLS',
        ],
      },
    },
    {
      titulo: 'Comedor Estudiantil',
      icono: <IconoComedor className="size-6 text-emerald-600 dark:text-emerald-300" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Hojas de papel y listas impresas con lápiz',
          'Filas extensas esperando verificación manual',
          'Desconocimiento del menú semanal antes de llegar al comedor',
          'Desperdicio o faltante de cenas en la Sección Nocturna',
        ],
      },
      solucion: {
        etiqueta: 'Con StudentHUB',
        puntos: [
          'Validación digital por código QR en el carnet estudiantil',
          'Menú diario y semanal sincronizado por semana de ciclo',
          'Confirmación nocturna previa ("Comeré hoy / No comeré hoy")',
          'Métricas de raciones por especialidad y sección en tiempo real',
        ],
      },
    },
    {
      titulo: 'Horarios y Comunicación',
      icono: <IconoCalendario className="size-6 text-blue-600 dark:text-sky-300" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Hojas pegadas en murales de pasillo que se dañan',
          'Confusión cuando hay rotación de talleres o docentes',
          'Estudiantes desorientados con horas libres o cambios',
          'Imposible consultar en casa sin conexión o fuera del CTP',
        ],
      },
      solucion: {
        etiqueta: 'Con StudentHUB',
        puntos: [
          'Horario dinámico Diurno y Nocturno disponible 24/7',
          'Indicador en vivo de "Clase Ahora" y "Resto del Día"',
          'Asistente virtual offline para preguntar por hoy o mañana',
          'Consulta instantánea con caché local en móvil o escritorio',
        ],
      },
    },
    {
      titulo: 'Agenda & Avisos Docentes',
      icono: <IconoAgenda className="size-6 text-indigo-600 dark:text-indigo-300" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Avisos de docentes ausentes pegados en papel tarde en el día',
          'Familias sin visibilidad unificada de entregas y exámenes',
          'Fechas de proyectos técnicos anotadas en cuadernos sueltos',
          'Comunicados generales sin segmentación por sección',
        ],
      },
      solucion: {
        etiqueta: 'Con StudentHUB',
        puntos: [
          'Tareas, exámenes y ausencias creadas por el docente al instante',
          'Cuenta familiar única para revisar uno o varios hijos',
          'Calendario con cuenta regresiva y checklist interactivo offline',
          'Avisos filtrados por nivel, especialidad y grupo académico',
        ],
      },
    },
    {
      titulo: 'Conectividad y Privacidad',
      icono: <IconoDispositivo className="size-6 text-cyan-600 dark:text-cyan-300" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Sistemas web pesados que fallan sin Wi-Fi estable',
          'Requiere descarga desde tiendas (Google Play / App Store)',
          'Alto consumo de datos móviles del estudiante',
          'Exposición de datos en hojas públicas compartidas',
        ],
      },
      solucion: {
        etiqueta: 'Con StudentHUB',
        puntos: [
          'PWA ultraligera con Service Workers Stale-While-Revalidate',
          'Instalación en 1 toque desde navegador en Android, iOS y PC',
          'Uso continuo en zonas del colegio sin cobertura celular',
          'Cumplimiento estricto Ley N° 8968 (PRODHAB) vía Supabase RLS',
        ],
      },
    },
  ]

  return (
    <section
      ref={seccionRef}
      id="problema"
      className="border-t border-border bg-surface-alt/35 dark:bg-[#0B1224]/70 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-comparativa-reveal className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3.5 py-1 text-micro font-extrabold uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
            <span>Diagnóstico & Transformación Digital</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Fricciones Reales del Colegio Técnico, Resueltas
          </h2>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            Diseñamos StudentHUB a partir de la dinámica cotidiana del{' '}
            <strong>CTP Rosario de Naranjo</strong> en jornadas diurna y nocturna.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {comparativas.map((item) => (
            <div
              key={item.titulo}
              data-comparativa-reveal
              className="rounded-3xl border border-border bg-surface dark:bg-[#0F172A]/85 p-5 sm:p-6 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:border-primary/40"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-border/80">
                <span className="flex size-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary-tint dark:bg-sky-400/10">
                  {item.icono}
                </span>
                <h3 className="text-lg font-black text-text">{item.titulo}</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-micro font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    <IconoCerrar className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.problema.etiqueta}</span>
                  </div>
                  <ul className="space-y-2 text-menuda text-text-muted">
                    {item.problema.puntos.map((punto) => (
                      <li key={punto} className="flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0 text-xs font-bold text-rose-500" aria-hidden="true">
                          -
                        </span>
                        <span>{punto}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-micro font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <IconoCheck className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.solucion.etiqueta}</span>
                  </div>
                  <ul className="space-y-2 text-menuda text-text">
                    {item.solucion.puntos.map((punto) => (
                      <li key={punto} className="flex items-start gap-1.5 font-medium">
                        <IconoCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                        <span>{punto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
