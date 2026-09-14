import { useMemo, useState } from 'react'
import {
  IconoExamen,
  IconoProfesorAusente,
  IconoTarea,
  MagnifyingGlassIcon,
  BackpackIcon,
} from '@/components/icons'

import { useAgenda } from './useAgenda'
import { MiniCalendarioAgenda } from './components/MiniCalendarioAgenda'
import { TarjetaEventoAgenda } from './components/TarjetaEventoAgenda'
import { ModalCrearEventoAgenda } from './components/ModalCrearEventoAgenda'
import type { EventoAgenda } from './agenda.types'

import { formatearFechaRelativa } from './agenda.service'
import { cn } from '@/lib/cn'

export function AgendaPage() {
  const {
    eventos,
    eventosFiltrados,
    filtro,
    fechaSeleccionada,
    setFiltro,
    setFechaSeleccionada,
    crearEvento,
    modificarEvento,
    borrarEvento,
    toggleCompletada,
    restaurarMuestras,
  } = useAgenda()

  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [eventoParaEditar, setEventoParaEditar] = useState<EventoAgenda | null>(null)

  // Filtro por texto de búsqueda adicional
  const eventosVisibles = useMemo(() => {
    if (!busqueda.trim()) return eventosFiltrados

    const termino = busqueda.toLowerCase().trim()
    return eventosFiltrados.filter(
      (e) =>
        e.titulo.toLowerCase().includes(termino) ||
        e.materia.toLowerCase().includes(termino) ||
        (e.profesor && e.profesor.toLowerCase().includes(termino)) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(termino)),
    )
  }, [eventosFiltrados, busqueda])

  // Contadores para los filtros
  const contadores = useMemo(() => {
    return {
      todos: eventos.length,
      tarea: eventos.filter((e) => e.tipo === 'tarea' && !e.completada).length,
      examen: eventos.filter((e) => e.tipo === 'examen').length,
      ausencia: eventos.filter((e) => e.tipo === 'ausencia_profesor').length,
      completadas: eventos.filter((e) => e.tipo === 'tarea' && e.completada).length,
    }
  }, [eventos])

  const abrirCrear = () => {
    setEventoParaEditar(null)
    setModalAbierto(true)
  }

  const abrirEditar = (evento: EventoAgenda) => {
    setEventoParaEditar(evento)
    setModalAbierto(true)
  }

  return (
    <section className="animate-fade-in pb-12">
      {/* Encabezado principal */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-hero font-bold tracking-tight text-text leading-tight md:text-[2rem]">
            Agenda Estudiantil
          </h1>
          <p className="mt-1 text-dato text-text-muted">
            Organizá tus exámenes, tareas y avisos de profesores ausentes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={abrirCrear}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-menor font-bold text-white shadow-sm hover:bg-primary-dark active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-base leading-none">+</span>
            <span>Nuevo Registro</span>
          </button>
        </div>
      </header>

      {/* Barra de Búsqueda y Filtros de Categoría */}
      <div className="mb-6 space-y-3">
        {/* Barra de búsqueda */}
        <div className="relative">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por materia, título o nombre del profesor..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pl-10 text-dato text-text placeholder:text-text-muted/70 shadow-xs focus:border-primary focus:outline-none"
          />
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            <MagnifyingGlassIcon size={18} />
          </div>
        </div>

        {/* Píldoras de Filtros */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sin-barra">
          <button
            type="button"
            onClick={() => setFiltro('todos')}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-micro font-bold transition-all',
              filtro === 'todos'
                ? 'border-primary bg-primary text-white shadow-xs'
                : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
            )}
          >
            <span>Todos</span>
            <span className={cn('rounded-full px-1.5 py-0.2 text-[10px]', filtro === 'todos' ? 'bg-white/20 text-white' : 'bg-surface-alt text-text-muted')}>
              {contadores.todos}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltro('tarea')}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-micro font-bold transition-all',
              filtro === 'tarea'
                ? 'border-primary bg-primary text-white shadow-xs'
                : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
            )}
          >
            <IconoTarea className="size-3.5" />
            <span>Tareas</span>
            <span className={cn('rounded-full px-1.5 py-0.2 text-[10px]', filtro === 'tarea' ? 'bg-white/20 text-white' : 'bg-surface-alt text-text-muted')}>
              {contadores.tarea}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltro('examen')}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-micro font-bold transition-all',
              filtro === 'examen'
                ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
            )}
          >
            <IconoExamen className="size-3.5" />
            <span>Exámenes</span>
            <span className={cn('rounded-full px-1.5 py-0.2 text-[10px]', filtro === 'examen' ? 'bg-white/20 text-white' : 'bg-surface-alt text-text-muted')}>
              {contadores.examen}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltro('ausencia_profesor')}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-micro font-bold transition-all',
              filtro === 'ausencia_profesor'
                ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
            )}
          >
            <IconoProfesorAusente className="size-3.5" />
            <span>Prof. Ausentes</span>
            <span className={cn('rounded-full px-1.5 py-0.2 text-[10px]', filtro === 'ausencia_profesor' ? 'bg-white/20 text-white' : 'bg-surface-alt text-text-muted')}>
              {contadores.ausencia}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltro('completadas')}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-micro font-bold transition-all',
              filtro === 'completadas'
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
            )}
          >
            <span>Entregadas</span>
            <span className={cn('rounded-full px-1.5 py-0.2 text-[10px]', filtro === 'completadas' ? 'bg-white/20 text-white' : 'bg-surface-alt text-text-muted')}>
              {contadores.completadas}
            </span>
          </button>
        </div>
      </div>

      {/* Disposición en 2 columnas (Calendario + Lista) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[330px_1fr] lg:items-start">
        {/* Columna Izquierda: Mini-calendario y atajos */}
        <aside className="space-y-4">
          <MiniCalendarioAgenda
            fechaSeleccionada={fechaSeleccionada}
            alSeleccionarFecha={setFechaSeleccionada}
            eventos={eventos}
          />

          {/* Tarjeta de acción rápida para Profesores Ausentes */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="flex size-7.5 items-center justify-center rounded-lg bg-amber-500 text-white">
                <IconoProfesorAusente className="size-4" />
              </span>
              <h4 className="text-menor font-bold text-text">¿Falta algún profesor?</h4>
            </div>
            <p className="text-micro text-text-muted mb-3">
              Anotá la ausencia y las lecciones libres para que vos y tu grupo organicen el tiempo.
            </p>
            <button
              type="button"
              onClick={() => {
                setEventoParaEditar(null)
                setModalAbierto(true)
              }}
              className="w-full rounded-xl border border-amber-500/30 bg-amber-500/15 py-1.5 text-micro font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-500/25 transition-colors"
            >
              Reportar ausencia docente
            </button>
          </div>

          {/* Restaurar datos de ejemplo */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={restaurarMuestras}
              className="text-micro font-medium text-text-muted hover:text-text hover:underline"
            >
              Restablecer ejemplos de prueba
            </button>
          </div>
        </aside>

        {/* Columna Derecha: Feed de Eventos */}
        <div>
          {/* Encabezado del feed */}
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-titulo font-bold text-text">
                {fechaSeleccionada
                  ? `Eventos del ${formatearFechaRelativa(fechaSeleccionada)}`
                  : 'Próximas actividades'}
              </h2>
              <span className="rounded-lg bg-surface-alt px-2 py-0.5 text-micro font-bold text-text-muted">
                {eventosVisibles.length}
              </span>
            </div>

            {fechaSeleccionada && (
              <button
                type="button"
                onClick={() => setFechaSeleccionada(null)}
                className="text-micro font-bold text-primary hover:underline"
              >
                Limpiar filtro de fecha ✕
              </button>
            )}
          </div>

          {/* Lista de tarjetas */}
          {eventosVisibles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
              <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-surface-alt text-primary shadow-xs">
                <BackpackIcon size={34} />
              </span>
              <h3 className="text-dato font-bold text-text mb-1">
                No hay actividades registradas
              </h3>
              <p className="text-micro text-text-muted max-w-sm mx-auto mb-4">
                {fechaSeleccionada
                  ? 'No tenés ningún evento programado para esta fecha específica.'
                  : busqueda
                    ? 'No se encontraron registros que coincidan con tu búsqueda.'
                    : 'Tu agenda está limpia. Registrá un nuevo examen, tarea o profesor ausente.'}
              </p>
              <button
                type="button"
                onClick={abrirCrear}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-micro font-bold text-white shadow-xs hover:bg-primary-dark transition-all"
              >
                <span>+</span>
                <span>Registrar en Agenda</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {eventosVisibles.map((evento) => (
                <TarjetaEventoAgenda
                  key={evento.id}
                  evento={evento}
                  alAlternarTarea={toggleCompletada}
                  alEditar={abrirEditar}
                  alEliminar={borrarEvento}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear y Editar */}
      <ModalCrearEventoAgenda
        abierto={modalAbierto}
        alCerrar={() => {
          setModalAbierto(false)
          setEventoParaEditar(null)
        }}
        alGuardar={crearEvento}
        alActualizar={modificarEvento}
        eventoParaEditar={eventoParaEditar}
        fechaInicial={fechaSeleccionada}
      />
    </section>
  )
}
