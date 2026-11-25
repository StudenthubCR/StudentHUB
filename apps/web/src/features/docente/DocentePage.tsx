import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  IconoAgenda,
  IconoAlertaTriangulo,
  IconoBirrete,
  IconoCheck,
  IconoDocente,
  IconoEscudo,
  IconoListaAsistencia,
  IconoRecargar,
  IconoUsuarios,
} from '@/components/icons'
import { useSesion } from '@/features/auth/useSesion'
import type { NotaMateria, PeriodoNota } from '@/features/notas/notas.types'
import { DOCENTE_DANGELO_DEMO } from './docente.fixture'
import type { EstudianteConMetricasDocente } from './docente.types'
import { usePanelResumenDocente } from './useDocente'
import { TabEstudiantesDocente } from './components/TabEstudiantesDocente'
import { TabNotasDocente } from './components/TabNotasDocente'
import { TabAsistenciasDocente } from './components/TabAsistenciasDocente'
import { TabAgendaDocente } from './components/TabAgendaDocente'
import { ModalDetalleEstudianteDocente } from './components/ModalDetalleEstudianteDocente'
import { ModalEditarNotaDocente } from './components/ModalEditarNotaDocente'

export type TabDocenteId = 'estudiantes' | 'notas' | 'asistencias' | 'agenda'

type Props = {
  tabInicial?: TabDocenteId
}

const TABS_DOCENTE: Array<{
  id: TabDocenteId
  ruta: string
  titulo: string
  subtitulo: string
  Icono: typeof IconoUsuarios
}> = [
  {
    id: 'estudiantes',
    ruta: '/docente',
    titulo: 'Estudiantes',
    subtitulo: 'Padrón Desarrollo Web',
    Icono: IconoUsuarios,
  },
  {
    id: 'notas',
    ruta: '/docente/notas',
    titulo: 'Notas',
    subtitulo: 'Control de Calificaciones',
    Icono: IconoBirrete,
  },
  {
    id: 'asistencias',
    ruta: '/docente/asistencias',
    titulo: 'Asistencias',
    subtitulo: 'Pase de Lista',
    Icono: IconoListaAsistencia,
  },
  {
    id: 'agenda',
    ruta: '/docente/agenda',
    titulo: 'Agenda y Avisos',
    subtitulo: 'Gestión Docente',
    Icono: IconoAgenda,
  },
]

