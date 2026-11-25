/**
 * Reglas del acceso, puras y probables.
 *
 * Todo lo de aquí es para avisar temprano en la interfaz. La validación que
 * manda vive en la base: el padrón decide quién entra, y RLS decide qué ve.
 */

export type RolAcceso = 'estudiante' | 'encargado' | 'docente'
export type RolSistema = 'estudiante' | 'docente'

export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase()
}

export function dominioDe(correo: string): string {
  return normalizarCorreo(correo).split('@')[1] ?? ''
}

export function correoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizarCorreo(correo))
}

/**
 * El dominio permitido sale de la tabla `instituciones`, no de una constante:
 * el día que entre un segundo colegio es una fila nueva, no un despliegue.
 * Si todavía no se conoce el dominio, no se bloquea a nadie desde aquí.
 */
export function dominioPermitido(correo: string, dominio: string | null): boolean {
  if (!dominio) return true
  return dominioDe(correo) === dominio.trim().toLowerCase()
}

/**
 * Texto de sugerencia (placeholder) según el rol seleccionado.
 */
export function placeholderCorreoPorRol(rol: RolAcceso): string {
  if (rol === 'docente') return 'docente@mep.go.cr'
  return rol === 'estudiante' ? 'estudiante@mep.go.cr' : 'encargado@ejemplo.com'
}

/**
 * Mensaje de orientación según el rol seleccionado.
 */
export function ayudaCorreoPorRol(rol: RolAcceso): string {
  if (rol === 'docente') {
    return 'Ingresá tu correo institucional docente del MEP autorizado en el sistema para acceder a tu especialidad.'
  }
  return rol === 'estudiante'
    ? 'Ingresá tu correo estudiantil oficial del MEP para recibir tu código de acceso temporal.'
    : 'Ingresá el correo electrónico personal registrado en la institución como encargado legal o tutor.'
}

/**
 * Valida el formato del correo según el rol seleccionado antes del envío del OTP.
 */
export function validarCorreoParaRol(
  correo: string,
  _rol: RolAcceso,
): { valido: boolean; error?: string } {
  const limpio = normalizarCorreo(correo)
  if (!limpio) {
    return { valido: false, error: 'Por favor, ingresá tu correo electrónico.' }
  }
  if (!correoValido(limpio)) {
    return { valido: false, error: 'Por favor, ingresá un correo electrónico con formato válido.' }
  }
  return { valido: true }
}

/**
 * Largo del código de verificación OTP.
 *
 * El proyecto de Supabase está configurado para emitir tokens de 8 dígitos.
 * Permitimos validar códigos de 6 a 8 dígitos por si cambia la configuración
 * del servidor, pero la longitud por defecto esperada en la interfaz es 8.
 */
export const LARGO_CODIGO = 8
const LARGO_MINIMO = 6
const LARGO_MAXIMO = 8

export function soloDigitos(codigo: string): string {
  return codigo.replace(/\D/g, '').slice(0, LARGO_MAXIMO)
}

export function codigoCompleto(codigo: string): boolean {
  const largo = soloDigitos(codigo).length
  return largo >= LARGO_MINIMO && largo <= LARGO_MAXIMO
}

/**
 * Traduce errores comunes del servicio de autenticación de Supabase a español claro.
 */
export function traducirErrorAuth(mensaje: string): string {
  const m = mensaje.toLowerCase()
  if (m.includes('rate limit') || m.includes('rate_limit') || m.includes('over_email_send_rate_limit')) {
    return 'Se ha alcanzado el límite temporal de envío de correos de Supabase. Por favor, esperá unos minutos antes de solicitar un nuevo código (o revisá tu carpeta de Spam si ya habías pedido uno).'
  }
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Credenciales inválidas. Si estás accediendo como Administrador, verificá tu contraseña o asegurate de haber ejecutado el script SQL de aprovisionamiento en Supabase.'
  }
  if (m.includes('invalid') || m.includes('expired') || m.includes('token') || m.includes('otp')) {
    return 'El código ingresado no es correcto o ya venció. Por favor, solicitá uno nuevo.'
  }
  if (m.includes('signups not allowed')) {
    return 'El registro de nuevos usuarios no está habilitado en el proyecto.'
  }
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch')) {
    return 'Problema de conexión con el servidor. Revisá tu internet e intentá de nuevo.'
  }
  return mensaje
}
