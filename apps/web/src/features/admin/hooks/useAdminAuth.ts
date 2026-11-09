import { useSesion } from '@/features/auth/useSesion'
import { CORREO_ADMIN_UNICO, esUsuarioAdmin } from '@/features/avisos/avisos.service'

export function useAdminAuth() {
  const { sesion, cargando, cerrarSesion } = useSesion()

  const email = (sesion?.user?.email ?? '').trim().toLowerCase()
  const esCorreoMaestro = esUsuarioAdmin(email)

  // Metadatos de rol de Supabase Auth
  const appRole = sesion?.user?.app_metadata?.role
  const userRole = sesion?.user?.user_metadata?.role
  const tieneRolMetadata = appRole === 'admin' || userRole === 'admin'

  // Modo Demo / Prueba interactiva para evaluadores y jurado
  const esDemo =
    typeof window !== 'undefined' &&
    (localStorage.getItem('studenthub_demo_admin') === 'true' ||
      localStorage.getItem('studenthub_demo_sesion') === 'true')

  const esAdmin = esCorreoMaestro || tieneRolMetadata || esDemo

  return {
    esAdmin,
    cargando,
    sesion,
    usuario: sesion?.user ?? null,
    email: email || (esDemo ? CORREO_ADMIN_UNICO : ''),
    cerrarSesion,
  }
}
