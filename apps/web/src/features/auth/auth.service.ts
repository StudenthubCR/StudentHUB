/**
 * Reglas del acceso, puras y probables.
 *
 * Todo lo de aquí es para avisar temprano en la interfaz. La validación que
 * manda vive en la base: el padrón decide quién entra, y RLS decide qué ve.
 */
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

/** El código que envía Supabase son 6 dígitos. */
export function soloDigitos(codigo: string): string {
  return codigo.replace(/\D/g, '').slice(0, 6)
}

export function codigoCompleto(codigo: string): boolean {
  return soloDigitos(codigo).length === 6
}
