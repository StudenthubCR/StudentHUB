import { useRef } from 'react'
import {
  IconoAlertaTriangulo,
  IconoBirrete,
  IconoCheck,
  IconoComedor,
  IconoDocente,
  IconoEscudo,
  IconoFlechaDerecha,
  IconoRayo,
  IconoUsuarios,
} from '@/components/icons'
import {
  ESTUDIANTES_DESARROLLO_WEB_EXPO,
  lanzarPerfilDemo,
} from '../expoDemo.service'
import { useScrollRevealExpoAnime } from '../useExpoAnime'

export function PerfilesDemoExpo() {
  const seccionRef = useRef<HTMLElement>(null)
  useScrollRevealExpoAnime(seccionRef, '[data-perfil-reveal]')

  return (
    <section
      ref={seccionRef}
      id="perfiles-demo"
      className="border-t border-border bg-surface-alt/40 dark:bg-[#0B1224]/70 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div data-perfil-reveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3.5 py-1 text-micro font-extrabold uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
            <IconoRayo className="size-3.5" />
            <span>Acceso Demo Instantáneo · Cero Fricción</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Probá Cada Rol en Vivo con Un Solo Clic
          </h2>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            Cambiá entre docente, estudiante y encargado familiar en el CTP Rosario de Naranjo. Lo
            que edités en <strong>Modo Docente</strong> con Prof. Dangelo se sincroniza al instante
            con el padrón de <strong>Desarrollo Web</strong>.
          </p>
        </div>

        {/* 3 Tarjetas Principales de Rol */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1: Prof. Dangelo (Destacada Modo Docente) */}
          <article
            data-perfil-reveal
            className="relative flex flex-col justify-between rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/12 via-surface to-surface dark:from-amber-500/15 dark:via-[#0F172A] dark:to-[#0F172A] p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  <IconoDocente className="size-6" />
                </span>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  Modo Docente
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black text-text">
                Prof. Dangelo · Desarrollo Web
              </h3>
              <p className="mt-1 text-micro font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Alcance estricto: Secciones 10-1, 11-1 y 12-1
              </p>
              <p className="mt-2.5 text-menor text-text-muted leading-relaxed">
                Gestioná el padrón exclusivo de Desarrollo Web: ponderación de notas MEP en tiempo
                real, pase de lista por bloque horario, observaciones y agenda de grupo.
              </p>

              <ul className="mt-4 space-y-1.5 text-menuda text-text">
                <li className="flex items-start gap-2">
                  <IconoCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Cálculo automático MEP (40 / 10 / 35 / 10 / 5)</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconoCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Aislamiento total frente a otras especialidades</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() =>
                lanzarPerfilDemo({
                  rol: 'docente',
                  destino: '/docente',
                })
              }
              className="mt-6 flex w-full items-center justify-between rounded-2xl bg-amber-400 px-4 py-3 text-menor font-black text-slate-950 shadow-xs transition-all hover:bg-amber-300 active:scale-98 cursor-pointer"
            >
              <span>Entrar como Prof. Dangelo</span>
              <IconoFlechaDerecha className="size-4" />
            </button>
          </article>

          {/* Card 2: Erick García Burgos (Estudiante Principal) */}
          <article
            data-perfil-reveal
            className="flex flex-col justify-between rounded-3xl border border-primary/35 bg-surface dark:bg-[#0F172A]/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/70"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-tint text-primary dark:bg-sky-400/15 dark:text-sky-300 border border-primary/25">
                  <IconoBirrete className="size-6" />
                </span>
                <span className="rounded-full border border-primary/25 bg-primary-tint px-3 py-1 text-[11px] font-black uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
                  Estudiante · 11-1
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black text-text">
                Erick García Burgos
              </h3>
              <p className="mt-1 text-micro font-bold uppercase tracking-wider text-primary dark:text-sky-300">
                Desarrollo Web · Jornada Diurna
              </p>
              <p className="mt-2.5 text-menor text-text-muted leading-relaxed">
                Explorá el tablero diario inteligente, la lección actual, el menú del día, el
                asistente offline y su Carnet Digital 3D sincronizado con Prof. Dangelo.
              </p>

              <ul className="mt-4 space-y-1.5 text-menuda text-text">
                <li className="flex items-start gap-2">
                  <IconoCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Recibe notas y tareas creadas en Modo Docente</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconoCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Incluye Carnet 3D, Agenda y Chatbot local</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  lanzarPerfilDemo({
                    rol: 'estudiante',
                    estudianteId: '00000000-0000-0000-0000-000000000001',
                    destino: '/',
                  })
                }
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#2563EB] px-3.5 py-2.5 text-micro font-black text-white transition-all hover:bg-blue-700 active:scale-98 cursor-pointer"
              >
                <span>Dashboard</span>
                <IconoFlechaDerecha className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  lanzarPerfilDemo({
                    rol: 'estudiante',
                    estudianteId: '00000000-0000-0000-0000-000000000001',
                    destino: '/estudiante?tab=notas',
                  })
                }
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface-alt px-3.5 py-2.5 text-micro font-bold text-text transition-all hover:border-primary/40 hover:text-primary active:scale-98 cursor-pointer"
              >
                <span>Ver Notas y Carnet</span>
              </button>
            </div>
          </article>

          {/* Card 3: María Elena Burgos (Encargado Legal Multi-Hijo) */}
          <article
            data-perfil-reveal
            className="flex flex-col justify-between rounded-3xl border border-emerald-500/35 bg-surface dark:bg-[#0F172A]/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/70"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  <IconoUsuarios className="size-6" />
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Encargado Legal
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black text-text">
                María Elena Burgos
              </h3>
              <p className="mt-1 text-micro font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Cuenta Única · 2 Hijos Vinculados
              </p>
              <p className="mt-2.5 text-menor text-text-muted leading-relaxed">
                Supervisión familiar unificada: alterná en el encabezado entre Erick (11-1
                Desarrollo Web) y Sofía (10-2 Contabilidad & Finanzas) o cambiá de perspectiva.
              </p>

              <ul className="mt-4 space-y-1.5 text-menuda text-text">
                <li className="flex items-start gap-2">
                  <IconoCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Selector multi-hijo y modos Familia / Encargado</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconoCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Consulta directa de notas, asistencias y avisos</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() =>
                lanzarPerfilDemo({
                  rol: 'encargado',
                  destino: '/estudiante?tab=notas',
                })
              }
              className="mt-6 flex w-full items-center justify-between rounded-2xl bg-emerald-600 px-4 py-3 text-menor font-black text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-98 cursor-pointer"
            >
              <span>Abrir Vista Familiar</span>
              <IconoFlechaDerecha className="size-4" />
            </button>
          </article>
        </div>

        {/* Casos de Evaluación Especializados */}
        <div data-perfil-reveal className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Lucía - Alerta Temprana */}
          <button
            type="button"
            onClick={() =>
              lanzarPerfilDemo({
                rol: 'estudiante',
                estudianteId: 'dw-10-1-lucia',
                destino: '/estudiante?tab=asistencias',
              })
            }
            className="flex flex-col justify-between rounded-2xl border border-rose-500/35 bg-surface dark:bg-[#0F172A]/85 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-rose-500/70 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-rose-700 dark:text-rose-300">
                  <IconoAlertaTriangulo className="size-3" />
                  <span>Alerta Temprana</span>
                </span>
                <span className="text-micro font-bold text-text-muted">10-1</span>
              </div>
              <p className="mt-2.5 text-nota font-extrabold text-text">
                Lucía Fernández Castro
              </p>
              <p className="mt-1 text-micro text-text-muted leading-snug">
                Desarrollo Web · Demuestra aviso preventivo por 3+ ausencias injustificadas según normativa REA.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-micro font-bold text-rose-600 dark:text-rose-300">
              <span>Inspeccionar asistencias</span>
              <IconoFlechaDerecha className="size-3" />
            </span>
          </button>

          {/* Andrés - Sección Nocturna y Comedor */}
          <button
            type="button"
            onClick={() =>
              lanzarPerfilDemo({
                rol: 'estudiante',
                estudianteId: 'electro-11-2-andres',
                destino: '/comedor',
              })
            }
            className="flex flex-col justify-between rounded-2xl border border-teal-500/35 bg-surface dark:bg-[#0F172A]/85 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-teal-500/70 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-teal-700 dark:text-teal-300">
                  <IconoComedor className="size-3" />
                  <span>Sección Nocturna</span>
                </span>
                <span className="text-micro font-bold text-text-muted">11-2</span>
              </div>
              <p className="mt-2.5 text-nota font-extrabold text-text">
                Andrés Porras Chacón
              </p>
              <p className="mt-1 text-micro text-text-muted leading-snug">
                Electromecánica Nocturna · Reserva de cena escolar y horario nocturno dedicado.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-micro font-bold text-teal-700 dark:text-teal-300">
              <span>Probar Comedor Nocturno</span>
              <IconoFlechaDerecha className="size-3" />
            </span>
          </button>

          {/* Sofía - Aislamiento de Especialidad */}
          <button
            type="button"
            onClick={() =>
              lanzarPerfilDemo({
                rol: 'estudiante',
                estudianteId: '00000000-0000-0000-0000-000000000003',
                destino: '/estudiante?tab=carnet',
              })
            }
            className="flex flex-col justify-between rounded-2xl border border-sky-500/35 bg-surface dark:bg-[#0F172A]/85 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-sky-500/70 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-sky-700 dark:text-sky-300">
                  <IconoEscudo className="size-3" />
                  <span>Contabilidad</span>
                </span>
                <span className="text-micro font-bold text-text-muted">10-2</span>
              </div>
              <p className="mt-2.5 text-nota font-extrabold text-text">
                Sofía García Burgos
              </p>
              <p className="mt-1 text-micro text-text-muted leading-snug">
                Contabilidad & Finanzas · Valida que Prof. Dangelo no accede fuera de Desarrollo Web.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-micro font-bold text-sky-700 dark:text-sky-300">
              <span>Ver Carnet de Sofía</span>
              <IconoFlechaDerecha className="size-3" />
            </span>
          </button>

          {/* Consola Administrativa /admin */}
          <button
            type="button"
            onClick={() =>
              lanzarPerfilDemo({
                rol: 'admin',
                destino: '/admin',
              })
            }
            className="flex flex-col justify-between rounded-2xl border border-violet-500/35 bg-surface dark:bg-[#0F172A]/85 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-violet-500/70 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-violet-700 dark:text-violet-300">
                  <IconoEscudo className="size-3" />
                  <span>Administración</span>
                </span>
                <span className="text-micro font-bold text-text-muted">RBAC</span>
              </div>
              <p className="mt-2.5 text-nota font-extrabold text-text">
                Panel Institucional
              </p>
              <p className="mt-1 text-micro text-text-muted leading-snug">
                Gestión de avisos oficiales, noticias, métricas de comedor nocturno y auditoría.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-micro font-bold text-violet-700 dark:text-violet-300">
              <span>Explorar /admin</span>
              <IconoFlechaDerecha className="size-3" />
            </span>
          </button>
        </div>

        {/* Selector Rápido de Padrón Desarrollo Web */}
        <div
          data-perfil-reveal
          className="mt-6 rounded-2xl border border-border bg-surface/90 dark:bg-[#0F172A]/85 p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-micro font-extrabold uppercase tracking-wider text-text mr-1">
              Padrón Desarrollo Web (Sincronizado con Prof. Dangelo):
            </span>
            {ESTUDIANTES_DESARROLLO_WEB_EXPO.map((est) => (
              <button
                key={est.id}
                type="button"
                onClick={() =>
                  est.id &&
                  lanzarPerfilDemo({
                    rol: 'estudiante',
                    estudianteId: est.id,
                    destino: '/estudiante?tab=notas',
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-alt/80 px-3 py-1.5 text-micro font-semibold text-text-muted transition-all hover:border-primary/50 hover:bg-primary-tint hover:text-primary cursor-pointer"
              >
                <span>{est.nombre.split(' ').slice(0, 2).join(' ')}</span>
                <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-black text-primary dark:text-sky-300">
                  {est.grupo}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
