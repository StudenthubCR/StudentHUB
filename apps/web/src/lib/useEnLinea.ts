import { useEffect, useState } from 'react'

/**
 * Si el dispositivo tiene red. La app se usa en un colegio con wifi irregular:
 * decirle al estudiante "estás sin conexión" es más útil que dejarlo mirando
 * una tarjeta de error sin saber si el problema es de él o del servidor.
 */
export function useEnLinea(): boolean {
  const [enLinea, setEnLinea] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return true
    return typeof navigator.onLine === 'boolean' ? navigator.onLine : true
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sincronizar = () => {
      setEnLinea(typeof navigator.onLine === 'boolean' ? navigator.onLine : true)
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
