import { useMemo, useRef, useState } from 'react'
import {
  BellIcon,
  IconoAgenda,
  IconoAlertaTriangulo,
  IconoCalendario,
  IconoCarnet,
  IconoCheck,
  IconoComedor,
  IconoDispositivo,
  IconoDocente,
  IconoEscudo,
  IconoFlechaDerecha,
  IconoUsuarios,
} from '@/components/icons'
import { IconoAsistenteBot } from '@/features/chatbot/icons'
import {
  ECOSISTEMA_CAPACIDADES_EXPO,
  lanzarPerfilDemo,
  type CategoriaModuloExpo,
} from '../expoDemo.service'
import { useFilterSwapExpoAnime, useScrollRevealExpoAnime } from '../useExpoAnime'

const CATEGORIAS_FILTRO: Array<{ id: CategoriaModuloExpo; etiqueta: string }> = [
  { id: 'todos', etiqueta: 'Todos los Módulos' },
  { id: 'docente', etiqueta: 'Gestión & Admin' },
  { id: 'estudiantil', etiqueta: 'Estudiante & Familia' },
  { id: 'servicios', etiqueta: 'Servicios CTP' },
  { id: 'arquitectura', etiqueta: 'PWA & Seguridad' },
]

function iconoDeModulo(id: string) {
  switch (id) {
    case 'modo-docente':
      return <IconoDocente className="size-5 text-amber-600 dark:text-amber-300" />
    case 'hub-familiar':
      return <IconoUsuarios className="size-5 text-emerald-600 dark:text-emerald-300" />
    case 'carnet-3d':
      return <IconoCarnet className="size-5 text-primary dark:text-sky-300" />
    case 'alerta-asistencia':
      return <IconoAlertaTriangulo className="size-5 text-rose-600 dark:text-rose-300" />
    case 'agenda-escolar':
      return <IconoAgenda className="size-5 text-indigo-600 dark:text-indigo-300" />
    case 'chatbot-offline':
      return <IconoAsistenteBot className="size-5 text-sky-600 dark:text-sky-300" />
    case 'comedor-nocturna':
      return <IconoComedor className="size-5 text-teal-600 dark:text-teal-300" />
    case 'horarios-dinamicos':
      return <IconoCalendario className="size-5 text-blue-600 dark:text-blue-300" />
    case 'avisos-notificaciones':
      return <BellIcon className="size-5 text-orange-600 dark:text-orange-300" />
    case 'panel-admin':
      return <IconoEscudo className="size-5 text-violet-600 dark:text-violet-300" />
    case 'pwa-seguridad':
    default:
      return <IconoDispositivo className="size-5 text-cyan-600 dark:text-cyan-300" />
  }
}

export function ModulosExpo() {
  const seccionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaModuloExpo>('todos')

  useScrollRevealExpoAnime(seccionRef, '[data-ecosistema-header]')
  useFilterSwapExpoAnime(gridRef, '[data-modulo-card]', categoriaActiva)

  const modulosVisibles = useMemo(() => {
    if (categoriaActiva === 'todos') return ECOSISTEMA_CAPACIDADES_EXPO
    return ECOSISTEMA_CAPACIDADES_EXPO.filter((m) => m.categoria === categoriaActiva)
  }, [categoriaActiva])

  return (
    <section
      ref={seccionRef}
      id="ecosistema"
      className="border-t border-border bg-bg dark:bg-[#060B19] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div data-ecosistema-header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3.5 py-1 text-micro font-extrabold uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
            <span>Ecosistema Completo Construido</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            11 Capacidades Reales Integradas en StudentHUB
          </h2>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            Cada tarjeta corresponde a un módulo funcional activo en el código fuente. Filtrá por
            área o abrí directamente cualquiera de ellos en la demo interactiva.
          </p>
        </div>

        {/* Barra de Filtros Interactivos */}
        <div
          data-ecosistema-header
          role="tablist"
          aria-label="Filtrar módulos del ecosistema StudentHUB"
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {CATEGORIAS_FILTRO.map((cat) => {
            const activa = categoriaActiva === cat.id
            const cantidad =
              cat.id === 'todos'
                ? ECOSISTEMA_CAPACIDADES_EXPO.length
                : ECOSISTEMA_CAPACIDADES_EXPO.filter((m) => m.categoria === cat.id).length

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-micro sm:text-menor font-bold transition-all cursor-pointer ${
                  activa
                    ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-sm shadow-blue-600/25'
                    : 'border-border bg-surface dark:bg-[#0F172A]/85 text-text-muted hover:border-primary/40 hover:text-text'
                }`}
              >
                <span>{cat.etiqueta}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    activa
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-alt text-text-muted'
                  }`}
                >
                  {cantidad}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bento Grid de Módulos */}
        <div
          ref={gridRef}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {modulosVisibles.map((modulo) => (
            <article
              key={modulo.id}
              data-modulo-card
              className={`group flex flex-col justify-between rounded-3xl border bg-surface dark:bg-[#0F172A]/85 p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${modulo.acentoClase}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-alt/90 dark:bg-slate-900">
                    {iconoDeModulo(modulo.id)}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${modulo.badgeClase}`}
                  >
                    {modulo.subtitulo}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-black text-text group-hover:text-primary dark:group-hover:text-sky-300 transition-colors">
                  {modulo.titulo}
                </h3>
                <p className="mt-1.5 text-menor text-text-muted leading-relaxed">
                  {modulo.resumen}
                </p>

                <ul className="mt-4 space-y-2 border-t border-border/70 pt-3.5 text-menuda text-text">
                  {modulo.capacidadesReales.map((punto) => (
                    <li key={punto} className="flex items-start gap-2">
                      <IconoCheck className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
                      <span className="leading-snug">{punto}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (modulo.rutaDemo.startsWith('/expo#')) {
                    const idDestino = modulo.rutaDemo.split('#')[1]
                    document.getElementById(idDestino)?.scrollIntoView({ behavior: 'smooth' })
                    return
                  }
                  lanzarPerfilDemo({
                    rol: modulo.rolDemo,
                    estudianteId: modulo.estudianteIdDemo,
                    destino: modulo.rutaDemo,
                  })
                }}
                className="mt-5 flex w-full items-center justify-between rounded-2xl border border-border bg-surface-alt/70 dark:bg-slate-900/70 px-4 py-2.5 text-micro font-extrabold text-text transition-all hover:border-primary/50 hover:bg-primary-tint hover:text-primary dark:hover:text-sky-300 cursor-pointer"
              >
                <span>
                  {modulo.rutaDemo.startsWith('/expo')
                    ? 'Probar Simulador 3D abajo'
                    : `Abrir ${modulo.rutaDemo}`}
                </span>
                <IconoFlechaDerecha className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
