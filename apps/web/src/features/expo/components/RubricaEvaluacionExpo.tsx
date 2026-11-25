import { useRef } from 'react'
import {
  IconoBirrete,
  IconoCheck,
  IconoDispositivo,
  IconoDocente,
  IconoEscudo,
  IconoFlechaDerecha,
  IconoRayo,
} from '@/components/icons'
import { lanzarPerfilDemo } from '../expoDemo.service'
import { useScrollRevealExpoAnime } from '../useExpoAnime'

export function RubricaEvaluacionExpo() {
  const seccionRef = useRef<HTMLElement>(null)
  useScrollRevealExpoAnime(seccionRef, '[data-rubrica-reveal]')

  const criterios = [
    {
      num: '01',
      criterio: 'Impacto Social & Costo Operativo',
      evidencia:
        'Elimina costos anuales de reposición de carnets físicos, reduce filas en comedor y evita desperdicio en la cena de la Sección Nocturna.',
      puntajeBadge: 'Solución Directa',
    },
    {
      num: '02',
      criterio: 'Innovación Tecnológica & Offline-First',
      evidencia:
        'PWA instalable sin tiendas, asistente virtual en lenguaje natural offline y simulador 3D con QR e inclinación holográfica.',
      puntajeBadge: 'PWA + React 19',
    },
    {
      num: '03',
      criterio: 'Control de Acceso Docente & Familias',
      evidencia:
        'Modo Docente para Prof. Dangelo aislado estrictamente a Desarrollo Web, enlazado en vivo con la cuenta única de Estudiante y Encargado.',
      puntajeBadge: 'RBAC Estricto',
    },
    {
      num: '04',
      criterio: 'Seguridad & Privacidad (Ley N° 8968)',
      evidencia:
        'Datos de estudiantes, notas, asistencias y docentes resguardados exclusivamente en Supabase PostgreSQL con políticas RLS por rol y especialidad.',
      puntajeBadge: 'PRODHAB CR',
    },
    {
      num: '05',
      criterio: 'Viabilidad de Adopción Institucional',
      evidencia:
        'Arquitectura escalable de 7° a 12° para múltiples especialidades técnicas y panel administrativo listo para el CTP Rosario de Naranjo.',
      puntajeBadge: 'Listo para CTP',
    },
  ]

  const preguntasFrecuentes = [
    {
      q: '¿Cómo se prueban los distintos roles en la Expotécnica sin crear cuentas?',
      a: 'Desde este portal /expo basta un clic sobre cualquier perfil demo (Prof. Dangelo, Erick, María Elena, Lucía o Andrés) para entrar directo sin formularios ni fricción. Todo cambio hecho en Modo Docente se refleja inmediatamente al abrir un perfil de Desarrollo Web.',
    },
    {
      q: '¿Por qué Prof. Dangelo solo visualiza estudiantes de Desarrollo Web?',
      a: 'Por el principio de privilegio mínimo y cumplimiento de la Ley N° 8968: la tabla docentes y las políticas RLS en PostgreSQL filtran por especialidad asignada, impidiendo ver o modificar alumnos de Contabilidad, Electromecánica, Redes o Ciberseguridad.',
    },
    {
      q: '¿Qué sucede en zonas del colegio sin cobertura móvil o sin Wi-Fi?',
      a: 'Gracias a los Service Workers (vite-plugin-pwa) y caché estructurada local, los estudiantes consultan su Carnet Digital, horario del día, agenda de entregas y asistente virtual offline sin depender de conexión continua.',
    },
    {
      q: '¿Cuánto le cuesta esta infraestructura al colegio técnico?',
      a: 'Opera sobre tiers gratuitos escalables en Cloudflare Edge + Supabase PostgreSQL y evita impresiones físicas constantes de carnets y horarios en papel.',
    },
  ]

  return (
    <section
      ref={seccionRef}
      id="rubrica"
      className="border-t border-border bg-bg dark:bg-[#060B19] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div data-rubrica-reveal className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3.5 py-1 text-micro font-extrabold uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
            <IconoBirrete className="size-3.5" />
            <span>Guía del Jurado Evaluador</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Criterios Clave & Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            Resumen técnico y normativo alineado con la rúbrica de{' '}
            <strong>Expotécnica 2026 — CTP Rosario de Naranjo</strong>.
          </p>
        </div>

        {/* Matriz de Criterios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-14">
          {criterios.map((c) => (
            <div
              key={c.num}
              data-rubrica-reveal
              className="rounded-3xl border border-border bg-surface dark:bg-[#0F172A]/85 p-5 shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xl font-black text-primary/45 dark:text-sky-400/45 font-mono">
                    #{c.num}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                    {c.puntajeBadge}
                  </span>
                </div>
                <h3 className="text-base font-black text-text leading-snug mb-2">{c.criterio}</h3>
                <p className="text-menuda text-text-muted leading-relaxed">{c.evidencia}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-1.5 text-micro font-extrabold text-primary dark:text-sky-300">
                <IconoCheck className="size-3.5 shrink-0" />
                <span>Verificable en vivo</span>
              </div>
            </div>
          ))}

          {/* Tarjeta CTA Final Dual */}
          <div
            data-rubrica-reveal
            className="rounded-3xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0F172A] p-6 text-white flex flex-col justify-between shadow-lg shadow-blue-600/20"
          >
            <div>
              <IconoEscudo className="size-8 text-sky-300 mb-3" />
              <h3 className="text-lg font-black leading-tight">
                Comprobá la Integración Ahora
              </h3>
              <p className="text-menuda text-white/85 mt-1.5 leading-relaxed">
                Editá una nota o tarea como Prof. Dangelo y verificá el resultado al instante en el
                perfil de Erick (11-1).
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  lanzarPerfilDemo({
                    rol: 'docente',
                    destino: '/docente',
                  })
                }
                className="flex items-center justify-between gap-2 rounded-2xl bg-amber-300 px-4 py-2.5 text-micro font-black text-slate-950 transition-all hover:bg-amber-200 cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <IconoDocente className="size-4" />
                  <span>Abrir Prof. Dangelo</span>
                </span>
                <IconoFlechaDerecha className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  lanzarPerfilDemo({
                    rol: 'estudiante',
                    estudianteId: '00000000-0000-0000-0000-000000000001',
                    destino: '/',
                  })
                }
                className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-2.5 text-micro font-black text-slate-950 transition-all hover:bg-slate-100 cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <IconoRayo className="size-4 text-[#2563EB]" />
                  <span>Abrir App Estudiantil</span>
                </span>
                <IconoFlechaDerecha className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <div data-rubrica-reveal className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <IconoDispositivo className="size-5 text-primary dark:text-sky-300" />
            <h3 className="text-xl font-black text-text">Preguntas Frecuentes del Jurado</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preguntasFrecuentes.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-border bg-surface dark:bg-[#0F172A]/85 p-5 shadow-2xs"
              >
                <h4 className="text-nota font-bold text-text">{faq.q}</h4>
                <p className="mt-2 text-menuda text-text-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
