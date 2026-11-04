import { useState, useRef, useEffect, useCallback } from 'react'
import type { MensajeChat, RespuestaChat } from './chatbot.types'
import {
  detectarIntencion,
  responderEventos,
  responderComedor,
  responderHorarios,
  responderCarnet,
  responderAyuda,
  responderDesconocido,
  generarMensajeBienvenida,
} from './chatbot.service'
import { NOTICIAS } from '@/features/dashboard/noticias.fixture'
import type { MenuDia } from '@/features/comedor/menu.types'
import type { DiaDeClases } from '@/features/horarios/horario.types'

interface UseChatbotProps {
  primerNombre?: string
  grupoActivo: string
  horariosDias: DiaDeClases[]
  menusComedor: MenuDia[]
  ahora: Date
}

export function useChatbot({
  primerNombre,
  grupoActivo,
  horariosDias,
  menusComedor,
  ahora,
}: UseChatbotProps) {
  const mensajeInicial: MensajeChat = {
    id: 'bienvenida',
    emisor: 'bot',
    texto: generarMensajeBienvenida(primerNombre),
    fecha: new Date(),
    estado: 'enviado',
  }

  // Ref de persistencia sincrónica para compatibilidad total con SSR/Node y tests sin DOM
  const mensajesRef = useRef<MensajeChat[]>([mensajeInicial])
  const [, setMensajes] = useState<MensajeChat[]>([mensajeInicial])

  const escribiendoRef = useRef<boolean>(false)
  const [, setEscribiendo] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const ultimoTextoEnviadoRef = useRef<string | null>(null)
  const [mostrarBotonBajar, setMostrarBotonBajar] = useState<boolean>(false)

  // Semáforo de concurrencia y control de cancelación
  const enviandoRef = useRef<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const timerRespuestaRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const finalMensajesRef = useRef<HTMLDivElement>(null)

  // Cancela operaciones en vuelo, limpia temporizadores y restablece el semáforo de concurrencia
  const cerrarChat = useCallback(() => {
    if (timerRespuestaRef.current) {
      clearTimeout(timerRespuestaRef.current)
      timerRespuestaRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    enviandoRef.current = false
    escribiendoRef.current = false
    setEscribiendo(false)
  }, [])

  // Si el nombre del estudiante se carga de forma asíncrona y la conversación sigue intacta, actualizar saludo
  useEffect(() => {
    if (!primerNombre) return
    if (mensajesRef.current.length === 1 && mensajesRef.current[0].id === 'bienvenida') {
      const actualizado: MensajeChat[] = [
        {
          ...mensajesRef.current[0],
          texto: generarMensajeBienvenida(primerNombre),
        },
      ]
      mensajesRef.current = actualizado
      setMensajes(actualizado)
    }
  }, [primerNombre])

  // Cancelar peticiones en vuelo y temporizadores al desmontar el componente
  useEffect(() => {
    return () => {
      if (timerRespuestaRef.current) {
        clearTimeout(timerRespuestaRef.current)
        timerRespuestaRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      enviandoRef.current = false
    }
  }, [])

  /**
   * Desplaza la vista al mensaje más reciente
   */
  const desplazarAlFinal = useCallback((suave: boolean = true) => {
    if (finalMensajesRef.current) {
      finalMensajesRef.current.scrollIntoView({
        behavior: suave ? 'smooth' : 'auto',
        block: 'end',
      })
    }
  }, [])

  /**
   * Monitorea la posición del scroll para mostrar u ocultar el botón flotante "Ir al final"
   */
  const manejarScroll = useCallback(() => {
    const el = contenedorRef.current
    if (!el) return
    const distanciaAlFondo = el.scrollHeight - el.scrollTop - el.clientHeight
    setMostrarBotonBajar(distanciaAlFondo > 70)
  }, [])

  /**
   * Envía un mensaje y coordina la respuesta del bot con bloqueo de concurrencia
   */
  const enviarMensaje = useCallback(
    async (textoPregunta: string): Promise<boolean> => {
      const textoLimpio = textoPregunta.trim()
      if (!textoLimpio) return false

      // Bloqueo estricto de concurrencia (evita envíos duplicados por doble clic o Enter rápido)
      if (enviandoRef.current) {
        return false
      }
      enviandoRef.current = true

      // Abortar cualquier operación previa
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      const controller = new AbortController()
      abortControllerRef.current = controller

      setError(null)
      ultimoTextoEnviadoRef.current = textoLimpio

      // Identificador único con timestamp y fragmento aleatorio
      const mensajeUsuarioId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const mensajeUsuario: MensajeChat = {
        id: mensajeUsuarioId,
        emisor: 'usuario',
        texto: textoLimpio,
        fecha: new Date(),
        estado: 'enviado',
      }

      const listaConUsuario = [...mensajesRef.current, mensajeUsuario]
      mensajesRef.current = listaConUsuario
      setMensajes(listaConUsuario)
      escribiendoRef.current = true
      setEscribiendo(true)

      // Auto-desplazamiento suave tras enviar
      setTimeout(() => desplazarAlFinal(true), 50)

      try {
        // Pausa simulada orgánica de 350ms con soporte de cancelación por AbortSignal
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => {
            timerRespuestaRef.current = null
            resolve()
          }, 350)
          timerRespuestaRef.current = timer

          controller.signal.addEventListener('abort', () => {
            if (timerRespuestaRef.current) {
              clearTimeout(timerRespuestaRef.current)
              timerRespuestaRef.current = null
            }
            reject(new DOMException('Petición abortada', 'AbortError'))
          })
        })

        if (controller.signal.aborted) {
          return false
        }

        const intencion = detectarIntencion(textoLimpio)
        let respuesta: RespuestaChat

        switch (intencion) {
          case 'eventos':
            respuesta = responderEventos(textoLimpio, NOTICIAS)
            break
          case 'comedor':
            respuesta = responderComedor(textoLimpio, menusComedor, ahora)
            break
          case 'horarios':
            respuesta = responderHorarios(textoLimpio, horariosDias, grupoActivo, ahora)
            break
          case 'carnet':
            respuesta = responderCarnet()
            break
          case 'saludo':
          case 'ayuda':
            respuesta = responderAyuda()
            break
          default:
            respuesta = responderDesconocido()
            break
        }

        if (controller.signal.aborted) {
          return false
        }

        const mensajeBotId = `bot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const mensajeBot: MensajeChat = {
          id: mensajeBotId,
          emisor: 'bot',
          texto: respuesta.texto,
          imagen: respuesta.imagen,
          fecha: new Date(),
          estado: 'enviado',
        }

        const listaConBot = [...mensajesRef.current, mensajeBot]
        mensajesRef.current = listaConBot
        setMensajes(listaConBot)
        setError(null)
        setTimeout(() => desplazarAlFinal(true), 50)
        return true
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return false
        }
        setError('No pudimos procesar tu mensaje. Puedes intentar enviarlo nuevamente.')
        return false
      } finally {
        escribiendoRef.current = false
        setEscribiendo(false)
        enviandoRef.current = false
      }
    },
    [ahora, desplazarAlFinal, grupoActivo, horariosDias, menusComedor],
  )

  /**
   * Reintenta el último mensaje enviado en caso de fallo
   */
  const reintentar = useCallback(async (): Promise<boolean> => {
    const texto = ultimoTextoEnviadoRef.current
    if (!texto) return false
    return await enviarMensaje(texto)
  }, [enviarMensaje])

  /**
   * Restablece la conversación al estado de bienvenida
   */
  const limpiarConversacion = useCallback(() => {
    if (timerRespuestaRef.current) {
      clearTimeout(timerRespuestaRef.current)
      timerRespuestaRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    enviandoRef.current = false
    escribiendoRef.current = false
    setEscribiendo(false)
    setError(null)
    ultimoTextoEnviadoRef.current = null

    const reinicio: MensajeChat[] = [
      {
        id: `bienvenida_${Date.now()}`,
        emisor: 'bot',
        texto: generarMensajeBienvenida(primerNombre),
        fecha: new Date(),
        estado: 'enviado',
      },
    ]
    mensajesRef.current = reinicio
    setMensajes(reinicio)
  }, [primerNombre])

  return {
    get mensajes() {
      return mensajesRef.current
    },
    get escribiendo() {
      return escribiendoRef.current
    },
    error,
    mostrarBotonBajar,
    contenedorRef,
    finalMensajesRef,
    enviarMensaje,
    reintentar,
    limpiarConversacion,
    cerrarChat,
    desplazarAlFinal,
    manejarScroll,
  }
}
