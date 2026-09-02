import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CLAVE_PUBLICABLE, SUPABASE_URL } from './config'

/**
 * Cliente de Supabase.
 *
 * Todavía no lo usa ninguna pantalla: la app sigue leyendo de las hojas de
 * cálculo. Existe para que el esquema, las políticas RLS y el login se puedan
 * ir armando contra algo real.
 *
 * `persistSession` y `autoRefreshToken` quedan activos porque la app es una
 * PWA instalable: si la sesión no sobrevive al cierre, el estudiante tendría
 * que pedir un código nuevo cada vez que abre el ícono.
 *
 * `detectSessionInUrl` va apagado a propósito. Sirve para los magic links, y
 * el plan los descarta (§10): el navegador interno de Outlook rompe la sesión
 * de la PWA, por eso la autenticación va a ser por código de 6 dígitos.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICABLE, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
