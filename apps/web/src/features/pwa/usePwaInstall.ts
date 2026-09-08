import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type TipoPlataforma = 'ios' | 'android' | 'escritorio'

function detectarModoInstalado(): boolean {
  if (typeof window === 'undefined') return false

  // 1. Estándar W3C: display-mode
  const esStandaloneMedia =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches

  // 2. iOS Safari histórico
  const esIosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true

  // 3. Referrer de app de Android
  const esAndroidApp = typeof document !== 'undefined' && document.referrer.includes('android-app://')

  return esStandaloneMedia || esIosStandalone || esAndroidApp
}

function detectarPlataforma(): TipoPlataforma {
  if (typeof window === 'undefined') return 'escritorio'

  const ua = window.navigator.userAgent
  const esIos =
    /iPhone|iPad|iPod/i.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)

  if (esIos) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'escritorio'
}

function detectarInApp(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent || window.navigator.vendor || ''
  return /FBAN|FBAV|Instagram|TikTok|Line|WhatsApp|Twitter|MicroMessenger/i.test(ua)
}

const CLAVE_DEV_BYPASS = 'sh_dev_bypass_pwa'

export function usePwaInstall() {
  const [esModoInstalado, setEsModoInstalado] = useState<boolean>(detectarModoInstalado)
  const [eventoPrompt, setEventoPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [plataforma] = useState<TipoPlataforma>(detectarPlataforma)
  const [esInApp] = useState<boolean>(detectarInApp)
  const [instalando, setInstalando] = useState(false)
  const [omitidoDev, setOmitidoDev] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return import.meta.env.DEV && window.sessionStorage.getItem(CLAVE_DEV_BYPASS) === 'true'
  })

  // Escuchar cambios en modo de visualización y eventos del ciclo PWA
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const manejarCambioMedia = (e: MediaQueryListEvent) => {
      if (e.matches) setEsModoInstalado(true)
    }

    const manejarBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setEventoPrompt(e as BeforeInstallPromptEvent)
    }

    const manejarAppInstalled = () => {
      setEsModoInstalado(true)
      setEventoPrompt(null)
    }

    mediaQuery.addEventListener('change', manejarCambioMedia)
    window.addEventListener('beforeinstallprompt', manejarBeforeInstallPrompt)
    window.addEventListener('appinstalled', manejarAppInstalled)

    return () => {
      mediaQuery.removeEventListener('change', manejarCambioMedia)
      window.removeEventListener('beforeinstallprompt', manejarBeforeInstallPrompt)
      window.removeEventListener('appinstalled', manejarAppInstalled)
    }
  }, [])

  const instalar = useCallback(async (): Promise<boolean> => {
    if (!eventoPrompt) return false
    try {
      setInstalando(true)
      await eventoPrompt.prompt()
      const eleccion = await eventoPrompt.userChoice
      if (eleccion.outcome === 'accepted') {
        setEsModoInstalado(true)
        setEventoPrompt(null)
        return true
      }
      return false
    } catch (e) {
      console.error('Error al solicitar instalación PWA:', e)
      return false
    } finally {
      setInstalando(false)
    }
  }, [eventoPrompt])

  const permitirEnDesarrollo = useCallback(() => {
    if (import.meta.env.DEV) {
      window.sessionStorage.setItem(CLAVE_DEV_BYPASS, 'true')
      setOmitidoDev(true)
    }
  }, [])

  return {
    esModoInstalado: esModoInstalado || omitidoDev,
    puedeInstalarDirecto: Boolean(eventoPrompt),
    plataforma,
    esInApp,
    instalando,
    instalar,
    esDev: import.meta.env.DEV,
    permitirEnDesarrollo,
  }
}
