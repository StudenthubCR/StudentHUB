import { describe, expect, it, beforeEach } from 'vitest'
import {
  obtenerCanalesGuardados,
  guardarCanales,
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  limpiarTodasNotificaciones,
  agregarNotificacion,
  contarNoLeidas,
  formatearTiempoRelativo,
  CANALES_POR_DEFECTO,
} from './notificaciones.service'

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

describe('notificaciones.service', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  describe('canales', () => {
    it('retorna valores por defecto cuando no hay almacenamiento previo', () => {
      const canales = obtenerCanalesGuardados()
      expect(canales).toEqual(CANALES_POR_DEFECTO)
    })

    it('guarda y recupera preferencias de canales personalizadas', () => {
      guardarCanales({
        comedor: false,
        horarios: true,
        agenda: true,
        ausencias: false,
        noticias: true,
      })

      const canales = obtenerCanalesGuardados()
      expect(canales.comedor).toBe(false)
      expect(canales.horarios).toBe(true)
      expect(canales.ausencias).toBe(false)
    })
  })

  describe('inbox de notificaciones', () => {
    it('inicializa con notificaciones semilla si la bandeja está vacía', () => {
      const notifs = obtenerNotificaciones()
      expect(notifs.length).toBeGreaterThan(0)
      expect(notifs[0]).toHaveProperty('titulo')
      expect(notifs[0]).toHaveProperty('categoria')
    })

    it('agrega una nueva notificación correctamente en la primera posición', () => {
      const nueva = agregarNotificacion(
        {
          titulo: 'Alerta Test',
          mensaje: 'Mensaje de prueba para el test',
          categoria: 'comedor',
        },
        false,
      )

      const lista = obtenerNotificaciones()
      expect(lista[0].id).toBe(nueva.id)
      expect(lista[0].titulo).toBe('Alerta Test')
      expect(lista[0].leida).toBe(false)
    })

    it('marca una notificación como leída por id', () => {
      const notifs = obtenerNotificaciones()
      const primerId = notifs[0].id

      marcarComoLeida(primerId)

      const actualizadas = obtenerNotificaciones()
      const encontrada = actualizadas.find((n) => n.id === primerId)
      expect(encontrada?.leida).toBe(true)
    })

    it('marca todas las notificaciones como leídas', () => {
      marcarTodasComoLeidas()
      const actualizadas = obtenerNotificaciones()
      expect(actualizadas.every((n) => n.leida)).toBe(true)
      expect(contarNoLeidas(actualizadas)).toBe(0)
    })

    it('elimina una notificación específica', () => {
      const iniciales = obtenerNotificaciones()
      const idAEliminar = iniciales[0].id

      eliminarNotificacion(idAEliminar)

      const restantes = obtenerNotificaciones()
      expect(restantes.some((n) => n.id === idAEliminar)).toBe(false)
    })

    it('limpia todas las notificaciones de la bandeja', () => {
      limpiarTodasNotificaciones()
      expect(obtenerNotificaciones().length).toBe(0)
      expect(contarNoLeidas([])).toBe(0)
    })
  })

  describe('formatearTiempoRelativo', () => {
    it('retorna "Ahora mismo" para fechas inmediatas', () => {
      const ahora = new Date().toISOString()
      expect(formatearTiempoRelativo(ahora)).toBe('Ahora mismo')
    })

    it('retorna minutos para lapsos cortos', () => {
      const hace10Min = new Date(Date.now() - 1000 * 60 * 10).toISOString()
      expect(formatearTiempoRelativo(hace10Min)).toBe('Hace 10 min')
    })

    it('retorna horas para lapsos de menos de un día', () => {
      const hace3Horas = new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
      expect(formatearTiempoRelativo(hace3Horas)).toBe('Hace 3 h')
    })

    it('retorna "Ayer" para fechas de hace 25 horas', () => {
      const ayer = new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString()
      expect(formatearTiempoRelativo(ayer)).toBe('Ayer')
    })
  })
})
