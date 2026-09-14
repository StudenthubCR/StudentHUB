import { describe, expect, it, beforeEach } from 'vitest'
import {
  actualizarEvento,
  alternarCompletadoTarea,
  eliminarEvento,
  formatearFechaRelativa,
  generarEventosSemilla,
  guardarEvento,
  obtenerAusenciasHoy,
  obtenerEventos,
  obtenerEventosProximos,
  reiniciarEventosEjemplo,
} from './agenda.service'

// Mock para entorno Node
const memoryStore = new Map<string, string>()
const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, val: string) => memoryStore.set(key, val),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
}
// @ts-expect-error Mocking browser storage in Node
globalThis.localStorage = mockLocalStorage
// @ts-expect-error Mocking window in Node
globalThis.window = { dispatchEvent: () => true }

describe('agenda.service', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })


  it('genera semillas completas con exámenes, tareas y ausencias de docentes', () => {
    const semillas = generarEventosSemilla(new Date(2026, 8, 14))
    expect(semillas.length).toBeGreaterThanOrEqual(4)

    const tipos = semillas.map((s) => s.tipo)
    expect(tipos).toContain('examen')
    expect(tipos).toContain('tarea')
    expect(tipos).toContain('ausencia_profesor')
  })

  it('guarda y recupera un nuevo evento en storage', () => {
    reiniciarEventosEjemplo()

    const nuevo = guardarEvento({
      tipo: 'examen',
      titulo: 'Prueba de Matemática',
      materia: 'Matemática',
      fecha: '2026-09-20',
      porcentaje: 30,
    })

    expect(nuevo.id).toBeDefined()
    expect(nuevo.titulo).toBe('Prueba de Matemática')

    const todos = obtenerEventos()
    expect(todos.some((e) => e.id === nuevo.id)).toBe(true)
  })

  it('alterna el estado completado de una tarea', () => {
    reiniciarEventosEjemplo()
    const todos = obtenerEventos()
    const tarea = todos.find((e) => e.tipo === 'tarea')!
    expect(tarea).toBeDefined()

    const estadoInicial = Boolean(tarea.completada)
    const toggleado = alternarCompletadoTarea(tarea.id)
    expect(toggleado?.completada).toBe(!estadoInicial)

    // Si la volvemos a alternar, regresa a su estado inicial
    const reToggleado = alternarCompletadoTarea(tarea.id)
    expect(reToggleado?.completada).toBe(estadoInicial)
  })

  it('elimina un evento correctamente', () => {
    reiniciarEventosEjemplo()
    const antes = obtenerEventos()
    const idParaBorrar = antes[0].id

    const exito = eliminarEvento(idParaBorrar)
    expect(exito).toBe(true)

    const despues = obtenerEventos()
    expect(despues.length).toBe(antes.length - 1)
    expect(despues.some((e) => e.id === idParaBorrar)).toBe(false)
  })

  it('actualiza campos específicos de un evento', () => {
    reiniciarEventosEjemplo()
    const antes = obtenerEventos()
    const id = antes[0].id

    const actualizado = actualizarEvento(id, { titulo: 'Título Modificado' })
    expect(actualizado?.titulo).toBe('Título Modificado')

    const recargado = obtenerEventos().find((e) => e.id === id)
    expect(recargado?.titulo).toBe('Título Modificado')
  })

  it('formatea fechas relativas correctamente', () => {
    const hoy = new Date(2026, 8, 14) // 14 Sep 2026
    expect(formatearFechaRelativa('2026-09-14', hoy)).toBe('Hoy')
    expect(formatearFechaRelativa('2026-09-15', hoy)).toBe('Mañana')
    expect(formatearFechaRelativa('2026-09-13', hoy)).toBe('Ayer')
    expect(formatearFechaRelativa('2026-09-17', hoy)).toBe('En 3 días')
  })

  it('filtra correctamente ausencias de profesores para la fecha actual', () => {
    const hoy = new Date(2026, 8, 14)
    const eventos = [
      {
        id: '1',
        tipo: 'ausencia_profesor' as const,
        titulo: 'Ausente',
        materia: 'Química',
        profesor: 'Prof. Mora',
        fecha: '2026-09-14',
        creadoEn: new Date().toISOString(),
      },
      {
        id: '2',
        tipo: 'tarea' as const,
        titulo: 'Guía',
        materia: 'Química',
        fecha: '2026-09-14',
        creadoEn: new Date().toISOString(),
      },
      {
        id: '3',
        tipo: 'ausencia_profesor' as const,
        titulo: 'Ausente Mañana',
        materia: 'Inglés',
        profesor: 'Teacher Ana',
        fecha: '2026-09-15',
        creadoEn: new Date().toISOString(),
      },
    ]

    const ausenciasHoy = obtenerAusenciasHoy(hoy, eventos)
    expect(ausenciasHoy.length).toBe(1)
    expect(ausenciasHoy[0].profesor).toBe('Prof. Mora')
  })

  it('ordena eventos cronológicamente descartando pasados', () => {
    const hoy = new Date(2026, 8, 14)
    const eventos = [
      {
        id: '1',
        tipo: 'examen' as const,
        titulo: 'Examen Futuro',
        materia: 'Cívica',
        fecha: '2026-09-20',
        hora: '10:00',
        creadoEn: new Date().toISOString(),
      },
      {
        id: '2',
        tipo: 'tarea' as const,
        titulo: 'Tarea Pasada',
        materia: 'Historia',
        fecha: '2026-09-10',
        creadoEn: new Date().toISOString(),
      },
      {
        id: '3',
        tipo: 'tarea' as const,
        titulo: 'Tarea Mañana',
        materia: 'Biología',
        fecha: '2026-09-15',
        hora: '07:00',
        creadoEn: new Date().toISOString(),
      },
    ]

    const proximos = obtenerEventosProximos(hoy, eventos)
    expect(proximos.length).toBe(2)
    expect(proximos[0].id).toBe('3') // 15 de sep antes que 20 de sep
    expect(proximos[1].id).toBe('1')
  })
})
