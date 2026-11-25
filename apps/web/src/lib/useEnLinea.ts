import { useEffect, useState } from 'react'
import { obtenerUltimaSincronizacion } from './offlineCache'

function leerNavigatorOnline(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true
  return typeof navigator.onLine === 'boolean' ? navigator.onLine : true
}

/**
 * Indica de forma confiable si el navegador reporta conectividad de red activa.
 * Evita sondas externas que provocan falsos positivos en Cloudflare Workers.
 */
export function useEnLinea(): boolean {
  const [enLinea, setEnLinea] = useState<boolean>(leerNavigatorOnline)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sincronizar = () => {
      setEnLinea(leerNavigatorOnline())
    }

    sincronizar()
    window.addEventListener('online', sincronizar)
    window.addEventListener('offline', sincronizar)
    return () => {
      window.removeEventListener('online', sincronizar)
      window.removeEventListener('offline', sincronizar)
    }
  }, [])

  return enLinea
}

/**
 * Estado extendido de red + última marca temporal de caché local + aviso breve de reconexión.
 */
export function useEstadoRedOffline() {
  const enLinea = useEnLinea()
  const [ultimaSincronizacion, setUltimaSincronizacion] = useState<number | null>(() =>
    obtenerUltimaSincronizacion(),
  )
  const [recienReconectado, setRecienReconectado] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let timerOcultar: ReturnType<typeof setTimeout> | null = null

    const alActualizarSync = () => {
      setUltimaSincronizacion(obtenerUltimaSincronizacion())
    }

    const alReconectar = () => {
      setRecienReconectado(true)
      alActualizarSync()
      if (timerOcultar) clearTimeout(timerOcultar)
      timerOcultar = setTimeout(() => {
        setRecienReconectado(false)
      }, 4000)
    }

    const alDesconectar = () => {
      setRecienReconectado(false)
      alActualizarSync()
    }

    window.addEventListener('studenthub:sync-actualizado', alActualizarSync)
    window.addEventListener('online', alReconectar)
    window.addEventListener('offline', alDesconectar)

    return () => {
      if (timerOcultar) clearTimeout(timerOcultar)
      window.removeEventListener('studenthub:sync-actualizado', alActualizarSync)
      window.removeEventListener('online', alReconectar)
      window.removeEventListener('offline', alDesconectar)
    }
  }, [])

  return {
    enLinea,
    ultimaSincronizacion,
    recienReconectado,
  }
}
