import { useEffect, useState } from 'react'

/**
 * Si el dispositivo tiene red. La app se usa en un colegio con wifi irregular:
 * decirle al estudiante "estás sin conexión" es más útil que dejarlo mirando
 * una tarjeta de error sin saber si el problema es de él o del servidor.
 */
export function useEnLinea(): boolean {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine)

  useEffect(() => {
    const conectado = () => setEnLinea(true)
    const desconectado = () => setEnLinea(false)

    window.addEventListener('online', conectado)
    window.addEventListener('offline', desconectado)
    return () => {
      window.removeEventListener('online', conectado)
      window.removeEventListener('offline', desconectado)
    }
  }, [])

  return enLinea
}