export function DocentePage({ tabInicial }: Props) {
  const { docente } = useSesion()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const docenteActivo = docente ?? DOCENTE_DANGELO_DEMO
  const [periodoNotas, setPeriodoNotas] = useState<PeriodoNota>('I Periodo')
  const [estudianteDetalleId, setEstudianteDetalleId] = useState<string | null>(null)
  const [modalNotaAbierto, setModalNotaAbierto] = useState(false)
  const [notaEditando, setNotaEditando] = useState<NotaMateria | null>(null)
  const [estudianteNotaId, setEstudianteNotaId] = useState<string | undefined>(undefined)
  const [mensajeNotaExito, setMensajeNotaExito] = useState<string | null>(null)

  const tabActivo: TabDocenteId = useMemo(() => {
    const tabParam = searchParams.get('tab')
    if (
      tabParam === 'estudiantes' ||
      tabParam === 'notas' ||
      tabParam === 'asistencias' ||
      tabParam === 'agenda'
    ) {
      return tabParam
    }
    if (location.pathname.endsWith('/notas')) return 'notas'
    if (location.pathname.endsWith('/asistencias')) return 'asistencias'
    if (location.pathname.endsWith('/agenda')) return 'agenda'
    return tabInicial ?? 'estudiantes'
  }, [location.pathname, searchParams, tabInicial])

  const {
    estudiantes,
    listado,
    resumen,
    notas,
    asistencias,
    cargando,
    error,
    reintentar,
  } = usePanelResumenDocente(docenteActivo, periodoNotas)

  const secciones = useMemo(() => {
    const unicas = new Set<string>([
      ...docenteActivo.seccionesAsignadas,
      ...estudiantes.map((e) => e.grupo).filter(Boolean),
    ])
    return Array.from(unicas).sort()
  }, [docenteActivo.seccionesAsignadas, estudiantes])

  const detalleSeleccionado: EstudianteConMetricasDocente | null = useMemo(
    () => listado.find((i) => i.estudiante.id === estudianteDetalleId) ?? null,
    [listado, estudianteDetalleId],
  )

  const cambiarTab = (ruta: string) => {
    setMensajeNotaExito(null)
    navigate(ruta)
  }

  const abrirEditorNota = (nota?: NotaMateria, estudianteId?: string) => {
    setNotaEditando(nota ?? null)
    setEstudianteNotaId(estudianteId ?? nota?.estudianteId ?? estudiantes[0]?.id)
    setModalNotaAbierto(true)
  }

  return (
    <section className="space-y-5 animate-fade-in">
      {/* Cabecera de Identidad Docente */}
      <header className="rounded-3xl border border-border bg-surface p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-primary">
                <IconoDocente className="size-3.5" />
                <span>
                  {docenteActivo.nombreCompleto} · {docenteActivo.especialidadAsignada} · CTP Rosario de Naranjo
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                <IconoEscudo className="size-3" />
                <span>Alcance RLS estricto</span>
              </span>
            </div>

            <h1 className="text-titulo sm:text-hero font-black tracking-tight text-text">
              Panel Docente · {docenteActivo.especialidadAsignada}
            </h1>
            <p className="mt-1 text-menor text-text-muted max-w-2xl">
              Gestión integral de estudiantes, calificaciones MEP, pase de lista y agenda para {docenteActivo.especialidadAsignada} (Ley N° 8968 · PRODHAB).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {secciones.map((sec) => (
              <span
                key={sec}
                className="rounded-xl border border-border bg-surface-alt px-2.5 py-1 text-micro font-bold text-text"
              >
                Sección {sec}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* KPIs del Grupo de Especialidad */}
      {cargando ? (
        <div
          className="grid grid-cols-2 xl:grid-cols-4 gap-3 animate-pulse"
          aria-busy="true"
          aria-label="Cargando indicadores docentes"
        >
          <div className="h-24 rounded-2xl border border-border bg-surface-alt" />
          <div className="h-24 rounded-2xl border border-border bg-surface-alt" />
          <div className="h-24 rounded-2xl border border-border bg-surface-alt" />
          <div className="h-24 rounded-2xl border border-border bg-surface-alt" />
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Estudiantes {docenteActivo.especialidadAsignada}
              </span>
              <IconoUsuarios className="size-4 text-primary shrink-0" />
            </div>
            <p className="text-titulo sm:text-[1.6rem] font-black text-text">
              {resumen.totalEstudiantes}
            </p>
            <p className="text-micro text-text-muted mt-0.5">
              {secciones.length} secciones activas
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Promedio del Grupo
              </span>
              <IconoBirrete className="size-4 text-primary shrink-0" />
            </div>
            <p className="text-titulo sm:text-[1.6rem] font-black text-text">
              {resumen.promedioGrupo.toFixed(1)}
            </p>
            <p className="text-micro text-text-muted mt-0.5">
              {periodoNotas} · Escala 100
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Asistencia Promedio
              </span>
              <IconoCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            <p className="text-titulo sm:text-[1.6rem] font-black text-emerald-700 dark:text-emerald-400">
              {resumen.asistenciaPromedio.toFixed(1)}%
            </p>
            <p className="text-micro text-text-muted mt-0.5">
              Presencialidad regular
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Estudiantes en Alerta
              </span>
              <IconoAlertaTriangulo
                className={`size-4 shrink-0 ${
                  resumen.estudiantesEnAlerta > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-text-muted'
                }`}
              />
            </div>
            <p
              className={`text-titulo sm:text-[1.6rem] font-black ${
                resumen.estudiantesEnAlerta > 0
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-text'
              }`}
            >
              {resumen.estudiantesEnAlerta}
            </p>
            <p className="text-micro text-text-muted mt-0.5">
              Nota &lt; 70 o ausencias altas
            </p>
          </div>
        </div>
      )}

      {/* Barra de Pestañas Segmentadas */}
      <nav
        role="tablist"
        aria-label="Módulos del Modo Docente"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-2xl border border-border bg-surface-alt/70 p-1.5 shadow-2xs"
      >
        {TABS_DOCENTE.map((t) => {
          const activo = tabActivo === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => cambiarTab(t.ruta)}
              className={`flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all ${
                activo
                  ? 'bg-surface text-text shadow-xs ring-1 ring-border'
                  : 'text-text-muted hover:bg-surface/50 hover:text-text'
              }`}
            >
              <t.Icono className={`size-4 shrink-0 ${activo ? 'text-primary' : ''}`} />
              <span className="min-w-0 truncate text-menor font-bold">{t.titulo}</span>
            </button>
          )
        })}
      </nav>

      {/* Estado de Error Reintentable */}
      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/35 bg-rose-500/10 p-4 text-menor text-rose-800 dark:text-rose-200">
          <div>
            <p className="font-bold">Error al sincronizar el padrón docente</p>
            <p className="text-micro opacity-90">
              {error instanceof Error ? error.message : 'Verificá tu conexión e intentá nuevamente.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void reintentar()}
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-micro font-bold text-white hover:bg-rose-700"
          >
            <IconoRecargar className="size-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Contenido de la Pestaña Activa */}
      {!cargando && !error && (
        <div>
          {tabActivo === 'estudiantes' && (
            <TabEstudiantesDocente
              listado={listado}
              especialidad={docenteActivo.especialidadAsignada}
              alSeleccionarEstudiante={(item) => setEstudianteDetalleId(item.estudiante.id ?? null)}
            />
          )}

          {tabActivo === 'notas' && (
            <TabNotasDocente
              estudiantes={estudiantes}
              notas={notas}
              periodoActivo={periodoNotas}
              alCambiarPeriodo={setPeriodoNotas}
              alAbrirEditorNota={abrirEditorNota}
              mensajeExito={mensajeNotaExito}
            />
          )}

          {tabActivo === 'asistencias' && (
            <TabAsistenciasDocente
              docente={docenteActivo}
              estudiantes={estudiantes}
              asistencias={asistencias}
            />
          )}

          {tabActivo === 'agenda' && (
            <TabAgendaDocente docente={docenteActivo} secciones={secciones} />
          )}
        </div>
      )}

      {/* Modal / Drawer de Detalle de Estudiante */}
      <ModalDetalleEstudianteDocente
        abierto={Boolean(detalleSeleccionado)}
        alCerrar={() => setEstudianteDetalleId(null)}
        docente={docenteActivo}
        item={detalleSeleccionado}
        notasEstudiante={notas.filter((n) => n.estudianteId === detalleSeleccionado?.estudiante.id)}
        asistenciasEstudiante={asistencias.filter(
          (a) => a.estudianteId === detalleSeleccionado?.estudiante.id,
        )}
        alEditarNota={(nota) => {
          const idEst = detalleSeleccionado?.estudiante.id
          setEstudianteDetalleId(null)
          abrirEditorNota(nota, idEst)
        }}
      />

      {/* Modal de Edición/Registro de Nota MEP */}
      <ModalEditarNotaDocente
        abierto={modalNotaAbierto}
        alCerrar={() => setModalNotaAbierto(false)}
        docente={docenteActivo}
        estudiantes={estudiantes}
        periodoInicial={periodoNotas}
        notaInicial={notaEditando}
        estudianteIdPreseleccionado={estudianteNotaId}
        alGuardarExito={(msg) => setMensajeNotaExito(msg)}
      />
    </section>
  )
}
