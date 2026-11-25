import { createElement } from 'react'
import { describe, expect, it, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import { useEnLinea } from './useEnLinea'
import { AvisoSinConexion } from '@/app/layout/AvisoSinConexion'

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u

describe('useEnLinea & AvisoSinConexion', () => {
  const originalWindow = globalThis.window
  const originalNavigator = globalThis.navigator

  afterEach(() => {
    globalThis.window = originalWindow
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    })
  })

  it('no genera falsos positivos offline en entorno SSR ni cuando navigator.onLine es true', () => {
    globalThis.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
    } as unknown as Window & typeof globalThis
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      configurable: true,
      writable: true,
    })

    let estado = false
    function Probe() {
      estado = useEnLinea()
      return null
    }
    renderToString(createElement(Probe))
    expect(estado).toBe(true)

    const bannerHtml = renderToString(createElement(AvisoSinConexion))
    expect(bannerHtml).toBe('')
  })

  it('muestra banner offline limpio con ícono SVG y cero emojis cuando navigator.onLine es false', () => {
    globalThis.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
    } as unknown as Window & typeof globalThis
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      configurable: true,
      writable: true,
    })

    let estado = true
    function Probe() {
      estado = useEnLinea()
      return null
    }
    renderToString(createElement(Probe))
    expect(estado).toBe(false)

    const bannerHtml = renderToString(createElement(AvisoSinConexion))
    expect(bannerHtml).toContain('Modo sin conexión')
    expect(bannerHtml).toContain('Mostrando información guardada en caché')
    expect(bannerHtml).toContain('<svg')
    expect(bannerHtml.match(EMOJI_REGEX)).toBeNull()
  })
})
