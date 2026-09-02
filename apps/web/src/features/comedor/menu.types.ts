/**
 * El menú se modela por FECHA REAL, no por "semana N" (plan §4.3). Los campos
 * son los mismos de la tabla `menus` propuesta para Postgres, de modo que el
 * día que el fixture se cambie por una consulta a Supabase, los componentes
 * no tengan que tocarse.
 */
export type MenuDia = {
  /** Fecha en formato ISO local `yyyy-MM-dd`. */
  fecha: string
  plato: string
  acompanamiento: string
  bebida: string
  fruta: string
}

/** Qué mostrar en la tarjeta "Menú de hoy" para una fecha dada. */
export type EstadoDelDia =
  | { tipo: 'cerrado' }
  | { tipo: 'sin-menu' }
  | { tipo: 'servido'; menu: MenuDia }

/**
 * Lo que puede estar pasando en pantalla: el estado del día más los dos
 * estados que sólo existen porque los datos vienen de la red.
 */
export type EstadoVista = EstadoDelDia | { tipo: 'cargando' } | { tipo: 'error'; mensaje: string }

/** Un día de la semana hábil, con su menú si está publicado. */
export type DiaDeLaSemana = {
  fecha: Date
  clave: string
  menu: MenuDia | null
}
