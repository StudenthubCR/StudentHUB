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

  // Modo Demo / Prueba interactiva (restringido estrictamente al entorno de desarrollo local)
  const esDev = import.meta.env.DEV
  const esDemo = esDev && typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_sesion') === 'true'
  const esAdminDemo = esDemo && (typeof window !== 'undefined' && localStorage.getItem('studenthub_demo_admin') === 'true' || email === CORREO_ADMIN_UNICO)

  const esAdmin = esCorreoMaestro || tieneRolMetadata || esAdminDemo

  return {
    esAdmin,
    cargando,
    sesion,
    usuario: sesion?.user ?? null,
    email: email || (esAdminDemo ? CORREO_ADMIN_UNICO : ''),
    cerrarSesion,
  }
}
