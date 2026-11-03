import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EventoAgenda, FiltroAgenda, ResumenAgendaDia } from './agenda.types'
import {
  actualizarEvento,
  alternarCompletadoTarea,
  eliminarEvento,
  guardarEvento,
  obtenerAusenciasHoy,
  obtenerEventos,
  obtenerEventosProximos,
  obtenerResumenAgenda,
  reiniciarEventosEjemplo,
} from './agenda.service'

export function useAgenda(fechaReferencia: Date = new Date()) {
  const [eventos, setEventos] = useState<EventoAgenda[]>(() => obtenerEventos())
  const [filtro, setFiltro] = useState<FiltroAgenda>('todos')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)
  const cargando = false


  const recargar = useCallback(() => {
    setEventos(obtenerEventos())
  }, [])

  useEffect(() => {
    const handler = () => recargar()
    window.addEventListener('studenthub:agenda-actualizada', handler)
    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('studenthub:agenda-actualizada', handler)
      window.removeEventListener('storage', handler)
    }
  }, [recargar])

  const crearEvento = useCallback(
    (nuevo: Omit<EventoAgenda, 'id' | 'creadoEn'>) => {
      const creado = guardarEvento(nuevo)
      recargar()
      return creado
    },
    [recargar],
  )

  const modificarEvento = useCallback(
    (id: string, cambios: Partial<EventoAgenda>) => {
      const actualizado = actualizarEvento(id, cambios)
      recargar()
      return actualizado
    },
    [recargar],
  )

  const borrarEvento = useCallback(
    (id: string) => {
      const eliminado = eliminarEvento(id)
      recargar()
      return eliminado
    },
    [recargar],
  )

  const toggleCompletada = useCallback(
    (id: string) => {
      const actualizado = alternarCompletadoTarea(id)
      recargar()
      return actualizado
    },
    [recargar],
  )

  const restaurarMuestras = useCallback(() => {
    const muestras = reiniciarEventosEjemplo()
    recargar()
    return muestras
  }, [recargar])

  // Ausencias docentes de hoy
  const ausenciasHoy = useMemo(() => {
    return obtenerAusenciasHoy(fechaReferencia, eventos)
  }, [fechaReferencia, eventos])

  // Resumen del día
  const resumenHoy = useMemo<ResumenAgendaDia>(() => {
    return obtenerResumenAgenda(fechaReferencia, eventos)
  }, [fechaReferencia, eventos])

  // Eventos próximos ordenados cronológicamente
  const proximos = useMemo(() => {
    return obtenerEventosProximos(fechaReferencia, eventos, 25)
  }, [fechaReferencia, eventos])

  // Filtrado compuesto
  const eventosFiltrados = useMemo(() => {
    let resultado = [...eventos]

    // Si hay una fecha seleccionada en el calendario
    if (fechaSeleccionada) {
      resultado = resultado.filter((e) => e.fecha === fechaSeleccionada)
    }

    // Filtro de categoría
    switch (filtro) {
      case 'examen':
        resultado = resultado.filter((e) => e.tipo === 'examen')
        break
      case 'tarea':
        resultado = resultado.filter((e) => e.tipo === 'tarea' && !e.completada)
        break
      case 'ausencia_profesor':
        resultado = resultado.filter((e) => e.tipo === 'ausencia_profesor')
        break
      case 'recordatorio':
        resultado = resultado.filter((e) => e.tipo === 'recordatorio')
        break
      case 'completadas':
        resultado = resultado.filter((e) => e.tipo === 'tarea' && e.completada)
        break
      case 'todos':
      default:
        break
    }

    // Ordenar cronológicamente (más cercano primero)
    return resultado.sort((a, b) => {
      if (a.fecha !== b.fecha) {
        return a.fecha.localeCompare(b.fecha)
      }
      return (a.hora || '23:59').localeCompare(b.hora || '23:59')
    })
  }, [eventos, fechaSeleccionada, filtro])

  return {
    eventos,
    eventosFiltrados,
    proximos,
    ausenciasHoy,
    resumenHoy,
    cargando,
    filtro,
    fechaSeleccionada,
    setFiltro,
    setFechaSeleccionada,
    crearEvento,
    modificarEvento,
    borrarEvento,
    toggleCompletada,
    restaurarMuestras,
    recargar,
  }
}
