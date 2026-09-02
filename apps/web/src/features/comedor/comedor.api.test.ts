import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorComedor, obtenerSemana } from './comedor.api'

function responderCon(cuerpo: unknown, init: { ok?: boolean; status?: number } = {}) {
  const respuesta = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => cuerpo,
  } as Response
  return vi.fn().mockResolvedValue(respuesta)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('obtenerSemana', () => {
  it('pide la semana solicitada a la hoja', async () => {
    const fetchMock = responderCon([])
    vi.stubGlobal('fetch', fetchMock)

    await obtenerSemana(4)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0]![0])).toContain('?semana=4')
  })

  it('devuelve las filas cuando la hoja responde bien', async () => {
    vi.stubGlobal(
      'fetch',
      responderCon([
        {
          semana: '4',
          dia: 'Lunes',
          plato: 'Olla de carne',
          acompanamiento: 'Verduras',
          bebida: 'Agua pura',
          postre: 'Banano',
        },
      ]),
    )

    const filas = await obtenerSemana(4)
    expect(filas).toHaveLength(1)
    expect(filas[0]!.plato).toBe('Olla de carne')
  })

  it('trata como error el 200 con {error} que devuelve Apps Script', async () => {
    // Es la trampa del backend actual: falla con código 200 y un objeto.
    vi.stubGlobal('fetch', responderCon({ error: 'No se pudo leer la hoja de cálculo' }))

    await expect(obtenerSemana(4)).rejects.toThrow(ErrorComedor)
    await expect(obtenerSemana(4)).rejects.toThrow('No se pudo leer la hoja de cálculo')
  })

  it('rechaza un código HTTP de error', async () => {
    vi.stubGlobal('fetch', responderCon(null, { ok: false, status: 500 }))
    await expect(obtenerSemana(4)).rejects.toThrow('respondió 500')
  })

  it('rechaza una respuesta que no es un arreglo', async () => {
    vi.stubGlobal('fetch', responderCon({ cualquier: 'cosa' }))
    await expect(obtenerSemana(4)).rejects.toThrow('formato inesperado')
  })

  it('descarta filas que no tienen la forma esperada', async () => {
    vi.stubGlobal(
      'fetch',
      responderCon([
        { dia: 'Lunes', plato: 'Bien', acompanamiento: '', bebida: '', postre: '' },
        { dia: 'Martes' },
        null,
        'basura',
      ]),
    )

    const filas = await obtenerSemana(1)
    expect(filas).toHaveLength(1)
  })

  it('convierte un fallo de red en un ErrorComedor legible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(obtenerSemana(1)).rejects.toThrow('No se pudo contactar el servicio del comedor.')
  })

  it('deja pasar la cancelación sin disfrazarla de error', async () => {
    const abort = new DOMException('The user aborted a request.', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort))
    await expect(obtenerSemana(1)).rejects.toBe(abort)
  })
})
