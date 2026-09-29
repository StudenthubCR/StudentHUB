/**
 * Configuración de orígenes de datos.
 * Las URLs de los servicios de Google Apps Script se cargan exclusivamente
 * desde variables de entorno para evitar exponer endpoints productivos en el repositorio.
 */
export const COMEDOR_API_URL: string = import.meta.env.VITE_COMEDOR_API_URL || ''

export const HORARIOS_API_URL: string = import.meta.env.VITE_HORARIOS_API_URL || ''

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
