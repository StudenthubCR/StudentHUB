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

/* -------------------------------------------------------------------------
   Supabase
   -------------------------------------------------------------------------
   La clave publicable es pública por diseño: viaja en el paquete JavaScript
   que descarga cualquiera que abra la app, así que esconderla no es una
   medida de seguridad. Lo que protege los datos es Row Level Security, no
   esta clave.

   De ahí se sigue la regla que el plan repite (§4.2, §10): ninguna tabla
   entra al esquema `public` sin sus políticas RLS. Sin ellas, esta clave le
   permite a cualquiera en internet leer esa tabla entera.

   La clave `service_role` es lo contrario: se salta RLS por completo y NUNCA
   va en el frontend ni en este repositorio.
   ------------------------------------------------------------------------- */
const SUPABASE_URL_POR_DEFECTO = 'https://mylwsypihenkxwigftbo.supabase.co'
const SUPABASE_CLAVE_POR_DEFECTO = 'sb_publishable_dpcltvhAvCwVdlPPGPS42g_XsD6dPVN'

export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL_POR_DEFECTO

export const SUPABASE_CLAVE_PUBLICABLE: string =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_CLAVE_POR_DEFECTO
