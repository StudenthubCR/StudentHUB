import { useState, useRef, useEffect } from 'react'
import { IconoCerrar, IconoMensaje, IconoEnviar } from '@/components/icons'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { useHorario } from '@/features/horarios/useHorario'
import { useMenuSemanal } from '@/features/comedor/useMenuSemanal'
import { NOTICIAS } from '@/features/dashboard/noticias.fixture'
import { useReloj } from '@/lib/useReloj'
import {
  type MensajeChat,
  detectarIntencion,
  responderEventos,
  responderComedor,
  responderHorarios,
  responderCarnet,
  responderAyuda,
} from './chatbot.service'

export function Chatbot() {
  const [abierto, setAbierto] = useState(false)
  const [textoEntrada, setTextoEntrada] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])

  const { estudiante } = useEstudiante()
  const ahora = useReloj()
  const grupoActivo = estudiante?.grupo ?? '11-1'
  const horario = useHorario(grupoActivo, ahora)
  const comedor = useMenuSemanal(ahora)

  const finalMensajesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (mensajes.length === 0) {
      const nombre = estudiante ? `, ${estudiante.nombre.split(' ')[0]}` : ''
      setMensajes([
        {
          id: 'bienvenida',
          emisor: 'bot',
          texto:
            `👋 ¡Hola${nombre}! Soy el **Asistente Virtual de Student HUB**.\n\n` +
            `Puedo responderte al instante sobre:\n` +
            `• 🍲 Menú del comedor de hoy o de la semana\n` +
            `• ⏰ Horario de lecciones y aulas de tu grupo\n` +
            `• 📰 Eventos oficiales y ferias del colegio\n` +
            `• 🪪 Uso de tu carnet digital offline\n\n` +
            `¿En qué te puedo ayudar hoy?`,
          fecha: new Date(),
        },
      ])
    }
  }, [estudiante, mensajes.length])

  // Desplazamiento automático al último mensaje
  useEffect(() => {
    if (abierto) {
      finalMensajesRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajes, escribiendo, abierto])

  // Foco en el campo de texto al abrir
  useEffect(() => {
    if (abierto) {
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [abierto])

  const manejarEnvio = async (textoPregunta?: string) => {
    const texto = (textoPregunta ?? textoEntrada).trim()
    if (!texto || escribiendo) return

    const mensajeUsuario: MensajeChat = {
      id: `usr_${Date.now()}`,
      emisor: 'usuario',
      texto,
      fecha: new Date(),
    }

    setMensajes((prev) => [...prev, mensajeUsuario])
    setTextoEntrada('')
    setEscribiendo(true)

    // Breve pausa orgánica (350ms) para simular procesamiento natural
    await new Promise((resolve) => setTimeout(resolve, 350))

    const intencion = detectarIntencion(texto)
    let respuesta: { texto: string; imagen?: string }

    switch (intencion) {
      case 'eventos':
        respuesta = responderEventos(texto, NOTICIAS)
        break
      case 'comedor':
        respuesta = responderComedor(texto, comedor.menus, ahora)
        break
      case 'horarios':
        respuesta = responderHorarios(texto, horario.dias, grupoActivo, ahora)
        break
      case 'carnet':
        respuesta = responderCarnet()
        break
      case 'saludo':
      case 'ayuda':
        respuesta = responderAyuda()
        break
      default:
        respuesta = {
          texto:
            `🤔 No estoy seguro de haber entendido tu consulta.\n\n` +
            `Podés probar preguntándome:\n` +
            `• "¿Qué hay de almuerzo hoy?"\n` +
            `• "¿Cuáles son mis clases de hoy?"\n` +
            `• "¿Qué eventos hay en el colegio?"\n` +
            `• "¿Cómo guardo mi carnet offline?"`,
        }
    }

    const mensajeBot: MensajeChat = {
      id: `bot_${Date.now()}`,
      emisor: 'bot',
      texto: respuesta.texto,
      imagen: respuesta.imagen,
      fecha: new Date(),
    }

    setEscribiendo(false)
    setMensajes((prev) => [...prev, mensajeBot])
  }

  // Formateador simple de texto con negritas y saltos de línea
  const formatearTexto = (texto: string) => {
    return texto.split('\n').map((linea, index) => {
      // Reemplazo básico de negritas **texto**
      const partes = linea.split(/(\*\*.*?\*\*)/g)
      return (
        <span key={index} className="block leading-relaxed min-h-[1.2em]">
          {partes.map((parte, pIdx) => {
            if (parte.startsWith('**') && parte.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-text">
                  {parte.slice(2, -2)}
                </strong>
              )
            }
            if (parte.startsWith('*') && parte.endsWith('*')) {
              return <em key={pIdx}>{parte.slice(1, -1)}</em>
            }
            return parte
          })}
        </span>
      )
    })
  }

  return (
    <>
      {/* Botón flotante circular 💬 (se oculta cuando el chat está abierto para no estorbar) */}
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir asistente virtual"
          title="Asistente virtual de Student HUB"
          className={
            'fixed z-[1050] flex size-14 cursor-pointer items-center justify-center rounded-full ' +
            'bg-primary text-white shadow-xl transition-all duration-300 ' +
            'hover:bg-primary-dark hover:scale-105 active:scale-95 ' +
            'right-4 bottom-[calc(86px_+_env(safe-area-inset-bottom))] lg:right-7 lg:bottom-7'
          }
        >
          <div className="relative flex items-center justify-center">
            <IconoMensaje className="size-6.5" />
            <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-surface bg-emerald-500 animate-pulse" />
          </div>
        </button>
      )}

      {/* Ventana de Conversación Flotante */}
      {abierto && (
        <div
          role="dialog"
          aria-label="Chatbot de Student HUB"
          className={
            'fixed z-[1050] flex flex-col overflow-hidden rounded-3xl border border-border ' +
            'bg-surface shadow-2xl transition-all animate-slide-up ' +
            'left-3 right-3 sm:left-auto sm:right-7 w-auto sm:w-[380px] max-w-[400px] ' +
            'h-[min(540px,calc(100dvh-95px))] ' +
            'bottom-[calc(76px_+_env(safe-area-inset-bottom))] sm:bottom-24'
          }
        >
          {/* Cabecera del chat (shrink-0 para que nunca se aplaste) */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-primary px-4 py-2.5 sm:px-4.5 sm:py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-lg shadow-inner">
                🤖
              </div>
              <div>
                <h3 className="text-menor font-bold leading-tight">Asistente Student HUB</h3>
                <div className="flex items-center gap-1.5 text-micro text-white/80">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En línea • 100% Offline</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
            >
              <IconoCerrar className="size-4" />
            </button>
          </div>

          {/* Área de mensajes con scroll (min-h-0 es clave para que flex no empuje el pie fuera de pantalla) */}
          <div className="flex-1 min-h-0 space-y-3.5 overflow-y-auto p-3.5 sm:p-4 bg-surface-alt/40">
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.emisor === 'usuario' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-menuda shadow-xs ' +
                    (msg.emisor === 'usuario'
                      ? 'rounded-br-xs bg-primary text-white font-medium'
                      : 'rounded-bl-xs border border-border bg-surface text-text-muted')
                  }
                >
                  {formatearTexto(msg.texto)}

                  {/* Imagen de evento si está disponible */}
                  {msg.imagen && (
                    <div className="mt-2.5 overflow-hidden rounded-xl border border-border">
                      <img
                        src={msg.imagen}
                        alt="Afiche oficial del evento"
                        className="h-36 w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Indicador de escribiendo */}
            {escribiendo && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-border bg-surface px-4 py-3 shadow-xs w-fit">
                <span className="size-2 rounded-full bg-text-muted/60 animate-bounce" />
                <span className="size-2 rounded-full bg-text-muted/60 animate-bounce [animation-delay:0.2s]" />
                <span className="size-2 rounded-full bg-text-muted/60 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={finalMensajesRef} />
          </div>

          {/* Píldoras de sugerencias rápidas (shrink-0) */}
          <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-t border-border/60 bg-surface px-3 py-1.5 scrollbar-none">
            <button
              type="button"
              onClick={() => void manejarEnvio('¿Qué hay de almuerzo mañana?')}
              className="shrink-0 cursor-pointer rounded-full border border-border bg-surface-alt px-2.5 py-1 text-micro font-medium text-text-muted transition-colors hover:border-primary hover:text-primary active:scale-95"
            >
              🍲 Almuerzo mañana
            </button>
            <button
              type="button"
              onClick={() => void manejarEnvio('¿Qué clases tengo mañana?')}
              className="shrink-0 cursor-pointer rounded-full border border-border bg-surface-alt px-2.5 py-1 text-micro font-medium text-text-muted transition-colors hover:border-primary hover:text-primary active:scale-95"
            >
              ⏰ Clases mañana
            </button>
            <button
              type="button"
              onClick={() => void manejarEnvio('¿Qué eventos hay en el colegio?')}
              className="shrink-0 cursor-pointer rounded-full border border-border bg-surface-alt px-2.5 py-1 text-micro font-medium text-text-muted transition-colors hover:border-primary hover:text-primary active:scale-95"
            >
              📰 Eventos
            </button>
          </div>

          {/* Barra de entrada de texto: botón de enviar incrustado dentro de la cápsula */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void manejarEnvio()
            }}
            className="flex shrink-0 items-center border-t border-border bg-surface p-2.5 sm:p-3"
          >
            <div className="relative flex flex-1 items-center">
              <input
                ref={inputRef}
                type="text"
                value={textoEntrada}
                onChange={(e) => setTextoEntrada(e.target.value)}
                placeholder="Escribe tu duda..."
                maxLength={250}
                className="w-full rounded-full border border-border bg-surface-alt py-2 pl-3.5 pr-11 text-menor text-text placeholder:text-text-muted/70 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!textoEntrada.trim() || escribiendo}
                aria-label="Enviar mensaje"
                className="absolute right-1 flex size-7.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-xs transition-all hover:bg-primary-dark disabled:opacity-30 active:scale-90"
              >
                <IconoEnviar className="size-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}


    </>
  )
}
