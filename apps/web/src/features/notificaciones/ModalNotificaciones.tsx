/**
 * Modal de Configuración y Gestión de Notificaciones Estudiantiles.
 *
 * Proporciona una interfaz clara para que el estudiante:
 *  - Comprenda el beneficio de activar las notificaciones.
 *  - Conceda el permiso nativo al navegador mediante un solo clic.
 *  - Active o desactive individualmente las alertas de Comedor, Horarios y Noticias.
 *  - Pruebe en tiempo real cómo se visualizan las notificaciones en su dispositivo.
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconoCerrar, BellIcon, IconoCalendario } from '@/components/icons'
import { useNotificaciones } from './useNotificaciones'


type Props = {
  abierto: boolean
  alCerrar: () => void
}


export function ModalNotificaciones({ abierto, alCerrar }: Props) {
  const {
    soportado,
    permiso,
    canales,
    cargando,
    notificacionesActivas,
    solicitarPermiso,
    alternarCanal,
    probarNotificacion,
  } = useNotificaciones()

  // Bloquear scroll de fondo mientras el modal está abierto
  useEffect(() => {
    if (!abierto) return
    const scrollOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = scrollOriginal
    }
  }, [abierto])

  if (!abierto) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configuración de Notificaciones"
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4 animate-fade-in"
      onClick={alCerrar}
    >
      <div
        className="relative w-full max-w-lg rounded-t-3xl border border-border bg-surface p-6 shadow-2xl transition-all sm:rounded-3xl sm:p-7 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar ventana de notificaciones"
          className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-alt text-text-muted transition-colors hover:bg-border/40 hover:text-text"
        >
          <IconoCerrar className="size-4" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-tint text-primary shadow-xs">
            <BellIcon size={24} />
          </div>
          <div>
            <h2 className="text-titulo font-bold tracking-tight text-text">
              Notificaciones Estudiantiles
            </h2>
            <p className="text-micro text-text-muted">
              Recibí recordatorios de clases, menú del día y noticias en tiempo real.
            </p>
          </div>
        </div>

        {/* Estado del permiso */}
        {!soportado ? (
          <div className="mb-5 rounded-2xl border border-border bg-surface-alt p-4 text-menuda text-text-muted">
            ⚠️ Tu navegador actual no soporta la API de notificaciones web. Te recomendamos instalar la app o usar Chrome / Edge / Safari.
          </div>
        ) : permiso === 'denied' ? (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-menuda text-red-600 dark:text-red-400">
            <p className="font-bold">⚠️ Permiso bloqueado en el navegador</p>
            <p className="text-micro mt-1">
              Las notificaciones están bloqueadas en los ajustes de tu navegador. Hacé clic en el ícono de candado 🔒 junto a la barra de dirección y seleccioná &quot;Permitir notificaciones&quot;.
            </p>
          </div>
        ) : !notificacionesActivas ? (
          <div className="mb-5 rounded-2xl border border-primary/25 bg-primary-tint/50 p-4 text-menuda">
            <p className="font-bold text-text">Las notificaciones están desactivadas</p>
            <p className="text-micro text-text-muted mt-1 mb-3">
              Para no perderte el menú del comedor ni tus clases, activá las notificaciones nativas de la aplicación.
            </p>
            <button
              type="button"
              onClick={() => void solicitarPermiso()}
              disabled={cargando}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50"
            >
              <BellIcon size={18} />
              <span>{cargando ? 'Solicitando...' : 'Activar Notificaciones'}</span>
            </button>
          </div>
        ) : (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-menuda text-emerald-700 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">Permiso concedido en este dispositivo</span>
            </div>
          </div>
        )}

        {/* Canales de notificación */}
        <div className="space-y-3">
          <h3 className="text-etiqueta font-bold text-text-muted uppercase tracking-wider">
            Canales de Alerta
          </h3>

          {/* Canal: Comedor */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-3.5 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
                🍲
              </span>
              <div>
                <p className="text-menor font-bold text-text">Menú del Comedor</p>
                <p className="text-micro text-text-muted">Aviso diario con el almuerzo a las 11:30 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void probarNotificacion('comedor')}
                title="Probar notificación de comedor"
                className="cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1 text-micro font-medium text-text-muted transition-colors hover:border-primary hover:text-primary active:scale-95"
              >
                Probar
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={canales.comedor}
                onClick={() => alternarCanal('comedor')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  canales.comedor ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    canales.comedor ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Canal: Horarios */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-3.5 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <IconoCalendario className="size-5" />
              </span>
              <div>
                <p className="text-menor font-bold text-text">Recordatorios de Clases</p>
                <p className="text-micro text-text-muted">Alerta 10 minutos antes de tu próxima lección</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void probarNotificacion('horarios')}
                title="Probar notificación de horario"
                className="cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1 text-micro font-medium text-text-muted transition-colors hover:border-primary hover:text-primary active:scale-95"
              >
                Probar
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={canales.horarios}
                onClick={() => alternarCanal('horarios')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  canales.horarios ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    canales.horarios ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Canal: Noticias */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-3.5 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/15 text-lg">
                📰
              </span>
              <div>
                <p className="text-menor font-bold text-text">Noticias y Eventos</p>
                <p className="text-micro text-text-muted">Ferias, actividades y avisos urgentes del colegio</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void probarNotificacion('noticias')}
                title="Probar notificación de noticias"
                className="cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1 text-micro font-medium text-text-muted transition-colors hover:border-primary hover:text-primary active:scale-95"
              >
                Probar
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={canales.noticias}
                onClick={() => alternarCanal('noticias')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  canales.noticias ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    canales.noticias ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={alCerrar}
            className="cursor-pointer rounded-xl bg-surface-alt px-5 py-2 text-menor font-bold text-text transition-colors hover:bg-border/60 active:scale-95"
          >
            Listo
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
