import type { ReactNode } from 'react'
import {
  IconoCarnet,
  IconoComedor,
  IconoCalendario,
  IconoAgenda,
  IconoDispositivo,
  IconoCerrar,
  IconoCheck,
} from '@/components/icons'

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
  const comparativas: Comparativa[] = [
    {
      titulo: 'Carnet Estudiantil',
      icono: <IconoCarnet className="size-6 text-primary" />,
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
        etiqueta: 'Con Student HUB',
        puntos: [
          'Credencial digital interactiva siempre en el celular',
          'Costo ¢0 de reposición para el colegio y las familias',
          'Código QR dinámico anti-capturas y datos médicos en reverso',
          'Activación inmediata desde el primer día lectivo',
        ],
      },
    },
    {
      titulo: 'Comedor Estudiantil',
      icono: <IconoComedor className="size-6 text-primary" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Hojas de papel y listas impresas con lápiz',
          'Filas de más de 30 minutos esperando verificación manual',
          'Desconocimiento del menú nutricional del día',
          'Dificultad para auditar raciones y becas de comedor',
        ],
      },
      solucion: {
        etiqueta: 'Con Student HUB',
        puntos: [
          'Validación digital por código QR en menos de 1 segundo',
          'Reducción drástica del tiempo de espera en la fila',
          'Consulta del menú semanal con balance nutricional',
          'Reporte y conteo automático de platos servidos',
        ],
      },
    },
    {
      titulo: 'Horarios y Comunicación',
      icono: <IconoCalendario className="size-6 text-primary" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Hojas pegadas en murales de pasillo que se dañan',
          'Confusión cuando hay rotación de talleres o docentes',
          'Estudiantes desorientados con horas libres',
          'Imposible consultar fuera del colegio',
        ],
      },
      solucion: {
        etiqueta: 'Con Student HUB',
        puntos: [
          'Horario dinámico por sección disponible 24/7',
          'Indicador en vivo de "Lección en Curso" y "Siguiente Aula"',
          'Sincronizado directamente con las fuentes oficiales',
          'Consulta instantánea en móvil, tablet o PC',
        ],
      },
    },
    {
      titulo: 'Agenda & Avisos Docentes',
      icono: <IconoAgenda className="size-6 text-primary" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Avisos de docentes ausentes pegados en papel tarde en el día',
          'Estudiantes que viajan kilómetros en bus para toparse con horas libres',
          'Fechas de tareas y exámenes anotadas en cuadernos que se pierden',
          'Falta de recordatorios oportunos para proyectos técnicos',
        ],
      },
      solucion: {
        etiqueta: 'Con Student HUB',
        puntos: [
          'Alertas en vivo de profesores ausentes con guía de trabajo autónomo',
          'Planificación previa de horas libres y tiempos de estudio',
          'Calendario de exámenes con cuenta regresiva en días',
          'Checklist interactivo de entregas disponible 100% offline',
        ],
      },
    },
    {
      titulo: 'Conectividad y Redes',
      icono: <IconoDispositivo className="size-6 text-primary" />,
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Sistemas web pesados que no abren sin Wi-Fi veloz',
          'Requiere descarga de tiendas (Google Play / App Store)',
          'Gran consumo de datos celulares de los estudiantes',
          'Inaccesible en zonas del colegio sin cobertura',
        ],
      },
      solucion: {
        etiqueta: 'Con Student HUB',
        puntos: [
          'PWA ultraligera (< 500 KB) con Service Workers Stale-While-Revalidate',
          'Instalación directa en 1 toque desde el navegador sin tiendas',
          'Consumo prácticamente nulo de datos móviles',
          '100% funcional en cualquier rincón del colegio sin señal',
        ],
      },
    },
  ]

  return (
    <section id="problema" className="py-16 sm:py-24 bg-surface-alt/30 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/20 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-primary">
            <span>Diagnóstico & Solución</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Problemas Reales de los Colegios Técnicos
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Analizamos la vida cotidiana de un estudiante de CTP y eliminamos las fricciones
            que provocan pérdidas de tiempo, costos innecesarios y desinformación.
          </p>
        </div>

        {/* Rejilla de Comparativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparativas.map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border bg-surface p-6 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-tint border border-primary/20">
                  {item.icono}
                </span>
                <h3 className="text-lg font-bold text-text">{item.titulo}</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tradicional (Rojo / Warning) */}
                <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-4">
                  <div className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
                    <IconoCerrar className="size-3 shrink-0" aria-hidden="true" />
                    <span>{item.problema.etiqueta}</span>
                  </div>
                  <ul className="space-y-2 text-menuda text-text-muted">
                    {item.problema.puntos.map((punto, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 text-xs shrink-0 mt-0.5" aria-hidden="true">•</span>
                        <span>{punto}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Con Student HUB (Verde / Éxito) */}
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                  <div className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                    <IconoCheck className="size-3 shrink-0" aria-hidden="true" />
                    <span>{item.solucion.etiqueta}</span>
                  </div>
                  <ul className="space-y-2 text-menuda text-text">
                    {item.solucion.puntos.map((punto, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5 font-medium">
                        <IconoCheck className="size-3 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
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
