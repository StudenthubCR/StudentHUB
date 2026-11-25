/**
 * Definiciones de tipos para el Asistente Virtual (Chatbot) de Student HUB.
 */

export type EmisorMensaje = 'usuario' | 'bot'
export type EstadoMensaje = 'enviando' | 'enviado' | 'error'

export interface MensajeChat {
  id: string
  emisor: EmisorMensaje
  texto: string
  imagen?: string
  fecha: Date
  estado?: EstadoMensaje
}

export type Intencion =
  | 'comedor'
  | 'horarios'
  | 'eventos'
  | 'agenda'
  | 'carnet'
  | 'notas'
  | 'asistencias'
  | 'faq_ctp'
  | 'ayuda'
  | 'saludo'
  | 'desconocido'

export interface DiaObjetivo {
  fecha: Date
  etiqueta: string
  nombreDia: string
  esFinDeSemana: boolean
  esExplicito: boolean
}

export interface RespuestaChat {
  texto: string
  imagen?: string
}

export interface SugerenciaRapida {
  id: string
  etiqueta: string
  consulta: string
  categoria:
    | 'comedor'
    | 'horarios'
    | 'eventos'
    | 'agenda'
    | 'carnet'
    | 'notas'
    | 'asistencias'
}
