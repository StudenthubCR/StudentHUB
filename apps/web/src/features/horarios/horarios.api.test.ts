import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorHorarios, obtenerHorario } from './horarios.api'

const FILA_OK = {
  grupo: '11-2',
  dia: 'Lunes',
  hora: '5:50pm-6:35pm',
  materia: 'Diseño software',
}

const GRUPO_ROTO = 'Sat Feb 11 2023 00:00:00 GMT-0600 (Central Standard Time)'

function respuesta(cuerpo: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => cuerpo,
  } as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('obtenerHorario', () => {
  it('pide el grupo solicitado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta([FILA_OK]))
    vi.stubGlobal('fetch', fetchMock)

    await obtenerHorario('11-2')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0]![0])).toContain('?grupo=11-2')
  })

  it('devuelve las filas cuando la hoja responde bien', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta([FILA_OK])))
    const filas = await obtenerHorario('11-2')
    expect(filas).toEqual([FILA_OK])
  })

  it('trata como error el 200 con {error} que devuelve Apps Script', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ error: 'Hoja no encontrada' })))
    await expect(obtenerHorario('11-2')).rejects.toThrow(ErrorHorarios)
    await expect(obtenerHorario('11-2')).rejects.toThrow('Hoja no encontrada')
  })

  it('rechaza un código HTTP de error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(null, { ok: false, status: 500 })))
    await expect(obtenerHorario('11-2')).rejects.toThrow('respondió 500')
  })

  it('pide la hoja completa y filtra si la consulta por grupo viene vacía', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuesta([]))
      .mockResolvedValueOnce(
        respuesta([FILA_OK, { ...FILA_OK, grupo: '10-1', materia: 'Otra cosa' }]),
      )
    vi.stubGlobal('fetch', fetchMock)

    const filas = await obtenerHorario('11-2')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[1]![0])).not.toContain('?grupo=')
    expect(filas).toEqual([FILA_OK])
  })

  it('también recurre al respaldo si la columna del grupo quedó como fecha', async () => {
    // Con la columna arruinada el Apps Script no puede filtrar, así que
    // devuelve filas inservibles para el filtro; el respaldo trae todo.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuesta([{ ...FILA_OK, grupo: GRUPO_ROTO }]))
      .mockResolvedValueOnce(respuesta([{ ...FILA_OK, grupo: GRUPO_ROTO }]))
    vi.stubGlobal('fetch', fetchMock)

    const filas = await obtenerHorario('11-2')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    // Sin columna utilizable se muestra todo, en vez de dejar la pantalla vacía.
    expect(filas).toHaveLength(1)
  })

  it('no insiste con el respaldo cuando la primera respuesta ya sirve', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta([FILA_OK]))
    vi.stubGlobal('fetch', fetchMock)

    await obtenerHorario('11-2')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('descarta filas que no tienen la forma esperada', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respuesta([FILA_OK, { dia: 'Lunes' }, null, 'basura'])),
    )
    expect(await obtenerHorario('11-2')).toHaveLength(1)
  })

  it('convierte un fallo de red en un ErrorHorarios legible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(obtenerHorario('11-2')).rejects.toThrow(
      'No se pudo contactar el servicio de horarios.',
    )
  })

  it('deja pasar la cancelación sin disfrazarla de error', async () => {
    const abort = new DOMException('The user aborted a request.', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort))
    await expect(obtenerHorario('11-2')).rejects.toBe(abort)
  })
})
