import { useCallback, useMemo } from 'react'
import { PageSection } from '@/components/PageSection'
import { IconoInfo } from '@/components/icons'
import { MenuHoyCard } from './components/MenuHoyCard'
import { MenuSemanaGrid } from './components/MenuSemanaGrid'
import { ConfirmacionAsistenciaComedor } from './components/ConfirmacionAsistenciaComedor'
import { SafeBoundary } from '@/components/SafeBoundary'
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
      <div className="mt-2.5 flex flex-col gap-6">
        {/* Descargo Logístico Institucional Visible */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface-alt/70 px-4.5 py-3 text-menuda text-text-muted shadow-2xs">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
            <IconoInfo className="size-4" />
          </span>
          <p className="leading-relaxed">
            El menú del día está sujeto a cambios de última hora según la disponibilidad logística de insumos.
          </p>
        </div>

        {/* Tarjeta del Menú de Hoy (Almuerzo / Cena) */}
        <SafeBoundary nombre="Menú de Hoy">
          <MenuHoyCard estado={estado} hoy={hoy} onReintentar={onReintentar} />
        </SafeBoundary>

        {/* Sistema de Confirmación de Asistencia ("Comeré hoy" / "No comeré hoy") */}
        <SafeBoundary nombre="Confirmación de Comedor">
          <ConfirmacionAsistenciaComedor fecha={hoy} />
        </SafeBoundary>

        {/* Parrilla Semanal */}
        <SafeBoundary nombre="Menú Semanal">
          <MenuSemanaGrid
            dias={menusDeSemana(menus, dias)}
            subtitulo={subtitulo}
            claveDeHoy={claveDeFecha(hoy)}
            cargando={cargando}
            error={error ? mensajeDeError(error) : null}
            onReintentar={onReintentar}
          />
        </SafeBoundary>
      </div>
    </PageSection>
  )
}
