/** Una fila tal como la devuelve `apps-script/horarios.gs`. */
export type FilaHorario = {
  grupo: string
  dia: string
  hora: string
  materia: string
  docente?: string
}

/** Una lección ya interpretada. */
export type Clase = {
  /** El nombre del día como lo escribe la hoja. */
  dia: string
  /** El rango completo, '5:50pm-6:35pm'. */
  hora: string
  inicio: string
  fin: string
  materia: string
  docente?: string
  /** Cena, receso, almuerzo: se pinta distinto porque no es lección. */
  esReceso: boolean
}

/**
 * Lecciones seguidas de la misma materia, unidas en un solo bloque.
 * La hoja trae "Diseño software" tres veces seguidas; leerlo como
 * "5:50pm–8:25pm · 3 lecciones" es una tarjeta en vez de tres.
 */
export type Bloque = {
  materia: string
  inicio: string
  fin: string
  /** Cuántas lecciones de la hoja se unieron aquí. */
  lecciones: number
  esReceso: boolean
  docente?: string
}

export type DiaDeClases = {
  dia: string
  /** 'Mié' — para las pestañas. */
  abreviatura: string
  esHoy: boolean
  clases: Clase[]
  bloques: Bloque[]
}

/** Dónde va el día respecto a la hora actual. */
export type ProgresoDelDia = {
  /** Índice del bloque en curso, o null. */
  actual: number | null
  /** Índice del próximo bloque, o null si ya terminó todo. */
  siguiente: number | null
}
