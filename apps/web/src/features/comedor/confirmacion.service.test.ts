import { describe, expect, it, beforeEach } from 'vitest'
import {
  fechaAClaveLocal,
  calcularFechaServicio,
  esHorarioConfirmacionAbierto,
  obtenerConfirmacionEstudiante,
  guardarConfirmacionEstudiante,
  obtenerMetricasAsistenciaComedor,
} from './confirmacion.service'

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

describe('confirmacion.service - Sección Nocturna', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  describe('fechaAClaveLocal', () => {
    it('formatea correctamente una fecha a formato YYYY-MM-DD', () => {
      const fecha = new Date(2026, 8, 29, 8, 30) // 29 de septiembre de 2026
      expect(fechaAClaveLocal(fecha)).toBe('2026-09-29')
    })
  })

  describe('calcularFechaServicio', () => {
    it('calcula servicio de mañana para horas >= 8:00 PM (20:00) entre semana', () => {
      const lunes815pm = new Date(2026, 8, 28, 20, 15) // Lunes 20:15
      const calc = calcularFechaServicio(lunes815pm)
      expect(calc.esParaManana).toBe(true)
      expect(calc.fechaServicioStr).toBe('2026-09-29') // Martes
    })

    it('calcula servicio de hoy para horas <= 5:30 PM (17:30) entre semana', () => {
      const martes2pm = new Date(2026, 8, 29, 14, 0) // Martes 14:00
      const calc = calcularFechaServicio(martes2pm)
      expect(calc.esParaManana).toBe(false)
      expect(calc.fechaServicioStr).toBe('2026-09-29') // Martes
    })

    it('domingo después de las 8:00 PM calcula el lunes como fecha destino', () => {
      const domingo815pm = new Date(2026, 8, 27, 20, 15) // Domingo 20:15
      const calc = calcularFechaServicio(domingo815pm)
      expect(calc.esParaManana).toBe(true)
      expect(calc.fechaServicioStr).toBe('2026-09-28') // Lunes
    })

    it('viernes después de las 8:00 PM calcula el lunes como próximo servicio', () => {
      const viernes815pm = new Date(2026, 9, 2, 20, 15) // Viernes 2 Oct 20:15
      const calc = calcularFechaServicio(viernes815pm)
      expect(calc.fechaServicioStr).toBe('2026-10-05') // Lunes 5 Oct
    })
  })

  describe('esHorarioConfirmacionAbierto - Ventana Horaria Nocturna', () => {
    it('permite confirmación a las 8:15 PM del día previo (válida para el día siguiente)', () => {
      const lunes815pm = new Date(2026, 8, 28, 20, 15) // Lunes 20:15
      const estado = esHorarioConfirmacionAbierto(lunes815pm)
      expect(estado.abierto).toBe(true)
      expect(estado.esParaManana).toBe(true)
      expect(estado.fechaServicioStr).toBe('2026-09-29')
    })

    it('permite confirmación a las 2:00 PM del mismo día (válida para hoy)', () => {
      const martes2pm = new Date(2026, 8, 29, 14, 0) // Martes 14:00
      const estado = esHorarioConfirmacionAbierto(martes2pm)
      expect(estado.abierto).toBe(true)
      expect(estado.esParaManana).toBe(false)
      expect(estado.fechaServicioStr).toBe('2026-09-29')
    })

    it('bloquea la confirmación a las 5:31 PM del mismo día', () => {
      const martes531pm = new Date(2026, 8, 29, 17, 31) // Martes 17:31
      const estado = esHorarioConfirmacionAbierto(martes531pm)
      expect(estado.abierto).toBe(false)
      expect(estado.motivo).toContain('5:30 PM')
    })

    it('bloquea la confirmación a las 7:00 PM (en espera de apertura de las 8:00 PM)', () => {
      const martes7pm = new Date(2026, 8, 29, 19, 0) // Martes 19:00
      const estado = esHorarioConfirmacionAbierto(martes7pm)
      expect(estado.abierto).toBe(false)
      expect(estado.motivo).toContain('8:00 PM')
      expect(estado.motivo).toContain('5:30 PM')
    })

    it('permite confirmación el domingo a las 8:15 PM para el servicio del lunes', () => {
      const domingo815pm = new Date(2026, 8, 27, 20, 15) // Domingo 20:15
      const estado = esHorarioConfirmacionAbierto(domingo815pm)
      expect(estado.abierto).toBe(true)
      expect(estado.fechaServicioStr).toBe('2026-09-28') // Lunes
    })

    it('bloquea la confirmación durante el fin de semana antes de las 8:00 PM', () => {
      const sabado3pm = new Date(2026, 8, 26, 15, 0) // Sábado 15:00
      const domingo3pm = new Date(2026, 8, 27, 15, 0) // Domingo 15:00
      expect(esHorarioConfirmacionAbierto(sabado3pm).abierto).toBe(false)
      expect(esHorarioConfirmacionAbierto(domingo3pm).abierto).toBe(false)
    })

    it('bloquea el viernes después de las 5:30 PM avisando reapertura el domingo', () => {
      const viernes535pm = new Date(2026, 9, 2, 17, 35) // Viernes 17:35
      const estado = esHorarioConfirmacionAbierto(viernes535pm)
      expect(estado.abierto).toBe(false)
      expect(estado.motivo).toContain('domingo a las 8:00 PM')
    })
  })

  describe('guardar y obtener confirmación', () => {
    it('persiste la confirmación de cena y la recupera correctamente', async () => {
      const estudianteId = 'estudiante-nocturna-123'
      const fecha = '2026-09-29'

      const guardado = await guardarConfirmacionEstudiante(estudianteId, true, fecha)
      expect(guardado.ok).toBe(true)
      expect(guardado.confirmacion?.asistencia).toBe(true)

      const recuperado = await obtenerConfirmacionEstudiante(estudianteId, fecha)
      expect(recuperado).not.toBeNull()
      expect(recuperado?.asistencia).toBe(true)
      expect(recuperado?.estudiante_id).toBe(estudianteId)
      expect(recuperado?.fecha).toBe(fecha)
    })

    it('permite cambiar la selección a "no asistiré"', async () => {
      const estudianteId = 'estudiante-nocturna-456'
      const fecha = '2026-09-29'

      await guardarConfirmacionEstudiante(estudianteId, true, fecha)
      const actualizado = await guardarConfirmacionEstudiante(estudianteId, false, fecha)

      expect(actualizado.ok).toBe(true)
      expect(actualizado.confirmacion?.asistencia).toBe(false)

      const recuperado = await obtenerConfirmacionEstudiante(estudianteId, fecha)
      expect(recuperado?.asistencia).toBe(false)
    })
  })

  describe('obtenerMetricasAsistenciaComedor', () => {
    it('retorna estructura válida de métricas con contadores numéricos para la fecha solicitada', async () => {
      const metricas = await obtenerMetricasAsistenciaComedor('2026-09-29')
      expect(metricas).toHaveProperty('totalConfirmadosComeran')
      expect(metricas).toHaveProperty('totalConfirmadosNoComeran')
      expect(metricas).toHaveProperty('totalRespuestas')
      expect(metricas).toHaveProperty('porcentajeAsistencia')
      expect(typeof metricas.totalConfirmadosComeran).toBe('number')
      expect(typeof metricas.totalConfirmadosNoComeran).toBe('number')
      expect(metricas.fecha).toBe('2026-09-29')
    })
  })
})
