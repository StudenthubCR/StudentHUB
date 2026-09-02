import { useCallback, useMemo } from 'react'
import { PageSection } from '@/components/PageSection'
import { MenuHoyCard } from './components/MenuHoyCard'
import { MenuSemanaGrid } from './components/MenuSemanaGrid'
import { ErrorComedor } from './comedor.api'
import {
  claveDeFecha,
  esFinDeSemana,
  estadoDelDia,
  fechaDeClave,
  menusDeSemana,
  rangoDeSemana,
} from './menu.service'
import type { EstadoVista } from './menu.types'
import { useMenuSemanal } from './useMenuSemanal'

/**
 * Sólo en desarrollo: `?fecha=2026-09-05` permite revisar el comedor cerrado
 * del fin de semana, o cualquier otro día, sin tocar el reloj del sistema. En
 * el build de producción esta rama se elimina.
 */
function fechaDePrueba(): Date | null {
  if (!import.meta.env.DEV) return null
  const valor = new URLSearchParams(window.location.search).get('fecha')
  if (!valor) return null
  const fecha = fechaDeClave(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorComedor) return error.message
  return 'Revisá tu conexión e intentá de nuevo.'
}

export function ComedorPage() {
  // Se toma el reloj una sola vez por montaje. Toda la lógica que depende de
  // la fecha vive en menu.service.ts y recibe este valor por parámetro.
  const hoy = useMemo(() => fechaDePrueba() ?? new Date(), [])

  const { dias, menus, numeroDeSemana, cargando, error, reintentar } = useMenuSemanal(hoy)

  const onReintentar = useCallback(() => {
    void reintentar()
  }, [reintentar])

  const estado: EstadoVista = cargando
    ? { tipo: 'cargando' }
    : error
      ? { tipo: 'error', mensaje: mensajeDeError(error) }
      : estadoDelDia(menus, hoy)

  const rango = rangoDeSemana(dias)
  const subtitulo = esFinDeSemana(hoy)
    ? `Avance de la próxima semana (semana ${numeroDeSemana} del ciclo) — ${rango}. El comedor no abre los fines de semana.`
    : `Semana ${numeroDeSemana} del ciclo — ${rango}.`

  return (
    <PageSection titulo="Comedor Estudiantil">
      <div className="mt-2.5 flex flex-col gap-7">
        <MenuHoyCard estado={estado} hoy={hoy} onReintentar={onReintentar} />
        <MenuSemanaGrid
          dias={menusDeSemana(menus, dias)}
          subtitulo={subtitulo}
          claveDeHoy={claveDeFecha(hoy)}
          cargando={cargando}
          error={error ? mensajeDeError(error) : null}
          onReintentar={onReintentar}
        />
      </div>
    </PageSection>
  )
}
