/**
 * Modal de Centro de Notificaciones Estudiantiles.
 *
 * Ofrece dos vistas principales:
 *  1. Bandeja de Entrada: Historial interactivo de alertas con filtros (Todas,
 *     No leídas, Comedor, Clases, Ausencias), navegación rápida a las secciones,
 *     marcado como leída y eliminación.
 *  2. Canales y Ajustes: Configuración de permisos nativos y conmutadores de
 *     alertas por tema, además de un simulador para probar notificaciones en vivo.
 */

import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  IconoCerrar,
  IconoCampana,
  IconoCalendario,
} from '@/components/icons'
import {
  type CategoriaNotificacion,
  type NotificacionItem,
  formatearTiempoRelativo,
} from './notificaciones.service'
import { useNotificaciones } from './useNotificaciones'

type Props = {
  abierto: boolean
  alCerrar: () => void
}

type Pestaña = 'bandeja' | 'canales'
type Filtro = 'todas' | 'no_leidas' | CategoriaNotificacion

export function ModalNotificaciones({ abierto, alCerrar }: Props) {
  const navigate = useNavigate()
  const {
    soportado,
    permiso,
    canales,
    notificaciones,
    noLeidas,
    cargando,
    notificacionesActivas,
    solicitarPermiso,
    alternarCanal,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    limpiarTodo,
    probarNotificacion,
  } = useNotificaciones()

  const [pestaña, setPestaña] = useState<Pestaña>('bandeja')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [mensajeToast, setMensajeToast] = useState<string | null>(null)

  // Bloquear scroll de fondo mientras el modal está abierto
  useEffect(() => {
    if (!abierto) return
    const scrollOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = scrollOriginal
    }
  }, [abierto])

  // Mostrar mensaje de éxito temporal al emitir pruebas
  const dispararPrueba = async (tipo: CategoriaNotificacion) => {
    const ok = await probarNotificacion(tipo)
    if (ok) {
      setMensajeToast('¡Alerta de prueba emitida y agregada a tu bandeja! 🔔')
      setTimeout(() => setMensajeToast(null), 3500)
    }
  }

  // Filtrado reactivo de las notificaciones
  const notificacionesFiltradas = useMemo(() => {
    return notificaciones.filter((item) => {
      if (filtro === 'todas') return true
      if (filtro === 'no_leidas') return !item.leida
      return item.categoria === filtro
    })
  }, [notificaciones, filtro])

  const manejarClickNotificacion = (item: NotificacionItem) => {
    if (!item.leida) {
      marcarComoLeida(item.id)
    }
    if (item.enlace) {
      alCerrar()
      navigate(item.enlace)
    }
  }

  if (!abierto) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Centro de Notificaciones"
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4 animate-fade-in"
      onClick={alCerrar}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-3xl border border-border bg-surface shadow-2xl transition-all sm:max-h-[85vh] sm:rounded-3xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado fijo */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary shadow-xs">
              <IconoCampana className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-titulo font-bold tracking-tight text-text">
                  Notificaciones
                </h2>
                {noLeidas > 0 && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-micro font-bold text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    {noLeidas} {noLeidas === 1 ? 'nueva' : 'nuevas'}
                  </span>
                )}
              </div>
              <p className="text-micro text-text-muted">
                Centro de alertas y avisos en tiempo real
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar ventana de notificaciones"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-alt text-text-muted transition-colors hover:bg-border/40 hover:text-text"
          >
            <IconoCerrar className="size-4" />
          </button>
        </div>

        {/* Selector de Pestañas (Tabs) */}
        <div className="flex border-b border-border bg-surface-alt/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setPestaña('bandeja')}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-menor font-bold transition-all ${
              pestaña === 'bandeja'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <span>Bandeja</span>
            {noLeidas > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                {noLeidas}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPestaña('canales')}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-menor font-bold transition-all ${
              pestaña === 'canales'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <span>Canales y Ajustes</span>
            {!notificacionesActivas && permiso !== 'denied' && (
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Toast de confirmación de prueba */}
        {mensajeToast && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-menor text-emerald-700 dark:text-emerald-300 animate-fade-in">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{mensajeToast}</span>
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {pestaña === 'bandeja' ? (
            <div className="flex flex-col gap-4">
              {/* Barra de Filtros y Acciones */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'todas', label: 'Todas' },
                      { id: 'no_leidas', label: `No leídas (${noLeidas})` },
                      { id: 'comedor', label: 'Comedor 🍲' },
                      { id: 'ausencias', label: 'Ausencias ⚠️' },
                      { id: 'agenda', label: 'Agenda 📝' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFiltro(f.id)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-micro font-bold transition-all ${
                        filtro === f.id
                          ? 'bg-primary text-white shadow-xs'
                          : 'border border-border bg-surface text-text-muted hover:border-primary/40 hover:text-text'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {noLeidas > 0 && (
                    <button
                      type="button"
                      onClick={marcarTodasComoLeidas}
                      title="Marcar todas como leídas"
                      className="cursor-pointer text-micro font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      Marcar todo leído
                    </button>
                  )}
                  {notificaciones.length > 0 && (
                    <button
                      type="button"
                      onClick={limpiarTodo}
                      title="Limpiar todas las notificaciones"
                      className="cursor-pointer text-micro text-text-muted hover:text-rose-500 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de Notificaciones */}
              {notificacionesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-alt/40 px-6 py-12 text-center">
                  <span className="text-4xl mb-3">🎉</span>
                  <p className="text-dato font-bold text-text">
                    {filtro === 'no_leidas'
                      ? '¡No tienes notificaciones pendientes!'
                      : 'Bandeja vacía'}
                  </p>
                  <p className="mt-1 text-menuda text-text-muted max-w-xs">
                    {filtro === 'no_leidas'
                      ? 'Todas tus alertas han sido leídas. Te avisaremos cuando haya novedades en el colegio.'
                      : 'Cuando se publiquen avisos de comedor o lecciones aparecerán aquí.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {notificacionesFiltradas.map((item) => {
                    const estiloCategoria =
                      item.categoria === 'comedor'
                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : item.categoria === 'ausencias'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                          : item.categoria === 'agenda'
                            ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                            : item.categoria === 'horarios'
                              ? 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                              : 'border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400'

                    return (
                      <div
                        key={item.id}
                        onClick={() => manejarClickNotificacion(item)}
                        className={`group relative flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 ${
                          !item.leida
                            ? 'border-primary/40 bg-primary-tint/30 shadow-xs hover:border-primary/60 hover:bg-primary-tint/50'
                            : 'border-border bg-surface-alt/60 hover:border-border-strong hover:bg-surface-alt'
                        }`}
                      >
                        {/* Punto de no leída */}
                        {!item.leida && (
                          <span
                            className="absolute top-4 right-4 size-2 rounded-full bg-primary animate-pulse"
                            title="No leída"
                          />
                        )}

                        {/* Ícono temático */}
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl border text-base shadow-xs ${estiloCategoria}`}
                        >
                          {item.categoria === 'comedor'
                            ? '🍲'
                            : item.categoria === 'ausencias'
                              ? '⚠️'
                              : item.categoria === 'agenda'
                                ? '📝'
                                : item.categoria === 'horarios'
                                  ? '⏰'
                                  : '📢'}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${estiloCategoria}`}
                            >
                              {item.categoria}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {formatearTiempoRelativo(item.fechaIso)}
                            </span>
                          </div>

                          <h3
                            className={`mt-1 text-menor font-bold ${
                              !item.leida ? 'text-text' : 'text-text-muted'
                            }`}
                          >
                            {item.titulo}
                          </h3>

                          <p className="mt-0.5 text-menuda text-text-muted leading-relaxed">
                            {item.mensaje}
                          </p>

                          {/* Enlace de acción rápida */}
                          {item.enlace && (
                            <span className="mt-2 inline-flex items-center gap-1 text-micro font-bold text-primary hover:underline">
                              <span>Ver detalles</span>
                              <span>→</span>
                            </span>
                          )}
                        </div>

                        {/* Botón eliminar individual */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            eliminarNotificacion(item.id)
                          }}
                          title="Eliminar notificación"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-muted hover:text-rose-500 cursor-pointer"
                        >
                          <IconoCerrar className="size-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Pestaña: Canales y Ajustes */
            <div className="flex flex-col gap-6">
              {/* Estado del permiso nativo */}
              {!soportado ? (
                <div className="rounded-2xl border border-border bg-surface-alt p-4 text-menuda text-text-muted">
                  ⚠️ Tu navegador actual no soporta la API de notificaciones web. Te sugerimos instalar la app o usar Chrome / Edge / Safari.
                </div>
              ) : permiso === 'denied' ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4.5 text-menuda text-red-600 dark:text-red-400">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>⚠️ Permiso bloqueado en tu navegador</span>
                  </p>
                  <p className="text-micro mt-1.5 leading-relaxed">
                    Las notificaciones están bloqueadas en la configuración de este sitio. Hacé clic en el ícono de candado 🔒 junto a la barra de dirección del navegador y activá &quot;Permitir notificaciones&quot;.
                  </p>
                </div>
              ) : !notificacionesActivas ? (
                <div className="rounded-2xl border border-primary/25 bg-primary-tint/60 p-4.5 text-menuda">
                  <p className="font-bold text-text">
                    Las notificaciones nativas están inactivas
                  </p>
                  <p className="text-micro text-text-muted mt-1 mb-3.5 leading-relaxed">
                    Recibí alertas en tu celular o computadora incluso con la app cerrada: avisos de comedor, ausencias de profesores y recordatorios de lecciones.
                  </p>
                  <button
                    type="button"
                    onClick={() => void solicitarPermiso()}
                    disabled={cargando}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50"
                  >
                    <IconoCampana className="size-4" />
                    <span>{cargando ? 'Solicitando...' : 'Activar Notificaciones en este Dispositivo'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-menuda text-emerald-700 dark:text-emerald-400">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">Notificaciones nativas activadas en este dispositivo</span>
                  </div>
                  <svg className="size-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Conmutadores de canales */}
              <div className="flex flex-col gap-3">
                <h3 className="text-etiqueta font-bold text-text-muted uppercase tracking-wider">
                  Canales de Alerta Disponibles
                </h3>

                {/* Comedor */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
                      🍲
                    </span>
                    <div>
                      <p className="text-menor font-bold text-text">Menú del Comedor</p>
                      <p className="text-micro text-text-muted">Aviso diario del plato escolar a las 11:30 AM</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={canales.comedor}
                    onClick={() => alternarCanal('comedor')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      canales.comedor ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                        canales.comedor ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Ausencias de Profesores */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/15 text-lg">
                      ⚠️
                    </span>
                    <div>
                      <p className="text-menor font-bold text-text">Ausencias de Profesores</p>
                      <p className="text-micro text-text-muted">Avisos urgentes de docentes reportados ausentes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={canales.ausencias}
                    onClick={() => alternarCanal('ausencias')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      canales.ausencias ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                        canales.ausencias ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Horarios */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      <IconoCalendario className="size-5" />
                    </span>
                    <div>
                      <p className="text-menor font-bold text-text">Recordatorios de Clases</p>
                      <p className="text-micro text-text-muted">Alerta 10 minutos antes de tu próxima lección</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={canales.horarios}
                    onClick={() => alternarCanal('horarios')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      canales.horarios ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                        canales.horarios ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Agenda */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/15 text-lg">
                      📝
                    </span>
                    <div>
                      <p className="text-menor font-bold text-text">Agenda y Evaluaciones</p>
                      <p className="text-micro text-text-muted">Recordatorio 24 horas antes de exámenes y tareas</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={canales.agenda}
                    onClick={() => alternarCanal('agenda')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      canales.agenda ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                        canales.agenda ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Noticias */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-alt/70 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-purple-500/15 text-lg">
                      📢
                    </span>
                    <div>
                      <p className="text-menor font-bold text-text">Comunicados del CTP</p>
                      <p className="text-micro text-text-muted">Ferias, matrícula y noticias institucionales</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={canales.noticias}
                    onClick={() => alternarCanal('noticias')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      canales.noticias ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                        canales.noticias ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Simulador de Pruebas */}
              <div className="rounded-2xl border border-border bg-surface-alt/40 p-4">
                <p className="text-menor font-bold text-text mb-1">
                  🧪 Simulador de Alertas en Vivo
                </p>
                <p className="text-micro text-text-muted mb-3">
                  Prueba cómo se visualizan las alertas nativas y cómo se archivan en tu bandeja:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void dispararPrueba('comedor')}
                    className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-micro font-bold text-text hover:border-primary hover:text-primary transition-colors active:scale-95 shadow-2xs"
                  >
                    🍲 Probar Comedor
                  </button>
                  <button
                    type="button"
                    onClick={() => void dispararPrueba('ausencias')}
                    className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-micro font-bold text-text hover:border-rose-500 hover:text-rose-500 transition-colors active:scale-95 shadow-2xs"
                  >
                    ⚠️ Probar Ausencia Docente
                  </button>
                  <button
                    type="button"
                    onClick={() => void dispararPrueba('horarios')}
                    className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-micro font-bold text-text hover:border-blue-500 hover:text-blue-500 transition-colors active:scale-95 shadow-2xs"
                  >
                    ⏰ Probar Clase
                  </button>
                  <button
                    type="button"
                    onClick={() => void dispararPrueba('agenda')}
                    className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-micro font-bold text-text hover:border-indigo-500 hover:text-indigo-500 transition-colors active:scale-95 shadow-2xs"
                  >
                    📝 Probar Agenda
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie fijo */}
        <div className="flex items-center justify-between border-t border-border bg-surface px-6 py-3.5">
          <span className="text-micro text-text-muted">
            {pestaña === 'bandeja'
              ? `${notificaciones.length} ${notificaciones.length === 1 ? 'notificación' : 'notificaciones'}`
              : 'Preferencias guardadas automáticamente'}
          </span>
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
