import { beforeEach, describe, expect, it, afterEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  asegurarPropietarioCache,
  escribirJsonSeguro,
  formatearUltimaSincronizacion,
  guardarDatoPublico,
  guardarDatoUsuarioScoped,
  hidratarQueryClientDesdeCache,
  leerDatoPublico,
  leerDatoUsuarioScoped,
  obtenerUltimaSincronizacion,
  persistirQueryClientEnCache,
  purgarCacheSensibleUsuario,
} from './offlineCache'
import { encolarConfirmacionComedorOffline, leerColaOffline } from './offlineQueue'

function crearMockStorage(simularCuotaEnPrimeraEscritura = false) {
  const store = new Map<string, string>()
  let cuotaLanzada = false

  return {
    get length() {
      return store.size
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (simularCuotaEnPrimeraEscritura && !cuotaLanzada && key.startsWith('studenthub:u:')) {
        cuotaLanzada = true
        const err = new Error('QuotaExceededError')
        err.name = 'QuotaExceededError'
        throw err
      }
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    dumpKeys: () => Array.from(store.keys()),
  }
}

describe('offlineCache & privacy isolation (Ley N° 8968)', () => {
  const originalLocalStorage = globalThis.localStorage
  const originalWindow = globalThis.window

  beforeEach(() => {
    globalThis.localStorage = crearMockStorage() as unknown as Storage
    globalThis.window = { dispatchEvent: () => true } as unknown as Window & typeof globalThis
  })

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage
    globalThis.window = originalWindow
  })

  it('aisla datos sensibles estrictamente por userId y conserva datos públicos separados', () => {
    guardarDatoUsuarioScoped('user-est-1', 'notas', [{ materia: 'Desarrollo Web', notaFinal: 95 }])
    guardarDatoPublico('horarios_11_1', [{ dia: 'Lunes', materia: 'Bases de Datos' }])

    // Usuario dueño lee sus datos
    const lecturaPropia = leerDatoUsuarioScoped<Array<{ materia: string }>>('user-est-1', 'notas')
    expect(lecturaPropia?.data[0]?.materia).toBe('Desarrollo Web')

    // Otro usuario distinto no puede leer los datos del usuario 1
    const lecturaOtroUsuario = leerDatoUsuarioScoped('user-est-2', 'notas')
    expect(lecturaOtroUsuario).toBeNull()

    // Datos públicos accesibles
    const pub = leerDatoPublico<Array<{ materia: string }>>('horarios_11_1')
    expect(pub?.data[0]?.materia).toBe('Bases de Datos')

    // Timestamp de última sincronización registrado
    expect(obtenerUltimaSincronizacion()).not.toBeNull()
    expect(formatearUltimaSincronizacion(Date.now())).toBe('Hace menos de 1 min')
  })

  it('maneja QuotaExceededError liberando caché público antiguo y reintentando sin fallar', () => {
    const mockQuota = crearMockStorage(true)
    mockQuota.setItem('studenthub_cache_horario_10-1', JSON.stringify([{ dia: 'Lunes', materia: 'Mate' }]))
    globalThis.localStorage = mockQuota as unknown as Storage

    guardarDatoUsuarioScoped('user-1', 'perfil', { nombre: 'Erick' })
    const guardado = leerDatoUsuarioScoped<{ nombre: string }>('user-1', 'perfil')
    expect(guardado?.data.nombre).toBe('Erick')
    expect(mockQuota.getItem('studenthub_cache_horario_10-1')).toBeNull()
  })

  it('purga obligatoriamente toda información sensible al cerrar sesión conservando preferencias públicas', () => {
    const storage = globalThis.localStorage as unknown as ReturnType<typeof crearMockStorage>
    storage.setItem('theme', 'dark')
    storage.setItem('studenthub_cache_comedor_semana_1', JSON.stringify([{ dia: 'Lunes', plato: 'Casado' }]))
    storage.setItem('studenthub:carnet:personalizacion', JSON.stringify({ tipoSangre: 'O+' }))
    storage.setItem('studenthub_agenda_eventos', JSON.stringify([{ id: '1' }]))
    storage.setItem('studenthub_confirmacion_comedor_est1_2026-03-20', JSON.stringify({ asistencia: true }))
    guardarDatoUsuarioScoped('user-1', 'notas', [{ id: 'n1' }])

    const qc = new QueryClient()
    qc.setQueryData(['estudiante-notas', 'user-1'], [{ id: 'n1' }])
    qc.setQueryData(['comedor', 'semana', 1], [{ plato: 'Casado' }])
    persistirQueryClientEnCache(qc, 'user-1')

    purgarCacheSensibleUsuario(qc)

    expect(storage.getItem('theme')).toBe('dark')
    expect(storage.getItem('studenthub_cache_comedor_semana_1')).toBeTruthy()
    expect(storage.getItem('studenthub:carnet:personalizacion')).toBeNull()
    expect(storage.getItem('studenthub_agenda_eventos')).toBeNull()
    expect(storage.getItem('studenthub_confirmacion_comedor_est1_2026-03-20')).toBeNull()
    expect(leerDatoUsuarioScoped('user-1', 'notas')).toBeNull()
    expect(qc.getQueryData(['estudiante-notas', 'user-1'])).toBeUndefined()
    expect(qc.getQueryData(['comedor', 'semana', 1])).toBeDefined()
  })

  it('purga automáticamente datos previos al cambiar entre dos usuarios reales', () => {
    asegurarPropietarioCache('real-user-A')
    guardarDatoUsuarioScoped('real-user-A', 'asistencias', [{ id: 'a1' }])

    asegurarPropietarioCache('real-user-B')
    expect(leerDatoUsuarioScoped('real-user-A', 'asistencias')).toBeNull()
  })

  it('conserva sincronización compartida entre perfiles demo de Expotécnica sin purgar overlays docentes', () => {
    const storage = globalThis.localStorage
    storage.setItem('studenthub_demo_notas_v1', JSON.stringify([{ id: 'nota-editada' }]))

    asegurarPropietarioCache('demo-docente')
    asegurarPropietarioCache('demo-est-00000000-0000-0000-0000-000000000001')

    expect(storage.getItem('studenthub_demo_notas_v1')).toContain('nota-editada')
  })

  it('hidrata QueryClient desde caché persistente al reiniciar offline', () => {
    const qcOrigen = new QueryClient()
    qcOrigen.setQueryData(['horarios', 'grupo', '11-1'], [{ dia: 'Lunes', materia: 'Web' }])
    qcOrigen.setQueryData(['estudiante-notas', 'u1', 'I Periodo'], [{ id: 'n1', notaFinal: 94 }])
    persistirQueryClientEnCache(qcOrigen, 'u1')

    const qcNuevo = new QueryClient()
    hidratarQueryClientDesdeCache(qcNuevo, 'u1')

    expect(qcNuevo.getQueryData(['horarios', 'grupo', '11-1'])).toEqual([
      { dia: 'Lunes', materia: 'Web' },
    ])
    expect(qcNuevo.getQueryData(['estudiante-notas', 'u1', 'I Periodo'])).toEqual([
      { id: 'n1', notaFinal: 94 },
    ])
  })

  it('encola confirmaciones offline por usuario deduplicando el último estado', () => {
    escribirJsonSeguro('studenthub:cache:owner_id', 'u-nocturna')
    encolarConfirmacionComedorOffline({
      ownerId: 'u-nocturna',
      estudianteId: 'est-n1',
      fecha: '2026-09-14',
      asistencia: true,
    })
    encolarConfirmacionComedorOffline({
      ownerId: 'u-nocturna',
      estudianteId: 'est-n1',
      fecha: '2026-09-14',
      asistencia: false,
    })

    const cola = leerColaOffline('u-nocturna')
    expect(cola).toHaveLength(1)
    expect(cola[0]?.asistencia).toBe(false)
  })
})
