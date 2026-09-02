import { useEffect, useState } from 'react'

/**
 * Reloj que se actualiza cada minuto.
 *
 * Hace falta para el indicador de "ahora" del horario: si la fecha se tomara
 * una sola vez al montar, un estudiante que deja la app abierta durante la
 * lección vería el marcador clavado en la clase anterior.
 *
 * Se alinea al cambio de minuto en vez de disparar cada 60 s desde que se
 * monta, para que el marcador salte cuando cambia la hora y no medio minuto
 * después.
 */
export function useReloj(): Date {
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    let intervalo: number | undefined

    const alSiguienteMinuto = 60_000 - (Date.now() % 60_000)
    const primerTic = window.setTimeout(() => {
      setAhora(new Date())
      intervalo = window.setInterval(() => setAhora(new Date()), 60_000)
    }, alSiguienteMinuto)

    return () => {
      window.clearTimeout(primerTic)
      if (intervalo !== undefined) window.clearInterval(intervalo)
    }
  }, [])

  return ahora
}
