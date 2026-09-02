/**
 * Configuración de orígenes de datos. Equivale a `js/config.js` de la app
 * actual, con la URL movida a variable de entorno para que el día que la hoja
 * cambie de implementación no haya que tocar código ni publicar la URL en el
 * repositorio (ver Fase 0 del plan, sobre sacar `BASES_DE_DATOS.md` de aquí).
 *
 * El valor por defecto es el mismo que ya usa la app en producción.
 */
const COMEDOR_API_POR_DEFECTO =
  'https://script.google.com/macros/s/AKfycbz7VyJ4OXewe9lH4npvBrvoMRj8N5P583MmMr7jlYoWB0qMJHeqdpOj5Q1LVGdPxyk/exec'

const HORARIOS_API_POR_DEFECTO =
  'https://script.google.com/macros/s/AKfycbxcjXuPs80KsshkCACYPZdOXQmuPY5tg-ThNmcWZ_9_YyOIEkOgb4oMdNlTOYixbfqz/exec'

export const COMEDOR_API_URL: string =
  import.meta.env.VITE_COMEDOR_API_URL || COMEDOR_API_POR_DEFECTO

export const HORARIOS_API_URL: string =
  import.meta.env.VITE_HORARIOS_API_URL || HORARIOS_API_POR_DEFECTO
