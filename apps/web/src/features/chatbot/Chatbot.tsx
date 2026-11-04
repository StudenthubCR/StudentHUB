import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  IconoCerrar,
  IconoMensaje,
  IconoEnviar,
} from '@/components/icons'
import {
  IconoAsistenteBot,
  IconoUsuarioChat,
  IconoComedorChip,
  IconoHorarioChip,
  IconoEventosChip,
  IconoCarnetChip,
  IconoBajarFinal,
  IconoLimpiarChat,
  IconoReintentarChat,
  IconoErrorAlerta,
} from './icons'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { useHorario } from '@/features/horarios/useHorario'
import { useMenuSemanal } from '@/features/comedor/useMenuSemanal'
import { useReloj } from '@/lib/useReloj'
import { SUGERENCIAS_RAPIDAS } from './chatbot.service'
import { useChatbot } from './useChatbot'

interface ChatbotProps {
  inicialmenteAbierto?: boolean
}

export function Chatbot({ inicialmenteAbierto = false }: ChatbotProps = {}) {
  const [abierto, setAbierto] = useState<boolean>(inicialmenteAbierto)
  const [textoEntrada, setTextoEntrada] = useState<string>('')

  const { estudiante } = useEstudiante()
  const ahora = useReloj()
  const grupoActivo = estudiante?.grupo ?? '11-1'
  const horario = useHorario(grupoActivo, ahora)
  const comedor = useMenuSemanal(ahora)

  const primerNombre = estudiante?.nombre ? estudiante.nombre.split(' ')[0] : undefined

  const {
    mensajes,
    escribiendo,
    error,
    mostrarBotonBajar,
    contenedorRef,
    finalMensajesRef,
    enviarMensaje,
    reintentar,
    limpiarConversacion,
    desplazarAlFinal,
    manejarScroll,
  } = useChatbot({
    primerNombre,
    grupoActivo,
    horariosDias: horario.dias,
    menusComedor: comedor.menus,
    ahora,
  })

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const shouldReduceMotion = useReducedMotion()

  // Foco automático en el campo de entrada al abrir la ventana
  useEffect(() => {
    if (abierto) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [abierto])

  // Devolver foco al campo tras finalizar respuesta
  useEffect(() => {
    if (!escribiendo && abierto) {
      inputRef.current?.focus()
    }
  }, [escribiendo, abierto])

  // Cerrar el asistente al presionar la tecla Escape
  useEffect(() => {
    if (!abierto) return
    const alPresionarTecla = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false)
      }
    }
    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [abierto])

  const manejarEnvio = async (textoPersonalizado?: string) => {
    const texto = (textoPersonalizado ?? textoEntrada).trim()
    if (!texto || escribiendo) return

    if (!textoPersonalizado) {
      setTextoEntrada('')
    }

    await enviarMensaje(texto)
  }

  const manejarSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    void manejarEnvio()
  }

  const manejarKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void manejarEnvio()
    }
  }

  /**
   * Renderizado estructurado de markdown seguro (negritas, cursivas, listas y saltos de línea)
   */
  const formatearTexto = (texto: string) => {
    return texto.split('\n').map((linea, index) => {
      const partes = linea.split(/(\*\*.*?\*\*|\*.*?\*)/g)
      return (
        <span key={`linea-${index}`} className="block leading-relaxed min-h-[1.25em]">
          {partes.map((parte, pIdx) => {
            if (parte.startsWith('**') && parte.endsWith('**')) {
              return (
                <strong key={`b-${pIdx}`} className="font-semibold text-text">
                  {parte.slice(2, -2)}
                </strong>
              )
            }
            if (parte.startsWith('*') && parte.endsWith('*')) {
              return (
                <em key={`em-${pIdx}`} className="italic text-text-muted">
                  {parte.slice(1, -1)}
                </em>
              )
            }
            return parte
          })}
        </span>
      )
    })
  }

  const renderIconoChip = (categoria: 'comedor' | 'horarios' | 'eventos' | 'carnet') => {
    switch (categoria) {
      case 'comedor':
        return <IconoComedorChip className="size-3.5 text-primary" />
      case 'horarios':
        return <IconoHorarioChip className="size-3.5 text-primary" />
      case 'eventos':
        return <IconoEventosChip className="size-3.5 text-primary" />
      case 'carnet':
        return <IconoCarnetChip className="size-3.5 text-primary" />
    }
  }

  return (
    <>
      {/* Botón flotante para abrir el asistente */}
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir asistente virtual"
          title="Asistente virtual institucional de Student HUB"
          className={
            'fixed z-[1050] flex size-14 cursor-pointer items-center justify-center rounded-full ' +
            'bg-primary text-white shadow-xl transition-all duration-300 ' +
            'hover:bg-primary-dark hover:scale-105 active:scale-95 ' +
            'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
            'right-4 bottom-[calc(86px_+_env(safe-area-inset-bottom))] lg:right-7 lg:bottom-7'
          }
        >
          <div className="relative flex items-center justify-center">
            <IconoMensaje className="size-6" />
            <span
              className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-surface bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
          </div>
        </button>
      )}

      {/* Ventana de Diálogo Flotante del Asistente */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            role="dialog"
            aria-label="Asistente virtual de Student HUB"
            aria-modal="false"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={
              'fixed z-[1050] flex flex-col overflow-hidden rounded-3xl border border-border ' +
              'bg-surface shadow-2xl transition-all ' +
              'left-3 right-3 sm:left-auto sm:right-7 w-auto sm:w-[400px] max-w-[420px] ' +
              'max-h-[calc(100dvh-5.5rem)] h-[min(560px,calc(100svh-5.5rem))] ' +
              'bottom-[calc(76px_+_env(safe-area-inset-bottom))] sm:bottom-24 font-sans'
            }
          >
            {/* Cabecera del Asistente */}
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-primary px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex size-9.5 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                  <IconoAsistenteBot className="size-5" />
                </div>
                <div>
                  <h3 className="text-menor font-bold leading-tight">Asistente Student HUB</h3>
                  <div className="flex items-center gap-1.5 text-micro text-white/85">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                    <span>En línea • 100% Offline</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={limpiarConversacion}
                  aria-label="Reiniciar conversación"
                  title="Reiniciar conversación"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <IconoLimpiarChat className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar chat"
                  title="Cerrar chat"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <IconoCerrar className="size-4" />
                </button>
              </div>
            </div>

            {/* Contenedor de Mensajes con Scroll y Región en Vivo */}
            <div
              ref={contenedorRef}
              onScroll={manejarScroll}
              role="log"
              aria-live="polite"
              aria-label="Historial de mensajes del asistente"
              className="relative flex-1 min-h-0 space-y-3.5 overflow-y-auto p-3.5 sm:p-4 bg-surface-alt/40"
            >
              {mensajes.map((msg) => {
                const esUsuario = msg.emisor === 'usuario'
                const horaLegible = format(msg.fecha, 'p', { locale: es })

                return (
                  <motion.div
                    key={msg.id}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex flex-col ${esUsuario ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[88%]">
                      {!esUsuario && (
                        <div
                          className="mt-0.5 flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20"
                          aria-hidden="true"
                        >
                          <IconoAsistenteBot className="size-3.5" />
                        </div>
                      )}

                      <div className="flex flex-col">
                        <div
                          className={
                            'rounded-2xl px-3.5 py-2.5 text-menuda shadow-xs ' +
                            (esUsuario
                              ? 'rounded-br-xs bg-primary text-white font-medium self-end'
                              : 'rounded-bl-xs border border-border bg-surface text-text font-normal self-start')
                          }
                        >
                          {formatearTexto(msg.texto)}

                          {/* Imagen adjunta en eventos */}
                          {msg.imagen && (
                            <div className="mt-2.5 overflow-hidden rounded-xl border border-border">
                              <img
                                src={msg.imagen}
                                alt="Afiche oficial del evento"
                                className="h-36 w-full object-cover transition-transform hover:scale-105"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>

                        {/* Marca de tiempo accesible */}
                        <span
                          className={`text-[10px] text-text-muted/75 mt-1 px-1 ${
                            esUsuario ? 'text-right' : 'text-left'
                          }`}
                        >
                          {horaLegible}
                        </span>
                      </div>

                      {esUsuario && (
                        <div
                          className="mt-0.5 flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-text-muted"
                          aria-hidden="true"
                        >
                          <IconoUsuarioChat className="size-3.5" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {/* Indicador de Redacción Animado con Motion */}
              {escribiendo && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-label="El asistente está redactando una respuesta"
                  className="flex items-center gap-2"
                >
                  <div
                    className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20"
                    aria-hidden="true"
                  >
                    <IconoAsistenteBot className="size-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-border bg-surface px-4 py-3 shadow-xs">
                    <span className="size-2 rounded-full bg-primary/70 animate-bounce" />
                    <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.2s]" />
                    <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              {/* Banner de Error con Opción de Reintento */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center justify-between gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-menuda text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <div className="flex items-center gap-2">
                    <IconoErrorAlerta className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void reintentar()}
                    aria-label="Reintentar mensaje"
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-micro font-medium text-white transition-colors hover:bg-rose-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <IconoReintentarChat className="size-3" />
                    <span>Reintentar</span>
                  </button>
                </div>
              )}

              <div ref={finalMensajesRef} aria-hidden="true" />
            </div>

            {/* Botón Flotante "Ir al final" cuando se hace scroll hacia arriba */}
            <AnimatePresence>
              {mostrarBotonBajar && (
                <motion.button
                  type="button"
                  onClick={() => desplazarAlFinal(true)}
                  aria-label="Ir al final de la conversación"
                  title="Ir al final de la conversación"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-4 bottom-24 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text shadow-md transition-all hover:bg-surface-alt active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <IconoBajarFinal className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Píldoras de Sugerencias Rápidas */}
            <div
              className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-t border-border/70 bg-surface px-3 py-2 scrollbar-none"
              role="region"
              aria-label="Sugerencias rápidas de consulta"
            >
              {SUGERENCIAS_RAPIDAS.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  disabled={escribiendo}
                  onClick={() => void manejarEnvio(sug.consulta)}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface-alt px-2.5 py-1 text-micro font-medium text-text transition-colors hover:border-primary hover:text-primary active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {renderIconoChip(sug.categoria)}
                  <span>{sug.etiqueta}</span>
                </button>
              ))}
            </div>

            {/* Barra de Entrada de Texto Adaptativa */}
            <form
              onSubmit={manejarSubmitForm}
              className="flex shrink-0 items-end gap-2 border-t border-border bg-surface p-2.5 sm:p-3"
            >
              <div className="relative flex flex-1 items-center">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={textoEntrada}
                  disabled={escribiendo}
                  onChange={(e) => setTextoEntrada(e.target.value)}
                  onKeyDown={manejarKeyDown}
                  placeholder="Escribe tu consulta aquí..."
                  maxLength={300}
                  aria-label="Escribe un mensaje para el asistente"
                  className={
                    'w-full resize-none rounded-2xl border border-border bg-surface-alt py-2 pl-3.5 pr-11 ' +
                    'text-menor text-text placeholder:text-text-muted/70 ' +
                    'focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ' +
                    'disabled:opacity-60 transition-all max-h-24'
                  }
                />
                <button
                  type="submit"
                  disabled={!textoEntrada.trim() || escribiendo}
                  aria-label="Enviar mensaje"
                  title="Enviar consulta (Enter)"
                  className={
                    'absolute right-1.5 bottom-1.5 flex size-8 cursor-pointer items-center justify-center rounded-full ' +
                    'bg-primary text-white shadow-xs transition-all hover:bg-primary-dark ' +
                    'disabled:cursor-not-allowed disabled:opacity-30 active:scale-90 ' +
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  }
                >
                  <IconoEnviar className="size-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
